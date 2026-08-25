import {
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

// Local Imports
import { Button, Input } from "components/ui";
import { getStoredPermissions } from "app/navigation/dashboards";

// ----------------------------------------------------------------------

export function Toolbar({ table }) {
  const permissions = getStoredPermissions();
  const navigate = useNavigate();
  const isFullScreenEnabled = table.getState().tableSettings?.enableFullScreen;

  return (
    <div className="table-toolbar">
      <div
        className={clsx(
          "transition-content flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
          isFullScreenEnabled ? "px-4 sm:px-5" : "px-[var(--margin-x)] pt-4",
        )}
      >
        {/* Title & Direct Add Button */}
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold tracking-wide text-gray-800 dark:text-dark-50">
            View Offer Letters List
          </h2>

          {permissions.includes(249) && (
            <Button
              color="primary"
              onClick={() => navigate("/dashboards/hrm/view-offer-letter/add")}
              className="h-9 rounded-md px-4 text-sm font-medium flex items-center gap-1.5"
            >
              <PlusIcon className="size-4 stroke-2" />
              <span>Add Offer / Internship Letter</span>
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <SearchInput table={table} />
        </div>
      </div>
    </div>
  );
}

function SearchInput({ table }) {
  return (
    <Input
      value={table.getState().globalFilter ?? ""}
      onChange={(e) => table.setGlobalFilter(e.target.value)}
      prefix={<MagnifyingGlassIcon className="size-4" />}
      classNames={{
        input: "h-9 text-xs ring-primary-500/50 focus:ring-3",
        root: "shrink-0 w-64",
      }}
      placeholder="Search..."
    />
  );
}
