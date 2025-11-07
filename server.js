// server.js (fixed id mismatch and added a clear-all route)

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

let products = [];
let orders = [];

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('API deployment successful');
});

// Create product — normalize id to string
app.post('/product', (req, res) => {
  const product = { ...req.body };
  // Force id to string so URL param comparisons match
  if (product.id !== undefined && product.id !== null) {
    product.id = String(product.id);
  }
  console.log('POST /product', product);
  products.push(product);
  res.send('Product is added to the database');
});

// List all products
app.get('/product', (req, res) => {
  res.json(products);
});

// Get one product by id (compare strings)
app.get('/product/:id', (req, res) => {
  const id = String(req.params.id);
  const found = products.find(p => String(p.id) === id);
  if (!found) return res.status(404).send('Product not found');
  res.json(found);
});

// Delete one product by id (compare strings)
app.delete('/product/:id', (req, res) => {
  const id = String(req.params.id);
  const before = products.length;
  products = products.filter(p => String(p.id) !== id);
  const removed = before - products.length;
  res.send(removed ? 'Product is deleted' : 'Product not found');
});

// Edit/replace one product by id (compare strings)
app.post('/product/:id', (req, res) => {
  const id = String(req.params.id);
  const newProduct = { ...req.body, id: id }; // keep id consistent
  let updated = false;
  products = products.map(p => {
    if (String(p.id) === id) {
      updated = true;
      return newProduct;
    }
    return p;
  });
  res.send(updated ? 'Product is edited' : 'Product not found');
});

// (Optional) Clear all products — helps after checkout
app.delete('/product', (req, res) => {
  products = [];
  res.send('All products cleared');
});

// Checkout (unchanged)
app.post('/checkout', (req, res) => {
  const order = req.body;
  orders.push(order);
  res.redirect(302, 'https://assettracker.cf');
});

app.get('/checkout', (req, res) => {
  res.json(orders);
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
