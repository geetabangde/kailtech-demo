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
import { toast } from "sonner";

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
import { ViewTrainingStatusModal } from "./ViewTrainingStatusModal";

const isSafari = getUserAgentBrowser() === "Safari";

export default function EmployeesInTraining() {
  const { cardSkin } = useThemeContext();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [viewModalState, setViewModalState] = useState({ show: false, userId: null, planId: null });

  const fetchData = async () => {
    try {
      setLoading(true);
      // Replace with your actual endpoint returning this data
      // Mocking data that would come from `select trainingplanneradmin...`
      const response = await axios.get("/training/employees-in-training").catch(() => ({
        data: {
          data: [
            {
              id: 1,
              tniid: 101,
              firstname: "John",
              lastname: "Doe",
              email: "john@example.com",
              mobile: "1234567890",
              empid: "EMP001",
              departmentName: "Quality Control",
              tnistatus: 1, // Waiting For Approval
              unblocktill: "2024-01-01", // Past date to show unblock logic if it was 2 or 3
            },
            {
              id: 2,
              tniid: 102,
              firstname: "Jane",
              lastname: "Smith",
              email: "jane@example.com",
              mobile: "0987654321",
              empid: "EMP002",
              departmentName: "Safety & Health",
              tnistatus: 2, // Not Started Training Yet
              unblocktill: "2022-01-01", // Past date, should show Unblock and Remove
            },
            {
              id: 3,
              tniid: 103,
              firstname: "Mike",
              lastname: "Johnson",
              email: "mike@example.com",
              mobile: "5551234567",
              empid: "EMP003",
              departmentName: "Production",
              tnistatus: 3, // In Training
              unblocktill: "2050-01-01", // Future date, should NOT show Unblock and Remove
            }
          ]
        }
      }));
      setData(response.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch employees in training");
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
    "column-visibility-employees-in-training",
    {},
  );
  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-employees-in-training",
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
      openViewModal: (rowOriginal) => {
        setViewModalState({ 
          show: true, 
          userId: rowOriginal.id, 
          planId: rowOriginal.tniid 
        });
      },
      onCancelTraining: async (/* rowOriginal */) => {
        if (window.confirm("Are you sure you want to cancel this training?")) {
          try {
            // await axios.post(`/training/cancel`, { id: rowOriginal.id });
            toast.success("Training cancelled");
            fetchData();
          } catch (e) {
            console.error(e);
            toast.error("Failed to cancel training");
          }
        }
      },
      onUnblockTraining: async (/* rowOriginal */) => {
        if (window.confirm("Are you sure you want to unblock this training?")) {
          try {
            // await axios.post(`/training/unblock`, { tniid: rowOriginal.tniid });
            toast.success("Training unblocked successfully");
            fetchData();
          } catch (e) {
            console.error(e);
            toast.error("Failed to unblock training");
          }
        }
      },
      onRemoveTraining: async (/* rowOriginal */) => {
        if (window.confirm("Are you sure you want to remove this training?")) {
          try {
            // await axios.post(`/training/remove`, { tniid: rowOriginal.tniid, userId: rowOriginal.id });
            toast.success("Training removed");
            fetchData();
          } catch (e) {
            console.error(e);
            toast.error("Failed to remove training");
          }
        }
      },
      setTableSettings,
    },
  });

  useDidUpdate(() => table.resetRowSelection(), [data]);
  useLockScrollbar(tableSettings.enableFullScreen);

  return (
    <Page title="Employees In Training">
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
             Loading employees...
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
                          No employees found in training.
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

      <ViewTrainingStatusModal
        show={viewModalState.show}
        userId={viewModalState.userId}
        planId={viewModalState.planId}
        onClose={() => setViewModalState({ show: false, userId: null, planId: null })}
      />
    </Page>
  );
}
