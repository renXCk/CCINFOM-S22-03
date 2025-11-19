import React, { useEffect, useState, useMemo } from "react";
import { IMaskMixin } from "react-imask";
import {
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CCard,
    CCardBody,
    CCardHeader,
    CSpinner,
    CInputGroup,
    CInputGroupText,
    CFormInput,
    CFormLabel,
    CFormSelect,
    CButton,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
    CBadge,
    CRow,
    CCol
} from "@coreui/react";

import CIcon from "@coreui/icons-react";
import { cilPlus, cilPencil, cilTrash, cilSortAlphaDown, cilListRich } from "@coreui/icons";

import axios from "axios";

const PhoneInput = IMaskMixin(({ inputRef, ...props }) => (
    <CFormInput {...props} ref={inputRef} />
));

// --- Helper Functions ---
    const getTripStatusBadge = (status) => {
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

const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
};

/* =======================================================
   VIEW WITH OTHER RECORDS MODAL 
========================================================== */
function ViewWithOtherRecordsModal({ visible, onClose }) {

    const [relatedRecords, setRelatedRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setLoading(true);

            // Fetch all client view records (which includes trip data)
            axios.get("http://localhost:8080/api/clients/view")
                .then(res => {
                   
                    setRelatedRecords(res.data);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [visible]);

    const columns = [
        { key: 'clientName', label: 'Client Name', cell: (r) => <div className="fw-semibold">{r.clientName}</div> },
        { 
            key: 'clientType', 
            label: 'Client Type', 
            cell: (r) => r.clientType 
        },
        { 
            key: 'tripStatus', 
            label: 'Trip Status', 
            cell: (r) => <CBadge color={getTripStatusBadge(r.tripStatus)}>{r.tripStatus}</CBadge> 
        },
        { 
            key: 'dateTimeStart', 
            label: 'Start Time', 
            cell: (r) => formatDate(r.dateTimeStart) 
        },
        { 
            key: 'dateTimeCompleted', 
            label: 'Completed Time', 
            cell: (r) => formatDate(r.dateTimeCompleted) || "-" 
        },
        { 
            key: 'vehicle', 
            label: 'Vehicle', 
            // This structure correctly renders two lines of text within one cell
            cell: (r) => (
                <>
                    <div className="fw-semibold small">{r.plateNumber}</div>
                    <div className="text-muted small">{r.vehicleModel}</div>
                </>
            ) 
        },
        
        { 
            key: 'driver', 
            label: 'Driver', 
            // Rendering Driver Name on top, License ID on bottom
            cell: (r) => (
                <>
                    <div className="fw-semibold small">{r.driverName}</div>
                    <div className="text-muted small">Lic: {r.driverLicense}</div>
                </>
            ) 
        },
    ];

    

    return (
        <CModal visible={visible} onClose={onClose} size="xl">
            <CModalHeader>
                <CModalTitle>Clients View with Other Related Records</CModalTitle>
            </CModalHeader>
            <CModalBody>
                {loading ? (
                    <div className="text-center p-5">
                        <CSpinner />
                        <p>Loading records...</p>
                    </div>
                ) : relatedRecords.length === 0 ? (
                    <div className="text-center p-4">No records found.</div>
                ) : (
                    <CTable striped hover responsive bordered className="align-middle small">
                        <CTableHead color="dark">
                            <CTableRow>
                                {/* Use the ordered columns for headers */}
                                {columns.map(col => (
                                    <CTableHeaderCell key={col.key}>{col.label}</CTableHeaderCell>
                                ))}
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {relatedRecords.map((r) => (
                                <CTableRow key={r.tripId}>
                                    {/* Use the ordered columns for cells */}
                                    {columns.map(col => (
                                        <CTableDataCell key={`${r.tripId}-${col.key}`}>
                                            {col.cell(r)}
                                        </CTableDataCell>
                                    ))}
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>
                )}
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={onClose}>Close</CButton>
            </CModalFooter>
        </CModal>
    );
}

/* ===========================
ADD CLIENT FORM MODAL 
=========================== */
function AddClientModal({ newClient, setNewClient }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewClient({ ...newClient, [name]: value });
    };

    return (
        <>
            {/* CLIENT TYPE */}
            <CFormLabel>Client Type</CFormLabel>
            <CFormSelect
                className="mb-3"
                name="client_type"
                value={newClient.client_type}
                onChange={handleChange}
            >
                <option value="">Select type</option>
                <option value="Individual">Individual</option>
                <option value="Company">Company</option>
                <option value="Government">Government</option>
            </CFormSelect>

            {/* CLIENT NAME */}
            <CFormLabel>Client Name</CFormLabel>
            <CInputGroup className="mb-3">
                <CInputGroupText>🏷️</CInputGroupText>
                <CFormInput
                    name="name"
                    placeholder="Client Name"
                    value={newClient.name}
                    onChange={handleChange}
                />
            </CInputGroup>

            {/* CONTACT PERSON */}
            <CFormLabel>Contact Person</CFormLabel>
            <CInputGroup className="mb-3">
                <CInputGroupText>👤</CInputGroupText>
                <CFormInput
                    name="contact_person"
                    placeholder="Contact Person"
                    value={newClient.contact_person}
                    onChange={handleChange}
                />
            </CInputGroup>

            {/* PHONE */}
            <CFormLabel>Phone</CFormLabel>
            <CInputGroup className="mb-3">
                <CInputGroupText>📞</CInputGroupText>
                <PhoneInput
                    name="phone"
                    value={newClient.phone}
                    placeholder="09XX-XXX-XXXX"
                    mask="0000-000-0000"
                    overwrite={true}
                    unmask={false}
                    onAccept={(value) =>
                        setNewClient({ ...newClient, phone: value })
                    }
                />
            </CInputGroup>

            {/* EMAIL*/}
            <CFormLabel>Email</CFormLabel>
            <CInputGroup className="mb-3">
                <CInputGroupText>📧</CInputGroupText>
                <CFormInput
                    name="email"
                    value={newClient.email}
                    placeholder="Email"
                    onChange={handleChange}
                />
            </CInputGroup>

            {/* ADDRESS */}
            <CFormLabel>Address</CFormLabel>
            <CInputGroup className="mb-3">
                <CInputGroupText>🏠</CInputGroupText>
                <CFormInput
                    name="address"
                    value={newClient.address}
                    placeholder="Address"
                    onChange={handleChange}
                />
            </CInputGroup>

            {/* CLIENT STATUS */}
            <CFormLabel>Status</CFormLabel>
            <CFormSelect
                className="mb-3"
                name="status"
                value={newClient.status}
                onChange={handleChange}
            >
                <option value="">Select status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
            </CFormSelect>
        </>
    );
}

/* ===========================
          MAIN PAGE!!
=========================== */
const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [viewRecordsModalVisible, setViewRecordsModalVisible] = useState(false);
    // focusedClient is kept for the Add/Edit form, but not used by the general View modal
    const [focusedClient, setFocusedClient] = useState(null); 

    /* ===========================
    STATES 
    =========================== */

    // --- FILTER & SORT STATE ---
    const [filters, setFilters] = useState({
        status: "",
        type: "",
    });

    const [sortConfig, setSortConfig] = useState({
        key: "client_id",
        direction: "asc",
    });

    const initialClientState = {
        client_id: null,
        name: "",
        client_type: "",
        contact_person: "",
        email: "",
        phone: "",
        status: "",
        priority_flag: "0",
        completed_orders: 0,
        address: "",
    };

    /* Form State */
    const [newClient, setNewClient] = useState(initialClientState);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "success";
            case "inactive":
                return "secondary";
            case "suspended":
                return "danger";
            default:
                return "dark";
        }
    };

    // Updated to only toggle visibility, as the modal will fetch all data itself.
    const openViewRecordsModal = () => {
        setViewRecordsModalVisible(true);
    };

    /* ===========================
    FETCHES
    =========================== */

    /* Load Clients */
    const loadClients = async () => {
        try {
            const result = await axios.get("http://localhost:8080/api/clients/all");
            setClients(result.data);
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

    // FILTERING & SORTING 
    const processedClients = useMemo(() => {
        let result = [...clients];

        // 1. Apply Filtering
        if (filters.status) {
            result = result.filter(
                (c) => c.status && c.status.toLowerCase() === filters.status.toLowerCase()
            );
        }
        if (filters.type) {
            result = result.filter(
                (c) => c.client_type && c.client_type.toLowerCase() === filters.type.toLowerCase()
            );
        }

        // 2. Apply Sorting
        result.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            // Handle Numbers (ID, Completed Orders)
            if (
                sortConfig.key === "client_id" ||
                sortConfig.key === "completed_orders"
            ) {
                const numA = Number(aVal) || 0;
                const numB = Number(bVal) || 0;
                return sortConfig.direction === "asc" ? numA - numB : numB - numA;
            }

            // Handle Strings (Name, Type, Status)
            aVal = aVal ? aVal.toString().toLowerCase() : "";
            bVal = bVal ? bVal.toString().toLowerCase() : "";

            return sortConfig.direction === "asc"
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        });

        return result;
    }, [clients, filters, sortConfig]);

    /* ===========================
    HANDLE CRUD BUTTONS
    =========================== */

    /* Handle Edit API call */
    const handleEdit = async () => {
        try {
            if (!newClient.client_id) {
                console.error("Client ID missing for edit!");
                return;
            }

            await axios.put("http://localhost:8080/api/clients/update", newClient);
            loadClients();
            setVisible(false);
            setNewClient(initialClientState); // Reset form state
        } catch (err) {
            console.error("Error updating client:", err);
        }
    };

    /* SAVE CLIENT (Handles both Add and Edit) */
    const handleSave = async () => {
        try {
            if (newClient.client_id) {
                // If client_id exists, it's an edit operation
                await handleEdit();
                return;
            }

            // Otherwise, it's an add operation
            await axios.post("http://localhost:8080/api/clients/add", newClient);
            loadClients();
            setVisible(false);
            setNewClient(initialClientState); // Reset form state
        } catch (err) {
            console.error("Error creating client:", err);
        }
    };

    const handleEditClick = (client) => {
        setNewClient(client); // populate modal form with current client data
        setVisible(true); // open modal
    }

    const handleDelete = async (clientId) => {
        if (window.confirm("Are you sure you want to delete this client?")) {
            try {
                await axios.delete(`http://localhost:8080/api/clients/delete/${clientId}`);
                loadClients(); // refresh table
            } catch (err) {
                console.error("Error deleting client:", err);
            }
        }
    };

    // Helper for filter inputs
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Helper for sort direction toggle
    const toggleSortDirection = () => {
        setSortConfig(prev => ({
            ...prev,
            direction: prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Function to handle opening the modal for *adding* a new client
    const openAddModal = () => {
        setNewClient(initialClientState);
        setVisible(true);
    };

    /* ===========================
    PAGE DESIGN
    =========================== */

    return (
        <CCard className="mb-4">
            <CCardHeader>
                {/* HEADER & ACTION BUTTONS */}
                <strong>Client List</strong>
                {/* Add Client*/}
                <CButton color="primary" className="float-end" size="sm" onClick={openAddModal}>
                    <CIcon icon={cilPlus} className="me-2" />
                    Add Client
                </CButton>

                {/* View with other records - **NOW CORRECTLY OPENS MODAL***/}
                <CButton
                    color="secondary"
                    variant="outline"
                    className="float-end btn-sm me-2"
                    onClick={openViewRecordsModal} 
                >
                    <CIcon icon={cilListRich} className="me-2" />
                    View With Other Records
                </CButton>


            </CCardHeader>
            <CCardBody>


                {/* ===========================
                FILTER & SORT TOOLBAR
                =========================== */}
                <CRow className="mb-4">
                    {/* Sort Controls */}
                    <CCol md={3}>
                        <CFormLabel className="small text-muted">Sort By</CFormLabel>
                        <CInputGroup>
                            <CInputGroupText>
                                <CIcon icon={cilSortAlphaDown} />
                            </CInputGroupText>
                            <CFormSelect
                                value={sortConfig.key}
                                onChange={(e) =>
                                    setSortConfig({ ...sortConfig, key: e.target.value })
                                }
                            >
                                <option value="client_id">ID</option>
                                <option value="name">Name</option>
                                <option value="client_type">Type</option>
                                <option value="status">Status</option>
                                <option value="completed_orders">Completed Orders</option>
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

                    {/* Filter by Status */}
                    <CCol md={3}>
                        <CFormLabel className="small text-muted">Filter by Status</CFormLabel>
                        <CFormSelect
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                        </CFormSelect>
                    </CCol>

                    {/* Filter by Type */}
                    <CCol md={3}>
                        <CFormLabel className="small text-muted">Filter by Type</CFormLabel>
                        <CFormSelect
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Types</option>
                            <option value="Individual">Individual</option>
                            <option value="Company">Company</option>
                            <option value="Government">Government</option>
                        </CFormSelect>
                    </CCol>
                </CRow>

                {/* ===========================
                    DATA TABLE
                =========================== */}
                {loading ? (
                    <div className="text-center">
                        <CSpinner />
                        <p>Loading clients...</p>
                    </div>
                ) : (
                    <CTable striped hover responsive bordered style={{ textAlign: 'left' }}>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>ID</CTableHeaderCell>
                                <CTableHeaderCell>Name</CTableHeaderCell>
                                <CTableHeaderCell>Type</CTableHeaderCell>
                                <CTableHeaderCell>Contact Person</CTableHeaderCell>
                                <CTableHeaderCell>Contact Info</CTableHeaderCell>
                                <CTableHeaderCell>Status</CTableHeaderCell>
                                <CTableHeaderCell>Completed Orders</CTableHeaderCell>
                                <CTableHeaderCell>Priority</CTableHeaderCell>
                                <CTableHeaderCell>Actions</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>

                        <CTableBody>
                            {processedClients.length === 0 ? (
                                <CTableRow>
                                    <CTableDataCell colSpan="10" className="text-center">No clients match your current filters or sorting.</CTableDataCell>
                                </CTableRow>
                            ) : (
                                processedClients.map((c) => (
                                    <CTableRow key={c.client_id}>
                                        <CTableDataCell>{c.client_id}</CTableDataCell>
                                        <CTableDataCell>{c.name}</CTableDataCell>
                                        <CTableDataCell>{c.client_type}</CTableDataCell>
                                        <CTableDataCell>{c.contact_person}</CTableDataCell>
                                        <CTableDataCell>
                                            <div><small>{c.phone}</small></div>
                                            <div className="text-muted"><small>{c.email}</small></div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <CBadge color={getStatusColor(c.status)}>
                                                {c.status}
                                            </CBadge>
                                        </CTableDataCell>
                                        <CTableDataCell>{c.completed_orders}</CTableDataCell>
                                        <CTableDataCell>{c.priority_flag}</CTableDataCell>
                                        <CTableDataCell>
                                            <CButton
                                                color="info"
                                                variant="ghost"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEditClick(c)}
                                            >
                                                <CIcon icon={cilPencil} />
                                            </CButton>
                                            <CButton
                                                color="danger"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(c.client_id)}
                                            >
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


            {/* ===========================
                MODALS: ADD/EDIT CLIENT
                =========================== */}
            <CModal
                visible={visible}
                onClose={() => setVisible(false)}
                onHide={() => setNewClient(initialClientState)}
            >
                <CModalHeader>
                    <CModalTitle>{newClient.client_id ? "Edit Client" : "Add New Client"}</CModalTitle>
                </CModalHeader>

                <CModalBody>
                    <AddClientModal newClient={newClient} setNewClient={setNewClient} />
                </CModalBody>

                <CModalFooter>
                    <CButton
                        color="secondary"
                        onClick={() => { setVisible(false); setNewClient(initialClientState); }}
                    >
                        Close
                    </CButton>
                    <CButton
                        color="primary"
                        onClick={handleSave}
                    >
                        Save changes
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* ===================================================
                MODAL: VIEW WITH OTHER RECORDS (NOW RENDERED)
                =================================================== */}
            <ViewWithOtherRecordsModal
                // We pass focus/focusedClient but it is currently ignored inside the modal
                // as requested to show all records instead of one client's records.
                focus={focusedClient} 
                visible={viewRecordsModalVisible}
                onClose={() => setViewRecordsModalVisible(false)}
            />


        </CCard>

    );
};

export default Clients;