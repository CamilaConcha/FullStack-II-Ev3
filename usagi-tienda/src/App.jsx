import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { authAPI } from './api/xano'
import ProtectedRoute from './components/ProtectedRoute'

// Componentes comunes
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Lazy loading de páginas para optimizar rendimiento
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Registro = lazy(() => import('./pages/Registro'))
const Catalogo = lazy(() => import('./pages/Catalogo'))
const Producto = lazy(() => import('./pages/Producto'))
const Carrito = lazy(() => import('./pages/Carrito'))
const Contacto = lazy(() => import('./pages/Contacto'))
const Admin = lazy(() => import('./pages/Admin'))
const Perfil = lazy(() => import('./pages/Perfil'))
const MisCompras = lazy(() => import('./pages/MisCompras'))
const Ordenes = lazy(() => import('./pages/Ordenes'))

// Usamos el componente reutilizable de rutas protegidas desde components

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const location = useLocation()
  const hideNavbar = location.pathname === '/login' || location.pathname === '/registro'
  
  // Verificar estado de autenticación y cargar rol
  useEffect(() => {
    const checkAuth = async () => {
      const auth = authAPI.isAuthenticated()
      setIsLoggedIn(auth)
      if (auth) {
        try {
          const me = await authAPI.getCurrentUserFresh()
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
              (u?.is_admin || u?.isAdmin || u?.user?.is_admin || u?.user?.isAdmin ? 'admin' : null)
            return typeof raw === 'string'
              ? raw.toLowerCase()
              : raw && typeof raw === 'object' && raw.name
              ? String(raw.name).toLowerCase()
              : null
          }
          setUserRole(normalizeRole(me))
        } catch {
          setUserRole(null)
        }
      } else {
        setUserRole(null)
      }
    }
    checkAuth()
  }, [])

  // Función para manejar el login
  const handleLogin = async () => {
    setIsLoggedIn(true)
    try {
      const me = await authAPI.getCurrentUserFresh()
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
          (u?.is_admin || u?.isAdmin || u?.user?.is_admin || u?.user?.isAdmin ? 'admin' : null)
        return typeof raw === 'string'
          ? raw.toLowerCase()
          : raw && typeof raw === 'object' && raw.name
          ? String(raw.name).toLowerCase()
          : null
      }
      setUserRole(normalizeRole(me))
    } catch {
      setUserRole(null)
    }
  }

  // Función para manejar el logout
  const handleLogout = () => {
    authAPI.logout()
    setIsLoggedIn(false)
    setUserRole(null)
  }

  return (
    <div className="app-shell">
      {!hideNavbar && (
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} isAdmin={userRole === 'admin'} />
      )}
      <main className="app-main">
        <Suspense fallback={<div className="container mt-5 text-center">Cargando...</div>}>
          <Routes>
            {/* públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/producto/:id" element={<Producto />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/mis-compras" element={<MisCompras />} />
            <Route path="/contacto" element={<Contacto />} />
            {/* protegidas */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/ordenes" element={
              <ProtectedRoute requiredRole="admin">
                <Ordenes />
              </ProtectedRoute>
            } />
            <Route path="/perfil" element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            } />
            {/* fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
