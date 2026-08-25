// Import Dependencies
import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { StartInductionModal } from "./StartInductionModal";
import { CompleteInductionModal } from "./CompleteInductionModal";

// ----------------------------------------------------------------------

export function RowActions({ row, table }) {
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  const baseBtnClass = "inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-bold transition";

  const viewBtnClass = `${baseBtnClass} bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400`;
  const manageBtnClass = `${baseBtnClass} bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400`;
  const startBtnClass = `${baseBtnClass} bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400`;
  const completeBtnClass = `${baseBtnClass} bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          to={`/dashboards/training/employees-in-induction/view-joining-form/${row.original?.id || ''}`}
          className={viewBtnClass}
        >
          <span>View Joining form</span>
        </Link>
        
        <Link
          to={`/dashboards/hrm/manage-employee/permissions/${row.original?.id || ''}`}
          className={manageBtnClass}
        >
          <span>Manage Permission</span>
        </Link>

        {row.original?.status == 10 && (
          <button
            onClick={() => setStartModalOpen(true)}
            className={startBtnClass}
          >
            <span>Start Induction</span>
          </button>
        )}

        {row.original?.status == 11 && (
          <button
            onClick={() => setCompleteModalOpen(true)}
            className={completeBtnClass}
          >
            <span>Complete Induction</span>
          </button>
        )}
      </div>

      {startModalOpen && (
        <StartInductionModal 
          show={startModalOpen} 
          onClose={() => setStartModalOpen(false)} 
          row={row.original} 
          table={table}
        />
      )}

      {completeModalOpen && (
        <CompleteInductionModal 
          show={completeModalOpen} 
          onClose={() => setCompleteModalOpen(false)} 
          row={row.original} 
          table={table}
        />
      )}
    </>
  );
}

RowActions.propTypes = {
  row: PropTypes.object,
  table: PropTypes.object,
};
