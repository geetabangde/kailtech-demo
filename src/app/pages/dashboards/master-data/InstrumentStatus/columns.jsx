// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router-dom";

const columnHelper = createColumnHelper();

export const columns = [
  // S.No
  columnHelper.accessor((_row, index) => index + 1, {
    id: "s_no",
    header: "S.No",
    cell: (info) => info.row.index + 1,
  }),

  // Product Name
  columnHelper.accessor("product_name", {
    id: "product_name",
    header: "Product Name",
    cell: (info) => info.getValue() || "-",
  }),

  // New ID no
  columnHelper.accessor("new_id_no", {
    id: "new_id_no",
    header: "New ID no",
    cell: (info) => info.getValue() || "-",
  }),

  // Location
  columnHelper.accessor("location", {
    id: "location",
    header: "Location",
    cell: (info) => info.getValue() || "-",
  }),

  // Current Status
  columnHelper.accessor("current_status", {
    id: "current_status",
    header: "Current Status",
    cell: (info) => {
      const status = info.getValue() || "-";
      const row = info.row.original;

      let issueDetails = row.issue_details;
      
      // Handle cases where the backend might return it as a JSON string
      if (typeof issueDetails === 'string') {
        try {
          issueDetails = JSON.parse(issueDetails);
        } catch (e) {
          console.error("Failed to parse issue_details:", issueDetails, e);
        }
      }

      if (issueDetails && issueDetails.code && issueDetails.link) {
        // Extract hakuna ID from the old PHP link
        const oldUrl = issueDetails.link;
        const match = oldUrl.match(/[?&]hakuna=([^&]+)/);
        
        let targetLink = oldUrl;
        let isInternal = false;
        
        if (match && match[1]) {
          targetLink = `/dashboards/inventory/din-list/view-din-form?hakuna=${match[1]}`;
          isInternal = true;
        }

        return (
          <div className="flex flex-col">
            <span>{status}</span>
            {isInternal ? (
              <Link
                to={targetLink}
                className="text-red-500 hover:text-red-700 text-sm mt-1"
              >
                {issueDetails.code}
              </Link>
            ) : (
              <a
                href={targetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:text-red-700 text-sm mt-1"
              >
                {issueDetails.code}
              </a>
            )}
          </div>
        );
      }

      return status;
    },
  }),

  // Total Quantity
  columnHelper.accessor("total_quantity", {
    id: "total_quantity",
    header: "Total Quantity",
    cell: (info) => info.getValue() || "-",
  }),

  // Location Quantity
  columnHelper.accessor("location_quantity", {
    id: "location_quantity",
    header: "Location Quantity",
    cell: (info) => info.getValue() || "-",
  }),

  // Unit
  columnHelper.accessor("unit", {
    id: "unit",
    header: "Unit",
    cell: (info) => info.getValue() || "-",
  }),
];
