// src/pages/Lists.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import { PencilFill, TrashFill, Plus, Search, Eye } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from 'react-router-dom';
import './Lists.css';

const MySwal     = withReactContent(Swal);
const API        = 'http://localhost:3000';
const PER_PAGE   = 5;
const BLANK_ROW  = { id: '', name: '' };

export default function Lists () {
  /* ───────────────────────── state ───────────────────────── */
  const [rows,  setRows ] = useState([]);
  const [total, setTotal] = useState(0);
  const [page,  setPage ] = useState(1);
  const [q,     setQ    ] = useState('');

  const [modalOpen,  setModalOpen ] = useState(false);
  const [editing,    setEditing   ] = useState(false);
  const [current,    setCurrent   ] = useState(BLANK_ROW);
  const [busy,       setBusy      ] = useState(false);

  const token   = localStorage.getItem('token');
  const nav     = useNavigate();
  const cfg     = { headers: { Authorization: `Bearer ${token}` } };
  const hasNext = page * PER_PAGE < total;

  /* ─────────────────── fetch helper ─────────────────── */
  const load = useCallback(async () => {
    setBusy(true);
    try {
      const body = { page, limit: PER_PAGE, search: q.trim() };
      const { data } = await axios.post(`${API}/list/filter`, body, cfg);

      setRows (Array.isArray(data?.rows) ? data.rows : []);
      setTotal(Number.isFinite(data?.total) ? data.total : 0);
    } catch (e) {
      console.error('[Lists] fetch', e);
      setRows([]); setTotal(0);
    } finally { setBusy(false); }
  }, [page, q, token]);

  useEffect(() => { load(); }, [load]);

  /* ─────────────────── create / update ─────────────────── */
  const save = async e => {
    e.preventDefault();
    try {
      const url = editing ? `${API}/list/${current.id}` : `${API}/list`;
      const fn  = editing ? axios.put : axios.post;
      await fn(url, { name: current.name }, cfg);

      MySwal.fire({ toast: true, icon: 'success', position: 'top-end',
        title: editing ? 'List updated' : 'List created',
        showConfirmButton: false, timer: 1800 });

      setModalOpen(false); setCurrent(BLANK_ROW);
      setPage(1); load();
    } catch (e) {
      console.error('[Lists] save', e);
      MySwal.fire('Error', 'Could not save list', 'error');
    }
  };

  /* ─────────────────── cascade‑delete ─────────────────── */
  const remove = async id => {
    const ok = await MySwal.fire({
      title: 'Delete?', text: 'List and all items will be removed.',
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, delete!'
    });
    if (!ok.isConfirmed) return;

    try {
      // 1. get all items for that list
      const { data } = await axios.post(`${API}/list/item/filter`,
        { listId: id, page: 1, limit: 999999 }, cfg);
      const items = Array.isArray(data?.rows) ? data.rows : [];

      // 2. delete each item
      await Promise.all(items.map(r => axios.delete(`${API}/list/item/${r.id}`, cfg)));

      // 3. delete list
      await axios.delete(`${API}/list/${id}`, cfg);

      MySwal.fire({ toast: true, icon: 'success', position: 'top-end',
        title: 'List deleted', showConfirmButton: false, timer: 1600 });

      setPage(p => (rows.length === 1 && p > 1 ? p - 1 : p));
      load();
    } catch (e) {
      console.error('[Lists] delete', e);
      MySwal.fire('Error', 'Delete failed', 'error');
    }
  };

  /* ─────────────────── render ─────────────────── */
  return (
    <div className="list-container">
      {/* header */}
      <div className="list-header">
        <h2>List Manager</h2>
        <button className="add-button"
                onClick={() => { setEditing(false); setCurrent(BLANK_ROW); setModalOpen(true); }}>
          <Plus /> Add List
        </button>
      </div>

      {/* search */}
      <div className="search-bar">
        <input value={q} placeholder="Search by name…"
               onChange={e => { setQ(e.target.value); setPage(1); }} />
        <button onClick={load}><Search /> Search</button>
      </div>

      {/* table */}
      {busy ? (
        <p className="loading">Loading…</p>
      ) : (
        <table className="list-table">
          <thead>
            <tr><th>ID</th><th>Name</th><th style={{textAlign:'center'}}>Actions</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan="3" className="no-data">No lists found.</td></tr>
            ) : rows.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.name}</td>
                <td className="action-buttons">
                  <button className="icon-button view"
                          onClick={() => nav(`/dashboard/lists/${r.id}/items`)}>
                    <Eye />
                  </button>
                  <button className="icon-button edit"
                          onClick={() => { setEditing(true); setCurrent(r); setModalOpen(true); }}>
                    <PencilFill />
                  </button>
                  <button className="icon-button delete" onClick={() => remove(r.id)}>
                    <TrashFill />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* pagination */}
      {total > PER_PAGE && (
        <div className="pagination">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>⬅ Prev</button>
          <span>Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!hasNext}>Next ➡</button>
        </div>
      )}

      {/* modal */}
      <Modal show={modalOpen} onHide={() => setModalOpen(false)} backdrop="static">
        <Modal.Header closeButton><Modal.Title>{editing ? 'Edit List' : 'Add List'}</Modal.Title></Modal.Header>
        <Form onSubmit={save}>
          <Modal.Body>
            {editing && (
              <Form.Group className="mb-2">
                <Form.Label>ID</Form.Label>
                <Form.Control value={current.id} disabled />
              </Form.Group>
            )}
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control value={current.name}
                            onChange={e => setCurrent({...current, name: e.target.value})}
                            placeholder="List name" required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editing ? 'Update' : 'Create'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
