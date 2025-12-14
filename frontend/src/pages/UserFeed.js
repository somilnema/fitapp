import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './UserFeed.css';

const UserFeed = () => {
  const { user } = useAuth();
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await api.get('/users/feed');
      setFeedItems(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load feed');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your feed...</div>;
  }

  return (
    <div className="feed-page">
      <div className="container">
        <h1>My Feed</h1>
        <p className="feed-subtitle">Plans from trainers you follow and plans you've purchased</p>

        {error && <div className="error">{error}</div>}

        <div className="feed-grid">
          {feedItems.map((item, index) => {
            const planId = item.plan.id || item.plan._id;
            const trainerId = item.plan.trainer?.id || item.plan.trainer?._id;
            return (
              <div key={`${planId}-${index}`} className="feed-card">
                {item.isPurchased && (
                  <div className="purchased-badge">Purchased</div>
                )}
                {item.type === 'followed_trainer' && !item.isPurchased && (
                  <div className="followed-badge">From Followed Trainer</div>
                )}
                <h3>{item.plan.title}</h3>
                {item.plan.trainer && (
                  <Link to={`/trainer/${trainerId}`} className="trainer-name">
                    By {item.plan.trainer.name}
                  </Link>
                )}
                <div className="plan-meta">
                  <span className="price">${item.plan.price}</span>
                  <span className="duration">{item.plan.duration} days</span>
                </div>
                <p className="plan-preview">{item.plan.description.substring(0, 150)}...</p>
                <Link to={`/plan/${planId}`} className="view-plan-link">
                  View Full Plan
                </Link>
              </div>
            );
          })}
        </div>

        {feedItems.length === 0 && (
          <div className="empty-feed">
            <p>Your feed is empty. Start following trainers or browse plans to see them here.</p>
            <Link to="/" className="browse-link">
              Browse All Plans
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFeed;

