const db = require('../database');

const FitnessPlan = {
  // Create a new fitness plan
  create(planData) {
    const { title, description, price, duration, trainer_id } = planData;
    
    const stmt = db.prepare(`
      INSERT INTO fitness_plans (title, description, price, duration, trainer_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(title, description, price, duration, trainer_id);
    return this.findById(result.lastInsertRowid);
  },

  // Find plan by ID
  findById(id) {
    const stmt = db.prepare(`
      SELECT fp.*, 
             u.id as trainer_id, u.name as trainer_name, u.email as trainer_email, u.bio as trainer_bio
      FROM fitness_plans fp
      LEFT JOIN users u ON fp.trainer_id = u.id
      WHERE fp.id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;
    
    return this.formatPlan(row);
  },

  // Find all plans
  findAll() {
    const stmt = db.prepare(`
      SELECT fp.*, 
             u.id as trainer_id, u.name as trainer_name, u.email as trainer_email, u.bio as trainer_bio
      FROM fitness_plans fp
      LEFT JOIN users u ON fp.trainer_id = u.id
      ORDER BY fp.createdAt DESC
    `);
    const rows = stmt.all();
    return rows.map(row => this.formatPlan(row));
  },

  // Find plans by trainer ID
  findByTrainer(trainerId) {
    const stmt = db.prepare(`
      SELECT fp.*, 
             u.id as trainer_id, u.name as trainer_name, u.email as trainer_email, u.bio as trainer_bio
      FROM fitness_plans fp
      LEFT JOIN users u ON fp.trainer_id = u.id
      WHERE fp.trainer_id = ?
      ORDER BY fp.createdAt DESC
    `);
    const rows = stmt.all(trainerId);
    return rows.map(row => this.formatPlan(row));
  },

  // Find plans by multiple trainer IDs
  findByTrainers(trainerIds) {
    if (!trainerIds || trainerIds.length === 0) return [];
    
    const placeholders = trainerIds.map(() => '?').join(',');
    const stmt = db.prepare(`
      SELECT fp.*, 
             u.id as trainer_id, u.name as trainer_name, u.email as trainer_email, u.bio as trainer_bio
      FROM fitness_plans fp
      LEFT JOIN users u ON fp.trainer_id = u.id
      WHERE fp.trainer_id IN (${placeholders})
      ORDER BY fp.createdAt DESC
    `);
    const rows = stmt.all(...trainerIds);
    return rows.map(row => this.formatPlan(row));
  },

  // Find plans by IDs
  findByIds(planIds) {
    if (!planIds || planIds.length === 0) return [];
    
    const placeholders = planIds.map(() => '?').join(',');
    const stmt = db.prepare(`
      SELECT fp.*, 
             u.id as trainer_id, u.name as trainer_name, u.email as trainer_email, u.bio as trainer_bio
      FROM fitness_plans fp
      LEFT JOIN users u ON fp.trainer_id = u.id
      WHERE fp.id IN (${placeholders})
      ORDER BY fp.createdAt DESC
    `);
    const rows = stmt.all(...planIds);
    return rows.map(row => this.formatPlan(row));
  },

  // Update plan
  update(id, updates) {
    const fields = [];
    const values = [];
    
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.price !== undefined) {
      fields.push('price = ?');
      values.push(updates.price);
    }
    if (updates.duration !== undefined) {
      fields.push('duration = ?');
      values.push(updates.duration);
    }
    
    if (fields.length === 0) return this.findById(id);
    
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = db.prepare(`UPDATE fitness_plans SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    return this.findById(id);
  },

  // Delete plan
  delete(id) {
    const stmt = db.prepare('DELETE FROM fitness_plans WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  // Format plan with trainer info (to match Mongoose populate format)
  formatPlan(row) {
    return {
      id: row.id,
      _id: row.id, // For compatibility
      title: row.title,
      description: row.description,
      price: row.price,
      duration: row.duration,
      trainer: row.trainer_id ? {
        id: row.trainer_id,
        _id: row.trainer_id, // For compatibility
        name: row.trainer_name,
        email: row.trainer_email,
        bio: row.trainer_bio
      } : null,
      trainer_id: row.trainer_id,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
};

module.exports = FitnessPlan;
