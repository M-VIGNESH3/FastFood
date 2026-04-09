import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight } from 'react-icons/fi';
import { MdDeliveryDining } from 'react-icons/md';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
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
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      const res = await registerUser(submitData);
      const { token, ...userData } = res.data.data;
      login(userData, token);
      toast.success('Account created successfully! 🎉');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
          <p className="auth-tagline">Join thousands of food lovers and start ordering today</p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="feature-emoji">🎁</span>
              <span>Free First Delivery</span>
            </div>
            <div className="auth-feature">
              <span className="feature-emoji">⭐</span>
              <span>Exclusive Deals</span>
            </div>
            <div className="auth-feature">
              <span className="feature-emoji">🔒</span>
              <span>Secure Payments</span>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Start your food journey</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <div className="input-icon-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    id="register-name"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-icon-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    id="register-email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-icon-wrapper">
                  <FiPhone className="input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    id="register-phone"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="input-icon-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type="password"
                      name="password"
                      id="register-password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-icon-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type="password"
                      name="confirmPassword"
                      id="register-confirm-password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary btn-full" disabled={loading} id="register-submit">
                {loading ? (
                  <span className="btn-loader"></span>
                ) : (
                  <>
                    Create Account <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
