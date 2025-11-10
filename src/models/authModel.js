const { FirebaseFacade: facade } = require("../config/firestoreFacade");

// Buscar usuario por email
const searchUser = async (email) => {
  try {
    return await facade.findDocumentByField("users", "email", email);
  } catch (error) {
    console.error("Error buscando usuario:", error);
    return null;
  }
};

// Agregar nuevo usuario
const addUser = async (userData) => {
  try {
    return await facade.createDocument("users", userData);
  } catch (error) {
    console.error("Error agregando usuario:", error);
    throw error;
  }
};

// Restablecer contraseña (genera una nueva aleatoria)
const resetPassword = async (email) => {
  try {
    const user = await searchUser(email);
    if (!user) return null;

    const newPassword = Math.random().toString(36).slice(-8);

    await facade.updateDocument("users", user.id, { password: newPassword });

    console.log(`Nueva contraseña para ${email}: ${newPassword}`);
    return user.id;
  } catch (error) {
    console.error("Error restableciendo contraseña:", error);
    return null;
  }
};

module.exports = {
  searchUser,
  addUser,
  resetPassword,
};
