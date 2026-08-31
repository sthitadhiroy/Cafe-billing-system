import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { TrendingUp, Users, IndianRupee, ShoppingCart, RefreshCw, ChefHat, FileSpreadsheet, FileText, Phone, Clock, CreditCard, Banknote } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [todayOrders, setTodayOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResult, ordersResult] = await Promise.all([
        api.getDashboardStats(),
        api.getTodayOrders()
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      }
      if (ordersResult.success) {
        setTodayOrders(ordersResult.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const downloadExcel = () => {
    const headers = ['Order ID', 'Date', 'Time', 'Customer Name', 'Mobile Number', 'Items', 'Total', 'Payment Mode', 'Order Status'];
    const rows = todayOrders.map(order => [
      order['Order ID'],
      order['Date'],
      order['Time'],
      order['Customer Name'],
      order['Mobile Number'],
      order['Items Ordered'],
      order['Grand Total'],
      order['Payment Mode'],
      order['Order Status']
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hotas-kitchen-orders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Hota's Kitchen - Today's Orders</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            h1 { margin: 0; }
            .date { margin-top: 5px; font-size: 14px; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .total-row {
              font-weight: bold;
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🍲 Hota's Kitchen</h1>
            <div>Homemade food & bakery</div>
            <div class="date">Date: ${new Date().toLocaleDateString('en-IN')}</div>
          </div>
          
          <h3>Today's Orders Report</h3>
          
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Time</th>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              ${todayOrders.map(order => `
                <tr>
                  <td>${order['Order ID']}</td>
                  <td>${order['Time']}</td>
                  <td>${order['Customer Name']}</td>
                  <td>${order['Mobile Number']}</td>
                  <td>${order['Items Ordered']}</td>
                  <td>${formatCurrency(parseFloat(order['Grand Total']))}</td>
                  <td>${order['Payment Mode']}</td>
                </tr>
              `).join('')}
            </tbody>
            <tr class="total-row">
              <td colspan="5">Total Revenue</td>
              <td colspan="2">${stats ? formatCurrency(stats.todayRevenue) : '₹0'}</td>
            </tr>
          </table>
          
          <div class="footer">
            <p>Total Orders: ${todayOrders.length} | Total Revenue: ${stats ? formatCurrency(stats.todayRevenue) : '₹0'}</p>
            <p>Generated on ${new Date().toLocaleString('en-IN')}</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const statsCards = [
    {
      title: "Today's Revenue",
      value: stats ? formatCurrency(stats.todayRevenue) : '₹0',
      icon: IndianRupee,
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
    },
    {
      title: "Today's Orders",
      value: stats ? stats.todayOrders : 0,
      icon: ShoppingCart,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    },
    {
      title: 'Total Revenue',
      value: stats ? formatCurrency(stats.totalRevenue) : '₹0',
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-amber-500 to-orange-600',
    },
    {
      title: 'Average Order Value',
      value: stats ? formatCurrency(stats.averageOrderValue) : '₹0',
      icon: Users,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    }
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <ChefHat className="h-8 w-8 text-amber-500 mr-3" />
          <h1 className="text-xl md:text-2xl font-bold text-white">Dashboard Overview</h1>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center px-4 py-2 bg-gray-800 rounded-lg shadow hover:shadow-md transition-all text-white border border-gray-700 w-full md:w-auto justify-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-gray-700">
            <div className={`inline-flex p-3 rounded-lg ${card.color} text-white mb-3 shadow-lg`}>
              <card.icon className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-white">{card.value}</div>
            <div className="text-gray-400 text-xs md:text-sm mt-1">{card.title}</div>
          </div>
        ))}
      </div>

      {/* Download Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          onClick={downloadExcel}
          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
        >
          <FileSpreadsheet className="h-5 w-5 mr-2" />
          Download Excel
        </button>
        <button
          onClick={downloadPDF}
          className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto"
        >
          <FileText className="h-5 w-5 mr-2" />
          Download PDF
        </button>
      </div>

      {/* Today's Orders */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
        <div className="px-4 md:px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Today's Orders</h2>
          <span className="text-sm text-gray-400">{todayOrders.length} orders</span>
        </div>
        
        {/* Desktop Table View (lg and up) */}
        <div className="hidden lg:block overflow-x-auto" id="orders-table">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-400">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                  </td>
                </tr>
              ) : todayOrders.map((order, index) => (
                <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{order['Order ID']}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{order['Time']}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order['Customer Name']}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{order['Mobile Number']}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 truncate max-w-xs">{order['Items Ordered']}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-amber-400">
                    {formatCurrency(parseFloat(order['Grand Total']))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order['Payment Mode'] === 'Cash' 
                        ? 'bg-green-900/50 text-green-400 border border-green-700' 
                        : 'bg-blue-900/50 text-blue-400 border border-blue-700'
                    }`}>
                      {order['Payment Mode']}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
                      {order['Order Status']}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && todayOrders.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-400">
                    No orders today yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card View for Mobile and Tablet (below lg) */}
        <div className="lg:hidden p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : todayOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No orders today yet
            </div>
          ) : (
            todayOrders.map((order, index) => (
              <div key={index} className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{order['Customer Name']}</div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {order['Mobile Number']}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {order['Time']}
                  </span>
                </div>

                {/* Order ID */}
                <div className="text-xs text-gray-400 mb-3">
                  Order ID: <span className="text-gray-300">{order['Order ID']}</span>
                </div>

                {/* Items */}
                <div className="bg-gray-800 rounded-lg p-3 mb-3">
                  <div className="text-xs text-gray-400 mb-2">Items Ordered:</div>
                  <div className="text-sm text-gray-200">
                    {order['Items Ordered']}
                  </div>
                </div>

                {/* Amount and Payment */}
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold text-amber-400">
                    {formatCurrency(parseFloat(order['Grand Total']))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`flex items-center px-2 py-1 rounded-full text-xs ${
                      order['Payment Mode'] === 'Cash' 
                        ? 'bg-green-900/50 text-green-400 border border-green-700' 
                        : 'bg-blue-900/50 text-blue-400 border border-blue-700'
                    }`}>
                      {order['Payment Mode'] === 'Cash' ? (
                        <Banknote className="h-3 w-3 mr-1" />
                      ) : (
                        <CreditCard className="h-3 w-3 mr-1" />
                      )}
                      {order['Payment Mode']}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-300">
                      {order['Order Status']}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;