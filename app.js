const path = require("path");
const mongoose = require("mongoose");

const express = require("express");
const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/shop");

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("vaews", "views");

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));

app.use((request, response, next) => {
    User.findById("686581b6b006d68b99a1f450")
    .then(user => {
        request.user = user;
        next();
    })
    .catch(err => {console.log(err)});
});

app.use("/admin", adminRoutes);
app.use(userRoutes);
app.use(errorController.get404);

mongoose.connect("mongodb://localhost:27017/shop")
.then((mongoose) => {
    app.listen(3000);
})
.catch(err => {
    console.log(err);
});