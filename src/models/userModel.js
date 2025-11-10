const { FirebaseFacade: facade } = require("../config/firestoreFacade");

// Obtener lista de usuarios (con filtros opcionales)
const getUsers = async (userType, state) => {
  const filters = [];

  if (userType)
    filters.push({ field: "userType", operator: "==", value: userType });
  if (state !== undefined)
    filters.push({ field: "state", operator: "==", value: state });

  const users = await facade.getDocuments("users", filters);

  return users.map((user) => facade.formatDatesInDocument(user, ["birthDate"]));
};

// Obtener un usuario por ID
const getUserById = async (id) => {
  try {
    const user = await facade.getDocumentById("users", id);
    if (!user) return null;

    return facade.formatDatesInDocument(user, ["birthDate"]);
  } catch {
    return null;
  }
};

// Actualizar un usuario por ID
const updateUser = async (id, userData) => {
  try {
    const allowed = new Set([
      "communication",
      "dni",
      "email",
      "gender",
      "insurance",
      "fullName",
      "password",
      "profilePicture",
      "secretQuestion",
      "phone",
      "state",
      "birthDate",
    ]);

    const sanitized = {};
    for (const k of Object.keys(userData || {})) {
      if (allowed.has(k)) sanitized[k] = userData[k];
    }

    if (Object.keys(sanitized).length === 0)
      return { isOK: false, message: "No hay campos válidos para actualizar" };

    const result = await facade.updateDocument("users", id, sanitized);

    if (!result.success) return { isOK: false, message: result.message };

    return { isOK: true };
  } catch {
    return { isOK: false, message: "Error al actualizar los datos" };
  }
};

// Eliminar (lógicamente) un usuario
const deleteUser = async (id) => {
  try {
    const result = await facade.deleteDocument("users", id);

    if (!result.success) return { isOK: false, message: result.message };

    return { isOK: true };
  } catch {
    return { isOK: false, message: "Error al eliminar al usuario" };
  }
};

// Obtener un usuario por ID
const updateUserById = async (id, userData) => {
  return updateUser(id, userData);
};

// Obtener el usuario actual por su UID
const getCurrentUser = async (uid) => {
  try {
    const user = await facade.getDocumentById("users", uid);

    if (!user) return { isOK: false, message: "Usuario no encontrado" };

    const formattedUser = facade.formatDatesInDocument(user, ["birthDate"]);

    return { isOK: true, data: formattedUser };
  } catch {
    return { isOK: false, message: "Error al obtener el usuario actual" };
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
  updateUserById,
  getCurrentUser,
  getUserById,
};
