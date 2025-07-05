const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

exports.getIndex = (request, response, next) => {
    Product.find().then(products => {
        response.render("shop/index", { products: products, pageTitle: "Shop", path: "/", isAuthenticated: request.session.userId ? true : false });
    });
};
exports.getProducts = (request, response, next) => {
    Product.find().then(products => {
        response.render("shop/product-list", { products: products, pageTitle: "Shop", path: "/products", isAuthenticated: request.session.userId ? true : false });
    });
};
exports.getProduct = (request, response, next) => {
    const productId = request.params.productId;
    Product.findById(productId).then(product => {
        response.render("shop/product-detail", {pageTitle: product.title, product: product, path: product.id, isAuthenticated: request.session.userId ? true : false });
    });
};
exports.getCart = (request, response, next) => {
    User.findById(request.session.userId).populate("cart.items.productId")
    .then(user => {
        const products = user.cart.items;
        response.render("shop/cart", {pageTitle: "Your cart", path: "/cart", products: products, isAuthenticated: request.session.userId ? true : false });
    });
};
exports.postCart = (request, response, next) => {
    const productId = request.body.productId;
    Product.findById(productId).then(product => {
        return User.findById(request.session.userId).then(user => {
            user.addToCart(product);
        });
    })
    .then(() => {
        response.redirect("/cart");
    });
};
exports.postCartDeleteProduct = (request, response, next) => {
    const productId = request.body.productId;

    request.user.removeFromCart(productId)
    .then(() => {
        response.redirect("/cart");
    })
    .catch((err) => {
        console.log(err);
    });
};
exports.postOrder = (request, response, next) => {
    User.findById(request.session.userId).populate("cart.items.productId").then(user => {
        const products = request.user.cart.items.map(item => {
            return { product: item.productId, quantity: item.quantity };
        });
        const order = new Order({
            products: products, user: { name: request.user.name, userId: request.user }
        });
        return order.save();
    })
    .then(() => {
        return request.user.clearCart();
    })
    .then(() => {
        response.redirect("/orders");
    })
    .catch(err => {
        console.log(err);
    });
};
exports.getOrders = (request, response, next) => {
    const userId = request.session.userId;
    Order.find({"user.userId": userId})
    .then(orders => {
        response.render("shop/orders", { pageTitle: "Your orders", path: "/orders", orders: orders, isAuthenticated: userId ? true : false });
    })
    .catch(err => {
        console.log(err);
    });
};
exports.getCheckout = (request, response, next) => {
    response.render("shop/checkout", { pageTitle: "Checkout", path: "/checkout", isAuthenticated: request.session.userId ? true : false });
};