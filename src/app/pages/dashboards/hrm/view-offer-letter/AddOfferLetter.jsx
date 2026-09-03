import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Button, Card, Input } from "components/ui";
import Select from "react-select";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";
import { getStoredPermissions } from "app/navigation/dashboards";
import { ArrowLeftIcon, DocumentTextIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { generateOfferLetterId } from "./offerLetterUtils";


// ----------------------------------------------------------------------

export default function AddOfferLetter() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const permissions = getStoredPermissions();

  const [letterType, setLetterType] = useState(
    searchParams.get("type") === "internship" ? "internship" : "offer"
  );

  // Sync letterType from URL param
  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "internship" || type === "offer") {
      setLetterType(type);
    }
  }, [searchParams]);

  const handleTypeChange = (newType) => {
    setLetterType(newType);
    setSearchParams({ type: newType });
  };

  // Dynamic Options States
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    offerletterdate: new Date().toISOString().split("T")[0],
    prefix: "Mr.",
    firstname: "",
    middlename: "",
    lastname: "",
    permanent_address: "",
    current_address: "",
    mobile: "",
    email: "",

    // Offer Letter Specific
    branch: "",
    department: "",
    designation: "",
    duration: "1 Year",
    probation_period: "1 Year",
    joiningdate: "",

    // Internship Letter Specific
    internship_period: "1 Year",
    training_start_date: new Date().toISOString().split("T")[0],
    stipend: "",
    apprentice_expire_month: "6 Month",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fetch all options on mount in parallel
  const fetchAllOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      const [branchRes, deptRes, desigRes] = await Promise.all([
        axios.get("/hrm/list-branch").catch(() => ({ data: { data: [] } })),
        axios.get("/hrm/department-list").catch(() => ({ data: { data: [] } })),
        axios.get("/hrm/designation-list").catch(() => ({ data: { data: [] } })),
        axios.get("/get-company-info").catch(() => ({ data: { data: null } })),
      ]);

      const defaultBranches = [
        { id: "1", name: "Indore Laboratory", location: "Indore" },
        { id: "2", name: "Bhopal Laboratory", location: "Bhopal" },
        { id: "3", name: "Gwalior Laboratory", location: "Gwalior" },
      ];

      const defaultDepartments = [
        { id: "1", name: "Laboratory" },
        { id: "2", name: "Microbiology" },
        { id: "3", name: "Chemical" },
        { id: "4", name: "Quality Assurance" },
        { id: "5", name: "Human Resources" },
      ];

      const defaultDesignations = [
        { id: "1", name: "Graduate Apprentice" },
        { id: "2", name: "Sr. Microbiologist" },
        { id: "3", name: "Quality Analyst" },
        { id: "4", name: "Lab Technician" },
        { id: "5", name: "Executive Director" },
      ];

      const branchesList = (branchRes.data?.data && branchRes.data.data.length > 0) ? branchRes.data.data : (branchRes.data?.length > 0 ? branchRes.data : defaultBranches);
      const departmentsList = (deptRes.data?.data && deptRes.data.data.length > 0) ? deptRes.data.data : (deptRes.data?.length > 0 ? deptRes.data : defaultDepartments);
      const designationsList = (desigRes.data?.data && desigRes.data.data.length > 0) ? desigRes.data.data : (desigRes.data?.length > 0 ? desigRes.data : defaultDesignations);

      setBranches(branchesList);
      setDepartments(departmentsList);
      setDesignations(designationsList);
    } catch (err) {
      console.error("Error fetching options:", err);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    if (permissions.includes(249)) {
      fetchAllOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAllOptions]);

  // Handle Same as Permanent Address toggle
  const handleSameAddressChange = (checked) => {
    setSameAsPermanent(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        current_address: prev.permanent_address || "",
      }));
    }
  };

  // Form input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };
      if (name === "permanent_address" && sameAsPermanent) {
        updated.current_address = value;
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Custom Select dropdown handler
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateField(name, value);
  };

  // Field validation
  const validateField = (fieldName, value) => {
    let error = "";
    if (value === undefined || value === null || String(value).trim() === "") {
      if (
        ![
          "middlename",
          "prefix",
          "email",
          "dob",
          "offerletterdate",
          "sa",
          "bonus",
          "mobileallowance",
        ].includes(fieldName)
      ) {
        error = "This field is required";
      }
    }

    if (fieldName === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
      error = "Please enter a valid email address";
    }

    if (fieldName === "mobile" && value && !/^\+?[0-9\s-]{10,15}$/.test(value)) {
      error = "Please enter a valid mobile number";
    }

    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));

    return error === "";
  };

  // Validate the whole form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Common Required Fields
    const commonRequired = [
      "offerletterdate",
      "firstname",
      "lastname",
      "mobile",
      "permanent_address",
    ];

    // Offer-Specific Required Fields
    const offerRequired = [
      "designation",
      "department",
      "probation_period",
      "joiningdate",
    ];

    // Internship-Specific Required Fields
    const internshipRequired = [
      "internship_period",
      "training_start_date",
      "stipend",
      "apprentice_expire_month",
    ];

    const fieldsToValidate = [
      ...commonRequired,
      ...(letterType === "internship" ? internshipRequired : offerRequired),
    ];

    fieldsToValidate.forEach((key) => {
      const value = formData[key];
      if (value === undefined || value === null || String(value).trim() === "") {
        newErrors[key] = "This field is required";
        isValid = false;
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (formData.mobile && !/^\+?[0-9\s-]{10,15}$/.test(formData.mobile)) {
      newErrors.mobile = "Please enter a valid mobile number";
      isValid = false;
    }

    setErrors(newErrors);

    // Touch all fields to show inline red error cues
    const allTouched = {};
    Object.keys(formData).forEach((k) => {
      allTouched[k] = true;
    });
    fieldsToValidate.forEach((k) => {
      allTouched[k] = true;
    });
    setTouched(allTouched);

    return isValid;
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly ❌");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        address: formData.permanent_address,
        current_address: formData.current_address,
        duration: letterType === "internship" ? formData.internship_period : formData.probation_period,
        joiningdate: letterType === "internship" ? formData.training_start_date : formData.joiningdate,
        gross: letterType === "internship" ? formData.stipend : formData.gross,
        letter_type: letterType,
      };

      // Resolve designation and branch labels
      const matchedDesig = designations.find((d) => String(d.id || d.value) === String(formData.designation));
      const matchedBranch = branches.find((b) => String(b.id || b.value) === String(formData.branch));
      const matchedDept = departments.find((d) => String(d.id || d.value) === String(formData.department));

      // Generate date-wise reference ID only for Offer Letters (KTRC/OFFER/DDMMYYYY/001...)
      let letterId = `INT-${Date.now().toString().slice(-4)}`;
      let refNo = "";
      let seqNo = null;

      if (letterType === "offer") {
        const generatedIdInfo = generateOfferLetterId(formData.offerletterdate);
        letterId = generatedIdInfo.id;
        refNo = generatedIdInfo.reference_no;
        seqNo = generatedIdInfo.seq_no;
      }

      const newRecord = {
        id: letterId,
        ...(refNo ? { reference_no: refNo } : {}),
        ...(seqNo ? { seq_no: seqNo } : {}),
        ...payload,
        designation_name: matchedDesig ? (matchedDesig.name || matchedDesig.label) : (letterType === "internship" ? "Graduate Apprentice" : formData.designation),
        department_name: matchedDept ? (matchedDept.name || matchedDept.label) : formData.department,
        branch_name: matchedBranch ? (matchedBranch.name || matchedBranch.label) : formData.branch,
        companyname: "KAILTECH TEST & RESEARCH CENTRE PVT. LTD.",
        added_by_name: "Er. RUBY S. MALHOTRA",
        status: 1,
        created_at: new Date().toISOString(),
      };

      try {
        const stored = JSON.parse(localStorage.getItem("local_offer_letters") || "[]");
        localStorage.setItem("local_offer_letters", JSON.stringify([newRecord, ...stored]));
      } catch (storageErr) {
        console.warn("Could not save to localStorage", storageErr);
      }

      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        form.append(key, value || "");
      });
      form.append("id", letterId);
      if (refNo) {
        form.append("reference_no", refNo);
        form.append("offer_id", refNo);
      }
      if (seqNo) {
        form.append("seq_no", seqNo);
      }

      try {
        await axios.post("/hrm/insert-offer-letter", form);
      } catch {
        try {
          await axios.post("/hrm/add-offer-letter", form);
        } catch {
          // Offline / local development fallback
        }
      }

      toast.success(`${letterType === "internship" ? "Internship Letter" : "Offer Letter"}${refNo ? ` (${refNo})` : ""} created successfully ✅`, {
        duration: 2500,
        icon: "✅",
      });

      navigate("/dashboards/hrm/view-offer-letter");
    } catch (err) {
      console.error("Error creating Offer Letter:", err);
      toast.error(err?.response?.data?.message || "Failed to create letter ❌");
    } finally {
      setSubmitting(false);
    }
  };

  // Permission Gate: PHP code requires permission 249 to Add Offer Letters
  if (!permissions.includes(249)) {
    return (
      <Page title="Add Offer Letter">
        <div className="flex h-60 items-center justify-center rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Access Denied - Permission 249 required to add offer letters
          </p>
        </div>
      </Page>
    );
  }

  const prefixOptions = [
    { value: "Mr.", label: "Mr." },
    { value: "Mrs.", label: "Mrs." },
    { value: "Miss", label: "Miss" },
    { value: "Ms.", label: "Ms." },
    { value: "Dr.", label: "Dr." },
    { value: "Er.", label: "Er." },
  ];

  const branchOptions = branches.map((b) => ({
    value: String(b.id || b.value),
    label: b.name && b.location ? `${b.name} / ${b.location}` : b.name || b.label || String(b.id || b.value),
  }));

  const departmentOptions = departments.map((d) => ({
    value: String(d.id || d.value),
    label: d.name || d.label || String(d.id || d.value),
  }));

  const designationOptions = designations.map((d) => ({
    value: String(d.id || d.value),
    label: d.name || d.label || String(d.id || d.value),
  }));

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      borderRadius: "0.5rem",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
      },
      backgroundColor: "transparent",
      fontSize: "0.875rem",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "0.5rem",
      zIndex: 9999,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
      fontSize: "0.875rem",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#2563eb"
        : state.isFocused
          ? "#eff6ff"
          : "transparent",
      color: state.isSelected ? "#ffffff" : "#1f2937",
      cursor: "pointer",
      fontSize: "0.875rem",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
      fontSize: "0.875rem",
    }),
    singleValue: (base) => ({
      ...base,
      color: "inherit",
      fontSize: "0.875rem",
    }),
  };

  if (loadingOptions) {
    return (
      <Page title="Add Offer Letter::.Joining Process-Hrm">
        <div className="flex h-[60vh] items-center justify-center text-gray-600 dark:text-dark-200">
          <svg className="mr-2 h-6 w-6 animate-spin text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
          </svg>
          Loading options...
        </div>
      </Page>
    );
  }

  return (
    <Page title={`${letterType === "internship" ? "Add Internship Letter" : "Add Offer Letter"}::.Joining Process-Hrm`}>
      <div className="transition-content p-6 space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {permissions.includes(246) && (
              <button
                onClick={() => navigate("/dashboards/hrm/view-offer-letter")}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-dark-800 transition"
                title="Back to List"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-dark-200" />
              </button>
            )}
            <div>
              <h2 className="text-xl font-semibold tracking-wide text-gray-800 dark:text-dark-50">
                {letterType === "internship" ? "Create Internship Letter" : "Create Offer Letter"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {letterType === "internship"
                  ? "Issue a graduate apprentice / internship training agreement"
                  : "Issue a new employment offer letter and configure payroll structure"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {permissions.includes(246) && (
              <Button
                variant="outlined"
                className="h-9 rounded-md px-4"
                onClick={() => navigate("/dashboards/hrm/view-offer-letter")}
              >
                &lt;&lt; Back
              </Button>
            )}
          </div>
        </div>

        {/* Type Switcher Tabs */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-dark-800 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => handleTypeChange("offer")}
            className={clsx(
              "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition",
              letterType === "offer"
                ? "bg-white text-primary-600 shadow-sm dark:bg-dark-600 dark:text-primary-400"
                : "text-gray-600 hover:text-gray-900 dark:text-dark-200 dark:hover:text-white"
            )}
          >
            <DocumentTextIcon className="size-4.5" />
            <span>Offer Letter</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("internship")}
            className={clsx(
              "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition",
              letterType === "internship"
                ? "bg-white text-primary-600 shadow-sm dark:bg-dark-600 dark:text-primary-400"
                : "text-gray-600 hover:text-gray-900 dark:text-dark-200 dark:hover:text-white"
            )}
          >
            <AcademicCapIcon className="size-4.5" />
            <span>Internship Letter</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Candidate Basic & Contact Details */}
          <Card className="p-6 border-none shadow-soft dark:bg-dark-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-2 border-b border-gray-100 dark:border-dark-600 gap-2">
              <h3 className="text-base font-bold text-gray-800 dark:text-dark-100">
                Basic & Contact Information
              </h3>
              {letterType === "offer" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Auto Generated ID:</span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                    {generateOfferLetterId(formData.offerletterdate).reference_no}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Date */}
              <div>
                <Input
                  label="Date *"
                  name="offerletterdate"
                  type="date"
                  value={formData.offerletterdate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.offerletterdate && errors.offerletterdate}
                />
              </div>

              {/* Prefix */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-dark-100 mb-1.5 block">
                  Prefix
                </label>
                <Select
                  name="prefix"
                  options={prefixOptions}
                  value={prefixOptions.find((opt) => opt.value === formData.prefix) || null}
                  onChange={(opt) => handleSelectChange("prefix", opt ? opt.value : "")}
                  placeholder="Select prefix..."
                  isSearchable
                  isClearable
                  styles={customSelectStyles}
                />
              </div>

              {/* First Name */}
              <div>
                <Input
                  label="First Name *"
                  name="firstname"
                  placeholder="First name"
                  value={formData.firstname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.firstname && errors.firstname}
                />
              </div>

              {/* Last Name */}
              <div>
                <Input
                  label="Last Name *"
                  name="lastname"
                  placeholder="Last name"
                  value={formData.lastname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.lastname && errors.lastname}
                />
              </div>

              {/* Mobile */}
              <div className="md:col-span-2">
                <Input
                  label="Mobile No. *"
                  name="mobile"
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.mobile && errors.mobile}
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <Input
                  label="Email ID"
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && errors.email}
                />
              </div>

              {/* Permanent Address */}
              <div className="md:col-span-4">
                <Input
                  label="Permanent Address *"
                  name="permanent_address"
                  placeholder="Enter permanent address (House No, Street, City, State, Pincode)"
                  value={formData.permanent_address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.permanent_address && errors.permanent_address}
                />
              </div>

              {/* Current Address (Positioned Below Permanent Address) */}
              <div className="md:col-span-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-dark-200">
                    Current Address
                  </span>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-primary-600 dark:text-primary-400 select-none hover:underline">
                    <input
                      type="checkbox"
                      checked={sameAsPermanent}
                      onChange={(e) => handleSameAddressChange(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 size-4 cursor-pointer"
                    />
                    <span>Same as Permanent Address</span>
                  </label>
                </div>
                <Input
                  name="current_address"
                  placeholder="Enter current address (if different from permanent)"
                  value={formData.current_address}
                  onChange={(e) => {
                    if (sameAsPermanent) setSameAsPermanent(false);
                    handleChange(e);
                  }}
                  readOnly={sameAsPermanent}
                  className={sameAsPermanent ? "bg-gray-50 dark:bg-dark-800 text-gray-600 cursor-not-allowed" : ""}
                />
              </div>
            </div>
          </Card>

          {/* ========================================================================= */}
          {/* SECTION 2A: OFFER LETTER SPECIFIC FIELDS                                  */}
          {/* ========================================================================= */}
          {letterType === "offer" && (
            <Card className="p-6 border-none shadow-soft dark:bg-dark-700">
                <h3 className="text-base font-bold text-gray-800 dark:text-dark-100 mb-6 pb-2 border-b border-gray-100 dark:border-dark-600">
                  Employment Parameters
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Post / Designation */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-100 mb-1.5 block">
                      Post / Designation *
                    </label>
                    <Select
                      name="designation"
                      options={designationOptions}
                      value={designationOptions.find((d) => String(d.value) === String(formData.designation)) || null}
                      onChange={(opt) => handleSelectChange("designation", opt ? opt.value : "")}
                      placeholder="Select post..."
                      isSearchable
                      isClearable
                      styles={customSelectStyles}
                    />
                    {touched.designation && errors.designation && (
                      <p className="text-xs text-red-500 mt-1">{errors.designation}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-100 mb-1.5 block">
                      Department *
                    </label>
                    <Select
                      name="department"
                      options={departmentOptions}
                      value={departmentOptions.find((d) => String(d.value) === String(formData.department)) || null}
                      onChange={(opt) => handleSelectChange("department", opt ? opt.value : "")}
                      placeholder="Select department..."
                      isSearchable
                      isClearable
                      styles={customSelectStyles}
                    />
                    {touched.department && errors.department && (
                      <p className="text-xs text-red-500 mt-1">{errors.department}</p>
                    )}
                  </div>

                  {/* Branch */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-100 mb-1.5 block">
                      Posting Branch
                    </label>
                    <Select
                      name="branch"
                      options={branchOptions}
                      value={branchOptions.find((b) => String(b.value) === String(formData.branch)) || null}
                      onChange={(opt) => handleSelectChange("branch", opt ? opt.value : "")}
                      placeholder="Select branch..."
                      isSearchable
                      isClearable
                      styles={customSelectStyles}
                    />
                  </div>

                  {/* Probation Period */}
                  <div>
                    <Input
                      label="Probation Period *"
                      name="probation_period"
                      placeholder="e.g. 1 Year, 6 Months"
                      value={formData.probation_period}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.probation_period && errors.probation_period}
                    />
                  </div>

                  {/* Joining Date */}
                  <div>
                    <Input
                      label="Joining Date *"
                      name="joiningdate"
                      type="date"
                      value={formData.joiningdate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.joiningdate && errors.joiningdate}
                    />
                  </div>
                </div>
              </Card>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2B: INTERNSHIP / APPRENTICE SPECIFIC FIELDS                       */}
          {/* ========================================================================= */}
          {letterType === "internship" && (
            <Card className="p-6 border-none shadow-soft dark:bg-dark-700">
              <h3 className="text-base font-bold text-gray-800 dark:text-dark-100 mb-6 pb-2 border-b border-gray-100 dark:border-dark-600">
                Internship / Training Parameters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Internship Period (Manual) */}
                <div className="md:col-span-2">
                  <Input
                    label="Internship Period (Manual) *"
                    name="internship_period"
                    placeholder="e.g. 1 Year, 12 Months, 6 Months"
                    value={formData.internship_period}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.internship_period && errors.internship_period}
                  />
                </div>

                {/* Training Start Date (Manual) */}
                <div className="md:col-span-2">
                  <Input
                    label="Training Start Date (Manual) *"
                    name="training_start_date"
                    type="date"
                    value={formData.training_start_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.training_start_date && errors.training_start_date}
                  />
                </div>

                {/* Stipend */}
                <div className="md:col-span-2">
                  <Input
                    label="Stipend (Monthly) *"
                    name="stipend"
                    type="number"
                    placeholder="e.g. 11000"
                    value={formData.stipend}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.stipend && errors.stipend}
                    description="Monthly stipend under Apprentices Act, 1961"
                  />
                </div>

                {/* Apprentice Expire Month */}
                <div className="md:col-span-2">
                  <Input
                    label="Apprentice Expire Month *"
                    name="apprentice_expire_month"
                    placeholder="e.g. 12 Month, 1 Year"
                    value={formData.apprentice_expire_month}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.apprentice_expire_month && errors.apprentice_expire_month}
                    description="Expiration duration from the date of joining"
                  />
                </div>

                {/* Training Branch */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-dark-100 mb-1.5 block">
                    Training Location / Laboratory
                  </label>
                  <Select
                    name="branch"
                    options={branchOptions}
                    value={branchOptions.find((b) => String(b.value) === String(formData.branch)) || null}
                    onChange={(opt) => handleSelectChange("branch", opt ? opt.value : "")}
                    placeholder="Select training location..."
                    isSearchable
                    isClearable
                    styles={customSelectStyles}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-150 dark:border-dark-500 pt-6">
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate("/dashboards/hrm/view-offer-letter")}
              disabled={submitting}
              className="h-10 px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={submitting}
              className="h-10 px-6 font-semibold shadow-md shadow-primary-500/20"
            >
              {submitting ? "Saving..." : letterType === "internship" ? "Create Internship Letter" : "Create Offer Letter"}
            </Button>
          </div>

        </form>
      </div>
    </Page>
  );
}
