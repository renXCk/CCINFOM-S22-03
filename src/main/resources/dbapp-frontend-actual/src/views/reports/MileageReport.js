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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFilter, cilFile, cilMagnifyingGlass, cilCloudDownload, cilChartPie } from '@coreui/icons'
import { CChart } from '@coreui/react-chartjs' // Import Chart Component
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// --- Utility Functions ---
const fetchWithBackoff = async (url, options = {}, maxRetries = 5, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
}

const formatDate = (date) => date.toISOString().split('T')[0];
const defaultStartDate = new Date();
defaultStartDate.setDate(defaultStartDate.getDate() - 30);

const API_BASE_URL = 'http://localhost:8080';

const MileageReport = () => {
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    startDate: formatDate(defaultStartDate),
    endDate: formatDate(new Date()),
  })

  // --- 1. Fetch Report Data ---
  const runReport = async (e) => {
    if (e) e.preventDefault();
    const { startDate, endDate } = filters;

    if (!startDate || !endDate) {
      setError('Please select both a start date and an end date.');
      return;
    }

    setLoading(true);
    setError(null);
    setReportData([]);

    const apiUrl = `${API_BASE_URL}/api/reports/mileage?start=${startDate}&end=${endDate}`;

    try {
      const response = await fetchWithBackoff(apiUrl);
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error('Failed to fetch mileage report:', err);
      setError(`Failed to connect to backend. Ensure API is running at ${API_BASE_URL}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runReport()
  }, [])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
  }

  // --- 2. Process Data for Charts (Memoized) ---
  // We use useMemo so we don't recalculate this on every render, only when data changes
  const chartData = useMemo(() => {
    if (!reportData.length) return { vehicles: {}, timeline: {} };

    // Group by Vehicle (Plate)
    const byVehicle = reportData.reduce((acc, item) => {
      const key = `${item.vehicleModel} (${item.plateNumber})`;
      acc[key] = (acc[key] || 0) + item.totalDistanceTraveled;
      return acc;
    }, {});

    // Group by Date
    const byDate = reportData.reduce((acc, item) => {
      const date = item.reportDate;
      acc[date] = (acc[date] || 0) + item.totalDistanceTraveled;
      return acc;
    }, {});

    return {
      vehicleLabels: Object.keys(byVehicle),
      vehicleValues: Object.values(byVehicle),
      dateLabels: Object.keys(byDate).sort(), // Ensure dates are chronological
      dateValues: Object.keys(byDate).sort().map(date => byDate[date])
    };
  }, [reportData]);


  // --- 3. PDF Export Logic ---
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Mileage Report", 14, 20);

    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Period: ${filters.startDate} to ${filters.endDate}`, 14, 34);

    // Table Definition
    const tableColumn = ["Date", "Model", "Plate No.", "Total Distance", "Trips", "Current Vehicle Mileage"];
    const tableRows = [];

    reportData.forEach(item => {
      const rowData = [
        item.reportDate,
        item.vehicleModel,
        item.plateNumber,
        item.totalDistanceTraveled.toFixed(2),
        item.tripCount,
        item.currentMileage
      ];
      tableRows.push(rowData);
    });

    // Generate Table
    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [50, 31, 219] }, // CoreUI Primary Color
    });

    doc.save(`Mileage_Report_${filters.startDate}_to_${filters.endDate}.pdf`);
  };

  return (
    <CRow>
      <CCol xs={12}>

        {/* --- FILTERS --- */}
        <CCard className="mb-4">
          <CCardHeader>
            <CIcon icon={cilFilter} className="me-2" />
            <strong>Mileage Report Filters</strong>
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
                  <CIcon icon={cilMagnifyingGlass} className="me-1" />
                  {loading ? 'Loading...' : 'Run Report'}
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>

        {/* --- ERROR HANDLING --- */}
        {error && <CAlert color="danger" className="text-center">{error}</CAlert>}

        {/* --- CHARTS SECTION (Only show if we have data) --- */}
        {!loading && reportData.length > 0 && (
          <CRow className="mb-4">
             {/* Chart 1: Distance by Vehicle */}
            <CCol md={6} className="mb-3">
              <CCard className="h-100">
                <CCardHeader><CIcon icon={cilChartPie} className="me-2"/>Distance per Vehicle</CCardHeader>
                <CCardBody>
                  <CChart
                    type="bar"
                    data={{
                      labels: chartData.vehicleLabels,
                      datasets: [
                        {
                          label: 'Total Distance',
                          backgroundColor: '#321fdb',
                          data: chartData.vehicleValues,
                        },
                      ],
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>

            {/* Chart 2: Distance over Time */}
            <CCol md={6} className="mb-3">
              <CCard className="h-100">
                <CCardHeader><CIcon icon={cilChartPie} className="me-2"/>Daily Fleet Mileage</CCardHeader>
                <CCardBody>
                  <CChart
                    type="line"
                    data={{
                      labels: chartData.dateLabels,
                      datasets: [
                        {
                          label: 'Daily Distance',
                          backgroundColor: 'rgba(229, 83, 83, 0.2)',
                          borderColor: '#e55353',
                          pointBackgroundColor: '#e55353',
                          pointBorderColor: '#fff',
                          data: chartData.dateValues,
                          fill: true,
                        },
                      ],
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}

        {/* --- TABLE RESULTS --- */}
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
            {loading && (
              <div className="text-center p-4">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2 text-muted">Fetching data...</p>
              </div>
            )}

            {!loading && !error && (
              <>
                <CTable striped hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Model</CTableHeaderCell>
                      <CTableHeaderCell>Plate No.</CTableHeaderCell>
                      <CTableHeaderCell>Total Distance</CTableHeaderCell>
                      <CTableHeaderCell>Trips</CTableHeaderCell>
                      <CTableHeaderCell>Current Vehicle Mileage</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {reportData.map((item, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{item.reportDate}</CTableDataCell>
                        <CTableDataCell>{item.vehicleModel}</CTableDataCell>
                        <CTableDataCell>{item.plateNumber}</CTableDataCell>
                        <CTableDataCell><strong>{item.totalDistanceTraveled.toFixed(2)}</strong></CTableDataCell>
                        <CTableDataCell>{item.tripCount}</CTableDataCell>
                        <CTableDataCell>{item.currentMileage}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
                {reportData.length === 0 && (
                    <div className="text-center p-3 text-muted">No mileage data found for this range.</div>
                )}
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default MileageReport
