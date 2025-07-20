import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTemplates,
  deleteTemplate,
  selectTemplates
} from '../features/auth/templateSlice';
import { Button, Modal, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import TemplateFormModal from './TemplateFormModal';

const Templates = () => {
  const dispatch = useDispatch();
  const templates = useSelector(selectTemplates);
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Delete template?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      dispatch(deleteTemplate(id));
      Swal.fire('Deleted!', '', 'success');
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h3>Email Templates</h3>
        <Button onClick={() => { setSelectedTemplate(null); setShowModal(true); }}>
          + Add Template
        </Button>
      </div>

      <Table bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Description</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {templates?.length ? templates.map((t, idx) => (
            <tr key={t.id}>
              <td>{idx + 1}</td>
              <td>{t.name}</td>
              <td>{t.description}</td>
              <td>{new Date(t.createdAt).toLocaleString()}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleEdit(t)}>Edit</Button>{' '}
                <Button variant="danger" size="sm" onClick={() => handleDelete(t.id)}>Delete</Button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="5" className="text-center">No templates found</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal for Add/Edit */}
      <TemplateFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        template={selectedTemplate}
      />
    </div>
  );
};

export default Templates;
