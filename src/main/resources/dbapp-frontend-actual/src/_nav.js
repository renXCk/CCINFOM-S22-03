import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilPeople,
  cilTruck,
  cilMoodGood,
  cilWarning,
  cilFile
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />
  },

  // =========================================
  // SECTION: RECORDS
  // =========================================
  {
    component: CNavTitle,
    name: 'Records',
  },
  {
    component: CNavItem,
    name: 'Vehicles',
    to: '/vehicles',
    icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Drivers',
    to: '/drivers',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Clients',
    to: '/clients',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
      component: CNavItem,
      name: 'Parts',
      to: '/parts',
      icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    },

  // =========================================
  // SECTION: TRANSACTIONS
  // =========================================
  {
    component: CNavTitle,
    name: 'Transactions',
  },
  {
    component: CNavItem,
    name: 'Trip Logs',
    to: '/triplogs',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Incident Logs',
    to: '/incidentLogs',
    icon: <CIcon icon={cilWarning} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Fuel Logs',
    to: '/fuelLogs',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },
  {
      component: CNavItem,
      name: 'Maintenance Logs',
      to: '/maintenancelogs',
      icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
  },


  // =========================================
  // SECTION: REPORTS
  // =========================================
  {
    component: CNavTitle,
    name: 'Reports',
  },
  {
    component: CNavItem,
    name: 'Mileage Report',
    to: '/reports/mileage',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Client Report',
    to: '/reports/clients',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
]

export default _nav
