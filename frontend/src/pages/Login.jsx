import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { MdDeliveryDining } from 'react-icons/md';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(formData);
      const { token, ...userData } = res.data.data;
      login(userData, token);
      toast.success('Welcome back! 🎉');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <MdDeliveryDining className="auth-brand-icon" />
            <h1>Fast<span className="brand-accent">Bite</span></h1>
          </div>
          <p className="auth-tagline">Delicious food delivered to your doorstep in minutes</p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="feature-emoji">🍕</span>
              <span>1000+ Restaurants</span>
            </div>
            <div className="auth-feature">
              <span className="feature-emoji">⚡</span>
              <span>Fast Delivery</span>
            </div>
            <div className="auth-feature">
              <span className="feature-emoji">💰</span>
              <span>Best Prices</span>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <div className="input-icon-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    id="login-email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-icon-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    id="login-password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary btn-full" disabled={loading} id="login-submit">
                {loading ? (
                  <span className="btn-loader"></span>
                ) : (
                  <>
                    Sign In <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
