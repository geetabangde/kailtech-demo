import { safeGetValue } from './viewRawDataUtils';

export const apgTableConfig = {
  id: 'observationapg',
  name: 'Observation APG',
  category: 'Pressure',
  structure: {
    singleHeaders: ['Sr no', 'Set Pressure on UUC (kg/cm²)', 'Set Pressure on UUC (bar)'],
    subHeaders: {
      'Observations on Master (bar)': ['M1', 'M2'],
    },
    remainingHeaders: ['Mean (bar)', 'Error (bar)', 'Hysterisis (bar)'],
  },
};

export const createAPGRows = (dataArray) => {
  const rows = [];
  dataArray.forEach((point, index) => {
    if (!point) return;
    const m1 = point.master_readings?.[0] ?? point.m1 ?? point.observations?.m1 ?? '';
    const m2 = point.master_readings?.[1] ?? point.m2 ?? point.observations?.m2 ?? '';
    const row = [
      point.sr_no?.toString() || (index + 1).toString(),
      safeGetValue(point.set_pressure_uuc_kg ?? point.uuc_kg ?? point.point),
      safeGetValue(point.set_pressure_uuc_bar ?? point.uuc_bar ?? point.converted_uuc_value),
      safeGetValue(m1),
      safeGetValue(m2),
      safeGetValue(point.mean ?? point.average ?? point.average_master),
      safeGetValue(point.error),
      safeGetValue(point.hysterisis ?? point.hysteresis),
    ];
    rows.push(row);
  });
  return rows;
};

export const parseAPGDynamicData = (observationData) => {
  return observationData || [];
};
