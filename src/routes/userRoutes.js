const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

function adminOnly(req, res, next) {
  if (req.user?.userType !== "admin") {
    return res
      .status(403)
      .json({ message: "No autorizado: requiere rol admin." });
  }
  next();
}

// listar usuarios
router.get("/", userController.getUsers);

// modificar perfil propio (usuario autenticado)
router.put("/", authMiddleware, userController.updateUser);

// modificar otro usuario por ID (solo admin)
router.put("/:id", authMiddleware, adminOnly, userController.updateUserById);

// eliminar usuario (borrado logico: state=false solo por el admin)
router.put("/delete/:id", authMiddleware, adminOnly, userController.deleteUser);

// obtener datos del usuario autenticado
router.get("/me", authMiddleware, userController.getCurrentUser);

module.exports = router;
