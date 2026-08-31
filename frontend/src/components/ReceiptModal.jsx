import React from 'react';
import { X, Printer, MessageCircle } from 'lucide-react';

const ReceiptModal = ({ order, onClose, onWhatsApp }) => {
  if (!order) return null;

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Order Receipt - ${order.orderId}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              padding: 20px;
              max-width: 350px;
              margin: 0 auto;
              color: #000;
              background: #fff;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 12px;
              margin-top: 5px;
              color: #666;
            }
            .order-info {
              margin: 20px 0;
              font-size: 14px;
            }
            .order-info p {
              margin: 5px 0;
              line-height: 1.5;
            }
            .order-info strong {
              display: inline-block;
              width: 80px;
            }
            .items {
              margin: 20px 0;
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              padding: 10px 0;
            }
            .item {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
              font-size: 14px;
              padding: 2px 0;
            }
            .item-name {
              flex: 1;
            }
            .item-price {
              margin-left: 10px;
              white-space: nowrap;
            }
            .total-section {
              margin-top: 20px;
              text-align: right;
            }
            .total {
              font-size: 18px;
              font-weight: bold;
              margin-top: 10px;
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            .payment-section {
              margin-top: 10px;
              text-align: right;
              font-size: 14px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              border-top: 2px dashed #000;
              padding-top: 10px;
              color: #666;
            }
            .thank-you {
              font-size: 14px;
              margin-top: 5px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🍲 Hota's Kitchen</div>
            <div class="subtitle">Homemade food & bakery</div>
            <div class="subtitle">📍 Kolkata</div>
            <div class="subtitle">Made in small batches with good ingredients & lots of love</div>
          </div>
          
          <div class="order-info">
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Date:</strong> ${order.date}</p>
            <p><strong>Time:</strong> ${order.time}</p>
            <p><strong>Customer:</strong> ${order.customerName}</p>
            ${order.mobileNumber !== 'N/A' ? `<p><strong>Mobile:</strong> ${order.mobileNumber}</p>` : ''}
          </div>
          
          <div class="items">
            ${order.items.map(item => `
              <div class="item">
                <span class="item-name">${item.name} x ${item.quantity}</span>
                <span class="item-price">${formatCurrency(item.price * item.quantity)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total-section">
            <div class="total">Total: ${formatCurrency(order.grandTotal)}</div>
            <div class="payment-section">Payment: ${order.paymentMode}</div>
          </div>
          
          <div class="footer">
            <div class="thank-you">Thank you for visiting!</div>
            <p>Made with ❤️ in Kolkata</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">Order Receipt</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          {/* Printable Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
            <div className="text-center mb-4 border-b border-dashed border-gray-300 pb-4">
              <div className="text-2xl font-bold text-gray-900">🍲 Hota's Kitchen</div>
              <div className="text-sm text-gray-600">Homemade food & bakery</div>
              <div className="text-xs text-gray-500 mt-1">📍 Kolkata</div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-700">Order ID:</span>
                <span className="text-gray-900">{order.orderId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-700">Date:</span>
                <span className="text-gray-900">{order.date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-700">Time:</span>
                <span className="text-gray-900">{order.time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-700">Customer:</span>
                <span className="text-gray-900">{order.customerName}</span>
              </div>
              {order.mobileNumber !== 'N/A' && (
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-700">Mobile:</span>
                  <span className="text-gray-900">{order.mobileNumber}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-b border-dashed border-gray-300 py-3 mb-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm mb-2">
                  <span className="text-gray-800">{item.name} x {item.quantity}</span>
                  <span className="text-gray-800">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg text-gray-900">Total</span>
              <span className="font-bold text-lg text-orange-600">{formatCurrency(order.grandTotal)}</span>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Payment Method:</span>
              <span className="font-medium text-gray-800">{order.paymentMode}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Printer className="h-5 w-5 mr-2" />
              Print Bill
            </button>
            
            <button
              onClick={() => onWhatsApp(order)}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Share on WhatsApp
            </button>
            
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;