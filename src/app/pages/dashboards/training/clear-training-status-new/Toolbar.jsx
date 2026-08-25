
export const Toolbar = () => {
  return (
    <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 p-4 sm:flex-row sm:items-center dark:border-dark-700">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Active Trainees
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">
          Manage and clear training status for employees
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        {/* We can add search or filter inputs here later */}
      </div>
    </div>
  );
};
