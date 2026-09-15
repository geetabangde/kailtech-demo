import { useState } from 'react';


const ObservationWB = ({
  selectedTableData,
  tableInputValues,
  handleInputChange,
  handleObservationBlur,
  observationErrors,
  observations,
  diagram: parentDiagram,
  setDiagram: parentSetDiagram,
}) => {
  const [localDiagram, setLocalDiagram] = useState('circalimg');
  const diagram = parentDiagram || localDiagram;
  const setDiagram = parentSetDiagram || setLocalDiagram;

  if (selectedTableData?.id !== 'observationwb') return null;

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

  const weighingCount = selectedTableData.weighingCount || 0;
  const repeatabilityCount = selectedTableData.repeatabilityCount || 0;
  const eccentricityCount = selectedTableData.eccentricityCount || 0;

  if (!selectedTableData.staticRows || selectedTableData.staticRows.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded">
        <p className="text-yellow-800 dark:text-yellow-200">No calibration points available for WB Observation</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4 uppercase">Weighing Balance (WB) Observations</h3>

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

      {/* 1. Weighing Process Table */}
      {weighingCount > 0 && (
        <div>
          <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3 bg-blue-50 dark:bg-blue-900 p-2 rounded">
            Weighing Process
          </h4>
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-600">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Sr. No.
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Nominal Value
                  </th>
                  <th colSpan="3" className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Reading
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Average
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Error
                  </th>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-600 border-b border-gray-300 dark:border-gray-600">
                  <th className="border-r border-gray-300 dark:border-gray-600"></th>
                  <th className="border-r border-gray-300 dark:border-gray-600"></th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                    1
                  </th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                    2
                  </th>
                  <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                    3
                  </th>
                  <th className="border-r border-gray-300 dark:border-gray-600"></th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {selectedTableData.staticRows.slice(0, weighingCount).map((row, rowIndex) => {
                  const point = observations?.[rowIndex];
                  return (
                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {row.map((cell, colIndex) => {
                        const key = `${rowIndex}-${colIndex}`;
                        let currentValue = tableInputValues[key] ?? (cell?.toString() || '');

                        if ((colIndex === 5 || colIndex === 6) && point) {
                          const lc = point.least_count_uuc || point.least_count;
                          const decimals = point.lc_decimals;
                          currentValue = formatValueByLc(currentValue, decimals, lc);
                        }

                        const isDisabled = colIndex === 0 || colIndex === 1 || colIndex === 5 || colIndex === 6;

                        return (
                          <td key={colIndex} className="px-3 py-2 whitespace-nowrap text-sm border-r border-gray-200 dark:border-gray-600 last:border-r-0">
                            <input
                              type="text"
                              id={`obs-cell-${key}`}
                              data-cell-key={key}
                              className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-all ${
                                isDisabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'border-gray-200 dark:border-gray-600'
                              } ${observationErrors[key] ? 'border-red-500 ring-2 ring-red-400 dark:ring-red-700 bg-red-50 dark:bg-red-950/30' : ''}`}
                              value={currentValue}
                              onChange={(e) => {
                                if (isDisabled) return;
                                handleInputChange(rowIndex, colIndex, e.target.value);
                              }}
                              onBlur={(e) => {
                                if (isDisabled) return;
                                handleObservationBlur(rowIndex, colIndex, e.target.value);
                              }}
                              disabled={isDisabled}
                            />
                            {observationErrors[key] && (
                              <span className="text-red-500 text-xs block mt-1">{observationErrors[key]}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Repeatability Table */}
      {repeatabilityCount > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3 bg-blue-50 dark:bg-blue-900 p-2 rounded">
            Repeatability
          </h4>
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-600">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Nominal Value
                  </th>
                  <th colSpan="10" className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Reading on UUC
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Average
                  </th>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-600 border-b border-gray-300 dark:border-gray-600">
                  <th className="border-r border-gray-300 dark:border-gray-600"></th>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <th key={i} className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                      {i + 1}
                    </th>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {selectedTableData.staticRows.slice(weighingCount, weighingCount + repeatabilityCount).map((row, index) => {
                  const rowIndex = weighingCount + index;
                  return (
                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {row.map((cell, colIndex) => {
                        const key = `${rowIndex}-${colIndex}`;
                        const currentValue = tableInputValues[key] ?? (cell?.toString() || '');
                        const isDisabled = colIndex === 0 || colIndex === 11;

                        return (
                          <td key={colIndex} className="px-3 py-2 whitespace-nowrap text-sm border-r border-gray-200 dark:border-gray-600 last:border-r-0">
                            <input
                              type="text"
                              id={`obs-cell-${key}`}
                              data-cell-key={key}
                              className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-all ${
                                isDisabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'border-gray-200 dark:border-gray-600'
                              } ${observationErrors[key] ? 'border-red-500 ring-2 ring-red-400 dark:ring-red-700 bg-red-50 dark:bg-red-950/30' : ''}`}
                              value={currentValue}
                              onChange={(e) => {
                                if (isDisabled) return;
                                handleInputChange(rowIndex, colIndex, e.target.value);
                              }}
                              onBlur={(e) => {
                                if (isDisabled) return;
                                handleObservationBlur(rowIndex, colIndex, e.target.value);
                              }}
                              disabled={isDisabled}
                            />
                            {observationErrors[key] && (
                              <span className="text-red-500 text-xs block mt-1">{observationErrors[key]}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Eccentricity Table */}
      {eccentricityCount > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-3 bg-blue-50 dark:bg-blue-900 p-2 rounded">
            Eccentricity
          </h4>
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-600">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Nominal Value
                  </th>
                  <th colSpan="5" className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Reading on Clockwise
                  </th>
                  <th colSpan="5" className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600">
                    Reading on Anticlockwise
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    D=Ec (Max-Min)/2
                  </th>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-600 border-b border-gray-300 dark:border-gray-600">
                  <th className="border-r border-gray-300 dark:border-gray-600"></th>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <th key={i} className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                      {i + 1}
                    </th>
                  ))}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <th key={i + 5} className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                      {i + 1}
                    </th>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {selectedTableData.staticRows.slice(weighingCount + repeatabilityCount).map((row, index) => {
                  const rowIndex = weighingCount + repeatabilityCount + index;
                  return (
                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {row.map((cell, colIndex) => {
                        const key = `${rowIndex}-${colIndex}`;
                        const currentValue = tableInputValues[key] ?? (cell?.toString() || '');
                        const isDisabled = colIndex === 0 || colIndex === 11;

                        return (
                          <td key={colIndex} className="px-3 py-2 whitespace-nowrap text-sm border-r border-gray-200 dark:border-gray-600 last:border-r-0">
                            <input
                              type="text"
                              id={`obs-cell-${key}`}
                              data-cell-key={key}
                              className={`w-full px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-all ${
                                isDisabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'border-gray-200 dark:border-gray-600'
                              } ${observationErrors[key] ? 'border-red-500 ring-2 ring-red-400 dark:ring-red-700 bg-red-50 dark:bg-red-950/30' : ''}`}
                              value={currentValue}
                              onChange={(e) => {
                                if (isDisabled) return;
                                handleInputChange(rowIndex, colIndex, e.target.value);
                              }}
                              onBlur={(e) => {
                                if (isDisabled) return;
                                handleObservationBlur(rowIndex, colIndex, e.target.value);
                              }}
                              disabled={isDisabled}
                            />
                            {observationErrors[key] && (
                              <span className="text-red-500 text-xs block mt-1">{observationErrors[key]}</span>
                            )}
                          </td>
                        );
                      })}
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

// Exported calculation function for use in CalibrateStep3
export const calculateWBValues = (rowData, rowIndex, selectedTableData, instrument) => {
  const result = {};

  const weighingCount = selectedTableData?.weighingCount || 0;
  const repeatabilityCount = selectedTableData?.repeatabilityCount || 0;

  const getDecimalPlaces = (val) => {
    if (!val || val === 'NA') return 3;
    const str = val.toString();
    const parts = str.split('.');
    return parts.length > 1 ? parts[1].length : 0;
  };
  const decimalPlaces = getDecimalPlaces(instrument?.leastcount || '0.001');

  if (rowIndex < weighingCount) {
    const rawReadings = (rowData.slice(2, 5) || [])
      .filter((val) => val !== undefined && val !== null && String(val).trim() !== '' && !isNaN(parseFloat(val)))
      .map((val) => parseFloat(val));

    result.average = rawReadings.length
      ? (rawReadings.reduce((sum, val) => sum + val, 0) / rawReadings.length).toFixed(decimalPlaces)
      : '';

    const nominalRaw = rowData[1];
    const hasNominal = nominalRaw !== undefined && nominalRaw !== null && String(nominalRaw).trim() !== '' && !isNaN(parseFloat(nominalRaw));
    const nominal = hasNominal ? parseFloat(nominalRaw) : null;

    result.error = (result.average !== '' && nominal !== null)
      ? (parseFloat(result.average) - nominal).toFixed(decimalPlaces)
      : '';
  } else if (rowIndex < weighingCount + repeatabilityCount) {
    const rawReadings = (rowData.slice(1, 11) || [])
      .filter((val) => val !== undefined && val !== null && String(val).trim() !== '' && !isNaN(parseFloat(val)))
      .map((val) => parseFloat(val));

    result.average = rawReadings.length
      ? (rawReadings.reduce((sum, val) => sum + val, 0) / rawReadings.length).toFixed(decimalPlaces)
      : '';
  } else {
    const rawReadings = (rowData.slice(1, 11) || [])
      .filter((val) => val !== undefined && val !== null && String(val).trim() !== '' && !isNaN(parseFloat(val)))
      .map((val) => parseFloat(val));

    if (rawReadings.length > 0) {
      const maxVal = Math.max(...rawReadings);
      const minVal = Math.min(...rawReadings);
      result.eccentricity = ((maxVal - minVal) / 2).toFixed(decimalPlaces);
    } else {
      result.eccentricity = '';
    }
  }

  return result;
};

export default ObservationWB;
