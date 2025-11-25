# Tienda de Figuras Coleccionables

Este proyecto corresponde a una tienda web de figuras coleccionables inspirada en el universo Wakfu y el contexto de negocio de Haode.cl.

## Estructura del proyecto
- **index.html**: Página principal (Home)
- **catalogo.html**: Catálogo de productos
- **producto.html**: Detalle de producto
- **carrito.html**: Carrito de compras
- **login.html**: Inicio de sesión
- **registro.html**: Registro de usuario
- **contacto.html**: Formulario de contacto
- **/assets/css/**: Estilos generales y específicos por vista
  - `style.css`: Estilos globales y overrides de Bootstrap
  - `home.css`, `login.css`, etc.: Estilos por vista
- **/assets/js/**: Lógica general y por vista
  - `main.js`: Lógica general y menú
  - `carrito.js`, `validaciones.js`, etc.
- **/data/productos.json**: Listado simulado de productos
- **/assets/img/**: Imágenes y logo

## Cómo levantar el proyecto
Simplemente abre `index.html` en tu navegador. No requiere servidor ni instalación adicional.

## Estilos y Bootstrap
- Bootstrap se usa solo para grid y utilidades.
- Los estilos visuales predeterminados de Bootstrap están anulados en `assets/css/style.css`.
- Las clases visuales personalizadas (ej: `.btn--primary`, `.input--styled`) controlan la apariencia.

## Dependencias
- `style.css` depende de Bootstrap y define la paleta visual y overrides.
- Cada vista tiene su propio archivo CSS y JS según corresponda.

## Accesibilidad
- Imágenes con atributo `alt`.
- Formularios con etiquetas `label`.
- Contraste adecuado entre texto y fondo.

---
