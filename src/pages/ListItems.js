import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import { PencilFill, TrashFill, Plus } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './ListItems.css';

const MySwal = withReactContent(Swal);

function ListItems() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: '', email: '', name: '' });

  const token = localStorage.getItem('token');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const baseUrl = `http://localhost:3000/list/item/filter`;
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

      setItems(data);
      setHasMore(!search && data.length === 10);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = () => {
    setPage(1);
    fetchItems();
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setCurrentItem({ id: item.id, name: item.name, email: item.email });
      setEditMode(true);
    } else {
      setCurrentItem({ id: '', name: '', email: '' });
      setEditMode(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentItem({ id: '', name: '', email: '' });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editMode
        ? `http://localhost:3000/list/item/add/${currentItem.id}`
        : `http://localhost:3000/list/item/add`;

      const method = editMode ? axios.put : axios.post;

      await method(endpoint, {
        name: currentItem.name,
        email: currentItem.email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      MySwal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: editMode ? '✅ Item updated!' : '✅ Item added!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });

      handleCloseModal();
      fetchItems();
    } catch (err) {
      console.error('❌ Save failed:', err);
      MySwal.fire('Error', 'Failed to save item.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await MySwal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this item!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/list/item/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        MySwal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: '🗑️ Item deleted!',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });

        fetchItems();
      } catch (err) {
        console.error('❌ Delete failed:', err);
        MySwal.fire('Error', 'Failed to delete item.', 'error');
      }
    }
  };

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>📧 List Items</h2>
        <button className="add-button" onClick={() => handleOpenModal()}>
          <Plus /> Add Item
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <table className="list-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">No items found.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td className="action-buttons">
                    <button className="icon-button edit" onClick={() => handleOpenModal(item)}>
                      <PencilFill />
                    </button>
                    <button className="icon-button delete" onClick={() => handleDelete(item.id)}>
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
          <Modal.Title>{editMode ? 'Edit Item' : 'Add New Item'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={currentItem.email}
                onChange={(e) => setCurrentItem({ ...currentItem, email: e.target.value })}
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

export default ListItems;
