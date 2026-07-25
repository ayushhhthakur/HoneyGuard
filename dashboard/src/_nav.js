import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilPencil,
  cilSpeedometer,
  cilLocationPin,
  cilFingerprint,
  cilGlobeAlt,
  cilPeople,
  cilDevices,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

// A function (not a static array) so we can hide role-gated items — Team
// management is visible to everyone (read-only for non-admins), but the
// nav itself doesn't need role filtering beyond what the page enforces.
const getNav = () => [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Honeytokens',
  },
  {
    component: CNavItem,
    name: 'Tokens',
    to: '/utils/Tokens',
    icon: <CIcon icon={cilFingerprint} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Track',
    to: '/utils/track',
    icon: <CIcon icon={cilGlobeAlt} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Alerts',
    to: '/alerts',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Fingerprints',
    to: '/fingerprints',
    icon: <CIcon icon={cilDevices} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Maps',
    to: '/utils/maps',
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Category',
    to: '/utils/category',
    icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Organization',
  },
  {
    component: CNavItem,
    name: 'Team',
    to: '/team',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
]

export default getNav
