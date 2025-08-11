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

import { APIProvider } from "./context/ApiContext";
import { SubTabDefinitionsProvider } from "./context/SubTabDefinitionsContext";
import { AddEditDeleteProvider } from "./context/AddEditDeleteContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./components/utilities/Alert/Alert.css"; // استایل سفارشی توست

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";

// تابع چک لاگین
const isUserAuthenticated = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    isUserAuthenticated()
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(isUserAuthenticated());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogin = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  };

  return (
    <>
      {/* ✅ همیشه در بالای همه */}
      <ToastContainer
        className="custom-toast-container"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
        style={{ zIndex: 9999, position: "fixed", top: 20, right: 20 }}
      />

      {/* بقیه اپ */}
      <APIProvider>
        <SubTabDefinitionsProvider>
          <AddEditDeleteProvider>
            <Router>
              <Routes>
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
                <Route
                  path="/login"
                  element={<Login onLogin={handleLogin} />}
                />
              </Routes>
            </Router>
          </AddEditDeleteProvider>
        </SubTabDefinitionsProvider>
      </APIProvider>
    </>
  );
};

export default App;
