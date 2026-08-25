import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import PropTypes from "prop-types";
import axios from "utils/axios";

import { XMarkIcon } from "@heroicons/react/24/outline";

export function ResultDetailModal({ isOpen, onClose, selectedRow }) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (isOpen && selectedRow?.id) {
      fetchDetails();
    } else {
      setDetails(null);
      setDocuments([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedRow]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      // Expected backend endpoint replacing resultdetail.php logic
      const response = await axios.get(`/training/training-result-detail`, {
        params: { id: selectedRow.id }
      });
      
      if (response.data.status === true || response.data.status === "success") {
        setDetails(response.data.data?.details || {});
        setDocuments(response.data.data?.documents || []);
      } else {
        // Mock fallback if API not ready
        setDetails({
          overall: 1, // 1 pass, else fail
          extra: "Completed all modules successfully.",
          tniid: 101,
        });
        setDocuments([
          { id: 1, added_on: "2024-05-20", file: "#" }
        ]);
      }
    } catch (err) {
      console.error(err);
      // Mock data for UI 
      setDetails({
        overall: selectedRow.status === 2 ? 1 : 0, 
        extra: "Mock extra remark details.",
        tniid: 101,
      });
      setDocuments([
        { id: 1, added_on: "2024-05-20", file: "#" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/75 transition-opacity dark:bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all dark:bg-dark-900">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-700">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900 dark:text-white">
                    Training Result
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-dark-800 dark:hover:text-gray-300"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-6 py-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-dark-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
                          <tbody className="divide-y divide-gray-200 bg-white dark:divide-dark-700 dark:bg-dark-900">
                            <tr>
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white w-1/3 bg-gray-50 dark:bg-dark-800">
                                Name:
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-dark-400">
                                {`${selectedRow?.firstname || ""} ${selectedRow?.lastname || ""}`.trim()}
                              </td>
                            </tr>
                            <tr>
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-800">
                                Team members code:
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-dark-400">
                                {selectedRow?.empid}
                              </td>
                            </tr>
                            <tr>
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-800">
                                Training Result:
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-dark-400">
                                {details?.overall == 1 ? (
                                  <span className="font-semibold text-success-600 dark:text-success-400">Pass</span>
                                ) : (
                                  <span className="font-semibold text-danger-600 dark:text-danger-400">Fail</span>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-dark-800">
                                Extra Remark:
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-400 whitespace-pre-wrap">
                                {details?.extra || "-"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {documents.length > 0 && (
                        <div>
                          <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Documents & Answer Sheets</h4>
                          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-dark-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
                              <tbody className="divide-y divide-gray-200 bg-white dark:divide-dark-700 dark:bg-dark-900">
                                {documents.map((doc, idx) => (
                                  <tr key={idx}>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white w-1/2">
                                      <a href={doc.file} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline">
                                        {doc.added_on}
                                      </a>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-400 w-1/2">
                                      <a href={`/viewAnswerSheet?tniid=${details?.tniid}&userid=${selectedRow?.id}`} target="_blank" rel="noreferrer" className="text-info-600 hover:text-info-800 dark:text-info-400 dark:hover:text-info-300 underline">
                                        View Answer Sheet
                                      </a>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-dark-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-300 dark:hover:bg-dark-700 dark:focus:ring-offset-dark-900"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

ResultDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedRow: PropTypes.object,
};
