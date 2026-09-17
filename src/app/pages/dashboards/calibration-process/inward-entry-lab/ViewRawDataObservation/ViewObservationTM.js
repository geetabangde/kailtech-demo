import { safeGetArray, safeGetValue } from './viewRawDataUtils';
export { TMTable } from './TMTable';

export const tmTableConfig = {
  id: 'observationtm',
  name: 'Observation TM',
  category: 'Temperature Mapping',
  structure: {
    singleHeaders: ['Sr. No.', 'Parameter', 'Nominal/ Set Value', 'Range', 'Value Shown on'],
    subHeaders: {
      'Observation (1&6)': [],
      'Observation (2&7)': [],
      'Observation (3&8)': [],
      'Observation (4&9)': [],
      'Observation (5&10)': [],
    },
    remainingHeaders: ['Average', 'Error'],
  },
};

export const createTMRows = (dataArray) => {
  const rows = [];
  dataArray.forEach((point) => {
    if (!point) return;

    const srNo = point.sr_no?.toString() || '';
    const nominalVal = safeGetValue(point.point || point.nominal_value || point.nominal_set_value || point.nominal_val);
    const rangeVal = safeGetValue(point.range);

    const uucReadings = safeGetArray(point.uuc_values || point.observations || point.uuc_observations, 10);
    const masterReadings = safeGetArray(point.master_values || point.master_observations, 10);

    const row = [
      srNo,
      safeGetValue(point.parameter || point.unittype || 'Temperature'),
      nominalVal,
      rangeVal,
      ...uucReadings.slice(0, 10).map((val) => safeGetValue(val)),
      ...masterReadings.slice(0, 10).map((val) => safeGetValue(val)),
      safeGetValue(point.average_uuc),
      safeGetValue(point.error),
      safeGetValue(point.average_master),
    ];
    rows.push(row);
  });
  return rows;
};

export const parseTMDynamicData = (observationData) => {
  if (Array.isArray(observationData)) {
    return observationData;
  } else if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
    return observationData.calibration_points;
  } else if (observationData.data && Array.isArray(observationData.data)) {
    return observationData.data;
  }
  return [];
};
