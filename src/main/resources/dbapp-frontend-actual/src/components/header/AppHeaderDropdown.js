import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CRow,
  CCol
} from '@coreui/react'
import {
  cilSettings,
  cilUser,
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const [profileVisible, setProfileVisible] = useState(false)

  const handleLogout = () => {
    // Clear any stored tokens or user data
    localStorage.clear()
    sessionStorage.clear()

    // Navigate to login page
    navigate('/login')
  }

  const handleSettings = () => {
    navigate('/settings')
  }

  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
          <CAvatar src={avatar8} size="md" />
        </CDropdownToggle>
        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>

          {/* PROFILE - Opens Modal */}
          <CDropdownItem onClick={() => setProfileVisible(true)} style={{cursor: 'pointer'}}>
            <CIcon icon={cilUser} className="me-2" />
            Profile
          </CDropdownItem>

          {/* SETTINGS - Navigates to Settings Page */}
          <CDropdownItem onClick={handleSettings} style={{cursor: 'pointer'}}>
            <CIcon icon={cilSettings} className="me-2" />
            Settings
          </CDropdownItem>

          <CDropdownDivider />

          {/* LOGOUT - Exits App */}
          <CDropdownItem onClick={handleLogout} style={{cursor: 'pointer'}} className="text-danger">
            <CIcon icon={cilAccountLogout} className="me-2" />
            Logout
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      {/* PROFILE MODAL */}
      <CModal alignment="center" visible={profileVisible} onClose={() => setProfileVisible(false)}>
        <CModalHeader>
          <CModalTitle>User Profile</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="text-center mb-4">
            <CAvatar src={avatar8} size="xl" className="mb-3" />
            {/* UPDATED NAME AND ROLE */}
            <h4>Group 3</h4>
            <p className="text-muted">Admin</p>
            <CBadge color="success">Active</CBadge>
          </div>

          {/* REMOVED bg-light, added border for clean separation in dark/light modes */}
          <div className="p-3 rounded border">
            <CRow className="mb-2">
              <CCol sm={4} className="fw-bold">Email:</CCol>
              <CCol sm={8}>CCINFOMs22G3@dlsu.edu.ph</CCol>
            </CRow>
            <CRow className="mb-2">
              <CCol sm={4} className="fw-bold">Role:</CCol>
              <CCol sm={8}>Administrator</CCol>
            </CRow>
            <CRow className="mb-2">
              <CCol sm={4} className="fw-bold">Phone:</CCol>
              <CCol sm={8}>+919 494 2742</CCol>
            </CRow>
            <CRow>
              <CCol sm={4} className="fw-bold">Joined:</CCol>
              <CCol sm={8}>Nov 15, 2025</CCol>
            </CRow>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setProfileVisible(false)}>
            Close
          </CButton>
          {/* REMOVED EDIT PROFILE BUTTON */}
        </CModalFooter>
      </CModal>
    </>
  )
}

// Helper Badge component for the modal
const CBadge = ({children, color}) => (
    <span className={`badge bg-${color}`}>{children}</span>
)

export default AppHeaderDropdown
