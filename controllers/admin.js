const { validationResult } = require("express-validator");

const Product = require("../models/product");

exports.getAddProduct = (request, response, next) => {
    if(!request.session.userId) {
        return response.redirect("/login");
    }
    response.render("admin/add-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        product: {
            title: "",
            imageUrl: "",
            price: "",
            description: ""
        },
        errorMessage: null
    });
};
exports.postAddProduct = (request, response, next) => {
    const title = request.body.title;
    const imageUrl = request.body.imageUrl;
    const price = request.body.price;
    const description = request.body.description;
    const errors = validationResult(request);
    const messages = errors.array();

    if(!errors.isEmpty()) {
        return response.status(422).render("admin/add-product", {
                pageTitle: "Add Product",
                path: "/admin/add-product",
                product: {
                    title: title,
                    imageUrl: imageUrl,
                    price: price,
                    description: description
                },
                errorMessage: messages[0].msg
        });
    }

    const product = new Product({ title: title, price: price, description: description, imageUrl: imageUrl, userId: request.session.userId });
    product.save()
    .then(() => {
        response.redirect("/admin/products");
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
};
exports.getEditProduct = (request, response, next) => {
    const editMode = request.query.edit;
    const productId = request.params.productId;

    if(!editMode) {
        return response.redirect("/");
    }
    Product.findById(productId).then(product => {
        if(product) {
            response.render("admin/edit-product", {
                pageTitle: "Edit Product",
                path: "/admin/edit-product",
                product: product
            });
        }
        else {
            response.redirect("/");
        }
    });
};
exports.postEditProduct = (request, response, next) => {
    const productId = request.body.id;
    const updatedTitle = request.body.title;
    const updatedImageUrl = request.body.imageUrl;
    const updatedPrice = request.body.price;
    const updatedDescription = request.body.description;

    Product.findById(productId)
    .then(product => {
        if(product.userId.toString() !== request.session.userId) {
            return response.redirect("/");
        }
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDescription;
        product.imageUrl = updatedImageUrl;
        return product.save().then(() => {
            response.redirect("/admin/products");
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
};
exports.postDeleteProduct = (request, response, next) => {
    const productId = request.body.productId;

    Product.deleteOne({_id: productId, userId: request.session.userId})
    .then(() => {
        response.redirect("/admin/products");
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
};
exports.getProducts = (request, response, next) => {
    Product.find({userId: request.session.userId})
    .then(products => {
        response.render("admin/products", {
            products: products,
            pageTitle: "Products",
            path: "/admin/products"
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
};