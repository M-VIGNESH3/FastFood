const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const restaurantRoutes = require('./routes/restaurantRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ service: 'restaurant-service', status: 'running', timestamp: new Date() });
});

// Routes
app.use('/api/restaurants', restaurantRoutes);

// Seed sample data endpoint
app.post('/api/seed', async (req, res) => {
  try {
    const Restaurant = require('./models/Restaurant');

    const sampleRestaurants = [
      {
        name: 'Burger Palace',
        description: 'The best burgers in town with premium ingredients and secret sauces',
        cuisine: 'American',
        address: { street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001' },
        phone: '555-0101',
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        isOpen: true,
        deliveryTime: '25-35 min',
        deliveryFee: 2.99,
        menu: [
          { name: 'Classic Burger', description: 'Juicy beef patty with lettuce, tomato, and special sauce', price: 9.99, category: 'main', isAvailable: true },
          { name: 'Cheese Burger', description: 'Classic burger with melted cheddar cheese', price: 11.99, category: 'main', isAvailable: true },
          { name: 'Bacon Deluxe', description: 'Double patty with crispy bacon and BBQ sauce', price: 14.99, category: 'main', isAvailable: true },
          { name: 'French Fries', description: 'Crispy golden fries with sea salt', price: 4.99, category: 'side', isAvailable: true },
          { name: 'Onion Rings', description: 'Beer-battered onion rings', price: 5.99, category: 'side', isAvailable: true },
          { name: 'Chocolate Shake', description: 'Creamy chocolate milkshake', price: 6.99, category: 'beverage', isAvailable: true },
          { name: 'Cola', description: 'Ice cold cola', price: 2.99, category: 'beverage', isAvailable: true },
        ],
      },
      {
        name: 'Pizza Heaven',
        description: 'Authentic Italian pizzas baked in a wood-fired oven',
        cuisine: 'Italian',
        address: { street: '456 Oak Ave', city: 'New York', state: 'NY', zipCode: '10002' },
        phone: '555-0102',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
        isOpen: true,
        deliveryTime: '30-45 min',
        deliveryFee: 3.49,
        menu: [
          { name: 'Margherita Pizza', description: 'Fresh mozzarella, tomatoes, and basil', price: 12.99, category: 'main', isAvailable: true },
          { name: 'Pepperoni Pizza', description: 'Loaded with pepperoni and mozzarella', price: 14.99, category: 'main', isAvailable: true },
          { name: 'BBQ Chicken Pizza', description: 'Grilled chicken, BBQ sauce, red onion', price: 15.99, category: 'main', isAvailable: true },
          { name: 'Garlic Bread', description: 'Toasted bread with garlic butter and herbs', price: 5.99, category: 'appetizer', isAvailable: true },
          { name: 'Caesar Salad', description: 'Romaine lettuce, croutons, parmesan', price: 7.99, category: 'side', isAvailable: true },
          { name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert', price: 8.99, category: 'dessert', isAvailable: true },
        ],
      },
      {
        name: 'Sushi Master',
        description: 'Premium sushi and Japanese cuisine made with the freshest fish',
        cuisine: 'Japanese',
        address: { street: '789 Elm Blvd', city: 'New York', state: 'NY', zipCode: '10003' },
        phone: '555-0103',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500',
        isOpen: true,
        deliveryTime: '35-50 min',
        deliveryFee: 4.99,
        menu: [
          { name: 'California Roll', description: 'Crab, avocado, and cucumber', price: 10.99, category: 'main', isAvailable: true },
          { name: 'Salmon Nigiri (4pc)', description: 'Fresh salmon on seasoned rice', price: 12.99, category: 'main', isAvailable: true },
          { name: 'Dragon Roll', description: 'Eel, cucumber, avocado topping', price: 16.99, category: 'main', isAvailable: true },
          { name: 'Miso Soup', description: 'Traditional Japanese miso soup', price: 3.99, category: 'appetizer', isAvailable: true },
          { name: 'Edamame', description: 'Steamed soybeans with sea salt', price: 4.99, category: 'appetizer', isAvailable: true },
          { name: 'Green Tea Ice Cream', description: 'Matcha flavored ice cream', price: 5.99, category: 'dessert', isAvailable: true },
        ],
      },
      {
        name: 'Taco Fiesta',
        description: 'Authentic Mexican street tacos and burritos',
        cuisine: 'Mexican',
        address: { street: '321 Pine Rd', city: 'New York', state: 'NY', zipCode: '10004' },
        phone: '555-0104',
        rating: 4.3,
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500',
        isOpen: true,
        deliveryTime: '20-30 min',
        deliveryFee: 1.99,
        menu: [
          { name: 'Street Tacos (3pc)', description: 'Corn tortillas with seasoned meat, onion, cilantro', price: 8.99, category: 'main', isAvailable: true },
          { name: 'Burrito Bowl', description: 'Rice, beans, meat, salsa, guac, sour cream', price: 11.99, category: 'main', isAvailable: true },
          { name: 'Quesadilla', description: 'Flour tortilla with cheese and grilled chicken', price: 9.99, category: 'main', isAvailable: true },
          { name: 'Guacamole & Chips', description: 'Fresh guacamole with tortilla chips', price: 6.99, category: 'appetizer', isAvailable: true },
          { name: 'Churros', description: 'Cinnamon sugar churros with chocolate dip', price: 5.99, category: 'dessert', isAvailable: true },
          { name: 'Horchata', description: 'Traditional rice milk drink', price: 3.99, category: 'beverage', isAvailable: true },
        ],
      },
      {
        name: 'Wok & Roll',
        description: 'Fresh Chinese cuisine with bold flavors and fast delivery',
        cuisine: 'Chinese',
        address: { street: '567 Cedar Ln', city: 'New York', state: 'NY', zipCode: '10005' },
        phone: '555-0105',
        rating: 4.2,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500',
        isOpen: true,
        deliveryTime: '25-40 min',
        deliveryFee: 2.49,
        menu: [
          { name: 'Kung Pao Chicken', description: 'Spicy stir-fried chicken with peanuts', price: 13.99, category: 'main', isAvailable: true },
          { name: 'Beef Lo Mein', description: 'Soft noodles with beef and vegetables', price: 12.99, category: 'main', isAvailable: true },
          { name: 'General Tso Chicken', description: 'Crispy chicken in sweet-spicy sauce', price: 13.99, category: 'main', isAvailable: true },
          { name: 'Spring Rolls (4pc)', description: 'Crispy vegetable spring rolls', price: 5.99, category: 'appetizer', isAvailable: true },
          { name: 'Fried Rice', description: 'Wok-fried rice with eggs and vegetables', price: 8.99, category: 'side', isAvailable: true },
          { name: 'Mango Pudding', description: 'Smooth mango flavored pudding', price: 4.99, category: 'dessert', isAvailable: true },
        ],
      },
      {
        name: 'Curry House',
        description: 'Rich and aromatic Indian curries made with traditional spices',
        cuisine: 'Indian',
        address: { street: '890 Maple Dr', city: 'New York', state: 'NY', zipCode: '10006' },
        phone: '555-0106',
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500',
        isOpen: true,
        deliveryTime: '30-45 min',
        deliveryFee: 2.99,
        menu: [
          { name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', price: 14.99, category: 'main', isAvailable: true },
          { name: 'Paneer Tikka Masala', description: 'Cottage cheese in spiced tomato gravy', price: 13.99, category: 'main', isAvailable: true },
          { name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 15.99, category: 'main', isAvailable: true },
          { name: 'Samosa (2pc)', description: 'Crispy pastry with spiced potato filling', price: 4.99, category: 'appetizer', isAvailable: true },
          { name: 'Naan Bread', description: 'Freshly baked garlic naan', price: 2.99, category: 'side', isAvailable: true },
          { name: 'Mango Lassi', description: 'Sweet mango yogurt drink', price: 4.99, category: 'beverage', isAvailable: true },
          { name: 'Gulab Jamun', description: 'Deep-fried milk dumplings in syrup', price: 5.99, category: 'dessert', isAvailable: true },
        ],
      },
    ];

    await Restaurant.deleteMany({});
    await Restaurant.insertMany(sampleRestaurants);

    res.status(200).json({
      success: true,
      message: `Seeded ${sampleRestaurants.length} restaurants with menu items`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to seed data',
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🍔 Restaurant Service running on port ${PORT}`);
});
