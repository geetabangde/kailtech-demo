// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";

const columnHelper = createColumnHelper();

export const columns = [
  // ✅ Serial Number
  columnHelper.accessor((_row, index) => index + 1, {
    id: "s_no",
    header: "Sr.no",
    cell: (info) => info.row.index + 1,
  }),

  // ✅ Name
  columnHelper.accessor("name", {
    id: "name",
    header: "Name",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ Employee id
  columnHelper.accessor("empid", {
    id: "empid",
    header: "Employee id",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ Mobile
  columnHelper.accessor("mobile", {
    id: "mobile",
    header: "Mobile",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ Email
  columnHelper.accessor("email", {
    id: "email",
    header: "Email",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ Department
  columnHelper.accessor("department", {
    id: "department",
    header: "Department",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ Status
  columnHelper.accessor("status", {
    id: "status",
    header: "Status",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ Actions
  columnHelper.display({
    id: "actions",
    header: () => <div className="text-center">Action</div>,
    cell: RowActions,
  }),
];
