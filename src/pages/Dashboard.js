// src/pages/Dashboard.js
import React, { useState, useCallback, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { FaUser, FaList, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  // Protect dashboard from unauthorized access
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Toggle sidebar open/closed
  const toggleSidebar = useCallback(() => {
    requestAnimationFrame(() => {
      setIsOpen(prev => !prev);
    });
  }, []);

  // Handle logout
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
        <button className="toggle-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
          &#9776;
        </button>
        <div className="sidebar-content">
          <nav className="nav-items">
            <NavLink to="/dashboard/users" className="nav-link">
              <FaUser className="icon" /> <span className="nav-text">Users</span>
            </NavLink>
            <NavLink to="/dashboard/lists" className="nav-link">
              <FaList className="icon" /> <span className="nav-text">Lists</span>
            </NavLink>
          </nav>
          <button className="nav-link logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="icon" /> <span className="nav-text">Logout</span>
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
