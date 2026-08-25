import PropTypes from "prop-types";

export function RowActions({ row, table }) {
  const { meta } = table.options;

  const baseBtnClass = "inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-bold transition";

  const deleteBtnClass = `${baseBtnClass} bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400`;
  const viewBtnClass = `${baseBtnClass} bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400`;
  const certBtnClass = `${baseBtnClass} bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400`;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {String(row.original?.status) === "90" && (
        <button
          onClick={() => meta?.handleDelete(row.original)}
          className={deleteBtnClass}
        >
          <span>Delete</span>
        </button>
      )}

      <button
        onClick={() => meta?.openDetailModal(row.original)}
        className={viewBtnClass}
      >
        <span>View</span>
      </button>

      {row.original?.trainingcertificate && (
        <a
          href={row.original.trainingcertificate}
          target="_blank"
          rel="noopener noreferrer"
          className={certBtnClass}
        >
          <span>View Certificate</span>
        </a>
      )}
    </div>
  );
}

RowActions.propTypes = {
  row: PropTypes.object.isRequired,
  table: PropTypes.object.isRequired,
};
