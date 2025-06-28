const path = require("path");

const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin");
const productsController = require("../controllers/shop");

router.get("/add-product", adminController.getAddProduct);
router.post("/add-product", adminController.postAddProduct);
router.get("/products", adminController.getProducts);

module.exports = router;