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

const Drivers = () => {
  const [drivers, setDrivers] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState(null)

  // Default Form State (Matches your SQL Schema)
  const initialFormState = {
    firstName: '',
    lastName: '',
    licenseNum: '',
    contactNum: '',
    email: '',
    status: 'active',     // Default valid enum
    completedTrips: 0     // Default 0
  }

  const [formData, setFormData] = useState(initialFormState)

  // --- 1. FETCH DATA ---
  const fetchDrivers = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/drivers/all')
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      setDrivers(data)
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  useEffect(() => {
    fetchDrivers()
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
  const openEditModal = (driver) => {
    setEditMode(true)
    setCurrentId(driver.driverId)
    setFormData({
      firstName: driver.firstName,
      lastName: driver.lastName,
      licenseNum: driver.licenseNum,
      contactNum: driver.contactNum,
      email: driver.email,
      status: driver.status,
      completedTrips: driver.completedTrips
    })
    setModalVisible(true)
  }

  // --- 5. SUBMIT FORM ---
  const handleSubmit = async () => {
    const url = editMode
      ? 'http://localhost:8080/api/drivers/update'
      : 'http://localhost:8080/api/drivers/add'

    const method = editMode ? 'PUT' : 'POST'

    const bodyData = editMode
      ? { ...formData, driverId: currentId }
      : formData

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      })

      if (response.ok) {
        setModalVisible(false)
        fetchDrivers()
      } else {
        alert('Failed to save driver')
      }
    } catch (error) {
      console.error('Error saving driver:', error)
    }
  }

  // --- 6. DELETE DRIVER ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return

    try {
      const response = await fetch(`http://localhost:8080/api/drivers/delete/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchDrivers()
      }
    } catch (error) {
      console.error('Error deleting driver:', error)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'secondary'
      case 'suspended': return 'danger'
      default: return 'primary'
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Driver Management</strong>
            <CButton color="primary" className="float-end" size="sm" onClick={openAddModal}>
              <CIcon icon={cilPlus} className="me-2" />
              Add Driver
            </CButton>
          </CCardHeader>

          <CCardBody>
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>License No.</CTableHeaderCell>
                  <CTableHeaderCell>Contact Info</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Trips</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {drivers.map((item) => (
                  <CTableRow key={item.driverId}>
                    <CTableDataCell>{item.driverId}</CTableDataCell>
                    <CTableDataCell>
                      {item.firstName} {item.lastName}
                    </CTableDataCell>
                    <CTableDataCell>{item.licenseNum}</CTableDataCell>
                    <CTableDataCell>
                      <div><small>{item.contactNum}</small></div>
                      <div className="text-muted"><small>{item.email}</small></div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getStatusBadge(item.status)}>
                        {item.status}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{item.completedTrips}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="info" size="sm" variant="ghost" className="me-2" onClick={() => openEditModal(item)}>
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton color="danger" size="sm" variant="ghost" onClick={() => handleDelete(item.driverId)}>
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
          <CModalTitle>{editMode ? 'Edit Driver' : 'Add New Driver'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {/* Name Fields */}
            <CRow className="mb-3">
              <CCol>
                <CFormLabel>First Name</CFormLabel>
                <CFormInput name="firstName" value={formData.firstName} onChange={handleInputChange} required />
              </CCol>
              <CCol>
                <CFormLabel>Last Name</CFormLabel>
                <CFormInput name="lastName" value={formData.lastName} onChange={handleInputChange} required />
              </CCol>
            </CRow>

            {/* License Number */}
            <div className="mb-3">
              <CFormLabel>License Number</CFormLabel>
              <CFormInput name="licenseNum" value={formData.licenseNum} onChange={handleInputChange} required />
            </div>

            {/* Contact Information */}
            <div className="mb-3">
              <CFormLabel>Contact Number</CFormLabel>
              <CFormInput name="contactNum" value={formData.contactNum} onChange={handleInputChange} />
            </div>

            <div className="mb-3">
              <CFormLabel>Email Address</CFormLabel>
              <CFormInput type="email" name="email" value={formData.email} onChange={handleInputChange} />
            </div>

            {/* Status: Enum Options */}
            <div className="mb-3">
              <CFormLabel>Status</CFormLabel>
              <CFormSelect name="status" value={formData.status} onChange={handleInputChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </CFormSelect>
            </div>

            {/* Completed Trips: Disabled in Edit Mode */}
            <div className="mb-3">
              <CFormLabel>Completed Trips</CFormLabel>
              <CFormInput
                type="number"
                name="completedTrips"
                value={formData.completedTrips}
                onChange={handleInputChange}
                disabled={editMode}
              />
            </div>

          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            {editMode ? 'Update Driver' : 'Save Driver'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Drivers