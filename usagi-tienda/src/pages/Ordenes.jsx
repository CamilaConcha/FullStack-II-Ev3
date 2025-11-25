import { useState, useEffect } from 'react';
import { orderAPI } from '../api/xano';

function Ordenes() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  // Utilidad: convertir distintos formatos de fecha a timestamp (ms)
  const toTimestamp = (raw) => {
    if (raw == null) return 0;
    if (typeof raw === 'number') {
      return raw < 1e12 ? raw * 1000 : raw;
    }
    const t = new Date(raw).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      // Backend
      let backend = [];
      try {
        const data = await orderAPI.getAll();
        backend = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      } catch (_) {}
      // Local
      let local = [];
      try {
        const raw = localStorage.getItem('orders');
        local = raw ? JSON.parse(raw) : [];
      } catch (_) {}
      const combined = [
        ...backend.map(o => ({ ...o, origin: 'backend' })),
        ...local.map(o => ({ ...o, origin: 'local' })),
      ];
      setOrders(combined);
    } catch (_) {
      setError('No se pudieron cargar órdenes.');
    } finally {
      setLoading(false);
    }
  };

  const setOrderStatus = async (order, status) => {
    try {
      await orderAPI.update(order.id, { status });
    } catch (err) {
      // Fallback local: actualizar almacenamiento local si el backend falla
      try {
        const raw = localStorage.getItem('orders');
        const arr = raw ? JSON.parse(raw) : [];
        const idx = arr.findIndex(o => String(o.id) === String(order.id));
        if (idx >= 0) {
          arr[idx].status = status;
          localStorage.setItem('orders', JSON.stringify(arr));
        }
      } catch (_) {}
    } finally {
      loadOrders();
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
          const ta = toTimestamp(a.created_at || a.createdAt || a.created);
          const tb = toTimestamp(b.created_at || b.createdAt || b.created);
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
      <h1 className="mb-4">Órdenes</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th role="button" style={{cursor:'pointer'}} onClick={() => handleSort('id')}>ID {sortIcon('id')}</th>
                <th>Estado</th>
                <th role="button" style={{cursor:'pointer'}} onClick={() => handleSort('created_at')}>Fecha {sortIcon('created_at')}</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? orders.map(o => {
                const t = toTimestamp(o.created_at || o.createdAt || o.created);
                const fechaStr = t ? new Date(t).toLocaleDateString() : '-';
                return (
                  <tr key={`orden_${o.id}`}>
                    <td>{String(o.id)}</td>
                    <td>{o.status}</td>
                    <td>{fechaStr}</td>
                    <td>${Number(o.total || 0).toFixed(2)}</td>
                    <td className="d-flex gap-2">
                      <button className="btn btn-sm btn-success" onClick={() => setOrderStatus(o, 'aceptado')}>Aprobar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => setOrderStatus(o, 'rechazado')}>Rechazar</button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="5" className="text-center">No hay órdenes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Ordenes;