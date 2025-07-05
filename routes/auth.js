const express = require("express");

const authControler = require("../controllers/auth");

const router = express.Router();

router.get("/login", authControler.getLogin);
router.post("/login", authControler.postLogin);
router.post("/logout", authControler.postLogout);

module.exports = router;