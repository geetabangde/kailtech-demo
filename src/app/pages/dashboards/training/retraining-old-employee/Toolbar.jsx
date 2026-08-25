import { useState } from "react";
import Select from "react-select";
import { Input } from "components/ui";
import clsx from "clsx";

export function Toolbar({ table, filters, onChange, onSearch }) {
  const [searchIn, setSearchIn] = useState(filters.searchin || "All");
  const [searchValue, setSearchValue] = useState(filters.value || "");

  const handleInput = (name, value) => {
    if (name === "searchin") setSearchIn(value);
    if (name === "value") setSearchValue(value);
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

  const searchOptions = [
    { value: "All", label: "All" },
    { value: "name", label: "Name" },
    { value: "mobile", label: "Personal Mobile" },
    { value: "official_mobile", label: "Official Mobile" },
    { value: "employeecode", label: "Team members code" },
  ];

  const selectedRows = table.getSelectedRowModel().rows;
  const { openInitiateMultipleModal } = table.options.meta;

  return (
    <div className="table-toolbar px-[var(--margin-x)] pt-4">
      <div
        className={clsx(
          "transition-content flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4",
        )}
      >
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-wide text-gray-800 dark:text-dark-50">
            Retraining Employee
          </h2>
        </div>
        
        {selectedRows.length > 0 && (
          <div className="flex shrink-0 space-x-2">
            <button
              onClick={() => openInitiateMultipleModal(selectedRows.map(r => r.original))}
              className="flex h-10 items-center justify-center rounded bg-emerald-600 px-6 font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              Initiate Training ({selectedRows.length})
            </button>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
        className="mb-6 space-y-4 rounded-lg bg-gray-50 p-4 shadow-sm dark:bg-dark-800"
      >
        <div className="flex items-end gap-4">
          <div className="w-64">
            <label className="dark:text-dark-300 mb-1 block text-sm font-medium text-gray-600">
              Search in :
            </label>
            <Select
              options={searchOptions}
              value={searchOptions.find((o) => o.value === searchIn)}
              onChange={(opt) => handleInput("searchin", opt ? opt.value : "All")}
              styles={selectStyles}
              classNamePrefix="react-select"
            />
          </div>
          <div className="w-72">
             <label className="dark:text-dark-300 mb-1 block text-sm font-medium text-gray-600">
              Search Value
            </label>
            <Input
              value={searchValue}
              onChange={(e) => handleInput("value", e.target.value)}
              placeholder="Search..."
              classNames={{
                input: "h-10 text-sm ring-primary-500/50 focus:ring-3",
                root: "w-full",
              }}
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
