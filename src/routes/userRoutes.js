const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// ✅ obtener usuario logueado
router.get("/me", authMiddleware, userController.getCurrentUser);

// ✅ otras rutas (si ya existen)
router.get("/", authMiddleware, userController.getUsers);
router.put("/:id", authMiddleware, userController.updateUser);
router.put("/deleted/:id", authMiddleware, userController.deleteUser);
router.put("/actived/:id", authMiddleware, userController.activeUser);

module.exports = router;
