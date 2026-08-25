import { useState, useEffect, useRef } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Button } from "components/ui";
import { toast } from "sonner";
import axios from "utils/axios";
import PropTypes from "prop-types";

export function ActivateTrainingOldModal({ show, onClose, user, onSuccess }) {
  const focusRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (show && user) {
      setSelectedModules([]);
      fetchModules();
    }
  }, [show, user]);

  const fetchModules = async () => {
    try {
      setFetching(true);
      // Replace with actual endpoint: axios.get('/training/old-modules')
      const response = await axios.get(`/training/get-training-modules`);
      
      if (response.data?.data) {
        setModules(response.data.data);
      } else {
        throw new Error("No data");
      }
    } catch (err) {
      console.warn("Could not fetch old training modules, using fallback data.", err);
      // Fallback for development
      setModules([
        { id: 101, dname: "ISO 9001", trainer: "Admin User", docnumber: "DOC-01", revno: "1.0" },
        { id: 102, dname: "Good Lab Practices", trainer: "Lab Manager", docnumber: "DOC-02", revno: "2.1" }
      ]);
    } finally {
      setFetching(false);
    }
  };

  const toggleModule = (moduleId) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId) 
        : [...prev, moduleId]
    );
  };

  const toggleAll = (isChecked) => {
    if (isChecked) {
      setSelectedModules(modules.map(m => m.id));
    } else {
      setSelectedModules([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedModules.length === 0) {
      toast.error("Please select at least one module");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        userid: user?.id,
        modules: selectedModules.join(",")
      };
      
      // Replace with actual endpoint: axios.post('/training/activate-old', payload)
      console.log("Mock API call with payload:", payload);
      await new Promise(r => setTimeout(r, 1000)); // Mock API delay
      
      toast.success("Old training activated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to activate old training.");
    } finally {
      setLoading(false);
    }
  };

  const isAllSelected = modules.length > 0 && selectedModules.length === modules.length;

  return (
    <Transition appear show={show}>
      <Dialog as="div" className="relative z-[70]" onClose={onClose} initialFocus={focusRef}>
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-dark-900">
                <DialogTitle
                  as="h3"
                  className="mb-4 text-lg font-medium leading-6 text-gray-900 dark:text-dark-50"
                  ref={focusRef}
                >
                  Identify Training Of {user ? `${user.firstname || user.name} (${user.empid})` : ""}
                </DialogTitle>

                <div className="max-h-[70vh] overflow-y-auto pr-2">
                  <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Modules on Which Training Should be given
                  </h4>

                  {fetching ? (
                    <div className="py-10 text-center text-gray-500">Loading modules...</div>
                  ) : (
                    <form id="activateOldForm" onSubmit={handleSubmit}>
                      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-700">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 dark:bg-dark-800 dark:border-dark-700">
                              <th className="py-3 px-4 font-semibold w-12">
                                <input
                                  type="checkbox"
                                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={isAllSelected}
                                  onChange={(e) => toggleAll(e.target.checked)}
                                />
                              </th>
                              <th className="py-3 px-4 font-semibold">Name (Description)</th>
                              <th className="py-3 px-4 font-semibold">Trainer</th>
                              <th className="py-3 px-4 font-semibold">Document No/Revision no</th>
                            </tr>
                          </thead>
                          <tbody>
                            {modules.map(mod => (
                              <tr key={mod.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-dark-800 dark:hover:bg-dark-800/50">
                                <td className="py-3 px-4">
                                  <input
                                    type="checkbox"
                                    className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={selectedModules.includes(mod.id)}
                                    onChange={() => toggleModule(mod.id)}
                                  />
                                </td>
                                <td className="py-3 px-4">{mod.dname}</td>
                                <td className="py-3 px-4">{mod.trainer}</td>
                                <td className="py-3 px-4">{mod.docnumber}/{mod.revno}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </form>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3 border-t border-gray-100 pt-4 dark:border-dark-700">
                  <Button variant="outline" onClick={onClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" form="activateOldForm" disabled={loading || fetching} loading={loading}>
                    Submit
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

ActivateTrainingOldModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  onSuccess: PropTypes.func,
};
