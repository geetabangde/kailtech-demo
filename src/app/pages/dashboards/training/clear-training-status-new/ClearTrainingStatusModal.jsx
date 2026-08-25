import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import axios from "utils/axios";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Button } from "components/ui";

export function ClearTrainingStatusModal({ isOpen, onClose, selectedUser, onSuccess }) {
  const focusRef = useRef(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [fetchingModules, setFetchingModules] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      setFetchingModules(true);
      try {
        // Assuming tniid is the training planner ID
        const response = await axios.get(`/training/modules/${selectedUser.tniid}`);
        setModules(response.data || []);
      } catch (e) {
        console.error(e);
        // Fallback empty state
        setModules([]);
      } finally {
        setFetchingModules(false);
      }
    };

    if (isOpen && selectedUser) {
      fetchModules();
    }
  }, [isOpen, selectedUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/training/approve-training", {
        userid: selectedUser.id,
        empid: selectedUser.empid,
        tniform: selectedUser.tniid,
        extra: remarks,
        overall: 1, // as per php logic
      });
      toast.success("Training Successfully Approved");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear training status");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !selectedUser) return null;

  return (
    <Transition appear show={isOpen}>
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
              <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-dark-900">
                <DialogTitle
                  as="h3"
                  className="mb-4 text-lg font-medium leading-6 text-gray-900 dark:text-dark-50"
                  ref={focusRef}
                >
                  Clear Training Status
                </DialogTitle>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Team members code
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={selectedUser.empid || ""}
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:border-dark-600 dark:bg-dark-800 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Extra Remarks
                      </label>
                      <textarea
                        rows={4}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:border-dark-600 dark:bg-dark-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-md mb-2 font-medium text-gray-900 dark:text-white">Training Modules</h4>
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300 dark:divide-dark-700">
                        <thead className="bg-gray-50 dark:bg-dark-800">
                          <tr>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">S.No.</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Procedure Name</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Start Date</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">End Date</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Rating</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-dark-700 dark:bg-dark-900">
                          {fetchingModules ? (
                            <tr>
                              <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500">Loading...</td>
                            </tr>
                          ) : modules.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500">No modules found</td>
                            </tr>
                          ) : (
                            modules.map((mod, idx) => (
                              <tr key={mod.id || idx}>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{idx + 1}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">{mod.modulename}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{mod.startdate}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{mod.enddate}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{mod.result}%</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <Button type="button" variant="solid" color="gray" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="solid" color="blue" disabled={loading}>
                      {loading ? "Approving..." : "Submit"}
                    </Button>
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
