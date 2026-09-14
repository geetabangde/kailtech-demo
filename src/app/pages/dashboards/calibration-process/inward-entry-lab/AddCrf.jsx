import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Page } from 'components/shared/Page';
import { Button } from 'components/ui';
import axios from 'utils/axios';
import { toast } from 'sonner';
import ReactSelect from "react-select";

const AddCrf = () => {
  const [loading, setLoading] = useState(false);
  const [instrument, setInstrument] = useState(null);
  const [calibrationMethods, setCalibrationMethods] = useState([]);
  const [calibrationStandards, setCalibrationStandards] = useState([]);
  const [units, setUnits] = useState([]);
  const [unitTypes, setUnitTypes] = useState([]);
  const [masterData, setMasterData] = useState(null);
  const [getMaster, setGetMaster] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [errors, setErrors] = useState({}); // New state for form errors
  const navigate = useNavigate();
  const { id: inwardId, itemId: instId } = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const caliblocation = searchParams.get('caliblocation') || 'Lab';
  const calibacc = searchParams.get('calibacc') || 'Nabl';

  const [formData, setFormData] = useState({
    name: '',
    equipmentrange: '',
    leastcount: '',
    make: '',
    model: '',
    serialno: '',
    idno: '',
    accuracy: '',
    location: '',
    calibrationvalidity: '',
    sop: '',
    standard: [],
    letterref: '',
    accessories: '',
    conformitystatement: 'No',
    instlocation: '',
    remark: '',
    adjustment: 'No',
    adjustmentremark: '',
    modeofdispatch: '',
  });

  const [matrixEntries, setMatrixEntries] = useState([]);
  const [matrixDetails, setMatrixDetails] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!inwardId || !instId || !caliblocation || !calibacc) return;

      setLoading(true);
      try {
        const [instrumentRes, methodsRes, standardsRes, unitsRes, unitTypesRes, getMasterRes] = await Promise.all([
          axios.get(`/calibrationprocess/get-crf-matrix-data?caliblocation=${encodeURIComponent(caliblocation)}&calibacc=${encodeURIComponent(calibacc)}&inward_id=${inwardId}&inst_id=${instId}`),
          axios.get('/calibrationoperations/calibration-method-list'),
          axios.get('/calibrationoperations/calibration-standard-list'),
          axios.get('/master/units-list'),
          axios.get('/master/unit-type-list'),
          axios.get('/calibrationprocess/get-master-detail-bytype'),
        ]);

        if (instrumentRes.data.instrument && instrumentRes.data.matrix_data) {
          setInstrument(instrumentRes.data.instrument);
          console.log("data", instrumentRes);
          setMatrixEntries(instrumentRes.data.matrix_data.map(item => ({
            unitType: item.unittype,
            unit: item.unit_id,
            unitText: item.unit_text,
            range: item.range,
            mode: item.mode,
            pricematrixId: item.pricematrix_id,
            matrixId: item.matrix_id,
          })));
        } else {
          setInstrument(null);
          setMatrixEntries([]);
        }

        setCalibrationMethods(methodsRes.data.data || []);
        setCalibrationStandards(standardsRes.data.data || []);
        setUnits(unitsRes.data.data || []);
        setUnitTypes(unitTypesRes.data.data || []);
        setGetMaster(getMasterRes.data.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [inwardId, instId, caliblocation, calibacc]);

  useEffect(() => {
    const fetchMasterData = async () => {
      if (!selectedTypeId) return;

      setLoading(true);
      try {
        const response = await axios.get(`/calibrationprocess/get-master-scope-matrix?type_id=${selectedTypeId}`);
        if (response.data.status === 'true' && response.data.data.length > 0) {
          setMasterData(response.data.data[0]);
        } else {
          setMasterData(null);
          toast.error('No master data found for the selected type.');
        }
      } catch (err) {
        console.error('Error fetching master data:', err);
        toast.error('Failed to load master data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, [selectedTypeId]);

  useEffect(() => {
    if (instrument) {
      setFormData({
        name: instrument.name || '',
        equipmentrange: instrument.equipmentrange || '',
        leastcount: instrument.leastcount || '',
        make: instrument.make || '',
        model: instrument.model || '',
        serialno: instrument.serialno || '',
        idno: instrument.idno || '',
        accuracy: instrument.accuracy || '',
        location: instrument.location || 'Lab',
        calibrationvalidity: instrument.calibrationvalidity || '',
        sop: instrument.sop ? String(instrument.sop) : '',
        standard: instrument.standard ? (typeof instrument.standard === 'string' ? instrument.standard.split(',').map(Number) : [Number(instrument.standard)]) : [],
        letterref: instrument.letterref || '',
        accessories: instrument.accessories || '',
        conformitystatement: instrument.conformitystatement || 'No',
        instlocation: instrument.instlocation || instrument.location || 'Lab',
        remark: instrument.remark || '',
        adjustment: instrument.adjustment || 'No',
        adjustmentremark: instrument.adjustmentremark || '',
        modeofdispatch: instrument.modeofdispatch || '', // Initialize modeofdispatch
      });
    }
  }, [instrument]);

  const handleChange = (e, matrixIndex, pointIndex) => {
    if (matrixIndex !== undefined && pointIndex !== undefined) {
      const newDetails = [...matrixDetails];
      newDetails[matrixIndex].calibPoints[pointIndex] = e.target.value;
      setMatrixDetails(newDetails);
    } else if (e && e.target) {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'standard' ? Array.from(e.target.selectedOptions, option => Number(option.value)) : value,
      }));
      // Clear error for the field when user starts typing
      setErrors((prev) => ({ ...prev, [name]: '' }));
    } else if (e && e.value) {
      // Handle ReactSelect changes
      const { name, value } = e;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleTypeChange = (e) => {
    setSelectedTypeId(e.target.value);
    setErrors((prev) => ({ ...prev, typeofinstrument: '' }));
  };

  const handleBackToPerformCalibration = () => {
    navigate(`/dashboards/calibration-process/inward-entry-lab/perform-calibration/${inwardId}?caliblocation=${caliblocation}&calibacc=${calibacc}`);
  };

  const addMatrixDetail = (entryIndex) => {
    const isIndexValid = typeof entryIndex === 'number';
    const entry = isIndexValid ? matrixEntries[entryIndex] : undefined;

    const defaultUnitType = matrixDetails.length > 0 ? matrixDetails[0].unitType : "";
    const defaultUnit = matrixDetails.length > 0 ? matrixDetails[0].unit : "";
    const defaultUnitText = matrixDetails.length > 0 ? matrixDetails[0].unitText : "";

    // Agar entry nahi mili to empty defaults use karo
    const min = entry ? entry.range.split(" to ")[0] : "";
    const max = entry ? entry.range.split(" to ")[1] : "";

    setMatrixDetails([
      ...matrixDetails,
      {
        matrixType: "",
        unitType: entry?.unitType || defaultUnitType,
        unit: entry?.unit || defaultUnit,
        unitText: entry?.unitText || defaultUnitText,
        instrumentRangeMin: min,
        instrumentRangeMax: max,
        operatingRangeMin: "",
        operatingRangeMax: "",
        leastCount: "",
        mode: entry?.mode || "",
        matrixId: entry?.matrixId || null,
        pricematrixid: entry?.pricematrixId || null,
        calibPoints: [],
      },
    ]);
  };

  const deleteMatrixDetail = (index) => {
    setMatrixDetails(matrixDetails.filter((_, i) => i !== index));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`unitType[${index}]`];
      delete newErrors[`unit[${index}]`];
      delete newErrors[`instrumentRangeMin[${index}]`];
      delete newErrors[`instrumentRangeMax[${index}]`];
      delete newErrors[`operatingRangeMin[${index}]`];
      delete newErrors[`operatingRangeMax[${index}]`];
      delete newErrors[`leastCount[${index}]`];
      return newErrors;
    });
  };

  const addCalibPoint = (matrixIndex) => {
    const newDetails = [...matrixDetails];
    newDetails[matrixIndex].calibPoints = [...(newDetails[matrixIndex].calibPoints || []), ''];
    setMatrixDetails(newDetails);
  };

  const removeCalibPoint = (matrixIndex, pointIndex) => {
    const newDetails = [...matrixDetails];
    newDetails[matrixIndex].calibPoints = newDetails[matrixIndex].calibPoints.filter((_, i) => i !== pointIndex);
    setMatrixDetails(newDetails);
  };

  const handleMatrixDetailChange = (index, field, value) => {
    const newDetails = [...matrixDetails];
    newDetails[index][field] = value;
    if (field === 'unit') {
      const selectedUnit = units.find(unit => unit.id === value);
      newDetails[index].unitText = selectedUnit ? selectedUnit.description : '';
    }
    setMatrixDetails(newDetails);
    // Clear error for the matrix field
    setErrors((prev) => ({ ...prev, [`${field}[${index}]`]: '' }));
  };

  // Form validation function
  const validateForm = () => {
    const newErrors = {};

    // Validate main form fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    // if (!formData.equipmentrange) newErrors.equipmentrange = 'Range is required';
    if (!formData.make.trim()) newErrors.make = 'Make is required';

    if (!formData.serialno.trim()) newErrors.serialno = 'Serial No. is required';

    if (!formData.accuracy.trim()) newErrors.accuracy = 'Accuracy is required';
    if (!formData.calibrationvalidity.trim()) newErrors.calibrationvalidity = 'Calibration Validity is required';
    if (!formData.idno.trim()) newErrors.idno = 'ID No. is required';
    if (!formData.adjustment) newErrors.adjustment = 'Adjustment is required';
    // if (!formData.modeofdispatch) newErrors.modeofdispatch = 'Mode of Dispatch is required';
    if (!formData.sop) newErrors.sop = 'Calibration Method is required';
    if (formData.standard.length === 0) newErrors.standard = 'At least one Calibration Standard is required';

    // Validate matrix details
    matrixDetails.forEach((detail, index) => {
      if (!detail.unitType) newErrors[`unitType[${index}]`] = 'Unit Type is required';
      if (!detail.unit) newErrors[`unit[${index}]`] = 'Unit is required';
      // if (!detail.instrumentRangeMin) newErrors[`instrumentRangeMin[${index}]`] = 'Instrument Range Min is required';
      // if (!detail.instrumentRangeMax) newErrors[`instrumentRangeMax[${index}]`] = 'Instrument Range Max is required';
      // if (!detail.operatingRangeMin) newErrors[`operatingRangeMin[${index}]`] = 'Operating Range Min is required';
      // if (!detail.operatingRangeMax) newErrors[`operatingRangeMax[${index}]`] = 'Operating Range Max is required';
      // if (!detail.operatingRangeMax) newErrors[`operatingRangeMax[${index}]`] = 'Operating Range Max is required';
      if (!detail.leastCount) newErrors[`leastCount[${index}]`] = 'Least Count is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const calibPointsObj = {};
      matrixDetails.forEach((detail, index) => {
        calibPointsObj[`calibpoint${index + 1}`] = detail.calibPoints || [];
      });

      const submitData = {
        inwardid: Number(inwardId),
        instid: Number(instId),
        id: Number(instrument?.instid),
        caliblocation,
        calibacc,
        pricematrixid: Number(instrument?.price_matrix?.pricematrixid || matrixDetails[0]?.pricematrixid || 99),
        name: formData.name,
        equipmentrange: formData.equipmentrange,
        itemleastcount: formData.leastcount,
        matrixtype: matrixDetails.map(d => d.matrixType || 'General'),
        make: formData.make,
        model: formData.model,
        serialno: formData.serialno,
        idno: formData.idno || "NA",
        accuracy: formData.accuracy,
        location: formData.location,
        calibrationvalidity: formData.calibrationvalidity,
        sop: formData.sop,
        letterref: formData.letterref,
        accessories: formData.accessories,
        conformitystatement: formData.conformitystatement,
        instlocation: formData.instlocation,
        remark: formData.remark,
        standard: formData.standard.map(Number),
        adjustment: formData.adjustment,
        adjustmentremark: formData.adjustmentremark,
        conditiononrecieve: "Good",
        matrixno: matrixDetails.map((_, i) => (i + 1).toString()),
        //matrixtype: matrixDetails.map(d => d.matrixType || ''),
        unittype: matrixDetails.map(d => d.unitType || ''),
        unit: matrixDetails.map(d => Number(d.unit) || 0),
        defaultrangemin: matrixDetails.map(d => d.instrumentRangeMin || ''),
        defaultrangemax: matrixDetails.map(d => d.instrumentRangeMax || ''),
        instrangemin: matrixDetails.map(d => d.instrumentRangeMin || ''),
        instrangemax: matrixDetails.map(d => d.instrumentRangeMax || ''),
        operangemin: matrixDetails.map(d => d.operatingRangeMin || 'General'),
        operangemax: matrixDetails.map(d => d.operatingRangeMax || 'General'),
        leastcount: matrixDetails.map(d => d.leastCount || 'General'),
        mode: matrixDetails.map(d => d.mode || 'General'),
        matrixid: matrixDetails.map((_, i) => (i + 1).toString()),
        modeofdispatch: formData.modeofdispatch,
        ...calibPointsObj,
      };
      console.log(submitData);

      await axios.post("/calibrationprocess/add-crf", submitData, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      toast.success("CRF saved successfully!");
      handleBackToPerformCalibration();
    } catch (err) {
      console.error("Error saving CRF:", err);
      toast.error("Failed to save CRF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-4 mt-2">
      <Page title="Add CRF">
        <div className="bg-white">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-lg font-medium text-gray-800">Crf Price Matrix </h1>
            <Button
              variant="outline"
              className="text-white bg-blue-600 hover:bg-blue-700"
              onClick={handleBackToPerformCalibration}
            >
              Back to Inward Entry List
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Name</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Range To Show</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="equipmentrange"
                      value={formData.equipmentrange}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                    />
                    {errors.equipmentrange && (
                      <p className="mt-1 text-sm text-red-500">{errors.equipmentrange}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Least Count To Show</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="leastcount"
                      value={formData.leastcount}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Make</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                    />
                    {errors.make && (
                      <p className="mt-1 text-sm text-red-500">{errors.make}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Serial No.</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="serialno"
                      value={formData.serialno}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                    />
                    {errors.serialno && (
                      <p className="mt-1 text-sm text-red-500">{errors.serialno}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Accuracy</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="accuracy"
                      value={formData.accuracy}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                    />
                    {errors.accuracy && (
                      <p className="mt-1 text-sm text-red-500">{errors.accuracy}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Calibration Validity</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="calibrationvalidity"
                      value={formData.calibrationvalidity}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                    />
                    {errors.calibrationvalidity && (
                      <p className="mt-1 text-sm text-red-500">{errors.calibrationvalidity}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Calibration Standard</label>
                  <div className="col-span-2">
                    <ReactSelect
                      isMulti
                      name="standard"
                      options={calibrationStandards.map((standard) => ({
                        value: standard.id,
                        label: standard.name,
                      }))}
                      value={calibrationStandards
                        .map((standard) => ({
                          value: standard.id,
                          label: standard.name,
                        }))
                        .filter((opt) => formData.standard.includes(opt.value))}
                      onChange={(selected) =>
                        handleChange({ target: { name: 'standard', value: selected ? selected.map(opt => opt.value) : [] } })
                      }
                      placeholder="Select Calibration Standards"
                      isDisabled={loading}
                    />
                    {errors.standard && (
                      <p className="mt-1 text-sm text-red-500">{errors.standard}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Accessories</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="accessories"
                      value={formData.accessories}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Instrument Location</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="instlocation"
                      value={formData.instlocation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                    />
                    {errors.instlocation && (
                      <p className="mt-1 text-sm text-red-500">{errors.instlocation}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Calibration Instrument Category</label>
                  <div className="col-span-2">
                    <select
                      name="instid"
                      value={instrument?.instid || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled
                    >
                      <option value={instrument?.instid}>{instrument?.name || 'N/A'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Model</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                    />
                    {errors.model && (
                      <p className="mt-1 text-sm text-red-500">{errors.model}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">ID No.</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="idno"
                      value={formData.idno}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                    />
                    {errors.idno && (
                      <p className="mt-1 text-sm text-red-500">{errors.idno}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Calibration Performed At</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Calibration Method</label>
                  <div className="col-span-2">
                    <ReactSelect
                      name="sop"
                      options={calibrationMethods.map(method => ({
                        value: method.id,
                        label: method.name,
                      }))}
                      value={
                        calibrationMethods
                          .map(method => ({ value: method.id, label: method.name }))
                          .find(opt => opt.value === Number(formData.sop)) || null
                      }
                      onChange={(selected) =>
                        handleChange({
                          target: { name: "sop", value: selected ? String(selected.value) : "" },
                        })
                      }
                      isDisabled={loading}
                      placeholder="Select Method"
                    />
                    {errors.sop && (
                      <p className="mt-1 text-sm text-red-500">{errors.sop}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Letter Ref/Date</label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="letterref"
                      value={formData.letterref}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Conformity Statement</label>
                  <div className="col-span-2">
                    <select
                      name="conformitystatement"
                      value={formData.conformitystatement}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Remark</label>
                  <div className="col-span-2">
                    <textarea
                      name="remark"
                      value={formData.remark}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Mode of Dispatch</label>
                  <div className="col-span-2">
                    <select
                      name="modeofdispatch"
                      value={formData.modeofdispatch}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled={loading}
                    >
                      <option value="">Select Mode</option>
                      <option value="Courier">Courier</option>
                      <option value="In-Person">In-Person</option>
                      <option value="Mail">Mail</option>
                    </select>
                    {errors.modeofdispatch && (
                      <p className="mt-1 text-sm text-red-500">{errors.modeofdispatch}</p>
                    )}
                  </div>
                </div> */}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-8">
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700">Adjustment</label>
                <div className="col-span-2">
                  <select
                    name="adjustment"
                    value={formData.adjustment}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    disabled={loading}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                  {errors.adjustment && (
                    <p className="mt-1 text-sm text-red-500">{errors.adjustment}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-start gap-4">
                <label className="text-sm text-gray-700">Adjustment Detail (If Any Adjustment Done)</label>
                <div className="col-span-2">
                  <textarea
                    name="adjustmentremark"
                    value={formData.adjustmentremark}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-300 my-8"></div>

            <div className="mt-8">
              <div className="border border-gray-300 rounded">
                <table className="w-full text-sm">
                  <thead className="bg-yellow-100">
                    <tr>
                      <th className="px-4 py-2 text-left border-r border-gray-300 font-medium">Unit Type</th>
                      <th className="px-4 py-2 text-left border-r border-gray-300 font-medium">Unit</th>
                      <th className="px-4 py-2 text-left border-r border-gray-300 font-medium">Range</th>
                      <th className="px-4 py-2 text-left border-r border-gray-300 font-medium">Mode</th>
                      <th className="px-4 py-2 text-left font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrixEntries.map((entry, index) => (
                      <tr key={index} className="border-t border-gray-300">
                        <td className="px-4 py-2 border-r border-gray-300">{entry.unitType}</td>
                        <td className="px-4 py-2 border-r border-gray-300">{entry.unitText}</td>
                        <td className="px-4 py-2 border-r border-gray-300">{entry.range}</td>
                        <td className="px-4 py-2 border-r border-gray-300">{entry.mode}</td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => addMatrixDetail(index)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs"
                            disabled={loading}
                          >
                            Add Matrix
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 space-y-6">
                {matrixDetails.map((detail, index) => (
                  <div key={index} className="border border-gray-300 rounded p-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <label className="text-sm text-gray-700">Matrix Type (Optional)</label>
                          <div className="col-span-2">
                            <input
                              type="text"
                              name={`matrixtype[${index}]`}
                              value={detail.matrixType}
                              onChange={(e) => handleMatrixDetailChange(index, 'matrixType', e.target.value)}
                              placeholder="e.g., Voltage, Current"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-4">
                          <label className="text-sm text-gray-700">Instrument Range Min</label>
                          <div className="col-span-2">
                            <input
                              type="number"
                              name={`instrangemin[${index}]`}
                              value={detail.instrumentRangeMin}
                              onChange={(e) => handleMatrixDetailChange(index, 'instrumentRangeMin', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              disabled={loading}
                            />
                            <input
                              type="hidden"
                              name={`defaultrangemin[${index}]`}
                              value={detail.instrumentRangeMin}
                            />
                            {errors[`instrumentRangeMin[${index}]`] && (
                              <p className="mt-1 text-sm text-red-500">{errors[`instrumentRangeMin[${index}]`]}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-4">
                          <label className="text-sm text-gray-700">Operating Range Min</label>
                          <div className="col-span-2">
                            <input
                              type="number"
                              name={`operangemin[${index}]`}
                              value={detail.operatingRangeMin}
                              onChange={(e) => handleMatrixDetailChange(index, 'operatingRangeMin', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              disabled={loading}
                            />
                            {errors[`operatingRangeMin[${index}]`] && (
                              <p className="mt-1 text-sm text-red-500">{errors[`operatingRangeMin[${index}]`]}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-4">
                          <label className="text-sm text-gray-700">Least Count</label>
                          <div className="col-span-2">
                            <input
                              type="text"
                              name={`leastcount[${index}]`}
                              value={detail.leastCount}
                              onChange={(e) => handleMatrixDetailChange(index, 'leastCount', e.target.value)}
                              placeholder="Least Count"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              disabled={loading}
                            />
                            {errors[`leastCount[${index}]`] && (
                              <p className="mt-1 text-sm text-red-500">{errors[`leastCount[${index}]`]}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <label className="text-sm text-gray-700">Unit Type/Parameter</label>
                          <div className="col-span-2">
                            <ReactSelect
                              name={`unittype[${index}]`}
                              options={unitTypes.map(type => ({ value: type.name, label: type.name }))}
                              value={
                                unitTypes
                                  .map(type => ({ value: type.name, label: type.name }))
                                  .find(opt => String(opt.value) === String(detail.unitType)) || null
                              }
                              onChange={(selected) => handleMatrixDetailChange(index, 'unitType', selected ? selected.value : '')}
                              isDisabled={loading}
                              placeholder="Select Unit Type"
                            />
                            {errors[`unitType[${index}]`] && (
                              <p className="mt-1 text-sm text-red-500">{errors[`unitType[${index}]`]}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-4">
                          <label className="text-sm text-gray-700">Unit</label>
                          <div className="col-span-2">
                            <ReactSelect
                              name={`unit[${index}]`}
                              options={units.map(unit => ({ value: unit.id, label: unit.description }))}
                              value={
                                units
                                  .map(unit => ({ value: unit.id, label: unit.description }))
                                  .find(opt => String(opt.value) === String(detail.unit)) || null
                              }
                              onChange={(selected) => handleMatrixDetailChange(index, 'unit', selected ? selected.value : '')}
                              isDisabled={loading}
                              placeholder="Select Unit"
                            />
                            {errors[`unit[${index}]`] && (
                              <p className="mt-1 text-sm text-red-500">{errors[`unit[${index}]`]}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-4">
                          <label className="text-sm text-gray-700">Instrument Range Max</label>
                          <div className="col-span-2">
                            <input
                              type="number"
                              name={`instrangemax[${index}]`}
                              value={detail.instrumentRangeMax}
                              onChange={(e) => handleMatrixDetailChange(index, 'instrumentRangeMax', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              disabled={loading}
                            />
                            <input
                              type="hidden"
                              name={`defaultrangemax[${index}]`}
                              value={detail.instrumentRangeMax}
                            />
                            {errors[`instrumentRangeMax[${index}]`] && (
                              <p className="mt-1 text-sm text-red-500">{errors[`instrumentRangeMax[${index}]`]}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-4">
                          <label className="text-sm text-gray-700">Operating Range Max</label>
                          <div className="col-span-2">
                            <input
                              type="number"
                              name={`operangemax[${index}]`}
                              value={detail.operatingRangeMax}
                              onChange={(e) => handleMatrixDetailChange(index, 'operatingRangeMax', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              disabled={loading}
                            />
                            {errors[`operatingRangeMax[${index}]`] && (
                              <p className="mt-1 text-sm text-red-500">{errors[`operatingRangeMax[${index}]`]}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-4">
                          <label className="text-sm text-gray-700">Mode</label>
                          <div className="col-span-2">
                            <input
                              type="text"
                              name={`mode[${index}]`}
                              value={detail.mode}
                              onChange={(e) => handleMatrixDetailChange(index, 'mode', e.target.value)}
                              placeholder="Mode"
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="col-span-2">
                        <button
                          type="button"
                          onClick={() => addCalibPoint(index)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          disabled={loading}
                        >
                          + Add Calibration Point
                        </button>

                        <div className="mt-2 space-y-2">
                          {(detail.calibPoints || []).map((value, pointIndex) => {
                            const isInvalid = Boolean(
                              value &&
                              !isNaN(Number(value)) &&
                              Number(detail.instrumentRangeMax) &&
                              Number(value) > Number(detail.instrumentRangeMax)
                            );

                            return (
                              <div key={pointIndex} className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={value || ""}
                                    name={`calibpoint[${index}][${pointIndex}]`}
                                    onChange={(e) => handleChange(e, index, pointIndex)}
                                    className={`w-full px-3 py-2 border ${isInvalid ? "border-red-500" : "border-gray-300"
                                      } rounded text-sm`}
                                    placeholder={`Calibration Point ${pointIndex + 1}`}
                                    disabled={loading}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeCalibPoint(index, pointIndex)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                    disabled={loading}
                                  >
                                    Remove
                                  </button>
                                </div>
                                {isInvalid && (
                                  <p className="text-sm text-red-500">
                                    Calibration point cannot be greater than Instrument Range Max ({detail.instrumentRangeMax})
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => deleteMatrixDetail(matrixDetails.length - 1)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded text-sm"
                    disabled={loading || matrixDetails.length === 0}
                  >
                    Delete Matrix
                  </button>
                  <button
                    type="button"
                    onClick={addMatrixDetail}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm"
                    disabled={loading}
                  >
                    Add Matrix
                  </button>
                </div>
              </div>

              <div className="mt-6 mb-6">
                <div className="flex items-center">
                  <button className="text-gray-400 hover:text-gray-600" disabled={loading}>
                    ‹
                  </button>
                  <div className="flex-1 mx-4 bg-gray-300 h-2 rounded">
                    <div className="bg-gray-600 h-2 rounded" style={{ width: '100%' }}></div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600" disabled={loading}>
                    ›
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">Get Master Detail by Type</span>
                  <select
                    name="typeofinstrument"
                    value={selectedTypeId}
                    onChange={handleTypeChange}
                    className="px-3 py-2 border border-gray-300 rounded text-sm flex-1"
                    disabled={loading}
                  >
                    <option value="">Select</option>
                    {getMaster.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.typeofinstrument && (
                    <p className="mt-1 text-sm text-red-500">{errors.typeofinstrument}</p>
                  )}
                </div>

                {masterData && (
                  <>
                    <div className="mt-4">
                      <h3 className="text-center text-sm font-medium mb-4">Master Scope Matrix</h3>
                      <div className="border border-gray-300 rounded">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left border-r border-gray-300">S No</th>
                              <th className="px-4 py-2 text-left border-r border-gray-300">Unit Type</th>
                              <th className="px-4 py-2 text-left border-r border-gray-300">Mode</th>
                              <th className="px-4 py-2 text-left border-r border-gray-300">Unit</th>
                              <th className="px-4 py-2 text-left border-r border-gray-300">Point</th>
                              <th className="px-4 py-2 text-left border-r border-gray-300">CMC</th>
                              <th className="px-4 py-2 text-left">Drift</th>
                            </tr>
                          </thead>
                          <tbody>
                            {masterData.scope_matrix.map((entry, index) => (
                              <tr key={index} className="border-t border-gray-300">
                                <td className="px-4 py-2 border-r border-gray-300">{entry.s_no}</td>
                                <td className="px-4 py-2 border-r border-gray-300">{entry.unittype}</td>
                                <td className="px-4 py-2 border-r border-gray-300">{entry.mode}</td>
                                <td className="px-4 py-2 border-r border-gray-300">{entry.unit}</td>
                                <td className="px-4 py-2 border-r border-gray-300">{entry.point}</td>
                                <td className="px-4 py-2 border-r border-gray-300">{entry.cmc}</td>
                                <td className="px-4 py-2">{entry.drift}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-center text-sm font-medium mb-4">Master Matrix</h3>
                      <div className="border border-gray-300 rounded overflow-x-auto">
                        <table className="w-full text-sm min-w-max">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left border-r border-gray-300 whitespace-nowrap">S No</th>
                              <th className="px-3 py-2 text-left border-r border-gray-300 whitespace-nowrap">Unit Type</th>
                              <th className="px-3 py-2 text-left border-r border-gray-300 whitespace-nowrap">Mode</th>
                              <th className="px-3 py-2 text-left border-r border-gray-300 whitespace-nowrap">Unit</th>
                              <th className="px-3 py-2 text-left border-r border-gray-300 whitespace-nowrap">Instrument Range</th>
                              <th className="px-3 py-2 text-left border-r border-gray-300 whitespace-nowrap">Calibrated Range</th>
                              <th className="px-3 py-2 text-left border-r border-gray-300 whitespace-nowrap">Least Count</th>
                              <th className="px-3 py-2 text-left border-r border-gray-300 whitespace-nowrap">Stability</th>
                              <th className="px-3 py-2 text-left border-r border-gray-300 whitespace-nowrap">Uniformity</th>
                              <th className="px-3 py-2 text-left border-r border-gray-300 whitespace-nowrap">Accuracy</th>
                              <th className="px-3 py-2 text-left whitespace-nowrap">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {masterData.master_matrix.map((entry, index) => (
                              <tr key={index} className="border-t border-gray-300">
                                <td className="px-3 py-2 border-r border-gray-300">{index + 1}</td>
                                <td className="px-3 py-2 border-r border-gray-300">{entry.unittype}</td>
                                <td className="px-3 py-2 border-r border-gray-300">{entry.mode}</td>
                                <td className="px-3 py-2 border-r border-gray-300">{entry.unit}</td>
                                <td className="px-3 py-2 border-r border-gray-300">{`${entry.instrangemin} - ${entry.instrangemax}`}</td>
                                <td className="px-3 py-2 border-r border-gray-300">{`${entry.calibratedrangemin} - ${entry.calibratedrangemax}`}</td>
                                <td className="px-3 py-2 border-r border-gray-300">{entry.leastcount}</td>
                                <td className="px-3 py-2 border-r border-gray-300">{entry.stability}</td>
                                <td className="px-3 py-2 border-r border-gray-300">{entry.uniformity}</td>
                                <td className="px-3 py-2 border-r border-gray-300">{entry.accuracyrange}</td>
                                <td className="px-3 py-2">-</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <input type="hidden" name="calibacc" value={calibacc} />
              <input type="hidden" name="caliblocation" value={caliblocation} />
              <input type="hidden" name="id" value={instId} />
              <input type="hidden" name="inwardid" value={inwardId} />
            </div>

            <div className="flex justify-end mt-8">
              <Button type="submit" color="primary" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"
                      ></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  "Save CRF"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Page>
    </div>
  );
};

export default AddCrf;