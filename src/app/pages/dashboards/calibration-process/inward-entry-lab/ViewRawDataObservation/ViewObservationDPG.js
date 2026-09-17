import { safeGetValue, formatValueByLc } from './viewRawDataUtils';

export const dpgTableConfig = {
  id: 'observationdpg',
  name: 'Observation DPG',
  category: 'Pressure',
  structure: {
    singleHeaders: [
      'SR NO',
      'SET PRESSURE ON UUC (CALCULATIONUNIT)',
      'SET PRESSURE ON UUC (MASTERUNIT)',
    ],
    subHeaders: {
      'OBSERVATION ON MASTER (MASTERUNIT)': ['M1', 'M2', 'M3'],
    },
    remainingHeaders: ['MEAN (UUCUNIT)', 'ERROR (UUCUNIT)', 'REPEATABILITY (UUCUNIT)', 'HYSTERISIS (UUCUNIT)'],
  },
};

export const createDPGRows = (dataArray, currentRawdata) => {
  const rows = [];
  dataArray.forEach((obs) => {
    if (!obs) return;

    const uucLc = obs?.least_counts?.uuc ?? obs?.least_count_uuc ?? obs?.uuc_least_count ?? obs?.least_count ?? obs?.leastcount ?? currentRawdata?.uuc_details?.least_count;
    const masterLc = obs?.least_counts?.master ?? obs?.least_count_master ?? obs?.master_least_count ?? obs?.masterleastcount;

    const m1Str = safeGetValue(obs.master_readings?.m1 ?? obs.master_readings?.[0] ?? obs.m1);
    let mlc = null;
    if (masterLc) {
      const match = String(masterLc).match(/\.([0-9]+)/);
      if (match) mlc = match[1].length;
      else if (!isNaN(parseFloat(masterLc))) mlc = 0;
    }
    if (mlc === null && m1Str.includes('.')) {
      mlc = m1Str.split('.')[1].length;
    }
    if (mlc === null) mlc = 3;

    let uucDecimals = null;
    if (uucLc) {
      const match = String(uucLc).match(/\.([0-9]+)/);
      if (match) uucDecimals = match[1].length;
      else if (!isNaN(parseFloat(uucLc))) uucDecimals = 0;
    }
    if (uucDecimals === null) {
      const uucStr = safeGetValue(obs.uuc_value ?? obs.set_pressure_uuc);
      if (uucStr.includes('.')) uucDecimals = uucStr.split('.')[1].length;
      else uucDecimals = 1;
    }

    const errorDecimals = Math.max(mlc, uucDecimals);

    const row = [
      obs.sr_no?.toString() || '',
      formatValueByLc(obs.uuc_value ?? obs.set_pressure_uuc, uucDecimals, uucLc),
      formatValueByLc(obs.converted_uuc_value ?? obs.set_pressure_master, mlc, masterLc),
      formatValueByLc(obs.master_readings?.m1 ?? obs.master_readings?.[0] ?? obs.m1, mlc, masterLc),
      formatValueByLc(obs.master_readings?.m2 ?? obs.master_readings?.[1] ?? obs.m2, mlc, masterLc),
      formatValueByLc(obs.master_readings?.m3 ?? obs.master_readings?.[2] ?? obs.m3, mlc, masterLc),
      formatValueByLc(obs.average_master ?? obs.average ?? obs.mean, mlc, masterLc),
      formatValueByLc(obs.error, errorDecimals, masterLc),
      formatValueByLc(obs.repeatability ?? obs.repeatable, mlc, masterLc),
      formatValueByLc(obs.hysterisis ?? obs.hysteresis, mlc, masterLc),
    ];
    rows.push(row);
  });
  return rows;
};

export const parseDPGDynamicData = (observationData) => {
  const obsList = observationData.observations || observationData.observation_data?.observations || observationData.data?.observations;
  return Array.isArray(obsList) ? obsList : [];
};
