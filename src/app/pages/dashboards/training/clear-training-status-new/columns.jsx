import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router-dom";

const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.display({
    id: "selection",
    header: ({ table }) => (
      <input
        type="checkbox"
        {...{
          checked: table.getIsAllRowsSelected(),
          indeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler(),
        }}
        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 dark:border-dark-600 dark:bg-dark-800"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        {...{
          checked: row.getIsSelected(),
          disabled: !row.getCanSelect(),
          indeterminate: row.getIsSomeSelected(),
          onChange: row.getToggleSelectedHandler(),
        }}
        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600 dark:border-dark-600 dark:bg-dark-800"
      />
    ),
  }),
  columnHelper.accessor("srNo", {
    header: "Sr No",
    cell: (info) => <span className="text-sm font-medium">{info.row.index + 1}</span>,
  }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => {
      const row = info.row.original;
      return (
        <Link 
          to={`/view-employee-joining-form/${row.id}`} 
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          {row.firstname} {row.lastname}
        </Link>
      );
    },
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => <span className="text-sm">{info.getValue()}</span>,
  }),
  columnHelper.accessor("mobile", {
    header: "Mobile No",
    cell: (info) => <span className="text-sm">{info.getValue()}</span>,
  }),
  columnHelper.accessor("empid", {
    header: "Team members code",
    cell: (info) => <span className="text-sm">{info.getValue()}</span>,
  }),
  columnHelper.display({
    id: "status",
    header: "Status",
    cell: (info) => {
      const row = info.row.original;
      const { openClearStatusModal } = info.table.options.meta;
      return (
        <button
          onClick={() => openClearStatusModal(row)}
          className="inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-bold transition bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400"
        >
          <span>Pass</span>
        </button>
      );
    },
  }),
];
