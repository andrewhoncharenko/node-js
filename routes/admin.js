const path = require("path");

const express = require("express");

const router = express.Router();

const rootPath = require("../util/path");

const products = [];

router.get("/add-product", (request, response, next) => {
    response.render("add-product", {pageTitle: "Add Product", path: "/admin/add-product", formsCSS: true, productCSS: true, activeAddProduct: true});
});
router.post("/add-product", (request, response, next) => {
    products.push({title: request.body.title});
    response.redirect("/");
});

exports.routes = router;
exports.products = products;