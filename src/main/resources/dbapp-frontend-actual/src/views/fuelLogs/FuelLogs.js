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
import {
    cilPencil,
    cilTrash,
    cilPlus,
    cilDrop,
    cilUser,
    cilTruck,
    cilMagnifyingGlass,
    cilSortAlphaDown,
    cilFilter
} from '@coreui/icons';
import axios from "axios";

/* =======================================================================
   FUEL LOG FORM (CHILD COMPONENT)
   Includes search functionality for Vehicle and Driver IDs/Names (as requested)
   ======================================================================= */
function FuelLogFormModal({ formData, setFormData, vehicles, drivers }) {

  // --- Search State ---
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      if (name === "vehicleId") {
        const selectedVehicle = vehicles.find(v =>
            (v.vehicleId || v.vehicle_id).toString() === value
        );

        if (selectedVehicle) {
          updated.fuelType = selectedVehicle.fuelType || selectedVehicle.fuel_type;
        } else {
          updated.fuelType = "";
        }
      }
      return updated;
    });
  };

  // --- Filtering Logic for Dropdowns ---
  const filteredVehicles = vehicles
    .filter(v => {
      const status = v.status ? v.status.toLowerCase() : '';
      return status === 'available' || status === 'on_trip';
    })
    .filter(v => {
      if (!vehicleSearch) return true;
      const id = (v.vehicleId || v.vehicle_id || "").toString();
      const plate = (v.plateNumber || v.plate_number || "").toLowerCase();
      const model = (v.model || "").toLowerCase();
      const search = vehicleSearch.toLowerCase();

      return id.includes(search) || plate.includes(search) || model.includes(search);
    });

  const filteredDrivers = drivers.filter(d => {
    if (!driverSearch) return true;
    const id = (d.driverId || d.driver_id || "").toString();
    const first = (d.firstName || d.first_name || "").toLowerCase();
    const last = (d.lastName || d.last_name || "").toLowerCase();
    const license = (d.licenseNum || d.license_num || "").toLowerCase();
    const search = driverSearch.toLowerCase();

    return id.includes(search) || first.includes(search) || last.includes(search) || license.includes(search);
  });

  const totalCost = (parseFloat(formData.litersFilled) || 0) * (parseFloat(formData.pricePerLiter) || 0);

  return (
    <CForm>
      <CRow className="mb-3">
        {/* ======================= VEHICLE SEARCH/SELECT ======================= */}
        <CCol md={6}>
            <CFormLabel>Vehicle (Search or Select)</CFormLabel>
            <CInputGroup className="mb-2">
                <CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText>
                <CFormInput
                    placeholder="Search ID, Plate, or Model to filter..."
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                />
            </CInputGroup>

            <CInputGroup>
                <CInputGroupText><CIcon icon={cilTruck}/></CInputGroupText>
                <CFormSelect
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    required
                >
                <option value="">Select Vehicle...</option>
                {filteredVehicles.map((v, index) => {
                    const id = v.vehicleId || v.vehicle_id;
                    const plate = v.plateNumber || v.plate_number;
                    const model = v.model;

                    return (
                        <option key={id || index} value={id}>
                            ID:{id} | {plate} ({model})
                        </option>
                    );
                })}
                </CFormSelect>
            </CInputGroup>
            {vehicleSearch && filteredVehicles.length === 0 && (
                <small className="text-danger">No vehicles match filter.</small>
            )}
        </CCol>

        {/* ======================= DRIVER SEARCH/SELECT ======================= */}
        <CCol md={6}>
             <CFormLabel>Driver (Search or Select)</CFormLabel>
            <CInputGroup className="mb-2">
                <CInputGroupText><CIcon icon={cilMagnifyingGlass} /></CInputGroupText>
                <CFormInput
                    placeholder="Search ID, Name, or License to filter..."
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                />
            </CInputGroup>

            <CInputGroup>
                <CInputGroupText><CIcon icon={cilUser}/></CInputGroupText>
                <CFormSelect
                    name="driverId"
                    value={formData.driverId}
                    onChange={handleChange}
                    required
                >
                <option value="">Select Driver...</option>
                {filteredDrivers.map((d, index) => {
                    const id = d.driverId || d.driver_id;
                    const first = d.firstName || d.first_name;
                    const last = d.lastName || d.last_name;
                    const license = d.licenseNum || d.license_num;

                    return (
                        <option key={id || index} value={id}>
                            ID:{id} | {first} {last} ({license})
                        </option>
                    );
                })}
                </CFormSelect>
            </CInputGroup>
             {driverSearch && filteredDrivers.length === 0 && (
                <small className="text-danger">No drivers match filter.</small>
            )}
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
                max={new Date().toISOString().slice(0, 16)}
                required
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
                step="1"
                name="litersFilled"
                placeholder="0.00"
                value={formData.litersFilled}
                onChange={handleChange}
                required
                />
            </CInputGroup>
        </CCol>
        <CCol md={6}>
             <CFormLabel>Price per Liter</CFormLabel>
            <CInputGroup>
                <CInputGroupText>₱</CInputGroupText>
                <CFormInput
                type="number"
                step="1"
                name="pricePerLiter"
                placeholder="0.00"
                value={formData.pricePerLiter}
                onChange={handleChange}
                required
                />
            </CInputGroup>
        </CCol>
      </CRow>

      <div className="alert alert-success text-center">
        <strong>Total Cost: </strong>
        ₱ {totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
      </div>
    </CForm>
  );
}

/* =======================================================================
        MAIN PAGE (FUEL LOGS) - Includes Sorting and Filtering
   ======================================================================= */
const FuelLogs = () => {
  const API_URL = "http://localhost:8080/api/fuellogs";
  const VEHICLE_API_URL = "http://localhost:8080/api/vehicles/all";
  const DRIVER_API_URL = "http://localhost:8080/api/drivers/all";

  const [fuelLogs, setFuelLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FILTER & SORT STATE ---
  const [filters, setFilters] = useState({
    reimbursed: "", // 'true', 'false', or '' (all)
    fuelType: ""   // 'diesel', 'gasoline', or '' (all)
  });

  const [sortConfig, setSortConfig] = useState({
    key: "fuelDate",
    direction: "desc" // Default to show newest first
  });

  // Modal State & Form State (Unchanged)
  const [visible, setVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const initialFormState = {
    vehicleId: "",
    driverId: "",
    fuelDate: new Date().toISOString().slice(0, 16),
    fuelType: "",
    litersFilled: "",
    pricePerLiter: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- LOAD DATA ---
  const loadData = async () => {
    setLoading(true);
    try {
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

  // --- LOGIC: FILTERING & SORTING (Use useMemo for performance) ---
  const processedLogs = useMemo(() => {
    let result = [...fuelLogs];

    // 1. Apply Filtering
    if (filters.reimbursed !== "") {
        const isReimbursed = filters.reimbursed === 'true';
        result = result.filter(log => log.reimbursed === isReimbursed);
    }
    if (filters.fuelType) {
        result = result.filter(log => log.fuelType.toLowerCase() === filters.fuelType.toLowerCase());
    }

    // 2. Apply Sorting
    result.sort((a, b) => {
        let aVal, bVal;

        if (sortConfig.key === 'totalCost') {
            aVal = (a.litersFilled || 0) * (a.pricePerLiter || 0);
            bVal = (b.litersFilled || 0) * (b.pricePerLiter || 0);
        } else {
            aVal = a[sortConfig.key];
            bVal = b[sortConfig.key];
        }

        // Handle comparison based on type
        if (sortConfig.key === 'fuelDate') {
            const dateA = new Date(aVal);
            const dateB = new Date(bVal);
            return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (typeof aVal === 'number' || sortConfig.key === 'totalCost' || sortConfig.key === 'litersFilled' || sortConfig.key === 'pricePerLiter') {
             // Treat as numbers for liters, price, and total cost
            const numA = parseFloat(aVal) || 0;
            const numB = parseFloat(bVal) || 0;
            return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        } else {
            // String comparison (Fallback)
            aVal = aVal ? aVal.toString().toLowerCase() : "";
            bVal = bVal ? bVal.toString().toLowerCase() : "";

            return sortConfig.direction === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }
    });

    return result;
  }, [fuelLogs, filters, sortConfig]);

  // Handler for filter changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Handler for sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- Modal and API Handlers (Unchanged) ---
  const openAddModal = () => {
    setEditMode(false);
    setFormData(initialFormState);
    setVisible(true);
  };

  const openEditModal = (log) => {
    setEditMode(true);
    setCurrentId(log.fuelId);

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
    // ... (omitted for brevity, assume content is correct)
    try {
      const url = editMode ? `${API_URL}/update` : `${API_URL}/add`;
      const method = editMode ? 'put' : 'post';
      const body = editMode ? { ...formData, fuelId: currentId } : formData;

      if (formData.litersFilled <= 0 || formData.pricePerLiter <= 0 || !formData.vehicleId || !formData.driverId) {
        alert("Please ensure all required fields are filled with valid data.");
        return;
      }

      const response = await axios[method](url, body);

      if (response.data === true) {
        loadData();
        setVisible(false);
        alert(editMode ? "Fuel Log Updated!" : "Fuel Log Added!");
      } else {
        alert("Operation Failed. Check vehicle status and fuel type match.");
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
      if(response.data === true) loadData();
      else alert("Failed to update reimbursement status.");
    } catch (err) {
      console.error("Error reimbursing:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fuel log?")) return;
    try {
      const response = await axios.delete(`${API_URL}/delete/${id}`);
      if (response.data === true) loadData();
      else alert("Failed to delete log.");
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  // --- HELPERS FOR DISPLAY ---
  const getPlate = (id) => {
    const v = vehicles.find(veh => (veh.vehicleId || veh.vehicle_id) === id);
    return v ? (v.plateNumber || v.plate_number) : `ID: ${id}`;
  };

  const getDriverName = (id) => {
    const d = drivers.find(drv => (drv.driverId || drv.driver_id) === id);
    return d ? `${d.firstName || d.first_name} ${d.lastName || d.last_name}` : `ID: ${id}`;
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '⬆' : '⬇';
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
        {/* ===========================
             FILTER & SORT TOOLBAR
           =========================== */}
        <CRow className="mb-4">
          <CCol md={4}>
            <CFormLabel className="small text-muted">Filter by Reimbursement</CFormLabel>
            <CInputGroup>
              <CInputGroupText><CIcon icon={cilFilter} /></CInputGroupText>
              <CFormSelect name="reimbursed" value={filters.reimbursed} onChange={handleFilterChange}>
                <option value="">Show All</option>
                <option value="true">Reimbursed (Paid)</option>
                <option value="false">Pending (Unpaid)</option>
              </CFormSelect>
            </CInputGroup>
          </CCol>

          <CCol md={4}>
            <CFormLabel className="small text-muted">Filter by Fuel Type</CFormLabel>
            <CInputGroup>
              <CInputGroupText>⛽</CInputGroupText>
              <CFormSelect name="fuelType" value={filters.fuelType} onChange={handleFilterChange}>
                <option value="">Show All Types</option>
                <option value="diesel">Diesel</option>
                <option value="gasoline">Gasoline</option>
              </CFormSelect>
            </CInputGroup>
          </CCol>

          <CCol md={4}>
            <CFormLabel className="small text-muted">Sort By</CFormLabel>
            <CInputGroup>
              <CInputGroupText><CIcon icon={cilSortAlphaDown} /></CInputGroupText>
              <CFormSelect
                value={sortConfig.key}
                onChange={(e) => setSortConfig({ key: e.target.value, direction: sortConfig.direction })}
              >
                <option value="fuelDate">Date</option>
                <option value="litersFilled">Liters</option>
                <option value="pricePerLiter">Price/L</option>
                <option value="totalCost">Total Cost</option>
              </CFormSelect>
              <CButton
                color="secondary"
                variant="outline"
                onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
              >
                {getSortIcon(sortConfig.key)}
              </CButton>
            </CInputGroup>
          </CCol>
        </CRow>
        {/* ======================================================== */}

        {loading ? (
          <div className="text-center"><CSpinner /><p>Loading logs...</p></div>
        ) : (
          <CTable striped hover responsive bordered className="align-middle text-center">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell className="cursor-pointer" onClick={() => handleSort('fuelDate')}>
                    Date {getSortIcon('fuelDate')}
                </CTableHeaderCell>
                <CTableHeaderCell>Vehicle ID</CTableHeaderCell>
                <CTableHeaderCell>Plate No.</CTableHeaderCell>
                <CTableHeaderCell>Driver</CTableHeaderCell>
                <CTableHeaderCell>Fuel Type</CTableHeaderCell>
                <CTableHeaderCell className="cursor-pointer" onClick={() => handleSort('litersFilled')}>
                    Liters {getSortIcon('litersFilled')}
                </CTableHeaderCell>
                <CTableHeaderCell className="cursor-pointer" onClick={() => handleSort('pricePerLiter')}>
                    Price/L {getSortIcon('pricePerLiter')}
                </CTableHeaderCell>
                <CTableHeaderCell className="cursor-pointer" onClick={() => handleSort('totalCost')}>
                    Total Cost {getSortIcon('totalCost')}
                </CTableHeaderCell>
                <CTableHeaderCell>Reimbursed</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {processedLogs.length === 0 ? (
                 <CTableRow><CTableDataCell colSpan="10">No logs found matching your filters.</CTableDataCell></CTableRow>
              ) : (
                processedLogs.map((log) => (
                  <CTableRow key={log.fuelId}>
                    <CTableDataCell>
                        {new Date(log.fuelDate).toLocaleDateString()}
                    </CTableDataCell>
                    <CTableDataCell className="text-muted">{log.vehicleId}</CTableDataCell>
                    <CTableDataCell className="fw-bold">{getPlate(log.vehicleId)}</CTableDataCell>
                    <CTableDataCell>{getDriverName(log.driverId)}</CTableDataCell>
                    <CTableDataCell className="text-capitalize">{log.fuelType}</CTableDataCell>
                    <CTableDataCell>{log.litersFilled}</CTableDataCell>
                    <CTableDataCell>₱{log.pricePerLiter.toFixed(2)}</CTableDataCell>
                    <CTableDataCell className="text-success fw-bold">
                      ₱{((log.litersFilled || 0) * (log.pricePerLiter || 0)).toFixed(2)}
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
