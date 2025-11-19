import React, { useState, useEffect, useMemo } from 'react'
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
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
  CAlert,
  CWidgetStatsF,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFilter, cilFile, cilCloudDownload, cilTruck } from '@coreui/icons'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// --- Utility Functions ---
const fetchWithBackoff = async (url, options = {}, maxRetries = 5, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return response
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
}

const formatDate = (date) => date.toISOString().split('T')[0]
const defaultStartDate = new Date()
defaultStartDate.setDate(defaultStartDate.getDate() - 30)

const API_BASE_URL = 'http://localhost:8080/api/reports';

const MaintenanceReport = () => {
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    startDate: formatDate(defaultStartDate),
    endDate: formatDate(new Date()),
  })

  // --- Fetch Data ---
  const runReport = async (e) => {
    if (e) e.preventDefault()
    const { startDate, endDate } = filters

    if (!startDate || !endDate) {
      setError('Please select both a start date and an end date.')
      return
    }

    setLoading(true)
    setError(null)
    setReportData([])

    const apiUrl = `${API_BASE_URL}/maintenance?start=${startDate}&end=${endDate}`

    try {
      const response = await fetchWithBackoff(apiUrl)
      const data = await response.json()
      setReportData(data)
    } catch (err) {
      console.error('Failed to fetch maintenance report:', err)
      setError(`Failed to connect to backend. Ensure API is running at ${API_BASE_URL}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runReport()
  }, [])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
  }

  // --- Process Summary ---
  const summaryData = useMemo(() => {
    if (!reportData.length) return { total: 0, ongoing: 0, completed: 0, cancelled: 0 }
    const summary = { total: reportData.length, ongoing: 0, completed: 0, cancelled: 0 }
    reportData.forEach(item => {
      if (item.status === 'Ongoing') summary.ongoing++
      if (item.status === 'Completed') summary.completed++
      if (item.status === 'Cancelled') summary.cancelled++
    })
    return summary
  }, [reportData])

  // --- PDF Export ---
  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Maintenance Report', 14, 20)
    doc.setFontSize(11)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28)
    doc.text(`Period: ${filters.startDate} to ${filters.endDate}`, 14, 34)

    const tableColumn = ['ID', 'Vehicle ID', 'Start Date', 'Completed Date', 'Description', 'Status', 'Parts Used']
    const tableRows = reportData.map(item => [
      item.maintenanceId,
      item.vehicleId,
      item.dateTimeStart,
      item.dateTimeCompleted || 'N/A',
      item.description || 'N/A',
      item.status,
      item.partsUsed && item.partsUsed.length > 0
        ? item.partsUsed.map(p => `${p.partName} x${p.quantityUsed}`).join(', ')
        : 'None'
    ])

    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [50, 31, 219] },
    })

    doc.save(`Maintenance_Report_${filters.startDate}_to_${filters.endDate}.pdf`)
  }

  return (
    <CRow>
      <CCol xs={12}>
        {/* --- FILTERS --- */}
        <CCard className="mb-4">
          <CCardHeader>
            <CIcon icon={cilFilter} className="me-2" />
            <strong>Maintenance Report Filters</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="row g-3 align-items-end" onSubmit={runReport}>
              <CCol md={5}>
                <CFormLabel>Start Date</CFormLabel>
                <CFormInput type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
              </CCol>
              <CCol md={5}>
                <CFormLabel>End Date</CFormLabel>
                <CFormInput type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
              </CCol>
              <CCol md={2}>
                <CButton color="primary" className="w-100" type="submit" disabled={loading}>
                  {loading ? 'Loading...' : 'Run Report'}
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>

        {/* --- ERROR --- */}
        {error && <CAlert color="danger">{error}</CAlert>}

        {/* --- SUMMARY WIDGETS --- */}
        {!loading && reportData.length > 0 && (
          <CRow className="mb-4">
            <CCol sm={6} lg={3}>
              <CWidgetStatsF
                className="mb-4"
                color="primary"
                title="Total Maintenances"
                value={summaryData.total}
                icon={<CIcon icon={cilTruck} height={52} />}
              />
            </CCol>
            <CCol sm={6} lg={3}>
              <CWidgetStatsF
                className="mb-4"
                color="warning"
                title="Ongoing"
                value={summaryData.ongoing}
                icon={<CIcon icon={cilTruck} height={52} />}
              />
            </CCol>
            <CCol sm={6} lg={3}>
              <CWidgetStatsF
                className="mb-4"
                color="success"
                title="Completed"
                value={summaryData.completed}
                icon={<CIcon icon={cilTruck} height={52} />}
              />
            </CCol>
            <CCol sm={6} lg={3}>
              <CWidgetStatsF
                className="mb-4"
                color="danger"
                title="Cancelled"
                value={summaryData.cancelled}
                icon={<CIcon icon={cilTruck} height={52} />}
              />
            </CCol>
          </CRow>
        )}

        {/* --- TABLE --- */}
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <CIcon icon={cilFile} className="me-2" />
              <strong>Report Results</strong>
            </div>
            {reportData.length > 0 && (
              <CButton color="danger" size="sm" className="text-white" onClick={exportToPDF}>
                <CIcon icon={cilCloudDownload} className="me-2" />
                Export PDF
              </CButton>
            )}
          </CCardHeader>
          <CCardBody>
            {loading && <div className="text-center p-4">Loading...</div>}
            {!loading && reportData.length > 0 && (
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Vehicle ID</CTableHeaderCell>
                    <CTableHeaderCell>Start Date</CTableHeaderCell>
                    <CTableHeaderCell>Completed Date</CTableHeaderCell>
                    <CTableHeaderCell>Description</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Parts Used</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {reportData.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{item.maintenanceId}</CTableDataCell>
                      <CTableDataCell>{item.vehicleId}</CTableDataCell>
                      <CTableDataCell>{item.dateTimeStart}</CTableDataCell>
                      <CTableDataCell>{item.dateTimeCompleted || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{item.description || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{item.status}</CTableDataCell>
                      <CTableDataCell>
                        {item.partsUsed && item.partsUsed.length > 0
                          ? item.partsUsed.map(p => `${p.partName} x${p.quantityUsed}`).join(', ')
                          : 'None'}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
            {!loading && reportData.length === 0 && (
              <div className="text-center p-3 text-muted">No maintenance data found for this range.</div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default MaintenanceReport
