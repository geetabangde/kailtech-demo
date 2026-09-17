import { safeGetValue, safeGetArray } from './observationUtils';

/**
 * Calculation logic for Torque Meter / Torque Wrench (TM) Observation
 */
export const calculateTMValues = (rowData) => {
  const result = {};
  if (!rowData || !Array.isArray(rowData)) return result;

  const parsedValues = rowData.map((val) => (val === '' || val === null || val === undefined ? 0 : parseFloat(val) || 0));
  const uucObservations = parsedValues.slice(4, 14).filter(val => val !== 0);
  const masterObservations = parsedValues.slice(14, 24).filter(val => val !== 0);

  result.averageUUC = uucObservations.length
    ? (uucObservations.reduce((sum, val) => sum + val, 0) / uucObservations.length).toFixed(4)
    : '';

  result.averageMaster = masterObservations.length
    ? (masterObservations.reduce((sum, val) => sum + val, 0) / masterObservations.length).toFixed(4)
    : '';

  const uucAvgNum = parseFloat(result.averageUUC);
  const masterAvgNum = parseFloat(result.averageMaster);

  result.error = (!isNaN(uucAvgNum) && !isNaN(masterAvgNum))
    ? (uucAvgNum - masterAvgNum).toFixed(4)
    : '';

  return result;
};

/**
 * Row generator for TM Observation
 */
export const createTMRows = (dataArray) => {
  const rows = [];
  const calibrationPoints = [];
  const types = [];
  const repeatables = [];
  const values = [];

  (dataArray || []).forEach((point) => {
    if (!point) return;

    const srNo = point.sr_no?.toString() || '';
    const parameter = safeGetValue(point.parameter || point.unittype);
    const setPoint = safeGetValue(point.point || point.nominal_value || point.nominal_set_value);
    const range = safeGetValue(point.range);

    const uucReadings = safeGetArray(point.uuc_values || point.observations || point.uuc_observations, 10);
    const masterReadings = safeGetArray(point.master_values || point.master_observations, 10);

    const row = [
      srNo,                                            // 0: Sr. No.
      parameter,                                       // 1: Parameter
      setPoint,                                        // 2: Set Point
      range,                                           // 3: Range
      ...uucReadings.slice(0, 10).map(val => safeGetValue(val)),     // 4-13: UUC Observations 1-10
      ...masterReadings.slice(0, 10).map(val => safeGetValue(val)),  // 14-23: Master Observations 1-10
      safeGetValue(point.average_uuc),                 // 24: Average UUC
      safeGetValue(point.error_uuc || point.error),    // 25: Error
      safeGetValue(point.average_master)               // 26: Average Master
    ];
    rows.push(row);
    calibrationPoints.push(
      point.calibration_point_id?.toString() ||
      point.point_id?.toString() ||
      point.id?.toString() ||
      "1"
    );
    types.push('uuc');
    repeatables.push('0');
    values.push(range || "0");
  });

  return { rows, hiddenInputs: { calibrationPoints, types, repeatables, values } };
};

/**
 * Table config for TM Observation
 */
export const getTMTableConfig = (observations) => {
  const { rows, hiddenInputs } = createTMRows(observations);
  return {
    id: 'observationtm',
    name: 'Observation TM',
    category: 'Temperature',
    structure: {
      singleHeaders: ['Sr. No.', 'Parameter', 'Nominal/ Set Value', 'Range', 'Value Shown on'],
      subHeaders: {
        'Observation': ['1&6', '2&7', '3&8', '4&9', '5&10']
      },
      remainingHeaders: ['Average', 'Error']
    },
    staticRows: rows,
    hiddenInputs: hiddenInputs
  };
};

const ObservationTM = () => null;
export default ObservationTM;
