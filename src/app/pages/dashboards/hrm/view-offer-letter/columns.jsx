// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { Badge } from "components/ui";
import { RowActions } from "./RowActions";

const columnHelper = createColumnHelper();

// Safe property access helpers for API response flexibility
const getVal = (val) => val || "";

const getBranchName = (row) => {
  if (row.branch && typeof row.branch === "object") return row.branch.name || "";
  return row.branch_name || row.branch || "";
};

const getCandidateName = (row) => {
  if (row.name) return row.name;
  const parts = [
    row.prefix,
    row.firstname,
    row.middlename,
    row.lastname,
  ].filter(Boolean);
  return parts.join(" ") || "—";
};

export const columns = [
  // Sr.no
  columnHelper.accessor((_row, index) => index + 1, {
    id: "s_no",
    header: "Sr.no",
    cell: (info) => info.row.index + 1,
  }),

  // Name
  columnHelper.accessor((row) => getCandidateName(row), {
    id: "name",
    header: "Name",
    cell: (info) => info.getValue(),
  }),

  // Mobile
  columnHelper.accessor("mobile", {
    id: "mobile",
    header: "Mobile",
    cell: (info) => getVal(info.getValue()),
  }),

  // Email
  columnHelper.accessor("email", {
    id: "email",
    header: "Email",
    cell: (info) => getVal(info.getValue()),
  }),

  // Branch
  columnHelper.accessor((row) => getBranchName(row), {
    id: "branch",
    header: "Branch",
    cell: (info) => info.getValue(),
  }),

  // Status
  columnHelper.accessor("status", {
    id: "status",
    header: "Status",
    cell: (info) => {
      const status = String(info.getValue() || "").toLowerCase();
      
      if (status.includes("accept") || status.includes("active") || status.includes("joined") || status === "1" || status === "approved") {
        return (
          <Badge className="rounded-full" color="success" variant="soft">
            {info.getValue() || "Active"}
          </Badge>
        );
      }
      if (status.includes("reject") || status.includes("cancel") || status === "-1") {
        return (
          <Badge className="rounded-full" color="error" variant="soft">
            {info.getValue() || "Rejected"}
          </Badge>
        );
      }
      return (
        <Badge className="rounded-full" color="warning" variant="soft">
          {info.getValue() || "Pending"}
        </Badge>
      );
    },
  }),

  // Action
  columnHelper.display({
    id: "actions",
    header: () => <div className="text-center">Action</div>,
    cell: RowActions,
  }),
];
