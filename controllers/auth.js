const User = require("../models/user");

exports.getLogin = (request, response, next) => {
    response.render("auth/login", { path: "/login", pageTitle: "Login", isAuthenticated: request.session.userId ? true : false });
};
exports.postLogin = (request, response, next) => {
    const loginData = request.body;
    User.findOne({email: loginData.email}).
    then(user => {
        request.session.userId = user._id.toString();
        request.session.save(() => {
            response.redirect("/");
        });
    });
};
exports.postLogout = (request, response, next) => {
    request.session.destroy((err) => {
        console.log(err);
        response.redirect("/");
    });
};