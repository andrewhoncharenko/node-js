const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getIndex = (request, response, next) => {
    Product.findAll().then(products => {
        response.render("shop/index", {products: products, pageTitle: "Shop", path: "/"});
    });
};
exports.getProducts = (request, response, next) => {
    Product.findAll().then(products => {
        response.render("shop/product-list", {products: products, pageTitle: "Shop", path: "/products"});
    });
};
exports.getProduct = (request, response, next) => {
    const productId = request.params.productId;
    Product.findAll({where: {
        id: productId
    }}).then(products => { 
        const product = products[0];
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