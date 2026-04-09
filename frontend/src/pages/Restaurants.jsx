import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRestaurants, seedRestaurants } from '../services/api';
import toast from 'react-hot-toast';
import { FiSearch, FiStar, FiClock, FiMapPin } from 'react-icons/fi';
import { MdDeliveryDining } from 'react-icons/md';

const cuisineFilters = ['All', 'American', 'Italian', 'Japanese', 'Mexican', 'Chinese', 'Indian'];

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCuisine, setActiveCuisine] = useState('All');

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (activeCuisine !== 'All') params.cuisine = activeCuisine;

      const res = await getRestaurants(params);
      setRestaurants(res.data.data);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [activeCuisine]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  const handleSeed = async () => {
    try {
      await seedRestaurants();
      toast.success('Sample restaurants loaded! 🍕');
      fetchRestaurants();
    } catch (error) {
      toast.error('Failed to seed data');
    }
  };

  return (
    <div className="restaurants-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <MdDeliveryDining /> Free delivery on first order
          </div>
          <h1 className="hero-title">
            Discover the best <span className="gradient-text">food & drinks</span> near you
          </h1>
          <p className="hero-subtitle">
            Order from top restaurants and get your food delivered fast
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              id="restaurant-search"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" id="search-submit">Search</button>
          </form>
        </div>
      </section>

      {/* Cuisine Filters */}
      <section className="cuisine-filters">
        <div className="container">
          <div className="filter-chips">
            {cuisineFilters.map((cuisine) => (
              <button
                key={cuisine}
                className={`chip ${activeCuisine === cuisine ? 'active' : ''}`}
                onClick={() => setActiveCuisine(cuisine)}
                id={`filter-${cuisine.toLowerCase()}`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurant List */}
      <section className="restaurant-list">
        <div className="container">
          <div className="section-header">
            <h2>Popular Restaurants</h2>
            <span className="restaurant-count">{restaurants.length} places</span>
          </div>

          {loading ? (
            <div className="grid-loader">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line wide"></div>
                    <div className="skeleton-line medium"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <h3>No restaurants found</h3>
              <p>Try a different search or load sample data</p>
              <button className="btn-primary" onClick={handleSeed} id="seed-data-btn">
                Load Sample Restaurants
              </button>
            </div>
          ) : (
            <div className="restaurant-grid">
              {restaurants.map((restaurant) => (
                <Link
                  to={`/restaurant/${restaurant._id}`}
                  key={restaurant._id}
                  className="restaurant-card"
                  id={`restaurant-${restaurant._id}`}
                >
                  <div className="card-image-wrapper">
                    <img
                      src={restaurant.image || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500`}
                      alt={restaurant.name}
                      className="card-image"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500';
                      }}
                    />
                    <div className="card-overlay">
                      <span className={`status-badge ${restaurant.isOpen ? 'open' : 'closed'}`}>
                        {restaurant.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="card-header-row">
                      <h3 className="card-title">{restaurant.name}</h3>
                      <div className="card-rating">
                        <FiStar className="star-icon" />
                        <span>{restaurant.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="card-cuisine">{restaurant.cuisine}</p>
                    <p className="card-description">{restaurant.description}</p>
                    <div className="card-footer">
                      <div className="card-meta">
                        <FiClock />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <div className="card-meta">
                        <FiMapPin />
                        <span>{restaurant.address?.city || 'NYC'}</span>
                      </div>
                      <div className="card-delivery-fee">
                        ${restaurant.deliveryFee?.toFixed(2)} delivery
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Restaurants;
