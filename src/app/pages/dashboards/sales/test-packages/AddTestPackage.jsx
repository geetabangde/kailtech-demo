// Import Dependencies
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import Select from "react-select";
import axios from "utils/axios";
import { toast } from "sonner";

// Local Imports
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import {
  FormRow,
  useTestPackageDropdowns,
  inputCls,
} from "./TestPackageForm";

// ----------------------------------------------------------------------

const NABL_OPTIONS = [
  { value: 1, label: "NABL" },
  { value: 3, label: "QAI" },
  { value: 2, label: "NO" },
];

const defaultForm = {
  package: "",
  type: 0,
  special: 0,
  nabl: 1,
  description: "",
  product: "",
  category: 0,
  standard: "",
  rate: "",
  currency: "",
  days: "",
};

// ── Quantity Modal (Local) ─────────────────────────────────────────────────────────
function QuantityModal({ onClose, onAdded }) {
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({ name: "", quantity: "", unit: "" });

  useEffect(() => {
    axios.get("/master/units-list").then((res) => {
      const list = res.data.data ?? [];
      setUnits(list);
      if (list[0]) setForm((p) => ({ ...p, unit: list[0].id }));
    });
  }, []);

  const handleAdd = () => {
    if (!form.name || !form.quantity || !form.unit) {
      toast.error("Fill all quantity fields");
      return;
    }
    const unitObj = units.find(u => String(u.id) === String(form.unit));
    onAdded({
      id: Date.now() + Math.random(),
      name: form.name,
      quantity: Number(form.quantity),
      unit: Number(form.unit),
      unit_name: unitObj ? unitObj.name : form.unit
    });
    setForm({ name: "", quantity: "", unit: units[0]?.id ?? "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="dark:bg-dark-800 w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 className="dark:text-dark-50 text-base font-semibold text-gray-800">
            Add New Quantity
          </h3>
          <button onClick={onClose} className="dark:hover:text-dark-200 text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label className="dark:text-dark-300 mb-1 block text-sm font-medium text-gray-600">Quantity Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="ex: 2m straight pipe, 4m bar etc" className={inputCls} />
          </div>
          <div>
            <label className="dark:text-dark-300 mb-1 block text-sm font-medium text-gray-600">Quantity</label>
            <input type="number" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} placeholder="Quantity" className={inputCls} />
          </div>
          <div>
            <label className="dark:text-dark-300 mb-1 block text-sm font-medium text-gray-600">Unit</label>
            <Select
              options={units.map((u) => ({ value: u.id, label: u.name + (u.description ? ` (${u.description})` : "") }))}
              value={units.map((u) => ({ value: u.id, label: u.name + (u.description ? ` (${u.description})` : "") })).find((o) => String(o.value) === String(form.unit)) || null}
              onChange={(opt) => setForm((p) => ({ ...p, unit: opt ? opt.value : "" }))}
              placeholder="Select Unit..." isSearchable
            />
          </div>
        </div>
        <div className="dark:border-dark-500 flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button onClick={onClose} className="dark:border-dark-500 dark:text-dark-300 rounded-md border border-gray-300 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50">Close</button>
          <button onClick={handleAdd} className="w-full rounded-md bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700">Add Quantity</button>
        </div>
      </div>
    </div>
  );
}

// ── Parameter Modal (Local) ────────────────────────────────────────────────────────
function ParameterModal({ onClose, onAdded }) {
  const [parameters, setParameters] = useState([]);
  const [choices] = useState([{ id: 1, name: "Yes" }, { id: 2, name: "No" }]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    parameter: "",
    visible: "",
    priority: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [paramRes] = await Promise.allSettled([
          axios.get("sales/test-parameters"),
        ]);
        if (paramRes.status === "fulfilled" && paramRes.value.data?.data) {
          setParameters(paramRes.value.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = () => {
    if (!form.parameter) {
      toast.error("Please select a parameter");
      return;
    }
    if (!form.visible) {
      toast.error("Please select visibility");
      return;
    }
    if (!form.priority) {
      toast.error("Please enter a priority");
      return;
    }
    const paramObj = parameters.find(p => String(p.id) === String(form.parameter));
    const visObj = choices.find(c => String(c.id) === String(form.visible));

    onAdded({
      id: Date.now() + Math.random(),
      parameter: Number(form.parameter),
      parameter_name: paramObj ? paramObj.name : form.parameter,
      parameter_description: paramObj ? paramObj.description : "",
      priority: Number(form.priority),
      visible: Number(form.visible),
      visible_name: visObj ? visObj.name : ""
    });
    setForm({ parameter: "", visible: "", priority: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="dark:bg-dark-800 w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 className="dark:text-dark-50 text-base font-semibold text-gray-800">Add New Parameter</h3>
          <button onClick={onClose} className="dark:hover:text-dark-200 text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="space-y-4 p-5">
          {loading ? (
            <div className="flex justify-center p-4"><span className="text-gray-500">Loading...</span></div>
          ) : (
            <>
              <div>
                <label className="dark:text-dark-300 mb-1 block text-sm font-medium text-gray-600">Parameter Name</label>
                <Select
                  options={parameters.map((p) => ({ value: p.id, label: p.name + (p.description ? ` (${p.description})` : "") }))}
                  value={parameters.map((p) => ({ value: p.id, label: p.name + (p.description ? ` (${p.description})` : "") })).find((o) => String(o.value) === String(form.parameter)) || null}
                  onChange={(opt) => setForm((p) => ({ ...p, parameter: opt ? opt.value : "" }))}
                  placeholder="Select Parameter Name" isSearchable menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
              </div>
              <div>
                <label className="dark:text-dark-300 mb-1 block text-sm font-medium text-gray-600">Visible In Report ?</label>
                <Select
                  options={choices.map((c) => ({ value: c.id, label: c.name }))}
                  value={choices.map((c) => ({ value: c.id, label: c.name })).find((o) => String(o.value) === String(form.visible)) || null}
                  onChange={(opt) => setForm((p) => ({ ...p, visible: opt ? opt.value : "" }))}
                  placeholder="Select Choice" menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
              </div>
              <div>
                <label className="dark:text-dark-300 mb-1 block text-sm font-medium text-gray-600">Priority</label>
                <input type="number" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} placeholder="Priority" className={inputCls} />
              </div>
            </>
          )}
        </div>
        <div className="dark:border-dark-500 flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button onClick={onClose} className="dark:border-dark-500 dark:text-dark-300 rounded-md border border-gray-300 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50">Close</button>
          <button onClick={handleAdd} disabled={loading} className="w-full rounded-md bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">Add Parameter</button>
        </div>
      </div>
    </div>
  );
}

export default function AddTestPackage() {
  const navigate = useNavigate();
  const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");

  useEffect(() => {
    if (!permissions.includes(263)) {
      navigate("/dashboards/sales/test-packages");
    }
  }, [navigate, permissions]);
  const { products, standards, currencies, loading } =
    useTestPackageDropdowns();

  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [quantities, setQuantities] = useState([]);
  const [packageParams, setPackageParams] = useState([]);
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [showParamModal, setShowParamModal] = useState(false);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    if (!form.package) {
      toast.error("Package name is required");
      return;
    }
    if (!form.product) {
      toast.error("Please select a product");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        package: form.package,
        type: Number(form.type),
        special: Number(form.special),
        nabl: Number(form.nabl),
        description: form.description,
        product: Number(form.product),
        category: Number(form.category),
        standard: Number(form.standard),
        rate: Number(form.rate),
        currency: Number(form.currency),
        days: Number(form.days),
      };
      const res = await axios.post("/sales/add-test-package", payload);
      if (
        res.data.success === true ||
        res.data.status === true ||
        res.data.status === "true"
      ) {
        let newId = res.data?.id ?? res.data?.data?.id ?? res.data?.insertId;

        if (!newId) {
          const listRes = await axios.get("/sales/get-test-packagelist");
          const list = listRes.data.data ?? [];
          const created = list.find(item => item.package === form.package);
          if (created) {
            newId = created.id;
          }
        }

        if (newId) {
          for (const q of quantities) {
            await axios.post("/sales/add-quantity", {
              name: q.name,
              quantity: Number(q.quantity),
              unit: Number(q.unit),
              package: Number(newId)
            });
          }
          
          for (const p of packageParams) {
            await axios.post("sales/add-package-parameters", {
              package: Number(newId),
              parameter: Number(p.parameter),
              priority: Number(p.priority),
              visible: Number(p.visible)
            });
          }
        }

        toast.success(res.data.message ?? "Test package added ✅");
        navigate("/dashboards/sales/test-packages");
      } else {
        toast.error(res.data.message ?? "Failed to add package");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Page title="Add Test Price">
        <div className="flex h-[60vh] items-center justify-center text-gray-600">
          <svg
            className="mr-2 h-6 w-6 animate-spin text-blue-600"
            viewBox="0 0 24 24"
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
          Loading...
        </div>
      </Page>
    );
  }

  return (
    <Page title="Add New Test Price">
      <div className="transition-content px-[var(--margin-x)] pb-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="dark:text-dark-50 text-xl font-semibold text-gray-800">
            Add New Test Price
          </h2>
          <Link
            to="/dashboards/sales/test-packages"
            className="dark:border-dark-500 dark:text-dark-300 dark:hover:bg-dark-700 rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            ← Back to Price List
          </Link>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Package Name */}
            <div className="sm:col-span-2">
              <FormRow label="Test Package Name" required>
                <input
                  type="text"
                  value={form.package}
                  onChange={(e) => set("package", e.target.value)}
                  placeholder="Test Package"
                  className={inputCls}
                />
              </FormRow>
            </div>

            {/* Package Type */}
            <FormRow label="Package Type">
              <Select
                options={[
                  { value: 1, label: "Perform All Tests" },
                  { value: 0, label: "Upload Report Directly" },
                ]}
                value={[
                  { value: 1, label: "Perform All Tests" },
                  { value: 0, label: "Upload Report Directly" },
                ].find((o) => String(o.value) === String(form.type)) || null}
                onChange={(opt) => set("type", opt ? opt.value : "")}
                isClearable
                placeholder="Select Type..."
              />
            </FormRow>

            {/* NABL */}
            <FormRow label="Covered Under Accreditation?">
              <Select
                options={NABL_OPTIONS}
                value={NABL_OPTIONS.find((o) => String(o.value) === String(form.nabl)) || null}
                onChange={(opt) => set("nabl", opt ? opt.value : "")}
                isClearable
                placeholder="Select Status..."
              />
            </FormRow>

            {/* Description */}
            <div className="sm:col-span-2">
              <FormRow label="Description">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Description"
                  className={`${inputCls} resize-none`}
                />
              </FormRow>
            </div>

            {/* Product */}
            <FormRow label="Product Name" required>
              <Select
                options={products.map((p) => ({
                  value: p.id,
                  label: p.name + (p.description ? ` (${p.description})` : ""),
                }))}
                value={
                  products
                    .map((p) => ({
                      value: p.id,
                      label: p.name + (p.description ? ` (${p.description})` : ""),
                    }))
                    .find((o) => String(o.value) === String(form.product)) || null
                }
                onChange={(opt) => set("product", opt ? opt.value : "")}
                isClearable
                isSearchable
                placeholder="Select Product..."
              />
            </FormRow>

            {/* Special Package */}
            <FormRow label="Special Package">
              <Select
                options={[
                  { value: 1, label: "Yes" },
                  { value: 0, label: "No" },
                ]}
                value={[
                  { value: 1, label: "Yes" },
                  { value: 0, label: "No" },
                ].find((o) => String(o.value) === String(form.special)) || null}
                onChange={(opt) => set("special", opt ? opt.value : "")}
                isClearable
                placeholder="Select..."
              />
            </FormRow>

            {/* BIS Category */}
            <FormRow label="It Is BIS Price">
              <Select
                options={[
                  { value: 1, label: "Yes, BIS" },
                  { value: 0, label: "No, General" },
                ]}
                value={[
                  { value: 1, label: "Yes, BIS" },
                  { value: 0, label: "No, General" },
                ].find((o) => String(o.value) === String(form.category)) || null}
                onChange={(opt) => set("category", opt ? opt.value : "")}
                isClearable
                placeholder="Select Category..."
              />
            </FormRow>

            {/* Standard */}
            <FormRow label="Standards">
              <Select
                options={standards.map((s) => ({
                  value: s.id,
                  label: s.name + (s.description ? ` (${s.description})` : ""),
                }))}
                value={
                  standards
                    .map((s) => ({
                      value: s.id,
                      label: s.name + (s.description ? ` (${s.description})` : ""),
                    }))
                    .find((o) => String(o.value) === String(form.standard)) || null
                }
                onChange={(opt) => set("standard", opt ? opt.value : "")}
                isClearable
                isSearchable
                placeholder="Select Standard..."
              />
            </FormRow>

            {/* Rate */}
            <FormRow label="Rate">
              <input
                type="number"
                value={form.rate}
                onChange={(e) => set("rate", e.target.value)}
                placeholder="Rate"
                className={inputCls}
              />
            </FormRow>

            {/* Currency */}
            <FormRow label="Currency">
              <Select
                options={currencies.map((c) => ({
                  value: c.id,
                  label: c.name + (c.description ? ` (${c.description})` : ""),
                }))}
                value={
                  currencies
                    .map((c) => ({
                      value: c.id,
                      label: c.name + (c.description ? ` (${c.description})` : ""),
                    }))
                    .find((o) => String(o.value) === String(form.currency)) || null
                }
                onChange={(opt) => set("currency", opt ? opt.value : "")}
                isClearable
                isSearchable
                placeholder="Select Currency..."
              />
            </FormRow>

            {/* Days */}
            <FormRow label="No. Of Days Required">
              <input
                type="number"
                value={form.days}
                onChange={(e) => set("days", e.target.value)}
                placeholder="No. Of Days"
                className={inputCls}
              />
            </FormRow>
          </div>

          {/* ── Quantity Section ── */}
          <div className="dark:border-dark-500 mt-6 rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="dark:text-dark-200 text-sm font-semibold text-gray-700">Quantity</h4>
              <button onClick={() => setShowQtyModal(true)} className="rounded bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600">
                + Add New Quantity
              </button>
            </div>
            {quantities.length > 0 ? (
              <div className="space-y-2">
                {quantities.map((q) => (
                  <div key={q.id} className="dark:bg-dark-700 flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm">
                    <span className="dark:text-dark-100 flex-1 font-medium text-gray-800">{q.name}</span>
                    <span className="dark:text-dark-300 text-gray-600">Qty: {q.quantity}</span>
                    <span className="dark:text-dark-400 text-gray-500">Unit: {q.unit_name ?? q.unit}</span>
                    <button onClick={() => setQuantities(old => old.filter(x => x.id !== q.id))} className="rounded bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600">Remove</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dark:text-dark-500 text-xs text-gray-400">No quantity added yet.</p>
            )}
          </div>

          {/* ── Parameters Section ── */}
          <div className="dark:border-dark-500 mt-6 rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="dark:text-dark-200 text-sm font-semibold text-gray-700">Parameters</h4>
              <button onClick={() => setShowParamModal(true)} className="rounded bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600">
                + Add New Parameter
              </button>
            </div>
            {packageParams.length > 0 ? (
              <div className="space-y-2">
                {packageParams.map((p) => (
                  <div key={p.id} className="dark:bg-dark-700 flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm">
                    <span className="dark:text-dark-100 flex-1 font-medium text-gray-800">
                      {p.parameter_name} {p.parameter_description ? `(${p.parameter_description})` : ""}
                    </span>
                    <span className="dark:text-dark-300 text-gray-600">Priority: {p.priority}</span>
                    <span className="dark:text-dark-400 text-gray-500">Visible: {p.visible_name}</span>
                    <button onClick={() => setPackageParams(old => old.filter(x => x.id !== p.id))} className="rounded bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600">Remove</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dark:text-dark-500 text-xs text-gray-400">No parameters added yet.</p>
            )}
          </div>

          {showQtyModal && <QuantityModal onClose={() => setShowQtyModal(false)} onAdded={(qty) => { setQuantities(old => [...old, qty]); toast.success('Quantity added'); }} />}
          {showParamModal && <ParameterModal onClose={() => setShowParamModal(false)} onAdded={(param) => { setPackageParams(old => [...old, param]); toast.success('Parameter added'); }} />}

          {/* ── Submit ── */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-md bg-green-600 px-8 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Add Test Price"}
            </button>
          </div>
        </Card>
      </div>
    </Page>
  );
}
