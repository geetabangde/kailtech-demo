import { formatValueByLc } from './viewRawDataUtils';

export const dgTableConfig = {
  id: 'observationdg',
  name: 'Observation DG',
  category: 'Digital Gauge',
  structure: {
    thermalCoeff: true,
    singleHeaders: ['Sr no', 'Nominal Value (Master Unit)'],
    subHeaders: {
      'Set 1': ['Set 1 Forward Reading', 'Set 1 Backward Reading'],
      'Set 2': ['Set 2 Forward Reading', 'Set 2 Backward Reading'],
      'Average (mm)': ['Average Forward Reading', 'Average Backward Reading'],
      'Error (mm)': ['Error Forward Reading', 'Error Backward Reading'],
    },
    remainingHeaders: ['Hysterisis'],
  },
};

export const createDGRows = (dataArray, currentRawdata = {}) => {
  const rows = [];
  dataArray.forEach((point) => {
    if (!point) return;
    const lc = point.least_count || currentRawdata?.uuc_details?.least_count || '0.01';
    let decimals = null;
    if (lc) {
      const match = String(lc).match(/\.([0-9]+)/);
      if (match) decimals = match[1].length;
      else if (!isNaN(parseFloat(lc))) decimals = 0;
    }

    const row = [
      point.sr_no?.toString() || '',
      formatValueByLc(point.nominal_value_master ?? point.nominal_value_uuc ?? point.nominal_value, decimals, lc),
      formatValueByLc(point.set1_forward, decimals, lc),
      formatValueByLc(point.set1_backward, decimals, lc),
      formatValueByLc(point.set2_forward, decimals, lc),
      formatValueByLc(point.set2_backward, decimals, lc),
      formatValueByLc(point.average_forward, decimals, lc),
      formatValueByLc(point.average_backward, decimals, lc),
      formatValueByLc(point.error_forward, decimals, lc),
      formatValueByLc(point.error_backward, decimals, lc),
      formatValueByLc(point.hysterisis ?? point.hysteresis, decimals, lc),
    ];
    rows.push(row);
  });
  return rows;
};

export const parseDGDynamicData = (observationData, setThermalCoeff) => {
  if (observationData.thermal_coefficients && setThermalCoeff) {
    setThermalCoeff({
      uuc: observationData.thermal_coefficients.uuc || '',
      master: observationData.thermal_coefficients.master || '',
      thickness_of_graduation: '',
    });
  }
  if (observationData.observations && Array.isArray(observationData.observations)) {
    return observationData.observations;
  } else if (Array.isArray(observationData)) {
    return observationData;
  }
  return [];
};
