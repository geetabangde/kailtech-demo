import React from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { useForm, Controller } from 'react-hook-form';
import Flatpickr from 'react-flatpickr';
import "flatpickr/dist/themes/light.css";
import { Button } from 'components/ui';

// Mock API Call - Replace with real API later
const mockSubmitTicket = async (data) => {
  return new Promise((resolve) => setTimeout(() => resolve(data), 1000));
};

export function AddTicketModal({ isOpen, onClose }) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm();
  
  // Mock Data for Categories - You will fetch these via API later
  const categories = [
    { id: 1, name: 'Hardware Issue' },
    { id: 2, name: 'Software Bug' },
    { id: 3, name: 'Network Problem' }
  ];

  const subCategories = [
    { id: 1, name: 'Monitor' },
    { id: 2, name: 'Keyboard' },
    { id: 3, name: 'Login Error' }
  ];

  const onSubmit = async (data) => {
    try {
      console.log('Submitting ticket payload:', data);
      // Simulate API request
      await mockSubmitTicket(data);
      // Once your API is ready, you'd do:
      // await axios.post('/api/tickets', data);
      
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
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 border-b pb-3 dark:border-gray-700">
                  Add Issue / Request
                </Dialog.Title>
                <div className="mt-4">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Problem Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Problem</label>
                        <input
                          type="text"
                          {...register('problemTitle', { required: 'Problem title is required' })}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        {errors.problemTitle && <span className="text-red-500 text-xs">{errors.problemTitle.message}</span>}
                      </div>

                      {/* Expected Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expected Date of Completion</label>
                        <Controller
                          name="expectedDate"
                          control={control}
                          rules={{ required: 'Date is required' }}
                          render={({ field }) => (
                            <Flatpickr
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white"
                              value={field.value}
                              onChange={(date) => field.onChange(date)}
                              options={{
                                minDate: "today",
                                dateFormat: "d/m/Y",
                              }}
                            />
                          )}
                        />
                         {errors.expectedDate && <span className="text-red-500 text-xs">{errors.expectedDate.message}</span>}
                      </div>

                      {/* Problem Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Problem Category</label>
                        <select
                          {...register('category', { required: 'Category is required' })}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Select</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        {errors.category && <span className="text-red-500 text-xs">{errors.category.message}</span>}
                      </div>

                      {/* Sub Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Problem Sub Category</label>
                        <select
                          {...register('subCategory', { required: 'Sub Category is required' })}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Select</option>
                          {subCategories.map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                          ))}
                        </select>
                        {errors.subCategory && <span className="text-red-500 text-xs">{errors.subCategory.message}</span>}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Problem Describe</label>
                      <textarea
                        {...register('description', { required: 'Description is required' })}
                        rows={4}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
                    </div>

                    {/* Attachments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Attachments</label>
                      <input
                        type="file"
                        multiple
                        {...register('attachments')}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:text-gray-400"
                      />
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3 border-t pt-4 dark:border-gray-700">
                      <Button type="button" variant="outlined" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="submit" color="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Add Request'}
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
