import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTemplates,
  deleteTemplate,
  toggleTemplateStatus,
  setSearch,
  setPage,
  selectTemplates,
  selectTotalTemplates,
  selectPage,
  selectLimit,
  selectSearch,
  selectTemplateLoading,
} from '../features/auth/templateSlice';

import { PencilFill, TrashFill, Plus } from 'react-bootstrap-icons';
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

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      dispatch(setSearch(localSearch));
      dispatch(setPage(1));
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [localSearch, dispatch]);

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

  const handleToggleStatus = async (template) => {
    const newStatus = !template.isActive; // ✅ boolean instead of 0/1

    dispatch(toggleTemplateStatus({ id: template.id, isActive: newStatus }))
      .unwrap()
      .then(() => {
        MySwal.fire({
          toast: true,
          icon: 'success',
          title: `Template ${newStatus ? 'enabled' : 'disabled'}`,
          timer: 1500,
          position: 'top-end',
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        console.error('Toggle Status Error:', error);
        MySwal.fire({
          icon: 'error',
          title: 'Failed to update status',
          text: error?.message || 'Something went wrong',
        });
      });
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
                <td>
                  <button
                    className={`status-toggle ${template.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleStatus(template)}
                    title="Toggle template status"
                  >
                    {template.isActive ? 'Enabled' : 'Disabled'}
                  </button>
                </td>
                <td>{new Date(template.createdAt).toLocaleString()}</td>
                <td className="action-buttons">
                  <button
                    className="icon-button edit"
                    onClick={() => handleEdit(template)}
                    title="Edit Template"
                  >
                    <PencilFill />
                  </button>
                  <button
                    className="icon-button delete"
                    onClick={() => handleDelete(template.id)}
                    title="Delete Template"
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

      {/* Pagination */}
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
