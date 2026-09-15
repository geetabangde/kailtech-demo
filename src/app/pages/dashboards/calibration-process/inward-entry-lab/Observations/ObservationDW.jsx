import React, { useState, useEffect } from 'react';

const ObservationDW = ({
  tableInputValues = {},
  observations = [],
  isDW,
  instId,
  handleBiomedicalInputBlur,
}) => {
  const [dwValues, setDwValues] = useState({});
  const [envValues, setEnvValues] = useState({
    pressureStart: tableInputValues[`${instId}-pressure-start`] || '',
    pressureEnd: tableInputValues[`${instId}-pressure-end`] || '',
    stabilization: tableInputValues[`${instId}-stabilization`] || '',
  });

  useEffect(() => {
    console.log('📥 Syncing environment values from tableInputValues');
    setEnvValues({
      pressureStart: tableInputValues[`${instId}-pressure-start`] || '',
      pressureEnd: tableInputValues[`${instId}-pressure-end`] || '',
      stabilization: tableInputValues[`${instId}-stabilization`] || '',
    });
  }, [tableInputValues, instId]);

  const SIGDIG = 100000000;
  const getMasterLeastCount = () => '0.001';

  if (!isDW) return null;

  const calculateDeltaI = (s1, u1, u2, s2) => {
    const s1Val = parseFloat(s1) || 0;
    const u1Val = parseFloat(u1) || 0;
    const u2Val = parseFloat(u2) || 0;
    const s2Val = parseFloat(s2) || 0;

    const tempa = Math.floor((u1Val - s1Val) * SIGDIG) / SIGDIG;
    const tempb = Math.floor((u2Val - s2Val) * SIGDIG) / SIGDIG;
    const sum = tempa + tempb;
    const deltai = sum / 2;

    return isNaN(deltai) ? '' : deltai.toFixed(8);
  };

  const calculateAverageDeltaI = (pointId) => {
    const cycles = observations.find(p => p.pointid === pointId)?.cycles || [];
    let sum = 0;
    let count = 0;

    cycles.forEach((_, cycleIdx) => {
      const deltaKey = `${pointId}-delta-${cycleIdx}`;
      const deltaVal = parseFloat(dwValues[deltaKey] || 0);
      if (!isNaN(deltaVal)) {
        sum += deltaVal;
        count++;
      }
    });

    return count > 0 ? (sum / count).toFixed(8) : '';
  };

  const handleInputChange = (pointId, field, cycleIdx, value) => {
    const key = `${pointId}-${field}-${cycleIdx}`;
    setDwValues(prev => ({
      ...prev,
      [key]: value
    }));

    if (['s1', 'u1', 'u2', 's2'].includes(field)) {
      const s1 = field === 's1' ? value : dwValues[`${pointId}-s1-${cycleIdx}`];
      const u1 = field === 'u1' ? value : dwValues[`${pointId}-u1-${cycleIdx}`];
      const u2 = field === 'u2' ? value : dwValues[`${pointId}-u2-${cycleIdx}`];
      const s2 = field === 's2' ? value : dwValues[`${pointId}-s2-${cycleIdx}`];

      const delta = calculateDeltaI(s1, u1, u2, s2);
      setDwValues(prev => ({
        ...prev,
        [`${pointId}-delta-${cycleIdx}`]: delta
      }));
    }
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
              const pointId = point.pointid;
              const cycles = point.cycles || [];
              const repeatableCount = cycles.length;

              return (
                <React.Fragment key={`dw-point-${pointId}`}>
                  {cycles.map((cycle, cycleIndex) => {
                    const s1Key = `${pointId}-s1-${cycleIndex}`;
                    const u1Key = `${pointId}-u1-${cycleIndex}`;
                    const u2Key = `${pointId}-u2-${cycleIndex}`;
                    const s2Key = `${pointId}-s2-${cycleIndex}`;
                    const densityKey = `${pointId}-density-0`;
                    const deltaKey = `${pointId}-delta-${cycleIndex}`;

                    const s1Val = dwValues[s1Key] || cycle.S1 || '';
                    const u1Val = dwValues[u1Key] || cycle.U1 || '';
                    const u2Val = dwValues[u2Key] || cycle.U2 || '';
                    const s2Val = dwValues[s2Key] || cycle.S2 || '';
                    const densityVal = dwValues[densityKey] || point.density || '';
                    const deltaVal = dwValues[deltaKey] || cycle.Delta || '';

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
                              {point.nominal_value}
                            </td>
                            <td rowSpan={repeatableCount} className="border border-gray-300 dark:border-gray-600 p-2">
                              <input
                                type="number"
                                className="w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-600 dark:text-white"
                                value={densityVal}
                                onChange={(e) => handleInputChange(pointId, 'density', 0, e.target.value)}
                                onBlur={(e) => handleBiomedicalInputBlur(pointId, 'density', 0, e.target.value)}
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
                            onBlur={(e) => handleBiomedicalInputBlur(pointId, 'uuca', cycleIndex, e.target.value)}
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
                            onBlur={(e) => handleBiomedicalInputBlur(pointId, 'mastera', cycleIndex, e.target.value)}
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
                            onBlur={(e) => handleBiomedicalInputBlur(pointId, 'masterb', cycleIndex, e.target.value)}
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
                            onBlur={(e) => handleBiomedicalInputBlur(pointId, 'uucb', cycleIndex, e.target.value)}
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
                            type="number"
                            readOnly
                            className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 dark:text-white"
                            value={deltaVal}
                            step={masterLC}
                          />
                          <input type="hidden" name="calibrationpoint[]" value={pointId} />
                          <input type="hidden" name="type[]" value="deltai" />
                          <input type="hidden" name="repeatable[]" value={cycleIndex} />
                          <input type="hidden" name="value[]" value={deltaVal} />
                        </td>

                        {/* Average Delta I - Show only in first cycle */}
                        {cycleIndex === 0 && (
                          <td rowSpan={repeatableCount} className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-700">
                            <input
                              type="number"
                              readOnly
                              className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 dark:text-white"
                              value={calculateAverageDeltaI(pointId)}
                              step={masterLC}
                            />
                            <input type="hidden" name="calibrationpoint[]" value={pointId} />
                            <input type="hidden" name="type[]" value="average" />
                            <input type="hidden" name="repeatable[]" value="0" />
                            <input type="hidden" name="value[]" value={calculateAverageDeltaI(pointId)} />
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
                  onBlur={(e) => handleBiomedicalInputBlur(instId, 'pressure', 0, e.target.value)}
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
                  onBlur={(e) => handleBiomedicalInputBlur(instId, 'pressure', 1, e.target.value)}
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
                  onBlur={(e) => handleBiomedicalInputBlur(instId, 'stabilizationtime', 0, e.target.value)}
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
