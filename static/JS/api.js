// api.js - Archivo para manejar todas las llamadas a la API

const API_BASE_URL = 'http://localhost:3000/inventario';

// Funciones para productos
export const obtenerProductos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/consultar`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

export const obtenerProductoPorId = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/consultar/${id}`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error al obtener producto:', error);
    throw error;
  }
};

export const agregarProducto = async (producto) => {
  try {
    const response = await fetch(`${API_BASE_URL}/agregar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error al agregar producto:', error);
    throw error;
  }
};

export const actualizarProducto = async (id, producto) => {
  try {
    const response = await fetch(`${API_BASE_URL}/actualizar/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};

export const eliminarProducto = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/eliminar/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
};

// Funciones para recepciones
export const registrarRecepcion = async (datosRecepcion) => {
  try {
    const response = await fetch(`${API_BASE_URL}/guardar_recepcion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosRecepcion)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error al registrar recepción:', error);
    throw error;
  }
};

// Funciones para despachos
export const registrarDespacho = async (datosDespacho) => {
  try {
    const response = await fetch(`${API_BASE_URL}/guardar_despacho`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosDespacho)
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error al registrar despacho:', error);
    throw error;
  }
};

// Función para logout
export const cerrarSesion = async () => {
  try {
    const response = await fetch('/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return response;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};