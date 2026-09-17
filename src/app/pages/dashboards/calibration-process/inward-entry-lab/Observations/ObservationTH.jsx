import { safeGetValue, safeGetArray } from './observationUtils';

/**
 * Calculation logic for Thermo-Hygrometer (TH) Observation
 */
export const calculateTHValues = (rowData, calibPointId, leastCountData) => {
  const result = {};
  if (!rowData || !Array.isArray(rowData)) return result;

  const parsedValues = rowData.map((val) => (val === '' || val === null || val === undefined ? NaN : parseFloat(val)));
  const obsValues = parsedValues.slice(5, 10).filter((val, idx) => {
    return rowData[idx + 5] !== '' && !isNaN(val);
  });

  const lcs = leastCountData?.[calibPointId];
  const rowType = rowData[1];
  let lc = 0.001;
  if (rowType === 'UUC') {
    lc = lcs?.uuc ?? 0.001;
  } else if (rowType === 'Master') {
    lc = lcs?.master ?? 0.001;
  }

  const getDecimals = (val) => {
    if (!val || val === 'NA') return 3;
    const str = String(val).trim();
    if (str.includes('.')) return str.split('.')[1].length;
    return 0;
  };

  const decPlaces = getDecimals(lc);
  result.average = obsValues.length
    ? (obsValues.reduce((sum, val) => sum + val, 0) / obsValues.length).toFixed(decPlaces)
    : '';

  return result;
};

/**
 * Row generator for TH Observation
 */
export const createTHRows = (dataArray) => {
  const rows = [];
  const calibrationPoints = [];
  const types = [];
  const repeatables = [];
  const values = [];

  (dataArray || []).forEach((point) => {
    if (!point) return;

    const srNo = point.sr_no?.toString() || '';
    const calibPointId = point.calibration_point_id?.toString() || point.point_id?.toString() || "1";
    const range = safeGetValue(point.value_shown_on?.uuc?.range || point.uucrange || point.range);
    const setPoint = safeGetValue(point.value_shown_on?.uuc?.nominal_value || point.set_point || point.nominal_value || point.point);
    const uucUnit = safeGetValue(point.value_shown_on?.uuc?.unit || point.unit);
    const masterUnit = safeGetValue(point.value_shown_on?.master?.unit || point.unit);

    // UUC Row
    const uucReadings = safeGetArray(point.value_shown_on?.uuc?.observations || point.uuc_values || point.observations || point.uuc_observations, 5);
    const uucRow = [
      srNo,
      'UUC',
      range,
      setPoint,
      uucUnit,
      ...uucReadings.slice(0, 5).map(obs => safeGetValue(obs && obs.value !== undefined ? obs.value : obs)),
      safeGetValue(point.value_shown_on?.uuc?.average || point.average_uuc || point.averageuuc || point.average),
      '-'
    ];

    while (uucRow.length < 12) uucRow.push('');
    rows.push(uucRow);
    calibrationPoints.push(calibPointId);
    types.push('uuc');
    repeatables.push('0');
    values.push(setPoint || '0');

    // Master Row
    const masterReadings = safeGetArray(point.value_shown_on?.master?.observations || point.master_values || point.master_observations, 5);
    const masterRow = [
      '-',
      'Master',
      '-',
      '-',
      masterUnit,
      ...masterReadings.slice(0, 5).map(obs => safeGetValue(obs && obs.value !== undefined ? obs.value : obs)),
      safeGetValue(point.value_shown_on?.master?.average || point.average_master || point.averagemaster),
      safeGetValue(point.error)
    ];

    while (masterRow.length < 12) masterRow.push('');
    rows.push(masterRow);
    calibrationPoints.push(calibPointId);
    types.push('master');
    repeatables.push('0');
    values.push(setPoint || '0');
  });

  return { rows, hiddenInputs: { calibrationPoints, types, repeatables, values } };
};

/**
 * Table config for TH Observation
 */
export const getTHTableConfig = (observations) => {
  const { rows, hiddenInputs } = createTHRows(observations);
  return {
    id: 'observationth',
    name: 'Observation TH',
    category: 'Thermohydrometer',
    structure: {
      singleHeaders: ['Sr no', 'Value Shown on', 'Range', 'nominal Value', 'Unit'],
      subHeaders: {
        'Observation on UUC / Master': ['1', '2', '3', '4', '5']
      },
      remainingHeaders: ['Mean', 'Error']
    },
    staticRows: rows,
    hiddenInputs: hiddenInputs
  };
};

const ObservationTH = () => null;
export default ObservationTH;
