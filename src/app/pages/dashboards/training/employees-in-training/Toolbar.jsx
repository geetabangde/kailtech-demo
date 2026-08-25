import PropTypes from "prop-types";

export function Toolbar({ exportData }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4">
      <div className="flex gap-2">
        <button
          onClick={exportData}
          className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Export
        </button>
      </div>
    </div>
  );
}

Toolbar.propTypes = {
  exportData: PropTypes.func,
};
