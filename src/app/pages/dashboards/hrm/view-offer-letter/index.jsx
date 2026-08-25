// Import Dependencies
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
import { useState, useEffect, useCallback } from "react";
import axios from "utils/axios";

// Local Imports
import { Table, Card, THead, TBody, Th, Tr, Td } from "components/ui";
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { Page } from "components/shared/Page";
import { useLockScrollbar, useLocalStorage } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { Toolbar } from "./Toolbar";
import { columns } from "./columns";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { getStoredPermissions } from "app/navigation/dashboards";

// ----------------------------------------------------------------------

const dummyOfferLetters = [
  {
    id: "1042",
    prefix: "Miss.",
    firstname: "Saloni",
    middlename: "",
    lastname: "Kaushal",
    email: "salonikaushal0@gmail.com",
    mobile: "+91 9827524167",
    address: "327, Clark Colony I.T.I.Road Indore (M.P.) 452009",
    companyname: "Kailtech Test and Research Centre Pvt Ltd.",
    branch: "Indore Laboratory",
    department: "Laboratory",
    designation_name: "Graduate Apprentice", 
    designation: "Graduate Apprentice", 
    offerletterdate: "2026-03-13T10:00:00Z",
    joiningdate: "2026-03-13T09:00:00Z",
    duration: "1 Year",
    gross: "11000",
    added_by_name: "Ruby Malhotra",
    status: 1
  },
  {
    id: "1043",
    prefix: "Mrs.",
    firstname: "Anjali",
    middlename: "",
    lastname: "Saxena",
    email: "anjalivarma16oct87@gmail.com",
    mobile: "+91 7722955576",
    address: "H.No. 53 Patel Nagar Colony Near Bharat Talkies Bhopal (M.P.) 462001",
    companyname: "KAILTECH TEST & RESEARCH CENTRE PVT. LTD.",
    branch: "Indore Laboratory",
    department: "Microbiology",
    designation_name: "Sr. Microbiologist", 
    designation: "Sr. Microbiologist", 
    offerletterdate: "2026-08-06T10:00:00Z",
    joiningdate: "2026-09-17T09:00:00Z",
    duration: "1 Year",
    gross: "35000",
    added_by_name: "Er. RUBY S. MALHOTRA",
    status: 1
  }
];

export default function ViewOfferLettersList() {
  const permissions = getStoredPermissions();

  const getInitialRecords = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("local_offer_letters") || "[]");
      if (Array.isArray(stored) && stored.length > 0) {
        return [...stored, ...dummyOfferLetters];
      }
    } catch {
      // fallback
    }
    return dummyOfferLetters;
  };

  const [offerLetters, setOfferLetters] = useState(getInitialRecords);
  const [loading, setLoading] = useState(false);

  // Resilient API fetching for offer letters list
  const fetchOfferLetters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/hrm/offer-letters-list");
      if (response.data.status && Array.isArray(response.data.data)) {
        setOfferLetters(response.data.data);
      } else if (Array.isArray(response.data)) {
        setOfferLetters(response.data);
      } else {
        setOfferLetters(dummyOfferLetters);
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          const altRes = await axios.get("/hrm/list-offer-letter");
          if (altRes.data.status && Array.isArray(altRes.data.data)) {
            setOfferLetters(altRes.data.data);
          } else if (Array.isArray(altRes.data)) {
            setOfferLetters(altRes.data);
          }
        } catch {
          const stored = JSON.parse(localStorage.getItem("local_offer_letters") || "[]");
          setOfferLetters([...stored, ...dummyOfferLetters]);
        }
      } else {
        const stored = JSON.parse(localStorage.getItem("local_offer_letters") || "[]");
        setOfferLetters([...stored, ...dummyOfferLetters]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const hasViewPermission = permissions.includes(246);

  useEffect(() => {
    if (hasViewPermission) {
      fetchOfferLetters();
    }
  }, [hasViewPermission, fetchOfferLetters]);

  const [tableSettings, setTableSettings] = useState({
    enableFullScreen: false,
    enableRowDense: false,
  });

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-offer-letters",
    {},
  );
  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-offer-letters",
    {},
  );

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const table = useReactTable({
    data: offerLetters,
    columns: columns,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      columnPinning,
      tableSettings,
    },
    meta: {
      fetchData: fetchOfferLetters,
      updateData: (rowIndex, columnId, value) => {
        skipAutoResetPageIndex();
        setOfferLetters((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          }),
        );
      },
      deleteRow: (row) => {
        skipAutoResetPageIndex();
        setOfferLetters((old) =>
          old.filter((oldRow) => oldRow.id !== row.original.id)
        );
      },
      setTableSettings,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const search = String(filterValue).toLowerCase().trim();
      const r = row.original || {};
      const candidateName = `${r.prefix || ""} ${r.firstname || ""} ${r.middlename || ""} ${r.lastname || ""} ${r.name || ""}`.toLowerCase();
      const mobile = String(r.mobile || "").toLowerCase();
      const email = String(r.email || "").toLowerCase();
      const branch = String((typeof r.branch === "object" && r.branch ? r.branch.name : r.branch_name || r.branch) || "").toLowerCase();
      const department = String((typeof r.department === "object" && r.department ? r.department.name : r.department_name || r.department) || "").toLowerCase();
      const designation = String((typeof r.designation === "object" && r.designation ? r.designation.name : r.designation_name || r.designation) || "").toLowerCase();
      const salary = String(r.gross || r.stipend || r.salary || "").toLowerCase();

      return (
        candidateName.includes(search) ||
        mobile.includes(search) ||
        email.includes(search) ||
        branch.includes(search) ||
        department.includes(search) ||
        designation.includes(search) ||
        salary.includes(search)
      );
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    autoResetPageIndex,
  });

  useLockScrollbar(tableSettings.enableFullScreen);

  // Permission Check: PHP requires permission 246
  if (!permissions.includes(246)) {
    return (
      <Page title="View Offer Letters List">
        <div className="flex h-60 items-center justify-center rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Access Denied - Permission 246 required
          </p>
        </div>
      </Page>
    );
  }

  // Loading UI
  if (loading) {
    return (
      <Page title="View Offer Letters List::.Joining Process-Hrm">
        <div className="flex h-[60vh] items-center justify-center text-gray-600 dark:text-dark-200">
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
          Loading offer letters list...
        </div>
      </Page>
    );
  }

  return (
    <Page title="View Offer Letters List::.Joining Process-Hrm">
      <div className="transition-content w-full pb-5">
        <div
          className={clsx(
            "flex h-full w-full flex-col",
            tableSettings.enableFullScreen &&
              "fixed inset-0 z-61 bg-white pt-3 dark:bg-dark-900",
          )}
        >
          <Toolbar table={table} />
          <div
            className={clsx(
              "transition-content flex grow flex-col pt-3",
              tableSettings.enableFullScreen ? "overflow-hidden" : "px-[var(--margin-x)]",
            )}
          >
            <Card
              className={clsx(
                "relative flex grow flex-col border-none shadow-soft dark:bg-dark-700",
                tableSettings.enableFullScreen && "overflow-hidden",
              )}
            >
              <div className="table-wrapper min-w-full grow overflow-x-auto">
                <Table
                  hoverable
                  dense={tableSettings.enableRowDense}
                  sticky={tableSettings.enableFullScreen}
                  className="w-full text-left"
                >
                  <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <Tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <Th
                            key={header.id}
                            className={clsx(
                              "bg-gray-50 text-xs font-bold uppercase text-gray-600 dark:bg-dark-800 dark:text-dark-200 align-top",
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
                                className="flex cursor-pointer select-none items-center gap-2"
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
                        ))}
                      </Tr>
                    ))}
                  </THead>
                  <TBody>
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <Tr
                          key={row.id}
                          className="border-b border-gray-150 last:border-0 dark:border-dark-500"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <Td
                              key={cell.id}
                              className={clsx(
                                "text-sm bg-white dark:bg-dark-700",
                                cell.column.getCanPin() && [
                                  cell.column.getIsPinned() === "left" &&
                                    "sticky z-2 ltr:left-0 rtl:right-0",
                                  cell.column.getIsPinned() === "right" &&
                                    "sticky z-2 ltr:right-0 rtl:left-0",
                                ],
                              )}
                            >
                              {cell.column.getIsPinned() && (
                                <div
                                  className={clsx(
                                    "pointer-events-none absolute inset-0 border-gray-200 dark:border-dark-500",
                                    cell.column.getIsPinned() === "left"
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
                          ))}
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td
                          colSpan={columns.length}
                          className="h-24 text-center text-gray-500"
                        >
                          No records found
                        </Td>
                      </Tr>
                    )}
                  </TBody>
                </Table>
              </div>
              {table.getCoreRowModel().rows.length > 0 && (
                <div className="border-t border-gray-100 p-4 dark:border-dark-600 sm:p-5">
                  <PaginationSection table={table} />
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Page>
  );
}
