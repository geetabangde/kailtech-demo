import { useState, useEffect, useCallback } from 'react';
import { Button } from "components/ui";
import { useNavigate, useParams, useSearchParams, Link } from "react-router";
import axios from 'axios';
import { toast } from "sonner";
import { JWT_HOST_API } from "configs/auth.config";

export default function CalibrationReport() {
  const navigate = useNavigate();
  const { inwardid: pathInwardid, instid: pathInstid, id: pathId, itemId: pathItemId } = useParams();
  const [searchParams] = useSearchParams();

  // Extract parameters from multiple sources - CORRECTED ORDER
  const extractParams = () => {
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);

    // Method 1: From useParams (path parameters) - CORRECTED
    let inwardid = pathInwardid || pathId; // First parameter is inwardid
    let instid = pathInstid || pathItemId; // Second parameter is instid

    // Method 2: From search params
    if (!instid) instid = searchParams.get("instid");
    if (!inwardid) inwardid = searchParams.get("inwardid");

    // Method 3: Extract from URL pattern manually - CORRECTED
    // URL pattern: view-rawdata/3661/50294 where 3661=inwardid, 50294=instid
    const urlMatch = currentUrl.match(/view-rawdata\/(\d+)\/(\d+)/);
    if (urlMatch) {
      if (!inwardid) inwardid = urlMatch[1]; // First number is inwardid
      if (!instid) instid = urlMatch[2];     // Second number is instid
    }

    // Method 4: Look for hakuna/matata pattern (from third image)
    const hakunaMatch = currentUrl.match(/hakuna=(\d+)/);
    const matataMatch = currentUrl.match(/matata=(\d+)/);
    if (hakunaMatch && !instid) instid = hakunaMatch[1];
    if (matataMatch && !inwardid) inwardid = matataMatch[1];

    return { instid, inwardid };
  };

  const { instid, inwardid } = extractParams();
  const caliblocation = searchParams.get("caliblocation") || "Lab";
  const calibacc = searchParams.get("calibacc") || "Nabl";

  console.log('Extracted Parameters:', { instid, inwardid, caliblocation, calibacc });

  const reportUrl = inwardid && instid
    ? `/dashboards/calibration-process/inward-entry-lab/view-rawdata/${inwardid}/${instid}?caliblocation=${caliblocation}&calibacc=${calibacc}`
    : `${window.location.pathname}${window.location.search}`;

  // State management
  const [equipmentData, setEquipmentData] = useState({});
  const [calibratedByImageUrl, setCalibratedByImageUrl] = useState('');
  const [calibratedByTextImage, setCalibratedByTextImage] = useState('');
  const [approvedByImageUrl, setApprovedByImageUrl] = useState('');
  const [approvedByTextImage, setApprovedByTextImage] = useState('');
  const [masterData, setMasterData] = useState([]);
  const [results, setResults] = useState([]);
  const [observationData, setObservationData] = useState([]);
  const [observationType, setObservationType] = useState('');
  const [thermalCoeff, setThermalCoeff] = useState({});
  const [parallelism, setParallelism] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawdata, setRawdata] = useState({});

  const [dynamicObservations, setDynamicObservations] = useState([]);
  const [biomedicalRawData, setBiomedicalRawData] = useState(null);
  const [observationTemplate, setObservationTemplate] = useState('');
  const [tableStructure, setTableStructure] = useState(null);
  const [diagram, setDiagram] = useState('');
  const [instrumentInfo, setInstrumentInfo] = useState(null);
  const [itemStatus, setItemStatus] = useState(null);

  // Configure axios defaults
  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    axios.defaults.headers.common['Content-Type'] = 'application/json';
    axios.defaults.headers.common['Accept'] = 'application/json';

    axios.interceptors.request.use(
      (config) => {
        console.log('API Request:', config);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          console.error('Authentication failed. Please login again.');
          toast.error('Authentication failed. Please login again.');
        } else if (error.response?.status === 403) {
          console.error('Access forbidden. Insufficient permissions.');
          toast.error('Access forbidden. Insufficient permissions.');
        }
        return Promise.reject(error);
      }
    );
  }, []);

  // Helper functions
  const safeGetValue = (item) => {
    if (item === null || item === undefined || item === '') return '';
    if (typeof item === 'object' && item !== null) {
      return item.value !== null && item.value !== undefined ? item.value : '';
    }
    return item.toString();
  };

  const safeGetArray = (item, defaultLength = 0) => {
    if (!item) return Array(defaultLength).fill('');
    if (Array.isArray(item)) return item;
    if (typeof item === 'string') return [item];
    return Array(defaultLength).fill('');
  };

  const formatValueByLc = (val, decimals, leastCount) => {
    const raw = safeGetValue(val);
    if (raw === null || raw === undefined || raw === '' || raw === 'NA' || raw === 'na') return raw;
    let d = null;
    if (decimals !== null && decimals !== undefined && decimals !== 'NA' && decimals !== '') {
      const parsed = parseInt(decimals, 10);
      if (!isNaN(parsed)) d = parsed;
    }
    if (d === null && leastCount !== null && leastCount !== undefined && leastCount !== 'NA' && leastCount !== '') {
      const str = String(leastCount).trim();
      const match = str.match(/\.([0-9]+)/);
      if (match) {
        d = match[1].length;
      } else if (!isNaN(parseFloat(str))) {
        d = 0;
      }
    }
    if (d === null) return raw;

    if (typeof raw === 'string' && raw.includes('/')) {
      return raw.split('/').map(v => {
        const num = parseFloat(v);
        if (isNaN(num)) return v.trim();
        let res = num.toFixed(d);
        if (parseFloat(res) === 0) res = res.replace(/^-/, '');
        return res;
      }).join('/');
    }

    const n = parseFloat(raw);
    if (isNaN(n)) return raw;
    let res = n.toFixed(d);
    if (parseFloat(res) === 0) res = res.replace(/^-/, '');
    return res;
  };

  const getObservationValueByType = (point, type, repeatable = 0) => {
    const repeatableString = repeatable.toString();
    const candidates = [
      point?.observations,
      point?.summary,
      point?.values,
      point?.saved_values,
      point?.savedValues,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        const match = candidate.find(
          (item) => item?.type === type && item?.repeatable?.toString() === repeatableString
        );
        if (match) return safeGetValue(match.value);
      } else if (candidate && typeof candidate === 'object') {
        const keyed = candidate[type];
        if (Array.isArray(keyed)) return safeGetValue(keyed[repeatable]);
        if (keyed && typeof keyed === 'object') {
          return safeGetValue(keyed[repeatable] ?? keyed[repeatableString] ?? keyed.value);
        }
        if (repeatable === 0 && keyed !== undefined) return safeGetValue(keyed);
      }
    }

    const directMap = {
      setpoint: point?.setpoint ?? point?.set_point ?? point?.point ?? point?.test_point,
      calculateduuc: point?.calculateduuc ?? point?.calculated_uuc ?? point?.std_at_reference_temp,
      uuc: point?.uuc ?? point?.uuc0 ?? point?.std_room_temp,
      averagemaster: point?.averagemaster ?? point?.average_master ?? point?.mean,
      error: point?.error,
      percenterror: point?.percenterror ?? point?.percent_error,
      repeatability: point?.repeatability ?? point?.repeatability_error,
      removalforce: point?.removalforce ?? point?.removal_force,
      zeroerror: point?.zeroerror ?? point?.zero_error,
      relativeres: point?.releativeres ?? point?.relative_resolution,
      classofmachine: point?.classofmachine ?? point?.class_of_machine,
      dialguageseting: point?.dialguageseting ?? point?.dial_gauge_setting,
    };

    if (type === 'master') {
      const masterValues = point?.master_values ?? point?.master_readings ?? point?.observed_f ?? point?.observations;
      if (Array.isArray(masterValues)) return safeGetValue(masterValues[repeatable]);
      if (masterValues && typeof masterValues === 'object') {
        return safeGetValue(masterValues[repeatable] ?? masterValues[repeatableString] ?? masterValues[`m${repeatable + 1}`]);
      }
    }

    const directValue = directMap[type];
    if (Array.isArray(directValue)) return safeGetValue(directValue[repeatable]);
    if (directValue && typeof directValue === 'object') {
      return safeGetValue(directValue[repeatable] ?? directValue[repeatableString] ?? directValue.value);
    }
    return repeatable === 0 ? safeGetValue(directValue) : '';
  };

  const normalizeUtmGroups = (observationData) => {
    const source = Array.isArray(observationData) ? observationData : [observationData].filter(Boolean);
    return source.flatMap((item, index) => {
      const calibrationPoints =
        item?.calibration_points ||
        item?.calibrationPoints ||
        item?.points ||
        item?.observations ||
        (item?.point_id || item?.id ? [item] : []);

      if (Array.isArray(calibrationPoints) && calibrationPoints.length > 0) {
        return [{
          matrixId: safeGetValue(item?.matrix_id ?? item?.matrixid ?? item?.id ?? `matrix-${index + 1}`),
          matrixType: item?.matrixtype || item?.matrix_type || item?.name || '',
          leastCount: item?.leastcount ?? item?.least_count ?? item?.matrix?.leastcount,
          minPoint: item?.minpoint ?? item?.min_point,
          maxPoint: item?.maxpoint ?? item?.max_point,
          classOfMachine: item?.classofmachine ?? item?.class_of_machine,
          dialGaugeSetting: item?.dialguageseting ?? item?.dial_gauge_setting,
          calibrationPoints,
          raw: item,
        }];
      }

      return [];
    });
  };

  const applyTemperatureCompensation = (calculatedUuc) => {
    // Fallback to 23 if roomTemperature is not easily available in ViewRawData context
    const avgTemp = 23;
    const numCalculatedUuc = parseFloat(calculatedUuc);
    if (!isNaN(numCalculatedUuc) && !isNaN(avgTemp)) {
      const compensated = (0.00027 * (avgTemp - 23) + 1) * numCalculatedUuc;
      return compensated.toFixed(1);
    }
    return calculatedUuc;
  };

  const getCustomLayoutIndices = (instrument) => {
    if (!instrument) return null;
    let colIdx = 1;

    let hasParameter = instrument.parametertoshow === "Yes";
    let paramIdx = hasParameter ? colIdx++ : -1;

    let hasSpecification = instrument.specificationtoshow === "Yes";
    let specIdx = hasSpecification ? colIdx++ : -1;

    let masterdone = false;
    let uucdone = false;

    const masterCount = parseInt(instrument.master || 1);
    const uucCount = parseInt(instrument.uuc || 1);

    let hasSetpoint = instrument.setpointtoshow === "Yes";
    let setpointIdx = -1;

    if (hasSetpoint) {
      setpointIdx = colIdx++;
      if (instrument.setpoint === "Master") {
        masterdone = true;
      } else if (instrument.setpoint === "UUC") {
        uucdone = true;
      }
    }

    let masterObsIndices = [];
    let avgMasterIdx = -1;
    let uucObsIndices = [];
    let avgUucIdx = -1;

    const pushMaster = () => {
      for (let i = 0; i < masterCount; i++) masterObsIndices.push(colIdx++);
      if (masterCount > 1) avgMasterIdx = colIdx++;
      masterdone = true;
    };

    const pushUuc = () => {
      for (let i = 0; i < uucCount; i++) uucObsIndices.push(colIdx++);
      if (uucCount > 1) avgUucIdx = colIdx++;
      uucdone = true;
    };

    if (instrument.mastertoshow === "Yes" && !masterdone && masterCount <= uucCount) {
      pushMaster();
    }

    if (instrument.uuctoshow === "Yes" && !uucdone) {
      pushUuc();
    }

    if (instrument.mastertoshow === "Yes" && !masterdone) {
      pushMaster();
    }

    let hasError = instrument.errortoshow === "Yes";
    let errorIdx = hasError ? colIdx++ : -1;

    let hasRemark = instrument.remarktoshow === "Yes";
    let remarkIdx = hasRemark ? colIdx++ : -1;

    return {
      paramIdx, specIdx, setpointIdx,
      masterObsIndices, avgMasterIdx,
      uucObsIndices, avgUucIdx,
      errorIdx, remarkIdx,
      totalCols: colIdx
    };
  };

  const getObservationCustomStructure = (instrument) => {
    if (!instrument) {
      return { singleHeaders: [], subHeaders: {}, remainingHeaders: [] };
    }

    const singleHeaders = [];
    const subHeaders = {};
    const remainingHeaders = [];

    singleHeaders.push("Sr. No.");

    if (instrument.parametertoshow === "Yes") {
      singleHeaders.push(instrument.parameterheading || "Parameter");
    }

    if (instrument.specificationtoshow === "Yes") {
      singleHeaders.push(instrument.specificationheading || "Specification");
    }

    let masterdone = false;
    let uucdone = false;

    const masterCount = parseInt(instrument.master || 1);
    const uucCount = parseInt(instrument.uuc || 1);

    if (instrument.setpointtoshow === "Yes") {
      if (instrument.setpoint === "Separate") {
        singleHeaders.push(instrument.setpointheading || "Set Point");
      } else if (instrument.setpoint === "Master") {
        singleHeaders.push(instrument.masterheading || "Master");
        masterdone = true;
      } else if (instrument.setpoint === "UUC") {
        singleHeaders.push(instrument.uucheading || "UUC");
        uucdone = true;
      }
    }

    const isMultiRow = (masterCount > 1 || uucCount > 1);

    const addMasterObservations = () => {
      if (masterCount > 1) {
        let obsArray = [];
        for (let i = 1; i <= masterCount; i++) obsArray.push(`Observation ${i}`);
        obsArray.push("Average On Master");
        subHeaders[instrument.masterheading || "Master Observations"] = obsArray;
      } else {
        singleHeaders.push(instrument.masterheading || "Master Observations");
      }
      masterdone = true;
    };

    const addUucObservations = () => {
      if (uucCount > 1) {
        let obsArray = [];
        for (let i = 1; i <= uucCount; i++) obsArray.push(`Observation ${i}`);
        obsArray.push("Average On UUC");
        subHeaders[instrument.uucheading || "UUC Observations"] = obsArray;
      } else {
        singleHeaders.push(instrument.uucheading || "UUC Observations");
      }
      uucdone = true;
    };

    if (instrument.mastertoshow === "Yes" && !masterdone && masterCount <= uucCount) {
      addMasterObservations();
    }

    if (instrument.uuctoshow === "Yes" && !uucdone) {
      addUucObservations();
    }

    if (instrument.mastertoshow === "Yes" && !masterdone) {
      addMasterObservations();
    }

    if (instrument.errortoshow === "Yes") {
      if (isMultiRow) {
        remainingHeaders.push("Error");
      } else {
        singleHeaders.push("Error");
      }
    }

    if (instrument.remarktoshow === "Yes") {
      if (isMultiRow) {
        remainingHeaders.push(instrument.remarkheading || "Remark");
      } else {
        singleHeaders.push(instrument.remarkheading || "Remark");
      }
    }

    return {
      singleHeaders,
      subHeaders,
      remainingHeaders
    };
  };

  const observationTables = [
    {
      id: 'observationbiomedical',
      name: 'Biomedical Observation',
      category: 'Biomedical',
      structure: {
        singleHeaders: ['Sr. No.', 'Parameter', 'Mode', 'Set Point'],
        subHeaders: {
          'Reading on UUC': ['1', '2', '3', '4', '5'],
          'Reading on Master': ['1', '2', '3', '4', '5'],
        },
        remainingHeaders: ['Average UUC', 'Average Master', 'Deviation', 'Tolerance', 'Expanded Uncertainty', 'Remark'],
      },
    },
    {
      id: 'observationcustom',
      name: 'Observation Custom',
      category: 'Custom',
      structure: getObservationCustomStructure(rawdata?.listInstrument),
    },
    {
      id: 'observationth',
      name: 'Observation TH',
      category: 'Thermohydrometer',
      structure: {
        singleHeaders: ['Sr no', 'Value Shown on', 'Range', 'nominal Value', 'Unit'],
        subHeaders: {
          'Observation on UUC / Master': ['1', '2', '3', '4', '5']
        },
        remainingHeaders: ['Mean', 'Error']
      }
    },
    {
      id: 'observationwbn',
      name: 'Observation WBN (Weighing, Rep, Ecc)',
      category: 'Weighing Balance',
      structure: {
        singleHeaders: ['Sr. No.', 'Nominal Value'],
        subHeaders: {
          'Weighing Process': ['W1', 'W2', 'W3', 'W-Avg', 'Error'],
          'Repeatability': ['R1', 'R2', 'R3', 'R4', 'R5', 'R-Avg'],
          'Eccentricity CW': ['CW1', 'CW2', 'CW3', 'CW4', 'CW5'],
          'Eccentricity ACW': ['ACW1', 'ACW2', 'ACW3', 'ACW4', 'ACW5']
        },
        remainingHeaders: ['Ecc D']
      },
    },
    {
      id: 'observationwwbn',
      name: 'Observation WWBN (Uncertainty)',
      category: 'Weighing Balance',
      structure: {
        singleHeaders: ['Sr No'],
        subHeaders: {
          'Readings': ['1', '2', '3', '4', '5'],
          'Type A Factor': ['Unit', 'Calibration point', 'Average(g)', 'Std Deviation', 'Type A'],
          'Type B Factor': ['Drift in mass(g)', 'Eccentricity (g)', 'Uncertainty of master (g)', 'Least Count (g)'],
          'Uncertainty Measurement': [
            'Combined Uncertainty',
            'Degree of Freedom',
            'Coverage Factor (k)',
            'Expanded Uncertainty (g)',
            'Expanded Uncertainty (mg)',
            'CMC Taken'
          ]
        },
        remainingHeaders: []
      },
    },
    {
      id: 'observationdw',
      name: 'Observation DW',
      category: 'Dead Weight',
      structure: {
        singleHeaders: [
          'Sr no',
          'cycle no',
          'Nominal Value Of UUC(g)',
          'Density of UUC Weight, ρr (g/cm³)'
        ],
        subHeaders: {
          'Measured mass value(gm)': ['S1(g)', 'U1(g)', 'U2(g)', 'S2(g)']
        },
        remainingHeaders: ['Diff.,∆m{(U1-S1)+U2-S2)}/2', 'Avg.Diff.(g)'],
      },
    },
    {
      id: 'observationdpg',
      name: 'Observation DPG',
      category: 'Pressure',
      structure: {
        singleHeaders: [
          'SR NO',
          'SET PRESSURE ON UUC (CALCULATIONUNIT)',
          'SET PRESSURE ON UUC (MASTERUNIT)',
        ],
        subHeaders: {
          'OBSERVATION ON MASTER (MASTERUNIT)': ['M1', 'M2', 'M3'],
        },
        remainingHeaders: ['MEAN (UUCUNIT)', 'ERROR (UUCUNIT)', 'REPEATABILITY (UUCUNIT)', 'HYSTERISIS (UUCUNIT)'],
      },
    },
    {
      id: 'observationuc',
      name: 'Observation UC',
      category: 'Uncertainty',
      structure: {
        singleHeaders: ['Sr. No.', 'Unit Type', 'Range', 'Nominal/ Set Value (Calculated)', 'Nominal/ Set Value'],
        subHeaders: {
          'Observation': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5']
        },
        remainingHeaders: ['Average', 'Error']
      },
    },
    {
      id: 'observationppg',
      name: 'Observation PPG',
      category: 'Pressure',
      structure: {
        singleHeaders: [
          'SR NO',
          'SET PRESSURE ON UUC (CALCULATIONUNIT)',
          'SET PRESSURE ON UUC (MASTERUNIT)',
        ],
        subHeaders: {
          'OBSERVATION ON MASTER (MASTERUNIT)': ['M1 (↑)', 'M2 (↓)', 'M3 (↑)', 'M4 (↓)', 'M5 (↑)', 'M6 (↓)'],
        },
        remainingHeaders: ['MEAN (UUCUNIT)', 'ERROR (UUCUNIT)', 'REPEATABILITY (UUCUNIT)', 'HYSTERISIS (UUCUNIT)'],
      },
    },
    {
      id: 'observationavg',
      name: 'Observation AVG',
      category: 'Pressure',
      structure: {
        singleHeaders: [
          'Sr no',
          'Set Pressure on UUC (UUC Unit)',
          '[Set Pressure on UUC (Master Unit)]'
        ],
        subHeaders: {
          'Observation on Master': ['M1', 'M2']
        },
        remainingHeaders: [
          'Mean (Master Unit)',
          'Error (Master Unit)',
          'Hysteresis (Master Unit)'
        ]
      },
    },
    {
      id: 'observationexm',
      name: 'Observation EXM',
      category: 'External Micrometer',
      structure: {
        thermalCoeff: true,
        singleHeaders: ['Sr. No.', 'Nominal/ Set Value'],
        subHeaders: {
          'Observation on UUC': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5']
        },
        remainingHeaders: ['Average', 'Error']
      },
    },
    {
      id: 'observationmm',
      name: 'Observation MM',
      category: 'Multimeter',
      structure: {
        singleHeaders: ['Sr. No.', 'Mode', 'Range', 'Nominal/ Set Value on master (Calculated)', 'Nominal/ Set Value on master'],
        subHeaders: {
          'Observation on UUC': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5']
        },
        remainingHeaders: ['Average', 'Error']
      },
    },
    {
      id: 'observationes',
      name: 'Observation ES',
      category: 'Medical/Electrical Safety',
      structure: {
        singleHeaders: ['Sr. No.', 'Mode', 'Parameter', 'Set Point', 'Reading (UUC/Master)'],
        subHeaders: {
          'Readings (Master/UUC)': ['Reading 1', 'Reading 2', 'Reading 3', 'Reading 4', 'Reading 5']
        },
        remainingHeaders: ['Average', 'Error', 'Tolerance']
      }
    },
    {
      id: 'observationodfm',
      name: 'Observation ODFM',
      category: 'Flow Meter',
      structure: {
        singleHeaders: [
          'Sr. No.',
          'Range (UUC Unit)',
          'Nominal/ Set Value UUC (UUC Unit)',

        ],
        subHeaders: {
          'Observation on Master': [
            'Observation 1 (Master Unit)',
            'Observation 2 (Master Unit)',
            'Observation 3 (Master Unit)',
            'Observation 4 (Master Unit)',
            'Observation 5 (Master Unit)',
          ],
        },
        remainingHeaders: ['Average (Master Unit)',
          'Error (Master Unit)',],
      },
    },
    {
      id: 'observationapg',
      name: 'Observation APG',
      category: 'Pressure',
      structure: {
        singleHeaders: ['Sr no', 'Set Pressure on UUC (kg/cm²)', 'Set Pressure on UUC (bar)'],
        subHeaders: {
          'Observations on Master (bar)': ['M1', 'M2'],
        },
        remainingHeaders: ['Mean (bar)', 'Error (bar)', 'Hysterisis (bar)'],
      },
    },
    {
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
    },
    {
      id: 'observationvc',
      name: 'Observation VC',
      category: 'Vernier Caliper',
      structure: {
        isMatrix: true,
        thermalCoeff: true,
        singleHeaders: ['Sr. No.', 'Nominal/ Set Value'],
        subHeaders: {
          'Observation on UUC': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5'],
        },
        remainingHeaders: ['Average', 'Error'],
      },
    },
    {
      id: 'observationit',
      name: 'Observation IT',
      category: 'Internal Thread',
      structure: {
        thermalCoeff: true,
        singleHeaders: ['Sr. No.', 'Nominal/ Set Value'],
        subHeaders: {
          'Observation on UUC': [
            'Observation 1',
            'Observation 2',
            'Observation 3',
            'Observation 4',
            'Observation 5'
          ]
        },
        remainingHeaders: ['Average', 'Error']
      },
    },
    {
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
            'Observation 5'
          ]
        },
        remainingHeaders: ['Average in (mm)', 'Error in (mm)']
      },
    },
    {
      id: 'observationmg',
      name: 'Observation MG',
      category: 'Manometer',
      structure: {
        singleHeaders: [
          'Sr no',
          'Set Pressure on UUC ([unit])',
          '[Set Pressure on UUC ([master unit])]'
        ],
        subHeaders: {
          'Observation on UUC': ['M1', 'M2']
        },
        remainingHeaders: [
          'Mean ([master unit])',
          'Error ([master unit])',
          'Hysterisis ([master unit])'
        ]
      },
    },
    {
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
            'Observation 5 (Master)'
          ]
        },
        remainingHeaders: ['Average (Master)', 'Error']
      },
    },
    {
      id: 'observationhg',
      name: 'Observation HG',
      category: 'Height Gauge',
      structure: {
        thermalCoeff: true,
        singleHeaders: ['Sr. No.', 'Nominal/ Set Value'],
        subHeaders: {
          'Observation on UUC': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5']
        },
        remainingHeaders: ['Average', 'Error']
      }
    },
    {
      id: 'observationrtdwi',
      name: 'Observation RTD WI',
      category: 'RTD',
      structure: {
        singleHeaders: ['Sr. No.', 'Set Point (°C)', 'Value Of', 'Unit', 'Sensitivity Coefficient'],
        subHeaders: {
          'Observation': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5']
        },
        remainingHeaders: ['Average', 'mV generated On ambient', 'Average with corrected mv', 'Average (°C)', 'Deviation (°C)'] // REORDERED
      },
    },
    {
      id: 'observationmsr',
      name: 'Observation MSR',
      category: 'Measuring',
      structure: {
        thermalCoeff: true,
        singleHeaders: ['Sr. No.', 'Nominal/ Set Value'],
        subHeaders: {
          'Observation on UUC': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5']
        },
        remainingHeaders: ['Average', 'Error']
      },
    },
    {
      id: 'observationtm',
      name: 'Observation TM',
      category: 'Temperature Mapping',
      structure: {
        singleHeaders: ['Sr. No.', 'Parameter', 'Nominal/ Set Value', 'Range', 'Value Shown on'],
        subHeaders: {
          'Observation (1&6)': [],
          'Observation (2&7)': [],
          'Observation (3&8)': [],
          'Observation (4&9)': [],
          'Observation (5&10)': []
        },
        remainingHeaders: ['Average', 'Error']
      }
    },
    {
      id: 'observationgtm',
      name: 'Observation GTM',
      category: 'Temperature',
      structure: {
        singleHeaders: ['Sr. No.', 'Set Point (°C)', 'Value Of', 'Range', 'Unit', 'Sensitivity Coefficient'],
        subHeaders: {
          'Observation': ['Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5']
        },
        remainingHeaders: ['Average (Ω)', 'Average (°C)', 'Deviation (°C)']
      },
    },
    {
      id: 'observationutm',
      name: 'Observation UTM',
      category: 'Force',
      structure: {
        singleHeaders: [
          'Sr. No.',
          'Force (F)',
          'Std. at 23/24 +/-1 C',
          'Std. at Room Temp (C)'
        ],
        subHeaders: {
          'Observed (F)': ['Position 0° / Obs 1', 'Position 120° / Obs 2', 'Position 240° / Obs 3']
        },
        remainingHeaders: ['Mean (Fi)', 'Error (q)', '% Error (q)', '% Repeatability Error (q)']
      },
    },
    {
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
          'Error (mm)': ['Error Forward Reading', 'Error Backward Reading']
        },
        remainingHeaders: ['Hysterisis']
      },
    },
    {
      id: 'observationts',
      name: 'Observation TS',
      category: 'Test Sieve',
      structure: {
        thermalCoeff: true,
        singleHeaders: ['Sr no'],
        subHeaders: {
          'Aperture Size on Warp Side(in µm/mm)': [
            'Aperture Size (1)',
            'Aperture Size (2)',
            'Aperture Size (3)',
            'Aperture Size (4)',
          ],
          'Aperture Size on Weft Side(in µm/mm)': [
            'Aperture Size (1)',
            'Aperture Size (2)',
            'Aperture Size (3)',
            'Aperture Size (4)',
          ],
        },
        remainingHeaders: ['Average Aperture'],
      },
    },
    {
      id: 'observationsw',
      name: 'Observation SW',
      category: 'Stop Watch',
      structure: {
        singleHeaders: ['Sr no', 'Setpoint'],
        subHeaders: {
          'Observation on UUC': ['1', '2', '3', '4', '5'],
          'Observation on Master': ['1', '2', '3', '4', '5'],
        },
        remainingHeaders: ['Average UUC', 'Average Master', 'Error', 'Uncertainty'],
      },
    },
    {
      id: 'observationwb',
      name: 'Observation WB',
      category: 'Weighing Balance',
      structure: {
        singleHeaders: ['Sr. No.', 'Nominal Value'],
        subHeaders: {
          'Weighing Process': ['W1', 'W2', 'W3', 'W-Avg', 'Error'],
          'Repeatability': ['R1', 'R2', 'R3', 'R4', 'R5', 'R-Avg'],
          'Eccentricity CW': ['CW1', 'CW2', 'CW3', 'CW4', 'CW5'],
          'Eccentricity ACW': ['ACW1', 'ACW2', 'ACW3', 'ACW4', 'ACW5']
        },
        remainingHeaders: ['Ecc D']
      },
    },
  ];


  const createObservationRows = useCallback((observationData, template, currentRawdata = {}) => {
    if (!observationData) return { rows: [], matrixGroups: [], unitTypes: [], modes: [] };

    let dataArray = [];
    let matrixGroups = [];
    let unitTypes = [];
    let modes = [];

    if (Array.isArray(observationData)) {
      dataArray = observationData;
    } else if (typeof observationData === 'object' && observationData !== null) {
      if (observationData.data && Array.isArray(observationData.data)) {
        dataArray = observationData.data;
      } else if (observationData.points && Array.isArray(observationData.points)) {
        dataArray = observationData.points;
      } else if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
        dataArray = observationData.calibration_points;
      } else {
        dataArray = [observationData];
      }
    }

    const rows = [];
    const hiddenInputs = {
      values: [],
      calibrationPoints: [],
      repeatables: []
    };

    if (template === 'observationbiomedical') {
      dataArray.forEach((point, index) => {
        const uucReadings = safeGetArray(point?.uuc_readings, 5);
        const masterReadings = safeGetArray(point?.master_readings, 5);

        rows.push([
          (index + 1).toString(),
          safeGetValue(point?.parameter),
          safeGetValue(point?.mode),
          `${safeGetValue(point?.set_point)}${point?.set_point_unit ? ` ${point.set_point_unit}` : ''}`,
          ...Array.from({ length: 5 }, (_, readingIndex) => formatValueByLc(uucReadings[readingIndex], point?.lc_decimals, point?.least_count)),
          ...Array.from({ length: 5 }, (_, readingIndex) => formatValueByLc(masterReadings[readingIndex], point?.mlc_decimals, point?.master_least_count)),
          formatValueByLc(point?.average_uuc, point?.lc_decimals, point?.least_count),
          formatValueByLc(point?.average_master, point?.mlc_decimals, point?.master_least_count),
          formatValueByLc(point?.deviation, point?.lc_decimals, point?.least_count),
          safeGetValue(point?.tolerance),
          safeGetValue(point?.expanded_uncertainty),
          safeGetValue(point?.remark),
        ]);
      });
    } else if (template === 'observationcustom') {
      const instrumentSettings = currentRawdata?.listInstrument || observationData?.instrument_settings || observationData?.[0]?.instrument_settings;
      const layout = getCustomLayoutIndices(instrumentSettings);
      if (layout) {
        dataArray.forEach((point, index) => {
          if (!point) return;

          const summary = point.summary_data || point.summary || point.observations || point;

          const uucLc = point?.matrix?.leastcount ?? point?.least_count ?? point?.leastcount;
          const masterLc = point?.master_matrix?.leastcount ?? point?.master_least_count ?? point?.masterleastcount;

          const getDec = (lc) => {
            if (!lc || lc === 'NA' || lc === 'No' || isNaN(parseFloat(lc))) return null;
            const parts = lc.toString().split('.');
            return parts.length > 1 ? parts[1].length : 0;
          };

          const uucDecimals = getDec(uucLc);
          const masterDecimals = getDec(masterLc);

          let errorDecimals = 0;
          if (masterDecimals !== null && uucDecimals !== null) {
            errorDecimals = Math.max(masterDecimals, uucDecimals);
          } else if (masterDecimals !== null) {
            errorDecimals = masterDecimals;
          } else if (uucDecimals !== null) {
            errorDecimals = uucDecimals;
          }

          const row = Array(layout.totalCols).fill('');
          row[0] = point.sr_no?.toString() || (index + 1).toString();

          if (layout.paramIdx !== -1) row[layout.paramIdx] = safeGetValue(
            summary.parameter?.[0]?.value ?? point.parameter ?? point.unittype ?? point.matrix?.unittype
          );

          if (layout.specIdx !== -1) row[layout.specIdx] = safeGetValue(
            summary.specification?.[0]?.value ?? point.specification
          );

          if (layout.setpointIdx !== -1) {
            const isMasterSp = instrumentSettings?.setpoint === 'Master';
            const spDec = isMasterSp ? masterDecimals : uucDecimals;
            const spLc = isMasterSp ? masterLc : uucLc;
            const rawSp = point.point ?? summary.setpoint?.[0]?.value ?? summary.master?.[0]?.value ?? summary.uuc?.[0]?.value;
            row[layout.setpointIdx] = formatValueByLc(rawSp, spDec, spLc);
          }

          const masterVals = [...(summary.master ?? point.master ?? [])].sort(
            (a, b) => Number(a?.repeatable ?? 0) - Number(b?.repeatable ?? 0)
          );
          layout.masterObsIndices.forEach((idx, i) => {
            row[idx] = formatValueByLc(masterVals[i]?.value ?? masterVals[i], masterDecimals, masterLc);
          });
          if (layout.avgMasterIdx !== -1) row[layout.avgMasterIdx] = formatValueByLc(
            summary.averagemaster?.[0]?.value ?? point.averagemaster, masterDecimals, masterLc
          );

          const uucVals = [...(summary.uuc ?? point.uuc ?? [])].sort(
            (a, b) => Number(a?.repeatable ?? 0) - Number(b?.repeatable ?? 0)
          );
          layout.uucObsIndices.forEach((idx, i) => {
            row[idx] = formatValueByLc(uucVals[i]?.value ?? uucVals[i], uucDecimals, uucLc);
          });
          if (layout.avgUucIdx !== -1) row[layout.avgUucIdx] = formatValueByLc(
            summary.averageuuc?.[0]?.value ?? point.averageuuc, uucDecimals, uucLc
          );

          if (layout.errorIdx !== -1) {
            let masterVal = null;
            if (summary.averagemaster?.[0]?.value !== undefined && summary.averagemaster[0].value !== '') {
              masterVal = parseFloat(summary.averagemaster[0].value);
            } else if (masterVals.length > 0 && masterVals[0]?.value !== undefined && masterVals[0].value !== '') {
              masterVal = parseFloat(masterVals[0].value);
            } else if (instrumentSettings?.setpoint === 'Master') {
              const raw = point.point ?? summary.setpoint?.[0]?.value;
              if (raw !== undefined && raw !== '') masterVal = parseFloat(raw);
            }

            let uucVal = null;
            if (summary.averageuuc?.[0]?.value !== undefined && summary.averageuuc[0].value !== '') {
              uucVal = parseFloat(summary.averageuuc[0].value);
            } else if (uucVals.length > 0 && uucVals[0]?.value !== undefined && uucVals[0].value !== '') {
              uucVal = parseFloat(uucVals[0].value);
            } else if (instrumentSettings?.setpoint === 'UUC') {
              const raw = point.point ?? summary.setpoint?.[0]?.value;
              if (raw !== undefined && raw !== '') uucVal = parseFloat(raw);
            }

            if (masterVal !== null && uucVal !== null && !isNaN(masterVal) && !isNaN(uucVal)) {
              const isStdUuc = (instrumentSettings?.error === 'stduuc' || instrumentSettings?.error_type === 'stduuc' || instrumentSettings?.custom_error === 'stduuc');
              const diff = isStdUuc ? (masterVal - uucVal) : (uucVal - masterVal);
              row[layout.errorIdx] = diff.toFixed(errorDecimals);
            } else {
              const savedErr = summary.error?.[0]?.value ?? point.error;
              row[layout.errorIdx] = formatValueByLc(savedErr, errorDecimals, uucLc);
            }
          }

          if (layout.remarkIdx !== -1) row[layout.remarkIdx] = safeGetValue(
            summary.remark?.[0]?.value ?? point.remark
          );

          rows.push(row);
        });
      }
    } else if (template === 'observationwbn' || template === 'observationwb') {
      const payload = dataArray[0] || {};
      const wRows = payload.weighing_process?.calibration_points || payload.weighing_process?.rows || [];
      const rRows = payload.repeatability?.calibration_points || payload.repeatability?.rows || [];
      const eRows = payload.eccentricity?.calibration_points || payload.eccentricity?.rows || [];

      // 1. Weighing Process
      wRows.forEach((point, index) => {
        const uucReadings = safeGetArray(point.uuc_observations, 3);
        const lc = point.least_count_uuc || '0.01';
        const row = [
          point.sr_no?.toString() || (index + 1).toString(),
          safeGetValue(point.nominal_value),
          formatValueByLc(uucReadings[0]?.value, null, lc),
          formatValueByLc(uucReadings[1]?.value, null, lc),
          formatValueByLc(uucReadings[2]?.value, null, lc),
          formatValueByLc(point.average_uuc, null, lc),
          formatValueByLc(point.error, null, lc)
        ];
        rows.push(row);
      });

      // 2. Repeatability
      rRows.forEach((point) => {
        const uucrReadings = safeGetArray(point.uucr_observations, 10);
        const lc = point.least_count_uuc || '0.01';
        const row = [
          safeGetValue(point.nominal_value),
          ...Array(10).fill('').map((_, i) => formatValueByLc(uucrReadings[i]?.value, null, lc)),
          formatValueByLc(point.average_uucr, null, lc)
        ];
        rows.push(row);
      });

      // 3. Eccentricity
      eRows.forEach((point) => {
        const cwReadings = safeGetArray(point.clockwise_observations, 5);
        const acwReadings = safeGetArray(point.anticlockwise_observations, 5);
        const lc = point.least_count_uuc || '0.01';
        const row = [
          safeGetValue(point.nominal_value),
          ...Array(5).fill('').map((_, i) => formatValueByLc(cwReadings[i]?.value, null, lc)),
          ...Array(5).fill('').map((_, i) => formatValueByLc(acwReadings[i]?.value, null, lc)),
          formatValueByLc(point.eccentricity_d_value, null, lc)
        ];
        rows.push(row);
      });

      return {
        rows,
        matrixGroups: matrixGroups || [],
        unitTypes: unitTypes || [],
        modes: modes || [],
        weighingCount: wRows.length,
        repeatabilityCount: rRows.length,
        eccentricityCount: eRows.length,
      };
    } else if (template === 'observationwwbn') {
      dataArray.forEach((point) => {
        if (!point) return;

        const readings = safeGetArray(point.observations || point.uuc_values, 5);
        while (readings.length < 5) readings.push('');

        const row = [
          point.sr_no?.toString() || '',
          ...readings.slice(0, 5).map(val => safeGetValue(val)),
          safeGetValue(point.unit),
          safeGetValue(point.point || point.calibration_point),
          safeGetValue(point.average || point.averageuuc),
          safeGetValue(point.repeatability || point.std_deviation),
          safeGetValue(point.typea || point.type_a),
          safeGetValue(point.drift),
          safeGetValue(point.eccentricityfactor || point.eccentricity),
          safeGetValue(point.masterunc || point.master_uncertainty),
          safeGetValue(point.leastcount || point.least_count),
          safeGetValue(point.comuncer || point.combined_uncertainty),
          safeGetValue(point.dof || point.degree_of_freedom),
          safeGetValue(point.coveragefactor || point.coverage_factor),
          safeGetValue(point.expandeduncertainty || point.expanded_uncertainty),
          safeGetValue(point.expandeduncertaintymg || point.expanded_uncertainty_mg),
          safeGetValue(point.cmcuncertainty || point.cmc_taken),
        ];

        while (row.length < 21) row.push('');
        rows.push(row);
      });
    } else if (template === 'observationdw') {
      dataArray.forEach((point, pIndex) => {
        if (!point) return;
        const cycles = Array.isArray(point.cycles) && point.cycles.length > 0
          ? point.cycles
          : Array.from({ length: point.repeatable_cycle ? parseInt(point.repeatable_cycle) : 3 });

        cycles.forEach((cycleItem, cycleIdx) => {
          const cycleNo = cycleItem?.cycle_no?.toString() || (cycleIdx + 1).toString();
          const s1 = cycleItem?.S1 ?? cycleItem?.s1 ?? point.s1?.[cycleIdx];
          const u1 = cycleItem?.U1 ?? cycleItem?.u1 ?? point.u1?.[cycleIdx];
          const u2 = cycleItem?.U2 ?? cycleItem?.u2 ?? point.u2?.[cycleIdx];
          const s2 = cycleItem?.S2 ?? cycleItem?.s2 ?? point.s2?.[cycleIdx];
          const delta = cycleItem?.Delta ?? cycleItem?.deltai ?? point.deltai?.[cycleIdx];

          const row = [
            point.sr_no?.toString() || (pIndex + 1).toString(),
            cycleNo,
            safeGetValue(point.nominal_value || point.test_point),
            safeGetValue(point.density),
            safeGetValue(s1),
            safeGetValue(u1),
            safeGetValue(u2),
            safeGetValue(s2),
            safeGetValue(delta),
            safeGetValue(point.average_diff),
          ];
          rows.push(row);
        });
      });
    } else if (template === 'observationdpg') {
      dataArray.forEach((obs) => {
        if (!obs) return;

        const uucLc = obs?.least_counts?.uuc ?? obs?.least_count_uuc ?? obs?.uuc_least_count ?? obs?.least_count ?? obs?.leastcount ?? currentRawdata?.uuc_details?.least_count;
        const masterLc = obs?.least_counts?.master ?? obs?.least_count_master ?? obs?.master_least_count ?? obs?.masterleastcount;

        const m1Str = safeGetValue(obs.master_readings?.m1 ?? obs.master_readings?.[0] ?? obs.m1);
        let mlc = null;
        if (masterLc) {
          const match = String(masterLc).match(/\.([0-9]+)/);
          if (match) mlc = match[1].length;
          else if (!isNaN(parseFloat(masterLc))) mlc = 0;
        }
        if (mlc === null && m1Str.includes('.')) {
          mlc = m1Str.split('.')[1].length;
        }
        if (mlc === null) mlc = 3;

        let uucDecimals = null;
        if (uucLc) {
          const match = String(uucLc).match(/\.([0-9]+)/);
          if (match) uucDecimals = match[1].length;
          else if (!isNaN(parseFloat(uucLc))) uucDecimals = 0;
        }
        if (uucDecimals === null) {
          const uucStr = safeGetValue(obs.uuc_value ?? obs.set_pressure_uuc);
          if (uucStr.includes('.')) uucDecimals = uucStr.split('.')[1].length;
          else uucDecimals = 1;
        }

        const errorDecimals = Math.max(mlc, uucDecimals);

        const row = [
          obs.sr_no?.toString() || '',
          formatValueByLc(obs.uuc_value ?? obs.set_pressure_uuc, uucDecimals, uucLc),
          formatValueByLc(obs.converted_uuc_value ?? obs.set_pressure_master, mlc, masterLc),
          formatValueByLc(obs.master_readings?.m1 ?? obs.master_readings?.[0] ?? obs.m1, mlc, masterLc),
          formatValueByLc(obs.master_readings?.m2 ?? obs.master_readings?.[1] ?? obs.m2, mlc, masterLc),
          formatValueByLc(obs.master_readings?.m3 ?? obs.master_readings?.[2] ?? obs.m3, mlc, masterLc),
          formatValueByLc(obs.average_master ?? obs.average ?? obs.mean, mlc, masterLc),
          formatValueByLc(obs.error, errorDecimals, masterLc),
          formatValueByLc(obs.repeatability ?? obs.repeatable, mlc, masterLc),
          formatValueByLc(obs.hysterisis ?? obs.hysteresis, mlc, masterLc),
        ];
        rows.push(row);
      });
    } else if (template === 'observationppg') {
      dataArray.forEach((obs) => {
        if (!obs) return;

        const uucLc = obs?.least_counts?.uuc ?? obs?.least_count_uuc ?? obs?.uuc_least_count ?? obs?.least_count ?? obs?.leastcount ?? currentRawdata?.uuc_details?.least_count;
        const masterLc = obs?.least_counts?.master ?? obs?.least_count_master ?? obs?.master_least_count ?? obs?.masterleastcount;

        const m1Str = safeGetValue(obs.master_readings?.m1 ?? obs.master_readings?.[0] ?? obs.m1);
        let mlc = null;
        if (masterLc) {
          const match = String(masterLc).match(/\.([0-9]+)/);
          if (match) mlc = match[1].length;
          else if (!isNaN(parseFloat(masterLc))) mlc = 0;
        }
        if (mlc === null && m1Str.includes('.')) {
          mlc = m1Str.split('.')[1].length;
        }
        if (mlc === null) mlc = 3;

        let uucDecimals = null;
        if (uucLc) {
          const match = String(uucLc).match(/\.([0-9]+)/);
          if (match) uucDecimals = match[1].length;
          else if (!isNaN(parseFloat(uucLc))) uucDecimals = 0;
        }
        if (uucDecimals === null) {
          const uucStr = safeGetValue(obs.uuc_value ?? obs.set_pressure_uuc);
          if (uucStr.includes('.')) uucDecimals = uucStr.split('.')[1].length;
          else uucDecimals = 1;
        }

        const errorDecimals = Math.max(mlc, uucDecimals);

        const row = [
          obs.sr_no?.toString() || '',
          formatValueByLc(obs.uuc_value ?? obs.set_pressure_uuc, uucDecimals, uucLc),
          formatValueByLc(obs.converted_uuc_value ?? obs.set_pressure_master, mlc, masterLc),
          formatValueByLc(obs.master_readings?.m1 ?? obs.master_readings?.[0] ?? obs.m1, mlc, masterLc),
          formatValueByLc(obs.master_readings?.m2 ?? obs.master_readings?.[1] ?? obs.m2, mlc, masterLc),
          formatValueByLc(obs.master_readings?.m3 ?? obs.master_readings?.[2] ?? obs.m3, mlc, masterLc),
          formatValueByLc(obs.master_readings?.m4 ?? obs.master_readings?.[3] ?? obs.m4, mlc, masterLc),
          formatValueByLc(obs.master_readings?.m5 ?? obs.master_readings?.[4] ?? obs.m5, mlc, masterLc),
          formatValueByLc(obs.master_readings?.m6 ?? obs.master_readings?.[5] ?? obs.m6, mlc, masterLc),
          formatValueByLc(obs.average_master ?? obs.average ?? obs.mean, mlc, masterLc),
          formatValueByLc(obs.error, errorDecimals, masterLc),
          formatValueByLc(obs.repeatability ?? obs.repeatable, mlc, masterLc),
          formatValueByLc(obs.hysterisis ?? obs.hysteresis, mlc, masterLc),
        ];
        rows.push(row);
      });
    } else if (template === 'observationavg') {
      dataArray.forEach((point) => {
        if (!point) return;
        const lc = point.least_count_uuc || '0.1';
        const row = [
          point.sr_no?.toString() || '',
          formatValueByLc(point.set_point_uuc, null, lc),
          formatValueByLc(point.calculated_uuc, null, lc),
          formatValueByLc(point.master_readings?.[0], null, lc),
          formatValueByLc(point.master_readings?.[1], null, lc),
          formatValueByLc(point.average_master, null, lc),
          formatValueByLc(point.error, null, lc),
          formatValueByLc(point.hysteresis, null, lc),
        ];

        console.log('✅ AVG Row created:', row);

        rows.push(row);
      });
    } else if (template === 'observationexm') {
      dataArray.forEach((point) => {
        if (!point) return;

        const observations = safeGetArray(point.observations, 5);
        const lc = point.least_count_uuc || '0.01';

        // Ensure we have exactly 5 observation values
        while (observations.length < 5) {
          observations.push('');
        }

        const row = [
          point.sr_no?.toString() || '',
          safeGetValue(point.nominal_value || point.test_point),
          ...observations.slice(0, 5).map(obs => formatValueByLc(obs, null, lc)),
          formatValueByLc(point.average, null, lc),
          formatValueByLc(point.error, null, lc),
        ];

        // Ensure consistent row length
        while (row.length < 8) {
          row.push('');
        }

        console.log('✅ EXM Row created:', row);

        rows.push(row);
      });
    } else if (template === 'observationmm') {
      console.log('🔄 Creating MM observation rows from:', dataArray);

      // Handle MM structure with unit types - SAME AS CALIBRATE STEP 3
      dataArray.forEach((unitTypeGroup) => {
        if (!unitTypeGroup || !unitTypeGroup.calibration_points) return;

        console.log('📋 Processing MM unit type group:', unitTypeGroup.unit_type);

        // Store unit type info for rendering
        unitTypes.push(unitTypeGroup);

        unitTypeGroup.calibration_points.forEach((point, pointIndex) => {
          if (!point) return;

          // Extract observations safely - SAME AS CALIBRATE STEP 3
          const observations = [];
          if (point.observations && Array.isArray(point.observations)) {
            for (let i = 0; i < 5; i++) {
              observations.push(point.observations[i]?.value || '');
            }
          }

          // Ensure we have exactly 5 observations
          while (observations.length < 5) {
            observations.push('');
          }

          const row = [
            point.sequence_number?.toString() || (pointIndex + 1).toString(),
            point.mode || 'Measure',
            point.range || '',
            // Calculated master value with unit
            (point.nominal_values?.calculated_master?.value || '') +
            (point.nominal_values?.calculated_master?.unit ? ' ' + point.nominal_values.calculated_master.unit : ''),
            // Master value with unit  
            (point.nominal_values?.master?.value || '') +
            (point.nominal_values?.master?.unit ? ' ' + point.nominal_values.master.unit : ''),
            ...observations.slice(0, 5).map(obs => safeGetValue(obs)),
            safeGetValue(point.average),
            safeGetValue(point.deviation)
          ];
          rows.push(row);
        });
      });
    } else if (template === 'observationmg') {
      dataArray.forEach((point) => {
        if (!point) return;
        const row = [
          point.sequence_number?.toString() || point.sr_no?.toString() || '',
          safeGetValue(point.set_pressure?.uuc_value ?? point.uuc_value),
          safeGetValue(point.set_pressure?.converted_value ?? point.converted_uuc_value ?? point.set_pressure?.uuc_value),
          safeGetValue(point.observations?.master_1 ?? point.m1 ?? (Array.isArray(point.master_readings) ? point.master_readings[0] : '')),
          safeGetValue(point.observations?.master_2 ?? point.m2 ?? (Array.isArray(point.master_readings) ? point.master_readings[1] : '')),
          safeGetValue(point.calculations?.mean ?? point.mean ?? point.average_master),
          safeGetValue(point.calculations?.error ?? point.error),
          safeGetValue(point.calculations?.hysteresis ?? point.hysterisis ?? point.hysteresis),
        ];
        rows.push(row);
      });
    } else if (template === 'observationodfm') {
      dataArray.forEach((point) => {
        if (!point) return;
        const observations = safeGetArray(
          point.observations || point.master || point.master_values || point.master_readings,
          5
        );
        while (observations.length < 5) {
          observations.push('');
        }
        const row = [
          point.sr_no?.toString() || '',
          safeGetValue(point.range || point.workingrange || point.equipmentrange),
          safeGetValue(point.nominal_value ?? point.uuc_value ?? point.point ?? point.setpoint),
          ...observations.slice(0, 5).map((obs) => safeGetValue(obs)),
          safeGetValue(point.average ?? point.averagemaster ?? point.mean),
          safeGetValue(point.error),
        ];
        rows.push(row);
      });
    } else if (template === 'observationctg') {
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
    } else if (template === 'observationvc') {
      const isGroupedArray = dataArray.length > 0 && (dataArray[0]?.calibration_points || dataArray[0]?.points);

      let groups = [];
      if (isGroupedArray) {
        groups = dataArray.map(g => ({
          title: `${g.matrixtype || g.matrix_type || g.name || 'Measurement'}(in ${g.unit_description || g.unit?.description || g.unit_name || (typeof g.unit === 'string' && isNaN(Number(g.unit)) ? g.unit : 'mm')} )`,
          points: g.calibration_points || g.points || []
        }));
      } else {
        const hasPointMatrixType = dataArray.some(p => p && (p.matrixtype || p.matrix_type || p.matrix_name));
        if (hasPointMatrixType) {
          const map = new Map();
          dataArray.forEach(p => {
            if (!p) return;
            const mType = p.matrixtype || p.matrix_type || p.matrix_name || 'Measurement';
            const mUnit = p.unit_description || p.unit?.description || p.unit_name || (typeof p.unit === 'string' && isNaN(Number(p.unit)) ? p.unit : 'mm');
            const key = `${mType}(in ${mUnit} )`;
            if (!map.has(key)) {
              map.set(key, { title: key, points: [] });
            }
            map.get(key).points.push(p);
          });
          groups = Array.from(map.values());
        } else {
          groups = [{ title: '', points: dataArray }];
        }
      }

      groups.forEach((group) => {
        const points = group.points || [];
        let maxPointVal = -Infinity;
        points.forEach((p) => {
          const ptVal = parseFloat(p?.point || p?.nominal_value || p?.test_point || 0);
          if (!isNaN(ptVal) && ptVal > maxPointVal) {
            maxPointVal = ptVal;
          }
        });

        const groupRows = [];
        points.forEach((point, pointIndex) => {
          if (!point) return;
          const ptVal = parseFloat(point.point || point.nominal_value || point.test_point || 0);
          const isMaxPoint =
            (ptVal === maxPointVal && maxPointVal !== -Infinity) ||
            point.repeatable_cycle === 5 ||
            point.repeatablecycle === 5 ||
            (Array.isArray(point.observations) && point.observations.length >= 5);
          const repeatableCycle = isMaxPoint ? 5 : 3;

          const observations = safeGetArray(point.observations, 5);
          const row = [
            point.sr_no?.toString() || point.sequence_number?.toString() || (pointIndex + 1).toString(),
            safeGetValue(
              point.master_value !== undefined && point.master_value !== null && point.master_value !== ''
                ? point.master_value
                : (point.nominal_value ?? point.point ?? point.test_point)
            ),
            ...Array.from({ length: 5 }, (_, index) =>
              index < repeatableCycle ? formatValueByLc(observations[index], point?.lc_decimals, point?.least_count) : ''
            ),
            formatValueByLc(point.average || point.average_master, point?.lc_decimals, point?.least_count),
            formatValueByLc(point.error, point?.lc_decimals, point?.least_count),
          ];

          while (row.length < 9) row.push('');
          groupRows.push(row);
          rows.push(row);
        });

        matrixGroups.push({
          title: group.title,
          rows: groupRows,
        });
      });
    } else if (template === 'observationit') {
      dataArray.forEach((point) => {
        if (!point) return;
        const observations = safeGetArray(point.observations, 5);
        const lc = point.least_count_uuc || '0.01';
        const row = [
          point.sequence_number?.toString() || point.sr_no?.toString() || '',
          safeGetValue(point.nominal_value || point.test_point),
          ...observations.slice(0, 5).map(obs => formatValueByLc(obs, null, lc)),
          formatValueByLc(point.average, null, lc),
          formatValueByLc(point.error, null, lc),
        ];
        while (row.length < 9) {
          row.push('');
        }
        rows.push(row);
      });
    } else if (template === 'observationmt') {
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

    } else if (template === 'observationutm') {
      const groups = normalizeUtmGroups(dataArray);

      groups.forEach((group) => {
        group.calibrationPoints.forEach((point, pointIndex) => {
          const masterValues = [0, 1, 2].map((idx) => getObservationValueByType(point, 'master', idx));
          const calculatedUuc = getObservationValueByType(point, 'calculateduuc', 0);
          const rawUuc = getObservationValueByType(point, 'uuc', 0);
          // Apply temperature compensation to UUC value
          const compensatedUuc = rawUuc || applyTemperatureCompensation(calculatedUuc);
          const row = [
            point?.sr_no?.toString() || point?.sequence_number?.toString() || (pointIndex + 1).toString(),
            getObservationValueByType(point, 'setpoint', 0),
            calculatedUuc,
            compensatedUuc,
            ...masterValues,
            getObservationValueByType(point, 'averagemaster', 0),
            getObservationValueByType(point, 'error', 0),
            getObservationValueByType(point, 'percenterror', 0),
            getObservationValueByType(point, 'repeatability', 0),
          ];

          rows.push(row);
        });
      });
    } else if (template === 'observationrtdwi') {
      dataArray.forEach((point) => {
        if (!point) return;

        const srNo = point.sr_no?.toString() || '';
        const setPoint = safeGetValue(point.set_point);

        // UUC Row
        const uucReadings = safeGetArray(point.uuc_values, 5);
        const uucRow = [
          srNo,                                           // 0: Sr. No.
          setPoint,                                       // 1: Set Point
          'UUC',                                         // 2: Value Of
          safeGetValue(point.unit),                      // 3: Unit
          '-',                                           // 4: Sensitivity Coefficient
          ...uucReadings.slice(0, 5).map(val => safeGetValue(val)), // 5-9: Observations 1-5
          '-',                                            // 10: Average (dash for UUC)
          '-',                                            // 11: mV generated On ambient (dash for UUC)
          '-',                                            // 12: Average with corrected mv (dash for UUC)
          safeGetValue(point.average_uuc),               // 13: Average (°C)
          safeGetValue(point.error),                     // 14: Deviation (°C)
        ];
        rows.push(uucRow);

        // Master Row
        const masterReadings = safeGetArray(point.master_values, 5);
        const masterRow = [
          '-',                                           // 0: Sr. No.
          '-',                                           // 1: Set Point
          'Master',                                      // 2: Value Of
          safeGetValue(point.master_unit || point.master_unit_id || 'UNIT_SELECT'), // 3: Unit
          safeGetValue(point.sensitivity_coefficient),   // 4: Sensitivity Coefficient
          ...masterReadings.slice(0, 5).map(val => safeGetValue(val)), // 5-9: Observations 1-5
          safeGetValue(point.average_master),            // 10: Average (mV)
          safeGetValue(point.ambient_master),            // 11: mV generated On ambient
          safeGetValue(point.s_average_master),          // 12: Average with corrected mv
          safeGetValue(point.c_average_master),          // 13: Average (°C)
          '-',                                           // 14: Deviation (°C)
        ];
        rows.push(masterRow);
      });
    } else if (template === 'observationth') {
      dataArray.forEach((point) => {
        if (!point) return;

        const srNo = point.sr_no?.toString() || '';
        const setPoint = safeGetValue(point.setpoint || point.point);

        // UUC Row
        const uucReadings = safeGetArray(point.uuc, 5);
        const uucRow = [
          srNo,                                           // 0: Sr no
          'UUC',                                          // 1: Value Shown on
          safeGetValue(point.uucrange),                   // 2: Range
          setPoint,                                       // 3: nominal Value
          safeGetValue(point.unit || point.uucunit),      // 4: Unit
          ...uucReadings.slice(0, 5).map(val => safeGetValue(val)), // 5-9: Observations 1-5
          safeGetValue(point.averageuuc),                 // 10: Mean
          '-',                                            // 11: Error (dash for UUC)
        ];
        rows.push(uucRow);

        // Master Row
        const masterReadings = safeGetArray(point.master, 5);
        const masterRow = [
          '-',                                            // 0: Sr no
          'Master',                                       // 1: Value Shown on
          '-',                                            // 2: Range
          '-',                                            // 3: nominal Value
          safeGetValue(point.masterunit),                 // 4: Unit
          ...masterReadings.slice(0, 5).map(val => safeGetValue(val)), // 5-9: Observations 1-5
          safeGetValue(point.averagemaster),              // 10: Mean
          safeGetValue(point.error),                      // 11: Error
        ];
        rows.push(masterRow);
      });
    } else if (template === 'observationgtm') {
      dataArray.forEach((point) => {
        if (!point) return;

        const srNo = point.sr_no?.toString() || '';
        const setPoint = safeGetValue(point.set_point);
        const range = safeGetValue(point.range);

        // UUC Row
        const uucReadings = safeGetArray(point.uuc_values, 5);
        const uucRow = [
          srNo,                                           // 0: Sr. No.
          setPoint,                                       // 1: Set Point
          'UUC',                                         // 2: Value Of
          range,                                         // 3: Range
          safeGetValue(point.unit),                      // 4: Unit
          '-',                                           // 5: Sensitivity Coefficient
          ...uucReadings.slice(0, 5).map(val => safeGetValue(val)), // 6-10: Observations 1-5
          '-',                                            // 11: Average (Ω) - dash for UUC
          safeGetValue(point.average_uuc),               // 12: Average (°C)
          safeGetValue(point.error),                     // 13: Deviation (°C)
        ];
        rows.push(uucRow);

        // Master Row
        const masterReadings = safeGetArray(point.master_values, 5);
        const masterRow = [
          '-',                                           // 0: Sr. No. (dash)
          '-',                                           // 1: Set Point (dash)
          'Master',                                      // 2: Value Of (static)
          '-',                                           // 3: Range (dash)
          safeGetValue(point.master_unit || point.master_unit_id || 'UNIT_SELECT'), // 4: Unit
          safeGetValue(point.sensitivity_coefficient),   // 5: Sensitivity Coefficient
          ...masterReadings.slice(0, 5).map(val => safeGetValue(val)), // 6-10: Observations 1-5
          safeGetValue(point.average_master),            // 11: Average (Ω)
          safeGetValue(point.converted_average_master),  // 12: Average (°C)
          '-',                                           // 13: Deviation (°C) - dash for Master
        ];
        rows.push(masterRow);
      });
    } else if (template === 'observationtm') {
      dataArray.forEach((point) => {
        if (!point) return;

        const srNo = point.sr_no?.toString() || '';
        const nominalVal = safeGetValue(point.point || point.nominal_value || point.nominal_set_value || point.nominal_val);
        const rangeVal = safeGetValue(point.range);

        const uucReadings = safeGetArray(point.uuc_values || point.observations || point.uuc_observations, 10);
        const masterReadings = safeGetArray(point.master_values || point.master_observations, 10);

        const row = [
          srNo,
          safeGetValue(point.parameter || point.unittype || 'Temperature'), // Parameter
          nominalVal,
          rangeVal,
          ...uucReadings.slice(0, 10).map(val => safeGetValue(val)),
          ...masterReadings.slice(0, 10).map(val => safeGetValue(val)),
          safeGetValue(point.average_uuc),
          safeGetValue(point.error),
          safeGetValue(point.average_master)
        ];
        rows.push(row);
      });
    } else if (template === 'observationdg') {
      // NEW: Build rows for Dial Gauge (DG) observations
      // Columns: Sr no | Nominal Value | Set1 Fwd | Set1 Bwd | Set2 Fwd | Set2 Bwd | Avg Fwd | Avg Bwd | Err Fwd | Err Bwd | Hysterisis
      dataArray.forEach((point) => {
        if (!point) return;
        const row = [
          point.sr_no?.toString() || '',                                          // 0: Sr. No.
          safeGetValue(point.nominal_value_master ?? point.nominal_value_uuc ?? point.nominal_value), // 1: Nominal Value
          safeGetValue(point.set1_forward),                                       // 2: Set 1 Forward
          safeGetValue(point.set1_backward),                                      // 3: Set 1 Backward
          safeGetValue(point.set2_forward),                                       // 4: Set 2 Forward
          safeGetValue(point.set2_backward),                                      // 5: Set 2 Backward
          safeGetValue(point.average_forward),                                    // 6: Average Forward
          safeGetValue(point.average_backward),                                   // 7: Average Backward
          safeGetValue(point.error_forward),                                      // 8: Error Forward
          safeGetValue(point.error_backward),                                     // 9: Error Backward
          safeGetValue(point.hysterisis ?? point.hysteresis),                     // 10: Hysterisis
        ];
        rows.push(row);
      });
    } else if (template === 'observationuc') {
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
            point.error || ''
          ];

          rows.push(row);
        });
      };

      const measurePoints = dataArray.filter(p => p && (p.mode || '').toLowerCase() === 'measure');
      const sourcePoints = dataArray.filter(p => p && (p.mode || '').toLowerCase() === 'source');

      if (measurePoints.length > 0) {
        processPoints(measurePoints, true);
        modes.push({ mode: 'Measure', calibration_points: measurePoints });
      }
      if (sourcePoints.length > 0) {
        processPoints(sourcePoints, false);
        modes.push({ mode: 'Source', calibration_points: sourcePoints });
      }
    } else if (template === 'observationts') {
      // Handle Test Sieve (TS) observations - matching PHP logic: 5 cycles, 8 aperture measurements (4 Warp, 4 Weft), and 1 average
      console.log('🔍 Creating TS observation rows from:', dataArray);

      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        console.warn('⚠️ TS dataArray is not a valid array or is empty');
      } else {
        dataArray.forEach((pointData, pointIdx) => {
          if (!pointData) {
            console.warn(`⚠️ TS pointData at index ${pointIdx} is null/undefined`);
            return;
          }

          // Get least count from master_matrix or matrix
          const leastCount = pointData.master_matrix?.leastcount || pointData.matrix?.leastcount || pointData.least_count || '0.01';
          const nominalSize = safeGetValue(pointData.nominal_size || pointData.point || pointData.nominal_value || pointData.setpoint || pointData.testpoint || '');

          // Check if this has nested readings structure
          if (pointData.readings && Array.isArray(pointData.readings)) {
            pointData.readings.forEach((reading, readingIdx) => {
              if (!reading) return;

              const values = reading.values || [];
              const extractedValues = values.map(v => {
                let val = '';
                if (typeof v === 'object' && v !== null) {
                  val = v.value ?? '';
                } else {
                  val = v ?? '';
                }
                return formatValueByLc(val, null, leastCount);
              });

              while (extractedValues.length < 8) {
                extractedValues.push('');
              }

              const row = [
                (reading.row || (readingIdx + 1)).toString(), // Row number (1..5)
                ...extractedValues.slice(0, 8), // 8 Aperture sizes (4 Warp, 4 Weft)
                formatValueByLc(reading.average, null, leastCount) // Average Aperture
              ];

              rows.push(row);
              hiddenInputs.values.push(nominalSize);
              hiddenInputs.calibrationPoints.push(pointData.id || pointData.calibration_point_id || pointIdx);
              hiddenInputs.repeatables.push(readingIdx.toString());
              console.log(`✅ TS reading row ${readingIdx} created with ${row.length} columns`);
            });
          } else if (pointData.observations && Array.isArray(pointData.observations)) {
            // Process cycle-based observation list (rc 0..4, col 0..7)
            for (let rc = 0; rc < 5; rc++) {
              const rowValues = [];
              for (let i = 0; i < 8; i++) {
                let obsValue = '';
                const obs = pointData.observations.find(o => o != null && String(o.repeatable) === `${rc}-${i}`);
                if (obs) obsValue = obs.value;
                rowValues.push(formatValueByLc(obsValue, null, leastCount));
              }

              let avgValue = '';
              if (pointData.averages && Array.isArray(pointData.averages)) {
                const avg = pointData.averages.find(a => a != null && String(a.repeatable) === `${rc}`);
                if (avg) avgValue = avg.value;
              }

              const row = [
                (rc + 1).toString(),
                ...rowValues,
                formatValueByLc(avgValue, null, leastCount)
              ];

              rows.push(row);
              hiddenInputs.values.push(nominalSize);
              hiddenInputs.calibrationPoints.push(pointData.id || pointData.calibration_point_id || pointIdx);
              hiddenInputs.repeatables.push(rc.toString());
            }
          } else if (pointData.values && Array.isArray(pointData.values)) {
            const values = pointData.values || [];
            const extractedValues = values.map(v => {
              let val = '';
              if (typeof v === 'object' && v !== null) {
                val = v.value ?? '';
              } else {
                val = v ?? '';
              }
              return formatValueByLc(val, null, leastCount);
            });
            while (extractedValues.length < 8) extractedValues.push('');
            const row = [
              (pointData.row || (pointIdx + 1)).toString(),
              ...extractedValues.slice(0, 8),
              formatValueByLc(pointData.average, null, leastCount)
            ];
            rows.push(row);
            hiddenInputs.values.push(nominalSize);
            hiddenInputs.calibrationPoints.push(pointIdx);
            hiddenInputs.repeatables.push(pointIdx.toString());
          }
        });
      }

      console.log('✅ TS observation rows created:', rows.length, 'rows');
    } else if (template === 'observationsw') {
      // Handle Stop Watch (SW) observations - same structure as TS
      console.log('🔍 Creating SW observation rows from:', dataArray);
      console.log('📊 SW dataArray type:', typeof dataArray, 'is Array:', Array.isArray(dataArray), 'length:', dataArray?.length);

      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        console.warn('⚠️ SW dataArray is not a valid array or is empty');
      } else {
        dataArray.forEach((pointData, idx) => {
          if (!pointData) {
            console.warn(`⚠️ SW pointData at index ${idx} is null/undefined`);
            return;
          }

          console.log(`📝 SW processing row ${idx}:`, pointData);

          // Get least count from the data or use default
          const leastCount = pointData.leastcount || '1';

          const row = [
            pointData.sr_no || (idx + 1), // Sr no
            pointData.setpoint || pointData.testpoint || '', // Setpoint/Testpoint
            // UUC values (from uuc_values array or individual fields)
            Array.isArray(pointData.uuc_values) ? pointData.uuc_values[0] ?? '' : (pointData.uuc_1 || ''),
            Array.isArray(pointData.uuc_values) ? pointData.uuc_values[1] ?? '' : (pointData.uuc_2 || ''),
            Array.isArray(pointData.uuc_values) ? pointData.uuc_values[2] ?? '' : (pointData.uuc_3 || ''),
            Array.isArray(pointData.uuc_values) ? pointData.uuc_values[3] ?? '' : (pointData.uuc_4 || ''),
            Array.isArray(pointData.uuc_values) ? pointData.uuc_values[4] ?? '' : (pointData.uuc_5 || ''),
            formatValueByLc(pointData.average_uuc, null, leastCount), // Average UUC
            // Master values
            Array.isArray(pointData.master_values) ? pointData.master_values[0] ?? '' : (pointData.master_1 || ''),
            Array.isArray(pointData.master_values) ? pointData.master_values[1] ?? '' : (pointData.master_2 || ''),
            Array.isArray(pointData.master_values) ? pointData.master_values[2] ?? '' : (pointData.master_3 || ''),
            Array.isArray(pointData.master_values) ? pointData.master_values[3] ?? '' : (pointData.master_4 || ''),
            Array.isArray(pointData.master_values) ? pointData.master_values[4] ?? '' : (pointData.master_5 || ''),
            formatValueByLc(pointData.average_master, null, pointData.masterleastcount || '0.001'), // Average Master
            pointData.error || '', // Error
            pointData.uncertainty || '' // Uncertainty
          ];

          rows.push(row);
          console.log(`✅ SW row ${idx} created with ${row.length} columns`);
        });
      }

      console.log('✅ SW observation rows created:', rows.length, 'rows');
    }

    return {
      rows: rows || [],
      matrixGroups: matrixGroups || [],
      unitTypes: unitTypes || [],
      modes: modes || [],
      hiddenInputs: hiddenInputs,
      weighingCount: 0,
      repeatabilityCount: 0,
      eccentricityCount: 0,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderObservationUCTables = () => {
    let globalRowIndex = 0;

    return (
      <div className="space-y-6">
        {(observationRows?.modes || []).map((modeGroup, mIndex) => {
          const isMeasure = modeGroup.mode?.toLowerCase() === 'measure';
          const pointsCount = modeGroup.calibration_points?.length || 0;

          const currentStartingRowIndex = globalRowIndex;
          globalRowIndex += pointsCount;

          return (
            <div key={mIndex} className="mb-6">
              <h4 className="font-semibold text-md bg-gray-100 p-2 border border-gray-300">{modeGroup.mode}</h4>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-300">
                      <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-left">Sr. No.</th>
                      <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-left">Unit Type</th>
                      <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-left">Range</th>
                      <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-left">
                        {isMeasure ? 'Nominal/ Set Value on master' : 'Nominal/ Set Value on UUC'}
                      </th>
                      <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-left">
                        {isMeasure ? 'Nominal/ Set Value on master' : 'Nominal/ Set Value on UUC'}
                      </th>
                      <th colSpan="5" className="border border-gray-300 px-3 py-2 text-center">
                        {isMeasure ? 'Observation on UUC' : 'Observation on Master'}
                      </th>
                      <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-left">Average</th>
                      <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-left">Error</th>
                    </tr>
                    <tr className="bg-gray-50 border-b border-gray-300">
                      {[1, 2, 3, 4, 5].map(num => (
                        <th key={num} className="border border-gray-300 px-3 py-2 text-left">
                          Observation {num}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(observationRows?.rows || []).slice(currentStartingRowIndex, currentStartingRowIndex + pointsCount).map((row, relativeRowIndex) => {
                      const actualRowIndex = currentStartingRowIndex + relativeRowIndex;
                      return (
                        <tr key={actualRowIndex} className="hover:bg-gray-50">
                          {row.map((cell, colIndex) => (
                            <td key={colIndex} className="border border-gray-300 px-3 py-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderBiomedicalTables = () => {
    const config = biomedicalRawData?.config || {};
    const isEnabled = (value) => String(value || '').toLowerCase() === 'yes';
    const showElectricalSafety = isEnabled(config.show_electrical_safety);
    const visualTests = isEnabled(config.show_visual_test) ? biomedicalRawData?.visual_test || [] : [];
    const basicSafety = isEnabled(config.show_basic_safety) ? biomedicalRawData?.basic_safety || [] : [];
    const groups = [
      ['Electrical Safety', 'Measure'],
      ['Electrical Safety', 'Source'],
      ['Performance Test', 'Measure'],
      ['Performance Test', 'Source'],
    ];

    const formatWithUnit = (val, decimals, leastCount, unit) => {
      const raw = safeGetValue(val);
      if (raw === null || raw === undefined || raw === '' || raw === 'NA' || raw === 'na') return '';
      const formatted = formatValueByLc(raw, decimals, leastCount);
      return unit ? `${formatted} ${unit}`.trim() : formatted;
    };

    return (
      <div className="space-y-6">
        {visualTests.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100"><th colSpan="2" className="border border-gray-300 px-3 py-2 text-left">VISUAL INSPECTION</th></tr>
                <tr className="bg-gray-50"><th className="border border-gray-300 px-3 py-2 text-left">Description</th><th className="border border-gray-300 px-3 py-2 text-left">Remark</th></tr>
              </thead>
              <tbody>
                {visualTests.filter((item) => String(item?.value ?? item?.remark ?? '').toLowerCase() !== 'na').map((item, index) => (
                  <tr key={item?.id ?? index}><td className="border border-gray-300 px-3 py-2">{safeGetValue(item?.description)}</td><td className="border border-gray-300 px-3 py-2">{safeGetValue(item?.value ?? item?.remark)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {basicSafety.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100"><th colSpan="2" className="border border-gray-300 px-3 py-2 text-left">BASIC SAFETY TEST</th></tr>
                <tr className="bg-gray-50"><th className="border border-gray-300 px-3 py-2 text-left">Description</th><th className="border border-gray-300 px-3 py-2 text-left">Observed Value</th></tr>
              </thead>
              <tbody>
                {basicSafety.filter((item) => String(item?.value ?? '').toLowerCase() !== 'na').map((item, index) => (
                  <tr key={item?.id ?? index}><td className="border border-gray-300 px-3 py-2">{safeGetValue(item?.description)}</td><td className="border border-gray-300 px-3 py-2">{safeGetValue(item?.value)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {groups.map(([section, mode]) => {
          const points = dynamicObservations.filter(
            (point) => point.biomedical_section === section && point.mode === mode
          );
          if (points.length === 0) return null;

          const isMeasure = mode === 'Measure';
          const isElectricalGroup = section === 'Electrical Safety';
          const showSetPointAndDeviation = !isElectricalGroup || !showElectricalSafety;
          const showUncertaintyAndRemark = isElectricalGroup && mode === 'Source' && !showElectricalSafety;
          const masterCount = isMeasure ? 1 : 5;
          const uucCount = isMeasure ? 5 : 1;

          const tableTitle = isElectricalGroup
            ? (showElectricalSafety ? 'ELECTRICAL SAFETY TEST' : ' PERFORMANCE TESTING')
            : 'PERFORMANCE TESTING';

          return (
            <div key={`${section}-${mode}`} className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th colSpan="13" className="border border-gray-300 px-3 py-2 text-left font-bold">
                      {tableTitle}
                    </th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left">Parameter</th>
                    {showSetPointAndDeviation && (
                      <th className="border border-gray-300 px-3 py-2 text-left">Set Point</th>
                    )}
                    {isMeasure ? (
                      <>
                        {showSetPointAndDeviation && (
                          <th colSpan={masterCount} className="border border-gray-300 px-3 py-2 text-center">Reading on Master</th>
                        )}
                        {masterCount > 1 && (
                          <th className="border border-gray-300 px-3 py-2 text-left">Average on Master</th>
                        )}
                        <th colSpan={uucCount} className="border border-gray-300 px-3 py-2 text-center">Reading on UUC</th>
                        {uucCount > 1 && (
                          <th className="border border-gray-300 px-3 py-2 text-left">Average on UUC</th>
                        )}
                      </>
                    ) : (
                      <>
                        {showSetPointAndDeviation && (
                          <th colSpan={uucCount} className="border border-gray-300 px-3 py-2 text-center">Reading on UUC</th>
                        )}
                        {showSetPointAndDeviation && uucCount > 1 && (
                          <th className="border border-gray-300 px-3 py-2 text-left">Average on UUC</th>
                        )}
                        <th colSpan={masterCount} className="border border-gray-300 px-3 py-2 text-center">Reading on Master</th>
                        {masterCount > 1 && (
                          <th className="border border-gray-300 px-3 py-2 text-left">Average on Master</th>
                        )}
                      </>
                    )}
                    {showSetPointAndDeviation && (
                      <th className="border border-gray-300 px-3 py-2 text-left">Deviation</th>
                    )}
                    <th className="border border-gray-300 px-3 py-2 text-left">Tolerance</th>
                    {showUncertaintyAndRemark && (
                      <th className="border border-gray-300 px-3 py-2 text-left">Expanded Uncertainty</th>
                    )}
                    {showUncertaintyAndRemark && (
                      <th className="border border-gray-300 px-3 py-2 text-left">Remark</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {points.map((point, index) => {
                    const pointUucUnit = point.uuc_readings?.[0]?.unit || point.uuc_unit || point.unit || point.set_point_unit || '';
                    const pointMasterUnit = point.master_readings?.[0]?.unit || point.master_unit || point.masterunit || point.set_point_unit || '';
                    const setPointUnit = point.set_point_unit || pointUucUnit || '';

                    return (
                      <tr key={point.calibration_point_id ?? index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-3 py-2">{safeGetValue(point.parameter)}</td>
                        {showSetPointAndDeviation && (
                          <td className="border border-gray-300 px-3 py-2">
                            {formatWithUnit(point.set_point, isMeasure ? point.lc_decimals : point.mlc_decimals, isMeasure ? point.least_count : point.master_least_count, setPointUnit)}
                          </td>
                        )}
                        {isMeasure ? (
                          <>
                            {showSetPointAndDeviation && (
                              <td className="border border-gray-300 px-3 py-2">
                                {formatWithUnit(point.set_point, point.mlc_decimals, point.master_least_count, pointMasterUnit)}
                              </td>
                            )}
                            {masterCount > 1 && (
                              <td className="border border-gray-300 px-3 py-2">
                                {formatWithUnit(point.average_master, point.mlc_decimals, point.master_least_count, pointMasterUnit)}
                              </td>
                            )}
                            {Array.from({ length: uucCount }, (_, readingIndex) => {
                              const r = point.uuc_readings?.[readingIndex];
                              const raw = typeof r === 'object' && r !== null ? r.value : r;
                              const rUnit = (typeof r === 'object' && r?.unit) || pointUucUnit;
                              return (
                                <td key={`uuc-${readingIndex}`} className="border border-gray-300 px-3 py-2">
                                  {formatWithUnit(raw, point.lc_decimals, point.least_count, rUnit)}
                                </td>
                              );
                            })}
                            {uucCount > 1 && (
                              <td className="border border-gray-300 px-3 py-2">
                                {formatWithUnit(point.average_uuc, point.lc_decimals, point.least_count, pointUucUnit)}
                              </td>
                            )}
                          </>
                        ) : (
                          <>
                            {showSetPointAndDeviation && (
                              <td className="border border-gray-300 px-3 py-2">
                                {formatWithUnit(point.set_point, point.lc_decimals, point.least_count, pointUucUnit)}
                              </td>
                            )}
                            {showSetPointAndDeviation && uucCount > 1 && (
                              <td className="border border-gray-300 px-3 py-2">
                                {formatWithUnit(point.average_uuc, point.lc_decimals, point.least_count, pointUucUnit)}
                              </td>
                            )}
                            {Array.from({ length: masterCount }, (_, readingIndex) => {
                              const r = point.master_readings?.[readingIndex];
                              const raw = typeof r === 'object' && r !== null ? r.value : r;
                              const rUnit = (typeof r === 'object' && r?.unit) || pointMasterUnit;
                              return (
                                <td key={`master-${readingIndex}`} className="border border-gray-300 px-3 py-2">
                                  {formatWithUnit(raw, point.mlc_decimals, point.master_least_count, rUnit)}
                                </td>
                              );
                            })}
                            {masterCount > 1 && (
                              <td className="border border-gray-300 px-3 py-2">
                                {formatWithUnit(point.average_master, point.mlc_decimals, point.master_least_count, pointMasterUnit)}
                              </td>
                            )}
                          </>
                        )}
                        {showSetPointAndDeviation && (
                          <td className="border border-gray-300 px-3 py-2">
                            {formatWithUnit(
                              point.deviation,
                              Math.max(
                                (point.lc_decimals != null && point.lc_decimals !== 'NA') ? parseInt(point.lc_decimals, 10) : 0,
                                (point.mlc_decimals != null && point.mlc_decimals !== 'NA') ? parseInt(point.mlc_decimals, 10) : 0
                              ),
                              point.least_count,
                              pointUucUnit
                            )}
                          </td>
                        )}
                        <td className="border border-gray-300 px-3 py-2">{safeGetValue(point.tolerance)}</td>
                        {showUncertaintyAndRemark && (
                          <td className="border border-gray-300 px-3 py-2">{safeGetValue(point.expanded_uncertainty)}</td>
                        )}
                        {showUncertaintyAndRemark && (
                          <td className="border border-gray-300 px-3 py-2">{safeGetValue(point.remark)}</td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  const generateTableStructure = useCallback((selectedTableData, unitInfo) => {
    if (!selectedTableData || !selectedTableData.structure) return null;
    const structure = selectedTableData.structure;
    if (!structure.singleHeaders || !Array.isArray(structure.singleHeaders)) return null;
    const headers = [];
    const subHeadersRow = [];

    const uucUnit = unitInfo?.uuc_unit?.description || unitInfo?.uuc_unit || unitInfo?.calculation || unitInfo?.test || '';
    const masterUnit = unitInfo?.master_unit?.description || unitInfo?.master_unit || unitInfo?.master || '';

    const formatHeader = (text) => {
      if (typeof text !== 'string') return text;
      let formatted = text;
      if (uucUnit) {
        formatted = formatted
          .replace(/\(UUC Unit\)/gi, `(${uucUnit.toUpperCase()})`)
          .replace(/\(UUCUNIT\)/gi, `(${uucUnit.toUpperCase()})`)
          .replace(/\[unit\]/gi, uucUnit.toUpperCase())
          .replace(/\(CALCULATIONUNIT\)/gi, `(${uucUnit.toUpperCase()})`)
          .replace(/\[CALCULATIONUNIT\]/gi, uucUnit.toUpperCase());
      }
      if (masterUnit) {
        formatted = formatted
          .replace(/\(Master Unit\)/gi, `(${masterUnit.toUpperCase()})`)
          .replace(/\(MASTERUNIT\)/gi, `(${masterUnit.toUpperCase()})`)
          .replace(/\[master unit\]/gi, masterUnit.toUpperCase())
          .replace(/\[MASTERUNIT\]/gi, masterUnit.toUpperCase());
      }
      return formatted.replace(/\[|\]/g, '');
    };

    structure.singleHeaders.forEach((header) => {
      headers.push({ name: formatHeader(header), colspan: 1 });
      subHeadersRow.push(null);
    });

    if (structure.subHeaders && Object.keys(structure.subHeaders).length > 0) {
      Object.entries(structure.subHeaders).forEach(([groupName, subHeaders]) => {
        headers.push({ name: formatHeader(groupName), colspan: subHeaders.length });
        subHeaders.forEach((subHeader) => {
          subHeadersRow.push(formatHeader(subHeader));
        });
      });
    }

    if (structure.remainingHeaders && structure.remainingHeaders.length > 0) {
      structure.remainingHeaders.forEach((header) => {
        headers.push({ name: formatHeader(header), colspan: 1 });
        subHeadersRow.push(null);
      });
    }

    return { headers, subHeadersRow, isMatrix: Boolean(selectedTableData?.structure?.isMatrix) };
  }, []);


  const fetchDynamicObservations = useCallback(async (observationTemplate) => {
    if (!observationTemplate || !instid || !inwardid) return;

    try {
      console.log('🔍 Fetching dynamic observations for template:', observationTemplate);

      const response = await axios.post(
        'https://kailtech.in/newlims/api/ob/get-observation',
        {
          fn: observationTemplate,
          instid: instid,
          inwardid: inwardid,
        }
      );

      const isSuccess = response.data.status === true || response.data.staus === true || response.data.success === true;

      if (isSuccess && (response.data.data || observationTemplate === 'observationbiomedical')) {
        const observationData = observationTemplate === 'observationbiomedical'
          ? response.data
          : response.data.data;
        setBiomedicalRawData(observationTemplate === 'observationbiomedical' ? observationData : null);
        console.log('📊 Dynamic Observation Data:', observationData);

        // Set thermal coefficients if available - SAME AS CALIBRATE STEP 3
        if (observationTemplate === 'observationctg' && observationData.thermal_coeff) {
          setThermalCoeff({
            uuc: observationData.thermal_coeff.uuc || '',
            master: observationData.thermal_coeff.master || '',
          });
        } else if (observationTemplate === 'observationmt' && observationData.thermal_coeff) {
          setThermalCoeff({
            uuc: observationData.thermal_coeff.uuc || '',
            master: observationData.thermal_coeff.master || '',
            thickness_of_graduation: observationData.thermal_coeff.thickness_of_graduation || '',
          });
        } else if (observationTemplate === 'observationit' && observationData.thermal_coefficients) {
          setThermalCoeff({
            uuc: observationData.thermal_coefficients.uuc_coefficient || '',
            master: observationData.thermal_coefficients.master_coefficient || '',
          });
        } else if (observationTemplate === 'observationfg') {
          const fgData = observationData.data || observationData;
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
        } else if (observationTemplate === 'observationhg') {
          if (observationData[0] && observationData[0].thermal_coefficients) {
            setThermalCoeff({
              uuc: observationData[0].thermal_coefficients.uuc_coefficient || '',
              master: observationData[0].thermal_coefficients.master_coefficient || '',
            });
          }
        } else if (observationTemplate === 'observationexm') {
          if (observationData.thermal_coefficients) {
            let addlExm = response.data?.additional_measurements || observationData?.additional_measurements || {};
            if (typeof addlExm === 'string') { try { addlExm = JSON.parse(addlExm); } catch { addlExm = {}; } }
            setThermalCoeff({
              uuc: observationData.thermal_coefficients.uuc || '',
              master: observationData.thermal_coefficients.master || '',
              thickness_of_graduation: '',
              parallinternal: addlExm.parallelism_spindle_anvil?.value ?? addlExm.parallinternal?.value ?? ''
            });
          }
        } else if (observationTemplate === 'observationmsr') {
          // ADDED: Handle thermal coefficients for observationmsr - SAME AS CALIBRATE STEP 3
          if (Array.isArray(observationData) && observationData.length > 0) {
            const msrData = observationData[0];
            if (msrData.thermal_coeff) {
              setThermalCoeff({
                uuc: msrData.thermal_coeff.uuc || '',
                master: msrData.thermal_coeff.master || '',
                thickness_of_graduation: ''
              });
            }
          }
        } else if (observationTemplate === 'observationdg') {
          // NEW: ADDED Handle thermal coefficients for observationdg - SAME AS CALIBRATE STEP 3
          if (observationData.thermal_coefficients) {
            setThermalCoeff({
              uuc: observationData.thermal_coefficients.uuc || '',
              master: observationData.thermal_coefficients.master || '',
              thickness_of_graduation: '' // DG doesn't use this field
            });
            console.log('✅ DG Thermal coefficients set:', observationData.thermal_coefficients);
          }
        } else if (observationTemplate === 'observationts') {
          const uucCoeff = observationData?.thermal_coefficient_uuc ?? observationData?.thermal_coefficients?.uuc ?? observationData?.thermal_coeff?.uuc ?? response.data?.thermal_coefficient_uuc ?? response.data?.thermal_coefficients?.uuc ?? response.data?.thermal_coeff?.uuc ?? '';
          const masterCoeff = observationData?.thermal_coefficient_master ?? observationData?.thermal_coefficients?.master ?? observationData?.thermal_coeff?.master ?? response.data?.thermal_coefficient_master ?? response.data?.thermal_coefficients?.master ?? response.data?.thermal_coeff?.master ?? '';
          if (uucCoeff || masterCoeff) {
            setThermalCoeff(prev => ({
              ...prev,
              uuc: uucCoeff,
              master: masterCoeff
            }));
          }
        }
        // ADDED: No thermal_coeff for observationrtdwi based on original logic
        // ADDED: No thermal_coeff for observationgtm based on original logic

        // Process observations based on template type - ENHANCED WITH MM SUPPORT AND ADDED IT, MT, MG, FG, HG, EXM, PPG, AVG, RTDWI, MSR, GTM, AND NOW DG
        let processedObservations = [];

        if (observationTemplate === 'observationbiomedical') {
          const formatPoints = (points, mode, section) => (
            Array.isArray(points)
              ? points.map((point) => {
                  let effectiveLc = point.least_count;
                  let effectiveLcDec = (point.lc_decimals != null && point.lc_decimals !== 'NA' && point.lc_decimals !== '') ? parseInt(point.lc_decimals, 10) : null;

                  const mlc = point.master_least_count;
                  const mlcDec = (point.mlc_decimals != null && point.mlc_decimals !== 'NA' && point.mlc_decimals !== '') ? parseInt(point.mlc_decimals, 10) : null;

                  if (mlc && mlc !== 'NA') {
                    const numMlc = parseFloat(mlc);
                    const numLc = parseFloat(effectiveLc);
                    if (!effectiveLc || effectiveLc === 'NA' || isNaN(numLc) || (effectiveLcDec === 0 && mlcDec > 0) || numMlc < numLc) {
                      effectiveLc = mlc;
                      effectiveLcDec = mlcDec;
                    }
                  }

                  return {
                    ...point,
                    mode,
                    biomedical_section: section,
                    least_count: effectiveLc ?? point.least_count,
                    lc_decimals: effectiveLcDec ?? point.lc_decimals,
                  };
                })
              : []
          );

          processedObservations = [
            ...formatPoints(observationData.performance_test?.measure, 'Measure', 'Performance Test'),
            ...formatPoints(observationData.performance_test?.source, 'Source', 'Performance Test'),
            ...formatPoints(observationData.electrical_safety?.measure, 'Measure', 'Electrical Safety'),
            ...formatPoints(observationData.electrical_safety?.source, 'Source', 'Electrical Safety'),
          ];
        } else if (observationTemplate === 'observationvc') {
          const therm = observationData.thermal_coeff || observationData.thermal_coefficients || response.data?.thermal_coefficients;
          if (therm) {
            setThermalCoeff({
              uuc: therm.uuc || therm.thermal_coeff_uuc || '',
              master: therm.master || therm.thermal_coeff_master || '',
              thickness_of_graduation: '',
            });
          }
          const addl = response.data?.additional_measurements || observationData.additional_measurements || {};
          const parall = observationData.parallelism || observationData.parallel || {};
          setParallelism({
            parallinternal: addl.external_jaws?.value ?? addl.parallelism_internal?.value ?? parall.parallinternal ?? parall.internal ?? observationData.parallinternal ?? '',
            parallexternal: addl.internal_jaws?.value ?? addl.parallelism_external?.value ?? parall.parallexternal ?? parall.external ?? observationData.parallexternal ?? '',
          });

          if (observationData.matrix_groups && Array.isArray(observationData.matrix_groups)) {
            processedObservations = observationData.matrix_groups;
          } else if (observationData.matrices && Array.isArray(observationData.matrices)) {
            processedObservations = observationData.matrices;
          } else if (observationData.unit_types && Array.isArray(observationData.unit_types)) {
            processedObservations = observationData.unit_types;
          } else if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
            processedObservations = observationData.calibration_points;
          } else if (observationData.points && Array.isArray(observationData.points)) {
            processedObservations = observationData.points;
          } else if (observationData.data && Array.isArray(observationData.data)) {
            processedObservations = observationData.data;
          } else if (Array.isArray(observationData)) {
            processedObservations = observationData;
          }
        }
        else if (observationTemplate === 'observationctg' && observationData.points) {
          processedObservations = observationData.points;
        }
        else if (observationTemplate === 'observationodfm') {
          console.log('🔄 Setting ODFM observations:', observationData);
          if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
            processedObservations = observationData.calibration_points;
          } else if (observationData.data?.calibration_points && Array.isArray(observationData.data.calibration_points)) {
            processedObservations = observationData.data.calibration_points;
          } else if (observationData.points && Array.isArray(observationData.points)) {
            processedObservations = observationData.points;
          } else if (observationData.data && Array.isArray(observationData.data)) {
            processedObservations = observationData.data;
          } else if (Array.isArray(observationData)) {
            processedObservations = observationData;
          } else {
            processedObservations = [];
          }
        }
        else if (observationTemplate === 'observationdpg') {
          const obsList = observationData.observations || observationData.observation_data?.observations || observationData.data?.observations;
          processedObservations = Array.isArray(obsList) ? obsList : [];
        }
        else if (observationTemplate === 'observationppg') {
          const obsList = observationData.observations || observationData.observation_data?.observations || observationData.data?.observations;
          processedObservations = Array.isArray(obsList) ? obsList : [];
        }
        else if (observationTemplate === 'observationavg') {
          console.log('🔄 Refetching AVG observations:', observationData);

          const avgData = observationData.data || observationData;

          if (avgData.calibration_point && Array.isArray(avgData.calibration_point)) {
            console.log('✅ AVG calibration_point found:', avgData.calibration_point);
            processedObservations = avgData.calibration_point;
          } else {
            console.log('❌ No AVG calibration_point found');
            processedObservations = [];
          }
        }
        else if (observationTemplate === 'observationexm') {
          console.log('🔄 Refetching EXM observations:', observationData);

          if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
            console.log('✅ Refetched EXM calibration_points:', observationData.calibration_points.length, 'points');
            processedObservations = observationData.calibration_points;

            // Handle thermal coefficients and additional measurements
            if (observationData.thermal_coefficients) {
              let addlExm = response.data?.additional_measurements || observationData?.additional_measurements || {};
              if (typeof addlExm === 'string') { try { addlExm = JSON.parse(addlExm); } catch { addlExm = {}; } }
              setThermalCoeff({
                uuc: observationData.thermal_coefficients.uuc || '',
                master: observationData.thermal_coefficients.master || '',
                thickness_of_graduation: '',
                parallinternal: addlExm.parallelism_spindle_anvil?.value ?? addlExm.parallinternal?.value ?? ''
              });
            }
          } else {
            console.log('❌ No EXM calibration_points found after refetch');
            processedObservations = [];
          }
        }
        else if (observationTemplate === 'observationapg') {
          processedObservations = observationData;
        }
        else if (observationTemplate === 'observationmm') {
          // Handle MM observations properly - SAME AS CALIBRATE STEP 3
          console.log('🔍 Processing observationmm data structure');

          if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
            console.log('Setting MM observations from calibration_points:', observationData.calibration_points);
            processedObservations = observationData.calibration_points;
          } else if (observationData.data && Array.isArray(observationData.data)) {
            console.log('Setting MM observations from data:', observationData.data);
            processedObservations = observationData.data;
          } else if (observationData.unit_types && Array.isArray(observationData.unit_types)) {
            console.log('Setting MM observations from unit_types:', observationData.unit_types);
            processedObservations = observationData.unit_types;
          } else if (Array.isArray(observationData)) {
            console.log('Setting MM observations directly:', observationData);
            processedObservations = observationData;
          } else {
            console.log('No MM observations found in expected format, trying to extract from object');

            // Try to extract calibration points from the object structure
            const possiblePoints = Object.values(observationData).filter(
              item => item && typeof item === 'object' && (item.sr_no !== undefined || item.sequence_number !== undefined || item.unit_type !== undefined || item.calibration_points !== undefined)
            );

            if (possiblePoints.length > 0) {
              console.log('Found potential MM points:', possiblePoints);
              processedObservations = possiblePoints;
            } else {
              console.log('No MM observations found');
              processedObservations = [];
            }
          }
        } else if (observationTemplate === 'observationit') {
          // Handle IT observations - SAME AS CALIBRATE STEP 3
          const itData = observationData.data || observationData;

          if (itData.calibration_points) {
            console.log('✅ Refetching IT observations:', itData.calibration_points);
            processedObservations = itData.calibration_points;

            if (itData.thermal_coefficients) {
              setThermalCoeff(prev => ({
                uuc: itData.thermal_coefficients.uuc_coefficient || '',
                master: itData.thermal_coefficients.master_coefficient || '',
                thickness_of_graduation: prev.thickness_of_graduation || '', // preserve existing
              }));
            }
          } else {
            processedObservations = [];
          }
        } else if (observationTemplate === 'observationmt') {
          // Handle MT observations - SAME AS CALIBRATE STEP 3
          const mtData = observationData.data || observationData;

          if (mtData.thermal_coeff) {
            setThermalCoeff({
              uuc: mtData.thermal_coeff.uuc || '',
              master: mtData.thermal_coeff.master || '',
              thickness_of_graduation: mtData.thermal_coeff.thickness_of_graduation || ''
            });
          }

          if (mtData.calibration_points) {
            console.log('✅ Refetching MT observations:', mtData.calibration_points);
            processedObservations = mtData.calibration_points;

            if (mtData.thermal_coeff) {
              setThermalCoeff({
                uuc: mtData.thermal_coeff.uuc || '',
                master: mtData.thermal_coeff.master || '',
                thickness_of_graduation: mtData.thermal_coeff.thickness_of_graduation || ''
              });
            }
          } else {
            processedObservations = [];
          }
        } else if (observationTemplate === 'observationmg') {
          // Handle MG observations - SAME AS CALIBRATE STEP 3
          console.log('🔄 Refetching MG observations:', observationData);

          const mgData = observationData.data || observationData;

          if (mgData.calibration_points && Array.isArray(mgData.calibration_points)) {
            console.log('✅ Refetched MG calibration_points:', mgData.calibration_points.length, 'points');
            processedObservations = mgData.calibration_points;
          } else if (mgData.observations && Array.isArray(mgData.observations)) {
            console.log('✅ Refetched MG observations:', mgData.observations.length, 'points');
            processedObservations = mgData.observations;
          } else {
            console.log('❌ No MG calibration_points found after refetch');
            processedObservations = [];
          }
        } else if (observationTemplate === 'observationfg') {
          // Handle FG observations - SAME AS CALIBRATE STEP 3
          console.log('🔄 Refetching FG observations:', observationData);

          const fgData = observationData.data || observationData;

          // Check both possible structures
          if (fgData.calibration_points && Array.isArray(fgData.calibration_points)) {
            console.log('✅ Refetched FG calibration_points:', fgData.calibration_points.length, 'points');
            processedObservations = fgData.calibration_points;
          } else if (fgData.unit_types && Array.isArray(fgData.unit_types)) {
            console.log('✅ Refetched FG unit_types:', fgData.unit_types.length, 'types');
            processedObservations = fgData.unit_types;
          } else {
            console.log('❌ No FG calibration_points or unit_types found after refetch');
            processedObservations = [];
          }
        } else if (observationTemplate === 'observationhg') {
          console.log('🔄 Refetching HG observations:', observationData);

          // HG has calibration_points in the second object of the array
          const hgData = observationData[1] || observationData;

          if (hgData.calibration_points && Array.isArray(hgData.calibration_points)) {
            console.log('✅ Refetched HG calibration_points:', hgData.calibration_points.length, 'points');
            processedObservations = hgData.calibration_points;

            // Handle thermal coefficients from the first object
            if (observationData[0] && observationData[0].thermal_coefficients) {
              setThermalCoeff({
                uuc: observationData[0].thermal_coefficients.uuc_coefficient || '',
                master: observationData[0].thermal_coefficients.master_coefficient || '',
                thickness_of_graduation: ''
              });
              console.log('✅ HG Thermal coefficients set:', observationData[0].thermal_coefficients);
            }
          } else {
            console.log('❌ No HG calibration_points found after refetch');
            processedObservations = [];
          }
        } else if (observationTemplate === 'observationrtdwi') {
          // ADDED: Specific processing for observationrtdwi - SAME AS CALIBRATE STEP 3
          console.log('Setting RTD WI observations:', observationData);

          if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
            console.log('✅ RTD WI calibration_points found:', observationData.calibration_points.length, 'points');
            processedObservations = observationData.calibration_points;
          } else {
            console.log('❌ No RTD WI calibration_points found');
            processedObservations = [];
          }
        } else if (observationTemplate === 'observationmsr') {
          // ADDED: Specific processing for observationmsr - SAME AS CALIBRATE STEP 3
          console.log('Setting MSR observations:', observationData);

          if (Array.isArray(observationData) && observationData.length > 0) {
            const msrData = observationData[0]; // Get first unit type object

            if (msrData.calibration_points && Array.isArray(msrData.calibration_points)) {
              console.log('✅ MSR calibration_points found:', msrData.calibration_points);
              processedObservations = msrData.calibration_points;

              // Handle thermal coefficients
              if (msrData.thermal_coeff) {
                setThermalCoeff({
                  uuc: msrData.thermal_coeff.uuc || '',
                  master: msrData.thermal_coeff.master || '',
                  thickness_of_graduation: '' // MSR doesn't use this field
                });
                console.log('✅ MSR Thermal coefficients set:', msrData.thermal_coeff);
              }
            } else {
              console.log('❌ No MSR calibration_points found');
              processedObservations = [];
            }
          } else {
            console.log('❌ MSR data not in expected array format');
            processedObservations = [];
          }
        } else if (observationTemplate === 'observationgtm') {
          // ADDED: Specific processing for observationgtm - SAME AS CALIBRATE STEP 3
          console.log('Setting GTM observations:', observationData);

          if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
            console.log('✅ GTM calibration_points found:', observationData.calibration_points.length, 'points');
            processedObservations = observationData.calibration_points;
          } else {
            console.log('❌ No GTM calibration_points found');
            processedObservations = [];
          }
        } else if (observationTemplate === 'observationtm') {
          console.log('Setting TM observations:', observationData);
          if (Array.isArray(observationData)) {
            processedObservations = observationData;
          } else if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
            processedObservations = observationData.calibration_points;
          } else if (observationData.data && Array.isArray(observationData.data)) {
            processedObservations = observationData.data;
          } else {
            processedObservations = [];
          }
        } else if (observationTemplate === 'observationdg') {
          // NEW: ADDED Specific processing for observationdg - SAME AS CALIBRATE STEP 3
          console.log('🔍 Setting DG observations:', observationData);

          // DG can return data in multiple formats - handle all cases
          if (observationData.observations && Array.isArray(observationData.observations)) {
            console.log('✅ DG observations found:', observationData.observations.length, 'points');
            processedObservations = observationData.observations;
          } else if (Array.isArray(observationData)) {
            // Fallback if data is directly an array
            console.log('✅ DG observations as array:', observationData.length, 'points');
            processedObservations = observationData;
          } else {
            console.log('❌ No DG observations found in expected format');
            processedObservations = [];
          }

          // Handle thermal coefficients for DG
          if (observationData.thermal_coefficients) {
            setThermalCoeff({
              uuc: observationData.thermal_coefficients.uuc || '',
              master: observationData.thermal_coefficients.master || '',
              thickness_of_graduation: '' // DG doesn't use this field
            });
            console.log('✅ DG Thermal coefficients set:', observationData.thermal_coefficients);
          }
        } else if (observationTemplate === 'observationdw') {
          console.log('🔍 Setting DW observations:', observationData);
          if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
            processedObservations = observationData.calibration_points;
          } else if (observationData.data && Array.isArray(observationData.data)) {
            processedObservations = observationData.data;
          } else if (Array.isArray(observationData)) {
            processedObservations = observationData;
          }
          const env = observationData.environment || response.data?.environment || response.data?.data?.environment;
          if (env) {
            const pStart = env.pressure_start ?? env.pressurestart;
            const pEnd = env.pressure_end ?? env.pressureend;
            const sTime = env.stabilization_time ?? env.stabilizationtime;
            setEquipmentData(prev => ({
              ...prev,
              ...(pStart !== undefined && pStart !== null && pStart !== '' ? { pressurestart: pStart } : {}),
              ...(pEnd !== undefined && pEnd !== null && pEnd !== '' ? { pressureend: pEnd } : {}),
              ...(sTime !== undefined && sTime !== null && sTime !== '' ? { stabilizationtime: sTime } : {}),
            }));
          }
        } else if (observationTemplate === 'observationwb' || observationTemplate === 'observationwbn') {
          if (observationData.weighing_process || observationData.repeatability || observationData.eccentricity) {
            processedObservations = [observationData];
          } else if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
            processedObservations = observationData.calibration_points;
          } else if (observationData.data && Array.isArray(observationData.data)) {
            processedObservations = observationData.data;
          } else if (Array.isArray(observationData)) {
            processedObservations = observationData;
          } else {
            processedObservations = [observationData];
          }
        } else if (observationTemplate === 'observationwwbn') {
          if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
            processedObservations = observationData.calibration_points;
          } else if (observationData.data && Array.isArray(observationData.data)) {
            processedObservations = observationData.data;
          } else if (Array.isArray(observationData)) {
            processedObservations = observationData;
          }
        } else if (observationTemplate === 'observationuc') {
          if (observationData.measure_data || observationData.source_data) {
            const combined = [];
            if (Array.isArray(observationData.measure_data)) {
              combined.push(...observationData.measure_data.map(p => ({ ...p, mode: 'Measure' })));
            }
            if (Array.isArray(observationData.source_data)) {
              combined.push(...observationData.source_data.map(p => ({ ...p, mode: 'Source' })));
            }
            processedObservations = combined;
          } else if (Array.isArray(observationData)) {
            processedObservations = observationData;
          } else if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
            processedObservations = observationData.calibration_points;
          } else if (observationData.data && Array.isArray(observationData.data)) {
            processedObservations = observationData.data;
          } else {
            processedObservations = [];
          }
        } else if (observationTemplate === 'observationcustom') {
          if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
            processedObservations = observationData.calibration_points;
          } else if (observationData.data && Array.isArray(observationData.data)) {
            processedObservations = observationData.data;
          } else if (Array.isArray(observationData)) {
            processedObservations = observationData;
          } else {
            processedObservations = [];
          }
          if (observationData.instrument_settings) {
            setRawdata(prev => ({ ...prev, listInstrument: observationData.instrument_settings }));
          }
        } else if (observationTemplate === 'observationts' || observationTemplate === 'observationsw') {
          const templateName = observationTemplate === 'observationts' ? 'TS (Test Sieve)' : 'SW (Stop Watch)';
          console.log('🔍 Setting ' + templateName + ' observations:', observationData);
          if (observationTemplate === 'observationts') {
            const uucCoeff = observationData?.thermal_coefficient_uuc ?? observationData?.thermal_coefficients?.uuc ?? observationData?.thermal_coeff?.uuc ?? response.data?.thermal_coefficient_uuc ?? response.data?.thermal_coefficients?.uuc ?? response.data?.thermal_coeff?.uuc ?? '';
            const masterCoeff = observationData?.thermal_coefficient_master ?? observationData?.thermal_coefficients?.master ?? observationData?.thermal_coeff?.master ?? response.data?.thermal_coefficient_master ?? response.data?.thermal_coefficients?.master ?? response.data?.thermal_coeff?.master ?? '';
            if (uucCoeff || masterCoeff) {
              setThermalCoeff(prev => ({
                ...prev,
                uuc: uucCoeff,
                master: masterCoeff
              }));
            }
          }
          if (Array.isArray(observationData)) {
            processedObservations = observationData;
          } else if (observationData.calibration_points && Array.isArray(observationData.calibration_points)) {
            processedObservations = observationData.calibration_points;
          } else if (observationData.data && Array.isArray(observationData.data)) {
            processedObservations = observationData.data;
          } else if (observationData.readings && Array.isArray(observationData.readings)) {
            processedObservations = observationData.readings;
          } else if (typeof observationData === 'object' && observationData !== null) {
            // Handle object format where keys are numeric (0, 1, 2, etc)
            const readings = [];
            Object.keys(observationData).forEach(key => {
              if (!isNaN(key) && observationData[key]) {
                readings.push(observationData[key]);
              }
            });
            processedObservations = readings.length > 0 ? readings : [];
          } else {
            processedObservations = [];
          }
          console.log('✅ ' + templateName + ' observations processed:', processedObservations.length, 'rows');
        } else {
          processedObservations = [];
        }

        setDynamicObservations(processedObservations);
        console.log('✅ Processed observations set:', processedObservations.length);

        // Generate table structure
        const selectedTable = observationTables.find(table => table.id === observationTemplate);
        if (selectedTable) {
          if (observationTemplate === 'observationcustom' && observationData.instrument_settings) {
            selectedTable.structure = getObservationCustomStructure(observationData.instrument_settings);
          }
          const units = observationData?.units || observationData?.unit_info || observationData?.data?.units || observationData?.observations?.[0]?.units || processedObservations?.[0]?.units;
          setTableStructure(generateTableStructure(selectedTable, units));
        }
        return observationData;
      } else {
        console.log('No dynamic observations found');
        setDynamicObservations([]);
        setTableStructure(null);
        return null;
      }
    } catch (error) {
      console.log('Error fetching dynamic observations:', error);
      setDynamicObservations([]);
      setTableStructure(null);
      return null;
    }
  }, [instid, inwardid, generateTableStructure]);

  // Fetch observation data - FIXED VERSION (generalized, but keeping for compatibility)
  const fetchObservationData = useCallback(async (observationTemplate) => {
    if (!instid || !inwardid) return;

    try {
      console.log('Fetching observation data for template:', observationTemplate);

      const observationApiUrl = `${JWT_HOST_API}/ob/get-observation`;

      const observationPayload = {
        "fn": observationTemplate, // Use dynamic template instead of hardcoded
        "instid": instid,
        "inwardid": inwardid
      };

      console.log('Making observation API call with payload:', observationPayload);

      const observationResponse = await axios.post(observationApiUrl, observationPayload, {
        timeout: 30000
      });

      console.log('Observation API Response:', observationResponse.data);

      if (observationResponse.data && observationResponse.data.status === true && observationResponse.data.data) {
        const { thermal_coeff, points } = observationResponse.data.data;

        // Set thermal coefficients
        if (thermal_coeff) {
          setThermalCoeff(thermal_coeff);
        }

        // Process observation points - FIXED VERSION
        if (points && Array.isArray(points)) {
          const processedObservations = points.map((point, index) => {
            // Extract observations (non-null values only)
            const validObservations = point.observations ?
              point.observations.filter(obs => obs !== null && obs !== undefined) : [];

            // Create the base observation object
            const observationItem = {
              srNo: point.sr_no || index + 1,
              nominalValue: point.nominal_value || 'N/A',
              unit: point.unit || 'N/A',
              leastCount: point.least_count || 'N/A',
              average: point.average?.value || 'N/A',
              error: point.error?.value || 'N/A',
              repeatableCycle: point.repeatable_cycle || validObservations.length,
              totalObservations: validObservations.length,
              observations: validObservations.map(obs => obs?.value || 'N/A') // Store actual observation values
            };

            return observationItem;
          });

          setObservationData(processedObservations);
          console.log('Observation data processed:', processedObservations);
        }
      } else {
        console.log('No observation data found in response');
        setObservationData([]);
      }
    } catch (err) {
      console.error('Error fetching observation data:', err);
      setObservationData([]);
    }
  }, [instid, inwardid]);

  // ENHANCED Fetch calibration report data with better observation template detection
  useEffect(() => {
    const fetchCalibrationReport = async () => {
      if (!instid || !inwardid) {
        setError(`Missing parameters - instid: ${instid}, inwardid: ${inwardid}`);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const apiUrl = `${JWT_HOST_API}/calibrationprocess/view-raw-data`;

        const params = {
          instid: instid,
          inwardid: inwardid
        };

        console.log('Making API call with params:', params);

        const response = await axios.get(apiUrl, {
          params,
          timeout: 30000
        });

        console.log('API Response received:', response.data);

        if (response.data && response.data.success === true && response.data.data) {
          const { uuc_details, master_details, calibration_results, observation_data, instrument_info } = response.data.data;

          if (instrument_info) {
            setInstrumentInfo(instrument_info);
          }
          if (response.data.data.status !== undefined) {
            setItemStatus(response.data.data.status);
          }

          // Resolve observation template directly from instrument_info.suffix or observation_data
          let resolvedTemplate = '';
          const rawSuffix = instrument_info?.suffix || response.data.data.instrument?.suffix || '';
          if (rawSuffix) {
            resolvedTemplate = rawSuffix.startsWith('observation') ? rawSuffix : `observation${rawSuffix}`;
          } else if (observation_data && observation_data.observation_type) {
            resolvedTemplate = observation_data.observation_type;
          }

          let dynEnv = null;
          if (resolvedTemplate) {
            console.log('✅ Resolved observation template:', resolvedTemplate);
            setObservationType(resolvedTemplate);
            setObservationTemplate(resolvedTemplate);
            const dynObsResult = await fetchDynamicObservations(resolvedTemplate);
            dynEnv = dynObsResult?.environment || dynObsResult?.data?.environment;
            await fetchObservationData(resolvedTemplate);

            if (observation_data?.observations) {
              const obsList = observation_data.observations || observation_data.data?.observations;
              if (Array.isArray(obsList) && obsList.length > 0) {
                setDynamicObservations(prev => (prev && prev.length > 0 ? prev : obsList));
                const selectedTable = observationTables.find(table => table.id === resolvedTemplate);
                if (selectedTable) {
                  const units = obsList[0]?.units || observation_data?.units;
                  setTableStructure(prev => prev || generateTableStructure(selectedTable, units));
                }
              }
            }

            if (resolvedTemplate === 'observationvc' && observation_data) {
              const therm = observation_data.thermal_coeff || observation_data.thermal_coefficients;
              if (therm) {
                setThermalCoeff({
                  uuc: therm.uuc || therm.thermal_coeff_uuc || '',
                  master: therm.master || therm.thermal_coeff_master || '',
                  thickness_of_graduation: '',
                });
              }
              const addl = observation_data.additional_measurements || response.data?.data?.additional_measurements || {};
              const parall = observation_data.parallelism || observation_data.parallel || {};
              setParallelism({
                parallinternal: addl.external_jaws?.value ?? addl.parallelism_internal?.value ?? parall.parallinternal ?? parall.internal ?? observation_data.parallinternal ?? '',
                parallexternal: addl.internal_jaws?.value ?? addl.parallelism_external?.value ?? parall.parallexternal ?? parall.external ?? observation_data.parallexternal ?? '',
              });
              if (observation_data.matrix_groups && Array.isArray(observation_data.matrix_groups)) {
                setDynamicObservations(observation_data.matrix_groups);
              }
            }
          }

          if (uuc_details) {
            // Extract reference standards from standards array
            let referenceStandards = "N/A";
            if (response.data.data.standards && Array.isArray(response.data.data.standards) && response.data.data.standards.length > 0) {
              referenceStandards = response.data.data.standards
                .map(std => std.name)
                .filter(name => name) // Remove null/undefined values
                .join(', ');
            }

            const pStart = uuc_details.pressurestart || uuc_details.pressure_start || response.data.data.instrument?.pressurestart || response.data.data.instrument?.pressure_start || dynEnv?.pressure_start || dynEnv?.pressurestart || "N/A";
            const pEnd = uuc_details.pressureend || uuc_details.pressure_end || response.data.data.instrument?.pressureend || response.data.data.instrument?.pressure_end || dynEnv?.pressure_end || dynEnv?.pressureend || "N/A";
            const sTime = uuc_details.stabilizationtime || uuc_details.stabilization_time || response.data.data.instrument?.stabilizationtime || response.data.data.instrument?.stabilization_time || dynEnv?.stabilization_time || dynEnv?.stabilizationtime || "N/A";

            const mappedEquipmentData = {
              name: uuc_details.equipment_name || uuc_details.name || "N/A",
              make: uuc_details.make || "N/A",
              model: uuc_details.model || "N/A",
              serialNo: uuc_details.serial_no || uuc_details.serialNo || "N/A",
              idNo: uuc_details.id_no || uuc_details.idNo || "N/A",
              brnNo: uuc_details.brn_no || uuc_details.brnNo || "N/A",
              inwarddate: response.data.data.inwardEntry?.inwarddate || uuc_details.receive_date || uuc_details.receiveDate || "N/A",
              range: uuc_details.range || "N/A",
              leastCount: uuc_details.least_count || uuc_details.leastCount || "N/A",
              condition: uuc_details.condition || "N/A",
              performedAt: uuc_details.calibration_location || uuc_details.performedAt || caliblocation,
              startedOn: formatDateTime(uuc_details.started_on || uuc_details.startdate || uuc_details.start_date) || "N/A",
              calibratedon: response.data.data.instrument?.calibratedon || uuc_details.calibrated_on || uuc_details.calibratedon || "N/A",
              endedOn: formatDateTime(uuc_details.ended_on || uuc_details.enddate || uuc_details.end_date) || "N/A",
              referenceStd: referenceStandards,
              temperature: uuc_details.temperature !== undefined && uuc_details.temperature !== null ? uuc_details.temperature : "N/A",
              humidity: uuc_details.humidity !== undefined && uuc_details.humidity !== null ? uuc_details.humidity : "N/A",
              tempend: uuc_details.temperature_end ?? uuc_details.temp_end ?? uuc_details.tempend ?? response.data.data.instrument?.tempend ?? "N/A",
              humiend: uuc_details.humidity_end ?? uuc_details.humi_end ?? uuc_details.humiend ?? response.data.data.instrument?.humiend ?? "N/A",
              pressurestart: pStart,
              pressureend: pEnd,
              stabilizationtime: sTime,
              suggestedDueDate: response.data.data.instrument?.duedate || uuc_details.due_date || uuc_details.suggested_due_date || "N/A",
              certificateNo: uuc_details.certificate_no || "N/A",
              calibratedBy: uuc_details.calibrated_by,
              authorizedBy: uuc_details.authorized_by,
            };
            setEquipmentData(prev => ({
              ...prev,
              ...mappedEquipmentData,
              pressurestart: mappedEquipmentData.pressurestart !== "N/A"
                ? mappedEquipmentData.pressurestart
                : (prev.pressurestart && prev.pressurestart !== "N/A"
                  ? prev.pressurestart
                  : (dynEnv?.pressure_start || dynEnv?.pressurestart || "N/A")),
              pressureend: mappedEquipmentData.pressureend !== "N/A"
                ? mappedEquipmentData.pressureend
                : (prev.pressureend && prev.pressureend !== "N/A"
                  ? prev.pressureend
                  : (dynEnv?.pressure_end || dynEnv?.pressureend || "N/A")),
              stabilizationtime: mappedEquipmentData.stabilizationtime !== "N/A"
                ? mappedEquipmentData.stabilizationtime
                : (prev.stabilizationtime && prev.stabilizationtime !== "N/A"
                  ? prev.stabilizationtime
                  : (dynEnv?.stabilization_time || dynEnv?.stabilizationtime || "N/A")),
            }));

            if (response.data.data.instrument) {
              setRawdata({ listInstrument: response.data.data.instrument });
              if (response.data.data.instrument.daigram) {
                setDiagram(response.data.data.instrument.daigram);
              } else if (response.data.data.instrument.diagram) {
                setDiagram(response.data.data.instrument.diagram);
              }
            }

            if (response.data.data.calibrated_by) {
              setCalibratedByImageUrl(response.data.data.calibrated_by);
              console.log('✅ Calibrated By Image URL set:', response.data.data.calibrated_by);
            }

            if (response.data.data.calibrated_by_text_image) {
              setCalibratedByTextImage(response.data.data.calibrated_by_text_image);
              console.log('✅ Calibrated By Text Image URL set:', response.data.data.calibrated_by_text_image);
            }

            if (response.data.data.approvedby) {
              setApprovedByImageUrl(response.data.data.approvedby);
              console.log('✅ Approved By Image URL set:', response.data.data.approvedby);
            }

            if (response.data.data.approved_by_text_image) {
              setApprovedByTextImage(response.data.data.approved_by_text_image);
              console.log('✅ Approved By Text Image URL set:', response.data.data.approved_by_text_image);
            }
          }

          // Map master details
          if (master_details && Array.isArray(master_details)) {
            const mappedMasterData = master_details.map((master, index) => ({
              reference: master.reference_standard || master.reference || master.name || "N/A",
              srNo: master.sr_no || master.serial_no || `${index + 1}`,
              idNo: master.id_no || master.id || "N/A",
              certificate: master.certificate_no || master.certificate || master.cert_no || "N/A",
              validUpto: formatDate(master.valid_upto || master.validity || master.enddate) || "N/A"
            }));

            setMasterData(mappedMasterData);
            console.log('Master data mapped:', mappedMasterData);
          }

          // Map calibration results
          if (calibration_results && Array.isArray(calibration_results)) {
            const mappedResults = calibration_results.map((result, index) => ({
              sr: result.sr_no || result.sr || index + 1,
              nominal: result.nominal_value || result.nominal || "N/A",
              mass: result.conventional_mass || result.actual_value || result.mass || "N/A",
              error: result.error || result.deviation || "N/A"
            }));

            setResults(mappedResults);
            console.log('Results mapped:', mappedResults);
          } else {
            setResults([]);
            console.log('No calibration results found');
          }

        } else {
          throw new Error(response.data?.message || 'Invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching calibration report:', err);
        let errorMessage = 'Failed to load calibration report';

        if (err.response) {
          const status = err.response.status;
          const serverMessage = err.response.data?.message || err.response.statusText;

          if (status === 405) {
            errorMessage = `Method Not Allowed: Server expects GET request, not POST`;
          } else if (status === 401) {
            errorMessage = `Authentication Required: Please login again`;
          } else if (status === 403) {
            errorMessage = `Access Forbidden: Insufficient permissions`;
          } else if (status === 404) {
            errorMessage = `Not Found: API endpoint or resource not found`;
          } else {
            errorMessage = `Server Error ${status}: ${serverMessage}`;
          }

          console.error('Response details:', {
            status: err.response.status,
            headers: err.response.headers,
            data: err.response.data
          });
        } else if (err.request) {
          errorMessage = 'Network Error: Cannot reach server. Please check your connection.';
          console.error('Request details:', err.request);
        } else if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request Timeout: Server took too long to respond';
        } else {
          errorMessage = err.message;
        }

        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    console.log('Starting fetch with parameters:', { instid, inwardid });
    fetchCalibrationReport();
  }, [instid, inwardid, caliblocation, calibacc, fetchDynamicObservations, fetchObservationData, observationTemplate]);

  // Helper functions for date formatting
  const formatDate = (dateString) => {
    if (!dateString || dateString === '0000-00-00' || dateString === 'null' || dateString === null || dateString === '-') return '-';
    if (typeof dateString === 'string') {
      const trimmed = dateString.trim();
      // If already in DD.MM.YYYY, DD/MM/YYYY, or DD-MM-YYYY format, return directly
      if (/^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}$/.test(trimmed)) {
        return trimmed.replace(/-/g, '.');
      }
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-GB');
    } catch {
      return dateString || '-';
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString || dateTimeString === '0000-00-00 00:00:00' || dateTimeString === 'null' || dateTimeString === null || dateTimeString === '-') return '';
    if (typeof dateTimeString === 'string') {
      const trimmed = dateTimeString.trim();
      // If already formatted like DD/MM/YYYY HH:mm:ss, DD.MM.YYYY, or DD-MM-YYYY
      if (/^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(trimmed)) {
        return trimmed;
      }
    }
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return dateTimeString;
      return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTimeString || '';
    }
  };

  const handleBackToPerformCalibration = () => {
    navigate(`/dashboards/calibration-process/inward-entry-lab/perform-calibration/${inwardid}?caliblocation=${caliblocation}&calibacc=${calibacc}`);
  };

  const handlePrint = (e) => {
    if (e && (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1)) {
      return;
    }
    e?.preventDefault();
    const printableElement = document.getElementById('printable-content');
    if (!printableElement) {
      toast.error('No content to print');
      return;
    }
    window.print();
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  // Helper function to determine maximum number of observations across all points
  const getMaxObservations = () => {
    if (observationData.length === 0) return 0;
    return Math.max(...observationData.map(item => item.observations ? item.observations.length : 0));
  };

  // Loading state
  if (loading && !error) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-600">
        <svg className="animate-spin h-6 w-6 mr-2 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
        </svg>
        Loading ViewRawData...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-white text-sm">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600 mb-4">⚠️ Error loading calibration report</div>
          <div className="text-sm text-gray-600 mb-4 text-center max-w-2xl">
            {error}
          </div>
          <div className="text-xs text-gray-500 mb-4 p-3 bg-gray-100 rounded">
            <strong>Debug Info:</strong><br />
            Parameters: inwardid={inwardid}, instid={instid}<br />
            Location: {caliblocation}, Accreditation: {calibacc}<br />
            URL: {window.location.href}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              🔄 Retry
            </Button>
            <Button
              onClick={handleBackToPerformCalibration}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              ← Back to Perform Calibration
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderObservationTMTable = () => {
    return (
      <div className="overflow-x-auto mb-6">
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Sr. No.</th>
              <th rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Parameter</th>
              <th rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Nominal/ Set Value</th>
              <th rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Range</th>
              <th rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Value Shown on</th>
              <th colSpan="5" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Observation</th>
              <th rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Average</th>
              <th rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">Error</th>
            </tr>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-center text-xs font-medium text-gray-500">1&6</th>
              <th className="border border-gray-300 px-4 py-2 text-center text-xs font-medium text-gray-500">2&7</th>
              <th className="border border-gray-300 px-4 py-2 text-center text-xs font-medium text-gray-500">3&8</th>
              <th className="border border-gray-300 px-4 py-2 text-center text-xs font-medium text-gray-500">4&9</th>
              <th className="border border-gray-300 px-4 py-2 text-center text-xs font-medium text-gray-500">5&10</th>
            </tr>
          </thead>
          {(observationRows?.rows || []).map((row, rowIndex) => {
            return (
              <tbody key={rowIndex}>
                {/* UUC Row 1 (Obs 1-5) */}
                <tr>
                  <td rowSpan="4" className="border border-gray-300 px-4 py-2 text-center">{row[0]}</td>
                  <td rowSpan="4" className="border border-gray-300 px-4 py-2 text-center">{row[1]}</td>
                  <td rowSpan="4" className="border border-gray-300 px-4 py-2 text-center">{row[2]}</td>
                  <td rowSpan="4" className="border border-gray-300 px-4 py-2 text-center">{row[3]}</td>
                  <td rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium bg-gray-50">UUC</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[4]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[5]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[6]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[7]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[8]}</td>
                  <td rowSpan="2" className="border border-gray-300 px-4 py-2 text-center bg-gray-50">{row[24]}</td>
                  <td rowSpan="4" className="border border-gray-300 px-4 py-2 text-center bg-gray-50">{row[25]}</td>
                </tr>
                {/* UUC Row 2 (Obs 6-10) */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[9]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[10]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[11]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[12]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[13]}</td>
                </tr>
                {/* Master Row 1 (Obs 1-5) */}
                <tr>
                  <td rowSpan="2" className="border border-gray-300 px-4 py-2 text-center font-medium bg-gray-50">Master</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[14]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[15]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[16]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[17]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[18]}</td>
                  <td rowSpan="2" className="border border-gray-300 px-4 py-2 text-center bg-gray-50">{row[26]}</td>
                </tr>
                {/* Master Row 2 (Obs 6-10) */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[19]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[20]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[21]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[22]}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row[23]}</td>
                </tr>
              </tbody>
            );
          })}
        </table>
      </div>
    );
  };

  const renderWeighingBalanceTables = () => {
    const weighingCount = observationRows?.weighingCount || 0;
    const repeatabilityCount = observationRows?.repeatabilityCount || 0;
    const eccentricityCount = observationRows?.eccentricityCount || 0;

    return (
      <div className="space-y-8 print:space-y-6">
        {/* Diagram Selection Display */}
        {diagram && (
          <div className="mb-6 flex flex-col items-center gap-2">
            <h4 className="font-semibold text-sm">Selected Diagram: {diagram === 'circalimg' ? 'Circular Diagram' : 'Rectangular Diagram'}</h4>
            <img
              src={diagram === 'circalimg' ? '/images/circalimg.png' : '/images/newrectangle.png'}
              alt="Selected Diagram"
              className="h-32 object-contain border border-gray-200 p-2 rounded"
            />
          </div>
        )}

        {/* 1. Weighing Process Table */}
        {weighingCount > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-sm bg-gray-100 p-2 border border-gray-300">Weighing Process</h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-300">
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Sr. No.</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Nominal Value</th>
                    <th colSpan="3" className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700">Reading</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Average</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Error</th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300"></th>
                    <th className="border border-gray-300"></th>
                    <th className="border border-gray-300 px-2 py-1 text-center text-xs font-medium text-gray-600">1</th>
                    <th className="border border-gray-300 px-2 py-1 text-center text-xs font-medium text-gray-600">2</th>
                    <th className="border border-gray-300 px-2 py-1 text-center text-xs font-medium text-gray-600">3</th>
                    <th className="border border-gray-300"></th>
                    <th className="border border-gray-300"></th>
                  </tr>
                </thead>
                <tbody>
                  {(observationRows?.rows || []).slice(0, weighingCount).map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="border border-gray-300 px-3 py-2 text-center">
                          {cell || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Repeatability Table */}
        {repeatabilityCount > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-sm bg-gray-100 p-2 border border-gray-300">Repeatability</h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-300">
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Nominal Value</th>
                    <th colSpan="10" className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700">Reading on UUC</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Average</th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300"></th>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <th key={i} className="border border-gray-300 px-2 py-1 text-center text-xs font-medium text-gray-600">{i + 1}</th>
                    ))}
                    <th className="border border-gray-300"></th>
                  </tr>
                </thead>
                <tbody>
                  {(observationRows?.rows || []).slice(weighingCount, weighingCount + repeatabilityCount).map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="border border-gray-300 px-3 py-2 text-center">
                          {cell || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Eccentricity Table */}
        {eccentricityCount > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-sm bg-gray-100 p-2 border border-gray-300">Eccentricity</h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-300">
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Nominal Value</th>
                    <th colSpan="5" className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700">Reading on Clockwise</th>
                    <th colSpan="5" className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700">Reading on Anticlockwise</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">D=Ec (Max-Min)/2</th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300"></th>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <th key={i} className="border border-gray-300 px-2 py-1 text-center text-xs font-medium text-gray-600">{i + 1}</th>
                    ))}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <th key={i + 5} className="border border-gray-300 px-2 py-1 text-center text-xs font-medium text-gray-600">{i + 1}</th>
                    ))}
                    <th className="border border-gray-300"></th>
                  </tr>
                </thead>
                <tbody>
                  {(observationRows?.rows || []).slice(weighingCount + repeatabilityCount).map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="border border-gray-300 px-3 py-2 text-center">
                          {cell || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderObservationTSTable = () => {
    const allRows = observationRows?.rows || [];
    const sieves = [];

    // Group rows into 5-cycle sets (each set represents 1 sieve / calibration point)
    for (let i = 0; i < allRows.length; i += 5) {
      const sieveRows = allRows.slice(i, i + 5);
      const nominalSize = observationRows?.hiddenInputs?.values?.[i] || '';
      sieves.push({
        nominalSize,
        rows: sieveRows
      });
    }

    if (sieves.length === 0 && allRows.length > 0) {
      sieves.push({
        nominalSize: observationRows?.hiddenInputs?.values?.[0] || '',
        rows: allRows
      });
    }

    return (
      <div className="space-y-6 mb-6">
        {sieves.map((sieve, sIdx) => (
          <div key={sIdx} className="overflow-x-auto border border-gray-300">
            <table className="w-full border-collapse text-sm">
              <thead>
                {/* Nominal Size of Sieve Header */}
                <tr className="bg-white border-b border-gray-300">
                  <td colSpan={10} className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-900">
                    Nominal Size of Sieve: {sieve.nominalSize}
                  </td>
                </tr>
                {/* Warp and Weft Sub-section Headers */}
                <tr className="bg-gray-50 border-b border-gray-300">
                  <td colSpan={5} className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                    Aperture Size on Warp Side(in µm/mm)
                  </td>
                  <th colSpan={5} className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                    Aperture Size on Weft Side(in µm/mm)
                  </th>
                </tr>
                {/* Column Headers */}
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Sr no</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (1)</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (2)</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (3)</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (4)</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (1)</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (2)</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (3)</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Aperture Size (4)</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Average Aperture</th>
                </tr>
              </thead>
              <tbody>
                {sieve.rows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border border-gray-300 px-3 py-2 text-left">
                        {cell !== null && cell !== undefined ? cell : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  const maxObservations = getMaxObservations();
  const selectedTableData = observationTables.find(table => table.id === observationTemplate);
  const observationRows = (selectedTableData ? createObservationRows(dynamicObservations, observationTemplate, rawdata) : null) || {
    rows: [],
    matrixGroups: [],
    unitTypes: [],
    modes: [],
    hiddenInputs: { values: [], calibrationPoints: [], repeatables: [] },
    weighingCount: 0,
    repeatabilityCount: 0,
    eccentricityCount: 0,
  };
  const isBiomedicalEnabled = (value) => String(value || '').toLowerCase() === 'yes';
  const biomedicalConfig = biomedicalRawData?.config || {};
  const hasBiomedicalContent = observationTemplate === 'observationbiomedical' && (
    (isBiomedicalEnabled(biomedicalConfig.show_visual_test) && biomedicalRawData?.visual_test?.length > 0) ||
    (isBiomedicalEnabled(biomedicalConfig.show_basic_safety) && biomedicalRawData?.basic_safety?.length > 0) ||
    (observationRows?.rows?.length || 0) > 0
  );

  return (
    <>
      {/* Inline styles for print media query - Hides everything except printable content */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-content, #printable-content * {
              visibility: visible;
            }
            #printable-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
          @media screen {
            .no-print {
              display: flex;
            }
          }
        `}
      </style>

      <div className="p-6 bg-white text-sm">
        {/* Header - Hidden on print */}
        <div className="flex items-center justify-between mb-4 no-print">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              View Raw Data - Calibration Report
            </h2>
            {itemStatus === 0 && (
              <span className="ml-3 px-2 py-0.5 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 rounded">
                DRAFT
              </span>
            )}
          </div>
          <Button
            variant="outline"
            className="text-white bg-blue-600 hover:bg-blue-700"
            onClick={handleBackToPerformCalibration}
          >
            ← Back to Perform Calibration
          </Button>
        </div>

        {/* Wrap all printable content in this div */}
        <div id="printable-content" className={itemStatus === 0 ? "relative bg-[url('/images/draft.png')] bg-no-repeat bg-center" : "relative"}>
          {/* Current Observation Template Display */}
          {observationType && (
            <div></div>
          )}

          {/* Details Of UUC */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <img src="/images/logo.png" alt="Logo" className="h-14" onError={(e) => { e.target.style.display = 'none' }} />
              {[27, 179, 174, 168, 95, 26, 24].includes(Number(instrumentInfo?.id)) && (
                <h3 className="text-sm font-bold text-gray-700">KTRC/CF/CAL/02-R1</h3>
              )}
            </div>
            {[27, 179, 174, 168, 95, 26, 24].includes(Number(instrumentInfo?.id)) ? (
              <div className="text-center my-3">
                <h2 className="text-base font-bold underline uppercase">CALIBRATION RAW DATA SHEET OF FORCE</h2>
                <h3 className="text-sm font-semibold mt-1">Details Of UUC</h3>
              </div>
            ) : (
              <h2 className="text-lg font-semibold mt-2">(Details Of UUC)</h2>
            )}
          </div>

          {/* Equipment Details */}
          <div className="grid grid-cols-2 gap-y-1 gap-x-8 mb-6 text-sm">
            <p><b>Name Of The Equipment:</b> {equipmentData.name}</p>
            <p><b>BRN No:</b> {equipmentData.brnNo}</p>

            <p><b>Make:</b> {equipmentData.make}</p>
            <p><b>Receive Date:</b> {equipmentData.inwarddate}</p>

            <p><b>Model:</b> {equipmentData.model}</p>
            <p><b>Range:</b> {equipmentData.range}</p>

            <p><b>Serial No:</b> {equipmentData.serialNo}</p>
            <p><b>Least Count:</b> {equipmentData.leastCount}</p>

            <p><b>ID No:</b> {equipmentData.idNo}</p>
            <p><b>Condition Of UUC:</b> {equipmentData.condition}</p>

            {equipmentData.startedOn && equipmentData.startedOn !== "N/A" && (
              <p><b>Started On:</b> {equipmentData.startedOn}</p>
            )}
            {equipmentData.endedOn && equipmentData.endedOn !== "N/A" && (
              <p><b>Ended On:</b> {equipmentData.endedOn}</p>
            )}

            <p><b>Calibration Performed At:</b> {equipmentData.performedAt}</p>
            <p><b>Calibrated On:</b> {equipmentData.calibratedon}</p>

            <p><b>Suggested Due Date:</b> {equipmentData.suggestedDueDate}</p>
            <p><b>Reference Standard:</b> {equipmentData.referenceStd}</p>

            <p><b>Temperature (°C):</b> {equipmentData.temperature}</p>
            <p><b>Humidity (%RH):</b> {equipmentData.humidity}</p>
          </div>

          {/* Master Used For Calibration */}
          <h3 className="font-semibold mb-2 text-base">Master Standards Used For Calibration</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-left">Reference Standard</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Sr.No</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">ID No.</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Certificate No.</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Valid Upto</th>
                </tr>
              </thead>
              <tbody>
                {masterData.length > 0 ? (
                  masterData.map((master, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-3 py-2">{master.reference}</td>
                      <td className="border border-gray-300 px-3 py-2">{master.srNo}</td>
                      <td className="border border-gray-300 px-3 py-2">{master.idNo}</td>
                      <td className="border border-gray-300 px-3 py-2">{master.certificate}</td>
                      <td className="border border-gray-300 px-3 py-2">{master.validUpto}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 text-center text-gray-500" colSpan="5">
                      No master standard data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ENHANCED Dynamic Observation Results Table */}
          {observationTemplate && tableStructure && ((observationRows?.rows?.length || 0) > 0 || hasBiomedicalContent) && (
            <>
              <h3 className="font-semibold mb-2 text-base">Calibration Results - {selectedTableData?.name}</h3>
              {/* Thermal Coefficients Table matching PHP raw data observation tables */}
              {Object.keys(thermalCoeff).length > 0 && (
                <div className="overflow-x-auto mb-4">
                  {observationTemplate !== 'observationts' && (
                    <div className="font-semibold text-sm mb-1 text-gray-800">Dimension</div>
                  )}
                  <table className="w-full border border-gray-300 text-sm">
                    <tbody>
                      <tr className="bg-white">
                        <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700">
                          Thermal Co-eff of UUC
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-gray-900">
                          {thermalCoeff.uuc || ''}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700">
                          Thermal. Co-eff of MASTER
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-gray-900">
                          {thermalCoeff.master || ''}
                        </td>
                      </tr>
                      {thermalCoeff.thickness_of_graduation && (
                        <tr className="bg-white">
                          <td className="border border-gray-300 px-3 py-2 font-medium w-1/4 text-gray-700">
                            Thickness of Graduation
                          </td>
                          <td colSpan="3" className="border border-gray-300 px-3 py-2 w-3/4 text-gray-900">
                            {thermalCoeff.thickness_of_graduation}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {tableStructure?.isMatrix || observationTemplate === 'observationvc' || (observationRows?.matrixGroups && observationRows.matrixGroups.length > 0) ? (
                (observationRows?.matrixGroups && observationRows.matrixGroups.length > 0
                  ? observationRows.matrixGroups
                  : [{ title: '', rows: observationRows?.rows || [] }]
                ).map((mGroup, gIdx) => (
                  <div key={gIdx} className="mb-6">
                    {mGroup.title && (
                      <div className="font-semibold text-sm mb-2 text-gray-800">
                        {mGroup.title}
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-300 text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                              Sr. No.
                            </th>
                            <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                              Nominal/ Set Value
                            </th>
                            <th colSpan={5} className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700">
                              Observation on UUC
                            </th>
                            <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                              Average
                            </th>
                            <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">
                              Error
                            </th>
                          </tr>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600">Observation 1</th>
                            <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600">Observation 2</th>
                            <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600">Observation 3</th>
                            <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600">Observation 4</th>
                            <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600">Observation 5</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mGroup.rows.map((row, rIdx) => (
                            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="border border-gray-300 px-3 py-2">
                                  {cell !== null && cell !== undefined ? cell : ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              ) : observationTemplate === 'observationwb' || observationTemplate === 'observationwbn' ? (
                renderWeighingBalanceTables()
              ) : observationTemplate === 'observationtm' ? (
                renderObservationTMTable()
              ) : observationTemplate === 'observationuc' ? (
                renderObservationUCTables()
              ) : observationTemplate === 'observationbiomedical' ? (
                renderBiomedicalTables()
              ) : observationTemplate === 'observationts' ? (
                renderObservationTSTable()
              ) : observationTemplate === 'observationmm' && observationRows?.unitTypes && observationRows.unitTypes.length > 0 ? (
                observationRows.unitTypes.map((unitTypeGroup, groupIndex) => {
                  if (!unitTypeGroup || !unitTypeGroup.calibration_points) return null;

                  const unitTypeRows = unitTypeGroup.calibration_points.map(point => {
                    const observations = [];
                    if (point.observations && Array.isArray(point.observations)) {
                      for (let i = 0; i < 5; i++) {
                        observations.push(point.observations[i]?.value || '');
                      }
                    }
                    while (observations.length < 5) {
                      observations.push('');
                    }

                    return [
                      point.sequence_number?.toString() || '',
                      point.mode || 'Measure',
                      point.range || '',
                      (point.nominal_values?.calculated_master?.value || '') +
                      (point.nominal_values?.calculated_master?.unit ? ' ' + point.nominal_values.calculated_master.unit : ''),
                      (point.nominal_values?.master?.value || '') +
                      (point.nominal_values?.master?.unit ? ' ' + point.nominal_values.master.unit : ''),
                      ...observations,
                      point.calculations?.average || '',
                      point.calculations?.error || ''
                    ];
                  });

                  return (
                    <div key={groupIndex} className="mb-8">
                      <h4 className="text-lg font-medium text-gray-800 mb-3 bg-blue-50 p-2 rounded">
                        {unitTypeGroup.unit_type}
                      </h4>
                      <div className="overflow-x-auto border border-gray-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-100 border-b border-gray-300">
                              {tableStructure.headers.map((header, index) => (
                                <th
                                  key={index}
                                  colSpan={header.colspan}
                                  className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-300 last:border-r-0"
                                >
                                  {header.name}
                                </th>
                              ))}
                            </tr>
                            {tableStructure.subHeadersRow.some((item) => item !== null) && (
                              <tr className="bg-gray-50 border-b border-gray-300">
                                {tableStructure.subHeadersRow.map((subHeader, index) => (
                                  <th
                                    key={index}
                                    className="px-3 py-2 text-left text-xs font-medium text-gray-600 border-r border-gray-300 last:border-r-0"
                                  >
                                    {subHeader || ''}
                                  </th>
                                ))}
                              </tr>
                            )}
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {unitTypeRows.map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-gray-50">
                                {row.map((cell, colIndex) => (
                                  <td
                                    key={colIndex}
                                    className="px-3 py-2 whitespace-nowrap text-sm border-r border-gray-200 last:border-r-0"
                                  >
                                    {cell || ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Standard single table for other observation types (including IT, MT, MG, FG, HG, EXM, PPG, AVG, RTDWI, MSR, GTM, AND NOW DG)
                // ADDED: Special display handling for observationrtdwi, observationgtm, and now observationdg static text and dashes/calculated fields
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border border-gray-300 text-sm">
                    <thead>
                      {/* Main headers row */}
                      <tr className="bg-gray-100">
                        {tableStructure.headers.map((header, index) => (
                          <th
                            key={index}
                            colSpan={header.colspan}
                            className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider"
                          >
                            {header.name}
                          </th>
                        ))}
                      </tr>
                      {/* Sub headers row (if any) */}
                      {tableStructure.subHeadersRow.some((item) => item !== null) && (
                        <tr className="bg-gray-50">
                          {tableStructure.subHeadersRow.map((subHeader, index) => (
                            <th
                              key={index}
                              className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-600"
                            >
                              {subHeader || ''}
                            </th>
                          ))}
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {(observationRows?.rows || []).map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {row.map((cell, colIndex) => {
                            let rowSpanVal = undefined;
                            if (observationTemplate === 'observationdw') {
                              const isSpanCol = [0, 2, 3, 9].includes(colIndex);
                              if (isSpanCol) {
                                if (row[1] !== '1') {
                                  return null;
                                }
                                // Scan ahead to count cycles for this calibration point
                                let count = 1;
                                for (let i = rowIndex + 1; i < (observationRows?.rows?.length || 0); i++) {
                                  if (observationRows?.rows?.[i]?.[1] === '1') {
                                    break;
                                  }
                                  count++;
                                }
                                rowSpanVal = count;
                              }
                            }

                            // ADDED: Special handling for observationrtdwi and observationth static text and dashes
                            if ((observationTemplate === 'observationrtdwi' || observationTemplate === 'observationth') && (cell === '-' || cell === 'UUC' || cell === 'Master')) {
                              return (
                                <td key={colIndex} className="border border-gray-300 px-3 py-2 text-center font-medium">
                                  {cell}
                                </td>
                              );
                            }
                            // ADDED: Special handling for observationgtm static text and dashes
                            if (observationTemplate === 'observationgtm' && (cell === '-' || cell === 'UUC' || cell === 'Master')) {
                              return (
                                <td key={colIndex} className="border border-gray-300 px-3 py-2 text-center font-medium">
                                  {cell}
                                </td>
                              );
                            }
                            // NEW: ADDED Special handling for observationdg calculated/static fields (e.g., averages, errors, hysteresis are display-only, no special static text but ensure proper rendering)
                            if (observationTemplate === 'observationdg' && [6, 7, 8, 9, 10].includes(colIndex)) {
                              // These are calculated fields (Average Forward/Backward, Error Forward/Backward, Hysterisis) - just display as-is
                              return (
                                <td key={colIndex} className="border border-gray-300 px-3 py-2 font-medium text-center">
                                  {cell || ''}
                                </td>
                              );
                            }
                            // For UNIT_SELECT in Master row, display the unit label (assuming we have unitsList or fetch it)
                            // But since read-only and no unitsList here, just display the value
                            return (
                              <td key={colIndex} rowSpan={rowSpanVal} className="border border-gray-300 px-3 py-2 align-middle">
                                {cell || ''}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Parallelism Table for Observation VC matching rawdatavc.php */}
              {observationTemplate === 'observationvc' && (
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border border-gray-300 text-sm">
                    <tbody>
                      <tr className="bg-white">
                        <td className="border border-gray-300 px-3 py-2 font-medium w-1/4 text-gray-700">
                          Parallelism of external jaws (&micro;m)
                        </td>
                        <td className="border border-gray-300 px-3 py-2 w-1/4 text-gray-900">
                          {parallelism.parallinternal ? `${parallelism.parallinternal} µm` : ''}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 font-medium w-1/4 text-gray-700">
                          Parallelism Of Internal Jaws (&micro;m)
                        </td>
                        <td className="border border-gray-300 px-3 py-2 w-1/4 text-gray-900">
                          {parallelism.parallexternal ? `${parallelism.parallexternal} µm` : ''}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {/* Parallelism Table for Observation EXM */}
              {observationTemplate === 'observationexm' && thermalCoeff.parallinternal && (
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border border-gray-300 text-sm">
                    <tbody>
                      <tr className="bg-white">
                        <td className="border border-gray-300 px-3 py-2 font-medium w-1/4 text-gray-700">
                          Parallelism Of Spindle &amp; Anvil (&micro;m)
                        </td>
                        <td className="border border-gray-300 px-3 py-2 w-3/4 text-gray-900">
                          {thermalCoeff.parallinternal} µm
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* FIXED: Dynamic Observation Results Table */}
          {observationData.length > 0 && maxObservations > 0 && (
            <>
              <h3 className="font-semibold mb-2 text-base">Detailed Calibration Observations</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-left">SR. NO.</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">NOMINAL VALUE</th>
                      {/* Dynamic observation headers based on max observations */}
                      {Array.from({ length: maxObservations }, (_, i) => (
                        <th key={i} className="border border-gray-300 px-3 py-2 text-left">
                          Observation {i + 1}
                        </th>
                      ))}
                      <th className="border border-gray-300 px-3 py-2 text-left">AVERAGE</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">ERROR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observationData.map((observation, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-3 py-2">{observation.srNo}</td>
                        <td className="border border-gray-300 px-3 py-2">{observation.nominalValue}</td>
                        {/* Dynamic observation columns */}
                        {Array.from({ length: maxObservations }, (_, i) => (
                          <td key={i} className="border border-gray-300 px-3 py-2">
                            {observation.observations && observation.observations[i] ? observation.observations[i] : ''}
                          </td>
                        ))}
                        <td className="border border-gray-300 px-3 py-2 font-medium">{observation.average}</td>
                        <td className="border border-gray-300 px-3 py-2 font-medium">{observation.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Original Calibration Result Table (fallback when no observation data) */}
          {observationData.length === 0 && (observationRows?.rows?.length || 0) === 0 && (
            <>
              <h3 className="font-semibold mb-2 text-base">Calibration Results</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-left">Sr. No.</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Nominal Value</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Conventional Mass</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length > 0 ? (
                      results.map((result, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-3 py-2">{result.sr}</td>
                          <td className="border border-gray-300 px-3 py-2">{result.nominal}</td>
                          <td className="border border-gray-300 px-3 py-2">{result.mass}</td>
                          <td className="border border-gray-300 px-3 py-2">{result.error}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 text-center text-gray-500" colSpan="4">
                          No calibration results available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Temperature End & Humidity End right below Calibration Results / Observation Table (matching PHP rawdata.php) */}
          {(equipmentData.tempend !== "N/A" || equipmentData.humiend !== "N/A" || equipmentData.pressurestart !== "N/A" || equipmentData.pressureend !== "N/A" || equipmentData.stabilizationtime !== "N/A" || observationTemplate === 'observationdw' || observationType === 'observationdw') && (
            <div className="grid grid-cols-2 gap-y-1 gap-x-8 my-4 p-3 bg-gray-50 rounded border border-gray-200 text-sm">
              {equipmentData.tempend && equipmentData.tempend !== "N/A" && (
                <p><b>Temperature End (&deg;C):</b> {equipmentData.tempend}</p>
              )}
              {equipmentData.humiend && equipmentData.humiend !== "N/A" && (
                <p><b>Humidity End (%RH):</b> {equipmentData.humiend}</p>
              )}
              {(observationTemplate === 'observationdw' || observationType === 'observationdw') && (
                <>
                  <p><b>Pressure Start:</b> {equipmentData.pressurestart || "N/A"} hpa</p>
                  <p><b>Pressure End:</b> {equipmentData.pressureend || "N/A"} hpa</p>
                  <p><b>Thermal Stabilization:</b> {equipmentData.stabilizationtime || "N/A"} hour</p>
                </>
              )}
            </div>
          )}

          {/* Footer - Electronic Signatures (Matching PHP 50/50 centered layout) */}
          <div className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t text-xs">
            <div className="text-center flex flex-col items-center justify-center">
              <p className="font-bold text-sm mb-2">Calibrated by</p>
              {calibratedByImageUrl ? (
                <img
                  src={calibratedByImageUrl}
                  alt="Calibrated By Signature"
                  className="h-11 max-h-11 w-auto object-contain mb-1"
                  onError={(e) => {
                    console.error('❌ Failed to load calibrated_by image:', calibratedByImageUrl);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-11 flex items-center justify-center text-gray-400 italic">
                  (Signature)
                </div>
              )}
              {calibratedByTextImage && (
                <img
                  src={calibratedByTextImage}
                  alt="Calibrated By Details"
                  className="h-14 w-auto object-contain mt-1"
                  onError={(e) => {
                    console.error('❌ Failed to load calibrated_by_text_image:', calibratedByTextImage);
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>

            <div className="text-center flex flex-col items-center justify-center">
              <p className="font-bold text-sm mb-2">Authorised By</p>
              {approvedByImageUrl ? (
                <img
                  src={approvedByImageUrl}
                  alt="Authorized By Signature"
                  className="h-11 max-h-11 w-auto object-contain mb-1"
                  onError={(e) => {
                    console.error('❌ Failed to load approvedby image:', approvedByImageUrl);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-11 flex items-center justify-center text-gray-400 italic">
                  (Signature)
                </div>
              )}
              {approvedByTextImage && (
                <img
                  src={approvedByTextImage}
                  alt="Authorized By Details"
                  className="h-14 w-auto object-contain mt-1"
                  onError={(e) => {
                    console.error('❌ Failed to load approved_by_text_image:', approvedByTextImage);
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>



        </div>

        <hr className="my-4 border-t" />

        {/* Action Buttons - Hidden on print */}
        <div className="mt-6 flex gap-3 no-print">
          <Link
            to={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-500 hover:bg-fuchsia-500 text-white px-6 py-2 rounded inline-flex items-center justify-center font-medium transition-colors cursor-pointer"
            onClick={handlePrint}
          >
            Print Report
          </Link>
        </div>
      </div>
    </>
  );
}
