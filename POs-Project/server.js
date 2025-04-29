// server.js - Main entry point for our Node.js POS application

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'pos-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Sample product database
const products = [
  { id: 1, name: 'Coffee', price: 3.50, category: 'Beverages' },
  { id: 2, name: 'Sandwich', price: 6.75, category: 'Food' },
  { id: 3, name: 'Salad', price: 8.99, category: 'Food' },
  { id: 4, name: 'Tea', price: 2.99, category: 'Beverages' },
  { id: 5, name: 'Cookie', price: 1.99, category: 'Snacks' },
  { id: 6, name: 'Muffin', price: 2.49, category: 'Snacks' }
];

// Sample orders database
let orders = [];
let orderIdCounter = 1000;

// Routes
app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // For demo purposes only - in production, use proper authentication
  if (username === 'admin' && password === 'admin123') {
    req.session.user = { username, role: 'admin' };
    res.redirect('/dashboard');
  } else if (username === 'cashier' && password === 'cashier123') {
    req.session.user = { username, role: 'cashier' };
    res.redirect('/pos');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/');
  }
};

// Admin dashboard
app.get('/dashboard', isAuthenticated, (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.redirect('/pos');
  }
  res.render('dashboard', { 
    user: req.session.user,
    products: products,
    orders: orders 
  });
});

// POS interface
app.get('/pos', isAuthenticated, (req, res) => {
  res.render('pos', { 
    user: req.session.user,
    products: products 
  });
});

// API endpoints
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/orders', (req, res) => {
  const { items, total, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid order items' });
  }

  const order = {
    id: orderIdCounter++,
    items,
    total,
    paymentMethod,
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  orders.push(order);
  res.status(201).json(order);
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Start server
app.listen(PORT, () => {
  console.log(`POS system running on http://localhost:${PORT}`);
});