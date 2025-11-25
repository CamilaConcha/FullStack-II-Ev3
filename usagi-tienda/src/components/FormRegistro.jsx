import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../assets/css/registro.css';

/**
 * Componente de formulario de registro
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onSuccess - Función a ejecutar tras registro exitoso
 */
function FormRegistro({ onSuccess }) {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Avanzar al siguiente paso
  const nextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.nombre || !formData.email) {
        setError('Por favor complete todos los campos');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  // Volver al paso anterior
  const prevStep = () => {
    setStep(1);
    setError('');
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const { confirmPassword, nombre, email, password } = formData;
      const [first, ...rest] = (nombre || '').trim().split(/\s+/);
      const userData = {
        email,
        password,
        first_name: first || nombre,
        // Enviar siempre last_name: si no hay segundo nombre, usa el primero
        last_name: rest.join(' ') || first || nombre || 'N/A',
        // Asegurar envío de shipping_address si Xano lo requiere
        shipping_address: 'N/A',
        // Asegurar envío de phone si Xano lo requiere
        phone: 'N/A'
      };

      await register(userData);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Error al registrar usuario. Por favor, intente nuevamente.');
    }
  };

  return (
    <div className="registro-form-container">
      <form className="registro-form animate__animated animate__fadeIn">
        {error && (
          <div className="alert alert-danger animate__animated animate__headShake" role="alert">
            {error}
          </div>
        )}

        {step === 1 ? (
          <>
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label">Nombre Completo</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese su nombre completo"
                  style={{ transition: 'border-color 0.3s ease' }}
                />
              </div>
            </div>

            <div className="mb-4">
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

            <div className="d-grid">
              <button
                onClick={nextStep}
                className="btn btn-pink-pill btn-registro"
                style={{ transition: 'all 0.3s ease' }}
              >
                Continuar <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3">
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
                  minLength="6"
                  placeholder="Mínimo 6 caracteres"
                  style={{ transition: 'border-color 0.3s ease' }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock-fill"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                  placeholder="Repita su contraseña"
                  style={{ transition: 'border-color 0.3s ease' }}
                />
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-outline-secondary flex-grow-1"
                style={{ transition: 'all 0.3s ease' }}
              >
                <i className="bi bi-arrow-left me-1"></i> Volver
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="btn btn-pink-pill flex-grow-1 btn-registro"
                disabled={loading}
                style={{
                  transition: 'all 0.3s ease',
                  transform: loading ? 'scale(0.98)' : 'scale(1)'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Registrando...
                  </>
                ) : 'Registrarse'}
              </button>
            </div>
          </>
        )}

        <div className="mt-3 text-center">
          <p>¿Ya tienes una cuenta? <a href="/login" className="text-decoration-none">Inicia sesión aquí</a></p>
        </div>
      </form>
    </div>
  );
}

export default FormRegistro;