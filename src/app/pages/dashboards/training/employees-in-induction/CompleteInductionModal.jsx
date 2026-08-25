import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";
import axios from "utils/axios";
import { toast } from "sonner";
import { Button, Input } from "components/ui";

export function CompleteInductionModal({ show, onClose, row, table }) {
  const focusRef = useRef(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    enddate: new Date().toISOString().split('T')[0],
    remark: "",
    scan: null
  });

  const [inductionDetails, setInductionDetails] = useState(null);

  useEffect(() => {
    if (show) {
      // Fetch existing induction schedule and details
      axios.get(`/training/induction-details/${row.id}`).then((res) => {
         if (res.data?.data) {
             setInductionDetails(res.data.data);
         }
      }).catch(err => console.error(err));
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('enddate', formData.enddate);
      submitData.append('remark', formData.remark);
      if (formData.scan) submitData.append('scan', formData.scan);

      const res = await axios.post(`/training/complete-induction/${row.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.status === true || res.data?.status === 'success') {
        toast.success("Induction completed successfully");
        table.options.meta?.setTableSettings((old) => ({...old})); // Trigger refresh
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to complete induction");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to complete induction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={show}>
      <Dialog as="div" className="relative z-[70]" onClose={loading ? () => {} : onClose} initialFocus={focusRef}>
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
                <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900 dark:text-dark-50">
                  Complete Induction for {row?.firstname} {row?.lastname}
                </h3>
        
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date of Induction Program</label>
                      <div className="p-2 bg-gray-100 dark:bg-dark-800 rounded-md text-sm">{inductionDetails?.startdate || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date of Induction Program</label>
                      <Input type="date" value={formData.enddate} onChange={(e) => setFormData({...formData, enddate: e.target.value})} required className="w-full" ref={focusRef} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scan</label>
                      <Input type="file" accept="image/*" onChange={(e) => setFormData({...formData, scan: e.target.files[0]})} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remark</label>
                      <Input type="text" value={formData.remark} onChange={(e) => setFormData({...formData, remark: e.target.value})} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name of Employee</label>
                      <div className="p-2 bg-gray-100 dark:bg-dark-800 rounded-md text-sm">{row?.firstname} {row?.lastname}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                      <div className="p-2 bg-gray-100 dark:bg-dark-800 rounded-md text-sm">{row?.department || '-'}</div>
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-4 dark:border-dark-500">
                    <h4 className="font-semibold mb-2">Schedules</h4>
                    <div className="space-y-3">
                        {/* Read only schedule list */}
                        <div className="flex gap-2 text-sm font-bold border-b pb-2 dark:border-dark-500">
                            <div className="w-8">Sr.</div>
                            <div className="flex-1">Schedule</div>
                            <div className="flex-1">Department</div>
                            <div className="flex-1">Responsibility</div>
                            <div className="flex-1">Activity</div>
                            <div className="flex-1">Responsible Person</div>
                        </div>
                       {inductionDetails?.schedules?.map((item, index) => (
                          <div key={index} className="flex gap-2 items-center text-sm border-b pb-2 dark:border-dark-500 border-dashed">
                            <span className="w-8">{index + 1}</span>
                            <div className="flex-1">{item.schedule}</div>
                            <div className="flex-1">{item.departmentName}</div>
                            <div className="flex-1">{item.responsibility}</div>
                            <div className="flex-1">{item.activity}</div>
                            <div className="flex-1">{item.responsiblePersonName}</div>
                          </div>
                       )) || <div className="text-gray-500 text-sm">No schedules found.</div>}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-3">
                     <Button type="button" variant="outlined" onClick={onClose} disabled={loading}>Cancel</Button>
                     <Button type="submit" color="primary" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
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

CompleteInductionModal.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  row: PropTypes.object,
  table: PropTypes.object,
};
