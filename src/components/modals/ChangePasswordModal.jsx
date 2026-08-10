import React from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { Button } from 'components/ui';
import axios from 'utils/axios';
import { toast } from 'sonner';

export function ChangePasswordModal({ isOpen, onClose }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setError } = useForm();

  const currentPassword = watch("current_password");
  const newPassword = watch("new_password");

  const onSubmit = async (data) => {
    try {
      // NOTE: Update this URL to match your required API endpoint
      const response = await axios.post('/change-password', {
        password: data.current_password,
        newpassword: data.new_password,
        confirmpassword: data.confirm_password
      });

      // Handle cases where API returns 200 OK but contains validation errors
      if (response.data?.errors || response.data?.status === false) {
        const apiErrors = response.data.errors;
        if (apiErrors) {
          Object.keys(apiErrors).forEach((key) => {
            let fieldName = key;
            if (key === 'newpassword' || key === 'new_password') fieldName = 'new_password';
            if (key === 'confirmpassword' || key === 'confirm_password') fieldName = 'confirm_password';
            if (key === 'password' || key === 'current_password') fieldName = 'current_password';
            
            setError(fieldName, {
              type: 'server',
              message: apiErrors[key][0]
            });
          });
        } else {
          setError('current_password', { type: 'server', message: response.data.message || 'Validation failed' });
        }
        return; // Stop execution, don't close modal
      }

      console.log('Password changed successfully', response.data);
      toast.success(response.data.message);
      reset(); // clear form
      onClose(); // close modal
    } catch (error) {
      console.error('Password change failed', error);
      const apiErrors = error.response?.data?.errors;
      
      if (apiErrors) {
        Object.keys(apiErrors).forEach((key) => {
          let fieldName = key;
          // Map backend keys to frontend keys if they differ
          if (key === 'newpassword' || key === 'new_password') fieldName = 'new_password';
          if (key === 'confirmpassword' || key === 'confirm_password') fieldName = 'confirm_password';
          if (key === 'password' || key === 'current_password') fieldName = 'current_password';
          
          setError(fieldName, {
            type: 'server',
            message: apiErrors[key][0]
          });
        });
      } else {
        const message = error.response?.data?.message || 'An error occurred while changing your password.';
        setError('current_password', { type: 'server', message });
      }
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
                  Change Password
                </Dialog.Title>
                <div className="mt-4">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Current Password */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                      <input
                        type="password"
                        {...register("current_password", { required: 'Current password is required' })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter current password"
                      />
                      {errors.current_password && <span className="text-red-500 text-xs">{errors.current_password.message}</span>}
                    </div>

                    {/* New Password */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                      <input
                        type="password"
                        {...register("new_password", {
                          required: 'New password is required',
                          minLength: { value: 6, message: 'Password must be at least 6 characters' },
                          validate: (value) => value !== currentPassword || 'The new password must be different from current password.'
                        })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter new password"
                      />
                      {errors.new_password && <span className="text-red-500 text-xs">{errors.new_password.message}</span>}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                      <input
                        type="password"
                        {...register("confirm_password", {
                          required: 'Please confirm your new password',
                          validate: (value) => value === newPassword || 'Passwords do not match'
                        })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Confirm new password"
                      />
                      {errors.confirm_password && <span className="text-red-500 text-xs">{errors.confirm_password.message}</span>}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3 border-t pt-4 dark:border-gray-700">
                      <Button type="button" variant="outlined" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button type="submit" color="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Change Password'}
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
