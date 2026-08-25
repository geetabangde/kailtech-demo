import { createColumnHelper } from "@tanstack/react-table";
import { RowActions } from "./RowActions";

const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.accessor((row, index) => index + 1, {
    id: "srNo",
    header: "Sr No",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => `${row.firstname || ""} ${row.lastname || ""}`.trim(), {
    id: "name",
    header: "Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("empid", {
    header: "Team members code",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue();
      let badgeClass = "bg-gray-100 text-gray-800 dark:bg-dark-800 dark:text-gray-300";
      let statusStr = "Unknown";
      
      if (String(status) === "2") {
        statusStr = "Pass";
        badgeClass = "bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-500";
      } else if (String(status) === "90") {
        statusStr = "Fail";
        badgeClass = "bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-500";
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
