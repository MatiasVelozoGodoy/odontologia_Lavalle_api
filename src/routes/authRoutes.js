const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login); //auth/login


router.post("/register", authController.register); //auth/register


router.post("/resetPassword", authController.resetPassword); //auth/resetPassword

module.exports = router;
