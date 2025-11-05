const express = require("express");
const stockController = require("../controllers/stockController");
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

// listar stock (solo por admin)
router.get("/", authMiddleware, adminOnly, stockController.getStock);

// crear nuevo producto (solo por admin)
router.post("/", authMiddleware, adminOnly, stockController.createStock);

// actualizar producto (solo por admin)
router.put("/:id", authMiddleware, adminOnly, stockController.updateStock);

// eliminar producto (borrado logico: state=false, solo por admin)
router.put(
  "/delete/:id",
  authMiddleware,
  adminOnly,
  stockController.deleteStock
);

module.exports = router;
