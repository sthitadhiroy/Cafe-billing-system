import express from 'express';
import InventoryManager from '../controllers/inventoryController.js';

const router = express.Router();

// Get all inventory items
router.get('/items', async (req, res) => {
  try {
    const items = await InventoryManager.getAllItems();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch items', error: error.message });
  }
});

// Get active items (for POS)
router.get('/items/active', async (req, res) => {
  try {
    const items = await InventoryManager.getActiveItems();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching active items:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active items', error: error.message });
  }
});

// Add new item
router.post('/items', async (req, res) => {
  try {
    const itemData = req.body;
    const newItem = await InventoryManager.addItem(itemData);
    res.status(201).json({ success: true, message: 'Item added successfully', data: newItem });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ success: false, message: 'Failed to add item', error: error.message });
  }
});

// Update item
router.put('/items/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const updateData = req.body;
    const updatedItem = await InventoryManager.updateItem(itemId, updateData);
    
    if (updatedItem) {
      res.status(200).json({ success: true, message: 'Item updated successfully', data: updatedItem });
    } else {
      res.status(404).json({ success: false, message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ success: false, message: 'Failed to update item', error: error.message });
  }
});

// Delete item
router.delete('/items/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const deleted = await InventoryManager.deleteItem(itemId);
    
    if (deleted) {
      res.status(200).json({ success: true, message: 'Item deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ success: false, message: 'Failed to delete item', error: error.message });
  }
});

// Update stock
router.put('/items/:id/stock', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const { stock } = req.body;
    const updatedItem = await InventoryManager.updateStock(itemId, stock);
    
    if (updatedItem) {
      res.status(200).json({ success: true, message: 'Stock updated successfully', data: updatedItem });
    } else {
      res.status(404).json({ success: false, message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ success: false, message: 'Failed to update stock', error: error.message });
  }
});

// Restock item
router.post('/items/:id/restock', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const { quantity } = req.body;
    const updatedItem = await InventoryManager.restockItem(itemId, quantity);
    
    if (updatedItem) {
      res.status(200).json({ success: true, message: 'Item restocked successfully', data: updatedItem });
    } else {
      res.status(404).json({ success: false, message: 'Item not found' });
    }
  } catch (error) {
    console.error('Error restocking item:', error);
    res.status(500).json({ success: false, message: 'Failed to restock item', error: error.message });
  }
});

// Get low stock items
router.get('/items/low-stock', async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const items = await InventoryManager.getLowStockItems(threshold);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch low stock items', error: error.message });
  }
});

// Get out of stock items
router.get('/items/out-of-stock', async (req, res) => {
  try {
    const items = await InventoryManager.getOutOfStockItems();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching out of stock items:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch out of stock items', error: error.message });
  }
});

export default router;