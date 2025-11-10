const db = require("../firebase");

// 🔹 Convierte Timestamp a DD/MM/YYYY
function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return null;
  const date = timestamp.toDate();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// 🔹 Obtener lista de usuarios (con filtros opcionales)
const getUsers = async (userType, state) => {
  let query = db.collection("users");
  if (userType) query = query.where("userType", "==", userType);
  if (state !== undefined) query = query.where("state", "==", state);

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    const user = {
      id: doc.id,
      userType: data.userType,
      fullName: data.fullName,
      email: data.email,
      state: data.state,
    };

    if (data.phone) user.phone = data.phone;
    if (data.dni) user.dni = data.dni;
    if (data.gender) user.gender = data.gender;
    if (data.insurance) user.insurance = data.insurance;
    if (data.communication) user.communication = data.communication;
    if (data.birthDate) user.birthDate = formatDate(data.birthDate); // ✅ Conversión
    if (data.profilePicture) user.profilePicture = data.profilePicture;
    if (data.secretQuestion) user.secretQuestion = data.secretQuestion;

    return user;
  });
};

// 🔹 Obtener un usuario por ID
const getUserById = async (id) => {
  try {
    const ref = db.collection("users").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return null;

    const data = snap.data();
    const user = {
      id: snap.id,
      userType: data.userType,
      fullName: data.fullName,
      email: data.email,
      state: data.state,
    };

    if (data.phone) user.phone = data.phone;
    if (data.dni) user.dni = data.dni;
    if (data.gender) user.gender = data.gender;
    if (data.insurance) user.insurance = data.insurance;
    if (data.communication) user.communication = data.communication;
    if (data.birthDate) user.birthDate = formatDate(data.birthDate); // ✅ Conversión
    if (data.profilePicture) user.profilePicture = data.profilePicture;
    if (data.secretQuestion) user.secretQuestion = data.secretQuestion;

    return user;
  } catch {
    return null;
  }
};

// 🔹 Actualizar un usuario por ID (con validación de campos permitidos)
const updateUser = async (id, userData) => {
  try {
    const ref = db.collection("users").doc(id);
    const snap = await ref.get();
    if (!snap.exists)
      return { isOK: false, message: "No se encontró el usuario" };

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

    await ref.update(sanitized);
    return { isOK: true };
  } catch {
    return { isOK: false, message: "Error al actualizar los datos" };
  }
};

// 🔹 Eliminar (lógicamente) un usuario
const deleteUser = async (id) => {
  try {
    const ref = db.collection("users").doc(id);
    const snap = await ref.get();
    if (!snap.exists)
      return { isOK: false, message: "No se encontró el usuario" };

    await ref.update({ state: false });
    return { isOK: true };
  } catch {
    return { isOK: false, message: "Error al eliminar al usuario" };
  }
};

// 🔹 Obtener un usuario por ID
const updateUserById = async (id, userData) => {
  return updateUser(id, userData);
};

// 🔹 Obtener el usuario actual por su UID
const getCurrentUser = async (uid) => {
  try {
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();
    if (!snap.exists) return { isOK: false, message: "Usuario no encontrado" };

    const data = snap.data();
    const user = {
      id: snap.id,
      userType: data.userType,
      fullName: data.fullName,
      email: data.email,
      state: data.state,
    };

    if (data.phone) user.phone = data.phone;
    if (data.dni) user.dni = data.dni;
    if (data.gender) user.gender = data.gender;
    if (data.insurance) user.insurance = data.insurance;
    if (data.communication) user.communication = data.communication;
    if (data.birthDate) user.birthDate = formatDate(data.birthDate); // ✅ Conversión
    if (data.profilePicture) user.profilePicture = data.profilePicture;
    if (data.secretQuestion) user.secretQuestion = data.secretQuestion;

    return { isOK: true, data: user };
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
  getUserById, // ✅ Exportar
};
