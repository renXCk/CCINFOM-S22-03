import React, { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
  CCloseButton,
  CListGroup,
  CListGroupItem,
  CBadge,
  CAvatar,
  CButton
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilContrast,
  cilEnvelopeOpen,
  cilMenu,
  cilMoon,
  cilSun,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const [visibleEmails, setVisibleEmails] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }
    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  // --- DUMMY EMAIL DATA ---
  const dummyEmails = [
    { id: 1, sender: "Alice Williams", subject: "Maintenance Required", time: "Just now", preview: "The delivery truck (ABC 123) needs an oil change ASAP.", color: "info" },
    { id: 2, sender: "Fleet Admin", subject: "New Driver Registered", time: "10 mins ago", preview: "A new driver has been added to the system. Please review.", color: "success" },
    { id: 3, sender: "John Smith", subject: "Trip Delayed", time: "1 hour ago", preview: "Heavy traffic on the main highway, delivery will be late.", color: "warning" },
    { id: 4, sender: "System", subject: "Weekly Report Ready", time: "Yesterday", preview: "Your weekly mileage report is ready for download.", color: "danger" },
    { id: 5, sender: "HR Department", subject: "License Expiring", time: "2 days ago", preview: "Driver Mike's license is set to expire next week.", color: "primary" },
  ]

  return (
    <>
      <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
        <CContainer className="border-bottom px-4" fluid>
          <CHeaderToggler
            onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
            style={{ marginInlineStart: '-14px' }}
          >
            <CIcon icon={cilMenu} size="lg" />
          </CHeaderToggler>

          <CHeaderNav className="d-none d-md-flex me-auto">
            <CNavItem>
              <CNavLink to="/dashboard" as={NavLink}>
                Dashboard
              </CNavLink>
            </CNavItem>
          </CHeaderNav>

          <CHeaderNav className="ms-auto">
            <CNavItem>
              <CNavLink onClick={() => setVisibleEmails(true)} style={{ cursor: 'pointer', position: 'relative' }}>
                <CIcon icon={cilEnvelopeOpen} size="lg" />
                <CBadge color="danger" shape="rounded-pill" className="position-absolute top-0 end-0" style={{ fontSize: '0.6rem' }}>
                  5
                </CBadge>
              </CNavLink>
            </CNavItem>
          </CHeaderNav>

          <CHeaderNav>
            <li className="nav-item py-1">
              <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
            </li>

            <CDropdown variant="nav-item" placement="bottom-end">
              <CDropdownToggle caret={false}>
                {colorMode === 'dark' ? <CIcon icon={cilMoon} size="lg" /> : colorMode === 'auto' ? <CIcon icon={cilContrast} size="lg" /> : <CIcon icon={cilSun} size="lg" />}
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem active={colorMode === 'light'} as="button" onClick={() => setColorMode('light')} className="d-flex align-items-center">
                  <CIcon className="me-2" icon={cilSun} size="lg" /> Light
                </CDropdownItem>
                <CDropdownItem active={colorMode === 'dark'} as="button" onClick={() => setColorMode('dark')} className="d-flex align-items-center">
                  <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
                </CDropdownItem>
                <CDropdownItem active={colorMode === 'auto'} as="button" onClick={() => setColorMode('auto')} className="d-flex align-items-center">
                  <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>

            <li className="nav-item py-1">
              <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
            </li>

            <AppHeaderDropdown />
          </CHeaderNav>
        </CContainer>
        <CContainer className="px-4" fluid>
          <AppBreadcrumb />
        </CContainer>
      </CHeader>

      {/* --- OFFCANVAS EMAIL MENU --- */}
      {/* Removed 'bg-light' so it adapts to theme */}
      <COffcanvas placement="end" visible={visibleEmails} onHide={() => setVisibleEmails(false)}>
        <COffcanvasHeader className="shadow-sm">
          <COffcanvasTitle>Inbox (5)</COffcanvasTitle>
          <CCloseButton className="text-reset" onClick={() => setVisibleEmails(false)} />
        </COffcanvasHeader>

        <COffcanvasBody className="p-3">
          <CListGroup flush>
            {dummyEmails.map((email) => (
              <CListGroupItem
                key={email.id}
                href="#"
                tag="a"
                // REMOVED 'bg-white' here. Now it uses default theme bg (transparent/body color)
                className="d-flex align-items-start p-3 mb-3 border rounded shadow-sm action-hover"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="me-3">
                  <CAvatar color={email.color} textColor="white">{email.sender.charAt(0)}</CAvatar>
                </div>

                <div className="w-100">
                  <div className="d-flex justify-content-between mb-1">
                    <strong className="text-body">{email.sender}</strong>
                    <small className="text-muted text-nowrap ms-2">{email.time}</small>
                  </div>
                  <div className="fw-bold text-primary mb-1">{email.subject}</div>
                  <div className="text-medium-emphasis small text-wrap">
                    {email.preview}
                  </div>
                </div>
              </CListGroupItem>
            ))}
          </CListGroup>

          <div className="d-grid mt-2">
            <CButton color="primary" shape="rounded-pill">View All Messages</CButton>
          </div>
        </COffcanvasBody>
      </COffcanvas>
    </>
  )
}

export default AppHeader
