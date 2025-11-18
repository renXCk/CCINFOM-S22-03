import React, { useEffect, useState } from "react";
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
  CCol,
  CRow,
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
  CForm
} from "@coreui/react";
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash, cilPlus, cilDrop, cilUser, cilTruck } from '@coreui/icons';
import axios from "axios";

/* ===========================
   FUEL LOG FORM (CHILD COMPONENT)
   =========================== */
function FuelLogFormModal({ formData, setFormData, vehicles, drivers }) {

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // BUSINESS RULE: Fuel Type must match Vehicle
      // If user changes Vehicle, find that vehicle and auto-set the fuel type
      if (name === "vehicleId") {
        const selectedVehicle = vehicles.find(v => v.vehicleId.toString() === value);
        if (selectedVehicle) {
          updated.fuelType = selectedVehicle.fuelType;
        } else {
          updated.fuelType = "";
        }
      }
      return updated;
    });
  };

  // Calculate total cost for display (Liters * Price)
  const totalCost = (parseFloat(formData.litersFilled) || 0) * (parseFloat(formData.pricePerLiter) || 0);

  return (
    <CForm>
      <CRow className="mb-3">
        <CCol md={6}>
            <CFormLabel>Vehicle (Available or On Trip)</CFormLabel>
            <CInputGroup>
                <CInputGroupText><CIcon icon={cilTruck}/></CInputGroupText>
                <CFormSelect
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                >
                <option value="">Select Vehicle...</option>
                {vehicles
                    // BUSINESS RULE: Fuel logs can only be recorded if vehicle is 'available' or 'on_trip'
                    .filter(v => v.status && (v.status.toLowerCase() === 'available' || v.status.toLowerCase() === 'on_trip'))
                    .map(v => (
                    <option key={v.vehicleId} value={v.vehicleId}>
                    {v.plateNumber} ({v.model}) - {v.fuelType}
                    </option>
                ))}
                </CFormSelect>
            </CInputGroup>
        </CCol>
        <CCol md={6}>
             <CFormLabel>Driver</CFormLabel>
            <CInputGroup>
                <CInputGroupText><CIcon icon={cilUser}/></CInputGroupText>
                <CFormSelect
                name="driverId"
                value={formData.driverId}
                onChange={handleChange}
                >
                <option value="">Select Driver...</option>
                {drivers.map(d => (
                    <option key={d.driverId} value={d.driverId}>
                    {d.firstName} {d.lastName} ({d.licenseNum})
                    </option>
                ))}
                </CFormSelect>
            </CInputGroup>
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
            <CFormLabel>Date & Time</CFormLabel>
            <CInputGroup>
                <CInputGroupText>📅</CInputGroupText>
                <CFormInput
                type="datetime-local"
                name="fuelDate"
                value={formData.fuelDate}
                onChange={handleChange}
                // BUSINESS RULE: No future dates
                max={new Date().toISOString().slice(0, 16)}
                />
            </CInputGroup>
        </CCol>
        <CCol md={6}>
            <CFormLabel>Fuel Type (Auto-set)</CFormLabel>
            <CInputGroup>
                <CInputGroupText>⛽</CInputGroupText>
                <CFormInput
                name="fuelType"
                value={formData.fuelType}
                readOnly
                disabled
                style={{ backgroundColor: '#e9ecef', textTransform: 'capitalize' }}
                placeholder="Select a vehicle first"
                />
            </CInputGroup>
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
            <CFormLabel>Liters Filled</CFormLabel>
            <CInputGroup>
                <CInputGroupText><CIcon icon={cilDrop}/></CInputGroupText>
                <CFormInput
                type="number"
                step="0.01"
                name="litersFilled"
                placeholder="0.00"
                value={formData.litersFilled}
                onChange={handleChange}
                />
            </CInputGroup>
        </CCol>
        <CCol md={6}>
             <CFormLabel>Price per Liter</CFormLabel>
            <CInputGroup>
                <CInputGroupText>₱</CInputGroupText>
                <CFormInput
                type="number"
                step="0.01"
                name="pricePerLiter"
                placeholder="0.00"
                value={formData.pricePerLiter}
                onChange={handleChange}
                />
            </CInputGroup>
        </CCol>
      </CRow>

      {/* COST DISPLAY */}
      <div className="alert alert-success text-center">
        <strong>Total Cost: </strong>
        ₱ {totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
      </div>
    </CForm>
  );
}

/* ===========================
        MAIN PAGE
   =========================== */
const FuelLogs = () => {
  // API Endpoints
  const API_URL = "http://localhost:8080/api/fuellogs";
  const VEHICLE_API_URL = "http://localhost:8080/api/vehicle/vehicles";
  const DRIVER_API_URL = "http://localhost:8080/api/drivers/all";

  const [fuelLogs, setFuelLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [visible, setVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Initial Form State
  const initialFormState = {
    vehicleId: "",
    driverId: "",
    fuelDate: new Date().toISOString().slice(0, 16), // Current date/time
    fuelType: "",
    litersFilled: "",
    pricePerLiter: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- 1. LOAD DATA ---
  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch Logs, Vehicles, and Drivers in parallel
      const [logsRes, vehiclesRes, driversRes] = await Promise.all([
        axios.get(`${API_URL}/all`),
        axios.get(VEHICLE_API_URL),
        axios.get(DRIVER_API_URL)
      ]);

      setFuelLogs(logsRes.data);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);

    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback to empty arrays to prevent map errors
      setFuelLogs([]);
      setVehicles([]);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- 2. HANDLERS ---
  const openAddModal = () => {
    setEditMode(false);
    setFormData(initialFormState);
    setVisible(true);
  };

  const openEditModal = (log) => {
    setEditMode(true);
    setCurrentId(log.fuelId);

    // Format date for datetime-local input (yyyy-MM-ddTHH:mm)
    let formattedDate = "";
    if(log.fuelDate) {
        formattedDate = new Date(log.fuelDate).toISOString().slice(0, 16);
    }

    setFormData({
      vehicleId: log.vehicleId,
      driverId: log.driverId,
      fuelDate: formattedDate,
      fuelType: log.fuelType,
      litersFilled: log.litersFilled,
      pricePerLiter: log.pricePerLiter
    });
    setVisible(true);
  };

  const handleSave = async () => {
    try {
      const url = editMode ? `${API_URL}/update` : `${API_URL}/add`;
      const method = editMode ? 'put' : 'post';

      // Inject ID if updating
      const body = editMode ? { ...formData, fuelId: currentId } : formData;

      // Frontend Validation
      if (formData.litersFilled <= 0 || formData.pricePerLiter <= 0) {
        alert("Liters and Price must be greater than 0.");
        return;
      }
      if (!formData.vehicleId || !formData.driverId) {
        alert("Please select a Vehicle and a Driver.");
        return;
      }

      const response = await axios[method](url, body);

      // Check boolean response from Controller
      if (response.data === true) {
        loadData();
        setVisible(false);
        alert(editMode ? "Fuel Log Updated!" : "Fuel Log Added!");
      } else {
        alert("Operation Failed.\n\nPossible reasons:\n- Vehicle is not 'Available' or 'On Trip'\n- Fuel types do not match\n- Date is in the future");
      }
    } catch (err) {
      console.error("Error saving log:", err);
      alert("Server Error. Ensure backend is running.");
    }
  };

  const handleReimburse = async (id) => {
    if (!window.confirm("Mark this fuel log as REIMBURSED? This cannot be undone.")) return;
    try {
      const response = await axios.put(`${API_URL}/reimburse/${id}`);
      if(response.data === true) {
          loadData();
      } else {
          alert("Failed to update reimbursement status.");
      }
    } catch (err) {
      console.error("Error reimbursing:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fuel log?")) return;
    try {
      const response = await axios.delete(`${API_URL}/delete/${id}`);
      if (response.data === true) {
        loadData();
      } else {
        alert("Failed to delete log.");
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  // --- HELPERS FOR DISPLAY ---
  const getPlate = (id) => {
    const v = vehicles.find(veh => veh.vehicleId === id);
    return v ? v.plateNumber : `ID: ${id}`;
  };

  const getDriverName = (id) => {
    const d = drivers.find(drv => drv.driverId === id);
    return d ? `${d.firstName} ${d.lastName}` : `ID: ${id}`;
  };

  return (
    <CRow>
    <CCol xs={12}>
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Fuel Transaction Logs</strong>
        <CButton color="primary" className="float-end btn-sm" onClick={openAddModal}>
          <CIcon icon={cilPlus} className="me-2" /> Add Log
        </CButton>
      </CCardHeader>

      <CCardBody>
        {loading ? (
          <div className="text-center"><CSpinner /><p>Loading logs...</p></div>
        ) : (
          <CTable striped hover responsive bordered className="align-middle text-center">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Vehicle</CTableHeaderCell>
                <CTableHeaderCell>Driver</CTableHeaderCell>
                <CTableHeaderCell>Fuel Type</CTableHeaderCell>
                <CTableHeaderCell>Liters</CTableHeaderCell>
                <CTableHeaderCell>Price/L</CTableHeaderCell>
                <CTableHeaderCell>Total Cost</CTableHeaderCell>
                <CTableHeaderCell>Reimbursed</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {fuelLogs.length === 0 ? (
                 <CTableRow><CTableDataCell colSpan="9">No logs found.</CTableDataCell></CTableRow>
              ) : (
                fuelLogs.map((log) => (
                  <CTableRow key={log.fuelId}>
                    <CTableDataCell>
                        {new Date(log.fuelDate).toLocaleDateString()} <br/>
                        <small className="text-muted">{new Date(log.fuelDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                    </CTableDataCell>
                    <CTableDataCell className="fw-bold">{getPlate(log.vehicleId)}</CTableDataCell>
                    <CTableDataCell>{getDriverName(log.driverId)}</CTableDataCell>
                    <CTableDataCell className="text-capitalize">{log.fuelType}</CTableDataCell>
                    <CTableDataCell>{log.litersFilled}</CTableDataCell>
                    <CTableDataCell>₱{log.pricePerLiter.toFixed(2)}</CTableDataCell>
                    <CTableDataCell className="text-success fw-bold">
                      ₱{(log.litersFilled * log.pricePerLiter).toFixed(2)}
                    </CTableDataCell>
                    <CTableDataCell>
                      {log.reimbursed ? (
                        <CBadge color="success">Paid</CBadge>
                      ) : (
                        <CButton size="sm" color="warning" variant="outline" onClick={() => handleReimburse(log.fuelId)}>
                           Mark Paid
                        </CButton>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton size="sm" color="info" variant="ghost" className="me-1" onClick={() => openEditModal(log)}>
                          <CIcon icon={cilPencil}/>
                      </CButton>
                      <CButton size="sm" color="danger" variant="ghost" onClick={() => handleDelete(log.fuelId)}>
                          <CIcon icon={cilTrash}/>
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
            <CModalTitle>{editMode ? "Edit Fuel Log" : "Add Fuel Log"}</CModalTitle>
        </CModalHeader>
        <CModalBody>
            <FuelLogFormModal
                formData={formData}
                setFormData={setFormData}
                vehicles={vehicles}
                drivers={drivers}
            />
        </CModalBody>
        <CModalFooter>
            <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
            <CButton color="primary" onClick={handleSave}>Save</CButton>
        </CModalFooter>
      </CModal>
    </CCard>
    </CCol>
    </CRow>
  );
};

export default FuelLogs;
