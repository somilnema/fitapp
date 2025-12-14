import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './FollowedTrainers.css';

const FollowedTrainers = () => {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFollowedTrainers();
  }, []);

  const fetchFollowedTrainers = async () => {
    try {
      const response = await api.get('/users/followed-trainers');
      setTrainers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load followed trainers');
      setLoading(false);
    }
  };

  const handleUnfollow = async (trainerId) => {
    try {
      await api.post('/users/unfollow', { trainerId });
      setTrainers(trainers.filter(trainer => (trainer.id || trainer._id) !== trainerId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unfollow trainer');
    }
  };

  if (loading) {
    return <div className="loading">Loading followed trainers...</div>;
  }

  return (
    <div className="followed-trainers-page">
      <div className="container">
        <h1>Trainers I Follow</h1>
        <p className="page-subtitle">Manage the trainers you're following</p>

        {error && <div className="error">{error}</div>}

        {trainers.length > 0 ? (
          <div className="trainers-grid">
            {trainers.map((trainer) => {
              const trainerId = trainer.id || trainer._id;
              return (
                <div key={trainerId} className="trainer-card">
                  <div className="trainer-info">
                    <h3>{trainer.name}</h3>
                    <p className="trainer-email">{trainer.email}</p>
                    {trainer.bio && <p className="trainer-bio">{trainer.bio}</p>}
                  </div>
                  <div className="trainer-actions">
                    <Link to={`/trainer/${trainerId}`} className="view-profile-btn">
                      View Profile
                    </Link>
                    <button
                      onClick={() => handleUnfollow(trainerId)}
                      className="unfollow-btn"
                    >
                      Unfollow
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>You're not following any trainers yet.</p>
            <p>Browse plans and follow trainers to see their content in your feed!</p>
            <Link to="/" className="browse-link">
              Browse Plans
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowedTrainers;
