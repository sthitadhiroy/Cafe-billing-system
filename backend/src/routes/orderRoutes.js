import express from 'express';
import {
  createOrder,
  getTodayOrders,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/orders', createOrder);
router.get('/orders/today', getTodayOrders);
router.get('/orders/all', getAllOrders);
router.put('/orders/:orderId/status', updateOrderStatus);
router.get('/dashboard/stats', getDashboardStats);

export default router;
