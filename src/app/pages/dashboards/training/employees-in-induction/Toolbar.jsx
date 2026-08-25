// Import Dependencies
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import PropTypes from "prop-types";

import { Input } from "components/ui";

// ----------------------------------------------------------------------

export function Toolbar({ table, status, setStatus }) {

  return (
    <div className="table-toolbar px-[var(--margin-x)] pt-4">
      <div
        className={clsx(
          "transition-content flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4",
        )}
      >
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-wide text-gray-800 dark:text-dark-50">
            View Employee
          </h2>
        </div>

        <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-500 dark:bg-dark-900"
            >
              <option value="1">Active</option>
              <option value="0">Unverified</option>
              <option value="99">Suspended</option>
            </select>
        </div>
      </div>
      <div className="flex shrink-0 space-x-2">
        <SearchInput table={table} />
      </div>
    </div>
  );
}

function SearchInput({ table }) {
  return (
    <Input
      value={table.getState().globalFilter}
      onChange={(e) => table.setGlobalFilter(e.target.value)}
      prefix={<MagnifyingGlassIcon className="size-4" />}
      classNames={{
        input: "h-9 text-sm ring-primary-500/50 focus:ring-3 w-64",
        root: "shrink-0",
      }}
      placeholder="Search employees..."
    />
  );
}

Toolbar.propTypes = {
  table: PropTypes.object,
  status: PropTypes.string,
  setStatus: PropTypes.func,
};
