# 🍔 VISYA FOOD HUB – Full Stack Restaurant Management System

A full-stack restaurant management web application built using HTML, CSS, JavaScript, Node.js, Express.js, and MySQL.

This project demonstrates real-world full-stack development including admin management, API integration, database operations, authentication, and responsive UI design.

---

## 📌 Problem Statement

Small restaurants often manage orders, bookings, and menu updates manually.  
This project provides a simple digital solution that allows:

- Customers to browse menu and book tables
- Admin to manage orders, bookings, and menu dynamically
- Live dashboard insights for business tracking

---

## 🚀 Features

### 👤 Customer Side
- View dynamic menu (from database)
- Filter by category
- Add to cart
- Place orders
- Book tables
- Responsive design

### 🔐 Admin Panel
- Secure login (session-based)
- Dashboard statistics
- View and update orders
- Manage bookings
- Add / Edit / Delete menu items
- Toggle item availability
- Live data updates

---

## 🛠️ Tech Stack

| Frontend | Backend | Database |
|----------|----------|----------|
| HTML5 | Node.js | MySQL |
| CSS3 | Express.js | Relational DB |
| Bootstrap | REST API | |
| JavaScript | dotenv | |

---

## 📊 Admin Dashboard Metrics

- Total Orders
- Total Revenue
- Pending Orders
- Total Bookings
- Total Menu Items
- Order Status Summary

---

## 🗂️ Project Structure


```text
Visya-food-hub/
│
├── backend-visya/
│   ├── routes/
│   ├── connection.js
│   ├── server.js
│   └── .env
│
├── docs/              # Frontend files (used for GitHub Pages deployment)
│   ├── admin/
│   ├── img/
│   ├── css/
│   ├── js/
│   └── index.html
│
├── screenshots/
│
└── README.md
```

---

## ⚙️ How To Run Locally

### Backend Setup

```bash
cd backend-visya
npm install
node server.js
```

Make sure:

- MySQL server is running
- Database is created
- `.env` file is configured

---

### Frontend Setup

The frontend is located in the `docs` folder (used for GitHub Pages deployment).

Open the `docs` folder in VS Code and run:

index.html

You can use **Live Server extension** to preview the website locally.
---

## 🌐 API Endpoints

### Orders
- GET `/api/orders`
- PUT `/api/orders/:id/status`

### Menu
- GET `/api/menu/admin`
- POST `/api/menu`
- PUT `/api/menu/:id`
- DELETE `/api/menu/:id`

### Booking
- GET `/api/booking`
- DELETE `/api/booking/:id`

---

## 🎨 UI & Branding

- Olive + Orange theme
- Custom food branding
- Responsive admin dashboard
- Mobile-friendly layout

---


## 📸 Screenshots

### 🖥 Home Page (Desktop)
![Home Desktop](screenshots/home-desktop.png.jpeg)

### 📱 Home Page (Mobile)
![Home Mobile](screenshots/home-mobile.png.jpeg)

### 🖥 Admin Dashboard (Desktop)
![Admin Dashboard](screenshots/admin-dashboard-desktop.png.jpeg)

### 📱 Admin Dashboard (Mobile)
![Admin Dashboard Mobile](screenshots/admin-dashboard-mobile.png.jpeg)

### 🖥 Admin Orders Page
![Admin Orders](screenshots/admin-orders-desktop.png.jpeg)

### 🖥 Admin Menu Management
![Admin Menu](screenshots/admin-menu-management-desktop.png.jpeg)

---

## 🌐 Live Demo

Frontend hosted using GitHub Pages:

https://nithyashreej0104.github.io/Visya-food-hub/

This demo showcases the frontend UI and application flow of the system.

Note:  
The frontend UI is deployed using GitHub Pages. Some dynamic features such as menu loading, order management, bookings, and admin dashboard statistics require the Node.js backend and MySQL database.

The backend APIs are included in this repository but are not deployed in the live demo.

---

## 📈 Future Enhancements

- JWT Authentication
- Payment Gateway Integration
- Role-based Access Control
- Order Tracking System
- Cloud Deployment (Render / Vercel)

---

## 👩‍💻 Developed By

**Nithya Shree**  
Aspiring Full Stack Developer  

This project was built as a portfolio demonstration of full-stack development skills.


## 📄 License

This project is developed for educational and portfolio purposes.
