const ObservationEXM = ({
  selectedTableData,
  tableInputValues,
  setTableInputValues,
  validateDecimalPlaces,
}) => {
  if (selectedTableData?.id !== 'observationexm') return null;

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

  const calculateAverage = (readings, lc_decimals, leastCount) => {
    const values = readings.filter(r => r !== '' && r !== null && r !== undefined)
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

  const getDecimalPlaces = (leastCount) => {
    if (!leastCount || leastCount === 'NA') return 0;
    const s = String(leastCount).trim();
    if (s.includes('.')) return s.split('.')[1].length;
    return 0;
  };

  const renderThermalCoeffSection = () => {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 uppercase">Thermal Coefficients</h3>
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-600">
          <table className="w-full text-sm border-collapse">
            <tbody className="bg-white dark:bg-gray-800">
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <td className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600" style={{ width: '30%' }}>
                  Thermal Coefficient of UUC
                </td>
                <td className="px-4 py-2 border-r border-gray-200 dark:border-gray-600" style={{ width: '20%' }}>
                  <input
                    type="number"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={tableInputValues['thermalcoffuuc'] ?? ''}
                    onChange={(e) => setTableInputValues({ ...tableInputValues, thermalcoffuuc: e.target.value })}
                    onBlur={(e) => {
                      if (validateDecimalPlaces) {
                        validateDecimalPlaces('thermalcoffuuc', e.target.value, 0.001);
                      }
                    }}
                    placeholder="Enter value"
                  />
                </td>
                <td className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600" style={{ width: '30%' }}>
                  Thermal Coefficient of Master
                </td>
                <td className="px-4 py-2" style={{ width: '20%' }}>
                  <input
                    type="number"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={tableInputValues['thermalcoffmaster'] ?? ''}
                    onChange={(e) => setTableInputValues({ ...tableInputValues, thermalcoffmaster: e.target.value })}
                    onBlur={(e) => {
                      if (validateDecimalPlaces) {
                        validateDecimalPlaces('thermalcoffmaster', e.target.value, 0.001);
                      }
                    }}
                    placeholder="Enter value"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (!selectedTableData.staticRows || selectedTableData.staticRows.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded">
        <p className="text-yellow-800 dark:text-yellow-200">No calibration points available for EXM Observation</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 uppercase">External Micrometer (EXM) Observations</h3>

      {renderThermalCoeffSection()}

      <div className="overflow-x-auto border border-gray-200 dark:border-gray-600">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Sr. No.</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Nominal/ Set Value</th>
              <th colSpan="5" className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Observation on UUC</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600">Average</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase">Error</th>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-600 border-b border-gray-300 dark:border-gray-600">
              <th colSpan="2" className="border-r border-gray-300 dark:border-gray-600"></th>
              {[1, 2, 3, 4, 5].map((i) => (
                <th key={i} className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                  Obs {i}
                </th>
              ))}
              <th colSpan="2" className="border-r border-gray-300 dark:border-gray-600"></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800">
            {selectedTableData.staticRows.map((row, rowIndex) => {
              const lc_dec = getDecimalPlaces(row[0]?.least_count || row[0]);
              const masterReading = row[1];
              const readings = [row[2], row[3], row[4], row[5], row[6]];

              const avgUuc = calculateAverage(
                readings.map(r => tableInputValues[`${rowIndex}-${readings.indexOf(r) + 2}`] ?? r),
                lc_dec,
                row[0]?.least_count || row[0]
              );

              const error = calculateError(avgUuc, masterReading, lc_dec);

              return (
                <tr key={rowIndex} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700 text-center font-medium">
                    {rowIndex + 1}
                  </td>
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                      value={row[1] ?? ''}
                      readOnly
                    />
                  </td>
                  {[2, 3, 4, 5, 6].map((colIndex) => (
                    <td key={colIndex} className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white">
                      <input
                        type="number"
                        step="any"
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={tableInputValues[`${rowIndex}-${colIndex}`] ?? row[colIndex] ?? ''}
                        onChange={(e) => setTableInputValues({
                          ...tableInputValues,
                          [`${rowIndex}-${colIndex}`]: e.target.value
                        })}
                        onBlur={(e) => {
                          if (validateDecimalPlaces) {
                            validateDecimalPlaces(`${rowIndex}-${colIndex}`, e.target.value, row[0]?.least_count);
                          }
                        }}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                      value={avgUuc}
                      readOnly
                    />
                  </td>
                  <td className="px-3 py-2 text-sm dark:text-white bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                      value={error}
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

// Exported calculation functions for use in CalibrateStep3
export const calculateEXMValues = (rowData) => {
  const result = {};
  const validReadings = rowData.slice(2, 7).filter((val) => val !== '' && val !== null && val !== undefined && !isNaN(parseFloat(val)));
  const obsNumbers = validReadings.map((val) => parseFloat(val));
  result.average = obsNumbers.length
    ? (obsNumbers.reduce((sum, val) => sum + val, 0) / obsNumbers.length).toFixed(3)
    : '';
  const nominalValue = parseFloat(rowData[1]);
  result.error = result.average && nominalValue !== undefined && !isNaN(nominalValue)
    ? (parseFloat(result.average) - nominalValue).toFixed(3)
    : '';
  return result;
};

export default ObservationEXM;
