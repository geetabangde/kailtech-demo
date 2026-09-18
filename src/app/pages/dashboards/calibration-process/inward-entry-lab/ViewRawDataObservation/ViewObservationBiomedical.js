import { safeGetArray, safeGetValue, formatValueByLc } from './viewRawDataUtils';
export { BiomedicalTable } from './BiomedicalTable';

export const biomedicalTableConfig = {
  id: 'observationbiomedical',
  name: 'Biomedical Observation',
  category: 'Biomedical',
  structure: {
    singleHeaders: ['Sr. No.', 'Parameter', 'Mode', 'Set Point'],
    subHeaders: {
      'Reading on UUC': ['1', '2', '3', '4', '5'],
      'Reading on Master': ['1', '2', '3', '4', '5'],
    },
    remainingHeaders: ['Average UUC', 'Average Master', 'Deviation', 'Tolerance', 'Expanded Uncertainty', 'Remark'],
  },
};

export const createBiomedicalRows = (dataArray) => {
  const rows = [];
  dataArray.forEach((point, index) => {
    const uucReadings = safeGetArray(point?.uuc_readings, 5);
    const masterReadings = safeGetArray(point?.master_readings, 5);

    rows.push([
      (index + 1).toString(),
      safeGetValue(point?.parameter),
      safeGetValue(point?.mode),
      `${safeGetValue(point?.set_point)}${point?.set_point_unit ? ` ${point.set_point_unit}` : ''}`,
      ...Array.from({ length: 5 }, (_, readingIndex) => formatValueByLc(uucReadings[readingIndex], point?.lc_decimals, point?.least_count)),
      ...Array.from({ length: 5 }, (_, readingIndex) => formatValueByLc(masterReadings[readingIndex], point?.mlc_decimals, point?.master_least_count)),
      formatValueByLc(point?.average_uuc, point?.lc_decimals, point?.least_count),
      formatValueByLc(point?.average_master, point?.mlc_decimals, point?.master_least_count),
      formatValueByLc(point?.deviation, point?.lc_decimals, point?.least_count),
      safeGetValue(point?.tolerance),
      safeGetValue(point?.expanded_uncertainty),
      safeGetValue(point?.remark),
    ]);
  });
  return rows;
};

export const parseBiomedicalDynamicData = (observationData) => {
  const formatPoints = (points, mode, section) => (
    Array.isArray(points)
      ? points.map((point) => {
          let effectiveLc = point.least_count;
          let effectiveLcDec = (point.lc_decimals != null && point.lc_decimals !== 'NA' && point.lc_decimals !== '') ? parseInt(point.lc_decimals, 10) : null;

          const mlc = point.master_least_count;
          const mlcDec = (point.mlc_decimals != null && point.mlc_decimals !== 'NA' && point.mlc_decimals !== '') ? parseInt(point.mlc_decimals, 10) : null;

          if (mlc && mlc !== 'NA') {
            const numLc = parseFloat(effectiveLc);
            if (!effectiveLc || effectiveLc === 'NA' || isNaN(numLc)) {
              effectiveLc = mlc;
              effectiveLcDec = mlcDec;
            }
          }

          return {
            ...point,
            mode,
            biomedical_section: section,
            least_count: effectiveLc ?? point.least_count,
            lc_decimals: effectiveLcDec ?? point.lc_decimals,
          };
        })
      : []
  );

  return [
    ...formatPoints(observationData.performance_test?.measure, 'Measure', 'Performance Test'),
    ...formatPoints(observationData.performance_test?.source, 'Source', 'Performance Test'),
    ...formatPoints(observationData.electrical_safety?.measure, 'Measure', 'Electrical Safety'),
    ...formatPoints(observationData.electrical_safety?.source, 'Source', 'Electrical Safety'),
  ];
};
