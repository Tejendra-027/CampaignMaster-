import React, { useState, useCallback, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { FaUser, FaList, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [firstListId, setFirstListId] = useState(null);
  const navigate = useNavigate();

  // 🔐 Ensure token check only runs once on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // ✅ Fetch first list (only if token exists)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchFirstList = async () => {
      try {
        const res = await axios.get('http://localhost:3000/list', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const lists = res.data?.data?.rows || res.data?.data || res.data || [];
        if (Array.isArray(lists) && lists.length > 0) {
          setFirstListId(lists[0].id);
        }
      } catch (err) {
        console.error('❌ Failed to fetch lists:', err);
      }
    };

    fetchFirstList();
  }, []);

  // Sidebar toggle
  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    setTimeout(() => {
      navigate('/login');
    }, 800);
  };

  return (
    <div className="dashboard-container">
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

      <main className={`dashboard-main ${isOpen ? '' : 'full'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
