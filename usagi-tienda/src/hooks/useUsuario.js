import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook personalizado para gestionar datos del usuario
 */
export function useUsuario() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener datos del perfil
  const obtenerPerfil = useCallback(() => {
    return user;
  }, [user]);

  // Actualizar datos del perfil (simulado)
  const actualizarPerfil = useCallback(async (datosActualizados) => {
    setLoading(true);
    setError(null);
    
    try {
      // Aquí iría la llamada real a la API para actualizar el perfil
      console.log('Actualizando perfil con:', datosActualizados);
      
      // Simulamos una respuesta exitosa
      return {
        ...user,
        ...datosActualizados,
        updated_at: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setError('Error al actualizar perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cambiar contraseña (simulado)
  const cambiarPassword = useCallback(async (passwordActual, passwordNueva) => {
    setLoading(true);
    setError(null);
    
    try {
      // Aquí iría la llamada real a la API para cambiar la contraseña
      console.log('Cambiando contraseña');
      
      // Simulamos una respuesta exitosa
      return { success: true, message: 'Contraseña actualizada correctamente' };
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      setError('Error al cambiar contraseña');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading: loading || authLoading,
    error,
    obtenerPerfil,
    actualizarPerfil,
    cambiarPassword
  };
}

export default useUsuario;