import { useState, useEffect, useCallback } from 'react';
import { productAPI } from '../api/xano';

/**
 * Hook personalizado para gestionar productos
 * @returns {Object} Funciones y estados para gestionar productos
 */
export function useProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar todos los productos
  const cargarProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productAPI.getAll();
      setProductos(data);
      return data;
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar productos');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar un producto por ID
  const obtenerProducto = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const producto = await productAPI.getById(id);
      return producto;
    } catch (err) {
      console.error(`Error al obtener producto ${id}:`, err);
      setError(`Error al obtener producto ${id}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar productos por nombre
  const buscarProductos = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const resultados = await productAPI.searchByName(query);
      return resultados;
    } catch (err) {
      console.error('Error al buscar productos:', err);
      setError('Error al buscar productos');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear un nuevo producto
  const crearProducto = useCallback(async (productoData) => {
    setLoading(true);
    setError(null);
    try {
      const nuevoProducto = await productAPI.create(productoData);
      setProductos(prev => [...prev, nuevoProducto]);
      return nuevoProducto;
    } catch (err) {
      console.error('Error al crear producto:', err);
      setError('Error al crear producto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar un producto existente
  const actualizarProducto = useCallback(async (id, productoData) => {
    setLoading(true);
    setError(null);
    try {
      const productoActualizado = await productAPI.update(id, productoData);
      setProductos(prev => 
        prev.map(p => p.id === id ? productoActualizado : p)
      );
      return productoActualizado;
    } catch (err) {
      console.error(`Error al actualizar producto ${id}:`, err);
      setError(`Error al actualizar producto ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar un producto
  const eliminarProducto = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await productAPI.delete(id);
      setProductos(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error(`Error al eliminar producto ${id}:`, err);
      setError(`Error al eliminar producto ${id}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  return {
    productos,
    loading,
    error,
    cargarProductos,
    obtenerProducto,
    buscarProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto
  };
}

export default useProductos;