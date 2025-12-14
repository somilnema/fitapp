const db = require('../database');

const Subscription = {
  // Create a new subscription
  create(subscriptionData) {
    const { user_id, plan_id } = subscriptionData;
    
    const stmt = db.prepare(`
      INSERT INTO subscriptions (user_id, plan_id)
      VALUES (?, ?)
    `);
    
    try {
      const result = stmt.run(user_id, plan_id);
      return this.findById(result.lastInsertRowid);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Already subscribed to this plan');
      }
      throw error;
    }
  },

  // Find subscription by ID
  findById(id) {
    const stmt = db.prepare(`
      SELECT s.*,
             fp.id as plan_id, fp.title as plan_title, fp.price as plan_price, fp.duration as plan_duration,
             u.id as user_id, u.name as user_name, u.email as user_email
      FROM subscriptions s
      LEFT JOIN fitness_plans fp ON s.plan_id = fp.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;
    return this.formatSubscription(row);
  },

  // Find subscription by user and plan
  findByUserAndPlan(userId, planId) {
    const stmt = db.prepare(`
      SELECT s.*,
             fp.id as plan_id, fp.title as plan_title, fp.price as plan_price, fp.duration as plan_duration,
             u.id as user_id, u.name as user_name, u.email as user_email
      FROM subscriptions s
      LEFT JOIN fitness_plans fp ON s.plan_id = fp.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ? AND s.plan_id = ?
    `);
    const row = stmt.get(userId, planId);
    if (!row) return null;
    return this.formatSubscription(row);
  },

  // Find all subscriptions for a user
  findByUser(userId) {
    const stmt = db.prepare(`
      SELECT s.*,
             fp.id as plan_id, fp.title as plan_title, fp.description as plan_description,
             fp.price as plan_price, fp.duration as plan_duration,
             u.id as user_id, u.name as user_name, u.email as user_email
      FROM subscriptions s
      LEFT JOIN fitness_plans fp ON s.plan_id = fp.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ?
      ORDER BY s.subscribedAt DESC
    `);
    const rows = stmt.all(userId);
    return rows.map(row => this.formatSubscription(row));
  },

  // Get all plan IDs subscribed by a user
  getSubscribedPlanIds(userId) {
    const stmt = db.prepare('SELECT plan_id FROM subscriptions WHERE user_id = ?');
    const rows = stmt.all(userId);
    return rows.map(row => row.plan_id);
  },

  // Format subscription with populated data (to match Mongoose populate format)
  formatSubscription(row) {
    return {
      id: row.id,
      _id: row.id, // For compatibility
      user: row.user_id ? {
        id: row.user_id,
        _id: row.user_id, // For compatibility
        name: row.user_name,
        email: row.user_email
      } : null,
      user_id: row.user_id,
      plan: row.plan_id ? {
        id: row.plan_id,
        _id: row.plan_id, // For compatibility
        title: row.plan_title,
        price: row.plan_price,
        duration: row.plan_duration,
        description: row.plan_description
      } : null,
      plan_id: row.plan_id,
      subscribedAt: row.subscribedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
};

module.exports = Subscription;
