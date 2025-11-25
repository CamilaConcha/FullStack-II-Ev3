import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/catalogo.css';
import logoFallback from '../assets/img/logo-sin-fondo.png';

/**
 * Componente para mostrar un producto en formato de tarjeta
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.producto - Datos del producto a mostrar
 * @param {Function} props.onAddToCart - Función para añadir al carrito
 */
function ProductoCard({ producto, onAddToCart }) {
  const [cantidad, setCantidad] = useState(1);
  const [hover, setHover] = useState(false);

  // Manejar cambio de cantidad
  const handleCantidadChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= producto.stock) {
      setCantidad(value);
    }
  };

  // Añadir al carrito
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(producto, cantidad);
    }
  };

  return (
    <div 
      className="producto-card card h-100" 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        transform: hover ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hover ? '0 10px 20px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="position-relative">
        <img 
          src={producto.imagen || logoFallback} 
          className="card-img-top" 
          alt={producto.nombre}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        {producto.descuento > 0 && (
          <div className="position-absolute top-0 end-0 bg-danger text-white px-2 py-1 m-2 rounded">
            {producto.descuento}% OFF
          </div>
        )}
      </div>
      
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{producto.nombre}</h5>
        <p className="card-text text-muted mb-1">{producto.categoria}</p>
        <p className="card-text small mb-3">{producto.descripcion.substring(0, 80)}...</p>
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              {producto.descuento > 0 ? (
                <>
                  <span className="text-decoration-line-through text-muted me-2">
                    ${producto.precio.toFixed(2)}
                  </span>
                  <span className="fw-bold text-danger">
                    ${(producto.precio * (1 - producto.descuento / 100)).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="fw-bold">${producto.precio.toFixed(2)}</span>
              )}
            </div>
            <span className={`badge ${producto.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
              {producto.stock > 0 ? 'En stock' : 'Agotado'}
            </span>
          </div>
          
          <div className="d-flex gap-2">
            <Link 
              to={`/producto/${producto.id}`} 
              className="btn btn-outline-primary flex-grow-1"
              style={{
                transition: 'all 0.2s ease',
                transform: hover ? 'scale(1.03)' : 'scale(1)'
              }}
            >
              Ver detalles
            </Link>
            
            {producto.stock > 0 && (
              <button 
                className="btn btn-pink-pill flex-grow-1"
                onClick={handleAddToCart}
                disabled={producto.stock <= 0}
                style={{
                  transition: 'all 0.2s ease',
                  transform: hover ? 'scale(1.03)' : 'scale(1)'
                }}
              >
                Añadir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductoCard;