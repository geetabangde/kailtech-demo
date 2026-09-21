import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * ObservationUpload Component
 *
 * Mirrors the legacy PHP observationupload template exactly:
 *   Row 1: ULR NO | <value>  |  Issue Date | <value>
 *   Row 2: Upload File | <file input colspan=3>
 *
 * The ulrno, issuedate, and accreditation come from the API response fetched
 * by CalibrateStep3 via /ob/get-observation?fn="observationupload" and are
 * passed as the `uploadData` prop.
 */
const ObservationUpload = ({
  selectedTableData,
  uploadData = {},
  onFileChange,
}) => {
  const [file, setFile] = useState(null);

  // Only render for observationupload template
  if (selectedTableData?.id !== 'observationupload') return null;

  const ulrNo       = uploadData?.ulrno      ?? '';
  const issueDate   = uploadData?.issuedate  ?? '';
  const accreditation = uploadData?.accreditation ?? '';

  const formatDateToMMDDYYYY = (dateString) => {
    if (!dateString || dateString === '0000-00-00') return '';
    const str = String(dateString).trim();
    const dateOnlyStr = str.includes('T') ? str.split('T')[0] : (str.includes(' ') ? str.split(' ')[0] : str);

    // YYYY-MM-DD -> MM-DD-YYYY
    const partsDash = dateOnlyStr.split('-');
    if (partsDash.length === 3 && partsDash[0].length === 4) {
      return `${partsDash[1]}-${partsDash[2]}-${partsDash[0]}`;
    }

    // YYYY/MM/DD -> MM-DD-YYYY
    const partsSlash = dateOnlyStr.split('/');
    if (partsSlash.length === 3 && partsSlash[0].length === 4) {
      return `${partsSlash[1]}-${partsSlash[2]}-${partsSlash[0]}`;
    }

    return dateOnlyStr;
  };

  const formattedIssueDate = formatDateToMMDDYYYY(issueDate);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0] || null;
    setFile(selectedFile);
    if (onFileChange) {
      onFileChange(selectedFile);
    }
  };

  return (
    <div className="space-y-4 mb-8">

      {/* Accreditation badge */}
      {accreditation && (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            accreditation.toUpperCase() === 'NABL'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {accreditation}
          </span>
        </div>
      )}

      {/* Hidden form fields matching PHP backend expectation */}
      <input type="hidden" name="ulrno" value={ulrNo} />
      <input type="hidden" name="issuedate" value={issueDate} />

      {/* Main table — same structure as PHP */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            {/* Row 1: ULR NO | value | Issue Date | value */}
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600 w-1/4 whitespace-nowrap">
                ULR NO
              </th>
              <td className="px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 w-1/4 font-medium tracking-wide">
                {ulrNo || <span className="text-gray-400 italic">N.A</span>}
              </td>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600 w-1/4 whitespace-nowrap">
                Issue Date
              </th>
              <td className="px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 w-1/4 font-medium">
                {formattedIssueDate || <span className="text-gray-400 italic">—</span>}
              </td>
            </tr>

            {/* Row 2: Upload File | file input (colspan=3) */}
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border-r border-gray-300 dark:border-gray-600 whitespace-nowrap">
                Upload File
              </th>
              <td colSpan={3} className="px-4 py-3 bg-white dark:bg-gray-800">
                <input
                  type="file"
                  name="certificatescanfile"
                  data-bvalidator="required"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-700 dark:text-gray-200
                    file:mr-4 file:py-1.5 file:px-4
                    file:rounded file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-600 file:text-white
                    hover:file:bg-blue-700
                    cursor-pointer"
                />
                {file && (
                  <p className="mt-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ Selected:{' '}
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{file.name}</span>
                    <span className="ml-1 text-gray-500 dark:text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                  </p>
                )}
              </td>
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );
};

ObservationUpload.propTypes = {
  selectedTableData: PropTypes.object,
  uploadData: PropTypes.shape({
    ulrno:         PropTypes.string,
    issuedate:     PropTypes.string,
    accreditation: PropTypes.string,
  }),
  onFileChange: PropTypes.func,
};

export default ObservationUpload;