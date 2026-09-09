// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";


const columnHelper = createColumnHelper();

export const columns = [

  // ✅ Serial Number
  columnHelper.accessor((_row, index) => index + 1, {
    id: "s_no",
    header: "S No",
    cell: (info) => info.row.index + 1,
  }),

  // ✅ Mode Name (from API)
  columnHelper.accessor("name", {
    id: "name",
    header: "Name",
    cell: (info) => info.getValue(),
  }),
  // ✅ Alloted Users
  columnHelper.accessor("user_names", {
    id: "user_names",
    header: "Alloted Users",
    cell: (info) => (
      <div className="max-w-[250px] whitespace-normal break-words text-[11px] leading-tight pr-2">
        {info.getValue() || "-"}
      </div>
    ),
  }),
  // ✅ Alloted Masters
  columnHelper.accessor("master_names", {
    id: "master_names",
    header: "Alloted Masters",
    cell: (info) => (
      <div className="max-w-[400px] whitespace-normal break-words text-[11px] leading-tight pr-2">
        {info.getValue() || "-"}
      </div>
    ),
  }),
  // ✅ Actions
  columnHelper.display({
    id: "actions",
    header: () => <div className="text-center w-full">Actions</div>,
    cell: RowActions,
  }),
];