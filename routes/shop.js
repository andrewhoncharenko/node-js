const path = require("path");

const express = require("express");

const router = express.Router();

const adminData = require("../routes/admin");

router.get("/", (request, response, next) => {
    const products = adminData.products;
    response.render("shop", {products: products, pageTitle: "Shop", path: "/", hasProducts: products.length > 0, productCSS: true, activeShop: true});
});

module.exports = router;