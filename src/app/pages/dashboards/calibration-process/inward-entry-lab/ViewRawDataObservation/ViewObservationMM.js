import { safeGetValue } from './viewRawDataUtils';

export const mmTableConfig = {
  id: 'observationmm',
  name: 'Observation MM',
  category: 'Multimeter',
  structure: {
    singleHeaders: ['Sr. No.', 'Mode', 'Range', 'Nominal/ Set Value on master (Calculated)', 'Nominal/ Set Value on master'],
    subHeaders: {
      'Observation on UUC': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5'],
    },
    remainingHeaders: ['Average', 'Error'],
  },
};

export const createMMRows = (dataArray) => {
  const rows = [];
  const unitTypes = [];

  dataArray.forEach((unitTypeGroup) => {
    if (!unitTypeGroup || !unitTypeGroup.calibration_points) return;

    unitTypes.push(unitTypeGroup);

    unitTypeGroup.calibration_points.forEach((point, pointIndex) => {
      if (!point) return;

      const observations = [];
      if (point.observations && Array.isArray(point.observations)) {
        for (let i = 0; i < 5; i++) {
          observations.push(point.observations[i]?.value || '');
        }
      }

      while (observations.length < 5) {
        observations.push('');
      }

      const row = [
        point.sequence_number?.toString() || (pointIndex + 1).toString(),
        point.mode || 'Measure',
        point.range || '',
        (point.nominal_values?.calculated_master?.value || '') +
          (point.nominal_values?.calculated_master?.unit ? ' ' + point.nominal_values.calculated_master.unit : ''),
        (point.nominal_values?.master?.value || '') +
          (point.nominal_values?.master?.unit ? ' ' + point.nominal_values.master.unit : ''),
        ...observations.slice(0, 5).map((obs) => safeGetValue(obs)),
        safeGetValue(point.average),
        safeGetValue(point.deviation),
      ];
      rows.push(row);
    });
  });

  return { rows, unitTypes };
};

export const parseMMDynamicData = (observationData) => {
  if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
    return observationData.calibration_points;
  } else if (observationData.data && Array.isArray(observationData.data)) {
    return observationData.data;
  } else if (observationData.unit_types && Array.isArray(observationData.unit_types)) {
    return observationData.unit_types;
  } else if (Array.isArray(observationData)) {
    return observationData;
  } else {
    const possiblePoints = Object.values(observationData).filter(
      (item) => item && typeof item === 'object' && (item.sr_no !== undefined || item.sequence_number !== undefined || item.unit_type !== undefined || item.calibration_points !== undefined)
    );
    if (possiblePoints.length > 0) {
      return possiblePoints;
    }
  }
  return [];
};
