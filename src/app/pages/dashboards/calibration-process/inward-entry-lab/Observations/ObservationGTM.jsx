import React, { useState, useEffect, useMemo } from 'react';
import axios from 'utils/axios';
import { JWT_HOST_API } from 'configs/auth.config';
import { safeGetValue, safeGetArray } from './observationUtils';

/**
 * Common utility: extract number of decimal places from least count value.
 */
export const getDecimalPlaces = (leastCount) => {
    if (!leastCount || leastCount === 'NA' || leastCount === 'N.A') return 0;
    const s = String(leastCount).trim();
    if (s.includes('.')) {
        const parts = s.split('.');
        return parts[parts.length - 1].length;
    }
    return 0;
};

/**
 * Format value according to decimal places and optional least count step rounding.
 */
export const formatValueByLc = (val, decimals, leastCount) => {
    if (val === null || val === undefined || val === '') return '';
    const strVal = String(val).trim();
    const n = parseFloat(strVal);
    if (isNaN(n)) return strVal;

    let d = null;
    if (decimals !== null && decimals !== undefined && decimals !== 'NA' && decimals !== '') {
        const p = parseInt(decimals, 10);
        if (!isNaN(p)) d = p;
    }
    if (d === null && leastCount != null && leastCount !== 'NA' && leastCount !== '') {
        d = getDecimalPlaces(leastCount);
    }

    if (d !== null) {
        return n.toFixed(d);
    }
    return strVal;
};

/**
 * Helper to determine effective decimal places for UUC or Master.
 * If decimal places / least count is specified and numeric, use it.
 * Otherwise, if 'NA' or missing, derive from the maximum decimal places in the entered readings
 * (defaulting to 3 for master readings and 1 for UUC).
 */
export const getEffectiveDecimals = (point, readings = [], type = 'master') => {
    const isMaster = type === 'master';
    const decPlacesProp = isMaster ? point?.master_least_count_decimal_places : point?.least_count_decimal_places;
    const lcProp = isMaster
        ? (point?.master_least_count !== 'NA' ? point?.master_least_count : point?.mastermatrix?.leastcount)
        : (point?.least_count !== 'NA' ? point?.least_count : point?.matrix?.leastcount);

    if (decPlacesProp !== undefined && decPlacesProp !== null && decPlacesProp !== 'NA' && decPlacesProp !== '') {
        const p = parseInt(decPlacesProp, 10);
        if (!isNaN(p)) return p;
    }

    if (lcProp !== undefined && lcProp !== null && lcProp !== 'NA' && lcProp !== '') {
        const d = getDecimalPlaces(lcProp);
        if (d > 0) return d;
    }

    // Derive from entered readings if least count / dec places is 'NA'
    if (Array.isArray(readings) && readings.length > 0) {
        const decs = readings
            .filter(v => v !== undefined && v !== null && String(v).includes('.'))
            .map(v => String(v).trim().split('.')[1]?.length || 0);
        if (decs.length > 0) {
            return Math.max(...decs);
        }
    }

    return isMaster ? 3 : 1;
};

/**
 * Calculation logic for Glass Thermometer (GTM) Observation row / point.
 * Matches PHP calculation exact behavior:
 * - UUC Average = sum(uuc readings 0..4) / count (only if valid readings exist)
 * - Master Average = sum(master readings 0..4) / count (only if valid readings exist)
 * - Deviation (Error) = ONLY if BOTH averageuuc and caveragemaster are non-empty!
 *   Formula: (isStdUuc ? caveragemaster - averageuuc : averageuuc - caveragemaster)
 */
export const calculateGTMValues = (rowData, rowIndex, observations, instrument) => {
    const result = {
        averageuuc: '',
        averagemaster: '',
        error: '',
    };
    if (!rowData || !Array.isArray(rowData)) return result;

    const point = (observations && observations[Math.floor(rowIndex / 2)]) || {};
    const isUucRow = rowIndex % 2 === 0;

    const rawReadings = rowData.slice(6, 11);
    const lcDecimals = getEffectiveDecimals(point, rawReadings, 'uuc');
    const mlcDecimals = getEffectiveDecimals(point, rawReadings, 'master');
    const errorDecimals = Math.max(lcDecimals, mlcDecimals);

    if (isUucRow) {
        // Readings are in columns 6 to 10
        const validReadings = rawReadings
            .map(v => (v !== undefined && v !== null && String(v).trim() !== '') ? parseFloat(v) : NaN)
            .filter(v => !isNaN(v));

        if (validReadings.length > 0) {
            const avg = validReadings.reduce((sum, v) => sum + v, 0) / validReadings.length;
            result.averageuuc = avg.toFixed(lcDecimals);
        }

        // Only compute error if caveragemaster is provided (usually in next row col 12)
        // and UUC average is present. Never default missing values to 0.
        const cAvgMasterRaw = rowData[12];
        if (result.averageuuc !== '' && cAvgMasterRaw !== undefined && cAvgMasterRaw !== null && String(cAvgMasterRaw).trim() !== '') {
            const cAvgMaster = parseFloat(cAvgMasterRaw);
            const uucAvg = parseFloat(result.averageuuc);
            if (!isNaN(cAvgMaster) && !isNaN(uucAvg)) {
                const isStdUuc = instrument?.error === 'stduuc' || instrument?.error_type === 'stduuc';
                const dev = isStdUuc ? (cAvgMaster - uucAvg) : (uucAvg - cAvgMaster);
                result.error = dev.toFixed(errorDecimals);
            }
        }
    } else {
        // Master row: readings are in columns 6 to 10
        const validReadings = rawReadings
            .map(v => (v !== undefined && v !== null && String(v).trim() !== '') ? parseFloat(v) : NaN)
            .filter(v => !isNaN(v));

        if (validReadings.length > 0) {
            const avg = validReadings.reduce((sum, v) => sum + v, 0) / validReadings.length;
            result.averagemaster = avg.toFixed(mlcDecimals);
        }
    }

    return result;
};

/**
 * Row generator for GTM Observation (for staticRows and hiddenInputs compatibility)
 */
export const createGTMRows = (dataArray, instrument) => {
    const rows = [];
    const calibrationPoints = [];
    const types = [];
    const repeatables = [];
    const values = [];

    (dataArray || []).forEach((point, index) => {
        if (!point) return;

        const pointId = point.point_id?.toString() || point.id?.toString() || point.calibration_point_id?.toString() || (index + 1).toString();
        const srNo = (index + 1).toString();

        // Readings extraction (5 readings each) - supports exact backend response uuc_values and master_values
        const uucReadings = safeGetArray(point.uuc_values ?? point.uuc_observations ?? point.observations, 5);
        const masterReadings = safeGetArray(point.master_values ?? point.master_observations, 5);

        // Least count & decimal places from point or matrices or entered readings
        const lc = getEffectiveDecimals(point, uucReadings, 'uuc');
        const mlc = getEffectiveDecimals(point, masterReadings, 'master');
        const errorLc = Math.max(lc, mlc);

        const isStdUuc = instrument?.error === 'stduuc' || instrument?.error_type === 'stduuc';

        const setPointVal = safeGetValue(point.set_point ?? point.point);
        const formattedSetPoint = setPointVal !== '' && !isNaN(parseFloat(setPointVal))
            ? parseFloat(setPointVal).toFixed(lc)
            : setPointVal;

        const rangeVal = safeGetValue(point.range ?? point.uucrange ?? '');
        const uucUnit = safeGetValue(point.unit ?? point.unit_description ?? point.unit_name ?? '°C');
        const masterUnit = safeGetValue(point.master_unit_id ?? point.master_unit_value ?? point.master_unit_description ?? point.master_unit ?? '12');
        const sensCoeff = safeGetValue(point.sensitivity_coefficient ?? point.sensitivitycoefficient ?? '');

        // Initial / pre-calculated averages
        const avgUuc = safeGetValue(point.average_uuc ?? point.averageuuc ?? '');
        const avgMaster = safeGetValue(point.average_master ?? point.averagemaster ?? '');
        const cAvgMaster = safeGetValue(point.converted_average_master ?? point.caveragemaster ?? '');
        let errorVal = safeGetValue(point.error ?? '');

        // Strict validation: only set error if both UUC average and Converted Master Average are non-empty
        if (avgUuc !== '' && cAvgMaster !== '') {
            const u = parseFloat(avgUuc);
            const m = parseFloat(cAvgMaster);
            if (!isNaN(u) && !isNaN(m)) {
                errorVal = (isStdUuc ? (m - u) : (u - m)).toFixed(errorLc);
            } else {
                errorVal = '';
            }
        } else {
            errorVal = '';
        }

        // -------------------------------------------------------------
        // ROW 1: UUC ROW
        // -------------------------------------------------------------
        const uucRow = [
            srNo,                                            // 0: Sr. No. (rowspan 2)
            formattedSetPoint,                               // 1: Set Point (rowspan 2)
            rangeVal,                                        // 2: Range (rowspan 2)
            'UUC',                                           // 3: Value Of
            uucUnit,                                         // 4: Unit
            '-',                                             // 5: Sensitivity Coefficient
            ...uucReadings.slice(0, 5).map(v => safeGetValue(v)), // 6-10: Obs 1..5
            '-',                                             // 11: Average (Ω) - dash for UUC
            avgUuc,                                          // 12: Average (UUC Unit)
            errorVal,                                        // 13: Deviation (UUC Unit) (rowspan 2)
        ];
        rows.push(uucRow);

        // Hidden inputs for UUC row: setpoint, range, uuc (0..4), averageuuc, error
        calibrationPoints.push(pointId);
        types.push('setpoint');
        repeatables.push('0');
        values.push(formattedSetPoint || '0');

        calibrationPoints.push(pointId);
        types.push('range');
        repeatables.push('0');
        values.push(rangeVal);

        for (let r = 0; r < 5; r++) {
            calibrationPoints.push(pointId);
            types.push('uuc');
            repeatables.push(r.toString());
            values.push(safeGetValue(uucReadings[r]));
        }

        calibrationPoints.push(pointId);
        types.push('averageuuc');
        repeatables.push('0');
        values.push(avgUuc);

        calibrationPoints.push(pointId);
        types.push('error');
        repeatables.push('0');
        values.push(errorVal);

        // -------------------------------------------------------------
        // ROW 2: MASTER ROW
        // -------------------------------------------------------------
        const masterRow = [
            '-',                                             // 0: Sr. No. (spanned)
            '-',                                             // 1: Set Point (spanned)
            '-',                                             // 2: Range (spanned)
            'Master',                                        // 3: Value Of
            masterUnit,                                      // 4: Unit
            sensCoeff,                                       // 5: Sensitivity Coefficient
            ...masterReadings.slice(0, 5).map(v => safeGetValue(v)), // 6-10: Obs 1..5
            avgMaster,                                       // 11: Average (Ω)
            cAvgMaster,                                      // 12: Average (UUC Unit)
            '-',                                             // 13: Deviation (spanned)
        ];
        rows.push(masterRow);

        // Hidden inputs for Master row: masterunit, sensitivitycoefficient, master (0..4), averagemaster, caveragemaster
        calibrationPoints.push(pointId);
        types.push('masterunit');
        repeatables.push('0');
        values.push(masterUnit);

        calibrationPoints.push(pointId);
        types.push('sensitivitycoefficient');
        repeatables.push('0');
        values.push(sensCoeff);

        for (let r = 0; r < 5; r++) {
            calibrationPoints.push(pointId);
            types.push('master');
            repeatables.push(r.toString());
            values.push(safeGetValue(masterReadings[r]));
        }

        calibrationPoints.push(pointId);
        types.push('averagemaster');
        repeatables.push('0');
        values.push(avgMaster);

        calibrationPoints.push(pointId);
        types.push('caveragemaster');
        repeatables.push('0');
        values.push(cAvgMaster);
    });

    return { rows, hiddenInputs: { calibrationPoints, types, repeatables, values } };
};

/**
 * Table config for GTM Observation
 */
export const getGTMTableConfig = (observations, instrument) => {
    const { rows, hiddenInputs } = createGTMRows(observations, instrument);
    const samplePoint = (observations && observations[0]) || {};
    const uucUnit = samplePoint.unit_description || samplePoint.unit_name || samplePoint.unit || '°C';

    return {
        id: 'observationgtm',
        name: 'Observation GTM',
        category: 'Temperature',
        structure: {
            singleHeaders: [
                'Sr. No.',
                `Set Point (${uucUnit})`,
                'Range',
                'Value Of',
                'Unit',
                'Sensitivity Coefficient'
            ],
            subHeaders: {
                'Observation ()': ['1', '2', '3', '4', '5']
            },
            remainingHeaders: [
                'Average (Ω)',
                `Average (${uucUnit})`,
                `Deviation (${uucUnit})`
            ]
        },
        staticRows: rows,
        hiddenInputs: hiddenInputs
    };
};

/**
 * Primary React Component: ObservationGTM
 * Self-contained component rendering the exact PHP GTM observation table with:
 * - Table class: standard clean Bootstrap-style bordered table (no colored badges or highlights)
 * - Headers: Sr. No., Set Point, Range, Value Of, Unit, Sensitivity Coefficient, Observation (1..5), Average (Ω), Average (°C), Deviation (°C)
 * - Row 1: UUC, Row 2: Master
 * - Pure PHP mathematical logic: UUC average, Master average, and Deviation = averageuuc - caveragemaster (or caveragemaster - averageuuc if stduuc)
 * - Strict behavior: Deviation is ONLY displayed when BOTH averageuuc and caveragemaster are valid non-empty numbers
 */
const ObservationGTM = ({
    selectedTableData,
    tableInputValues = {},
    setTableInputValues,
    observations = [],
    instrument,
    unitsList: propUnitsList,
    handleInputChange,
    handleObservationBlur,
    validateDecimalPlaces,
}) => {
    // Available units list for Master unit dropdown
    const [unitsList, setUnitsList] = useState(propUnitsList || []);
    const [inputErrors, setInputErrors] = useState({});

    // Helper to extract clean unit symbol (description, e.g. °C, PPM) for selected display
    const getSelectedUnitSymbol = (val) => {
        if (!val && val !== 0) return '°C';
        const strVal = String(val).trim();
        const found = unitsList.find(u =>
            String(u.value) === strVal ||
            String(u.id) === strVal ||
            String(u.description) === strVal ||
            String(u.unitDesc) === strVal ||
            String(u.symbol) === strVal ||
            String(u.label) === strVal ||
            String(u.name) === strVal
        );
        if (found) {
            return found.description || found.symbol || found.unitDesc || found.name || found.label;
        }
        const bracketMatch = strVal.match(/\((.*?)\)/);
        if (bracketMatch) {
            return bracketMatch[1];
        }
        return strVal;
    };

    // Fetch full units list with descriptions from API
    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const response = await axios.get(`${JWT_HOST_API}/master/units-list`);
                if (response.data && response.data.status && response.data.data) {
                    setUnitsList(response.data.data.map(unit => ({
                        value: unit.id?.toString(),
                        id: unit.id?.toString(),
                        label: unit.description ? `(${unit.description}) ${unit.name}` : unit.name,
                        unitDesc: unit.description || unit.name,
                        symbol: unit.description || unit.name,
                        description: unit.description || unit.name,
                        name: unit.name
                    })));
                }
            } catch (err) {
                console.warn('Could not fetch units list for GTM observation, using defaults:', err);
                setUnitsList([
                    { value: '12', id: '12', label: '(°C) Degree Centigrade', description: '°C', unitDesc: '°C', symbol: '°C', name: 'Degree Centigrade' },
                    { value: 'ohm', id: 'ohm', label: '(Ω) Ohm', description: 'Ω', unitDesc: 'Ω', symbol: 'Ω', name: 'Ohm' },
                    { value: 'kohm', id: 'kohm', label: '(kΩ) Kiloohm', description: 'kΩ', unitDesc: 'kΩ', symbol: 'kΩ', name: 'Kiloohm' },
                    { value: 'mohm', id: 'mohm', label: '(MΩ) Megaohm', description: 'MΩ', unitDesc: 'MΩ', symbol: 'MΩ', name: 'Megaohm' },
                    { value: 'celsius', id: 'celsius', label: '(°C) Degree Celsius', description: '°C', unitDesc: '°C', symbol: '°C', name: 'Degree Celsius' },
                ]);
            }
        };

        fetchUnits();
    }, []);

    // Calibration points to render
    const calibPoints = useMemo(() => {
        if (observations && observations.length > 0) {
            return observations;
        }
        if (selectedTableData?.calibration_points && selectedTableData.calibration_points.length > 0) {
            return selectedTableData.calibration_points;
        }
        return [];
    }, [observations, selectedTableData]);

    // Determine UUC unit label (defaults to °C)
    const firstPoint = calibPoints[0] || {};
    const uucUnit = firstPoint.unit_description || firstPoint.unit_name || firstPoint.unit || '°C';

    // Helper to read current value from tableInputValues or point data
    const getValue = (key, fallback = '') => {
        if (tableInputValues && tableInputValues[key] !== undefined && tableInputValues[key] !== null) {
            return tableInputValues[key];
        }
        return fallback !== undefined && fallback !== null ? String(fallback) : '';
    };

    // Update input value in parent state
    const setInputValue = (key, val, rowIndex, colIndex) => {
        if (setTableInputValues) {
            setTableInputValues(prev => ({
                ...prev,
                [key]: val
            }));
        }
        if (handleInputChange && rowIndex !== undefined && colIndex !== undefined) {
            handleInputChange(rowIndex, colIndex, val);
        }
    };

    // Perform decimal validation and update error state
    const handleDecimalValidation = (key, val, leastCount) => {
        if (val && val.includes('.') && leastCount && leastCount !== 'NA') {
            const maxDec = getDecimalPlaces(leastCount);
            const dec = val.split('.')[1].length;
            if (dec > maxDec) {
                setInputErrors(prev => ({
                    ...prev,
                    [key]: `Max ${maxDec} decimal places allowed (least count: ${leastCount})`
                }));
            } else {
                setInputErrors(prev => ({ ...prev, [key]: null }));
            }
        } else {
            setInputErrors(prev => ({ ...prev, [key]: null }));
        }

        if (validateDecimalPlaces && typeof validateDecimalPlaces === 'function') {
            validateDecimalPlaces(key, val, leastCount);
        }
    };

    // Handle UUC reading change -> exact PHP averageavg & substractminus
    const handleUucReadingChange = (pointId, obsIdx, val, point, uucRowIdx) => {
        const key = `${pointId}-uuc-${obsIdx}`;
        const legacyKey = `uu${obsIdx}c${pointId}`;
        const tableKey = `${uucRowIdx}-${obsIdx + 6}`;

        // Calculate new UUC average from all 5 readings
        const currentReadings = [0, 1, 2, 3, 4].map(i => {
            if (i === obsIdx) return val;
            const k = `${pointId}-uuc-${i}`;
            const legK = `uu${i}c${pointId}`;
            const rowK = `${uucRowIdx}-${i + 6}`;
            return getValue(k, getValue(legK, getValue(rowK, point.uuc_values?.[i] ?? point.uuc_observations?.[i] ?? point.observations?.[i] ?? '')));
        });

        const lcDec = getEffectiveDecimals(point, currentReadings, 'uuc');
        const mlcDec = getEffectiveDecimals(point, [], 'master');
        const errorDec = Math.max(lcDec, mlcDec);

        const validNums = currentReadings
            .map(v => (v !== undefined && v !== null && String(v).trim() !== '') ? parseFloat(v) : NaN)
            .filter(v => !isNaN(v));

        let newAvgUuc = '';
        if (validNums.length > 0) {
            const avg = validNums.reduce((sum, n) => sum + n, 0) / validNums.length;
            newAvgUuc = avg.toFixed(lcDec);
        }

        // Read current caveragemaster to compute deviation (substractminus)
        const masterRowIdx = uucRowIdx + 1;
        const cAvgMasterKey = `${pointId}-caveragemaster`;
        const cAvgMasterLegKey = `caveragemaster${pointId}`;
        const cAvgMasterRowKey = `${masterRowIdx}-12`;
        const cAvgMasterVal = getValue(cAvgMasterKey, getValue(cAvgMasterLegKey, getValue(cAvgMasterRowKey, point.caveragemaster ?? point.converted_average_master ?? '')));

        let newDeviation = '';
        if (newAvgUuc !== '' && cAvgMasterVal !== '' && String(cAvgMasterVal).trim() !== '') {
            const numCAvg = parseFloat(cAvgMasterVal);
            const numAvgUuc = parseFloat(newAvgUuc);
            if (!isNaN(numCAvg) && !isNaN(numAvgUuc)) {
                const isStdUuc = instrument?.error === 'stduuc' || instrument?.error_type === 'stduuc';
                const dev = isStdUuc ? (numCAvg - numAvgUuc) : (numAvgUuc - numCAvg);
                newDeviation = dev.toFixed(errorDec);
            }
        }

        // Update state
        if (setTableInputValues) {
            setTableInputValues(prev => ({
                ...prev,
                [key]: val,
                [legacyKey]: val,
                [tableKey]: val,
                [`${pointId}-averageuuc`]: newAvgUuc,
                [`averageuuc${pointId}`]: newAvgUuc,
                [`${uucRowIdx}-12`]: newAvgUuc,
                [`${pointId}-error`]: newDeviation,
                [`error${pointId}`]: newDeviation,
                [`${uucRowIdx}-13`]: newDeviation,
            }));
        }

        handleDecimalValidation(key, val, point.least_count);

        if (handleInputChange) {
            handleInputChange(uucRowIdx, obsIdx + 6, val);
            handleInputChange(uucRowIdx, 12, newAvgUuc);
            handleInputChange(uucRowIdx, 13, newDeviation);
        }
    };

    // Handle Master reading change -> exact PHP averageavg for master readings
    const handleMasterReadingChange = (pointId, obsIdx, val, point, masterRowIdx) => {
        const key = `${pointId}-master-${obsIdx}`;
        const legacyKey = `maste${obsIdx}r${pointId}`;
        const tableKey = `${masterRowIdx}-${obsIdx + 6}`;

        // Calculate new Master average from all 5 readings
        const currentReadings = [0, 1, 2, 3, 4].map(i => {
            if (i === obsIdx) return val;
            const k = `${pointId}-master-${i}`;
            const legK = `maste${i}r${pointId}`;
            const rowK = `${masterRowIdx}-${i + 6}`;
            return getValue(k, getValue(legK, getValue(rowK, point.master_observations?.[i] ?? point.master_values?.[i] ?? '')));
        });

        const mlcDec = getEffectiveDecimals(point, currentReadings, 'master');

        const validNums = currentReadings
            .map(v => (v !== undefined && v !== null && String(v).trim() !== '') ? parseFloat(v) : NaN)
            .filter(v => !isNaN(v));

        let newAvgMaster = '';
        if (validNums.length > 0) {
            const avg = validNums.reduce((sum, n) => sum + n, 0) / validNums.length;
            newAvgMaster = avg.toFixed(mlcDec);
        }

        if (setTableInputValues) {
            setTableInputValues(prev => ({
                ...prev,
                [key]: val,
                [legacyKey]: val,
                [tableKey]: val,
                [`${pointId}-averagemaster`]: newAvgMaster,
                [`averagemaster${pointId}`]: newAvgMaster,
                [`${masterRowIdx}-11`]: newAvgMaster,
            }));
        }

        handleDecimalValidation(key, val, point.master_least_count);

        if (handleInputChange) {
            handleInputChange(masterRowIdx, obsIdx + 6, val);
            handleInputChange(masterRowIdx, 11, newAvgMaster);
        }
    };

    // Handle Converted Master Average change (caveragemaster) -> exact PHP substractminus
    const handleCAvgMasterChange = (pointId, val, point, masterRowIdx, uucRowIdx) => {
        const key = `${pointId}-caveragemaster`;
        const legacyKey = `caveragemaster${pointId}`;
        const tableKey = `${masterRowIdx}-12`;

        const lcDec = getEffectiveDecimals(point, [], 'uuc');
        const mlcDec = getEffectiveDecimals(point, [], 'master');
        const errorDec = Math.max(lcDec, mlcDec);

        // Get current averageuuc
        const avgUucKey = `${pointId}-averageuuc`;
        const avgUucLegKey = `averageuuc${pointId}`;
        const avgUucRowKey = `${uucRowIdx}-12`;
        const avgUucVal = getValue(avgUucKey, getValue(avgUucLegKey, getValue(avgUucRowKey, point.average_uuc ?? point.averageuuc ?? '')));

        let newDeviation = '';
        if (val !== '' && String(val).trim() !== '' && avgUucVal !== '' && String(avgUucVal).trim() !== '') {
            const numCAvg = parseFloat(val);
            const numAvgUuc = parseFloat(avgUucVal);
            if (!isNaN(numCAvg) && !isNaN(numAvgUuc)) {
                const isStdUuc = instrument?.error === 'stduuc' || instrument?.error_type === 'stduuc';
                const dev = isStdUuc ? (numCAvg - numAvgUuc) : (numAvgUuc - numCAvg);
                newDeviation = dev.toFixed(errorDec);
            }
        }

        if (setTableInputValues) {
            setTableInputValues(prev => ({
                ...prev,
                [key]: val,
                [legacyKey]: val,
                [tableKey]: val,
                [`${pointId}-error`]: newDeviation,
                [`error${pointId}`]: newDeviation,
                [`${uucRowIdx}-13`]: newDeviation,
            }));
        }

        handleDecimalValidation(key, val, point.master_least_count !== 'NA' ? point.master_least_count : point.least_count);

        if (handleInputChange) {
            handleInputChange(masterRowIdx, 12, val);
            handleInputChange(uucRowIdx, 13, newDeviation);
        }
    };

    if (calibPoints.length === 0) {
        return (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded mb-6 text-center text-gray-600 dark:text-gray-300">
                No calibration points available for Glass Thermometer (GTM) Observation.
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="overflow-x-auto border border-gray-300 dark:border-gray-600">
                <table className="w-full text-sm border-collapse bg-white dark:bg-gray-800">
                    <thead>
                        {/* Header Row 1 */}
                        <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold uppercase">
                            <th rowSpan={2} className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600 w-12">
                                Sr. No.
                            </th>
                            <th rowSpan={2} className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600 min-w-[110px]">
                                Set Point ({uucUnit})
                            </th>
                            <th rowSpan={2} className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600 min-w-[100px]">
                                Range
                            </th>
                            <th rowSpan={2} className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600 min-w-[80px]">
                                Value Of
                            </th>
                            <th rowSpan={2} className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600 min-w-[120px]">
                                Unit
                            </th>
                            <th rowSpan={2} className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600 min-w-[110px]">
                                Sensitivity Coefficient
                            </th>
                            <th colSpan={5} className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600">
                                Observation ()
                            </th>
                            <th rowSpan={2} className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600 min-w-[110px]">
                                Average (Ω)
                            </th>
                            <th rowSpan={2} className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600 min-w-[110px]">
                                Average ({uucUnit})
                            </th>
                            <th rowSpan={2} className="px-3 py-2 text-center min-w-[110px]">
                                Deviation ({uucUnit})
                            </th>
                        </tr>
                        {/* Header Row 2: Observation subheaders */}
                        <tr className="bg-gray-50 dark:bg-gray-600 border-b border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <th key={num} className="px-2 py-1 text-center border-r border-gray-300 dark:border-gray-600 w-20">
                                    {num}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-300 dark:divide-gray-600 text-gray-800 dark:text-gray-200">
                        {calibPoints.map((point, pointIdx) => {
                            const pointId = point.point_id?.toString() || point.id?.toString() || point.calibration_point_id?.toString() || (pointIdx + 1).toString();
                            const uucRowIdx = pointIdx * 2;
                            const masterRowIdx = pointIdx * 2 + 1;

                            const lc = (point.least_count_decimal_places !== undefined && point.least_count_decimal_places !== null && point.least_count_decimal_places !== 'NA')
                                ? parseInt(point.least_count_decimal_places, 10)
                                : getDecimalPlaces(point.least_count ?? point.matrix?.leastcount ?? '0.01');
                            const lcDec = typeof lc === 'number' ? lc : getDecimalPlaces(lc);

                            // Set Point Value
                            const rawPoint = point.set_point ?? point.point ?? '';
                            const setPointVal = rawPoint !== '' && !isNaN(parseFloat(rawPoint))
                                ? parseFloat(rawPoint).toFixed(lcDec)
                                : rawPoint;

                            // Range
                            const rangeKey = `${pointId}-range`;
                            const rangeVal = getValue(rangeKey, getValue(`range${pointId}`, getValue(`${uucRowIdx}-2`, point.range ?? '')));

                            // Unit
                            const pointUucUnit = point.unit || point.unit_description || point.unit_name || uucUnit;
                            const masterUnitKey = `${pointId}-masterunit`;
                            const masterUnitVal = getValue(masterUnitKey, getValue(`masterunit${pointId}`, getValue(`${masterRowIdx}-4`, point.master_unit_id?.toString() || point.master_unit_value?.toString() || point.master_unit || '12')));

                            // Sensitivity Coefficient
                            const sensKey = `${pointId}-sensitivitycoefficient`;
                            const sensVal = getValue(sensKey, getValue(`sensitivitycoefficient${pointId}`, getValue(`${masterRowIdx}-5`, point.sensitivity_coefficient ?? point.sensitivitycoefficient ?? '')));

                            // UUC Readings (0..4) - reading backend uuc_values array
                            const uucReadings = [0, 1, 2, 3, 4].map(idx => {
                                const k = `${pointId}-uuc-${idx}`;
                                const legK = `uu${idx}c${pointId}`;
                                const rowK = `${uucRowIdx}-${idx + 6}`;
                                return getValue(k, getValue(legK, getValue(rowK, point.uuc_values?.[idx] ?? point.uuc_observations?.[idx]?.value ?? point.uuc_observations?.[idx] ?? point.observations?.[idx]?.value ?? point.observations?.[idx] ?? '')));
                            });

                            // Master Readings (0..4) - reading backend master_values array
                            const masterReadings = [0, 1, 2, 3, 4].map(idx => {
                                const k = `${pointId}-master-${idx}`;
                                const legK = `maste${idx}r${pointId}`;
                                const rowK = `${masterRowIdx}-${idx + 6}`;
                                return getValue(k, getValue(legK, getValue(rowK, point.master_values?.[idx] ?? point.master_observations?.[idx]?.value ?? point.master_observations?.[idx] ?? '')));
                            });

                            // Calculated UUC Average
                            const validUucNums = uucReadings
                                .map(v => (v !== undefined && v !== null && String(v).trim() !== '') ? parseFloat(v) : NaN)
                                .filter(v => !isNaN(v));
                            const effectiveLcDec = getEffectiveDecimals(point, uucReadings, 'uuc');
                            let fallbackAvgUuc = point.average_uuc ?? point.averageuuc ?? '';
                            if (validUucNums.length > 0) {
                                fallbackAvgUuc = (validUucNums.reduce((sum, n) => sum + n, 0) / validUucNums.length).toFixed(effectiveLcDec);
                            }
                            const avgUucKey = `${pointId}-averageuuc`;
                            const avgUucVal = getValue(avgUucKey, getValue(`averageuuc${pointId}`, getValue(`${uucRowIdx}-12`, fallbackAvgUuc)));

                            // Calculated Master Average (Average Ω)
                            const validMasterNums = masterReadings
                                .map(v => (v !== undefined && v !== null && String(v).trim() !== '') ? parseFloat(v) : NaN)
                                .filter(v => !isNaN(v));
                            const effectiveMlcDec = getEffectiveDecimals(point, masterReadings, 'master');
                            let fallbackAvgMaster = point.average_master ?? point.averagemaster ?? '';
                            if (validMasterNums.length > 0) {
                                fallbackAvgMaster = (validMasterNums.reduce((sum, n) => sum + n, 0) / validMasterNums.length).toFixed(effectiveMlcDec);
                            }
                            const avgMasterKey = `${pointId}-averagemaster`;
                            const avgMasterVal = getValue(avgMasterKey, getValue(`averagemaster${pointId}`, getValue(`${masterRowIdx}-11`, fallbackAvgMaster)));

                            // Converted Average Master (caveragemaster)
                            const cAvgMasterKey = `${pointId}-caveragemaster`;
                            const cAvgMasterVal = getValue(cAvgMasterKey, getValue(`caveragemaster${pointId}`, getValue(`${masterRowIdx}-12`, point.converted_average_master ?? point.caveragemaster ?? '')));

                            // Calculated Deviation (Error) - only displayed if both UUC and Master Converted Average exist
                            const errorKey = `${pointId}-error`;
                            let errorVal = '';
                            if (avgUucVal !== '' && String(avgUucVal).trim() !== '' && cAvgMasterVal !== '' && String(cAvgMasterVal).trim() !== '') {
                                errorVal = getValue(errorKey, getValue(`error${pointId}`, getValue(`${uucRowIdx}-13`, point.error ?? '')));
                            }

                            return (
                                <React.Fragment key={`gtm-point-${pointId}`}>
                                    {/* ------------------------------------------------------------- */}
                                    {/* ROW 1: UUC ROW                                               */}
                                    {/* ------------------------------------------------------------- */}
                                    <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                        {/* 0: Sr. No. (Rowspan 2) */}
                                        <td rowSpan={2} className="px-3 py-2 text-center text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-gray-600">
                                            {pointIdx + 1}
                                        </td>

                                        {/* 1: Set Point (Rowspan 2) */}
                                        <td rowSpan={2} className="px-2 py-2 border-r border-gray-300 dark:border-gray-600">
                                            <input
                                                type="hidden"
                                                name="calibrationpoint[]"
                                                value={pointId}
                                            />
                                            <input
                                                type="hidden"
                                                name="type[]"
                                                value="setpoint"
                                            />
                                            <input
                                                type="hidden"
                                                name="repeatable[]"
                                                value="0"
                                            />
                                            <input
                                                type="text"
                                                name="value[]"
                                                id={`setpoint${pointId}`}
                                                readOnly
                                                value={setPointVal}
                                                className="w-full px-2 py-1 text-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 cursor-not-allowed"
                                            />
                                        </td>

                                        {/* 2: Range (Rowspan 2) */}
                                        <td rowSpan={2} className="px-2 py-2 border-r border-gray-300 dark:border-gray-600">
                                            <input
                                                type="hidden"
                                                name="calibrationpoint[]"
                                                value={pointId}
                                            />
                                            <input
                                                type="hidden"
                                                name="type[]"
                                                value="range"
                                            />
                                            <input
                                                type="hidden"
                                                name="repeatable[]"
                                                value="0"
                                            />
                                            <input
                                                type="text"
                                                name="value[]"
                                                id={`range${pointId}`}
                                                value={rangeVal}
                                                onChange={(e) => setInputValue(rangeKey, e.target.value, uucRowIdx, 2)}
                                                onBlur={(e) => {
                                                    if (handleObservationBlur) handleObservationBlur(uucRowIdx, 2, e.target.value, pointId);
                                                }}
                                                placeholder="Range"
                                                className="w-full px-2 py-1 text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </td>

                                        {/* 3: Value Of (UUC) - standard neutral text, no colored background */}
                                        <td className="px-3 py-2 text-center text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-gray-600">
                                            UUC
                                        </td>

                                        {/* 4: Unit (UUC Unit) */}
                                        <td className="px-3 py-2 text-center text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-gray-600">
                                            {pointUucUnit}
                                        </td>

                                        {/* 5: Sensitivity Coefficient (Dash for UUC) */}
                                        <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400 border-r border-gray-300 dark:border-gray-600">
                                            -
                                        </td>

                                        {/* 6-10: UUC Observations 1 to 5 */}
                                        {[0, 1, 2, 3, 4].map((obsIdx) => {
                                            const fieldKey = `${pointId}-uuc-${obsIdx}`;
                                            const hasErr = !!inputErrors[fieldKey];

                                            return (
                                                <td key={`uuc-obs-${obsIdx}`} className="px-1 py-1 border-r border-gray-300 dark:border-gray-600">
                                                    <input
                                                        type="hidden"
                                                        name="calibrationpoint[]"
                                                        value={pointId}
                                                    />
                                                    <input
                                                        type="hidden"
                                                        name="type[]"
                                                        value="uuc"
                                                    />
                                                    <input
                                                        type="hidden"
                                                        name="repeatable[]"
                                                        value={obsIdx.toString()}
                                                    />
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        name="value[]"
                                                        id={`uu${obsIdx}c${pointId}`}
                                                        value={uucReadings[obsIdx]}
                                                        onChange={(e) => handleUucReadingChange(pointId, obsIdx, e.target.value, point, uucRowIdx)}
                                                        onBlur={(e) => {
                                                            if (handleObservationBlur) handleObservationBlur(uucRowIdx, obsIdx + 6, e.target.value, pointId);
                                                        }}
                                                        placeholder={`Obs ${obsIdx + 1}`}
                                                        className={`w-full px-2 py-1 text-center bg-white dark:bg-gray-700 border ${hasErr ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                                                    />
                                                    {hasErr && (
                                                        <span className="text-[10px] text-red-500 block text-center mt-0.5 leading-tight">
                                                            {inputErrors[fieldKey]}
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        })}

                                        {/* 11: Average (Ω) - Dash for UUC */}
                                        <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400 border-r border-gray-300 dark:border-gray-600">
                                            -
                                        </td>

                                        {/* 12: Average (UUC Unit) - Readonly */}
                                        <td className="px-2 py-2 border-r border-gray-300 dark:border-gray-600">
                                            <input
                                                type="hidden"
                                                name="calibrationpoint[]"
                                                value={pointId}
                                            />
                                            <input
                                                type="hidden"
                                                name="type[]"
                                                value="averageuuc"
                                            />
                                            <input
                                                type="hidden"
                                                name="repeatable[]"
                                                value="0"
                                            />
                                            <input
                                                type="text"
                                                name="value[]"
                                                id={`averageuuc${pointId}`}
                                                readOnly
                                                value={avgUucVal}
                                                className="w-full px-2 py-1 text-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 cursor-not-allowed"
                                            />
                                        </td>

                                        {/* 13: Deviation (UUC Unit) - Rowspan 2 (Standard text, no colored highlights) */}
                                        <td rowSpan={2} className="px-2 py-2 border-gray-300 dark:border-gray-600">
                                            <input
                                                type="hidden"
                                                name="calibrationpoint[]"
                                                value={pointId}
                                            />
                                            <input
                                                type="hidden"
                                                name="type[]"
                                                value="error"
                                            />
                                            <input
                                                type="hidden"
                                                name="repeatable[]"
                                                value="0"
                                            />
                                            <input
                                                type="text"
                                                name="value[]"
                                                id={`error${pointId}`}
                                                readOnly
                                                value={errorVal}
                                                className="w-full px-2 py-1 text-center font-normal text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded cursor-not-allowed"
                                            />
                                        </td>
                                    </tr>

                                    {/* ------------------------------------------------------------- */}
                                    {/* ROW 2: MASTER ROW                                            */}
                                    {/* ------------------------------------------------------------- */}
                                    <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 border-b border-gray-300 dark:border-gray-600">
                                        {/* 3: Value Of (Master) - standard neutral text, no colored background */}
                                        <td className="px-3 py-2 text-center text-gray-800 dark:text-gray-200 border-r border-gray-300 dark:border-gray-600">
                                            Master
                                        </td>

                                        {/* 4: Master Unit (Dropdown select) */}
                                        {/* 4: Master Unit (Dropdown select showing description/symbol on table) */}
                                        <td className="px-2 py-2 border-r border-gray-300 dark:border-gray-600">
                                            <input
                                                type="hidden"
                                                name="calibrationpoint[]"
                                                value={pointId}
                                            />
                                            <input
                                                type="hidden"
                                                name="type[]"
                                                value="masterunit"
                                            />
                                            <input
                                                type="hidden"
                                                name="repeatable[]"
                                                value="0"
                                            />
                                            <div className="relative w-full">
                                                <div className="w-full px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 flex items-center justify-between pointer-events-none min-h-[30px]">
                                                    <span className="w-full text-center font-medium truncate">
                                                        {getSelectedUnitSymbol(masterUnitVal)}
                                                    </span>
                                                    <svg className="w-3.5 h-3.5 ml-1 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                                <select
                                                    name="value[]"
                                                    id={`masterunit${pointId}`}
                                                    value={
                                                        unitsList.find(u =>
                                                            String(u.value) === String(masterUnitVal) ||
                                                            String(u.id) === String(masterUnitVal) ||
                                                            String(u.symbol) === String(masterUnitVal) ||
                                                            String(u.unitDesc) === String(masterUnitVal) ||
                                                            String(u.label) === String(masterUnitVal)
                                                        )?.value || masterUnitVal
                                                    }
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setInputValue(masterUnitKey, val, masterRowIdx, 4);
                                                        if (setTableInputValues) {
                                                            setTableInputValues(prev => ({
                                                                ...prev,
                                                                [`masterunit${pointId}`]: val,
                                                                [`${masterRowIdx}-4`]: val,
                                                            }));
                                                        }
                                                        if (handleObservationBlur) handleObservationBlur(masterRowIdx, 4, val, pointId);
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    title={getSelectedUnitSymbol(masterUnitVal)}
                                                >
                                                    {unitsList.map((u) => (
                                                        <option key={u.value || u.label} value={u.value || u.unitDesc || u.label}>
                                                            {u.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>

                                        {/* 5: Sensitivity Coefficient */}
                                        <td className="px-2 py-2 border-r border-gray-300 dark:border-gray-600">
                                            <input
                                                type="hidden"
                                                name="calibrationpoint[]"
                                                value={pointId}
                                            />
                                            <input
                                                type="hidden"
                                                name="type[]"
                                                value="sensitivitycoefficient"
                                            />
                                            <input
                                                type="hidden"
                                                name="repeatable[]"
                                                value="0"
                                            />
                                            <input
                                                type="number"
                                                step="any"
                                                name="value[]"
                                                id={`sensitivitycoefficient${pointId}`}
                                                value={sensVal}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setInputValue(sensKey, val, masterRowIdx, 5);
                                                    if (setTableInputValues) {
                                                        setTableInputValues(prev => ({
                                                            ...prev,
                                                            [`sensitivitycoefficient${pointId}`]: val,
                                                            [`${masterRowIdx}-5`]: val,
                                                        }));
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    if (handleObservationBlur) handleObservationBlur(masterRowIdx, 5, e.target.value, pointId);
                                                }}
                                                placeholder="Sens. Coeff."
                                                className="w-full px-2 py-1 text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </td>

                                        {/* 6-10: Master Observations 1 to 5 */}
                                        {[0, 1, 2, 3, 4].map((obsIdx) => {
                                            const fieldKey = `${pointId}-master-${obsIdx}`;
                                            const hasErr = !!inputErrors[fieldKey];

                                            return (
                                                <td key={`master-obs-${obsIdx}`} className="px-1 py-1 border-r border-gray-300 dark:border-gray-600">
                                                    <input
                                                        type="hidden"
                                                        name="calibrationpoint[]"
                                                        value={pointId}
                                                    />
                                                    <input
                                                        type="hidden"
                                                        name="type[]"
                                                        value="master"
                                                    />
                                                    <input
                                                        type="hidden"
                                                        name="repeatable[]"
                                                        value={obsIdx.toString()}
                                                    />
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        name="value[]"
                                                        id={`maste${obsIdx}r${pointId}`}
                                                        value={masterReadings[obsIdx]}
                                                        onChange={(e) => handleMasterReadingChange(pointId, obsIdx, e.target.value, point, masterRowIdx)}
                                                        onBlur={(e) => {
                                                            if (handleObservationBlur) handleObservationBlur(masterRowIdx, obsIdx + 6, e.target.value, pointId);
                                                        }}
                                                        placeholder={`Obs ${obsIdx + 1}`}
                                                        className={`w-full px-2 py-1 text-center bg-white dark:bg-gray-700 border ${hasErr ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                                                    />
                                                    {hasErr && (
                                                        <span className="text-[10px] text-red-500 block text-center mt-0.5 leading-tight">
                                                            {inputErrors[fieldKey]}
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        })}

                                        {/* 11: Average (Ω) - Master Average (Readonly) */}
                                        <td className="px-2 py-2 border-r border-gray-300 dark:border-gray-600">
                                            <input
                                                type="hidden"
                                                name="calibrationpoint[]"
                                                value={pointId}
                                            />
                                            <input
                                                type="hidden"
                                                name="type[]"
                                                value="averagemaster"
                                            />
                                            <input
                                                type="hidden"
                                                name="repeatable[]"
                                                value="0"
                                            />
                                            <input
                                                type="text"
                                                name="value[]"
                                                id={`averagemaster${pointId}`}
                                                readOnly
                                                value={avgMasterVal}
                                                className="w-full px-2 py-1 text-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 cursor-not-allowed"
                                            />
                                        </td>

                                        {/* 12: Average (UUC Unit) - Converted Average Master (Editable) */}
                                        <td className="px-2 py-2 border-r border-gray-300 dark:border-gray-600">
                                            <input
                                                type="hidden"
                                                name="calibrationpoint[]"
                                                value={pointId}
                                            />
                                            <input
                                                type="hidden"
                                                name="type[]"
                                                value="caveragemaster"
                                            />
                                            <input
                                                type="hidden"
                                                name="repeatable[]"
                                                value="0"
                                            />
                                            <input
                                                type="number"
                                                step="any"
                                                name="value[]"
                                                id={`caveragemaster${pointId}`}
                                                value={cAvgMasterVal}
                                                onChange={(e) => handleCAvgMasterChange(pointId, e.target.value, point, masterRowIdx, uucRowIdx)}
                                                onBlur={(e) => {
                                                    if (handleObservationBlur) handleObservationBlur(masterRowIdx, 12, e.target.value, pointId);
                                                }}
                                                placeholder={`Avg (${pointUucUnit})`}
                                                className="w-full px-2 py-1 text-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ObservationGTM;