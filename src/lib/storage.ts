import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize orders file if it doesn't exist
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify({ orders: [] }));
}

export async function saveOrder(orderData: any) {
  try {
    // Read existing orders
    const data = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
    
    // Add new order with timestamp
    const order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    data.orders.push(order);
    
    // Save updated orders
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2));
    
    return order;
  } catch (error) {
    console.error('Error saving order:', error);
    throw new Error('Failed to save order');
  }
}

export async function getOrders() {
  try {
    const data = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
    return data.orders;
  } catch (error) {
    console.error('Error reading orders:', error);
    throw new Error('Failed to read orders');
  }
}

export async function getOrderById(orderId: string) {
  try {
    const data = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
    return data.orders.find((order: any) => order.id === orderId);
  } catch (error) {
    console.error('Error reading order:', error);
    throw new Error('Failed to read order');
  }
} 