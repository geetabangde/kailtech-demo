import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "utils/axios";
import { toast } from "sonner";

// PHP: button shown if (perm 176 AND bd==employeeid) OR perm 405
function usePermissions() {
  return localStorage.getItem("userPermissions")?.split(",").map(Number) || [];
}
function useEmployeeId() {
  return localStorage.getItem("userId") ?? "";
}

export function RowActions({ row, table }) {
  const [loading,  setLoading]  = useState(false);
  const permissions = usePermissions();
  const employeeId  = useEmployeeId();

  const bd         = String(row.original.bd ?? "");
  const canApprove =
    (permissions.includes(176) && bd === String(employeeId)) ||
    permissions.includes(405);

  // POST /approvals/approve-calibration-payment/{id}
  // PHP: paymentapproval=1, payamentapproved_by, payamentapproved_on
  //      status=1 (unconditional), closenotification "Approve Payment Calibration"
  const handleApprove = useCallback(async () => {
    const id = row.original.id;
    setLoading(true);
    try {
      await axios.post(`/approvals/approve-calibration-payment/${id}`);
      toast.success("Payment Approved ✅");
      table.options.meta?.deleteRow(row);
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Failed to approve payment.";
      toast.error(msg + " ❌");
    } finally {
      setLoading(false);
    }
  }, [row, table]);

  if (!canApprove) return null;

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className={`rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-red-700 ${
        loading ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      {loading ? "Approving…" : "Approve Non-Payment"}
    </button>
  );
}

RowActions.propTypes = {
  row:   PropTypes.object,
  table: PropTypes.object,
};