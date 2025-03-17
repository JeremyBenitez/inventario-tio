const inventoryModel = require('../models/inventoryModel');

// Función para obtener todos los productos
const getProducts = async (req, res) => {
  try {
    const products = await inventoryModel.getAllProducts();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Función para agregar un nuevo producto
const addProduct = async (req, res) => {
  try {
    const newProduct = req.body;
    const result = await inventoryModel.addProduct(newProduct);
    res.status(201).json({ message: 'Producto agregado', productId: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProducts, addProduct };
