// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router-dom";
const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.accessor("id", {
    id: "id",
    header: "ID",
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor("gatpassnumber", {
    id: "gatepass_no",
    header: "Gatepass Number",
    cell: ({ row, getValue }) => {
      const val = getValue();
      if (!val) return "N/A";
      // Fallback to dinid from the row if available, otherwise just render the text
      const dinid = row.original.dinid; 
      if (dinid) {
        return (
          <Link
            to={`/dashboards/inventory/din-list/view-din-form?hakuna=${dinid}`}
            target="_blank"
            className="text-primary-600 hover:underline"
          >
            {val}
          </Link>
        );
      }
      return val;
    },
  }),

  columnHelper.accessor("dinpname", {
    id: "purpose_name",
    header: "Purpose",
    cell: (info) => info.getValue() || "N/A",
  }),

  columnHelper.accessor("instname", {
    id: "name",
    header: "Name",
    cell: (info) => info.getValue() || "N/A",
  }),

  columnHelper.accessor("challanno", {
    id: "challan_no",
    header: "Challan No",
    cell: (info) => info.getValue() || "N/A",
  }),

  columnHelper.accessor("sample_return", {
    id: "sample_return",
    header: "Sample Return",
    cell: (info) => info.getValue() || "N/A",
  }),

  columnHelper.accessor("returnon", {
    id: "return_on",
    header: "Return On",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return "N/A";
      // Assuming val is like "2026-03-30 15:38:34"
      const datePart = val.split(" ")[0];
      const parts = datePart.split("-");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return val;
    },
  }),

];
