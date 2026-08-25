import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { useState, useEffect } from "react";
import axios from "utils/axios";

import { Table, Card, THead, TBody, Th, Tr, Td } from "components/ui";
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { Page } from "components/shared/Page";
import { useLockScrollbar, useDidUpdate, useLocalStorage } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { useThemeContext } from "app/contexts/theme/context";
import { getUserAgentBrowser } from "utils/dom/getUserAgentBrowser";

import { columns } from "./columns";
import { Toolbar } from "./Toolbar";
import { ClearTrainingStatusModal } from "./ClearTrainingStatusModal";

const isSafari = getUserAgentBrowser() === "Safari";

export default function ClearTrainingStatusNew() {
  const { cardSkin } = useThemeContext();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [clearStatusModal, setClearStatusModal] = useState({ show: false, user: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch active trainees list
      const response = await axios.get("/training/active-trainees").catch(() => ({
        data: [] // Placeholder if endpoint not ready
      }));
      setData(response.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [tableSettings, setTableSettings] = useState({
    enableFullScreen: false,
    enableRowDense: false,
  });

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-clear-training-status",
    {},
  );
  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-clear-training-status",
    {},
  );

  const [autoResetPageIndex] = useSkipper();

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      columnPinning,
      tableSettings,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    enableSorting: tableSettings.enableSorting,
    enableColumnFilters: tableSettings.enableColumnFilters,
    autoResetPageIndex,
    meta: {
      openClearStatusModal: (rowOriginal) => {
        setClearStatusModal({ show: true, user: rowOriginal });
      },
      setTableSettings,
    },
  });

  useDidUpdate(() => table.resetRowSelection(), [data]);
  useLockScrollbar(tableSettings.enableFullScreen);

  return (
    <Page title="Clear Training Status">
      <div className="transition-content w-full pb-5">
        <div
          className={clsx(
            "flex h-full w-full flex-col",
            tableSettings.enableFullScreen &&
              "fixed inset-0 z-[61] bg-white pt-3 dark:bg-dark-900",
          )}
        >
          <Toolbar table={table} />
          {loading ? (
             <div className="flex h-[60vh] items-center justify-center text-gray-600">
             <svg
               className="mr-2 h-6 w-6 animate-spin text-blue-600"
               viewBox="0 0 24 24"
             >
               <circle
                 className="opacity-25"
                 cx="12"
                 cy="12"
                 r="10"
                 stroke="currentColor"
                 strokeWidth="4"
               ></circle>
               <path
                 className="opacity-75"
                 fill="currentColor"
                 d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"
               ></path>
             </svg>
             Loading trainees...
           </div>
          ) : (
          <div
            className={clsx(
              "transition-content flex grow flex-col pt-3",
              tableSettings.enableFullScreen ? "overflow-hidden" : "px-[var(--margin-x)]",
            )}
          >
            <Card
              className={clsx(
                "relative flex grow flex-col",
                tableSettings.enableFullScreen && "overflow-hidden",
              )}
              skin={cardSkin}
            >
              <div className="table-wrapper min-w-full grow overflow-x-auto">
                <Table
                  hoverable
                  dense={tableSettings.enableRowDense}
                  sticky={tableSettings.enableFullScreen}
                  className="w-full text-left rtl:text-right"
                >
                  <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <Tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          const isPinned = header.column.getIsPinned();
                          return (
                            <Th
                              key={header.id}
                              className={clsx(
                                "bg-gray-200 font-semibold uppercase text-xs text-gray-800 first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg dark:bg-dark-800 dark:text-dark-100",
                                header.column.getCanPin() && [
                                  isPinned === "left" &&
                                    "sticky z-2 ltr:left-0 rtl:right-0",
                                  isPinned === "right" &&
                                    "sticky z-2 ltr:right-0 rtl:left-0",
                                ],
                              )}
                            >
                              {header.column.getCanSort() ? (
                                <div
                                  className="flex cursor-pointer select-none items-center space-x-3 "
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
                                  <TableSortIcon
                                    sorted={header.column.getIsSorted()}
                                  />
                                </div>
                              ) : header.isPlaceholder ? null : (
                                flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )
                              )}
                            </Th>
                          );
                        })}
                      </Tr>
                    ))}
                  </THead>
                  <TBody>
                    {table.getRowModel().rows.length === 0 ? (
                      <Tr>
                        <Td colSpan={columns.length} className="text-center p-8 text-gray-500">
                          No active trainees found.
                        </Td>
                      </Tr>
                    ) : (
                      table.getRowModel().rows.map((row) => {
                        return (
                          <Tr
                            key={row.id}
                            className={clsx(
                              "relative border-y border-transparent border-b-gray-200 dark:border-b-dark-500",
                              row.getIsSelected() &&
                                !isSafari &&
                                "row-selected after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500",
                            )}
                          >
                            {row.getVisibleCells().map((cell) => {
                              const isPinned = cell.column.getIsPinned();
                              return (
                                <Td
                                  key={cell.id}
                                  className={clsx(
                                    "relative bg-white",
                                    cardSkin === "shadow"
                                      ? "dark:bg-dark-700"
                                      : "dark:bg-dark-900",
                                    cell.column.getCanPin() && [
                                      isPinned === "left" &&
                                        "sticky z-2 ltr:left-0 rtl:right-0",
                                      isPinned === "right" &&
                                        "sticky z-2 ltr:right-0 rtl:left-0",
                                    ],
                                  )}
                                >
                                  {isPinned && (
                                    <div
                                      className={clsx(
                                        "pointer-events-none absolute inset-0 border-gray-200 dark:border-dark-500",
                                        isPinned === "left"
                                          ? "ltr:border-r rtl:border-l"
                                          : "ltr:border-l rtl:border-r",
                                      )}
                                    ></div>
                                  )}
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </Td>
                              );
                            })}
                          </Tr>
                        );
                      })
                    )}
                  </TBody>
                </Table>
              </div>
              {table.getCoreRowModel().rows.length > 0 && (
                <div
                  className={clsx(
                    "px-4 pb-4 sm:px-5 sm:pt-4",
                    tableSettings.enableFullScreen &&
                      "bg-gray-50 dark:bg-dark-800",
                    !(
                      table.getIsSomeRowsSelected() ||
                      table.getIsAllRowsSelected()
                    ) && "pt-4",
                  )}
                >
                  <PaginationSection table={table} />
                </div>
              )}
            </Card>
          </div>
          )}
        </div>
      </div>

      <ClearTrainingStatusModal 
        isOpen={clearStatusModal.show}
        onClose={() => setClearStatusModal({ show: false, user: null })}
        selectedUser={clearStatusModal.user}
        onSuccess={fetchData}
      />
    </Page>
  );
}
