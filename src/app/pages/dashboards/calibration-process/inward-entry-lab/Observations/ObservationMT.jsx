import { safeGetValue, safeGetArray, getDecimalPlaces, formatValueByLc } from './observationUtils';

/**
 * Calculation logic for Material Testing / Micrometer (MT) Observation
 */
export const calculateMTValues = (rowData, rowIndex, selectedTableData, leastCountData, observations) => {
  const result = {};
  if (!rowData || !Array.isArray(rowData)) return result;

  const calibPointId = selectedTableData?.hiddenInputs?.calibrationPoints?.[rowIndex];
  const lcs = leastCountData?.[calibPointId] || leastCountData?.[String(calibPointId)];
  const point = observations?.[rowIndex];
  const masterLc = (typeof lcs === 'object' ? lcs?.master : null) ?? point?.metadata?.master_least_count;

  const getDecimals = (val) => {
    if (!val || val === 'NA') return 3;
    const str = String(val).trim();
    if (str.includes('.')) return str.split('.')[1].length;
    return 0;
  };

  const masterDecimals = (typeof lcs === 'object' ? lcs?.master_decimals : null) ?? point?.metadata?.master_decimal_places ?? getDecimals(masterLc);
  const repeatableCycle = parseInt(selectedTableData?.hiddenInputs?.repeatables?.[rowIndex] || point?.metadata?.repeatable_cycle, 10) || 5;

  const validObs = [];
  for (let i = 0; i < repeatableCycle; i++) {
    const raw = rowData[i + 2];
    if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
      const num = parseFloat(raw);
      if (!isNaN(num)) validObs.push(num);
    }
  }

  result.average = validObs.length
    ? (validObs.reduce((sum, val) => sum + val, 0) / validObs.length).toFixed(masterDecimals)
    : '';

  const nominalValue = parseFloat(rowData[1]);
  result.error = result.average !== '' && !isNaN(nominalValue)
    ? (nominalValue - parseFloat(result.average)).toFixed(masterDecimals)
    : '';

  return result;
};

/**
 * Row generator for MT Observation
 */
export const createMTRows = (dataArray) => {
  const rows = [];
  const calibrationPoints = [];
  const types = [];
  const repeatables = [];
  const values = [];

  (dataArray || []).forEach((point) => {
    if (!point) return;

    const observations = safeGetArray(point.observations, 5);
    const repeatableCycle = parseInt(point.metadata?.repeatable_cycle || point.repeatable_cycle || point.repeatablecycle, 10) || 5;
    const masterLc = point.metadata?.master_least_count ?? point.master_least_count ?? 0.005;
    const masterDecimals = point.metadata?.master_decimal_places ?? getDecimalPlaces(masterLc);

    const avgVal = safeGetValue(point.average_master || point.average);
    const errVal = safeGetValue(point.error);

    const row = [
      point.sequence_number?.toString() || point.sr_no?.toString() || '',
      safeGetValue(point.uuc_value || point.nominal_value || point.test_point),
      ...Array.from({ length: 5 }, (_, index) =>
        index < repeatableCycle ? safeGetValue(observations[index]) : ''
      ),
      avgVal !== '' ? (formatValueByLc(avgVal, masterDecimals) || avgVal) : '',
      errVal !== '' ? errVal : '',
    ];

    while (row.length < 9) {
      row.push('');
    }

    rows.push(row);
    calibrationPoints.push(point.point_id?.toString() || point.calibration_point_id?.toString() || point.id?.toString() || '');
    types.push('uuc');
    repeatables.push(repeatableCycle.toString());
    values.push(safeGetValue(point.uuc_value || point.nominal_value || point.test_point) || '0');
  });

  return { rows, hiddenInputs: { calibrationPoints, types, repeatables, values } };
};

/**
 * Table config for MT Observation
 */
export const getMTTableConfig = (observations) => {
  const { rows, hiddenInputs } = createMTRows(observations);
  return {
    id: 'observationmt',
    name: 'Observation MT',
    category: 'Measuring Tool',
    structure: {
      thermalCoeff: true,
      additionalFields: ['Thickness of graduation Line'],
      singleHeaders: ['Sr. No.', 'Nominal Value in (mm)'],
      subHeaders: {
        'Observation on Master in (mm)': [
          'Observation 1',
          'Observation 2',
          'Observation 3',
          'Observation 4',
          'Observation 5'
        ]
      },
      remainingHeaders: ['Average in (mm)', 'Error in (mm)']
    },
    staticRows: rows,
    hiddenInputs: hiddenInputs,
  };
};

const ObservationMT = () => null;
export default ObservationMT;
