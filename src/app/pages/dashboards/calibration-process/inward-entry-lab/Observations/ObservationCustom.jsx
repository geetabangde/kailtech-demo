const ObservationCustom = ({
  selectedTableData,
  instrument,
  tableInputValues,
  handleInputChange,
  handleObservationBlur,
}) => {
  if (!selectedTableData || selectedTableData.id !== 'observationcustom') return null;

  // ============================================================================
  // LAYOUT CALCULATION - Determines which columns are visible and their order
  // ============================================================================
  const getCustomLayoutIndices = () => {
    if (!instrument) return null;
    let colIdx = 1;

    // Parameter column
    let hasParameter = instrument.parametertoshow === 'Yes';
    let paramIdx = hasParameter ? colIdx++ : -1;

    // Specification column
    let hasSpecification = instrument.specificationtoshow === 'Yes';
    let specIdx = hasSpecification ? colIdx++ : -1;

    let masterdone = false;
    let uucdone = false;

    const masterCount = parseInt(instrument.master || 1);
    const uucCount = parseInt(instrument.uuc || 1);

    // Setpoint column
    let hasSetpoint = instrument.setpointtoshow === 'Yes';
    let setpointIdx = -1;

    if (hasSetpoint) {
      setpointIdx = colIdx++;
      if (instrument.setpoint === 'Master') {
        masterdone = true;
      } else if (instrument.setpoint === 'UUC') {
        uucdone = true;
      }
    }

    let masterObsIndices = [];
    let avgMasterIdx = -1;
    let uucObsIndices = [];
    let avgUucIdx = -1;

    const pushMaster = () => {
      for (let i = 0; i < masterCount; i++) masterObsIndices.push(colIdx++);
      if (masterCount > 1) avgMasterIdx = colIdx++;
      masterdone = true;
    };

    const pushUuc = () => {
      for (let i = 0; i < uucCount; i++) uucObsIndices.push(colIdx++);
      if (uucCount > 1) avgUucIdx = colIdx++;
      uucdone = true;
    };

    if (instrument.mastertoshow === 'Yes' && !masterdone && masterCount <= uucCount) {
      pushMaster();
    }

    if (instrument.uuctoshow === 'Yes' && !uucdone) {
      pushUuc();
    }

    if (instrument.mastertoshow === 'Yes' && !masterdone) {
      pushMaster();
    }

    // Error column
    let hasError = instrument.errortoshow === 'Yes';
    let errorIdx = hasError ? colIdx++ : -1;

    // Remark column
    let hasRemark = instrument.remarktoshow === 'Yes';
    let remarkIdx = hasRemark ? colIdx++ : -1;

    return {
      paramIdx,
      specIdx,
      setpointIdx,
      masterObsIndices,
      avgMasterIdx,
      uucObsIndices,
      avgUucIdx,
      errorIdx,
      remarkIdx,
      totalCols: colIdx,
      masterCount,
      uucCount,
    };
  };

  const layout = getCustomLayoutIndices();
  if (!layout) return null;

  // ============================================================================
  // RENDER CUSTOM OBSERVATION TABLE
  // ============================================================================
  if (!selectedTableData.staticRows || selectedTableData.staticRows.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded">
        <p className="text-yellow-800 dark:text-yellow-200">No calibration points available for Custom Observation</p>
      </div>
    );
  }

  return (
    <div className="mb-8 overflow-x-auto border border-gray-200 dark:border-gray-600">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600 min-w-12">
              Sr. No.
            </th>

            {layout.paramIdx !== -1 && (
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600 min-w-24">
                {instrument.parameterheading || 'Parameter'}
              </th>
            )}

            {layout.specIdx !== -1 && (
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600 min-w-24">
                {instrument.specificationheading || 'Specification'}
              </th>
            )}

            {layout.setpointIdx !== -1 && (
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600 min-w-20">
                {instrument.setpoint === 'Master'
                  ? instrument.masterheading || 'Master'
                  : instrument.setpoint === 'UUC'
                  ? instrument.uucheading || 'UUC'
                  : instrument.setpointheading || 'Set Point'}
              </th>
            )}

            {/* Master Observations Header */}
            {layout.masterObsIndices.length > 0 && (
              <th
                colSpan={layout.masterObsIndices.length + (layout.avgMasterIdx !== -1 ? 1 : 0)}
                className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600"
              >
                {instrument.masterheading || 'Master Observations'}
              </th>
            )}

            {/* UUC Observations Header */}
            {layout.uucObsIndices.length > 0 && (
              <th
                colSpan={layout.uucObsIndices.length + (layout.avgUucIdx !== -1 ? 1 : 0)}
                className="px-3 py-2 text-center text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600"
              >
                {instrument.uucheading || 'UUC Observations'}
              </th>
            )}

            {layout.errorIdx !== -1 && (
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase border-r border-gray-300 dark:border-gray-600 min-w-20">
                {instrument.errorheading || 'Error'}
              </th>
            )}

            {layout.remarkIdx !== -1 && (
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 uppercase min-w-20">
                {instrument.remarkheading || 'Remark'}
              </th>
            )}
          </tr>

          {/* Sub-headers row for observations */}
          {(layout.masterObsIndices.length > 0 || layout.uucObsIndices.length > 0) && (
            <tr className="bg-gray-50 dark:bg-gray-600 border-b border-gray-300 dark:border-gray-600">
              <th colSpan={1 + (layout.paramIdx !== -1 ? 1 : 0) + (layout.specIdx !== -1 ? 1 : 0) + (layout.setpointIdx !== -1 ? 1 : 0)}></th>

              {layout.masterObsIndices.map((idx, i) => (
                <th
                  key={`master-${i}`}
                  className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600"
                >
                  Obs {i + 1}
                </th>
              ))}

              {layout.avgMasterIdx !== -1 && (
                <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                  Avg
                </th>
              )}

              {layout.uucObsIndices.map((idx, i) => (
                <th
                  key={`uuc-${i}`}
                  className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600"
                >
                  Obs {i + 1}
                </th>
              ))}

              {layout.avgUucIdx !== -1 && (
                <th className="px-3 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                  Avg
                </th>
              )}
            </tr>
          )}
        </thead>

        <tbody className="bg-white dark:bg-gray-800">
          {selectedTableData.staticRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              {/* Sr. No. */}
              <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700 text-center font-medium">
                {rowIndex + 1}
              </td>

              {/* Parameter */}
              {layout.paramIdx !== -1 && (
                <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                    value={row[layout.paramIdx] ?? ''}
                    readOnly
                  />
                </td>
              )}

              {/* Specification */}
              {layout.specIdx !== -1 && (
                <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                    value={row[layout.specIdx] ?? ''}
                    readOnly
                  />
                </td>
              )}

              {/* Setpoint */}
              {layout.setpointIdx !== -1 && (
                <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                    value={row[layout.setpointIdx] ?? ''}
                    readOnly
                  />
                </td>
              )}

              {/* Master Observations */}
              {layout.masterObsIndices.map((colIdx, obsIdx) => (
                <td key={`master-${obsIdx}`} className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white">
                  <input
                    type="number"
                    step="any"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={tableInputValues[`${rowIndex}-${colIdx}`] ?? row[colIdx] ?? ''}
                    onChange={(e) => handleInputChange && handleInputChange(rowIndex, colIdx, e.target.value)}
                    onBlur={(e) => handleObservationBlur && handleObservationBlur(rowIndex, colIdx, e.target.value)}
                  />
                </td>
              ))}

              {/* Average Master */}
              {layout.avgMasterIdx !== -1 && (
                <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                    value={tableInputValues[`${rowIndex}-${layout.avgMasterIdx}`] ?? row[layout.avgMasterIdx] ?? ''}
                    readOnly
                  />
                </td>
              )}

              {/* UUC Observations */}
              {layout.uucObsIndices.map((colIdx, obsIdx) => (
                <td key={`uuc-${obsIdx}`} className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white">
                  <input
                    type="number"
                    step="any"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={tableInputValues[`${rowIndex}-${colIdx}`] ?? row[colIdx] ?? ''}
                    onChange={(e) => handleInputChange && handleInputChange(rowIndex, colIdx, e.target.value)}
                    onBlur={(e) => handleObservationBlur && handleObservationBlur(rowIndex, colIdx, e.target.value)}
                  />
                </td>
              ))}

              {/* Average UUC */}
              {layout.avgUucIdx !== -1 && (
                <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                    value={tableInputValues[`${rowIndex}-${layout.avgUucIdx}`] ?? row[layout.avgUucIdx] ?? ''}
                    readOnly
                  />
                </td>
              )}

              {/* Error */}
              {layout.errorIdx !== -1 && (
                <td className="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                    value={tableInputValues[`${rowIndex}-${layout.errorIdx}`] ?? row[layout.errorIdx] ?? ''}
                    readOnly
                  />
                </td>
              )}

              {/* Remark */}
              {layout.remarkIdx !== -1 && (
                <td className="px-3 py-2 text-sm dark:text-white">
                  <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={tableInputValues[`${rowIndex}-${layout.remarkIdx}`] ?? row[layout.remarkIdx] ?? ''}
                    onChange={(e) => handleInputChange && handleInputChange(rowIndex, layout.remarkIdx, e.target.value)}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Exported calculation function for use in CalibrateStep3
export const calculateCustomValues = (rowData, instrument) => {
  const result = {};

  const getCustomLayoutIndices = (inst) => {
    if (!inst) return null;
    let colIdx = 1;

    let hasParameter = inst.parametertoshow === 'Yes';
    let paramIdx = hasParameter ? colIdx++ : -1;

    let hasSpecification = inst.specificationtoshow === 'Yes';
    let specIdx = hasSpecification ? colIdx++ : -1;

    let masterdone = false;
    let uucdone = false;

    const masterCount = parseInt(inst.master || 1);
    const uucCount = parseInt(inst.uuc || 1);

    let hasSetpoint = inst.setpointtoshow === 'Yes';
    let setpointIdx = -1;

    if (hasSetpoint) {
      setpointIdx = colIdx++;
      if (inst.setpoint === 'Master') {
        masterdone = true;
      } else if (inst.setpoint === 'UUC') {
        uucdone = true;
      }
    }

    let masterObsIndices = [];
    let avgMasterIdx = -1;
    let uucObsIndices = [];
    let avgUucIdx = -1;

    const pushMaster = () => {
      for (let i = 0; i < masterCount; i++) masterObsIndices.push(colIdx++);
      if (masterCount > 1) avgMasterIdx = colIdx++;
      masterdone = true;
    };

    const pushUuc = () => {
      for (let i = 0; i < uucCount; i++) uucObsIndices.push(colIdx++);
      if (uucCount > 1) avgUucIdx = colIdx++;
      uucdone = true;
    };

    if (inst.mastertoshow === 'Yes' && !masterdone && masterCount <= uucCount) {
      pushMaster();
    }

    if (inst.uuctoshow === 'Yes' && !uucdone) {
      pushUuc();
    }

    if (inst.mastertoshow === 'Yes' && !masterdone) {
      pushMaster();
    }

    let hasError = inst.errortoshow === 'Yes';
    let errorIdx = hasError ? colIdx++ : -1;

    let hasRemark = inst.remarktoshow === 'Yes';
    let remarkIdx = hasRemark ? colIdx++ : -1;

    return {
      paramIdx,
      specIdx,
      setpointIdx,
      masterObsIndices,
      avgMasterIdx,
      uucObsIndices,
      avgUucIdx,
      errorIdx,
      remarkIdx,
      masterCount,
      uucCount,
    };
  };

  const layout = getCustomLayoutIndices(instrument);
  if (layout) {
    if (layout.masterObsIndices.length > 0) {
      const validMasterVals = layout.masterObsIndices
        .map(idx => (rowData[idx] !== undefined && rowData[idx] !== null && rowData[idx].toString().trim() !== '') ? parseFloat(rowData[idx]) : NaN)
        .filter(v => !isNaN(v));
      if (validMasterVals.length > 0 && validMasterVals.length === layout.masterObsIndices.length) {
        result.averagemaster = (validMasterVals.reduce((a, b) => a + b, 0) / validMasterVals.length).toFixed(4);
      } else {
        result.averagemaster = '';
      }
    }
    if (layout.uucObsIndices.length > 0) {
      const validUucVals = layout.uucObsIndices
        .map(idx => (rowData[idx] !== undefined && rowData[idx] !== null && rowData[idx].toString().trim() !== '') ? parseFloat(rowData[idx]) : NaN)
        .filter(v => !isNaN(v));
      if (validUucVals.length > 0 && validUucVals.length === layout.uucObsIndices.length) {
        result.averageuuc = (validUucVals.reduce((a, b) => a + b, 0) / validUucVals.length).toFixed(4);
      } else {
        result.averageuuc = '';
      }
    }

    let masterVal = null;
    if (result.averagemaster !== '' && result.averagemaster !== undefined) {
      masterVal = parseFloat(result.averagemaster);
    } else if (layout.masterObsIndices.length === 1) {
      const raw = rowData[layout.masterObsIndices[0]];
      if (raw !== undefined && raw !== null && raw.toString().trim() !== '') {
        const p = parseFloat(raw);
        if (!isNaN(p)) masterVal = p;
      }
    } else if (layout.setpointIdx !== -1 && instrument?.setpoint !== "UUC") {
      const raw = rowData[layout.setpointIdx];
      if (raw !== undefined && raw !== null && raw.toString().trim() !== '') {
        const p = parseFloat(raw);
        if (!isNaN(p)) masterVal = p;
      }
    }

    let uucVal = null;
    if (result.averageuuc !== '' && result.averageuuc !== undefined) {
      uucVal = parseFloat(result.averageuuc);
    } else if (layout.uucObsIndices.length === 1) {
      const raw = rowData[layout.uucObsIndices[0]];
      if (raw !== undefined && raw !== null && raw.toString().trim() !== '') {
        const p = parseFloat(raw);
        if (!isNaN(p)) uucVal = p;
      }
    } else if (layout.setpointIdx !== -1 && instrument?.setpoint === "UUC") {
      const raw = rowData[layout.setpointIdx];
      if (raw !== undefined && raw !== null && raw.toString().trim() !== '') {
        const p = parseFloat(raw);
        if (!isNaN(p)) uucVal = p;
      }
    }

    if (masterVal !== null && uucVal !== null && !isNaN(masterVal) && !isNaN(uucVal)) {
      result.error = (uucVal - masterVal).toFixed(4);
    } else {
      result.error = '';
    }
  }
  return result;
};

export default ObservationCustom;
