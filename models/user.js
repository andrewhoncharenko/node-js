const { ObjectId } = require("mongodb");

const getDb = require("../util/database").getDb;

class User {
    constructor(name, email, cart, id) {
        this.name = name;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }
    save() {
        const db = getDb();

        return db.collection("users")
        .insertOne(this);
    }
    addToCart(product) {
        const db = getDb();
        const cartProductIndex = this.cart.items.findIndex(cp => {
            return cp.productId.toString() === product._id.toString();
        });
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];

        if(cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        }
        else {
            updatedCartItems.push({ productId: product._id, quantity: 1 });
        }
        
        const updatedCart = {items: updatedCartItems};

        return db.collection("users")
        .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
    }
    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(item => {return item.productId});
        return db.collection("products").find({_id: {$in: productIds }})
        .toArray()
        .then(products => {
            return products.map(product => {
                return {...product, quantity: this.cart.items.find(i => {
                    return i.productId.toString() === product._id.toString();
                }).quantity};
            });
        });
    }
    deleteItemFromCart(productId) {
        const db = getDb();
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString();
        });
        
        return db.collection("users")
            .updateOne({ _id: this._id }, { $set: { cart: { items: updatedCartItems }}});
    }
    addOrder() {
        const db = getDb();
        return this.getCart()
        .then(products => {
            const order = {
                items: products,
                user: {
                    _id: ObjectId.createFromHexString*(this._id.toString()),
                    name: this.name
                }
            };
            return db.collection("orders").insertOne(order);
        })
        .then(() => {
            this.cart = {items: []};
            return db.collection("users")
                .updateOne({ _id: this._id }, { $set: { cart: { items: [] }}});
        });
    }
    getOrders() {
        const db = getDb();
        return db.collection("orders")
        .find()
        .toArray();
    }
    static findById(userId) {
        const db = getDb();
        return db.collection("users")
        .findOne({ _id: ObjectId.createFromHexString(userId) });
    }
}

module.exports = User;