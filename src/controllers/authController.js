const AuthModel = require("../models/authModel");
const jwt = require("jsonwebtoken");
const { Timestamp } = require("firebase-admin/firestore");
require("dotenv").config();

// 🔹 Convierte string → Timestamp o devuelve null
function parseDate(input) {
  if (!input) return null;
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;
  return Timestamp.fromDate(d);
}

// 🔹 Convierte Timestamp a DD/MM/YYYY
function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return null;
  const date = timestamp.toDate();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// ===================================================
// 🔹 LOGIN
// ===================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Faltan credenciales" });

    const userDoc = await AuthModel.searchUser(email);
    if (!userDoc)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const user = userDoc.data();
    if (password !== user.password)
      return res
        .status(401)
        .json({ message: "Usuario y/o Contraseña incorrecta" });

    const payload = {
      id: userDoc.id,
      email: user.email,
      userType: user.userType,
    };

    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret, { expiresIn: "2h" });

    // 🔹 Conversión de fecha a DD/MM/YYYY
    payload.birthDate = formatDate(user.birthDate);
    payload.communication = user.communication ?? null;
    payload.dni = user.dni ?? null;
    payload.gender = user.gender ?? null;
    payload.insurance = user.insurance ?? null;
    payload.fullName = user.fullName ?? null;
    payload.profilePicture = user.profilePicture ?? null;
    payload.secretQuestion = user.secretQuestion ?? null;
    payload.phone = user.phone ?? null;

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: payload,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al iniciar sesión", error: String(error) });
  }
};

// ===================================================
// 🔹 REGISTER (ya estaba bien, solo verifico)
// ===================================================
const register = async (req, res) => {
  try {
    const {
      birthDate,
      communication,
      dni,
      email,
      gender,
      fullName,
      insurance,
      password,
      profilePicture,
      secretQuestion,
      phone,
    } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email))
      return res.status(400).json({ message: "Email inválido" });

    if (!password || password.length < 4)
      return res
        .status(400)
        .json({ message: "Password inválido (mínimo 4 caracteres)" });

    if (!fullName)
      return res
        .status(400)
        .json({ message: "El nombre completo es obligatorio" });

    const existingUser = await AuthModel.searchUser(email);
    if (existingUser)
      return res.status(400).json({ message: "El email ya está registrado" });

    // ✅ Convertir birthDate a Timestamp
    const newUser = {
      birthDate: parseDate(birthDate),
      communication: communication || null,
      dni: dni || null,
      email,
      gender: gender || null,
      fullName,
      insurance: insurance || null,
      password,
      profilePicture: profilePicture || null,
      userType: "cliente",
      secretQuestion: secretQuestion || null,
      phone: phone || null,
      state: true,
    };

    const docRef = await AuthModel.addUser(newUser);

    return res.status(200).json({
      message: "Usuario registrado correctamente",
      id: docRef.id,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({
      message: "Error al registrar usuario",
      error: String(error),
    });
  }
};

// ===================================================
// 🔹 RESET PASSWORD
// ===================================================
const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Debe proporcionar un email" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Email inválido" });

    const updatedUserId = await AuthModel.resetPassword(email);
    if (!updatedUserId)
      return res
        .status(404)
        .json({ message: "No se encontró un usuario con ese email" });

    return res
      .status(200)
      .json({ message: "Contraseña restablecida correctamente" });
  } catch (error) {
    return res.status(500).json({
      message: "Error al restablecer contraseña",
      error: String(error),
    });
  }
};

module.exports = { login, register, resetPassword };
