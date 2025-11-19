import React, { useEffect, useState, useMemo } from "react";
import {
    CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
    CCard, CCardBody, CCardHeader, CSpinner, CInputGroup, CInputGroupText,
    CFormInput, CFormLabel, CFormSelect, CButton, CModal, CModalBody,
    CModalFooter, CModalHeader, CModalTitle, CBadge, CRow, CCol
} from "@coreui/react";

import CIcon from "@coreui/icons-react";
import { cilPlus, cilPencil, cilTrash, cilSortAlphaDown } from "@coreui/icons";

import axios from "axios";

/* ===========================
  ADD/EDIT TRIP LOG FORM (MODAL CONTENT)
  =========================== */
function AddEditTripLogModal({ newTripLog, setNewTripLog, clients, drivers, vehicles }) {

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTripLog(prev => ({ ...prev, [name]: value }));
    };

    const handleNumericChange = (e) => {
        const { name, value } = e.target;
        // Convert to Number, allowing empty string input
        const numericValue = value === "" ? "" : parseFloat(value);
        setNewTripLog(prev => ({ ...prev, [name]: numericValue }));
    };

    const StatusOptions = ["Pending", "Ongoing", "Completed", "Cancelled", "Archive"];

    return (
        <CRow>
            {/* Row 1: IDs */}
            <CCol md={4}>
                <CFormLabel>Client ID</CFormLabel>
                
                <CFormSelect name="clientId" value={newTripLog.clientId} onChange={handleChange} required>
                    <option value="">Select Client</option>
                    {clients.map((c, index) => (
                        <option 
                            key={c.client_id || c.clientId || index} 
                            value={c.client_id || c.clientId}
                        >
                            
                            {`${c.name}`}
                        </option>
                    ))}
                </CFormSelect>
            </CCol>
            <CCol md={4}>
                <CFormLabel>Driver ID</CFormLabel>
                
                <CFormSelect name="driverId" value={newTripLog.driverId} onChange={handleChange} required>
                    <option value="">Select Driver</option>
                    {drivers.map((d, index) => (
                        <option 
                            key={d.driver_id || d.driverId || index} 
                            value={d.driver_id || d.driverId}
                        >
                            {d.first_name || d.firstName} {d.last_name || d.lastName} ({d.license_num || d.licenseNum})
                        </option>
                    ))}
                </CFormSelect>
            </CCol>
            <CCol md={4}>
                <CFormLabel>Vehicle ID</CFormLabel>
                
                <CFormSelect name="vehicleId" value={newTripLog.vehicleId} onChange={handleChange} required>
                    <option value="">Select Vehicle</option>
                    {vehicles.map((v, index) => (
                        <option 
                            key={v.vehicle_id || v.vehicleId || index} 
                            value={v.vehicle_id || v.vehicleId}
                        >
                            {v.plate_number || v.plateNumber} - {v.model}
                        </option>
                    ))}
                </CFormSelect>
            </CCol>

            {/* Row 2: Locations */}
            <CCol md={6} className="mt-3">
                <CFormLabel>Pick-up Location</CFormLabel>
                <CInputGroup>
                    <CInputGroupText>📍</CInputGroupText>
                    <CFormInput
                        name="pickUpLocation"
                        value={newTripLog.pickUpLocation}
                        onChange={handleChange}
                        placeholder="Pick-up Location"
                    />
                </CInputGroup>
            </CCol>
            <CCol md={6} className="mt-3">
                <CFormLabel>Drop-off Location</CFormLabel>
                <CInputGroup>
                    <CInputGroupText>🏁</CInputGroupText>
                    <CFormInput
                        name="dropOffLocation"
                        value={newTripLog.dropOffLocation}
                        onChange={handleChange}
                        placeholder="Drop-off Location"
                    />
                </CInputGroup>
            </CCol>

            {/* Row 3: Dates and Times */}
            <CCol md={6} className="mt-3">
                <CFormLabel>Start Time (YYYY-MM-DDTHH:MM:SS)</CFormLabel>
                <CInputGroup>
                    <CInputGroupText>⏱️</CInputGroupText>
                    <CFormInput
                        name="startTime"
                        value={newTripLog.startTime}
                        onChange={handleChange}
                        placeholder="e.g., 2024-01-15T10:00:00"
                    />
                </CInputGroup>
            </CCol>
            <CCol md={6} className="mt-3">
                <CFormLabel>Completion Time (YYYY-MM-DDTHH:MM:SS)</CFormLabel>
                <CInputGroup>
                    <CInputGroupText>✅</CInputGroupText>
                    <CFormInput
                        name="completeTime"
                        value={newTripLog.completeTime}
                        onChange={handleChange}
                        placeholder="Optional"
                    />
                </CInputGroup>
            </CCol>

            {/* Row 4: Cost and Status */}
            <CCol md={6} className="mt-3">
                <CFormLabel>Trip Cost</CFormLabel>
                <CInputGroup>
                    <CInputGroupText>₱</CInputGroupText>
                    <CFormInput
                        name="tripCost"
                        type="number"
                        step="0.01"
                        value={newTripLog.tripCost || ""}
                        onChange={handleNumericChange}
                        placeholder="0.00"
                    />
                </CInputGroup>
            </CCol>
            <CCol md={6} className="mt-3">
                <CFormLabel>Trip Distance (km)</CFormLabel>
                <CInputGroup>
                    <CInputGroupText>🛣️</CInputGroupText>
                    <CFormInput
                        name="tripDistance"
                        type="number"
                        step="1"
                        value={newTripLog.tripDistance || ""}
                        onChange={handleNumericChange}
                        placeholder="0"
                    />
                </CInputGroup>
            </CCol>
            <CCol md={6} className="mt-3">
                <CFormLabel>Status</CFormLabel>
                <CFormSelect
                    name="status"
                    value={newTripLog.status}
                    onChange={handleChange}
                >
                    <option value="">Select Status</option>
                    {StatusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </CFormSelect>
            </CCol>
        </CRow>
    );
}

// ---

/* ===========================
    MAIN PAGE
=========================== */
const TripLogs = () => {
    const [tripLogs, setTripLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [clients, setClients] = useState([]); // for dropdown
    const [drivers, setDrivers] = useState([]); // for dropdown
    const [vehicles, setVehicles] = useState([]); // for dropdown
    const [incidents, setIncidents] = useState([]); 
    const [search, setSearch] = useState("");

    // --- FILTER & SORT STATE ---
    const [filters, setFilters] = useState({
        status: "",
        clientId: "",
        driverId: "",
    });

    const [sortConfig, setSortConfig] = useState({
        key: "tripId",
        direction: "asc",
    });

    const initialTripLogState = {
        tripId: null,
        clientId: "",
        driverId: "",
        vehicleId: "",
        pickUpLocation: "",
        dropOffLocation: "",
        startTime: "",
        completeTime: null,
        tripCost: 0,
        tripDistance: 0,
        status: "Pending",
    };

    const [newTripLog, setNewTripLog] = useState(initialTripLogState);

    // --- Utility Functions ---

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "completed":
                return "success";
            case "ongoing":
                return "primary";
            case "pending":
                return "warning";
            case "cancelled":
                return "danger";
            case "archive":
                return "secondary";
            default:
                return "dark";
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const toggleSortDirection = () => {
        setSortConfig(prev => ({
            ...prev,
            direction: prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const openAddModal = () => {
        setNewTripLog(initialTripLogState);
        setVisible(true);
    }

    // --- CRUD Operations ---

    const fetchAllData = async () => {
        try {
            const result = await axios.get("http://localhost:8080/api/triplogs/all");
            setTripLogs(result.data);

            // Fetch incidents 
            const tripRes = await fetch('http://localhost:8080/api/incidentlogs/all')
            if (tripRes.ok) setIncidents(await tripRes.json())

            // fetch clients for dropdown
            const clientRes = await fetch('http://localhost:8080/api/clients/all')
            if (clientRes.ok) setClients(await clientRes.json())

            // fetch drivers for dropdown
            const driverRes = await fetch('http://localhost:8080/api/drivers/all')
            if (driverRes.ok) setDrivers(await driverRes.json())

            // fetch vehicles for dropdown
            const vehicleRes = await fetch('http://localhost:8080/api/vehicles/all')
            if (vehicleRes.ok) setVehicles(await vehicleRes.json())

        } catch (error) {
            console.error("Error fetching trip logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleEditClick = (tripLog) => {
        // Ensure null fields are converted to empty strings for form inputs
        const editableLog = {
            ...tripLog,
            completeTime: tripLog.completeTime || "",
            tripCost: tripLog.tripCost || 0,
            clientId: tripLog.clientId || "",
            driverId: tripLog.driverId || "",
            vehicleId: tripLog.vehicleId || "",
        };
        setNewTripLog(editableLog);
        setVisible(true);
    }

    const handleSave = async () => {
        try {
            const dataToSend = {
                ...newTripLog,
                
                clientId: parseInt(newTripLog.clientId) || null,
                driverId: parseInt(newTripLog.driverId) || null,
                vehicleId: parseInt(newTripLog.vehicleId) || null,
                tripCost: parseFloat(newTripLog.tripCost) || 0,
                tripDistance: parseFloat(newTripLog.tripDistance) || 0,
            };
            
            if (newTripLog.tripId) {
                // UPDATE
                await axios.put("http://localhost:8080/api/triplogs/update", dataToSend);
            } else {
                // ADD
                await axios.post("http://localhost:8080/api/triplogs/add", dataToSend);
            }
            
            fetchAllData();
            setVisible(false);
            setNewTripLog(initialTripLogState);
        } catch (err) {
            console.error("Error saving trip log:", err);
            
        }
    };

    const handleArchive = async (tripId) => {
        if (window.confirm("Are you sure you want to Archive (Soft Delete) this trip log?")) {
            try {
                
                await axios.delete(`http://localhost:8080/api/triplogs/delete/${tripId}`);                
                fetchAllData(); // refresh table
            } catch (err) {
                console.error("Error archiving trip log:", err);
            }
        }
    };

      // --- HELPER: Get Driver Name by ID ---
    const getDriverName = (id) => {
        const drv = drivers.find(d => d.driver_id === id || d.driverId === id)
        return drv ? `${drv.first_name || drv.firstName} ${drv.last_name || drv.lastName}` : `ID: ${id}`
    }

    // --- HELPER: Get Vehicle Plate by ID ---
    const getVehiclePlate = (id) => {
        const veh = vehicles.find(v => v.vehicle_id === id || v.vehicleId === id)
        return veh ? veh.plate_number || veh.plateNumber : `ID: ${id}`
    }

    // --- HELPER: Get Client Name by ID ---
    const getClientName = (id) => {
        
        const cli = clients.find(c => c.client_id === id || c.clientId === id)
        
        
        return cli ? cli.name : `ID: ${id}`
    }

    // --- Filtering and Sorting Logic ---

    const processedTripLogs = useMemo(() => {
        let result = [...tripLogs];

        // 0. Apply Search (on Pick-up/Drop-off locations)
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(t =>
                t.pickUpLocation.toLowerCase().includes(lowerSearch) ||
                t.dropOffLocation.toLowerCase().includes(lowerSearch)
            );
        }

        // 1. Apply Filtering
        if (filters.status) {
            result = result.filter(t => t.status?.toLowerCase() === filters.status.toLowerCase());
        }
        if (filters.clientId) {
            // Filter by ID (check if the ID matches the string entered in the filter)
            result = result.filter(t => String(t.clientId) === filters.clientId);
        }
        if (filters.driverId) {
            result = result.filter(t => String(t.driverId) === filters.driverId);
        }

        // 2. Apply Sorting
        result.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            const direction = sortConfig.direction === "asc" ? 1 : -1;

            if (["tripId", "clientId", "driverId", "vehicleId", "tripCost", "tripDistance"].includes(sortConfig.key)) {
                // Numeric comparison
                const numA = Number(aVal) || 0;
                const numB = Number(bVal) || 0;
                return (numA - numB) * direction;
            } else {
                // String/Date comparison
                aVal = aVal ? aVal.toString().toLowerCase() : "";
                bVal = bVal ? bVal.toString().toLowerCase() : "";
                return aVal.localeCompare(bVal) * direction;
            }
        });

        return result;
    }, [tripLogs, filters, sortConfig, search]);


    // --- Render Component ---

    return (
        <CCard className="mb-4">
            <CCardHeader>
                <strong>Trip Log Management</strong>
                <CButton color="primary" className="float-end" size="sm" onClick={openAddModal}>
                    <CIcon icon={cilPlus} className="me-2" />
                    Add Trip
                </CButton>
            </CCardHeader>
            <CCardBody>
                
                {/* ===========================
                    FILTER & SORT TOOLBAR
                    =========================== */}
                <CRow className="mb-4 g-3">
                    {/* Search */}
                    <CCol md={3}>
                        <CFormLabel className="small text-muted">Search Location</CFormLabel>
                        <CFormInput
                            placeholder="Pick-up or Drop-off"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </CCol>
                    
                    {/* Filter by Status */}
                    <CCol md={3}>
                        <CFormLabel className="small text-muted">Filter by Status</CFormLabel>
                        <CFormSelect
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Archive">Archived</option>
                        </CFormSelect>
                    </CCol>

                    {/* Filter by Client ID */}
                    <CCol md={2}>
                        <CFormLabel className="small text-muted">Filter by Client ID</CFormLabel>
                        <CFormInput
                            name="clientId"
                            type="number"
                            value={filters.clientId}
                            onChange={handleFilterChange}
                            placeholder="Client ID"
                        />
                    </CCol>

                    {/* Sort Controls */}
                    <CCol md={3}>
                        <CFormLabel className="small text-muted">Sort By</CFormLabel>
                        <CInputGroup>
                            <CInputGroupText><CIcon icon={cilSortAlphaDown} /></CInputGroupText>
                            <CFormSelect
                                value={sortConfig.key}
                                onChange={(e) => setSortConfig({ ...sortConfig, key: e.target.value })}
                            >
                                <option value="tripId">ID</option>
                                <option value="startTime">Start Time</option>
                                <option value="tripCost">Cost</option>
                                <option value="tripDistance">Distance</option>
                                <option value="status">Status</option>
                            </CFormSelect>
                            <CButton
                                color="secondary"
                                variant="outline"
                                onClick={toggleSortDirection}
                            >
                                {sortConfig.direction === "asc" ? "⬆" : "⬇"}
                            </CButton>
                        </CInputGroup>
                    </CCol>
                </CRow>

                {/* ===========================
                    DATA TABLE
                    =========================== */}
                {loading ? (
                    <div className="text-center"><CSpinner /><p>Loading trip logs...</p></div>
                ) : (
                    <CTable striped hover responsive bordered style={{ textAlign: 'left' }}>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>ID</CTableHeaderCell>
                                <CTableHeaderCell>Client/Driver/Vehicle</CTableHeaderCell>
                                <CTableHeaderCell>Pick-up</CTableHeaderCell>
                                <CTableHeaderCell>Drop-off</CTableHeaderCell>
                                <CTableHeaderCell>Start Time</CTableHeaderCell>
                                <CTableHeaderCell>End Time</CTableHeaderCell>
                                <CTableHeaderCell>Cost</CTableHeaderCell>
                                <CTableHeaderCell>Trip Distance</CTableHeaderCell>
                                <CTableHeaderCell>Status</CTableHeaderCell>
                                <CTableHeaderCell>Actions</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>

                        <CTableBody>
                            {processedTripLogs.length === 0 ? (
                                <CTableRow><CTableDataCell colSpan="9" className="text-center">No trip logs found matching your criteria.</CTableDataCell></CTableRow>
                            ) : (
                                processedTripLogs.map((t) => (
                                    <CTableRow key={t.tripId}>
                                        <CTableDataCell>{t.tripId}</CTableDataCell>
                                        <CTableDataCell>
                                            <small className="d-block">Client: {getClientName(t.clientId)}</small>
                                            <small className="d-block">Driver: {getDriverName(t.driverId)}</small>
                                            <small className="d-block">Vehicle: {getVehiclePlate(t.vehicleId)}</small>
                                        </CTableDataCell>
                                        <CTableDataCell>{t.pickUpLocation}</CTableDataCell>
                                        <CTableDataCell>{t.dropOffLocation}</CTableDataCell>
                                        <CTableDataCell>{t.startTime}</CTableDataCell>
                                        <CTableDataCell>{t.completeTime || 'N/A'}</CTableDataCell>
                                        <CTableDataCell>₱{t.tripCost?.toFixed(2) || '0.00'}</CTableDataCell>
                                        <CTableDataCell>{t.tripDistance?.toFixed(2) || '0'} km</CTableDataCell>
                                        <CTableDataCell>
                                            <CBadge color={getStatusColor(t.status)}>
                                                {t.status}
                                            </CBadge>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <CButton color="info" variant="ghost" size="sm" className="me-2" onClick={() => handleEditClick(t)}>
                                                <CIcon icon={cilPencil} />
                                            </CButton>
                                            <CButton color="danger" variant="ghost" size="sm" onClick={() => handleArchive(t.tripId)}>
                                                <CIcon icon={cilTrash} />
                                            </CButton>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))
                            )}
                        </CTableBody>
                    </CTable>
                )}
            </CCardBody>

            {/* MODAL */}
            <CModal visible={visible} onClose={() => setVisible(false)} onHide={() => setNewTripLog(initialTripLogState)} size="lg">
                <CModalHeader>
                    <CModalTitle>{newTripLog.tripId ? `Edit Trip Log #${newTripLog.tripId}` : "Add New Trip Log"}</CModalTitle>
                </CModalHeader>

                <CModalBody>
                    
                    <AddEditTripLogModal 
                        newTripLog={newTripLog} 
                        setNewTripLog={setNewTripLog} 
                        clients={clients} 
                        drivers={drivers} 
                        vehicles={vehicles}
                    />
                </CModalBody>

                <CModalFooter>
                    <CButton color="secondary" onClick={() => { setVisible(false); setNewTripLog(initialTripLogState); }}>
                        Cancel
                    </CButton>
                    <CButton color="primary" onClick={handleSave}>
                        {newTripLog.tripId ? "Update Trip" : "Add Trip"}
                    </CButton>
                </CModalFooter>
            </CModal>
        </CCard>
    );
};

export default TripLogs;