const express = require("express");
const { body } = require("express-validator"); 

const router = express.Router();

const isAuth = require("../middleware/is-auth");
const adminController = require("../controllers/admin");

router.get("/add-product", isAuth, adminController.getAddProduct);
router.post("/add-product", [
    body("title").isString().isLength({min: 3}).trim(),
    body("price").isFloat(),
    body("description").isLength({min: 8, max: 400}).trim()
], isAuth, adminController.postAddProduct);
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post("/edit-product", isAuth, adminController.postEditProduct);
router.post("/delete-product", isAuth, adminController.postDeleteProduct);
router.get("/products", isAuth, adminController.getProducts);

module.exports = router;