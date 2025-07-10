const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [
        {
            product: { type: {title: String, price: Number, }, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    user: {
        email: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, required: true, ref: "User"}
    }
});

orderSchema.methods.addOrder = function(items, userId) {

};

module.exports = mongoose.model("Order", orderSchema);