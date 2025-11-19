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
  CAlert,
  CInputGroup,
  CInputGroupText,
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilCheckCircle, cilX, cilSortAlphaDown } from '@coreui/icons'

const MaintenanceLogs = () => {
  const [maintenanceLogs, setMaintenanceLogs] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [parts, setParts] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState(null)
  const [selectedParts, setSelectedParts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Toolbar state
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: '' })
  const [sortConfig, setSortConfig] = useState({ key: 'maintenanceId', direction: 'asc' })

  // Default Form State
  const initialFormState = {
    vehicleId: '',
    dateTimeStart: '',
    description: '',
    status: 'Ongoing'
  }

  const [formData, setFormData] = useState(initialFormState)

  // --- Fetch All Data ---
  const fetchAllData = async () => {
    setLoading(true)
    try {
      // Keep your existing endpoints (they look like hashed routes in your app)
      const mainRes = await fetch('http://localhost:3000/#/maintenancelogs')
      if (mainRes.ok) {
        const data = await mainRes.json()
        setMaintenanceLogs(Array.isArray(data) ? data : [])
      } else {
        // fallback to empty
        setMaintenanceLogs([])
      }

      const vehRes = await fetch('http://localhost:3000/#/vehicle')
      if (vehRes.ok) {
        const data = await vehRes.json()
        setVehicles(Array.isArray(data) ? data : [])
      }

      const partsRes = await fetch('http://localhost:3000/#/parts')
      if (partsRes.ok) {
        const data = await partsRes.json()
        setParts(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // --- Input Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleSortDirection = () => {
    setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))
  }

  // --- Parts handlers (unchanged semantics) ---
  const handleAddPart = () => {
    setSelectedParts(prev => ([...prev, { partId: '', quantityUsed: 1 }]))
  }

  const handleRemovePart = (index) => {
    setSelectedParts(prev => prev.filter((_, i) => i !== index))
  }

  const handlePartChange = (index, field, value) => {
    setSelectedParts(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  // --- Modal open / edit / add ---
  const openAddModal = () => {
    setEditMode(false)
    setFormData(initialFormState)
    setSelectedParts([])
    setError('')
    setModalVisible(true)
  }

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

    // fetch parts
    fetchMaintenanceParts(mainId)
    setModalVisible(true)
  }

  const fetchMaintenanceParts = async (maintenanceId) => {
    try {
      const response = await fetch(`http://localhost:3000/#/maintenancelogs/${maintenanceId}/parts`)
      if (response.ok) {
        const partsData = await response.json()
        const formatted = Array.isArray(partsData)
          ? partsData.filter(p => p.partId != null).map(p => ({
              partId: p.partId,
              quantityUsed: p.quantityUsed || 0
            }))
          : []
        setSelectedParts(formatted)
      } else {
        setSelectedParts([])
      }
    } catch (err) {
      console.error('Error fetching maintenance parts:', err)
    }
  }

  // --- Submit (add/update) ---
  const handleSubmit = async () => {
    setError('')

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

    const formattedParts = selectedParts
      .filter(p => p.partId && Number(p.quantityUsed) > 0)
      .map(p => ({ partId: parseInt(p.partId), quantityUsed: parseInt(p.quantityUsed) }))

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
        method,
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
    } catch (err) {
      console.error('Error saving maintenance:', err)
      setError('Error saving maintenance: ' + err.message)
    }
  }

  // --- Actions: complete / cancel / delete ---
  const handleComplete = async (id) => {
    const dateTimeCompleted = new Date().toISOString().slice(0, 19).replace('T', ' ')
    try {
      const response = await fetch(
        `http://localhost:3000/#/maintenancelogs/complete/${id}?dateTimeCompleted=${encodeURIComponent(dateTimeCompleted)}`,
        { method: 'PUT' }
      )
      if (response.ok) fetchAllData()
      else alert('Failed to complete maintenance')
    } catch (err) {
      console.error('Error completing maintenance:', err)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this maintenance? Parts will be restocked.')) return
    try {
      const response = await fetch(`http://localhost:3000/#/maintenancelogs/cancel/${id}`, { method: 'PUT' })
      if (response.ok) fetchAllData()
    } catch (err) {
      console.error('Error cancelling maintenance:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this maintenance log?')) return
    try {
      const response = await fetch(`http://localhost:3000/#/maintenancelogs/delete/${id}`, { method: 'DELETE' })
      if (response.ok) fetchAllData()
    } catch (err) {
      console.error('Error deleting maintenance:', err)
    }
  }

  // --- Helpers ---
  const getPartName = (id) => {
    if (!id) return ''
    const part = parts.find(p => (p.partId || p.part_id) == id)
    return part ? part.partName || part.part_name : `ID: ${id}`
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Ongoing': return 'warning'
      case 'Completed': return 'success'
      case 'Cancelled': return 'danger'
      default: return 'secondary'
    }
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleString()
    } catch {
      return dateStr
    }
  }

  // Status ordering for sorting: Ongoing -> Completed -> Cancelled
  const getStatusOrder = (status) => {
    switch (status) {
      case 'Ongoing': return 1
      case 'Completed': return 2
      case 'Cancelled': return 3
      default: return 99
    }
  }

  // --- Processed list (search + filter + sort) ---
  const processedMaintenanceLogs = useMemo(() => {
    let result = Array.isArray(maintenanceLogs) ? [...maintenanceLogs] : []

    // Search: only on description (user requested)
    if (search && search.trim() !== '') {
      const lower = search.toLowerCase()
      result = result.filter(item => (item.description || '').toLowerCase().includes(lower))
    }

    // Filter by status
    if (filters.status) {
      result = result.filter(item => String(item.status) === String(filters.status))
    }

    // Sorting
    result.sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1
      const key = sortConfig.key

      if (key === 'maintenanceId') {
        const na = Number(a.maintenanceId || a.maintenance_id) || 0
        const nb = Number(b.maintenanceId || b.maintenance_id) || 0
        return (na - nb) * dir
      }

      if (key === 'dateTimeStart' || key === 'dateTimeCompleted') {
        const aVal = (a[key] || a[key === 'dateTimeStart' ? 'date_time_start' : 'date_time_completed'] || '') + ''
        const bVal = (b[key] || b[key === 'dateTimeStart' ? 'date_time_start' : 'date_time_completed'] || '') + ''
        // compare ISO-like strings lexicographically (fallback to localeCompare)
        return (aVal.toString().localeCompare(bVal.toString())) * dir
      }

      if (key === 'status') {
        const oa = getStatusOrder(a.status)
        const ob = getStatusOrder(b.status)
        return (oa - ob) * dir
      }

      // default fallback: string compare
      const aVal = (a[key] || '').toString().toLowerCase()
      const bVal = (b[key] || '').toString().toLowerCase()
      return aVal.localeCompare(bVal) * dir
    })

    return result
  }, [maintenanceLogs, search, filters, sortConfig, parts])

  // --- Render ---
  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Maintenance Logs</strong>
        <CButton color="primary" className="float-end" size="sm" onClick={openAddModal}>
          <CIcon icon={cilPlus} className="me-2" />
          Schedule Maintenance
        </CButton>
      </CCardHeader>

      <CCardBody>
        {/* Toolbar: Search / Filter / Sort */}
        <CRow className="mb-3 g-3">
          <CCol md={4}>
            <CFormLabel className="small text-muted">Search Description</CFormLabel>
            <CInputGroup>
              <CInputGroupText>🔎</CInputGroupText>
              <CFormInput
                placeholder="Search description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </CInputGroup>
          </CCol>

          <CCol md={3}>
            <CFormLabel className="small text-muted">Filter by Status</CFormLabel>
            <CFormSelect name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </CFormSelect>
          </CCol>

          <CCol md={4}>
            <CFormLabel className="small text-muted">Sort By</CFormLabel>
            <CInputGroup>
              <CInputGroupText><CIcon icon={cilSortAlphaDown} /></CInputGroupText>
              <CFormSelect
                value={sortConfig.key}
                onChange={(e) => setSortConfig(prev => ({ ...prev, key: e.target.value }))}
              >
                <option value="maintenanceId">ID</option>
                <option value="dateTimeStart">Start Date/Time</option>
                <option value="dateTimeCompleted">Completed Date/Time</option>
                <option value="status">Status (Ongoing → Completed → Cancelled)</option>
              </CFormSelect>
              <CButton color="secondary" variant="outline" onClick={toggleSortDirection}>
                {sortConfig.direction === 'asc' ? '⬆' : '⬇'}
              </CButton>
            </CInputGroup>
          </CCol>
        </CRow>

        {/* Table */}
        {loading ? (
          <div className="text-center"><CSpinner /><p>Loading maintenance logs...</p></div>
        ) : (
          <CTable hover bordered responsive style={{ textAlign: 'left' }}>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Vehicle (ID)</CTableHeaderCell>
                <CTableHeaderCell>Start Date/Time</CTableHeaderCell>
                <CTableHeaderCell>Completed Date/Time</CTableHeaderCell>
                <CTableHeaderCell>Description</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {processedMaintenanceLogs.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan="7" className="text-center">No maintenance logs found.</CTableDataCell>
                </CTableRow>
              ) : (
                processedMaintenanceLogs.map(item => {
                  const id = item.maintenanceId || item.maintenance_id
                  const vehicleId = item.vehicleId || item.vehicle_id || ''
                  return (
                    <CTableRow key={id}>
                      <CTableDataCell>{id}</CTableDataCell>
                      <CTableDataCell>{vehicleId}</CTableDataCell>
                      <CTableDataCell>{formatDateTime(item.dateTimeStart || item.date_time_start)}</CTableDataCell>
                      <CTableDataCell>{formatDateTime(item.dateTimeCompleted || item.date_time_completed)}</CTableDataCell>
                      <CTableDataCell>{item.description || 'N/A'}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={getStatusBadge(item.status)}>{item.status}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        {item.status === 'Ongoing' && (
                          <>
                            <CButton
                              color="success"
                              size="sm"
                              variant="ghost"
                              className="me-2"
                              onClick={() => handleComplete(id)}
                              title="Complete"
                            >
                              <CIcon icon={cilCheckCircle} />
                            </CButton>
                            <CButton
                              color="warning"
                              size="sm"
                              variant="ghost"
                              className="me-2"
                              onClick={() => handleCancel(id)}
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
                          onClick={() => handleDelete(id)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>

      {/* Modal (keeps your original fields/layout, visually polished) */}
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
                  // show raw vehicleId when editing (per your choice D)
                  <CFormInput type="text" value={(formData.vehicleId || '')} disabled />
                ) : (
                  <CFormSelect name="vehicleId" value={formData.vehicleId || ''} onChange={handleInputChange} required>
                    <option value="">Select Vehicle</option>
                    {vehicles
                      .filter(v => v.status === 'available')
                      .map((v, index) => (
                        <option
                          key={v.vehicleId || v.vehicle_id || index}
                          value={v.vehicleId || v.vehicle_id}
                        >
                          {/* Keep human-friendly labels in select, even though table shows ID only */}
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
                <CFormSelect name="status" value={formData.status || 'Ongoing'} onChange={handleInputChange}>
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
                          <option key={p.partId || p.part_id || pIndex} value={p.partId || p.part_id}>
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
                      <CButton color="danger" size="sm" onClick={() => handleRemovePart(index)}>
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
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSubmit}>{editMode ? 'Update Log' : 'Save Log'}</CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default MaintenanceLogs
