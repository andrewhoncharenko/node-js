const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");

const User = require("../models/user");
const { buffer } = require("stream/consumers");

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: ""
    }
}));

exports.getLogin = (request, response, next) => {
    let message = request.flash("error");
    if(message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    response.render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: message,
        data: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
};
exports.getSignup = (request,response, next) => {
    let message = request.flash("error");
    if(message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    response.render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errorMessage: message,
        data: { email: "", password: "", confirmPassword: "" },
        validationErrors: []
    });
};
exports.getReset = (request, response, next) => {
    let message = request.flash("error");
    if(message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    response.render("auth/reset", { path: "/reset", pageTitle: "Reset password ", errorMessage: message });
};
exports.getNewPassword = (request, response, next) => {
    const token = request.params.token;

    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() }})
    .then(user => {
        let message = request.flash("error");
        if(message.length > 0) {
            message = message[0];
        }
        else {
            message = null;
        }
        response.render("auth/new-password", {
            path: "/new-password",
            pageTitle: "New password ",
            errorMessage: message,
            userId: user._id.toString(),
            passwordToken: token
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
};
exports.postLogin = (request, response, next) => {
    const loginData = request.body;
    const errors = validationResult(request);
    const messages = errors.array();

    if(!errors.isEmpty()) {
        return response.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: messages[0].msg,
            validationErrors: errors.array(),
            data: {
                email: loginData.email,
                password: loginData.password
            }
        });
    }

    User.findOne({email: loginData.email})
    .then(user => {
        if(!user) {
            return response.status(422).render("auth/login", {
                path: "/login",
                pageTitle: "Login",
                errorMessage: "Invalid email or password",
                validationErrors: [],
                data: {
                    email: loginData.email,
                    password: loginData.password
                }
            });
        }
        bcrypt.compare(loginData.password, user.password)
        .then(match => {
            if(match) {
                request.session.userId = user._id.toString();
                return request.session.save(() => {
                    response.redirect("/");
                });
            }
            return response.status(422).render("auth/login", {
                path: "/login",
                pageTitle: "Login",
                errorMessage: "Invalid email or password",
                validationErrors: [],
                data: {
                    email: loginData.email,
                    password: loginData.password
                }
            });
        })
        .catch(err => {
            console.log(err);
            response.redirect("/login");
        });
        
    });
};
exports.postSignup = (request, response, next) => {
    const email = request.body.email;
    const password = request.body.password;
    const confirmPassword = request.body.confirmPassword;
    const errors = validationResult(request);
    const messages = errors.array();

    if(!errors.isEmpty()) {
        return response.status(422).render(
            "auth/signup",
            {
                path: "/signup",
                pageTitle: "Signup",
                errorMessage: messages[0].msg,
                data: { email: email , password: password, confirmPassword: confirmPassword },
                validationErrors: errors.array()
            }
        );
    }
    bcrypt.hash(password, 12)
    .then(hashedPassword => {
        const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items:[] }
        });
        return user.save();
    })
    .then(() => {
        response.redirect("/login");
        return transporter.sendMail({
            to: email,
            from: "goncharenkoandrew5643@gmail.com",
            subject: "Signup succeeded",
            html: "<h1>You successfully signed up!</h1>"
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
};
exports.postLogout = (request, response, next) => {
    request.session.destroy((err) => {
        console.log(err);
        response.redirect("/");
    });
};
exports.postReset = (request, response, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            return response.redirect("/reset");
        }
        const token = buffer.toString("hex");
        User.findOne({email: request.body.email})
        .then(user => {
            if(!user) {
                request.flash("error", "No account with that email found.");
                return response.redirect("/reset");
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(() => {
            response.redirect("/");
            transporter.sendMail({
                to: request.body.email,
                from: "goncharenkoandrew5643@gmail.com",
                subject: "Password reset",
                html: `
                    <p>You requsted a passwor reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                `
            })
            .then(() => {
                console.log("send");
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                next(error);
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
    });
};
exports.postNewPassword = (request, response, next) => {
    const newPassword = request.body.password;
    const userId = request.body.userId;
    const token = request.body.passwordToken;

    let resetUser;

    User.findOne({resetToken: token, resetTokenExpiration: { $gt: Date.now() }, _id: userId})
    .then(user => {
        console.log(user);
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    })
    .then(passwordHash => {
        resetUser.password = passwordHash;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration= undefined;
        return resetUser.save();
    })
    .then(() => {
        response.redirect("/login")
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
    });
};