import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../src/components/Views/TabbedInterface"
import Login from "../src/components/Autentications/Login";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
