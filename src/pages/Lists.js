import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import { PencilFill, TrashFill, Plus, Search, Eye } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from 'react-router-dom';
import './Lists.css';

const MySwal     = withReactContent(Swal);
const API_BASE   = 'http://localhost:3000';
const PAGE_LIMIT = 5;

function Lists() {
  const [lists, setLists]         = useState([]);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(false);
  const [loading, setLoading]     = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode]   = useState(false);
  const [current, setCurrent]     = useState({ id: '', name: '' });

  const navigate = useNavigate();
  const token    = localStorage.getItem('token');

  /* ------------------------------------------------------------------ */
  /* Fetch lists                                                        */
  /* ------------------------------------------------------------------ */
  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
        params.append('all', 'true');
      } else {
        params.append('page', page);
        params.append('limit', PAGE_LIMIT);
      }
      const { data: res } = await axios.get(`${API_BASE}/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rows = Array.isArray(res?.data?.rows)
        ? res.data.rows
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      setLists(rows);
      setHasMore(!search && rows.length === PAGE_LIMIT);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, token]);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  /* ------------------------------------------------------------------ */
  /* Modal helpers                                                      */
  /* ------------------------------------------------------------------ */
  const openModal  = list => { setCurrent(list || { id: '', name: '' }); setEditMode(!!list); setShowModal(true); };
  const closeModal = ()   => { setShowModal(false); setCurrent({ id: '', name: '' }); };

  /* ------------------------------------------------------------------ */
  /* Add / Edit                                                         */
  /* ------------------------------------------------------------------ */
  const submitForm = async e => {
    e.preventDefault();
    try {
      const url    = editMode ? `${API_BASE}/list/${current.id}` : `${API_BASE}/list`;
      const method = editMode ? axios.put : axios.post;
      await method(url, { name: current.name }, { headers: { Authorization: `Bearer ${token}` } });

      MySwal.fire({ toast: true, position: 'top-end', icon: 'success',
        title: editMode ? '✅ List updated!' : '✅ List added!', showConfirmButton: false, timer: 2000 });
      closeModal();
      fetchLists();
    } catch (err) {
      console.error('❌ Save failed:', err);
      MySwal.fire('Error', 'Failed to save list.', 'error');
    }
  };

  /* ------------------------------------------------------------------ */
  /* Delete with “manual cascade”                                       */
  /* ------------------------------------------------------------------ */
  const deleteList = async id => {
    const { isConfirmed } = await MySwal.fire({
      title: 'Are you sure?', text: 'This deletes the list and its items.',
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, delete!', reverseButtons: true,
    });
    if (!isConfirmed) return;

    try {
      /* 1. fetch ALL items for this list */
      const { data: itemRes } = await axios.get(
        `${API_BASE}/list/item/filter?listId=${id}&all=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const items = Array.isArray(itemRes?.data) ? itemRes.data
                  : Array.isArray(itemRes)       ? itemRes
                  : [];

      /* 2. delete each item in parallel (if any) */
      if (items.length) {
        await Promise.all(
          items.map(item =>
            axios.delete(`${API_BASE}/list/item/${item.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
      }

      /* 3. delete the list itself */
      await axios.delete(`${API_BASE}/list/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      /* 4. refresh */
      if (lists.length === 1 && page > 1) setPage(p => p - 1); // step back if last item on page
      await fetchLists();

      MySwal.fire({ toast: true, position: 'top-end', icon: 'success',
        title: '🗑️ List deleted!', showConfirmButton: false, timer: 2000 });
    } catch (err) {
      console.error('❌ Delete failed:', err);
      MySwal.fire('Error', 'Failed to delete list.', 'error');
    }
  };

  /* ------------------------------------------------------------------ */
  /* JSX                                                                */
  /* ------------------------------------------------------------------ */
  return (
    <div className="list-container">
      {/* header */}
      <div className="list-header">
        <h2>List Manager</h2>
        <button className="add-button" onClick={() => openModal(null)}>
          <Plus /> Add List
        </button>
      </div>

      {/* search */}
      <div className="search-bar">
        <input
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={() => { setPage(1); fetchLists(); }}><Search /> Search</button>
      </div>

      {/* table */}
      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <table className="list-table">
          <thead>
            <tr><th>ID</th><th>Name</th><th style={{ textAlign: 'center' }}>Actions</th></tr>
          </thead>
          <tbody>
            {lists.length === 0 ? (
              <tr><td colSpan="3" className="no-data">No lists found.</td></tr>
            ) : (
              lists.map(list => (
                <tr key={list.id}>
                  <td>{list.id}</td>
                  <td>{list.name}</td>
                  <td className="action-buttons">
                    <button className="icon-button view"
                            onClick={() => navigate(`/dashboard/lists/${list.id}/items`)}>
                      <Eye />
                    </button>
                    <button className="icon-button edit" onClick={() => openModal(list)}>
                      <PencilFill />
                    </button>
                    <button className="icon-button delete" onClick={() => deleteList(list.id)}>
                      <TrashFill />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* pagination */}
      {!search && (
        <div className="pagination">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>⬅ Prev</button>
          <span>Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!hasMore}>Next ➡</button>
        </div>
      )}

      {/* modal */}
      <Modal show={showModal} onHide={closeModal} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit List' : 'Add New List'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitForm}>
          <Modal.Body>
            {editMode && (
              <Form.Group className="mb-3">
                <Form.Label>ID</Form.Label>
                <Form.Control value={current.id} disabled />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Enter list name</Form.Label>
              <Form.Control
                placeholder="Enter list name"
                value={current.name}
                onChange={e => setCurrent({ ...current, name: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" type="submit">{editMode ? 'Update' : 'Create'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Lists;
