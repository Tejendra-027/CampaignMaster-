import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// ──────── Pages ────────
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import User from './pages/User';
import Lists from './pages/Lists';
import ListItems from './pages/ListItems';
import Templates from './pages/Templates';
import CreateTemplatePage from './pages/CreateTemplatePage'; // ✅ Create page
import Campaigns from './pages/Campaigns'; // Import your Campaigns page
import CampaignFormModal from './pages/CampaignFormModal'; // Import your CampaignFormModal page

// ──────── Components ────────
import PrivateRoute from './components/PrivateRoute';

const App = () => (
  <Router>
    <Routes>
      {/* ─────────── Public Routes ─────────── */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ────────── Protected Routes ────────── */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      >
        {/* ────── Nested under /dashboard ────── */}
        <Route index element={<Navigate to="lists" replace />} />
        <Route path="users" element={<User />} />
        <Route path="lists" element={<Lists />} />
        <Route path="lists/:id/items" element={<ListItems />} />
        <Route path="templates" element={<Templates />} />
        <Route path="templates/create" element={<CreateTemplatePage />} />

        {/* Campaigns Page Route */}
        <Route path="campaigns" element={<Campaigns />} />

        {/* CampaignFormModal Route (you can directly render it as a modal) */}
        <Route path="campaigns/form" element={<CampaignFormModal />} />
      </Route>

      {/* ─────────── Fallback ─────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

export default App;
