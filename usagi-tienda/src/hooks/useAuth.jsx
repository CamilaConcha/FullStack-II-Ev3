import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../api/xano';

// Crear contexto de autenticación
const AuthContext = createContext();

// Proveedor de autenticación
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay un usuario autenticado al cargar
  // Dentro de useEffect checkAuth()
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authAPI.isAuthenticated()) {
          const userData = await authAPI.getCurrentUserFresh();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error al verificar autenticación:', err);
        setError('Error al verificar autenticación');
        // No cerrar sesión automáticamente aquí
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Función de login
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      // Realiza el login para guardar el token
      await authAPI.login(credentials);
      // Carga el perfil inmediatamente después del login (sin caché)
      const profile = await authAPI.getCurrentUserFresh();
      setUser(profile);
      return profile;
    } catch (err) {
      console.error('Error de login:', err);
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función de registro
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authAPI.register(userData);
      // Si el registro devuelve y guarda el token, cargar el perfil
      try {
        if (authAPI.isAuthenticated()) {
          const profile = await authAPI.getCurrentUserFresh();
          setUser(profile);
        }
      } catch (e) {
        console.error('Error al cargar perfil tras registro:', e);
      }
      return result;
    } catch (err) {
      console.error('Error de registro:', err);
      setError(err.message || 'Error al registrar usuario');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función de logout
  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  // Valor del contexto
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

export default useAuth;