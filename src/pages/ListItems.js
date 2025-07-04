import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import { PencilFill, TrashFill, Plus, Upload } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useParams } from 'react-router-dom';
import './ListItems.css';

const MySwal = withReactContent(Swal);

function ListItems() {
  const { id: listId } = useParams();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState({ id: '', email: '', name: '' });

  const [csvModal, setCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem('token');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ listId });

      if (search) {
        params.append('search', search);
        params.append('all', 'true');
      } else {
        params.append('page', page);
        params.append('limit', 10);
      }

      const res = await axios.get(`http://localhost:3000/list/item/filter?${params.toString()}`, {
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
  }, [page, search, token, listId]);

  useEffect(() => {
    if (listId) fetchItems();
  }, [fetchItems, listId]);

  const handleSearch = () => {
    setPage(1);
    fetchItems();
  };

  const handleOpenModal = (item = null) => {
    setCurrentItem(item ? { id: item.id, name: item.name, email: item.email } : { id: '', name: '', email: '' });
    setEditMode(!!item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentItem({ id: '', name: '', email: '' });
  };

  const showToast = (icon, title) => {
    MySwal.fire({
      toast: true,
      icon,
      title,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
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
        email: currentItem.email,
        listId: Number(listId)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showToast('success', editMode ? '✅ Updated!' : '✅ Added!');
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
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/list/item/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        showToast('success', '🗑️ Deleted!');
        fetchItems();
      } catch (err) {
        console.error('❌ Delete failed:', err);
        MySwal.fire('Error', 'Failed to delete item.', 'error');
      }
    }
  };

  const handleUploadCSV = async () => {
    if (!csvFile || uploading) return;

    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('listId', listId);

    try {
      setUploading(true);
      await axios.post('http://localhost:3000/list/item/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      setCsvFile(null);
      setCsvModal(false);
      showToast('success', '📤 CSV uploaded!');
      fetchItems();
    } catch (err) {
      console.error('❌ Upload failed:', err);
      MySwal.fire('Error', 'Failed to upload CSV.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>  List Items</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="upload-button" onClick={() => setCsvModal(true)}>
            <Upload /> Upload CSV
          </button>
          <button className="add-button" onClick={() => handleOpenModal()}>
            <Plus /> Add Item
          </button>
        </div>
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
              <tr><td colSpan="4" className="no-data">No items found.</td></tr>
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

      {/* Add/Edit Item Modal */}
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Item' : 'Add New Item'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                 {/* Full Name <small className="text-muted">(e.g., Tejendra Singh)</small> */}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter full name"
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                 {/* Email Address <small className="text-muted">(e.g., tejendra@example.com)</small> */}
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email address"
                value={currentItem.email}
                onChange={(e) => setCurrentItem({ ...currentItem, email: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit">{editMode ? 'Update' : 'Create'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Upload CSV Modal */}
      <Modal show={csvModal} onHide={() => setCsvModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>📤 Upload CSV File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select CSV file</Form.Label>
            <Form.Control
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              disabled={uploading}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setCsvModal(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUploadCSV} disabled={!csvFile || uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ListItems;
