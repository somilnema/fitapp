import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          FitPlanHub
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              {user.role === 'user' && (
                <>
                <Link to="/feed" className="nav-link">
                  My Feed
                </Link>
                  <Link to="/followed-trainers" className="nav-link">
                    Following
                  </Link>
                </>
              )}
              {user.role === 'trainer' && (
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="nav-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup" className="nav-link">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

