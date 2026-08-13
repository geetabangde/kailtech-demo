// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";

const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.accessor((_row, index) => index + 1, {
    id: "s_no",
    header: "S No",
    cell: (info) => info.row.index + 1,
  }),

  columnHelper.accessor("meetingdate", {
    id: "meetingdate",
    header: "MOM Date",
    cell: (info) => {
      const dateStr = info.getValue();
      if (!dateStr) return "-";
      // Assuming dateStr is YYYY-MM-DD
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // d/m/Y
      }
      return dateStr;
    },
  }),

  columnHelper.accessor("mom_number", {
    id: "mom_number",
    header: "Mom Number",
    cell: (info) => info.getValue() || "-",
  }),

  columnHelper.accessor("meetingplace", {
    id: "meetingplace",
    header: "Mom Location",
    cell: (info) => info.getValue() || "-",
  }),

  columnHelper.accessor("detail", {
    id: "detail",
    header: "Mom Purpose",
    cell: (info) => info.getValue() || "-",
  }),

  columnHelper.accessor("firstname", {
    id: "firstname",
    header: "Created by",
    cell: (info) => info.getValue() || "-",
  }),

  columnHelper.accessor("status", {
    id: "status",
    header: "Status",
    cell: RowActions,
  }),

  columnHelper.accessor("completion_status", {
    id: "completion_status",
    header: "Completion Status (%)",
    cell: (info) => {
      const val = info.getValue();
      return val ? `${parseFloat(val).toFixed(2)}%` : "0%";
    },
  }),
];
