import React, { useEffect, useState, useMemo } from "react";
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CBadge,
  CRow,
  CCol
} from "@coreui/react";
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilPlus, cilFilter, cilSortAlphaDown } from '@coreui/icons';
import axios from "axios";

/* ===========================
   VEHICLE FORM (CHILD)
   =========================== */
function VehicleFormModal({ formData, setFormData, editMode }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <>
      <CFormLabel>Plate Number</CFormLabel>
      <CInputGroup className="mb-3">
        <CInputGroupText>🔢</CInputGroupText>
        <CFormInput
          name="plateNumber"
          placeholder="ABC 123"
          value={formData.plateNumber}
          onChange={handleChange}
        />
      </CInputGroup>

      <CFormLabel>Vehicle Type</CFormLabel>
      <CInputGroup className="mb-3">
        <CInputGroupText>🚛</CInputGroupText>
        <CFormSelect name="vehicleType" value={formData.vehicleType} onChange={handleChange}>
          <option value="motorcycle">Motorcycle</option>
          <option value="sedan">Sedan</option>
          <option value="van">Van</option>
          <option value="truck">Truck</option>
        </CFormSelect>
      </CInputGroup>

      <CFormLabel>Model / Brand</CFormLabel>
      <CInputGroup className="mb-3">
        <CInputGroupText>🚘</CInputGroupText>
        <CFormInput
          name="model"
          placeholder="e.g. Toyota Vios"
          value={formData.model}
          onChange={handleChange}
        />
      </CInputGroup>

      <CFormLabel>Fuel Type</CFormLabel>
      <CInputGroup className="mb-3">
        <CInputGroupText>⛽</CInputGroupText>
        <CFormSelect name="fuelType" value={formData.fuelType} onChange={handleChange}>
          <option value="diesel">Diesel</option>
          <option value="gasoline">Gasoline</option>
        </CFormSelect>
      </CInputGroup>

      <CFormLabel>Status</CFormLabel>
      <CInputGroup className="mb-3">
        <CInputGroupText>⚙️</CInputGroupText>
        <CFormSelect
          name="status"
          value={formData.status}
          onChange={handleChange}
          disabled={formData.status === 'on_trip' || formData.status === 'maintenance'}
        >
          <option value="available">Available</option>
          <option value="inactive">Inactive</option>
          {(formData.status === 'on_trip') && <option value="on_trip">On Trip (System Set)</option>}
          {(formData.status === 'maintenance') && <option value="maintenance">Maintenance (System Set)</option>}
        </CFormSelect>
      </CInputGroup>

      <CFormLabel>Mileage (km)</CFormLabel>
      <CInputGroup className="mb-3">
        <CInputGroupText>📏</CInputGroupText>
        <CFormInput
          type="number"
          name="mileage"
          value={formData.mileage}
          readOnly
          disabled
          style={{ backgroundColor: '#f0f0f0' }}
        />
      </CInputGroup>
    </>
  );
}

/* ===========================
        MAIN PAGE
   =========================== */
const Vehicles = () => {
  const API_URL = "http://localhost:8080/api/vehicles";

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // --- FILTER & SORT STATE ---
  const [filters, setFilters] = useState({
    type: "",
    status: "not_inactive", // Default: Hide inactive vehicles
    fuel: ""
  });

  const [sortConfig, setSortConfig] = useState({
    key: "vehicleId",
    direction: "asc"
  });

  const initialFormState = {
    plateNumber: "",
    vehicleType: "motorcycle",
    model: "",
    fuelType: "diesel",
    status: "available",
    mileage: 0,
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- LOAD DATA ---
  const loadVehicles = async () => {
    setLoading(true);
    try {
      const result = await axios.get(`${API_URL}/all`);
      setVehicles(result.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  // --- LOGIC: FILTERING & SORTING ---
  const processedVehicles = useMemo(() => {
    let result = [...vehicles];

    if (filters.type) {
      result = result.filter(v => v.vehicleType.toLowerCase() === filters.type.toLowerCase());
    }
    if (filters.fuel) {
      result = result.filter(v => v.fuelType.toLowerCase() === filters.fuel.toLowerCase());
    }
    if (filters.status) {
      if (filters.status === "not_inactive") {
        // active only
        result = result.filter(v => v.status.toLowerCase() !== "inactive");
      } else {
        // specific
        result = result.filter(v => v.status.toLowerCase() === filters.status.toLowerCase());
      }
    }

    // 2. Apply Sorting
    result.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle Numbers (ID, Mileage)
      if (typeof aVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      // Handle Strings (Plate, etc)
      aVal = aVal ? aVal.toString().toLowerCase() : "";
      bVal = bVal ? bVal.toString().toLowerCase() : "";

      return sortConfig.direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

    return result;
  }, [vehicles, filters, sortConfig]);


  // --- HANDLERS ---
  const openAddModal = () => {
    setEditMode(false);
    setFormData(initialFormState);
    setVisible(true);
  };

  const openEditModal = (vehicle) => {
    setEditMode(true);
    setCurrentId(vehicle.vehicleId);
    setFormData({
      plateNumber: vehicle.plateNumber,
      vehicleType: vehicle.vehicleType,
      model: vehicle.model,
      fuelType: vehicle.fuelType,
      status: vehicle.status,
      mileage: vehicle.mileage,
    });
    setVisible(true);
  };

  const handleSave = async () => {
    try {
      const url = editMode ? `${API_URL}/update` : `${API_URL}/add`;
      const method = editMode ? 'put' : 'post';
      const body = editMode ? { ...formData, vehicleId: currentId } : formData;

      const response = await axios[method](url, body);

      if (response.data === true) {
        loadVehicles();
        setVisible(false);
        alert(editMode ? "Vehicle updated successfully!" : "Vehicle added successfully!");
      } else {
        alert("Operation failed. Check for duplicate plate numbers or invalid data.");
      }
    } catch (err) {
      console.error("Error saving vehicle:", err);
      alert("Error connecting to server.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      const response = await axios.delete(`${API_URL}/delete/${id}`);
      if (response.status === 200) loadVehicles();
    } catch (err) {
      console.error("Error deleting vehicle:", err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'success';
      case 'on_trip': return 'warning';
      case 'maintenance': return 'danger';
      case 'inactive': return 'secondary';
      default: return 'primary';
    }
  };

  // Helper for filter inputs
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Handler for sorting column headers
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Helper to get the sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕'; // Neutral icon for unsorted columns
    return sortConfig.direction === 'asc' ? '⬆' : '⬇'; // Up/Down arrow for sorted columns
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Vehicles</strong>
        <CButton color="primary" className="float-end btn-sm" onClick={openAddModal}>
            <CIcon icon={cilPlus} className="me-2" />
            Add Vehicle
        </CButton>
      </CCardHeader>

      <CCardBody>
        {/* ===========================
             FILTER & SORT TOOLBAR
           =========================== */}
        <CRow className="mb-4">
          {/* Sort Controls */}
          <CCol md={3}>
            <CFormLabel className="small text-muted">Sort By</CFormLabel>
            <CInputGroup>
              <CInputGroupText><CIcon icon={cilSortAlphaDown} /></CInputGroupText>
              <CFormSelect
                value={sortConfig.key}
                onChange={(e) => setSortConfig({ ...sortConfig, key: e.target.value })}
              >
                <option value="vehicleId">ID</option>
                <option value="plateNumber">Plate Number</option>
                <option value="mileage">Mileage</option>
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

          {/* Filter Controls */}
          <CCol md={3}>
            <CFormLabel className="small text-muted">Filter by Status</CFormLabel>
            <CFormSelect name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">None</option>
              <option value="not_inactive">Hide Inactive</option>
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </CFormSelect>
          </CCol>

          <CCol md={3}>
            <CFormLabel className="small text-muted">Filter by Type</CFormLabel>
            <CFormSelect name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">None</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="sedan">Sedan</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
            </CFormSelect>
          </CCol>

          <CCol md={3}>
            <CFormLabel className="small text-muted">Filter by Fuel</CFormLabel>
            <CFormSelect name="fuel" value={filters.fuel} onChange={handleFilterChange}>
              <option value="">None</option>
              <option value="diesel">Diesel</option>
              <option value="gasoline">Gasoline</option>
            </CFormSelect>
          </CCol>
        </CRow>

        {/* ===========================
                 DATA TABLE
           =========================== */}
        {loading ? (
          <div className="text-center">
            <CSpinner />
            <p>Loading vehicles...</p>
          </div>
        ) : (
          <CTable striped hover responsive bordered className="align-middle">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell onClick={() => handleSort('vehicleId')} style={{ cursor: 'pointer' }}>
                    ID {getSortIcon('vehicleId')}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('plateNumber')} style={{ cursor: 'pointer' }}>
                    Plate No. {getSortIcon('plateNumber')}
                </CTableHeaderCell>
                <CTableHeaderCell>Type</CTableHeaderCell>
                <CTableHeaderCell>Model</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('mileage')} style={{ cursor: 'pointer' }}>
                    Mileage {getSortIcon('mileage')}
                </CTableHeaderCell>
                <CTableHeaderCell>Fuel</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {processedVehicles.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan="8">No vehicles match your filters.</CTableDataCell>
                </CTableRow>
              ) : (
                processedVehicles.map((v) => (
                  <CTableRow key={v.vehicleId}>
                    <CTableDataCell>{v.vehicleId}</CTableDataCell>
                    <CTableDataCell>{v.plateNumber}</CTableDataCell>
                    <CTableDataCell className="text-capitalize">{v.vehicleType}</CTableDataCell>
                    <CTableDataCell>{v.model}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={getStatusBadge(v.status)}>
                          {v.status}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{v.mileage} km</CTableDataCell>
                    <CTableDataCell className="text-capitalize">{v.fuelType}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                          color="info"
                          variant="ghost"
                          size="sm"
                          className="me-2"
                          onClick={() => openEditModal(v)}
                      >
                          <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(v.vehicleId)}
                      >
                          <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>{editMode ? "Edit Vehicle" : "Add New Vehicle"}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <VehicleFormModal
            formData={formData}
            setFormData={setFormData}
            editMode={editMode}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSave}>Save Changes</CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default Vehicles;
