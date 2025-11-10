const UserModel = require("../models/userModel");
const { Timestamp } = require("firebase-admin/firestore");

// 🔹 Convierte DD/MM/YYYY a Timestamp
function parseDateDDMMYYYY(input) {
  if (!input) return null;

  // Si ya es un objeto de fecha válido, convertir a Timestamp
  if (input instanceof Date && !isNaN(input.getTime())) {
    return Timestamp.fromDate(input);
  }

  // Si es formato DD/MM/YYYY
  if (typeof input === "string" && input.includes("/")) {
    const [day, month, year] = input.split("/");
    const date = new Date(`${year}-${month}-${day}T12:00:00`); // mediodía local
    return Timestamp.fromDate(date);
  }

  // Intento genérico
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : Timestamp.fromDate(d);
}

// 🔹 Obtener todos los usuarios (opcionalmente filtrados)
const getUsers = async (req, res) => {
  try {
    const { userType } = req.query;
    const validRoles = ["admin", "cliente"];
    const state =
      req.query.state === "true"
        ? true
        : req.query.state === "false"
        ? false
        : undefined;

    if (userType && !validRoles.includes(userType)) {
      return res
        .status(400)
        .json({ message: "userType no válido (usa 'cliente' o 'admin')" });
    }

    const users = await UserModel.getUsers(userType, state);
    return res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error obteniendo usuarios", error: String(error) });
  }
};

// 🔹 Modificar datos del perfil propio
const updateUser = async (req, res) => {
  try {
    const user = req.user;
    const updates = req.body;

    if (updates.birthDate) {
      updates.birthDate = parseDateDDMMYYYY(updates.birthDate);
    }

    const updated = await UserModel.updateUser(user.id, updates);
    if (!updated.isOK) {
      return res.status(404).json({ message: updated.message });
    }

    return res
      .status(200)
      .json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al actualizar usuario", error: String(error) });
  }
};

// 🔹 Modificar datos de otro usuario (solo admin)
const updateUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    if (req.user.userType !== "admin") {
      return res.status(403).json({
        message:
          "No autorizado: solo administradores pueden actualizar otros usuarios.",
      });
    }

    if ("userType" in updates) delete updates.userType;

    if (updates.birthDate) {
      updates.birthDate = parseDateDDMMYYYY(updates.birthDate);
    }

    const updated = await UserModel.updateUser(id, updates);
    if (!updated.isOK) {
      return res.status(404).json({ message: updated.message });
    }

    return res
      .status(200)
      .json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al actualizar usuario", error: String(error) });
  }
};

// 🔹 Eliminar un usuario (solo admin)
const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    if (req.user.userType !== "admin") {
      return res.status(403).json({
        message:
          "No autorizado: solo administradores pueden eliminar usuarios.",
      });
    }

    const deleted = await UserModel.deleteUser(id);
    if (!deleted.isOK) {
      return res.status(404).json({ message: deleted.message });
    }

    return res
      .status(200)
      .json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error eliminando usuario", error: String(error) });
  }
};

// 🔹 Obtener el usuario actual
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await UserModel.getCurrentUser(userId);

    if (!result.isOK) return res.status(404).json({ message: result.message });

    return res.status(200).json(result.data);
  } catch (error) {
    return res.status(500).json({
      message: "Error obteniendo el usuario actual",
      error: String(error),
    });
  }
};

module.exports = {
  getUsers,
  updateUser,
  updateUserById,
  deleteUser,
  getCurrentUser,
};
