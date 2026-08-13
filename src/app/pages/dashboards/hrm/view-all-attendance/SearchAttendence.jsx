import   { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'utils/axios';
import { Page } from 'components/shared/Page';
import { Card, Button, Table, THead, TBody, Th, Tr, Td, ReactSelect, Input } from 'components/ui';

export default function SearchAttendence() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Get month and year from URL parameters, defaulting to current if not provided
    const urlMonth = searchParams.get('month');
    const urlYear = searchParams.get('year');
    
    const month = urlMonth ? parseInt(urlMonth, 10) : new Date().getMonth() + 1;
    const year = urlYear ? parseInt(urlYear, 10) : new Date().getFullYear();

    const [date, setDate] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    const [attendanceData, setAttendanceData] = useState(null);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Fetch employee list for the dropdown
    useEffect(() => {
        const fetchEmployees = async () => {
            setLoadingEmployees(true);
            try {
                // Fetching active employees (status: '1') similar to PHP code 'status=1 or status=2'
                const response = await axios.get('/hrm/get-employee-list', { params: { status: '1' } });
                if (response.data.status && Array.isArray(response.data.data)) {
                    const formatted = response.data.data.map(emp => ({
                        value: String(emp.id), // Ensure it's string for robust comparison in ReactSelect
                        label: `${emp.firstname || ''} ${emp.middlename || ''} ${emp.lastname || ''}, ${emp.empid || ''}`.trim()
                    }));
                    setEmployees(formatted);
                }
            } catch (err) {
                console.error("Error fetching employees", err);
            } finally {
                setLoadingEmployees(false);
            }
        };
        fetchEmployees();
    }, []);

    const handleSelectAll = () => {
        setSelectedUsers(employees.map(emp => String(emp.value)));
    };

    const handleDeselectAll = () => {
        setSelectedUsers([]);
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();

        if (!date && (!selectedUsers || selectedUsers.length === 0)) {
            setErrorMsg("Please Enter Search Parameter");
            setAttendanceData(null);
            return;
        }
        
        setErrorMsg('');
        setLoadingAttendance(true);

        try {
            let formattedDate = undefined;
            if (date) {
                const [y, m, d] = date.split('-');
                formattedDate = `${d}/${m}/${y}`;
            }

            const payload = {
                month: String(month),
                year: String(year)
            };
            
            if (formattedDate) {
                payload.date = formattedDate;
            }
            if (selectedUsers && selectedUsers.length > 0) {
                payload.user = selectedUsers.map(Number);
            }

            const response = await axios.post('/hrm/attendance-by-date', payload);
            
            if (response.data && response.data.status) {
                setAttendanceData(Array.isArray(response.data.data) ? response.data.data : []);
            } else {
                setAttendanceData([]);
            }
        } catch (err) {
            console.error("Error fetching attendance data", err);
            setAttendanceData([]);
        } finally {
            setLoadingAttendance(false);
        }
    };

    // Calculate dates for table columns
    const lastDate = useMemo(() => new Date(year, month, 0).getDate(), [year, month]);

    const dateColumns = useMemo(() => {
        if (date) return [date]; // Single column if date is selected
        const cols = [];
        for (let i = 1; i <= lastDate; i++) {
            const d = String(i).padStart(2, '0');
            const m = String(month).padStart(2, '0');
            cols.push(`${year}-${m}-${d}`);
        }
        return cols;
    }, [date, lastDate, month, year]);

    // Limit date picker selection to the provided month and year
    const minDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const maxDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDate).padStart(2, '0')}`;

    return (
        <Page title={`View Attendance By Date ${String(month).padStart(2, '0')}-${year}`}>
            <div className="w-full pb-5">
                <Card className="flex flex-col p-5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                            View Attendance By Date {String(month).padStart(2, '0')}-{year}
                        </h3>
                        <Button variant="outline" color="secondary" onClick={() => navigate(-1)}>
                            &lt;&lt; Back
                        </Button>
                    </div>

                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-6">
                        <div className="md:col-span-3">
                            <Input
                                type="date"
                                label="Date"
                                name="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={minDate}
                                max={maxDate}
                            />
                        </div>
                        <div className="md:col-span-5">
                            <ReactSelect
                                label="Select Users"
                                name="users"
                                options={employees}
                                isMulti
                                value={selectedUsers}
                                onChange={(val) => setSelectedUsers(val)}
                                isDisabled={loadingEmployees}
                                placeholder={loadingEmployees ? "Loading..." : "Select users..."}
                            />
                        </div>
                        <div className="md:col-span-4 flex flex-wrap gap-2">
                            <Button type="button" variant="soft" color="primary" onClick={handleSelectAll}>
                                Select All
                            </Button>
                            <Button type="button" variant="soft" color="primary" onClick={handleDeselectAll}>
                                Deselect All
                            </Button>
                            <Button type="submit" color="info" disabled={loadingAttendance}>
                                {loadingAttendance ? 'Searching...' : 'Submit'}
                            </Button>
                        </div>
                    </form>

                    {errorMsg && (
                        <div className="text-red-500 mb-4">{errorMsg}</div>
                    )}

                    {attendanceData !== null && !errorMsg && (
                        <div className="table-wrapper overflow-x-auto min-w-full grow">
                            <Table bordered hoverable className="w-full text-left rtl:text-right text-sm">
                                <THead>
                                    <Tr>
                                        <Th className="bg-gray-100 dark:bg-dark-800 font-semibold whitespace-nowrap">Sr No</Th>
                                        <Th className="bg-gray-100 dark:bg-dark-800 font-semibold whitespace-nowrap">Name</Th>
                                        <Th className="bg-gray-100 dark:bg-dark-800 font-semibold whitespace-nowrap">Employee Code</Th>
                                        {dateColumns.map(colDate => {
                                            const [y, m, d] = colDate.split('-');
                                            return (
                                                <Th key={colDate} className="bg-gray-100 dark:bg-dark-800 font-semibold whitespace-nowrap text-center">
                                                    {`${d}/${m}/${y}`}
                                                </Th>
                                            );
                                        })}
                                    </Tr>
                                </THead>
                                <TBody>
                                    {attendanceData.length > 0 ? (
                                        attendanceData.map((row, index) => (
                                            <Tr key={row.userid || index}>
                                                <Td className="whitespace-nowrap">{index + 1}</Td>
                                                <Td className="whitespace-nowrap">{row.name || `${row.firstname || ''} ${row.middlename || ''} ${row.lastname || ''}`.trim()}</Td>
                                                <Td className="whitespace-nowrap">{row.empid}</Td>
                                                {dateColumns.map(colDate => {
                                                    // Map the correct attendance character status per date
                                                    let status = row.attendance?.[colDate] || '';
                                                    
                                                    // Match PHP substitutions
                                                    if (status === 'H') status = 'S';
                                                    if (status === 'PL') status = 'PH/ Comp Off';
                                                    
                                                    // Add some color coding depending on presence
                                                    let statusColor = "text-gray-800 dark:text-gray-200";
                                                    if (status === 'P') statusColor = "text-green-600 font-medium";
                                                    if (status === 'A') statusColor = "text-red-600 font-medium";

                                                    return (
                                                        <Td key={colDate} className={`text-center whitespace-nowrap ${statusColor}`}>
                                                            {status}
                                                        </Td>
                                                    );
                                                })}
                                            </Tr>
                                        ))
                                    ) : (
                                        <Tr>
                                            <Td colSpan={3 + dateColumns.length} className="text-center py-6 text-gray-500">
                                                No attendance records found.
                                            </Td>
                                        </Tr>
                                    )}
                                </TBody>
                            </Table>
                        </div>
                    )}
                </Card>
            </div>
        </Page>
    );
}
