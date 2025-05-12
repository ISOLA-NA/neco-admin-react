// src/App.tsx

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./components/TabHandler/tab/TabbedInterface";
import Login from "./Views/Login";
import Login1 from "./Views/Login1";
import Alert from "./components/utilities/Alert/DynamicAlert";
import { APIProvider } from "./context/ApiContext";
import { SubTabDefinitionsProvider } from "./context/SubTabDefinitionsContext";
import { AddEditDeleteProvider } from "./context/AddEditDeleteContext";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";

// ✅ تابع کمکی برای چک کردن لاگین
const isUserAuthenticated = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    isUserAuthenticated()
  );

  // ✅ همگام‌سازی با تغییرات localStorage (مثلاً وقتی در تب دیگر logout شود)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(isUserAuthenticated());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // ✅ پس از login
  const handleLogin = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  // ✅ پس از logout
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  };

  return (
    <APIProvider>
      <SubTabDefinitionsProvider>
        <AddEditDeleteProvider>
          <Router>
            <Alert />

            <Routes>
              {/* صفحه اصلی */}
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <HomePage onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* صفحه لاگین بدون لوپ */}
              <Route
                path="/login"
                element={<Login onLogin={handleLogin} />}
              />

              {/* تست یا نسخه دوم لاگین */}
              <Route path="/login1" element={<Login1 />} />
            </Routes>
          </Router>
        </AddEditDeleteProvider>
      </SubTabDefinitionsProvider>
    </APIProvider>
  );
};

export default App;
