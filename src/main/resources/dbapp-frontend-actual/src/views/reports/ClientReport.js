import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CAlert
} from '@coreui/react'

const ClientReport = () => {
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // --- 1. FETCH DATA ---
  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/reports/clients')
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      setReportData(data)
    } catch (err) {
      console.error('Error fetching client report:', err)
      setError('Failed to load client shipment report. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  // --- 2. RENDER LOADING/ERROR STATES ---
  if (loading) {
    return (
      <div className="text-center mt-5">
        <CSpinner color="primary" />
        <div className="mt-2">Loading Report...</div>
      </div>
    )
  }

  if (error) {
    return (
      <CAlert color="danger" className="m-4">
        {error}
      </CAlert>
    )
  }

  // --- 3. RENDER TABLE ---
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Client Shipment Statistics</strong>
            <small className="text-muted ms-2">(All-time History)</small>
          </CCardHeader>

          <CCardBody>
            <CTable striped hover responsive bordered>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Client Name</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Total Booked</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Completed</CTableHeaderCell>
                  <CTableHeaderCell>Vehicles Used History</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {reportData.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="5" className="text-center">
                      No shipment data available.
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  reportData.map((item) => (
                    <CTableRow key={item.clientId}>
                      <CTableDataCell>{item.clientId}</CTableDataCell>
                      <CTableDataCell>
                        <strong>{item.clientName}</strong>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {item.totalShipmentsBooked}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {item.completedShipments}
                      </CTableDataCell>
                      <CTableDataCell style={{ maxWidth: '400px' }}>
                        <small className={item.vehiclesUsed === 'None' ? 'text-muted' : ''}>
                          {item.vehiclesUsed}
                        </small>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ClientReport