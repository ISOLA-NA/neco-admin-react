import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/Views/tab/TabbedInterface.js";
import Login from "./components/Autentications/Login.js";
// import Test from "../src/components/Test/tests.js";
import "primereact/resources/themes/lara-light-indigo/theme.css"; /* تم دلخواه */
import "primereact/resources/primereact.min.css"; /* استایل اصلی */
import "primeicons/primeicons.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/test" element={<Test />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
