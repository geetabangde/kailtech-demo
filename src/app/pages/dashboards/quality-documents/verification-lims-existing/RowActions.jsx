// Import Dependencies
import { CheckIcon, EyeIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import { Button } from "components/ui";
import PropTypes from "prop-types";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

// ----------------------------------------------------------------------

export function RowActions({ row }) {
  const navigate = useNavigate();
  const permissions = useMemo(() => {
    const raw = localStorage.getItem("userPermissions") || "[]";
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(Number) : (typeof parsed === "string" ? parsed.split(",").map(Number).filter(n => !isNaN(n)) : []);
    } catch {
      return raw.trim().replace(/^\[/, "").replace(/\]$/, "").split(",").map(Number).filter((n) => !isNaN(n));
    }
  }, []);

  // PHP: if (in_array(473, $permissions)) - View Document Verification button
  const canView = permissions.includes(473);
  
  // PHP: if (in_array(476, $permissions) && $row['status'] == 1) - Approve/Reject button
  const canApprove = permissions.includes(476) && row.original.status === 1;

  const handleApprove = () => {
    row.table.options.meta?.openApproveModal(row.original);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* View Document Verification Button */}
      {/* PHP: if (in_array(473, $permissions)) {
         $a = '<a class="btn btn-info" href="LIMS_existing_new.php?hakuna=' . $row['id'] . '">View Document Verification</a>';
      } */}
      {canView && (
        <Button
          variant="flat"
          className="size-8 p-0 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-600/50"
          title="View Document Verification"
          onClick={() => navigate(`/dashboards/quality-documents/verification-lims-existing/view/${row.original.id}`)}
        >
          <EyeIcon className="size-4.5" />
        </Button>
      )}

      {/* View Attachment Button */}
      {canView && row.original.document != 0 && (row.original.document_path || row.original.file_path) && (
        <Button
          as="a"
          href={row.original.document_path || row.original.file_path}
          target="_blank"
          variant="flat"
          className="size-8 p-0 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
          title="View Attachment"
        >
          <PaperClipIcon className="size-4.5" />
        </Button>
      )}

      {/* Approve/Reject Button */}
      {/* PHP: if (in_array(476, $permissions) && $row['status'] == 1) {
         $a .= '<button type="button" class="btn btn-primary" onclick="approveRequest(\'' . $row['id'] . '\',\'' . '\',\'' .  '\')">Approve/Reject</button>';
      } */}
      {canApprove && (
        <Button
          variant="flat"
          className="size-8 p-0 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
          onClick={handleApprove}
          title="Approve / Reject"
        >
          <CheckIcon className="size-4.5" />
        </Button>
      )}
    </div>
  );
}

RowActions.propTypes = {
  row: PropTypes.object.isRequired,
};
