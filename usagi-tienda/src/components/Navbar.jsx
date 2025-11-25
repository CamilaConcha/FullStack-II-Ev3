import { Link } from 'react-router-dom';
import logoUsagi from '../assets/img/logo-sin-fondo-2.png';

/**
 * Componente de navegación principal
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isLoggedIn - Estado de autenticación del usuario
 * @param {Function} props.onLogout - Función para cerrar sesión
 */
function Navbar({ isLoggedIn, onLogout, isAdmin }) { // pertenece a <mcsymbol name="Navbar" filename="Navbar.jsx" path="c:\Users\basti\OneDrive\Escritorio\usagi-vite+react\usagi-tienda\src\components\Navbar.jsx" startline="9" type="function"></mcsymbol>
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/" aria-label="Ir al inicio">
          <img src={logoUsagi} alt="Logo Usagi" height="40" />
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/catalogo">Catálogo</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contacto">Contacto</Link>
            </li>
            {isLoggedIn && isAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">Gestión de Productos</Link>
              </li>
            )}
            {isLoggedIn && isAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/ordenes">Órdenes</Link>
              </li>
            )}
          </ul>
          
          <div className="d-flex">
            {isLoggedIn ? (
              <>
                <Link className="btn btn-outline-secondary me-2" to="/mis-compras">
                  Mis Compras
                </Link>
                <Link className="btn btn-outline-primary me-2" to="/perfil">
                  Mi Perfil
                </Link>
                <button 
                  className="btn btn-outline-danger" 
                  onClick={onLogout}
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-pink-pill me-2" to="/login">
                  Iniciar Sesión
                </Link>
                <Link className="btn btn-pink-pill" to="/registro">
                  Registrarse
                </Link>
              </>
            )}
            <Link className="btn btn-outline-success ms-2" to="/carrito">
              <i className="bi bi-cart"></i> Carrito
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;