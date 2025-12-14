import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TrainerDashboard from './pages/TrainerDashboard';
import PlanDetails from './pages/PlanDetails';
import UserFeed from './pages/UserFeed';
import TrainerProfile from './pages/TrainerProfile';
import FollowedTrainers from './pages/FollowedTrainers';
import './App.css';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={['trainer']}>
                  <TrainerDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/plan/:id" element={<PlanDetails />} />
            <Route
              path="/feed"
              element={
                <PrivateRoute allowedRoles={['user']}>
                  <UserFeed />
                </PrivateRoute>
              }
            />
            <Route
              path="/followed-trainers"
              element={
                <PrivateRoute allowedRoles={['user']}>
                  <FollowedTrainers />
                </PrivateRoute>
              }
            />
            <Route path="/trainer/:id" element={<TrainerProfile />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

