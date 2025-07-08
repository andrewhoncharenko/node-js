const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");
const authControler = require("../controllers/auth");

const router = express.Router();

router.get("/login", authControler.getLogin);
router.post("/login", [
    body("email", "Please enter a valid email.").isEmail().normalizeEmail(),
    body("password", "Please enter a password with only numbers and text and at least 5 characters.").isLength({min: 5}).isAlphanumeric().trim()
], authControler.postLogin);
router.post("/logout", authControler.postLogout);
router.get("/signup", authControler.getSignup);
router.post("/signup", [
    body("email", "Please enter a valid email.").isEmail().custom((value, { req }) => {
    return User.findOne({email: value})
        .then(userData => {
            if(userData) {
                return Promise.reject("E-Mail already existas, please pick a diffent one.");
            }
    });
}).normalizeEmail(), body("password", "Please enter a password with only numbers and text and at least 5 characters.")
.trim()
.isLength({min: 5})
.isAlphanumeric(),
body("confirmPassword").trim().custom((value, { req }) => {;
    if(value !== req.body.password) {
        throw new Error("Passwords have to match!");
    }
    return true;
})],
authControler.postSignup);
router.get("/reset", authControler.getReset);
router.post("/reset", authControler.postReset);
router.get("/reset/:token", authControler.getNewPassword);
router.post("/new-password", authControler.postNewPassword);

module.exports = router;