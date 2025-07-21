import React, { useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import EmailEditor from 'react-email-editor';
import { useDispatch } from 'react-redux';
import { createTemplate, updateTemplate, fetchTemplates } from '../features/auth/templateSlice';
import Swal from 'sweetalert2';

const TemplateFormModal = ({ show, onHide, template }) => {
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  const nameRef = useRef();
  const descRef = useRef();

  useEffect(() => {
    if (template && editorRef.current) {
      setTimeout(() => {
        editorRef.current?.editor?.loadDesign(JSON.parse(template.content));
      }, 500);
    }
  }, [template]);

  const handleSave = async () => {
    const name = nameRef.current.value.trim();
    const description = descRef.current.value.trim();

    if (!name) {
      Swal.fire('Name is required', '', 'error');
      return;
    }

    editorRef.current?.editor.exportHtml(async (data) => {
      const payload = {
        name,
        description,
        content: JSON.stringify(data.design)
      };

      try {
        if (template?.id) {
          await dispatch(updateTemplate({ id: template.id, data: payload })).unwrap();
          Swal.fire('Template Updated!', '', 'success');
        } else {
          await dispatch(createTemplate(payload)).unwrap();
          Swal.fire('Template Created!', '', 'success');
        }

        dispatch(fetchTemplates());
        onHide();
      } catch (err) {
        Swal.fire('Error', err?.message || 'Something went wrong', 'error');
      }
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered backdrop="static" className="template-modal">
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title className="fw-semibold">
          {template ? 'Edit Template' : 'New Template'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-3">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Template Name</Form.Label>
            <Form.Control
              ref={nameRef}
              defaultValue={template?.name || ''}
              placeholder="Enter template name"
              className="shadow-sm"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              ref={descRef}
              defaultValue={template?.description || ''}
              placeholder="Enter template description"
              className="shadow-sm"
            />
          </Form.Group>

          <div className="border rounded overflow-hidden shadow-sm">
            <EmailEditor ref={editorRef} minHeight="500px" />
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between px-4">
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {template ? 'Update Template' : 'Create Template'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TemplateFormModal;
