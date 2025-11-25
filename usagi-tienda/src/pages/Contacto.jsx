import { useState } from 'react';

/**
 * Página de contacto
 */
function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [enviado, setEnviado] = useState(false);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se implementaría la lógica para enviar el formulario a un backend
    console.log('Formulario enviado:', formData);
    // Simular envío exitoso
    setEnviado(true);
    // Resetear formulario
    setFormData({
      nombre: '',
      email: '',
      asunto: '',
      mensaje: ''
    });
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-6">
          <h2 className="mb-4">Contáctanos</h2>
          
          {enviado && (
            <div className="alert alert-success mb-4" role="alert">
              ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.
            </div>
          )}
          
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
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="asunto" className="form-label">Asunto</label>
              <input
                type="text"
                className="form-control"
                id="asunto"
                name="asunto"
                value={formData.asunto}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="mensaje" className="form-label">Mensaje</label>
              <textarea
                className="form-control"
                id="mensaje"
                name="mensaje"
                rows="5"
                value={formData.mensaje}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <button type="submit" className="btn btn-pink-pill">Enviar mensaje</button>
          </form>
        </div>
        
        <div className="col-md-6 mt-4 mt-md-0">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="card-title mb-4">Información de contacto</h3>
              
              <div className="mb-4">
                <h5><i className="bi bi-geo-alt-fill me-2"></i>Dirección</h5>
                <p>Av. Siempreviva 742, Springfield</p>
              </div>
              
              <div className="mb-4">
                <h5><i className="bi bi-telephone-fill me-2"></i>Teléfono</h5>
                <p>+1 (555) 123-4567</p>
              </div>
              
              <div className="mb-4">
                <h5><i className="bi bi-envelope-fill me-2"></i>Email</h5>
                <p>contacto@usagi-tienda.com</p>
              </div>
              
              <div className="mb-4">
                <h5><i className="bi bi-clock-fill me-2"></i>Horario de atención</h5>
                <p>Lunes a Viernes: 9:00 AM - 6:00 PM<br />
                Sábados: 10:00 AM - 2:00 PM</p>
              </div>
              
              <div className="social-media mt-4">
                <h5>Síguenos en redes sociales</h5>
                <div className="d-flex gap-3 mt-2">
                  <a href="#" className="text-decoration-none">
                    <i className="bi bi-facebook fs-4"></i>
                  </a>
                  <a href="#" className="text-decoration-none">
                    <i className="bi bi-instagram fs-4"></i>
                  </a>
                  <a href="#" className="text-decoration-none">
                    <i className="bi bi-twitter fs-4"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contacto;