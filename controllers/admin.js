const Product = require("../models/product");

exports.getAddProduct = (request, response, next) => {
    response.render("admin/add-product", {pageTitle: "Add Product", path: "/admin/add-product"});
};
exports.postAddProduct = (request, response, next) => {
    const title = request.body.title;
    const imageUrl = request.body.imageUrl;
    const price = request.body.price;
    const description = request.body.description;
    const product = new Product(null, title, imageUrl, price, description);
    
    product.save().then(() => {
        response.redirect("/")
    })
    .catch(err => {
        console.log(err);
    });
};
exports.getEditProduct = (request, response, next) => {
    const editMode = request.query.edit;
    const productId = request.params.productId;

    if(!editMode) {
        return response.redirect("/");
    }
    Product.findById(productId).then(([productResult]) => {
        if(productResult.length > 0) {
            const product = productResult[0];
            response.render("admin/edit-product", {pageTitle: "Edit Product", path: "/admin/edit-product", product: product});
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
    const updatedProduct = new Product(
        productId,
        updatedTitle,
        updatedImageUrl,
        updatedPrice,
        updatedDescription
    );

    updatedProduct.save()
    .then(() => {
        response.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};
exports.postDeleteProduct = (request, response, next) => {
    const productId = request.body.productId;
    Product.deleteById(productId).then( () => {
        response.redirect("/admin/products");
    });
};
exports.getProducts = (request, response, next) => {
    Product.getAll().then(result => {
        const products = result[0];
        response.render("admin/products", {products: products, pageTitle: "Products", path: "/admin/products"});
    })
    .catch(err => {
        console.log(err)
    });
};