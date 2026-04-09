const express = require('express');
const router = express.Router();
const {
  createRestaurant,
  getAllRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/restaurantController');

// Restaurant CRUD
router.post('/', createRestaurant);
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurant);
router.put('/:id', updateRestaurant);
router.delete('/:id', deleteRestaurant);

// Menu management
router.post('/:id/menu', addMenuItem);
router.put('/:id/menu/:itemId', updateMenuItem);
router.delete('/:id/menu/:itemId', deleteMenuItem);

module.exports = router;
