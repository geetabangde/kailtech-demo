




import { Button } from "components/ui";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "utils/axios";
import toast, { Toaster } from "react-hot-toast";

const ReviewForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);

  const fid = searchParams.get("fid");
  const cid = searchParams.get("cid");

  // Checklist mapping
  const checklistMapping = [
    { id: 1, checkKey: "tracebilitycheck", remarkKey: "tracecheckremark", text: "Certificate Traceable to National or International Standards (NABL/NPL/ILAC/PTB etc.)" },
    { id: 2, checkKey: "comapnycheck", remarkKey: "comapnycheckremark", text: "Company Name and Address" },
    { id: 3, checkKey: "idcheck", remarkKey: "idcheckremark", text: "Our Instrument ID" },
    { id: 4, checkKey: "makecheck", remarkKey: "makecheckremark", text: "Make" },
    { id: 5, checkKey: "modelcheck", remarkKey: "modelcheckremark", text: "Model" },
    { id: 6, checkKey: "srnocheck", remarkKey: "srnocheckremark", text: "Serial Number" },
    { id: 7, checkKey: "lccheck", remarkKey: "lccheckremark", text: "Least Count" },
    { id: 8, checkKey: "calibdatecheck", remarkKey: "calibdatecheckremark", text: "Date of Calibration" },
    { id: 9, checkKey: "duedatecheck", remarkKey: "duedatecheckremark", text: "Suggested/Due Date of Calibration" },
    { id: 10, checkKey: "parametercheck", remarkKey: "parametercheckremark", text: "Required Parameter" },
    { id: 11, checkKey: "rangecheck", remarkKey: "rangecheckremark", text: "Required Range" },
    { id: 12, checkKey: "resultcheck", remarkKey: "resultcheckremark", text: "Review of Calibration Result (Error of our Equipment within relevant referred std. or manual)" },
    { id: 13, checkKey: "uncertaintycheck", remarkKey: "uncertaintycheckremark", text: "Measurement Uncertainty" },
    { id: 14, checkKey: "mastercertnocheck", remarkKey: "mastercertnocheckremark", text: "Master Instrument Calibration Certificate No." },
    { id: 15, checkKey: "masterduedatecheck", remarkKey: "masterduedatecheckremark", text: "Master Instrument Calibration Due Date" },
    { id: 16, checkKey: "kcheck", remarkKey: "kcheckremark", text: "Coverage Factor k" },
    { id: 17, checkKey: "acceptablecheck", remarkKey: "acceptablecheckremark", text: "Certificate Acceptable (if above points are satisfactory)" },
  ];

  // Fetch data from API
  useEffect(() => {
    if (fid && cid) {
      fetchReviewFormData();
    } else {
      toast.error("Missing required parameters");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fid, cid]);

  const fetchReviewFormData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/material/view-review-form", {
        params: {
          masterid: fid,
          validityid: cid,
        },
      });

      if (response.data.status) {
        setFormData(response.data.data);
      } else {
        toast.error("Failed to load review form data");
      }
    } catch (error) {
      console.error("Error fetching review form:", error);
      toast.error(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (fid) {
      navigate(
        `/dashboards/material-list/electro-technical/maintenance-equipment-history?fid=${fid}&labId=1`
      );
    } else {
      navigate(
        "/dashboards/material-list/electro-technical/maintenance-equipment-history"
      );
    }
  };

  // Format date from YYYY-MM-DD to DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString || dateString.startsWith("0000-00-00")) return "";
    const datePart = dateString.split(" ")[0];
    const [year, month, day] = datePart.split("-");
    return `${day}-${month}-${year}`;
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-600">
        <svg
          className="animate-spin h-6 w-6 mr-2 text-blue-600"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"
          ></path>
        </svg>
        Loading Review Form...
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-600">
        <p>No data available</p>
      </div>
    );
  }

  const { mastervalidity, instrument, digitalsign } = formData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />

      <div className="max-w-[1400px] mx-auto bg-white">
        {/* Back Button */}
        <div className="flex justify-end mb-4">
          <Button
            className="h-8 space-x-1.5 rounded-md px-3 text-xs"
            color="primary"
            onClick={handleBack}
          >
            Back
          </Button>
        </div>

        {/* Header Section - Static */}
        <div className="border border-gray-300">
          <div className="grid grid-cols-[350px_1fr] border-b border-gray-300">
            {/* Left Section with Logo */}
            <div className="border-r border-gray-300 p-6 flex flex-col items-center justify-center">
              <div className="mb-2">
                <img
                  src="/images/logo.png"
                  alt="KTRC Logo"
                  className="h-20 w-auto object-contain"
                />
              </div>
              <div className="text-center text-sm font-semibold mt-2">
                Quality First & Forever
              </div>
            </div>

            {/* Center and Right Section */}
            <div className="grid grid-cols-[1fr_400px]">
              {/* Center - Title */}
              <div className="border-r border-gray-300 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="text-lg font-bold mb-2">
                    Kaltech Test And Research Centre Pvt. Ltd.
                  </div>
                  <div className="text-xl font-bold">
                    Review of Calibration Certificate
                  </div>
                </div>
              </div>

              {/* Right - Document Info - Static */}
              <div>
                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="border-r border-gray-300 px-4 py-2 font-semibold bg-gray-50">
                    QF. No.
                  </div>
                  <div className="px-4 py-2">KTRC/QF/0604/06</div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="border-r border-gray-300 px-4 py-2 font-semibold bg-gray-50">
                    Issue No.
                  </div>
                  <div className="px-4 py-2">01</div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="border-r border-gray-300 px-4 py-2 font-semibold bg-gray-50">
                    Issue Date
                  </div>
                  <div className="px-4 py-2">01/06/2019</div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="border-r border-gray-300 px-4 py-2 font-semibold bg-gray-50">
                    Revision No.
                  </div>
                  <div className="px-4 py-2">01</div>
                </div>
                <div className="grid grid-cols-2 border-b border-gray-300">
                  <div className="border-r border-gray-300 px-4 py-2 font-semibold bg-gray-50">
                    Revision Date
                  </div>
                  <div className="px-4 py-2">20/08/2021</div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="border-r border-gray-300 px-4 py-2 font-semibold bg-gray-50">
                    Page
                  </div>
                  <div className="px-4 py-2">1 of 1</div>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Information Section - Dynamic */}
          <div className="border-b border-gray-300">
            <div className="grid grid-cols-2">
              <div className="grid grid-cols-[200px_1fr] border-r border-gray-300">
                <div className="border-r border-b border-gray-300 px-4 py-3 font-semibold bg-gray-50">
                  Equipment Name
                </div>
                <div className="px-4 py-3 border-b border-gray-300">
                  {instrument?.name || "-"}
                </div>
                <div className="border-r border-b border-gray-300 px-4 py-3 font-semibold bg-gray-50">
                  Equipment Id
                </div>
                <div className="px-4 py-3 border-b border-gray-300">
                  {instrument?.idno || "-"}
                </div>
                <div className="border-r border-b border-gray-300 px-4 py-3 font-semibold bg-gray-50">
                  Calibrated by
                </div>
                <div className="px-4 py-3 border-b border-gray-300"></div>
                <div className="border-r border-b border-gray-300 px-4 py-3 font-semibold bg-gray-50">
                  Date Of Review
                </div>
                <div className="px-4 py-3">
                  {formatDate(mastervalidity?.added_on) || "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Checklist Table - Dynamic */}
          <div>
            {/* Table Header */}
            <div className="grid grid-cols-[60px_1fr_120px_200px] border-b border-gray-300 bg-gray-50">
              <div className="border-r border-gray-300 px-4 py-3 font-bold text-center">
                S.NO.
              </div>
              <div className="border-r border-gray-300 px-4 py-3 font-bold">
                CHECK LIST
              </div>
              <div className="border-r border-gray-300 px-4 py-3 font-bold text-center">
                Yes or No
              </div>
              <div className="px-4 py-3 font-bold text-center">
                REMARK,IF ANY
              </div>
            </div>

            {/* Table Rows - Dynamic */}
            {checklistMapping.map((item, index) => {
              const yesNoValue = mastervalidity?.[item.checkKey] || "No";
              const remarkValue = mastervalidity?.[item.remarkKey] || "-";

              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-[60px_1fr_120px_200px] ${index < checklistMapping.length - 1
                      ? "border-b border-gray-300"
                      : ""
                    }`}
                >
                  <div className="border-r border-gray-300 px-4 py-3 text-center">
                    {item.id}
                  </div>
                  <div className="border-r border-gray-300 px-4 py-3">
                    {item.text}
                  </div>
                  <div className="border-r border-gray-300 px-4 py-3 text-center">
                    {yesNoValue}
                  </div>
                  <div className="px-4 py-3 text-center">{remarkValue}</div>
                </div>
              );
            })}
          </div>

          {/* Electronic Signature - Dynamic */}
          <div className="border-t border-gray-300 px-4 py-4">
            {digitalsign && (
              <div className="mb-4">
                <img
                  src={digitalsign}
                  alt="Digital Signature"
                  className="h-20 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;