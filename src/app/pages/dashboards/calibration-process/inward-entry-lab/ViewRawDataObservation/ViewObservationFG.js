import { safeGetArray, safeGetValue } from './viewRawDataUtils';

export const fgTableConfig = {
  id: 'observationfg',
  name: 'Observation FG',
  category: 'Force Gauge',
  structure: {
    thermalCoeff: true,
    singleHeaders: ['Sr. No.', 'Nominal Value'],
    subHeaders: {
      'Observation on UUC': [
        'Observation 1 (Master)',
        'Observation 2 (Master)',
        'Observation 3 (Master)',
        'Observation 4 (Master)',
        'Observation 5 (Master)',
      ],
    },
    remainingHeaders: ['Average (Master)', 'Error'],
  },
};

export const createFGRows = (dataArray) => {
  const rows = [];
  dataArray.forEach((point, index) => {
    if (!point) return;
    const observations = safeGetArray(point.observations || point.master_readings, 5);
    const row = [
      point.sr_no?.toString() || (index + 1).toString(),
      safeGetValue(point.nominal_value ?? point.point ?? point.test_point),
      ...observations.slice(0, 5).map((obs) => safeGetValue(obs)),
      safeGetValue(point.average ?? point.average_master ?? point.mean),
      safeGetValue(point.error),
    ];
    while (row.length < 8) row.push('');
    rows.push(row);
  });
  return rows;
};

export const parseFGDynamicData = (observationData, setThermalCoeff) => {
  const fgData = observationData.data || observationData;
  if (setThermalCoeff) {
    if (fgData.thermal_coefficients) {
      setThermalCoeff({
        uuc: fgData.thermal_coefficients.thermal_coeff_uuc || '',
        master: fgData.thermal_coefficients.thermal_coeff_master || '',
      });
    } else if (fgData.thermal_coeff) {
      setThermalCoeff({
        uuc: fgData.thermal_coeff.uuc || '',
        master: fgData.thermal_coeff.master || '',
      });
    }
  }

  if (fgData.calibration_points && Array.isArray(fgData.calibration_points)) {
    return fgData.calibration_points;
  } else if (fgData.unit_types && Array.isArray(fgData.unit_types)) {
    return fgData.unit_types;
  }
  return [];
};
