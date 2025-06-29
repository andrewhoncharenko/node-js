const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getIndex = (request, response, next) => {
    Product.getAll((products) => {
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
    Cart.getCart(cart => {
        Product.getAll(products => {
            const cartProducts = [];
            for(product of products) {
                const cartProductData = cart.products.find(cartProduct => cartProduct.id === product.id);
                if(cartProductData) {
                    cartProducts.push({productData: product, quantity: cartProductData.quantity});
                }
            }
            response.render("shop/cart", {pageTitle: "Your cart", path: "/cart", products: cartProducts});
        });
    });
};
exports.postCart = (request, response, next) => {
    const productId = request.body.productId;
    Product.findById(productId, product => {
        Cart.addToCart(productId, product.price);
    });
    response.redirect('/');
};
exports.postCartDeleteProduct = (request, response, next) => {
    const productId = request.body.productId;
    Product.findById(productId, product => {
        Cart.deleteProduct(productId, product.price);
        response.redirect("/cart");
    })
};
exports.getOrders = (request, response, next) => {
    response.render("shop/orders", {pageTitle: "Your orders", path: "/orders"});
};
exports.getCheckout = (request, response, next) => {
    response.render("shop/checkout", {pageTitle: "Checkout", path: "/checkout"});
};