import { safeGetArray, safeGetValue } from './viewRawDataUtils';

export const hgTableConfig = {
  id: 'observationhg',
  name: 'Observation HG',
  category: 'Height Gauge',
  structure: {
    thermalCoeff: true,
    singleHeaders: ['Sr. No.', 'Nominal/ Set Value'],
    subHeaders: {
      'Observation on UUC': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5'],
    },
    remainingHeaders: ['Average', 'Error'],
  },
};

export const createHGRows = (dataArray) => {
  const rows = [];
  dataArray.forEach((point, index) => {
    if (!point) return;
    const observations = safeGetArray(point.observations, 5);
    const row = [
      point.sr_no?.toString() || (index + 1).toString(),
      safeGetValue(point.nominal_value ?? point.point ?? point.test_point),
      ...observations.slice(0, 5).map((obs) => safeGetValue(obs)),
      safeGetValue(point.average ?? point.mean),
      safeGetValue(point.error),
    ];
    while (row.length < 8) row.push('');
    rows.push(row);
  });
  return rows;
};

export const parseHGDynamicData = (observationData, setThermalCoeff) => {
  const hgData = observationData[1] || observationData;
  if (hgData.calibration_points && Array.isArray(hgData.calibration_points)) {
    if (observationData[0] && observationData[0].thermal_coefficients && setThermalCoeff) {
      setThermalCoeff({
        uuc: observationData[0].thermal_coefficients.uuc_coefficient || '',
        master: observationData[0].thermal_coefficients.master_coefficient || '',
        thickness_of_graduation: '',
      });
    }
    return hgData.calibration_points;
  }
  return [];
};
