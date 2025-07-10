const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

const ITEMS_PER_PAGE = 2;

exports.getIndex = (request, response, next) => {
    const page = +request.query.page || 1;
    let totalItems;

    Product.find().countDocuments().then(numProducts => {
        totalItems = numProducts;
        return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
    })
    .then(products => {
        response.render("shop/index", {
            products: products,
            pageTitle: "Shop",
            path: "/",
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    });
};
exports.getProducts = (request, response, next) => {
    const page = +request.query.page || 1;
    let totalItems;

    Product.find().countDocuments().then(numProducts => {
        totalItems = numProducts;
        return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
    })
    .then(products => {
        response.render("shop/product-list", {
            products: products,
            pageTitle: "Products",
            path: "/products",
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
    });
};
exports.getProduct = (request, response, next) => {
    const productId = request.params.productId;
    Product.findById(productId).then(product => {
        response.render("shop/product-detail", {pageTitle: product.title, product: product, path: product.id });
    });
};
exports.getCart = (request, response, next) => {
    User.findById(request.session.userId).populate("cart.items.productId")
    .then(user => {
        const products = user.cart.items;
        response.render("shop/cart", {pageTitle: "Your cart", path: "/cart", products: products });
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
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
};
exports.postOrder = (request, response, next) => {
    let userData;

    User.findById(request.session.userId).populate("cart.items.productId").then(user => {
        const products = user.cart.items.map(item => {
            return { product: item.productId, quantity: item.quantity };
        });
        const order = new Order({
            products: products, user: { email: user.email, userId: user._id }
        });

        userData = user;

        return order.save();
    })
    .then(() => {
        return userData.clearCart();
    })
    .then(() => {
        response.redirect("/orders");
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
};
exports.getOrders = (request, response, next) => {
    const userId = request.session.userId;
    Order.find({"user.userId": userId})
    .then(orders => {
        response.render("shop/orders", { pageTitle: "Your orders", path: "/orders", orders: orders });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
};
exports.getCheckout = (request, response, next) => {
    response.render("shop/checkout", { pageTitle: "Checkout", path: "/checkout" });
};
exports.getInvoice = (request, response, next) => {
    const orderId = request.params.orderId;
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("data", "invoices", invoiceName);
    const invoicePDFDocument = new PDFDocument();
    let totalPrice = 0;

    Order.findById(orderId).then(order => {
        if(!order) {
            return next(new Error("No order found."));
        }
        if(order.user.userId.toString() !== request.session.userId) {
            return next(new Error("Unauthorized"))
        }
        response.setHeader("Content-Type", "application/pdf");
        response.setHeader("Content-Disposition", 'inline; filename="' + invoiceName + '"');
        invoicePDFDocument.pipe(fs.createWriteStream(invoicePath));
        invoicePDFDocument.pipe(response);
        invoicePDFDocument.fontSize(26).text("Invoice", {
            underline: true
        });
        invoicePDFDocument.text("-----------------------");
        order.products.forEach(orderProduct => {
            totalPrice += totalPrice + orderProduct.product.price * orderProduct.quantity;
            invoicePDFDocument.fontSize(14).text(orderProduct.product.title + " - " + orderProduct.quantity + " x " + "$" + orderProduct.product.price);
        });
        invoicePDFDocument.text("---");
        invoicePDFDocument.fontSize(20).text("Total price: $" + totalPrice);
        invoicePDFDocument.end();
    });
};