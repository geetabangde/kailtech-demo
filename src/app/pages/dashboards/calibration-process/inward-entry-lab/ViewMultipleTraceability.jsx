import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'utils/axios';
import { toast } from 'sonner';

const ViewMultipleTraceability = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { inwardId, instIds } = useParams();
    const caliblocation = searchParams.get("caliblocation") || "Lab";
    const calibacc = searchParams.get("calibacc") || "Nabl";
    
    const [pdfUrls, setPdfUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPdfs = async () => {
            try {
                const authToken =
                    localStorage.getItem("authToken") ||
                    localStorage.getItem("token") ||
                    sessionStorage.getItem("authToken") ||
                    sessionStorage.getItem("token");

                const headers = {
                    "Content-Type": "application/json",
                };
                if (authToken) {
                    headers.Authorization = `Bearer ${authToken}`;
                }

                const response = await axios.post(
                    `/calibrationprocess/view-tracebility?inwardid=${inwardId}&instid=${instIds}`,
                    {},
                    { headers }
                );

                if (response.data.status && response.data.data) {
                    const pdfLinks = response.data.data;
                    setPdfUrls(pdfLinks);
                    toast.success(`${pdfLinks.length} Certificate(s) loaded successfully`);
                } else {
                    setError('No Certificates found');
                    toast.error('No Certificates found');
                }
            } catch (err) {
                setError('Error loading Certificates');
                toast.error('Error loading Certificates');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (inwardId && instIds) {
            fetchPdfs();
        }
    }, [inwardId, instIds]);

    const handleBack = () => {
        navigate(
            `/dashboards/calibration-process/inward-entry-lab/perform-calibration/${inwardId}?caliblocation=${caliblocation}&calibacc=${calibacc}`
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="flex h-[60vh] items-center justify-center text-gray-600">
                            <svg className="animate-spin h-6 w-6 mr-2 text-blue-600" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
                            </svg>
                            Loading View Multiple Tracebility....
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || pdfUrls.length === 0) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#ffffff'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#dc2626', fontSize: '18px', marginBottom: '16px' }}>
                        {error || 'No Certificates to display'}
                    </p>
                    <button
                        onClick={handleBack}
                        style={{
                            padding: '8px 24px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            width: '100%',
            minHeight: '100vh',
            backgroundColor: '#ffffff'
        }}>
            {/* Action Buttons - No Print */}
            <div className="no-print" style={{
                position: 'sticky',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                backgroundColor: 'white',
                borderBottom: '2px solid #e5e7eb',
                padding: '16px 24px',
                display: 'flex',
                gap: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
                <button
                    onClick={handleBack}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                    ← Back to perform calibration
                </button>
               
                <div style={{
                    marginLeft: 'auto',
                    fontSize: '14px',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: '500'
                }}>
                    Total Certificates: <span style={{ 
                        marginLeft: '8px', 
                        color: '#2563eb',
                        fontSize: '16px',
                        fontWeight: '700'
                    }}>{pdfUrls.length}</span>
                </div>
            </div>

            {/* Certificates Container */}
            <div style={{ 
                padding: '0',
                width: '100%',
                backgroundColor: '#ffffff'
            }}>
                {pdfUrls.map((item, index) => {
                    const url = typeof item === 'string' ? item : (item?.file || item?.url || '');
                    const title = typeof item === 'object' && item?.name
                        ? `${item.name}${item.idno ? ` (${item.idno})` : ''}${item.certificateno ? ` - ${item.certificateno}` : ''}`
                        : `Certificate ${index + 1} of ${pdfUrls.length}`;

                    return (
                    <div 
                        key={index}
                        style={{
                            width: '100%',
                            backgroundColor: '#ffffff',
                            marginBottom: index < pdfUrls.length - 1 ? '40px' : '0',
                            pageBreakAfter: index < pdfUrls.length - 1 ? 'always' : 'auto',
                            pageBreakInside: 'avoid',
                            position: 'relative'
                        }}
                    >
                        {/* Certificate Header - No Print */}
                        <div className="no-print" style={{
                            padding: '16px 24px',
                            backgroundColor: '#f8fafc',
                            borderBottom: '2px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{
                                fontSize: '15px',
                                fontWeight: '700',
                                color: '#1e293b',
                                letterSpacing: '0.5px'
                            }}>
                                📄 {title}
                            </span>
                            {url && (
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        fontSize: '13px',
                                        color: '#2563eb',
                                        fontWeight: '600',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Open in New Tab ↗
                                </a>
                            )}
                        </div>

                        {/* PDF Content - Clean white background, no scrollbar */}
                        <div style={{
                            width: '100%',
                            backgroundColor: '#ffffff',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <iframe
                                src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=100`}
                                style={{
                                    width: '100%',
                                    height: '1400px',
                                    border: 'none',
                                    display: 'block',
                                    backgroundColor: '#ffffff',
                                    overflow: 'hidden'
                                }}
                                scrolling="no"
                                title={`Certificate ${index + 1}`}
                            />
                        </div>

                        {/* Separator between certificates - No Print */}
                        {index < pdfUrls.length - 1 && (
                            <div className="no-print" style={{
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#ffffff'
                            }}>
                                <div style={{
                                    width: '200px',
                                    height: '2px',
                                    background: 'linear-gradient(to right, transparent, #cbd5e1, transparent)'
                                }}></div>
                            </div>
                        )}
                    </div>
                    );
                })}
            </div>

            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    
                    body {
                        margin: 0;
                        padding: 0;
                        background-color: #ffffff;
                    }
                    
                    /* Remove scrollbar from iframes */
                    iframe {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                    
                    iframe::-webkit-scrollbar {
                        display: none;
                    }
                    
                    @media print {
                        .no-print {
                            display: none !important;
                        }
                        
                        body {
                            margin: 0;
                            padding: 0;
                            background-color: #ffffff;
                        }
                        
                        @page {
                            margin: 0;
                            size: A4 portrait;
                        }
                        
                        iframe {
                            page-break-inside: avoid;
                            height: auto !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default ViewMultipleTraceability;