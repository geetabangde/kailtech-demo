export { UCTable } from './UCTable';

export const ucTableConfig = {
  id: 'observationuc',
  name: 'Observation UC',
  category: 'Uncertainty',
  structure: {
    singleHeaders: ['Sr. No.', 'Unit Type', 'Range', 'Nominal/ Set Value (Calculated)', 'Nominal/ Set Value'],
    subHeaders: {
      'Observation': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5'],
    },
    remainingHeaders: ['Average', 'Error'],
  },
};

export const createUCRows = (dataArray) => {
  const rows = [];
  const modes = [];

  const processPoints = (points, isMeasure) => {
    points.forEach((point) => {
      if (!point) return;

      const observations = [];
      const multiReadings = isMeasure
        ? (point.uuc_observations || point.uuc_values || point.observations || point.uuc_readings || [])
        : (point.master_observations || point.master_values || point.observations || point.master_readings || []);

      for (let i = 0; i < 5; i++) {
        observations.push(multiReadings[i]?.value ?? multiReadings[i] ?? '');
      }
      while (observations.length < 5) {
        observations.push('');
      }

      const average = isMeasure
        ? (point.averageuuc || point.average_uuc || '')
        : (point.averagemaster || point.average_master || '');

      const singleCalculated = isMeasure
        ? (point.calculatedmaster || point.calculated_master || point.nominal_values?.calculated_master?.value || point.nominal_set_value_on_master_calculated || '')
        : (point.calculateduuc || point.calculated_uuc || point.nominal_values?.calculated_uuc?.value || point.nominal_set_value_on_uuc_calculated || '');

      const singleReference = isMeasure
        ? (point.master || point.nominal_values?.master?.value || point.point || point.master_value || '')
        : (point.uuc || point.nominal_values?.uuc?.value || point.point || point.uuc_value || '');

      const row = [
        point.sequence_number?.toString() || point.sr_no?.toString() || (rows.length + 1).toString(),
        point.unit_type || point.unittype || point.parameter || '',
        point.range || '',
        singleCalculated,
        singleReference,
        ...observations,
        average,
        point.error || '',
      ];

      rows.push(row);
    });
  };

  const measurePoints = dataArray.filter((p) => p && (p.mode || '').toLowerCase() === 'measure');
  const sourcePoints = dataArray.filter((p) => p && (p.mode || '').toLowerCase() === 'source');

  if (measurePoints.length > 0) {
    processPoints(measurePoints, true);
    modes.push({ mode: 'Measure', calibration_points: measurePoints });
  }
  if (sourcePoints.length > 0) {
    processPoints(sourcePoints, false);
    modes.push({ mode: 'Source', calibration_points: sourcePoints });
  }

  return { rows, modes };
};

export const parseUCDynamicData = (observationData) => {
  if (observationData.measure_data || observationData.source_data) {
    const combined = [];
    if (Array.isArray(observationData.measure_data)) {
      combined.push(...observationData.measure_data.map((p) => ({ ...p, mode: 'Measure' })));
    }
    if (Array.isArray(observationData.source_data)) {
      combined.push(...observationData.source_data.map((p) => ({ ...p, mode: 'Source' })));
    }
    return combined;
  } else if (Array.isArray(observationData)) {
    return observationData;
  } else if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
    return observationData.calibration_points;
  } else if (observationData.data && Array.isArray(observationData.data)) {
    return observationData.data;
  }
  return [];
};
