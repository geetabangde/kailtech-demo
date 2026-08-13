// Import Dependencies
import { Link } from "react-router-dom";
import { Button } from "components/ui";

function usePermissions() {
  const p = localStorage.getItem("userPermissions");
  try {
    return JSON.parse(p) || [];
  } catch {
    return p?.split(",").map(Number) || [];
  }
}

export function RowActions(info) {
  const row = info.row.original;
  const permissions = usePermissions();
  const currentUserId = localStorage.getItem("employeeId") || localStorage.getItem("userId"); 
  
  if (row.status == 0) {
    // Note: ensure API returns `userid` field
    if (String(row.userid) === String(currentUserId) && permissions.includes(441)) {
      return (
        <Link 
          to={`/dashboards/master-data/mom-list/edit/${row.id}`}
          className="inline-flex h-8 items-center justify-center rounded-md bg-yellow-500 px-3 text-xs font-medium text-white transition hover:bg-yellow-600"
        >
          Resume
        </Link>
      );
    } else {
      return <span className="text-gray-500 italic text-sm">In Draft</span>;
    }
  } else {
    if (permissions.includes(440)) {
      return (
        <Button 
          variant="solid" 
          color="primary" 
          className="h-8 px-3 text-xs"
          onClick={() => {
            // TODO: Implement View Modal logic if required
            console.log("View MOM:", row.id);
          }}
        >
          View
        </Button>
      );
    }
    return null;
  }
}
