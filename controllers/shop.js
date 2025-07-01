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
    request.user.getCart()
    .then(cart => {
        return cart.getProducts();
    })
    .then(products => {
        response.render("shop/cart", {pageTitle: "Your cart", path: "/cart", products: products});
    });
    /*Cart.getCart(cart => {
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
    });*/
};
exports.postCart = (request, response, next) => {
    const productId = request.body.productId;
    let userCart;
    let newQuantity = 1;

    request.user.getCart()
    .then(cart=> {
        userCart = cart;
        return cart.getProducts({where: {id: productId}});
    })
    .then(products => {
        let product;    

        if(products.length > 0) {
            product = products[0]
        }
        
        if(product) {
            newQuantity = product.cartItem.quantity + 1;
            return products;
        }
        return Product.findAll({where: {id: productId}})
    })
    .then(products => {
        const product = products[0];
        return userCart.addProduct(product, {through: {quantity: newQuantity}});
    })
    .then(() => {
        response.redirect('/cart');
    })
    .catch(err => {
        console.log(err);
    });
};
exports.postCartDeleteProduct = (request, response, next) => {
    const productId = request.body.productId;
    request.user.getCart()
    .then(cart => {
        return cart.getProducts({where: {id: productId}});
    })
    .then(products => {
        console.log(products);
        const product = products[0];
        product.cartItem.destroy();
    })
    .then(() => {
        response.redirect("/cart");
    })
    .catch((err) => {
        console.log(err);
    });
};
exports.postOrder = (request, response, next) => {
    let userCart;
    request.user.getCart()
    .then(cart => {
        userCart = cart;
        return cart.getProducts();
    })
    .then(products => {
        return request.user.createOrder()
        .then(order => {
            return order.addProducts(products.map(product => {
                product.orderItem = {quantity: product.cartItem.quantity};
                return product;
            }));
        })
        .catch(err => {
            console.log(err);
        });
    })
    .then(() => {
        userCart.setProducts(null);
    })
    .then(() => {
        response.redirect("/orders");
    })
    .catch(err => {
        console.log(err);
    });
};
exports.getOrders = (request, response, next) => {
    request.user.getOrders({include: ["products"]})
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