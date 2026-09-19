import { safeGetValue, safeGetArray } from './observationUtils';

/**
 * Calculation logic for Feeler Gauge (FG) Observation
 */
export const calculateFGValues = (rowData, calibPointId, leastCountData) => {
  const result = {};
  if (!rowData || !Array.isArray(rowData)) return result;

  const nominalValStr = rowData[1] !== undefined && rowData[1] !== null ? String(rowData[1]).trim() : '';

  let mlcDec = 3;
  let lcDec = 3;

  if (calibPointId && leastCountData) {
    const lcInfo = leastCountData[calibPointId] || leastCountData[String(calibPointId)];
    if (lcInfo) {
      if (typeof lcInfo === 'object') {
        if (lcInfo.master_decimals != null) mlcDec = lcInfo.master_decimals;
        else if (lcInfo.master) {
          const s = String(lcInfo.master).trim();
          if (s.includes('.')) mlcDec = s.split('.')[1].length;
        }
        if (lcInfo.uuc_decimals != null) lcDec = lcInfo.uuc_decimals;
        else if (lcInfo.uuc) {
          const s = String(lcInfo.uuc).trim();
          if (s.includes('.')) lcDec = s.split('.')[1].length;
        }
      } else if (!isNaN(parseFloat(lcInfo))) {
        const s = String(lcInfo).trim();
        if (s.includes('.')) mlcDec = s.split('.')[1].length;
      }
    }
  }

  // Extract non-empty Master observation numbers (cols 2 to 6)
  const validObservations = [];
  for (let i = 2; i <= 6; i++) {
    const raw = rowData[i];
    if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
      const num = parseFloat(String(raw).trim());
      if (!isNaN(num)) {
        validObservations.push(num);
      }
    }
  }

  if (validObservations.length > 0) {
    const sum = validObservations.reduce((acc, v) => acc + v, 0);
    const avg = sum / validObservations.length;
    result.average = avg.toFixed(mlcDec);

    if (nominalValStr !== '') {
      const nom = parseFloat(nominalValStr);
      if (!isNaN(nom)) {
        const errorDec = Math.max(mlcDec, lcDec);
        const err = parseFloat(result.average) - nom;
        result.error = err.toFixed(errorDec);
      } else {
        result.error = '';
      }
    } else {
      result.error = '';
    }
  } else {
    result.average = '';
    result.error = '';
  }

  return result;
};

/**
 * Row generator for FG Observation
 */
export const createFGRows = (dataArray) => {
  const rows = [];
  const calibrationPoints = [];
  const types = [];
  const repeatables = [];
  const values = [];

  (dataArray || []).forEach((point) => {
    if (!point) return;

    const observations = safeGetArray(point.observations, 5);
    while (observations.length < 5) {
      observations.push('');
    }

    const row = [
      point.sr_no?.toString() || '',
      safeGetValue(point.nominal_value || point.test_point || point.point),
      ...observations.slice(0, 5).map(obs => safeGetValue(obs)),
      safeGetValue(point.average),
      safeGetValue(point.error),
    ];

    while (row.length < 8) {
      row.push('');
    }

    rows.push(row);
    calibrationPoints.push((point.point_id || point.id || point.calibration_point_id)?.toString() || '');
    types.push('uuc');
    repeatables.push('0');
    values.push(safeGetValue(point.nominal_value || point.test_point || point.point) || '0');
  });

  return { rows, hiddenInputs: { calibrationPoints, types, repeatables, values } };
};

/**
 * Table config for FG Observation
 */
export const getFGTableConfig = (observations) => {
  const { rows, hiddenInputs } = createFGRows(observations);
  return {
    id: 'observationfg',
    name: 'Observation FG',
    category: 'Force Gauge',
    structure: {
      thermalCoeff: true,
      singleHeaders: ['Sr. No.', 'Nominal Value'],
      subHeaders: {
        'Observation on UUC': [
          'Observation 1 (Master)',
          'Observation 2 (Master)',
          'Observation 3 (Master)',
          'Observation 4 (Master)',
          'Observation 5 (Master)'
        ]
      },
      remainingHeaders: ['Average (Master)', 'Error']
    },
    staticRows: rows,
    hiddenInputs: hiddenInputs,
  };
};

const ObservationFG = () => null;
export default ObservationFG;
