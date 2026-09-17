import { safeGetValue, formatValueByLc } from './viewRawDataUtils';

export const BiomedicalTable = ({ biomedicalRawData, dynamicObservations }) => {
  const config = biomedicalRawData?.config || {};
  const isEnabled = (value) => String(value || '').toLowerCase() === 'yes';
  const showElectricalSafety = isEnabled(config.show_electrical_safety);
  const visualTests = isEnabled(config.show_visual_test) ? biomedicalRawData?.visual_test || [] : [];
  const basicSafety = isEnabled(config.show_basic_safety) ? biomedicalRawData?.basic_safety || [] : [];
  const groups = [
    ['Electrical Safety', 'Measure'],
    ['Electrical Safety', 'Source'],
    ['Performance Test', 'Measure'],
    ['Performance Test', 'Source'],
  ];

  const formatWithUnit = (val, decimals, leastCount, unit) => {
    const raw = safeGetValue(val);
    if (raw === null || raw === undefined || raw === '' || raw === 'NA' || raw === 'na') return '';
    const formatted = formatValueByLc(raw, decimals, leastCount);
    return unit ? `${formatted} ${unit}`.trim() : formatted;
  };

  // Recalculate average from readings array (ignores stored value to avoid backend rounding errors)
  const calcAvgFromReadings = (readings, decimals) => {
    if (!Array.isArray(readings) || readings.length === 0) return null;
    let sum = 0;
    let count = 0;
    let maxReadingDec = 0;

    readings.forEach((r) => {
      const v = typeof r === 'object' && r !== null ? r.value : r;
      if (v !== null && v !== undefined && v !== '') {
        const str = String(v).trim();
        if (str.includes('.')) {
          const dec = str.split('.')[1].length;
          if (dec > maxReadingDec) maxReadingDec = dec;
        }
        const n = parseFloat(str);
        if (!isNaN(n)) { sum += n; count++; }
      }
    });
    if (count === 0) return null;
    const avg = sum / count;
    let d = (decimals != null && decimals !== 'NA' && decimals !== '') ? parseInt(decimals, 10) : null;
    if (d === null || isNaN(d)) {
      d = maxReadingDec;
    } else {
      d = Math.max(d, maxReadingDec);
    }

    return d > 0 ? avg.toFixed(d) : (avg % 1 === 0 ? String(avg) : String(parseFloat(avg.toFixed(4))));
  };

  return (
    <div className="space-y-6">
      {visualTests.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th colSpan="2" className="border border-gray-300 px-3 py-2 text-left">VISUAL INSPECTION</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left">Description</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Remark</th>
              </tr>
            </thead>
            <tbody>
              {visualTests.filter((item) => String(item?.value ?? item?.remark ?? '').toLowerCase() !== 'na').map((item, index) => (
                <tr key={item?.id ?? index}>
                  <td className="border border-gray-300 px-3 py-2">{safeGetValue(item?.description)}</td>
                  <td className="border border-gray-300 px-3 py-2">{safeGetValue(item?.value ?? item?.remark)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {basicSafety.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th colSpan="2" className="border border-gray-300 px-3 py-2 text-left">BASIC SAFETY TEST</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left">Description</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Observed Value</th>
              </tr>
            </thead>
            <tbody>
              {basicSafety.filter((item) => String(item?.value ?? '').toLowerCase() !== 'na').map((item, index) => (
                <tr key={item?.id ?? index}>
                  <td className="border border-gray-300 px-3 py-2">{safeGetValue(item?.description)}</td>
                  <td className="border border-gray-300 px-3 py-2">{safeGetValue(item?.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {groups.map(([section, mode]) => {
        const points = (dynamicObservations || []).filter(
          (point) => point.biomedical_section === section && point.mode === mode
        );
        if (points.length === 0) return null;

        const isMeasure = mode === 'Measure';
        const isElectricalGroup = section === 'Electrical Safety';
        const showSetPointAndDeviation = !isElectricalGroup || !showElectricalSafety;
        const showUncertaintyAndRemark = isElectricalGroup && mode === 'Source' && !showElectricalSafety;
        const masterCount = isMeasure ? 1 : 5;
        const uucCount = isMeasure ? 5 : 1;

        const tableTitle = isElectricalGroup
          ? (showElectricalSafety ? 'ELECTRICAL SAFETY TEST' : ' PERFORMANCE TESTING')
          : 'PERFORMANCE TESTING';

        return (
          <div key={`${section}-${mode}`} className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th colSpan="13" className="border border-gray-300 px-3 py-2 text-left font-bold">
                    {tableTitle}
                  </th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left">Parameter</th>
                  {showSetPointAndDeviation && (
                    <th className="border border-gray-300 px-3 py-2 text-left">Set Point</th>
                  )}
                  {isMeasure ? (
                    <>
                      {showSetPointAndDeviation && (
                        <th colSpan={masterCount} className="border border-gray-300 px-3 py-2 text-center">Reading on Master</th>
                      )}
                      {masterCount > 1 && (
                        <th className="border border-gray-300 px-3 py-2 text-left">Average on Master</th>
                      )}
                      <th colSpan={uucCount} className="border border-gray-300 px-3 py-2 text-center">Reading on UUC</th>
                      {uucCount > 1 && (
                        <th className="border border-gray-300 px-3 py-2 text-left">Average on UUC</th>
                      )}
                    </>
                  ) : (
                    <>
                      {showSetPointAndDeviation && (
                        <th colSpan={uucCount} className="border border-gray-300 px-3 py-2 text-center">Reading on UUC</th>
                      )}
                      {showSetPointAndDeviation && uucCount > 1 && (
                        <th className="border border-gray-300 px-3 py-2 text-left">Average on UUC</th>
                      )}
                      <th colSpan={masterCount} className="border border-gray-300 px-3 py-2 text-center">Reading on Master</th>
                      {masterCount > 1 && (
                        <th className="border border-gray-300 px-3 py-2 text-left">Average on Master</th>
                      )}
                    </>
                  )}
                  {showSetPointAndDeviation && (
                    <th className="border border-gray-300 px-3 py-2 text-left">Deviation</th>
                  )}
                  <th className="border border-gray-300 px-3 py-2 text-left">Tolerance</th>
                  {showUncertaintyAndRemark && (
                    <th className="border border-gray-300 px-3 py-2 text-left">Expanded Uncertainty</th>
                  )}
                  {showUncertaintyAndRemark && (
                    <th className="border border-gray-300 px-3 py-2 text-left">Remark</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {points.map((point, index) => {
                  const pointUucUnit = point.uuc_readings?.[0]?.unit || point.uuc_unit || point.unit || point.set_point_unit || '';
                  const pointMasterUnit = point.master_readings?.[0]?.unit || point.master_unit || point.masterunit || point.set_point_unit || '';
                  const setPointUnit = point.set_point_unit || pointUucUnit || '';

                  return (
                    <tr key={point.calibration_point_id ?? index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-3 py-2">{safeGetValue(point.parameter)}</td>
                      {showSetPointAndDeviation && (
                        <td className="border border-gray-300 px-3 py-2">
                          {formatWithUnit(point.set_point, isMeasure ? point.lc_decimals : point.mlc_decimals, isMeasure ? point.least_count : point.master_least_count, setPointUnit)}
                        </td>
                      )}
                      {isMeasure ? (
                        <>
                          {showSetPointAndDeviation && (
                            <td className="border border-gray-300 px-3 py-2">
                              {formatWithUnit(point.set_point, point.mlc_decimals, point.master_least_count, pointMasterUnit)}
                            </td>
                          )}
                          {masterCount > 1 && (
                            <td className="border border-gray-300 px-3 py-2">
                              {formatWithUnit(calcAvgFromReadings(point.master_readings, point.mlc_decimals) ?? point.average_master, point.mlc_decimals, null, pointMasterUnit)}
                            </td>
                          )}
                          {Array.from({ length: uucCount }, (_, readingIndex) => {
                            const r = point.uuc_readings?.[readingIndex];
                            const raw = typeof r === 'object' && r !== null ? r.value : r;
                            const rUnit = (typeof r === 'object' && r?.unit) || pointUucUnit;
                            return (
                              <td key={`uuc-${readingIndex}`} className="border border-gray-300 px-3 py-2">
                                {formatWithUnit(raw, point.lc_decimals, point.least_count, rUnit)}
                              </td>
                            );
                          })}
                          {uucCount > 1 && (
                            <td className="border border-gray-300 px-3 py-2">
                              {formatWithUnit(calcAvgFromReadings(point.uuc_readings, point.lc_decimals) ?? point.average_uuc, point.lc_decimals, null, pointUucUnit)}
                            </td>
                          )}
                        </>
                      ) : (
                        <>
                          {showSetPointAndDeviation && (
                            <td className="border border-gray-300 px-3 py-2">
                              {formatWithUnit(point.set_point, point.lc_decimals, point.least_count, pointUucUnit)}
                            </td>
                          )}
                          {showSetPointAndDeviation && uucCount > 1 && (
                            <td className="border border-gray-300 px-3 py-2">
                              {formatWithUnit(point.average_uuc, point.lc_decimals, point.least_count, pointUucUnit)}
                            </td>
                          )}
                          {Array.from({ length: masterCount }, (_, readingIndex) => {
                            const r = point.master_readings?.[readingIndex];
                            const raw = typeof r === 'object' && r !== null ? r.value : r;
                            const rUnit = (typeof r === 'object' && r?.unit) || pointMasterUnit;
                            return (
                              <td key={`master-${readingIndex}`} className="border border-gray-300 px-3 py-2">
                                {formatWithUnit(raw, point.mlc_decimals, point.master_least_count, rUnit)}
                              </td>
                            );
                          })}
                          {masterCount > 1 && (
                            <td className="border border-gray-300 px-3 py-2">
                              {formatWithUnit(calcAvgFromReadings(point.master_readings, point.mlc_decimals) ?? point.average_master, point.mlc_decimals, null, pointMasterUnit)}
                            </td>
                          )}
                        </>
                      )}
                      {showSetPointAndDeviation && (
                        <td className="border border-gray-300 px-3 py-2">
                          {formatWithUnit(
                            point.deviation,
                            Math.max(
                              (point.lc_decimals != null && point.lc_decimals !== 'NA') ? parseInt(point.lc_decimals, 10) : 0,
                              (point.mlc_decimals != null && point.mlc_decimals !== 'NA') ? parseInt(point.mlc_decimals, 10) : 0
                            ),
                            point.least_count,
                            pointUucUnit
                          )}
                        </td>
                      )}
                      <td className="border border-gray-300 px-3 py-2">{safeGetValue(point.tolerance)}</td>
                      {showUncertaintyAndRemark && (
                        <td className="border border-gray-300 px-3 py-2">{safeGetValue(point.expanded_uncertainty)}</td>
                      )}
                      {showUncertaintyAndRemark && (
                        <td className="border border-gray-300 px-3 py-2">{safeGetValue(point.remark)}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default BiomedicalTable;
