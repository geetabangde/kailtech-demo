import { safeGetValue, safeGetArray } from './observationUtils';

/**
 * Calculation logic for Internal Micrometer / Bore Gauge / Indicator Tester (IT) Observation
 */
export const calculateITValues = (rowData) => {
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
 * Row generator for IT Observation
 */
export const createITRows = (dataArray) => {
  const rows = [];
  const calibrationPoints = [];
  const types = [];
  const repeatables = [];
  const values = [];

  (dataArray || []).forEach((point) => {
    if (!point) return;
    const observations = safeGetArray(point.observations, 5);
    const row = [
      point.sequence_number?.toString() || point.sr_no?.toString() || '',
      safeGetValue(point.nominal_value || point.test_point),
      ...observations.slice(0, 5).map(obs => safeGetValue(obs)),
      safeGetValue(point.average),
      safeGetValue(point.error),
    ];
    while (row.length < 9) {
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
 * Table config for IT Observation
 */
export const getITTableConfig = (observations) => {
  const { rows, hiddenInputs } = createITRows(observations);
  return {
    id: 'observationit',
    name: 'Observation IT',
    category: 'Internal Thread',
    structure: {
      thermalCoeff: true,
      singleHeaders: ['Sr. No.', 'Nominal/ Set Value'],
      subHeaders: {
        'Observation on UUC': [
          'Observation 1',
          'Observation 2',
          'Observation 3',
          'Observation 4',
          'Observation 5'
        ]
      },
      remainingHeaders: ['Average', 'Error']
    },
    staticRows: rows,
    hiddenInputs: hiddenInputs,
  };
};

const ObservationIT = () => null;
export default ObservationIT;
