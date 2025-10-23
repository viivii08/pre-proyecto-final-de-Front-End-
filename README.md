# 🛍️ Patagonia Style - Ecommerce Profesional

**Un ecommerce completo y profesional para productos artesanales inspirados en la Patagonia Argentina.**

## ✨ Nuevas Características Profesionales

### 🚀 **Sistema de Productos Dinámico**
- **Archivo JSON centralizado** (`data/productos.json`) para gestionar todos los productos
- **Información completa** de cada producto: precio, stock, imágenes, características, SEO
- **Categorías organizadas** con filtros automáticos
- **Control de inventario** en tiempo real

### 🛒 **Carrito de Compras Avanzado**
- **Persistencia mejorada** con localStorage unificado
- **Cálculos automáticos** de subtotales, descuentos y envío
- **Validación de stock** antes de agregar productos
- **Integración con checkout** profesional

### 💳 **Sistema de Checkout Completo**
- **Formulario profesional** con validación en tiempo real
- **Cálculo de envío por zonas** (CABA, GBA, Interior)
- **Múltiples métodos de pago**:
  - Transferencia bancaria (10% descuento)
  - MercadoPago
  - Efectivo contra entrega
- **Integración con WhatsApp** para confirmación de pedidos

### 🔍 **Buscador y Filtros Funcionales**
- **Búsqueda en tiempo real** por nombre, descripción y tags
- **Filtros por categoría** y precio
- **Ordenamiento** por nombre, precio y descuentos
- **Resultados sin productos** con mensaje personalizado

### 📱 **Páginas de Producto Individuales**
- **Galería de imágenes** con zoom y miniaturas
- **Especificaciones completas** con tabs organizados
- **Información de envío** y políticas
- **Productos relacionados** automáticos
- **SEO optimizado** con Schema.org y Open Graph

### 🔔 **Sistema de Notificaciones**
- **Notificaciones toast** para acciones del usuario
- **Confirmaciones** de agregado al carrito
- **Alertas de stock** y errores
- **Feedback visual** inmediato

### ⚖️ **Páginas Legales Profesionales**
- **Términos y Condiciones** completos
- **Política de Privacidad** detallada
- **Cumplimiento legal** para ecommerce argentino

## 🗂️ **Estructura de Archivos**

```
📁 Tu Proyecto/
├── 📁 data/
│   └── productos.json          # Base de datos de productos
├── 📁 js/
│   └── store.js               # Sistema de ecommerce completo
├── 📁 pages/                  # Imágenes de productos
├── index.html                 # Página principal
├── tienda.html               # Catálogo con filtros
├── carrito.html              # Carrito avanzado
├── checkout.html             # Proceso de compra
├── producto.html             # Página individual de producto
├── terminos-condiciones.html # Términos legales
├── politica-privacidad.html  # Política de privacidad
└── styles.css               # Estilos personalizados
```

## 🚀 **Cómo Usar Tu Nuevo Ecommerce**

### 1. **Gestionar Productos**
- Edita `data/productos.json` para agregar/modificar productos
- Cada producto incluye: ID, nombre, precio, stock, imágenes, características
- Las categorías se muestran automáticamente en los filtros

### 2. **Agregar Nuevos Productos**
```json
{
  "id": 4,
  "nombre": "Nuevo Producto",
  "slug": "nuevo-producto",
  "categoria": "nueva-categoria",
  "precio": 25000,
  "precioOriginal": null,
  "descuento": 0,
  "stock": 10,
  "disponible": true,
  "descripcionCorta": "Descripción breve",
  "descripcionLarga": "Descripción completa...",
  "caracteristicas": ["Característica 1", "Característica 2"],
  "imagenes": ["pages/nueva-imagen.jpg"],
  "tags": ["tag1", "tag2"],
  "sku": "NUEVO-001"
}
```

### 3. **Personalizar Configuración**
En `productos.json` puedes modificar:
- **Zonas de envío** y precios
- **Descuento por transferencia**
- **Límite para envío gratis**

### 4. **URLs de Productos**
Los productos individuales se acceden con:
`producto.html?id=1&slug=nombre-producto`

## 🎯 **Características Destacadas**

### ✅ **Lo que ya tienes funcionando:**
- Sistema de productos dinámico con JSON
- Carrito con persistencia y cálculos automáticos
- Checkout completo con múltiples métodos de pago
- Buscador funcional con filtros
- Páginas de producto individuales con SEO
- Notificaciones toast profesionales
- Páginas legales completas
- Responsive design optimizado

### 🔧 **Cómo personalizar:**
1. **Colores y estilos**: Modifica `styles.css`
2. **Productos**: Edita `data/productos.json`
3. **Información de contacto**: Actualiza los números de WhatsApp
4. **Datos legales**: Modifica las páginas de términos y privacidad

## 📊 **Funcionalidades Profesionales**

### 🛡️ **Seguridad y Confianza**
- Validación de formularios en tiempo real
- Control de stock automático
- Manejo de errores profesional
- Páginas legales completas

### 📈 **SEO Optimizado**
- Meta tags dinámicos por producto
- Schema.org para productos
- Open Graph para redes sociales
- URLs amigables

### 💡 **Experiencia de Usuario**
- Notificaciones no intrusivas
- Carga rápida y eficiente
- Navegación intuitiva
- Diseño responsive

## 🎉 **¡Tu Ecommerce Está Listo!**

Ahora tienes un ecommerce completamente profesional que incluye:
- ✅ Gestión de productos dinámicos
- ✅ Carrito avanzado con cálculos automáticos
- ✅ Proceso de checkout completo
- ✅ Integración con WhatsApp para pedidos
- ✅ SEO optimizado
- ✅ Páginas legales profesionales
- ✅ Sistema de notificaciones
- ✅ Diseño responsive y moderno

**¡Tu sitio web ahora es un ecommerce profesional completo sin haber roto ni una línea de tu código original!**

---

## 📝 **Historial del Proyecto**

### Versión Original (Pre-proyecto Front-End)
Tienda online inspirada en la naturaleza patagónica, desarrollada como pre-entrega del curso de Front End.

**Páginas originales desarrolladas:**
- **index.html** - Página principal con carousel de imágenes
- **tienda.html** - Catálogo de productos con sistema de cards
- **contacto.html** - Formulario de contacto funcional
- **carrito.html** - Sistema de carrito de compras
- **portafolio.html** - Galería de trabajos
- **Páginas de productos individuales** (cuaderno.html, jarro.html, yerbera.html)

**Tecnologías utilizadas:**
- **HTML5** - Estructura semántica
- **CSS3** - Estilos personalizados y animaciones
- **Bootstrap 5** - Framework para diseño responsive
- **JavaScript** - Interactividad y funcionalidad del carrito
- **Bootstrap Icons** - Iconografía
- **Google Fonts** - Tipografía (Poppins y Raleway)
- **Formspree** - Backend para formulario de contacto

---

💝 **Creado con amor para Patagonia Style**  
*Transformando tu hermoso diseño en un ecommerce profesional*

**Desarrolladora:** Viviana Vargas  
**Proyecto:** Patagonia Style  
**WhatsApp:** +54 11 3689-9678