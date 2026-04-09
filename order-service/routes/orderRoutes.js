const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// All order routes require authentication
router.use(authMiddleware);

router.post('/', placeOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
