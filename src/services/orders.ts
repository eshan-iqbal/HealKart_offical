// src/services/orders.ts
'use server'; // Mark this module for server-side execution

import type { CartItem } from '@/context/cart-context';
import type { AddressSchema } from '@/components/forms/address-form';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';
import User from '@/models/user';
import { Server as IOServer } from 'socket.io';
import mongoose from 'mongoose';
import Product from '@/models/product';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Define the structure for an order item within the database order document
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  mobileNumber: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  landmark?: string;
}

// Define the structure for the Order document in MongoDB
export interface Order {
  _id?: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  shippingCost: number; // Added
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  upiId?: string;
  couponCode?: string; // Added coupon code
  couponDiscount?: number; // Added coupon discount amount
  createdAt: string;
  status: OrderStatus;
  assignedTo?: string | null;
  assignedAt?: string;
  assignedBy?: string;
}

// MongoDB document type
interface MongoOrder extends Omit<Order, '_id'> {
  _id: ObjectId;
}

/**
 * Creates a new order in the database.
 * @param orderData - The data for the new order.
 * @returns The newly created order document, including its _id.
 * @throws Error if connection fails, insertion fails, or retrieval after insertion fails.
 */
export async function createOrder(orderData: Omit<Order, '_id' | 'createdAt' | 'status'>): Promise<Order> {
  try {
    console.log('[createOrder] Attempting to create order with data:', orderData);
    
    const client = await clientPromise;
    const db = client.db('healkart');
    const ordersCollection = db.collection<MongoOrder>('orders');
    
    // Add default status and timestamp
    const orderWithStatus = {
      ...orderData,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };
    
    const result = await ordersCollection.insertOne(orderWithStatus as MongoOrder);
    console.log('[createOrder] Order created successfully:', result.insertedId);

    // Decrement stock for each ordered product in Firestore (using Admin SDK)
    try {
      for (const item of orderData.items) {
        const productRef = adminDb.collection('products').doc(item.id);
        await productRef.update({ stock: FieldValue.increment(-item.quantity) });
      }
    } catch (err) {
      console.error('[createOrder] Failed to decrement product stock in Firestore (Admin SDK):', err);
    }
    
    // Notify all admins via email
    try {
      const admins = await db.collection('users').find({ role: 'admin' }).toArray();
      const adminEmails = admins.map((a: any) => a.email).filter(Boolean);
      if (adminEmails.length > 0) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
          },
        });
        await transporter.sendMail({
          from: process.env.SMTP_EMAIL,
          to: adminEmails.join(','),
          subject: 'New Order Placed',
          text: `A new order has been placed.\nOrder ID: ${result.insertedId}\nUser: ${orderData.userEmail}\nTotal: ₹${orderData.totalAmount}\nItems: ${orderData.items.map(i => i.name + ' (x' + i.quantity + ')').join(', ')}`,
          html: `<h2>New Order Placed</h2><p><b>Order ID:</b> ${result.insertedId}</p><p><b>User:</b> ${orderData.userEmail}</p><p><b>Total:</b> ₹${orderData.totalAmount}</p><p><b>Items:</b> ${orderData.items.map(i => i.name + ' (x' + i.quantity + ')').join(', ')}</p>`
        });
      }
    } catch (err) {
      console.error('[createOrder] Failed to send admin notification:', err);
    }
    
    // Emit real-time notification to admins via Socket.IO
    try {
      if ((globalThis as any)?.res?.socket?.server?.io) {
        (globalThis as any).res.socket.server.io.emit('new-order', {
          orderId: result.insertedId,
          userEmail: orderData.userEmail,
          totalAmount: orderData.totalAmount,
          createdAt: orderWithStatus.createdAt,
        });
      }
    } catch (err) {
      console.error('[createOrder] Failed to emit socket notification:', err);
    }
    
    // Return the complete order with _id
    return {
      ...orderWithStatus,
      _id: result.insertedId.toString()
    };
  } catch (error) {
    console.error('!!! [createOrder] Critical Error creating order !!!', error);
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        throw new Error('Database connection failed. Please check your MongoDB connection string in .env.local file.');
      }
      if (error.message.includes('Authentication failed')) {
        throw new Error('Database authentication failed. Please check your MongoDB username and password.');
      }
      if (error.message.includes('timed out')) {
        throw new Error('Connection to database timed out. Please check your internet connection and try again.');
      }
      throw new Error(`Failed to create order: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while creating the order.');
  }
}

/**
 * Retrieves all orders placed by a specific user.
 * @param userId - The Clerk User ID.
 * @returns A promise that resolves to an array of the user's orders, sorted by date descending.
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  if (!userId) {
    console.warn('[getUserOrders] Called without userId');
    return [];
  }
  
  try {
    const client = await clientPromise;
    const db = client.db('healkart');
    const ordersCollection = db.collection<MongoOrder>('orders');
    
    const userOrders = await ordersCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`[getUserOrders] Fetched ${userOrders.length} orders for user ${userId}`);
    return userOrders.map(order => ({
      ...order,
      _id: order._id.toString()
    }));
  } catch (error) {
    console.error(`[getUserOrders] Error fetching orders for user ${userId}:`, error);
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        throw new Error('Failed to connect to the database. Please check your internet connection and try again.');
      }
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching orders.');
  }
}

/**
 * Retrieves all orders (for admin use).
 * @returns A promise that resolves to an array of all orders, sorted by date descending.
 */
export async function getAllOrders(): Promise<Order[]> {
  try {
    const client = await clientPromise;
    const db = client.db('healkart');
    const ordersCollection = db.collection<MongoOrder>('orders');
    
    const orders = await ordersCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    
    return orders.map(order => ({
      ...order,
      _id: order._id.toString()
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        throw new Error('Failed to connect to the database. Please check your internet connection and try again.');
      }
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching orders.');
  }
}

export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const client = await clientPromise;
    const db = client.db('healkart');
    const ordersCollection = db.collection<MongoOrder>('orders');
    
    const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
    if (!order) return null;
    
    return {
      ...order,
      _id: order._id.toString()
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        throw new Error('Failed to connect to the database. Please check your internet connection and try again.');
      }
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching the order.');
  }
}

/**
 * Updates the status of a specific order.
 * @param orderId - The ID of the order to update (as string).
 * @param newStatus - The new status for the order.
 * @returns The updated order document or null if not found.
 * @throws Error if the orderId is invalid or the database update fails.
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order | null> {
  console.log(`[updateOrderStatus] Attempting to update status for order ID: ${orderId} to ${newStatus}`);
  
  try {
    const client = await clientPromise;
    const db = client.db('healkart');
    const ordersCollection = db.collection<MongoOrder>('orders');
    
    // Convert status to lowercase to match the type
    const normalizedStatus = newStatus.toLowerCase() as OrderStatus;
    
    const result = await ordersCollection.findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: { status: normalizedStatus } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      console.warn(`[updateOrderStatus] Order with ID ${orderId} not found.`);
      return null;
    }
    
    console.log(`[updateOrderStatus] Order ${orderId} status updated successfully to ${normalizedStatus}`);
    return {
      ...result,
      _id: result._id.toString()
    };
  } catch (error) {
    console.error(`[updateOrderStatus] Error updating status for order ${orderId}:`, error);
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        throw new Error('Failed to connect to the database. Please check your internet connection and try again.');
      }
      throw new Error(`Failed to update order status: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while updating the order status.');
  }
}

// --- Placeholder for WhatsApp Notification ---
// In a real app, this would likely call a third-party API (e.g., Twilio)
async function sendWhatsAppNotification(order: Order) {
    // Ensure order._id is handled correctly (it might be undefined before insertion retrieves it)
    const orderIdString = order._id ? order._id.toString() : 'N/A (Pre-insertion)';
    console.log(`--- Simulating WhatsApp Notification ---`);
    console.log(`To: User ${order.userId}`);
    console.log(`Order ID: ${orderIdString}`);
    console.log(`Total: ₹${order.totalAmount.toFixed(2)}`);
    console.log(`Status: ${order.status}`);
    console.log(`Message: Your order has been placed/updated!`);
    console.log(`--------------------------------------`);
    // Add actual API call logic here
    // Example: await twilio.messages.create({ ... })
}

/**
 * Assigns an order to a specific admin user.
 * @param orderId - The ID of the order to assign.
 * @param adminId - The ID of the admin user to assign the order to.
 * @param assignedBy - The ID of the admin user making the assignment.
 * @returns The updated order document or null if not found.
 */
export async function assignOrder(orderId: string, adminId: string, assignedBy: string): Promise<Order | null> {
  console.log(`[assignOrder] Assigning order ${orderId} to admin ${adminId}`);
  
  try {
    const client = await clientPromise;
    const db = client.db('healkart');
    const ordersCollection = db.collection<MongoOrder>('orders');
    
    const result = await ordersCollection.findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          assignedTo: adminId,
          assignedAt: new Date().toISOString(),
          assignedBy: assignedBy
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      console.warn(`[assignOrder] Order with ID ${orderId} not found.`);
      return null;
    }
    
    console.log(`[assignOrder] Order ${orderId} assigned successfully to admin ${adminId}`);
    return {
      ...result,
      _id: result._id.toString()
    };
  } catch (error) {
    console.error(`[assignOrder] Error assigning order ${orderId}:`, error);
    throw new Error(`Failed to assign order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all orders assigned to a specific admin user.
 * @param adminId - The ID of the admin user.
 * @returns A promise that resolves to an array of assigned orders.
 */
export async function getAssignedOrders(adminId: string): Promise<Order[]> {
  try {
    const client = await clientPromise;
    const db = client.db('healkart');
    const ordersCollection = db.collection<MongoOrder>('orders');
    
    const assignedOrders = await ordersCollection
      .find({ assignedTo: adminId })
      .sort({ createdAt: -1 })
      .toArray();
    
    return assignedOrders.map(order => ({
      ...order,
      _id: order._id.toString()
    }));
  } catch (error) {
    console.error(`[getAssignedOrders] Error fetching assigned orders for admin ${adminId}:`, error);
    throw new Error(`Failed to fetch assigned orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all unassigned orders (orders without an assignedTo field).
 * @returns A promise that resolves to an array of unassigned orders.
 */
export async function getUnassignedOrders(): Promise<Order[]> {
  try {
    const client = await clientPromise;
    const db = client.db('healkart');
    const ordersCollection = db.collection<MongoOrder>('orders');
    
    const unassignedOrders = await ordersCollection
      .find({ 
        $or: [
          { assignedTo: { $exists: false } },
          { assignedTo: { $eq: null } }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    return unassignedOrders.map(order => ({
      ...order,
      _id: order._id.toString()
    }));
  } catch (error) {
    console.error('[getUnassignedOrders] Error fetching unassigned orders:', error);
    throw new Error(`Failed to fetch unassigned orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
