const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
    },
    userName: {
      type: String,
      default: '',
    },
    restaurantId: {
      type: String,
      required: [true, 'Restaurant ID is required'],
    },
    restaurantName: {
      type: String,
      default: '',
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order must have at least one item'],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
    },
    deliveryFee: {
      type: Number,
      default: 2.99,
    },
    deliveryAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi'],
      default: 'cash',
    },
    estimatedDelivery: {
      type: String,
      default: '30-45 min',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
