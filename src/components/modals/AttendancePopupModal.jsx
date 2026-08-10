import React from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { useForm, Controller } from 'react-hook-form';
import Flatpickr from 'react-flatpickr';
import "flatpickr/dist/themes/light.css";
import { Button } from 'components/ui';

// Mock API Call - Replace with real API later
const mockSubmitAttendance = async (data) => {
  return new Promise((resolve) => setTimeout(() => resolve(data), 1000));
};

export function AttendancePopupModal({ isOpen, onClose, mode = "fullAttandencePopup" }) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm();

  // mode can be: 'inTimePopup', 'outTimePopup', 'fullAttandencePopup'

  const onSubmit = async (data) => {
    try {
      console.log(`Submitting attendance (${mode}):`, data);
      await mockSubmitAttendance(data);
      // Once API is ready:
      // await axios.post('/api/attendance', { ...data, mode });
      
      reset(); // clear form
      onClose(); // close modal
    } catch (error) {
      console.error('Submission failed', error);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
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
                  Set Attendance Timing
                </Dialog.Title>
                <div className="mt-4">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    
                    {/* Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                      <Controller
                        name="date"
                        control={control}
                        rules={{ required: 'Date is required' }}
                        render={({ field }) => (
                          <Flatpickr
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white"
                            value={field.value}
                            onChange={(date) => field.onChange(date)}
                            options={{
                              dateFormat: "d/m/Y",
                            }}
                          />
                        )}
                      />
                      {errors.date && <span className="text-red-500 text-xs">{errors.date.message}</span>}
                    </div>

                    {/* In Time */}
                    {(mode === "inTimePopup" || mode === "fullAttandencePopup") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">In Time</label>
                        <Controller
                          name="inTime"
                          control={control}
                          rules={{ required: 'In time is required' }}
                          render={({ field }) => (
                            <Flatpickr
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white"
                              value={field.value}
                              onChange={(date) => field.onChange(date)}
                              options={{
                                enableTime: true,
                                noCalendar: true,
                                dateFormat: "H:i",
                                time_24hr: true
                              }}
                            />
                          )}
                        />
                        {errors.inTime && <span className="text-red-500 text-xs">{errors.inTime.message}</span>}
                      </div>
                    )}

                    {/* Out Time */}
                    {(mode === "outTimePopup" || mode === "fullAttandencePopup") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Out Time</label>
                        <Controller
                          name="outTime"
                          control={control}
                          rules={{ required: 'Out time is required' }}
                          render={({ field }) => (
                            <Flatpickr
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white"
                              value={field.value}
                              onChange={(date) => field.onChange(date)}
                              options={{
                                enableTime: true,
                                noCalendar: true,
                                dateFormat: "H:i",
                                time_24hr: true
                              }}
                            />
                          )}
                        />
                        {errors.outTime && <span className="text-red-500 text-xs">{errors.outTime.message}</span>}
                      </div>
                    )}

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                      <input
                        type="text"
                        {...register('reason', { required: 'Reason is required' })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      {errors.reason && <span className="text-red-500 text-xs">{errors.reason.message}</span>}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3 border-t pt-4 dark:border-gray-700">
                      <Button type="button" variant="outlined" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="submit" color="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Submit'}
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
