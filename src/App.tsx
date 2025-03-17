import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./components/TabHandler/tab/TabbedInterface"; // مسیر اصلاح شود
import Login from "./Views/Login";
import Login1 from "./Views/Login1";
import Alert from "./components/utilities/Alert/DynamicAlert";
import { APIProvider } from "./context/ApiContext";

// کانتکست‌های جدید
import { SubTabDefinitionsProvider } from "./context/SubTabDefinitionsContext";
import { AddEditDeleteProvider } from "./context/AddEditDeleteContext";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  };

  return (
    <APIProvider>
      <SubTabDefinitionsProvider>
        <AddEditDeleteProvider>
          <Router>
            <Alert />
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
                element={
                  isAuthenticated ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Login onLogin={handleLogin} />
                  )
                }
              />
              {/* مسیر Login1 بدون شرط احراز هویت */}
              <Route path="/login1" element={<Login1 />} />
            </Routes>
          </Router>
        </AddEditDeleteProvider>
      </SubTabDefinitionsProvider>
    </APIProvider>
  );
};

export default App;
