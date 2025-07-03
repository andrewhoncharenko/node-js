const Product = require("../models/product");

exports.getIndex = (request, response, next) => {
    Product.fetchAll().then(products => {
        response.render("shop/index", {products: products, pageTitle: "Shop", path: "/"});
    });
};
exports.getProducts = (request, response, next) => {
    Product.fetchAll().then(products => {
        response.render("shop/product-list", {products: products, pageTitle: "Shop", path: "/products"});
    });
};
exports.getProduct = (request, response, next) => {
    const productId = request.params.productId;
    Product.findById(productId).then(product => {
        response.render("shop/product-detail", {pageTitle: product.title, product: product, path: product.id});
    });
};
exports.getCart = (request, response, next) => {
    request.user.getCart()
    .then(products => {
        response.render("shop/cart", {pageTitle: "Your cart", path: "/cart", products: products});
    });
};
exports.postCart = (request, response, next) => {
    const productId = request.body.productId;
    Product.findById(productId).then(product => {
        return request.user.addToCart(product);
    })
    .then(() => {
        response.redirect("/cart");
    });
};
exports.postCartDeleteProduct = (request, response, next) => {
    const productId = request.body.productId;
    request.user.deleteItemFromCart(productId)
    .then(() => {
        response.redirect("/cart");
    })
    .catch((err) => {
        console.log(err);
    });
};
exports.postOrder = (request, response, next) => {
    request.user.addOrder()
    .then(() => {
        response.redirect("/orders");
    })
    .catch(err => {
        console.log(err);
    });
};
exports.getOrders = (request, response, next) => {
    request.user.getOrders()
    .then(orders => {
        response.render("shop/orders", {pageTitle: "Your orders", path: "/orders", orders: orders});
    })
    .catch(err => {
        console.log(err);
    });
};
exports.getCheckout = (request, response, next) => {
    response.render("shop/checkout", {pageTitle: "Checkout", path: "/checkout"});
};