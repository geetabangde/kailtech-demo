import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { JWT_HOST_API } from "configs/auth.config";

function ViewSticker() {
    const navigate = useNavigate();
    const location = useLocation();
    const { inwardId, instId } = useParams();

    const [stickersData, setStickersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Extract other parameters from location state
    const caliblocation = location.state?.caliblocation || "Lab";
    const calibacc = location.state?.calibacc || "Nabl";

    // Function to get auth token from localStorage or wherever you store it
    const getAuthToken = () => {
        const token = localStorage.getItem('token') ||
            localStorage.getItem('authToken') ||
            localStorage.getItem('access_token') ||
            sessionStorage.getItem('token') ||
            sessionStorage.getItem('authToken');
        return token;
    };

    // API call to fetch sticker data for multiple instruments
    useEffect(() => {
        const fetchStickersData = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = getAuthToken();

                if (!token) {
                    setError('Authentication token not found. Please login again.');
                    setLoading(false);
                    return;
                }

                // Split instId into array of IDs
                const instIds = instId.split(',').map(id => id.trim());

                const headers = {
                    'Content-Type': 'application/json',
                };

                if (token.startsWith('Bearer ')) {
                    headers['Authorization'] = token;
                } else {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                // Fetch sticker data for each instrument
                const promises = instIds.map(async (id) => {
                    try {
                        console.log('Making API call for instId:', id);

                        const response = await fetch(
                            `${JWT_HOST_API}/calibrationprocess/view-sticker`,
                            {
                                method: 'POST',
                                headers: headers,
                                body: JSON.stringify({
                                    inwardid: inwardId,
                                    instid: id
                                }),
                            }
                        );

                        if (!response.ok) {
                            if (response.status === 401) {
                                throw new Error('Authentication failed. Please login again.');
                            }
                            if (response.status === 404) {
                                console.warn(`Sticker not found for instId ${id}`);
                                return null;
                            }
                            console.warn(`HTTP error! status: ${response.status} for instId ${id}`);
                            return null;
                        }

                        const result = await response.json();

                        if (result.status === "true" || result.status === true) {
                            return result.data;
                        } else {
                            console.warn(`Failed to fetch sticker data for instId ${id}:`, result.message);
                            return null;
                        }
                    } catch (err) {
                        console.error(`Error fetching sticker for instId ${id}:`, err);
                        if (err?.message?.includes('Authentication failed')) {
                            throw err;
                        }
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                const validResults = results.filter(result => result !== null);
                
                if (validResults.length === 0 && instIds.length > 0) {
                     throw new Error('No instruments found with the given criteria');
                }
                
                setStickersData(validResults);

            } catch (err) {
                console.error('API Error:', err);
                setError(`Network error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (inwardId && instId) {
            fetchStickersData();
        } else {
            setError('Missing required parameters (inwardId and instId)');
            setLoading(false);
        }
    }, [inwardId, instId]);

    const handleBack = () => {
        navigate(`/dashboards/calibration-process/inward-entry-lab/perform-calibration/${inwardId}`, {
            state: {
                caliblocation,
                calibacc
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        if (typeof dateString === 'string' && dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                if (parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
                    return dateString;
                }
                if (parts[1].length <= 2 && parts[0].length <= 2 && parts[2].length === 4) {
                    return `${parts[1].padStart(2, '0')}/${parts[0].padStart(2, '0')}/${parts[2]}`;
                }
            }
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Style for print
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                /* Hide everything by default */
                body * {
                    visibility: hidden;
                }
                
                /* Reset positioning and spacing on all elements to prevent sidebar layout shifts */
                * {
                    position: static !important;
                    box-shadow: none !important;
                }
                
                /* Show our print container and its children */
                .print-container, .print-container * {
                    visibility: visible;
                }
                
                /* Position the print container absolutely to the page to break out of all wrappers */
                .print-container {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background-color: white !important;
                }
                
                .noprint { display: none !important; }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const StickerCard = ({ stickerData }) => {
        const instrument = stickerData?.instruments?.[0];
        const companyInfo = stickerData?.company_info?.[0];

        return (
            <div
                className="page-break-inside-avoid bg-white"
                style={{
                    pageBreakInside: 'avoid',
                    float: 'left',
                    marginLeft: '1%',
                    marginBottom: '1%',
                    width: '31%',
                    border: '1px solid black',
                    padding: '4px',
                    fontFamily: 'Times New Roman, serif'
                }}
            >
                <div style={{ float: 'left' }}>
                    {companyInfo?.logo ? (
                        <img 
                            src={companyInfo.logo} 
                            style={{ width: '55px', filter: 'grayscale(100%)' }} 
                            alt="Logo" 
                        />
                    ) : (
                        <div style={{ width: '55px', textAlign: 'center', fontSize: '10px', fontWeight: 'bold' }}>ktrc</div>
                    )}
                </div>
                
                <div style={{ margin: 'auto' }}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', lineHeight: '1.2', marginBottom: '2px', paddingLeft: '55px' }}>
                        {companyInfo?.name || 'Kailtech Test And Research Centre Pvt. Ltd.'}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '8px' }}>
                        {companyInfo?.address || 'Plot No.141-C, Electronic Complex, Industrial Area, Indore-452010 (MADHYA PRADESH) India'} {companyInfo?.phone || 'Ph: 91-731-4787555 (30 lines)'}
                    </div>
                    
                    <div style={{ textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>
                        Calibration Status Tag
                    </div>
                    
                    <div style={{ textAlign: 'left', fontSize: '10px', lineHeight: '12px', paddingTop: '8px' }}>
                        <b>Inst. Name: - </b>{instrument?.name || 'N/A'}
                    </div>
                    {instrument?.instlocation && (
                        <div style={{ textAlign: 'left', fontSize: '10px', lineHeight: '12px' }}>
                            <b>Location: - </b>{instrument.instlocation}
                        </div>
                    )}
                    <div style={{ textAlign: 'left', fontSize: '10px', lineHeight: '12px' }}>
                        <b>ID/Sr.: - </b>
                        {(instrument?.idno && instrument?.idno !== 'NA' ? instrument.idno : 'N.A')}/
                        {(instrument?.serialno && instrument?.serialno !== 'NA' ? instrument.serialno : 'N.A')}
                    </div>
                    <div style={{ textAlign: 'left', fontSize: '10px', lineHeight: '12px' }}>
                        <b>BRN No: - </b>{instrument?.bookingrefno || 'N/A'}
                    </div>
                    <div style={{ textAlign: 'left', fontSize: '10px', lineHeight: '12px' }}>
                        <b>Cal. Date: - </b>{formatDate(instrument?.calibratedon)}
                    </div>
                    <div style={{ textAlign: 'left', fontSize: '10px', lineHeight: '12px' }}>
                        <b>Due. Date No: - </b>{formatDate(instrument?.duedate)}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center text-gray-600">
                <svg className="animate-spin h-6 w-6 mr-2 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
                </svg>
                Loading ViewStickers...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header Section */}
                <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 shadow-sm">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-gray-800">View Stickers</h1>
                        <button
                            onClick={handleBack}
                            className="bg-indigo-500 hover:bg-fuchsia-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            ← Back to Perform Calibration
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-red-700">{error}</p>
                            {error.includes('Authentication') && (
                                <p className="text-red-600 mt-2 text-sm">
                                    Please check if you are logged in and try again.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section - Sticky at top */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 shadow-sm noprint">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        View Stickers ({stickersData.length})
                    </h1>
                    <div className="space-x-4">
                        <button
                            onClick={() => window.print()}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Print
                        </button>
                        <button
                            onClick={handleBack}
                            className="bg-indigo-500 hover:bg-fuchsia-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            ← Back to Perform Calibration
                        </button>
                    </div>
                </div>
            </div>

            {/* Stickers Grid */}
            <div className="p-8 print-container">
                <div className="max-w-[8.71in] mx-auto overflow-hidden">
                    {stickersData.map((stickerData, index) => (
                        <StickerCard key={index} stickerData={stickerData} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ViewSticker;