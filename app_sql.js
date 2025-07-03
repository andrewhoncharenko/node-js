const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/shop");

const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const Order = require("./models/order");
const CartItem = require("./models/cart-item");
const OrderItem = require("./models/order-item");

const app = express();

app.set("view engine", "ejs");
app.set("vaews", "views");

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));

app.use((request, response, next) => {
    User.findAll({ where: { id: 1 } })
    .then(user => {
        request.user = user[0];
        next();
    })
    .catch(err => {console.log(err)});
});

app.use("/admin", adminRoutes);
app.use(userRoutes);
app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize.sync().then(() => {
    return User.findAll({ where: { id: 1 } });
})
.then(users => {
    const user = users[0];
    if(user.length === 0) {
        return User.create({ name: "Andrew", email: "test@test.com" });
    }
    return user;
})
.then(user => {
    return user.createCart();
})
.then(() => { 
    app.listen(3000);
})
.catch(err => {
    console.log(err);
});