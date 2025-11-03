const db = require("../firebase");

const getUsers = async (userType, state) => {
  let query = db.collection("users");
  if (userType) query = query.where("userType", "==", userType);
  if (state !== undefined) query = query.where("state", "==", state);

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    // campos obligatorios
    const user = {
      id: doc.id,
      userType: data.userType,
      fullName: data.fullName,
      email: data.email,
      state: data.state,
    };

    // solo se agregan si realmente existen en el documento
    if (data.phone) user.phone = data.phone;
    if (data.dni) user.dni = data.dni;
    if (data.gender) user.gender = data.gender;
    if (data.insurance) user.insurance = data.insurance;
    if (data.communication) user.communication = data.communication;
    if (data.birthDate) user.birthDate = data.birthDate;
    if (data.profilePicture) user.profilePicture = data.profilePicture;
    if (data.secretQuestion) user.secretQuestion = data.secretQuestion;

    return user;
  });
};

const updateUser = async (id, userData) => {
  try {
    const ref = db.collection("users").doc(id);
    const snap = await ref.get();
    if (!snap.exists)
      return { isOK: false, message: "No se encontró el usuario" };

    const allowed = new Set([
      "fullName",
      "communication",
      "dni",
      "email",
      "gender",
      "insurance",
      "password",
      "profilePicture",
      "secretQuestion",
      "phone",
      "state",
    ]);

    const sanitized = {};
    for (const k of Object.keys(userData || {})) {
      if (allowed.has(k)) sanitized[k] = userData[k];
    }

    if (Object.keys(sanitized).length === 0) {
      return { isOK: false, message: "No hay campos válidos para actualizar" };
    }

    await ref.update(sanitized);
    return { isOK: true };
  } catch {
    return { isOK: false, message: "Error al actualizar los datos" };
  }
};

const deleteUser = async (id) => {
  try {
    const ref = db.collection("users").doc(id);
    const snap = await ref.get();
    if (!snap.exists)
      return { isOK: false, message: "No se encontró el usuario" };

    const ok = await ref.update({ state: false });
    if (!ok) return { isOK: false, message: "Error al eliminar al usuario" };

    return { isOK: true };
  } catch {
    return { isOK: false, message: "Error al eliminar al usuario" };
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
};
