import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import { PencilFill, TrashFill, Plus, Search } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './Lists.css';

const MySwal = withReactContent(Swal);

function Lists() {
  const [lists, setLists] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentList, setCurrentList] = useState({ id: '', name: '' });

  const token = localStorage.getItem('token');

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const baseUrl = `http://localhost:3000/list`;
      const params = new URLSearchParams();

      if (search) {
        params.append('search', search);
        params.append('all', 'true');
      } else {
        params.append('page', page);
        params.append('limit', 10);
      }

      const res = await axios.get(`${baseUrl}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = Array.isArray(res.data?.data?.rows)
        ? res.data.data.rows
        : Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setLists(data);
      setHasMore(!search && data.length === 10);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, token]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const handleSearch = () => {
    setPage(1);
    fetchLists();
  };

  const handleOpenModal = (list = null) => {
    if (list) {
      setCurrentList({ id: list.id, name: list.name });
      setEditMode(true);
    } else {
      setCurrentList({ id: '', name: '' });
      setEditMode(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentList({ id: '', name: '' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editMode
        ? `http://localhost:3000/list/${currentList.id}`
        : `http://localhost:3000/list`;

      const method = editMode ? axios.put : axios.post;

      await method(endpoint, { name: currentList.name }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      MySwal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: editMode ? '✅ List updated!' : '✅ List added!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });

      handleCloseModal();
      fetchLists();
    } catch (err) {
      console.error('❌ Save failed:', err);
      MySwal.fire('Error', 'Failed to save list.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await MySwal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/list/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        fetchLists();

        MySwal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: '🗑️ List deleted!',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      } catch (err) {
        console.error('❌ Delete failed:', err);
        MySwal.fire('Error', 'Failed to delete list.', 'error');
      }
    }
  };

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>  List Manager</h2>
        <button className="add-button" onClick={() => handleOpenModal()}>
          <Plus /> Add List
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}><Search /> Search</button>
      </div>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <table className="list-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lists.length === 0 ? (
              <tr>
                <td colSpan="3" className="no-data">No lists found.</td>
              </tr>
            ) : (
              lists.map((list) => (
                <tr key={list.id}>
                  <td>{list.id}</td>
                  <td>{list.name}</td>
                  <td className="action-buttons">
                    <button className="icon-button edit" onClick={() => handleOpenModal(list)}>
                      <PencilFill />
                    </button>
                    <button className="icon-button delete" onClick={() => handleDelete(list.id)}>
                      <TrashFill />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {!search && (
        <div className="pagination">
          <button onClick={() => setPage(page - 1)} disabled={page === 1}>⬅ Prev</button>
          <span>Page {page}</span>
          <button onClick={() => setPage(page + 1)} disabled={!hasMore}>Next ➡</button>
        </div>
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit List' : 'Add New List'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            {editMode && (
              <Form.Group className="mb-3">
                <Form.Label>ID</Form.Label>
                <Form.Control type="text" value={currentList.id} disabled />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Enter list name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter event name"
                value={currentList.name}
                onChange={(e) => setCurrentList({ ...currentList, name: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit">
              {editMode ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Lists;
