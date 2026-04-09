# 🍔 Fast Food Delivery Platform

A complete microservices-based food delivery application built with Node.js, Express, MongoDB, and React.

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────────┐
│   React      │────▶│   API Gateway    │
│   Frontend   │     │   (Port 5000)    │
│  (Port 3000) │     └───────┬──────────┘
└─────────────┘             │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
        ┌──────────┐ ┌────────────┐ ┌──────────┐
        │  User    │ │ Restaurant │ │  Order   │
        │ Service  │ │  Service   │ │ Service  │
        │ (5001)   │ │  (5002)    │ │ (5003)   │
        └──────────┘ └────────────┘ └──────────┘
              │           │              │
              ▼           ▼              ▼
          MongoDB     MongoDB        MongoDB
```

## 📁 Project Structure

```
root/
├── frontend/                 # React.js Frontend (Vite)
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React Context (Auth, Cart)
│   │   ├── services/         # API service layer
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── api-gateway/              # API Gateway (Express)
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── user-service/             # User Microservice
│   ├── config/db.js
│   ├── models/User.js
│   ├── controllers/userController.js
│   ├── routes/userRoutes.js
│   ├── middleware/auth.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── restaurant-service/       # Restaurant Microservice
│   ├── config/db.js
│   ├── models/Restaurant.js
│   ├── controllers/restaurantController.js
│   ├── routes/restaurantRoutes.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── order-service/            # Order Microservice
│   ├── config/db.js
│   ├── models/Order.js
│   ├── controllers/orderController.js
│   ├── routes/orderRoutes.js
│   ├── middleware/auth.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **MongoDB** (running locally on `mongodb://localhost:27017`)

### Installation & Running

Open **5 separate terminals** and run:

**Terminal 1 — User Service:**
```bash
cd user-service
npm install
npm start
```

**Terminal 2 — Restaurant Service:**
```bash
cd restaurant-service
npm install
npm start
```

**Terminal 3 — Order Service:**
```bash
cd order-service
npm install
npm start
```

**Terminal 4 — API Gateway:**
```bash
cd api-gateway
npm install
npm start
```

**Terminal 5 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Access the Application

| Service             | URL                        |
|---------------------|----------------------------|
| Frontend            | http://localhost:3000       |
| API Gateway         | http://localhost:5000       |
| User Service        | http://localhost:5001       |
| Restaurant Service  | http://localhost:5002       |
| Order Service       | http://localhost:5003       |

## 📋 Seed Sample Data

After starting all services, click the **"Load Sample Restaurants"** button on the Restaurants page, or make a POST request:

```bash
curl -X POST http://localhost:5000/api/seed
```

This loads 6 restaurants with full menus (Burger Palace, Pizza Heaven, Sushi Master, Taco Fiesta, Wok & Roll, Curry House).

## 🔗 API Endpoints

### User Service (`/api/users`)
| Method | Endpoint   | Description       | Auth |
|--------|-----------|-------------------|------|
| POST   | /register | Register user     | No   |
| POST   | /login    | Login user        | No   |
| GET    | /profile  | Get profile       | Yes  |
| PUT    | /profile  | Update profile    | Yes  |

### Restaurant Service (`/api/restaurants`)
| Method | Endpoint           | Description          | Auth |
|--------|--------------------|----------------------|------|
| GET    | /                  | List all restaurants | No   |
| GET    | /:id               | Get restaurant+menu  | No   |
| POST   | /                  | Create restaurant    | No   |
| PUT    | /:id               | Update restaurant    | No   |
| DELETE | /:id               | Delete restaurant    | No   |
| POST   | /:id/menu          | Add menu item        | No   |
| PUT    | /:id/menu/:itemId  | Update menu item     | No   |
| DELETE | /:id/menu/:itemId  | Delete menu item     | No   |

### Order Service (`/api/orders`)
| Method | Endpoint      | Description         | Auth |
|--------|--------------|---------------------|------|
| POST   | /            | Place order         | Yes  |
| GET    | /            | Get user's orders   | Yes  |
| GET    | /:id         | Get single order    | Yes  |
| PUT    | /:id/status  | Update order status | Yes  |
| PUT    | /:id/cancel  | Cancel order        | Yes  |

## 🔄 Order Flow

1. User registers/logs in → receives JWT token
2. Browse restaurants and menus
3. Add items to cart (client-side)
4. Checkout with delivery address and payment method
5. Order Service validates items against Restaurant Service (REST call)
6. Order is created with `placed` status
7. Track order through status progression:
   `placed → confirmed → preparing → out_for_delivery → delivered`

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router, Axios, react-hot-toast, react-icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Auth:** JWT (jsonwebtoken, bcryptjs)
- **Gateway:** http-proxy-middleware
- **Communication:** REST APIs

## ⚙️ Environment Variables

Each service has its own `.env` file. Key variables:

| Variable               | Service           | Default Value                              |
|------------------------|-------------------|--------------------------------------------|
| PORT                   | All               | 5000/5001/5002/5003                        |
| MONGO_URI              | Backend services  | mongodb://localhost:27017/food_delivery_*   |
| JWT_SECRET             | All backend       | fast_food_delivery_jwt_secret_key_2024     |
| USER_SERVICE_URL       | Gateway, Order    | http://localhost:5001                      |
| RESTAURANT_SERVICE_URL | Gateway, Order    | http://localhost:5002                      |
| ORDER_SERVICE_URL      | Gateway           | http://localhost:5003                      |
