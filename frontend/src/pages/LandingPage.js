import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './LandingPage.css';

const LandingPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans');
      setPlans(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load plans');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading plans...</div>;
  }

  return (
    <div className="landing-page">
      <div className="hero-section">
        <h1>Welcome to FitPlanHub</h1>
        <p>Discover personalized fitness plans from expert trainers</p>
      </div>

      <div className="container">
        {error && <div className="error">{error}</div>}

        <h2 className="section-title">Available Fitness Plans</h2>

        <div className="plans-grid">
          {plans.map((plan) => {
            const planId = plan.id || plan._id;
            return (
              <div key={planId} className="plan-card">
              <h3>{plan.title}</h3>
              <p className="trainer-name">By {plan.trainer?.name || 'Unknown'}</p>
              <p className="plan-price">${plan.price}</p>
              <p className="plan-duration">{plan.duration} days</p>
                <Link to={`/plan/${planId}`} className="view-plan-btn">
                View Details
              </Link>
            </div>
            );
          })}
        </div>

        {plans.length === 0 && (
          <div className="no-plans">No fitness plans available yet.</div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;

