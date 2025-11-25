import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/xano';
import '../assets/css/registro.css';
import logoUsagi from '../assets/img/logo-sin-fondo-2.png';

/**
 * Página de registro de usuarios
 */
function Registro() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      name: (formData?.nombre || '').trim(),
      email: (formData?.email || '').trim(),
      password: formData?.password || ''
    };

    try {
      await authAPI.register(userData);
      if (authAPI.isAuthenticated()) {
        navigate('/perfil');
      } else {
        navigate('/login');
      }
    } catch (error) {
      const message =
        (error && error.message) ||
        (error && error.error) ||
        (error && error.details) ||
        (typeof error === 'string' ? error : null) ||
        'Error al registrar usuario. Por favor, intente nuevamente.';
      setError(message);
      console.error('Error de registro (detalle):', error);
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
                <h2 className="card-title text-center mb-4">Crear Cuenta</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label">Nombre Completo</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
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
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />
                </div>
                
                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-pink-pill"
                    disabled={loading}
                  >
                    {loading ? 'Registrando...' : 'Registrarse'}
                  </button>
                </div>
              </form>
              
              <div className="mt-3 text-center">
                <p>¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a></p>
              </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;