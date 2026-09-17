import { safeGetValue, safeGetArray } from './observationUtils';

/**
 * Calculation logic for Measuring Steel Ruler (MSR) Observation
 */
export const calculateMSRValues = (rowData) => {
  const result = {};
  if (!rowData || !Array.isArray(rowData)) return result;

  const parsedValues = rowData.map((val) => (val === '' || val === null || val === undefined ? 0 : parseFloat(val) || 0));
  const observations = parsedValues.slice(2, 7).filter((val) => val !== 0);
  result.average = observations.length
    ? (observations.reduce((sum, val) => sum + val, 0) / observations.length).toFixed(3)
    : '';
  const nominalValue = parsedValues[1];
  result.error = result.average && nominalValue
    ? (nominalValue - parseFloat(result.average)).toFixed(3)
    : '';

  return result;
};

/**
 * Row generator for MSR Observation
 */
export const createMSRRows = (dataArray) => {
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
      safeGetValue(point.nominal_value || point.uuc_value),
      ...observations.slice(0, 5).map(obs => safeGetValue(obs)),
      safeGetValue(point.average),
      safeGetValue(point.error),
    ];

    while (row.length < 8) {
      row.push('');
    }

    rows.push(row);
    calibrationPoints.push(point.point_id?.toString() || '');
    types.push('uuc');
    repeatables.push(point.repeatable_cycle?.toString() || '5');
    values.push(safeGetValue(point.nominal_value || point.uuc_value) || '0');
  });

  return { rows, hiddenInputs: { calibrationPoints, types, repeatables, values } };
};

/**
 * Table config for MSR Observation
 */
export const getMSRTableConfig = (observations) => {
  const { rows, hiddenInputs } = createMSRRows(observations);
  return {
    id: 'observationmsr',
    name: 'Observation MSR',
    category: 'Measuring',
    structure: {
      thermalCoeff: true,
      singleHeaders: ['Sr. No.', 'Nominal/ Set Value'],
      subHeaders: {
        'Observation on UUC': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5']
      },
      remainingHeaders: ['Average', 'Error']
    },
    staticRows: rows,
    hiddenInputs: hiddenInputs
  };
};

const ObservationMSR = () => null;
export default ObservationMSR;
