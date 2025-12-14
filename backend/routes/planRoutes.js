const express = require('express');
const router = express.Router();
const {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  getTrainerPlans
} = require('../controllers/planController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', getPlans);
router.get('/:id', getPlanById);
router.get('/trainer/my-plans', authenticate, authorize('trainer'), getTrainerPlans);
router.post('/', authenticate, authorize('trainer'), createPlan);
router.put('/:id', authenticate, authorize('trainer'), updatePlan);
router.delete('/:id', authenticate, authorize('trainer'), deletePlan);

module.exports = router;

