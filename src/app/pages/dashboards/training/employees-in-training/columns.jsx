import { createColumnHelper } from "@tanstack/react-table";
import dayjs from "dayjs";

const columnHelper = createColumnHelper();

const statusLabels = {
  1: "Waiting For Approval",
  2: "Not Started Training Yet",
  3: "In Training",
  4: "Requested For Practical Trainer",
  5: "In Practical Training",
};

export const columns = [
  columnHelper.display({
    id: "selection",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        className="size-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="size-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    ),
  }),
  columnHelper.accessor((row, index) => index + 1, {
    id: "srNo",
    header: "Sr No",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => `${row.firstname || ""} ${row.lastname || ""}`.trim(), {
    id: "name",
    header: "Name",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("mobile", {
    header: "Mobile No",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("empid", {
    header: "Team members code",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("departmentName", {
    header: "Department",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("tnistatus", {
    header: "Status",
    cell: (info) => {
      const val = info.getValue();
      const label = statusLabels[val] || "Unknown";
      let badgeClass = "bg-gray-100 text-gray-800";
      
      if (val === 1) badgeClass = "bg-amber-100 text-amber-800";
      else if (val === 3 || val === 5) badgeClass = "bg-blue-100 text-blue-800";
      else if (val === 2) badgeClass = "bg-red-100 text-red-800";
      
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass} dark:bg-opacity-20`}>
          {label}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: ({ row, table }) => {
      const { meta } = table.options;
      const tniStatus = Number(row.original.tnistatus);
      const today = dayjs().startOf('day');
      const unblockTill = dayjs(row.original.unblocktill);
      
      const showView = tniStatus > 2 || tniStatus === 1;
      const showUnblockAndRemove = (tniStatus === 3 || tniStatus === 2) && unblockTill.isBefore(today);

      return (
        <div className="flex flex-col gap-2">
          {showView ? (
            <button
              onClick={() => meta?.openViewModal(row.original)}
              className="inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-bold transition bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400"
            >
              <span>View</span>
            </button>
          ) : (
            <button
              onClick={() => meta?.onCancelTraining(row.original)}
              className="inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-bold transition bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
            >
              <span>Cancel training</span>
            </button>
          )}

          {showUnblockAndRemove && (
            <>
              <button
                onClick={() => meta?.onUnblockTraining(row.original)}
                className="inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-bold transition bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
              >
                <span>Unblock training</span>
              </button>
              <button
                onClick={() => meta?.onRemoveTraining(row.original)}
                className="inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-bold transition bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
              >
                <span>Remove Training</span>
              </button>
            </>
          )}
        </div>
      );
    },
  }),
];
