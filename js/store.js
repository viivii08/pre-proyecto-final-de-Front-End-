// 🌏 SISTEMA DE TIENDA ONLINE - PATAGONIA STYLE
// ⚙️ Gestión completa de productos, carrito y funcionalidades avanzadas
// 📚 Incluye búsqueda en tiempo real, filtros y sistema de calificaciones
// 🚀 Arquitectura modular con localStorage y eventos personalizados

// Sistema de gestión de productos para Patagonia Style
class PatagoniaStore {
  constructor() {
    // 📦 Inicialización de arrays principales
    this.productos = [];
    this.categorias = [];
    this.configuracion = {};
    
    // 🛒 Cargar carrito del localStorage usando key consistente
    // Mantiene persistencia entre sesiones del usuario
    this.carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    
    // 🔄 Inicializar sistema completo
    this.init();
  }

  // ⚡ INICIALIZACIÓN ASÍNCRONA DEL SISTEMA
  // Secuencia ordenada: productos → renderizado → carrito → eventos
  async init() {
    await this.cargarProductos();
    this.renderizarProductos();
    this.actualizarContadorCarrito();
    this.inicializarEventos();
  }

  // 📊 CARGA DE DATOS DESDE JSON
  // Intenta cargar desde archivo, si falla usa datos de respaldo
  async cargarProductos() {
    try {
      // 🔄 Fetch de datos principales desde archivo JSON
      const response = await fetch('./data/productos.json');
      const data = await response.json();
      
      // 📦 Asignación de datos a propiedades de clase
      this.productos = data.productos;
      this.categorias = data.categorias;
      this.configuracion = data.configuracion;
      
      console.log('✅ Productos cargados exitosamente:', this.productos.length, 'items');
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      // 🔄 Fallback con productos hardcodeados para desarrollo
      this.productosFallback();
    }
  }

  // 🆘 DATOS DE RESPALDO PARA DESARROLLO
  // Se ejecuta si falla la carga del archivo JSON
  productosFallback() {
    console.log('🔄 Usando productos de respaldo (fallback)');
    this.productos = [
      {
        id: 1,
        nombre: "Jarro Zorrito Invierno",
        precio: 21900,
        precioOriginal: 23900,
        descuento: 8,
        stock: 15,
        disponible: true,
        descripcionCorta: "Jarro enlozado inspirado en la Patagonia. Capacidad 330ml.",
        imagenes: ["pages/jarroportada.webp"],
        categoria: "jarros",
        sku: "JAR-ZOR-INV-001"
      },
      {
        id: 2,
        nombre: "Cuaderno Zorro",
        precio: 18900,
        precioOriginal: 21900,
        descuento: 14,
        stock: 28,
        disponible: true,
        descripcionCorta: "Cuaderno anillado A4 con diseño original de vivipinta.",
        imagenes: ["pages/cuadernoportada.webp"],
        categoria: "papeleria",
        sku: "CUAD-ZOR-A4-001"
      },
      {
        id: 3,
        nombre: "Yerbera Bariloche",
        precio: 24900,
        precioOriginal: null,
        descuento: 0,
        stock: 12,
        disponible: true,
        descripcionCorta: "Yerbera ilustrada con paisajes de montaña, bosque y lago.",
        imagenes: ["pages/yerbraportada.webp"],
        categoria: "accesorios",
        sku: "YERB-BAR-LAT-001"
      }
    ];
  }

  // 🎨 RENDERIZADO PRINCIPAL DE PRODUCTOS
  // Genera y muestra las tarjetas de productos en el DOM
  // Acepta array específico o usa todos los productos por defecto
  renderizarProductos(productosAMostrar = null) {
    // 📊 Determinar qué productos mostrar
    const productos = productosAMostrar || this.productos;
    const contenedor = document.getElementById('productos-container');
    
    // 🔍 Validación de existencia del contenedor
    if (!contenedor) {
      console.warn('⚠️ Contenedor productos-container no encontrado');
      return;
    }

    // 🧹 Limpiar contenedor antes de renderizar
    contenedor.innerHTML = '';

    console.log(`🎨 Renderizando ${productos.length} productos`);

    // 🔄 Crear y agregar cada tarjeta de producto
    productos.forEach(producto => {
      const productCard = this.crearTarjetaProducto(producto);
      contenedor.appendChild(productCard);
    });
  }

  // 🏗️ CREACIÓN DE TARJETA DE PRODUCTO INDIVIDUAL
  // Genera el HTML completo para un producto específico
  // Incluye imagen, precio, descuentos, stock y botones
  crearTarjetaProducto(producto) {
    // 📦 Container principal de la tarjeta
    const productCard = document.createElement('div');
    productCard.className = 'col-12 col-lg-6 col-xl-4';
    productCard.style.cssText = `
      display: flex;
      margin-bottom: 2rem;
    `;

    // 🏷️ Badge de descuento (si aplica)
    const discountBadge = producto.descuento > 0 ? 
      `<span class="badge-descuento position-absolute">${producto.descuento}% OFF</span>` : '';

    // 💰 Precio original tachado (si hay descuento)
    const originalPriceDisplay = producto.precioOriginal ? 
      `<span class="card-price-old" style="font-size:1rem; color:#888; text-decoration: line-through; margin-left: 8px;">$${producto.precioOriginal.toLocaleString()}</span>` : '';

    // ⚠️ Advertencia de stock bajo
    const lowStockWarning = producto.stock < 5 ? 
      `<small class="text-warning d-block" style="color: #e67e22 !important; font-weight: 600;">¡Últimas ${producto.stock} unidades!</small>` : '';

    const isOutOfStock = !producto.disponible || producto.stock === 0;
    const addToCartButtonText = isOutOfStock ? 'Sin stock' : 'Agregar al carrito';

    // Generar estrellas de calificación (simulada)
    const rating = 4.5; // Simulamos una calificación
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="bi bi-star-fill text-warning"></i>';
    }
    if (hasHalfStar) {
      starsHTML += '<i class="bi bi-star-half text-warning"></i>';
    }
    for (let i = Math.ceil(rating); i < 5; i++) {
      starsHTML += '<i class="bi bi-star text-warning"></i>';
    }

    // Características como lista
    const caracteristicasHTML = (producto.caracteristicas || []).map(caracteristica => 
      `<li class="mb-1"><i class="bi bi-check-circle text-success me-2"></i>${caracteristica}</li>`
    ).join('');

    // Reseñas simuladas - cargar desde localStorage si existen
    const resenasGuardadas = JSON.parse(localStorage.getItem(`resenas_producto_${producto.id}`) || '[]');
    const resenasSimuladas = [
      { autor: "María G.", comentario: "Excelente calidad, muy contenta con la compra.", rating: 5, fecha: "hace 2 semanas" },
      { autor: "Carlos R.", comentario: "Hermoso diseño patagónico, lo recomiendo.", rating: 4, fecha: "hace 1 mes" },
      { autor: "Ana L.", comentario: "Perfecto para regalo, llegó en perfectas condiciones.", rating: 5, fecha: "hace 3 semanas" },
      ...resenasGuardadas // Agregar reseñas de usuarios reales
    ];

    const resenasHTML = resenasSimuladas.map(resena => `
      <div class="border-bottom py-2">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong class="small">${resena.autor}</strong>
          <div class="d-flex align-items-center">
            <div class="text-warning small me-2">
              ${Array(resena.rating).fill('<i class="bi bi-star-fill"></i>').join('')}
              ${Array(5 - resena.rating).fill('<i class="bi bi-star text-muted"></i>').join('')}
            </div>
            <small class="text-muted">${resena.fecha}</small>
          </div>
        </div>
        <p class="small mb-0 text-muted">"${resena.comentario}"</p>
      </div>
    `).join('');

    // Verificar si el usuario está logueado
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const canWriteReview = currentUser && currentUser.loggedIn && currentUser.canReview;

    const formularioResenaHTML = canWriteReview ? `
      <div class="mt-3 p-3" style="background-color: #f8f9fa; border-radius: 8px;">
        <h6 class="fw-bold mb-3">
          <i class="bi bi-chat-quote me-2"></i>Escribir reseña
        </h6>
        <form id="resena-form-${producto.id}" onsubmit="store.enviarResena(event, ${producto.id})">
          <div class="mb-2">
            <label class="small fw-bold">Calificación:</label>
            <div class="rating-input" data-product="${producto.id}">
              ${[1,2,3,4,5].map(star => `
                <i class="bi bi-star rating-star" data-rating="${star}" 
                   style="cursor: pointer; color: #ddd; font-size: 1.2rem;" 
                   onclick="store.setRating(${producto.id}, ${star})"></i>
              `).join('')}
            </div>
            <input type="hidden" id="rating-${producto.id}" value="5">
          </div>
          <div class="mb-2">
            <textarea class="form-control form-control-sm" 
                      id="comentario-${producto.id}" 
                      placeholder="Comparte tu experiencia con este producto..." 
                      rows="2" 
                      maxlength="200" 
                      required></textarea>
            <small class="text-muted">Máximo 200 caracteres</small>
          </div>
          <button type="submit" class="btn btn-sm" 
                  style="background: linear-gradient(135deg, #3b5d50, #2c5530); color: white; border: none;">
            <i class="bi bi-send me-1"></i>Enviar reseña
          </button>
        </form>
      </div>
    ` : `
      <div class="mt-3 p-3 text-center" style="background-color: #f8f9fa; border-radius: 8px;">
        <small class="text-muted">
          <i class="bi bi-info-circle me-1"></i>
          <a href="#" onclick="document.querySelector('[data-bs-target=\\\"#simpleLoginModal\\\"]').click(); return false;" 
             style="color: var(--primary-color); text-decoration: none;">
            Inicia sesión
          </a> para escribir una reseña
        </small>
      </div>
    `;

    productCard.innerHTML = `
      <div class="card h-100 border-0 position-relative overflow-hidden card-producto" 
           data-product-id="${producto.id}" 
           style="box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 16px; background: white; max-width: 100%; width: 100%;">
        
        <!-- Galería de imágenes del producto -->
        <div class="position-relative" style="height:250px; border-radius: 16px 16px 0 0;">
          
          <div id="carousel-${producto.id}" class="carousel slide h-100" data-bs-ride="false">>
            <div class="carousel-inner h-100" style="border-radius: 16px 16px 0 0;">
              ${producto.imagenes.map((imagen, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''} h-100">
                  <img src="${imagen}" 
                       class="d-block w-100 h-100" 
                       alt="${producto.nombre} - Imagen ${index + 1}" 
                       style="object-fit: cover; border-radius: 16px 16px 0 0;"
                       onerror="this.src='pages/no-image.png'">
                </div>
              `).join('')}
            </div>
            
            ${producto.imagenes.length > 1 ? `
              <!-- Controles de navegación -->
              <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${producto.id}" data-bs-slide="prev"
                      style="width: 40px; background: rgba(0,0,0,0.3); border-radius: 0 8px 8px 0; left: 5px;">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Anterior</span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#carousel-${producto.id}" data-bs-slide="next"
                      style="width: 40px; background: rgba(0,0,0,0.3); border-radius: 8px 0 0 8px; right: 5px;">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Siguiente</span>
              </button>
              
              <!-- Indicadores de imagen -->
              <div class="carousel-indicators" style="bottom: 10px; margin-bottom: 0;">
                ${producto.imagenes.map((_, index) => `
                  <button type="button" data-bs-target="#carousel-${producto.id}" 
                          data-bs-slide-to="${index}" 
                          ${index === 0 ? 'class="active" aria-current="true"' : ''}
                          aria-label="Imagen ${index + 1}"
                          style="width: 8px; height: 8px; border-radius: 50%; margin: 0 2px; background-color: white; opacity: ${index === 0 ? '1' : '0.5'};">
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>
          
          ${discountBadge}
          
          ${producto.imagenes.length > 1 ? `
            <!-- Contador de imágenes -->
            <div class="position-absolute top-0 end-0 m-2">
              <span class="badge bg-dark bg-opacity-75 rounded-pill">
                <i class="bi bi-images me-1"></i>${producto.imagenes.length} fotos
              </span>
            </div>
          ` : ''}
        </div>
        
        <div class="card-body d-flex flex-column p-4">
          <!-- Título y precio -->
          <h5 class="card-title mb-2" style="font-weight:700; color:#1f3c5a; font-size:1.2rem;">${producto.nombre}</h5>
          
          <!-- Calificación -->
          <div class="mb-3 d-flex align-items-center">
            <div class="me-2">${starsHTML}</div>
            <small class="text-muted">${rating}/5 (${resenasSimuladas.length} reseñas)</small>
          </div>
          
          <div class="mb-3">
            <span class="card-price d-inline" style="font-size:1.4rem; color:#2c5530; font-weight:700;">$${producto.precio.toLocaleString()}</span>
            ${originalPriceDisplay}
          </div>
          ${lowStockWarning}
          
          <!-- Descripción completa -->
          <div class="mb-3">
            <h6 class="fw-bold text-dark mb-2">Descripción</h6>
            <p class="text-muted small mb-0">${producto.descripcionLarga || producto.descripcionCorta}</p>
          </div>
          
          <!-- Características -->
          ${producto.caracteristicas ? `
          <div class="mb-3">
            <h6 class="fw-bold text-dark mb-2">Características</h6>
            <ul class="list-unstyled small">
              ${caracteristicasHTML}
            </ul>
          </div>
          ` : ''}
          
          <!-- Reseñas -->
          <div class="mb-3">
            <h6 class="fw-bold text-dark mb-2">Reseñas de clientes</h6>
            <div id="resenas-container-${producto.id}" style="max-height: 200px; overflow-y: auto;">
              ${resenasHTML}
            </div>
            ${formularioResenaHTML}
          </div>
          
          <!-- Botones de acción -->
          <div class="mt-auto">
            <!-- Botón de agregar al carrito -->
            <button class="btn w-100 btn-agregar-carrito mb-2" 
                    style="background: linear-gradient(135deg, #3b5d50, #2c5530); color: white; font-weight: 600; border: none; padding: 12px; font-size: 1rem;"
                    data-product-id="${producto.id}"
                    data-quantity="1"
                    ${isOutOfStock ? 'disabled' : ''}
                    onclick="store.agregarAlCarrito(${producto.id})"
                    onmouseover="if(!this.disabled) this.style.background='linear-gradient(135deg, #2c5530, #1d3a22)'"
                    onmouseout="if(!this.disabled) this.style.background='linear-gradient(135deg, #3b5d50, #2c5530)'">
              <i class="bi bi-cart-plus me-2"></i> ${addToCartButtonText}
            </button>
          </div>
        </div>
      </div>
    `;

    return productCard;
  }

  // 🛒 AGREGAR PRODUCTO AL CARRITO
  // Gestiona la lógica completa de añadir productos
  // Incluye validaciones de stock, duplicados y persistencia
  agregarAlCarrito(productoId) {
    try {
      // 🔍 Encontrar el producto en el catálogo
      const producto = this.productos.find(p => p.id === productoId);
      
      // ✅ Validaciones de disponibilidad y stock
      if (!producto || !producto.disponible || producto.stock === 0) {
        this.mostrarNotificacion('❌ Producto no disponible', 'error');
        return;
      }

      // 📦 Obtener carrito actual del localStorage
      let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
      
      // 🔍 Buscar si el producto ya está en el carrito
      const itemExistente = carrito.find(item => item.id === productoId);
      
      if (itemExistente) {
        // Si ya existe, incrementar cantidad
        if (itemExistente.cantidad >= producto.stock) {
          return;
        }
        itemExistente.cantidad++;
      } else {
        // Si no existe, agregarlo
        carrito.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagenes ? producto.imagenes[0] : 'pages/logo sin fondo (1).png',
          cantidad: 1,
          sku: producto.sku || producto.id
        });
      }

      // Guardar el carrito actualizado
      localStorage.setItem('carrito', JSON.stringify(carrito));
      
      // Actualizar la variable local del carrito
      this.carrito = carrito;
      
      // Actualizar contador y mostrar notificación
      this.actualizarContadorCarrito();
      this.mostrarNotificacion('¡Agregado! ✅', 'success');
      
      // Actualizar modal del carrito si está disponible
      if (window.universalModals && typeof window.universalModals.updateCartModal === 'function') {
        window.universalModals.updateCartModal();
      }
      
      console.log('✅ Producto agregado al carrito:', producto.nombre);
      
    } catch (error) {
      console.error('❌ Error agregando producto al carrito:', error);
    }
  }

  eliminarDelCarrito(productoId) {
    this.carrito = this.carrito.filter(item => item.id !== productoId);
    this.guardarCarrito();
    this.actualizarContadorCarrito();
    this.renderizarCarrito();
  }

  cambiarCantidad(productoId, nuevaCantidad) {
    const item = this.carrito.find(item => item.id === productoId);
    const producto = this.productos.find(p => p.id === productoId);
    
    if (item && producto) {
      if (nuevaCantidad > producto.stock) {
        this.mostrarNotificacion('¡Ups! No hay más stock 📦', 'warning');
        return;
      }
      if (nuevaCantidad <= 0) {
        this.eliminarDelCarrito(productoId);
        return;
      }
      item.cantidad = nuevaCantidad;
      this.guardarCarrito();
      this.actualizarContadorCarrito();
      this.renderizarCarrito();
    }
  }

  // 🧮 CALCULAR TOTAL DEL CARRITO
  // Suma todos los productos con sus cantidades respectivas
  calcularTotal() {
    return this.carrito.reduce((total, item) => {
      // 💰 total acumulado + (precio × cantidad)
      return total + (item.precio * item.cantidad);
    }, 0);
  }

  calcularDescuentoTransferencia() {
    const total = this.calcularTotal();
    
    // Validación de casos edge
    if (total <= 0) {
      console.warn('⚠️ Total del carrito es 0 o negativo:', total);
      return 0;
    }
    
    const porcentaje = this.configuracion?.descuentoTransferencia || 10;
    
    // Validar porcentaje válido
    if (porcentaje <= 0) {
      console.warn('⚠️ Porcentaje de descuento inválido:', porcentaje);
      return 0;
    }
    
    if (porcentaje >= 100) {
      console.warn('⚠️ Porcentaje de descuento >= 100%:', porcentaje);
      return total; // Descuento total
    }
    
    const descuento = Math.round(total * porcentaje / 100);
    console.log(`💰 Descuento calculado: ${porcentaje}% de $${total.toLocaleString()} = $${descuento.toLocaleString()}`);
    
    return descuento;
  }

  buscarProductos(termino) {
    // Validación de entrada
    if (!termino || typeof termino !== 'string') {
      console.warn('⚠️ buscarProductos: término de búsqueda inválido', termino);
      return [];
    }
    
    const terminoLimpio = termino.trim();
    if (terminoLimpio.length < 2) {
      console.log('ℹ️ buscarProductos: término muy corto, mínimo 2 caracteres');
      return [];
    }
    
    const terminoLower = terminoLimpio.toLowerCase();
    const resultados = this.productos.filter(producto => 
      producto.nombre?.toLowerCase().includes(terminoLower) ||
      producto.descripcionCorta?.toLowerCase().includes(terminoLower) ||
      producto.tags?.some(tag => tag.toLowerCase().includes(terminoLower))
    );
    
    console.log(`🔍 Búsqueda: "${terminoLimpio}" encontró ${resultados.length} productos`);
    return resultados;
  }

  filtrarPorCategoria(categoria) {
    if (!categoria || categoria === 'todos') {
      return this.productos;
    }
    return this.productos.filter(producto => producto.categoria === categoria);
  }

  filtrarPorPrecio(min, max) {
    // Validación de parámetros
    if (typeof min !== 'number' || typeof max !== 'number') {
      console.error('❌ filtrarPorPrecio: min y max deben ser números', { min, max });
      return this.productos;
    }
    
    if (min < 0 || max < 0) {
      console.warn('⚠️ filtrarPorPrecio: valores negativos no permitidos', { min, max });
      return this.productos;
    }
    
    if (min > max) {
      console.warn('⚠️ filtrarPorPrecio: min no puede ser mayor que max', { min, max });
      [min, max] = [max, min]; // Intercambiar valores
    }
    
    const resultados = this.productos.filter(producto => 
      producto.precio >= min && producto.precio <= max
    );
    
    console.log(`🔍 Filtro por precio: $${min.toLocaleString()} - $${max.toLocaleString()}: ${resultados.length} productos`);
    return resultados;
  }

  verDetalleProducto(productoId) {
    const producto = this.productos.find(p => p.id === productoId);
    if (producto) {
      // Crear URL amigable para el producto
      const url = `producto.html?id=${productoId}&slug=${producto.slug || ''}`;
      window.location.href = url;
    }
  }

  guardarCarrito() {
    // Siempre usar 'carrito' como key para consistencia
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }

  actualizarContadorCarrito() {
    try {
      // Leer directamente del localStorage para máxima consistencia
      const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
      const contador = document.getElementById('cart-count');
      
      if (contador) {
        const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'inline-block' : 'none';
      }

      // Actualizar navbar si existe
      if (window.universalNavbar && typeof window.universalNavbar.refreshCartCounter === 'function') {
        window.universalNavbar.refreshCartCounter();
      }

      // Actualizar modal del carrito si está disponible
      if (window.universalModals && typeof window.universalModals.updateCartModal === 'function') {
        window.universalModals.updateCartModal();
      }
    } catch (error) {
      console.error('Error actualizando contador del carrito:', error);
    }
  }

  renderizarCarrito() {
    const contenedor = document.getElementById('carrito-contenido');
    if (!contenedor) return;

    // Siempre leer del localStorage para tener datos actualizados
    this.carrito = JSON.parse(localStorage.getItem('carrito') || '[]');

    if (this.carrito.length === 0) {
      contenedor.innerHTML = `
        <div class="carrito-vacio">
          <i class="bi bi-cart-x" style="font-size:2.5rem;"></i><br>
          Tu carrito está vacío.
        </div>
      `;
      return;
    }

    const total = this.calcularTotal();
    const descuentoTransferencia = this.calcularDescuentoTransferencia();

    let html = `
      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th></th>
              <th>Producto</th>
              <th class="text-center">Cantidad</th>
              <th class="text-end">Precio</th>
              <th class="text-end">Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
    `;

    this.carrito.forEach(item => {
      const subtotal = item.precio * item.cantidad;
      html += `
        <tr>
          <td>
            <img src="${item.imagen}" alt="${item.nombre}" class="carrito-producto-img">
          </td>
          <td class="carrito-producto-nombre">${item.nombre}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-secondary" onclick="store.cambiarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
            <input type="number" min="1" class="carrito-cantidad-input" value="${item.cantidad}" onchange="store.cambiarCantidad(${item.id}, parseInt(this.value))">
            <button class="btn btn-sm btn-outline-secondary" onclick="store.cambiarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
          </td>
          <td class="text-end carrito-producto-precio">$${item.precio.toLocaleString()}</td>
          <td class="text-end carrito-producto-precio">$${subtotal.toLocaleString()}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-danger" title="Eliminar" onclick="store.eliminarDelCarrito(${item.id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
      <div class="carrito-total">Total: $${total.toLocaleString()}</div>
      <div class="text-muted mb-3">
        <small><i class="bi bi-percent"></i> Con transferencia: $${(total - descuentoTransferencia).toLocaleString()} (${this.configuracion.descuentoTransferencia || 10}% off)</small>
      </div>
      <button class="btn-carrito" onclick="store.irACheckout()">
        <i class="bi bi-bag-check"></i> Finalizar compra
      </button>
      <button class="btn-vaciar" onclick="store.vaciarCarrito()">
        <i class="bi bi-trash"></i> Vaciar carrito
      </button>
    `;

    contenedor.innerHTML = html;
  }

  vaciarCarrito() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this.carrito = [];
      this.guardarCarrito();
      this.actualizarContadorCarrito();
      this.renderizarCarrito();
    }
  }

  irACheckout() {
    if (this.carrito.length === 0) {
      return;
    }
    window.location.href = 'checkout.html';
  }

  // 🌟 FUNCIONES PARA SISTEMA DE RESEÑAS
  setRating(productoId, rating) {
    // Actualizar estrellas visualmente
    const ratingContainer = document.querySelector(`.rating-input[data-product="${productoId}"]`);
    if (ratingContainer) {
      const stars = ratingContainer.querySelectorAll('.rating-star');
      stars.forEach((star, index) => {
        if (index < rating) {
          star.className = 'bi bi-star-fill rating-star';
          star.style.color = '#ffc107';
        } else {
          star.className = 'bi bi-star rating-star';
          star.style.color = '#ddd';
        }
      });
    }
    
    // Guardar rating seleccionado
    const ratingInput = document.getElementById(`rating-${productoId}`);
    if (ratingInput) {
      ratingInput.value = rating;
    }
  }

  enviarResena(event, productoId) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser || !currentUser.loggedIn) {
      alert('❌ Debes iniciar sesión para escribir reseñas');
      return;
    }

    const rating = parseInt(document.getElementById(`rating-${productoId}`).value);
    const comentario = document.getElementById(`comentario-${productoId}`).value.trim();

    if (!comentario) {
      alert('❌ Por favor escribe un comentario');
      return;
    }

    if (comentario.length > 200) {
      alert('❌ El comentario no puede superar los 200 caracteres');
      return;
    }

    // Crear nueva reseña
    const nuevaResena = {
      autor: currentUser.nombre,
      comentario: comentario,
      rating: rating,
      fecha: 'ahora mismo',
      timestamp: Date.now()
    };

    // Guardar en localStorage
    const resenasExistentes = JSON.parse(localStorage.getItem(`resenas_producto_${productoId}`) || '[]');
    resenasExistentes.unshift(nuevaResena); // Agregar al principio
    
    // Mantener solo las 10 reseñas más recientes
    if (resenasExistentes.length > 10) {
      resenasExistentes.splice(10);
    }
    
    localStorage.setItem(`resenas_producto_${productoId}`, JSON.stringify(resenasExistentes));

    // Limpiar formulario
    document.getElementById(`comentario-${productoId}`).value = '';
    this.setRating(productoId, 5);

    // Actualizar la visualización de reseñas
    this.actualizarResenasProducto(productoId);

    // Mostrar notificación elegante si está disponible, sino usar alert
    if (typeof showNotification === 'function') {
      showNotification('success', '¡Reseña enviada!', 'Gracias por compartir tu opinión 🌟', 4000);
    } else {
      alert('✅ ¡Reseña enviada exitosamente! Gracias por tu opinión 🌟');
    }
  }

  actualizarResenasProducto(productoId) {
    // Recargar todas las reseñas para este producto
    const resenasGuardadas = JSON.parse(localStorage.getItem(`resenas_producto_${productoId}`) || '[]');
    const resenasSimuladas = [
      { autor: "María G.", comentario: "Excelente calidad, muy contenta con la compra.", rating: 5, fecha: "hace 2 semanas" },
      { autor: "Carlos R.", comentario: "Hermoso diseño patagónico, lo recomiendo.", rating: 4, fecha: "hace 1 mes" },
      { autor: "Ana L.", comentario: "Perfecto para regalo, llegó en perfectas condiciones.", rating: 5, fecha: "hace 3 semanas" },
      ...resenasGuardadas
    ];

    const resenasHTML = resenasSimuladas.map(resena => `
      <div class="border-bottom py-2">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <strong class="small">${resena.autor}</strong>
          <div class="d-flex align-items-center">
            <div class="text-warning small me-2">
              ${Array(resena.rating).fill('<i class="bi bi-star-fill"></i>').join('')}
              ${Array(5 - resena.rating).fill('<i class="bi bi-star text-muted"></i>').join('')}
            </div>
            <small class="text-muted">${resena.fecha}</small>
          </div>
        </div>
        <p class="small mb-0 text-muted">"${resena.comentario}"</p>
      </div>
    `).join('');

    // Actualizar el contenedor de reseñas
    const contenedor = document.getElementById(`resenas-container-${productoId}`);
    if (contenedor) {
      contenedor.innerHTML = resenasHTML;
    }
  }

  inicializarEventos() {
    // ⚠️ BÚSQUEDA DESHABILITADA: Ya no existe navbar con búsqueda
    // Buscador comentado para evitar errores
    /*
    const buscador = document.querySelector('input[type="search"]');
    if (buscador) {
      buscador.addEventListener('input', (e) => {
        const termino = e.target.value.trim();
        if (termino.length >= 2) {
          const resultados = this.buscarProductos(termino);
          this.renderizarProductos(resultados);
        } else if (termino.length === 0) {
          this.renderizarProductos();
        }
      });
    }

    // Formulario de búsqueda
    const formBusqueda = document.querySelector('form[role="search"]');
    if (formBusqueda) {
      formBusqueda.addEventListener('submit', (e) => {
        e.preventDefault();
        const termino = buscador.value.trim();
        if (termino) {
          const resultados = this.buscarProductos(termino);
          this.renderizarProductos(resultados);
        }
      });
    }
    */
  }

  getColorNotificacion(tipo) {
    const colores = {
      success: '#28a745',
      error: '#dc3545', 
      warning: '#ff8c00',
      info: '#007bff'
    };
    return colores[tipo] || '#007bff';
  }
}

// Inicializar la tienda cuando se carga el documento
let store;
document.addEventListener('DOMContentLoaded', () => {
  store = new PatagoniaStore();
});

// Exportar para uso global
window.PatagoniaStore = PatagoniaStore;