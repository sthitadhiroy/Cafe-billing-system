import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.xlsx');

class InventoryManager {
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
    if (!fs.existsSync(INVENTORY_FILE)) {
      const workbook = xlsx.utils.book_new();
      
      // Seed with current menu items from Hota's Kitchen
      const seedData = [
        // FROM THE BAKERY
        { ID: 1, Name: 'Multigrain Bread', Category: 'Bakery', Price: 80, Stock: 50, Description: 'Soft, wholesome loaf baked with a blend of nutritious grains', Active: 'Yes', 'Last Updated': new Date().toISOString() },
        { ID: 2, Name: 'Garlic Breadsticks', Category: 'Bakery', Price: 99, Stock: 50, Description: 'Plain • classic garlic butter • cheesy • stuffed • with jalapeno & sweet corn', Active: 'Yes', 'Last Updated': new Date().toISOString() },
        { ID: 3, Name: 'Egg Puff', Category: 'Bakery', Price: 39, Stock: 50, Description: 'Flaky, golden pastry with a spiced, seasoned filling', Active: 'Yes', 'Last Updated': new Date().toISOString() },
        { ID: 4, Name: 'Closed Bun', Category: 'Bakery', Price: 60, Stock: 50, Description: 'Soft, sweet, rounded delight with a rich, savory filling', Active: 'Yes', 'Last Updated': new Date().toISOString() },
        { ID: 5, Name: 'Sweet Bun', Category: 'Bakery', Price: 39, Stock: 50, Description: 'Light, fluffy and gently sweet', Active: 'Yes', 'Last Updated': new Date().toISOString() },
        { ID: 6, Name: 'Tea Cake (1 piece)', Category: 'Bakery', Price: 250, Stock: 50, Description: 'A baking symphony, soft and perfect for pairing', Active: 'Yes', 'Last Updated': new Date().toISOString() },
        { ID: 7, Name: 'Green Rava Cake (1 piece)', Category: 'Bakery', Price: 350, Stock: 50, Description: 'A nutritious treat crafted from the goodness of rava', Active: 'Yes', 'Last Updated': new Date().toISOString() },

        // FROM THE POT
        { ID: 8, Name: 'Assamese Pork Kale Bhuna', Category: 'Main Course', Price: 450, Stock: 30, Description: 'Classic, aromatic, slow-cooked pork', Active: 'Yes', 'Last Updated': new Date().toISOString() },
        { ID: 9, Name: 'Bengali Posh Kosa', Category: 'Main Course', Price: 400, Stock: 30, Description: 'Rich slow-cooked mutton curry', Active: 'Yes', 'Last Updated': new Date().toISOString() },
        { ID: 10, Name: 'Chicken Kosha Murgi', Category: 'Main Course', Price: 180, Stock: 30, Description: 'A classic Bengali classic simmered with caramelized onions', Active: 'Yes', 'Last Updated': new Date().toISOString() },
        { ID: 11, Name: 'Chicken Besara', Category: 'Main Course', Price: 250, Stock: 30, Description: 'Chicken cooked in a fragrant, mustard-based gravy', Active: 'Yes', 'Last Updated': new Date().toISOString() },
        { ID: 12, Name: 'Village Style Mutton Curry', Category: 'Main Course', Price: 450, Stock: 30, Description: 'Slow-cooked village-style mutton curry', Active: 'Yes', 'Last Updated': new Date().toISOString() },
        { ID: 13, Name: 'Odisha Samila', Category: 'Main Course', Price: 160, Stock: 30, Description: 'A vegetable medley simmered in a fragrant coconut sauce', Active: 'Yes', 'Last Updated': new Date().toISOString() },

        // HARANO SWAD
        { ID: 14, Name: 'Chutney Shukti Murgi', Category: 'Signature', Price: 280, Stock: 30, Description: 'Traditional, tangy & delicious mustard-based chicken curry', Active: 'Yes', 'Last Updated': new Date().toISOString() },
        { ID: 15, Name: 'Ilish Bhappa Bhorta', Category: 'Signature', Price: 410, Stock: 30, Description: 'Hilsa fish steamed with mustard, green chili & mustard oil', Active: 'Yes', 'Last Updated': new Date().toISOString() },
        { ID: 16, Name: 'Shoot-e-Bhanta or Chingri', Category: 'Signature', Price: 220, Stock: 30, Description: 'Eggplant stuffed with shrimp paste, shallow-fried', Active: 'Yes', 'Last Updated': new Date().toISOString() },

        // TO END ON A SWEET NOTE
        { ID: 17, Name: 'Rice Kheer', Category: 'Dessert', Price: 150, Stock: 30, Description: 'A rich, traditional rice pudding', Active: 'Yes', 'Last Updated': new Date().toISOString() },
        { ID: 18, Name: 'Coconut Custard', Category: 'Dessert', Price: 180, Stock: 30, Description: 'A silky, tropical custard with a subtle coconut flavor', Active: 'Yes', 'Last Updated': new Date().toISOString() },
      ];

      const ws = xlsx.utils.json_to_sheet(seedData);
      xlsx.utils.book_append_sheet(workbook, ws, 'Inventory');
      xlsx.writeFile(workbook, INVENTORY_FILE);
    }
  }

  async getAllItems() {
    const workbook = xlsx.readFile(INVENTORY_FILE);
    const worksheet = workbook.Sheets['Inventory'];
    const data = xlsx.utils.sheet_to_json(worksheet);
    return data;
  }

  async getActiveItems() {
    const items = await this.getAllItems();
    return items.filter(item => item['Active'] === 'Yes');
  }

  async getItemById(itemId) {
    const items = await this.getAllItems();
    return items.find(item => item['ID'] === itemId) || null;
  }

  async addItem(itemData) {
    const workbook = xlsx.readFile(INVENTORY_FILE);
    const worksheet = workbook.Sheets['Inventory'];
    const existingData = xlsx.utils.sheet_to_json(worksheet);

    const maxId = existingData.length > 0 ? Math.max(...existingData.map(item => parseInt(item['ID']))) : 0;
    
    const newItem = {
      'ID': maxId + 1,
      'Name': itemData.name,
      'Category': itemData.category,
      'Price': itemData.price,
      'Stock': itemData.stock || 0,
      'Description': itemData.description || '',
      'Active': 'Yes',
      'Last Updated': new Date().toISOString()
    };

    existingData.push(newItem);
    const newWorksheet = xlsx.utils.json_to_sheet(existingData);
    workbook.Sheets['Inventory'] = newWorksheet;
    xlsx.writeFile(workbook, INVENTORY_FILE);

    return newItem;
  }

  async updateItem(itemId, updateData) {
    const workbook = xlsx.readFile(INVENTORY_FILE);
    const worksheet = workbook.Sheets['Inventory'];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    const itemIndex = data.findIndex(item => parseInt(item['ID']) === parseInt(itemId));
    if (itemIndex === -1) return null;

    data[itemIndex] = {
      ...data[itemIndex],
      ...updateData,
      'Last Updated': new Date().toISOString()
    };

    const newWorksheet = xlsx.utils.json_to_sheet(data);
    workbook.Sheets['Inventory'] = newWorksheet;
    xlsx.writeFile(workbook, INVENTORY_FILE);

    return data[itemIndex];
  }

  async deleteItem(itemId) {
    const workbook = xlsx.readFile(INVENTORY_FILE);
    const worksheet = workbook.Sheets['Inventory'];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    const filteredData = data.filter(item => parseInt(item['ID']) !== parseInt(itemId));
    if (filteredData.length === data.length) return false;

    const newWorksheet = xlsx.utils.json_to_sheet(filteredData);
    workbook.Sheets['Inventory'] = newWorksheet;
    xlsx.writeFile(workbook, INVENTORY_FILE);

    return true;
  }

  async updateStock(itemId, newStock) {
    const workbook = xlsx.readFile(INVENTORY_FILE);
    const worksheet = workbook.Sheets['Inventory'];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    const itemIndex = data.findIndex(item => parseInt(item['ID']) === parseInt(itemId));
    if (itemIndex === -1) return null;

    data[itemIndex]['Stock'] = newStock;
    data[itemIndex]['Last Updated'] = new Date().toISOString();

    const newWorksheet = xlsx.utils.json_to_sheet(data);
    workbook.Sheets['Inventory'] = newWorksheet;
    xlsx.writeFile(workbook, INVENTORY_FILE);

    return data[itemIndex];
  }

  async restockItem(itemId, quantity) {
    const workbook = xlsx.readFile(INVENTORY_FILE);
    const worksheet = workbook.Sheets['Inventory'];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    const itemIndex = data.findIndex(item => parseInt(item['ID']) === parseInt(itemId));
    if (itemIndex === -1) return null;

    data[itemIndex]['Stock'] = (parseInt(data[itemIndex]['Stock']) || 0) + quantity;
    data[itemIndex]['Last Updated'] = new Date().toISOString();

    const newWorksheet = xlsx.utils.json_to_sheet(data);
    workbook.Sheets['Inventory'] = newWorksheet;
    xlsx.writeFile(workbook, INVENTORY_FILE);

    return data[itemIndex];
  }

  async deductStock(items) {
    const workbook = xlsx.readFile(INVENTORY_FILE);
    const worksheet = workbook.Sheets['Inventory'];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    let updated = false;
    
    for (const orderItem of items) {
      const itemIndex = data.findIndex(item => item['Name'].toLowerCase() === orderItem.name.toLowerCase());
      
      if (itemIndex !== -1) {
        const currentStock = parseInt(data[itemIndex]['Stock']) || 0;
        data[itemIndex]['Stock'] = Math.max(0, currentStock - orderItem.quantity);
        data[itemIndex]['Last Updated'] = new Date().toISOString();
        updated = true;
      }
    }

    if (updated) {
      const newWorksheet = xlsx.utils.json_to_sheet(data);
      workbook.Sheets['Inventory'] = newWorksheet;
      xlsx.writeFile(workbook, INVENTORY_FILE);
    }

    return updated;
  }

  async getLowStockItems(threshold = 10) {
    const items = await this.getAllItems();
    return items.filter(item => parseInt(item['Stock']) <= threshold);
  }

  async getOutOfStockItems() {
    const items = await this.getAllItems();
    return items.filter(item => parseInt(item['Stock']) === 0);
  }
}

export default new InventoryManager();