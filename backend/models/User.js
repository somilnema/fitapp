const db = require('../database');
const bcrypt = require('bcryptjs');

const User = {
  // Create a new user
  async create(userData) {
    const { name, email, password, role, bio = '' } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, role, bio)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, email, hashedPassword, role, bio);
    return this.findById(result.lastInsertRowid);
  },

  // Find user by ID
  findById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  // Find user by email
  findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  // Compare password
  async comparePassword(user, candidatePassword) {
    return await bcrypt.compare(candidatePassword, user.password);
  },

  // Update user
  update(id, updates) {
    const fields = [];
    const values = [];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.bio !== undefined) {
      fields.push('bio = ?');
      values.push(updates.bio);
    }
    if (updates.password !== undefined) {
      fields.push('password = ?');
      values.push(updates.password);
    }
    
    if (fields.length === 0) return this.findById(id);
    
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    return this.findById(id);
  },

  // Get followed trainers for a user
  getFollowedTrainers(userId) {
    const stmt = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, u.bio, u.createdAt, u.updatedAt FROM users u
      INNER JOIN user_follows uf ON u.id = uf.trainer_id
      WHERE uf.user_id = ?
    `);
    return stmt.all(userId);
  },

  // Check if user follows trainer
  isFollowing(userId, trainerId) {
    const stmt = db.prepare(`
      SELECT COUNT(*) as count FROM user_follows
      WHERE user_id = ? AND trainer_id = ?
    `);
    const result = stmt.get(userId, trainerId);
    return result.count > 0;
  },

  // Add follow relationship
  addFollow(userId, trainerId) {
    const stmt = db.prepare(`
      INSERT INTO user_follows (user_id, trainer_id)
      VALUES (?, ?)
    `);
    try {
      stmt.run(userId, trainerId);
      return true;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return false; // Already following
      }
      throw error;
    }
  },

  // Remove follow relationship
  removeFollow(userId, trainerId) {
    const stmt = db.prepare(`
      DELETE FROM user_follows
      WHERE user_id = ? AND trainer_id = ?
    `);
    const result = stmt.run(userId, trainerId);
    return result.changes > 0;
  }
};

module.exports = User;
