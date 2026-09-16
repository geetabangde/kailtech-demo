import React, { useState, useEffect } from 'react';

const ObservationDW = ({
  tableInputValues = {},
  setTableInputValues,
  formData = {},
  setFormData,
  observations = [],
  isDW,
  instId,
  handleBiomedicalInputBlur,
}) => {
  const [dwValues, setDwValues] = useState({});
  const [envValues, setEnvValues] = useState({
    pressureStart: tableInputValues[`${instId}-pressure-start`] ?? formData?.pressurestart ?? '',
    pressureEnd: tableInputValues[`${instId}-pressure-end`] ?? formData?.pressureend ?? '',
    stabilization: tableInputValues[`${instId}-stabilization`] ?? formData?.stabilizationtime ?? '',
  });

  useEffect(() => {
    console.log('📥 Syncing environment values from tableInputValues / formData');
    setEnvValues({
      pressureStart: tableInputValues[`${instId}-pressure-start`] ?? formData?.pressurestart ?? '',
      pressureEnd: tableInputValues[`${instId}-pressure-end`] ?? formData?.pressureend ?? '',
      stabilization: tableInputValues[`${instId}-stabilization`] ?? formData?.stabilizationtime ?? '',
    });
  }, [tableInputValues, formData?.pressurestart, formData?.pressureend, formData?.stabilizationtime, instId]);

  const SIGDIG = 100000000;
  const getMasterLeastCount = () => '0.001';

  if (!isDW) return null;

  const calculateDeltaI = (s1, u1, u2, s2) => {
    const s1Val = parseFloat(s1);
    const u1Val = parseFloat(u1);
    const u2Val = parseFloat(u2);
    const s2Val = parseFloat(s2);

    if (isNaN(s1Val) || isNaN(u1Val) || isNaN(u2Val) || isNaN(s2Val)) return '';

    const tempa = Math.floor((u1Val - s1Val) * SIGDIG) / SIGDIG;
    const tempb = Math.floor((u2Val - s2Val) * SIGDIG) / SIGDIG;
    const sum = tempa + tempb;
    const deltai = sum / 2;

    return isNaN(deltai) ? '' : deltai.toFixed(8);
  };

  const calculateAverageDeltaI = (pointId) => {
    const point = observations.find(p => String(p.pointid ?? p.point_id ?? p.point ?? '') === String(pointId));
    if (!point) return '';

    const cycles = point.cycles || [];
    let hasUserChanges = false;

    for (let cycleIdx = 0; cycleIdx < cycles.length; cycleIdx++) {
      if (
        dwValues[`${pointId}-s1-${cycleIdx}`] !== undefined ||
        dwValues[`${pointId}-u1-${cycleIdx}`] !== undefined ||
        dwValues[`${pointId}-u2-${cycleIdx}`] !== undefined ||
        dwValues[`${pointId}-s2-${cycleIdx}`] !== undefined ||
        dwValues[`${pointId}-delta-${cycleIdx}`] !== undefined
      ) {
        hasUserChanges = true;
        break;
      }
    }

    if (!hasUserChanges) {
      const apiAvg = point.average_diff ?? point.averagedeltai ?? point.average_deltai ?? point.avg_diff ?? point.average;
      if (apiAvg !== undefined && apiAvg !== null && apiAvg !== '') {
        return String(apiAvg);
      }
    }

    let sum = 0;
    let count = 0;

    cycles.forEach((cycle, cycleIdx) => {
      const deltaKey = `${pointId}-delta-${cycleIdx}`;
      let deltaValStr = dwValues[deltaKey];

      if (deltaValStr === undefined) {
        const s1 = dwValues[`${pointId}-s1-${cycleIdx}`] ?? cycle.S1 ?? cycle.s1 ?? cycle.uuca ?? '';
        const u1 = dwValues[`${pointId}-u1-${cycleIdx}`] ?? cycle.U1 ?? cycle.u1 ?? cycle.mastera ?? '';
        const u2 = dwValues[`${pointId}-u2-${cycleIdx}`] ?? cycle.U2 ?? cycle.u2 ?? cycle.masterb ?? '';
        const s2 = dwValues[`${pointId}-s2-${cycleIdx}`] ?? cycle.S2 ?? cycle.s2 ?? cycle.uucb ?? '';

        if (s1 !== '' && u1 !== '' && u2 !== '' && s2 !== '') {
          deltaValStr = calculateDeltaI(s1, u1, u2, s2);
        } else {
          deltaValStr = cycle.Delta ?? cycle.deltai ?? cycle.diff ?? '';
        }
      }

      const deltaVal = parseFloat(deltaValStr);
      if (!isNaN(deltaVal)) {
        sum += deltaVal;
        count++;
      }
    });

    if (count > 0) {
      const avg = sum / count;
      return isNaN(avg) ? '' : avg.toFixed(8);
    }

    const apiAvg = point.average_diff ?? point.averagedeltai ?? point.average_deltai ?? point.avg_diff ?? point.average;
    return apiAvg !== undefined && apiAvg !== null && apiAvg !== '' ? String(apiAvg) : '';
  };

  const handleInputChange = (pointId, field, cycleIdx, value) => {
    const key = `${pointId}-${field}-${cycleIdx}`;
    setDwValues(prev => {
      const updated = {
        ...prev,
        [key]: value
      };

      if (['s1', 'u1', 'u2', 's2'].includes(field)) {
        const point = observations.find(p => String(p.pointid ?? p.point_id ?? p.point ?? '') === String(pointId));
        const cycle = point?.cycles?.[cycleIdx] || {};

        const s1 = field === 's1' ? value : (updated[`${pointId}-s1-${cycleIdx}`] ?? cycle.S1 ?? cycle.s1 ?? cycle.uuca ?? '');
        const u1 = field === 'u1' ? value : (updated[`${pointId}-u1-${cycleIdx}`] ?? cycle.U1 ?? cycle.u1 ?? cycle.mastera ?? '');
        const u2 = field === 'u2' ? value : (updated[`${pointId}-u2-${cycleIdx}`] ?? cycle.U2 ?? cycle.u2 ?? cycle.masterb ?? '');
        const s2 = field === 's2' ? value : (updated[`${pointId}-s2-${cycleIdx}`] ?? cycle.S2 ?? cycle.s2 ?? cycle.uucb ?? '');

        const delta = calculateDeltaI(s1, u1, u2, s2);
        updated[`${pointId}-delta-${cycleIdx}`] = delta;
      }

      return updated;
    });
  };

  const renderReadingsTable = () => {
    if (!observations || observations.length === 0) return null;
    const masterLC = getMasterLeastCount();

    return (
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th rowSpan="2" className="border border-gray-300 dark:border-gray-600 p-2 font-medium">Sr No</th>
              <th rowSpan="2" className="border border-gray-300 dark:border-gray-600 p-2 font-medium">Cycle No</th>
              <th rowSpan="2" className="border border-gray-300 dark:border-gray-600 p-2 font-medium">Nominal Value (g)</th>
              <th rowSpan="2" className="border border-gray-300 dark:border-gray-600 p-2 font-medium">Density ρ (g/cm³)</th>
              <th colSpan="4" className="border border-gray-300 dark:border-gray-600 p-2 font-medium text-center">Measured Mass Value (g)</th>
              <th rowSpan="2" className="border border-gray-300 dark:border-gray-600 p-2 font-medium">Δi</th>
              <th rowSpan="2" className="border border-gray-300 dark:border-gray-600 p-2 font-medium">Avg Δi (g)</th>
            </tr>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border border-gray-300 dark:border-gray-600 p-2 font-medium">S1 (g)</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2 font-medium">U1 (g)</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2 font-medium">U2 (g)</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2 font-medium">S2 (g)</th>
            </tr>
          </thead>
          <tbody>
            {observations.map((point) => {
              const pointId = point.pointid ?? point.point_id ?? point.point;
              const cycles = point.cycles || [];
              const repeatableCount = cycles.length > 0 ? cycles.length : 1;
              const avgDiffVal = calculateAverageDeltaI(pointId);

              return (
                <React.Fragment key={`dw-point-${pointId}`}>
                  {cycles.map((cycle, cycleIndex) => {
                    const s1Key = `${pointId}-s1-${cycleIndex}`;
                    const u1Key = `${pointId}-u1-${cycleIndex}`;
                    const u2Key = `${pointId}-u2-${cycleIndex}`;
                    const s2Key = `${pointId}-s2-${cycleIndex}`;
                    const densityKey = `${pointId}-density-0`;
                    const deltaKey = `${pointId}-delta-${cycleIndex}`;

                    const s1Val = dwValues[s1Key] !== undefined ? dwValues[s1Key] : (cycle.S1 ?? cycle.s1 ?? cycle.uuca ?? '');
                    const u1Val = dwValues[u1Key] !== undefined ? dwValues[u1Key] : (cycle.U1 ?? cycle.u1 ?? cycle.mastera ?? '');
                    const u2Val = dwValues[u2Key] !== undefined ? dwValues[u2Key] : (cycle.U2 ?? cycle.u2 ?? cycle.masterb ?? '');
                    const s2Val = dwValues[s2Key] !== undefined ? dwValues[s2Key] : (cycle.S2 ?? cycle.s2 ?? cycle.uucb ?? '');
                    const densityVal = dwValues[densityKey] !== undefined ? dwValues[densityKey] : (point.density ?? '');
                    const deltaVal = dwValues[deltaKey] !== undefined ? dwValues[deltaKey] : (cycle.Delta ?? cycle.deltai ?? cycle.diff ?? '');

                    return (
                      <tr key={`dw-cycle-${pointId}-${cycleIndex}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        {cycleIndex === 0 && (
                          <>
                            <td rowSpan={repeatableCount} className="border border-gray-300 dark:border-gray-600 p-2 text-center font-medium">
                              {point.sr_no}
                            </td>
                          </>
                        )}

                        <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">{cycle.cycle_no}</td>

                        {cycleIndex === 0 && (
                          <>
                            <td rowSpan={repeatableCount} className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                              {point.nominal_value ?? point.calibration_point ?? point.point}
                            </td>
                            <td rowSpan={repeatableCount} className="border border-gray-300 dark:border-gray-600 p-2">
                              <input
                                type="number"
                                className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-600 dark:text-white"
                                value={densityVal}
                                onChange={(e) => handleInputChange(pointId, 'density', 0, e.target.value)}
                                onBlur={(e) => handleBiomedicalInputBlur && handleBiomedicalInputBlur(pointId, 'density', 0, e.target.value)}
                                placeholder="Enter density"
                                step={masterLC}
                              />
                            </td>
                          </>
                        )}

                        {/* S1 (uuca) - Editable */}
                        <td className="border border-gray-300 dark:border-gray-600 p-2">
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-600 dark:text-white"
                            value={s1Val}
                            onChange={(e) => handleInputChange(pointId, 's1', cycleIndex, e.target.value)}
                            onBlur={(e) => handleBiomedicalInputBlur && handleBiomedicalInputBlur(pointId, 'uuca', cycleIndex, e.target.value)}
                            step={masterLC}
                            placeholder={`Min: ${masterLC}`}
                          />
                          <input type="hidden" name="calibrationpoint[]" value={pointId} />
                          <input type="hidden" name="type[]" value="uuca" />
                          <input type="hidden" name="repeatable[]" value={cycleIndex} />
                          <input type="hidden" name="value[]" value={s1Val} />
                        </td>

                        {/* U1 (mastera) - Editable */}
                        <td className="border border-gray-300 dark:border-gray-600 p-2">
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-600 dark:text-white"
                            value={u1Val}
                            onChange={(e) => handleInputChange(pointId, 'u1', cycleIndex, e.target.value)}
                            onBlur={(e) => handleBiomedicalInputBlur && handleBiomedicalInputBlur(pointId, 'mastera', cycleIndex, e.target.value)}
                            step={masterLC}
                            placeholder={`Min: ${masterLC}`}
                          />
                          <input type="hidden" name="calibrationpoint[]" value={pointId} />
                          <input type="hidden" name="type[]" value="mastera" />
                          <input type="hidden" name="repeatable[]" value={cycleIndex} />
                          <input type="hidden" name="value[]" value={u1Val} />
                        </td>

                        {/* U2 (masterb) - Editable */}
                        <td className="border border-gray-300 dark:border-gray-600 p-2">
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-600 dark:text-white"
                            value={u2Val}
                            onChange={(e) => handleInputChange(pointId, 'u2', cycleIndex, e.target.value)}
                            onBlur={(e) => handleBiomedicalInputBlur && handleBiomedicalInputBlur(pointId, 'masterb', cycleIndex, e.target.value)}
                            step={masterLC}
                            placeholder={`Min: ${masterLC}`}
                          />
                          <input type="hidden" name="calibrationpoint[]" value={pointId} />
                          <input type="hidden" name="type[]" value="masterb" />
                          <input type="hidden" name="repeatable[]" value={cycleIndex} />
                          <input type="hidden" name="value[]" value={u2Val} />
                        </td>

                        {/* S2 (uucb) - Editable */}
                        <td className="border border-gray-300 dark:border-gray-600 p-2">
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-600 dark:text-white"
                            value={s2Val}
                            onChange={(e) => handleInputChange(pointId, 's2', cycleIndex, e.target.value)}
                            onBlur={(e) => handleBiomedicalInputBlur && handleBiomedicalInputBlur(pointId, 'uucb', cycleIndex, e.target.value)}
                            step={masterLC}
                            placeholder={`Min: ${masterLC}`}
                          />
                          <input type="hidden" name="calibrationpoint[]" value={pointId} />
                          <input type="hidden" name="type[]" value="uucb" />
                          <input type="hidden" name="repeatable[]" value={cycleIndex} />
                          <input type="hidden" name="value[]" value={s2Val} />
                        </td>

                        {/* Delta I - Calculated (readonly) */}
                        <td className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-700">
                          <input
                            type="text"
                            readOnly
                            className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none"
                            value={deltaVal}
                          />
                          <input type="hidden" name="calibrationpoint[]" value={pointId} />
                          <input type="hidden" name="type[]" value="deltai" />
                          <input type="hidden" name="repeatable[]" value={cycleIndex} />
                          <input type="hidden" name="value[]" value={deltaVal} />
                        </td>

                        {/* Average Delta I - Show only in first cycle */}
                        {cycleIndex === 0 && (
                          <td rowSpan={repeatableCount} className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-700 text-center font-medium">
                            <input
                              type="text"
                              readOnly
                              className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 dark:text-white text-center font-medium focus:outline-none"
                              value={avgDiffVal}
                            />
                            <input type="hidden" name="calibrationpoint[]" value={pointId} />
                            <input type="hidden" name="type[]" value="average" />
                            <input type="hidden" name="repeatable[]" value="0" />
                            <input type="hidden" name="value[]" value={avgDiffVal} />
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderEnvironmentTable = () => {
    if (!observations || observations.length === 0 || !instId) return null;

    const handleEnvChange = (field, value) => {
      setEnvValues(prev => ({
        ...prev,
        [field]: value,
      }));

      if (setTableInputValues) {
        const tableKeyMap = {
          pressureStart: `${instId}-pressure-start`,
          pressureEnd: `${instId}-pressure-end`,
          stabilization: `${instId}-stabilization`,
        };
        const tableKey = tableKeyMap[field];
        if (tableKey) {
          setTableInputValues(prev => ({
            ...prev,
            [tableKey]: value,
          }));
        }
      }

      if (setFormData) {
        const formKeyMap = {
          pressureStart: 'pressurestart',
          pressureEnd: 'pressureend',
          stabilization: 'stabilizationtime',
        };
        const formKey = formKeyMap[field];
        if (formKey) {
          setFormData(prev => ({
            ...prev,
            [formKey]: value,
          }));
        }
      }

      console.log(`🌐 ${field} changed to:`, value);
    };

    console.log('🌐 Environment table - instId:', instId);
    console.log('📊 Environment state values:', envValues);

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
          <tbody>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="border border-gray-300 dark:border-gray-600 p-2 font-medium w-1/3">Pressure Start (hPa)</td>
              <td className="border border-gray-300 dark:border-gray-600 p-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={envValues.pressureStart}
                  onChange={(e) => handleEnvChange('pressureStart', e.target.value)}
                  onBlur={(e) => handleBiomedicalInputBlur && handleBiomedicalInputBlur(instId, 'pressure', 0, e.target.value)}
                  placeholder="Enter pressure start"
                />
                <input type="hidden" name="calibrationpoint[]" value={instId} />
                <input type="hidden" name="type[]" value="pressure" />
                <input type="hidden" name="repeatable[]" value="0" />
                <input type="hidden" name="value[]" value={envValues.pressureStart} />
              </td>
              <td className="border border-gray-300 dark:border-gray-600 p-2 font-medium w-1/3">Pressure End (hPa)</td>
              <td className="border border-gray-300 dark:border-gray-600 p-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={envValues.pressureEnd}
                  onChange={(e) => handleEnvChange('pressureEnd', e.target.value)}
                  onBlur={(e) => handleBiomedicalInputBlur && handleBiomedicalInputBlur(instId, 'pressure', 1, e.target.value)}
                  placeholder="Enter pressure end"
                />
                <input type="hidden" name="calibrationpoint[]" value={instId} />
                <input type="hidden" name="type[]" value="pressure" />
                <input type="hidden" name="repeatable[]" value="1" />
                <input type="hidden" name="value[]" value={envValues.pressureEnd} />
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="border border-gray-300 dark:border-gray-600 p-2 font-medium">Thermal Stabilization (hours)</td>
              <td colSpan="3" className="border border-gray-300 dark:border-gray-600 p-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={envValues.stabilization}
                  onChange={(e) => handleEnvChange('stabilization', e.target.value)}
                  onBlur={(e) => handleBiomedicalInputBlur && handleBiomedicalInputBlur(instId, 'stabilizationtime', 0, e.target.value)}
                  placeholder="Enter stabilization time"
                />
                <input type="hidden" name="calibrationpoint[]" value={instId} />
                <input type="hidden" name="type[]" value="stabilizationtime" />
                <input type="hidden" name="repeatable[]" value="0" />
                <input type="hidden" name="value[]" value={envValues.stabilization} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Dead Weight Tester (DW) Observations</h2>

      {renderReadingsTable()}

      <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4 mt-6">Environmental Conditions</h3>
      {renderEnvironmentTable()}
    </div>
  );
};

export default ObservationDW;