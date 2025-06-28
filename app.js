const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/shop");

const errorCOntroller = require("./controllers/error");

const app = express();

app.set("view engine", "ejs");
app.set("vaews", "views");

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(userRoutes);
app.use(errorCOntroller.get404);

app.listen(3000);