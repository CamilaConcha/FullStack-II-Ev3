import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, orderProductAPI, authAPI } from '../api/xano';

/**
 * Página "Mis Compras"
 * Lista pedidos realizados. Combina backend y fallback local.
 */
function MisCompras() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  // Utilidad: convertir distintos formatos de fecha a timestamp (ms)
  const toTimestamp = (raw) => {
    if (raw == null) return 0;
    if (typeof raw === 'number') {
      // soporta epoch en segundos o milisegundos
      return raw < 1e12 ? raw * 1000 : raw;
    }
    const t = new Date(raw).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError('');
      try {
        // Intentar obtener usuario actual (perfil fresco)
        let uid = null;
        try {
          const u = await authAPI.getCurrentUserFresh();
          uid = u?.id ?? u?.user?.id ?? null;
          setUserId(uid);
        } catch (_) {
          // usuario no autenticado o no disponible
        }

        // Backend orders
        let backendOrders = [];
        try {
          const data = await orderAPI.getAll();
          // data puede ser array directo o envuelto
          backendOrders = Array.isArray(data)
            ? data
            : (Array.isArray(data?.data) ? data.data : []);
        } catch (e) {
          // Si falla, se mostrará solo local
        }

        // Filtrar por usuario si disponible (usar uid local para evitar race con setState)
        if (uid != null) {
          backendOrders = backendOrders.filter(o => (o?.user_id ?? o?.user?.id) === uid);
        }

        // Local orders (fallback usado en checkout)
        let localOrders = [];
        try {
          const raw = localStorage.getItem('orders');
          const parsed = raw ? JSON.parse(raw) : [];
          localOrders = Array.isArray(parsed) ? parsed : [];
        } catch (_) {}

        // Filtrar locales por usuario si está logueado, o dejar todas si no
        if (uid != null) {
          localOrders = localOrders.filter(o => (o?.user_id ?? null) === uid);
        }

        // Construir conteos de ítems para órdenes del backend (si existe /order_item)
        const itemCounts = new Map();
        try {
          const itemsResp = await orderProductAPI.getAll();
          const itemsArr = Array.isArray(itemsResp) ? itemsResp : (Array.isArray(itemsResp?.data) ? itemsResp.data : []);
          for (const it of itemsArr) {
            const oid = it?.order_id ?? it?.order?.id ?? it?.orderId;
            const qty = Number(it?.quantity) || 1;
            if (oid != null) itemCounts.set(oid, (itemCounts.get(oid) ?? 0) + qty);
          }
        } catch (_) {
          // Si no existe el endpoint, dejamos itemsCount en null para backend
        }

        // Normalizar y combinar
        const normalize = (order, origin) => ({
          id: order?.id ?? order?.order?.id ?? 'sin_id',
          total: order?.total ?? order?.amount ?? 0,
          status: order?.status ?? 'pendiente',
          origin,
          itemsCount: origin === 'backend'
            ? (itemCounts.get(order?.id ?? order?.order?.id) ?? (order?.items_count ?? null))
            : (Array.isArray(order?.items) ? order.items.length : (order?.items_count ?? null)),
          created_at: order?.created_at ?? order?.createdAt ?? null,
        });

        const combined = [
          ...backendOrders.map(o => normalize(o, 'backend')),
          ...localOrders.map(o => normalize(o, 'local')),
        ];

        // Ordenar por fecha desc y luego por ID desc (num si posible)
        combined.sort((a, b) => {
          const ta = toTimestamp(a.created_at);
          const tb = toTimestamp(b.created_at);
          if (tb !== ta) return tb - ta;
          const na = Number(a.id), nb = Number(b.id);
          const bothNum = Number.isFinite(na) && Number.isFinite(nb);
          return bothNum ? (nb - na) : String(b.id).localeCompare(String(a.id));
        });

        setOrders(combined);
      } catch (e) {
        setError('No se pudieron cargar tus compras.');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
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

  // Acción mínima: aprobar/rechazar (backend si existe, localStorage si no)
  const setOrderStatus = async (order, status) => {
    try {
      await orderAPI.update(order.id, { status });
    } catch (_) {
      try {
        const raw = localStorage.getItem('orders');
        const arr = raw ? JSON.parse(raw) : [];
        const idx = arr.findIndex(o => String(o.id) === String(order.id));
        if (idx >= 0) {
          arr[idx].status = status;
          localStorage.setItem('orders', JSON.stringify(arr));
        }
      } catch {}
    } finally {
      // Refresca la UI sin recargar
      setOrders(prev => prev.map(x => (String(x.id) === String(order.id) ? { ...x, status } : x)));
    }
  };

  const handleSort = (field) => {
    const newDir = (sortField === field) ? (sortDir === 'asc' ? 'desc' : 'asc') : 'desc';
    setSortField(field);
    setSortDir(newDir);
    setOrders(prev => {
      const arr = [...prev];
      arr.sort((a, b) => {
        if (field === 'created_at') {
          const ta = toTimestamp(a.created_at);
          const tb = toTimestamp(b.created_at);
          return newDir === 'asc' ? ta - tb : tb - ta;
        }
        // id string compare
        const na = Number(a.id), nb = Number(b.id);
        const bothNum = Number.isFinite(na) && Number.isFinite(nb);
        if (bothNum) return newDir === 'asc' ? na - nb : nb - na;
        return newDir === 'asc'
          ? String(a.id).localeCompare(String(b.id))
          : String(b.id).localeCompare(String(a.id));
      });
      return arr;
    });
  };

  const sortIcon = (field) => (sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '');

  return (
    <div className="container py-5">
      <h1 className="mb-4">Mis Compras</h1>
      {error && (
        <div className="alert alert-danger" role="alert">{error}</div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <h3>No tienes compras registradas</h3>
          <p className="mb-4">Explora el catálogo y realiza tu primera compra.</p>
        <Link to="/catalogo" className="btn btn-pink-pill">Ver Catálogo</Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th role="button" style={{cursor:'pointer'}} onClick={() => handleSort('id')}># Orden {sortIcon('id')}</th>
                <th>Estado</th>
                <th role="button" style={{cursor:'pointer'}} onClick={() => handleSort('created_at')}>Fecha {sortIcon('created_at')}</th>
                <th>Total</th>
                <th>Ítems</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const statusClass =
                  (o.status === 'aceptado' || o.status === 'paid') ? 'bg-success' :
                  (o.status === 'rechazado') ? 'bg-danger' :
                  'bg-warning text-dark';
                const t = toTimestamp(o.created_at);
                const fecha = t ? new Date(t).toLocaleDateString() : '-';
                return (
                  <tr key={`order_${o.id}`}>
                    <td>{String(o.id)}</td>
                    <td><span className={`badge ${statusClass}`}>{o.status}</span></td>
                    <td>{fecha}</td>
                    <td>${Number(o.total || 0).toFixed(2)}</td>
                    <td>{o.itemsCount != null ? o.itemsCount : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MisCompras;