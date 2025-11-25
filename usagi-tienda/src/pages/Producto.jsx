import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../api/xano';
import { useCarrito } from '../hooks/useCarrito';
import logoFallback from '../assets/img/logo-sin-fondo.png';

/**
 * Página de detalle de producto
 * Muestra información detallada de un producto específico
 */
function Producto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { agregarAlCarrito } = useCarrito();

  // Cargar datos del producto al montar el componente
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await productAPI.getById(id);
        setProduct(data);
      } catch (error) {
        console.error('Error al cargar el producto:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Manejar cambio de cantidad
  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value));
  };

  // Añadir al carrito
  const handleAddToCart = async () => {
    try {
      await agregarAlCarrito(product, quantity);
      alert(`Producto "${product.nombre}" añadido al carrito (${quantity} unidades)`);
    } catch (e) {
      alert('No se pudo añadir al carrito.');
    }
  };

  // Volver al catálogo
  const handleBack = () => {
    navigate('/catalogo');
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

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h2>Producto no encontrado</h2>
        <button className="btn btn-pink-pill mt-3" onClick={handleBack}>
          Volver al Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        {/* Imagen del producto */}
        <div className="col-md-6">
          <img 
            src={product.imagen || logoFallback} 
            alt={product.nombre} 
            className="img-fluid rounded"
          />
        </div>
        
        {/* Información del producto */}
        <div className="col-md-6">
          <h1 className="mb-3">{product.nombre}</h1>
          <p className="lead">{product.descripcion}</p>
          
          <div className="mb-3">
            <h3 className="text-primary">${product.precio}</h3>
            <p className="text-muted">
              Disponibilidad: {product.stock > 0 ? 'En stock' : 'Agotado'}
            </p>
          </div>
          
          {product.stock > 0 && (
            <div className="mb-4">
              <div className="input-group mb-3" style={{ maxWidth: '200px' }}>
                <span className="input-group-text">Cantidad</span>
                <input
                  type="number"
                  className="form-control"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max={product.stock}
                />
              </div>
              
              <button 
                className="btn btn-pink-pill btn-lg"
                onClick={handleAddToCart}
              >
                Añadir al Carrito
              </button>
            </div>
          )}
          
          <button className="btn btn-outline-secondary" onClick={handleBack}>
            Volver al Catálogo
          </button>
        </div>
      </div>
    </div>
  );
}

export default Producto;