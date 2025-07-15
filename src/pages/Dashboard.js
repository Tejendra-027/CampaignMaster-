// src/pages/Dashboard.js
import React, { useState, useCallback, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { FaUser, FaList, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

/* ──────────────────────────────────────────────────────────── */

const API_BASE = 'http://localhost:3000';      // ← one place to change later
const FIRST_PAGE_LIMIT = 1;                    // just need 1 row

export default function Dashboard() {
  /* ---------- local state ---------- */
  const [isOpen,       setIsOpen]       = useState(true);   // sidebar
  const [firstListId,  setFirstListId]  = useState(null);   // could be useful later

  const navigate = useNavigate();
  const token    = localStorage.getItem('token');
  const axiosCfg = { headers: { Authorization: `Bearer ${token}` } };

  /* ---------- auth guard (once) ---------- */
  useEffect(() => {
    if (!token) navigate('/login', { replace: true });
  }, [token, navigate]);

  /* ---------- fetch first list (once) ---------- */
  useEffect(() => {
    if (!token) return;                // extra safety

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
        console.error('[Dashboard] failed to fetch first list:', err);
        /* non‑fatal — just log */
      }
    })();
  }, [token, axiosCfg]);

  /* ---------- sidebar toggle ---------- */
  const toggleSidebar = useCallback(() => setIsOpen(s => !s), []);

  /* ---------- logout ---------- */
  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    setTimeout(() => navigate('/login'), 800);
  };

  /* ---------- render ---------- */
  return (
    <div className="dashboard-container">
      {/* ─── Sidebar ─────────────────────────────────────── */}
      <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
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
          </nav>

          <button className="nav-link logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="icon" />
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* ─── Main outlet ────────────────────────────────── */}
      <main className={`dashboard-main ${isOpen ? '' : 'full'}`}>
        {/* `firstListId` is available for child routes if needed */}
        <Outlet context={{ firstListId }} />
      </main>
    </div>
  );
}
