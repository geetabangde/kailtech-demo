// Import Dependencies
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Button, Input, Select, Card } from "components/ui";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";

// PHP: if(!in_array(470, $permissions)) header("location:index.php");
function usePermissions() {
  let p = localStorage.getItem("userPermissions") || "";
  if (p.startsWith('"') && p.endsWith('"')) p = p.slice(1, -1);
  try {
    const parsed = JSON.parse(p);
    if (Array.isArray(parsed)) return parsed.map(Number);
  } catch {
    // ignore parse error, fallback below
  }
  return p.split(",").map(Number).filter(n => !isNaN(n));
}

// ----------------------------------------------------------------------

export default function AddRoleRequest() {
  const navigate = useNavigate();
  const permissions = usePermissions();

  // ── State Management ──
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    adminID: "",       // Employee Dropdown
    employeeID: "",    // Auto-filled empid
    action: "",        // Add, Modify, Delete
    rolerequest: "",   // If Add
    currentrole: "",   // If Modify
    newrole: "",       // If Modify
    additionalrole: "",// If Modify
    roleRemove: "",    // If Delete
    reason: "",        // All
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      // Assuming a generic users endpoint exists, using fallback if it doesn't
      const res = await axios.get("/users/employees"); 
      if (res.data?.data) {
         setEmployees(res.data.data);
      } else if (Array.isArray(res.data)) {
         setEmployees(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch employees.", err);
      // Fallback dummy data for development to prevent UI blockage
      setEmployees([
        { id: "1", empid: "EMP-001", firstname: "John", lastname: "Doe" },
        { id: "2", empid: "EMP-002", firstname: "Jane", lastname: "Smith" },
      ]);
    }
  };

  // ── Permission Check ──
  if (!permissions.includes(470)) {
    return (
      <Page title="Add Role Request">
        <div className="flex h-60 items-center justify-center rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Access Denied - Permission 470 required
          </p>
        </div>
      </Page>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      // Auto-fill Employee ID when adminID changes
      if (name === "adminID") {
         const emp = employees.find(e => String(e.id) === String(value));
         newData.employeeID = emp ? (emp.empid || "") : "";
      }
      
      return newData;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.adminID) newErrors.adminID = "Employee selection is required";
    if (!formData.action) newErrors.action = "Action is required";
    
    if (formData.action === "Add") {
        if (!formData.rolerequest.trim()) newErrors.rolerequest = "Role request is required";
        if (!formData.reason.trim()) newErrors.reason = "Reason is required";
    } else if (formData.action === "Modify") {
        if (!formData.currentrole.trim()) newErrors.currentrole = "Current role is required";
        if (!formData.newrole.trim()) newErrors.newrole = "New role is required";
        if (!formData.additionalrole.trim()) newErrors.additionalrole = "Additional responsibility is required";
        if (!formData.reason.trim()) newErrors.reason = "Reason is required";
    } else if (formData.action === "Delete") {
        if (!formData.roleRemove.trim()) newErrors.roleRemove = "Role to remove is required";
        if (!formData.reason.trim()) newErrors.reason = "Reason is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.post("/quality-documents/add-role-request", formData);
      toast.success("Role Request submitted successfully ✅");
      navigate("/dashboards/quality-documents/role-request");
    } catch (err) {
      console.error("Error creating role request:", err);
      toast.error(err?.response?.data?.message || "Failed to submit role request ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Add Role Request Form">
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6 border-b pb-4 dark:border-dark-600">
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50">Add Role Request</h2>
            <Button
              variant="outlined"
              onClick={() => navigate("/dashboards/quality-documents/role-request")}
            >
              &lt;&lt; Back
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name of Employee <span className="text-red-500">*</span></label>
                <Select
                  name="adminID"
                  value={formData.adminID}
                  onChange={handleChange}
                  error={errors.adminID}
                  className="w-full"
                >
                  <option value="">Select the Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstname} {emp.lastname} {emp.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID <span className="text-red-500">*</span></label>
                <Input
                  name="employeeID"
                  placeholder="Employee ID"
                  value={formData.employeeID}
                  readOnly
                  className="w-full bg-gray-50 dark:bg-dark-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action <span className="text-red-500">*</span></label>
                <Select
                  name="action"
                  value={formData.action}
                  onChange={handleChange}
                  error={errors.action}
                  className="w-full"
                >
                  <option value="">Select the Action</option>
                  <option value="Add">Add</option>
                  <option value="Modify">Modify</option>
                  <option value="Delete">Delete</option>
                </Select>
              </div>

              {formData.action === "Add" && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role request <span className="text-red-500">*</span></label>
                  <Input
                    name="rolerequest"
                    placeholder="Role Request"
                    value={formData.rolerequest}
                    onChange={handleChange}
                    error={errors.rolerequest}
                    className="w-full"
                  />
                </div>
              )}

              {formData.action === "Modify" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Role <span className="text-red-500">*</span></label>
                    <Input
                      name="currentrole"
                      placeholder="Current Role"
                      value={formData.currentrole}
                      onChange={handleChange}
                      error={errors.currentrole}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Role <span className="text-red-500">*</span></label>
                    <Input
                      name="newrole"
                      placeholder="New Role"
                      value={formData.newrole}
                      onChange={handleChange}
                      error={errors.newrole}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">If same role, Additional responsibility requested <span className="text-red-500">*</span></label>
                    <Input
                      name="additionalrole"
                      placeholder="Additional Role"
                      value={formData.additionalrole}
                      onChange={handleChange}
                      error={errors.additionalrole}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {formData.action === "Delete" && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role to Remove <span className="text-red-500">*</span></label>
                  <Input
                    name="roleRemove"
                    placeholder="Role Remove"
                    value={formData.roleRemove}
                    onChange={handleChange}
                    error={errors.roleRemove}
                    className="w-full"
                  />
                </div>
              )}

              {(formData.action === "Add" || formData.action === "Modify" || formData.action === "Delete") && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason <span className="text-red-500">*</span></label>
                  <Input
                    name="reason"
                    placeholder="Reason"
                    value={formData.reason}
                    onChange={handleChange}
                    error={errors.reason}
                    className="w-full"
                  />
                </div>
              )}

            </div>

            <div className="mt-8 pt-4 border-t dark:border-dark-600 flex justify-end">
              <Button 
                type="submit" 
                color="primary" 
                className="px-8 h-10 font-bold"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Page>
  );
}
