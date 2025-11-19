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
import { cilPencil, cilTrash, cilPlus, cilSortAlphaDown, cilListRich, cilCheckCircle, cilReload } from '@coreui/icons';
import axios from "axios";

/* ===========================
   PART FORM (CHILD)
   =========================== */
function PartFormModal({ formData, setFormData, editMode }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <>
      <CFormLabel>Part Name</CFormLabel>
      <CInputGroup className="mb-3">
        <CInputGroupText>🔧</CInputGroupText>
        <CFormInput
          name="partName"
          placeholder="e.g., Oil Filter"
          value={formData.partName}
          onChange={handleChange}
        />
      </CInputGroup>

      <CFormLabel>Description</CFormLabel>
      <CInputGroup className="mb-3">
        <CInputGroupText>📝</CInputGroupText>
        <CFormInput
          name="description"
          placeholder="Part description"
          value={formData.description}
          onChange={handleChange}
        />
      </CInputGroup>

      <CFormLabel>Supplier</CFormLabel>
      <CInputGroup className="mb-3">
        <CInputGroupText>🏢</CInputGroupText>
        <CFormInput
          name="supplier"
          placeholder="e.g., ABC Auto Parts"
          value={formData.supplier}
          onChange={handleChange}
        />
      </CInputGroup>

      <CRow>
        <CCol md={6}>
          <CFormLabel>Stock Quantity</CFormLabel>
          <CInputGroup className="mb-3">
            <CInputGroupText>📦</CInputGroupText>
            <CFormInput
              type="number"
              name="stockQty"
              value={formData.stockQty}
              onChange={handleChange}
              min="0"
            />
          </CInputGroup>
        </CCol>

        <CCol md={6}>
          <CFormLabel>Cost (₱)</CFormLabel>
          <CInputGroup className="mb-3">
            <CInputGroupText>💰</CInputGroupText>
            <CFormInput
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </CInputGroup>
        </CCol>
      </CRow>

      <CFormLabel>Pending Delivery</CFormLabel>
      <CInputGroup className="mb-3">
        <CInputGroupText>🚚</CInputGroupText>
        <CFormSelect
          name="pendingDelivery"
          value={formData.pendingDelivery}
          onChange={handleChange}
          disabled={editMode}
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </CFormSelect>
      </CInputGroup>
    </>
  );
}

/* ===========================
   PART HISTORY TABLE (CHILD)
   =========================== */
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString('en-US');
};

const getMaintenanceStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'ongoing': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
};

function PartHistoryTable({ focus }) {
    const API_URL = "http://localhost:8080/api/parts";
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPartHistory = async () => {
        setLoading(true);
        try {
          const result = await axios.get(`${API_URL}/history`);
          setHistory(result.data);
        } catch (error) {
          console.error("Error fetching part history:", error);
        } finally {
          setLoading(false);
        }
    };

    useEffect(() => {
        loadPartHistory();
    }, []);

    const columns = [
        { key: 'part', label: 'Part', visible: true, cell: (detail) => <>
            <div className="fw-semibold">{detail.partName}</div>
            <div className="small text-muted">{detail.supplier}</div>
        </> },

        { key: 'vehicle', label: 'Vehicle Used On', visible: focus.vehicle, cell: (detail) => <>
            <div className="fw-semibold">{detail.vehiclePlateNumber || 'N/A'}</div>
            <div className="small text-muted">{detail.vehicleModel || 'N/A'}</div>
        </> },

        { key: 'maintenance', label: 'Maintenance Status', visible: focus.maintenance, cell: (detail) => <CBadge color={getMaintenanceStatusBadge(detail.maintenanceStatus)}>{detail.maintenanceStatus}</CBadge> },
        { key: 'date', label: 'Maintenance Date', visible: focus.maintenance, cell: (detail) => formatDate(detail.maintenanceDate) },
        { key: 'quantity', label: 'Quantity Used', visible: focus.maintenance, cell: (detail) => detail.quantityUsed || 0 },
    ].filter(col => col.visible);

    if (loading) {
        return (
            <div className="text-center p-5">
                <CSpinner />
                <p>Loading part history...</p>
            </div>
        );
    }

    if (history.length === 0) {
        return <div className="text-center p-4">No relations with maintenance records found.</div>;
    }

    return (
        <CTable striped hover responsive bordered className="align-middle small">
            <CTableHead color="dark">
                <CTableRow>
                    {columns.map(col => (
                        <CTableHeaderCell key={col.key}>{col.label}</CTableHeaderCell>
                    ))}
                </CTableRow>
            </CTableHead>
            <CTableBody>
                {history.map((detail, index) => (
                    <CTableRow key={index}>
                        {columns.map(col => (
                            <CTableDataCell key={`${index}-${col.key}`}>
                                {col.cell(detail)}
                            </CTableDataCell>
                        ))}
                    </CTableRow>
                ))}
            </CTableBody>
        </CTable>
    );
}

/* ===========================
        MAIN PAGE
   =========================== */
const Parts = () => {
  const API_URL = "http://localhost:8080/api/parts";

  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyFilterFocus, setHistoryFilterFocus] = useState({
    vehicle: true,
    maintenance: true,
  });

  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
  const [deliveryPartId, setDeliveryPartId] = useState(null);
  const [quantityReceived, setQuantityReceived] = useState(0);

  const [filters, setFilters] = useState({
    status: "active",
    supplier: ""
  });

  const [sortConfig, setSortConfig] = useState({
    key: "partId",
    direction: "asc"
  });

  const initialFormState = {
    partName: "",
    description: "",
    stockQty: 0,
    cost: 0,
    supplier: "",
    pendingDelivery: "false",
  };

  const [formData, setFormData] = useState(initialFormState);

  const loadParts = async () => {
    setLoading(true);
    try {
      const result = await axios.get(`${API_URL}/all`);
      setParts(result.data);
    } catch (error) {
      console.error("Error fetching parts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParts();
  }, []);

  const processedParts = useMemo(() => {
    let result = [...parts];

    if (filters.supplier) {
      result = result.filter(p => p.supplier.toLowerCase().includes(filters.supplier.toLowerCase()));
    }

    if (filters.status) {
      if (filters.status === "active") {
        result = result.filter(p => p.stockQty > 0 || p.pendingDelivery);
      } else if (filters.status === "inactive") {
        result = result.filter(p => p.stockQty === 0 && !p.pendingDelivery);
      } else if (filters.status === "out_of_stock") {
        result = result.filter(p => p.stockQty === 0);
      } else if (filters.status === "pending_delivery") {
        result = result.filter(p => p.pendingDelivery);
      }
    }

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
  }, [parts, filters, sortConfig]);

  const openAddModal = () => {
    setEditMode(false);
    setFormData(initialFormState);
    setVisible(true);
  };

  const openEditModal = (part) => {
    setEditMode(true);
    setCurrentId(part.partId);
    setFormData({
      partName: part.partName,
      description: part.description,
      stockQty: part.stockQty,
      cost: part.cost,
      supplier: part.supplier,
      pendingDelivery: part.pendingDelivery ? "true" : "false",
    });
    setVisible(true);
  };

  const handleSave = async () => {
    try {
      const url = editMode ? `${API_URL}/update` : `${API_URL}/add`;
      const method = editMode ? 'put' : 'post';
      const body = {
        ...formData,
        pendingDelivery: formData.pendingDelivery === "true",
        partId: editMode ? currentId : undefined
      };

      const response = await axios[method](url, body);

      if (response.data === true) {
        loadParts();
        setVisible(false);
        alert(editMode ? "Part updated successfully!" : "Part added successfully!");
      } else {
        alert("Operation failed. Check for duplicate part names from same supplier or invalid data.");
      }
    } catch (err) {
      console.error("Error saving part:", err);
      alert("Error connecting to server.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this part? This will soft-delete it.")) return;
    try {
      const response = await axios.delete(`${API_URL}/delete/${id}`);
      if (response.status === 200) {
        loadParts();
        alert("Part soft-deleted (set to inactive).");
      }
    } catch (err) {
      console.error("Error deleting part:", err);
    }
  };

  const handleRequestShipment = async (id) => {
    if (!window.confirm("Request shipment for this part?")) return;
    try {
      const response = await axios.put(`${API_URL}/${id}/request-shipment`);
      if (response.data === true) {
        loadParts();
        alert("Shipment requested successfully!");
      }
    } catch (err) {
      console.error("Error requesting shipment:", err);
      alert("Failed to request shipment.");
    }
  };

  const openDeliveryModal = (partId) => {
    setDeliveryPartId(partId);
    setQuantityReceived(0);
    setDeliveryModalVisible(true);
  };

  const handleCompleteDelivery = async () => {
    if (quantityReceived <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }
    try {
      const response = await axios.put(
        `${API_URL}/${deliveryPartId}/complete-delivery?quantityReceived=${quantityReceived}`
      );
      if (response.data === true) {
        loadParts();
        setDeliveryModalVisible(false);
        alert("Delivery completed successfully!");
      }
    } catch (err) {
      console.error("Error completing delivery:", err);
      alert("Failed to complete delivery.");
    }
  };

  const handleReactivate = async (id) => {
    if (!window.confirm("Reactivate this part by requesting shipment?")) return;
    try {
      const response = await axios.put(`${API_URL}/${id}/reactivate`);
      if (response.data === true) {
        loadParts();
        alert("Part reactivated successfully!");
      }
    } catch (err) {
      console.error("Error reactivating part:", err);
      alert("Failed to reactivate part.");
    }
  };

  const getStatusBadge = (part) => {
    if (part.stockQty === 0 && !part.pendingDelivery) return { color: 'secondary', text: 'Inactive' };
    if (part.stockQty === 0) return { color: 'warning', text: 'Out of Stock' };
    if (part.pendingDelivery) return { color: 'info', text: 'Pending Delivery' };
    return { color: 'success', text: 'In Stock' };
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

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

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Parts Inventory</strong>
        <CButton color="primary" className="float-end btn-sm" onClick={openAddModal}>
            <CIcon icon={cilPlus} className="me-2" />
            Add Part
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
          <CCol md={3}>
            <CFormLabel className="small text-muted">Sort By</CFormLabel>
            <CInputGroup>
              <CInputGroupText><CIcon icon={cilSortAlphaDown} /></CInputGroupText>
              <CFormSelect
                value={sortConfig.key}
                onChange={(e) => setSortConfig({ ...sortConfig, key: e.target.value })}
              >
                <option value="partId">ID</option>
                <option value="partName">Name</option>
                <option value="stockQty">Stock</option>
                <option value="cost">Cost</option>
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

          <CCol md={4}>
            <CFormLabel className="small text-muted">Filter by Status</CFormLabel>
            <CFormSelect name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="pending_delivery">Pending Delivery</option>
            </CFormSelect>
          </CCol>

          <CCol md={5}>
            <CFormLabel className="small text-muted">Search by Supplier</CFormLabel>
            <CFormInput
              name="supplier"
              placeholder="Search supplier..."
              value={filters.supplier}
              onChange={handleFilterChange}
            />
          </CCol>
        </CRow>

        {loading ? (
          <div className="text-center">
            <CSpinner />
            <p>Loading parts...</p>
          </div>
        ) : (
          <CTable striped hover responsive bordered className="align-middle">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell onClick={() => handleSort('partId')} style={{ cursor: 'pointer' }}>
                    ID {getSortIcon('partId')}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('partName')} style={{ cursor: 'pointer' }}>
                    Part Name {getSortIcon('partName')}
                </CTableHeaderCell>
                <CTableHeaderCell>Supplier</CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('stockQty')} style={{ cursor: 'pointer' }}>
                    Stock {getSortIcon('stockQty')}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('cost')} style={{ cursor: 'pointer' }}>
                    Cost {getSortIcon('cost')}
                </CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {processedParts.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan="7">No parts match your filters.</CTableDataCell>
                </CTableRow>
              ) : (
                processedParts.map((p) => {
                  const status = getStatusBadge(p);
                  return (
                    <CTableRow key={p.partId}>
                      <CTableDataCell>{p.partId}</CTableDataCell>
                      <CTableDataCell>
                        <div className="fw-semibold">{p.partName}</div>
                        <div className="small text-muted">{p.description}</div>
                      </CTableDataCell>
                      <CTableDataCell>{p.supplier}</CTableDataCell>
                      <CTableDataCell>{p.stockQty}</CTableDataCell>
                      <CTableDataCell>₱{p.cost.toFixed(2)}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={status.color}>{status.text}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        {p.pendingDelivery && (
                          <CButton
                              color="success"
                              variant="ghost"
                              size="sm"
                              className="me-2"
                              onClick={() => openDeliveryModal(p.partId)}
                              title="Complete Delivery"
                          >
                              <CIcon icon={cilCheckCircle} />
                          </CButton>
                        )}
                        {p.stockQty === 0 && !p.pendingDelivery && (
                          <CButton
                              color="warning"
                              variant="ghost"
                              size="sm"
                              className="me-2"
                              onClick={() => handleReactivate(p.partId)}
                              title="Reactivate"
                          >
                              <CIcon icon={cilReload} />
                          </CButton>
                        )}
                        {!p.pendingDelivery && p.stockQty > 0 && (
                          <CButton
                              color="info"
                              variant="ghost"
                              size="sm"
                              className="me-2"
                              onClick={() => handleRequestShipment(p.partId)}
                              title="Request Shipment"
                          >
                              🚚
                          </CButton>
                        )}
                        <CButton
                            color="info"
                            variant="ghost"
                            size="sm"
                            className="me-2"
                            onClick={() => openEditModal(p)}
                        >
                            <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(p.partId)}
                        >
                            <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  );
                })
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>

      {/* Add/Edit Modal */}
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>{editMode ? "Edit Part" : "Add New Part"}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <PartFormModal
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

      {/* Delivery Completion Modal */}
      <CModal visible={deliveryModalVisible} onClose={() => setDeliveryModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Complete Delivery</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormLabel>Quantity Received</CFormLabel>
          <CFormInput
            type="number"
            min="1"
            value={quantityReceived}
            onChange={(e) => setQuantityReceived(parseInt(e.target.value))}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeliveryModalVisible(false)}>Cancel</CButton>
          <CButton color="success" onClick={handleCompleteDelivery}>Complete Delivery</CButton>
        </CModalFooter>
      </CModal>

      {/* History Modal */}
      <CModal size="xl" visible={historyVisible} onClose={() => setHistoryVisible(false)}>
        <CModalHeader className="bg-dark text-white">
          <CModalTitle>Part View With Other Related Records</CModalTitle>
        </CModalHeader>
        <CModalBody className="bg-dark text-white">
          <div className="mb-4 p-3 bg-secondary rounded-3 shadow-sm text-white">
              <h6 className="mb-3 text-info">Filter Data:</h6>
              <CRow className="g-3">
                  <CCol md={6}>
                      <CInputGroup className="align-items-center">
                          <input
                              type="checkbox"
                              className="form-check-input me-2"
                              checked={historyFilterFocus.vehicle}
                              onChange={(e) => setHistoryFilterFocus({ ...historyFilterFocus, vehicle: e.target.checked })}
                              id="focus-vehicle"
                          />
                          <CFormLabel htmlFor="focus-vehicle" className="mb-0 fw-semibold">Vehicle Details</CFormLabel>
                      </CInputGroup>
                  </CCol>
                  <CCol md={6}>
                      <CInputGroup className="align-items-center">
                          <input
                              type="checkbox"
                              className="form-check-input me-2"
                              checked={historyFilterFocus.maintenance}
                              onChange={(e) => setHistoryFilterFocus({ ...historyFilterFocus, maintenance: e.target.checked })}
                              id="focus-maintenance"
                          />
                          <CFormLabel htmlFor="focus-maintenance" className="mb-0 fw-semibold">Maintenance Details</CFormLabel>
                      </CInputGroup>
                  </CCol>
              </CRow>
              <small className="mt-2 d-block text-light">* Choose filter</small>
          </div>

          <PartHistoryTable focus={historyFilterFocus} />

        </CModalBody>
        <CModalFooter className="bg-dark">
          <CButton color="secondary" onClick={() => setHistoryVisible(false)}>Close</CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default Parts;
