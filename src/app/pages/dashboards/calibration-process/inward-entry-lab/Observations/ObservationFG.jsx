import { safeGetValue, safeGetArray } from './observationUtils';

/**
 * Calculation logic for Feeler Gauge (FG) Observation
 */
export const calculateFGValues = (rowData) => {
  const result = {};
  if (!rowData || !Array.isArray(rowData)) return result;

  const parsedValues = rowData.map((val) => (val === '' || val === null || val === undefined ? 0 : parseFloat(val) || 0));
  const observations = parsedValues.slice(2, 7).filter((val) => val !== 0);
  result.average = observations.length
    ? (observations.reduce((sum, val) => sum + val, 0) / observations.length).toFixed(3)
    : '';
  const nominalValue = parsedValues[1];
  result.error = result.average && nominalValue
    ? (parseFloat(result.average) - nominalValue).toFixed(3)
    : '';

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
      safeGetValue(point.nominal_value || point.test_point),
      ...observations.slice(0, 5).map(obs => safeGetValue(obs)),
      safeGetValue(point.average),
      safeGetValue(point.error),
    ];

    while (row.length < 8) {
      row.push('');
    }

    rows.push(row);
    calibrationPoints.push(point.point_id?.toString() || '');
    types.push('input');
    repeatables.push(point.repeatable_cycle?.toString() || '5');
    values.push(safeGetValue(point.nominal_value || point.test_point) || '0');
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
