// PRODUCTION: Use environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Orders
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getTodayOrders: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/today`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getAllOrders: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/all`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Inventory
  getActiveItems: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/items/active`);
      if (!response.ok) {
        throw new Error('Failed to fetch active items');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getInventoryItems: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/items`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  addInventoryItem: async (itemData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add item');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  updateInventoryItem: async (itemId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  deleteInventoryItem: async (itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  updateStock: async (itemId, stock) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/items/${itemId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update stock');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  restockItem: async (itemId, quantity) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/items/${itemId}/restock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to restock item');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getLowStockItems: async (threshold = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/items/low-stock?threshold=${threshold}`);
      if (!response.ok) {
        throw new Error('Failed to fetch low stock items');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getOutOfStockItems: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/items/out-of-stock`);
      if (!response.ok) {
        throw new Error('Failed to fetch out of stock items');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Orders (additional)
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};