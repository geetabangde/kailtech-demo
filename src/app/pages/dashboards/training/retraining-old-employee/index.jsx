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
import { Toolbar } from "./Toolbar";
import { columns } from "./columns";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { useThemeContext } from "app/contexts/theme/context";

import { InitiateTrainingModal } from "./InitiateTrainingModal";
import { ActivateTrainingOldModal } from "./ActivateTrainingOldModal";

export default function RetrainingOldEmployee() {
  const { cardSkin } = useThemeContext();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [initiateModalOpen, setInitiateModalOpen] = useState(false);
  const [activateOldModalOpen, setActivateOldModalOpen] = useState(false);
  
  // Single or multiple selection for Initiate Modal
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Filters state
  const [filters, setFilters] = useState({
    searchin: "All",
    value: "",
  });

  const [tableSettings, setTableSettings] = useState({
    enableFullScreen: false,
    enableRowDense: false,
  });

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-retraining-old-employee",
    {},
  );
  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-retraining-old-employee",
    {},
  );
  const [rowSelection, setRowSelection] = useState({});

  const [autoResetPageIndex] = useSkipper();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Example endpoint: "/training/retraining-employees-list"
      const response = await axios.get("/training/retraining-employees-list", { params: filters });

      if (
        (response.data.status === true ||
          response.data.status === "true" ||
          response.data.status === "success") &&
        Array.isArray(response.data.data)
      ) {
        setEmployees(response.data.data);
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      console.warn("Could not fetch retraining employees, using fallback data.", err);
      // Mock data for UI testing if API is missing
      setEmployees([
        {
          id: 1,
          firstname: "John",
          lastname: "Doe",
          empid: "EMP1001",
          mobile: "9876543210",
          official_mobileno: "9876543210",
          added_on: "2022-01-15T00:00:00Z"
        },
        {
          id: 2,
          firstname: "Jane",
          lastname: "Smith",
          empid: "EMP1002",
          mobile: "9876543211",
          official_mobileno: "-",
          added_on: "2023-05-20T00:00:00Z"
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const table = useReactTable({
    data: employees,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      columnPinning,
      tableSettings,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
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
    enableSorting: true,
    enableColumnFilters: true,
    autoResetPageIndex,
    meta: {
      openInitiateModal: (row) => {
        setSelectedUsers([row]);
        setInitiateModalOpen(true);
      },
      openInitiateMultipleModal: (rows) => {
        setSelectedUsers(rows);
        setInitiateModalOpen(true);
      },
      openActivateOldModal: (row) => {
        setSelectedUsers([row]);
        setActivateOldModalOpen(true);
      },
      setTableSettings,
    },
  });

  useDidUpdate(() => table.resetRowSelection(), [employees]);
  useLockScrollbar(tableSettings.enableFullScreen);

  return (
    <Page title="Retraining Old Employee">
      <div className="transition-content w-full pb-5">
        <div
          className={clsx(
            "flex h-full w-full flex-col",
            tableSettings.enableFullScreen &&
              "fixed inset-0 z-[61] bg-white pt-3 dark:bg-dark-900",
          )}
        >
          <Toolbar 
            table={table}
            filters={filters} 
            onChange={handleFilterChange} 
            onSearch={fetchEmployees} 
          />
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
                        {headerGroup.headers.map((header) => (
                          <Th
                            key={header.id}
                            className={clsx(
                              "bg-gray-200 font-semibold uppercase text-gray-800 first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg dark:bg-dark-800 dark:text-dark-100",
                              header.column.getCanPin() && [
                                header.column.getIsPinned() === "left" &&
                                  "sticky z-2 ltr:left-0 rtl:right-0",
                                header.column.getIsPinned() === "right" &&
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
                              <span className="flex-1">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </span>
                            )}
                          </Th>
                        ))}
                      </Tr>
                    ))}
                  </THead>
                  <TBody>
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <Tr
                          key={row.id}
                          className={clsx(
                            "group border-b border-gray-100 transition-colors dark:border-dark-700",
                            row.getIsSelected() 
                              ? "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30" 
                              : "bg-white hover:bg-primary-50 dark:bg-dark-900 dark:hover:bg-dark-800"
                          )}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <Td
                              key={cell.id}
                              className={clsx(
                                "py-3 text-sm text-gray-700 group-hover:text-gray-900 dark:text-dark-200 dark:group-hover:text-dark-50",
                                cell.column.getCanPin() && [
                                  cell.column.getIsPinned() === "left" &&
                                    "sticky z-1 bg-inherit ltr:left-0 rtl:right-0 dark:bg-inherit",
                                  cell.column.getIsPinned() === "right" &&
                                    "sticky z-1 bg-inherit ltr:right-0 rtl:left-0 dark:bg-inherit",
                                ],
                              )}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </Td>
                          ))}
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td
                          colSpan={columns.length}
                          className="h-24 text-center text-gray-500"
                        >
                          No results.
                        </Td>
                      </Tr>
                    )}
                  </TBody>
                </Table>
              </div>

              <PaginationSection table={table} />
            </Card>
          </div>
          )}
        </div>
      </div>
      
      <InitiateTrainingModal
        show={initiateModalOpen}
        onClose={() => setInitiateModalOpen(false)}
        users={selectedUsers}
        onSuccess={fetchEmployees}
      />
      
      <ActivateTrainingOldModal
        show={activateOldModalOpen}
        onClose={() => setActivateOldModalOpen(false)}
        user={selectedUsers.length > 0 ? selectedUsers[0] : null}
        onSuccess={fetchEmployees}
      />
    </Page>
  );
}
