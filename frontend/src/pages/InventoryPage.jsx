import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { 
  Package, Plus, Minus, Trash2, Edit, Search, AlertTriangle, 
  X, Save, PackagePlus, RefreshCw, CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [restockingItem, setRestockingItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: 'Bakery',
    price: '',
    stock: '',
    description: ''
  });

  const [restockData, setRestockData] = useState({
    quantity: ''
  });

  const categories = ['All', 'Bakery', 'Main Course', 'Signature', 'Dessert', 'Beverages', 'Other'];

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getInventoryItems();
      if (result.success) {
        setItems(result.data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to fetch inventory items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item['Category'] === selectedCategory;
    const matchesSearch = item['Name'].toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    try {
      const result = await api.addInventoryItem({
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description.trim()
      });

      if (result.success) {
        toast.success('Item added successfully!');
        setShowAddModal(false);
        setFormData({
          name: '',
          category: 'Bakery',
          price: '',
          stock: '',
          description: ''
        });
        fetchItems();
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    
    if (!editingItem) return;

    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      const result = await api.updateInventoryItem(editingItem['ID'], {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description.trim()
      });

      if (result.success) {
        toast.success('Item updated successfully!');
        setShowEditModal(false);
        setEditingItem(null);
        fetchItems();
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item['Name']}"?`)) {
      return;
    }

    try {
      const result = await api.deleteInventoryItem(item['ID']);
      if (result.success) {
        toast.success('Item deleted successfully!');
        fetchItems();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleUpdateStock = async (item, newStock) => {
    if (newStock < 0) return;

    try {
      const result = await api.updateStock(item['ID'], newStock);
      if (result.success) {
        toast.success('Stock updated successfully!');
        fetchItems();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    
    if (!restockingItem || !restockData.quantity || parseInt(restockData.quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      const result = await api.restockItem(restockingItem['ID'], parseInt(restockData.quantity));
      if (result.success) {
        toast.success('Item restocked successfully!');
        setShowRestockModal(false);
        setRestockingItem(null);
        setRestockData({ quantity: '' });
        fetchItems();
      }
    } catch (error) {
      console.error('Error restocking item:', error);
      toast.error('Failed to restock item');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item['Name'],
      category: item['Category'],
      price: item['Price'],
      stock: item['Stock'],
      description: item['Description'] || ''
    });
    setShowEditModal(true);
  };

  const openRestockModal = (item) => {
    setRestockingItem(item);
    setRestockData({ quantity: '' });
    setShowRestockModal(true);
  };

  const getStockStatus = (stock) => {
    const stockNum = parseInt(stock);
    if (stockNum === 0) {
      return { label: 'Out of Stock', color: 'bg-red-500 text-white', icon: <AlertTriangle className="h-4 w-4" /> };
    } else if (stockNum <= 10) {
      return { label: 'Low Stock', color: 'bg-yellow-500 text-white', icon: <AlertTriangle className="h-4 w-4" /> };
    } else {
      return { label: 'In Stock', color: 'bg-green-500 text-white', icon: <CheckCircle className="h-4 w-4" /> };
    }
  };

  const getStockColor = (stock) => {
    const stockNum = parseInt(stock);
    if (stockNum === 0) return 'bg-red-500';
    if (stockNum <= 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const stockWidth = (stock) => {
    const stockNum = parseInt(stock);
    if (stockNum >= 100) return '100%';
    if (stockNum <= 0) return '0%';
    return `${Math.max(stockNum, 2)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Package className="h-8 w-8 text-amber-500 mr-3" />
          <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">{items.length}</div>
          <div className="text-gray-400 text-sm mt-1">Total Items</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-yellow-500">
            {items.filter(item => parseInt(item['Stock']) > 0 && parseInt(item['Stock']) <= 10).length}
          </div>
          <div className="text-gray-400 text-sm mt-1">Low Stock</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="text-2xl font-bold text-red-500">
            {items.filter(item => parseInt(item['Stock']) === 0).length}
          </div>
          <div className="text-gray-400 text-sm mt-1">Out of Stock</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-100 placeholder-gray-400"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const stockStatus = getStockStatus(item['Stock']);
          const stockNum = parseInt(item['Stock']);
          
          return (
            <div key={item['ID']} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-amber-500 transition-all">
              {/* Stock Status Badge */}
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs mb-2 ${stockStatus.color}`}>
                {stockStatus.icon}
                <span className="ml-1">{stockStatus.label}</span>
              </div>

              {/* Item Name and Price */}
              <div className="flex justify-between items-start mb-2">
                <div className="text-lg font-semibold text-white">{item['Name']}</div>
                <div className="text-amber-500 font-bold whitespace-nowrap ml-2">
                  {formatCurrency(parseFloat(item['Price']))}
                </div>
              </div>

              {/* Category */}
              <div className="text-xs text-gray-400 mb-3">
                Category: <span className="text-gray-300">{item['Category']}</span>
              </div>

              {/* Description */}
              {item['Description'] && (
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{item['Description']}</p>
              )}

              {/* Stock Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Stock Level</span>
                  <span className="font-semibold text-white">{stockNum} units</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getStockColor(stockNum)}`}
                    style={{ width: stockWidth(stockNum) }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleUpdateStock(item, stockNum - 1)}
                    disabled={stockNum === 0}
                    className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-semibold text-white w-6 text-center">{stockNum}</span>
                  <button
                    onClick={() => handleUpdateStock(item, stockNum + 1)}
                    className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openRestockModal(item)}
                    className="p-1.5 rounded bg-green-600 hover:bg-green-700 text-white"
                    title="Restock"
                  >
                    <PackagePlus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="p-1.5 rounded bg-red-600 hover:bg-red-700 text-white"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">No items found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Add New Item</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-gray-700">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  {categories.filter(c => c !== 'All').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="input-field"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  placeholder="Enter item description"
                  rows="3"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Edit Item</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-gray-700">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  {categories.filter(c => c !== 'All').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Stock</label>
                <div className="text-2xl font-bold text-white">{editingItem['Stock']} units</div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && restockingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Restock Item</h3>
              <button onClick={() => setShowRestockModal(false)} className="p-1 rounded-lg hover:bg-gray-700">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleRestock} className="space-y-4">
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-lg font-semibold text-white">{restockingItem['Name']}</div>
                <div className="text-sm text-gray-400 mt-1">Current Stock: <span className="font-bold text-white">{restockingItem['Stock']} units</span></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Quantity to Add *</label>
                <input
                  type="number"
                  value={restockData.quantity}
                  onChange={(e) => setRestockData({ quantity: e.target.value })}
                  className="input-field"
                  placeholder="Enter quantity"
                  min="1"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;