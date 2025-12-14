const Subscription = require('../models/Subscription');
const FitnessPlan = require('../models/FitnessPlan');

const subscribeToPlan = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: 'Plan ID is required' });
    }

    const plan = FitnessPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const existingSubscription = Subscription.findByUserAndPlan(req.user.id, planId);

    if (existingSubscription) {
      return res.status(400).json({ message: 'Already subscribed to this plan' });
    }

    const subscription = Subscription.create({
      user_id: req.user.id,
      plan_id: planId
    });

    res.status(201).json(subscription);
  } catch (error) {
    if (error.message === 'Already subscribed to this plan') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

const getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = Subscription.findByUser(req.user.id);
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkSubscription = async (req, res) => {
  try {
    const { planId } = req.query;
    const userId = req.user.id;

    const subscription = Subscription.findByUserAndPlan(userId, planId);

    res.json({ isSubscribed: !!subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  subscribeToPlan,
  getUserSubscriptions,
  checkSubscription
};
