const FitnessPlan = require('../models/FitnessPlan');

const createPlan = async (req, res) => {
  try {
    const { title, description, price, duration } = req.body;

    if (!title || !description || !price || !duration) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const plan = FitnessPlan.create({
      title,
      description,
      price: Number(price),
      duration: Number(duration),
      trainer_id: req.user.id
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPlans = async (req, res) => {
  try {
    const plans = FitnessPlan.findAll();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPlanById = async (req, res) => {
  try {
    const plan = FitnessPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePlan = async (req, res) => {
  try {
    const plan = FitnessPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (plan.trainer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own plans' });
    }

    const { title, description, price, duration } = req.body;

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (duration !== undefined) updates.duration = Number(duration);

    const updatedPlan = FitnessPlan.update(req.params.id, updates);

    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePlan = async (req, res) => {
  try {
    const plan = FitnessPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (plan.trainer_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own plans' });
    }

    FitnessPlan.delete(req.params.id);
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrainerPlans = async (req, res) => {
  try {
    const plans = FitnessPlan.findByTrainer(req.user.id);
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  getTrainerPlans
};
