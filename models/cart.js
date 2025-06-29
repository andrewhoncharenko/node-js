const fs = require("fs");
const path = require("path");
const rootPath = require("../util/path");
const p = path.join(rootPath, "data", "cart.json");

module.exports = class Cart {
    static addToCart(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            let cart = {products: [], totalPrice: 0};
            if(!err) {
                cart = JSON.parse(fileContent);
            }
            const existingProductIndex = cart.products.findIndex(product => product.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;

            if(existingProduct) {
                updatedProduct = {...existingProduct};
                updatedProduct.quantity = updatedProduct.quantity + 1;
                cart.products[existingProductIndex] = updatedProduct;
            }
            else {
                updatedProduct = {id: id, quantity: 1};
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + +productPrice;
            fs.writeFile(p, JSON.stringify(cart) ,(err) => {
                console.log(err);
            });
        });
    }
    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            if(err) {
                return;
            }
            const updatedCart = {...JSON.parse(fileContent)};
            const product = updatedCart.products.find(product => product.id === id);
            if(!product) {
                return;
            }
            const productQuantity = product.quantity;
            updatedCart.products = updatedCart.products.filter(product => product.id !== id);
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQuantity;
            fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
                console.log(err)
            });
        });
    }
    static getCart(callback) {
        fs.readFile(p, (err, fileContent) => {
            if(err) {
                callback(null)
            }
            else {
                const cart = JSON.parse(fileContent);
                callback(cart);
            }
        });
    }
}