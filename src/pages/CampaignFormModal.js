import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import axios from 'axios';

const LIST_API = 'http://localhost:3000/api/list/filter';
const TEMPLATE_API = 'http://localhost:3000/api/templates/filter';
const API_BASE_URL = 'http://localhost:3000/api/campaign';


const defaultForm = {
  name: '',
  channel: 'Email',
  startDate: '',
  emailFrom: '',
  audienceListId: '',
  templateId: '',
  to: '',
  cc: '',
  bcc: '',
  repeatType: 'none',
  repeatEvery: 0,
  repeatOn: '',
  repeatEndsOn: '',
  isRepeat: false,
  status: 'Draft',
};

const CampaignFormModal = ({ show, onHide, campaign, onSuccess }) => {
  const [form, setForm] = useState(defaultForm);
  const [lists, setLists] = useState([]);
  const [templates, setTemplates] = useState([]);
  const isEdit = !!campaign;

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (show) {
      fetchLists();
      fetchTemplates();
    }
  }, [show]);

  useEffect(() => {
    if (isEdit) {
      setForm({ ...defaultForm, ...campaign });
    } else {
      setForm(defaultForm);
    }
  }, [campaign]);

  const fetchLists = async () => {
    try {
      const res = await axios.post(LIST_API, { page: 1, limit: 100 }, config);
      setLists(res.data.rows || []);
    } catch (err) {
      console.error('Error fetching lists:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await axios.post(TEMPLATE_API, { page: 1, limit: 100, search: '' }, config);
      setTemplates(res.data.data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`${API_BASE_URL}/${campaign.id}`, form, config);
        Swal.fire('Updated!', 'Campaign updated successfully', 'success');
      } else {
        await axios.post(API_BASE_URL, form, config);
        Swal.fire('Created!', 'Campaign added successfully', 'success');
      }
      onSuccess();
      onHide();
    } catch (err) {
      console.error(err);
      Swal.fire('Error!', 'Something went wrong', 'error');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Edit Campaign' : 'Add Campaign'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Campaign Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Channel</Form.Label>
                <Form.Select name="channel" value={form.channel} onChange={handleChange}>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="IVR">IVR</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email From</Form.Label>
                <Form.Control
                  type="email"
                  name="emailFrom"
                  value={form.emailFrom}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Audience List</Form.Label>
                <Form.Select name="audienceListId" value={form.audienceListId} onChange={handleChange}>
                  <option value="">Select List</option>
                  {lists.map((list) => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Template</Form.Label>
                <Form.Select name="templateId" value={form.templateId} onChange={handleChange}>
                  <option value="">Select Template</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>To</Form.Label>
                <Form.Control name="to" value={form.to} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>CC</Form.Label>
                <Form.Control name="cc" value={form.cc} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>BCC</Form.Label>
                <Form.Control name="bcc" value={form.bcc} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h5>Repeat Settings</h5>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Repeat Type</Form.Label>
                <Form.Select name="repeatType" value={form.repeatType} onChange={handleChange}>
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Repeat Every</Form.Label>
                <Form.Control
                  type="number"
                  name="repeatEvery"
                  min={0}
                  value={form.repeatEvery}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Repeat Ends On</Form.Label>
                <Form.Control
                  type="date"
                  name="repeatEndsOn"
                  value={form.repeatEndsOn}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Check
                  label="Enable Repeat"
                  name="isRepeat"
                  checked={form.isRepeat}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button variant="primary" type="submit">{isEdit ? 'Update' : 'Create'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CampaignFormModal;
