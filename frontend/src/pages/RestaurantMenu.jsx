import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurant } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiStar, FiClock, FiMapPin, FiPhone, FiPlus, FiMinus, FiShoppingCart, FiArrowLeft } from 'react-icons/fi';

const categoryLabels = {
  appetizer: '🥗 Appetizers',
  main: '🍽️ Main Course',
  dessert: '🍰 Desserts',
  beverage: '🥤 Beverages',
  side: '🍟 Sides',
};

const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const { addToCart, removeFromCart, getItemQuantity, totalItems, totalAmount, restaurantId } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await getRestaurant(id);
        setRestaurant(res.data.data);
      } catch (error) {
        toast.error('Failed to load restaurant');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  if (loading) {
    return (
      <div className="menu-page">
        <div className="container">
          <div className="menu-skeleton">
            <div className="skeleton-banner"></div>
            <div className="skeleton-items">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-menu-item">
                  <div className="skeleton-line wide"></div>
                  <div className="skeleton-line medium"></div>
                  <div className="skeleton-line short"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  // Group menu items by category
  const categories = {};
  restaurant.menu.forEach((item) => {
    const cat = item.category || 'main';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  const availableCategories = Object.keys(categories);

  const filteredMenu =
    activeCategory === 'all'
      ? restaurant.menu
      : restaurant.menu.filter((item) => item.category === activeCategory);

  const handleAddToCart = (item) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    if (restaurantId && restaurantId !== id) {
      toast('Cart cleared — switching restaurant', { icon: '🔄' });
    }
    addToCart(item, id, restaurant.name);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="menu-page">
      {/* Restaurant Banner */}
      <div className="menu-banner">
        <img
          src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
          alt={restaurant.name}
          className="banner-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200';
          }}
        />
        <div className="banner-overlay">
          <button className="back-btn" onClick={() => navigate('/')}>
            <FiArrowLeft /> Back
          </button>
          <div className="banner-info">
            <h1>{restaurant.name}</h1>
            <p className="banner-cuisine">{restaurant.cuisine} Cuisine</p>
            <div className="banner-meta">
              <span className="meta-item">
                <FiStar className="star-filled" /> {restaurant.rating.toFixed(1)}
              </span>
              <span className="meta-item">
                <FiClock /> {restaurant.deliveryTime}
              </span>
              <span className="meta-item">
                <FiMapPin /> {restaurant.address?.city || 'NYC'}
              </span>
              {restaurant.phone && (
                <span className="meta-item">
                  <FiPhone /> {restaurant.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="menu-layout">
          {/* Menu Content */}
          <div className="menu-content">
            {/* Category Tabs */}
            <div className="category-tabs">
              <button
                className={`tab ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                🍴 All Items
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  className={`tab ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {categoryLabels[cat] || cat}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="menu-items">
              {filteredMenu.map((item) => {
                const qty = getItemQuantity(item._id);
                return (
                  <div
                    key={item._id}
                    className={`menu-item ${!item.isAvailable ? 'unavailable' : ''}`}
                    id={`menu-item-${item._id}`}
                  >
                    <div className="item-info">
                      <div className="item-header">
                        <h3 className="item-name">{item.name}</h3>
                        <span className="item-price">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="item-description">{item.description}</p>
                      <span className="item-category-badge">
                        {categoryLabels[item.category]?.split(' ')[0] || '🍽️'} {item.category}
                      </span>
                    </div>
                    <div className="item-actions">
                      {!item.isAvailable ? (
                        <span className="unavailable-badge">Unavailable</span>
                      ) : qty > 0 ? (
                        <div className="quantity-controls">
                          <button className="qty-btn minus" onClick={() => removeFromCart(item._id)}>
                            <FiMinus />
                          </button>
                          <span className="qty-value">{qty}</span>
                          <button className="qty-btn plus" onClick={() => handleAddToCart(item)}>
                            <FiPlus />
                          </button>
                        </div>
                      ) : (
                        <button className="add-btn" onClick={() => handleAddToCart(item)}>
                          <FiPlus /> Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Cart Summary */}
          {totalItems > 0 && (
            <div className="cart-summary-sticky">
              <div className="cart-summary-content">
                <div className="cart-summary-info">
                  <FiShoppingCart />
                  <span>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
                  <span className="cart-summary-total">${totalAmount.toFixed(2)}</span>
                </div>
                <button className="btn-primary" onClick={() => navigate('/cart')} id="view-cart-btn">
                  View Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenu;
