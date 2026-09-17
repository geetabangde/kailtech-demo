import { safeGetValue, safeGetArray } from './observationUtils';

/**
 * Calculation logic for RTD with Indicator (RTDWI) Observation
 */
export const calculateRTDWIValues = (rowData) => {
  const result = {};
  if (!rowData || !Array.isArray(rowData)) return result;

  const parsedValues = rowData.map((val) => (val === '' || val === null || val === undefined ? 0 : parseFloat(val) || 0));
  const rowType = rowData[2]; // 'UUC' or 'Master'

  if (rowType === 'UUC') {
    const observations = parsedValues.slice(5, 10).filter((val) => val !== 0);
    result.average = observations.length
      ? (observations.reduce((sum, val) => sum + val, 0) / observations.length).toFixed(3)
      : '';
    result.error = '';
  } else if (rowType === 'Master') {
    const observations = parsedValues.slice(5, 10).filter((val) => val !== 0);
    const ambient = parsedValues[11] ? parseFloat(parsedValues[11]) : 0;

    result.average = observations.length
      ? (observations.reduce((sum, val) => sum + val, 0) / observations.length).toFixed(3)
      : '';

    if (result.average) {
      result.correctedAverage = (parseFloat(result.average) + ambient).toFixed(3);
    } else {
      result.correctedAverage = '';
    }
  }

  return result;
};

/**
 * Row generator for RTDWI Observation
 */
export const createRTDWIRows = (dataArray, observationData) => {
  const rows = [];
  const calibrationPoints = [];
  const types = [];
  const repeatables = [];
  const values = [];

  let pointsToProcess = [];
  if (observationData && observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
    pointsToProcess = observationData.calibration_points;
  } else if (dataArray && dataArray.length > 0) {
    pointsToProcess = dataArray;
  }

  pointsToProcess.forEach((point) => {
    if (!point) return;

    const srNo = point.sr_no?.toString() || '';
    const setPoint = safeGetValue(point.set_point);

    // UUC Row
    const uucReadings = safeGetArray(point.uuc_values, 5);
    const uucRow = [
      srNo,                                           // 0: Sr. No.
      setPoint,                                       // 1: Set Point
      'UUC',                                         // 2: Value Of
      safeGetValue(point.unit),                      // 3: Unit
      '-',                                           // 4: Sensitivity Coefficient
      ...uucReadings.slice(0, 5).map(val => safeGetValue(val)), // 5-9: Observations 1-5
      '-',                                            // 10: Average (dash for UUC)
      '-',                                            // 11: mV generated On ambient (dash for UUC)
      '-',                                            // 12: Average with corrected mv (dash for UUC)
      safeGetValue(point.average_uuc),               // 13: Average (°C) - CALCULATED
      safeGetValue(point.error),                     // 14: Deviation (°C) - EDITABLE
    ];
    rows.push(uucRow);
    calibrationPoints.push(point.point_id?.toString() || "1");
    types.push('uuc');
    repeatables.push('1');
    values.push(setPoint || "0");

    // Master Row
    const masterReadings = safeGetArray(point.master_values, 5);
    const masterRow = [
      '-',                                           // 0: Sr. No.
      '-',                                           // 1: Set Point
      'Master',                                      // 2: Value Of
      'UNIT_SELECT',                                 // 3: Unit (ReactSelect marker)
      safeGetValue(point.sensitivity_coefficient),   // 4: Sensitivity Coefficient
      ...masterReadings.slice(0, 5).map(val => safeGetValue(val)), // 5-9: Observations 1-5
      safeGetValue(point.average_master),            // 10: Average (mV) - EDITABLE
      safeGetValue(point.ambient_master),            // 11: mV generated On ambient (EDITABLE)
      safeGetValue(point.s_average_master),          // 12: Average with corrected mv (CALCULATED)
      safeGetValue(point.c_average_master),          // 13: Average (°C) - MOVED HERE
      '-',                                           // 14: Deviation (°C) (dash for Master)
    ];
    rows.push(masterRow);
    calibrationPoints.push(point.point_id?.toString() || "1");
    types.push('master');
    repeatables.push('1');
    values.push(setPoint || "0");
  });

  return { rows, hiddenInputs: { calibrationPoints, types, repeatables, values } };
};

/**
 * Table config for RTDWI Observation
 */
export const getRTDWITableConfig = (observations) => {
  const { rows, hiddenInputs } = createRTDWIRows(observations, observations);
  return {
    id: 'observationrtdwi',
    name: 'Observation RTD WI',
    category: 'RTD',
    structure: {
      singleHeaders: ['Sr. No.', 'Set Point (°C)', 'Value Of', 'Unit', 'Sensitivity Coefficient'],
      subHeaders: {
        'Observation': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5']
      },
      remainingHeaders: ['Average', 'mV generated On ambient', 'Average with corrected mv', 'Average (°C)', 'Deviation (°C)']
    },
    staticRows: rows,
    hiddenInputs: hiddenInputs
  };
};

const ObservationRTDWI = () => null;
export default ObservationRTDWI;
