const Product = require("../models/Product");
const Transaction = require("../models/Transaction");



const createProduct = async (req, res) => {
  try {
    const { productName, price, availableStock } = req.body;

    // Validation
    if (!productName || price === undefined || availableStock === undefined) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        message: "Price must be greater than zero"
      });
    }

    if (availableStock < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative"
      });
    }

    // Check duplicate product
    const existingProduct = await Product.findOne({
      productName: productName.trim()
    });

    if (existingProduct) {
      return res.status(409).json({
        message: "Product already exists"
      });
    }

    const product = await Product.create({
      productName: productName.trim(),
      price,
      availableStock
    });

    res.status(201).json({
      message: "Product created successfully",
      product
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// ===============================
// GET ALL PRODUCTS
// GET /products
// ===============================

const getProducts = async (req, res) => {
  try {

    const products = await Product.find();

    res.status(200).json({
      count: products.length,
      products
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// ===============================
// PURCHASE PRODUCT
// POST /products/purchase
// ===============================

const purchaseProduct = async (req, res) => {
  try {

    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        message: "Product ID and quantity are required"
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: "Purchase quantity must be greater than zero"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // Check stock
    if (quantity > product.availableStock) {
      return res.status(400).json({
        message: "Insufficient stock",
        availableStock: product.availableStock
      });
    }

    // Decrease stock
    product.availableStock -= quantity;

    await product.save();

    // Create transaction
    const transaction = await Transaction.create({
      productId: product._id,
      transactionType: "Purchase",
      quantity: quantity
    });

    res.status(200).json({
      message: "Purchase successful",
      product,
      transaction
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};




const restockProduct = async (req, res) => {
  try {

    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        message: "Product ID and quantity are required"
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        message: "Restock quantity must be greater than zero"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // Increase stock
    product.availableStock += quantity;

    await product.save();

    // Create transaction
    const transaction = await Transaction.create({
      productId: product._id,
      transactionType: "Restock",
      quantity: quantity
    });

    res.status(200).json({
      message: "Product restocked successfully",
      product,
      transaction
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};




const getProductHistory = async (req, res) => {
  try {

    const { productId } = req.params;

    // Check product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const transactions = await Transaction.find({
      productId: productId
    })
      .sort({ transactionDate: -1 });

    res.status(200).json({
      product: product,
      totalTransactions: transactions.length,
      transactions
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


module.exports = {
  createProduct,
  getProducts,
  purchaseProduct,
  restockProduct,
  getProductHistory
};