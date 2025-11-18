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

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState(null)

  // Default Form State (Matches your Business Rules)
  const initialFormState = {
    plateNumber: '',
    vehicleType: 'motorcycle', // Default valid enum
    model: '',
    fuelType: 'diesel',        // Default valid enum (No Electric)
    status: 'available',
    mileage: 0                 // Default mileage 0
  }

  const [formData, setFormData] = useState(initialFormState)

  // --- 1. FETCH DATA ---
  const fetchVehicles = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/vehicles/all')
      const data = await response.json()
      setVehicles(data)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  // --- 2. HANDLE INPUT CHANGES ---
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // --- 3. OPEN ADD MODAL ---
  const openAddModal = () => {
    setEditMode(false)
    setFormData(initialFormState) // Resets to blank/defaults
    setModalVisible(true)
  }

  // --- 4. OPEN EDIT MODAL ---
  const openEditModal = (vehicle) => {
    setEditMode(true)
    setCurrentId(vehicle.vehicleId)
    setFormData({
      plateNumber: vehicle.plateNumber,
      vehicleType: vehicle.vehicleType,
      model: vehicle.model,
      fuelType: vehicle.fuelType,
      status: vehicle.status,
      mileage: vehicle.mileage
    })
    setModalVisible(true)
  }

  // --- 5. SUBMIT FORM ---
  const handleSubmit = async () => {
    const url = editMode
      ? 'http://localhost:8080/api/vehicles/update'
      : 'http://localhost:8080/api/vehicles/add'

    const method = editMode ? 'PUT' : 'POST'

    const bodyData = editMode
      ? { ...formData, vehicleId: currentId }
      : formData

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })

      if (response.ok) {
        setModalVisible(false)
        fetchVehicles()
      } else {
        alert('Failed to save vehicle')
      }
    } catch (error) {
      console.error('Error saving vehicle:', error)
    }
  }

  // --- 6. DELETE VEHICLE ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return

    try {
      const response = await fetch(`http://localhost:8080/api/vehicles/delete/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchVehicles()
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available': return 'success'
      case 'on_trip': return 'warning'
      case 'maintenance': return 'danger'
      case 'inactive': return 'secondary'
      default: return 'primary'
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Vehicle Fleet</strong>
            <CButton color="primary" className="float-end" size="sm" onClick={openAddModal}>
              <CIcon icon={cilPlus} className="me-2" />
              Add Vehicle
            </CButton>
          </CCardHeader>

          <CCardBody>
            <CTable hover bordered responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Plate No.</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Model</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Mileage</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {vehicles.map((item) => (
                  <CTableRow key={item.vehicleId}>
                    <CTableDataCell>{item.plateNumber}</CTableDataCell>
                    <CTableDataCell className="text-capitalize">{item.vehicleType}</CTableDataCell>
                    <CTableDataCell>{item.model}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getStatusBadge(item.status)}>
                        {item.status}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{item.mileage} km</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="info" size="sm" variant="ghost" className="me-2" onClick={() => openEditModal(item)}>
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton color="danger" size="sm" variant="ghost" onClick={() => handleDelete(item.vehicleId)}>
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
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>{editMode ? 'Edit Vehicle' : 'Add New Vehicle'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {/* Plate Number: Editable Always */}
            <div className="mb-3">
              <CFormLabel>Plate Number</CFormLabel>
              <CFormInput name="plateNumber" value={formData.plateNumber} onChange={handleInputChange} />
            </div>

            {/* Model: Editable Always */}
            <div className="mb-3">
              <CFormLabel>Model</CFormLabel>
              <CFormInput name="model" value={formData.model} onChange={handleInputChange} />
            </div>

            {/* Type: Editable Always */}
            <div className="mb-3">
              <CFormLabel>Type</CFormLabel>
              <CFormSelect name="vehicleType" value={formData.vehicleType} onChange={handleInputChange}>
                <option value="motorcycle">Motorcycle</option>
                <option value="sedan">Sedan</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
              </CFormSelect>
            </div>

            {/* Status: Editable, but restricted options */}
            <div className="mb-3">
              <CFormLabel>Status</CFormLabel>
              <CFormSelect name="status" value={formData.status} onChange={handleInputChange}>
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
                {/* 'on_trip' is excluded as it should be set by Trip transactions */}
              </CFormSelect>
            </div>

            {/* Fuel Type: DISABLED IN EDIT MODE. No Electric. */}
            <div className="mb-3">
              <CFormLabel>Fuel Type</CFormLabel>
              <CFormSelect
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
                disabled={editMode} // Cannot change fuel type after creation
              >
                <option value="diesel">Diesel</option>
                <option value="gasoline">Gasoline</option>
              </CFormSelect>
            </div>

            {/* Mileage: DISABLED IN EDIT MODE. Default 0. */}
            <div className="mb-3">
              <CFormLabel>Mileage</CFormLabel>
              <CFormInput
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleInputChange}
                disabled={editMode} // Cannot manually edit mileage here (must use Trip logs)
              />
            </div>

          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            {editMode ? 'Update Vehicle' : 'Save Vehicle'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Vehicles
