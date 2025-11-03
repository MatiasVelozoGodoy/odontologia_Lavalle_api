const admin = require("firebase-admin");

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = header.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { id: decoded.uid }; // 🔥 importante
    next();
  } catch (error) {
    console.error("Error de autenticación:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

module.exports = authMiddleware;
