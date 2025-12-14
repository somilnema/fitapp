import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './TrainerProfile.css';

const TrainerProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [trainerData, setTrainerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTrainerProfile();
  }, [id]);

  const fetchTrainerProfile = async () => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/53788217-b91e-41a2-86cb-15590e17ae44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainerProfile.js:19',message:'fetchTrainerProfile called',data:{id,idType:typeof id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      const response = await api.get(`/users/trainer/${id}`);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/53788217-b91e-41a2-86cb-15590e17ae44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainerProfile.js:25',message:'fetchTrainerProfile success',data:{hasData:!!response.data,hasTrainer:!!response.data?.trainer,trainerId:response.data?.trainer?.id,trainer_id:response.data?.trainer?._id,isFollowing:response.data?.isFollowing},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      setTrainerData(response.data);
      setLoading(false);
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/53788217-b91e-41a2-86cb-15590e17ae44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainerProfile.js:30',message:'fetchTrainerProfile error',data:{error:err.message,status:err.response?.status,data:err.response?.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      setError(err.response?.data?.message || 'Trainer not found');
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || user.role !== 'user') {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/53788217-b91e-41a2-86cb-15590e17ae44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainerProfile.js:32',message:'handleFollowToggle blocked',data:{hasUser:!!user,userRole:user?.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return;
    }

    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/53788217-b91e-41a2-86cb-15590e17ae44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainerProfile.js:37',message:'handleFollowToggle called',data:{isFollowing:trainerData.isFollowing,trainerId:id,userId:user.id,user_id:user._id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      if (trainerData.isFollowing) {
        await api.post('/users/unfollow', { trainerId: id });
        setSuccess('Unfollowed trainer');
      } else {
        await api.post('/users/follow', { trainerId: id });
        setSuccess('Following trainer');
      }
      fetchTrainerProfile();
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/53788217-b91e-41a2-86cb-15590e17ae44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainerProfile.js:47',message:'handleFollowToggle error',data:{error:err.message,status:err.response?.status,data:err.response?.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  if (loading) {
    return <div className="loading">Loading trainer profile...</div>;
  }

  if (!trainerData || !trainerData.trainer) {
    return (
      <div className="trainer-profile-page">
        <div className="container">
          <div className="error">{error || 'Trainer not found'}</div>
        </div>
      </div>
    );
  }

  const { trainer, plans, isFollowing } = trainerData;
  const trainerId = trainer.id || trainer._id;
  const userId = user?.id || user?._id;
  const canFollow = user && user.role === 'user' && userId && userId.toString() !== trainerId.toString();

  return (
    <div className="trainer-profile-page">
      <div className="container">
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="trainer-header">
          <div className="trainer-info">
            <h1>{trainer.name}</h1>
            <p className="trainer-email">{trainer.email}</p>
            {trainer.bio && <p className="trainer-bio">{trainer.bio}</p>}
          </div>
          {canFollow && (
            <button
              onClick={handleFollowToggle}
              className={isFollowing ? 'unfollow-btn' : 'follow-btn'}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>

        <div className="trainer-plans-section">
          <h2>Fitness Plans</h2>
          {plans.length > 0 ? (
            <div className="plans-grid">
              {plans.map((plan) => {
                const planId = plan.id || plan._id;
                return (
                  <div key={planId} className="plan-card">
                  <h3>{plan.title}</h3>
                  <div className="plan-meta">
                    <span className="price">${plan.price}</span>
                    <span className="duration">{plan.duration} days</span>
                  </div>
                  <p className="plan-preview">{plan.description.substring(0, 120)}...</p>
                    <Link to={`/plan/${planId}`} className="view-plan-link">
                    View Details
                  </Link>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="no-plans">
              <p>This trainer hasn't created any plans yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerProfile;

