const { ObjectId } = require("mongodb");

const getDb = require("../util/database").getDb;

class Product {
    constructor(title, price, description, imageUrl, id, userId) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id;
        this.userId = userId;
    }
    save() {
        const db = getDb();
        let dbOp;
        if(this._id) {
            this._id = ObjectId.createFromHexString(this._id);
            dbOp = db.collection("products").updateOne({_id: this._id}, {$set: this});
        }
        else {
            dbOp = db.collection("products").insertOne(this);
        }
        return dbOp;
    }
    static fetchAll() {
        const db = getDb();
        return db.collection("products")
        .find()
        .toArray()
        .then(products => {
            return products;
        })
        .catch(err => console.log(err))
    }
    static findById(productId) {
        const db = getDb();
        return db.collection("products").findOne({_id: ObjectId.createFromHexString(productId)});
    }
    static deleteById(productId) {
        const db = getDb();
        return db.collection("products")
        .deleteOne({_id: ObjectId.createFromHexString(productId)})
        .then(result => {
            console.log(result)
        })
        .catch(err => {
            console.log(err);
        });
    }
}

module.exports = Product;