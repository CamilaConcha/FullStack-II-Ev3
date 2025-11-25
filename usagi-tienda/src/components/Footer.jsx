/**
 * Componente de pie de página
 * Muestra información de contacto y enlaces importantes
 */
import logoUsagi from '../assets/img/logo-sin-fondo-2.png';
import iconFacebook from '../assets/img/facebook.png';
import iconInstagram from '../assets/img/instagram.png';
import iconTwitter from '../assets/img/twitter-alt-circle.png';
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <section className="footer-section">
          <img src={logoUsagi} alt="Logo" className="footer-logo" />
          <p className="footer-desc">Tu tienda de confianza para productos seleccionados y ofertas especiales.</p>
        </section>
        <section className="footer-section">
          <h5>Enlaces rápidos</h5>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/catalogo">Catálogo</a></li>
            <li><a href="/contacto">Contacto</a></li>
            <li><a href="/carrito">Cesta</a></li>
          </ul>
        </section>
        <section className="footer-section">
          <h5>Soporte</h5>
          <ul>
            <li><a href="/contacto">Ayuda y soporte</a></li>
            <li><a href="/">Términos y condiciones</a></li>
            <li><a href="/">Privacidad</a></li>
          </ul>
        </section>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} Usagi Tienda</span>
        <div className="footer-social">
          <a
            href="https://www.facebook.com/login/"
            aria-label="Facebook"
            title="Facebook"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={iconFacebook} alt="Facebook" />
          </a>
          <a
            href="https://www.instagram.com/accounts/login/"
            aria-label="Instagram"
            title="Instagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={iconInstagram} alt="Instagram" />
          </a>
          <a
            href="https://twitter.com/login"
            aria-label="Twitter"
            title="Twitter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={iconTwitter} alt="Twitter" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;