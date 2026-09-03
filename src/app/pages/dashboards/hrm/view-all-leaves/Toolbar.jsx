// Import Dependencies
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "utils/axios";

import { Button, Input } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";

// ----------------------------------------------------------------------

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "0", label: "Pending" },
  { value: "1", label: "Approved" },
  { value: "2", label: "Rejected" },
];

export function Toolbar({ table }) {
  const { isDark } = useThemeContext();
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    employee: "",
    status: "",
    dstart: "",
    dend: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/hrm/active-employee-list");
      if (response.data.status && Array.isArray(response.data.data)) {
        setEmployees(
          response.data.data.map((emp) => ({
            value: String(emp.id),
            label:
              emp.name ||
              `${emp.firstname || ""} ${emp.lastname || ""}`.trim() ||
              `Employee #${emp.id}`,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleSelectChange = (field, option) => {
    setFilters((prev) => ({
      ...prev,
      [field]: option ? option.value : "",
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    table.options.meta?.fetchData?.(filters);
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "36px",
      height: "36px",
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
      borderColor: state.isFocused
        ? "#3b82f6"
        : isDark
          ? "#334155"
          : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
      borderRadius: "0.375rem",
      fontSize: "0.875rem",
    }),
    valueContainer: (base) => ({
      ...base,
      height: "36px",
      padding: "0 8px",
    }),
    input: (base) => ({
      ...base,
      margin: "0px",
      color: isDark ? "#f1f5f9" : "#1f2937",
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? "#f1f5f9" : "#1f2937",
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? "#94a3b8" : "#9ca3af",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
      borderColor: isDark ? "#334155" : "#e5e7eb",
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
          ? isDark
            ? "#334155"
            : "#f3f4f6"
          : "transparent",
      color: state.isSelected
        ? "#ffffff"
        : isDark
          ? "#f1f5f9"
          : "#1f2937",
      fontSize: "0.875rem",
      cursor: "pointer",
    }),
  };

  const allEmployeeOptions = [
    { value: "", label: "All Employees" },
    ...employees,
  ];

  const selectedEmployeeOption =
    allEmployeeOptions.find((opt) => opt.value === String(filters.employee)) || {
      value: "",
      label: "All Employees",
    };

  const selectedStatusOption =
    statusOptions.find((opt) => opt.value === String(filters.status)) || {
      value: "",
      label: "All Statuses",
    };

  const handleReset = () => {
    const emptyFilters = {
      employee: "",
      status: "",
      dstart: "",
      dend: "",
    };
    setFilters(emptyFilters);
    table.options.meta?.fetchData?.(emptyFilters);
  };

  return (
    <div className="table-toolbar px-[var(--margin-x)] pt-4">
      <div className="flex flex-col gap-4 mb-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-wide text-gray-800 dark:text-dark-50">
            View All Leaves
          </h2>
        </div>

        {/* Filters Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-dark-200">
              Employee
            </label>
            <Select
              options={allEmployeeOptions}
              value={selectedEmployeeOption}
              onChange={(opt) => handleSelectChange("employee", opt)}
              styles={customSelectStyles}
              isSearchable
              menuPortalTarget={document.body}
              placeholder="Select Employee..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-dark-200">
              Status
            </label>
            <Select
              options={statusOptions}
              value={selectedStatusOption}
              onChange={(opt) => handleSelectChange("status", opt)}
              styles={customSelectStyles}
              isSearchable={false}
              menuPortalTarget={document.body}
              placeholder="Select Status..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-dark-200">
              Start Date
            </label>
            <Input
              type="date"
              name="dstart"
              value={filters.dstart}
              onChange={handleInputChange}
              classNames={{ input: "h-9 text-sm" }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-dark-200">
              End Date
            </label>
            <Input
              type="date"
              name="dend"
              value={filters.dend}
              onChange={handleInputChange}
              classNames={{ input: "h-9 text-sm" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            color="primary"
            onClick={handleSearch}
            className="flex items-center gap-2"
          >
            <FunnelIcon className="size-4" />
            Go / Search
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 dark:text-dark-200 dark:hover:bg-dark-700"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="flex shrink-0 space-x-2 border-t pt-4 dark:border-dark-500">
        <SearchInput table={table} />
      </div>
    </div>
  );
}

function SearchInput({ table }) {
  return (
    <Input
      value={table.getState().globalFilter}
      onChange={(e) => table.setGlobalFilter(e.target.value)}
      prefix={<MagnifyingGlassIcon className="size-4" />}
      classNames={{
        input: "h-9 text-sm ring-primary-500/50 focus:ring-3 w-64",
        root: "shrink-0",
      }}
      placeholder="Search in results..."
    />
  );
}
