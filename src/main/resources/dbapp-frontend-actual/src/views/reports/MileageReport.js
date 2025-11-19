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
  CWidgetStatsF, // Using standard card structures for widgets
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilFilter,
  cilFile,
  cilMagnifyingGlass,
  cilCloudDownload,
  cilChartPie,
  cilSpeedometer,
  cilLocationPin,
  cilTruck,
  cilChartLine
} from '@coreui/icons'
import { CChart } from '@coreui/react-chartjs'
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

  // --- 2. Process Data for Charts & Summary (Memoized) ---
  const processedData = useMemo(() => {
    if (!reportData.length) return {
        chart: { vehicles: {}, timeline: {} },
        summary: { totalDistance: 0, totalTrips: 0, avgPerTrip: 0, uniqueVehicles: 0 }
    };

    // -- A. Calculate Summaries --
    let totalDistance = 0;
    let totalTrips = 0;
    const uniquePlates = new Set();

    // -- B. Prepare Chart Groupings --
    const byVehicle = {};
    const byDate = {};

    reportData.forEach(item => {
        // Summary calcs
        totalDistance += item.totalDistanceTraveled;
        totalTrips += item.tripCount;
        uniquePlates.add(item.plateNumber);

        // Chart calcs
        const key = `${item.vehicleModel} (${item.plateNumber})`;
        byVehicle[key] = (byVehicle[key] || 0) + item.totalDistanceTraveled;

        const date = item.reportDate;
        byDate[date] = (byDate[date] || 0) + item.totalDistanceTraveled;
    });

    return {
      chart: {
        vehicleLabels: Object.keys(byVehicle),
        vehicleValues: Object.values(byVehicle),
        dateLabels: Object.keys(byDate).sort(),
        dateValues: Object.keys(byDate).sort().map(date => byDate[date])
      },
      summary: {
        totalDistance: totalDistance.toFixed(2),
        totalTrips: totalTrips,
        avgPerTrip: totalTrips > 0 ? (totalDistance / totalTrips).toFixed(2) : 0,
        uniqueVehicles: uniquePlates.size
      }
    };
  }, [reportData]);

  // --- 3. PDF Export Logic ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Mileage Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Period: ${filters.startDate} to ${filters.endDate}`, 14, 34);

    // Add Summary to PDF
    doc.text(`Total Distance: ${processedData.summary.totalDistance} km`, 14, 42);
    doc.text(`Total Trips: ${processedData.summary.totalTrips}`, 100, 42);

    const tableColumn = ["Date", "Model", "Plate No.", "Distance", "Trips", "Odometer"];
    const tableRows = reportData.map(item => [
        item.reportDate,
        item.vehicleModel,
        item.plateNumber,
        item.totalDistanceTraveled.toFixed(2),
        item.tripCount,
        item.currentMileage
    ]);

    autoTable(doc, {
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [50, 31, 219] },
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

        {/* --- SUMMARY CARDS (WIDGETS) --- */}
        {!loading && reportData.length > 0 && (
            <CRow className="mb-4">
                {/* Card 1: Total Distance */}
                <CCol sm={6} lg={3}>
                    <CCard className="mb-4 text-white bg-primary">
                        <CCardBody className="d-flex justify-content-between align-items-start">
                            <div>
                                <div className="fs-4 fw-semibold">{processedData.summary.totalDistance} <span className="fs-6 fw-normal">km</span></div>
                                <div>Total Distance</div>
                            </div>
                            <CIcon icon={cilSpeedometer} height={52} className="my-4 text-white text-opacity-75" />
                        </CCardBody>
                    </CCard>
                </CCol>

                {/* Card 2: Total Trips */}
                <CCol sm={6} lg={3}>
                    <CCard className="mb-4 text-white bg-info">
                        <CCardBody className="d-flex justify-content-between align-items-start">
                            <div>
                                <div className="fs-4 fw-semibold">{processedData.summary.totalTrips}</div>
                                <div>Total Trips</div>
                            </div>
                            <CIcon icon={cilLocationPin} height={52} className="my-4 text-white text-opacity-75" />
                        </CCardBody>
                    </CCard>
                </CCol>

                {/* Card 3: Average Distance per Trip */}
                <CCol sm={6} lg={3}>
                    <CCard className="mb-4 text-white bg-warning">
                        <CCardBody className="d-flex justify-content-between align-items-start">
                            <div>
                                <div className="fs-4 fw-semibold">{processedData.summary.avgPerTrip} <span className="fs-6 fw-normal">km</span></div>
                                <div>Avg Dist / Trip</div>
                            </div>
                            <CIcon icon={cilChartLine} height={52} className="my-4 text-white text-opacity-75" />
                        </CCardBody>
                    </CCard>
                </CCol>

                {/* Card 4: Active Vehicles */}
                <CCol sm={6} lg={3}>
                    <CCard className="mb-4 text-white bg-danger">
                        <CCardBody className="d-flex justify-content-between align-items-start">
                            <div>
                                <div className="fs-4 fw-semibold">{processedData.summary.uniqueVehicles}</div>
                                <div>Active Vehicles</div>
                            </div>
                            <CIcon icon={cilTruck} height={52} className="my-4 text-white text-opacity-75" />
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        )}

        {/* --- CHARTS SECTION --- */}
        {!loading && reportData.length > 0 && (
          <CRow className="mb-4">
            <CCol md={6} className="mb-3">
              <CCard className="h-100">
                <CCardHeader><CIcon icon={cilChartPie} className="me-2"/>Distance per Vehicle</CCardHeader>
                <CCardBody>
                  <CChart
                    type="bar"
                    data={{
                      labels: processedData.chart.vehicleLabels,
                      datasets: [
                        {
                          label: 'Total Distance',
                          backgroundColor: '#321fdb',
                          data: processedData.chart.vehicleValues,
                        },
                      ],
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>

            <CCol md={6} className="mb-3">
              <CCard className="h-100">
                <CCardHeader><CIcon icon={cilChartPie} className="me-2"/>Daily Fleet Mileage</CCardHeader>
                <CCardBody>
                  <CChart
                    type="line"
                    data={{
                      labels: processedData.chart.dateLabels,
                      datasets: [
                        {
                          label: 'Daily Distance',
                          backgroundColor: 'rgba(229, 83, 83, 0.2)', // Faded gradient style
                          borderColor: '#e55353',
                          pointBackgroundColor: '#e55353',
                          pointBorderColor: '#fff',
                          data: processedData.chart.dateValues,
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
                      <CTableHeaderCell>Odometer</CTableHeaderCell>
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
