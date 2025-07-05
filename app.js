const path = require("path");
const mongoose = require("mongoose");

const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/shop");

const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGODB_URI = "mongodb://localhost:27017/shop";

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions",
    
});

app.set("view engine", "ejs");
app.set("vaews", "views");

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({secret: "my secret", resave: false, saveUninitialized: false, store: store}));

app.use(authRoutes);
app.use("/admin", adminRoutes);
app.use(userRoutes);
app.use(errorController.get404);

mongoose.connect(MONGODB_URI)
.then(() => {
    app.listen(3000);
})
.catch(err => {
    console.log(err);
});