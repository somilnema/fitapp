const express = require('express');
const router = express.Router();
const {
  followTrainer,
  unfollowTrainer,
  getFollowedTrainers,
  getTrainerProfile,
  getUserFeed
} = require('../controllers/userController');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth');

router.post('/follow', authenticate, authorize('user'), followTrainer);
router.post('/unfollow', authenticate, authorize('user'), unfollowTrainer);
router.get('/followed-trainers', authenticate, authorize('user'), getFollowedTrainers);
router.get('/trainer/:id', optionalAuthenticate, getTrainerProfile);
router.get('/feed', authenticate, authorize('user'), getUserFeed);

module.exports = router;

