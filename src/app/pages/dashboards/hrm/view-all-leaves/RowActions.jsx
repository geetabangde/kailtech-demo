// Import Dependencies
import { useState } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";

// Local Imports
import axios from "utils/axios";
import { toast } from "sonner";
import { getStoredPermissions } from "app/navigation/dashboards";
import { Button, Input } from "components/ui";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

const LEAVE_TYPE_OPTIONS = [
  { value: "1", label: "Casual Leave (CL)" },
  { value: "2", label: "Sick Leave (SL)" },
  { value: "3", label: "Compensatory Off (Comp-Off)" },
  { value: "4", label: "Earned Leave (EL)" },
  { value: "5", label: "Maternity Leave" },
  { value: "6", label: "Paternity Leave" },
  { value: "7", label: "Leave Without Pay (LWP)" },
];

export function RowActions({ row, table }) {
  const original = row.original;
  const { id, status } = original;
  const permissions = getStoredPermissions();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states for approval modal
  const [leaveType, setLeaveType] = useState(String(original.leaveType || "1"));
  const [startDate, setStartDate] = useState(
    original.startdate ? dayjs(original.startdate).format("YYYY-MM-DD") : ""
  );
  const [endDate, setEndDate] = useState(
    original.enddate ? dayjs(original.enddate).format("YYYY-MM-DD") : ""
  );
  const [approvalReason, setApprovalReason] = useState("");

  // Form state for rejection modal
  const [rejectionReason, setRejectionReason] = useState("");

  // Status index: 0 = Pending, 1 = Approved, 2 = Rejected
  if (status != 0) return null;

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/hrm/approve-leave", {
        id,
        leaveType,
        startdate: startDate,
        enddate: endDate,
        reason2: approvalReason,
      });

      toast.success("Leave approved successfully ✅");
      setApproveOpen(false);
      table.options.meta?.fetchData?.();
    } catch (error) {
      console.error("Approval failed:", error);
      toast.error(error.response?.data?.message || "Failed to approve leave ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/hrm/reject-leave", {
        id,
        reason: rejectionReason,
      });

      toast.success("Leave rejected successfully ✅");
      setRejectOpen(false);
      table.options.meta?.fetchData?.();
    } catch (error) {
      console.error("Rejection failed:", error);
      toast.error(error.response?.data?.message || "Failed to reject leave ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        {(permissions.includes(232) || permissions.length === 0) && (
          <>
            <button
              onClick={() => setApproveOpen(true)}
              className="inline-flex items-center justify-center rounded-md bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 transition hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
            >
              Approve
            </button>
            <button
              onClick={() => setRejectOpen(true)}
              className="inline-flex items-center justify-center rounded-md bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
            >
              Reject
            </button>
          </>
        )}
      </div>

      {/* Approve Modal */}
      {approveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-dark-800">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 dark:border-dark-600">
              <div className="flex size-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                <CheckCircleIcon className="size-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800 dark:text-dark-50">
                  Approve Leave Request
                </h3>
                <p className="text-xs text-gray-500">
                  Applicant: <span className="font-semibold text-gray-700 dark:text-gray-300">{original.username}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleApproveSubmit} className="mt-4 space-y-4 text-left">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-dark-200">
                  Leave Type *
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                  required
                >
                  {LEAVE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-dark-200">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-dark-200">
                    End Date *
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-dark-200">
                  Employee&apos;s Reason
                </label>
                <div className="rounded-md bg-gray-50 p-2.5 text-xs text-gray-700 dark:bg-dark-700 dark:text-dark-200">
                  {original.reason || "No reason provided"}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-dark-200">
                  Approval Reason / Remark
                </label>
                <textarea
                  rows={2}
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  placeholder="Enter remarks or approval reason..."
                  className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-dark-600">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setApproveOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="success"
                  className="bg-green-600 text-white hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? "Approving..." : "Confirm Approve"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-dark-800">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 dark:border-dark-600">
              <div className="flex size-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                <XCircleIcon className="size-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800 dark:text-dark-50">
                  Reject Leave Request
                </h3>
                <p className="text-xs text-gray-500">
                  Applicant: <span className="font-semibold text-gray-700 dark:text-gray-300">{original.username}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleRejectSubmit} className="mt-4 space-y-4 text-left">
              <div className="rounded-lg bg-gray-50 p-3 space-y-2 text-xs dark:bg-dark-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Leave Type:</span>
                  <span className="font-semibold text-gray-800 dark:text-dark-100">{original.leave_type_label || original.leaveType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dates:</span>
                  <span className="font-semibold text-gray-800 dark:text-dark-100">
                    {dayjs(original.startdate).format("DD/MM/YYYY")} — {dayjs(original.enddate).format("DD/MM/YYYY")}
                  </span>
                </div>
                {original.reason && (
                  <div className="border-t border-gray-200 pt-2 dark:border-dark-600">
                    <span className="text-gray-500 block mb-0.5">Applicant Reason:</span>
                    <span className="text-gray-700 dark:text-dark-200 italic">{original.reason}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-dark-200">
                  Rejection Reason *
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="State the reason for rejecting this leave..."
                  className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-dark-600">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setRejectOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="error"
                  className="bg-red-600 text-white hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? "Rejecting..." : "Confirm Reject"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

RowActions.propTypes = {
  row: PropTypes.object.isRequired,
  table: PropTypes.object.isRequired,
};
