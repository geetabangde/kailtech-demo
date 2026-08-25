import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";
import axios from "utils/axios";
import { toast } from "sonner";
import { Button, Input } from "components/ui";

export function StartInductionModal({ show, onClose, row, table }) {
  const focusRef = useRef(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    startdate: "",
    schedule: [
      {
        schedule: "",
        department: "",
        responsibility: "",
        activity: "",
        responsibleperson: ""
      }
    ]
  });

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (show) {
      // Fetch departments and users for select dropdowns
      axios.get("/training/induction-options").then((res) => {
         if (res.data?.data) {
             setDepartments(res.data.data.departments || []);
             setUsers(res.data.data.users || []);
         }
      }).catch(err => console.error(err));
    }
  }, [show]);

  const addSchedule = () => {
    setFormData({
      ...formData,
      schedule: [
        ...formData.schedule,
        {
          schedule: "",
          department: "",
          responsibility: "",
          activity: "",
          responsibleperson: ""
        }
      ]
    });
  };

  const removeSchedule = (index) => {
    const newSchedule = [...formData.schedule];
    newSchedule.splice(index, 1);
    setFormData({ ...formData, schedule: newSchedule });
  };

  const updateSchedule = (index, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index][field] = value;
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`/training/start-induction/${row.id}`, formData);
      if (res.data?.status === true || res.data?.status === 'success') {
        toast.success("Induction started successfully");
        table.options.meta?.setTableSettings((old) => ({...old})); // Trigger refresh if configured
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to start induction");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to start induction");
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
                  Start Induction for {row?.firstname} {row?.lastname}
                </h3>
        
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    An orientation program would be scheduled for all new employees. HR Dept. would circulate Induction Details to all concerned before the due date and take confirmation from HOD&apos;s or their representatives.
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date of Induction Program</label>
                      <Input type="date" value={formData.startdate} onChange={(e) => setFormData({...formData, startdate: e.target.value})} required className="w-full" ref={focusRef} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name of Employee</label>
                      <div className="p-2 bg-gray-100 dark:bg-dark-800 rounded-md text-sm">{row?.firstname} {row?.lastname}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Of Joining</label>
                      <div className="p-2 bg-gray-100 dark:bg-dark-800 rounded-md text-sm">{row?.joiningdate || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                      <div className="p-2 bg-gray-100 dark:bg-dark-800 rounded-md text-sm">{row?.department || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                      <div className="p-2 bg-gray-100 dark:bg-dark-800 rounded-md text-sm">{row?.designation || '-'}</div>
                    </div>
                  </div>

                  <div className="mt-6 border-t pt-4 dark:border-dark-500">
                    <h4 className="font-semibold mb-2">Schedules</h4>
                    <div className="space-y-3">
                       {formData.schedule.map((item, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <span className="w-6 text-sm">{index + 1}</span>
                            <Input placeholder="Schedule" value={item.schedule} onChange={(e) => updateSchedule(index, 'schedule', e.target.value)} required className="flex-1" />
                            <select className="flex-1 p-2 border rounded-md dark:bg-dark-900 dark:border-dark-500 border-gray-300" value={item.department} onChange={(e) => updateSchedule(index, 'department', e.target.value)} required>
                               <option value="">Department</option>
                               {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <Input placeholder="Responsibility" value={item.responsibility} onChange={(e) => updateSchedule(index, 'responsibility', e.target.value)} required className="flex-1" />
                            <Input placeholder="Activity" value={item.activity} onChange={(e) => updateSchedule(index, 'activity', e.target.value)} required className="flex-1" />
                            <select className="flex-1 p-2 border rounded-md dark:bg-dark-900 dark:border-dark-500 border-gray-300" value={item.responsibleperson} onChange={(e) => updateSchedule(index, 'responsibleperson', e.target.value)} required>
                               <option value="">Responsible Person</option>
                               {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                            <button type="button" onClick={() => removeSchedule(index)} className="text-red-500 hover:text-red-700 px-2 font-bold text-xl">&times;</button>
                          </div>
                       ))}
                    </div>
                    <Button type="button" variant="outlined" className="mt-4" onClick={addSchedule}>+ Add New Row</Button>
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

StartInductionModal.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  row: PropTypes.object,
  table: PropTypes.object,
};
