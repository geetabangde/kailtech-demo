import { safeGetArray, formatValueByLc } from './viewRawDataUtils';

export const mtTableConfig = {
  id: 'observationmt',
  name: 'Observation MT',
  category: 'Measuring Tool',
  structure: {
    thermalCoeff: true,
    additionalFields: ['Thickness of graduation Line'],
    singleHeaders: ['Sr. No.', 'Nominal Value in (mm)'],
    subHeaders: {
      'Observation on Master in (mm)': [
        'Observation 1',
        'Observation 2',
        'Observation 3',
        'Observation 4',
        'Observation 5',
      ],
    },
    remainingHeaders: ['Average in (mm)', 'Error in (mm)'],
  },
};

export const createMTRows = (dataArray) => {
  const rows = [];
  dataArray.forEach((point) => {
    if (!point) return;

    const observations = safeGetArray(point.observations, 5);
    const repeatableCycle = parseInt(point.metadata?.repeatable_cycle || point.repeatable_cycle || point.repeatablecycle, 10) || 5;
    const masterLc = point.metadata?.master_least_count ?? point.master_least_count ?? '0.005';
    const masterDecimals = point.metadata?.master_decimal_places ?? null;
    const uucLc = point.metadata?.least_count ?? point.least_count ?? '1';
    const uucDecimals = point.metadata?.decimal_places ?? null;

    const row = [
      point.sequence_number?.toString() || point.sr_no?.toString() || '',
      formatValueByLc(point.uuc_value || point.nominal_value || point.test_point, uucDecimals, uucLc),
      ...Array.from({ length: 5 }, (_, index) =>
        index < repeatableCycle ? formatValueByLc(observations[index], masterDecimals, masterLc) : ''
      ),
      formatValueByLc(point.average_master || point.average, masterDecimals, masterLc),
      formatValueByLc(point.error, masterDecimals, masterLc),
    ];

    while (row.length < 9) {
      row.push('');
    }

    rows.push(row);
  });
  return rows;
};

export const parseMTDynamicData = (observationData, setThermalCoeff) => {
  const mtData = observationData.data || observationData;
  if (mtData.thermal_coeff && setThermalCoeff) {
    setThermalCoeff({
      uuc: mtData.thermal_coeff.uuc || '',
      master: mtData.thermal_coeff.master || '',
      thickness_of_graduation: mtData.thermal_coeff.thickness_of_graduation || '',
    });
  }
  return mtData.calibration_points || [];
};
