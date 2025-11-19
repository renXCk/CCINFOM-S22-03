import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CWidgetStatsF,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilTruck,
  cilUser,
  cilWarning,
  cilDrop,
  cilArrowRight,
} from '@coreui/icons'
import { CChartDoughnut } from '@coreui/react-chartjs'
import axios from 'axios'

const Dashboard = () => {
  const API_URL = 'http://localhost:8080/api'

  // --- STATE FOR DASHBOARD DATA ---
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    onTripVehicles: 0,
    maintenanceVehicles: 0,
    totalDrivers: 0,
    totalClients: 0,
    recentIncidents: [],
    fuelCostThisMonth: 0
  })

  const [loading, setLoading] = useState(true)

  // --- LOAD DATA ---
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Parallel Fetching for Speed
        const [vehiclesRes, driversRes, clientsRes, incidentsRes, fuelRes] = await Promise.all([
          axios.get(`${API_URL}/vehicles/all`),
          axios.get(`${API_URL}/drivers/all`),
          axios.get(`${API_URL}/clients/all`),
          axios.get(`${API_URL}/incidentlogs/all`),
          axios.get(`${API_URL}/fuellogs/all`)
        ])

        const vehicles = vehiclesRes.data
        const drivers = driversRes.data
        const clients = clientsRes.data
        const incidents = incidentsRes.data
        const fuelLogs = fuelRes.data

        // Calculate Stats
        const available = vehicles.filter(v => v.status === 'available').length
        const onTrip = vehicles.filter(v => v.status === 'on_trip').length
        const maintenance = vehicles.filter(v => v.status === 'maintenance').length

        // Calculate Total Fuel Cost (Simple Sum)
        const totalFuelCost = fuelLogs.reduce((sum, log) => sum + (log.litersFilled * log.pricePerLiter), 0)

        setStats({
          totalVehicles: vehicles.length,
          availableVehicles: available,
          onTripVehicles: onTrip,
          maintenanceVehicles: maintenance,
          totalDrivers: drivers.filter(d => d.status === 'active').length,
          totalClients: clients.filter(c => c.status === 'active').length,
          recentIncidents: incidents.slice(-5).reverse(), // Last 5 incidents
          fuelCostThisMonth: totalFuelCost
        })

      } catch (error) {
        console.error("Dashboard Load Error:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // --- CHART DATA ---
  const vehicleStatusData = {
    labels: ['Available', 'On Trip', 'Maintenance', 'Inactive'],
    datasets: [
      {
        backgroundColor: ['#2eb85c', '#f9b115', '#e55353', '#ced2d8'],
        data: [stats.availableVehicles, stats.onTripVehicles, stats.maintenanceVehicles, stats.totalVehicles - (stats.availableVehicles + stats.onTripVehicles + stats.maintenanceVehicles)],
      },
    ],
  }

  return (
    <>
      {/* --- KEY METRICS WIDGETS --- */}
      <CRow>
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            color="primary"
            icon={<CIcon icon={cilTruck} height={24} />}
            padding={false}
            title="Vehicles On Trip"
            value={`${stats.onTripVehicles} / ${stats.totalVehicles}`}
            footer={
              <div className="text-medium-emphasis px-3 py-2">
                 {stats.availableVehicles} Available for Dispatch
              </div>
            }
          />
        </CCol>
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            color="info"
            icon={<CIcon icon={cilUser} height={24} />}
            padding={false}
            title="Active Drivers"
            value={stats.totalDrivers}
            footer={
                <div className="text-medium-emphasis px-3 py-2">
                    Ready to drive
                </div>
            }
          />
        </CCol>
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            color="warning"
            icon={<CIcon icon={cilDrop} height={24} />}
            padding={false}
            title="Total Fuel Cost"
            value={`₱ ${stats.fuelCostThisMonth.toLocaleString(undefined, {maximumFractionDigits:0})}`}
            footer={
                <div className="text-medium-emphasis px-3 py-2">
                   Lifetime Expenses
                </div>
            }
          />
        </CCol>
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            color="danger"
            icon={<CIcon icon={cilWarning} height={24} />}
            padding={false}
            title="Recent Incidents"
            value={stats.recentIncidents.length}
            footer={
                <div className="text-medium-emphasis px-3 py-2">
                    Reported Incidents
                </div>
            }
          />
        </CCol>
      </CRow>

      {/* --- CHARTS & TABLES ROW --- */}
      <CRow>

        {/* 1. Vehicle Status Chart */}
        <CCol xs={12} md={6} xl={4}>
          <CCard className="mb-4">
            <CCardHeader>Fleet Status Overview</CCardHeader>
            <CCardBody>
              <CChartDoughnut
                data={vehicleStatusData}
                options={{
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>

        {/* 2. Quick Actions & Stats */}
        <CCol xs={12} md={6} xl={8}>
          <CCard className="mb-4">
            <CCardHeader>System Health & Actions</CCardHeader>
            <CCardBody>
               <CRow>
                   <CCol sm={6}>
                       <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                           <div className="text-medium-emphasis small">Active Clients</div>
                           <div className="fs-5 fw-semibold">{stats.totalClients} Clients</div>
                       </div>
                   </CCol>
                   <CCol sm={6}>
                       <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
                           <div className="text-medium-emphasis small">Vehicles in Maintenance</div>
                           <div className="fs-5 fw-semibold">{stats.maintenanceVehicles} Vehicles</div>
                       </div>
                   </CCol>
               </CRow>
               <hr className="mt-0" />

               <h5 className="mb-3">Quick Actions</h5>
               <div className="d-grid gap-2 d-md-block">
                   <CButton color="primary" href="#/triplogs" className="me-md-2">
                       <CIcon icon={cilArrowRight} className="me-1"/> New Trip
                   </CButton>
                   <CButton color="success" href="#/fuelLogs" className="text-white me-md-2">
                       <CIcon icon={cilDrop} className="me-1"/> Log Fuel
                   </CButton>
                   <CButton color="danger" href="#/incidentlogs" className="text-white">
                       <CIcon icon={cilWarning} className="me-1"/> Report Incident
                   </CButton>
               </div>

            </CCardBody>
          </CCard>

          {/* INCIDENT TABLE REMOVED HERE */}

        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
