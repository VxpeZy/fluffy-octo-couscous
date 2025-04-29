// server.js - Main entry point for our Node.js POS application

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const QRCode = require('qrcode');
const promptpay = require('promptpay-qr');

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

// API endpoint to generate PromptPay QR
app.get('/api/generate-promptpay', async (req, res) => {
  try {
    const amount = parseFloat(req.query.amount) || 0;
    const phoneNumber = '0835260057'; // Replace with your store's actual PromptPay number
    
    // Generate PromptPay payload using the library
    const payload = promptpay.generate({ phoneNumber, amount });

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300
    });

    res.json({ qrCode: qrCodeDataURL });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code', details: error.message });
  }
});

// For demo purposes, add a placeholder API
app.get('/api/placeholder/:width/:height', (req, res) => {
  const width = req.params.width;
  const height = req.params.height;

  // Send an SVG placeholder
  res.set('Content-Type', 'image/svg+xml');
  res.send(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" text-anchor="middle" alignment-baseline="middle">
        QR Code
      </text>
      <rect x="25%" y="25%" width="50%" height="50%" fill="none" stroke="#000"/>
      <rect x="40%" y="40%" width="20%" height="20%" fill="#000"/>
    </svg>
  `);
});

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
