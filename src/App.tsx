import React, { useState, useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import HomePage from './components/Views/tab/TabbedInterface'
import Login from './components/Autentications/Login'
// import Test from './components/Test/test'
import Alert from './components/utilities/Alert/DynamicAlert'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'

import './App.css'

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    // بررسی وضعیت احراز هویت از localStorage (اختیاری)
    const auth = localStorage.getItem('isAuthenticated')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
    localStorage.setItem('isAuthenticated', 'true') // ذخیره وضعیت احراز هویت
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('isAuthenticated')
  }

  return (
    <Router>
      <Alert />
      <Routes>
        <Route
          path='/'
          element={
            isAuthenticated ? (
              <HomePage onLogout={handleLogout} />
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />
        <Route
          path='/login'
          element={
            isAuthenticated ? (
              <Navigate to='/' replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        {/* <Route
          path='/test'
          element={
            <>
              <Test name="علی" />
            </>
          }
        /> */}
      </Routes>
    </Router>
  )
}

export default App
