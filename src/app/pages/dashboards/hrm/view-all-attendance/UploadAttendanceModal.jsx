import React from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { Button } from 'components/ui';
import axios from 'utils/axios';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export function UploadAttendanceModal({ isOpen, onClose, table }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  
  // Calculate month and year options
  const monthOptions = [];
  const yearOptions = [];
  
  const currentDate = new Date();
  for (let i = 0; i < 3; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const m = String(d.getMonth() + 1).padStart(2, '0'); // 01-12
    const y = String(d.getFullYear());
    
    if (!monthOptions.includes(m)) monthOptions.push(m);
    if (!yearOptions.includes(y)) yearOptions.push(y);
  }
  // Sort them
  monthOptions.sort((a, b) => Number(a) - Number(b));
  yearOptions.sort((a, b) => Number(a) - Number(b));

  const onSubmit = async (data) => {
    try {
      const file = data.file[0];
      
      const sheet_data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const buffer = e.target.result;
            const workbook = XLSX.read(buffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert sheet to array of arrays, header: 1 gives an array of arrays
            const dataArr = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            
            // Filter out completely empty rows
            const filteredData = dataArr.filter(row => row.some(cell => cell !== ""));
            resolve(filteredData);
          } catch (err) {
            console.error("Failed to parse Excel file:", err);
            reject(new Error("Failed to parse the file"));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read the file"));
        reader.readAsArrayBuffer(file);
      });

      const payload = {
        month: Number(data.month),
        year: Number(data.year),
        sheet_data: sheet_data
      };

      const res = await axios.post("/hrm/upload-attendance", payload);
      toast.success(res.data?.message || "Attendance Uploaded");
      table.options.meta?.fetchData?.(); // Refresh table data
      handleClose();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to upload attendance sheet ❌");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={handleClose}>
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 border-b pb-3 dark:border-gray-700">
                  Upload Attendance Sheet
                </Dialog.Title>
                <div className="mt-4">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    
                    {/* Month */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Month</label>
                      <select
                        {...register("month", { required: 'Month is required' })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select</option>
                        {monthOptions.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      {errors.month && <span className="text-red-500 text-xs">{errors.month.message}</span>}
                    </div>

                    {/* Year */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                      <select
                        {...register("year", { required: 'Year is required' })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select</option>
                        {yearOptions.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      {errors.year && <span className="text-red-500 text-xs">{errors.year.message}</span>}
                    </div>

                    {/* File */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Attendance Sheet</label>
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        {...register("file", { required: 'File is required' })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      {errors.file && <span className="text-red-500 text-xs">{errors.file.message}</span>}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3 border-t pt-4 dark:border-gray-700">
                      <Button type="button" variant="outlined" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button type="submit" color="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Uploading...' : 'Save'}
                      </Button>
                    </div>
                  </form>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
