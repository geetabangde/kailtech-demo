import { safeGetValue } from './viewRawDataUtils';

export const dwTableConfig = {
  id: 'observationdw',
  name: 'Observation DW',
  category: 'Dead Weight',
  structure: {
    singleHeaders: [
      'Sr no',
      'cycle no',
      'Nominal Value Of UUC(g)',
      'Density of UUC Weight, ρr (g/cm³)',
    ],
    subHeaders: {
      'Measured mass value(gm)': ['S1(g)', 'U1(g)', 'U2(g)', 'S2(g)'],
    },
    remainingHeaders: ['Diff.,∆m{(U1-S1)+U2-S2)}/2', 'Avg.Diff.(g)'],
  },
};

export const createDWRows = (dataArray) => {
  const rows = [];
  dataArray.forEach((point, pIndex) => {
    if (!point) return;
    const cycles = Array.isArray(point.cycles) && point.cycles.length > 0
      ? point.cycles
      : Array.from({ length: point.repeatable_cycle ? parseInt(point.repeatable_cycle, 10) : 3 });

    cycles.forEach((cycleItem, cycleIdx) => {
      const cycleNo = cycleItem?.cycle_no?.toString() || (cycleIdx + 1).toString();
      const s1 = cycleItem?.S1 ?? cycleItem?.s1 ?? point.s1?.[cycleIdx];
      const u1 = cycleItem?.U1 ?? cycleItem?.u1 ?? point.u1?.[cycleIdx];
      const u2 = cycleItem?.U2 ?? cycleItem?.u2 ?? point.u2?.[cycleIdx];
      const s2 = cycleItem?.S2 ?? cycleItem?.s2 ?? point.s2?.[cycleIdx];
      const delta = cycleItem?.Delta ?? cycleItem?.deltai ?? point.deltai?.[cycleIdx];

      const row = [
        point.sr_no?.toString() || (pIndex + 1).toString(),
        cycleNo,
        safeGetValue(point.nominal_value || point.test_point),
        safeGetValue(point.density),
        safeGetValue(s1),
        safeGetValue(u1),
        safeGetValue(u2),
        safeGetValue(s2),
        safeGetValue(delta),
        safeGetValue(point.average_diff),
      ];
      rows.push(row);
    });
  });
  return rows;
};

export const parseDWDynamicData = (observationData, response, setEquipmentData) => {
  let processed = [];
  if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
    processed = observationData.calibration_points;
  } else if (observationData.data && Array.isArray(observationData.data)) {
    processed = observationData.data;
  } else if (Array.isArray(observationData)) {
    processed = observationData;
  }

  const env = observationData.environment || response?.data?.environment || response?.data?.data?.environment;
  if (env && setEquipmentData) {
    const pStart = env.pressure_start ?? env.pressurestart;
    const pEnd = env.pressure_end ?? env.pressureend;
    const sTime = env.stabilization_time ?? env.stabilizationtime;
    setEquipmentData((prev) => ({
      ...prev,
      ...(pStart !== undefined && pStart !== null && pStart !== '' ? { pressurestart: pStart } : {}),
      ...(pEnd !== undefined && pEnd !== null && pEnd !== '' ? { pressureend: pEnd } : {}),
      ...(sTime !== undefined && sTime !== null && sTime !== '' ? { stabilizationtime: sTime } : {}),
    }));
  }

  return processed;
};
