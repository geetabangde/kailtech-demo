import { createColumnHelper } from "@tanstack/react-table";
import { RowActions } from "./RowActions";
import {
  SelectCell,
  SelectHeader,
} from "components/shared/table/SelectCheckbox";

const columnHelper = createColumnHelper();

// Main Matrix Columns (API: masters-matrix-detail)
export const columns = [
  columnHelper.display({
    id: "select",
    label: "Row Selection",
    header: SelectHeader,
    cell: SelectCell,
    size: 50,
  }),

  columnHelper.accessor((_row, index) => index + 1, {
    id: "s_no",
    header: "S No",
    cell: (info) => info.row.index + 1,
    size: 80,
  }),

  columnHelper.accessor("unittype", {
    id: "unittype",
    header: "Unit Type",
    cell: (info) => info.getValue() || "-",
    size: 150,
  }),

  columnHelper.accessor("mode", {
    id: "mode",
    header: "Mode",
    cell: (info) => info.getValue() || "-",
    size: 120,
  }),

  columnHelper.accessor("unit", {
    id: "unit",
    header: "Unit",
    cell: (info) => info.getValue() || "-",
    size: 100,
  }),

  // Instrument Range (Combined)
  columnHelper.display({
    id: "instrument_range",
    header: "Instrument Range",
    cell: ({ row }) => {
      const min = row.original.instrangemin;
      const max = row.original.instrangemax;
      return `${min || "0"} - ${max || "0"}`;
    },
    size: 150,
  }),

  // Calibrated Range (Combined)
  columnHelper.display({
    id: "calibrated_range",
    header: "Calibrated Range",
    cell: ({ row }) => {
      const min = row.original.calibratedrangemin;
      const max = row.original.calibratedrangemax;
      return `${min || "0"} - ${max || "0"}`;
    },
    size: 150,
  }),

  columnHelper.accessor("leastcount", {
    id: "leastcount",
    header: "Least Count",
    cell: (info) => info.getValue() || "-",
    size: 120,
  }),

  columnHelper.accessor("stability", {
    id: "stability",
    header: "Stability",
    cell: (info) => info.getValue() || "0",
    size: 100,
  }),

  columnHelper.accessor("uniformity", {
    id: "uniformity",
    header: "Uniformity",
    cell: (info) => info.getValue() || "0",
    size: 100,
  }),

  // Accuracy (Combined formula matching PHP: %range of range + %measrement of measurment + absolute)
  columnHelper.display({
    id: "accuracy",
    header: "Accuracy",
    cell: ({ row }) => {
      const data = row.original;
      const parts = [];

      const hasValue = (val) => {
        if (val === null || val === undefined || val === "") return false;
        const num = parseFloat(val);
        return !isNaN(num) ? num !== 0 : String(val).trim() !== "" && String(val).trim() !== "0";
      };

      if (hasValue(data.accuracyrange)) {
        parts.push(`%${data.accuracyrange} of range`);
      }
      if (hasValue(data.accuracymeasrement)) {
        parts.push(`%${data.accuracymeasrement} of measurment`);
      }
      if (hasValue(data.accuracyabsolute)) {
        parts.push(`${data.accuracyabsolute}`);
      }

      return parts.length > 0 ? parts.join(" + ") : "-";
    },
    size: 180,
  }),

  columnHelper.display({
    id: "actions",
    label: "Row Actions",
    header: "Action",
    cell: RowActions,
    size: 100,
  }),
];

// Uncertainty Columns (API: masters-validity-detail)
export const uncertaintyColumns = [
  columnHelper.display({
    id: "select",
    label: "Row Selection",
    header: SelectHeader,
    cell: SelectCell,
    size: 50,
  }),

  columnHelper.accessor((_row, index) => index + 1, {
    id: "s_no",
    header: "S No",
    cell: (info) => info.row.index + 1,
    size: 80,
  }),

  columnHelper.accessor("unittype", {
    id: "unittype",
    header: "Unit Type",
    cell: (info) => info.getValue() || "-",
    size: 180,
  }),

  columnHelper.accessor("mode", {
    id: "mode",
    header: "Mode",
    cell: (info) => info.getValue() || "-",
    size: 120,
  }),

  columnHelper.accessor("unit", {
    id: "unit",
    header: "Unit",
    cell: (info) => info.getValue() || "-",
    size: 100,
  }),

  columnHelper.accessor("point", {
    id: "point",
    header: "Point",
    cell: (info) => info.getValue() || "-",
    size: 100,
  }),

  columnHelper.accessor("cmc", {
    id: "cmc",
    header: "CMC",
    cell: (info) => info.getValue() || "-",
    size: 100,
  }),

  columnHelper.accessor("drift", {
    id: "drift",
    header: "Drift",
    cell: (info) => info.getValue() || "-",
    size: 100,
  }),

  columnHelper.accessor("uncertaintyTerm", {
    id: "uncertaintyTerm",
    header: "Uncertainty Term",
    cell: (info) => info.getValue() || "-",
    size: 150,
  }),

  columnHelper.display({
    id: "actions",
    label: "Row Actions",
    header: "Action",
    cell: RowActions,
    size: 100,
  }),
];