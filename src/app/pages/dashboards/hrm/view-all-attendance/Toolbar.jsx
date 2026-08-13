// Import Dependencies
import { MagnifyingGlassIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useState } from "react";

import { Button, Input } from "components/ui";
import { getStoredPermissions } from "app/navigation/dashboards";
import { UploadAttendanceModal } from "./UploadAttendanceModal";

// ----------------------------------------------------------------------

export function Toolbar({ table }) {
  const permissions = getStoredPermissions();
  const canUpload = permissions.includes(230);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="table-toolbar px-[var(--margin-x)] pt-4">
      <div
        className={clsx(
          "transition-content flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4",
        )}
      >
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-wide text-gray-800 dark:text-dark-50">
            View All Attendance
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Action Buttons */}
          {canUpload && (
            <>
              {/* Download Format */}
              <a 
                href="/demoformats/attendancesheettoUpload.xlsx" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="h-9 rounded-md px-4 text-sm font-medium gap-2"
                >
                  <ArrowDownTrayIcon className="size-4" />
                  Download Excel Format
                </Button>
              </a>

              {/* Upload Attendance Modal Trigger */}
              <Button
                className="h-9 rounded-md px-4 text-sm font-medium gap-2"
                color="primary"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <ArrowUpTrayIcon className="size-4" />
                Upload Attendance
              </Button>
              
              <UploadAttendanceModal 
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                table={table}
              />
            </>
          )}
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
      placeholder="Search records..."
    />
  );
}
