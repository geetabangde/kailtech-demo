// Import Dependencies
import { EyeIcon } from "@heroicons/react/24/outline";
import { Button } from "components/ui";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

// PHP: if (in_array(475, $permissions)) {
//    $a = '<a class="btn btn-info" href="quality_verification_new.php?hakuna=' . $row['id'] . '">View Quality Objectives Verification</a>';    
// }
function usePermissions() {
  const p = localStorage.getItem("userPermissions");
  try {
    return JSON.parse(p) || [];
  } catch {
    return p?.split(",").map(Number) || [];
  }
}

// ----------------------------------------------------------------------

export function RowActions({ row }) {
  const navigate = useNavigate();
  const rowId = row.original.id;
  const permissions = usePermissions();

  return (
    <div className="flex items-center space-x-2">
      {/* View Quality Objectives Verification Button */}
      {/* PHP: if (in_array(475, $permissions)) {
         $a = '<a class="btn btn-info" href="quality_verification_new.php?hakuna=' . $row['id'] . '">View Quality Objectives Verification</a>';    
      } */}
      {permissions.includes(475) && (
        <Button
          variant="flat"
          className="size-8 p-0 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-600/50"
          title="View Quality Objectives Verification"
          onClick={() => navigate(`view/${rowId}`)}
        >
          <EyeIcon className="size-4.5" />
        </Button>
      )}

    </div>
  );
}

RowActions.propTypes = {
  row: PropTypes.object.isRequired,
};
