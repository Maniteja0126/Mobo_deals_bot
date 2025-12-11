import { User, Product, Order, OrderStatus } from '../types';
import { SEED_PRODUCTS, MOCK_DELAY } from './mockData';

// Keys for localStorage
const USERS_KEY = 'shopgenie_users';
const ORDERS_KEY = 'shopgenie_orders';
const PRODUCTS_KEY = 'shopgenie_products';

// Initialize mock DB if empty
const initDB = () => {
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
  }
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
  }
};

initDB();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth Service ---

export const authAPI = {
  login: async (email: string, password: string): Promise<User> => {
    await delay(MOCK_DELAY);
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user) throw new Error('Invalid credentials');
    
    return { ...user, token: `mock-jwt-${Date.now()}` };
  },

  register: async (name: string, email: string, mobile: string, password: string): Promise<User> => {
    await delay(MOCK_DELAY);
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      mobile,
      token: `mock-jwt-${Date.now()}`
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  }
};

// --- Products Service ---

export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    await delay(MOCK_DELAY / 2);
    // Always return seed products for this demo to ensure latest data structure
    return SEED_PRODUCTS; 
  },

  getById: async (id: string): Promise<Product | undefined> => {
    await delay(MOCK_DELAY / 2);
    return SEED_PRODUCTS.find(p => p.id === id);
  },
  
  getByIds: async (ids: string[]): Promise<Product[]> => {
    await delay(MOCK_DELAY / 2);
    return SEED_PRODUCTS.filter(p => ids.includes(p.id));
  }
};

// --- Orders Service ---

export const ordersAPI = {
  create: async (userId: string, items: { productId: string; quantity: number }[]): Promise<Order> => {
    await delay(MOCK_DELAY);
    const orders: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    const products = await productsAPI.getAll();

    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      return {
        productId: product.id,
        title: product.title,
        priceAtPurchase: product.price,
        quantity: item.quantity,
        image: product.image
      };
    });

    const total = orderItems.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      userId,
      items: orderItems,
      total,
      status: OrderStatus.ReviewSubmitted, // Default for this demo context
      paymentStatus: 'Paid',
      createdAt: new Date().toISOString(),
      paymentMethod: 'UPI'
    };

    orders.push(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return newOrder;
  },

  getUserOrders: async (userId: string): Promise<Order[]> => {
    await delay(MOCK_DELAY);
    const orders: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    return orders.filter(o => o.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
};