import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, cancelOrder } from '../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiMapPin, FiClock, FiPackage, FiCheckCircle, FiXCircle, FiTruck } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';

const statusSteps = [
  { key: 'placed', label: 'Order Placed', icon: <FiPackage />, description: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed', icon: <FiCheckCircle />, description: 'Restaurant confirmed your order' },
  { key: 'preparing', label: 'Preparing', icon: <MdRestaurant />, description: 'Chef is preparing your food' },
  { key: 'out_for_delivery', label: 'On the Way', icon: <FiTruck />, description: 'Driver is on the way' },
  { key: 'delivered', label: 'Delivered', icon: <FiCheckCircle />, description: 'Enjoy your meal!' },
];

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrder(id);
        setOrder(res.data.data);
      } catch (error) {
        toast.error('Failed to load order');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    // Poll for updates every 10 seconds
    const interval = setInterval(async () => {
      try {
        const res = await getOrder(id);
        setOrder(res.data.data);
      } catch (error) {
        // silently fail
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [id]);

  const handleCancel = async () => {
    try {
      await cancelOrder(id);
      const res = await getOrder(id);
      setOrder(res.data.data);
      toast.success('Order cancelled');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const idx = statusSteps.findIndex((s) => s.key === order.status);
    return idx >= 0 ? idx : 0;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="tracking-page">
        <div className="container">
          <div className="skeleton-content" style={{ padding: '2rem' }}>
            <div className="skeleton-line wide"></div>
            <div className="skeleton-line medium"></div>
            <div className="skeleton-line short"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStep = getCurrentStepIndex();
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  const canCancel = !isCancelled && !isDelivered;

  return (
    <div className="tracking-page">
      <div className="container">
        <button className="back-link" onClick={() => navigate('/orders')}>
          <FiArrowLeft /> Back to Orders
        </button>

        <div className="tracking-header">
          <div>
            <h1 className="page-title">Order Tracking</h1>
            <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
          </div>
          {canCancel && (
            <button className="btn-danger" onClick={handleCancel} id="cancel-order-btn">
              <FiXCircle /> Cancel Order
            </button>
          )}
        </div>

        <div className="tracking-layout">
          {/* Progress Tracker */}
          <div className="tracking-progress-section">
            {isCancelled ? (
              <div className="cancelled-banner">
                <FiXCircle className="cancelled-icon" />
                <h2>Order Cancelled</h2>
                <p>This order has been cancelled</p>
              </div>
            ) : (
              <div className="progress-tracker">
                <h2>Order Status</h2>
                <div className="progress-steps">
                  {statusSteps.map((step, index) => (
                    <div
                      key={step.key}
                      className={`progress-step ${
                        index <= currentStep ? 'completed' : ''
                      } ${index === currentStep ? 'current' : ''}`}
                    >
                      <div className="step-indicator">
                        <div className="step-circle">{step.icon}</div>
                        {index < statusSteps.length - 1 && <div className="step-line"></div>}
                      </div>
                      <div className="step-info">
                        <h4>{step.label}</h4>
                        <p>{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estimated Delivery */}
            {!isCancelled && !isDelivered && (
              <div className="eta-card">
                <FiClock className="eta-icon" />
                <div>
                  <h3>Estimated Delivery</h3>
                  <p className="eta-time">{order.estimatedDelivery}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="order-details-section">
            <div className="detail-card">
              <h3>Restaurant</h3>
              <p className="detail-value">{order.restaurantName}</p>
            </div>

            <div className="detail-card">
              <h3>Order Items</h3>
              <div className="order-items-list">
                {order.items.map((item, i) => (
                  <div key={i} className="order-detail-item">
                    <span className="item-qty">{item.quantity}x</span>
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-card">
              <h3>Payment Details</h3>
              <div className="payment-details">
                <div className="payment-row">
                  <span>Subtotal</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="payment-row">
                  <span>Delivery Fee</span>
                  <span>${order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="payment-row total">
                  <span>Total</span>
                  <span>${(order.totalAmount + order.deliveryFee).toFixed(2)}</span>
                </div>
                <div className="payment-method">
                  Payment: {order.paymentMethod === 'cash' ? '💵 Cash' : order.paymentMethod === 'card' ? '💳 Card' : '📱 UPI'}
                </div>
              </div>
            </div>

            {order.deliveryAddress?.street && (
              <div className="detail-card">
                <h3><FiMapPin /> Delivery Address</h3>
                <p className="detail-value">
                  {order.deliveryAddress.street}, {order.deliveryAddress.city}
                  {order.deliveryAddress.state && `, ${order.deliveryAddress.state}`}
                  {order.deliveryAddress.zipCode && ` ${order.deliveryAddress.zipCode}`}
                </p>
              </div>
            )}

            <div className="detail-card">
              <h3>Order Time</h3>
              <p className="detail-value">{formatDate(order.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
