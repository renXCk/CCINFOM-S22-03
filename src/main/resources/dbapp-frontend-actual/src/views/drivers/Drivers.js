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
  CSpinner,
  CInputGroup,
  CInputGroupText
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilPencil, 
  cilTrash, 
  cilPlus, 
  cilListRich, 
  cilSortAlphaDown, 
  cilCarAlt,
  cilFilter 
} from '@coreui/icons'

/* ===========================
   DRIVER VEHICLE VIEW (CHILD)
   =========================== */
function DriverVehicleHistory({ drivers }) {
    const [selectedDriverId, setSelectedDriverId] = useState("");
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedDriverId) {
            setVehicles([]);
            return;
        }

        const fetchDriverVehicles = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:8080/api/drivers/vehicledriver?id=${selectedDriverId}`);
                if (response.ok) {
                    const data = await response.json();
                    setVehicles(data);
                }
            } catch (error) {
                console.error("Error fetching driver vehicles:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDriverVehicles();
    }, [selectedDriverId]);

    return (
        <div>
            <div className="mb-4 p-3 bg-secondary rounded-3 shadow-sm text-white">
                <CFormLabel className="fw-semibold mb-2">Select Driver to View History</CFormLabel>
                <CInputGroup>
                    <CInputGroupText><CIcon icon={cilListRich} /></CInputGroupText>
                    <CFormSelect 
                        value={selectedDriverId} 
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                    >
                        <option value="">-- Select a Driver --</option>
                        {drivers.map(d => (
                            <option key={d.driverId} value={d.driverId}>
                                {d.firstName} {d.lastName} (ID: {d.driverId})
                            </option>
                        ))}
                    </CFormSelect>
                </CInputGroup>
            </div>

            {loading ? (
                <div className="text-center p-4">
                    <CSpinner />
                    <p>Loading vehicle history...</p>
                </div>
            ) : (
                <CTable striped hover responsive bordered className="align-middle small">
                    <CTableHead color="dark">
                        <CTableRow>
                            <CTableHeaderCell>Vehicle ID</CTableHeaderCell>
                            <CTableHeaderCell>Plate Number</CTableHeaderCell>
                            <CTableHeaderCell>Model</CTableHeaderCell>
                            <CTableHeaderCell>Type</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {vehicles.length === 0 ? (
                            <CTableRow>
                                <CTableDataCell colSpan="4" className="text-center">
                                    {selectedDriverId ? "No vehicles found for this driver." : "Please select a driver."}
                                </CTableDataCell>
                            </CTableRow>
                        ) : (
                            vehicles.map((v, index) => (
                                <CTableRow key={index}>
                                    <CTableDataCell>{v.vehicleId}</CTableDataCell>
                                    <CTableDataCell className="fw-semibold">{v.plateNumber}</CTableDataCell>
                                    <CTableDataCell>{v.model}</CTableDataCell>
                                    <CTableDataCell className="text-capitalize">{v.vehicleType}</CTableDataCell>
                                </CTableRow>
                            ))
                        )}
                    </CTableBody>
                </CTable>
            )}
        </div>
    );
}

/* ===========================
   MAIN COMPONENT
   =========================== */
const Drivers = () => {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modals
  const [modalVisible, setModalVisible] = useState(false)
  const [historyVisible, setHistoryVisible] = useState(false)
  
  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState(null)

  // NEW: Track the original trip count to enforce increment-only logic
  const [originalTrips, setOriginalTrips] = useState(0)

  // Filter State
  const [statusFilter, setStatusFilter] = useState('All')

  // Sorting State - Default by 'status'
  const [sortConfig, setSortConfig] = useState({
    key: "status",
    direction: "asc"
  })

  // Form State
  const initialFormState = {
    firstName: '',
    lastName: '',
    licenseNum: '',
    contactNum: '',
    email: '',
    status: 'active',
    completedTrips: 0
  }
  const [formData, setFormData] = useState(initialFormState)

  // --- 1. FETCH DATA ---
  const fetchDrivers = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/drivers/all')
      if (!response.ok) throw new Error('Network response was not ok')
      const data = await response.json()
      setDrivers(data)
    } catch (error) {
      console.error('Error fetching drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  // --- 2. FILTERING & SORTING LOGIC ---
  const processedDrivers = useMemo(() => {
    let result = [...drivers];

    // 1. Filter by Status
    if (statusFilter !== 'All') {
        result = result.filter(d => d.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // 2. Sort
    result.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (typeof aVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      aVal = aVal ? aVal.toString().toLowerCase() : "";
      bVal = bVal ? bVal.toString().toLowerCase() : "";

      return sortConfig.direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

    return result;
  }, [drivers, sortConfig, statusFilter]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '⬆' : '⬇';
  };

  // --- 3. FORM HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // ENFORCEMENT: Only allow Increment for Completed Trips in Edit Mode
    if (editMode && name === 'completedTrips') {
        const numValue = parseInt(value, 10);
        
        // If user tries to delete everything (NaN) or go below original, block it
        if (isNaN(numValue) || numValue < originalTrips) {
            return; // Do nothing, effectively rejecting the input
        }
    }

    setFormData({ ...formData, [name]: value });
  }

  const openAddModal = () => {
    setEditMode(false)
    setOriginalTrips(0) // Reset
    setFormData(initialFormState)
    setModalVisible(true)
  }

  const openEditModal = (driver) => {
    setEditMode(true)
    setCurrentId(driver.driverId)
    setOriginalTrips(driver.completedTrips) // Store the original db value
    
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

  const handleSubmit = async () => {
    const url = editMode
      ? 'http://localhost:8080/api/drivers/update'
      : 'http://localhost:8080/api/drivers/add'
    const method = editMode ? 'PUT' : 'POST'
    const bodyData = editMode ? { ...formData, driverId: currentId } : formData

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return
    try {
      const response = await fetch(`http://localhost:8080/api/drivers/delete/${id}`, { method: 'DELETE' })
      if (response.ok) fetchDrivers()
    } catch (error) {
      console.error('Error deleting driver:', error)
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success'
      case 'inactive': return 'secondary'
      case 'suspended': return 'danger'
      default: return 'primary'
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Driver Management</strong>
        <CButton color="primary" className="float-end btn-sm" onClick={openAddModal}>
          <CIcon icon={cilPlus} className="me-2" />
          Add Driver
        </CButton>
        <CButton 
            color="secondary" 
            variant="outline" 
            className="float-end btn-sm me-2"
            onClick={() => setHistoryVisible(true)}
        >
            <CIcon icon={cilListRich} className="me-2" />
            View With Other Records
        </CButton>
      </CCardHeader>

      <CCardBody>
        <CRow className="mb-4">
            {/* FILTER BY STATUS */}
            <CCol md={4}>
                <CFormLabel className="small text-muted">Filter by Status</CFormLabel>
                <CInputGroup>
                    <CInputGroupText><CIcon icon={cilFilter} /></CInputGroupText>
                    <CFormSelect 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </CFormSelect>
                </CInputGroup>
            </CCol>

            {/* SORT OPTIONS */}
            <CCol md={4}>
                <CFormLabel className="small text-muted">Sort Options</CFormLabel>
                <CInputGroup>
                    <CInputGroupText><CIcon icon={cilSortAlphaDown} /></CInputGroupText>
                    <CFormSelect 
                        value={sortConfig.key} 
                        onChange={(e) => setSortConfig({ ...sortConfig, key: e.target.value })}
                    >
                        <option value="driverId">ID</option>
                        <option value="status">Status</option>
                        <option value="completedTrips">Completed Trips</option>
                    </CFormSelect>
                    <CButton 
                        color="secondary" 
                        variant="outline"
                        onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                    >
                        {sortConfig.direction === 'asc' ? '⬆' : '⬇'}
                    </CButton>
                </CInputGroup>
            </CCol>
        </CRow>

        {loading ? (
            <div className="text-center">
                <CSpinner />
                <p>Loading drivers...</p>
            </div>
        ) : (
            <CTable striped hover responsive bordered className="align-middle">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell onClick={() => handleSort('driverId')} style={{ cursor: 'pointer' }}>
                      ID {getSortIcon('driverId')}
                  </CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>License No.</CTableHeaderCell>
                  <CTableHeaderCell>Contact Info</CTableHeaderCell>
                  <CTableHeaderCell onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                      Status {getSortIcon('status')}
                  </CTableHeaderCell>
                  <CTableHeaderCell onClick={() => handleSort('completedTrips')} style={{ cursor: 'pointer' }}>
                      Trips {getSortIcon('completedTrips')}
                  </CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {processedDrivers.map((item) => (
                  <CTableRow key={item.driverId}>
                    <CTableDataCell>{item.driverId}</CTableDataCell>
                    <CTableDataCell>{item.firstName} {item.lastName}</CTableDataCell>
                    <CTableDataCell>{item.licenseNum}</CTableDataCell>
                    <CTableDataCell>
                      <div><small>{item.contactNum}</small></div>
                      <div className="text-muted"><small>{item.email}</small></div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getStatusBadge(item.status)}>{item.status}</CBadge>
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
        )}
      </CCardBody>

      {/* --- CRUD MODAL --- */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>{editMode ? 'Edit Driver' : 'Add New Driver'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-3">
              <CCol>
                <CFormLabel>First Name</CFormLabel>
                <CFormInput 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange} 
                  required 
                  disabled={editMode} 
                />
              </CCol>
              <CCol>
                <CFormLabel>Last Name</CFormLabel>
                <CFormInput 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange} 
                  required 
                  disabled={editMode} 
                />
              </CCol>
            </CRow>
            <div className="mb-3">
              <CFormLabel>License Number</CFormLabel>
              <CFormInput 
                name="licenseNum" 
                value={formData.licenseNum} 
                onChange={handleInputChange} 
                required 
                disabled={editMode} 
              />
            </div>
            
            {/* EDITABLE FIELDS */}
            <div className="mb-3">
              <CFormLabel>Contact Number</CFormLabel>
              <CFormInput name="contactNum" value={formData.contactNum} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
              <CFormLabel>Email Address</CFormLabel>
              <CFormInput type="email" name="email" value={formData.email} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
              <CFormLabel>Status</CFormLabel>
              <CFormSelect name="status" value={formData.status} onChange={handleInputChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </CFormSelect>
            </div>
            <div className="mb-3">
              <CFormLabel>Completed Trips</CFormLabel>
              <CFormInput 
                type="number" 
                name="completedTrips" 
                value={formData.completedTrips} 
                onChange={handleInputChange} 
                min={editMode ? originalTrips : 0} // HTML5 constraint
              />
              {editMode && (
                <small className="text-muted">
                  * You can only increase completed trips.
                </small>
              )}
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSubmit}>{editMode ? 'Update Driver' : 'Save Driver'}</CButton>
        </CModalFooter>
      </CModal>

      {/* --- HISTORY/RELATED RECORDS MODAL --- */}
      <CModal size="xl" visible={historyVisible} onClose={() => setHistoryVisible(false)}>
        <CModalHeader className="bg-dark text-white">
          <CModalTitle><CIcon icon={cilCarAlt} className="me-2" />Driver Vehicle History</CModalTitle>
        </CModalHeader>
        <CModalBody className="bg-dark text-white">
            <DriverVehicleHistory drivers={drivers} />
        </CModalBody>
        <CModalFooter className="bg-dark">
          <CButton color="secondary" onClick={() => setHistoryVisible(false)}>Close</CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default Drivers