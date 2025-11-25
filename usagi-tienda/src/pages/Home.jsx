import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../api/xano';
import logoUsagi from '../assets/img/logo-sin-fondo-2.png';
import logoFallback from '../assets/img/logo-sin-fondo.png';

/**
 * Página principal de la tienda
 * Muestra productos destacados y secciones promocionales
 */
function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar productos destacados al montar el componente
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await productAPI.getAll();
        // Tomamos los primeros 4 productos como destacados
        setFeaturedProducts(products.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar productos destacados:', error);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <main>
      {/* Banner principal */}
      <section className="hero-banner py-5">
        <div className="container hero-content">
          <div className="row align-items-center justify-content-between">
            <div className="col-md-6 mb-4 mb-md-0">
              <h1 className="display-5 hero-title">Bienvenido a Usagishop</h1>
              <p className="lead hero-subtitle">Colecciones seleccionadas y ofertas cada semana.</p>
              <Link to="/catalogo" className="btn btn-pink-pill btn-lg">
                Ver Catálogo
              </Link>
            </div>
            <div className="col-md-5 text-md-end text-center">
              <img 
                src={logoUsagi} 
                alt="Logo" 
                className="floating-logo" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sección de productos destacados */}
      <section className="featured-products py-5">
        <div className="container">
          <h2 className="text-center mb-4">Productos Destacados</h2>
          
          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <div className="row">
              {featuredProducts.map(product => (
                <div key={product.id} className="col-md-3 mb-4">
                  <div className="card h-100 img-hover-zoom featured-card">
                    <div className="featured-img">
                      <img 
                        src={product.imagen || logoFallback} 
                        alt={product.nombre} 
                        loading="lazy"
                      />
                    </div>
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{product.nombre}</h5>
                      <p className="card-text">{product.descripcion}</p>
                      <p className="card-text fw-bold">${product.precio}</p>
                      <Link to={`/producto/${product.id}`} className="btn btn-pink-pill btn-animated mt-auto">
                        Ver Detalles
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sección de categorías */}
      <section className="categories py-5" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="container">
          <h2 className="text-center mb-4">Nuestras Categorías</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card categoria-block-main">
                <div className="card-body text-center">
                  <h3>Mini Figure</h3>
                  <p>Figuras kawaii coleccionables y designer toys</p>
                  <Link to="/catalogo" className="btn btn-pink-pill btn-animated">
                    Explorar
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card categoria-block-main">
                <div className="card-body text-center">
                  <h3>Blindbox</h3>
                  <p>Series sorpresa POP MART, Tokidoki y Sanrio</p>
                  <Link to="/catalogo" className="btn btn-pink-pill btn-animated">
                    Explorar
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card categoria-block-main">
                <div className="card-body text-center">
                  <h3>Chibi Figures</h3>
                  <p>Mini figuras chibi, capsule toys y gashapon</p>
                  <Link to="/catalogo" className="btn btn-pink-pill btn-animated">
                    Explorar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;