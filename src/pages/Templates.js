// src/pages/Templates.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTemplates,
  deleteTemplate,
  selectTemplates
} from '../features/auth/templateSlice';
import { Modal, Button, Form } from 'react-bootstrap';
import { PencilFill, TrashFill, Plus, Search } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import TemplateFormModal from './TemplateFormModal';
import withReactContent from 'sweetalert2-react-content';
import './Templates.css';

const MySwal = withReactContent(Swal);

const Templates = () => {
  const dispatch = useDispatch();
  const templates = useSelector(selectTemplates);
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = await MySwal.fire({
      title: 'Delete this template?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      dispatch(deleteTemplate(id));
      MySwal.fire({ toast: true, icon: 'success', title: 'Deleted!', timer: 1800, position: 'top-end', showConfirmButton: false });
    }
  };

  const filteredTemplates = templates?.filter((t) =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="list-container">
      {/* header */}
      <div className="list-header">
        <h2>Template Manager</h2>
        <button className="add-button" onClick={() => {
          setSelectedTemplate(null);
          setShowModal(true);
        }}>
          <Plus /> Add Template
        </button>
      </div>

      {/* search */}
      <div className="search-bar">
        <input
          value={searchTerm}
          placeholder="Search by title…"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => {}}>
          <Search /> Search
        </button>
      </div>

      {/* table */}
      <table className="list-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Title</th>
            <th>Status</th>
            <th>Created At</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTemplates?.length ? (
            filteredTemplates.map((template, idx) => (
              <tr key={template.id}>
                <td>{idx + 1}</td>
                <td>{template.name}</td>
                <td>{template.status || '—'}</td>
                <td>{new Date(template.createdAt).toLocaleString()}</td>
                <td className="action-buttons">
                  <button className="icon-button edit"
                          onClick={() => handleEdit(template)}>
                    <PencilFill />
                  </button>
                  <button className="icon-button delete"
                          onClick={() => handleDelete(template.id)}>
                    <TrashFill />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-data">No templates found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* modal */}
      <TemplateFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        template={selectedTemplate}
      />
    </div>
  );
};

export default Templates;
