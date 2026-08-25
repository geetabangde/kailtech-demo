import { useState } from "react";
import Select from "react-select";
import { DatePicker } from "components/shared/form/Datepicker";
import clsx from "clsx";

export function Toolbar({ filters, onChange, onSearch, departments = [] }) {
  const [startDate, setStartDate] = useState(filters.date || "");
  const [endDate, setEndDate] = useState(filters.enddate || "");
  const [department, setDepartment] = useState(filters.department || "");

  const handleInput = (name, value) => {
    if (name === "date") setStartDate(value);
    if (name === "enddate") setEndDate(value);
    if (name === "department") setDepartment(value);
    onChange(name, value);
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "40px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.3)" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
      },
    }),
  };

  return (
    <div className="table-toolbar px-[var(--margin-x)] pt-4">
      <div
        className={clsx(
          "transition-content flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4",
        )}
      >
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-wide text-gray-800 dark:text-dark-50">
            Training Schedule
          </h2>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
        className="mb-6 space-y-4 rounded-lg bg-gray-50 p-4 shadow-sm dark:bg-dark-800"
      >
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          <div>
            <label className="dark:text-dark-300 mb-1 block text-sm font-medium text-gray-600">
              Department
            </label>
            <Select
              options={[
                { value: "All", label: "All" },
                ...departments.map((d) => ({
                  value: String(d.id),
                  label: d.name || String(d.id),
                })),
              ]}
              value={
                department
                  ? department === "All"
                    ? { value: "All", label: "All" }
                    : {
                        value: String(department),
                        label:
                          departments.find((d) => String(d.id) === String(department))?.name ||
                          String(department),
                      }
                  : null
              }
              onChange={(opt) => handleInput("department", opt ? opt.value : "")}
              isClearable
              placeholder="Select Department"
              styles={selectStyles}
              classNamePrefix="react-select"
            />
          </div>
          <div>
            <label className="dark:text-dark-300 mb-1 block text-sm font-medium text-gray-600">
              Start Date
            </label>
            <DatePicker
              options={{ dateFormat: "Y-m-d", allowInput: true }}
              value={startDate}
              onChange={(_dates, str) => handleInput("date", str)}
              placeholder="Start Date"
              className="h-10 w-full rounded border border-gray-300 px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-dark-500 dark:bg-dark-900"
            />
          </div>
          <div>
            <label className="dark:text-dark-300 mb-1 block text-sm font-medium text-gray-600">
              End Date
            </label>
            <DatePicker
              options={{ dateFormat: "Y-m-d", allowInput: true }}
              value={endDate}
              onChange={(_dates, str) => handleInput("enddate", str)}
              placeholder="End Date"
              className="h-10 w-full rounded border border-gray-300 px-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-dark-500 dark:bg-dark-900"
            />
          </div>
          <div>
            <button
              type="submit"
              className="flex h-10 items-center justify-center rounded bg-blue-600 px-6 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              Go
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
