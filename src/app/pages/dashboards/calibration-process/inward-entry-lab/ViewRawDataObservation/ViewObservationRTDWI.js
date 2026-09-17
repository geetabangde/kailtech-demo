import { safeGetArray, safeGetValue } from './viewRawDataUtils';

export const rtdwiTableConfig = {
  id: 'observationrtdwi',
  name: 'Observation RTD WI',
  category: 'RTD',
  structure: {
    singleHeaders: ['Sr. No.', 'Set Point (°C)', 'Value Of', 'Unit', 'Sensitivity Coefficient'],
    subHeaders: {
      'Observation': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5'],
    },
    remainingHeaders: ['Average', 'mV generated On ambient', 'Average with corrected mv', 'Average (°C)', 'Deviation (°C)'],
  },
};

export const createRTDWIRows = (dataArray) => {
  const rows = [];
  dataArray.forEach((point) => {
    if (!point) return;

    const srNo = point.sr_no?.toString() || '';
    const setPoint = safeGetValue(point.set_point);

    // UUC Row
    const uucReadings = safeGetArray(point.uuc_values, 5);
    const uucRow = [
      srNo,
      setPoint,
      'UUC',
      safeGetValue(point.unit),
      '-',
      ...uucReadings.slice(0, 5).map((val) => safeGetValue(val)),
      '-',
      '-',
      '-',
      safeGetValue(point.average_uuc),
      safeGetValue(point.error),
    ];
    rows.push(uucRow);

    // Master Row
    const masterReadings = safeGetArray(point.master_values, 5);
    const masterRow = [
      '-',
      '-',
      'Master',
      safeGetValue(point.master_unit || point.master_unit_id || 'UNIT_SELECT'),
      safeGetValue(point.sensitivity_coefficient),
      ...masterReadings.slice(0, 5).map((val) => safeGetValue(val)),
      safeGetValue(point.average_master),
      safeGetValue(point.ambient_master),
      safeGetValue(point.s_average_master),
      safeGetValue(point.c_average_master),
      '-',
    ];
    rows.push(masterRow);
  });
  return rows;
};

export const parseRTDWIDynamicData = (observationData) => {
  if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
    return observationData.calibration_points;
  }
  return [];
};
