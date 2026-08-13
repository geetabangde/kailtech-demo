// columns.js — Proforma Invoice List
// PHP columns: ID, Date, Proforma Invoice no, Rev, Reference No, Customer, Type, Item Total, Amount, Action

import { createColumnHelper } from "@tanstack/react-table";
import { RowActions } from "./RowActions";

const columnHelper = createColumnHelper();

// PHP: changedateformatespecito($row['added_on'], "Y-m-d H:i:s", "d/m/Y")
const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "0000-00-00") return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

// PHP: status 0=Draft, 1=Approved, 91=Revised, 99=Cancelled
const StatusBadge = ({ status }) => {
  const map = {
    0: {
      label: "Draft",
      cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    1: {
      label: "Approved",
      cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    91: {
      label: "Revised",
      cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    99: {
      label: "Cancelled",
      cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
  };
  const s = map[status] ?? {
    label: "Unknown",
    cls: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
};

export const columns = [
  // Sr. No
  columnHelper.display({
    id: "s_no",
    header: "Sr No",
    cell: (info) => info.table.getSortedRowModel().flatRows.findIndex((r) => r.id === info.row.id) + 1,
  }),

  // ID — PHP: id
  columnHelper.accessor((row) => String(row.id ?? ""), {
    id: "id",
    header: "ID",
    cell: (info) => (
      <span className="font-mono text-xs text-gray-400">
        #{info.getValue()}
      </span>
    ),
  }),

  // Date — PHP: added_on formatted
  columnHelper.accessor((row) => formatDate(row.added_on), {
    id: "added_on",
    header: "Date",
    cell: (info) => info.getValue(),
  }),

  // Proforma Invoice No + Rev — PHP: invoiceno + "/"+sprintf("%02d",rev)
  columnHelper.accessor((row) => {
    const rev = row.rev && row.rev !== 0 ? `/${String(row.rev).padStart(2, "0")}` : "";
    return `${row.invoiceno ?? ""}${rev}`;
  }, {
    id: "invoiceno",
    header: "Proforma Invoice No",
    cell: (info) => {
      const val = info.getValue();
      return (
        <span className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-400">
          {val || "—"}
        </span>
      );
    },
  }),

  // Rev
  columnHelper.accessor((row) => String(row.rev ?? 0), {
    id: "rev",
    header: "Rev",
    cell: (info) => info.getValue() || 0,
  }),

  // Reference No — PHP: inwardid
  columnHelper.accessor((row) => String(row.inwardid ?? ""), {
    id: "inwardid",
    header: "Reference No",
    cell: (info) => info.getValue() || "—",
  }),

  // Customer — PHP: customername + address
  columnHelper.accessor(
    (row) => {
      const name = row.customername || row.customer || "";
      const addr = row.address || "";
      // Normalize whitespace: trim and replace multiple spaces/newlines with a single space
      return `${name} ${addr}`.replace(/\s+/g, " ").trim();
    },
    {
      id: "customername",
      header: "Customer",
      cell: (info) => {
        const row = info.row.original;
        const name = row.customername || row.customer || "—";
        return (
          <div>
            <p className="dark:text-dark-100 text-sm font-medium text-gray-800">
              {name}
            </p>
            {row.address && (
              <p className="dark:text-dark-400 mt-0.5 max-w-xs text-xs text-gray-500">
                {row.address}
              </p>
            )}
          </div>
        );
      },
    },
  ),

  // Type — PHP: typeofinvoice
  columnHelper.accessor("typeofinvoice", {
    id: "typeofinvoice",
    header: "Type",
    cell: (info) => (
      <span className="dark:bg-dark-600 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
        {info.getValue() || "—"}
      </span>
    ),
  }),

  // Item Total — PHP: subtotal
  columnHelper.accessor((row) => row.subtotal != null ? `₹ ${parseFloat(row.subtotal).toFixed(2)}` : "", {
    id: "subtotal",
    header: "Item Total",
    cell: (info) => (
      <span className="font-mono text-sm">
        {info.getValue() || "—"}
      </span>
    ),
  }),

  // Amount — PHP: total
  columnHelper.accessor((row) => row.total != null ? `₹ ${parseFloat(row.total).toFixed(2)}` : "", {
    id: "total",
    header: "Amount",
    cell: (info) => (
      <span className="dark:text-dark-100 font-mono text-sm font-semibold text-gray-800">
        {info.getValue() || "—"}
      </span>
    ),
  }),

  // Status
  columnHelper.accessor((row) => {
    const map = { 0: "Draft", 1: "Approved", 91: "Revised", 99: "Cancelled" };
    return map[row.status] ?? "Unknown";
  }, {
    id: "status",
    header: "Status",
    cell: (info) => {
      const row = info.row.original;
      return <StatusBadge status={row.status} />;
    },
  }),

  // Actions
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
  }),
];