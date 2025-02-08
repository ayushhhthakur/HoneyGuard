import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilExternalLink,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilLocationPin,
  cilFingerprint,
  cilLaptop,
  cilGlobeAlt,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Utils',
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
  // {
  //   component: CNavItem,
  //   name: 'Logs',
  //   to: '/utils/logs',
  //   icon: <CIcon icon={cilLaptop} customClassName="nav-icon" />,
  // },
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
]

export default _nav
