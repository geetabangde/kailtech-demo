import { useState, useMemo } from "react";
import { Card, Table, THead, TBody, Th, Tr, Td } from "components/ui";
import { MinusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CollapsibleSearch } from "components/shared/CollapsibleSearch";
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";



export function ReportChemistsTable({ data = [] }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(() => [
    {
      accessorKey: "sr",
      header: "Sr No.",
      cell: (info) => <span className="text-red-500">{info.getValue()}</span>,
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
    },
    {
      accessorKey: "lrn",
      header: "LRN",
    },
    {
      accessorKey: "tentativeReportDateInterim",
      header: () => <>Tentative Report <br /> Date(Interim)</>,
    },
    {
      accessorKey: "tentativeReportDateLongterm",
      header: () => <>Tentative Report <br /> Date(Longterm)</>,
    },
    {
      accessorKey: "tentativeReportDate",
      header: () => <>Tentative <br /> Report Date</>,
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
  });

  if (!isVisible) return null;

  return (
    <div className="col-span-12 flex flex-col lg:col-span-8 xl:col-span-9">
      <div className="table-toolbar flex items-center justify-between mb-3">
        <h2 className="truncate text-base font-medium tracking-wide text-gray-800 dark:text-dark-100">
          Report Chemist Due In 5 Days
        </h2>
        <div className="flex items-center space-x-2 text-gray-500">
          <CollapsibleSearch
            placeholder="Search here..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:text-gray-800 dark:hover:text-dark-100"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            <MinusIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="hover:text-gray-800 dark:hover:text-dark-100"
            title="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      {!isMinimized && (
        <Card className="relative mt-3 flex grow flex-col">
          <div className="table-wrapper min-w-full grow max-h-[400px] overflow-y-auto overflow-x-hidden">
            <Table hoverable className="w-full text-left rtl:text-right">
              <THead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Th
                        key={header.id}
                        className="sticky top-0 z-10 whitespace-normal bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100 first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg"
                      >
                        {header.column.getCanSort() ? (
                          <div
                            className="flex cursor-pointer select-none items-center space-x-3"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span className="flex-1">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                            </span>
                            <TableSortIcon sorted={header.column.getIsSorted()} />
                          </div>
                        ) : header.isPlaceholder ? null : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </Th>
                    ))}
                  </Tr>
                ))}
              </THead>
              <TBody>
                {table.getRowModel().rows.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} className="text-center">No data available</Td>
                  </Tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <Tr
                      key={row.id}
                      className="relative border-y border-transparent border-b-gray-200 dark:border-b-dark-500"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <Td key={cell.id} className="whitespace-normal break-words">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </Td>
                      ))}
                    </Tr>
                  ))
                )}
              </TBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
