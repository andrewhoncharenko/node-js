const path = require("path");
const mongoose = require("mongoose");

const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/shop");

const errorController = require("./controllers/error");

const MONGODB_URI = "mongodb://localhost:27017/shop";

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions",
});
const csrfProtection = csrf({ cookie: true });
const fileStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, "images");
    },
    filename: (request, file, callback) => {
        callback(null, new Date().toISOString() + '-' + file.originalname);
    }
});
const fileFilter = (request, file, callback) => {
    if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        callback(null, true);
    }
    else {
        callback(null, false);
    }
};

app.set("view engine", "ejs");
app.set("vaews", "views");

app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        sameSite: "strict"
    }
}));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // React app's URL
    credentials: true, // Allows the server to send cookies and headers
  })
);
app.use(csrfProtection);
app.use(flash());
app.use((request, response, next) => {
    response.locals.isAuthenticated = request.session.userId;
    response.locals.csrfToken = request.csrfToken();
    next();
});

app.use(authRoutes);
app.use("/admin", adminRoutes);
app.use(userRoutes);
app.use("/500", errorController.get500);
app.use(errorController.get404);
app.use((error, request, response, next) => {
    console.log(error);
    response.redirect("/500");
});

mongoose.connect(MONGODB_URI)
.then(() => {
    app.listen(3000);
})
.catch(err => {
    console.log(err);
});