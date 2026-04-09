const Restaurant = require('../models/Restaurant');

// @desc    Create a new restaurant
// @route   POST /api/restaurants
exports.createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create restaurant',
      error: error.message,
    });
  }
};

// @desc    Get all restaurants
// @route   GET /api/restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const { cuisine, search, isOpen } = req.query;
    const filter = {};

    if (cuisine) filter.cuisine = new RegExp(cuisine, 'i');
    if (search) filter.name = new RegExp(search, 'i');
    if (isOpen !== undefined) filter.isOpen = isOpen === 'true';

    const restaurants = await Restaurant.find(filter).select('-menu').sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurants',
      error: error.message,
    });
  }
};

// @desc    Get single restaurant with menu
// @route   GET /api/restaurants/:id
exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurant',
      error: error.message,
    });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update restaurant',
      error: error.message,
    });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete restaurant',
      error: error.message,
    });
  }
};

// @desc    Add menu item to restaurant
// @route   POST /api/restaurants/:id/menu
exports.addMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    restaurant.menu.push(req.body);
    await restaurant.save();

    res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      data: restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add menu item',
      error: error.message,
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/restaurants/:id/menu/:itemId
exports.updateMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    const menuItem = restaurant.menu.id(req.params.itemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    Object.assign(menuItem, req.body);
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update menu item',
      error: error.message,
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/restaurants/:id/menu/:itemId
exports.deleteMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    const menuItem = restaurant.menu.id(req.params.itemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    menuItem.deleteOne();
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
      data: restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete menu item',
      error: error.message,
    });
  }
};
