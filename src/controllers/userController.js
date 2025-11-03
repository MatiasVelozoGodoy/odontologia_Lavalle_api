const UserModel = require("../models/userModel");

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

// modificar datos del perfil propio
const updateUser = async (req, res) => {
  try {
    const user = req.user;
    const updates = req.body;

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

// modificar datos de otro usuario (solo admin)
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

    // impedir que el admin cambie el 'userType' por seguridad
    // si queres permitirlo, quita este bloque
    if ("userType" in updates) delete updates.userType;

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

// eliminar un usuario (solo admin)
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

module.exports = {
  getUsers,
  updateUser,
  updateUserById,
  deleteUser,
};
