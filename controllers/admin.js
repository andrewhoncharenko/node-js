const { validationResult } = require("express-validator");

const fileHelper = require("../util/file");
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
        errorMessage: null,
        validationErrors: []
    });
};
exports.postAddProduct = (request, response, next) => {
    const title = request.body.title;
    const image = request.file;
    const price = request.body.price;
    const description = request.body.description;
    const errors = validationResult(request);
    const messages = errors.array();

    if(!image) {
        return response.status(422).render("admin/add-product", {
                pageTitle: "Add Product",
                path: "/admin/add-product",
                product: {
                    title: title,
                    price: price,
                    description: description
                },
                errorMessage: "Attached file is not an image.",
                validationErrors: []
        });
    }
    if(!errors.isEmpty()) {    
        return response.status(422).render("admin/add-product", {
                pageTitle: "Add Product",
                path: "/admin/add-product",
                product: {
                    title: title,
                    price: price,
                    description: description
                },
                errorMessage: messages[0].msg,
                validationErrors: []
        });
    }

    const imageUrl = "/" + image.path;
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
                product: product,
                errorMessage: ""
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
    const image = request.file;
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
        if(image) {
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
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

    Product.findById(productId).then(product => {
        if(!product) {
            return next(new Error("Product not foung."));
        }
        fileHelper.deleteFile(product.imageUrl);
        return Product.deleteOne({_id: productId, userId: request.session.userId});
    })
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