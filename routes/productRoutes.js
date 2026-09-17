const express = require("express");

const router = express.Router();

const {
  createProduct,
  getProducts,
  purchaseProduct,
  restockProduct,
  getProductHistory
} = require("../controllers/productController");


router.post("/products", createProduct);


router.get("/products", getProducts);



router.post("/products/purchase", purchaseProduct);



router.post("/products/restock", restockProduct);
router.get("/products/:productId/history",
  getProductHistory
);


module.exports = router;