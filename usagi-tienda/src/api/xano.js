import axios from 'axios';

// URL base de la API de Xano (usa .env y cae al fallback si falta)
const API_URL = import.meta.env.VITE_XANO_BASE_URL ?? 'https://x8ki-letl-twmt.n7.xano.io/api:MJviPDYq';

// Crear una instancia de axios con la URL base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Fuerza el grupo correcto si detecta el incorrecto o falta baseURL
if (!api.defaults.baseURL || !api.defaults.baseURL.includes('api:MJviPDYq')) {
  api.defaults.baseURL = 'https://x8ki-letl-twmt.n7.xano.io/api:MJviPDYq';
}
console.info('[Xano] Base URL efectiva:', api.defaults.baseURL);
if (typeof API_URL === 'string' && API_URL.includes('api:NSMtVtIv')) {
  api.defaults.baseURL = 'https://x8ki-letl-twmt.n7.xano.io/api:MJviPDYq';
}
// Diagnóstico: mostrar en consola la base URL efectiva usada por Axios
try {
  console.info('[Xano] Base URL configurada:', API_URL);
} catch (_) { }

// Interceptor para agregar el token de autenticación a las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Error en la solicitud:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores comunes
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      if (error.response.status === 401) {
        // Dejar la sesión activa; manejar el 401 en la vista
        console.warn('[Xano] 401 recibido; sesión mantenida');
      }
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
    } else {
      // Error al configurar la solicitud
      console.error('Error al configurar la solicitud:', error.message);
    }
    return Promise.reject(error);
  }
);

// Funciones de autenticación
// authAPI.getCurrentUser: usar caché con TTL y backoff
export const authAPI = {
  // Utilidad interna para extraer token de distintas formas de respuesta
  _extractToken(data) {
    try {
      if (!data) return null;
      // Casos comunes
      const direct = data?.token ?? data?.authToken;
      const token = typeof direct === 'string' ? direct : direct?.token;
      if (typeof token === 'string' && token.length > 10) return token;
      // Búsqueda superficial
      for (const key of Object.keys(data)) {
        const val = data[key];
        if (typeof val === 'string' && key.toLowerCase().includes('token') && val.length > 10) {
          return val;
        }
        if (val && typeof val === 'object' && typeof val.token === 'string' && val.token.length > 10) {
          return val.token;
        }
      }
      return null;
    } catch {
      return null;
    }
  },
  // Iniciar sesión
  login: async (credentials) => {
    // Permitir configurar el path vía env y agregar fallbacks si el endpoint difiere
    const normalizePath = (p, dflt) => {
      if (!p) return dflt;
      return p.startsWith('/') ? p : `/${p}`;
    };
    const primaryPath = normalizePath(import.meta.env?.VITE_XANO_LOGIN_PATH, '/auth/login');
    const alternatives = ['/auth_login', '/login', '/user/login', '/users/login'].map((p) => normalizePath(p, '/auth/login'));

    try {
      // Primer intento: formato estándar { email, password }
      const payloadStandard = {
        email: credentials?.email,
        password: credentials?.password,
      };

      const response = await api.post(primaryPath, payloadStandard);
      const token = authAPI._extractToken(response?.data);
      if (token) localStorage.setItem('token', token);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || '';
      const status = error?.response?.status;
      const notFound = status === 404 || (typeof message === 'string' && message.toLowerCase().includes('not found'));
      const needsFieldValue = typeof message === 'string' && message.toLowerCase().includes('field_value');

      // Si el endpoint no existe, probar rutas alternativas con payload estándar
      if (notFound) {
        const payloadStandard = {
          email: credentials?.email,
          password: credentials?.password,
        };
        for (const path of alternatives) {
          try {
            const resp = await api.post(path, payloadStandard);
            const tokenAlt = authAPI._extractToken(resp?.data);
            if (tokenAlt) localStorage.setItem('token', tokenAlt);
            return resp.data;
          } catch (_) {
            // continuar
          }
        }
      }

      // Si el backend exige field_value/field_name, reintentar con ese formato
      if (needsFieldValue && credentials?.email && credentials?.password) {
        const payloadAlt = {
          field_name: 'email',
          field_value: credentials.email,
          password: credentials.password,
        };
        // Intento en path primario
        try {
          const responseAlt = await api.post(primaryPath, payloadAlt);
          const tokenAlt = authAPI._extractToken(responseAlt?.data);
          if (tokenAlt) localStorage.setItem('token', tokenAlt);
          return responseAlt.data;
        } catch (_) {
          // Intentar también en rutas alternativas
          for (const path of alternatives) {
            try {
              const resp = await api.post(path, payloadAlt);
              const tokenAlt = authAPI._extractToken(resp?.data);
              if (tokenAlt) localStorage.setItem('token', tokenAlt);
              return resp.data;
            } catch (_) {
              // continuar
            }
          }
        }
      }
      throw error.response ? error.response.data : error.message;
    }
  },

  // Registrar usuario
  register: async (userData) => {
    const normalizePath = (p) => {
      if (!p) return '/auth/signup';
      return p.startsWith('/') ? p : `/${p}`;
    };
    const primaryPath = normalizePath(import.meta.env?.VITE_XANO_SIGNUP_PATH) || '/auth/signup';
    const alternatives = [
      '/auth_signup',
      '/signup',
      '/user/signup',
      '/users/signup',
      '/user',
      '/users',
      '/user/create',
      '/users/create'
    ].map(normalizePath);

    console.info('[Xano] Signup URL:', `${api.defaults.baseURL}${primaryPath}`);
    console.info('[Xano] Payload (signup):', JSON.stringify(userData));

    try {
      const response = await api.post(primaryPath, userData);
      const token = authAPI._extractToken(response?.data);
      if (token) {
        localStorage.setItem('token', token);
      }
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || error?.message || '';
      const notFound = status === 404 || (typeof msg === 'string' && msg.toLowerCase().includes('not found'));
      if (notFound) {
        for (const path of alternatives) {
          try {
            const resp = await api.post(path, userData);
            const tokenAlt = authAPI._extractToken(resp?.data);
            if (tokenAlt) {
              localStorage.setItem('token', tokenAlt);
            }
            return resp.data;
          } catch (e) {
            // continuar con el siguiente fallback
          }
        }
      }
      throw error.response ? error.response.data : error.message;
    }
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtener datos del usuario actual
  getCurrentUser: async () => {
    const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
    const primaryPath = normalizePath(import.meta.env?.VITE_XANO_ME_PATH, '/auth/me');
    const alternatives = ['/me', '/user/me', '/users/me', '/auth/user', '/user'].map((p) => normalizePath(p, '/auth/me'));
    // Caché local con TTL
    try {
      const raw = localStorage.getItem('me_cache');
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached?.ts && (Date.now() - cached.ts) < ME_TTL_MS && cached?.data) {
          return cached.data;
        }
      }
    } catch {}
    try {
      const response = await withBackoff(() => api.get(primaryPath));
      try { localStorage.setItem('me_cache', JSON.stringify({ ts: Date.now(), data: response.data })); } catch {}
      return response.data;
    } catch (error) {
      // Fallback en alternativas si el principal falla
      for (const path of alternatives) {
        try {
          const resp = await withBackoff(() => api.get(path));
          try { localStorage.setItem('me_cache', JSON.stringify({ ts: Date.now(), data: resp.data })); } catch {}
          return resp.data;
        } catch (_) {}
      }
      throw error.response ? error.response.data : error.message;
    }
  }
  ,
  // Obtener datos del usuario actual sin usar caché (forzar fresco)
  getCurrentUserFresh: async () => {
    const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
    const primaryPath = normalizePath(import.meta.env?.VITE_XANO_ME_PATH, '/auth/me');
    const alternatives = ['/me', '/user/me', '/users/me', '/auth/user', '/user'].map((p) => normalizePath(p, '/auth/me'));
    try {
      const response = await withBackoff(() => api.get(primaryPath));
      try { localStorage.setItem('me_cache', JSON.stringify({ ts: Date.now(), data: response.data })); } catch {}
      return response.data;
    } catch (error) {
      for (const path of alternatives) {
        try {
          const resp = await withBackoff(() => api.get(path));
          try { localStorage.setItem('me_cache', JSON.stringify({ ts: Date.now(), data: resp.data })); } catch {}
          return resp.data;
        } catch (_) {}
      }
      throw error.response ? error.response.data : error.message;
    }
  }
};

// Funciones para gestionar productos
// productAPI: normalización de payload y respuesta
const toBackendProduct = (p = {}) => {
  const n = (v) => {
    if (v === '' || v == null) return null;
    const num = Number(v);
    return Number.isNaN(num) ? null : num;
  };
  // name: usa 'nombre' o 'name'; si queda vacío, envía null
  const name = (() => {
    const raw = p.nombre ?? p.name;
    if (typeof raw === 'string') {
      const t = raw.trim();
      return t || null;
    }
    return raw ?? null;
  })();
  // Enviar imagen como [{ path }] para tipo [image]
  const getPath = () => {
    const d = p?.imagenData;
    const fromData = d?.path || d?.uploaded?.path || d?.data?.path;
    if (fromData) return fromData;
    const url = p?.imagen;
    if (typeof url === 'string' && url) {
      try {
        const u = new URL(url);
        return u.pathname; // ej: /vault/...
      } catch {
        if (url.startsWith('/')) return url; // ya es path
      }
    }
    return null;
  };
  const imgPath = getPath();
  const inferImageName = () => {
    const d = p?.imagenData;
    const n1 = d?.name || d?.file_name || d?.filename;
    if (typeof n1 === 'string' && n1.trim()) return n1.trim();
    const url = p?.imagen;
    if (typeof url === 'string' && url) {
      try {
        const u = new URL(url);
        const last = u.pathname.split('/').filter(Boolean).pop();
        if (last) return last;
      } catch { }
    }
    if (typeof imgPath === 'string' && imgPath) {
      const last = imgPath.split('/').filter(Boolean).pop();
      if (last) return last;
    }
    if (typeof name === 'string' && name.trim()) return `${name.trim()}.jpg`;
    return 'image.jpg';
  };
  // Derivar mime_type y size desde imagenData o inferencia por extensión
  const getMimeType = () => {
    const d = p?.imagenData;
    const m1 = d?.mime_type || d?.mimetype || d?.uploaded?.mime_type || d?.data?.mime_type;
    if (typeof m1 === 'string' && m1.includes('/')) return m1.trim();
    const t = d?.type;
    if (typeof t === 'string' && t.includes('/')) return t.trim();
    const fname = inferImageName();
    const ext = typeof fname === 'string' && fname.includes('.') ? fname.split('.').pop().toLowerCase() : '';
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'bmp':
        return 'image/bmp';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'image/jpeg';
    }
  };
  const getSize = () => {
    const d = p?.imagenData;
    const s = d?.size || d?.file_size || d?.uploaded?.size || d?.data?.size || d?.file?.size;
    if (typeof s === 'number') return s;
    if (typeof s === 'string') {
      const n = Number(s);
      return Number.isNaN(n) ? null : n;
    }
    return null;
  };
  const image = imgPath ? [{
    path: imgPath,
    name: inferImageName(),
    type: 'image',
    meta: { mime: getMimeType(), mime_type: getMimeType(), size: getSize() },
    mime_type: getMimeType(),
    mime: getMimeType(),
    size: getSize()
  }] : null;

  return {
    name,
    nombre: name,
    title: name,
    description: p.descripcion ?? p.description ?? '',
    price: n(p.precio ?? p.price),
    stock: n(p.stock),
    brand: p.marca ?? p.brand ?? null,
    category: p.categoria ?? p.category ?? null,
    // Algunos backends de Xano requieren el campo `type`; mapeamos desde `tipo/categoria` si existe
    type: (() => {
      const raw = p.tipo ?? p.type ?? p.categoria ?? p.category ?? null;
      if (typeof raw === 'string') {
        const t = raw.trim();
        return t || null;
      }
      return raw;
    })(),
    image,
  // Algunos backends esperan size a nivel raíz; lo incluimos por compatibilidad
  size: getSize(),
  };

};

  
  const fromBackendProduct = (r = {}) => {
    const makeImageUrl = (img) => {
      if (!img) return '';
      const origin = (() => {
        try { return new URL(API_URL).origin; } catch { return ''; }
      })();
      if (Array.isArray(img) && img.length) {
        const first = img[0];
        if (first?.url) return first.url;
        if (first?.path && origin) return `${origin}${first.path}`;
      } else if (typeof img === 'object' && img) {
        if (img.url) return img.url;
        if (img.path && origin) return `${origin}${img.path}`;
      } else if (typeof img === 'string') {
        return img;
      }
      return '';
    };
    return {
      id: r.id,
      nombre: r.nombre ?? r.name ?? '',
      descripcion: r.descripcion ?? r.description ?? '',
      precio: r.precio ?? r.price ?? 0,
      stock: r.stock ?? 0,
      imagen: makeImageUrl(r.image ?? r.imagen),
      marca: r.marca ?? r.brand ?? '',
      categoria: r.categoria ?? r.category ?? '',
    };
  };

  // productAPI: añadir backoff y popular caché
  export const productAPI = {
    async getAll() {
      try {
        // 1) Cache en memoria con TTL
        const now = Date.now();
        if (Array.isArray(productMem.catalog) && (now - (productMem.catalogTs || 0) < ME_TTL_MS)) {
          return productMem.catalog;
        }

        // 2) Caché en localStorage con TTL, disparando revalidación en segundo plano
        try {
          const raw = localStorage.getItem('catalog_cache');
          if (raw) {
            const cached = JSON.parse(raw);
            const ts = Number(cached?.ts || 0);
            if (Array.isArray(cached?.items) && (now - ts < ME_TTL_MS)) {
              // Revalidación en background si no hay una solicitud en vuelo
              const key = 'catalog';
              if (!productMem.inflight.has(key)) {
                const p = (async () => {
                  const resBg = await withBackoff(() => api.get('/product'));
                  const dataBg = Array.isArray(resBg.data) ? resBg.data.map(fromBackendProduct) : [];
                  productMem.catalog = dataBg;
                  productMem.catalogTs = Date.now();
                  try {
                    dataBg.forEach((p) => { if (p?.id != null) productMem.byId.set(String(p.id), p); });
                    localStorage.setItem('catalog_cache', JSON.stringify({ ts: Date.now(), items: dataBg }));
                  } catch {}
                })();
                productMem.inflight.set(key, p);
                p.finally(() => { productMem.inflight.delete(key); });
              }
              return cached.items;
            }
          }
        } catch {}

        // 3) Deduplicación de solicitudes en vuelo
        const key = 'catalog';
        if (productMem.inflight.has(key)) {
          return await productMem.inflight.get(key);
        }

        // 4) Solicitud con backoff
        const p = (async () => {
          const res = await withBackoff(() => api.get('/product'));
          const data = Array.isArray(res.data) ? res.data.map(fromBackendProduct) : [];
          productMem.catalog = data;
          productMem.catalogTs = Date.now();
          try {
            data.forEach((p) => { if (p?.id != null) productMem.byId.set(String(p.id), p); });
            localStorage.setItem('catalog_cache', JSON.stringify({ ts: Date.now(), items: data }));
          } catch {}
          return data;
        })();
        productMem.inflight.set(key, p);
        try { return await p; } finally { productMem.inflight.delete(key); }
      } catch (error) {
        console.warn('[Xano] getAll fallback por error:', error?.response?.status, error?.message);
        try {
          const raw = localStorage.getItem('catalog_cache');
          if (raw) {
            const cached = JSON.parse(raw);
            if (Array.isArray(cached?.items)) return cached.items;
          }
        } catch {}
        return [];
      }
    },
    async getById(id) {
      try {
        const cached = getProductFromCache(String(id));
        if (cached) return cached;
        const key = `product:${id}`;
        if (productMem.inflight.has(key)) return productMem.inflight.get(key);
        const p = (async () => {
          const res = await withBackoff(() => api.get(`/product/${id}`));
          const prod = fromBackendProduct(res.data);
          try { if (prod?.id != null) productMem.byId.set(String(prod.id), prod); } catch {}
          return prod;
        })();
        productMem.inflight.set(key, p);
        try { return await p; } finally { productMem.inflight.delete(key); }
      } catch (error) {
        console.warn('[Xano] getById fallback por error:', id, error?.response?.status);
        // Fallback: intentar desde caché general
        try {
          const raw = localStorage.getItem('catalog_cache');
          if (raw) {
            const cached = JSON.parse(raw);
            const hit = (cached?.items || []).find((p) => String(p.id) === String(id));
            if (hit) return hit;
          }
        } catch {}
        throw error.response ? error.response.data : error.message;
      }
    },
    async create(productData) {
      const payload = toBackendProduct(productData);
      console.debug('[Xano] POST /product payload:', payload);
      if (!payload?.name || typeof payload.name !== 'string' || payload.name.trim() === '') {
        console.error('[Xano] Abort POST /product: missing name', { payload });
        throw new Error('Falta el nombre del producto');
      }
      console.debug('[Xano] POST /product payload (string):', JSON.stringify(payload));
      try {
        const res = await api.post('/product', payload);
        return fromBackendProduct(res.data);
      } catch (error) {
        const status = error?.response?.status;
        const data = error?.response?.data;
        console.error('[Xano] Error POST /product', { status, data, payload });
        throw data ?? error.message;
      }
    },
    async update(id, productData) {
      const payload = toBackendProduct(productData);
      console.debug('[Xano] PATCH /product payload:', { id, payload });
      if (!payload?.name || typeof payload.name !== 'string' || payload.name.trim() === '') {
        console.error('[Xano] Abort PATCH /product: missing name', { id, payload });
        throw new Error('Falta el nombre del producto');
      }
      console.debug('[Xano] PATCH /product payload (string):', JSON.stringify({ id, payload }));
      try {
        const res = await api.patch(`/product/${id}`, payload);
        return fromBackendProduct(res.data);
      } catch (error) {
        const status = error?.response?.status;
        const data = error?.response?.data;
        console.error('[Xano] Error PATCH /product', { status, data, id, payload });
        throw data ?? error.message;
      }
    },
    async delete(id) {
      return api.delete(`/product/${id}`);
    },
    async getByCategory(category) {
      const res = await api.get(`/product`, { params: { category } });
      const data = Array.isArray(res.data) ? res.data.map(fromBackendProduct) : [];
      return data;
    },
  };
  // Nota: se eliminaron funciones duplicadas legadas que causaban errores de sintaxis.

  // Funciones para carrito
  export const cartAPI = {
    getAll: async () => {
      const disabled = localStorage.getItem('no_cart_api') === '1';
      if (disabled) throw { response: { status: 404 }, message: 'Cart API disabled' };
      try {
        const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
        const base = normalizePath(import.meta.env?.VITE_XANO_CART_PATH, '/cart');
        const response = await api.get(base);
        return response.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          try { localStorage.setItem('no_cart_api', '1'); } catch {}
          console.warn('[Xano] /cart no disponible (404). Activando modo invitado.');
        }
        throw error;
      }
    },
    getById: async (id) => {
      const disabled = localStorage.getItem('no_cart_api') === '1';
      if (disabled) throw { response: { status: 404 }, message: 'Cart API disabled' };
      try {
        const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
        const base = normalizePath(import.meta.env?.VITE_XANO_CART_PATH, '/cart');
        const response = await api.get(`${base}/${id}`);
        return response.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          try { localStorage.setItem('no_cart_api', '1'); } catch {}
          console.warn('[Xano] /cart/:id no disponible (404). Activando modo invitado.');
        }
        throw error;
      }
    },
    create: async (data) => {
      const disabled = localStorage.getItem('no_cart_api') === '1';
      if (disabled) throw { response: { status: 404 }, message: 'Cart API disabled' };
      try {
        const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
        const base = normalizePath(import.meta.env?.VITE_XANO_CART_PATH, '/cart');
        const response = await api.post(base, data);
        return response.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          try { localStorage.setItem('no_cart_api', '1'); } catch {}
          console.warn('[Xano] POST /cart no disponible (404). Activando modo invitado.');
        }
        throw error;
      }
    },
    update: async (id, data) => {
      const disabled = localStorage.getItem('no_cart_api') === '1';
      if (disabled) throw { response: { status: 404 }, message: 'Cart API disabled' };
      try {
        const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
        const base = normalizePath(import.meta.env?.VITE_XANO_CART_PATH, '/cart');
        const response = await api.patch(`${base}/${id}`, data);
        return response.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          try { localStorage.setItem('no_cart_api', '1'); } catch {}
          console.warn('[Xano] PATCH /cart/:id no disponible (404). Activando modo invitado.');
        }
        throw error;
      }
    },
    delete: async (id) => {
      const disabled = localStorage.getItem('no_cart_api') === '1';
      if (disabled) throw { response: { status: 404 }, message: 'Cart API disabled' };
      try {
        const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
        const base = normalizePath(import.meta.env?.VITE_XANO_CART_PATH, '/cart');
        const response = await api.delete(`${base}/${id}`);
        return response.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          try { localStorage.setItem('no_cart_api', '1'); } catch {}
          console.warn('[Xano] DELETE /cart/:id no disponible (404). Activando modo invitado.');
        }
        throw error;
      }
    }
  };

  // Funciones para productos del carrito
  export const cartProductAPI = {
    getAll: async () => {
      const disabled = localStorage.getItem('no_cart_product_api') === '1';
      if (disabled) throw { response: { status: 404 }, message: 'CartProduct API disabled' };
      try {
        const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
        const base = normalizePath(import.meta.env?.VITE_XANO_CART_ITEM_PATH, '/cart_item');
        const response = await api.get(base);
        try { localStorage.removeItem('no_cart_product_api'); } catch {}
        return response.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          try { localStorage.setItem('no_cart_product_api', '1'); } catch {}
          console.warn('[Xano] /cart_item no disponible (404). Activando modo invitado.');
        }
        throw error;
      }
    },
    getById: async (id) => {
      const disabled = localStorage.getItem('no_cart_product_api') === '1';
      if (disabled) throw { response: { status: 404 }, message: 'CartProduct API disabled' };
      try {
        const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
        const base = normalizePath(import.meta.env?.VITE_XANO_CART_ITEM_PATH, '/cart_item');
        const response = await api.get(`${base}/${id}`);
        try { localStorage.removeItem('no_cart_product_api'); } catch {}
        return response.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          try { localStorage.setItem('no_cart_product_api', '1'); } catch {}
          console.warn('[Xano] /cart_item/:id no disponible (404). Activando modo invitado.');
        }
        throw error;
      }
    },
    create: async (data) => {
      const disabled = localStorage.getItem('no_cart_product_api') === '1';
      if (disabled) throw { response: { status: 404 }, message: 'CartProduct API disabled' };
      try {
        const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
        const base = normalizePath(import.meta.env?.VITE_XANO_CART_ITEM_PATH, '/cart_item');
        const response = await api.post(base, data);
        try { localStorage.removeItem('no_cart_product_api'); } catch {}
        return response.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          try { localStorage.setItem('no_cart_product_api', '1'); } catch {}
          console.warn('[Xano] POST /cart_item no disponible (404). Activando modo invitado.');
        }
        throw error;
      }
    },
    update: async (id, data) => {
      const disabled = localStorage.getItem('no_cart_product_api') === '1';
      if (disabled) throw { response: { status: 404 }, message: 'CartProduct API disabled' };
      try {
        const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
        const base = normalizePath(import.meta.env?.VITE_XANO_CART_ITEM_PATH, '/cart_item');
        const response = await api.patch(`${base}/${id}`, data);
        try { localStorage.removeItem('no_cart_product_api'); } catch {}
        return response.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          try { localStorage.setItem('no_cart_product_api', '1'); } catch {}
          console.warn('[Xano] PATCH /cart_item/:id no disponible (404). Activando modo invitado.');
        }
        throw error;
      }
    },
    delete: async (id) => {
      const disabled = localStorage.getItem('no_cart_product_api') === '1';
      if (disabled) throw { response: { status: 404 }, message: 'CartProduct API disabled' };
      try {
        const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
        const base = normalizePath(import.meta.env?.VITE_XANO_CART_ITEM_PATH, '/cart_item');
        const response = await api.delete(`${base}/${id}`);
        try { localStorage.removeItem('no_cart_product_api'); } catch {}
        return response.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          try { localStorage.setItem('no_cart_product_api', '1'); } catch {}
          console.warn('[Xano] DELETE /cart_item/:id no disponible (404). Activando modo invitado.');
        }
        throw error;
      }
    }
  };

  // Funciones para órdenes
  export const orderAPI = {
    getAll: async () => {
      try {
        const response = await withBackoff(() => api.get('/order'));
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error.message;
      }
    },
    getById: async (id) => {
      try {
        const response = await api.get(`/order/${id}`);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error.message;
      }
    },
    create: async (data) => {
      try {
        const response = await api.post('/order', data);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error.message;
      }
    },
    update: async (id, data) => {
      try {
        const response = await api.patch(`/order/${id}`, data);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error.message;
      }
    },
    delete: async (id) => {
      try {
        const response = await api.delete(`/order/${id}`);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error.message;
      }
    }
  };

  // Funciones para productos de la orden
  export const orderProductAPI = {
    getAll: async () => {
      try {
        const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
        const base = normalizePath(import.meta.env?.VITE_XANO_ORDER_ITEM_PATH, '/order_item');
        const response = await api.get(base);
        try { localStorage.removeItem('no_order_item_api'); } catch {}
        return response.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          try { localStorage.setItem('no_order_item_api', '1'); } catch {}
          console.warn('[Xano] /order_item no disponible (404).');
        }
        throw error.response ? error.response.data : error.message;
      }
    },
    getById: async (id) => {
      try {
        const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
        const base = normalizePath(import.meta.env?.VITE_XANO_ORDER_ITEM_PATH, '/order_item');
        const response = await api.get(`${base}/${id}`);
        try { localStorage.removeItem('no_order_item_api'); } catch {}
        return response.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          try { localStorage.setItem('no_order_item_api', '1'); } catch {}
          console.warn('[Xano] /order_item/:id no disponible (404).');
        }
        throw error.response ? error.response.data : error.message;
      }
    },
    create: async (data) => {
      try {
        const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
        const base = normalizePath(import.meta.env?.VITE_XANO_ORDER_ITEM_PATH, '/order_item');
        const response = await api.post(base, data);
        try { localStorage.removeItem('no_order_item_api'); } catch {}
        return response.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          try { localStorage.setItem('no_order_item_api', '1'); } catch {}
          console.warn('[Xano] POST /order_item no disponible (404).');
        }
        throw error.response ? error.response.data : error.message;
      }
    },
    update: async (id, data) => {
      try {
        const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
        const base = normalizePath(import.meta.env?.VITE_XANO_ORDER_ITEM_PATH, '/order_item');
        const response = await api.patch(`${base}/${id}`, data);
        try { localStorage.removeItem('no_order_item_api'); } catch {}
        return response.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          try { localStorage.setItem('no_order_item_api', '1'); } catch {}
          console.warn('[Xano] PATCH /order_item/:id no disponible (404).');
        }
        throw error.response ? error.response.data : error.message;
      }
    },
    delete: async (id) => {
      try {
        const normalizePath = (p, dflt) => (p ? (p.startsWith('/') ? p : `/${p}`) : dflt);
        const base = normalizePath(import.meta.env?.VITE_XANO_ORDER_ITEM_PATH, '/order_item');
        const response = await api.delete(`${base}/${id}`);
        try { localStorage.removeItem('no_order_item_api'); } catch {}
        return response.data;
      } catch (error) {
        if (error?.response?.status === 404) {
          try { localStorage.setItem('no_order_item_api', '1'); } catch {}
          console.warn('[Xano] DELETE /order_item/:id no disponible (404).');
        }
        throw error.response ? error.response.data : error.message;
      }
    }
  };

  // Funciones para envíos
  export const shippingAPI = {
    getAll: async () => {
      try {
        const response = await api.get('/shipping');
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error.message;
      }
    },
    getById: async (id) => {
      try {
        const response = await api.get(`/shipping/${id}`);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error.message;
      }
    },
    create: async (data) => {
      try {
        const response = await api.post('/shipping', data);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error.message;
      }
    },
    update: async (id, data) => {
      try {
        const response = await api.patch(`/shipping/${id}`, data);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error.message;
      }
    },
    delete: async (id) => {
      try {
        const response = await api.delete(`/shipping/${id}`);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error.message;
      }
    }
  };

  // Funciones para gestionar usuarios
  export const userAPI = {
    // Actualizar perfil de usuario
    updateProfile: async (userData) => {
      try {
        const response = await api.put('/user/profile', userData);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error.message;
      }
    },

    // Cambiar contraseña
    changePassword: async (passwordData) => {
      try {
        const response = await api.put('/user/password', passwordData);
        return response.data;
      } catch (error) {
        throw error.response ? error.response.data : error.message;
      }
    }
  };

  export const fileAPI = {
    // Subir archivo (campo: 'file') y devolver URL utilizable
    uploadFile: async (file) => {
      const normalizePath = (p) => {
        if (!p) return '/upload';
        return p.startsWith('/') ? p : `/${p}`;
      };
      const uploadPath = normalizePath(import.meta.env?.VITE_XANO_UPLOAD_PATH);

      const form = new FormData();
      form.append('file', file);

      const response = await api.post(uploadPath, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = response?.data;
      const directUrl = data?.url || data?.signed_url;
      const path = data?.path || data?.uploaded?.path || data?.data?.path;

      let url = directUrl || null;
      if (!url && path) {
        try {
          const origin = new URL(API_URL).origin; // e.g. https://x8ki-letl-twmt.n7.xano.io
          url = `${origin}${path}`;
        } catch {
          url = path; // fallback
        }
      }

      return { url, data };
    }
  };

  // Helpers anti-429 y caché en memoria
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const memoryRate = { backoffUntil: 0 };
  async function withBackoff(exec, { maxRetries = 5, baseMs = 600 } = {}) {
    let attempt = 0;
    while (true) {
      try {
        const now = Date.now();
        if (memoryRate.backoffUntil && now < memoryRate.backoffUntil) {
          await sleep(memoryRate.backoffUntil - now);
        }
        return await exec();
      } catch (e) {
        const status = e?.response?.status;
        if (status === 429 && attempt < maxRetries) {
          // Respetar Retry-After si el backend lo provee
          const ra = (() => {
            try {
              const h = e?.response?.headers?.['retry-after'] ?? e?.response?.headers?.['Retry-After'];
              const n = parseInt(h, 10);
              return Number.isFinite(n) ? n * 1000 : null;
            } catch { return null; }
          })();
          // Backoff exponencial con jitter
          const base = baseMs * Math.pow(2, attempt);
          const jitter = Math.floor(Math.random() * (baseMs * 0.3));
          const delayMs = ra ?? (base + jitter);
          memoryRate.backoffUntil = Date.now() + delayMs;
          await sleep(delayMs);
          attempt++;
          continue;
        }
        throw e;
      }
    }
  }
  const productMem = { byId: new Map(), inflight: new Map(), catalog: null, catalogTs: 0 };
  const getProductFromCache = (id) => {
    if (productMem.byId.has(id)) return productMem.byId.get(id);
    try {
      const raw = localStorage.getItem('catalog_cache');
      if (raw) {
        const cached = JSON.parse(raw);
        const hit = (cached?.items || []).find((p) => String(p.id) === String(id));
        if (hit) return hit;
      }
    } catch {}
    return null;
  };
  const ME_TTL_MS = 60000;

  export default {
    auth: authAPI,
    products: productAPI,
    user: userAPI,
    cart: cartAPI,
    cartProduct: cartProductAPI,
    order: orderAPI,
    orderProduct: orderProductAPI,
    shipping: shippingAPI,
    file: fileAPI
  };
// (helpers movidos arriba; se elimina bloque duplicado y llaves sueltas)