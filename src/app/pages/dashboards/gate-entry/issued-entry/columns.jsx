// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "components/ui";

const columnHelper = createColumnHelper();

export const columns = [
  // ✅ ID
  columnHelper.accessor("id", {
    id: "id",
    header: "ID",
    cell: (info) => info.getValue(),
  }),

  // ✅ Date
  columnHelper.accessor("entry_date", {
    id: "entry_date",
    header: "Date",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return "N/A";
      const parts = val.split(" ");
      if (parts.length > 1) {
        return (
          <div className="flex flex-col">
            <span>{parts[0]}</span>
            <span className="text-sm text-gray-500">{parts.slice(1).join(" ")}</span>
          </div>
        );
      }
      return val;
    },
  }),

  // ✅ Purpose
  columnHelper.accessor("purpose", {
    id: "purpose",
    header: "Purpose",
    cell: (info) => info.getValue() || "N/A",
  }),

  // ✅ Description
  columnHelper.accessor("description", {
    id: "description",
    header: "Description",
    cell: (info) => (
      <div className="whitespace-normal break-words max-w-[200px]">
        {info.getValue() || "N/A"}
      </div>
    ),
  }),

  // ✅ Quantity
  columnHelper.accessor("quantity", {
    id: "quantity",
    header: "Quantity",
    cell: (info) => info.getValue() || "N/A",
  }),

  // ✅ Source
  columnHelper.accessor("source", {
    id: "source",
    header: "Source",
    cell: (info) => info.getValue() || "N/A",
  }),

  // ✅ Issued To
  columnHelper.accessor("employee_name", {
    id: "employee_name",
    header: "Issued To",
    cell: (info) => info.getValue() || "N/A",
  }),

  // ✅ Status
  columnHelper.accessor("status_text", {
    id: "status_text",
    header: "Status",
    cell: (info) => {
      const status = info.row.original.status;
      let color = "secondary";
      if (status === "1") color = "primary"; // Alloted
      if (status === "2") color = "success"; // Lrn Done

      return (
        <Badge variant="soft" color={color}>
          {info.getValue() || "N/A"}
        </Badge>
      );
    },
  }),
];
