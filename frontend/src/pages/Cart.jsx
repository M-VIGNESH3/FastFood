import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowLeft, FiCreditCard } from 'react-icons/fi';
import { MdPayment } from 'react-icons/md';

const Cart = () => {
  const {
    cartItems,
    restaurantName,
    restaurantId,
    addToCart,
    removeFromCart,
    deleteFromCart,
    clearCart,
    totalItems,
    totalAmount,
  } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const deliveryFee = 2.99;
  const tax = totalAmount * 0.08;
  const grandTotal = totalAmount + deliveryFee + tax;

  const handleAddressChange = (e) => {
    setDeliveryAddress({ ...deliveryAddress, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.street || !deliveryAddress.city) {
      toast.error('Please enter your delivery address');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        restaurantId,
        items: cartItems.map((item) => ({
          menuItemId: item._id,
          quantity: item.quantity,
        })),
        deliveryAddress,
        paymentMethod,
      };

      const res = await placeOrder(orderData);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${res.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (totalItems === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add items from a restaurant to get started</p>
            <button className="btn-primary" onClick={() => navigate('/')} id="browse-restaurants-btn">
              <FiArrowLeft /> Browse Restaurants
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <button className="back-link" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Continue Shopping
        </button>

        <h1 className="page-title">
          <FiShoppingBag /> Your Cart
        </h1>
        <p className="cart-restaurant">From <strong>{restaurantName}</strong></p>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items-section">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item" id={`cart-item-${item._id}`}>
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-price">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="quantity-controls">
                      <button className="qty-btn minus" onClick={() => removeFromCart(item._id)}>
                        <FiMinus />
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn plus" onClick={() => addToCart(item, restaurantId, restaurantName)}>
                        <FiPlus />
                      </button>
                    </div>
                    <span className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</span>
                    <button className="delete-btn" onClick={() => deleteFromCart(item._id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="clear-cart-btn" onClick={clearCart}>
              <FiTrash2 /> Clear Cart
            </button>
          </div>

          {/* Checkout Panel */}
          <div className="checkout-panel">
            <h2 className="checkout-title">Order Summary</h2>

            <div className="address-section">
              <h3>Delivery Address</h3>
              <div className="address-form">
                <input
                  type="text"
                  name="street"
                  id="address-street"
                  placeholder="Street address"
                  value={deliveryAddress.street}
                  onChange={handleAddressChange}
                  required
                />
                <div className="address-row">
                  <input
                    type="text"
                    name="city"
                    id="address-city"
                    placeholder="City"
                    value={deliveryAddress.city}
                    onChange={handleAddressChange}
                    required
                  />
                  <input
                    type="text"
                    name="state"
                    id="address-state"
                    placeholder="State"
                    value={deliveryAddress.state}
                    onChange={handleAddressChange}
                  />
                  <input
                    type="text"
                    name="zipCode"
                    id="address-zip"
                    placeholder="ZIP"
                    value={deliveryAddress.zipCode}
                    onChange={handleAddressChange}
                  />
                </div>
              </div>
            </div>

            <div className="payment-section">
              <h3>Payment Method</h3>
              <div className="payment-options">
                {[
                  { value: 'cash', label: 'Cash on Delivery', icon: '💵' },
                  { value: 'card', label: 'Credit Card', icon: '💳' },
                  { value: 'upi', label: 'UPI Payment', icon: '📱' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`payment-option ${paymentMethod === opt.value ? 'active' : ''}`}
                    id={`payment-${opt.value}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-icon">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="summary-breakdown">
              <div className="summary-row">
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn-primary btn-full place-order-btn"
              onClick={handlePlaceOrder}
              disabled={loading}
              id="place-order-btn"
            >
              {loading ? (
                <span className="btn-loader"></span>
              ) : (
                <>
                  <MdPayment /> Place Order — ${grandTotal.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
