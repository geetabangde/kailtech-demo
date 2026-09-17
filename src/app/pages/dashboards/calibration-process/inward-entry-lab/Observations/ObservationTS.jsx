import { safeGetValue } from './observationUtils';

/**
 * Calculation logic for Test Sieve (TS) Observation
 * Computes average of the 8 aperture measurements formatted to 2 decimal places.
 */
export const calculateTSValues = (rowData) => {
  if (!rowData || !Array.isArray(rowData)) {
    return { average: '' };
  }
  const parsedValues = rowData.map(val => (val === '' || val === null || val === undefined ? NaN : parseFloat(val)));
  const readings = parsedValues.slice(1, 9);
  const validReadings = readings.filter((val, idx) => {
    const raw = rowData[idx + 1];
    return raw !== undefined && raw !== null && String(raw).trim() !== '' && !isNaN(val);
  });

  return {
    average: validReadings.length
      ? (validReadings.reduce((sum, val) => sum + val, 0) / validReadings.length).toFixed(2)
      : ''
  };
};

export const sanitizeSieveVal = (val, maxDec = 2) => {
  if (val === undefined || val === null) return '';
  let str = String(val).trim();
  if (str === '') return '';
  str = str.replace(/[^\d.]/g, '');
  const parts = str.split('.');
  if (parts.length > 1) {
    const intPart = parts[0] || '0';
    const decPart = parts.slice(1).join('');
    str = maxDec !== undefined && maxDec >= 0 ? `${intPart}.${decPart.slice(0, maxDec)}` : `${intPart}.${decPart}`;
  }
  return str;
};

/**
 * Row generator for TS Observation
 */
export const createTSRows = (dataArray) => {
  const rows = [];
  const calibrationPoints = [];
  const types = [];
  const repeatables = [];
  const values = [];

  (dataArray || []).forEach((point) => {
    if (!point) return;
    const calibPointId = point.point_id?.toString() || point.id?.toString() || point.calibration_point_id?.toString() || "1";
    const nominalSize = safeGetValue(point.nominal_size || point.point || point.nominal_value || point.test_point || "0");

    for (let rc = 0; rc < 5; rc++) {
      const rowValues = [];
      for (let i = 0; i < 8; i++) {
        let obsValue = '';
        if (point.observations && Array.isArray(point.observations)) {
          const obs = point.observations.find(o => o != null && String(o.repeatable) === `${rc}-${i}`);
          if (obs) obsValue = obs.value;
        } else if (point.readings && Array.isArray(point.readings)) {
          const reading = point.readings[rc];
          if (reading && Array.isArray(reading.values)) {
            const obs = reading.values.find(o => o != null && String(o.repeatable) === `${rc}-${i}`);
            if (obs) obsValue = obs.value;
          }
        }
        rowValues.push(safeGetValue(sanitizeSieveVal(obsValue, 2)));
      }

      let avgValue = '';
      const validNums = rowValues.map(v => parseFloat(v)).filter(n => !isNaN(n));
      if (validNums.length > 0) {
        avgValue = (validNums.reduce((sum, n) => sum + n, 0) / validNums.length).toFixed(2);
      } else if (point.averages && Array.isArray(point.averages)) {
        const avg = point.averages.find(a => a != null && String(a.repeatable) === `${rc}`);
        if (avg) avgValue = avg.value;
      } else if (point.readings && Array.isArray(point.readings)) {
        const reading = point.readings[rc];
        if (reading && reading.average !== undefined && reading.average !== null) {
          const numAvg = parseFloat(reading.average);
          avgValue = !isNaN(numAvg) ? numAvg.toFixed(2) : String(reading.average);
        }
      }

      const row = [
        (rc + 1).toString(),
        ...rowValues,
        safeGetValue(avgValue)
      ];

      rows.push(row);
      calibrationPoints.push(calibPointId);
      types.push('uuc');
      repeatables.push(rc.toString());
      values.push(nominalSize);
    }
  });

  return { rows, hiddenInputs: { calibrationPoints, types, repeatables, values } };
};

/**
 * Table config for TS Observation
 */
export const getTSTableConfig = (observations) => {
  const { rows, hiddenInputs } = createTSRows(observations);
  return {
    id: 'observationts',
    name: 'Observation TS',
    category: 'Test Sieve',
    structure: {
      thermalCoeff: true,
      singleHeaders: ['Sr no'],
      subHeaders: {
        'Aperture Size on Warp Side (in µm/mm)': ['1', '2', '3', '4'],
        'Aperture Size on Weft Side (in µm/mm)': ['1', '2', '3', '4'],
      },
      remainingHeaders: ['Average Aperture'],
    },
    staticRows: rows,
    hiddenInputs: hiddenInputs,
  };
};

const ObservationTS = () => null;
export default ObservationTS;
