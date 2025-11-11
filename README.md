# Patagonia Style - Mi Tienda Online# 🎨 Patagonia Style - Proyecto-Final Front-End



¡Hola! Soy Viviana y este es mi proyecto final de Front-End. Decidí crear una tienda online inspirada en la Patagonia porque me encanta la naturaleza y quería combinar esa pasión con lo que aprendí de programación.**Tienda online profesional inspirada en la naturaleza patagónica**  

*Desarrollado por: Viviana Vargas*

## ¿Qué es Patagonia Style?

---

Es una tienda online donde vendo productos artesanales con diseños inspirados en la naturaleza patagónica. Todo empezó como una idea simple: ¿por qué no crear algo que refleje la belleza de Argentina en productos únicos?

## 📋 Descripción del Proyecto

## Lo que aprendí haciendo este proyecto

**Patagonia Style** es una tienda online que vende productos artesanales inspirados en la belleza natural de la Patagonia Argentina. El sitio combina un diseño moderno y responsive con funcionalidades completas de e-commerce, ofreciendo una experiencia de usuario profesional y fluida.

### HTML y estructura

Organicé todo el sitio usando las etiquetas semánticas que aprendimos:---

- `<header>` para la navegación

- `<main>` para el contenido principal  ## 🚀 Características Principales Implementadas

- `<section>` para dividir las diferentes partes

- `<footer>` para la información de contacto### 1. **Sistema de Navegación Dinámico y Compacto**

- **Navbar responsive** que se adapta automáticamente según el estado del usuario

### CSS y diseño- **Diseño compacto optimizado**: Altura reducida de 70px a 55px para mejor aprovechamiento del espacio

Me divertí mucho con los estilos. Usé:- **Layout inteligente**: 

- **Google Fonts** (Poppins y Raleway) porque quería que se viera moderno  - En la página principal: botones de autenticación prominentes

- **Gradientes** en el navbar y footer para dar esa sensación de paisaje  - En otras páginas: barra de búsqueda funcional

- **Flexbox** para organizar los productos en cards- **Navegación contextual** con breadcrumbs profesionales

- **Grid** para la sección de reseñas

- **Media queries** para que se vea bien en el celular### 2. **Sistema de Autenticación Completo**

- **Registro de usuarios** con validación en tiempo real

Los colores los elegí pensando en la Patagonia:- **Inicio de sesión** con persistencia en localStorage

- Azul oscuro (#1f3c5a) como las montañas- **Gestión de sesiones** automática

- Verde (#3b5d50) como los bosques  - **Dropdown de usuario** con opciones profesionales:

- Dorado (#b67c3a) como el atardecer  - Mi Perfil

  - Mis Pedidos  

### JavaScript - La parte que más me costó  - Acceso directo a Tienda

Al principio me daba miedo JavaScript, pero de a poco fui entendiendo:  - Cerrar Sesión

- **Modales compactos** con transiciones suaves entre login y registro

**Carrito de compras**: Fue lo más desafiante. Tuve que aprender a:

- Guardar productos en `localStorage` para que no se pierdan### 3. **Sistema de Notificaciones Profesional**

- Agregar y quitar productos- **Notificaciones toast** elegantes para feedback del usuario

- Calcular el total- **Prevención de duplicados** en mensajes de éxito/error

- Mostrar todo en una tabla bonita- **Auto-dismiss** después de 4 segundos

- **Posicionamiento fijo** que no interfiere con la navegación

**Formulario de contacto**: Conecté con Formspree para que funcione de verdad. Cuando alguien me escribe, me llega el mail.

### 4. **Optimización de UX/UI**

**Validaciones**: Agregué validaciones para que no se puedan enviar formularios vacíos.- **Diseño compacto** sin pérdida de funcionalidad

- **Tipografía escalada** proporcionalmente

## Las páginas que hice- **Espaciado optimizado** para mejor legibilidad

- **Animaciones suaves** en todos los elementos interactivos

### Página principal (index.html)- **Colores coherentes** con la paleta de la marca

- Hero section con una imagen grande

- Productos destacados---

- Un video de la Patagonia que encontré y me gustó mucho

## 💻 Tecnologías Utilizadas

### Tienda (tienda.html)

- Todos los productos organizados en cards### Frontend

- Botones para agregar al carrito- **HTML5** - Estructura semántica y accesible

- Se ve bien en celular y escritorio- **CSS3** - Estilos personalizados con gradientes y animaciones

- **Bootstrap 5** - Framework responsive con componentes modernos

### Páginas de productos individuales- **JavaScript ES6+** - Funcionalidad dinámica y gestión de estado

- Jarro enlozado con zorrito- **Bootstrap Icons** - Iconografía profesional

- Cuaderno con diseños propios- **Google Fonts** - Tipografías Poppins y Raleway

- Yerbera con paisajes de Bariloche

### Funcionalidades JavaScript

### Contacto (contacto.html)- **Gestión de estado** con localStorage

- Formulario que funciona de verdad- **Componentes dinámicos** para navegación

- Mi información de contacto- **Validación de formularios** en tiempo real

- Responsive design- **Sistema de notificaciones** personalizado

- **Responsive design** programático

### Carrito (carrito.html)

- Lista de productos agregados---

- Botones para cambiar cantidad

- Cálculo automático del total## 🗂️ Estructura del Proyecto



## Tecnologías que usé```

📁 Patagonia Style/

- **HTML5**: Para la estructura├── 📄 index.html              # Página principal con hero section

- **CSS3**: Para que se vea bonito├── 📄 tienda.html             # Catálogo de productos

- **Bootstrap 5**: Me ayudó mucho con el diseño responsive├── 📄 portafolio.html         # Galería de trabajos artísticos

- **JavaScript**: Para toda la funcionalidad├── 📄 contacto.html           # Formulario de contacto

- **Formspree**: Para que el formulario funcione├── 📄 carrito.html            # Carrito de compras

- **Google Fonts**: Para las tipografías├── 📄 cuaderno.html           # Página producto: Cuaderno Artesanal

├── 📄 jarro.html              # Página producto: Jarro Enlozado

## Características técnicas├── 📄 yerbera.html            # Página producto: Yerbera Artesanal

├── 📄 styles.css              # Estilos personalizados

### API y datos├── 📁 js/

Creé un archivo `productos.json` con toda la información de mis productos y uso `fetch()` para cargarlos dinámicamente.│   ├── navigation.js          # Sistema de navegación dinámico

│   ├── users.js               # Gestión de usuarios

### Responsive│   ├── store.js               # Funcionalidad del carrito

El sitio se adapta a:├── 📁 pages/                  # Imágenes y recursos

- Celulares (menos de 768px)└── 📁 videos/                 # Contenido multimedia

- Tablets (768px - 992px) ```

- Escritorio (más de 992px)

---

### Persistencia

El carrito se guarda en `localStorage`, así que aunque cierres el navegador, tus productos siguen ahí.## 🔧 Implementaciones Técnicas Destacadas



### Accesibilidad### **Sistema de Navegación Adaptativo**

- Todas las imágenes tienen texto alternativo```javascript

- Se puede navegar con el teclado// Navegación que se adapta según la página actual

- Los colores tienen buen contrasteconst isHomePage = window.location.pathname.endsWith('index.html') || 

                  window.location.pathname === '/';

## Archivos importantes

// Layout inteligente

```if (isHomePage) {

📁 Mi proyecto/    // Mostrar botones de autenticación prominentes

├── index.html              # Página principal    showFeaturedAuth();

├── tienda.html             # Catálogo de productos  } else {

├── contacto.html           # Formulario de contacto    // Mostrar barra de búsqueda

├── carrito.html            # Carrito de compras    showSearchBar();

├── styles.css              # Mis estilos principales}

├── js/```

│   ├── store.js            # Manejo del carrito

│   ├── navigation.js       # Sistema de navegación### **Gestión de Estado de Usuario**

│   └── users.js            # Login de usuarios```javascript

├── data/// Verificación automática de sesión

│   └── productos.json      # Base de datos de productoscheckUserSession() {

└── pages/                  # Todas mis imágenes    const userData = localStorage.getItem('currentUser');

```    if (userData) {

        this.currentUser = JSON.parse(userData);

## Desafíos que superé        this.updateNavigation();

    }

1. **JavaScript**: Al principio no entendía nada, pero practicando todos los días logré hacer que funcione el carrito.}

```

2. **Responsive**: Hacer que se vea bien en celular me tomó tiempo, pero aprendí mucho sobre media queries.

### **Sistema de Notificaciones**

3. **LocalStorage**: Entender cómo guardar y recuperar datos del navegador fue complicado pero súper útil.```javascript

// Notificaciones no intrusivas con auto-dismiss

4. **Formularios**: Conectar el formulario con Formspree y hacer las validaciones fue un logro personal.showNotification(message, type = 'info') {

    // Prevenir duplicados

## Lo que más me gusta del proyecto    const existing = document.querySelector('.notification');

    if (existing) existing.remove();

- Los colores y el diseño quedaron como me imaginaba    

- El carrito funciona súper bien    // Crear notificación elegante

- Se ve profesional en todos los dispositivos    const notification = createStyledNotification(message, type);

- El formulario de contacto funciona de verdad    

- Los productos se cargan desde JSON como en las páginas reales    // Auto-remover después de 4 segundos

    setTimeout(() => notification.remove(), 4000);

## Para probar el proyecto}

```

1. Abrí `index.html` en tu navegador

2. Navegá por las diferentes secciones---

3. Agregá productos al carrito

4. Probá el formulario de contacto## 🎯 Logros y Mejoras Implementadas

5. ¡Todo funciona!

### ✅ **Optimización de Espacio**

## Próximas mejoras- Reducción del 21% en altura del navbar (70px → 55px)

- Elementos compactos sin pérdida de funcionalidad

Si tuviera más tiempo, me gustaría agregar:- Mejor aprovechamiento del viewport

- Sistema de pagos real

- Más productos### ✅ **Experiencia de Usuario Mejorada**

- Blog con artículos sobre la Patagonia- Transiciones suaves entre modales

- Newsletter- Feedback inmediato en todas las acciones

- Sistema de reviews- Navegación intuitiva y contextual



## Reflexión personal### ✅ **Código Limpio y Mantenible**

- Arquitectura modular con componentes reutilizables

Este proyecto me enseñó muchísimo. Al principio pensaba que nunca iba a poder hacer una página que funcione de verdad, pero acá está. No es perfecta, pero es mía y estoy muy orgullosa del resultado.- Separación de responsabilidades

- Código documentado y escalable

Lo más importante que aprendí es que la programación es como resolver un rompecabezas gigante. Cada pequeño problema que resolvés te acerca más a la solución final.

### ✅ **Responsive Design Perfeccionado**

---- Adaptación automática a todos los dispositivos

- Breakpoints optimizados

**Contacto:**- Componentes que escalan proporcionalmente

- **Email**: A través del formulario del sitio

- **WhatsApp**: +54 11 3689-9678---



*Desarrollado con mucho cariño y café ☕ por Viviana Vargas*## 📱 Páginas y Funcionalidades

*Estudiante de Front-End Development*
### **Página Principal (index.html)**
- Hero section con video de fondo
- Productos destacados con animaciones
- Call-to-actions estratégicos
- Integración con sistema de usuarios

### **Tienda (tienda.html)**
- Catálogo completo de productos
- Sistema de filtros (pendiente)
- Cards de productos con hover effects
- Integración con carrito

### **Páginas de Productos Individuales**
- Galerías de imágenes interactivas
- Información detallada de productos
- Botones de compra
- Navegación de retorno optimizada

### **Carrito de Compras**
- Gestión dinámica de productos
- Cálculos automáticos
- Persistencia de datos
- Proceso de checkout simplificado

---

## 🎨 Diseño y Estética

### **Paleta de Colores**
- **Primario**: #1f3c5a (Azul Patagónico)
- **Secundario**: #3b5d50 (Verde Bosque)
- **Acento**: #b67c3a (Dorado Otoñal)
- **Fondo**: #f4f1ee (Crema Natural)

### **Tipografía**
- **Poppins**: Textos generales y UI
- **Raleway**: Títulos y branding

### **Estilo Visual**
- Gradientes sutiles inspirados en paisajes patagónicos
- Bordes redondeados para suavidad
- Sombras elegantes para profundidad
- Animaciones fluidas para interactividad

---

## 🔍 Detalles de Implementación

### **Responsive Breakpoints**
- **Mobile**: < 768px
- **Tablet**: 768px - 992px  
- **Desktop**: > 992px
- **Large Desktop**: > 1200px

### **Optimizaciones de Performance**
- Carga diferida de imágenes
- CSS optimizado con variables
- JavaScript modular
- Uso eficiente de localStorage

### **Accesibilidad**
- Etiquetas semánticas HTML5
- Atributos ARIA apropiados
- Contraste de colores optimizado
- Navegación por teclado

---

## 🚀 Próximas Mejoras Planificadas

- [ ] Sistema de filtros avanzado en tienda
- [ ] Integración con pasarelas de pago reales
- [ ] Panel de administración de productos
- [ ] Sistema de reviews y ratings
- [ ] Optimización SEO avanzada
- [ ] PWA (Progressive Web App)

---

## 🎓 Aprendizajes y Desafíos Superados

### **Principales Desafíos:**
1. **Integración de componentes dinámicos** sin romper el diseño existente
2. **Gestión de estado** entre múltiples páginas
3. **Optimización de espacio** manteniendo funcionalidad
4. **Compatibilidad responsive** en todos los dispositivos

### **Soluciones Implementadas:**
1. **Arquitectura modular** con componentes independientes
2. **LocalStorage centralizado** para persistencia de datos
3. **CSS Grid y Flexbox** para layouts adaptativos
4. **Testing cross-browser** y responsive

### **Conocimientos Aplicados:**
- **JavaScript ES6+**: Clases, arrow functions, destructuring
- **CSS Grid y Flexbox**: Layouts modernos y responsivos
- **Bootstrap 5**: Componentes y sistema de grillas
- **UX/UI Design**: Principios de usabilidad y accesibilidad

---

## 📊 Métricas del Proyecto

- **Páginas totales**: 8 páginas principales
- **Componentes JavaScript**: 4 módulos
- **Líneas de código CSS**: ~2000 líneas
- **Líneas de código JavaScript**: ~1500 líneas
- **Imágenes optimizadas**: 15+ assets
- **Tiempo de desarrollo**: 3 semanas

---

## 💝 Reflexión Personal

Este proyecto representa la culminación de mi aprendizaje en Front-End Development. Logré crear una experiencia de usuario profesional y funcional, aplicando principios de diseño moderno, programación eficiente y mejores prácticas de desarrollo web.

**Lo que más me enorgullece:**
- La integración fluida entre diseño y funcionalidad
- El código limpio y mantenible
- La atención al detalle en la experiencia de usuario
- La adaptabilidad del sistema a diferentes dispositivos

**Inspiración:** La belleza natural de la Patagonia Argentina, traducida en una experiencia digital que conecta con los usuarios y refleja la calidad artesanal de los productos.

---

**Desarrollado con  por Viviana Vargas**  
*Pre-Proyecto Final - Front-End Development*  
*WhatsApp: +54 11 3689-9678*