// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";

export const parseDateToTime = (dateStr) => {
  if (!dateStr) return 0;
  if (typeof dateStr !== "string") return new Date(dateStr).getTime() || 0;

  const trimmed = dateStr.trim();
  const match = trimmed.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
  );
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    const hour = match[4] ? parseInt(match[4], 10) : 0;
    const min = match[5] ? parseInt(match[5], 10) : 0;
    const sec = match[6] ? parseInt(match[6], 10) : 0;
    return new Date(year, month, day, hour, min, sec).getTime() || 0;
  }

  const parsed = new Date(trimmed).getTime();
  return isNaN(parsed) ? 0 : parsed;
};

const columnHelper = createColumnHelper();
export const columns = [
  // Sr. No
  columnHelper.accessor((_row, index) => index + 1, {
    id: "s_no",
    header: "S.NO",
    size: 60,
    cell: (info) => info.row.index + 1,
    enableColumnFilter: false,
  }),

  // LRN
  columnHelper.accessor("lrn", {
    id: "lrn",
    header: "LRN",
    size: 110,
    cell: (info) => (
      <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
        {info.getValue() ?? "—"}
      </span>
    ),
    filterFn: "includesString",
  }),

  // Date
  columnHelper.accessor("added_on", {
    id: "added_on",
    header: "Date",
    size: 100,
    cell: (info) => info.getValue() ?? "—",
    filterFn: "includesString",
    sortingFn: (rowA, rowB, columnId) => {
      const timeA = parseDateToTime(rowA.getValue(columnId));
      const timeB = parseDateToTime(rowB.getValue(columnId));
      return timeA - timeB;
    },
  }),

  // Product
  columnHelper.accessor("product", {
    id: "product",
    header: "Product",
    size: 250,
    cell: (info) => (
      <span className="block w-full whitespace-normal text-xs leading-tight">
        {info.getValue() ?? "—"}
      </span>
    ),
    filterFn: "includesString",
  }),

  // Department — PHP: labs name
  columnHelper.accessor("department", {
    id: "department",
    header: "Department",
    size: 120,
    cell: (info) => info.getValue() ?? "—",
    filterFn: "includesString",
  }),

  // Package
  columnHelper.accessor("package", {
    id: "package",
    header: "Package",
    size: 250,
    cell: (info) => (
      <span className="block w-full whitespace-normal text-xs leading-tight">
        {info.getValue() ?? "—"}
      </span>
    ),
    filterFn: "includesString",
  }),

  // Quantity
  columnHelper.accessor("quantity", {
    id: "quantity",
    header: "Qty",
    size: 60,
    cell: (info) => info.getValue() ?? "—",
    filterFn: "includesString",
  }),

  // Customer Type — shown when perm 389
  columnHelper.accessor("ctype_name", {
    id: "ctype_name",
    header: () => <span className="text-xs">Customer <br />Type</span>,
    size: 140,
    cell: (info) => (
      <span className="block w-full whitespace-normal text-xs leading-tight">
        {info.getValue() ?? "—"}
      </span>
    ),
    filterFn: "includesString",
  }),

  // Specific Purpose — shown when perm 390
  columnHelper.accessor("specificpurpose_name", {
    id: "specificpurpose_name",
    header: () => <span className="text-xs">Specific <br />Purpose</span>,
    size: 140,
    cell: (info) => (
      <span className="block w-full whitespace-normal text-xs leading-tight">
        {info.getValue() ?? "—"}
      </span>
    ),
    filterFn: "includesString",
  }),

  // Action — Accept button
  columnHelper.display({
    id: "actions",
    header: "Action",
    size: 80,
    cell: RowActions,
    enableColumnFilter: false,
  }),
];