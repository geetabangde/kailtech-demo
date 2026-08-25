import { createColumnHelper } from "@tanstack/react-table";
import { RowActions } from "./RowActions";

const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.accessor((row, index) => index + 1, {
    id: "srNo",
    header: "Sr.no",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => `${row.prefix || ""} ${row.firstname || ""} ${row.lastname || ""}`.trim(), {
    id: "name",
    header: "Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("empid", {
    header: "Employee id",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("mobile", {
    header: "Mobile",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("dname", {
    header: "Department",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("status_text", { // Assuming the backend returns 'status_text' for the status label
    header: "Status",
    cell: (info) => {
      const statusStr = info.getValue() || "Unknown";
      let badgeClass = "bg-gray-100 text-gray-800 dark:bg-dark-800 dark:text-gray-300";
      
      // Basic badge colors depending on the text (can be updated)
      if (statusStr.toLowerCase().includes("pending")) {
        badgeClass = "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-500";
      } else if (statusStr.toLowerCase().includes("started") || statusStr.toLowerCase().includes("in training")) {
        badgeClass = "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-500";
      }
      
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
          {statusStr}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: ({ row, table }) => <RowActions row={row} table={table} />,
  }),
];
