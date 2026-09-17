import { safeGetValue } from './observationUtils';

/**
 * Calculation logic for Digital Pressure Gauge (DPG) Observation
 */
export const calculateDPGValues = (rowData, point, instrument) => {
  const result = {};
  if (!rowData || !Array.isArray(rowData)) return result;

  const masterLc = point?.least_counts?.master || point?.master_least_count || point?.masterleastcount || instrument?.leastcount;
  const uucLc = point?.least_counts?.uuc || point?.uuc_least_count || point?.least_count || point?.leastcount || instrument?.leastcount;

  const rM1 = rowData[3] !== undefined && rowData[3] !== null ? String(rowData[3]).trim() : '';
  const rM2 = rowData[4] !== undefined && rowData[4] !== null ? String(rowData[4]).trim() : '';
  const rM3 = rowData[5] !== undefined && rowData[5] !== null ? String(rowData[5]).trim() : '';

  const getDecimals = (val) => {
    if (!val || val === 'NA') return 3;
    const str = String(val).trim();
    if (str.includes('.')) return str.split('.')[1].length;
    return 0;
  };

  let mlc = 3;
  if (rM1.includes('.')) {
    mlc = rM1.split('.')[1].length;
  } else if (masterLc && String(masterLc).includes('.')) {
    mlc = String(masterLc).split('.')[1].length;
  } else {
    mlc = getDecimals(masterLc || '0.001');
  }

  let errorlc = mlc;
  if (uucLc && String(uucLc).includes('.')) {
    errorlc = Math.max(mlc, String(uucLc).split('.')[1].length);
  }

  const hasM1 = rM1 !== '';
  const hasM2 = rM2 !== '';
  const hasM3 = rM3 !== '';

  const m1 = parseFloat(rM1);
  const m2 = parseFloat(rM2);
  const m3 = parseFloat(rM3);

  const validEntries = [];
  if (hasM1 && !isNaN(m1)) validEntries.push(m1);
  if (hasM2 && !isNaN(m2)) validEntries.push(m2);
  if (hasM3 && !isNaN(m3)) validEntries.push(m3);

  // Mean = (M1 + M2 + M3) / 3 formatted to mlc
  result.average = validEntries.length === 3
    ? ((m1 + m2 + m3) / 3).toFixed(mlc)
    : '';

  // Error = (uuc - averagemaster) formatted to errorlc
  const rSet = (rowData[2] !== undefined && rowData[2] !== '' && rowData[2] !== null) ? rowData[2] : rowData[1];
  const setPressure = parseFloat(rSet);
  result.error = (result.average !== '' && !isNaN(setPressure) && rSet !== undefined && rSet !== '')
    ? (setPressure - parseFloat(result.average)).toFixed(errorlc)
    : '';

  // Repeatability = |M3 - M1|
  result.repeatability = (hasM1 && hasM3 && !isNaN(m1) && !isNaN(m3))
    ? Math.abs(m3 - m1).toFixed(mlc)
    : '';

  // Hysteresis = |M2 - M1|
  result.hysteresis = (hasM1 && hasM2 && !isNaN(m1) && !isNaN(m2))
    ? Math.abs(m2 - m1).toFixed(mlc)
    : '';

  return result;
};

/**
 * Row generator for DPG Observation
 */
export const createDPGRows = (dataArray, instrument) => {
  const rows = [];
  const calibrationPoints = [];
  const types = [];
  const repeatables = [];
  const values = [];

  (dataArray || []).forEach((obs) => {
    if (!obs) return;

    const m1Str = safeGetValue(obs.master_readings?.m1 || obs.m1);
    const m2Str = safeGetValue(obs.master_readings?.m2 || obs.m2);
    const m3Str = safeGetValue(obs.master_readings?.m3 || obs.m3);

    const masterLc = obs?.least_counts?.master || obs?.master_least_count || obs?.masterleastcount || instrument?.leastcount;
    const uucLc = obs?.least_counts?.uuc || obs?.least_count || obs?.leastcount || instrument?.leastcount;

    let mlc = 3;
    if (m1Str.includes('.')) {
      mlc = m1Str.split('.')[1].length;
    } else if (masterLc && String(masterLc).includes('.')) {
      mlc = String(masterLc).split('.')[1].length;
    }

    let errorlc = mlc;
    if (uucLc && String(uucLc).includes('.')) {
      errorlc = Math.max(mlc, String(uucLc).split('.')[1].length);
    }

    const m1 = parseFloat(m1Str);
    const m2 = parseFloat(m2Str);
    const m3 = parseFloat(m3Str);

    const hasM1 = m1Str !== '' && !isNaN(m1);
    const hasM2 = m2Str !== '' && !isNaN(m2);
    const hasM3 = m3Str !== '' && !isNaN(m3);

    // Mean (col 6)
    let meanVal = '';
    if (hasM1 && hasM2 && hasM3) {
      meanVal = ((m1 + m2 + m3) / 3).toFixed(mlc);
    } else {
      const rawAvg = safeGetValue(obs.average_master || obs.mean);
      meanVal = rawAvg !== '' && !isNaN(parseFloat(rawAvg)) ? parseFloat(rawAvg).toFixed(mlc) : rawAvg;
    }

    // Error (col 7)
    const rSet = safeGetValue(obs.converted_uuc_value || obs.set_pressure_master) || safeGetValue(obs.uuc_value || obs.set_pressure_uuc);
    const setPressure = parseFloat(rSet);
    let errorVal = '';
    if (meanVal !== '' && !isNaN(setPressure) && rSet !== '') {
      errorVal = (setPressure - parseFloat(meanVal)).toFixed(errorlc);
    } else {
      const rawErr = safeGetValue(obs.error);
      errorVal = rawErr !== '' && !isNaN(parseFloat(rawErr)) ? parseFloat(rawErr).toFixed(errorlc) : rawErr;
    }

    // Repeatability (col 8)
    let repVal = '';
    if (hasM1 && hasM3) {
      repVal = Math.abs(m3 - m1).toFixed(mlc);
    } else {
      const rawRep = safeGetValue(obs.repeatability);
      repVal = rawRep !== '' && !isNaN(parseFloat(rawRep)) ? parseFloat(rawRep).toFixed(mlc) : rawRep;
    }

    // Hysterisis (col 9)
    let hystVal = '';
    if (hasM1 && hasM2) {
      hystVal = Math.abs(m2 - m1).toFixed(mlc);
    } else {
      const rawHyst = safeGetValue(obs.hysterisis || obs.hysteresis);
      hystVal = rawHyst !== '' && !isNaN(parseFloat(rawHyst)) ? parseFloat(rawHyst).toFixed(mlc) : rawHyst;
    }

    const row = [
      obs.sr_no?.toString() || '',
      safeGetValue(obs.uuc_value || obs.set_pressure_uuc),
      safeGetValue(obs.converted_uuc_value || obs.set_pressure_master),
      m1Str,
      m2Str,
      m3Str,
      meanVal,
      errorVal,
      repVal,
      hystVal,
    ];
    rows.push(row);
    calibrationPoints.push(obs.calibration_point_id?.toString() || '');
    types.push('uuc');
    repeatables.push('0');
    values.push(safeGetValue(obs.uuc_value || obs.set_pressure_uuc) || '0');
  });

  return { rows, hiddenInputs: { calibrationPoints, types, repeatables, values } };
};

/**
 * Table config for DPG Observation
 */
export const getDPGTableConfig = (observations, instrument) => {
  const { rows, hiddenInputs } = createDPGRows(observations, instrument);
  const firstObs = Array.isArray(observations) && observations.length > 0 ? observations[0] : null;
  const calcUnit = firstObs?.units?.calculation || firstObs?.calculationunit || '';
  const masterUnit = firstObs?.units?.master || firstObs?.masterunit_name || '';
  const uucUnit = firstObs?.units?.test || firstObs?.unit_name || '';

  const singleHeaders = [
    'SR NO',
    calcUnit ? `SET PRESSURE ON UUC (${calcUnit.toUpperCase()})` : 'SET PRESSURE ON UUC (CALCULATIONUNIT)',
    masterUnit ? `SET PRESSURE ON UUC (${masterUnit.toUpperCase()})` : '[SET PRESSURE ON UUC (MASTERUNIT)]',
  ];

  const obsHeader = masterUnit
    ? `OBSERVATION ON MASTER (${masterUnit.toUpperCase()})`
    : 'OBSERVATION ON MASTER';

  const remainingHeaders = [
    uucUnit ? `MEAN (${uucUnit.toUpperCase()})` : 'MEAN (UUCUNIT)',
    uucUnit ? `ERROR (${uucUnit.toUpperCase()})` : 'ERROR (UUCUNIT)',
    uucUnit ? `REPEATABILITY (${uucUnit.toUpperCase()})` : 'REPEATABILITY (UUCUNIT)',
    uucUnit ? `HYSTERISIS (${uucUnit.toUpperCase()})` : 'HYSTERISIS (UUCUNIT)',
  ];

  return {
    id: 'observationdpg',
    name: 'Observation DPG',
    category: 'Pressure',
    structure: {
      singleHeaders,
      subHeaders: {
        [obsHeader]: ['M1', 'M2', 'M3'],
      },
      remainingHeaders,
    },
    staticRows: rows,
    hiddenInputs: hiddenInputs,
  };
};

const ObservationDPG = () => null;
export default ObservationDPG;
