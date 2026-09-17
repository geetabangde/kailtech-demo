import { safeGetArray, safeGetValue } from './viewRawDataUtils';

export const msrTableConfig = {
  id: 'observationmsr',
  name: 'Observation MSR',
  category: 'Measuring',
  structure: {
    thermalCoeff: true,
    singleHeaders: ['Sr. No.', 'Nominal/ Set Value'],
    subHeaders: {
      'Observation on UUC': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5'],
    },
    remainingHeaders: ['Average', 'Error'],
  },
};

export const createMSRRows = (dataArray) => {
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

export const parseMSRDynamicData = (observationData, setThermalCoeff) => {
  if (Array.isArray(observationData) && observationData.length > 0) {
    const msrData = observationData[0];
    if (msrData.calibration_points && Array.isArray(msrData.calibration_points)) {
      if (msrData.thermal_coeff && setThermalCoeff) {
        setThermalCoeff({
          uuc: msrData.thermal_coeff.uuc || '',
          master: msrData.thermal_coeff.master || '',
          thickness_of_graduation: '',
        });
      }
      return msrData.calibration_points;
    }
  }
  return [];
};
