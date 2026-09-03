// Import Dependencies
import PropTypes from "prop-types";

// ----------------------------------------------------------------------

const blueTickSvg = `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z' fill='%232563eb'/%3e%3c/svg%3e")`;
const blueIndeterminateSvg = `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3e%3crect x='3' y='7' width='10' height='2' rx='1' fill='%232563eb'/%3e%3c/svg%3e")`;

export function SelectHeader({ table }) {
  const isChecked = table.getIsAllRowsSelected();
  const isIndeterminate = table.getIsSomeRowsSelected();

  return (
    <div className="flex items-center justify-center">
      <input
        type="checkbox"
        className="appearance-none w-4.5 h-4.5 border border-gray-400 rounded bg-white checked:border-blue-600 focus:ring-1 focus:ring-blue-500 cursor-pointer"
        style={{
          backgroundImage: isChecked ? blueTickSvg : (isIndeterminate ? blueIndeterminateSvg : 'none'),
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        checked={isChecked}
        ref={input => {
          if (input) input.indeterminate = isIndeterminate;
        }}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    </div>
  );
}

export function SelectCell({ row }) {
  const isChecked = row.getIsSelected();
  const isIndeterminate = row.getIsSomeSelected();
  const isDisabled = !row.getCanSelect();

  return (
    <div className="flex items-center justify-center">
      <input
        type="checkbox"
        className={`appearance-none w-4.5 h-4.5 border border-gray-400 rounded bg-white checked:border-blue-600 focus:ring-1 focus:ring-blue-500 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        style={{
          backgroundImage: isChecked ? blueTickSvg : (isIndeterminate ? blueIndeterminateSvg : 'none'),
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        checked={isChecked}
        disabled={isDisabled}
        ref={input => {
          if (input) input.indeterminate = isIndeterminate;
        }}
        onChange={row.getToggleSelectedHandler()}
      />
    </div>
  );
}

SelectHeader.propTypes = {
  table: PropTypes.object,
};

SelectCell.propTypes = {
  row: PropTypes.object,
};