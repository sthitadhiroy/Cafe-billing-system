import React, { useState, useEffect, useCallback, memo } from 'react';
import { api } from '../utils/api';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, ChefHat, Search, User, X, Loader2, AlertCircle, PackageX } from 'lucide-react';
import { toast } from 'react-toastify';
import ReceiptModal from '../components/ReceiptModal';

// Separate Cart Item Component to prevent re-renders
const CartItem = memo(({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
      <div className="flex-1">
        <div className="font-medium text-white">{item.name}</div>
        <div className="text-sm text-gray-400">₹{item.price}</div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onUpdateQuantity(item.id, -1)}
          className="p-1.5 rounded bg-gray-600 hover:bg-gray-500 text-white transition-colors"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="font-semibold text-white w-6 text-center">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, 1)}
          className="p-1.5 rounded bg-gray-600 hover:bg-gray-500 text-white transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="p-1.5 rounded text-red-400 hover:bg-red-500/20 ml-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

// Separate Billing Form Component to prevent re-renders
const BillingForm = memo(({ 
  customerName, 
  customerMobile, 
  errors, 
  onNameChange, 
  onMobileChange,
  onNameBlur,
  onMobileBlur,
  paymentMode, 
  onPaymentModeChange,
  subtotal,
  total,
  isCheckingOut,
  onCheckout,
  cartEmpty,
  formatCurrency
}) => {
  return (
    <div className="border-t border-gray-600 pt-4">
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Customer Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Guest"
              value={customerName}
              onChange={onNameChange}
              onBlur={onNameBlur}
              className={`input-field pl-10 ${
                errors.name ? 'border-red-500 focus:ring-red-500' : ''
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-400 mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Mobile Number <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            placeholder="Enter 10-digit mobile number"
            value={customerMobile}
            onChange={onMobileChange}
            onBlur={onMobileBlur}
            className={`input-field ${
              errors.mobile ? 'border-red-500 focus:ring-red-500' : ''
            }`}
          />
          {errors.mobile && (
            <p className="text-xs text-red-400 mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.mobile}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4 bg-gray-700 p-3 rounded-lg">
        <div className="flex justify-between text-gray-300">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-white border-t border-gray-600 pt-2">
          <span>Total:</span>
          <span className="text-amber-500">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Payment Method
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => onPaymentModeChange('Cash')}
            className={`flex-1 p-2 rounded-lg flex items-center justify-center transition-all ${
              paymentMode === 'Cash' 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Banknote className="h-4 w-4 mr-2" />
            Cash
          </button>
          <button
            onClick={() => onPaymentModeChange('Card')}
            className={`flex-1 p-2 rounded-lg flex items-center justify-center transition-all ${
              paymentMode === 'Card' 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Card
          </button>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={cartEmpty || isCheckingOut}
        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 shadow-lg flex items-center justify-center"
      >
        {isCheckingOut ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          'Complete Order'
        )}
      </button>
    </div>
  );
});

const POSPage = () => {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Guest');
  const [customerMobile, setCustomerMobile] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errors, setErrors] = useState({ name: '', mobile: '' });
  const [menuItems, setMenuItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  
  const categories = ['All', 'Bakery', 'Main Course', 'Signature', 'Dessert'];
  
  // Fetch active items from inventory
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const result = await api.getActiveItems();
        if (result.success) {
          // Map inventory items to menu format
          const mappedItems = result.data.map(item => ({
            id: item['ID'],
            name: item['Name'],
            price: parseFloat(item['Price']),
            category: item['Category'],
            description: item['Description'] || '',
            stock: parseInt(item['Stock'])
          }));
          setMenuItems(mappedItems);
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
        // Fallback to default items if API fails
        setMenuItems([
          { id: 1, name: 'Multigrain Bread', price: 80, category: 'Bakery', description: 'Soft, wholesome loaf baked with a blend of nutritious grains', stock: 50 },
          { id: 2, name: 'Garlic Breadsticks', price: 99, category: 'Bakery', description: 'Plain • classic garlic butter • cheesy • stuffed • with jalapeno & sweet corn', stock: 50 },
          { id: 3, name: 'Egg Puff', price: 39, category: 'Bakery', description: 'Flaky, golden pastry with a spiced, seasoned filling', stock: 50 },
          { id: 4, name: 'Closed Bun', price: 60, category: 'Bakery', description: 'Soft, sweet, rounded delight with a rich, savory filling', stock: 50 },
          { id: 5, name: 'Sweet Bun', price: 39, category: 'Bakery', description: 'Light, fluffy and gently sweet', stock: 50 },
          { id: 6, name: 'Tea Cake (1 piece)', price: 250, category: 'Bakery', description: 'A baking symphony, soft and perfect for pairing', stock: 50 },
          { id: 7, name: 'Green Rava Cake (1 piece)', price: 350, category: 'Bakery', description: 'A nutritious treat crafted from the goodness of rava', stock: 50 },
          { id: 8, name: 'Assamese Pork Kale Bhuna', price: 450, category: 'Main Course', description: 'Classic, aromatic, slow-cooked pork', stock: 30 },
          { id: 9, name: 'Bengali Posh Kosa', price: 400, category: 'Main Course', description: 'Rich slow-cooked mutton curry', stock: 30 },
          { id: 10, name: 'Chicken Kosha Murgi', price: 180, category: 'Main Course', description: 'A classic Bengali classic simmered with caramelized onions', stock: 30 },
          { id: 11, name: 'Chicken Besara', price: 250, category: 'Main Course', description: 'Chicken cooked in a fragrant, mustard-based gravy', stock: 30 },
          { id: 12, name: 'Village Style Mutton Curry', price: 450, category: 'Main Course', description: 'Slow-cooked village-style mutton curry', stock: 30 },
          { id: 13, name: 'Odisha Samila', price: 160, category: 'Main Course', description: 'A vegetable medley simmered in a fragrant coconut sauce', stock: 30 },
          { id: 14, name: 'Chutney Shukti Murgi', price: 280, category: 'Signature', description: 'Traditional, tangy & delicious mustard-based chicken curry', stock: 30 },
          { id: 15, name: 'Ilish Bhappa Bhorta', price: 410, category: 'Signature', description: 'Hilsa fish steamed with mustard, green chili & mustard oil', stock: 30 },
          { id: 16, name: 'Shoot-e-Bhanta or Chingri', price: 220, category: 'Signature', description: 'Eggplant stuffed with shrimp paste, shallow-fried', stock: 30 },
          { id: 17, name: 'Rice Kheer', price: 150, category: 'Dessert', description: 'A rich, traditional rice pudding', stock: 30 },
          { id: 18, name: 'Coconut Custard', price: 180, category: 'Dessert', description: 'A silky, tropical custard with a subtle coconut flavor', stock: 30 },
        ]);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Calculate total quantity in cart
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Get quantity of a specific item in cart
  const getItemQuantity = (itemId) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Use useCallback to prevent unnecessary re-renders
  const addToCart = useCallback((item) => {
    if (item.stock <= 0) {
      toast.error(`${item.name} is out of stock!`);
      return;
    }
    
    const cartQuantity = getItemQuantity(item.id);
    if (cartQuantity >= item.stock) {
      toast.error(`Only ${item.stock} ${item.name} available!`);
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((itemId, delta) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      );
      return updatedCart.filter(item => item.quantity > 0);
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  }, []);

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const formatCurrency = useCallback((amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  }, []);

  // Validation functions
  const validateName = useCallback((name) => {
    if (!name.trim()) {
      return 'Customer name is required';
    }
    return '';
  }, []);

  const validateMobile = useCallback((mobile) => {
    if (!mobile.trim()) {
      return 'Mobile number is required';
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return 'Enter a valid 10-digit Indian mobile number';
    }
    return '';
  }, []);

  // Handle input changes - use useCallback to prevent re-renders
  const handleNameChange = useCallback((e) => {
    setCustomerName(e.target.value);
    setErrors(prev => ({ ...prev, name: '' })); // Clear error as user types
  }, []);

  const handleMobileChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setCustomerMobile(value);
    setErrors(prev => ({ ...prev, mobile: '' })); // Clear error as user types
  }, []);

  const handleNameBlur = useCallback(() => {
    setErrors(prev => ({ ...prev, name: validateName(customerName) }));
  }, [customerName, validateName]);

  const handleMobileBlur = useCallback(() => {
    setErrors(prev => ({ ...prev, mobile: validateMobile(customerMobile) }));
  }, [customerMobile, validateMobile]);

  const handlePaymentModeChange = useCallback((mode) => {
    setPaymentMode(mode);
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Validate all fields
    const nameError = validateName(customerName);
    const mobileError = validateMobile(customerMobile);
    
    setErrors({ name: nameError, mobile: mobileError });
    
    if (nameError || mobileError) {
      toast.error('Please fill all required fields correctly', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return;
    }

    setIsCheckingOut(true);

    const orderData = {
      customerName: customerName.trim(),
      mobileNumber: customerMobile,
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: calculateSubtotal(),
      discount: 0,
      tax: 0,
      grandTotal: calculateTotal(),
      paymentMode,
      orderStatus: 'Completed',
      whatsappStatus: 'Not Sent'
    };

    try {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await api.createOrder(orderData);
      
      if (result.success) {
        toast.success('✅ Order created successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        
        // Prepare order object for receipt
        const orderForReceipt = {
          ...orderData,
          orderId: result.data.orderId,
          date: result.data.date,
          time: result.data.time
        };
        
        setLastOrder(orderForReceipt);
        setShowReceipt(true);
        setCart([]);
        setCustomerName('Guest');
        setCustomerMobile('');
        setPaymentMode('Cash');
        setErrors({ name: '', mobile: '' });
        setIsCartOpen(false);
        
        // Refresh menu items to update stock
        const refreshedItems = await api.getActiveItems();
        if (refreshedItems.success) {
          const mappedItems = refreshedItems.data.map(item => ({
            id: item['ID'],
            name: item['Name'],
            price: parseFloat(item['Price']),
            category: item['Category'],
            description: item['Description'] || '',
            stock: parseInt(item['Stock'])
          }));
          setMenuItems(mappedItems);
        }
      } else {
        toast.error(result.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Cannot connect to server. Please check your network and make sure backend is running.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleWhatsApp = (order) => {
    const message = `🍲 *Hota's Kitchen*\n\n*Order Details:*\nOrder ID: ${order.orderId}\nDate: ${order.date}\nTime: ${order.time}\nCustomer: ${order.customerName}\n\n*Items Ordered:*\n${order.items.map(item => `• ${item.name} x ${item.quantity} - ${formatCurrency(item.price * item.quantity)}`).join('\n')}\n\n*Total: ${formatCurrency(order.grandTotal)}*\n*Payment: ${order.paymentMode}*\n\nThank you for visiting!\n📍 Kolkata`;
    
    const phoneNumber = order.mobileNumber !== 'N/A' ? order.mobileNumber : '';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  if (loadingItems) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-20 lg:pb-0">
      {/* Menu Section */}
      <div className="flex-1">
        <div className="flex items-center mb-6">
          <ChefHat className="h-8 w-8 text-amber-500 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-white">Our Menu</h2>
            <p className="text-gray-400 text-sm">Homemade food & bakery made with love</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-100 placeholder-gray-400"
            />
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const itemQuantity = getItemQuantity(item.id);
            const isInCart = itemQuantity > 0;
            const isOutOfStock = item.stock <= 0;
            
            return (
              <div
                key={item.id}
                className={`menu-item p-4 relative ${
                  isInCart 
                    ? 'border-amber-500 ring-2 ring-amber-500/30' 
                    : isOutOfStock
                      ? 'border-red-500 opacity-60 cursor-not-allowed'
                      : 'border-gray-700'
                }`}
              >
                {/* Quantity Badge */}
                {isInCart && (
                  <div className="absolute top-2 right-2 bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg z-10">
                    {itemQuantity}
                  </div>
                )}

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-2 py-1 text-xs font-bold shadow-lg z-10">
                    Out of Stock
                  </div>
                )}

                {/* Item Content */}
                <div className="w-full text-left">
                  <div className="flex justify-between items-start mb-2 pr-8">
                    <div className="text-lg font-semibold text-white">{item.name}</div>
                    <div className="text-amber-500 font-bold whitespace-nowrap ml-2">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.description}</p>
                  
                  {/* Stock Indicator */}
                  {!isOutOfStock && (
                    <div className="text-xs text-gray-500 mb-2">
                      Stock: <span className={item.stock <= 10 ? 'text-yellow-500' : 'text-green-500'}>{item.stock}</span>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  {isOutOfStock ? (
                    <div className="text-xs text-red-400 font-medium">
                      Currently Unavailable
                    </div>
                  ) : isInCart ? (
                    <div className="flex items-center justify-between bg-gray-700 rounded-lg p-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (itemQuantity === 1) {
                            removeFromCart(item.id);
                          } else {
                            updateQuantity(item.id, -1);
                          }
                        }}
                        className="p-1.5 rounded bg-gray-600 hover:bg-gray-500 text-white transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-bold text-white">{itemQuantity}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                        disabled={itemQuantity >= item.stock}
                        className="p-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="text-xs text-amber-400 font-medium hover:text-amber-500"
                    >
                      Click to add +
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Cart Section - Only visible on lg and up */}
      <div className="hidden lg:block lg:w-96 bg-gray-800 rounded-2xl shadow-2xl p-6 h-fit lg:sticky lg:top-24 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-amber-500" />
            Current Order
          </h2>
          <span className="text-sm text-gray-400">
            {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">Cart is empty</p>
            <p className="text-gray-500 text-sm mt-1">Add items from the menu</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto custom-scrollbar">
            {cart.map((item) => (
              <CartItem 
                key={item.id} 
                item={item} 
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>
        )}

        <BillingForm
          customerName={customerName}
          customerMobile={customerMobile}
          errors={errors}
          onNameChange={handleNameChange}
          onMobileChange={handleMobileChange}
          onNameBlur={handleNameBlur}
          onMobileBlur={handleMobileBlur}
          paymentMode={paymentMode}
          onPaymentModeChange={handlePaymentModeChange}
          subtotal={subtotal}
          total={total}
          isCheckingOut={isCheckingOut}
          onCheckout={handleCheckout}
          cartEmpty={cart.length === 0}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Floating Cart Button for Mobile/Tablet */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="lg:hidden fixed bottom-4 left-4 right-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4 rounded-2xl shadow-2xl z-40 flex items-center justify-between"
        >
          <div className="flex items-center">
            <ShoppingCart className="h-6 w-6 mr-3" />
            <div className="text-left">
              <div className="text-xs opacity-90">View Cart</div>
              <div className="font-bold">{totalQuantity} items</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-90">Total</div>
            <div className="font-bold text-lg">{formatCurrency(totalAmount)}</div>
          </div>
        </button>
      )}

      {/* Mobile Cart Modal */}
      {isCartOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-gray-800 w-full rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Billing Details</h3>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-amber-500" />
                Current Order
              </h2>
              <span className="text-sm text-gray-400">
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                {cart.map((item) => (
                  <CartItem 
                    key={item.id} 
                    item={item} 
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            )}

            <BillingForm
              customerName={customerName}
              customerMobile={customerMobile}
              errors={errors}
              onNameChange={handleNameChange}
              onMobileChange={handleMobileChange}
              onNameBlur={handleNameBlur}
              onMobileBlur={handleMobileBlur}
              paymentMode={paymentMode}
              onPaymentModeChange={handlePaymentModeChange}
              subtotal={subtotal}
              total={total}
              isCheckingOut={isCheckingOut}
              onCheckout={handleCheckout}
              cartEmpty={cart.length === 0}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastOrder && (
        <ReceiptModal 
          order={lastOrder} 
          onClose={() => setShowReceipt(false)}
          onWhatsApp={handleWhatsApp}
        />
      )}
    </div>
  );
};

export default POSPage;