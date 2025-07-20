// src/pages/Dashboard.js
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaUser, FaList, FaEnvelope, FaSignOutAlt } from 'react-icons/fa'; // ← Added FaEnvelope
import axios from 'axios';
import { toast } from 'react-toastify';

import { logout as logoutAction } from '../features/auth/authSlice';
import './Dashboard.css';

const API_BASE = 'http://localhost:3000';
const FIRST_PAGE_LIMIT = 1;

export default function Dashboard() {
  const { token: reduxToken, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [firstListId, setFirstListId] = useState(null);

  const navigate = useNavigate();
  const token = reduxToken || localStorage.getItem('token');

  const axiosCfg = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  useEffect(() => {
    if (!token) navigate('/login', { replace: true });
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const { data } = await axios.post(
          `${API_BASE}/list/filter`,
          { page: 1, limit: FIRST_PAGE_LIMIT, search: '' },
          axiosCfg
        );

        const rows = Array.isArray(data?.rows) ? data.rows : [];
        if (rows.length) setFirstListId(rows[0].id);
      } catch (err) {
        console.error('[Dashboard] Could not fetch first list:', err);
      }
    })();
  }, [token, axiosCfg]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleLogout = () => {
    dispatch(logoutAction());
    toast.success('Logged out successfully!');
    setTimeout(() => navigate('/login', { replace: true }), 800);
  };

  return (
    <div className="dashboard-container">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <button
          className="toggle-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          title="Toggle Sidebar"
        >
          &#9776;
        </button>

        <div className="sidebar-content">
          <nav className="nav-items">
            <NavLink
              to="/dashboard/users"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaUser className="icon" />
              <span className="nav-text">Users</span>
            </NavLink>

            <NavLink
              to="/dashboard/lists"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaList className="icon" />
              <span className="nav-text">Lists</span>
            </NavLink>

            <NavLink
              to="/dashboard/templates" // ✅ New Templates NavLink
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaEnvelope className="icon" />
              <span className="nav-text">Templates</span>
            </NavLink>
          </nav>

          <button className="nav-link logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="icon" />
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────── */}
      <main className={`dashboard-main ${sidebarOpen ? '' : 'full'}`}>
        <Outlet context={{ firstListId, user }} />
      </main>
    </div>
  );
}
