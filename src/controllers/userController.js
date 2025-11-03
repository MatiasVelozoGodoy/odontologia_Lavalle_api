const db = require("../firebase");

// ✅ Obtener datos del usuario logueado
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id; // viene del token del authMiddleware
    const ref = db.collection("users").doc(userId);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const data = snap.data();

    return res.status(200).json({
      id: snap.id,
      fullName: data.fullName,
      dni: data.dni || null,
      birthDate: data.birthDate || null,
      gender: data.gender || null,
      email: data.email,
      phone: data.phone || null,
      insurance: data.insurance || null,
    });
  } catch (error) {
    console.error("Error obteniendo usuario actual:", error);
    return res.status(500).json({
      message: "Error obteniendo usuario actual",
      error: String(error),
    });
  }
};

// ✅ Obtener todos los usuarios (solo si lo usás)
const getUsers = async (req, res) => {
  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.get();
    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

// ✅ Actualizar usuario
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const ref = db.collection("users").doc(id);
    await ref.update(data);
    res.status(200).json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar usuario", error: String(error) });
  }
};

// ✅ Eliminar usuario (soft delete)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const ref = db.collection("users").doc(id);
    await ref.update({ state: false });
    res.status(200).json({ message: "Usuario desactivado" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar usuario", error: String(error) });
  }
};

// ✅ Reactivar usuario
const activeUser = async (req, res) => {
  try {
    const { id } = req.params;
    const ref = db.collection("users").doc(id);
    await ref.update({ state: true });
    res.status(200).json({ message: "Usuario reactivado" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al activar usuario", error: String(error) });
  }
};

module.exports = {
  getCurrentUser,
  getUsers,
  updateUser,
  deleteUser,
  activeUser,
};
