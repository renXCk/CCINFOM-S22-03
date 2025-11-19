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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CBadge,
  CInputGroup,
  CInputGroupText
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilPencil, 
  cilTrash, 
  cilPlus, 
  cilFilter, 
  cilSortNumericDown, 
  cilSortNumericUp,
  cilUser,
  cilCarAlt,
  cilWarning 
} from '@coreui/icons'

const IncidentLogs = () => {
  const [incidents, setIncidents] = useState([])
  const [drivers, setDrivers] = useState([]) 
  const [vehicles, setVehicles] = useState([]) 
  const [modalVisible, setModalVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState(null)

  // --- FILTER & SORT STATE ---
  const [filterDriver, setFilterDriver] = useState('All')
  const [filterVehicle, setFilterVehicle] = useState('All')
  const [filterSeverity, setFilterSeverity] = useState('All')
  const [sortOrder, setSortOrder] = useState('desc') // 'desc' = Latest First

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

  // --- 2. FILTER & SORT LOGIC (useMemo) ---
  const filteredIncidents = useMemo(() => {
    let result = [...incidents];

    // A. Filtering
    result = result.filter(item => {
      const dId = item.driverId || item.driver_id;
      const vId = item.vehicleId || item.vehicle_id;
      const severity = item.incidentSeverity || item.incident_severity;

      if (filterDriver !== 'All' && String(dId) !== filterDriver) return false;
      if (filterVehicle !== 'All' && String(vId) !== filterVehicle) return false;
      if (filterSeverity !== 'All' && severity !== filterSeverity) return false;

      return true;
    });

    // B. Sorting (Date)
    result.sort((a, b) => {
      const dateA = new Date(a.incidentDateTime || a.incident_date_time);
      const dateB = new Date(b.incidentDateTime || b.incident_date_time);

      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [incidents, filterDriver, filterVehicle, filterSeverity, sortOrder]);

  // --- 3. HANDLE INPUT CHANGES ---
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // --- 4. OPEN ADD MODAL ---
  const openAddModal = () => {
    setEditMode(false)
    setFormData(initialFormState)
    setModalVisible(true)
  }

  // --- 5. OPEN EDIT MODAL ---
  const openEditModal = (incident) => {
    setEditMode(true)
    
    const incId = incident.incidentId || incident.incident_id;
    setCurrentId(incId)
    
    setFormData({
      driverId: incident.driverId || incident.driver_id || '',
      vehicleId: incident.vehicleId || incident.vehicle_id || '',
      incidentType: incident.incidentType || incident.incident_type || '',
      incidentLocation: incident.incidentLocation || incident.incident_location || '',
      incidentSeverity: incident.incidentSeverity || incident.incident_severity || 'Minor'
    })
    setModalVisible(true)
  }

  // --- 6. SUBMIT FORM ---
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

  // --- 7. DELETE INCIDENT ---
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

  // --- HELPERS ---
  const getDriverName = (id) => {
    if (!id) return '';
    const drv = drivers.find(d => (d.driverId || d.driver_id) == id) 
    return drv ? `${drv.firstName || drv.first_name} ${drv.lastName || drv.last_name}` : `ID: ${id}`
  }

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
            {/* --- FILTER CONTROLS --- */}
            <CRow className="mb-4">
                <CCol md={3}>
                    <CFormLabel className="small text-muted mb-1">Filter by Driver</CFormLabel>
                    <CInputGroup size="sm">
                        <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                        <CFormSelect value={filterDriver} onChange={(e) => setFilterDriver(e.target.value)}>
                            <option value="All">All Drivers</option>
                            {drivers.map(d => (
                                <option key={d.driverId || d.driver_id} value={d.driverId || d.driver_id}>
                                    {d.firstName || d.first_name} {d.lastName || d.last_name}
                                </option>
                            ))}
                        </CFormSelect>
                    </CInputGroup>
                </CCol>

                <CCol md={3}>
                    <CFormLabel className="small text-muted mb-1">Filter by Vehicle</CFormLabel>
                    <CInputGroup size="sm">
                        <CInputGroupText><CIcon icon={cilCarAlt} /></CInputGroupText>
                        <CFormSelect value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)}>
                            <option value="All">All Vehicles</option>
                            {vehicles.map(v => (
                                <option key={v.vehicleId || v.vehicle_id} value={v.vehicleId || v.vehicle_id}>
                                    {v.plateNumber || v.plate_number}
                                </option>
                            ))}
                        </CFormSelect>
                    </CInputGroup>
                </CCol>

                <CCol md={3}>
                    <CFormLabel className="small text-muted mb-1">Filter by Severity</CFormLabel>
                    <CInputGroup size="sm">
                        <CInputGroupText><CIcon icon={cilWarning} /></CInputGroupText>
                        <CFormSelect value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                            <option value="All">All Severities</option>
                            <option value="Minor">Minor</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Major">Major</option>
                        </CFormSelect>
                    </CInputGroup>
                </CCol>

                <CCol md={3}>
                    <CFormLabel className="small text-muted mb-1">Sort by Date</CFormLabel>
                    <div className="d-grid">
                        <CButton 
                            color="light" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            className="d-flex justify-content-between align-items-center px-3"
                        >
                            {sortOrder === 'desc' ? 'Latest First' : 'Oldest First'}
                            <CIcon icon={sortOrder === 'desc' ? cilSortNumericDown : cilSortNumericUp} />
                        </CButton>
                    </div>
                </CCol>
            </CRow>
            {/* --- END FILTER CONTROLS --- */}

            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Date/Time</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Driver Name</CTableHeaderCell>
                  <CTableHeaderCell>Vehicle Info</CTableHeaderCell>
                  <CTableHeaderCell>Location</CTableHeaderCell>
                  <CTableHeaderCell>Severity</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredIncidents.length === 0 ? (
                    <CTableRow>
                        <CTableDataCell colSpan="8" className="text-center text-muted">
                            No incidents found matching your filters.
                        </CTableDataCell>
                    </CTableRow>
                ) : (
                    filteredIncidents.map((item) => (
                    <CTableRow key={item.incidentId || item.incident_id}>
                        <CTableDataCell>{item.incidentId || item.incident_id}</CTableDataCell>
                        <CTableDataCell>
                            {new Date(item.incidentDateTime || item.incident_date_time).toLocaleString()}
                        </CTableDataCell>
                        <CTableDataCell>{item.incidentType || item.incident_type}</CTableDataCell>
                        <CTableDataCell>
                            <small className="d-block fw-bold text-secondary">ID: {item.driverId || item.driver_id}</small>
                            {getDriverName(item.driverId || item.driver_id)}
                        </CTableDataCell>
                        <CTableDataCell>
                            <small className="d-block fw-bold text-secondary">ID: {item.vehicleId || item.vehicle_id}</small>
                            {getVehiclePlate(item.vehicleId || item.vehicle_id)}
                        </CTableDataCell>
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
                    ))
                )}
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