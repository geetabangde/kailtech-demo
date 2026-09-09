import { useState } from 'react';
// import clsx from "clsx";
// import PropTypes from "prop-types";

// Local Imports
import { CollapsibleSearch } from "components/shared/CollapsibleSearch";
import { MenuAction } from "./MenuActions";
import { TableConfig } from "./TableConfig";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Button } from "components/ui";
import { TableSettings } from "components/shared/table/TableSettings";
import { useNavigate } from 'react-router';

// Import the Product Verification Sheet component
const ProductVerificationSheet = ({ onBackClick }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(25);

  // Sample data - replace with your actual data
  const verificationData = [
    { id: 1, date: '07/06/2024' },
    { id: 2, date: '07/06/2024' },
    { id: 3, date: '07/06/2024' },
    { id: 4, date: '07/06/2024' },
    { id: 5, date: '07/06/2024' },
    { id: 6, date: '07/06/2024' },
    { id: 7, date: '07/06/2024' },
  ];

  const filteredData = verificationData.filter(item =>
    item.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString().includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Product Verification Sheet</h1>
        <Button
          className="bg-indigo-500 hover:bg-fuchsia-500 text-white px-4 py-2 rounded text-sm font-medium"
          onClick={() =>
            navigate("/dashboards/material-list/electro-technical")}
        >
          Back To Instrument List
        </Button>
      </div>

      {/* Search and Info Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Showing 1 to 7 of 7 entries
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="search" className="text-sm font-medium text-gray-700">Search:</label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm w-64"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                <div className="flex items-center cursor-pointer hover:text-gray-900">
                  S No
                  <svg className="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th className="border-b border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                <div className="flex items-center cursor-pointer hover:text-gray-900">
                  Date
                  <svg className="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th className="border-b border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                <div className="flex items-center cursor-pointer hover:text-gray-900">
                  Action
                  <svg className="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border-b border-gray-200 px-4 py-3 text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="border-b border-gray-200 px-4 py-3 text-sm text-gray-900">
                  {item.date}
                </td>
                <td className="border-b border-gray-200 px-4 py-3 text-sm">
                  <Button
                    className="bg-indigo-500 hover:bg-fuchsia-500 text-white px-3 py-1 rounded text-xs"
                    onClick={() => onBackClick()}
                  >
                    View Verification Form
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Show</label>
          <select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <label className="text-sm text-gray-700">entries</label>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={true}
            className="text-gray-400 cursor-not-allowed"
          >
            First
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={true}
            className="text-gray-400 cursor-not-allowed"
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={true}
            className="text-gray-400 cursor-not-allowed"
          >
            Next
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={true}
            className="text-gray-400 cursor-not-allowed"
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
};

const VerificationForm = () => {
  const [currentView, setCurrentView] = useState('form'); // 'form' or 'list'
  const [formData, setFormData] = useState({
    date: '07/10/2021',
    department: '',
    referenceStandard: '',
    equipmentName: 'Electrosurgery Analyzer',
    make: 'Fluke',
    model: 'QA-ES MKIII',
    qfNo: 'KTRC/QF/0604/21',
    issueNo: '01',
    issueDate: '01/06/2023',
    revisionNo: '-',
    revisionDate: '-',
    page: '1 of 1'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleShowVerificationList = () => {
    setCurrentView('list');
  };

  const handleBackToForm = () => {
    setCurrentView('form');
  };

  // Show Product Verification Sheet if currentView is 'list'
  if (currentView === 'list') {
    return <ProductVerificationSheet onBackClick={handleBackToForm} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Verification Form</h1>
        <Button
          className="bg-indigo-500 hover:bg-fuchsia-500 text-white px-4 py-2 rounded text-sm font-medium"
          onClick={handleShowVerificationList}
        >
          Verification list
        </Button>
      </div>

      {/* Search and Actions Section */}
      <div className="flex justify-between items-center mb-4">
        <CollapsibleSearch
          placeholder="Search verification forms..."
          onSearch={(searchTerm) => console.log('Search:', searchTerm)}
        />
        <MenuAction>
          <Button variant="secondary" size="sm">
            Export PDF
          </Button>
          <Button variant="secondary" size="sm">
            Print Form
          </Button>
          <Button variant="primary" size="sm">
            Save Form
          </Button>
        </MenuAction>
      </div>

      {/* Main Content Table */}
      <div className="border border-gray-400">
        {/* Header Section with Logo and Title */}
        <div className="border-b border-gray-400">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="border-r border-gray-400 p-4 w-1/4 align-top">
                  {/* Logo Section */}
                  <div className="mb-4">
                    <img
                      src="/images/logo.png"
                      alt="KTRC Logo"
                      className="w-32 h-20 object-contain"
                    />
                  </div>
                  <div className="text-xs text-gray-700 leading-tight">
                    <div className="font-medium">Quality Audit & Control</div>
                    <div>Kailtech Test And Research Centre Pvt. Ltd.</div>
                  </div>
                </td>
                <td className="border-r border-gray-400 p-4 text-center align-middle">
                  <h2 className="text-lg font-bold text-gray-800">Verification of Equipment</h2>
                </td>
                <td className="p-4 w-1/4">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <td className="py-1 font-medium text-gray-700">QF. No.</td>
                        <td className="py-1">
                          <input
                            type="text"
                            value={formData.qfNo}
                            onChange={(e) => handleInputChange('qfNo', e.target.value)}
                            className="w-full border border-gray-300 px-2 py-1 text-xs rounded"
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-1 font-medium text-gray-700">Issue No.</td>
                        <td className="py-1">
                          <input
                            type="text"
                            value={formData.issueNo}
                            onChange={(e) => handleInputChange('issueNo', e.target.value)}
                            className="w-full border border-gray-300 px-2 py-1 text-xs rounded"
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-1 font-medium text-gray-700">Issue Date</td>
                        <td className="py-1">
                          <input
                            type="text"
                            value={formData.issueDate}
                            onChange={(e) => handleInputChange('issueDate', e.target.value)}
                            className="w-full border border-gray-300 px-2 py-1 text-xs rounded"
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-1 font-medium text-gray-700">Revision No.</td>
                        <td className="py-1">
                          <input
                            type="text"
                            value={formData.revisionNo}
                            onChange={(e) => handleInputChange('revisionNo', e.target.value)}
                            className="w-full border border-gray-300 px-2 py-1 text-xs rounded"
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <td className="py-1 font-medium text-gray-700">Revision Date</td>
                        <td className="py-1">
                          <input
                            type="text"
                            value={formData.revisionDate}
                            onChange={(e) => handleInputChange('revisionDate', e.target.value)}
                            className="w-full border border-gray-300 px-2 py-1 text-xs rounded"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 font-medium text-gray-700">Page</td>
                        <td className="py-1">
                          <input
                            type="text"
                            value={formData.page}
                            onChange={(e) => handleInputChange('page', e.target.value)}
                            className="w-full border border-gray-300 px-2 py-1 text-xs rounded"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Form Fields Section */}
        <div className="border-b border-gray-400">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="border-r border-gray-400 p-3 w-1/6 font-medium text-gray-700 bg-gray-50">Date</td>
                <td className="border-r border-gray-400 p-3 w-1/3">
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1 text-sm rounded"
                  />
                </td>
                <td className="border-r border-gray-400 p-3 w-1/6 font-medium text-gray-700 bg-gray-50">Equipment Name</td>
                <td className="p-3">
                  <input
                    type="text"
                    value={formData.equipmentName}
                    onChange={(e) => handleInputChange('equipmentName', e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1 text-sm rounded"
                  />
                </td>
              </tr>
              <tr className="border-t border-gray-400">
                <td className="border-r border-gray-400 p-3 font-medium text-gray-700 bg-gray-50">Department</td>
                <td className="border-r border-gray-400 p-3">
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1 text-sm rounded"
                    placeholder=""
                  />
                </td>
                <td className="border-r border-gray-400 p-3 font-medium text-gray-700 bg-gray-50">Make</td>
                <td className="p-3">
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1 text-sm rounded"
                  />
                </td>
              </tr>
              <tr className="border-t border-gray-400">
                <td className="border-r border-gray-400 p-3 font-medium text-gray-700 bg-gray-50">Any Reference Standard</td>
                <td className="border-r border-gray-400 p-3">
                  <input
                    type="text"
                    value={formData.referenceStandard}
                    onChange={(e) => handleInputChange('referenceStandard', e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1 text-sm rounded"
                    placeholder=""
                  />
                </td>
                <td className="border-r border-gray-400 p-3 font-medium text-gray-700 bg-gray-50">Model</td>
                <td className="p-3">
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="w-full border border-gray-300 px-2 py-1 text-sm rounded"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Acceptance Criteria Section */}
        <div className="border-b border-gray-400 p-4 text-center bg-gray-50">
          <h3 className="font-bold text-gray-800">ACCEPTANCE CRITERIA (As per KTRC/QF/0604/01)</h3>
        </div>

        {/* Parameters Table with TableConfig */}
        <div className="relative">
          {/* Table Settings */}
          <div className="absolute top-2 right-2 z-10">
            <TableConfig>
              <Popover className="relative">
                <PopoverButton className="p-2 text-gray-400 hover:text-gray-600">
                  <Cog6ToothIcon className="h-5 w-5" />
                </PopoverButton>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <PopoverPanel className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border">
                    <TableSettings />
                  </PopoverPanel>
                </Transition>
              </Popover>
            </TableConfig>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-r border-gray-400 p-3 text-left font-bold text-gray-800">S.No.</th>
                <th className="border-r border-gray-400 p-3 text-left font-bold text-gray-800">PARAMETER</th>
                <th className="border-r border-gray-400 p-3 text-left font-bold text-gray-800">OUR REQUIREMENT</th>
                <th className="border-r border-gray-400 p-3 text-left font-bold text-gray-800">EQUIPMENT RECEIVED</th>
                <th className="border-r border-gray-400 p-3 text-left font-bold text-gray-800">REMARKS</th>
                <th className="p-3 text-left font-bold text-gray-800 pr-12">VERIFYING ENGINEER</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty rows for data entry */}
              {[1, 2, 3, 4, 5].map((index) => (
                <tr key={index} className="border-t border-gray-400">
                  <td className="border-r border-gray-400 p-3">
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-2 py-1 text-sm rounded"
                    />
                  </td>
                  <td className="border-r border-gray-400 p-3">
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-2 py-1 text-sm rounded"
                    />
                  </td>
                  <td className="border-r border-gray-400 p-3">
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-2 py-1 text-sm rounded"
                    />
                  </td>
                  <td className="border-r border-gray-400 p-3">
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-2 py-1 text-sm rounded"
                    />
                  </td>
                  <td className="border-r border-gray-400 p-3">
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-2 py-1 text-sm rounded"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-2 py-1 text-sm rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="border-t border-gray-400 p-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700 mb-2">Verified: OK / Not OK</div>
              <div className="border border-gray-300 rounded p-2 h-16"></div>
            </div>
            <div>
              <div className="font-medium text-gray-700 mb-2">DTM</div>
              <div className="border border-gray-300 rounded p-2 h-16"></div>
            </div>
            <div>
              <div className="font-medium text-gray-700 mb-2">Name & Signature</div>
              <div className="border border-gray-300 rounded p-2 h-16"></div>
            </div>
          </div>

          <div className="mt-4 text-sm">
            <div className="font-medium text-gray-700 mb-2">Dharmendra Sharma</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Electronically signed by</div>
              <div>Dharmendra Sharma(Exp:06/30)</div>
              <div>Designation:Manager (Electronics & Electrical)</div>
              <div>Date:07/10/21</div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Number */}
      <div className="text-right mt-2 text-sm text-gray-600">
        99
      </div>
    </div>
  );
};

export default VerificationForm;