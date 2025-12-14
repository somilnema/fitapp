const User = require('../models/User');
const FitnessPlan = require('../models/FitnessPlan');
const Subscription = require('../models/Subscription');
const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '../../.cursor/debug.log');
const log = (location, message, data, hypothesisId) => {
  try {
    const logEntry = JSON.stringify({
      location,
      message,
      data,
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId
    }) + '\n';
    fs.appendFileSync(logPath, logEntry);
  } catch (err) {
    // Ignore logging errors
  }
};

const followTrainer = async (req, res) => {
  try {
    console.log('[DEBUG] followTrainer called with trainerId:', req.body.trainerId, 'userId:', req.user?.id);
    // #region agent log
    log('userController.js:5', 'followTrainer called', { trainerId: req.body.trainerId, trainerIdType: typeof req.body.trainerId, userId: req.user?.id, userIdType: typeof req.user?.id }, 'D');
    // #endregion
    
    let { trainerId } = req.body;

    if (!trainerId) {
      console.log('[DEBUG] No trainerId provided');
      return res.status(400).json({ message: 'Trainer ID is required' });
    }

    // Convert string ID to number for SQLite
    trainerId = parseInt(trainerId, 10);
    console.log('[DEBUG] Parsed trainerId:', trainerId);
    if (isNaN(trainerId)) {
      console.log('[DEBUG] Invalid trainer ID');
      return res.status(400).json({ message: 'Invalid trainer ID' });
    }

    const trainer = User.findById(trainerId);
    console.log('[DEBUG] Trainer found:', !!trainer, 'Role:', trainer?.role);
    
    // #region agent log
    log('userController.js:20', 'Trainer lookup in follow', { trainerId, trainerFound: !!trainer, trainerRole: trainer?.role }, 'D');
    // #endregion
    
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    const alreadyFollowing = User.isFollowing(req.user.id, trainerId);
    
    // #region agent log
    log('userController.js:26', 'isFollowing check in follow', { userId: req.user.id, userIdType: typeof req.user.id, trainerId, trainerIdType: typeof trainerId, alreadyFollowing }, 'E');
    // #endregion
    
    if (alreadyFollowing) {
      return res.status(400).json({ message: 'Already following this trainer' });
    }

    const success = User.addFollow(req.user.id, trainerId);
    
    // #region agent log
    log('userController.js:33', 'addFollow result', { success, userId: req.user.id, trainerId }, 'E');
    // #endregion
    
    if (!success) {
      return res.status(400).json({ message: 'Already following this trainer' });
    }

    const followedTrainers = User.getFollowedTrainers(req.user.id);

    res.json({ message: 'Trainer followed successfully', followedTrainers });
  } catch (error) {
    // #region agent log
    log('userController.js:42', 'followTrainer error', { error: error.message, stack: error.stack }, 'F');
    // #endregion
    res.status(500).json({ message: error.message });
  }
};

const unfollowTrainer = async (req, res) => {
  try {
    let { trainerId } = req.body;

    if (!trainerId) {
      return res.status(400).json({ message: 'Trainer ID is required' });
    }

    // Convert string ID to number for SQLite
    trainerId = parseInt(trainerId, 10);
    if (isNaN(trainerId)) {
      return res.status(400).json({ message: 'Invalid trainer ID' });
    }

    User.removeFollow(req.user.id, trainerId);
    const followedTrainers = User.getFollowedTrainers(req.user.id);

    res.json({ message: 'Trainer unfollowed successfully', followedTrainers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFollowedTrainers = async (req, res) => {
  try {
    const followedTrainers = User.getFollowedTrainers(req.user.id);
    // Ensure passwords are not included and add _id for compatibility
    const trainersWithoutPassword = followedTrainers.map(trainer => {
      const { password, ...trainerWithoutPassword } = trainer;
      return {
        ...trainerWithoutPassword,
        _id: trainer.id // Add _id for frontend compatibility
      };
    });
    res.json(trainersWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrainerProfile = async (req, res) => {
  try {
    console.log('[DEBUG] getTrainerProfile called with id:', req.params.id, 'type:', typeof req.params.id);
    // #region agent log
    log('userController.js:69', 'getTrainerProfile called', { paramId: req.params.id, paramIdType: typeof req.params.id, hasUser: !!req.user, userRole: req.user?.role }, 'A');
    // #endregion
    
    // Convert string ID to number for SQLite
    const trainerId = parseInt(req.params.id, 10);
    console.log('[DEBUG] Parsed trainerId:', trainerId);
    if (isNaN(trainerId)) {
      console.log('[DEBUG] Invalid trainer ID');
      return res.status(400).json({ message: 'Invalid trainer ID' });
    }
    
    const trainer = User.findById(trainerId);
    console.log('[DEBUG] Trainer found:', !!trainer, 'Role:', trainer?.role);
    
    // #region agent log
    log('userController.js:78', 'Trainer lookup result', { trainerId, trainerFound: !!trainer, trainerRole: trainer?.role }, 'A');
    // #endregion
    
    if (!trainer || trainer.role !== 'trainer') {
      console.log('[DEBUG] Trainer not found or not a trainer');
      return res.status(404).json({ message: 'Trainer not found' });
    }

    const plans = FitnessPlan.findByTrainer(trainerId);
    
    let isFollowing = false;
    if (req.user && req.user.role === 'user') {
      isFollowing = User.isFollowing(req.user.id, trainerId);
      
      // #region agent log
      log('userController.js:87', 'isFollowing check', { userId: req.user.id, userIdType: typeof req.user.id, trainerId, trainerIdType: typeof trainerId, isFollowing }, 'B');
      // #endregion
    }

    const { password, ...trainerWithoutPassword } = trainer;

    const response = {
      trainer: { ...trainerWithoutPassword, _id: trainer.id },
      plans: plans || [],
      isFollowing
    };
    
    console.log('[DEBUG] Sending trainer profile response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('[ERROR] getTrainerProfile error:', error);
    // #region agent log
    log('userController.js:95', 'getTrainerProfile error', { error: error.message, stack: error.stack }, 'C');
    // #endregion
    res.status(500).json({ message: error.message });
  }
};

const getUserFeed = async (req, res) => {
  try {
    const user = User.findById(req.user.id);
    const followedTrainers = User.getFollowedTrainers(user.id);
    const followedTrainerIds = followedTrainers.map(t => t.id);

    const subscriptions = Subscription.findByUser(req.user.id);
    const subscribedPlanIds = subscriptions.map(sub => sub.plan_id || sub.plan?.id || sub.plan?._id);

    const followedTrainerPlans = FitnessPlan.findByTrainers(followedTrainerIds);
    const purchasedPlans = FitnessPlan.findByIds(subscribedPlanIds);

    const feedItems = [];

    followedTrainerPlans.forEach(plan => {
      const planId = plan.id || plan._id;
      feedItems.push({
        plan,
        type: 'followed_trainer',
        isPurchased: subscribedPlanIds.includes(planId)
      });
    });

    purchasedPlans.forEach(plan => {
      const planId = plan.id || plan._id;
      if (!feedItems.find(item => {
        const itemPlanId = item.plan.id || item.plan._id;
        return itemPlanId === planId;
      })) {
        feedItems.push({
          plan,
          type: 'purchased',
          isPurchased: true
        });
      }
    });

    res.json(feedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  followTrainer,
  unfollowTrainer,
  getFollowedTrainers,
  getTrainerProfile,
  getUserFeed
};
