import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTemplates,
  deleteTemplate,
  setSearch,
  setPage,
  selectTemplates,
  selectTotalTemplates,
  selectPage,
  selectLimit,
  selectSearch,
  selectTemplateLoading,
} from '../features/auth/templateSlice';

import { PencilFill, TrashFill, Plus, Search } from 'react-bootstrap-icons';
import Swal from 'sweetalert2';
import TemplateFormModal from './TemplateFormModal';
import withReactContent from 'sweetalert2-react-content';
import './Templates.css';

const MySwal = withReactContent(Swal);

const Templates = () => {
  const dispatch = useDispatch();

  const templates = useSelector(selectTemplates);
  const totalTemplates = useSelector(selectTotalTemplates);
  const currentPage = useSelector(selectPage);
  const limit = useSelector(selectLimit);
  const searchTerm = useSelector(selectSearch);
  const loading = useSelector(selectTemplateLoading);

  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [localSearch, setLocalSearch] = useState(searchTerm || '');

  const totalPages = Math.ceil(totalTemplates / limit);

  useEffect(() => {
    dispatch(fetchTemplates({ page: currentPage, limit, search: searchTerm }));
  }, [dispatch, currentPage, limit, searchTerm]);

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
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      dispatch(deleteTemplate(id));
      MySwal.fire({
        toast: true,
        icon: 'success',
        title: 'Deleted!',
        timer: 1800,
        position: 'top-end',
        showConfirmButton: false,
      });
    }
  };

  const handleSearchSubmit = () => {
    dispatch(setSearch(localSearch));
    dispatch(setPage(1));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      dispatch(setPage(newPage));
    }
  };

  return (
    <div className="list-container">
      {/* Header */}
      <div className="list-header">
        <h2>Template Manager</h2>
        <button
          className="add-button"
          onClick={() => {
            setSelectedTemplate(null);
            setShowModal(true);
          }}
        >
          <Plus /> Add Template
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          value={localSearch}
          placeholder="Search by title…"
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        <button onClick={handleSearchSubmit}>
          <Search /> Search
        </button>
      </div>

      {/* Table */}
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
          {loading ? (
            <tr>
              <td colSpan="5" className="no-data">Loading...</td>
            </tr>
          ) : templates?.length ? (
            templates.map((template, idx) => (
              <tr key={template.id}>
                <td>{(currentPage - 1) * limit + idx + 1}</td>
                <td>{template.name}</td>
                <td>{template.status || '—'}</td>
                <td>{new Date(template.createdAt).toLocaleString()}</td>
                <td className="action-buttons">
                  <button
                    className="icon-button edit"
                    onClick={() => handleEdit(template)}
                  >
                    <PencilFill />
                  </button>
                  <button
                    className="icon-button delete"
                    onClick={() => handleDelete(template.id)}
                  >
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

      {/* Pagination (only show if more than one page) */}
      {totalTemplates > limit && (
        <div className="pagination-controls">
          <button
            className="pagination-button"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            &laquo; Prev
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-button"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next &raquo;
          </button>
        </div>
      )}

      {/* Modal */}
      <TemplateFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        template={selectedTemplate}
      />
    </div>
  );
};

export default Templates;
