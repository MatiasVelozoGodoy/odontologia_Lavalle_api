const Stock = require("../models/stockModel");

/* ESTRUCTURA PARA REGISTRO DE STOCK
{
  product: "Guantes de latex",
  category: "Proteccion",
  quantity: 20,
  price: 18000,
  unit: "Unidades"
}
*/

// Listar stock (opcionalmente filtrando por query)
const getStock = async (req, res) => {
  try {
    const { category, model } = req.query;
    const stock = await Stock.getStock(category, model);
    res.status(200).json(stock);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el stock", error: error.message });
  }
};

// crear nuevo producto
const createStock = async (req, res) => {
  try {
    const result = await Stock.createStock(req.body);
    if (!result.isOK) return res.status(400).json({ message: result.message });
    res.status(201).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear el stock", error: error.message });
  }
};

// actualizar producto por ID
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Stock.updateStock(id, req.body);
    if (!result.isOK) return res.status(400).json({ message: result.message });
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar el stock", error: error.message });
  }
};

// eliminar producto (borrado logico: state=false)
const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Stock.deleteStock(id);
    if (!result.isOK) return res.status(400).json({ message: result.message });
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar el stock", error: error.message });
  }
};

module.exports = {
  getStock,
  createStock,
  updateStock,
  deleteStock,
};
