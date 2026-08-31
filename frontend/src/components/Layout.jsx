import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, BarChart3, ChefHat, Menu, X, Package, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const auth = localStorage.getItem('cafe_auth');
    if (auth) {
      try {
        setUser(JSON.parse(auth));
      } catch (error) {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cafe_auth');
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const navItems = [
    { to: '/pos', icon: ShoppingCart, label: 'POS Counter' },
    { to: '/admin', icon: BarChart3, label: 'Dashboard' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <nav className="bg-gray-900/95 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              {/* Logo */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <span className="text-lg md:text-xl font-bold text-white">Hota's Kitchen</span>
                <div className="text-xs text-amber-400">Homemade food & bakery</div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </NavLink>
              ))}
              
              {/* User Info and Logout */}
              <div className="flex items-center border-l border-gray-700 pl-4 ml-2">
                <span className="text-sm text-gray-300 mr-3">
                  👤 {user?.username || 'admin'}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-gray-700"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700 bg-gray-900">
            <div className="px-4 py-2 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </NavLink>
              ))}
              
              {/* User Info for Mobile */}
              <div className="flex items-center px-4 py-3 text-gray-400">
                <span className="text-sm">👤 Logged in as: {user?.username || 'admin'}</span>
              </div>
              
              {/* Logout Button for Mobile */}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
      
      <main className="flex-1 max-w-7xl mx-auto py-6 px-4">
        <Outlet />
      </main>
      
      <footer className="bg-gray-900 border-t border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-400 text-sm">
            🍲 Homemade food & bakery | Made in small batches with good ingredients & lots of love
          </p>
          <p className="text-gray-500 text-xs mt-1">📍 Kolkata</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;