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
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilMagnifyingGlass, cilFilter } from '@coreui/icons'
import { CChartBar, CChartLine, CChart } from '@coreui/react-chartjs'
import { CWidgetStatsE } from '@coreui/react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const API_BASE_URL = 'http://localhost:8080'

const formatDate = (date) => date.toISOString().split('T')[0]

const defaultStartDate = new Date()
defaultStartDate.setDate(defaultStartDate.getDate() - 30)
const defaultEndDate = new Date()

const DriverReport = () => {
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [selectedDriver, setSelectedDriver] = useState('')
  const [filters, setFilters] = useState({
    startDate: formatDate(defaultStartDate),
    endDate: formatDate(defaultEndDate),
  })

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/drivers`)
        const data = await res.json()
        setDrivers(data)
      } catch (err) {
        console.error('Error fetching drivers:', err)
      }
    }
    fetchDrivers()
  }, [])

  const fetchReport = async (e) => {
    if (e) e.preventDefault()
    const { startDate, endDate } = filters

    if (!startDate || !endDate) {
      setError('Please select both start and end dates.')
      return
    }

    setLoading(true)
    setError(null)
    setReportData([])

    try {
      let url = `${API_BASE_URL}/api/reports/performance?start=${startDate}&end=${endDate}`
      if (selectedDriver) url += `&driverId=${selectedDriver}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`)
      const data = await res.json()
      setReportData(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load driver report. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [selectedDriver])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
  }

  const exportToPDF = () => {
    if (reportData.length === 0) return
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Driver Performance Report', 14, 20)
    doc.setFontSize(11)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28)
    doc.text(`Period: ${filters.startDate} to ${filters.endDate}`, 14, 34)

    const tableColumn = [
      'Driver ID',
      'Driver Name',
      'Completed Trips',
      'Incidents',
      'Incident Trip Rate',
      'Avg Trip Duration (hr)',
      'Avg Trip Distance (km)',
      'Date',
    ]

    const tableRows = reportData.map((driver) => [
      driver.driverId,
      driver.name,
      driver.numberOfCompletedTrips,
      driver.numberOfIncidents,
      driver.incidentRate + '%',
      driver.avgTripDuration,
      driver.avgTripDistance,
      new Date(driver.reportDate).toLocaleDateString(),
    ])

    autoTable(doc, { startY: 40, head: [tableColumn], body: tableRows })
    doc.save(`Driver_Performance_Report_${filters.startDate}_to_${filters.endDate}.pdf`)
  }

  const totalIncidents = reportData.reduce((acc, d) => acc + d.numberOfIncidents, 0)
  const totalHours = reportData.reduce((acc, d) => acc + d.avgTripDuration * d.numberOfCompletedTrips, 0)
  const averageIncidentRate = reportData.length
    ? (reportData.reduce((acc, d) => acc + d.incidentRate, 0) / reportData.length).toFixed(2)
    : 0

  return (
    <CRow>
      <CCol xs={12}>
        {/* Filters */}
        <CCard className="mb-4">
          <CCardHeader>
            <CIcon icon={cilFilter} className="me-2" />
            <strong>Filter Driver Report</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="row g-3 align-items-end" onSubmit={fetchReport}>
              <CCol md={3}>
                <CFormLabel>Start Date</CFormLabel>
                <CFormInput type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
              </CCol>
              <CCol md={3}>
                <CFormLabel>End Date</CFormLabel>
                <CFormInput type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Driver</CFormLabel>
                <CFormSelect value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
                  <option value="">All Drivers</option>
                  {drivers.map((d) => (
                    <option key={d.driverId} value={d.driverId}>
                      {d.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <CButton color="primary" className="w-100" type="submit" disabled={loading}>
                  <CIcon icon={cilMagnifyingGlass} className="me-1" />
                  {loading ? 'Loading...' : 'Run Report'}
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>

        {error && <CAlert color="danger" className="text-center">{error}</CAlert>}

        {/* Table */}
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Driver Performance Report</strong>
            {reportData.length > 0 && (
              <CButton color="danger" size="sm" onClick={exportToPDF}>
                <CIcon icon={cilCloudDownload} className="me-2" />
                Export PDF
              </CButton>
            )}
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="text-center my-4">
                <CSpinner color="primary" />
                <div className="mt-2">Loading Report...</div>
              </div>
            ) : (
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Driver ID</CTableHeaderCell>
                    <CTableHeaderCell>Driver Name</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Completed Trips</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Incidents</CTableHeaderCell>
                    <CTableHeaderCell>Incident Trip Rate</CTableHeaderCell>
                    <CTableHeaderCell>Avg Trip Duration</CTableHeaderCell>
                    <CTableHeaderCell>Avg Trip Distance</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {reportData.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="8" className="text-center">
                        No driver data available for selected dates.
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    reportData.map((driver) => (
                      <CTableRow key={driver.driverId + driver.reportDate}>
                        <CTableDataCell>{driver.driverId}</CTableDataCell>
                        <CTableDataCell>{driver.name}</CTableDataCell>
                        <CTableDataCell className="text-center">{driver.numberOfCompletedTrips}</CTableDataCell>
                        <CTableDataCell className="text-center">{driver.numberOfIncidents}</CTableDataCell>
                        <CTableDataCell>{driver.incidentRate}%</CTableDataCell>
                        <CTableDataCell>{driver.avgTripDuration} hr</CTableDataCell>
                        <CTableDataCell>{driver.avgTripDistance} km</CTableDataCell>
                        <CTableDataCell>{new Date(driver.reportDate).toLocaleDateString()}</CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>

        {reportData.length > 0 && (
          <CRow className="mb-4">
            {/* Widgets Card */}
            <CCol xs={12} md={4}>
              <CCard className="h-100 mb-4">
                <CCardHeader>
                  <strong>Driver Metrics</strong>
                </CCardHeader>
                <CCardBody>
                  <CWidgetStatsE
                    title="Total Incidents"
                    value={totalIncidents}
                    chart={
                      <CChartBar
                        style={{ height: '50px' }}
                        data={{
                          labels: ['Incidents'],
                          datasets: [{ data: [totalIncidents], backgroundColor: '#d95d59' }],
                        }}
                        options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }}
                      />
                    }
                    className="mb-2"
                  />
                  <CWidgetStatsE
                    title="Total Hours Spent Delivering"
                    value={totalHours}
                    chart={
                      <CChartBar
                        style={{ height: '50px' }}
                        data={{
                          labels: ['Hours'],
                          datasets: [{ data: [totalHours], backgroundColor: '#547be0' }],
                        }}
                        options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }}
                      />
                    }
                    className="mb-2"
                  />
                  <CWidgetStatsE
                    title="Average Incident Rate (%)"
                    value={averageIncidentRate}
                    chart={
                      <CChartLine
                        style={{ height: '50px' }}
                        data={{
                          labels: ['Incident Rate'],
                          datasets: [{ data: [averageIncidentRate], borderColor: '#ecae2a', backgroundColor: 'transparent' }],
                        }}
                        options={{ maintainAspectRatio: false, elements: { line: { tension: 0.4 }, point: { radius: 0 } }, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }}
                      />
                    }
                  />
                </CCardBody>
              </CCard>
            </CCol>

            {/* Doughnut Chart Card */}
            <CCol xs={12} md={8}>
              <CCard className="h-100 mb-4">
                <CCardHeader>
                  <strong>Trips Distribution</strong>
                </CCardHeader>
                <CCardBody>
                   <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CChart
                        type="doughnut"
                        style={{ height: '500px', width: '500px' }}
                        data={{
                            labels: reportData.map((d) => d.name),
                            datasets: [
                            {
                                data: reportData.map((d) => d.numberOfCompletedTrips),
                                backgroundColor: reportData.map((_, i) => {
                                const colors = ['#547be0', '#ecae2a', '#d95d59', '#bebfe5', '#4bc0c0', '#9966ff', '#ff9f40']
                                return colors[i % colors.length]
                                }),
                            },
                            ],
                        }}
                        />
                    </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}
      </CCol>
    </CRow>
  )
}

export default DriverReport
