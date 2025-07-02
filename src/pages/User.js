import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import './User.css';

const User = () => {
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/user/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:3000/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert('Failed to delete user. Only admin can delete users.');
    }
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setEditData({
      name: user.name,
      email: user.email,
      mobileCountryCode: user.mobileCountryCode,
      mobile: user.mobile,
      password: user.password,
    });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditData({});
  };

  const handleEditSave = async (id) => {
    try {
      await axios.put(`http://localhost:3000/user/${id}`, editData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(users.map((u) => (u.id === id ? { ...u, ...editData } : u)));
      setEditId(null);
      setEditData({});
    } catch (err) {
      alert('Failed to update user.');
    }
  };

  return (
    <div className="user-page">
      <h2 className="user-title">Users List</h2>
      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile Code</th>
              <th>Mobile</th>
              <th>Password</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="user-empty">No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>
                    {editId === u.id ? (
                      <input
                        name="name"
                        value={editData.name}
                        onChange={handleEditChange}
                        className="user-edit-input"
                      />
                    ) : (
                      u.name
                    )}
                  </td>
                  <td>
                    {editId === u.id ? (
                      <input
                        name="email"
                        value={editData.email}
                        onChange={handleEditChange}
                        className="user-edit-input"
                      />
                    ) : (
                      u.email
                    )}
                  </td>
                  <td>
                    {editId === u.id ? (
                      <input
                        name="mobileCountryCode"
                        value={editData.mobileCountryCode}
                        onChange={handleEditChange}
                        className="user-edit-input"
                        style={{ width: 50 }}
                      />
                    ) : (
                      u.mobileCountryCode
                    )}
                  </td>
                  <td>
                    {editId === u.id ? (
                      <input
                        name="mobile"
                        value={editData.mobile}
                        onChange={handleEditChange}
                        className="user-edit-input"
                        style={{ width: 110 }}
                      />
                    ) : (
                      u.mobile
                    )}
                  </td>
                  <td className="user-password">
                    {editId === u.id ? (
                      <input
                        name="password"
                        value={editData.password}
                        onChange={handleEditChange}
                        className="user-edit-input"
                        style={{ width: 180 }}
                      />
                    ) : (
                      u.password
                    )}
                  </td>
                  <td>
                    {editId === u.id ? (
                      <>
                        <button
                          className="user-edit-btn"
                          title="Save"
                          onClick={() => handleEditSave(u.id)}
                        >
                          <FaSave />
                        </button>
                        <button
                          className="user-edit-btn"
                          title="Cancel"
                          onClick={handleEditCancel}
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="user-edit-btn"
                          title="Edit"
                          onClick={() => handleEdit(u)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="user-delete-btn"
                          title="Delete"
                        >
                          <FaTrashAlt />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default User;