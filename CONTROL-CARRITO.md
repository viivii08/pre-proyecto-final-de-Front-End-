# 🛒 Control de Visualización del Carrito

## ✅ Solución Implementada: Opción 1 - Condicional Simple

### 📍 Ubicación del Código
**Archivo:** `js/universal-navbar.js`
**Línea:** ~68-70 (dentro de `renderNavbar()`)

### 🎯 Cómo Funciona

El carrito se **oculta automáticamente** en estas páginas:
- ✅ `mi-cuenta.html` - No tiene sentido mostrar carrito en perfil de usuario
- ✅ `mis-pedidos.html` - Ya están viendo sus pedidos
- ✅ `mis-favoritos.html` - Página de favoritos
- ✅ `checkout.html` - Ya están en proceso de pago

El carrito se **muestra normalmente** en:
- ✅ `index.html` - Página principal
- ✅ `tienda.html` - Catálogo de productos
- ✅ `jarro.html`, `cuaderno.html`, `yerbera.html` - Páginas de producto
- ✅ `portafolio.html`, `contacto.html` - Páginas informativas
- ✅ Cualquier otra página no listada arriba

### 💻 Código Implementado

```javascript
// En renderNavbar()
const paginasSinCarrito = ['mi-cuenta.html', 'mis-pedidos.html', 'mis-favoritos.html', 'checkout.html'];
const mostrarCarrito = !paginasSinCarrito.includes(this.currentPage);

// Más abajo en el HTML
${mostrarCarrito ? this.renderCartButton() : ''}
```

### 🔧 Cómo Personalizar

#### **Agregar más páginas sin carrito:**
```javascript
const paginasSinCarrito = [
  'mi-cuenta.html', 
  'mis-pedidos.html', 
  'mis-favoritos.html', 
  'checkout.html',
  'admin.html',          // ← Nueva página
  'configuracion.html'   // ← Nueva página
];
```

#### **Quitar páginas de la lista (para que SÍ muestren carrito):**
```javascript
const paginasSinCarrito = [
  'mi-cuenta.html', 
  'mis-pedidos.html'
  // checkout.html ahora SÍ mostrará el carrito
];
```

#### **Mostrar carrito SOLO en páginas específicas (Lista Blanca):**
```javascript
// Cambiar esta línea:
const paginasSinCarrito = ['mi-cuenta.html', 'mis-pedidos.html'];
const mostrarCarrito = !paginasSinCarrito.includes(this.currentPage);

// Por esto:
const paginasConCarrito = ['index.html', 'tienda.html', 'jarro.html', 'cuaderno.html', 'yerbera.html'];
const mostrarCarrito = paginasConCarrito.includes(this.currentPage);
```

---

## 📊 Otras Opciones Disponibles

### **OPCIÓN 2: Atributo data- en HTML**

En cada página HTML, agregar:
```html
<body data-show-cart="false">  <!-- No mostrar carrito -->
<body data-show-cart="true">   <!-- Mostrar carrito -->
```

En `universal-navbar.js`:
```javascript
const mostrarCarrito = document.body.getAttribute('data-show-cart') !== 'false';
```

**Ventajas:** 
- Cada página decide por sí misma
- No necesitas modificar JS para nuevas páginas

**Desventajas:** 
- Tienes que editar cada HTML

---

### **OPCIÓN 3: Por Tipo de Página**

```javascript
const paginasUsuario = ['mi-cuenta.html', 'mis-pedidos.html', 'mis-favoritos.html'];
const paginasCompra = ['tienda.html', 'jarro.html', 'cuaderno.html', 'yerbera.html'];
const paginasPago = ['checkout.html', 'carrito.html'];

const mostrarCarrito = !paginasUsuario.includes(this.currentPage) && 
                       !paginasPago.includes(this.currentPage);
```

**Ventajas:** 
- Más semántico y organizado
- Fácil agregar categorías

**Desventajas:** 
- Más código
- Más complejo de mantener

---

## 🐛 Solución de Problemas

### El carrito no aparece en ninguna página
**Causa:** El array `paginasSinCarrito` está vacío o mal configurado
**Solución:** Verifica que la variable esté bien escrita

### El carrito aparece en una página donde no debería
**Causa:** El nombre de la página no está en la lista `paginasSinCarrito`
**Solución:** Agrega el nombre exacto del archivo (con `.html`)

### El contador del carrito no se actualiza
**Causa:** El elemento `#cart-count` no existe porque el carrito está oculto
**Solución:** El código ya maneja esto automáticamente con:
```javascript
updateCartCounter() {
  const counter = document.getElementById('cart-count');
  if (counter) {  // ← Solo actualiza si existe
    // ...
  }
}
```

---

## ✨ Mejoras Futuras Posibles

1. **Carrito compacto en páginas de usuario**
   - Mostrar solo un icono pequeño sin contador
   
2. **Redirección inteligente**
   - Si intentan agregar al carrito en "Mis Pedidos", redirigir a tienda

3. **Mensaje personalizado**
   - "Tu carrito te espera en la tienda" en páginas sin carrito

4. **Persistencia de estado**
   - Guardar en localStorage si el usuario prefiere ver/ocultar el carrito

---

## 📝 Notas del Desarrollador

- ✅ Código modular y reutilizable
- ✅ Sin romper funcionalidad existente
- ✅ Fácil de personalizar
- ✅ Compatible con todas las páginas actuales
- ✅ No requiere cambios en HTML existente

**Última actualización:** 26 de noviembre de 2025
**Versión:** 1.0
**Implementado por:** GitHub Copilot
