// Import Dependencies
import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
// import { useNavigate } from "react-router";
import { Button, Input } from "components/ui";
import { TableConfig } from "./TableConfig";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";

// ----------------------------------------------------------------------

export function Toolbar({ table }) {
  const { isXs } = useBreakpointsContext();
  const isFullScreenEnabled = table.getState().tableSettings.enableFullScreen;

  const { rows } = table.getFilteredRowModel();
  const total = table.getCoreRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, rows.length);

  return (
    <div className="table-toolbar">
      <div
        className={clsx(
          "transition-content flex items-center justify-between gap-4",
          isFullScreenEnabled ? "px-4 sm:px-5" : "px-[var(--margin-x)] pt-4",
        )}
      >
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
          Perform Testing
        </h2>

        <div className="flex items-center gap-2 ml-auto">
          {isXs ? (
            <Menu as="div" className="relative inline-block text-left">
              <MenuButton
                as={Button}
                variant="flat"
                className="size-8 shrink-0 rounded-full p-0"
              >
                <EllipsisHorizontalIcon className="size-4.5" />
              </MenuButton>
              <Transition
                as={MenuItems}
                enter="transition ease-out"
                enterFrom="opacity-0 translate-y-2"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-2"
                className="absolute z-100 mt-1.5 min-w-[10rem] whitespace-nowrap rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-none focus-visible:outline-none dark:border-dark-500 dark:bg-dark-700 dark:shadow-none ltr:right-0 rtl:left-0"
              >
                <MenuItem>
                  {({ focus }) => (
                    <button
                      className={clsx(
                        "flex h-9 w-full items-center px-3 tracking-wide outline-none transition-colors",
                        focus &&
                          "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                      )}
                    >
                      <span>Export as PDF</span>
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      className={clsx(
                        "flex h-9 w-full items-center px-3 tracking-wide outline-none transition-colors",
                        focus &&
                          "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                      )}
                    >
                      <span>Export as CSV</span>
                    </button>
                  )}
                </MenuItem>
              </Transition>
            </Menu>
          ) : (
            <div className="flex items-center space-x-2">
              <SearchInput table={table} />
              <TableConfig table={table} />
            </div>
          )}
        </div>
      </div>

      {isXs && (
        <div
          className={clsx(
            "flex space-x-2 pt-4 [&_.input-root]:flex-1",
            isFullScreenEnabled ? "px-4 sm:px-5" : "px-[var(--margin-x)]",
          )}
        >
          <SearchInput table={table} />
          <TableConfig table={table} />
        </div>
      )}

      <div
        className={clsx(
          "transition-content pt-2 pb-1",
          isFullScreenEnabled ? "px-4 sm:px-5" : "px-[var(--margin-x)]",
        )}
      >
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing {from} to {to} of {total} entries
        </p>
      </div>
    </div>
  );
}

function SearchInput({ table }) {
  const globalFilter = table.getState().globalFilter ?? "";
  const [value, setValue] = useState(globalFilter);

  useEffect(() => {
    setValue(globalFilter);
  }, [globalFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      table.setGlobalFilter(value);
    }, 300);
    return () => clearTimeout(timeout);
  }, [value, table]);

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      prefix={<MagnifyingGlassIcon className="size-4" />}
      classNames={{
        input: "h-8 text-xs ring-primary-500/50 focus:ring-3",
        root: "shrink-0",
      }}
      placeholder="Search..."
    />
  );
}