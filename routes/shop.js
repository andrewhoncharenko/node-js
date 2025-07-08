const path = require("path");

const express = require("express");

const router = express.Router();

const isAuth = require("../middleware/is-auth");
const productsController = require("../controllers/shop");

router.get("/", productsController.getIndex);
router.get("/products", productsController.getProducts);
router.get("/products/:productId", productsController.getProduct);
router.get("/cart", isAuth, productsController.getCart);
router.post("/cart", isAuth, productsController.postCart);
router.post("/cart-delete-item", isAuth, productsController.postCartDeleteProduct);
router.post("/create-order", isAuth, productsController.postOrder);
router.get("/orders", isAuth, productsController.getOrders);

module.exports = router;