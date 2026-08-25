// Import Dependencies
import { useState } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router";
import Select from "react-select";
import { DatePicker } from "components/shared/form/Datepicker";

export function Toolbar({ filters, onChange, onSearch, onExport, customers = [], bdList = [], customerTypes = [] }) {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(filters.startdate || "");
  const [endDate, setEndDate] = useState(filters.enddate || "");
  const [customer, setCustomer] = useState(filters.customerid || "");
  const [bd, setBd] = useState(filters.bd || "");
  const [typeOfInvoice, setTypeOfInvoice] = useState(filters.typeofinvoice || "");
  const [customerType, setCustomerType] = useState(filters.customertype || "");

  const handleInput = (name, value) => {
    if (name === "startdate") setStartDate(value);
    if (name === "enddate") setEndDate(value);
    if (name === "customerid") setCustomer(value);
    if (name === "bd") setBd(value);
    if (name === "typeofinvoice") setTypeOfInvoice(value);
    if (name === "customertype") setCustomerType(value);
    onChange(name, value);
  };

  return (
    <div className="px-[var(--margin-x)] pt-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold tracking-wide text-gray-800 dark:text-dark-50">
          Invoice List
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 active:bg-green-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 16l2-3-2-3H10l1.25 2L12.5 10H14l-2 3 2 3h-1.5l-1.25-2L10 16H8.5z"/>
            </svg>
            Download Excel
          </button>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex w-fit items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            &laquo; Back
          </button>
        </div>
      </div>

      {/* Filter row — matches PHP form layout */}
      <form
        onSubmit={onSearch}
        className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto]"
      >
        {/* Start Date */}
        <DatePicker
          autoComplete="off"
          name="invoice_start_date_no_autofill"
          options={{
            dateFormat: "d/m/Y",
            allowInput: true,
            maxDate: endDate || "today", // Start date cannot be after today OR selected End Date
          }}
          value={startDate}
          onChange={(dates, dateStr) => handleInput("startdate", dateStr)}
          placeholder="Start Date"
          className={clsx(
            "h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none dark:border-dark-500 dark:bg-dark-800 dark:text-dark-100",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
          )}
        />

        {/* End Date */}
        <DatePicker
          autoComplete="off"
          name="invoice_end_date_no_autofill"
          options={{
            dateFormat: "d/m/Y",
            allowInput: true,
            minDate: startDate, // End date cannot be before selected Start Date
            maxDate: "today",   // End date cannot be in the future
          }}
          value={endDate}
          onChange={(dates, dateStr) => handleInput("enddate", dateStr)}
          placeholder="End Date"
          className={clsx(
            "h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none dark:border-dark-500 dark:bg-dark-800 dark:text-dark-100",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
          )}
        />



        {/* Customer — using react-select to match AddCreditNote.jsx */}
        <Select
          options={customers
            .filter((c) => {
              if (!customerType) return true;
              const types = c.customertype ? String(c.customertype).split(",") : [];
              return types.includes(String(customerType));
            })
            .map((c) => ({
              value: String(c.id || c.customerid || c.customer_id),
              label: c.name || c.customername || c.customer_name || String(c.id || c.customerid || c.customer_id),
            }))}
          value={
            customer
              ? {
                value: String(customer),
                label: (() => {
                  const found = customers.find(
                    (c) => String(c.id || c.customerid || c.customer_id) === String(customer)
                  );
                  return found
                    ? found.name || found.customername || found.customer_name || String(found.id || found.customerid || found.customer_id)
                    : String(customer);
                })(),
              }
              : null
          }
          onChange={(option) => {
            handleInput("customerid", option ? option.value : "");
          }}
          isClearable
          isSearchable
          placeholder="Customer"
          classNamePrefix="react-select"
          className="w-full text-sm"
          styles={{
            control: (base, state) => ({
              ...base,
              minHeight: "40px",
              borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
              boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.3)" : "none",
              "&:hover": {
                borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
              },
            }),
          }}
        />

        {/* Customer Type */}
        <Select
          options={customerTypes.map((t) => ({
            value: String(t.id),
            label: t.name,
          }))}
          value={
            customerType
              ? {
                value: String(customerType),
                label: (() => {
                  const found = customerTypes.find((t) => String(t.id) === String(customerType));
                  return found ? found.name : String(customerType);
                })(),
              }
              : null
          }
          onChange={(option) => {
            handleInput("customertype", option ? option.value : "");
          }}
          isClearable
          isSearchable
          placeholder="Customer Type"
          classNamePrefix="react-select"
          className="w-full text-sm"
          styles={{
            control: (base, state) => ({
              ...base,
              minHeight: "40px",
              borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
              boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.3)" : "none",
              "&:hover": {
                borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
              },
            }),
          }}
        />

        {/* BD — using react-select for consistency */}
        <Select
          options={bdList.map((b) => ({
            value: String(b.id),
            label: `${b.firstname} ${b.lastname}`,
          }))}
          value={
            bd
              ? {
                value: String(bd),
                label: (() => {
                  const found = bdList.find((b) => String(b.id) === String(bd));
                  return found ? `${found.firstname} ${found.lastname}` : String(bd);
                })(),
              }
              : null
          }
          onChange={(option) => {
            handleInput("bd", option ? option.value : "");
          }}
          isClearable
          isSearchable
          placeholder="BD"
          classNamePrefix="react-select"
          className="w-full text-sm"
          styles={{
            control: (base, state) => ({
              ...base,
              minHeight: "40px",
              borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
              boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.3)" : "none",
              "&:hover": {
                borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
              },
            }),
          }}
        />

        {/* Invoice Type — using react-select for consistency */}
        <Select
          options={[
            { value: "Calibration", label: "Calibration" },
            { value: "Testing", label: "Testing" },
          ]}
          value={
            typeOfInvoice
              ? { value: typeOfInvoice, label: typeOfInvoice }
              : null
          }
          onChange={(option) => {
            handleInput("typeofinvoice", option ? option.value : "");
          }}
          isClearable
          isSearchable
          placeholder="Type"
          classNamePrefix="react-select"
          className="w-full text-sm"
          styles={{
            control: (base, state) => ({
              ...base,
              minHeight: "40px",
              borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
              boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.3)" : "none",
              "&:hover": {
                borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
              },
            }),
          }}
        />

        {/* Search button */}
        <button
          type="submit"
          className="h-10 rounded bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
      </form>
    </div>
  );
}