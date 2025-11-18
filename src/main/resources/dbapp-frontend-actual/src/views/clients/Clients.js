    import React, { useEffect, useState } from "react";
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
    CModalTitle, CBadge    
    } from "@coreui/react";

    import CIcon from "@coreui/icons-react";
    import { cilPlus, cilPencil, cilTrash, } from "@coreui/icons";

    import axios from "axios";

const PhoneInput = IMaskMixin(({ inputRef, ...props }) => (
  <CFormInput {...props} ref={inputRef} />
));

    /* ===========================
    ADD CLIENT FORM 
    =========================== */
    function AddClientModal({ newClient, setNewClient }) {
    return (
    <>
        {/* CLIENT TYPE */}
        <CFormLabel>Client Type</CFormLabel>
        <CFormSelect
        className="mb-3"
        onChange={(e) =>
            setNewClient({ ...newClient, client_type: e.target.value })
        }
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
            placeholder="Client Name"
            onChange={(e) =>
            setNewClient({ ...newClient, name: e.target.value })
            }
        />
        </CInputGroup>

        {/* CONTACT PERSON */}
        <CFormLabel>Contact Person</CFormLabel>
        <CInputGroup className="mb-3">
        <CInputGroupText>👤</CInputGroupText>
        <CFormInput
            placeholder="Contact Person"
            onChange={(e) =>
            setNewClient({ ...newClient, contact_person: e.target.value })
            }
        />
        </CInputGroup>

        {/* PHONE */}
        <CFormLabel>Phone</CFormLabel>
        <CInputGroup className="mb-3">
        <CInputGroupText>📞</CInputGroupText>
        <PhoneInput
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
            placeholder="Email"
            onChange={(e) =>
            setNewClient({ ...newClient, email: e.target.value })
            }
        />
        </CInputGroup>

        {/* ADDRESS */}
        <CFormLabel>Address</CFormLabel>
        <CInputGroup className="mb-3">
        <CInputGroupText>🏠</CInputGroupText>
        <CFormInput
            placeholder="Address"
            onChange={(e) =>
            setNewClient({ ...newClient, address: e.target.value })
            }
        />
        </CInputGroup>

        {/* CLIENT STATUS */}
        <CFormLabel>Status</CFormLabel>
        <CFormSelect
        className="mb-3"
        onChange={(e) =>
            setNewClient({ ...newClient, status: e.target.value })
        }
        >
        <option value="">Select status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="Blacklisted">Blacklisted</option>
        </CFormSelect>
    </>
    );
    }

    /* ===========================
            MAIN PAGE
    =========================== */
    const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);

    /* Form State */
    const [newClient, setNewClient] = useState({
    client_id: "",    
    name: "",
    client_type: "",
    contact_person: "",
    email: "",
    phone: "",
    status: "",
    priority_flag: "0",
    });

    const getStatusColor = (status) => {
        switch (status) {
            case "active":
            return "success";   // green
            case "inactive":
            return "secondary"; // gray
            case "blacklisted":
            return "danger";    // red
            default:
            return "dark";
        }
    };

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

    /* SAVE CLIENT */
    const handleSave = async () => {
    try {
        await axios.post("http://localhost:8080/api/clients/add", newClient);
        loadClients();
        setVisible(false);
    } catch (err) {
        console.error("Error creating client:", err);
    }
    };

    const handleEdit = async () => {
    try {
        // Make sure newClient.clientId exists
        if (!newClient.client_id) {
            console.error("Client ID missing!");
            return;
        }

        await axios.put("http://localhost:8080/api/clients/update", newClient);
        loadClients();        // Refresh the table
        setVisible(false);    // Close modal
    } catch (err) {
        console.error("Error updating client:", err);
    }
    };


    const handleEditClick = (client) => {
        setNewClient(client); // populate modal form with current client data
        setVisible(true);     // open modal
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

    return (
    <CCard className="mb-4">
        <CCardHeader>
        <strong>Client List</strong>
        <CButton color="primary" className="float-end" size="sm"  onClick={() => setVisible(true)}>
              <CIcon icon={cilPlus} className="me-2" />
              Add Client
            </CButton>
        </CCardHeader>

        <CCardBody>
        {loading ? (
            <div className="text-center">
            <CSpinner />
            <p>Loading clients...</p>
            </div>
        ) : (
            <CTable striped hover responsive style={{ textAlign: 'center' }}>
            <CTableHead>
                <CTableRow>
                <CTableHeaderCell>Client ID</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Type</CTableHeaderCell>
                <CTableHeaderCell>Contact Person</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Phone</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Completed Orders</CTableHeaderCell>
                <CTableHeaderCell>Priority</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
            </CTableHead>

            <CTableBody>
                {clients.map((c) => (
                <CTableRow key={c.client_id}>
                    <CTableDataCell>{c.client_id}</CTableDataCell>
                    <CTableDataCell>{c.name}</CTableDataCell>
                    <CTableDataCell>{c.client_type}</CTableDataCell>
                    <CTableDataCell>{c.contact_person}</CTableDataCell>
                    <CTableDataCell>{c.email}</CTableDataCell>
                    <CTableDataCell>{c.phone}</CTableDataCell>
                    <CTableDataCell>
                        <CBadge color={getStatusColor(c.status)}>
                            {c.status}
                        </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{c.completed_orders}</CTableDataCell>
                    <CTableDataCell>{c.priority_flag}</CTableDataCell>
                    <CTableDataCell>
                        <CButton
                        size="sm"
                        onClick={() => handleEditClick(c)}
                        >
                        <CIcon icon={cilPencil} style={{ color: "green" }} />
                        </CButton>
                        <CButton
                        size="sm"
                        onClick={() => handleDelete(c.client_id)}
                        >
                        <CIcon icon={cilTrash} style={{ color: "red" }} />
                        </CButton>
                    </CTableDataCell>
                </CTableRow>
                ))}
            </CTableBody>
            </CTable>
        )}
        </CCardBody>
      

        {/* MODAL */}
        <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
            <CModalTitle>Add Client</CModalTitle>
        </CModalHeader>

        <CModalBody>
            <AddClientModal newClient={newClient} setNewClient={setNewClient} />
        </CModalBody>

        <CModalFooter>
            <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
            </CButton>
            <CButton
                color="primary"
                onClick={newClient.client_id ? handleEdit : handleSave}
                >
                Save changes
            </CButton>
        </CModalFooter>
        </CModal>
    </CCard>
    
    );
    };

    export default Clients;
