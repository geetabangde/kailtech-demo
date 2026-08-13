import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "utils/axios";

import { Input } from "components/ui";

export function Toolbar({ table }) {
  const isFullScreenEnabled = table.getState().tableSettings.enableFullScreen;
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get("category") || "";

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/dashboard/get-notifications-categories");
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching notification categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val) {
      setSearchParams({ category: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="table-toolbar">
      <div
        className={clsx(
          "transition-content flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 pt-4",
          isFullScreenEnabled ? "px-4 sm:px-5" : "px-[var(--margin-x)]",
        )}
      >
        <div className="flex shrink-0 space-x-2 w-full sm:w-auto">
          <Input
            value={table.getState().globalFilter}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            prefix={<MagnifyingGlassIcon className="size-4" />}
            classNames={{
              input: "h-8 text-xs ring-primary-500/50 focus:ring-3",
              root: "shrink-0 w-full sm:w-64",
            }}
            placeholder="Search activities..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</label>
          <select 
            value={currentCategory} 
            onChange={handleCategoryChange}
            className="h-8 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:border-dark-500 dark:text-white"
          >
            <option value="">All</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
