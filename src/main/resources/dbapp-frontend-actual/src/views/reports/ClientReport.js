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
  CAlert,
  CFormSelect,
  CButton
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFilter } from '@coreui/icons'

const ClientReport = () => {
  const currentDate = new Date()
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ]

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:8080/api/reports/clients?year=${selectedYear}&month=${selectedMonth}`
      )

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
  }, [selectedYear, selectedMonth])

  if (error) {
    return (
      <CAlert color="danger" className="m-4">
        {error}
      </CAlert>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Client Shipment Statistics</strong>
              </div>
              <div className="d-flex gap-2">
                <CFormSelect
                  size="sm"
                  style={{ width: '120px' }}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </CFormSelect>

                <CFormSelect
                  size="sm"
                  style={{ width: '100px' }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </CFormSelect>

                <CButton color="primary" size="sm" variant="outline" onClick={fetchReport}>
                  <CIcon icon={cilFilter} />
                </CButton>
              </div>
            </div>
          </CCardHeader>

          <CCardBody>
            {loading ? (
              <div className="text-center my-4">
                <CSpinner color="primary" />
                <div className="mt-2">Loading Report...</div>
              </div>
            ) : (
              <CTable striped hover responsive bordered>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Client Name</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Total Booked</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Completed</CTableHeaderCell>
                    <CTableHeaderCell>Vehicles Used ({months.find(m => m.value == selectedMonth)?.label})</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {reportData.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="5" className="text-center">
                        No shipment data available for this period.
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
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ClientReport
