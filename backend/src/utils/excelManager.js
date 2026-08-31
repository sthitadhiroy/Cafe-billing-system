import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use /tmp for Render free tier (data is lost on restart)
const DATA_DIR = process.env.DATA_DIR || '/tmp/cafe-data';
const EXCEL_FILE = path.join(DATA_DIR, 'cafe-data.xlsx');

//const DATA_DIR = path.join(__dirname, '../../data');//
//const EXCEL_FILE = path.join(DATA_DIR, 'cafe-data.xlsx');//

class ExcelManager {
  constructor() {
    this.ensureDataDirectory();
    this.initializeWorkbook();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  initializeWorkbook() {
    if (!fs.existsSync(EXCEL_FILE)) {
      const workbook = xlsx.utils.book_new();
      const ws = xlsx.utils.aoa_to_sheet([
        ['Order ID', 'Date', 'Time', 'Customer Name', 'Mobile Number', 'Items', 'Quantity', 'Unit Price', 'Subtotal', 'Discount', 'Tax', 'Grand Total', 'Payment Mode', 'Order Status', 'WhatsApp Status']
      ]);
      xlsx.utils.book_append_sheet(workbook, ws, 'Template');
      xlsx.writeFile(workbook, EXCEL_FILE);
    }
  }

  getTodaySheetName() {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString('en-US', { month: 'short' });
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getOrCreateDailySheet() {
    const workbook = xlsx.readFile(EXCEL_FILE);
    const sheetName = this.getTodaySheetName();

    if (!workbook.SheetNames.includes(sheetName)) {
      const ws = xlsx.utils.aoa_to_sheet([
        ['Order ID', 'Date', 'Time', 'Customer Name', 'Mobile Number', 'Items Ordered', 'Quantity', 'Individual Item Price', 'Subtotal', 'Discount', 'Tax', 'Grand Total', 'Payment Mode', 'Order Status', 'WhatsApp Status']
      ]);
      xlsx.utils.book_append_sheet(workbook, ws, sheetName);
      xlsx.writeFile(workbook, EXCEL_FILE);
    }

    return workbook;
  }

  async addOrder(orderData) {
    const workbook = this.getOrCreateDailySheet();
    const sheetName = this.getTodaySheetName();
    const worksheet = workbook.Sheets[sheetName];

    const existingData = xlsx.utils.sheet_to_json(worksheet);
    const newRow = {
      'Order ID': orderData.orderId,
      'Date': orderData.date,
      'Time': orderData.time,
      'Customer Name': orderData.customerName,
      'Mobile Number': orderData.mobileNumber,
      'Items Ordered': orderData.items.map(item => item.name).join(', '),
      'Quantity': orderData.items.reduce((sum, item) => sum + item.quantity, 0),
      'Individual Item Price': orderData.items.map(item => `${item.name}: $${item.price}`).join(', '),
      'Subtotal': orderData.subtotal,
      'Discount': orderData.discount,
      'Tax': orderData.tax,
      'Grand Total': orderData.grandTotal,
      'Payment Mode': orderData.paymentMode,
      'Order Status': orderData.orderStatus,
      'WhatsApp Status': orderData.whatsappStatus
    };

    existingData.push(newRow);
    const newWorksheet = xlsx.utils.json_to_sheet(existingData);
    workbook.Sheets[sheetName] = newWorksheet;
    xlsx.writeFile(workbook, EXCEL_FILE);

    return orderData;
  }

  async getTodayOrders() {
    const workbook = this.getOrCreateDailySheet();
    const sheetName = this.getTodaySheetName();
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) return [];
    
    return xlsx.utils.sheet_to_json(worksheet);
  }

  async getAllOrders() {
    const workbook = xlsx.readFile(EXCEL_FILE);
    const allOrders = [];

    for (const sheetName of workbook.SheetNames) {
      if (sheetName !== 'Template') {
        const worksheet = workbook.Sheets[sheetName];
        const orders = xlsx.utils.sheet_to_json(worksheet);
        allOrders.push(...orders);
      }
    }

    return allOrders;
  }

  async updateOrderStatus(orderId, status) {
    const workbook = xlsx.readFile(EXCEL_FILE);
    
    for (const sheetName of workbook.SheetNames) {
      if (sheetName !== 'Template') {
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        const orderIndex = data.findIndex(order => order['Order ID'] === orderId);
        
        if (orderIndex !== -1) {
          data[orderIndex]['Order Status'] = status;
          const newWorksheet = xlsx.utils.json_to_sheet(data);
          workbook.Sheets[sheetName] = newWorksheet;
          xlsx.writeFile(workbook, EXCEL_FILE);
          return true;
        }
      }
    }
    
    return false;
  }

  async getDashboardStats() {
    const todayOrders = await this.getTodayOrders();
    const allOrders = await this.getAllOrders();
    
    const todayTotal = todayOrders.reduce((sum, order) => sum + parseFloat(order['Grand Total'] || 0), 0);
    const overallTotal = allOrders.reduce((sum, order) => sum + parseFloat(order['Grand Total'] || 0), 0);
    
    return {
      todayOrders: todayOrders.length,
      todayRevenue: todayTotal,
      totalOrders: allOrders.length,
      totalRevenue: overallTotal,
      averageOrderValue: allOrders.length > 0 ? overallTotal / allOrders.length : 0
    };
  }
}

export default new ExcelManager();
