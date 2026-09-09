import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import axios from "utils/axios";
import { Page } from "components/shared/Page";
import { Card, Button, Table, THead, TBody, Th, Tr, Td } from "components/ui";
import Select from "react-select";

export default function FillReturnCheckList() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const id = searchParams.get("hakuna") || "";

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [instruments, setInstruments] = useState([]);

    // States for the dynamic tables
    const [matrixList, setMatrixList] = useState([]);
    const [generalList, setGeneralList] = useState([]);

    useEffect(() => {
        if (!id) {
            toast.error("Record ID not found in URL");
            setLoading(false);
            return;
        }
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // NOTE: Replace these API URLs with the actual ones on your backend.
            const [resChecklist, resInstruments] = await Promise.all([
                axios.get(`/profile/get-return-checklist/${id}`),
                axios.get("/testing/get-prodcut-list").catch(() => null) // Added a dummy catch to prevent Promise.all from failing if not needed
            ]);

            console.log("=== RETURN CHECKLIST API RESPONSE ===", resChecklist.data);

            if (resChecklist.data?.success || resChecklist.data?.status) {
                const matrixData = resChecklist.data.data?.checklist_records || resChecklist.data.matrix || [];
                const generalData = resChecklist.data.data?.general_checklist_records || resChecklist.data.general || [];

                console.log("Parsed Matrix List:", matrixData);
                console.log("Parsed General List:", generalData);

                setMatrixList(matrixData);
                setGeneralList(generalData);
            } else {
                toast.error(resChecklist.data?.message || "Failed to load checklists");
            }

            if (resInstruments?.data?.status) {
                setInstruments(resInstruments.data.data || []);
            }
        } catch (err) {
            console.error("Error fetching checklist data:", err);
            toast.error("API error fetching return checklist data.");
            setMatrixList([]);
            setGeneralList([]);
        } finally {
            setLoading(false);
        }
    };

    const isValNA = (val) => {
        if (!val) return false;
        const str = String(val).trim().toUpperCase();
        return str === "NA" || str === "N/A" || str === "N.A" || str === "N.A.";
    };

    const isRowNA = (row) => {
        const beforeVal = row.check_point_before_moving || row.checkpointbeforemoving;
        const checkPointVal = row.check_point || row.checkpoint;
        return isValNA(beforeVal) || isValNA(checkPointVal);
    };

    const handleMatrixChange = (index, field, value) => {
        const newList = [...matrixList];
        newList[index][field] = value;

        // Keep both key formats in sync
        if (field === "check_point_after_moving") {
            newList[index].checkpointaftermoving = value;
        } else if (field === "checkpointaftermoving") {
            newList[index].check_point_after_moving = value;
        } else if (field === "return_remarks") {
            newList[index].rremark = value;
        } else if (field === "rremark") {
            newList[index].return_remarks = value;
        }

        // Auto-calculate error and result when checkpoint after moving changes
        if ((field === "checkpointaftermoving" || field === "check_point_after_moving") && !isRowNA(newList[index])) {
            const beforeVal = newList[index].check_point_before_moving || newList[index].checkpointbeforemoving;
            const before = parseFloat(beforeVal);
            const after = parseFloat(value);

            if (!isNaN(before) && !isNaN(after)) {
                const errorVal = after - before;
                const formattedError = errorVal.toFixed(2);
                newList[index].error = formattedError;
                newList[index].deviation = formattedError;

                const acceptLimit = parseFloat(newList[index].acceptance_limit || newList[index].acceptancelimit);
                if (!isNaN(acceptLimit)) {
                    if (Math.abs(errorVal) <= Math.abs(acceptLimit)) {
                        newList[index].result = "Pass";
                    } else {
                        newList[index].result = "Fail";
                    }
                }
            }
        }

        setMatrixList(newList);
    };

    const handleGeneralChange = (index, field, value) => {
        const newList = [...generalList];
        newList[index][field] = value;
        setGeneralList(newList);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation mirroring the PHP HTML5 required checks
        let isValid = true;
        matrixList.forEach((row, idx) => {
            const isNA = isRowNA(row);
            const afterMoving = row.check_point_after_moving || row.checkpointaftermoving;
            const returnRemarks = row.return_remarks || row.rremark;

            if (!isNA && (!afterMoving || String(afterMoving).trim() === "")) {
                toast.error(`Check Point After Moving is required (Row ${idx + 1}).`);
                isValid = false;
            }
            if (isNA && (!returnRemarks || String(returnRemarks).trim() === "")) {
                toast.error(`Return Remark is required when Check Point / Check Point Before Moving is NA (Row ${idx + 1}).`);
                isValid = false;
            }
        });

        if (!isValid) return;

        try {
            setSubmitting(true);

            const payload = {
                // Checklist Record (Matrix)
                checklistrecordid: matrixList.map((row) => row.checklistrecordid || row.id || ""),
                equipformverif: matrixList.map((row) => row.selected_equipment || row.equipformverif || ""),
                generalcheck: matrixList.map((row) => row.general_check || row.generalcheck || ""),
                checkpoint: matrixList.map((row) => row.check_point || row.checkpoint || ""),
                checkpointbeforemoving: matrixList.map((row) => row.check_point_before_moving || row.checkpointbeforemoving || ""),
                checkpointaftermoving: matrixList.map((row) => row.check_point_after_moving || row.checkpointaftermoving || ""),
                error: matrixList.map((row) => row.deviation || row.error || ""),
                acceptancelimit: matrixList.map((row) => row.acceptance_limit || row.acceptancelimit || ""),
                result: matrixList.map((row) => row.result || ""),
                remark: matrixList.map((row) => row.remarks || row.remark || ""),
                rremark: matrixList.map((row) => row.return_remarks || row.rremark || ""),
                dicipline: matrixList.map((row) => row.discipline_id || row.dicipline || row.discipline || ""),
                issueid: matrixList.map((row) => row.issue_id || row.issueid || ""),
                masterid: matrixList.map((row) => row.master_equipment_id || row.masterid || ""),

                // General Checklist Record
                checklistgeneralrecordid: generalList.map((row) => row.checklistgeneralrecordid || row.id || ""),
                quantity: generalList.map((row) => row.quantity || row.qty || ""),
                condition: generalList.map((row) => row.condition || ""),
                remark1: generalList.map((row) => row.remark1 || row.remark || ""),
                rcondition: generalList.map((row) => row.return_condition || row.rcondition || ""),
                rremark1: generalList.map((row) => row.return_remarks || row.rremark1 || ""),
                accessoriesname: generalList.map((row) => row.accessoriesname || row.accessories_name || ""),
                issueid1: generalList.map((row) => row.issue_id || row.issueid || row.issueid1 || ""),
                masterid1: generalList.map((row) => row.master_equipment_id || row.masterid || row.masterid1 || "")
            };

            console.log("Submitting Return Checklist Payload:", payload);

            const res = await axios.post("/profile/add-return-checklist", payload);

            if (res.data?.status || res.data?.success) {
                toast.success(res.data.message || "Return Checklist Submitted Successfully");
                navigate(-1); // Or back to specific issue list
            } else {
                toast.error(res.data?.message || "Submission failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred during submission.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Page title={`Fill Return Checklist - ${id}`}>
                <div className="p-5">Loading checklist data...</div>
            </Page>
        );
    }

    const instrumentOptions = instruments.map((inst) => ({
        value: inst.id,
        label: inst.name,
    }));

    return (
        <Page title={`Fill Return Checklist`}>
            <div className="p-5">
                <Card className="border-none shadow-soft dark:bg-dark-700">
                    <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-dark-500">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-dark-100">
                            Fill Item List
                        </h3>
                        <Link to="/dashboards/profile/my-issue-item-list">
                            <Button color="info" variant="filled">
                                &laquo; Issued Item list
                            </Button>
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4">
                        {/* Table 1: Checklist Matrix */}
                        <div className="overflow-x-auto mb-6">
                            <Table className="w-full text-left [&_th]:px-2 [&_td]:px-2 [&_th]:text-xs">
                                <THead>
                                    <Tr>
                                        <Th>Sr no</Th>
                                        <Th>Master Equipment</Th>
                                        <Th>Discipline</Th>
                                        <Th>Artifact for verification</Th>
                                        <Th>General Check</Th>
                                        <Th>Unit</Th>
                                        <Th>Check Point</Th>
                                        <Th>Check Point Before Moving</Th>
                                        <Th>Check Point After Moving</Th>
                                        <Th>Deviation</Th>
                                        <Th>Acceptance</Th>
                                        <Th>Result</Th>
                                        <Th>Remarks</Th>
                                        <Th>Return Remarks</Th>
                                    </Tr>
                                </THead>
                                <TBody>
                                    {matrixList.length > 0 ? (
                                        matrixList.map((row, idx) => {
                                            const isNA = isRowNA(row);
                                            return (
                                                <Tr key={idx}>
                                                    <Td>{idx + 1}</Td>
                                                    <Td className="whitespace-normal min-w-[150px] max-w-[200px] text-xs leading-tight">
                                                        {row.master_equipment || `${row.name || row.instrument_name || row.equipment_name || ""} (${row.idno || row.instrument_no || row.equipment_idno || ""})`}
                                                    </Td>
                                                    <Td>{row.discipline_name || row.discipline || ""}</Td>
                                                    <Td>
                                                        <Select
                                                            className="text-xs min-w-[140px]"
                                                            classNamePrefix="react-select"
                                                            options={row.equipment_options || instrumentOptions}
                                                            value={(row.equipment_options || instrumentOptions).find((opt) => String(opt.value) === String(row.selected_equipment || row.equipformverif)) || null}
                                                            isDisabled
                                                            menuPortalTarget={document.body}
                                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                        />
                                                    </Td>
                                                    <Td>
                                                        <input
                                                            type="text"
                                                            value={row.general_check || row.generalcheck || ""}
                                                            className="form-input text-xs px-2 py-1.5 w-16 bg-gray-100 rounded border-gray-300 dark:border-dark-600 dark:bg-dark-800"
                                                            readOnly
                                                        />
                                                    </Td>
                                                    <Td>{row.unit || row.unit_description || ""}</Td>
                                                    <Td>
                                                        <input
                                                            type="text"
                                                            value={row.check_point || row.checkpoint || ""}
                                                            className="form-input text-xs px-2 py-1.5 w-16 bg-gray-100 rounded border-gray-300 dark:border-dark-600 dark:bg-dark-800"
                                                            readOnly
                                                        />
                                                    </Td>
                                                    <Td>
                                                        <input
                                                            type="text"
                                                            value={row.check_point_before_moving || row.checkpointbeforemoving || ""}
                                                            className="form-input text-xs px-2 py-1.5 w-16 bg-gray-100 rounded border-gray-300 dark:border-dark-600 dark:bg-dark-800"
                                                            readOnly
                                                        />
                                                    </Td>
                                                    <Td>
                                                        <input
                                                            type="text"
                                                            value={row.check_point_after_moving || row.checkpointaftermoving || ""}
                                                            onChange={(e) => handleMatrixChange(idx, "check_point_after_moving", e.target.value)}
                                                            className={`form-input text-xs px-2 py-1.5 w-16 rounded border-gray-300 dark:border-dark-600 ${isNA ? "bg-gray-100 dark:bg-dark-800 cursor-not-allowed" : "dark:bg-dark-900"}`}
                                                            readOnly={isNA}
                                                            required={!isNA}
                                                        />
                                                    </Td>
                                                    <Td>
                                                        <input
                                                            type="text"
                                                            value={row.deviation || row.error || ""}
                                                            className="form-input text-xs px-2 py-1.5 w-16 bg-gray-100 rounded border-gray-300 dark:border-dark-600 dark:bg-dark-800"
                                                            readOnly
                                                        />
                                                    </Td>
                                                    <Td>
                                                        <input
                                                            type="text"
                                                            value={row.acceptance_limit || row.acceptancelimit || ""}
                                                            className="form-input text-xs px-2 py-1.5 w-16 bg-gray-100 rounded border-gray-300 dark:border-dark-600 dark:bg-dark-800"
                                                            readOnly
                                                        />
                                                    </Td>
                                                    <Td>
                                                        <input
                                                            type="text"
                                                            value={row.result || ""}
                                                            className="form-input text-xs px-2 py-1.5 w-16 bg-gray-100 rounded border-gray-300 dark:border-dark-600 dark:bg-dark-800"
                                                            readOnly
                                                        />
                                                    </Td>
                                                    <Td>
                                                        <input
                                                            type="text"
                                                            value={row.remark || row.remarks || ""}
                                                            className="form-input text-xs px-2 py-1.5 w-16 bg-gray-100 rounded border-gray-300 dark:border-dark-600 dark:bg-dark-800"
                                                            readOnly
                                                        />
                                                    </Td>
                                                    <Td>
                                                        <input
                                                            type="text"
                                                            value={row.return_remarks || row.rremark || ""}
                                                            onChange={(e) => handleMatrixChange(idx, "return_remarks", e.target.value)}
                                                            className="form-input text-xs px-2 py-1.5 w-16 rounded border-gray-300 dark:border-dark-600 dark:bg-dark-900"
                                                            required={isNA}
                                                        />
                                                    </Td>
                                                </Tr>
                                            );
                                        })
                                    ) : (
                                        <Tr>
                                            <Td colSpan={14} className="text-center p-4">No Matrix Records Found</Td>
                                        </Tr>
                                    )}
                                </TBody>
                            </Table>
                        </div>

                        {/* Table 2: General Checklist Matrix */}
                        <div className="overflow-x-auto mb-6">
                            <Table className="w-full text-left [&_th]:px-2 [&_td]:px-2 [&_th]:text-xs">
                                <THead>
                                    <Tr>
                                        <Th>Sr no</Th>
                                        <Th>Master Equipment</Th>
                                        <Th>Accessories name</Th>
                                        <Th>Quantity</Th>
                                        <Th>Condition</Th>
                                        <Th>Remarks</Th>
                                        <Th>Return Condition</Th>
                                        <Th>Return Remarks</Th>
                                    </Tr>
                                </THead>
                                <TBody>
                                    {generalList.length > 0 ? (
                                        generalList.map((row, idx) => (
                                            <Tr key={idx}>
                                                <Td>{idx + 1}</Td>
                                                <Td className="whitespace-normal min-w-[150px] max-w-[200px] text-xs leading-tight">
                                                    {row.master_equipment || `${row.name || row.instrument_name || row.equipment_name || ""} (${row.idno || row.instrument_no || row.equipment_idno || ""})`}
                                                </Td>
                                                <Td>{row.accessoriesname || row.accessories_name || ""}</Td>
                                                <Td>
                                                    <input
                                                        type="text"
                                                        value={row.quantity || row.qty || ""}
                                                        className="form-input text-xs px-2 py-1.5 w-20 bg-gray-100"
                                                        readOnly
                                                    />
                                                </Td>
                                                <Td>
                                                    <input
                                                        type="text"
                                                        value={row.condition || ""}
                                                        className="form-input text-xs px-2 py-1.5 w-24 bg-gray-100 rounded border-gray-300 dark:border-dark-600 dark:bg-dark-800"
                                                        readOnly
                                                    />
                                                </Td>
                                                <Td>
                                                    <input
                                                        type="text"
                                                        value={row.remark || row.remarks || ""}
                                                        className="form-input text-xs px-2 py-1.5 w-24 bg-gray-100 rounded border-gray-300 dark:border-dark-600 dark:bg-dark-800"
                                                        readOnly
                                                    />
                                                </Td>
                                                <Td>
                                                    <input
                                                        type="text"
                                                        value={row.return_condition || row.rcondition || ""}
                                                        onChange={(e) => handleGeneralChange(idx, "return_condition", e.target.value)}
                                                        className="form-input text-xs px-2 py-1.5 w-24 rounded border-gray-300 dark:border-dark-600 dark:bg-dark-900"
                                                    />
                                                </Td>
                                                <Td>
                                                    <input
                                                        type="text"
                                                        value={row.return_remarks || row.rremark1 || ""}
                                                        onChange={(e) => handleGeneralChange(idx, "return_remarks", e.target.value)}
                                                        className="form-input text-xs px-2 py-1.5 w-24 rounded border-gray-300 dark:border-dark-600 dark:bg-dark-900"
                                                    />
                                                </Td>
                                            </Tr>
                                        ))
                                    ) : (
                                        <Tr>
                                            <Td colSpan={8} className="text-center p-4">No General Records Found</Td>
                                        </Tr>
                                    )}
                                </TBody>
                            </Table>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-dark-500">
                            <Button type="submit" color="info" disabled={submitting}>
                                {submitting ? "Submitting..." : "Submit"}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </Page>
    );
}
