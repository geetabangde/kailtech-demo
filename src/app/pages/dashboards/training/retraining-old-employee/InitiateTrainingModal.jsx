import { useState, useEffect, useRef } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Button } from "components/ui";
import { toast } from "sonner";
import axios from "utils/axios";
import PropTypes from "prop-types";

export function InitiateTrainingModal({ show, onClose, users = [], onSuccess }) {
  const focusRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (show) {
      setSelectedModules([]);
      fetchModules();
    }
  }, [show]);

  const fetchModules = async () => {
    try {
      setFetching(true);
      // Replace with actual endpoint: axios.get('/training/initiation-modules')
      const response = await axios.get(`/training/get-training-modules`);
      
      // Simulating grouped response based on PHP logic
      if (response.data?.data) {
        // Assume API returns flat list, we group it here or API returns grouped
        const allModules = response.data.data;
        const grouped = [
          {
            id: 1,
            name: "Safety",
            modules: allModules,
          }
        ];
        setDepartments(grouped);
      } else {
        throw new Error("No data");
      }
    } catch (err) {
      console.warn("Could not fetch training modules, using fallback data.", err);
      // Fallback for development
      setDepartments([
        {
          id: 1,
          name: "Quality Control",
          modules: [
            { id: 101, modulename: "ISO 9001", procedureno: "QC-01", revno: "1.0", category: "Standard", description: "Basics of ISO" },
            { id: 102, modulename: "Good Lab Practices", procedureno: "QC-02", revno: "2.1", category: "Standard", description: "GLP Guidelines" }
          ]
        },
        {
          id: 2,
          name: "Safety & Health",
          modules: [
            { id: 201, modulename: "Fire Safety", procedureno: "SAF-01", revno: "1.0", category: "Safety", description: "Extinguisher usage" }
          ]
        }
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

  const toggleDepartment = (deptId, moduleIds, isChecked) => {
    if (isChecked) {
      const newSelected = [...selectedModules];
      moduleIds.forEach(id => {
        if (!newSelected.includes(id)) newSelected.push(id);
      });
      setSelectedModules(newSelected);
    } else {
      setSelectedModules(prev => prev.filter(id => !moduleIds.includes(id)));
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
      const userIds = users.map(u => u.id).join(",");
      const modulesStr = selectedModules.join(",");
      
      // Replace with actual endpoint: axios.post('/training/initiate-retraining', { userIds, modulesStr })
      console.log("Mock API Payload:", { userIds, modulesStr });
      await new Promise(r => setTimeout(r, 1000)); // Mock API delay
      
      toast.success("Training initiated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to initiate training.");
    } finally {
      setLoading(false);
    }
  };

  const userNames = users.map(u => `${u.firstname || u.name} (${u.empid})`).join(", ");

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
              <DialogPanel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-dark-900">
                <DialogTitle
                  as="h3"
                  className="mb-4 text-lg font-medium leading-6 text-gray-900 dark:text-dark-50"
                  ref={focusRef}
                >
                  Identify Training Of `{userNames}`
                </DialogTitle>

                <div className="max-h-[70vh] overflow-y-auto pr-2">
                  <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Modules on Which Training Should be given
                  </h4>

                  {fetching ? (
                    <div className="py-10 text-center text-gray-500">Loading modules...</div>
                  ) : (
                    <form id="initiateTrainingForm" onSubmit={handleSubmit} className="space-y-6">
                      {departments.map((dept) => {
                        const deptModuleIds = dept.modules.map(m => m.id);
                        const isAllSelected = deptModuleIds.every(id => selectedModules.includes(id));
                        
                        return (
                          <div key={dept.id} className="rounded-lg border border-gray-200 p-4 dark:border-dark-700">
                            <div className="mb-3 flex items-center border-b border-gray-200 pb-2 dark:border-dark-700">
                              <input
                                type="checkbox"
                                className="mr-2 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={isAllSelected && deptModuleIds.length > 0}
                                onChange={(e) => toggleDepartment(dept.id, deptModuleIds, e.target.checked)}
                              />
                              <h5 className="font-semibold text-gray-800 dark:text-dark-100">
                                {dept.name}
                              </h5>
                            </div>
                            
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                                <thead>
                                  <tr className="border-b border-gray-100 dark:border-dark-700">
                                    <th className="py-2 pr-4 font-semibold">Name</th>
                                    <th className="py-2 pr-4 font-semibold">Procedure no</th>
                                    <th className="py-2 pr-4 font-semibold">Rev No</th>
                                    <th className="py-2 pr-4 font-semibold">Category</th>
                                    <th className="py-2 pr-4 font-semibold">Department</th>
                                    <th className="py-2 font-semibold">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {dept.modules.map(mod => (
                                    <tr key={mod.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 dark:border-dark-800 dark:hover:bg-dark-800">
                                      <td className="py-2 pr-4">
                                        <div className="flex items-center">
                                          <input
                                            type="checkbox"
                                            className="mr-2 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedModules.includes(mod.id)}
                                            onChange={() => toggleModule(mod.id)}
                                          />
                                          {mod.modulename}
                                        </div>
                                      </td>
                                      <td className="py-2 pr-4">{mod.procedureno}</td>
                                      <td className="py-2 pr-4">{mod.revno}</td>
                                      <td className="py-2 pr-4">{mod.category}</td>
                                      <td className="py-2 pr-4">{dept.name}</td>
                                      <td className="py-2">{mod.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </form>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3 border-t border-gray-100 pt-4 dark:border-dark-700">
                  <Button variant="outline" onClick={onClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" form="initiateTrainingForm" disabled={loading || fetching} loading={loading}>
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

InitiateTrainingModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  users: PropTypes.array,
  onSuccess: PropTypes.func,
};
