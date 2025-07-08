exports.get404 = (request, response, next) => {
    response.render("404.ejs", {pageTitle: "Page not found", path: "", isAuthenticated: request.session.userId ? true : false});
};
exports.get500 = (request, response, next) => {
    response.render("500.ejs", {pageTitle: "Error", path: "/500", isAuthenticated: request.session.userId ? true : false});
};