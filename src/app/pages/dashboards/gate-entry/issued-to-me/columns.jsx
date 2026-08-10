// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";
import { EditableRemarkCell } from "./EditableRemarkCell";
import dayjs from "dayjs";

const columnHelper = createColumnHelper();

export const columns = [
  // ✅ ID
  columnHelper.accessor("id", {
    id: "id",
    header: "ID",
    cell: (info) => info.getValue(),
  }),

  // ✅ Date
  columnHelper.accessor("added_on", {
    id: "added_on",
    header: "Date",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return " ";
      const formatted = dayjs(val).format('DD/MM/YYYY HH:mm:ss');
      const parts = formatted.split(" ");
      return (
        <div className="flex flex-col">
          <span>{parts[0]}</span>
          <span className="text-sm text-gray-500">{parts.slice(1).join(" ")}</span>
        </div>
      );
    },
  }),

  // ✅ Purpose
  columnHelper.accessor("purpose_name", {
    id: "purpose_name",
    header: "Purpose",
    cell: (info) => info.getValue() || " ",
  }),

  // ✅ Description
  columnHelper.accessor("description", {
    id: "description",
    header: "Description",
    cell: (info) => (
      <div className="whitespace-normal break-words max-w-[200px]">
        {info.getValue() || " "}
      </div>
    ),
  }),

  // ✅ Quantity
  columnHelper.accessor("quantity", {
    id: "quantity",
    header: "Quantity",
    cell: (info) => info.getValue() || " ",
  }),

  // ✅ Source
  columnHelper.accessor("source", {
    id: "source",
    header: "Source",
    cell: (info) => info.getValue() || " ",
  }),

  // ✅ Issued To
  columnHelper.accessor("uname", {
    id: "uname",
    header: "Issued To",
    cell: (info) => info.getValue() || " ",
  }),

  // ✅ Remark
  columnHelper.accessor("remark", {
    id: "remark",
    header: "Remark",
    cell: EditableRemarkCell,
  }),

  // ✅ Actions
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: RowActions,
  }),
];
