import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.display({
    id: "srNo",
    header: "Sr No",
    cell: (info) => info.row.index + 1,
    size: 60,
  }),
  columnHelper.accessor("modulename", {
    header: "Training Module Name",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("procedureno", {
    header: "Module Code",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("rev", {
    header: "Revision No.",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("users", {
    header: "Training Pending for",
    cell: (info) => {
      const users = info.getValue();
      if (!users || !Array.isArray(users) || users.length === 0) {
        return "-";
      }
      return (
        <ul className="list-disc pl-4">
          {users.map((user, index) => (
            <li key={index} className="whitespace-nowrap">
              {user.name} ({user.nextinitiatedate})
            </li>
          ))}
        </ul>
      );
    },
  }),
];
