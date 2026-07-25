import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'

import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ProtectedRoute, GuestOnlyRoute } from './components/RouteGuards'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const ForgotPassword = React.lazy(() => import('./views/pages/forgotpassword/ForgotPassword'))
const CreateOrg = React.lazy(() => import('./views/pages/createorg/CreateOrg'))
const AcceptInvite = React.lazy(() => import('./views/pages/acceptinvite/AcceptInvite'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthProvider>
      <NotificationProvider>
      <HashRouter>
        <Suspense
          fallback={
            <div className="pt-3 text-center">
              <CSpinner color="primary" variant="grow" />
            </div>
          }
        >
          <Routes>
            <Route
              exact
              path="/login"
              name="Login Page"
              element={
                <GuestOnlyRoute>
                  <Login />
                </GuestOnlyRoute>
              }
            />
            <Route
              exact
              path="/register"
              name="Register Page"
              element={
                <GuestOnlyRoute>
                  <Register />
                </GuestOnlyRoute>
              }
            />
            <Route exact path="/forgot-password" name="Forgot Password" element={<ForgotPassword />} />
            <Route
              exact
              path="/create-org"
              name="Create Organization"
              element={
                <ProtectedRoute>
                  <CreateOrg />
                </ProtectedRoute>
              }
            />
            <Route exact path="/accept-invite" name="Accept Invite" element={<AcceptInvite />} />
            <Route exact path="/404" name="Page 404" element={<Page404 />} />
            <Route exact path="/500" name="Page 500" element={<Page500 />} />
            <Route
              path="*"
              name="Home"
              element={
                <ProtectedRoute>
                  <DefaultLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
        <ToastContainer position="bottom-right" theme="colored" />
      </HashRouter>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
