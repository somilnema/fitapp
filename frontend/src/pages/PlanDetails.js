import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './PlanDetails.css';

const PlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPlan();
    if (user && user.role === 'user') {
      checkSubscription();
    }
  }, [id, user]);

  const fetchPlan = async () => {
    try {
      const response = await api.get(`/plans/${id}`);
      setPlan(response.data);
      setLoading(false);
    } catch (err) {
      setError('Plan not found');
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
      const response = await api.get(`/subscriptions/check?planId=${id}`);
      setIsSubscribed(response.data.isSubscribed);
    } catch (err) {
      console.error('Failed to check subscription');
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/subscriptions', { planId: id });
      setSuccess('Successfully subscribed to this plan!');
      setIsSubscribed(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Subscription failed');
    }
  };

  if (loading) {
    return <div className="loading">Loading plan details...</div>;
  }

  if (!plan) {
    return <div className="error">Plan not found</div>;
  }

  const canViewFullDetails = user && (user.role === 'trainer' || isSubscribed);

  return (
    <div className="plan-details-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="plan-details-card">
          <div className="plan-header">
            <h1>{plan.title}</h1>
            {plan.trainer && (
              <Link to={`/trainer/${plan.trainer.id || plan.trainer._id}`} className="trainer-link">
              By {plan.trainer.name}
            </Link>
            )}
          </div>

          <div className="plan-info">
            <div className="info-item">
              <span className="label">Price:</span>
              <span className="value price">${plan.price}</span>
            </div>
            <div className="info-item">
              <span className="label">Duration:</span>
              <span className="value">{plan.duration} days</span>
            </div>
          </div>

          {canViewFullDetails ? (
            <div className="plan-description-full">
              <h2>Description</h2>
              <p>{plan.description}</p>
            </div>
          ) : (
            <div className="plan-description-preview">
              <h2>Description</h2>
              <p>Subscribe to view full plan details and access all features.</p>
              {user && user.role === 'user' && !isSubscribed && (
                <button onClick={handleSubscribe} className="subscribe-btn">
                  Subscribe Now - ${plan.price}
                </button>
              )}
              {!user && (
                <div className="login-prompt">
                  <p>Please login to subscribe to this plan.</p>
                  <Link to="/login" className="login-link">
                    Login
                  </Link>
                </div>
              )}
            </div>
          )}

          {user && user.role === 'user' && isSubscribed && (
            <div className="subscribed-badge">
              ✓ You are subscribed to this plan
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanDetails;

