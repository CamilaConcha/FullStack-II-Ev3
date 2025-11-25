import { useState, useEffect } from 'react';
import { productAPI, fileAPI } from '../api/xano';

/**
 * Página de administración
 * Permite gestionar productos (CRUD)
 */
function Admin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
    imagenData: null,
    stock: '',
    marca: '',
    categoria: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, []);

  // Función para cargar productos
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const { url, data } = await fileAPI.uploadFile(selectedFile);
      setFormData(prev => ({ ...prev, imagen: url || '', imagenData: data || null }));
      console.debug('[Admin] upload success', { url, path: data?.path || data?.uploaded?.path || data?.data?.path });
    } catch (error) {
      console.error('Error al subir imagen:', error);
      alert('No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.debug('[Admin] handleSubmit formData:', JSON.stringify(formData));
    if (!formData.nombre || formData.nombre.trim() === '') {
      alert('Por favor ingresa el nombre del producto');
      return;
    }
    
    try {
      if (isEditing) {
        // Actualizar producto existente
        await productAPI.update(formData.id, formData);
      } else {
        // Crear nuevo producto
        await productAPI.create(formData);
      }
      
      // Resetear formulario y recargar productos
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }
  };

  // Editar producto
  const handleEdit = (product) => {
    setFormData(product);
    setIsEditing(true);
  };

  // Eliminar producto
  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await productAPI.delete(id);
        loadProducts();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
      }
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      id: null,
      nombre: '',
      descripcion: '',
      precio: '',
      imagen: '',
      imagenData: null,
      stock: '',
      marca: '',
      categoria: '',
    });
    setSelectedFile(null);
    setIsEditing(false);
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Panel de Administración</h1>
      
      <div className="row">
        {/* Formulario */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h5>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label">Nombre</label>
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
                  <label htmlFor="descripcion" className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="precio" className="form-label">Precio</label>
                  <input
                    type="number"
                    className="form-control"
                    id="precio"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="imagen" className="form-label">URL de Imagen</label>
                  <input
                    type="text"
                    className="form-control"
                    id="imagen"
                    name="imagen"
                    value={formData.imagen}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Subir Imagen</label>
                  <div className="d-flex gap-2">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="form-control" />
                    <button type="button" className="btn btn-outline-secondary" onClick={handleUpload} disabled={!selectedFile || uploading}>
                      {uploading ? 'Subiendo...' : 'Subir imagen'}
                    </button>
                  </div>
                  {formData.imagen && (
                    <img src={formData.imagen} alt="Preview" className="img-fluid mt-2" style={{ maxHeight: '200px' }} />
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="stock" className="form-label">Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="marca" className="form-label">Marca</label>
                  <input
                    type="text"
                    className="form-control"
                    id="marca"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="categoria" className="form-label">Categoría</label>
                  <input
                    type="text"
                    className="form-control"
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-pink-pill">
                    {isEditing ? 'Actualizar' : 'Guardar'}
                  </button>
                  
                  {isEditing && (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={resetForm}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Tabla de productos */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Listado de Productos</h5>
              
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
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length > 0 ? (
                        products.map(product => (
                          <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.nombre}</td>
                            <td>${product.precio}</td>
                            <td>{product.stock}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-pink-pill me-2"
                                onClick={() => handleEdit(product)}
                              >
                                Editar
                              </button>
                              <button
                                className="btn btn-sm btn-pink-pill"
                                onClick={() => handleDelete(product.id)}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No hay productos disponibles
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Órdenes removida: ahora está en la vista independiente */}
    </div>
  );
}

export default Admin;