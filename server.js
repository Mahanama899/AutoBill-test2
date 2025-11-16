// server.js — serves static frontend + API
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// In-memory store
let products = [];
let orders = [];

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static frontend from "public" directory
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// API root healthcheck
app.get('/api', (req, res) => {
  res.json({ ok: true, msg: 'API deployment successful' });
});

// Product endpoints
app.post('/product', (req, res) => {
  const product = { ...req.body };
  if (product.id !== undefined && product.id !== null) product.id = String(product.id);
  products.push(product);
  res.status(201).send('Product is added to the database');
});

app.get('/product', (req, res) => {
  res.json(products);
});

app.get('/product/:id', (req, res) => {
  const id = String(req.params.id);
  const found = products.find(p => String(p.id) === id);
  if (!found) return res.status(404).send('Product not found');
  res.json(found);
});

app.delete('/product/:id', (req, res) => {
  const id = String(req.params.id);
  const before = products.length;
  products = products.filter(p => String(p.id) !== id);
  const removed = before - products.length;
  res.send(removed ? 'Product is deleted' : 'Product not found');
});

// Optional: clear all products
app.delete('/product', (req, res) => {
  products = [];
  res.send('All products cleared');
});

// Checkout endpoints
app.post('/checkout', (req, res) => {
  const order = req.body;
  orders.push(order);
  res.redirect(302, 'https://assettracker.cf');
});
app.get('/checkout', (req, res) => res.json(orders));

// SPA fallback: serve index.html for unknown routes (helps client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
