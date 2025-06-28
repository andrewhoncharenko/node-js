const Product = require("../models/product");

exports.getAddProduct = (request, response, next) => {
    response.render("admin/add-product", {pageTitle: "Add Product", path: "/admin/add-product", formsCSS: true, productCSS: true, activeAddProduct: true});
};
exports.postAddProduct = (request, response, next) => {
    const title = request.body.title;
    const imageUrl = request.body.imageUrl;
    const price = request.body.price;
    const description = request.body.description;
    const product = new Product(title, imageUrl, price, description);
    console.log(price);
    console.log(product);
    //product.save();
    response.redirect("/");
};
exports.getProducts = (request, response, next) => {
    Product.getAll((products) => {
        response.render("admin/products", {products: products, pageTitle: "Products", path: "/admin/products"});
    });
};