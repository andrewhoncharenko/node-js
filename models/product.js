const fs = require("fs");
const path = require("path");

const rootPath = require("../util/path");
const Cart = require("./cart");
const db = require("../util/database");

const p = path.join(rootPath, "data", "products.json");

const getProductsFromFile = (callback) => {
    fs.readFile(p, (err, fileContent) => {
            if(err || fileContent.length === 0) {
                callback([]);
            }
            else {
                callback(JSON.parse(fileContent));
            }
    });
};

module.exports = class Product { 
    constructor(id, title, imageUrl, price, description) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }
    save() {
        return db.execute("INSERT INTO products(title, price, imageUrl, description) VALUES(?, ?, ?, ?)",
            [this.title, this.price, this.imageUrl, this.description]);
    }
    static deleteById(id) {
        getProductsFromDatabase((products) => {
            const product = products.find(product => product.id === id);
            const updatedProducts = products.filter(product => product.id !== id);
            fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
                if(!err) {
                    Cart.deleteProduct(id, product.price);
                }
            });
        });
    };

    static getAll() {
        return db.execute("SELECT * FROM products");
    }

    static findById(id) {
        return db.execute("SELECT * FROM products WHERE id = ?", [id]);
    }
}