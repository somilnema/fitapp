const express = require('express');
const router = express.Router();
const {
  subscribeToPlan,
  getUserSubscriptions,
  checkSubscription
} = require('../controllers/subscriptionController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('user'), subscribeToPlan);
router.get('/my-subscriptions', authenticate, authorize('user'), getUserSubscriptions);
router.get('/check', authenticate, authorize('user'), checkSubscription);

module.exports = router;

