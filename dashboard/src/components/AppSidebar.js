import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilShieldAlt } from '@coreui/icons'

import { AppSidebarNav } from './AppSidebarNav'

// sidebar nav config
import getNav from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/" className="d-flex align-items-center gap-2">
          <span
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: 'linear-gradient(135deg, rgba(34,211,238,0.22), rgba(99,102,241,0.16))',
              border: '1px solid rgba(34,211,238,0.35)',
              color: 'var(--hg-accent)',
              boxShadow: '0 0 14px rgba(34,211,238,0.25)',
            }}
          >
            <CIcon icon={cilShieldAlt} size="lg" />
          </span>
          <span
            className="sidebar-brand-full fw-800"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.02em', fontSize: 15 }}
          >
            HONEY<span style={{ color: 'var(--hg-accent)' }}>GUARD</span>
          </span>
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={getNav()} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
