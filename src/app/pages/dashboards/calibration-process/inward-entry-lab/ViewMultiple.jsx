import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";
import { Button } from "components/ui";

export default function ViewMultipleDraft() {
  const params = useParams();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printLoading, setPrintLoading] = useState(false);

  // Extract parameters from URL
  const inwardId = params.id || params.inwardId;
  const instId = params.itemId || params.instId;

  console.log("URL Params:", params);
  console.log("Extracted inwardId:", inwardId);
  console.log("Extracted instId:", instId);

  // Get caliblocation and calibacc from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const caliblocation = searchParams.get('caliblocation') || 'Lab';
  const calibacc = searchParams.get('calibacc') || 'Nabl';

  console.log("URL Search Params:", {
    caliblocation,
    calibacc,
    fullURL: window.location.href
  });

  // Parse multiple instrument IDs
  const getInstrumentIds = () => {
    if (!instId) return [];
    // Handle both comma-separated and single IDs
    if (instId.includes(',')) {
      return instId.split(',').map(id => id.trim()).filter(id => id);
    }
    return [instId.trim()].filter(id => id);
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchSingleCertificate = async (instid, retries = 1) => {
      const apiUrl = `/calibrationprocess/view-multiple-draft-certificate?inwardid=${inwardId}&instid=${instid}&caliblocation=${caliblocation}&calibacc=${calibacc}`;
      try {
        console.log(`Fetching certificate for instid ${instid}:`, apiUrl);
        const response = await axios.get(apiUrl);
        console.log(`API Response for instid ${instid}:`, response.data);

        let htmlContent = '';
        if (response.data) {
          if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
            htmlContent = response.data.data[0] || '';
          } else if (response.data.success && response.data.data && typeof response.data.data === 'string') {
            htmlContent = response.data.data;
          } else if (typeof response.data === 'string') {
            htmlContent = response.data;
          } else if (response.data.data) {
            htmlContent = response.data.data;
          }
        }

        if (htmlContent) {
          return { instid, html: htmlContent, success: true };
        }

        return { instid, html: null, success: false, error: 'Empty content returned' };
      } catch (error) {
        if (retries > 0) {
          await new Promise((res) => setTimeout(res, 400));
          return fetchSingleCertificate(instid, retries - 1);
        }
        console.error(`Error fetching certificate for instid ${instid}:`, error);
        return {
          instid,
          html: null,
          success: false,
          error: error.response?.data?.message || error.message
        };
      }
    };

    const fetchCertificates = async () => {
      const instids = getInstrumentIds();

      console.log("Processing instrument IDs:", instids);

      if (!inwardId) {
        toast.error('Missing inwardId parameter');
        setLoading(false);
        return;
      }

      if (instids.length === 0) {
        toast.error('Missing instId parameter');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const results = [];
        const batchSize = 5;

        // Process in batches of 5 to avoid connection limits and server timeouts
        for (let i = 0; i < instids.length; i += batchSize) {
          if (isCancelled) return;
          const batch = instids.slice(i, i + batchSize);
          const batchResults = await Promise.all(
            batch.map((id) => fetchSingleCertificate(id))
          );
          results.push(...batchResults);
        }

        if (isCancelled) return;

        console.log("All API results:", results);

        // Filter successful certificates
        const successfulCertificates = results.filter((res) => res.success && res.html);
        const failedCount = results.length - successfulCertificates.length;

        console.log("Successful certificates:", successfulCertificates);

        if (successfulCertificates.length > 0) {
          setCertificates(successfulCertificates);
          toast.success(`Loaded ${successfulCertificates.length} certificate(s)`);
          if (failedCount > 0) {
            toast.error(`${failedCount} certificate(s) could not be loaded`);
          }
        } else {
          setCertificates([]);
          toast.error("No certificates could be loaded");
        }
      } catch (error) {
        if (isCancelled) return;
        console.error("Error fetching certificates:", error);
        toast.error("Failed to fetch certificates");
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchCertificates();

    return () => {
      isCancelled = true;
    };
  }, [inwardId, instId, caliblocation, calibacc]);

  // Print handler for all certificates
  const handlePrint = () => {
    if (certificates.length === 0) {
      toast.error("No certificates to print");
      return;
    }

    setPrintLoading(true);
    try {
      const processCertificateHtml = (htmlString) => {
        if (!htmlString || typeof htmlString !== 'string') return '';
        try {
          if (/<html|<body/i.test(htmlString)) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            const styles = Array.from(doc.querySelectorAll('style, link[rel="stylesheet"]'))
              .map((el) => el.outerHTML)
              .join('\n');
            const bodyContent = doc.body ? doc.body.innerHTML : htmlString;
            return `${styles}\n${bodyContent}`;
          }
        } catch (e) {
          console.error("Error parsing cert html:", e);
        }
        return htmlString;
      };

      // Combine all certificate HTML content wrapped in page containers
      const allCertificatesHtml = certificates
        .map((cert, index) => {
          const isLast = index === certificates.length - 1;
          const cleanHtml = processCertificateHtml(cert.html);
          const pageBreakAfterCss = !isLast
            ? 'page-break-after: always !important; break-after: page !important;'
            : '';
          const pageBreakBeforeCss = index > 0
            ? 'page-break-before: always !important; break-before: page !important;'
            : '';

          return `
            <div class="cert-page-wrapper" style="${pageBreakBeforeCss} ${pageBreakAfterCss} display: block; width: 100%; clear: both;">
              ${cleanHtml}
            </div>
          `;
        })
        .join('\n');

      const printableDocument = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Multiple Certificates</title>
            <style>
              @page {
                size: auto;
                margin: 10mm;
              }
              * {
                box-sizing: border-box;
              }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 0;
                background: #fff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .certificate-container { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
              }
              .cert-page-wrapper {
                display: block;
                width: 100%;
                clear: both;
              }
              .cert-page-wrapper::after {
                content: "";
                display: table;
                clear: both;
              }
              @media print {
                body { 
                  margin: 0; 
                  padding: 0; 
                }
                .cert-page-wrapper {
                  display: block !important;
                  clear: both !important;
                  page-break-inside: auto !important;
                  break-inside: auto !important;
                }
                .cert-page-wrapper:not(:last-child) {
                  page-break-after: always !important;
                  break-after: page !important;
                }
                .cert-page-wrapper + .cert-page-wrapper {
                  page-break-before: always !important;
                  break-before: page !important;
                }
              }
            </style>
          </head>
          <body>
            ${allCertificatesHtml}
          </body>
        </html>
      `;

      // Clean up any existing print iframe
      const oldFrame = document.getElementById('cert-print-iframe');
      if (oldFrame) {
        oldFrame.remove();
      }

      // Use a hidden iframe to prevent popup-blockers and tab-freezing crashes
      const printFrame = document.createElement('iframe');
      printFrame.id = 'cert-print-iframe';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = 'none';
      printFrame.style.visibility = 'hidden';
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow.document;
      frameDoc.open();
      frameDoc.write(printableDocument);
      frameDoc.close();

      const cleanup = () => {
        if (document.body.contains(printFrame)) {
          printFrame.remove();
        }
        setPrintLoading(false);
      };

      if (printFrame.contentWindow) {
        printFrame.contentWindow.onafterprint = cleanup;
      }

      // Allow DOM and CSS in iframe to render before opening print dialog
      setTimeout(() => {
        try {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
        } catch (printErr) {
          console.error("Iframe print error:", printErr);
          toast.error("Print failed");
        } finally {
          setTimeout(cleanup, 500);
        }
      }, 300);

    } catch (error) {
      console.error("Print failed:", error);
      toast.error("Print failed");
      setPrintLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Page title="Multiple Draft Certificates">
        <div className="flex h-[60vh] items-center justify-center text-gray-600">
          <div className="text-center">
            <svg
              className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"
              ></path>
            </svg>
            <div className="text-lg">Loading Draft Certificates...</div>
            <div className="text-sm text-gray-500 mt-2">
              InwardId: {inwardId}, InstIds: {instId}
            </div>
          </div>
        </div>
      </Page>
    );
  }

  // No certificates found
  if (certificates.length === 0) {
    return (
      <Page title="Multiple Draft Certificates">
        <div className="flex h-[60vh] items-center justify-center text-gray-600">
          <div className="text-center">
            <div className="text-4xl mb-4">📋</div>
            <div className="text-xl mb-2">No Certificates Found</div>
            <div className="text-sm text-gray-500 mb-4">
              Please check your parameters and try again
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-left text-xs">
              <div><strong>Current Parameters:</strong></div>
              <div>InwardId: {inwardId || 'Missing'}</div>
              <div>InstId: {instId || 'Missing'}</div>
              <div>CalibLocation: {caliblocation}</div>
              <div>CalibAcc: {calibacc}</div>
              <div>Full URL: {window.location.href}</div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </Page>
    );
  }

  // Main render
  return (
    <Page title="Multiple Draft Certificates">
      <div className="flex gap-6 items-start">
        <div className="flex-1">
          <div className="space-y-8">
            {certificates.map((cert, index) => (
              <div key={cert.instid} className="certificate-container">
                <div className="w-full">

                  <div
                    dangerouslySetInnerHTML={{ __html: cert.html }}
                    className="w-full"
                  />

                  {index < certificates.length - 1 && (
                    <div className="border-t-2 border-gray-300 my-8 pt-8"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 sticky top-4">
          <div className="space-y-3">
            <Button
              onClick={handlePrint}
              color="success"
              disabled={printLoading || certificates.length === 0}
              className="px-6 py-3 text-sm font-medium rounded-md shadow-lg hover:shadow-xl transition-all duration-200"
              style={{
                minWidth: '160px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {printLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"
                    ></path>
                  </svg>
                  Preparing...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download All CRFs
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
}








