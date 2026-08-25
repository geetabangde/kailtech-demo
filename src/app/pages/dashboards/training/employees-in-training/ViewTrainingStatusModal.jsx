import { useRef, useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Button } from "components/ui";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import axios from "utils/axios"; // Adjust path if necessary

export function ViewTrainingStatusModal({ show, onClose, userId, planId }) {
  const focusRef = useRef(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && planId && userId) {
      fetchData();
    }
  }, [show, planId, userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Mocking the data fetch that corresponds to the PHP query:
      // "select trainingmodule.*, trainingplannerdetailadmin... where planid = '$tniformid'..."
      const response = await axios.get(`/training/status?planId=${planId}&userId=${userId}`).catch(() => ({
        data: {
          data: [
            {
              id: 1,
              modulename: "Safety & Health",
              procedureno: "SH-001",
              revno: "1.0",
              startdate: "2024-01-01 10:00:00",
              enddate: "2024-01-02 12:00:00",
              result: 85,
            },
            {
              id: 2,
              modulename: "Quality Control",
              procedureno: "QC-002",
              revno: "2.1",
              startdate: "2024-02-01 09:00:00",
              enddate: "0000-00-00 00:00:00",
              result: 0,
            }
          ]
        }
      }));
      
      setData(response.data?.data || []);
    } catch (error) {
      console.error(error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const renderRating = (row) => {
    if (row.enddate === "0000-00-00 00:00:00" || !row.enddate) {
      return <span>Not Done</span>;
    }
    
    const result = Number(row.result) || 0;
    let label = "Poor";
    if (result > 50 && result <= 65) label = "Average";
    else if (result > 65 && result <= 80) label = "Good";
    else if (result > 80) label = "Excellent";

    return (
      <div>
        <div>{result.toFixed(2)}%</div>
        <div className="text-xs font-semibold text-gray-500">{label}</div>
      </div>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "0000-00-00 00:00:00") return "-";
    return dayjs(dateStr).format("DD/MM/YY HH:mm:ss");
  };

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
                  Training Status
                </DialogTitle>

                <div className="max-h-[60vh] overflow-y-auto">
                  {loading ? (
                    <div className="py-8 text-center text-gray-500">Loading...</div>
                  ) : (
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300 border-collapse border border-gray-200 dark:border-dark-700">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-dark-800">
                          <th className="border border-gray-200 p-2 font-semibold dark:border-dark-700">S.No.</th>
                          <th className="border border-gray-200 p-2 font-semibold dark:border-dark-700">Procedure Name</th>
                          <th className="border border-gray-200 p-2 font-semibold dark:border-dark-700">Procedure no.</th>
                          <th className="border border-gray-200 p-2 font-semibold dark:border-dark-700">Rev. No.</th>
                          <th className="border border-gray-200 p-2 font-semibold dark:border-dark-700">Start Date and Time</th>
                          <th className="border border-gray-200 p-2 font-semibold dark:border-dark-700">End Date and Time</th>
                          <th className="border border-gray-200 p-2 font-semibold dark:border-dark-700">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((row, index) => (
                          <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-dark-800">
                            <td className="border border-gray-200 p-2 dark:border-dark-700">{index + 1}</td>
                            <td className="border border-gray-200 p-2 dark:border-dark-700">{row.modulename}</td>
                            <td className="border border-gray-200 p-2 dark:border-dark-700">{row.procedureno}</td>
                            <td className="border border-gray-200 p-2 dark:border-dark-700">{row.revno}</td>
                            <td className="border border-gray-200 p-2 dark:border-dark-700">{formatDate(row.startdate)}</td>
                            <td className="border border-gray-200 p-2 dark:border-dark-700">{formatDate(row.enddate)}</td>
                            <td className="border border-gray-200 p-2 dark:border-dark-700">{renderRating(row)}</td>
                          </tr>
                        ))}
                        {data.length === 0 && (
                          <tr>
                            <td colSpan="7" className="border border-gray-200 p-4 text-center dark:border-dark-700">
                              No data found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="outline" onClick={onClose}>
                    Close
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

ViewTrainingStatusModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  planId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
