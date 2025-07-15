// src/pages/User.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-toastify/dist/ReactToastify.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import './User.css';

const BASE_URL         = 'http://localhost:3000';
const ENTRIES_PER_PAGE = 5;

export default function User() {
  /* ───────────────────── state ───────────────────── */
  const [users, setUsers]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [page,  setPage]    = useState(1);
  const [search,setSearch]  = useState('');

  const [editId,   setEditId]   = useState(null);
  const [editData, setEditData] = useState({});
  const [loading,  setLoading]  = useState(false);

  const token = localStorage.getItem('token');

  /* ─────────────────── fetch users ────────────────── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/user/filter`,
        { page, limit: ENTRIES_PER_PAGE, search },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      /* backend shape: { success, data:{ rows, total … } } */
      const payload           = data.data || {};
      const { rows = [], total = 0 } = payload;

      setUsers(rows);
      setTotal(total);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const totalPages = Math.max(1, Math.ceil(total / ENTRIES_PER_PAGE));

  /* ─────────────────── delete helpers ─────────────────── */
  const confirmDelete = (id) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this user?',
      buttons: [
        { label: 'Yes', onClick: () => deleteConfirmed(id) },
        { label: 'No' }
      ]
    });
  };

  const deleteConfirmed = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  /* ─────────────────── edit helpers ─────────────────── */
  const handleEdit = (u) => {
    setEditId(u.id);
    setEditData({
      name: u.name,
      email: u.email,
      mobileCountryCode: u.mobileCountryCode,
      mobile: u.mobile,
      newPassword: ''
    });
  };

  const handleEditChange  = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });
  const handleEditCancel  = () => { setEditId(null); setEditData({}); };

  const handleEditSave = async (id) => {
    try {
      await axios.put(`${BASE_URL}/user/${id}`, editData,
        { headers: { Authorization: `Bearer ${token}` } });

      if (editData.newPassword?.trim()) {
        await axios.put(`${BASE_URL}/user/reset-password/${id}`,
          { newPassword: editData.newPassword },
          { headers: { Authorization: `Bearer ${token}` } });
      }

      toast.success('User updated');
      handleEditCancel();
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Update failed');
    }
  };

  /* ─────────────────────── render ────────────────────── */
  return (
    <div className="user-page">
      <ToastContainer />
      <h2 className="user-title">Users List</h2>

      {/* search */}
      <div className="user-search-bar">
        <input
          type="text"
          placeholder="Search name / email / mobile..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Email</th>
                  <th>Code</th><th>Mobile</th><th>Password</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7} className="user-empty">No users found.</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>

                    <td>{editId === u.id
                      ? <input name="name" value={editData.name} onChange={handleEditChange} className="user-edit-input"/> : u.name}</td>

                    <td>{editId === u.id
                      ? <input name="email" value={editData.email} onChange={handleEditChange} className="user-edit-input"/> : u.email}</td>

                    <td>{editId === u.id
                      ? <input name="mobileCountryCode" value={editData.mobileCountryCode} onChange={handleEditChange} style={{width:50}} className="user-edit-input"/> : u.mobileCountryCode}</td>

                    <td>{editId === u.id
                      ? <input name="mobile" value={editData.mobile} onChange={handleEditChange} style={{width:110}} className="user-edit-input"/> : u.mobile}</td>

                    <td className="user-password">{editId === u.id
                      ? <input type="password" name="newPassword" placeholder="Reset Password" value={editData.newPassword} onChange={handleEditChange} style={{width:160}} className="user-edit-input"/> : '••••••••'}</td>

                    <td>
                      {editId === u.id ? (
                        <>
                          <button className="user-edit-btn" title="Save"   onClick={() => handleEditSave(u.id)}><FaSave /></button>
                          <button className="user-edit-btn" title="Cancel" onClick={handleEditCancel}><FaTimes /></button>
                        </>
                      ) : (
                        <>
                          <button className="user-edit-btn" title="Edit"   onClick={() => handleEdit(u)}><FaEdit /></button>
                          <button className="user-delete-btn" title="Delete" onClick={() => confirmDelete(u.id)}><FaTrashAlt /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* pagination */}
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1}>⬅ Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => p+1)} disabled={page >= totalPages}>Next ➡</button>
          </div>
        </>
      )}
    </div>
  );
}
