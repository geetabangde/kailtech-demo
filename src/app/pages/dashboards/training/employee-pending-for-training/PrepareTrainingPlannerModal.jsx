import { useState, useEffect, useRef } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Button, Input, Select } from "components/ui";
import { toast } from "sonner";
import axios from "utils/axios";
import PropTypes from "prop-types";

export function PrepareTrainingPlannerModal({ show, onClose, row, onSuccess }) {
  const focusRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  
  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    if (show) {
      setModules([]);
      setSelectedModuleId("");
      fetchModules();
    }
  }, [show]);

  const fetchModules = async () => {
    try {
      const response = await axios.get(`/training/get-training-modules`);
      if (response.data?.data) {
        setAvailableModules(response.data.data);
      }
    } catch (err) {
      console.warn("Could not fetch training modules, using fallback data.", err);
      // Fallback for development if API is missing
      setAvailableModules([
        { id: "1", name: "Safety Training", code: "SFT-01", revno: "0" },
        { id: "2", name: "Quality Assurance", code: "QA-02", revno: "1" },
      ]);
    }
  };

  const addModule = () => {
    if (!selectedModuleId) return;
    const mod = availableModules.find(m => String(m.id) === String(selectedModuleId));
    if (!mod) return;
    
    // Check if already added
    if (modules.some(m => String(m.moduleid) === String(selectedModuleId))) {
      toast.error("Module already added");
      return;
    }

    setModules([
      ...modules,
      {
        moduleid: mod.id,
        name: mod.name,
        code: `${mod.code}-${mod.revno}`,
        typeoftraining: "Internal",
        meansoftraining: "Offline",
        month: "",
        traininghours: "",
        trainer: "",
      }
    ]);
    setSelectedModuleId("");
  };

  const removeModule = (index) => {
    const newMods = [...modules];
    newMods.splice(index, 1);
    setModules(newMods);
  };

  const handleModuleChange = (index, field, value) => {
    const newMods = [...modules];
    newMods[index][field] = value;
    setModules(newMods);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modules.length === 0) {
      toast.error("No Module is Added");
      return;
    }
    
    try {
      setLoading(true);
      const payload = {
        userid: row?.id,
        year: formData.year,
        modules: modules,
      };
      
      await axios.post(`/training/insert-training-planner`, payload);
      toast.success("Training planner saved successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save planner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={show}>
      <Dialog as="div" className="relative z-[70]" initialFocus={focusRef} onClose={loading ? () => {} : onClose}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-5">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="scrollbar-sm relative w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-dark-700">
                <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900 dark:text-dark-50 border-b pb-3 dark:border-dark-600">
                  Prepare Training Planner
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md dark:bg-dark-800">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year Of Training</label>
              <Input type="number" min="2000" max="2100" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} required className="w-full" ref={focusRef} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name of Employee</label>
              <div className="p-2 bg-gray-200 dark:bg-dark-600 rounded-md text-sm">{row?.firstname} {row?.lastname}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Of Joining</label>
              <div className="p-2 bg-gray-200 dark:bg-dark-600 rounded-md text-sm">{row?.joiningdate || '-'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <div className="p-2 bg-gray-200 dark:bg-dark-600 rounded-md text-sm">{row?.dname || '-'}</div>
            </div>
          </div>

          <div className="flex items-end gap-4 mt-6">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Training Module</label>
              <Select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)} className="w-full">
                <option value="">Select Module</option>
                {availableModules.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.code}-{m.revno})</option>
                ))}
              </Select>
            </div>
            <Button type="button" onClick={addModule} variant="outlined">Add</Button>
          </div>

          {modules.length > 0 && (
            <div className="overflow-x-auto mt-4 border rounded-md dark:border-dark-600">
              <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-100 dark:bg-dark-800">
                  <tr>
                    <th className="p-3 border-b dark:border-dark-600 font-medium">Sr no</th>
                    <th className="p-3 border-b dark:border-dark-600 font-medium">Topic / Procedure</th>
                    <th className="p-3 border-b dark:border-dark-600 font-medium">Code</th>
                    <th className="p-3 border-b dark:border-dark-600 font-medium">Type</th>
                    <th className="p-3 border-b dark:border-dark-600 font-medium">Means</th>
                    <th className="p-3 border-b dark:border-dark-600 font-medium">Month</th>
                    <th className="p-3 border-b dark:border-dark-600 font-medium">Hours</th>
                    <th className="p-3 border-b dark:border-dark-600 font-medium">Trainer</th>
                    <th className="p-3 border-b dark:border-dark-600 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((m, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-800/50">
                      <td className="p-3 border-b dark:border-dark-600">{index + 1}</td>
                      <td className="p-3 border-b dark:border-dark-600">{m.name}</td>
                      <td className="p-3 border-b dark:border-dark-600">{m.code}</td>
                      <td className="p-3 border-b dark:border-dark-600">
                        <Select value={m.typeoftraining} onChange={(e) => handleModuleChange(index, "typeoftraining", e.target.value)} className="w-32 py-1">
                          <option value="Internal">Internal</option>
                          <option value="External">External</option>
                        </Select>
                      </td>
                      <td className="p-3 border-b dark:border-dark-600">
                        <Select value={m.meansoftraining} onChange={(e) => handleModuleChange(index, "meansoftraining", e.target.value)} className="w-28 py-1">
                          <option value="Offline">Offline</option>
                          <option value="Online">Online</option>
                        </Select>
                      </td>
                      <td className="p-3 border-b dark:border-dark-600">
                        <Input type="month" value={m.month} onChange={(e) => handleModuleChange(index, "month", e.target.value)} className="w-36 py-1" />
                      </td>
                      <td className="p-3 border-b dark:border-dark-600">
                        <Input type="number" min="0" step="0.5" value={m.traininghours} onChange={(e) => handleModuleChange(index, "traininghours", e.target.value)} className="w-20 py-1" />
                      </td>
                      <td className="p-3 border-b dark:border-dark-600">
                        <Input type="text" value={m.trainer} onChange={(e) => handleModuleChange(index, "trainer", e.target.value)} className="w-32 py-1" placeholder="Trainer ID/Name" />
                      </td>
                      <td className="p-3 border-b dark:border-dark-600">
                        <button type="button" onClick={() => removeModule(index)} className="text-danger-500 hover:text-danger-700">
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t pt-4 dark:border-dark-600">
            <Button type="button" variant="outlined" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="filled" color="primary" loading={loading} disabled={loading || modules.length === 0}>Save Planner</Button>
          </div>
        </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

PrepareTrainingPlannerModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  row: PropTypes.object,
  onSuccess: PropTypes.func,
};
