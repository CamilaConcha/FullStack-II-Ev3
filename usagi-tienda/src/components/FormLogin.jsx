import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../assets/css/login.css';

/**
 * Componente de formulario de login
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onSuccess - Función a ejecutar tras login exitoso
 */
function FormLogin({ onSuccess }) {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(formData);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Credenciales incorrectas. Por favor, intente nuevamente.');
    }
  };

  return (
    <div className="login-form-container">
      <form onSubmit={handleSubmit} className="login-form animate__animated animate__fadeIn">
        {error && (
          <div className="alert alert-danger animate__animated animate__headShake" role="alert">
            {error}
          </div>
        )}
        
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo Electrónico</label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-envelope"></i>
            </span>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="ejemplo@correo.com"
              style={{ transition: 'border-color 0.3s ease' }}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-lock"></i>
            </span>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Ingrese su contraseña"
              style={{ transition: 'border-color 0.3s ease' }}
            />
          </div>
        </div>
        
        <div className="d-grid">
          <button 
            type="submit" 
            className="btn btn-pink-pill btn-login"
            disabled={loading}
            style={{
              transition: 'all 0.3s ease',
              transform: loading ? 'scale(0.98)' : 'scale(1)'
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Iniciando sesión...
              </>
            ) : 'Iniciar Sesión'}
          </button>
        </div>
        
        <div className="mt-3 text-center">
          <a href="#" className="text-decoration-none forgot-password">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </form>
    </div>
  );
}

export default FormLogin;