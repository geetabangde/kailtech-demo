// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router-dom";

const columnHelper = createColumnHelper();

const mapNotificationUrl = (url, row) => {
  if (!url) return "#";
  
  if (row?.category === "Allot user to item for Calibration") {
    const urlParams = new URLSearchParams(url.split("?")[1] || "");
    const id = urlParams.get("id") || urlParams.get("hakuna") || url.match(/\d+/)?.[0] || "";
    const caliblocation = urlParams.get("caliblocation") || "Lab";
    const calibacc = urlParams.get("calibacc") || "Nabl";
    return `/dashboards/calibration-process/inward-entry-lab/perform-calibration/${id}?caliblocation=${caliblocation}&calibacc=${calibacc}`;
  }

  if (url.includes("approvedispatch.php")) {
    const search = url.includes("?") ? url.substring(url.indexOf("?")) : "";
    return `/dashboards/inventory/din-list/approve-dispatch${search}`;
  }
  
  if (url.includes("viewInvoiceCalibration.php")) {
    const urlParams = new URLSearchParams(url.split("?")[1] || "");
    const id = urlParams.get("matata");
    if (id) return `/dashboards/accounts/testing-invoices/view/${id}`;
    return `/dashboards/accounts/testing-invoices`;
  }
  
  if (url.includes("paymentapproval.php")) {
    return "/dashboards/approvals";
  }

  return `/${url}`;
};

export const columns = [
  // S. No.
  columnHelper.accessor((_row, index) => index + 1, {
    id: "s_no",
    header: "S. No.",
    cell: (info) => info.row.index + 1,
  }),

  // Date Time (When)
  columnHelper.accessor("formatted_added_on", {
    id: "formatted_added_on",
    header: "Date Time (When)",
    cell: (info) => info.getValue() || "-",
  }),

  // Category
  columnHelper.accessor("category", {
    id: "category",
    header: "Category",
    cell: (info) => info.getValue() || "-",
  }),

  // Activities (What)
  columnHelper.accessor("task", {
    id: "task",
    header: "Activities (What)",
    cell: (info) => info.getValue() || "-",
  }),

  // Department
  columnHelper.accessor("department", {
    id: "department",
    header: "Department",
    cell: (info) => info.getValue() || "-",
  }),

  // Lab
  columnHelper.accessor("labname", {
    id: "labname",
    header: "Lab",
    cell: (info) => info.getValue() || "-",
  }),

  // Employee Name & Code(Who)
  columnHelper.accessor("employee_name_code", {
    id: "employee",
    header: "Employee Name & Code(Who)",
    cell: (info) => info.getValue() || "-",
  }),

  // Action
  columnHelper.accessor("url", {
    id: "action",
    header: "Action",
    cell: (info) => {
      const url = info.getValue();
      const row = info.row.original;
      return (
        <Link 
          to={mapNotificationUrl(url, row)} 
          className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 text-xs font-semibold uppercase tracking-wide"
        >
          Go
        </Link>
      );
    },
  }),
];
