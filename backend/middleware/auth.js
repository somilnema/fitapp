const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
    // Ensure userId is a number for SQLite
    const userId = typeof decoded.userId === 'string' ? parseInt(decoded.userId, 10) : decoded.userId;
    const user = User.findById(userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Remove password from user object and add _id for compatibility
    const { password, ...userWithoutPassword } = user;
    req.user = { ...userWithoutPassword, _id: user.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
      // Ensure userId is a number for SQLite
      const userId = typeof decoded.userId === 'string' ? parseInt(decoded.userId, 10) : decoded.userId;
      const user = User.findById(userId);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        req.user = { ...userWithoutPassword, _id: user.id }; // Add _id for compatibility
      }
    }
    next();
  } catch (error) {
    // Silently continue if token is invalid (optional auth)
    next();
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

module.exports = { authenticate, authorize, optionalAuthenticate };
