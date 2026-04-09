import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/api';
import { FiPackage, FiClock, FiChevronRight } from 'react-icons/fi';

const statusColors = {
  placed: '#f59e0b',
  confirmed: '#3b82f6',
  preparing: '#8b5cf6',
  out_for_delivery: '#06b6d4',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const statusLabels = {
  placed: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getOrders();
        setOrders(res.data.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <h1 className="page-title"><FiPackage /> My Orders</h1>
          <div className="orders-skeleton">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-content">
                  <div className="skeleton-line wide"></div>
                  <div className="skeleton-line medium"></div>
                  <div className="skeleton-line short"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="page-title"><FiPackage /> My Orders</h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Your order history will appear here</p>
            <Link to="/" className="btn-primary" id="start-ordering-btn">Start Ordering</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <Link
                to={`/orders/${order._id}`}
                key={order._id}
                className="order-card"
                id={`order-${order._id}`}
              >
                <div className="order-card-header">
                  <div className="order-restaurant">
                    <h3>{order.restaurantName}</h3>
                    <span
                      className="order-status-badge"
                      style={{ backgroundColor: statusColors[order.status] + '20', color: statusColors[order.status] }}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <FiChevronRight className="order-arrow" />
                </div>

                <div className="order-card-body">
                  <div className="order-items-preview">
                    {order.items.slice(0, 3).map((item, i) => (
                      <span key={i} className="order-item-tag">
                        {item.quantity}x {item.name}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="order-item-tag more">+{order.items.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="order-card-footer">
                  <div className="order-date">
                    <FiClock />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="order-total">
                    ${(order.totalAmount + order.deliveryFee).toFixed(2)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
