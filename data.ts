import { Product } from './types';

export const SAMPLE_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Fresh Strawberries', 
    price: 3.99, 
    unit: 'lb', 
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=500', 
    farmer: 'Green Valley Farm', 
    rating: 4.8, 
    category: 'Fruits',
    description: 'Sweet, juicy, and freshly picked organic strawberries. Perfect for desserts or healthy snacking.',
    location: 'Watsonville, CA'
  },
  { 
    id: '2', 
    name: 'Organic Spinach', 
    price: 2.49, 
    unit: 'bunch', 
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=500', 
    farmer: 'Sunnyside Acres', 
    rating: 4.6, 
    category: 'Vegetables',
    description: 'Crisp and tender spinach leaves, grown without pesticides. Rich in iron and vitamins.',
    location: 'Salinas, CA'
  },
  { 
    id: '3', 
    name: 'Heirloom Tomatoes', 
    price: 4.99, 
    unit: 'lb', 
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=500', 
    farmer: 'Old Mill Farm', 
    rating: 4.9, 
    category: 'Vegetables',
    description: 'Colorful and flavorful heirloom tomatoes. A mix of varieties perfect for salads and sandwiches.',
    location: 'Napa Valley, CA'
  },
  { 
    id: '4', 
    name: 'Raw Local Honey', 
    price: 8.00, 
    unit: 'jar', 
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=500', 
    farmer: 'Beekeeper Ben', 
    rating: 5.0, 
    category: 'Honey',
    description: 'Unfiltered, raw honey from local wildflowers. Contains natural pollen and enzymes.',
    location: 'Sonoma, CA'
  },
  { 
    id: '5', 
    name: 'Organic Gala Apples', 
    price: 2.99, 
    unit: 'lb', 
    image: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?auto=format&fit=crop&q=80&w=500', 
    farmer: 'Sunnyvale Farms', 
    rating: 4.7, 
    category: 'Fruits',
    description: 'Crisp, sweet, and aromatic. These Gala apples are perfect for school lunches.',
    location: 'Yakima, WA'
  },
  { 
    id: '6', 
    name: 'Fresh Free-Range Eggs', 
    price: 6.50, 
    unit: 'dozen', 
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=500', 
    farmer: 'Happy Hens Co.', 
    rating: 4.9, 
    category: 'Dairy',
    description: 'Farm-fresh eggs with vibrant orange yolks. From chickens raised on open pasture.',
    location: 'Petaluma, CA'
  },
];