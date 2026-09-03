import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button, Input, Textarea } from "components/ui";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";
import ReactSelect from "react-select";

export default function AddSupplier() {
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    company: "",
    email: "",
    mobile: "",
    gstno: "",
    panno: "",
    city: "",
    website: "",
    country: "",
    state: "",
    scontact: "",
    sphone: "",
    semail: "",
    designation: "",
  });

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get("/people/get-country");
        if (res.data.status === "true") {
          setCountries(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    const fetchStates = async () => {
      try {
        const res = await axios.get("/people/get-state");
        if (res.data.status === "true") {
          setStates(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };

    fetchCountries();
    fetchStates();
  }, []);

  const countryOptions = countries.map((c) => ({
    value: c.id,
    label: c.country_name,
  }));

  const stateOptions = states.map((s) => ({
    value: s.state,
    label: s.state,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleChangeSelect = (name, option) => {
    setFormData((prev) => ({
      ...prev,
      [name]: option ? option.value : "",
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.country) {
      toast.error("Country is required");
      return;
    }

    if ((formData.country === "1" || formData.country === 1) && !formData.state) {
      toast.error("State is required");
      return;
    }

    try {
      const res = await axios.post("/people/add-supplier", formData);
      if (res.data.status === "true" || res.status === 201) {
        toast.success(res.data.message || "Supplier added successfully");
        navigate("/dashboards/people/suppliers");
      } else {
        toast.error(res.data.message || "Failed to add supplier");
      }
    } catch (error) {
      console.error("Error adding supplier:", error);
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        setErrors(apiErrors);
        const firstError = Object.values(apiErrors)[0]?.[0];
        toast.error(firstError || "Please fix the validation errors in the form.");
      } else {
        toast.error(
          error.response?.data?.message || "Server error while adding supplier"
        );
      }
    }
  };

  return (
    <Page title="Add Supplier">
      <div className="p-6">
        {/* ✅ Header + Back Button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add Supplier</h2>
          <Button
            variant="outline"
            className="text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/dashboards/people/suppliers")}
          >
            Back to List
          </Button>
        </div>

        {/* ✅ Form */}
        <div className="rounded-md border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Input
              label="Supplier Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Supplier name"
              error={errors.name?.[0]}
              required
            />

            <div className="md:col-span-2">
              <Textarea
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Company Address"
                error={errors.address?.[0]}
                rows="3"
                required
              />
            </div>

            <Input
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company"
              error={errors.company?.[0]}
            />
            <Input
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              type="email"
              error={errors.email?.[0]}
            />
            <Input
              label="Mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Mobile"
              type="tel"
              error={errors.mobile?.[0]}
            />
            <Input
              label="GST No"
              name="gstno"
              value={formData.gstno}
              onChange={handleChange}
              placeholder="GST No"
              error={errors.gstno?.[0]}
            />
            <Input
              label="PAN No"
              name="panno"
              value={formData.panno}
              onChange={handleChange}
              placeholder="PAN No"
              error={errors.panno?.[0]}
            />
            <Input
              label="City*"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              error={errors.city?.[0]}
              required
            />
            <Input
              label="Website*"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="Website"
              error={errors.website?.[0]}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Country*
              </label>
              <ReactSelect
                name="country"
                value={countryOptions.find((c) => c.value == formData.country) || null}
                onChange={(option) => handleChangeSelect("country", option)}
                options={countryOptions}
                placeholder="Choose one.."
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
              />
              {errors.country?.[0] && (
                <p className="text-xs text-error mt-1">{errors.country[0]}</p>
              )}
            </div>

            {formData.country === "1" || formData.country === 1 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  State*
                </label>
                <ReactSelect
                  name="state"
                  value={stateOptions.find((s) => s.value == formData.state) || null}
                  onChange={(option) => handleChangeSelect("state", option)}
                  options={stateOptions}
                  placeholder="Choose State.."
                  isClearable
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
                {errors.state?.[0] && (
                  <p className="text-xs text-error mt-1">{errors.state[0]}</p>
                )}
              </div>
            ) : (
              <Input
                label="State*"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                error={errors.state?.[0]}
                required
              />
            )}

            {/* Contact Person Section */}
            <div className="md:col-span-2 mt-4">
              <h5 className="font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 mb-4">
                Contact person
              </h5>
            </div>

            <Input
              label="Name*"
              name="scontact"
              value={formData.scontact}
              onChange={handleChange}
              placeholder="Primary Name"
              error={errors.scontact?.[0]}
              required
            />
            <Input
              label="Phone*"
              name="sphone"
              value={formData.sphone}
              onChange={handleChange}
              placeholder="Primary Phone Number"
              error={errors.sphone?.[0]}
              required
              type="tel"
            />
            <Input
              label="E-mail"
              name="semail"
              value={formData.semail}
              onChange={handleChange}
              placeholder="Primary Email"
              type="email"
              error={errors.semail?.[0]}
            />
            <Input
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Designation"
              error={errors.designation?.[0]}
            />

            <div className="md:col-span-2 mt-4 flex justify-start">
              <Button type="submit" color="primary">
                Save Supplier
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Page>
  );
}
