const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5003';

// Auth middleware for protected routes
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// Gateway health check
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'api-gateway',
    status: 'running',
    timestamp: new Date(),
    services: {
      user: USER_SERVICE_URL,
      restaurant: RESTAURANT_SERVICE_URL,
      order: ORDER_SERVICE_URL,
    },
  });
});

// ========== USER SERVICE PROXY ==========
app.use(
  '/api/users',
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/users': '/api/users' },
    on: {
      proxyReq: (proxyReq, req) => {
        // Forward the body for POST/PUT requests
        if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      error: (err, req, res) => {
        console.error('User Service Proxy Error:', err.message);
        res.status(502).json({
          success: false,
          message: 'User service is unavailable',
        });
      },
    },
  })
);

// ========== RESTAURANT SERVICE PROXY ==========
app.use(
  '/api/restaurants',
  createProxyMiddleware({
    target: RESTAURANT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/restaurants': '/api/restaurants' },
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      error: (err, req, res) => {
        console.error('Restaurant Service Proxy Error:', err.message);
        res.status(502).json({
          success: false,
          message: 'Restaurant service is unavailable',
        });
      },
    },
  })
);

// ========== SEED ROUTE PROXY ==========
app.use(
  '/api/seed',
  createProxyMiddleware({
    target: RESTAURANT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/seed': '/api/seed' },
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      error: (err, req, res) => {
        console.error('Seed Proxy Error:', err.message);
        res.status(502).json({
          success: false,
          message: 'Restaurant service (seed) is unavailable',
        });
      },
    },
  })
);

// ========== ORDER SERVICE PROXY ==========
app.use(
  '/api/orders',
  authMiddleware,
  createProxyMiddleware({
    target: ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/api/orders': '/api/orders' },
    on: {
      proxyReq: (proxyReq, req) => {
        // Forward auth headers
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
        if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      error: (err, req, res) => {
        console.error('Order Service Proxy Error:', err.message);
        res.status(502).json({
          success: false,
          message: 'Order service is unavailable',
        });
      },
    },
  })
);

// Serve static assets from frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Serve index.html for all other routes to support React SPA routing
app.get('*', (req, res, next) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  } else {
    next();
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'API Gateway error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`   → User Service:       ${USER_SERVICE_URL}`);
  console.log(`   → Restaurant Service:  ${RESTAURANT_SERVICE_URL}`);
  console.log(`   → Order Service:       ${ORDER_SERVICE_URL}`);
});
