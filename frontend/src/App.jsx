import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student" element={<div className="p-4 bg-white shadow rounded m-8">Student Dashboard (Coming Soon)</div>} />
        <Route path="/admin" element={<div className="p-4 bg-white shadow rounded m-8">Admin Dashboard (Coming Soon)</div>} />
      </Routes>
    </Router>
  );
}

export default App;