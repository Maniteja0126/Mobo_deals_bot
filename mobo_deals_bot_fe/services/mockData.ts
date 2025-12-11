import { Product } from '../types';

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'd1',
    title: 'Digital Alarm Wall Clock with Remote Control',
    description: 'Amazon Original Deal\n⭐ ⭐ ⭐ ⭐ ⭐\n\nDigital Alarm Wall Clock with Remote Control, Auto/Custom Dimmer,Temp,Humidity,Dual Alarms.\n\nFor Review deal 👇🏻\n1. PP- 501-999 - 299 Less\n2. PP- 1001-1499 - 399 Less\n3. PP- above 1501 - 799 Less\n\nFor Rating deal 👇🏻\n1. PP- 501-999 - 399 Less\n2. PP- 1001-1499 - 499 Less\n\nReview issue- 50% Refund with unverified\nSafe deal 🤝😃 DM for link',
    price: 899.00, // Approximate PP for display
    category: 'Home',
    image: 'https://picsum.photos/400/400?random=10',
    rating: 5.0,
    tags: ['clock', 'home-decor', 'review-deal'],
    platform: 'Amazon',
    dealType: 'Review'
  },
  {
    id: 'd2',
    title: 'TWS Wireless Earbuds Bluetooth 5.3',
    description: 'Flipkart Assured Deal\n🎧 High Bass & Noise Cancellation\n\nFor Rating Deal ONLY 👇🏻\n1. PP- 300-500 - 100% Refund\n2. PP- 501-800 - 400 Less\n\nCondition: Account must be 6 months old.\nDM for link immediately! 🏃‍♂️',
    price: 499.00,
    category: 'Electronics',
    image: 'https://picsum.photos/400/400?random=11',
    rating: 4.8,
    tags: ['audio', 'wireless', 'free-product'],
    platform: 'Flipkart',
    dealType: 'Rating'
  },
  {
    id: 'd3',
    title: 'Men Slim Fit Formal Trousers',
    description: 'Myntra Fashion Deal 👔\n\nPurchase Price (PP) approx 1200\n\nOffer:\n1. Buy 2 Get 60% Cashback via UPI\n2. Buy 1 Get 200 Flat Off\n\nNeed sizing feedback in review.\nLimited slots available!',
    price: 1200.00,
    category: 'Fashion',
    image: 'https://picsum.photos/400/400?random=12',
    rating: 4.2,
    tags: ['clothing', 'mens-wear', 'cashback'],
    platform: 'Myntra',
    dealType: 'Review'
  },
  {
    id: 'd4',
    title: 'Smart LED Bulb 12W RGB',
    description: 'Flash Sale! 💡\n\nPP: 399\nRefund: Full 399 via GPay after 5 star rating + photo.\n\nNote: Do not mention "Refund" in review.\nSafe Seller.',
    price: 399.00,
    category: 'Home',
    image: 'https://picsum.photos/400/400?random=13',
    rating: 4.5,
    tags: ['smart-home', 'free', 'rating-deal'],
    platform: 'Amazon',
    dealType: 'Rating'
  }
];

export const MOCK_DELAY = 600;