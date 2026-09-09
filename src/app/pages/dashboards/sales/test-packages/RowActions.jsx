// Import Dependencies
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "utils/axios";
import { toast } from "sonner";

// Local Imports
import { ConfirmModal } from "components/shared/ConfirmModal";

// ----------------------------------------------------------------------

const confirmDeleteMessages = {
  pending: {
    description:
      "Are you sure you want to delete this test price? This cannot be undone.",
  },
  success: { title: "Test Price Deleted" },
};

export function RowActions({ row, table }) {
  const navigate = useNavigate();
  const { id } = row.original;
  const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");

  const canEdit = permissions.includes(266);
  const canDelete = permissions.includes(265);
  const canClone = permissions.includes(264);

  // ── Delete ──────────────────────────────────────────────────────────────
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const handleDelete = useCallback(async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`/sales/delete-test-package/${id}`);
      setDeleteSuccess(true);
      toast.success("Test price deleted ✅");
      setTimeout(() => {
        setDeleteOpen(false);
        table.options.meta?.deleteRow(row);
      }, 800);
    } catch {
      setDeleteError(true);
      toast.error("Failed to delete test price");
    } finally {
      setDeleteLoading(false);
    }
  }, [id, row, table]);

  // ── Clone — data fetch karo, phir EditTestPackage pe navigate karo ──────
  // Route: /dashboards/sales/test-packages/clone/:id
  // EditTestPackage pe `isClone` flag hoga → Save pe add API call hogi
  const [cloneLoading, setCloneLoading] = useState(false);

  const handleClone = useCallback(async () => {
    setCloneLoading(true);
    try {
      // 1. Fetch original package data
      const res = await axios.get(`/sales/get-test-package-byid/${id}`);
      const d = res.data.data ?? res.data.package ?? res.data ?? null;
      if (!d) {
        toast.error("Failed to fetch package data");
        return;
      }
      
      // 2. Fetch quantities
      let quantities = [];
      try {
        const qRes = await axios.get(`/sales/get-quantity?package=${id}`);
        quantities = qRes.data.data ?? [];
      } catch (e) {
        console.error("Failed to fetch quantities for cloning", e);
      }
      
      // 3. Fetch parameters
      let paramsArray = [];
      try {
        const pRes = await axios.get(`sales/package-parameters/${id}`);
        paramsArray = pRes.data?.data?.parameters || pRes.data?.parameters || [];
      } catch (e) {
        console.error("Failed to fetch parameters for cloning", e);
      }
      
      // 4. Create new package
      const payload = {
        package: `Copy Of ${d.package}`,
        type: Number(d.type ?? 0),
        special: Number(d.special ?? 0),
        nabl: Number(d.nabl ?? 1),
        description: d.description ?? "",
        product: Number(d.product ?? ""),
        category: Number(d.category ?? 0),
        standard: Number(d.standard ?? ""),
        rate: Number(d.rate ?? ""),
        currency: Number(d.currency ?? ""),
        days: Number(d.days ?? "")
      };
      const addRes = await axios.post("/sales/add-test-package", payload);
      
      let newId = addRes.data?.id ?? addRes.data?.data?.id ?? addRes.data?.insertId;

      if (!newId) {
        // Fallback: Fetch list to find the newly created one
        const listRes = await axios.get("/sales/get-test-packagelist");
        const list = listRes.data.data ?? [];
        // The list is usually sorted by id desc, find the first match
        const created = list.find(item => item.package === `Copy Of ${d.package}`);
        if (created) {
          newId = created.id;
        }
      }

      if (!newId) {
        toast.error("Failed to clone: Could not retrieve new package ID");
        return;
      }

      // 5. Add quantities
      for (const q of quantities) {
        await axios.post("/sales/add-quantity", {
          name: q.name,
          quantity: Number(q.quantity),
          unit: Number(q.unit),
          package: Number(newId)
        });
      }
      
      // 6. Add parameters
      for (const p of paramsArray) {
        await axios.post("sales/add-package-parameters", {
          package: Number(newId),
          parameter: Number(p.parameter ?? p.parameter_id),
          priority: Number(p.priority),
          visible: Number(p.visible ?? p.visible_id)
        });
      }
      
      toast.success("Test Price Cloned Successfully!");
      navigate(`/dashboards/sales/test-packages/edit/${newId}`);
    } catch (err) {
      toast.error("Failed to clone package");
      console.error(err);
    } finally {
      setCloneLoading(false);
    }
  }, [id, navigate]);

  const deleteState = deleteError
    ? "error"
    : deleteSuccess
      ? "success"
      : "pending";

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {canEdit && (
          <Link
            to={`/dashboards/sales/test-packages/edit/${id}`}
            className="rounded-md border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-50 dark:border-green-900/50 dark:bg-dark-800 dark:text-green-400 dark:hover:bg-green-900/20"
          >
            Edit
          </Link>
        )}
        {canDelete && (
          <button
            onClick={() => {
              setDeleteOpen(true);
              setDeleteError(false);
              setDeleteSuccess(false);
            }}
            className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:bg-dark-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Delete
          </button>
        )}
        {canClone && (
          <button
            onClick={handleClone}
            disabled={cloneLoading}
            className="rounded-md border border-orange-300 bg-white px-3 py-1.5 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-50 disabled:opacity-50 dark:border-orange-900/50 dark:bg-dark-800 dark:text-orange-400 dark:hover:bg-orange-900/20"
          >
            {cloneLoading ? "Loading…" : "Clone"}
          </button>
        )}
      </div>

      <ConfirmModal
        show={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        messages={confirmDeleteMessages}
        onOk={handleDelete}
        confirmLoading={deleteLoading}
        state={deleteState}
      />
    </>
  );
}

RowActions.propTypes = {
  row: PropTypes.object,
  table: PropTypes.object,
};
