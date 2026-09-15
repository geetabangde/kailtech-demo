import { useState } from 'react';


const ObservationWBN = ({
  selectedTableData,
  tableInputValues,
  setTableInputValues,
  handleInputChange,
  handleObservationBlur,
  validateDecimalPlaces,
  observations,
}) => {
  const [diagram, setDiagram] = useState('circalimg');

  if (selectedTableData?.id !== 'observationwbn') return null;

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

  const calculateAverage = (readings, lc_decimals, leastCount) => {
    const values = readings
      .filter(r => r !== '' && r !== null && r !== undefined)
      .map(r => parseFloat(r))
      .filter(r => !isNaN(r));

    if (values.length === 0) return '';

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return formatValueByLc(avg, lc_decimals, leastCount);
  };

  const calculateError = (avgUuc, masterReading, decimals) => {
    if (avgUuc === '' || masterReading === '') return '';
    const avg = parseFloat(avgUuc);
    const master = parseFloat(masterReading);
    if (isNaN(avg) || isNaN(master)) return '';

    const error = avg - master;
    const decimalPlaces = decimals ?? 3;
    return error.toFixed(decimalPlaces);
  };

  const calculateEccentricity = (readings, decimals) => {
    const values = readings
      .filter(r => r !== '' && r !== null && r !== undefined)
      .map(r => parseFloat(r))
      .filter(r => !isNaN(r));

    if (values.length === 0) return '';

    const max = Math.max(...values);
    const min = Math.min(...values);
    const ecc = (max - min) / 2;
    const decimalPlaces = decimals ?? 3;
    return ecc.toFixed(decimalPlaces);
  };

  const rowCount = selectedTableData.staticRows?.length || 0;

  if (!selectedTableData.staticRows || selectedTableData.staticRows.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded">
        <p className="text-yellow-800 dark:text-yellow-200">No calibration points available for WBN Observation</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 uppercase">Weighing Balance (WBN) Observations</h3>

      {/* Diagram Selection */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 dark:text-white mb-3">Diagram Choice</h4>
        <div className="flex gap-8 justify-center mb-6">
          <div className="flex flex-col items-center gap-2 border border-gray-200 dark:border-gray-700 p-4 rounded bg-white dark:bg-gray-800">
            <img
              src="/images/circalimg.png"
              alt="Circular Diagram"
              className="h-32 object-contain"
            />
            <label className="flex items-center gap-2 text-sm font-medium dark:text-white mt-2">
              <input
                type="radio"
                name="daigram"
                value="circalimg"
                checked={diagram === 'circalimg'}
                onChange={(e) => setDiagram(e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              Circular Diagram
            </label>
          </div>
          <div className="flex flex-col items-center gap-2 border border-gray-200 dark:border-gray-700 p-4 rounded bg-white dark:bg-gray-800">
            <img
              src="/images/newrectangle.png"
              alt="Rectangular Diagram"
              className="h-32 object-contain"
            />
            <label className="flex items-center gap-2 text-sm font-medium dark:text-white mt-2">
              <input
                type="radio"
                name="daigram"
                value="newrectangle"
                checked={diagram === 'newrectangle'}
                onChange={(e) => setDiagram(e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              Rectangular Diagram
            </label>
          </div>
        </div>
      </div>

      {/* Combined Observation Table */}
      {rowCount > 0 && (
        <div className="mt-8">
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-600">
            <table className="w-full text-sm border-collapse">
              <thead>
                {/* Main Headers */}
                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                  <th rowSpan="2" className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Sr. No.
                  </th>
                  <th rowSpan="2" className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Nominal Value
                  </th>

                  <th colSpan="5" className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Weighing Process
                  </th>

                  <th colSpan="6" className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Repeatability
                  </th>

                  <th colSpan="11" className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Eccentricity
                  </th>
                </tr>

                {/* Sub Headers */}
                <tr className="bg-gray-50 dark:bg-gray-600 border-b border-gray-300 dark:border-gray-600">
                  {/* Weighing: W1, W2, W3, W-Avg, Error */}
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">W1</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">W2</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">W3</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">W-Avg</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">Error</th>

                  {/* Repeatability: R1-R5, R-Avg */}
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">R1</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">R2</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">R3</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">R4</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">R5</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">R-Avg</th>

                  {/* Eccentricity: CW1-5, ACW1-5, Ecc D */}
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">CW1</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">CW2</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">CW3</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">CW4</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">CW5</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">ACW1</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">ACW2</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">ACW3</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">ACW4</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">ACW5</th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300">Ecc D</th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {selectedTableData.staticRows.map((row, rowIndex) => {
                  const point = observations?.[rowIndex];
                  const lc_dec = point?.lc_decimals ?? getDecimalPlaces(point?.least_count_uuc || point?.least_count);

                  // Row structure: [sr_no, nominal, w1, w2, w3, w_avg, w_error, r1, r2, r3, r4, r5, r_avg, cw1-5, acw1-5, ecc_d]
                  const srNo = row[0];
                  const nominal = row[1];
                  const weighingReadings = [row[2], row[3], row[4]];
                  const repeatabilityReadings = [row[7], row[8], row[9], row[10], row[11]];
                  const eccentricityReadings = [row[13], row[14], row[15], row[16], row[17], row[18], row[19], row[20], row[21], row[22]];

                  return (
                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700 text-center font-medium">
                        {srNo}
                      </td>
                      <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                          value={nominal ?? ''}
                          readOnly
                        />
                      </td>

                      {/* Weighing readings */}
                      {[2, 3, 4].map((colIndex) => (
                        <td key={colIndex} className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white">
                          <input
                            type="number"
                            step="any"
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={tableInputValues[`${rowIndex}-${colIndex}`] ?? row[colIndex] ?? ''}
                            onChange={(e) => {
                              if (handleInputChange) {
                                handleInputChange(rowIndex, colIndex, e.target.value);
                              } else {
                                setTableInputValues({
                                  ...tableInputValues,
                                  [`${rowIndex}-${colIndex}`]: e.target.value,
                                });
                              }
                            }}
                            onBlur={(e) => {
                              if (handleObservationBlur) {
                                handleObservationBlur(rowIndex, colIndex, e.target.value);
                              }
                              if (validateDecimalPlaces) {
                                validateDecimalPlaces(`${rowIndex}-${colIndex}`, e.target.value, point?.least_count_uuc);
                              }
                            }}
                          />
                        </td>
                      ))}

                      {/* Weighing average and error (read-only) */}
                      <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                          value={calculateAverage(weighingReadings.map((r, idx) => tableInputValues[`${rowIndex}-${idx + 2}`] ?? r), lc_dec, point?.least_count_uuc)}
                          readOnly
                        />
                      </td>
                      <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                          value={calculateError(
                            calculateAverage(weighingReadings.map((r, idx) => tableInputValues[`${rowIndex}-${idx + 2}`] ?? r), lc_dec, point?.least_count_uuc),
                            nominal,
                            lc_dec
                          )}
                          readOnly
                        />
                      </td>

                      {/* Repeatability readings */}
                      {[7, 8, 9, 10, 11].map((colIndex) => (
                        <td key={colIndex} className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white">
                          <input
                            type="number"
                            step="any"
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={tableInputValues[`${rowIndex}-${colIndex}`] ?? row[colIndex] ?? ''}
                            onChange={(e) => {
                              if (handleInputChange) {
                                handleInputChange(rowIndex, colIndex, e.target.value);
                              } else {
                                setTableInputValues({
                                  ...tableInputValues,
                                  [`${rowIndex}-${colIndex}`]: e.target.value,
                                });
                              }
                            }}
                            onBlur={(e) => {
                              if (handleObservationBlur) {
                                handleObservationBlur(rowIndex, colIndex, e.target.value);
                              }
                              if (validateDecimalPlaces) {
                                validateDecimalPlaces(`${rowIndex}-${colIndex}`, e.target.value, point?.least_count_uuc);
                              }
                            }}
                          />
                        </td>
                      ))}

                      {/* Repeatability average (read-only) */}
                      <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                          value={calculateAverage(repeatabilityReadings.map((r, idx) => tableInputValues[`${rowIndex}-${idx + 7}`] ?? r), lc_dec, point?.least_count_uuc)}
                          readOnly
                        />
                      </td>

                      {/* Eccentricity readings */}
                      {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((colIndex) => (
                        <td key={colIndex} className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white">
                          <input
                            type="number"
                            step="any"
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={tableInputValues[`${rowIndex}-${colIndex}`] ?? row[colIndex] ?? ''}
                            onChange={(e) => {
                              if (handleInputChange) {
                                handleInputChange(rowIndex, colIndex, e.target.value);
                              } else {
                                setTableInputValues({
                                  ...tableInputValues,
                                  [`${rowIndex}-${colIndex}`]: e.target.value,
                                });
                              }
                            }}
                            onBlur={(e) => {
                              if (handleObservationBlur) {
                                handleObservationBlur(rowIndex, colIndex, e.target.value);
                              }
                              if (validateDecimalPlaces) {
                                validateDecimalPlaces(`${rowIndex}-${colIndex}`, e.target.value, point?.least_count_uuc);
                              }
                            }}
                          />
                        </td>
                      ))}

                      {/* Eccentricity calculation (read-only) */}
                      <td className="px-3 py-2 text-sm dark:text-white bg-gray-50 dark:bg-gray-700">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                          value={calculateEccentricity(eccentricityReadings.map((r, idx) => tableInputValues[`${rowIndex}-${idx + 13}`] ?? r), lc_dec)}
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
      )}
    </div>
  );
};

// Exported calculation functions for use in CalibrateStep3
export const calculateWBNValues = (rowData) => {
  const result = {};

  const rawWReadings = (rowData.slice(2, 5) || [])
    .filter((val) => val !== undefined && val !== null && String(val).trim() !== '' && !isNaN(parseFloat(val)))
    .map((val) => parseFloat(val));

  result.average = rawWReadings.length
    ? (rawWReadings.reduce((sum, val) => sum + val, 0) / rawWReadings.length).toFixed(3)
    : '';

  const nominalRaw = rowData[1];
  const hasNominal = nominalRaw !== undefined && nominalRaw !== null && String(nominalRaw).trim() !== '' && !isNaN(parseFloat(nominalRaw));
  const nominalValue = hasNominal ? parseFloat(nominalRaw) : null;

  result.error = (result.average !== '' && nominalValue !== null)
    ? (parseFloat(result.average) - nominalValue).toFixed(3)
    : '';

  const rawRReadings = (rowData.slice(7, 12) || [])
    .filter((val) => val !== undefined && val !== null && String(val).trim() !== '' && !isNaN(parseFloat(val)))
    .map((val) => parseFloat(val));

  result.averageuucr = rawRReadings.length
    ? (rawRReadings.reduce((sum, val) => sum + val, 0) / rawRReadings.length).toFixed(3)
    : '';

  const rawEReadings = (rowData.slice(13, 23) || [])
    .filter((val) => val !== undefined && val !== null && String(val).trim() !== '' && !isNaN(parseFloat(val)))
    .map((val) => parseFloat(val));

  if (rawEReadings.length > 0) {
    const max = Math.max(...rawEReadings);
    const min = Math.min(...rawEReadings);
    result.eccentricity = ((max - min) / 2).toFixed(3);
  } else {
    result.eccentricity = '';
  }
  return result;
};

export default ObservationWBN;
