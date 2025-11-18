import React, { useEffect, useState } from "react";
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
    CFormTextarea,
    CFormLabel,
    CForm,
    CFormSelect, 
} from "@coreui/react";


import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import axios from "axios";


function AddClientModal({ visible, setVisible, onClientAdded }) {
    const [newClient, setNewClient] = useState({
    name: "",
    client_type: "",
    contact_person: "",
    email: "",
    phone: "",
    status: "",
    priority_flag: "",
  });

  return(
    <>
        {/* CLIENT TYPE */}
        <CFormLabel>Client Type</CFormLabel>
        <CFormSelect className="mb-3" aria-label="Small select example">
            <option>Open this select menu</option>
            <option value="1">Individual</option>
            <option value="2">Company</option>
            <option value="3">Government</option>
        </CFormSelect>

        {/* CONTACT PERSON */}
        <CFormLabel>Contact Person</CFormLabel>
        <CInputGroup className="flex-nowrap">
        <CInputGroupText id="addon-wrapping">👤</CInputGroupText>
        <CFormInput placeholder="Contact Person" aria-label="Username" aria-describedby="addon-wrapping" />
        </CInputGroup>

        {/* PHONE */}
        <CFormLabel>Phone</CFormLabel>
        <CInputGroup className="mb-3">
        <CInputGroupText id="basic-addon3">https://example.com/users/</CInputGroupText>
        <CFormInput id="basic-url" aria-describedby="basic-addon3" />
        </CInputGroup>

        {/* EMAIL */}
        <CFormLabel>Email</CFormLabel>
        <CInputGroup className="mb-3">
        <CInputGroupText id="basic-addon3">https://example.com/users/</CInputGroupText>
        <CFormInput id="basic-url" aria-describedby="basic-addon3" />
        </CInputGroup>

        <CInputGroup className="mb-3">
        <CInputGroupText>$</CInputGroupText>
        <CFormInput aria-label="Amount (to the nearest dollar)" />
        <CInputGroupText>.00</CInputGroupText>
        </CInputGroup>

        <CInputGroup className="mb-3">
        <CFormInput placeholder="Username" aria-label="Username" />
        <CInputGroupText>@</CInputGroupText>
        <CFormInput placeholder="Server" aria-label="Server" />
        </CInputGroup>

        <CInputGroup>
        <CInputGroupText>With textarea</CInputGroupText>
        <CFormTextarea aria-label="With textarea"></CFormTextarea>
        </CInputGroup>
    
    </>
  )

}

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

const loadClients = async () => {
    try {
      const result = await axios.get("http://localhost:8080/api/clients/all");
      console.log("Fetched clients:", result.data);
      setClients(result.data); // update state with fetched data
      setLoading(false);

    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false); // stop loading spinner
    }
  };

  return (
    // CLIENT TABLE
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Client List</strong>
      </CCardHeader>

      <CCardBody>
        {loading ? (
          <div className="text-center">
            <CSpinner color="primary" />
            <p>Loading clients...</p>
          </div>
        ) : (
          <CTable striped hover responsive>
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
                  <CTableDataCell>{c.status}</CTableDataCell>
                  <CTableDataCell>{c.completed_orders}</CTableDataCell>
                  <CTableDataCell>{c.priority_flag}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

        )}

      </CCardBody>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
        <CButton color="primary" style={{ width: '80px', margin: 10 }} onClick={() => setVisible(!visible)}>
            Add
        </CButton>

        <CButton color="primary" style={{ width: '80px', margin: 10, marginLeft: 0 }} onClick={() => setVisible(!visible)}>
            Delete
        </CButton>

        <CButton color="primary" style={{ width: '80px', margin: 10, marginLeft: 0 }} onClick={() => setVisible(!visible)}>
            Edit
        </CButton>
        </div>

      <CModal
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="AddClientModalTitle"
      >
        <CModalHeader>
            
          <CModalTitle id="AddClienModelTitle">Add Client</CModalTitle>
        </CModalHeader>


        <CModalBody>
            <AddClientModal visible={visible} setVisible={setVisible} onClientAdded={loadClients} />
        </CModalBody>
        

        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary">Save changes</CButton>
        </CModalFooter>
      </CModal>

    </CCard>
  );
};

export default Clients;