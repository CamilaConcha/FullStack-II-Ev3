import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/xano';
import '../assets/css/login.css';
import logoUsagi from '../assets/img/logo-sin-fondo-2.png';

/**
 * Página de inicio de sesión
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onLogin - Función para manejar el inicio de sesión exitoso
 */
function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.login(credentials);
      onLogin(); // Actualizar estado de autenticación en App
      navigate('/'); // Redirigir a la página principal
    } catch (error) {
      setError('Credenciales inválidas. Por favor, intente nuevamente.');
      console.error('Error de inicio de sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 auth-page">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <fieldset className="auth-fieldset">
                <div className="d-flex justify-content-center mb-3">
                  <Link to="/" aria-label="Ir al inicio" className="home-logo-link">
                    <img src={logoUsagi} alt="Inicio" className="home-button-logo" />
                  </Link>
                </div>
                <h2 className="card-title text-center mb-4">Iniciar Sesión</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-pink-pill"
                    disabled={loading}
                  >
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </button>
                </div>
              </form>
              
              <div className="mt-3 text-center">
                <p>¿No tienes una cuenta? <a href="/registro">Regístrate aquí</a></p>
              </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;