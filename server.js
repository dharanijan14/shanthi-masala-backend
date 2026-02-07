const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/shanthi_masala")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Product schema
const Product = mongoose.model("Product", {
  name: String,
  price: Number,
  weight: String,
  description: String,
  stock: Number,
  image: String
});

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

/* ================= PRODUCTS ================= */

// Get all products
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Add product
app.post("/api/products", upload.single("image"), async (req, res) => {
  const product = {
    name: req.body.name,
    price: Number(req.body.price),
    weight: req.body.weight,
    description: req.body.description,
    stock: Number(req.body.stock),
    image: req.file ? `/uploads/${req.file.filename}` : ""
  };

  await Product.create(product);
  res.json({ message: "Product added" });
});

// Update product
app.put("/api/products/:id", upload.single("image"), async (req, res) => {
  const updatedData = {
    name: req.body.name,
    price: Number(req.body.price),
    weight: req.body.weight,
    description: req.body.description,
    stock: Number(req.body.stock)
  };

  if (req.file) {
    updatedData.image = `/uploads/${req.file.filename}`;
  }

  await Product.findByIdAndUpdate(req.params.id, updatedData);
  res.json({ message: "Product updated successfully" });
});

// Delete product
app.delete("/api/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});

/* ================= ORDER ================= */

app.post("/api/order", async (req, res) => {
  try {
    const items = req.body.items;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    for (let item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    res.json({ message: "Order placed successfully" });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ message: "Order failed" });
  }
});

/* ================= SERVER ================= */

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
