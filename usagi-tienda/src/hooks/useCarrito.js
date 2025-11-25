import { useState, useEffect, useCallback } from 'react';
import { cartAPI, cartProductAPI, productAPI } from '../api/xano';

/**
 * Hook para gestionar el carrito usando Xano
 */
export function useCarrito() {
  const [cartId, setCartId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helpers de carrito invitado en localStorage
  const readGuestCart = () => {
    try { return JSON.parse(localStorage.getItem('guest_cart')) || { items: [] }; } catch { return { items: [] }; }
  };
  const writeGuestCart = (items) => {
    try { localStorage.setItem('guest_cart', JSON.stringify({ items })); } catch {}
  };
  const warnOnce = (key, msg) => {
    try {
      const k = `warn_${key}`;
      if (localStorage.getItem(k) === '1') return;
      console.warn(msg);
      localStorage.setItem(k, '1');
    } catch {
      console.warn(msg);
    }
  };

  // Inicializar carrito: obtener o crear y cargar items
  const inicializarCarrito = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let id = localStorage.getItem('cart_id');
      if (!id) {
        const cartApiDisabled = localStorage.getItem('no_cart_api') === '1';
        if (cartApiDisabled) {
          id = 'guest';
          warnOnce('no_cart_api', 'Fallo crear carrito API, uso invitado: 404');
        } else {
          try {
            const nuevo = await cartAPI.create({ status: 'active' });
            id = nuevo?.id;
            localStorage.setItem('cart_id', id);
          } catch (e) {
            warnOnce('no_cart_api', `Fallo crear carrito API, uso invitado: ${e?.response?.status}`);
            id = 'guest';
          }
        }
      }
      setCartId(id);
      await cargarItems(id);
    } catch (err) {
      console.error('Error al inicializar carrito:', err);
      // Fallback invitado
      const guest = readGuestCart();
      setCartId('guest');
      setItems(guest.items || []);
      setError('Carrito en modo invitado');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar items del carrito desde Xano, enriqueciendo con datos del producto
  const cachedCatalog = () => {
    try { const raw = localStorage.getItem('catalog_cache'); return raw ? (JSON.parse(raw).items || []) : []; } catch { return []; }
  };
  const cargarItems = useCallback(async (id = cartId) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const cartItemApiDisabled = localStorage.getItem('no_cart_product_api') === '1';
      if (id === 'guest' || cartItemApiDisabled) {
        if (cartItemApiDisabled) warnOnce('no_cart_product_api', 'Fallo cargarItems API, uso invitado: 404');
        const guest = readGuestCart();
        setItems(guest.items || []);
        return guest.items || [];
      }
      const todos = await cartProductAPI.getAll();
      const propios = (todos || []).filter((cp) => String(cp.cart_id) === String(id));
      const catalog = cachedCatalog();
      const dict = new Map(catalog.map((p) => [String(p.id), p]));
      const enriquecidos = await Promise.all(
        propios.map(async (cp) => {
          const prodCached = dict.get(String(cp.product_id)) || null;
          let prod = prodCached;
          if (!prod) {
            try { prod = await productAPI.getById(cp.product_id); } catch { prod = null; }
          }
          return {
            id: cp.id,
            cart_id: cp.cart_id,
            product_id: cp.product_id,
            cantidad: cp.quantity ?? cp.cantidad ?? 1,
            nombre: prod?.nombre ?? prod?.name ?? 'Producto',
            precio: prod?.precio ?? prod?.price ?? 0,
            imagen: prod?.imagen ?? prod?.image ?? null,
            stock: prod?.stock ?? prod?.inventory ?? null,
            producto: prod,
          };
        })
      );
      setItems(enriquecidos);
      return enriquecidos;
    } catch (err) {
      warnOnce('no_cart_product_api', `Fallo cargarItems API, uso invitado: ${err?.response?.status}`);
      const guest = readGuestCart();
      setItems(guest.items || []);
      setError('Carrito en modo invitado');
      return guest.items || [];
    } finally {
      setLoading(false);
    }
  }, [cartId]);

  // Añadir producto al carrito
  const agregarAlCarrito = useCallback(async (producto, cantidad = 1) => {
    if (!cartId) await inicializarCarrito();
    const id = cartId || localStorage.getItem('cart_id') || 'guest';
    setLoading(true);
    setError(null);
    try {
      const productApiDisabled = localStorage.getItem('no_cart_product_api') === '1';
      if (id === 'guest' || productApiDisabled) {
        if (productApiDisabled) warnOnce('no_cart_product_api', 'Fallo agregar API, cambio a invitado: 404');
        const guest = readGuestCart();
        const existente = (guest.items || []).find((i) => i.product_id === producto.id);
        if (existente) {
          existente.cantidad = (existente.cantidad || 1) + cantidad;
        } else {
          (guest.items || []).push({
            id: `guest_${producto.id}`,
            cart_id: 'guest',
            product_id: producto.id,
            cantidad,
            nombre: producto?.nombre ?? producto?.name ?? 'Producto',
            precio: producto?.precio ?? producto?.price ?? 0,
            imagen: producto?.imagen ?? producto?.image ?? null,
            producto,
          });
        }
        writeGuestCart(guest.items || []);
        setItems(guest.items || []);
        if (productApiDisabled) setCartId('guest');
        return guest.items || [];
      }
      // API
      const existente = items.find((i) => i.product_id === producto.id);
      if (existente) {
        const nuevaCantidad = (existente.cantidad || 1) + cantidad;
        await cartProductAPI.update(existente.id, { quantity: nuevaCantidad });
      } else {
        await cartProductAPI.create({ cart_id: id, product_id: producto.id, quantity: cantidad });
      }
      const actualizados = await cargarItems(id);
      return actualizados;
    } catch (err) {
      warnOnce('no_cart_product_api', `Fallo agregar API, cambio a invitado: ${err?.response?.status}`);
      // Fallback invitado
      const guest = readGuestCart();
      const existente = (guest.items || []).find((i) => i.product_id === producto.id);
      if (existente) {
        existente.cantidad = (existente.cantidad || 1) + cantidad;
      } else {
        (guest.items || []).push({
          id: `guest_${producto.id}`,
          cart_id: 'guest',
          product_id: producto.id,
          cantidad,
          nombre: producto?.nombre ?? producto?.name ?? 'Producto',
          precio: producto?.precio ?? producto?.price ?? 0,
          imagen: producto?.imagen ?? producto?.image ?? null,
          producto,
        });
      }
      writeGuestCart(guest.items || []);
      setCartId('guest');
      setItems(guest.items || []);
      setError('Carrito en modo invitado');
      return guest.items || [];
    } finally {
      setLoading(false);
    }
  }, [cartId, items, inicializarCarrito, cargarItems]);

  // Actualizar cantidad de un item
  const actualizarCantidad = useCallback(async (itemId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setLoading(true);
    setError(null);
    try {
      const productApiDisabled = localStorage.getItem('no_cart_product_api') === '1';
      if (cartId === 'guest' || productApiDisabled) {
        if (productApiDisabled) warnOnce('no_cart_product_api', 'Fallo actualizar API, modo invitado: 404');
        const guest = readGuestCart();
        const it = (guest.items || []).find((i) => i.id === itemId);
        if (it) it.cantidad = nuevaCantidad;
        writeGuestCart(guest.items || []);
        setItems(guest.items || []);
        if (productApiDisabled) setCartId('guest');
        return;
      }
      await cartProductAPI.update(itemId, { quantity: nuevaCantidad });
      await cargarItems(cartId);
    } catch (err) {
      warnOnce('no_cart_product_api', `Fallo actualizar API, modo invitado: ${err?.response?.status}`);
      const guest = readGuestCart();
      const it = (guest.items || []).find((i) => i.id === itemId);
      if (it) it.cantidad = nuevaCantidad;
      writeGuestCart(guest.items || []);
      setCartId('guest');
      setItems(guest.items || []);
      setError('Carrito en modo invitado');
    } finally {
      setLoading(false);
    }
  }, [cartId, cargarItems]);

  // Eliminar item del carrito
  const eliminarItem = useCallback(async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      const isGuestItem = String(itemId).startsWith('guest_');
      const apiDisabled = localStorage.getItem('no_cart_product_api') === '1';
      if (cartId === 'guest' || isGuestItem || apiDisabled) {
        const guest = readGuestCart();
        const rest = (guest.items || []).filter((i) => i.id !== itemId);
        writeGuestCart(rest);
        setItems(rest);
        return;
      }
      await cartProductAPI.delete(itemId);
      await cargarItems(cartId);
    } catch (err) {
      console.warn('Fallo eliminar API, modo invitado:', err?.response?.status);
      const guest = readGuestCart();
      const rest = (guest.items || []).filter((i) => i.id !== itemId);
      writeGuestCart(rest);
      setCartId('guest');
      setItems(rest);
      setError('Carrito en modo invitado');
    } finally {
      setLoading(false);
    }
  }, [cartId, cargarItems]);

  // Vaciar carrito
  const vaciarCarrito = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiDisabled = localStorage.getItem('no_cart_product_api') === '1';
      if (cartId === 'guest' || apiDisabled) {
        writeGuestCart([]);
        setItems([]);
        return;
      }
      const ids = items.map((i) => i.id);
      for (const id of ids) {
        if (String(id).startsWith('guest_')) continue; // no llamar API para invitados
        try { await cartProductAPI.delete(id); } catch {}
      }
      await cargarItems(cartId);
    } catch (err) {
      console.warn('Fallo vaciar API, modo invitado:', err?.response?.status);
      writeGuestCart([]);
      setCartId('guest');
      setItems([]);
      setError('Carrito en modo invitado');
    } finally {
      setLoading(false);
    }
  }, [items, cartId, cargarItems]);

  // Calcular total
  const calcularTotal = useCallback(() => {
    return items.reduce((total, item) => total + ((item.precio || 0) * (item.cantidad || 1)), 0);
  }, [items]);

  useEffect(() => { inicializarCarrito(); }, [inicializarCarrito]);

  return {
    cartId,
    items,
    loading,
    error,
    inicializarCarrito,
    cargarItems,
    agregarAlCarrito,
    actualizarCantidad,
    eliminarItem,
    vaciarCarrito,
    calcularTotal,
  };
}

export default useCarrito;