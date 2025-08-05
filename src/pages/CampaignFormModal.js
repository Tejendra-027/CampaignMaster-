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
  repeatType: 'daily',
  repeatEvery: 1,
  repeatEndsOn: '',
  isRepeat: false,
  status: 'Draft',
  monthlyOption: '',  // Added for monthly dropdown
};

const CampaignFormModal = ({ show, onHide, campaign, onSuccess }) => {
  const [form, setForm] = useState(defaultForm);
  const [lists, setLists] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [repeatOnDays, setRepeatOnDays] = useState([]);
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
      setRepeatOnDays(campaign.repeatOnDays || []);
    } else {
      setForm(defaultForm);
      setRepeatOnDays([]);
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
    const data = { ...form, repeatOnDays };
    try {
      if (isEdit) {
        await axios.put(`${API_BASE_URL}/${campaign.id}`, data, config);
        Swal.fire('Updated!', 'Campaign updated successfully', 'success');
      } else {
        await axios.post(API_BASE_URL, data, config);
        Swal.fire('Created!', 'Campaign added successfully', 'success');
      }
      onSuccess();
      onHide();
    } catch (err) {
      console.error(err);
      Swal.fire('Error!', 'Something went wrong', 'error');
    }
  };

  const formatPhoneNumber = (value) => {
    let cleaned = value.replace(/[^0-9+]/g, '');
    if (!cleaned.startsWith('+')) {
      cleaned = '+91' + cleaned;
    }
    return cleaned;
  };

  const renderSenderField = () => {
    const { channel, emailFrom } = form;
    if (channel === 'Email') {
      return (
        <Form.Group className="mb-3">
          <Form.Label>Sender Email</Form.Label>
          <Form.Control
            type="email"
            name="emailFrom"
            placeholder="e.g. info@yourcompany.com"
            value={emailFrom}
            onChange={handleChange}
          />
        </Form.Group>
      );
    }
    if (channel === 'SMS' || channel === 'WhatsApp') {
      return (
        <Form.Group className="mb-3">
          <Form.Label>Sender Number</Form.Label>
          <Form.Control
            type="tel"
            name="emailFrom"
            placeholder="e.g. +919876543210"
            value={emailFrom}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                emailFrom: formatPhoneNumber(e.target.value),
              }))
            }
          />
          <Form.Text muted>Include country code. Format: +91XXXXXXXXXX</Form.Text>
        </Form.Group>
      );
    }
    return null;
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
                  placeholder="e.g. Summer Sale, New Product Launch"
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

            <Col md={6}>{renderSenderField()}</Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Audience List</Form.Label>
                <Form.Select name="audienceListId" value={form.audienceListId} onChange={handleChange}>
                  <option value="">None</option>
                  {lists.map((list) => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </Form.Select>
                <Form.Text muted>Select the list of users you want to target.</Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Template</Form.Label>
                <Form.Select name="templateId" value={form.templateId} onChange={handleChange}>
                  <option value="">None</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                  ))}
                </Form.Select>
                <Form.Text muted>Pick a message template to use in this campaign.</Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>To</Form.Label>
                <Form.Control
                  name="to"
                  value={form.to}
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">
                  Separate multiple emails with commas
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>CC</Form.Label>
                <Form.Control
                  name="cc"
                  placeholder="CC (optional)"
                  value={form.cc}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>BCC</Form.Label>
                <Form.Control
                  name="bcc"
                  placeholder="BCC (optional)"
                  value={form.bcc}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h5 className="mb-3">Repeat Settings</h5>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Repeat Every</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="number"
                    min="1"
                    name="repeatEvery"
                    value={form.repeatEvery}
                    onChange={handleChange}
                    disabled={form.repeatType === ''}
                  />
                  <Form.Select
                    name="repeatType"
                    value={form.repeatType}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        repeatType: value,
                        ...(value !== 'monthly' ? { monthlyOption: '' } : {}),
                        ...(value === '' ? { repeatEndsOn: '' } : {}),
                      }));
                      if (value !== 'weekly') {
                        setRepeatOnDays([]);
                      }
                    }}
                  >
                    <option value="">None</option>
                    <option value="daily">Day</option>
                    <option value="weekly">Week</option>
                    <option value="monthly">Month</option>
                  </Form.Select>
                </div>
              </Form.Group>
            </Col>

            {/* Show this dropdown only if repeatType === monthly */}
            {form.repeatType === 'monthly' && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Monthly Repeat Option</Form.Label>
                  <Form.Select
                    name="monthlyOption"
                    value={form.monthlyOption || ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        monthlyOption: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Option</option>
                    <option value="day_23">Monthly on day 23</option>
                    <option value="4th_wednesday">Monthly on the 4th Wednesday</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Ends</Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <Form.Check
                    type="radio"
                    label="Never"
                    name="repeatEnds"
                    id="repeatEndsNever"
                    checked={!form.repeatEndsOn}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        repeatEndsOn: '',
                      }))
                    }
                    disabled={form.repeatType === ''}
                  />
                  <Form.Check
                    type="radio"
                    label="On"
                    name="repeatEnds"
                    id="repeatEndsOn"
                    checked={!!form.repeatEndsOn}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        repeatEndsOn: new Date().toISOString().split('T')[0],
                      }))
                    }
                    disabled={form.repeatType === ''}
                  />
                  <Form.Control
                    type="date"
                    name="repeatEndsOn"
                    value={form.repeatEndsOn}
                    onChange={handleChange}
                    disabled={!form.repeatEndsOn || form.repeatType === ''}
                    style={{ maxWidth: 200 }}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          {form.repeatType === 'weekly' && (
            <Row>
              <Col>
                <Form.Group >
                  <Form.Label >Repeat On</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                      const dayValues = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      const value = dayValues[index];
                      const selected = repeatOnDays.includes(value);
                      return (
                        <Form.Check
                          inline
                          type="checkbox"
                          key={value}
                          id={`day-${value}`}
                          label={day}
                          checked={selected}
                          onChange={() => {
                            setRepeatOnDays((prev) =>
                              prev.includes(value)
                                ? prev.filter((d) => d !== value)
                                : [...prev, value]
                            );
                          }}
                        />
                      );
                    })}
                  </div>
                </Form.Group>
              </Col>
            </Row>
          )}
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
