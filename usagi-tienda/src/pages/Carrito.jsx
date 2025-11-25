import { useState, useEffect } from 'react';
import { useCarrito } from '../hooks/useCarrito';
import { Link } from 'react-router-dom';
import { orderAPI, orderProductAPI, authAPI } from '../api/xano';
import logoFallback from '../assets/img/logo-sin-fondo.png';

/**
 * Página del carrito de compras
 */
function Carrito() {
  const { items: cartItems, loading, actualizarCantidad, eliminarItem, vaciarCarrito, calcularTotal } = useCarrito();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Calcular el total del carrito
  const calculateTotal = () => calcularTotal();

  // Actualizar cantidad de un producto
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    actualizarCantidad(id, newQuantity);
  };

  // Eliminar un producto del carrito
  const removeItem = (id) => {
    eliminarItem(id);
  };

  // Vaciar el carrito
  const clearCart = () => {
    vaciarCarrito();
  };

  // Procesar compra (crea orden y order_items, con fallback local)
  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) return;
    setCheckoutLoading(true);
    setCheckoutError('');
    setCheckoutSuccess(false);
    try {
      const total = calculateTotal();
      const itemsCount = cartItems.reduce((sum, i) => sum + (Number(i.cantidad) || 0), 0);
      // Intentar obtener usuario
      let userId = null;
      try {
        const u = await authAPI.getCurrentUser();
        userId = u?.id ?? u?.user?.id ?? null;
      } catch {}

      // Crear orden en backend si está disponible
      let createdOrder = null;
      try {
        const payload = { total, status: 'pendiente', items_count: itemsCount };
        if (userId != null) payload.user_id = userId;
        createdOrder = await orderAPI.create(payload);
      } catch (err) {
        // Fallback local si el endpoint de orden no está disponible
        if (err?.response?.status === 404) {
          const localId = `local_${Date.now()}`;
          try {
            const raw = localStorage.getItem('orders');
            const orders = raw ? JSON.parse(raw) : [];
            orders.push({
              id: localId,
              total,
              status: 'pendiente',
              user_id: userId,
              created_at: new Date().toISOString(),
              items_count: itemsCount,
              items: cartItems.map(i => ({
                product_id: i.product_id,
                quantity: i.cantidad,
                price_at_purchase: i.precio,
              }))
            });
            localStorage.setItem('orders', JSON.stringify(orders));
          } catch {}
          setCheckoutSuccess(true);
          setOrderId(localId);
          vaciarCarrito();
          return;
        }
        throw err;
      }

      const id = createdOrder?.id ?? createdOrder?.data?.id ?? createdOrder?.order?.id;
      // Crear order_items en backend (no bloquear por fallos individuales)
      for (const item of cartItems) {
        try {
          await orderProductAPI.create({
            order_id: id,
            product_id: item.product_id,
            quantity: item.cantidad,
            price_at_purchase: item.precio,
          });
        } catch (_) { }
      }

      setCheckoutSuccess(true);
      setOrderId(id || 'sin_id');
      vaciarCarrito();
    } catch (e) {
      setCheckoutError('No se pudo procesar la compra. Intenta nuevamente.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Carrito de Compras</h1>
      {checkoutError && (
        <div className="alert alert-danger" role="alert">{checkoutError}</div>
      )}
      {checkoutSuccess && (
        <div className="alert alert-success" role="alert">
          ¡Gracias por tu compra! Orden #{String(orderId)} creada.
        </div>
      )}
      
      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <h3>Tu carrito está vacío</h3>
          <p className="mb-4">¿No sabes qué comprar? ¡Miles de productos te esperan!</p>
        <Link to="/catalogo" className="btn btn-pink-pill">Ver Catálogo</Link>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={item.imagen || logoFallback} 
                          alt={item.nombre}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }}
                        />
                        <div>
                          <h6 className="mb-0">{item.nombre}</h6>
                        </div>
                      </div>
                    </td>
                    <td>${item.precio.toFixed(2)}</td>
                    <td>
                      <div className="qty-group">
                        <button 
                          className="btn btn-outline-secondary qty-btn" 
                          type="button"
                          aria-label="Disminuir cantidad"
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        >
                          -
                        </button>
                        <input 
                          type="text" 
                          className="form-control text-center qty-input" 
                          value={item.cantidad}
                          readOnly
                          aria-label={`Cantidad para ${item.nombre}`}
                        />
                        <button 
                          className="btn btn-outline-secondary qty-btn" 
                          type="button"
                          aria-label="Aumentar cantidad"
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>${(item.precio * item.cantidad).toFixed(2)}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => removeItem(item.id)}
                      >
                        <i className="bi bi-trash"></i> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end fw-bold">Total:</td>
                  <td className="fw-bold">${calculateTotal().toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-3">
            <button 
              className="btn btn-outline-secondary"
              onClick={clearCart}
            >
              Vaciar Carrito
            </button>
            <div className="ms-auto cart-total-box">
              <strong>Total:</strong> ${calculateTotal().toFixed(2)}
            </div>
        <button className="btn btn-success" onClick={handleCheckout} disabled={checkoutLoading || cartItems.length === 0}>
          {checkoutLoading ? 'Procesando...' : 'Proceder al Pago'}
        </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Carrito;