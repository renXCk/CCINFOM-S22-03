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
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CBadge
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilWarning } from '@coreui/icons'

const IncidentLogs = () => {
  const [incidents, setIncidents] = useState([])
  const [drivers, setDrivers] = useState([]) // For Dropdown
  const [vehicles, setVehicles] = useState([]) // For Dropdown
  const [modalVisible, setModalVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState(null)

  // Default Form State (Matches SQL Schema)
  const initialFormState = {
    driverId: '',
    vehicleId: '',
    incidentType: '',
    incidentDateTime: '', // Format: YYYY-MM-DDTHH:MM
    incidentLocation: '',
    incidentSeverity: 'Minor'
  }

  const [formData, setFormData] = useState(initialFormState)

  // --- 1. FETCH DATA (Incidents, Drivers, Vehicles) ---
  const fetchAllData = async () => {
    try {
      // Fetch Incidents
      const incRes = await fetch('http://localhost:8080/api/incidentlogs/all')
      if (incRes.ok) setIncidents(await incRes.json())

      // Fetch Drivers (For Dropdown)
      const drvRes = await fetch('http://localhost:8080/api/drivers/all')
      if (drvRes.ok) setDrivers(await drvRes.json())

      // Fetch Vehicles (For Dropdown)
      const vehRes = await fetch('http://localhost:8080/api/vehicles/all')
      if (vehRes.ok) setVehicles(await vehRes.json())

    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // --- 2. HANDLE INPUT CHANGES ---
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // --- 3. OPEN ADD MODAL ---
  const openAddModal = () => {
    setEditMode(false)
    setFormData(initialFormState)
    setModalVisible(true)
  }

  // --- 4. OPEN EDIT MODAL ---
  const openEditModal = (incident) => {
    setEditMode(true)
    setCurrentId(incident.incident_id) // Map SQL incident_id
    
    // Format Date for Input (remove 'Z' or seconds if present for datetime-local)
    let formattedDate = ''
    if (incident.incident_date_time) {
        formattedDate = new Date(incident.incident_date_time).toISOString().slice(0, 16)
    }

    setFormData({
      driverId: incident.driver_id,
      vehicleId: incident.vehicle_id,
      incidentType: incident.incident_type,
      incidentDateTime: formattedDate,
      incidentLocation: incident.incident_location,
      incidentSeverity: incident.incident_severity
    })
    setModalVisible(true)
  }

  // --- 5. SUBMIT FORM ---
  const handleSubmit = async () => {
    const url = editMode
      ? 'http://localhost:8080/api/incidentlogs/update'
      : 'http://localhost:8080/api/incidentlogs/add'

    const method = editMode ? 'PUT' : 'POST'

    const bodyData = editMode
      ? { ...formData, incidentId: currentId }
      : formData

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })

      if (response.ok) {
        setModalVisible(false)
        fetchAllData() // Refresh table
      } else {
        alert('Failed to save incident record')
      }
    } catch (error) {
      console.error('Error saving incident:', error)
    }
  }

  // --- 6. DELETE INCIDENT ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this incident log?')) return

    try {
      const response = await fetch(`http://localhost:8080/api/incidentlogs/delete/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchAllData()
      }
    } catch (error) {
      console.error('Error deleting incident:', error)
    }
  }

  // --- HELPER: Get Driver Name by ID ---
  const getDriverName = (id) => {
    const drv = drivers.find(d => d.driverId === id)
    return drv ? `${drv.firstName} ${drv.lastName}` : `ID: ${id}`
  }

  // --- HELPER: Get Vehicle Plate by ID ---
  const getVehiclePlate = (id) => {
    const veh = vehicles.find(v => v.vehicleId === id)
    return veh ? veh.plateNumber : `ID: ${id}`
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Minor': return 'success'
      case 'Moderate': return 'warning'
      case 'Major': return 'danger'
      default: return 'secondary'
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Incident Log</strong>
            <CButton color="primary" className="float-end" size="sm" onClick={openAddModal}>
              <CIcon icon={cilPlus} className="me-2" />
              Log Incident
            </CButton>
          </CCardHeader>

          <CCardBody>
            <CTable hover bordered responsive>
              <CTableHead>
                <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Date/Time</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Driver ID</CTableHeaderCell>
                  <CTableHeaderCell>Vehicle ID</CTableHeaderCell>
                  <CTableHeaderCell>Location</CTableHeaderCell>
                  <CTableHeaderCell>Severity</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {incidents.map((item) => (
                  <CTableRow key={item.incidentId}>
                    <CTableDataCell>{item.incidentId}</CTableDataCell>
                    <CTableDataCell>
                        {new Date(item.incidentDateTime).toLocaleString()}
                    </CTableDataCell>
                    <CTableDataCell>{item.incidentType}</CTableDataCell>
                    <CTableDataCell>{item.driverId}</CTableDataCell>
                    <CTableDataCell>{item.vehicleId}</CTableDataCell>
                    <CTableDataCell>{item.incidentLocation}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getSeverityBadge(item.incidentSeverity)}>
                        {item.incidentSeverity}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton color="info" size="sm" variant="ghost" className="me-2" onClick={() => openEditModal(item)}>
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton color="danger" size="sm" variant="ghost" onClick={() => handleDelete(item.incidentId)}>
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      {/* --- MODAL --- */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{editMode ? 'Edit Incident' : 'Log New Incident'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormLabel>Driver</CFormLabel>
                    <CFormSelect name="driverId" value={formData.driverId} onChange={handleInputChange} required>
                        <option value="">Select Driver</option>
                        {drivers.map((d, index) => (
                            <option 
                                key={d.driver_id || d.driverId || index} 
                                value={d.driver_id || d.driverId}
                            >
                                {d.first_name || d.firstName} {d.last_name || d.lastName} ({d.license_num || d.licenseNum})
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={6}>
                    <CFormLabel>Vehicle</CFormLabel>
                    <CFormSelect name="vehicleId" value={formData.vehicleId} onChange={handleInputChange} required>
                        <option value="">Select Vehicle</option>
                        {vehicles.map((v, index) => (
                            <option 
                                key={v.vehicle_id || v.vehicleId || index} 
                                value={v.vehicle_id || v.vehicleId}
                            >
                                {v.plate_number || v.plateNumber} - {v.model}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
            </CRow>

            <CRow className="mb-3">
                <CCol md={6}>
                    <CFormLabel>Incident Type</CFormLabel>
                    <CFormInput 
                        placeholder="e.g., Collision, Breakdown, Theft"
                        name="incidentType" 
                        value={formData.incidentType} 
                        onChange={handleInputChange} 
                        required 
                    />
                </CCol>
                <CCol md={6}>
                    <CFormLabel>Date & Time</CFormLabel>
                    <CFormInput 
                        type="datetime-local"
                        name="incidentDateTime" 
                        value={formData.incidentDateTime} 
                        onChange={handleInputChange} 
                        required 
                    />
                </CCol>
            </CRow>

            <div className="mb-3">
                <CFormLabel>Location</CFormLabel>
                <CFormInput 
                    placeholder="e.g., EDSA cor. Ayala Ave"
                    name="incidentLocation" 
                    value={formData.incidentLocation} 
                    onChange={handleInputChange} 
                    required 
                />
            </div>

            <div className="mb-3">
              <CFormLabel>Severity</CFormLabel>
              <CFormSelect name="incidentSeverity" value={formData.incidentSeverity} onChange={handleInputChange}>
                <option value="Minor">Minor (Scratch/Dent)</option>
                <option value="Moderate">Moderate (Requires Repair)</option>
                <option value="Major">Major (Totaled/Injury)</option>
              </CFormSelect>
            </div>

          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            {editMode ? 'Update Log' : 'Save Log'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default IncidentLogs