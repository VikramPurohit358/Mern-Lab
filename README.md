# ShopKart — MERN E-Commerce Application

A full-stack e-commerce web application built with the **MERN stack** (MongoDB, Express, React, Node.js).

## Project Structure

```
MERN-1/
├── backend/          # Express.js REST API
│   ├── config/       # Third-party configs (Razorpay)
│   ├── controllers/  # Route handler logic
│   ├── middlewares/  # Auth middleware
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API route definitions
│   ├── utils/        # Utility functions
│   ├── .env.example  # Environment variable template
│   └── index.js      # Server entry point
│
├── frontend/
│   └── vite-project/ # React + Vite frontend
│       └── src/
│           ├── components/  # Reusable UI components
│           ├── context/     # React context (Cart, Wishlist)
│           ├── pages/       # Page-level components
│           ├── services/    # Axios API client
│           └── utils/       # Frontend utilities
│
└── notes/            # Course notes & class materials
```

## Features

### Authentication
- Customer registration with `fullName`, `email`, `password`, `phone`
- Secure login with JWT stored in HTTP-only cookies
- Protected routes via `isAuthenticated` middleware
- Logout with cookie clearing
- Change password

### Product Catalog
- Browse all products
- Search by name
- Filter by category
- Sort by price (ascending / descending)
- Product detail page

### Shopping Cart
- Add / remove products
- Update quantities
- Persisted per-user on the backend

### Wishlist
- Save products to wishlist
- Remove from wishlist

### Orders
- Checkout flow with address & payment method
- Razorpay payment gateway integration
- Order history
- Detailed order view

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 19, React Router v7, Tailwind CSS v4, Axios |
| Backend   | Node.js, Express 5, Mongoose 9      |
| Database  | MongoDB Atlas                       |
| Auth      | JWT (cookie-based), bcrypt          |
| Payments  | Razorpay                            |
| Bundler   | Vite 8                              |

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd MERN-1
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env   # Fill in your values
npm run dev
```

Backend runs on: `http://localhost:8082`

### 3. Setup Frontend

```bash
cd frontend/vite-project
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## API Endpoints

### Customers — `/customers`
| Method | Route                       | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| POST   | `/customers/register`       | ❌   | Register a new customer  |
| POST   | `/customers/login`          | ❌   | Login                    |
| GET    | `/customers/me`             | ✅   | Get current profile      |
| POST   | `/customers/logout`         | ✅   | Logout                   |
| PATCH  | `/customers/change-password`| ✅   | Change password          |

### Products — `/products`
| Method | Route             | Auth | Description              |
|--------|-------------------|------|--------------------------|
| GET    | `/products`       | ❌   | List / search products   |
| GET    | `/products/:id`   | ❌   | Get single product       |
| POST   | `/products`       | ❌   | Create product           |

### Cart — `/cart`
| Method | Route             | Auth | Description              |
|--------|-------------------|------|--------------------------|
| GET    | `/cart`           | ✅   | Get cart                 |
| POST   | `/cart/:productId`| ✅   | Add to cart              |
| PATCH  | `/cart/:productId`| ✅   | Update quantity          |
| DELETE | `/cart/:productId`| ✅   | Remove from cart         |

### Wishlist — `/wishlist`
| Method | Route                   | Auth | Description              |
|--------|-------------------------|------|--------------------------|
| GET    | `/wishlist`             | ✅   | Get wishlist             |
| POST   | `/wishlist/:productId`  | ✅   | Add to wishlist          |
| DELETE | `/wishlist/:productId`  | ✅   | Remove from wishlist     |

### Orders — `/orders`
| Method | Route             | Auth | Description              |
|--------|-------------------|------|--------------------------|
| POST   | `/orders`         | ✅   | Create order             |
| GET    | `/orders`         | ✅   | Get all orders           |
| GET    | `/orders/:id`     | ✅   | Get order by ID          |

## Environment Variables

See [`backend/.env.example`](backend/.env.example) for the full list of required variables.

## Labs Completed

| Lab | Title                                | Status |
|-----|--------------------------------------|--------|
| 01  | Backend — Customer Authentication    | ✅     |
| 02  | Frontend — Login → Home Flow         | ✅     |
| 03  | Frontend — Product Catalog & Discovery| ✅    |
