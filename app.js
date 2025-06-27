const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const expressHandlebars = require("express-handlebars");

const adminData = require("./routes/admin");
const userRoutes = require("./routes/shop");

const app = express();

app.engine("handlebars", expressHandlebars.create({layoutsDir: "views/layouts", defaultLayout: "main"}).engine);
app.set("view engine", "ejs");
app.set("vaews", "views");

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminData.routes);
app.use(userRoutes);
app.use((request, response, next) => {
    response.status(404).render("404", {pageTitle: "Page not found"});
});

app.listen(3000);