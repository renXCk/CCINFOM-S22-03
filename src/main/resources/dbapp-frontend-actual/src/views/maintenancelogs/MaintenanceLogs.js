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
  CBadge,
  CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilCheckCircle, cilX } from '@coreui/icons'

const MaintenanceLogs = () => {
  const [maintenanceLogs, setMaintenanceLogs] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [parts, setParts] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState(null)
  const [selectedParts, setSelectedParts] = useState([])
  const [error, setError] = useState('')

  // Default Form State
  const initialFormState = {
    vehicleId: '',
    dateTimeStart: '',
    description: '',
    status: 'Ongoing'
  }

  const [formData, setFormData] = useState(initialFormState)

  // --- 1. FETCH DATA ---
  const fetchAllData = async () => {
    try {
      const mainRes = await fetch('http://localhost:3000/#/maintenancelogs')
      if (mainRes.ok) setMaintenanceLogs(await mainRes.json())

      const vehRes = await fetch('http://localhost:3000/#/vehicle')
      if (vehRes.ok) setVehicles(await vehRes.json())

      const partsRes = await fetch('http://localhost:3000/#/parts')
      if (partsRes.ok) setParts(await partsRes.json())

    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
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

  // --- 3. HANDLE PART SELECTION ---
  const handleAddPart = () => {
    setSelectedParts([...selectedParts, { partId: '', quantityUsed: 1 }])
  }

  const handleRemovePart = (index) => {
    setSelectedParts(selectedParts.filter((_, i) => i !== index))
  }

  const handlePartChange = (index, field, value) => {
    const updated = [...selectedParts]
    updated[index][field] = value
    setSelectedParts(updated)
  }

  // --- 4. OPEN ADD MODAL ---
  const openAddModal = () => {
    setEditMode(false)
    setFormData(initialFormState)
    setSelectedParts([])
    setError('')
    setModalVisible(true)
  }

  // --- 5. OPEN EDIT MODAL ---
  const openEditModal = (maintenance) => {
    setEditMode(true)
    setError('')

    const mainId = maintenance.maintenanceId || maintenance.maintenance_id
    setCurrentId(mainId)

    setFormData({
      vehicleId: maintenance.vehicleId || maintenance.vehicle_id || '',
      dateTimeStart: maintenance.dateTimeStart || maintenance.date_time_start || '',
      description: maintenance.description || '',
      status: maintenance.status || 'Ongoing'
    })

    // Fetch parts for this maintenance
    fetchMaintenanceParts(mainId)
    setModalVisible(true)
  }

  // --- 6. FETCH PARTS FOR MAINTENANCE ---
  const fetchMaintenanceParts = async (maintenanceId) => {
    try {
      const response = await fetch(`http://localhost:3000/#/maintenancelogs/${maintenanceId}/parts`)
      if (response.ok) {
        const partsData = await response.json()
        const formatted = partsData
          .filter(p => p.partId != null)
          .map(p => ({
            partId: p.partId,
            quantityUsed: p.quantityUsed || 0
          }))
        setSelectedParts(formatted)
      }
    } catch (error) {
      console.error('Error fetching maintenance parts:', error)
    }
  }

  // --- 7. SUBMIT FORM ---
  const handleSubmit = async () => {
    setError('')

    // Validation
    if (!formData.vehicleId) {
      setError('Please select a vehicle')
      return
    }
    if (!formData.dateTimeStart) {
      setError('Please enter start date/time')
      return
    }

    const url = editMode
      ? 'http://localhost:3000/#/maintenancelogs/update'
      : 'http://localhost:3000/#/maintenancelogs/add'

    const method = editMode ? 'PUT' : 'POST'

    // Format parts data
    const formattedParts = selectedParts
      .filter(p => p.partId && p.quantityUsed > 0)
      .map(p => ({
        partId: parseInt(p.partId),
        quantityUsed: parseInt(p.quantityUsed)
      }))

    const bodyData = editMode
      ? {
          maintenanceId: currentId,
          ...formData
        }
      : {
          log: formData,
          parts: formattedParts.length > 0 ? formattedParts : null
        }

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
        const errorText = await response.text()
        setError(errorText || 'Failed to save maintenance record')
      }
    } catch (error) {
      console.error('Error saving maintenance:', error)
      setError('Error saving maintenance: ' + error.message)
    }
  }

  // --- 8. COMPLETE MAINTENANCE ---
  const handleComplete = async (id) => {
    const dateTimeCompleted = new Date().toISOString().slice(0, 19).replace('T', ' ')

    try {
      const response = await fetch(
        `http://localhost:3000/#/maintenancelogs/complete/${id}?dateTimeCompleted=${encodeURIComponent(dateTimeCompleted)}`,
        { method: 'PUT' }
      )

      if (response.ok) {
        fetchAllData()
      } else {
        alert('Failed to complete maintenance')
      }
    } catch (error) {
      console.error('Error completing maintenance:', error)
    }
  }

  // --- 9. CANCEL MAINTENANCE ---
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this maintenance? Parts will be restocked.')) return

    try {
      const response = await fetch(`http://localhost:3000/#/maintenancelogs/cancel/${id}`, {
        method: 'PUT'
      })
      if (response.ok) {
        fetchAllData()
      }
    } catch (error) {
      console.error('Error canceling maintenance:', error)
    }
  }

  // --- 10. DELETE MAINTENANCE ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this maintenance log?')) return

    try {
      const response = await fetch(`http://localhost:3000/#/maintenancelogs/delete/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchAllData()
      }
    } catch (error) {
      console.error('Error deleting maintenance:', error)
    }
  }

  // --- HELPER: Get Vehicle Info by ID ---
  const getVehicleInfo = (id) => {
    if (!id) return ''
    const veh = vehicles.find(v => (v.vehicleId || v.vehicle_id) == id)
    return veh ? `${veh.plateNumber || veh.plate_number} - ${veh.model}` : `ID: ${id}`
  }

  // --- HELPER: Get Part Name by ID ---
  const getPartName = (id) => {
    if (!id) return ''
    const part = parts.find(p => (p.partId || p.part_id) == id)
    return part ? part.partName || part.part_name : `ID: ${id}`
  }

  // --- HELPER: Status Badge ---
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ongoing': return 'warning'
      case 'Completed': return 'success'
      case 'Cancelled': return 'danger'
      default: return 'secondary'
    }
  }

  // --- HELPER: Format DateTime ---
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleString()
    } catch {
      return dateStr
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Maintenance Logs</strong>
            <CButton color="primary" className="float-end" size="sm" onClick={openAddModal}>
              <CIcon icon={cilPlus} className="me-2" />
              Schedule Maintenance
            </CButton>
          </CCardHeader>

          <CCardBody>
            <CTable hover bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Vehicle</CTableHeaderCell>
                  <CTableHeaderCell>Start Date/Time</CTableHeaderCell>
                  <CTableHeaderCell>Completed Date/Time</CTableHeaderCell>
                  <CTableHeaderCell>Description</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {maintenanceLogs.map((item) => (
                  <CTableRow key={item.maintenanceId || item.maintenance_id}>
                    <CTableDataCell>{item.maintenanceId || item.maintenance_id}</CTableDataCell>
                    <CTableDataCell>{getVehicleInfo(item.vehicleId || item.vehicle_id)}</CTableDataCell>
                    <CTableDataCell>{formatDateTime(item.dateTimeStart || item.date_time_start)}</CTableDataCell>
                    <CTableDataCell>{formatDateTime(item.dateTimeCompleted || item.date_time_completed)}</CTableDataCell>
                    <CTableDataCell>{item.description || 'N/A'}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getStatusBadge(item.status)}>
                        {item.status}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      {item.status === 'Ongoing' && (
                        <>
                          <CButton
                            color="success"
                            size="sm"
                            variant="ghost"
                            className="me-2"
                            onClick={() => handleComplete(item.maintenanceId || item.maintenance_id)}
                            title="Complete"
                          >
                            <CIcon icon={cilCheckCircle} />
                          </CButton>
                          <CButton
                            color="warning"
                            size="sm"
                            variant="ghost"
                            className="me-2"
                            onClick={() => handleCancel(item.maintenanceId || item.maintenance_id)}
                            title="Cancel"
                          >
                            <CIcon icon={cilX} />
                          </CButton>
                        </>
                      )}
                      <CButton
                        color="info"
                        size="sm"
                        variant="ghost"
                        className="me-2"
                        onClick={() => openEditModal(item)}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                        color="danger"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item.maintenanceId || item.maintenance_id)}
                      >
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
          <CModalTitle>{editMode ? 'Edit Maintenance' : 'Schedule New Maintenance'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {error && <CAlert color="danger">{error}</CAlert>}

          <CForm>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Vehicle *</CFormLabel>
                {editMode ? (
                  <CFormInput
                    type="text"
                    value={getVehicleInfo(formData.vehicleId) || ''}
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
                      .filter(v => v.status === 'available')
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

              <CCol md={6}>
                <CFormLabel>Start Date/Time *</CFormLabel>
                <CFormInput
                  type="datetime-local"
                  name="dateTimeStart"
                  value={formData.dateTimeStart ? formData.dateTimeStart.slice(0, 16) : ''}
                  onChange={handleInputChange}
                  required
                  disabled={editMode}
                />
              </CCol>
            </CRow>

            <div className="mb-3">
              <CFormLabel>Description</CFormLabel>
              <CFormInput
                placeholder="e.g., Oil change, brake replacement"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
              />
            </div>

            {editMode && (
              <div className="mb-3">
                <CFormLabel>Status</CFormLabel>
                <CFormSelect
                  name="status"
                  value={formData.status || 'Ongoing'}
                  onChange={handleInputChange}
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </CFormSelect>
              </div>
            )}

            {!editMode && (
              <>
                <hr />
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Parts Used</h6>
                  <CButton color="success" size="sm" onClick={handleAddPart}>
                    <CIcon icon={cilPlus} className="me-1" />
                    Add Part
                  </CButton>
                </div>

                {selectedParts.map((part, index) => (
                  <CRow key={index} className="mb-2">
                    <CCol md={6}>
                      <CFormSelect
                        value={part.partId || ''}
                        onChange={(e) => handlePartChange(index, 'partId', e.target.value)}
                      >
                        <option value="">Select Part</option>
                        {parts.map((p, pIndex) => (
                          <option
                            key={p.partId || p.part_id || pIndex}
                            value={p.partId || p.part_id}
                          >
                            {p.partName || p.part_name} (Stock: {p.stockQty || p.stock_qty})
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="number"
                        placeholder="Quantity"
                        min="1"
                        value={part.quantityUsed || 1}
                        onChange={(e) => handlePartChange(index, 'quantityUsed', e.target.value)}
                      />
                    </CCol>
                    <CCol md={2}>
                      <CButton
                        color="danger"
                        size="sm"
                        onClick={() => handleRemovePart(index)}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CCol>
                  </CRow>
                ))}

                {selectedParts.length === 0 && (
                  <CAlert color="info">No parts selected. Maintenance will be logged without parts.</CAlert>
                )}
              </>
            )}
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

export default MaintenanceLogs
