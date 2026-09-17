import { safeGetArray, formatValueByLc } from './viewRawDataUtils';

export const ctgTableConfig = {
  id: 'observationctg',
  name: 'Observation CTG',
  category: 'Temperature',
  structure: {
    thermalCoeff: true,
    singleHeaders: ['Sr. No.', 'Nominal Value'],
    subHeaders: {
      'Observation on UUC': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5'],
    },
    remainingHeaders: ['Average', 'Error'],
  },
};

export const createCTGRows = (dataArray) => {
  const rows = [];
  dataArray.forEach((point) => {
    const observations = safeGetArray(point?.observations, 5);
    const row = [
      point?.sr_no?.toString() || '',
      point?.nominal_value || '',
      ...observations.slice(0, 5).map((obs) => formatValueByLc(obs, point?.lc_decimals, point?.least_count)),
      formatValueByLc(point?.average, point?.lc_decimals, point?.least_count),
      formatValueByLc(point?.error, point?.lc_decimals, point?.least_count),
    ];
    rows.push(row);
  });
  return rows;
};

export const parseCTGDynamicData = (observationData, setThermalCoeff) => {
  if (observationData.thermal_coeff && setThermalCoeff) {
    setThermalCoeff({
      uuc: observationData.thermal_coeff.uuc || '',
      master: observationData.thermal_coeff.master || '',
    });
  }
  return observationData.points || [];
};
