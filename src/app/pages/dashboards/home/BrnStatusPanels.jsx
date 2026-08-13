import { useState, useEffect } from "react";
import { Card } from "components/ui";
import { Input } from "components/ui/Form";
import Select from "react-select";
import { Button } from "components/ui";
import axios from "utils/axios";

export function BrnStatusPanels() {
  const [customers, setCustomers] = useState([]);
  
  const [calibSearch, setCalibSearch] = useState({
    customer: "",
    startDate: "",
    endDate: "",
    entryNo: ""
  });

  const [testingSearch, setTestingSearch] = useState({
    trf: "",
    lrn: "",
    brn: ""
  });

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await axios.get("/people/get-all-customers");
        if (response.data && response.data.data) {
          setCustomers(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    }
    fetchCustomers();
  }, []);

  const handleCalibSearchCustomer = () => {
    console.log("Searching Calibration by Customer/Date:", calibSearch);
    // TODO: implement actual search logic
  };

  const handleCalibSearchEntry = () => {
    console.log("Searching Calibration by Entry No:", calibSearch.entryNo);
    // TODO: implement actual search logic
  };

  const handleTestingSearchTRF = () => {
    console.log("Searching Testing by TRF:", testingSearch.trf);
    // TODO: implement actual search logic
  };

  const handleTestingSearchLRN = () => {
    console.log("Searching Testing by LRN:", testingSearch.lrn);
    // TODO: implement actual search logic
  };

  const handleTestingSearchBRN = () => {
    console.log("Searching Testing by BRN:", testingSearch.brn);
    // TODO: implement actual search logic
  };

  return (
    <div className="flex flex-col gap-6 w-full mb-8">
      {/* Calibration Brn Status */}
      <Card className="w-full">
        <div className="border-b border-gray-200 dark:border-dark-600 px-4 py-3 flex justify-between items-center bg-gray-50 dark:bg-dark-800 rounded-t-lg">
          <h3 className="text-[15px] font-medium text-gray-700 dark:text-gray-300">Calibration Brn Status</h3>
          <div className="flex gap-2 text-gray-400">
            <button className="hover:text-gray-600"><i className="ti ti-minus"></i></button>
            <button className="hover:text-gray-600"><i className="ti ti-x"></i></button>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-4 z-50">
              <Select
                placeholder="Select Customer"
                value={customers.map(c => ({ value: c.id, label: c.name })).find(o => o.value === calibSearch.customer) || null}
                onChange={(selectedOption) => setCalibSearch({ ...calibSearch, customer: selectedOption?.value || "" })}
                options={customers.map(c => ({ value: c.id, label: c.name }))}
                isClearable
                className="w-full text-[13px]"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '36px',
                    height: '36px',
                  })
                }}
              />
            </div>
            <div className="md:col-span-3">
              <Input
                type="date"
                placeholder="Start Date"
                value={calibSearch.startDate}
                onChange={(e) => setCalibSearch({ ...calibSearch, startDate: e.target.value })}
                className="w-full h-9"
              />
            </div>
            <div className="md:col-span-3">
              <Input
                type="date"
                placeholder="End Date"
                value={calibSearch.endDate}
                onChange={(e) => setCalibSearch({ ...calibSearch, endDate: e.target.value })}
                className="w-full h-9"
              />
            </div>
            <div className="md:col-span-2">
              <Button 
                onClick={handleCalibSearchCustomer}
                className="h-9 w-full"
                color="primary"
              >
                Search
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-10">
              <Input
                type="text"
                placeholder="Entry no"
                value={calibSearch.entryNo}
                onChange={(e) => setCalibSearch({ ...calibSearch, entryNo: e.target.value })}
                className="w-full h-9"
              />
            </div>
            <div className="md:col-span-2">
              <Button 
                onClick={handleCalibSearchEntry}
                className="h-9 w-full"
                color="primary"
              >
                Search
              </Button>
            </div>
          </div>
          
          <div className="w-full overflow-x-auto mt-2">
             <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded-full flex items-center px-1">
                 {/* Scrollbar placeholder to match screenshot */}
                 <div className="w-0 h-0 border-t-4 border-t-transparent border-l-[6px] border-l-gray-400 border-b-4 border-b-transparent mr-2"></div>
                 <div className="h-2 flex-grow bg-gray-400 rounded-full"></div>
                 <div className="w-0 h-0 border-t-4 border-t-transparent border-r-[6px] border-r-gray-400 border-b-4 border-b-transparent ml-2"></div>
             </div>
          </div>
        </div>
      </Card>

      {/* Testing Brn Status */}
      <Card className="w-full">
        <div className="border-b border-gray-200 dark:border-dark-600 px-4 py-3 flex justify-between items-center bg-gray-50 dark:bg-dark-800 rounded-t-lg">
          <h3 className="text-[15px] font-medium text-gray-700 dark:text-gray-300">Testing Brn Status</h3>
          <div className="flex gap-2 text-gray-400">
            <button className="hover:text-gray-600"><i className="ti ti-minus"></i></button>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-10">
              <Input
                type="text"
                placeholder="TRF"
                value={testingSearch.trf}
                onChange={(e) => setTestingSearch({ ...testingSearch, trf: e.target.value })}
                className="w-full h-9 border-red-300 focus:border-red-500 focus:ring-red-500" // To match the red outline from screenshot
              />
            </div>
            <div className="md:col-span-2">
              <Button 
                onClick={handleTestingSearchTRF}
                className="h-9 w-full"
                color="primary"
              >
                Search
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-10">
              <Input
                type="text"
                placeholder="LRN"
                value={testingSearch.lrn}
                onChange={(e) => setTestingSearch({ ...testingSearch, lrn: e.target.value })}
                className="w-full h-9"
              />
            </div>
            <div className="md:col-span-2">
              <Button 
                onClick={handleTestingSearchLRN}
                className="h-9 w-full"
                color="primary"
              >
                Search
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-10">
              <Input
                type="text"
                placeholder="BRN"
                value={testingSearch.brn}
                onChange={(e) => setTestingSearch({ ...testingSearch, brn: e.target.value })}
                className="w-full h-9"
              />
            </div>
            <div className="md:col-span-2">
              <Button 
                onClick={handleTestingSearchBRN}
                className="h-9 w-full"
                color="primary"
              >
                Search
              </Button>
            </div>
          </div>

          <div className="w-full overflow-x-auto mt-2">
             <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded-full flex items-center px-1">
                 {/* Scrollbar placeholder to match screenshot */}
                 <div className="w-0 h-0 border-t-4 border-t-transparent border-l-[6px] border-l-gray-400 border-b-4 border-b-transparent mr-2"></div>
                 <div className="h-2 flex-grow bg-gray-400 rounded-full"></div>
                 <div className="w-0 h-0 border-t-4 border-t-transparent border-r-[6px] border-r-gray-400 border-b-4 border-b-transparent ml-2"></div>
             </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
