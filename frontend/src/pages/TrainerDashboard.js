import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './TrainerDashboard.css';

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans/trainer/my-plans');
      setPlans(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load plans');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingPlan) {
        await api.put(`/plans/${editingPlan._id}`, formData);
        setSuccess('Plan updated successfully');
      } else {
        await api.post('/plans', formData);
        setSuccess('Plan created successfully');
      }
      setShowForm(false);
      setEditingPlan(null);
      setFormData({ title: '', description: '', price: '', duration: '' });
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      price: plan.price,
      duration: plan.duration
    });
    setShowForm(true);
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    try {
      await api.delete(`/plans/${planId}`);
      setSuccess('Plan deleted successfully');
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingPlan(null);
    setFormData({ title: '', description: '', price: '', duration: '' });
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1>Trainer Dashboard</h1>
          <button onClick={() => setShowForm(true)} className="create-btn">
            Create New Plan
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {showForm && (
          <div className="plan-form-container">
            <h2>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
            <form onSubmit={handleSubmit} className="plan-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="5"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Duration (days)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
                <button type="button" onClick={cancelForm} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <h2 className="section-title">My Plans</h2>
        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan._id} className="plan-card">
              <h3>{plan.title}</h3>
              <p className="plan-description">{plan.description}</p>
              <div className="plan-details">
                <span className="price">${plan.price}</span>
                <span className="duration">{plan.duration} days</span>
              </div>
              <div className="plan-actions">
                <button onClick={() => handleEdit(plan)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDelete(plan._id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {plans.length === 0 && !showForm && (
          <div className="no-plans">
            <p>You haven't created any plans yet.</p>
            <button onClick={() => setShowForm(true)} className="create-btn">
              Create Your First Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerDashboard;

