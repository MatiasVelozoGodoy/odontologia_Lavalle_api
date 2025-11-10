const { FirebaseFacade: facade } = require("../config/firestoreFacade");

// Obtener stock
const getStock = async (category, model) => {
  try {
    console.log("Obteniendo stock desde Facade...");

    const filters = [{ field: "state", operator: "==", value: true }];

    if (category)
      filters.push({ field: "category", operator: "==", value: category });
    if (model) filters.push({ field: "model", operator: "==", value: model });

    return await facade.getDocuments("stock", filters);
  } catch (error) {
    console.error("Error al obtener stock:", error);
    throw error;
  }
};

// Crear nuevo stock
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

    const result = await facade.createDocument("stock", newItem);
    return {
      isOK: true,
      id: result.id,
      message: "Stock creado correctamente.",
    };
  } catch (error) {
    return {
      isOK: false,
      message: "Error al crear el stock",
      error: error.message,
    };
  }
};

// Actualizar stock existente
const updateStock = async (id, data) => {
  try {
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

    const result = await facade.updateDocument("stock", id, sanitized);

    if (!result.success) return { isOK: false, message: result.message };

    return { isOK: true, message: "Stock actualizado correctamente." };
  } catch (error) {
    return {
      isOK: false,
      message: "Error al actualizar el stock",
      error: error.message,
    };
  }
};

// Eliminación lógica de producto
const deleteStock = async (id) => {
  try {
    const result = await facade.deleteDocument("stock", id);

    if (!result.success) return { isOK: false, message: result.message };

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
