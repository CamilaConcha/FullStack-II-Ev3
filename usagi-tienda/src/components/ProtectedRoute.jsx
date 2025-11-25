import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authAPI } from '../api/xano';

/**
 * Componente para proteger rutas que requieren autenticación
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si el usuario está autenticado
 * @returns {React.ReactNode} - Redirección a login o los componentes hijos
 */
function ProtectedRoute({ children, requiredRole }) { // pertenece a <mcsymbol name="ProtectedRoute" filename="ProtectedRoute.jsx" path="c:\Users\basti\OneDrive\Escritorio\usagi-vite+react\usagi-tienda\src\components\ProtectedRoute.jsx" startline="10" type="function"></mcsymbol>
  const isAuthenticated = authAPI.isAuthenticated();

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico, cargar el usuario y validar el rol
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!requiredRole);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!requiredRole) return;
      try {
        const data = await authAPI.getCurrentUserFresh();
        if (active) setUser(data);
      } catch (e) {
        // Si hay error al obtener el usuario, considerar la sesión inválida
        authAPI.logout();
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, [requiredRole]);

  if (requiredRole) {
    if (loading) {
      return (
        <div className="container py-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      );
    }
    const normalizeRole = (u) => {
      const raw =
        u?.role ??
        u?.Role ??
        u?.rol ??
        u?.user_role ??
        u?.user?.role ??
        u?.auth?.role ??
        (Array.isArray(u?.roles) ? u.roles[0]?.name ?? u.roles[0] : null) ??
        (Array.isArray(u?.user?.roles) ? u.user.roles[0]?.name ?? u.user.roles[0] : null) ??
        u?.type ??
        u?.user?.type ??
        (u?.is_admin || u?.isAdmin || u?.user?.is_admin || u?.user?.isAdmin ? 'admin' : null);
      return typeof raw === 'string'
        ? raw.toLowerCase()
        : raw && typeof raw === 'object' && raw.name
        ? String(raw.name).toLowerCase()
        : null;
    };
    const role = normalizeRole(user);
    if (role !== String(requiredRole).toLowerCase()) {
      return <Navigate to="/" replace />;
    }
  }

  // Si está autenticado (y con rol válido si aplica), mostrar los componentes hijos
  return children;
}

export default ProtectedRoute;