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
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'

const IncidentLogs = () => {
  const [incidents, setIncidents] = useState([])
  const [drivers, setDrivers] = useState([]) 
  const [vehicles, setVehicles] = useState([]) 
  const [modalVisible, setModalVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState(null)

  // Default Form State
  const initialFormState = {
    driverId: '',
    vehicleId: '',
    incidentType: '',
    incidentLocation: '',
    incidentSeverity: 'Minor'
  }

  const [formData, setFormData] = useState(initialFormState)

  // --- 1. FETCH DATA ---
  const fetchAllData = async () => {
    try {
      const incRes = await fetch('http://localhost:8080/api/incidentlogs/all')
      if (incRes.ok) setIncidents(await incRes.json())

      const drvRes = await fetch('http://localhost:8080/api/drivers/all')
      if (drvRes.ok) setDrivers(await drvRes.json())

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
    
    // FIX: Support both camelCase (from JSON) and snake_case (just in case)
    // This ensures we actually capture the ID regardless of backend format
    const incId = incident.incidentId || incident.incident_id;
    setCurrentId(incId)
    
    setFormData({
      // FIX: Use camelCase first (incident.driverId) to match the Table data
      driverId: incident.driverId || incident.driver_id || '',
      vehicleId: incident.vehicleId || incident.vehicle_id || '',
      incidentType: incident.incidentType || incident.incident_type || '',
      incidentLocation: incident.incidentLocation || incident.incident_location || '',
      incidentSeverity: incident.incidentSeverity || incident.incident_severity || 'Minor'
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
        fetchAllData()
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
    if (!id) return '';
    // Check both camelCase and snake_case properties for the driver object
    const drv = drivers.find(d => (d.driverId || d.driver_id) == id) // using == for loose type comparison (string vs int)
    return drv ? `${drv.firstName || drv.first_name} ${drv.lastName || drv.last_name}` : `ID: ${id}`
  }

  // --- HELPER: Get Vehicle Plate by ID ---
  const getVehiclePlate = (id) => {
    if (!id) return '';
    const veh = vehicles.find(v => (v.vehicleId || v.vehicle_id) == id)
    return veh ? `${veh.plateNumber || veh.plate_number} - ${veh.model}` : `ID: ${id}`
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
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Date/Time</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Driver ID</CTableHeaderCell>
                  <CTableHeaderCell>Driver Name</CTableHeaderCell>
                  <CTableHeaderCell>Vehicle ID</CTableHeaderCell>
                  <CTableHeaderCell>Vehicle Info</CTableHeaderCell>
                  <CTableHeaderCell>Location</CTableHeaderCell>
                  <CTableHeaderCell>Severity</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {incidents.map((item) => (
                  <CTableRow key={item.incidentId || item.incident_id}>
                    <CTableDataCell>{item.incidentId || item.incident_id}</CTableDataCell>
                    <CTableDataCell>
                        {new Date(item.incidentDateTime || item.incident_date_time).toLocaleString()}
                    </CTableDataCell>
                    <CTableDataCell>{item.incidentType || item.incident_type}</CTableDataCell>
                    <CTableDataCell>{item.driverId || item.driver_id}</CTableDataCell>
                    <CTableDataCell>{getDriverName(item.driverId || item.driver_id)}</CTableDataCell>
                    <CTableDataCell>{item.vehicleId || item.vehicle_id}</CTableDataCell>
                    <CTableDataCell>{getVehiclePlate(item.vehicleId || item.vehicle_id)}</CTableDataCell>
                    <CTableDataCell>{item.incidentLocation || item.incident_location}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getSeverityBadge(item.incidentSeverity || item.incident_severity)}>
                        {item.incidentSeverity || item.incident_severity}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton color="info" size="sm" variant="ghost" className="me-2" onClick={() => openEditModal(item)}>
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton color="danger" size="sm" variant="ghost" onClick={() => handleDelete(item.incidentId || item.incident_id)}>
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
                    {editMode ? (
                        <CFormInput 
                            type="text" 
                            // Display the name, but we keep the ID in formData
                            value={getDriverName(formData.driverId) || ''} 
                            disabled 
                        />
                    ) : (
                        <CFormSelect 
                            name="driverId" 
                            value={formData.driverId || ''} 
                            onChange={handleInputChange} 
                            required
                        >
                            <option value="">Select Driver</option>
                            {drivers
                                .filter(d => d.status === 'active') 
                                .map((d, index) => (
                                <option 
                                    key={d.driverId || d.driver_id || index} 
                                    value={d.driverId || d.driver_id}
                                >
                                    {d.firstName || d.first_name} {d.lastName || d.last_name}
                                </option>
                            ))}
                        </CFormSelect>
                    )}
                </CCol>
                <CCol md={6}>
                    <CFormLabel>Vehicle</CFormLabel>
                    {editMode ? (
                        <CFormInput 
                            type="text" 
                            // Display the plate, but we keep the ID in formData
                            value={getVehiclePlate(formData.vehicleId) || ''} 
                            disabled 
                        />
                    ) : (
                        <CFormSelect 
                            name="vehicleId" 
                            value={formData.vehicleId || ''} 
                            onChange={handleInputChange} 
                            required
                        >
                            <option value="">Select Vehicle</option>
                            {vehicles
                                .filter(v => v.status === 'on_trip')
                                .map((v, index) => (
                                <option 
                                    key={v.vehicleId || v.vehicle_id || index} 
                                    value={v.vehicleId || v.vehicle_id}
                                >
                                    {v.plateNumber || v.plate_number} - {v.model}
                                </option>
                            ))}
                        </CFormSelect>
                    )}
                </CCol>
            </CRow>

            <CRow className="mb-3">
                <CCol md={12}>
                    <CFormLabel>Incident Type</CFormLabel>
                    <CFormInput 
                        placeholder="e.g., Collision, Breakdown, Theft"
                        name="incidentType" 
                        value={formData.incidentType || ''} 
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
                    value={formData.incidentLocation || ''} 
                    onChange={handleInputChange} 
                    required 
                    disabled={editMode} 
                />
            </div>

            <div className="mb-3">
              <CFormLabel>Severity</CFormLabel>
              <CFormSelect 
                name="incidentSeverity" 
                value={formData.incidentSeverity || 'Minor'} 
                onChange={handleInputChange}
              >
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