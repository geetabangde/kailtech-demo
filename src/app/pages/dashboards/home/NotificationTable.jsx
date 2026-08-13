import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "components/ui";
import { MinusIcon, XMarkIcon } from "@heroicons/react/24/outline";

const mapNotificationUrl = (url) => {
  if (!url) return "#";
  
  if (url.includes("approvedispatch.php")) {
    const search = url.includes("?") ? url.substring(url.indexOf("?")) : "";
    return `/dashboards/inventory/din-list/approve-dispatch${search}`;
  }
  
  if (url.includes("viewInvoiceCalibration.php")) {
    const urlParams = new URLSearchParams(url.split("?")[1] || "");
    const id = urlParams.get("matata");
    if (id) return `/dashboards/accounts/testing-invoices/view/${id}`;
    return `/dashboards/accounts/testing-invoices`;
  }
  
  if (url.includes("paymentapproval.php")) {
    return "/dashboards/approvals"; // Update this if a more specific route is added
  }

  return `/${url}`;
};

export function NotificationTable({ data }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [filter, setFilter] = useState("All");

  const notifications = data || [];

  const filteredNotifications = notifications.filter(
    (n) => filter === "All" || n.category === filter
  );

  if (!isVisible) return null;

  return (
    <div className="col-span-12 flex flex-col lg:col-span-6 xl:col-span-6 w-full">
      <div className="table-toolbar flex items-center justify-between mb-3">
        <h2 className="truncate text-base font-medium tracking-wide text-gray-800 dark:text-dark-100">
          Notification ({notifications.length})
        </h2>
        <div className="flex items-center space-x-2 text-gray-500">
          <select 
            className="text-xs border-gray-300 rounded dark:bg-dark-800 dark:border-dark-500 p-1"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Approve Challan">Approve Challan</option>
            <option value="Approve Priority">Approve Priority</option>
            <option value="Approve Testing Invoice">Approve Testing Invoice</option>
          </select>
          <button type="button" onClick={() => setIsMinimized(!isMinimized)} className="hover:text-gray-800 dark:hover:text-dark-100">
            <MinusIcon className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => setIsVisible(false)} className="hover:text-gray-800 dark:hover:text-dark-100">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      {!isMinimized && (
        <Card className="relative mt-1 flex grow flex-col overflow-y-auto max-h-[400px] !p-0">
          <div className="flex flex-col divide-y divide-gray-100 dark:divide-dark-700">
            {filteredNotifications.map((notification, idx) => (
              <div key={notification.id || idx} className="p-4 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col">
                    <Link to={mapNotificationUrl(notification.url)} className="text-[13px] font-semibold text-red-600 dark:text-red-400 hover:underline mb-1">
                      {notification.task}
                    </Link>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {notification.formatted_date || notification.added_on}
                    </span>
                  </div>
                  {notification.department && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-white shrink-0 mt-0.5">
                      {notification.department}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {filteredNotifications.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                No notifications found.
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
