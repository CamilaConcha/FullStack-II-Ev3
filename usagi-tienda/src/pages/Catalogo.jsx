import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../api/xano';
import { useCarrito } from '../hooks/useCarrito';
import logoFallback from '../assets/img/logo-sin-fondo.png';

/**
 * Página de catálogo de productos
 * Muestra todos los productos disponibles con opciones de filtrado
 */
function Catalogo() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { agregarAlCarrito } = useCarrito();
  
  // Cargar productos al montar el componente
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productAPI.getAll();
        setProducts(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);
  
  // Filtrar productos según término de búsqueda
  const filteredProducts = products.filter(product => 
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Manejar búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Catálogo de Productos</h1>
      
      {/* Barra de búsqueda */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="btn btn-pink-pill" type="button">
              Buscar
            </button>
          </div>
        </div>
      </div>
      
      {/* Listado de productos */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="row catalog-grid g-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product.id} className="col-sm-12 col-md-4 mb-4">
                <div className="card h-100 catalog-card img-hover-zoom">
                  <div className="catalog-img">
                    <img 
                      src={product.imagen || logoFallback} 
                      alt={product.nombre} 
                      loading="lazy"
                    />
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{product.nombre}</h5>
                    <p className="card-text text-muted">{product.descripcion}</p>
                    <p className="card-text fw-bold">${product.precio}</p>
                    <div className="catalog-actions mt-auto">
                      <Link to={`/producto/${product.id}`} className="btn btn-pink-pill">
                        Ver Detalles
                      </Link>
                      <button className="btn btn-pink-pill" onClick={() => agregarAlCarrito(product, 1)}>
                        Añadir al Carrito
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <p>No se encontraron productos que coincidan con la búsqueda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Catalogo;