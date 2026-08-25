// RowActions.jsx — Proforma Invoice List
// PHP actions:
//   status==0 + permission(300) → Approve button
//   status!=91 → Edit Proforma Invoice
//   always → View Invoice

import clsx from "clsx";
import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import axios from "utils/axios";
import { toast } from "sonner";

// ----------------------------------------------------------------------

// ── Custom Approve Modal ──────────────────────────────────────────────────
function ApproveModal({ show, onClose, onOk, loading }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="dark:bg-dark-800 w-full max-w-sm rounded-lg bg-white shadow-xl">
        {/* Icon */}
        <div className="flex flex-col items-center px-6 pt-6 pb-4">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="dark:text-dark-50 text-base font-semibold text-gray-800">
            Approve Invoice?
          </h3>
          <p className="dark:text-dark-400 mt-1.5 text-center text-sm text-gray-500">
            Are you sure you want to approve this Proforma Invoice?
          </p>
        </div>
        {/* Buttons */}
        <div className="dark:border-dark-500 flex items-center justify-end gap-2 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="dark:border-dark-500 dark:text-dark-300 rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onOk}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"
                  />
                </svg>
                Approving…
              </>
            ) : (
              "Approve"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RowActions({ row, table }) {
  const rowData = row.original;
  const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");

  // PHP: in_array(300, $permissions) → Approve
  const canApprove = permissions.includes(300);
  // PHP: in_array(62, $permissions) → Edit (add/edit)
  const canEdit = permissions.includes(62);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);

  const openApprove = () => setApproveModalOpen(true);
  const closeApprove = () => setApproveModalOpen(false);

  const handleApprove = useCallback(async () => {
    setApproveLoading(true);
    try {
      const res = await axios.post(`/accounts/approve-invoice/${rowData.id}`);
      if (
        res.data.success === true ||
        res.data.status === true ||
        res.data.status === "true" ||
        res.data === "Invoice Approved"
      ) {
        toast.success("Proforma Invoice approved ✅");
        table.options.meta?.updateRow(row.index, {
          status: 1,
          invoiceno: res.data.invoiceno ?? rowData.invoiceno,
        });
        closeApprove();
      } else {
        toast.error(res.data.message ?? "Approval failed");
      }
    } catch {
      toast.error("Failed to approve invoice");
    } finally {
      setApproveLoading(false);
    }
  }, [rowData.id, rowData.invoiceno, row.index, table]);

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {/* PHP: status==0 + canApprove → Approve */}
        {rowData.status === 0 && canApprove && (
          <ActionBtn color="success" onClick={openApprove}>
            Approve
          </ActionBtn>
        )}

        {/* PHP: status!=91 → Edit Proforma Invoice */}
        {rowData.status !== 91 && canEdit && (
          <ActionBtn
            color="warning"
            component={Link}
            to={`/dashboards/accounts/proforma-invoice/edit/${rowData.id}`}
          >
            Edit
          </ActionBtn>
        )}

        {/* PHP: always → View Invoice */}
        <ActionBtn
          color="primary"
          component={Link}
          to={`/dashboards/accounts/proforma-invoice/view/${rowData.id}`}
        >
          View Invoice
        </ActionBtn>
      </div>

      <ApproveModal
        show={approveModalOpen}
        onClose={closeApprove}
        onOk={handleApprove}
        loading={approveLoading}
      />
    </>
  );
}

function ActionBtn({
  color = "primary",
  onClick,
  children,
  component: Component = "button",
  ...props
}) {
  const colorMap = {
    success: "bg-green-500 hover:bg-green-600 text-white",
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };
  return (
    <Component
      onClick={onClick}
      className={clsx(
        "inline-flex items-center rounded px-2.5 py-1 text-xs font-medium transition-colors",
        colorMap[color],
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

ActionBtn.propTypes = {
  color: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  component: PropTypes.any,
  to: PropTypes.string,
};

RowActions.propTypes = {
  row: PropTypes.object,
  table: PropTypes.object,
};
