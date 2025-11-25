import { useState } from 'react';
import { useUsuario } from '../hooks/useUsuario';
import logoFallback from '../assets/img/logo-sin-fondo.png';

/**
 * Componente para mostrar y editar información del perfil de usuario
 */
function PerfilCard() {
  const { user, actualizarPerfil } = useUsuario();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      await actualizarPerfil(formData);
      setMessage({ 
        text: 'Perfil actualizado correctamente', 
        type: 'success' 
      });
      setIsEditing(false);
    } catch (err) {
      setMessage({ 
        text: 'Error al actualizar perfil', 
        type: 'danger' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    setFormData({
      nombre: user?.nombre || '',
      email: user?.email || '',
      telefono: user?.telefono || '',
      direccion: user?.direccion || ''
    });
    setIsEditing(false);
    setMessage({ text: '', type: '' });
  };

  if (!user) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center p-4">
          <p>Debe iniciar sesión para ver su perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm animate__animated animate__fadeIn">
      {message.text && (
        <div className={`alert alert-${message.type} m-3 animate__animated animate__fadeIn`} role="alert">
          {message.text}
        </div>
      )}
      
      <div className="card-body p-4">
        <div className="text-center mb-4">
          <div className="position-relative d-inline-block">
            <img 
              src={user.avatar || logoFallback} 
              alt="Avatar" 
              className="rounded-circle"
              style={{ 
                width: '120px', 
                height: '120px', 
                objectFit: 'cover',
                border: '3px solid #fff',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            />
            {isEditing && (
              <button 
                className="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle"
                style={{ width: '32px', height: '32px', padding: '0' }}
              >
                <i className="bi bi-pencil"></i>
              </button>
            )}
          </div>
          <h4 className="mt-3 mb-0">{user.nombre}</h4>
          <p className="text-muted">{user.email}</p>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label">Nombre completo</label>
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
              <label htmlFor="email" className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
              />
              <div className="form-text">El correo electrónico no se puede cambiar</div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="telefono" className="form-label">Teléfono</label>
              <input
                type="tel"
                className="form-control"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="direccion" className="form-label">Dirección</label>
              <textarea
                className="form-control"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                rows="2"
              ></textarea>
            </div>
            
            <div className="d-flex gap-2 mt-4">
              <button 
                type="button" 
                className="btn btn-outline-secondary flex-grow-1"
                onClick={handleCancel}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary flex-grow-1"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="row mb-3">
              <div className="col-md-6">
                <h6 className="text-muted mb-1">Miembro desde</h6>
                <p>{new Date(user.created_at || Date.now()).toLocaleDateString()}</p>
              </div>
              <div className="col-md-6">
                <h6 className="text-muted mb-1">Rol</h6>
                <p>{user.role || 'Usuario'}</p>
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <h6 className="text-muted mb-1">Teléfono</h6>
                <p>{user.telefono || 'No especificado'}</p>
              </div>
              <div className="col-md-6">
                <h6 className="text-muted mb-1">Dirección</h6>
                <p>{user.direccion || 'No especificada'}</p>
              </div>
            </div>
            
            <div className="d-grid mt-4">
              <button 
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
                style={{
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Editar perfil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PerfilCard;