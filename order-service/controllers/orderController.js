const axios = require('axios');
const Order = require('../models/Order');

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5002';

// @desc    Place a new order
// @route   POST /api/orders
exports.placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod } = req.body;

    // Fetch restaurant details from restaurant service
    let restaurant;
    try {
      const response = await axios.get(`${RESTAURANT_SERVICE_URL}/api/restaurants/${restaurantId}`);
      restaurant = response.data.data;
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const menuItem = restaurant.menu.find((m) => m._id === item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found`);
      }
      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;
      return {
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      };
    });

    // Create the order
    const order = await Order.create({
      userId: req.userId,
      userName: req.userName || '',
      restaurantId,
      restaurantName: restaurant.name,
      items: orderItems,
      totalAmount,
      deliveryFee: restaurant.deliveryFee || 2.99,
      deliveryAddress,
      paymentMethod: paymentMethod || 'cash',
      estimatedDelivery: restaurant.deliveryTime || '30-45 min',
      status: 'placed',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: error.message,
    });
  }
};

// @desc    Get all orders for a user
// @route   GET /api/orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.status}`,
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message,
    });
  }
};
