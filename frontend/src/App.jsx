import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-blue-600">FixMyCampus</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<div className="p-4 bg-white shadow rounded">Login Page (Coming Soon)</div>} />
            <Route path="/signup" element={<div className="p-4 bg-white shadow rounded">Signup Page (Coming Soon)</div>} />
            <Route path="/student" element={<div className="p-4 bg-white shadow rounded">Student Dashboard (Coming Soon)</div>} />
            <Route path="/admin" element={<div className="p-4 bg-white shadow rounded">Admin Dashboard (Coming Soon)</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;