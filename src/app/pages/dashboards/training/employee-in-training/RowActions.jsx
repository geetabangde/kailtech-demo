import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export function RowActions({ row, table }) {
  const { meta } = table.options;

  const baseBtnClass = "inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-bold transition";
  
  const viewBtnClass = `${baseBtnClass} bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400`;
  const prepareBtnClass = `${baseBtnClass} bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400`;
  const approveBtnClass = `${baseBtnClass} bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400`;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Link
        to={`/dashboards/training/employees-in-induction/view-joining-form/${row.original?.id || ""}`}
        className={viewBtnClass}
      >
        <span>View Joining form</span>
      </Link>

      {String(row.original?.status) === "12" && (
        <button
          onClick={() => meta?.openPrepareModal(row.original)}
          className={prepareBtnClass}
        >
          <span>Prepare Training Planner</span>
        </button>
      )}

      {String(row.original?.status) === "13" && (
        <button
          onClick={() => meta?.openApproveModal(row.original)}
          className={approveBtnClass}
        >
          <span>Approve Training Planner</span>
        </button>
      )}
    </div>
  );
}

RowActions.propTypes = {
  row: PropTypes.object.isRequired,
  table: PropTypes.object.isRequired,
};
