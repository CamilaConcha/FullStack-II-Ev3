import { useState, useEffect } from 'react';
import { authAPI } from '../api/xano';
import logoFallback from '../assets/img/logo-sin-fondo.png';

/**
 * Página de perfil de usuario
 * Muestra y permite editar información del usuario
 */
function Perfil() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await authAPI.getCurrentUserFresh();
        setUserData(data);
      } catch (error) {
        setError('Error al cargar datos del usuario');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="card">
            <div className="card-header bg-pastel-pink text-white">
              <h2 className="mb-0">Mi Perfil</h2>
            </div>
            <div className="card-body">
              {userData ? (
                <div>
                  <div className="mb-4 text-center">
                    <img 
                      src={userData.avatar || logoFallback} 
                      alt="Avatar" 
                      className="rounded-circle"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <h5>Nombre</h5>
                      <p>{userData.nombre || userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim()}</p>
                    </div>
                    <div className="col-md-6">
                      <h5>Email</h5>
                      <p>{userData.email}</p>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <h5>Fecha de registro</h5>
                      <p>{new Date(userData.created_at || userData.createdAt || userData.created || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div className="col-md-6">
                      <h5>Rol</h5>
                      <p>{(() => {
                        const raw =
                          userData.role ??
                          userData.Role ??
                          userData.rol ??
                          userData.user_role ??
                          userData.user?.role ??
                          userData.auth?.role ??
                          (Array.isArray(userData.roles) ? userData.roles[0]?.name ?? userData.roles[0] : null) ??
                          (Array.isArray(userData.user?.roles) ? userData.user.roles[0]?.name ?? userData.user.roles[0] : null) ??
                          userData.type ??
                          userData.user?.type ??
                          (userData.is_admin || userData.isAdmin || userData.user?.is_admin || userData.user?.isAdmin ? 'admin' : null);
                        const r = typeof raw === 'string' ? raw.toLowerCase().trim() : (raw && typeof raw === 'object' && raw.name ? String(raw.name).toLowerCase().trim() : null);
                        return r === 'admin' ? 'admin' : (r || 'Usuario');
                      })()}</p>
                    </div>
                  </div>
                  
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button className="btn btn-pink-pill">
                      Editar Perfil
                    </button>
                    <button className="btn btn-outline-danger">
                      Cambiar Contraseña
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center">No se encontraron datos del usuario</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Perfil;