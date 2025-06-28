const Product = require("../models/product");

exports.getIndex = (request, response, next) => {
    Product.getAll((products) => {
        console.log(products);
        response.render("shop/index", {products: products, pageTitle: "Shop", path: "/", hasProducts: products.length > 0, productCSS: true, activeShop: true});
    });
};
exports.getProducts = (request, response, next) => {
    Product.getAll((products) => {
        response.render("shop/product-list", {products: products, pageTitle: "Shop", path: "/products", hasProducts: products.length > 0, productCSS: true, activeShop: true});
    });
};
exports.getProduct = (request, response, next) => {
    const productId = request.params.productId;
    Product.findById(productId, product => {
        response.render("shop/product-detail", {pageTitle: product.title, product: product, path: product.id});
    });
};
exports.getCart = (request, response, next) => {
    response.render("shop/cart", {pageTitle: "Your cart", path: "/cart"});
};
exports.getOrders = (request, response, next) => {
    response.render("shop/orders", {pageTitle: "Your orders", path: "/orders"});
};
exports.getCheckout = (request, response, next) => {
    response.render("shop/checkout", {pageTitle: "Checkout", path: "/checkout"});
};