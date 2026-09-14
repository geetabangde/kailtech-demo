const ObservationUTM = ({
  selectedTableData,
  tableInputValues,
  setTableInputValues,
  validateDecimalPlaces,
  inwardEntry,
  formData,
}) => {
  if (selectedTableData?.id !== 'observationutm') return null;

  // Calculate room temperature from start and end temperatures
  const roomTemperature = (() => {
    const startTemp = parseFloat(inwardEntry?.temperature) || 0;
    const endTemp = parseFloat(formData?.tempend) || 0;
    if (startTemp && endTemp) {
      return (startTemp + endTemp) / 2;
    }
    return parseFloat(inwardEntry?.temperature) || 0;
  })();

  // Temperature compensation formula from PHP: (0.00027 * (avgtemp - 23) + 1) * calculateduuc
  const applyTemperatureCompensation = (calculateduuc, temp) => {
    if (!calculateduuc || temp === undefined || temp === null) return null;
    const calcVal = parseFloat(calculateduuc);
    const tempVal = parseFloat(temp);
    if (isNaN(calcVal) || isNaN(tempVal)) return null;
    return (0.00027 * (tempVal - 23) + 1) * calcVal;
  };

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

  const calculateAverageMaster = (m0, m1, m2, mlc_decimals, masterleastcount) => {
    const v0 = parseFloat(m0);
    const v1 = parseFloat(m1);
    const v2 = parseFloat(m2);

    if (isNaN(v0) || isNaN(v1) || isNaN(v2)) return '';

    const avg = (v0 + v1 + v2) / 3;
    return formatValueByLc(avg, mlc_decimals, masterleastcount);
  };

  const calculateError = (uucVal, avgMaster, errorlc) => {
    if (uucVal === '' || avgMaster === '') return '';
    const uuc = parseFloat(uucVal);
    const avg = parseFloat(avgMaster);
    if (isNaN(uuc) || isNaN(avg)) return '';

    const error = uuc - avg;
    const decimalPlaces = errorlc ?? 2;
    return error.toFixed(decimalPlaces);
  };

  const calculatePercentError = (error, avgMaster) => {
    if (error === '' || avgMaster === '' || avgMaster === '0') return '';
    const err = parseFloat(error);
    const avg = parseFloat(avgMaster);
    if (isNaN(err) || isNaN(avg) || avg === 0) return '';

    const percentErr = (err / avg) * 100;
    return percentErr.toFixed(2);
  };

  const calculateRepeatability = (m0, m1, m2) => {
    const values = [m0, m1, m2].map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (values.length === 0) return '';

    const max = Math.max(...values);
    const min = Math.min(...values);
    const repeatability = max - min;
    return repeatability.toFixed(2);
  };

  const calculateZeroError = (removalForce, maxPoint) => {
    if (removalForce === '' || !maxPoint) return '';
    const removal = parseFloat(removalForce);
    const max = parseFloat(maxPoint);
    if (isNaN(removal) || isNaN(max) || max === 0) return '';

    const zeroErr = (removal / max) * 100;
    return zeroErr.toFixed(2);
  };

  const calculateRelativeResolution = (leastCount, minPoint) => {
    if (leastCount === 'NA' || !minPoint) return '';
    const lc = parseFloat(leastCount);
    const min = parseFloat(minPoint);
    if (isNaN(lc) || isNaN(min) || min === 0) return '';

    const relRes = (lc / min) * 100;
    return relRes.toFixed(2);
  };

  if (!selectedTableData?.calibration_points) return null;

  // Handle both direct calibration_points array and matrix structure
  const calibrationPoints = Array.isArray(selectedTableData.calibration_points)
    ? selectedTableData.calibration_points
    : [];

  if (calibrationPoints.length === 0) return null;

  const point = calibrationPoints[0];
  const uucUnit = point?.unit || selectedTableData?.metadata?.unit || 'kN';
  const masterUnit = point?.master_unit || selectedTableData?.metadata?.unit || 'kN';
  const POSITIONS = ['Position 0°', 'Position 120°', 'Position 240°'];

  // Calculate min and max points for this table
  const allPoints = selectedTableData.calibration_points.map(p => parseFloat(p.point)).filter(p => !isNaN(p));
  const minPoint = allPoints.length > 0 ? Math.min(...allPoints) : '';
  const maxPoint = allPoints.length > 0 ? Math.max(...allPoints) : '';

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 uppercase">UTM (Universal Testing Machine) Observations</h3>

      {/* Pre-loading Cycle Section */}
      <div className="mb-4 p-4 border border-gray-200 dark:border-gray-600 rounded">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">No. Of Pre-Loading Cycle Before Calibration</div>
        <div className="flex gap-6 flex-wrap">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`preload-${num}`}
                className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                defaultChecked={num === 1}
              />
              <label htmlFor={`preload-${num}`} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                {num}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Main Observation Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-600 mb-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Sr. No.</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Force (F) ({uucUnit})</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Std. at 23 ± 1 (°C)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Calculated UUC ({masterUnit})</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Std. at Room Temp ({masterUnit})</th>
              <th colSpan="3" className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Observed (F) ({masterUnit})</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Mean (Fi)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Error (q)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">% Error</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">% Repeatability</th>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-600 border-b border-gray-300 dark:border-gray-600">
              <th colSpan="4" className="border-r border-gray-300 dark:border-gray-600"></th>
              {POSITIONS.map((pos) => (
                <th key={pos} className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">{pos}</th>
              ))}
              <th colSpan="4" className="border-r border-gray-300 dark:border-gray-600"></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800">
            {calibrationPoints.map((calibPoint, idx) => {
              const pointId = calibPoint.id || calibPoint.calibration_point_id;
              const mlc_dec = getDecimalPlaces(calibPoint.master_least_count);
              const lc_dec = getDecimalPlaces(calibPoint.least_count);
              const error_dec = Math.max(mlc_dec, lc_dec);

              // Calculate Calculated UUC (reference at 23°C)
              const calculatedUuc = parseFloat(calibPoint.calculated_uuc) || '';

              // Apply temperature compensation to UUC
              const compensatedUuc = calculatedUuc
                ? applyTemperatureCompensation(calculatedUuc, roomTemperature)
                : null;

              // Use compensated UUC for error calculation
              const uucForError = compensatedUuc !== null ? compensatedUuc : calibPoint.uuc ?? calibPoint.point ?? '';

              // Handle both API data structure (force, master_readings) and legacy structure (point, m0, m1, m2)
              const masterReadings = calibPoint.master_readings || [
                calibPoint.m0 ?? '',
                calibPoint.m1 ?? '',
                calibPoint.m2 ?? ''
              ];

              const m0Reading = tableInputValues[`${pointId}-m0`] ?? masterReadings[0] ?? '';
              const m1Reading = tableInputValues[`${pointId}-m1`] ?? masterReadings[1] ?? '';
              const m2Reading = tableInputValues[`${pointId}-m2`] ?? masterReadings[2] ?? '';

              const avgMaster = calculateAverageMaster(m0Reading, m1Reading, m2Reading, mlc_dec, calibPoint.master_least_count);
              const error = calculateError(uucForError, avgMaster, error_dec);
              const percentError = calculatePercentError(error, avgMaster);
              const repeatability = calculateRepeatability(m0Reading, m1Reading, m2Reading);

              return (
                <tr key={pointId} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white">
                    {calibPoint.sr_no ?? idx + 1}
                  </td>
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                      value={formatValueByLc(calibPoint.force ?? calibPoint.point ?? '', lc_dec, calibPoint.least_count)}
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                      value={calibPoint.standard_temp ?? calibPoint.std_23 ?? ''}
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                      title={`Calculated at 23°C: ${calculatedUuc}`}
                      value={formatValueByLc(calculatedUuc, mlc_dec, calibPoint.master_least_count)}
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                      title={`Room Temp: ${roomTemperature}°C (compensated from 23°C)`}
                      value={compensatedUuc !== null ? formatValueByLc(compensatedUuc, mlc_dec, calibPoint.master_least_count) : (calibPoint.room_temp ?? calibPoint.std_room ?? '')}
                      readOnly
                    />
                  </td>
                  {[0, 1, 2].map((posIdx) => (
                    <td key={posIdx} className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white">
                      <input
                        type="number"
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={tableInputValues[`${pointId}-m${posIdx}`] ?? calibPoint[`m${posIdx}`] ?? ''}
                        onChange={(e) => setTableInputValues({
                          ...tableInputValues,
                          [`${pointId}-m${posIdx}`]: e.target.value
                        })}
                        onBlur={(e) => {
                          if (validateDecimalPlaces) {
                            validateDecimalPlaces(`${pointId}-m${posIdx}`, e.target.value, calibPoint.master_least_count);
                          }
                        }}
                        placeholder={`M${posIdx}`}
                      />
                    </td>
                  ))}
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
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                      value={percentError}
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 text-sm dark:text-white bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                      value={repeatability}
                      readOnly
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Removal of Force Section */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-600 mb-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
              <th colSpan="4" className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">
                Observation Reading on Removal of Force (fi0)
              </th>
              {POSITIONS.map((pos) => (
                <th key={pos} className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">{pos}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800">
            <tr className="border-b border-gray-200 dark:border-gray-600">
              {[0, 1, 2].map((posIdx) => (
                <td key={posIdx} className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white">
                  <input
                    type="number"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={tableInputValues[`removalforce-${posIdx}`] ?? ''}
                    onChange={(e) => setTableInputValues({
                      ...tableInputValues,
                      [`removalforce-${posIdx}`]: e.target.value
                    })}
                    placeholder={`Removal ${posIdx}`}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Zero Error Section */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-600 mb-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
              <th colSpan="4" className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">
                Relative Zero Error % (f0)
              </th>
              {POSITIONS.map((pos) => (
                <th key={pos} className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">{pos}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800">
            <tr className="border-b border-gray-200 dark:border-gray-600">
              {[0, 1, 2].map((posIdx) => {
                const removalForce = tableInputValues[`removalforce-${posIdx}`] ?? '';
                const zeroErr = calculateZeroError(removalForce, maxPoint);
                return (
                  <td key={posIdx} className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                      value={zeroErr}
                      readOnly
                    />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-2 gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-40">Least Count:</label>
          <input
            type="text"
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
            value={point?.least_count ?? ''}
            readOnly
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-40">Min Point:</label>
          <input
            type="text"
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
            value={minPoint}
            readOnly
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-40">Max Point:</label>
          <input
            type="text"
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
            value={maxPoint}
            readOnly
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-40">Max Relative Resolution:</label>
          <input
            type="text"
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
            value={calculateRelativeResolution(point?.least_count, minPoint)}
            readOnly
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-40">Class of Machine:</label>
          <input
            type="text"
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={tableInputValues['classofmachine'] ?? ''}
            onChange={(e) => setTableInputValues({
              ...tableInputValues,
              classofmachine: e.target.value
            })}
            placeholder="Enter class"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-40">Dial Gauge Setting:</label>
          <input
            type="text"
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={tableInputValues['dialguagesetting'] ?? ''}
            onChange={(e) => setTableInputValues({
              ...tableInputValues,
              dialguagesetting: e.target.value
            })}
            placeholder="Enter setting"
          />
        </div>
      </div>
    </div>
  );
};

// Exported calculation function for use in CalibrateStep3
export const calculateUTMValues = (rowData, rowIndex, selectedTableData) => {
  const result = {};
  const rowMeta = selectedTableData?.rowMeta?.[rowIndex] || {};

  if (rowMeta.kind === 'removal') {
    const maxPoint = parseFloat(rowMeta.maxPoint) || 0;
    [4, 5, 6].forEach((colIdx, idx) => {
      const removal = parseFloat(rowData[colIdx]);
      result[`zero${idx}`] = maxPoint && !isNaN(removal) ? ((removal / maxPoint) * 100).toFixed(2) : '';
    });
    return result;
  }

  if (rowMeta.kind !== 'point') return result;

  const masterValues = [4, 5, 6]
    .map((colIdx) => parseFloat(rowData[colIdx]))
    .filter((val) => !isNaN(val));
  const average = masterValues.length
    ? masterValues.reduce((sum, val) => sum + val, 0) / masterValues.length
    : null;

  result.average = average !== null ? average.toFixed(3) : '';

  const uuc = parseFloat(rowData[3]);
  const error = average !== null && !isNaN(uuc) ? uuc - average : null;
  result.error = error !== null ? error.toFixed(3) : '';
  result.percentError = error !== null && average
    ? ((error / average) * 100).toFixed(2)
    : '';
  result.repeatability = average && masterValues.length > 1
    ? (((Math.max(...masterValues) - Math.min(...masterValues)) / average) * 100).toFixed(2)
    : '';

  return result;
};

export default ObservationUTM;
