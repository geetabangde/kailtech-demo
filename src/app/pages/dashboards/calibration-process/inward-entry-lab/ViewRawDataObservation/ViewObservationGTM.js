import { safeGetArray, safeGetValue, formatValueByLc } from './viewRawDataUtils';

/**
 * Table configuration for Glass Thermometer (GTM)
 * Matches the header structure of rawdatagtm.php:
 * - Single Headers: Sr. No., Set Point (°C), Range, Value Of, Unit, Sensitivity Coefficient
 * - Sub Headers: Observation () with readings 1, 2, 3, 4, 5
 * - Remaining Headers: Average (Ω), Average (°C), Deviation (°C)
 */
export const gtmTableConfig = {
  id: 'observationgtm',
  name: 'Observation GTM',
  category: 'Temperature',
  structure: {
    singleHeaders: [
      'Sr. No.',
      'Set Point (UUC Unit)',
      'Range',
      'Value Of',
      'Unit',
      'Sensitivity Coefficient',
    ],
    subHeaders: {
      'Observation': ['1', '2', '3', '4', '5'],
    },
    remainingHeaders: ['Average (Ω)', 'Average (UUC Unit)', 'Deviation (UUC Unit)'],
  },
};

/**
 * Extract number of decimal places from least count value.
 */
export const getDecimalPlaces = (leastCount) => {
  if (!leastCount || leastCount === 'NA' || leastCount === 'N.A') return null;
  const s = String(leastCount).trim();
  if (s.includes('.')) {
    const parts = s.split('.');
    return parts[parts.length - 1].length;
  }
  if (!isNaN(parseFloat(s))) return 0;
  return null;
};

/**
 * Determine effective decimal places for UUC or Master.
 * Prioritizes explicitly provided decimal places or least count.
 * Fallbacks to entered reading decimals or defaults (1 for UUC, 3 for Master).
 */
export const getEffectiveDecimals = (point, readings = [], type = 'master') => {
  const isMaster = type === 'master';
  const decPlacesProp = isMaster
    ? (point?.master_least_count_decimal_places ?? point?.master_lc_decimals)
    : (point?.least_count_decimal_places ?? point?.lc_decimals);

  const lcProp = isMaster
    ? (point?.master_least_count !== 'NA' ? point?.master_least_count : (point?.mastermatrix?.leastcount ?? point?.masterleastcount))
    : (point?.least_count !== 'NA' ? point?.least_count : (point?.matrix?.leastcount ?? point?.leastcount));

  if (decPlacesProp !== undefined && decPlacesProp !== null && decPlacesProp !== 'NA' && decPlacesProp !== '') {
    const p = parseInt(decPlacesProp, 10);
    if (!isNaN(p)) return p;
  }

  const d = getDecimalPlaces(lcProp);
  if (d !== null) return d;

  if (Array.isArray(readings) && readings.length > 0) {
    const decs = readings
      .filter((v) => v !== undefined && v !== null && String(v).includes('.'))
      .map((v) => String(v).trim().split('.')[1]?.length || 0);
    if (decs.length > 0) {
      return Math.max(...decs);
    }
  }

  return isMaster ? 3 : 1;
};

/**
 * Create GTM table rows matching rawdatagtm.php logic:
 * Two rows per calibration point:
 * Row 1 (UUC):
 *   - Sr. No. (spanned)
 *   - Set Point (formatted with UUC least count decimals)
 *   - Range
 *   - "UUC"
 *   - UUC Unit description (e.g., °C)
 *   - "-" (Sensitivity Coefficient N/A for UUC)
 *   - Observations 1..5 (UUC readings formatted with lc)
 *   - "-" (Average in Ω N/A for UUC)
 *   - Average UUC (in °C)
 *   - Deviation / Error (in °C, spanned)
 *
 * Row 2 (Master):
 *   - "-" (Sr. No. spanned)
 *   - "-" (Set Point spanned)
 *   - "-" (Range spanned)
 *   - "Master"
 *   - Master Unit description (e.g., Ω)
 *   - Sensitivity Coefficient
 *   - Observations 1..5 (Master readings formatted with mlc)
 *   - Average Master (in Ω)
 *   - Converted Average Master (caveragemaster in °C)
 *   - "-" (Deviation spanned)
 */
export const createGTMRows = (dataArray, currentRawdata = {}) => {
  const rows = [];
  if (!Array.isArray(dataArray)) return rows;

  dataArray.forEach((point, index) => {
    if (!point) return;

    const srNo = point.sr_no?.toString() || (index + 1).toString();
    const rangeVal = safeGetValue(point.range ?? point.uucrange ?? '');
    const uucUnit = safeGetValue(point.unit_description ?? point.unit ?? '°C');
    const masterUnit = safeGetValue(
      point.master_unit_description ??
      (isNaN(Number(point.master_unit)) && point.master_unit ? point.master_unit : null) ??
      'Ω'
    );
    const sensCoeff = safeGetValue(point.sensitivity_coefficient ?? point.sensitivitycoefficient ?? '');

    // Readings extraction (5 readings each)
    const uucReadings = safeGetArray(point.uuc_values ?? point.uuc_observations ?? point.observations, 5);
    const masterReadings = safeGetArray(point.master_values ?? point.master_observations, 5);

    // Determine decimal precisions
    const lc = getEffectiveDecimals(point, uucReadings, 'uuc');
    const mlc = getEffectiveDecimals(point, masterReadings, 'master');
    const errorLc = Math.max(lc, mlc);

    // Format set point
    const rawSetPoint = point.set_point ?? point.point ?? point.test_point;
    const formattedSetPoint = formatValueByLc(rawSetPoint, lc, point.least_count);

    // Average UUC calculation & formatting
    let rawAvgUuc = point.average_uuc ?? point.averageuuc;
    if (rawAvgUuc === undefined || rawAvgUuc === null || rawAvgUuc === '') {
      const validUuc = uucReadings
        .map((v) => (v !== undefined && v !== null && String(v).trim() !== '' ? parseFloat(v) : NaN))
        .filter((v) => !isNaN(v));
      if (validUuc.length > 0) {
        rawAvgUuc = (validUuc.reduce((sum, v) => sum + v, 0) / validUuc.length).toFixed(lc);
      }
    }
    const formattedAvgUuc = formatValueByLc(rawAvgUuc, lc, point.least_count);

    // Average Master calculation & formatting
    let rawAvgMaster = point.average_master ?? point.averagemaster;
    if (rawAvgMaster === undefined || rawAvgMaster === null || rawAvgMaster === '') {
      const validMaster = masterReadings
        .map((v) => (v !== undefined && v !== null && String(v).trim() !== '' ? parseFloat(v) : NaN))
        .filter((v) => !isNaN(v));
      if (validMaster.length > 0) {
        rawAvgMaster = (validMaster.reduce((sum, v) => sum + v, 0) / validMaster.length).toFixed(mlc);
      }
    }
    const formattedAvgMaster = formatValueByLc(rawAvgMaster, mlc, point.master_least_count);

    // Converted Average Master formatting (preserve full errorLc precision e.g. 10.017)
    const rawCAvgMaster = point.converted_average_master ?? point.caveragemaster;
    const formattedCAvgMaster = formatValueByLc(rawCAvgMaster, errorLc);

    // Error / Deviation calculation & formatting
    let rawError = point.error ?? point.deviation;
    if (
      (rawError === undefined || rawError === null || rawError === '') &&
      formattedAvgUuc !== '' &&
      formattedCAvgMaster !== ''
    ) {
      const u = parseFloat(formattedAvgUuc);
      const m = parseFloat(formattedCAvgMaster);
      if (!isNaN(u) && !isNaN(m)) {
        const isStdUuc = currentRawdata?.error === 'stduuc' || currentRawdata?.error_type === 'stduuc' || point?.error_type === 'stduuc';
        rawError = (isStdUuc ? (m - u) : (u - m)).toFixed(errorLc);
      }
    }
    const formattedError = formatValueByLc(rawError, errorLc);

    // Row 1: UUC Row (14 columns)
    const uucRow = [
      srNo,
      formattedSetPoint,
      rangeVal,
      'UUC',
      uucUnit,
      '-',
      ...uucReadings.slice(0, 5).map((val) => formatValueByLc(val, lc, point.least_count)),
      formattedAvgMaster,
      formattedAvgUuc,
      formattedError,
    ];
    rows.push(uucRow);

    // Row 2: Master Row (14 columns)
    const masterRow = [
      '-',
      '-',
      '-',
      'Master',
      masterUnit,
      sensCoeff,
      ...masterReadings.slice(0, 5).map((val) => formatValueByLc(val, mlc, point.master_least_count)),
      formattedAvgMaster,
      formattedCAvgMaster,
      '-',
    ];
    rows.push(masterRow);
  });

  return rows;
};

/**
 * Parses dynamic observation data for GTM
 */
export const parseGTMDynamicData = (observationData) => {
  if (!observationData) return [];

  const src = observationData.observation_data || observationData.data || observationData;

  if (Array.isArray(src)) {
    return src;
  }
  if (src.calibration_points && Array.isArray(src.calibration_points)) {
    return src.calibration_points;
  }
  if (src.data && Array.isArray(src.data)) {
    return src.data;
  }
  if (src.data?.calibration_points && Array.isArray(src.data.calibration_points)) {
    return src.data.calibration_points;
  }
  if (src.points && Array.isArray(src.points)) {
    return src.points;
  }

  return [];
};