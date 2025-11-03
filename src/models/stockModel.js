const db = require("../firebase");

const getStock = async (category, model) => {
  let query = db.collection("stock").where("state", "==", true);

  if (category) query = query.where("category", "==", category);
  if (model) query = query.where("model", "==", model);

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    const stock = {
      id: doc.id,
      product: data.product,
      category: data.category,
      quantity: data.quantity,
      price: data.price,
      unit: data.unit,
      state: data.state,
    };

    if (data.expirationDate) stock.expirationDate = data.expirationDate;

    return stock;
  });
};

const createStock = async (data) => {
  try {
    const required = ["product", "category", "quantity", "price", "unit"];
    for (const field of required) {
      if (!data[field])
        return { isOK: false, message: `El campo "${field}" es obligatorio.` };
    }

    const newItem = {
      product: data.product,
      category: data.category,
      quantity: Number(data.quantity),
      price: Number(data.price),
      unit: data.unit,
      state: true,
    };

    const ref = await db.collection("stock").add(newItem);
    return { isOK: true, id: ref.id, message: "Stock creado correctamente." };
  } catch (error) {
    return {
      isOK: false,
      message: "Error al crear el stock",
      error: error.message,
    };
  }
};

const updateStock = async (id, data) => {
  try {
    const ref = db.collection("stock").doc(id);
    const snap = await ref.get();

    if (!snap.exists)
      return { isOK: false, message: "No se encontró el producto." };

    const allowed = new Set([
      "product",
      "category",
      "quantity",
      "price",
      "unit",
      "state",
    ]);

    const sanitized = {};
    for (const k of Object.keys(data || {})) {
      if (allowed.has(k)) sanitized[k] = data[k];
    }

    if (Object.keys(sanitized).length === 0)
      return { isOK: false, message: "No hay campos válidos para actualizar." };

    sanitized.updatedAt = new Date();

    await ref.update(sanitized);
    return { isOK: true, message: "Stock actualizado correctamente." };
  } catch (error) {
    return {
      isOK: false,
      message: "Error al actualizar el stock",
      error: error.message,
    };
  }
};

const deleteStock = async (id) => {
  try {
    const ref = db.collection("stock").doc(id);
    const snap = await ref.get();

    if (!snap.exists)
      return { isOK: false, message: "No se encontró el producto." };

    await ref.update({ state: false, updatedAt: new Date() });

    return {
      isOK: true,
      message: "Producto eliminado correctamente (borrado lógico).",
    };
  } catch (error) {
    return {
      isOK: false,
      message: "Error al eliminar el producto",
      error: error.message,
    };
  }
};

module.exports = {
  getStock,
  createStock,
  updateStock,
  deleteStock,
};
