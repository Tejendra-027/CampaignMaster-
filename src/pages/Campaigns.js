// src/pages/Campaigns.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PencilFill,
  TrashFill,
  Plus,
  Files,
  ToggleOn,
  ToggleOff,
} from 'react-bootstrap-icons';
import CampaignFormModal from './CampaignFormModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './Templates.css';

const MySwal = withReactContent(Swal);
const API = 'http://localhost:3000/api/campaign'; // ✅ correct port

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);
  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        params: { page, limit, search },
        ...config,
      });
      setCampaigns(res.data.campaigns || []);
      setTotal(res.data.totalCount || 0);
    } catch (err) {
      console.error('Load campaigns error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [page, search]);

  const handleDelete = async (id) => {
    const confirm = await MySwal.fire({
      title: 'Are you sure?',
      text: 'This will soft delete the campaign.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });
    if (confirm.isConfirmed) {
      await axios.delete(`${API}/${id}`, config);
      await loadCampaigns();
      MySwal.fire({
        toast: true,
        icon: 'success',
        title: 'Deleted',
        timer: 1500,
        showConfirmButton: false,
        position: 'top-end',
      });
    }
  };

  const handleStatusToggle = async (campaign) => {
    const newStatus = campaign.status === 'Draft' ? 'Published' : 'Draft';
    await axios.patch(
      `${API}/${campaign.id}/status`,
      { status: newStatus },
      config
    );
    await loadCampaigns();
    MySwal.fire({
      toast: true,
      icon: 'success',
      title: `Status: ${newStatus}`,
      timer: 1500,
      showConfirmButton: false,
      position: 'top-end',
    });
  };

  const handleCopy = async (id) => {
    await axios.post(`${API}/${id}/copy`, {}, config);
    await loadCampaigns();
    MySwal.fire({
      toast: true,
      icon: 'success',
      title: 'Campaign copied',
      timer: 1500,
      showConfirmButton: false,
      position: 'top-end',
    });
  };

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedCampaign(null);
    setShowModal(true);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Campaign Manager</h2>
        <button className="add-button" onClick={handleAdd}>
          <Plus /> Add Campaign
        </button>
      </div>

      <div className="search-bar">
        <input
          placeholder="Search campaigns…"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <table className="list-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Title</th>
            <th>Channel</th>
            <th>Status</th>
            <th>Start Date</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="no-data">Loading...</td>
            </tr>
          ) : campaigns.length ? (
            campaigns.map((campaign, idx) => (
              <tr key={campaign.id}>
                <td>{(page - 1) * limit + idx + 1}</td>
                <td>{campaign.name}</td>
                <td>{campaign.channel}</td>
                <td>
                  <button
                    className={`status-toggle ${campaign.status === 'Published' ? 'active' : 'inactive'}`}
                    onClick={() => handleStatusToggle(campaign)}
                  >
                    {campaign.status === 'Published' ? <ToggleOn /> : <ToggleOff />}
                  </button>
                </td>
                <td>{campaign.startDate ? new Date(campaign.startDate).toLocaleString() : '-'}</td>
                <td className="action-buttons">
                  <button className="icon-button edit" onClick={() => handleEdit(campaign)} title="Edit">
                    <PencilFill />
                  </button>
                  <button className="icon-button delete" onClick={() => handleDelete(campaign.id)} title="Delete">
                    <TrashFill />
                  </button>
                  <button className="icon-button copy" onClick={() => handleCopy(campaign.id)} title="Copy Campaign">
                    <Files />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data">No campaigns found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {total > limit && (
        <div className="pagination-controls">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>&laquo; Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next &raquo;</button>
        </div>
      )}

      <CampaignFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        campaign={selectedCampaign}
        onSuccess={loadCampaigns}
      />
    </div>
  );
};

export default Campaigns;
