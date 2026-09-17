/**
 * Calculation logic for Multimeter (MM) Observation
 */
export const calculateMMValues = (rowData) => {
  const result = {};
  if (!rowData || !Array.isArray(rowData)) return result;

  const parsedValues = rowData.map((val) => (val === '' || val === null || val === undefined ? 0 : parseFloat(val) || 0));
  const observations = parsedValues.slice(5, 10).filter((val) => val !== 0);
  result.average = observations.length
    ? (observations.reduce((sum, val) => sum + val, 0) / observations.length).toFixed(3)
    : '';
  const nominalValue = parsedValues[4];
  result.error = result.average && nominalValue
    ? (parseFloat(result.average) - nominalValue).toFixed(3)
    : '';

  return result;
};

/**
 * Row generator for MM Observation
 */
export const createMMRows = (dataArray) => {
  const allRows = [];
  const allCalibrationPoints = [];
  const allTypes = [];
  const allRepeatables = [];
  const allValues = [];
  const unitTypes = [];

  (dataArray || []).forEach((unitTypeGroup) => {
    if (!unitTypeGroup || !unitTypeGroup.calibration_points) return;

    unitTypes.push(unitTypeGroup);

    unitTypeGroup.calibration_points.forEach((point, pointIndex) => {
      if (!point) return;

      const observations = [];
      if (point.observations && Array.isArray(point.observations)) {
        for (let i = 0; i < 5; i++) {
          observations.push(point.observations[i]?.value || '');
        }
      }

      while (observations.length < 5) {
        observations.push('');
      }

      const row = [
        point.sequence_number?.toString() || (pointIndex + 1).toString(),
        point.mode || 'Measure',
        point.range || '',
        (point.nominal_values?.calculated_master?.value || '') +
        (point.nominal_values?.calculated_master?.unit ? ' ' + point.nominal_values.calculated_master.unit : ''),
        (point.nominal_values?.master?.value || '') +
        (point.nominal_values?.master?.unit ? ' ' + point.nominal_values.master.unit : ''),
        ...observations,
        point.calculations?.average || '',
        point.calculations?.error || ''
      ];

      allRows.push(row);
      allCalibrationPoints.push(point.point_id?.toString() || (allRows.length).toString());
      allTypes.push('input');
      allRepeatables.push('1');
      allValues.push(point.nominal_values?.master?.value || "0");
    });
  });

  return {
    rows: allRows,
    hiddenInputs: {
      calibrationPoints: allCalibrationPoints,
      types: allTypes,
      repeatables: allRepeatables,
      values: allValues
    },
    unitTypes: unitTypes
  };
};

/**
 * Table config for MM Observation
 */
export const getMMTableConfig = (observations) => {
  const { rows, hiddenInputs, unitTypes } = createMMRows(observations);
  return {
    id: 'observationmm',
    name: 'Observation MM',
    category: 'Multimeter',
    structure: {
      singleHeaders: ['Sr. No.', 'Mode', 'Range', 'Nominal/ Set Value on master (Calculated)', 'Nominal/ Set Value on master'],
      subHeaders: {
        'Observation on UUC': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5']
      },
      remainingHeaders: ['Average', 'Error']
    },
    staticRows: rows,
    hiddenInputs: hiddenInputs,
    unitTypes: unitTypes
  };
};

const ObservationMM = () => null;
export default ObservationMM;
