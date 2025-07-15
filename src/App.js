// src/App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import User       from './pages/User';
import Lists      from './pages/Lists';
import ListItems  from './pages/ListItems';

import PrivateRoute from './components/PrivateRoute';

const App = () => (
  <Router>
    <Routes>
      {/* ─────────────────── Public ─────────────────── */}
      <Route path="/"        element={<Login />} />
      <Route path="/login"   element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ────────────────── Protected ───────────────── */}
      <Route
        path="/dashboard"
        element={                                   /* gate everything below */
          <PrivateRoute>
            <Dashboard />                          {/* <Outlet /> lives here */}
          </PrivateRoute>
        }
      >
        {/* Nested routes under /dashboard/… */}
        <Route index          element={<Navigate to="lists" replace />} />  {/* default tab */}
        <Route path="users"   element={<User />} />
        <Route path="lists"   element={<Lists />} />
        <Route path="lists/:id/items" element={<ListItems />} />
      </Route>

      {/* ────────────────── Catch‑all ───────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

export default App;
