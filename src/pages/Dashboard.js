// src/pages/Dashboard.js
import React, { useState, useCallback } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Dashboard.css';
import { FaUser, FaList } from 'react-icons/fa';

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    requestAnimationFrame(() => {
      setIsOpen(prev => !prev);
    });
  }, []);

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
        <button className="toggle-btn" onClick={toggleSidebar}>
          &#9776;
        </button>
        <nav className="nav-items">
          <NavLink to="users" className="nav-link">
            <FaUser className="icon" /> <span className="nav-text">Users</span>
          </NavLink>
          <NavLink to="lists" className="nav-link">
            <FaList className="icon" /> <span className="nav-text">Lists</span>
          </NavLink>
        </nav>
      </aside>
      <main className={`dashboard-main ${isOpen ? '' : 'full'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
