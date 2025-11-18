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
  CSpinner
} from "@coreui/react";
import axios from "axios";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <CTable hover responsive>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Client ID</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                <CTableHeaderCell>Type</CTableHeaderCell>
                <CTableHeaderCell>Contact Person</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Phone</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Completed Orders</CTableHeaderCell>
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
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  );
};

export default Clients;