const ObservationAPG = ({
  selectedTableData,
  tableInputValues,
  setTableInputValues,
  validateDecimalPlaces,
}) => {
  if (selectedTableData?.id !== 'observationapg') return null;

  const formatValueByLc = (val, decimals, leastCount) => {
    if (val === null || val === undefined || val === '') return '';
    if (typeof val === 'string' && val.includes('/')) return val;

    const strVal = String(val).trim();
    const n = parseFloat(strVal);
    if (isNaN(n)) return val;

    let d = null;
    if (decimals != null && decimals !== 'NA' && decimals !== '') {
      const p = parseInt(decimals, 10);
      if (!isNaN(p)) d = p;
    }
    if (d === null && leastCount != null && leastCount !== 'NA' && leastCount !== '') {
      const s = String(leastCount).trim();
      if (s.includes('.')) d = s.split('.')[1].length;
    }

    if (leastCount != null && leastCount !== 'NA' && leastCount !== '') {
      const lc = parseFloat(String(leastCount).trim());
      if (!isNaN(lc) && lc > 0) {
        const quotient = n / lc;
        const floored = Math.floor(quotient);
        const remainder = quotient - floored;

        let rounded;
        if (remainder < 0.5) {
          rounded = floored;
        } else if (remainder > 0.5) {
          rounded = floored + 1;
        } else {
          rounded = (floored % 2 === 0) ? floored : floored + 1;
        }

        const result = rounded * lc;
        if (d !== null) {
          return result.toFixed(d);
        }
        return String(result);
      }
    }

    if (d !== null) {
      const multiplier = Math.pow(10, d);
      const scaled = n * multiplier;
      const floored = Math.floor(scaled);
      const remainder = scaled - floored;

      let rounded;
      if (remainder < 0.5) {
        rounded = floored;
      } else if (remainder > 0.5) {
        rounded = floored + 1;
      } else {
        rounded = (floored % 2 === 0) ? floored : floored + 1;
      }

      return (rounded / multiplier).toFixed(d);
    }
    return strVal;
  };

  const getDecimalPlaces = (leastCount) => {
    if (!leastCount || leastCount === 'NA') return 0;
    const s = String(leastCount).trim();
    if (s.includes('.')) return s.split('.')[1].length;
    return 0;
  };

  const calculateAverageMaster = (m1, m2, mlc_decimals, masterleastcount) => {
    const v1 = parseFloat(m1);
    const v2 = parseFloat(m2);

    if (isNaN(v1) || isNaN(v2)) return '';

    const avg = (v1 + v2) / 2;
    return formatValueByLc(avg, mlc_decimals, masterleastcount);
  };

  const calculateError = (uucVal, avgMaster, errorlc) => {
    if (uucVal === '' || avgMaster === '') return '';
    const uuc = parseFloat(uucVal);
    const avg = parseFloat(avgMaster);
    if (isNaN(uuc) || isNaN(avg)) return '';

    const error = uuc - avg;
    const decimalPlaces = errorlc ?? 3;
    return error.toFixed(decimalPlaces);
  };

  const calculateHysterisis = (m1, m2, mlc_decimals) => {
    const v1 = parseFloat(m1);
    const v2 = parseFloat(m2);

    if (isNaN(v1) || isNaN(v2)) return '';

    const hyst = Math.abs(v2 - v1);
    const decimalPlaces = mlc_decimals ?? 3;
    return hyst.toFixed(decimalPlaces);
  };

  if (!selectedTableData?.calibration_points) return null;

  const point = selectedTableData.calibration_points[0];

  const uucUnit = point?.unit || '';
  const masterUnit = point?.master_unit || '';
  const hasUnitConversion = masterUnit && masterUnit !== uucUnit;

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 uppercase">APG (Absolute Pressure Gauge) Observations</h3>
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-600">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Sr. No.</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Set Pressure on UUC ({uucUnit})</th>
              {hasUnitConversion && (
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Set Pressure on UUC ({masterUnit})</th>
              )}
              <th colSpan="2" className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Observation on Master ({masterUnit})</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Mean ({masterUnit})</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Error ({masterUnit})</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Hysterisis ({masterUnit})</th>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-600 border-b border-gray-300 dark:border-gray-600">
              <th colSpan={hasUnitConversion ? 3 : 2} className="border-r border-gray-300 dark:border-gray-600"></th>
              <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">M1</th>
              <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">M2</th>
              <th colSpan="3" className="border-r border-gray-300 dark:border-gray-600"></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800">
            {selectedTableData.calibration_points.map((point, idx) => {
              const pointId = point.id || point.calibration_point_id;
              const mlc_dec = getDecimalPlaces(point.master_least_count);
              const lc_dec = getDecimalPlaces(point.least_count);
              const error_dec = Math.max(mlc_dec, lc_dec);

              const uucReading = tableInputValues[`${pointId}-uuc`] ?? point.point ?? '';
              const m1Reading = tableInputValues[`${pointId}-m1`] ?? point.m1 ?? '';
              const m2Reading = tableInputValues[`${pointId}-m2`] ?? point.m2 ?? '';

              const avgMaster = calculateAverageMaster(m1Reading, m2Reading, mlc_dec, point.master_least_count);
              const error = calculateError(uucReading, avgMaster, error_dec);
              const hysterisis = calculateHysterisis(m1Reading, m2Reading, mlc_dec);

              return (
                <tr key={pointId} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                      value={formatValueByLc(uucReading, lc_dec, point.least_count)}
                      readOnly
                    />
                  </td>
                  {hasUnitConversion && (
                    <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                        value={formatValueByLc(point.converted_set_point || '', mlc_dec, point.master_least_count)}
                        readOnly
                      />
                    </td>
                  )}
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white">
                    <input
                      type="number"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={m1Reading}
                      onChange={(e) => setTableInputValues({
                        ...tableInputValues,
                        [`${pointId}-m1`]: e.target.value
                      })}
                      onBlur={(e) => {
                        if (validateDecimalPlaces) {
                          validateDecimalPlaces(`${pointId}-m1`, e.target.value, point.master_least_count);
                        }
                      }}
                      placeholder="M1"
                    />
                  </td>
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white">
                    <input
                      type="number"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={m2Reading}
                      onChange={(e) => setTableInputValues({
                        ...tableInputValues,
                        [`${pointId}-m2`]: e.target.value
                      })}
                      onBlur={(e) => {
                        if (validateDecimalPlaces) {
                          validateDecimalPlaces(`${pointId}-m2`, e.target.value, point.master_least_count);
                        }
                      }}
                      placeholder="M2"
                    />
                  </td>
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                      value={avgMaster}
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                      value={error}
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 text-sm dark:text-white bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                      value={hysterisis}
                      readOnly
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Calculation logic for Air Pressure Gauge (APG) Observation row
 */
export const calculateAPGValues = (rowData) => {
  const result = { average: '', error: '', hysteresis: '' };
  if (!rowData || !Array.isArray(rowData)) return result;

  const parsedValues = rowData.map((val) => (val === '' || val === null || val === undefined ? 0 : parseFloat(val) || 0));
  const m1 = parsedValues[3];
  const m2 = parsedValues[4];
  const validReadings = [m1, m2].filter((val) => val !== 0);

  result.average = validReadings.length
    ? (validReadings.reduce((sum, val) => sum + val, 0) / validReadings.length).toFixed(2)
    : '';

  const setPressureBar = parsedValues[2];
  result.error = result.average && setPressureBar
    ? (result.average - setPressureBar).toFixed(2)
    : '';

  result.hysteresis = validReadings.length
    ? (Math.max(...validReadings) - Math.min(...validReadings)).toFixed(2)
    : '';

  return result;
};

/**
 * Row generator for APG Observation
 */
export const createAPGRows = (dataArray) => {
  const rows = [];
  const calibrationPoints = [];
  const types = [];
  const repeatables = [];
  const values = [];

  const safeVal = (item) => {
    if (item === undefined || item === null || item === '') return '';
    if (typeof item === 'object' && item !== null) {
      const val = item.value !== null && item.value !== undefined ? item.value : (item.val ?? item.reading ?? '');
      return (val !== undefined && val !== null) ? val.toString() : '';
    }
    return item.toString();
  };

  (dataArray || []).forEach((obs) => {
    if (!obs) return;
    const row = [
      obs.sr_no?.toString() || '',
      safeVal(obs.uuc ?? obs.nominal_value ?? obs.set_pressure_uuc),
      safeVal(obs.calculated_uuc ?? obs.converted_nominal_value ?? obs.set_pressure_master),
      safeVal(obs.m1 ?? obs.master_readings?.[0]),
      safeVal(obs.m2 ?? obs.master_readings?.[1]),
      safeVal(obs.mean ?? obs.average_master),
      safeVal(obs.error),
      safeVal(obs.hysterisis ?? obs.hysteresis),
    ];
    rows.push(row);
    calibrationPoints.push(obs.calibration_point_id?.toString() || '');
    types.push('input');
    repeatables.push('1');
    values.push(safeVal(obs.uuc ?? obs.nominal_value ?? obs.set_pressure_uuc) || '0');
  });

  return { rows, hiddenInputs: { calibrationPoints, types, repeatables, values } };
};

/**
 * Table config for APG Observation
 */
export const getAPGTableConfig = (observations) => {
  const { rows, hiddenInputs } = createAPGRows(observations);
  return {
    id: 'observationapg',
    name: 'Observation APG',
    category: 'Pressure',
    structure: {
      singleHeaders: ['Sr no', 'Set Pressure on UUC (kg/cm²)', 'Set Pressure on UUC (bar)'],
      subHeaders: {
        'Observations on Master (bar)': ['M1', 'M2'],
      },
      remainingHeaders: ['Mean (bar)', 'Error (bar)', 'Hysterisis (bar)'],
    },
    staticRows: rows,
    hiddenInputs: hiddenInputs,
  };
};

export default ObservationAPG;
