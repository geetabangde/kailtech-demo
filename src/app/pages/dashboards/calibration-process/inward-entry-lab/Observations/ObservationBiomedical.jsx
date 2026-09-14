const ObservationBiomedical = ({
  selectedTableData,
  tableInputValues,
  isBiomedical,
  isVisualTestVisible,
  isBasicSafetyVisible,
  isElectricalSafetyVisible,
  isPerformanceVisible,
  visualTests,
  visualTestInputs,
  setVisualTestInputs,
  safetyTests,
  safetyTestInputs,
  setSafetyTestInputs,
  handleBiomedicalInputChange,
  handleBiomedicalInputBlur,
}) => {
  if (!isBiomedical) return null;

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

  const renderVisualInspection = () => {
    if (!isVisualTestVisible || !visualTests || visualTests.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-md font-medium text-gray-800 dark:text-white mb-4">Visual Inspection</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-2 border border-gray-300 dark:border-gray-600 font-medium text-gray-800 dark:text-white text-center">Description</th>
                <th className="p-2 border border-gray-300 dark:border-gray-600 font-medium text-gray-800 dark:text-white text-center">Observed Value / Remark</th>
              </tr>
            </thead>
            <tbody>
              {visualTests.map((test) => (
                <tr key={`visual-${test.id}`} className="dark:bg-gray-800">
                  <td className="p-2 border border-gray-300 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-700">
                    {test.description || test.name || ''}
                  </td>
                  <td className="p-2 border border-gray-300 dark:border-gray-600 dark:text-white">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={visualTestInputs[test.id] ?? ''}
                      onChange={(e) => setVisualTestInputs({ ...visualTestInputs, [test.id]: e.target.value })}
                      placeholder="Enter observation"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBasicSafetyTest = () => {
    if (!isBasicSafetyVisible || !safetyTests || safetyTests.length === 0) return null;

    const thCls = 'p-2 border border-gray-300 dark:border-gray-600 font-medium text-gray-800 dark:text-white text-center';
    const tdCls = 'p-2 border border-gray-300 dark:border-gray-600 dark:text-white';

    return (
      <div className="mb-8">
        <h2 className="text-md font-medium text-gray-800 dark:text-white mb-4">Basic Safety Test</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className={thCls}>Description</th>
                <th className={thCls}>Observed Value</th>
                <th className={thCls}>Specification</th>
              </tr>
            </thead>
            <tbody>
              {safetyTests.map((test) => (
                <tr key={`safety-${test.id}`} className="dark:bg-gray-800">
                  <td className={`${tdCls} bg-gray-50 dark:bg-gray-700`}>
                    {test.description || test.name || ''}
                  </td>
                  <td className={tdCls}>
                    <input
                      type="text"
                      className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={safetyTestInputs[test.id] ?? ''}
                      onChange={(e) => setSafetyTestInputs({ ...safetyTestInputs, [test.id]: e.target.value })}
                      placeholder="Enter value"
                    />
                  </td>
                  <td className={`${tdCls} bg-gray-50 dark:bg-gray-700`}>
                    {test.specification || test.range || ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBiomedicalTables = () => {
    if (!selectedTableData || !selectedTableData.calibration_points) return null;
    const points = selectedTableData.calibration_points;
    const measureSafety = points.filter(p => p.mode === 'Measure' && p.is_electrical_safety);
    const sourceSafety = points.filter(p => p.mode === 'Source' && p.is_electrical_safety);
    const measurePerf = points.filter(p => p.mode === 'Measure' && !p.is_electrical_safety);
    const sourcePerf = points.filter(p => p.mode === 'Source' && !p.is_electrical_safety);

    const renderTable = (title, tablePoints, masterCount, uucCount, showDevAndUnc, isSource = false) => {
      if (!tablePoints || tablePoints.length === 0) return null;

      const thCls = 'p-2 border border-gray-300 dark:border-gray-600 font-medium text-gray-800 dark:text-white text-center';
      const tdCls = 'p-2 border border-gray-300 dark:border-gray-600 dark:text-white';

      const renderMasterCells = (point, pointId) => {
        const isMasterReadOnly = point.mode === 'Measure';
        return Array.from({ length: masterCount }).map((_, i) => {
          const displayValue = isMasterReadOnly
            ? (point.master_readings?.[i]?.value ?? point.set_point ?? point.point ?? '')
            : (tableInputValues[`${pointId}-master-${i}`] ?? (point.master_readings?.[i]?.value ?? ''));
          return (
            <td key={`master-${i}`} className={tdCls}>
              <input type="hidden" name="calibrationpoint[]" value={pointId} />
              <input type="hidden" name="type[]" value="master" />
              <input type="hidden" name="repeatable[]" value={i} />
              <input
                type="text"
                name="value[]"
                className={`w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${isMasterReadOnly ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-600'}`}
                value={displayValue}
                readOnly={isMasterReadOnly}
                onChange={!isMasterReadOnly ? (e) => handleBiomedicalInputChange(pointId, 'master', i, e.target.value, masterCount, uucCount) : undefined}
                onBlur={!isMasterReadOnly ? (e) => handleBiomedicalInputBlur(pointId, 'master', i, e.target.value, masterCount, uucCount) : undefined}
              />
              <span className="ml-1 text-xs text-gray-500">{point.master_readings?.[i]?.unit || point.set_point_unit || point.unit || ''}</span>
            </td>
          );
        });
      };

      const renderUucCells = (point, pointId) => {
        const isUucReadOnly = point.mode === 'Source';
        return Array.from({ length: uucCount }).map((_, i) => {
          const displayValue = isUucReadOnly
            ? (point.uuc_readings?.[i]?.value ?? point.set_point ?? point.point ?? '')
            : (tableInputValues[`${pointId}-uuc-${i}`] ?? (point.uuc_readings?.[i]?.value ?? ''));
          return (
            <td key={`uuc-${i}`} className={tdCls}>
              <input type="hidden" name="calibrationpoint[]" value={pointId} />
              <input type="hidden" name="type[]" value="uuc" />
              <input type="hidden" name="repeatable[]" value={i} />
              <input
                type="text"
                name="value[]"
                className={`w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${isUucReadOnly ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-600'}`}
                value={displayValue}
                readOnly={isUucReadOnly}
                onChange={!isUucReadOnly ? (e) => handleBiomedicalInputChange(pointId, 'uuc', i, e.target.value, masterCount, uucCount) : undefined}
                onBlur={!isUucReadOnly ? (e) => handleBiomedicalInputBlur(pointId, 'uuc', i, e.target.value, masterCount, uucCount) : undefined}
              />
              <span className="ml-1 text-xs text-gray-500">{point.uuc_readings?.[i]?.unit || point.set_point_unit || point.unit || ''}</span>
            </td>
          );
        });
      };

      return (
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">{title}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className={thCls}>Parameter</th>
                  {showDevAndUnc && <th className={thCls}>Set Point</th>}
                  {isSource ? (
                    <>
                      {showDevAndUnc && uucCount > 0 && <th colSpan={uucCount} className={thCls}>Reading on UUC</th>}
                      {showDevAndUnc && uucCount > 1 && <th className={thCls}>Average On UUC</th>}
                      {masterCount > 0 && <th colSpan={masterCount} className={thCls}>Reading on Master</th>}
                      {masterCount > 1 && <th className={thCls}>Average On Master</th>}
                    </>
                  ) : (
                    <>
                      {showDevAndUnc && masterCount > 0 && <th colSpan={masterCount} className={thCls}>Reading on Master</th>}
                      {showDevAndUnc && masterCount > 1 && <th className={thCls}>Average On Master</th>}
                      {uucCount > 0 && <th colSpan={uucCount} className={thCls}>Reading on UUC</th>}
                      {uucCount > 1 && <th className={thCls}>Average On UUC</th>}
                    </>
                  )}
                  {showDevAndUnc && <th className={thCls}>Deviation</th>}
                  <th className={thCls}>Tolerance</th>
                </tr>
              </thead>
              <tbody>
                {tablePoints.map((point) => {
                  const pointId = point.id;
                  return (
                    <tr key={`bio-${pointId}`} className="dark:bg-gray-800">
                      <td className={`${tdCls} min-w-[180px]`}>
                        <input type="hidden" name="calibrationpoint[]" value={pointId} />
                        <input type="hidden" name="type[]" value="parameter" />
                        <input type="hidden" name="repeatable[]" value="0" />
                        <input type="text" name="value[]" title={tableInputValues[`${pointId}-parameter`] ?? (point.parameter || point.unittype || '')} className="w-full min-w-[160px] px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" value={tableInputValues[`${pointId}-parameter`] ?? (point.parameter || point.unittype || '')} readOnly />
                      </td>
                      {showDevAndUnc && (
                        <td className={tdCls}>
                          <input type="hidden" name="calibrationpoint[]" value={pointId} />
                          <input type="hidden" name="type[]" value="setpoint" />
                          <input type="hidden" name="repeatable[]" value="0" />
                          <input type="text" name="value[]" className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" value={point.set_point ?? point.point ?? ''} readOnly /> {point.set_point_unit ?? point.unit ?? ''}
                        </td>
                      )}
                      {isSource ? (
                        <>
                          {showDevAndUnc && renderUucCells(point, pointId)}
                          {showDevAndUnc && uucCount > 1 && (() => {
                            const isWaveform = (point.parameter || point.unittype || '').toLowerCase().includes('waveform');
                            const uucVal = tableInputValues[`${pointId}-averageuuc`] ?? point.average_uuc ?? '';
                            return (
                              <td className={tdCls}>
                                <input type="hidden" name="calibrationpoint[]" value={pointId} />
                                <input type="hidden" name="type[]" value="averageuuc" />
                                <input type="hidden" name="repeatable[]" value="0" />
                                <input
                                  type="text"
                                  name="value[]"
                                  className={`w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${isWaveform ? 'bg-white dark:bg-gray-600' : 'bg-gray-50 dark:bg-gray-700'}`}
                                  value={isWaveform ? uucVal : formatValueByLc(uucVal, point.lc_decimals, point.least_count)}
                                  readOnly={!isWaveform}
                                  onChange={isWaveform ? (e) => handleBiomedicalInputChange(pointId, 'averageuuc', 0, e.target.value, masterCount, uucCount) : undefined}
                                  onBlur={isWaveform ? (e) => handleBiomedicalInputBlur(pointId, 'averageuuc', 0, e.target.value, masterCount, uucCount) : undefined}
                                />
                                <span className="ml-1 text-xs text-gray-500">{point.unit || point.set_point_unit || ''}</span>
                              </td>
                            );
                          })()}
                          {renderMasterCells(point, pointId)}
                          {masterCount > 1 && (
                            <td className={tdCls}>
                              <input type="hidden" name="calibrationpoint[]" value={pointId} />
                              <input type="hidden" name="type[]" value="averagemaster" />
                              <input type="hidden" name="repeatable[]" value="0" />
                              <input type="text" name="value[]" className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" value={formatValueByLc(tableInputValues[`${pointId}-averagemaster`] ?? point.average_master, point.mlc_decimals, point.master_least_count)} readOnly />
                              <span className="ml-1 text-xs text-gray-500">{point.masterunit || point.set_point_unit || point.unit || ''}</span>
                            </td>
                          )}
                        </>
                      ) : (
                        <>
                          {showDevAndUnc && renderMasterCells(point, pointId)}
                          {showDevAndUnc && masterCount > 1 && (
                            <td className={tdCls}>
                              <input type="hidden" name="calibrationpoint[]" value={pointId} />
                              <input type="hidden" name="type[]" value="averagemaster" />
                              <input type="hidden" name="repeatable[]" value="0" />
                              <input type="text" name="value[]" className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" value={formatValueByLc(tableInputValues[`${pointId}-averagemaster`] ?? point.average_master, point.mlc_decimals, point.master_least_count)} readOnly />
                              <span className="ml-1 text-xs text-gray-500">{point.masterunit || point.set_point_unit || point.unit || ''}</span>
                            </td>
                          )}
                          {renderUucCells(point, pointId)}
                          {uucCount > 1 && (() => {
                            const isWaveform = (point.parameter || point.unittype || '').toLowerCase().includes('waveform');
                            const uucVal = tableInputValues[`${pointId}-averageuuc`] ?? point.average_uuc ?? '';
                            return (
                              <td className={tdCls}>
                                <input type="hidden" name="calibrationpoint[]" value={pointId} />
                                <input type="hidden" name="type[]" value="averageuuc" />
                                <input type="hidden" name="repeatable[]" value="0" />
                                <input
                                  type="text"
                                  name="value[]"
                                  className={`w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${isWaveform ? 'bg-white dark:bg-gray-600' : 'bg-gray-50 dark:bg-gray-700'}`}
                                  value={isWaveform ? uucVal : formatValueByLc(uucVal, point.lc_decimals, point.least_count)}
                                  readOnly={!isWaveform}
                                  onChange={isWaveform ? (e) => handleBiomedicalInputChange(pointId, 'averageuuc', 0, e.target.value, masterCount, uucCount) : undefined}
                                  onBlur={isWaveform ? (e) => handleBiomedicalInputBlur(pointId, 'averageuuc', 0, e.target.value, masterCount, uucCount) : undefined}
                                />
                                <span className="ml-1 text-xs text-gray-500">{point.unit || point.set_point_unit || ''}</span>
                              </td>
                            );
                          })()}
                        </>
                      )}
                      {showDevAndUnc && (() => {
                        const devVal = tableInputValues[`${pointId}-error`] ?? point.deviation;
                        const pLcDec = (point.lc_decimals != null && point.lc_decimals !== 'NA') ? parseInt(point.lc_decimals, 10) : 0;
                        const pMlcDec = (point.mlc_decimals != null && point.mlc_decimals !== 'NA') ? parseInt(point.mlc_decimals, 10) : 0;
                        const countDec = (v) => {
                          if (v == null || v === '') return 0;
                          const s = String(v).trim();
                          return s.includes('.') ? s.split('.')[1].length : 0;
                        };
                        const devDecimals = Math.max(pLcDec, pMlcDec, countDec(devVal));
                        return (
                          <td className={tdCls}>
                            <input type="hidden" name="calibrationpoint[]" value={pointId} />
                            <input type="hidden" name="type[]" value="error" />
                            <input type="hidden" name="repeatable[]" value="0" />
                            <input
                              type="text"
                              name="value[]"
                              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                              value={formatValueByLc(devVal, devDecimals)}
                              readOnly
                            />
                            <span className="ml-1 text-xs text-gray-500">{point.unit || point.set_point_unit || ''}</span>
                          </td>
                        );
                      })()}
                      {(() => {
                        const rawTol = point.tolerance ?? point.tolerance_value ?? point.specification ?? '';
                        const tolType = (point.tolerance_type || '').trim();
                        const formattedTolerance = tolType === '%' && rawTol && !String(rawTol).includes('%')
                          ? `${rawTol}%`
                          : String(rawTol || '');
                        return (
                          <td className={tdCls}>
                            <input type="hidden" name="calibrationpoint[]" value={pointId} />
                            <input type="hidden" name="type[]" value="specification" />
                            <input type="hidden" name="repeatable[]" value="0" />
                            <input
                              type="text"
                              name="value[]"
                              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                              value={tableInputValues[`${pointId}-specification`] ?? formattedTolerance}
                              onChange={(e) => handleBiomedicalInputChange(pointId, 'specification', 0, e.target.value, masterCount, uucCount)}
                              onBlur={(e) => handleBiomedicalInputBlur(pointId, 'specification', 0, e.target.value, masterCount, uucCount)}
                            />
                          </td>
                        );
                      })()}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {isElectricalSafetyVisible && measureSafety.length > 0 && renderTable("ELECTRICAL SAFETY TEST", measureSafety, 1, 5, false, false)}
        {isElectricalSafetyVisible && sourceSafety.length > 0 && renderTable("ELECTRICAL SAFETY TEST (Source)", sourceSafety, 5, 1, false, true)}
        {isPerformanceVisible && measurePerf.length > 0 && renderTable("PERFORMANCE TESTING", measurePerf, 1, 5, true, false)}
        {isPerformanceVisible && sourcePerf.length > 0 && renderTable("PERFORMANCE TESTING (Source)", sourcePerf, 5, 1, true, true)}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderVisualInspection()}
      {renderBasicSafetyTest()}
      {renderBiomedicalTables()}
    </div>
  );
};

export default ObservationBiomedical;
