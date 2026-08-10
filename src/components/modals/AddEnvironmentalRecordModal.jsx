import React from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { Button } from 'components/ui';
import axios from 'utils/axios';

export function AddEnvironmentalRecordModal({ isOpen, onClose, labName = "Processing", labId, formFields = [] }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      const records = formFields.map(field => {
        const fieldKey = `${field.typeid}_${field.subtype.replace(/\s+/g, '')}`;
        return {
          type: field.type,
          typeid: field.typeid,
          subtype: field.subtype,
          value: data.values[fieldKey]
        };
      });

      const payload = {
        labid: labId,
        records: records
      };

      console.log('Submitting environmental record payload:', payload);
      await axios.post('/environmental/record/save', payload);

      reset(); // clear form
      onClose(); // close modal
    } catch (error) {
      console.error('Submission failed', error);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
          <div className="flex min-h-full items-start justify-center p-4 pt-4 text-center">
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 border-b pb-3 dark:border-gray-700">
                  {labName} Lab - Environmental Record
                </Dialog.Title>
                <div className="mt-4">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {formFields.map((field, index) => {
                      // We use typeid and subtype to create a unique key for the form state
                      const fieldKey = `${field.typeid}_${field.subtype.replace(/\s+/g, '')}`;
                      return (
                        <div key={index} className="grid grid-cols-3 gap-4 items-center">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</label>
                          <div className="col-span-2">
                            <input
                              type="text"
                              {...register(`values.${fieldKey}`, { required: `${field.label} is required` })}
                              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            {errors.values?.[fieldKey] && (
                              <span className="text-red-500 text-xs">{errors.values[fieldKey].message}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {formFields.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No fields found or provided.</p>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3 border-t pt-4 dark:border-gray-700">
                      <Button type="button" variant="outlined" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="submit" color="primary" disabled={isSubmitting || formFields.length === 0}>
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
