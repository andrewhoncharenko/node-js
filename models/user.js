const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
      type: String,
      required: true
    },
    cart: {
        items: [{productId: {type: Schema.Types.ObjectId, ref: "Product"}, quantity: {type: Number, required: true}}]
    },
    resetToken: String,
    resetTokenExpiration: Date
});

userSchema.methods.addToCart = function(product) {
     const cartProductIndex = this.cart.items.findIndex(cp => {
       return cp.productId.toString() === product._id.toString();
     });
     let newQuantity = 1;
     const updatedCartItems = [...this.cart.items];

     if (cartProductIndex >= 0) {
       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
       updatedCartItems[cartProductIndex].quantity = newQuantity;
     } else {
       updatedCartItems.push({
         productId: product._id,
         quantity: newQuantity
       });
     }
     const updatedCart = {
       items: updatedCartItems
     };
     this.cart = updatedCart;
     this.save();
};
userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId != productId;
  });
  this.cart.items = updatedCartItems;
  return this.save();
};
userSchema.methods.clearCart = function() {
  this.cart = {items: []};
  return this.save();
};
userSchema.methods.addOrder = function() {
  const order = { items: this.cart.items, user: this.user._id };

  this.orders.push(order);
  this.cart.items = [];
  return this.save();
}

module.exports = mongoose.model("User", userSchema);