const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// In-memory storage (prototype)
let products = [];
let orders = [];

/* =========================
   MIDDLEWARE
   ========================= */
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Disable caching (important for mobile & tablets)
app.use((req, res, next) => {
    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

/* =========================
   FRONTEND ROUTE
   ========================= */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================
   API ROUTES
   ========================= */

// Add product (called by Raspberry Pi)
app.post("/product", (req, res) => {
    const product = req.body;
    console.log("➕ Product received:", product);
    products.push(product);
    res.json({ status: "product added" });
});

// Get all products (used by UI)
app.get("/product", (req, res) => {
    res.json(products);
});

// Legacy-safe clear cart (used by checkout button)
app.post("/clear", (req, res) => {
    console.log("🧹 CLEAR CART REQUEST");
    console.log("Before clear:", products.length);

    products = [];

    console.log("After clear:", products.length);
    res.json({ status: "cart cleared" });
});

// Optional: store checkout info (not required for UI)
app.post("/checkout", (req, res) => {
    const order = req.body;
    orders.push(order);
    res.json({ status: "checkout stored" });
});

/* =========================
   START SERVER
   ========================= */
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
