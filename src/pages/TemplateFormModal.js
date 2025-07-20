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
          Swal.fire('Updated!', '', 'success');
        } else {
          await dispatch(createTemplate(payload)).unwrap();
          Swal.fire('Created!', '', 'success');
        }

        dispatch(fetchTemplates());
        onHide();
      } catch (err) {
        Swal.fire('Error', err, 'error');
      }
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{template ? 'Edit Template' : 'New Template'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-2">
          <Form.Label>Template Name</Form.Label>
          <Form.Control
            ref={nameRef}
            defaultValue={template?.name || ''}
            placeholder="Enter template name"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            ref={descRef}
            defaultValue={template?.description || ''}
            placeholder="Enter template description"
          />
        </Form.Group>

        <EmailEditor ref={editorRef} minHeight="500px" />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TemplateFormModal;
