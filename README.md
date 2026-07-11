# Go-Analytics E-Store 🚀

A high-performance, futuristic E-commerce platform built with a **Go (Golang) & Gin** backend, **MongoDB** database, and a **React & Tailwind CSS** frontend. It features a complete real-time user activity metrics tracker and a visually stunning Admin Analytics dashboard.

---

## 🌟 Key Features

### 🛍️ Customer Storefront
* **Product Catalog:** Filter products by category, search by keywords, and sort by price.
* **Interactive Shopping Cart:** Real-time quantity adjustments, free shipping thresholds, and coupon code integrations.
* **Wishlist System:** Add or remove favorite products dynamically.
* **Product Reviews:** Read reviews and ratings (1-5 stars) left by other customers or post your own.
* **Stripe Sandbox Checkout:** Interactive sandbox payment modal accepting credit card details.
* **Printable Invoice Generation:** Instantly generates a clean, formal billing invoice receipt after checkout with dedicated print-friendly styling (`@media print`).

### 📊 Admin Analytics Engine
* **Dashboard Overview:** Displays KPIs for Total Revenue, Conversion Rate, Page Views, and Interaction Clicks.
* **Daily Revenue Trend:** Dynamic Area Chart visualizing daily earnings using Recharts.
* **Top Selling Products:** Bar Chart representation of top-performing items.
* **Customer Activity Heatmap:** A 7x24 grid mapping hourly user activity to identify shopping spikes.
* **Product Catalog Manager:** Complete CRUD operations (Add, Edit, Delete) for store inventory.
* **Cloudinary Image Upload:** Auto-handles product photo uploads directly to Cloudinary storage.
* **Inventory Stock Manager:** Keeps track of stock levels with visual alert badges ("Good", "Low Stock", "Out of Stock").
* **Payments & Order Logs:** Monitor transactions and adjust delivery status (Processing ➔ Shipped ➔ Delivered).

---

## 🛠️ Tech Stack

* **Backend:** Go (Golang), Gin Gonic, MongoDB Go Driver, JWT Authentication, godotenv.
* **Frontend:** React (Vite), Tailwind CSS, Recharts (Charts), Framer Motion (Animations).
* **Media Storage:** Cloudinary SDK.
* **Deployment:** Vercel (Serverless Go & Vite React).

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
* Go 1.20+ installed
* Node.js & npm installed
* MongoDB connection string (Atlas or Local)

### 1. Setup Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a `.env` file and add your credentials:
   ```env
   PORT=8080
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_token_secret_key
   DB_NAME=analytics-db
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
3. Run the Go backend server:
   ```bash
   go run cmd/api/main.go
   ```

### 2. Setup Frontend
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the React Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Vercel Deployment Guide

This project is pre-configured to deploy the frontend and backend separately on Vercel.

### 1. Deploy Go Backend
1. Import your repository into **Vercel**.
2. Select **Root Directory** as `backend`.
3. Add the following **Environment Variables** (from your backend `.env`):
   * `MONGODB_URI`, `JWT_SECRET`, `DB_NAME`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
4. Click **Deploy**. Vercel will automatically build the serverless Go function using `vercel.json` and `api/entrypoint.go`.
5. Copy your deployed Backend URL (e.g., `https://your-backend.vercel.app`).

### 2. Deploy React Frontend
1. Import the same repository into **Vercel**.
2. Select **Root Directory** as `frontend`.
3. Add the following **Environment Variable**:
   * Key: `VITE_API_BASE_URL`
   * Value: `https://your-backend.vercel.app` (your Vercel backend URL).
4. Click **Deploy**.

---

## 📄 License
This project is open-source and available under the MIT License.
