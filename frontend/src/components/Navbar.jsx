import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { MdDeliveryDining } from 'react-icons/md';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <MdDeliveryDining className="brand-icon" />
          <span className="brand-text">Fast<span className="brand-accent">Bite</span></span>
        </Link>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`navbar-links ${mobileOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMobileOpen(false)}>
            Restaurants
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/orders" className="nav-link" onClick={() => setMobileOpen(false)}>
                My Orders
              </Link>
              <Link to="/cart" className="nav-link cart-link" onClick={() => setMobileOpen(false)}>
                <FiShoppingCart />
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </Link>
              <div className="nav-user">
                <FiUser className="user-icon" />
                <span className="user-name">{user?.name}</span>
              </div>
              <button className="nav-logout" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="nav-btn-signup" onClick={() => setMobileOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
