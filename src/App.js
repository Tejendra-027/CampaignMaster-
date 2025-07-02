import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import User from './pages/User';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/*" element={<Dashboard />}>
          <Route path="users" element={<User />} />
          {/* Add more nested routes here like <Route path="lists" element={<Lists />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;