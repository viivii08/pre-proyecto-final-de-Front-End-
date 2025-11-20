# 🛒 Patagonia Style - E-commerce

## Sobre el Proyecto

Este es mi proyecto final de Front-End donde desarrollé una tienda online inspirada en la estética patagónica. La idea era crear algo que combinara funcionalidad con un diseño que refleje la naturaleza y tranquilidad de la región.

## ¿Qué hace este proyecto?

Es una tienda e-commerce completa donde podes:
- Ver productos con sus detalles (precios, descripciones, imágenes)
- Agregar productos al carrito
- Gestionar tu carrito de compras
- Hacer checkout
- Crear y gestionar tu cuenta de usuario
- Ver el historial de pedidos
- Contactar por WhatsApp

## Tecnologías que usé

- **HTML5** - Para toda la estructura de las páginas
- **CSS3** - Estilos personalizados, con gradientes y efectos
- **Bootstrap 5** - Para que sea responsive y se vea bien en celular
- **JavaScript** - Toda la lógica del carrito, productos y usuarios
- **LocalStorage** - Para guardar el carrito y la sesión del usuario

## Páginas principales

### 🏠 Página de Inicio (`index.html`)
La landing page con un video de la Patagonia de fondo y las secciones principales.

### 🛍️ Tienda (`tienda.html`)
El catálogo completo con los productos. Tiene filtros y todo.

### 🧉 Páginas de Productos
Cada producto tiene su propia página con galería de fotos:
- `jarro.html` - Jarro de cerámica patagónico
- `cuaderno.html` - Cuaderno artesanal
- `yerbera.html` - Yerbera de madera

### 🛒 Carrito y Checkout
- `carrito.html` - Donde ves todo lo que agregaste
- `checkout.html` - Para finalizar la compra

### 👤 Cuenta de Usuario
- `mi-cuenta.html` - Tu perfil
- `mis-pedidos.html` - Historial de compras

### 📞 Otras Páginas
- `contacto.html` - Formulario de contacto
- `portafolio.html` - Proyectos relacionados
- `envios.html`, `politica-privacidad.html`, `terminos-condiciones.html` - Info legal

## Funcionalidades que implementé

### 💡 Sistema de Productos
Los productos se cargan desde `data/productos.json` de forma dinámica. Esto hace que sea fácil agregar más productos sin tocar el código.

### 🛒 Carrito de Compras
- Agregar/quitar productos
- Cambiar cantidades
- Calcular totales automáticamente
- Se guarda en LocalStorage (no se pierde si refrescas la página)

### 👥 Sistema de Usuarios
- Login y registro
- Sesión persistente con LocalStorage
- Perfil de usuario editable

### 📱 WhatsApp Flotante
Un botón que está siempre visible para contactar directo por WhatsApp. Sube y baja con el scroll.

### ⭐ Sistema de Reseñas
Los productos tienen valoraciones y comentarios de usuarios.

## Estructura del Proyecto

```
📁 pre-proyecto-final-de-Front-End-
├── 📄 index.html              # Página principal
├── 📄 tienda.html             # Catálogo de productos
├── 📄 carrito.html            # Carrito de compras
├── 📄 checkout.html           # Finalizar compra
├── 📄 styles.css              # Estilos principales
├── 📁 js/
│   ├── store.js               # Lógica de la tienda
│   ├── carrito-unificado.js   # Sistema del carrito
│   ├── users.js               # Gestión de usuarios
│   ├── simple-whatsapp.js     # Botón de WhatsApp
│   ├── favorites.js           # Productos favoritos
│   └── reviews.js             # Sistema de reseñas
├── 📁 data/
│   └── productos.json         # Base de datos de productos
├── 📁 pages/
│   └── (imágenes y recursos)
└── 📁 videos/
    └── patagonia.mp4.mp4      # Video del hero
```

## Cosas que resolví durante el desarrollo

### El problema del footer
Al principio el footer dejaba un espacio blanco abajo. Lo resolví usando Flexbox con `flex: 1` en el main y haciendo que el body sea un contenedor flex vertical.

### Productos que no cargaban
Tuve que asegurarme que el script de productos se cargue después del DOM. Usé `DOMContentLoaded` y arreglé la ruta del JSON.

### Carrito vacío en checkout
El problema era que no se estaba pasando bien la información del carrito entre páginas. Lo unifiqué todo con `carrito-unificado.js`.

## Cómo ver el proyecto

1. Clonar el repositorio
2. Abrir con Live Server o cualquier servidor local
3. O simplemente abrir `index.html` en el navegador

```bash
# Si tenes Python instalado:
python3 -m http.server 8000

# O con PHP:
php -S localhost:8000
```

Después entrás a `http://localhost:8000`

## Características del diseño

- **Paleta de colores**: Grises, verdes y tonos tierra (inspirado en la Patagonia)
- **Responsive**: Se adapta a celular, tablet y desktop
- **Animaciones suaves**: Transiciones y efectos hover
- **Footer pegajoso**: Siempre queda al final de la página
- **Navegación intuitiva**: Menú fijo arriba

## Lo que aprendí

- Cómo estructurar un proyecto de e-commerce desde cero
- Gestionar estado con LocalStorage
- Hacer que todo sea responsive con Bootstrap
- Debugging de JavaScript (mucho console.log 😅)
- Organizar código en módulos separados
- CSS Grid y Flexbox para layouts complejos

## Futuras mejoras

Si tuviera más tiempo, agregaría:
- Pasarela de pago real
- Backend con base de datos
- Más productos y categorías
- Filtros más avanzados
- Sistema de descuentos/cupones
- Integración con API de envíos

## Contacto

Si querés ver más de mi trabajo o contactarme:
- GitHub: [@viivii08](https://github.com/viivii08)

---

Hecho con ☕ y mucha paciencia debuggeando JavaScript
