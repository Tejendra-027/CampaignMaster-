import React, { useState, useCallback, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { FaUser, FaList, FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [firstListId, setFirstListId] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Check for JWT token on mount
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [navigate, token]);

  // Fetch first list ID for dynamic link
  useEffect(() => {
    const fetchFirstList = async () => {
      try {
        const res = await axios.get('http://localhost:3000/list', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const lists = res.data?.data || res.data;
        if (Array.isArray(lists) && lists.length > 0) {
          setFirstListId(lists[0].id);
        }
      } catch (err) {
        console.error('❌ Failed to fetch lists:', err);
      }
    };

    fetchFirstList();
  }, [token]);

  // Toggle sidebar collapse
  const toggleSidebar = useCallback(() => {
    requestAnimationFrame(() => {
      setIsOpen(prev => !prev);
    });
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
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

            {firstListId && (
              <NavLink
                to={`/dashboard/lists/${firstListId}/items`}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <FaEnvelope className="icon" />
                <span className="nav-text">List Items</span>
              </NavLink>
            )}
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
