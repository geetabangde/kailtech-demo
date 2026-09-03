// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";

// Local Imports
import { RowActions } from "./RowActions";

const columnHelper = createColumnHelper();

/**
 * Safe date formatting helper to prevent "30/11/1899" or invalid dates for "0000-00-00" / null
 */
const formatDateSafe = (dateVal, format = "DD/MM/YYYY") => {
  if (
    !dateVal ||
    dateVal === "0000-00-00" ||
    dateVal === "0000-00-00 00:00:00" ||
    dateVal === "null" ||
    dateVal === "undefined" ||
    String(dateVal).trim() === ""
  ) {
    return "-";
  }

  const parsed = dayjs(dateVal);
  if (!parsed.isValid() || parsed.year() < 1970) {
    return "-";
  }

  return parsed.format(format);
};

export const columns = [
  // ✅ Serial Number
  columnHelper.accessor((_row, index) => index + 1, {
    id: "s_no",
    header: "Sr No",
    cell: (info) => info.row.index + 1,
  }),

  // ✅ User Name
  columnHelper.accessor("username", {
    id: "username",
    header: "User Name",
    cell: (info) => info.getValue() || "—",
  }),

  // ✅ Leave Type
  columnHelper.accessor("leave_type_label", {
    id: "leave_type",
    header: "Leave Type",
    cell: (info) => info.getValue() || "—",
  }),

  // ✅ Compoff Date
  columnHelper.accessor("compoffdate", {
    id: "compoffdate",
    header: "Compoff Date",
    cell: (info) => formatDateSafe(info.getValue()),
  }),

  // ✅ Start Date
  columnHelper.accessor("startdate", {
    id: "startdate",
    header: "Start Date",
    cell: (info) => formatDateSafe(info.getValue()),
  }),

  // ✅ End Date
  columnHelper.accessor("enddate", {
    id: "enddate",
    header: "End Date",
    cell: (info) => formatDateSafe(info.getValue()),
  }),

  // ✅ Reason
  columnHelper.accessor("reason", {
    id: "reason",
    header: "Reason",
    cell: (info) => info.getValue() || "—",
  }),

  // ✅ Applied On
  columnHelper.accessor("added_on", {
    id: "applied_on",
    header: "Applied On",
    cell: (info) => formatDateSafe(info.getValue(), "DD/MM/YYYY HH:mm:ss"),
  }),

  // ✅ Approved At
  columnHelper.accessor("approved_on", {
    id: "approved_at",
    header: "Approved At",
    cell: (info) => {
      const { status } = info.row.original;
      return status != 0 ? formatDateSafe(info.getValue(), "DD/MM/YYYY HH:mm:ss") : "-";
    },
  }),

  // ✅ Approved By
  columnHelper.accessor("approved_by_name", {
    id: "approved_by",
    header: "Approved By",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ Status
  columnHelper.accessor("status_label", {
    id: "status",
    header: "Status",
    cell: (info) => {
      const status = info.row.original.status;
      if (status == 1) return <span className="text-success font-semibold">Approved</span>;
      if (status == 2) return <span className="text-danger font-semibold">Rejected</span>;
      return <span className="text-warning font-semibold">Pending</span>;
    },
  }),

  // ✅ Actions
  columnHelper.display({
    id: "actions",
    header: () => <div className="text-center">Action</div>,
    cell: RowActions,
  }),
];
