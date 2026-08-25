import { createColumnHelper } from "@tanstack/react-table";


const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.display({
    id: "selection",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      />
    ),
  }),
  columnHelper.accessor((row, index) => index + 1, {
    id: "srNo",
    header: "Sr No",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("firstname", {
    header: "Name",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("mobile", {
    header: "Mobile No",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("official_mobileno", {
    header: "Official mobile",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("empid", {
    header: "Team members code",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("added_on", {
    header: "Working Since",
    cell: (info) => {
      const addedOnStr = info.getValue();
      if (!addedOnStr) return "-";
      
      const addedOnDate = new Date(addedOnStr);
      const now = new Date();
      
      const totalMonths = (now.getFullYear() - addedOnDate.getFullYear()) * 12 + now.getMonth() - addedOnDate.getMonth();
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;
      
      return `${years} years ${months} months`;
    },
  }),
  columnHelper.display({
    id: "status",
    header: "Status",
    cell: () => (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-500">
        Current
      </span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: ({ row, table }) => {
      const { openInitiateModal, openActivateOldModal } = table.options.meta;
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openInitiateModal(row.original)}
            className="inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-bold transition bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
          >
            <span>Initiate Training</span>
          </button>
          <button
            onClick={() => openActivateOldModal(row.original)}
            className="inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-bold transition bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 whitespace-nowrap"
          >
            <span>Activate Training old</span>
          </button>
        </div>
      );
    },
  }),
];
