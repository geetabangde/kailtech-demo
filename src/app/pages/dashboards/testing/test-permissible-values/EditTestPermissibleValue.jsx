import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Button, Input } from "components/ui";
import Select from "react-select";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";

export default function EditTestPermissibleValue() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Main form state
  const [formData, setFormData] = useState({
    product: "",
    grade: "",
    size: "",
    standard: "",
    parameter: [],
    method: [],
    clause: [],
    pvaluemin: [],
    pvaluemax: [],
    specification: [],
    updated_by: 31,
  });

  // Dropdown data states
  const [products, setProducts] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [standards, setStandards] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [methods, setMethods] = useState([]);
  const [clauses, setClauses] = useState([]);

  // Dynamic parameter inputs
  const [parameterInputs, setParameterInputs] = useState([]);

  // Loading states
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState({
    products: true,
    grades: true,
    sizes: true,
    standards: true,
    parameters: true,
    methods: true,
    clauses: true,
  });

  // Error states
  const [errors, setErrors] = useState({});

  // Helper function to extract array from API response
  const extractArrayFromResponse = (responseData) => {
    console.log("🔍 Raw API Response:", responseData);

    if (responseData && typeof responseData === "object") {
      if (responseData.data) {
        if (Array.isArray(responseData.data)) {
          console.log(
            "✅ Found array in .data:",
            responseData.data.length,
            "items",
          );
          if (responseData.data.length > 0) {
            console.log(
              "   First item structure:",
              Object.keys(responseData.data[0]),
            );
          }
          return responseData.data;
        }
        if (responseData.data.data && Array.isArray(responseData.data.data)) {
          console.log(
            "✅ Found array in .data.data:",
            responseData.data.data.length,
            "items",
          );
          if (responseData.data.data.length > 0) {
            console.log(
              "   First item structure:",
              Object.keys(responseData.data.data[0]),
            );
          }
          return responseData.data.data;
        }
      }

      if (Array.isArray(responseData.items)) {
        console.log(
          "✅ Found array in .items:",
          responseData.items.length,
          "items",
        );
        if (responseData.items.length > 0) {
          console.log(
            "   First item structure:",
            Object.keys(responseData.items[0]),
          );
        }
        return responseData.items;
      }

      if (Array.isArray(responseData.results)) {
        console.log(
          "✅ Found array in .results:",
          responseData.results.length,
          "items",
        );
        if (responseData.results.length > 0) {
          console.log(
            "   First item structure:",
            Object.keys(responseData.results[0]),
          );
        }
        return responseData.results;
      }
    }

    if (Array.isArray(responseData)) {
      console.log("✅ Already an array:", responseData.length, "items");
      if (responseData.length > 0) {
        console.log("   First item structure:", Object.keys(responseData[0]));
      }
      return responseData;
    }

    return [];
  };

  // Generate options matching PHP logic
  const generateOptions = (dataArray, fieldName = "unknown") => {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return [];
    }

    const options = dataArray
      .filter((item) => {
        if (!item || typeof item !== "object") return false;
        if (!Object.prototype.hasOwnProperty.call(item, "status")) return true;

        const status = item.status;
        const isActive =
          status === 1 ||
          status === "1" ||
          status === true ||
          status === "true" ||
          status === 99 ||
          status === "99";

        return isActive;
      })
      .map((item) => {
        const id = item.id || item.ID || item.Id || item.value;

        let name =
          item.name ||
          item.Name ||
          item.method_name ||
          item.parameter_name ||
          item.grade_name ||
          item.standard_name ||
          item.standard_code ||
          item.clause_name ||
          item.size_name ||
          item.product_name ||
          item.code ||
          item.short_name ||
          item.sname ||
          item.label ||
          item.title ||
          item.text ||
          "";

        if (!name && item.description) {
          name = item.description;
        }

        // ✅ Smart fallback: scan all string fields (skip id/status/timestamps)
        if (!name) {
          const skipFields = new Set([
            "id",
            "ID",
            "Id",
            "status",
            "created_at",
            "updated_at",
            "deleted_at",
            "created_by",
            "updated_by",
            "deleted_by",
          ]);
          const firstStringField = Object.entries(item).find(
            ([key, val]) =>
              !skipFields.has(key) &&
              typeof val === "string" &&
              val.trim() !== "" &&
              isNaN(Number(val)),
          );
          if (firstStringField) {
            name = firstStringField[1];
          }
        }

        if (!name && id) {
          name = `Item ${id}`;
          console.warn(`⚠️ No name found for ${fieldName} item ${id}`);
        }

        if (
          item.description &&
          item.description.trim() !== "" &&
          item.description !== name &&
          !["grades", "standards", "methods", "clauses", "sizes"].includes(fieldName)
        ) {
          name = `${name} (${item.description})`;
        }

        const value = id !== undefined && id !== null ? String(id) : "";
        const label = name ? String(name).trim() : "";

        return { value, label };
      })
      .filter((option) => option.value && option.label);

    return options;
  };

  // ✅ FIXED: Single useEffect — dropdowns + record fetch in sequence
  useEffect(() => {
    let cancelled = false;

    const initPage = async () => {
      console.log("🔄 Starting page init...");

      const [
        productsRes,
        gradesRes,
        sizesRes,
        standardsRes,
        parametersRes,
        methodsRes,
        clausesRes,
      ] = await Promise.allSettled([
        axios.get("/testing/get-prodcut-list"),
        axios.get("/testing/get-grades"),
        axios.get("/testing/get-sizes"),
        axios.get("/testing/get-standards"),
        axios.get("/testing/get-perameter-list"),
        axios.get("/testing/get-methods"),
        axios.get("/testing/get-clauses"),
      ]);

      if (cancelled) return;

      const extract = (res, name) => {
        if (res.status === "fulfilled") {
          const data = extractArrayFromResponse(res.value.data);
          console.log(`✅ ${name}: ${data.length} items`);
          return data;
        }
        console.error(`❌ ${name} failed:`, res.reason);
        toast.error(`Failed to load ${name}`);
        return [];
      };

      const productsData = extract(productsRes, "Products");
      const gradesData = extract(gradesRes, "Grades");
      const sizesData = extract(sizesRes, "Sizes");
      const standardsData = extract(standardsRes, "Standards");
      const parametersData = extract(parametersRes, "Parameters");
      const methodsData = extract(methodsRes, "Methods");
      const clausesData = extract(clausesRes, "Clauses");

      setProducts(productsData);
      setGrades(gradesData);
      setSizes(sizesData);
      setStandards(standardsData);
      setParameters(parametersData);
      setMethods(methodsData);
      setClauses(clausesData);

      // Set all dropdowns loaded at once
      setDropdownLoading({
        products: false,
        grades: false,
        sizes: false,
        standards: false,
        parameters: false,
        methods: false,
        clauses: false,
      });

      console.log("✅ All dropdowns loaded — fetching record...");

      // ── Fetch existing record ──
      if (!id) return;

      try {
        setFetchLoading(true);
        const response = await axios.get(
          `/testing/get-permissible-value-byid`,
          {
            params: { id: id },
          },
        );
        if (cancelled) return;

        const result = response.data;
        console.log("📦 Record Response:", result);

        // Flexible status handling
        const isSuccess =
          result.status === true ||
          result.status === "true" ||
          result.status === 1 ||
          result.status === "1" ||
          result.status === "success" ||
          result.status === "ok";

        if (isSuccess && result.data) {
          const data = result.data;
          console.log("📋 Raw record data:", data);

          // ✅ CRITICAL FIX: Handle Arrays, Strings, and Numbers
          const parseArray = (value) => {
            if (value === null || value === undefined || value === "") {
              return [];
            }
            if (Array.isArray(value)) {
              return value.map((v) => String(v).trim());
            }
            if (typeof value === "string") {
              // If it's a comma-separated string, split it
              if (value.includes(",")) {
                return value.split(",").map((v) => String(v).trim());
              }
              return [value.trim()];
            }
            // Handle numbers or other single values
            return [String(value).trim()];
          };

          const parsedParameter = parseArray(data.parameter);
          const parsedMethod = parseArray(data.method);
          const parsedClause = parseArray(data.clause);
          const parsedPvaluemin = parseArray(data.pvaluemin);
          const parsedPvaluemax = parseArray(data.pvaluemax);
          let rawSpec = data.specification || "";
          let specArray = [rawSpec];
          if (typeof rawSpec === "string" && rawSpec.includes("|")) {
            specArray = rawSpec.split("|").map(v => v.trim());
          } else if (typeof rawSpec === "string" && rawSpec.includes(",")) {
            specArray = rawSpec.split(",").map(v => v.trim());
          }
          const parsedSpecification = [specArray];

          console.log("📊 Parsed arrays:", {
            parameter: parsedParameter,
            method: parsedMethod,
            clause: parsedClause,
            pvaluemin: parsedPvaluemin,
            pvaluemax: parsedPvaluemax,
            specification: parsedSpecification,
          });

          setFormData({
            product: String(data.product || ""),
            grade: String(data.grade || ""),
            size: String(data.size || ""),
            standard: String(data.standard || ""),
            parameter: parsedParameter,
            method: parsedMethod,
            clause: parsedClause,
            pvaluemin: parsedPvaluemin,
            pvaluemax: parsedPvaluemax,
            specification: parsedSpecification,
            updated_by: 31,
          });

          // ✅ Create parameter inputs based on actual count
          const paramCount = parsedParameter.length;
          const newInputs = Array.from(
            { length: Math.max(paramCount, 1) },
            (_, i) => ({ id: i + 1 }),
          );
          setParameterInputs(newInputs);

          console.log(`✅ Form populated with ${paramCount} parameters`);
          console.log("   Parameter values:", parsedParameter);
          console.log("   Method values:", parsedMethod);
          console.log("   Clause values:", parsedClause);

          // ✅ NEW: Load product-specific Grade and Size on initial load
          if (data.product) {
            try {
              console.log(`🪄 Initial product found (ID: ${data.product}), fetching linked Grade & Size...`);
              const gsRes = await axios.get(`/testing/get-grade-and-size?pid=${data.product}`);
              if (gsRes.data.status) {
                setGrades(gsRes.data.grades || []);
                setSizes(gsRes.data.sizes || []);
              }
            } catch (err) {
              console.error("❌ Error fetching initial product grade/size:", err);
            }
          }
        } else {
          console.error("❌ Non-success response:", result);
          toast.error(
            result.message || "Could not load record. Please try again.",
          );
          setParameterInputs([{ id: 1 }]);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("❌ Record fetch error:", err);
        toast.error("Error loading record. Please try again.");
        setParameterInputs([{ id: 1 }]);
      } finally {
        if (!cancelled) setFetchLoading(false);
      }
    };

    initPage();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Handle form field changes
  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // ✅ FIXED: Load Grade and Size based on selected product using the specific API
    if (name === "product" && value) {
      try {
        console.log(`🪄 Product selected (ID: ${value}), fetching linked Grade & Size...`);
        
        setDropdownLoading(prev => ({ ...prev, grades: true, sizes: true }));
        const response = await axios.get(`/testing/get-grade-and-size?pid=${value}`);
        
        if (response.data.status) {
          console.log("📦 Received filtered grades and sizes:", response.data);
          setGrades(response.data.grades || []);
          setSizes(response.data.sizes || []);
          
          // Clear dependent fields on manual change
          setFormData((prev) => ({
            ...prev,
            grade: "",
            size: "",
            standard: "",
          }));
        }
      } catch (error) {
        console.error("❌ Error fetching product grade/size:", error);
        toast.error("Failed to fetch linked Grade and Size");
      } finally {
        setDropdownLoading(prev => ({ ...prev, grades: false, sizes: false }));
      }
    } else if (name === "product" && !value) {
      // Re-fetch global lists if product is cleared (if needed, or just clear)
      // Here we can just clear for simplicity as product is mandatory
      setGrades([]);
      setSizes([]);
      setFormData(prev => ({ ...prev, grade: "", size: "", standard: "" }));
    }
  };

  // Handle array field changes
  const handleArrayChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = value;
      return { ...prev, [field]: updatedArray };
    });
  };

  // Handle min/max value changes
  const handleParameterValueChange = (index, type, value) => {
    const field = type === "min" ? "pvaluemin" : "pvaluemax";
    setFormData((prev) => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = value;
      return { ...prev, [field]: updatedArray };
    });
  };

  // Handle specification changes
  const handleSpecificationChange = (paramIndex, specIndex, value) => {
    setFormData((prev) => {
      const updatedArray = [...prev.specification];
      const paramSpecs = Array.isArray(updatedArray[paramIndex]) 
        ? [...updatedArray[paramIndex]] 
        : [updatedArray[paramIndex] || ""];
      paramSpecs[specIndex] = value;
      updatedArray[paramIndex] = paramSpecs;
      return { ...prev, specification: updatedArray };
    });
  };

  const addSpecification = (paramIndex) => {
    setFormData((prev) => {
      const updatedArray = [...prev.specification];
      const paramSpecs = Array.isArray(updatedArray[paramIndex]) 
        ? [...updatedArray[paramIndex]] 
        : [updatedArray[paramIndex] || ""];
      paramSpecs.push("");
      updatedArray[paramIndex] = paramSpecs;
      return { ...prev, specification: updatedArray };
    });
  };

  const removeSpecification = (paramIndex, specIndex) => {
    setFormData((prev) => {
      const updatedArray = [...prev.specification];
      const paramSpecs = Array.isArray(updatedArray[paramIndex]) 
        ? [...updatedArray[paramIndex]] 
        : [updatedArray[paramIndex] || ""];
      paramSpecs.splice(specIndex, 1);
      updatedArray[paramIndex] = paramSpecs;
      return { ...prev, specification: updatedArray };
    });
  };

  // Add parameter row
  const addParameterRow = () => {
    const newId = parameterInputs.length + 1;
    setParameterInputs((prev) => [...prev, { id: newId }]);

    setFormData((prev) => ({
      ...prev,
      parameter: [...prev.parameter, ""],
      method: [...prev.method, ""],
      clause: [...prev.clause, ""],
      pvaluemin: [...prev.pvaluemin, ""],
      pvaluemax: [...prev.pvaluemax, ""],
      specification: [...prev.specification, [""]],
    }));
  };

  // Remove parameter row
  const removeParameterRow = (index) => {
    if (parameterInputs.length === 1) {
      toast.error("At least one parameter is required");
      return;
    }

    setParameterInputs((prev) => prev.filter((_, i) => i !== index));

    setFormData((prev) => {
      const newFormData = { ...prev };
      [
        "parameter",
        "method",
        "clause",
        "pvaluemin",
        "pvaluemax",
        "specification",
      ].forEach((key) => {
        newFormData[key] = newFormData[key].filter((_, i) => i !== index);
      });
      return newFormData;
    });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    const requiredFields = ["product", "grade", "size", "standard"];
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    formData.parameter.forEach((param, index) => {
      if (!param) {
        newErrors[`parameter_${index}`] = "Parameter is required";
      }
    });

    formData.method.forEach((method, index) => {
      if (!method) {
        newErrors[`method_${index}`] = "Method is required";
      }
    });

    formData.pvaluemin.forEach((min, index) => {
      const max = formData.pvaluemax[index];
      if (min && max && parseFloat(min) > parseFloat(max)) {
        newErrors[`value_${index}`] =
          "Min value cannot be greater than max value";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix form errors before submitting");
      return;
    }

    setSubmitLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add ID for update
      formDataToSend.append("id", id);

      // Append all fields
      Object.keys(formData).forEach((key) => {
        if (key === "specification") {
          formData.specification.forEach((specItem) => {
             const joinedSpecs = Array.isArray(specItem) ? specItem.join(" | ") : specItem;
             formDataToSend.append(`specification[]`, joinedSpecs);
          });
        } else if (Array.isArray(formData[key])) {
          formData[key].forEach((value) => {
            formDataToSend.append(`${key}[]`, value);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post(
        "/testing/update-permissible-value",
        formDataToSend,
      );
      const result = response.data;

      if (result.status === "true" || result.status === true) {
        toast.success("Test Permissible Value updated successfully ✅", {
          duration: 2000,
        });

        setTimeout(() => {
          navigate("/dashboards/testing/test-permissible-values", {
            state: { updatedId: parseInt(id) },
          });
        }, 1500);
      } else {
        toast.error(
          result.message || "Failed to update test permissible value ❌",
        );
      }
    } catch (err) {
      console.error("Error updating permissible value:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to update test permissible value";
      toast.error(errorMessage + " ❌");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Show loading screen while ANY dropdown is loading OR while fetching existing data
  const isAnyDropdownLoading = Object.values(dropdownLoading).some(Boolean);

  if (isAnyDropdownLoading || fetchLoading) {
    return (
      <Page title="Edit Test Permissible Value">
        <div className="flex items-center justify-center p-6">
          <div className="text-center">
            <svg
              className="mx-auto mb-2 h-8 w-8 animate-spin text-blue-600"
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
            <p className="text-gray-600 dark:text-gray-300">
              Loading permissible value data...
            </p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Edit Test Permissible Value">
      <div className="p-6">
        {/* Header + Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Edit Test Permissible Value
          </h2>
          <Button
            variant="outline"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() =>
              navigate("/dashboards/testing/test-permissible-values")
            }
          >
            ← Back to List
          </Button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800"
        >
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Product */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Product <span className="text-red-500">*</span>
              </label>
              <Select
                options={generateOptions(products, "products")}
                value={
                  generateOptions(products, "products").find(
                    (opt) => opt.value == formData.product,
                  ) || null
                }
                onChange={(option) =>
                  handleChange({
                    target: {
                      name: "product",
                      value: option ? option.value : "",
                    },
                  })
                }
                placeholder="Select Product"
                isSearchable
                className="react-select-container"
                classNamePrefix="react-select"
              />
              {errors.product && (
                <p className="mt-1 text-sm text-red-500">{errors.product}</p>
              )}
            </div>

            {/* Grade */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Grade <span className="text-red-500">*</span>
              </label>
              <Select
                options={generateOptions(grades, "grades")}
                value={
                  generateOptions(grades, "grades").find(
                    (opt) => opt.value == formData.grade,
                  ) || null
                }
                onChange={(option) =>
                  handleChange({
                    target: {
                      name: "grade",
                      value: option ? option.value : "",
                    },
                  })
                }
                placeholder="Select Grade"
                isSearchable
                className="react-select-container"
                classNamePrefix="react-select"
              />
              {errors.grade && (
                <p className="mt-1 text-sm text-red-500">{errors.grade}</p>
              )}
            </div>

            {/* Size */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Size <span className="text-red-500">*</span>
              </label>
              <Select
                options={generateOptions(sizes, "sizes")}
                value={
                  generateOptions(sizes, "sizes").find(
                    (opt) => opt.value == formData.size,
                  ) || null
                }
                onChange={(option) =>
                  handleChange({
                    target: { name: "size", value: option ? option.value : "" },
                  })
                }
                placeholder="Select Size"
                isSearchable
                className="react-select-container"
                classNamePrefix="react-select"
              />
              {errors.size && (
                <p className="mt-1 text-sm text-red-500">{errors.size}</p>
              )}
            </div>

            {/* Standard */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Standard <span className="text-red-500">*</span>
              </label>
              <Select
                options={generateOptions(standards, "standards")}
                value={
                  generateOptions(standards, "standards").find(
                    (opt) => opt.value == formData.standard,
                  ) || null
                }
                onChange={(option) =>
                  handleChange({
                    target: {
                      name: "standard",
                      value: option ? option.value : "",
                    },
                  })
                }
                placeholder="Select Standard"
                isSearchable
                className="react-select-container"
                classNamePrefix="react-select"
              />
              {errors.standard && (
                <p className="mt-1 text-sm text-red-500">{errors.standard}</p>
              )}
            </div>
          </div>

          {/* Parameters Section */}
          <div className="border-t pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Parameters ({parameterInputs.length})
              </h3>
            </div>

            {parameterInputs.map((row, index) => (
              <div
                key={row.id}
                className="mb-4 rounded-lg border bg-gray-50 p-4 dark:bg-gray-700"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Parameter #{index + 1}
                  </span>
                  {parameterInputs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParameterRow(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Parameter */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Parameter <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={generateOptions(parameters, "parameters")}
                      value={
                        generateOptions(parameters, "parameters").find(
                          (opt) => opt.value == formData.parameter[index],
                        ) || null
                      }
                      onChange={(option) =>
                        handleArrayChange(
                          index,
                          "parameter",
                          option ? option.value : "",
                        )
                      }
                      placeholder="Select Parameter"
                      isSearchable
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {errors[`parameter_${index}`] && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors[`parameter_${index}`]}
                      </p>
                    )}
                  </div>

                  {/* Method */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Method <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={generateOptions(methods, "methods")}
                      value={
                        generateOptions(methods, "methods").find(
                          (opt) => opt.value == formData.method[index],
                        ) || null
                      }
                      onChange={(option) =>
                        handleArrayChange(
                          index,
                          "method",
                          option ? option.value : "",
                        )
                      }
                      placeholder="Select Method"
                      isSearchable
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {errors[`method_${index}`] && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors[`method_${index}`]}
                      </p>
                    )}
                  </div>

                  {/* Clause */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Clause
                    </label>
                    <Select
                      options={generateOptions(clauses, "clauses")}
                      value={
                        generateOptions(clauses, "clauses").find(
                          (opt) => opt.value == formData.clause[index],
                        ) || null
                      }
                      onChange={(option) =>
                        handleArrayChange(
                          index,
                          "clause",
                          option ? option.value : "",
                        )
                      }
                      placeholder="Select Clause"
                      isSearchable
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>

                  {/* Min Value */}
                  <div>
                    <Input
                      label="Min Value"
                      type="text" // Changed to text to match PHP flexibility (e.g. "< 0.5")
                      value={formData.pvaluemin[index] || ""}
                      onChange={(e) =>
                        handleParameterValueChange(index, "min", e.target.value)
                      }
                      placeholder="Enter minimum value"
                    />
                  </div>

                  {/* Max Value */}
                  <div>
                    <Input
                      label="Max Value"
                      type="text" // Changed to text to match PHP flexibility
                      value={formData.pvaluemax[index] || ""}
                      onChange={(e) =>
                        handleParameterValueChange(index, "max", e.target.value)
                      }
                      placeholder="Enter maximum value"
                    />
                  </div>

                  {/* Specifications */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Specifications
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addSpecification(index)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        + Add Specification
                      </Button>
                    </div>
                    {(() => {
                      const specs = Array.isArray(formData.specification[index])
                        ? formData.specification[index]
                        : [formData.specification[index] || ""];
                      
                      return specs.map((spec, specIndex) => (
                        <div key={specIndex} className="mb-2 flex items-center gap-2">
                          <div className="flex-1">
                            <Input
                              value={spec}
                              onChange={(e) =>
                                handleSpecificationChange(index, specIndex, e.target.value)
                              }
                              placeholder="Enter specification details"
                            />
                          </div>
                          {specs.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSpecification(index, specIndex)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {errors[`value_${index}`] && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors[`value_${index}`]}
                  </p>
                )}
              </div>
            ))}

            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addParameterRow}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                + Add Parameter
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate("/dashboards/testing/test-permissible-values")
              }
              disabled={submitLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={submitLoading}
              className="min-w-[120px]"
            >
              {submitLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin text-white"
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
                  Updating...
                </div>
              ) : (
                "Update Permissible Value"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
}
