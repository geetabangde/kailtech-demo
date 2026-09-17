import { safeGetArray, safeGetValue, formatValueByLc } from './viewRawDataUtils';
export { WeighingBalanceTable } from './WeighingBalanceTable';

export const wbTableConfig = {
  id: 'observationwb',
  name: 'Observation WB',
  category: 'Weighing Balance',
  structure: {
    singleHeaders: ['Sr. No.', 'Nominal Value'],
    subHeaders: {
      'Weighing Process': ['W1', 'W2', 'W3', 'W-Avg', 'Error'],
      'Repeatability': ['R1', 'R2', 'R3', 'R4', 'R5', 'R-Avg'],
      'Eccentricity CW': ['CW1', 'CW2', 'CW3', 'CW4', 'CW5'],
      'Eccentricity ACW': ['ACW1', 'ACW2', 'ACW3', 'ACW4', 'ACW5'],
    },
    remainingHeaders: ['Ecc D'],
  },
};

export const wbnTableConfig = {
  id: 'observationwbn',
  name: 'Observation WBN (Weighing, Rep, Ecc)',
  category: 'Weighing Balance',
  structure: wbTableConfig.structure,
};

export const createWBRows = (dataArray) => {
  const rows = [];
  const payload = dataArray[0] || {};
  const wRows = payload.weighing_process?.calibration_points || payload.weighing_process?.rows || [];
  const rRows = payload.repeatability?.calibration_points || payload.repeatability?.rows || [];
  const eRows = payload.eccentricity?.calibration_points || payload.eccentricity?.rows || [];

  // 1. Weighing Process
  wRows.forEach((point, index) => {
    const uucReadings = safeGetArray(point.uuc_observations, 3);
    const lc = point.least_count_uuc || '0.01';
    const row = [
      point.sr_no?.toString() || (index + 1).toString(),
      safeGetValue(point.nominal_value),
      formatValueByLc(uucReadings[0]?.value, null, lc),
      formatValueByLc(uucReadings[1]?.value, null, lc),
      formatValueByLc(uucReadings[2]?.value, null, lc),
      formatValueByLc(point.average_uuc, null, lc),
      formatValueByLc(point.error, null, lc),
    ];
    rows.push(row);
  });

  // 2. Repeatability
  rRows.forEach((point) => {
    const uucrReadings = safeGetArray(point.uucr_observations, 10);
    const lc = point.least_count_uuc || '0.01';
    const row = [
      safeGetValue(point.nominal_value),
      ...Array(10).fill('').map((_, i) => formatValueByLc(uucrReadings[i]?.value, null, lc)),
      formatValueByLc(point.average_uucr, null, lc),
    ];
    rows.push(row);
  });

  // 3. Eccentricity
  eRows.forEach((point) => {
    const cwReadings = safeGetArray(point.clockwise_observations, 5);
    const acwReadings = safeGetArray(point.anticlockwise_observations, 5);
    const lc = point.least_count_uuc || '0.01';
    const row = [
      safeGetValue(point.nominal_value),
      ...Array(5).fill('').map((_, i) => formatValueByLc(cwReadings[i]?.value, null, lc)),
      ...Array(5).fill('').map((_, i) => formatValueByLc(acwReadings[i]?.value, null, lc)),
      formatValueByLc(point.eccentricity_d_value, null, lc),
    ];
    rows.push(row);
  });

  return {
    rows,
    weighingCount: wRows.length,
    repeatabilityCount: rRows.length,
    eccentricityCount: eRows.length,
  };
};

export const parseWBDynamicData = (observationData) => {
  if (observationData.weighing_process || observationData.repeatability || observationData.eccentricity) {
    return [observationData];
  } else if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
    return observationData.calibration_points;
  } else if (observationData.data && Array.isArray(observationData.data)) {
    return observationData.data;
  } else if (Array.isArray(observationData)) {
    return observationData;
  }
  return [observationData];
};
