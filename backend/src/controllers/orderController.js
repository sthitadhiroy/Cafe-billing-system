import ExcelManager from '../utils/excelManager.js';
import InventoryManager from './inventoryController.js';
import { v4 as uuidv4 } from 'uuid';

export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const now = new Date();
    
    const order = {
      orderId: `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${uuidv4().slice(0, 8).toUpperCase()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      customerName: orderData.customerName || 'Walk-in Customer',
      mobileNumber: orderData.mobileNumber || 'N/A',
      items: orderData.items,
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      tax: orderData.tax,
      grandTotal: orderData.grandTotal,
      paymentMode: orderData.paymentMode || 'Cash',
      orderStatus: orderData.orderStatus || 'Completed',
      whatsappStatus: orderData.whatsappStatus || 'Not Sent'
    };

    // Save order to Excel
    const savedOrder = await ExcelManager.addOrder(order);
    
    // Deduct stock from inventory
    if (orderData.items && orderData.items.length > 0) {
      await InventoryManager.deductStock(orderData.items);
    }
    
    res.status(201).json({ success: true, message: 'Order created successfully', data: savedOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
};

export const getTodayOrders = async (req, res) => {
  try {
    const orders = await ExcelManager.getTodayOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching today orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch today orders', error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await ExcelManager.getAllOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch all orders', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const updated = await ExcelManager.updateOrderStatus(orderId, status);
    
    if (updated) {
      res.status(200).json({ success: true, message: 'Order status updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await ExcelManager.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error: error.message });
  }
};