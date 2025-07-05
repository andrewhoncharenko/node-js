exports.get404 = (request, response, next) => {
    response.render("404.ejs", {pageTitle: "Page not found", path: "", isAuthenticated: request.session.userId ? true : false});
};