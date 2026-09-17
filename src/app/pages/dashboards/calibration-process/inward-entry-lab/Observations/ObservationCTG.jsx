import { safeGetValue, safeGetArray } from './observationUtils';

/**
 * Calculation logic for Coating Thickness Gauge (CTG) Observation
 */
export const calculateCTGValues = (rowData) => {
  const result = {};
  if (!rowData || !Array.isArray(rowData)) return result;

  const parsedValues = rowData.map((val) => (val === '' || val === null || val === undefined ? 0 : parseFloat(val) || 0));
  const observations = parsedValues.slice(2, 7).filter((val) => val !== 0);
  result.average = observations.length
    ? (observations.reduce((sum, val) => sum + val, 0) / observations.length).toFixed(2)
    : '';
  const nominalValue = parsedValues[1];
  result.error = result.average && nominalValue
    ? (result.average - nominalValue).toFixed(2)
    : '';

  return result;
};

/**
 * Row generator for CTG Observation
 */
export const createCTGRows = (dataArray) => {
  const rows = [];
  const calibrationPoints = [];
  const types = [];
  const repeatables = [];
  const values = [];

  (dataArray || []).forEach((point) => {
    const observations = safeGetArray(point?.observations, 5);
    const row = [
      point?.sr_no?.toString() || '',
      point?.nominal_value || '',
      ...observations.slice(0, 5).map((obs) => safeGetValue(obs)),
      safeGetValue(point?.average),
      safeGetValue(point?.error),
    ];
    rows.push(row);
    calibrationPoints.push(point?.id?.toString() || ''); // ✅ IMPORTANT: Use point.id
    types.push('uuc');
    repeatables.push('0');
    values.push(safeGetValue(point?.nominal_value) || '0');
  });

  return { rows, hiddenInputs: { calibrationPoints, types, repeatables, values } };
};

/**
 * Table config for CTG Observation
 */
export const getCTGTableConfig = (observations) => {
  const { rows, hiddenInputs } = createCTGRows(observations);
  return {
    id: 'observationctg',
    name: 'Observation CTG',
    category: 'Temperature',
    structure: {
      thermalCoeff: true,
      singleHeaders: ['Sr. No.', 'Nominal Value'],
      subHeaders: {
        'Observation on UUC': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5'],
      },
      remainingHeaders: ['Average', 'Error'],
    },
    staticRows: rows,
    hiddenInputs: hiddenInputs,
  };
};

const ObservationCTG = () => null;
export default ObservationCTG;
