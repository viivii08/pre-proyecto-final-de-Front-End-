// ===================================================================
// EJEMPLO DE IMPLEMENTACIÓN DE MEJORAS EN STORE.JS
// ===================================================================

// Asegúrate de que code-improvements.js esté cargado antes que este archivo
// <script src="js/code-improvements.js"></script>
// <script src="js/store-improved.js"></script>

class PatagoniaStoreImproved extends PatagoniaStore {
  constructor() {
    super();
    
    // Configurar logging para desarrollo
    if (DevUtils.isDevelopment()) {
      PatagoniaLogger.currentLevel = PatagoniaLogger.LOG_LEVELS.DEBUG;
    }
    
    PatagoniaLogger.info('PatagoniaStore inicializada con mejoras');
  }
  
  // ===================================================================
  // MÉTODOS MEJORADOS CON VALIDACIONES Y LOGGING
  // ===================================================================
  
  async cargarProductos() {
    const startTime = performance.now();
    
    try {
      PatagoniaLogger.debug('Iniciando carga de productos');
      
      const response = await fetch('./data/productos.json');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const productCatalogData = await response.json();
      
      // Validar estructura de datos
      if (!productCatalogData.productos || !Array.isArray(productCatalogData.productos)) {
        throw new Error('Estructura de datos de productos inválida');
      }
      
      this.productos = productCatalogData.productos;
      this.categorias = productCatalogData.categorias || [];
      this.configuracion = productCatalogData.configuracion || {};
      
      PatagoniaLogger.info('Productos cargados exitosamente', {
        totalProductos: this.productos.length,
        categorias: this.categorias.length,
        tieneConfiguracion: !!Object.keys(this.configuracion).length
      });
      
    } catch (error) {
      PatagoniaLogger.error('Error al cargar productos, usando fallback');
      ErrorHandler.handleError(error, 'cargarProductos', true, this);
      this.productosFallback();
    } finally {
      PatagoniaLogger.performance('Cargar productos', startTime);
    }
  }
  
  agregarAlCarrito(productoId) {
    const startTime = performance.now();
    
    try {
      PatagoniaLogger.debug('Iniciando agregar al carrito', { 
        productoId,
        carritoActual: this.carrito.length 
      });
      
      const producto = this.productos.find(p => p.id === productoId);
      
      // Usar validador reutilizable
      const validation = ProductValidator.validateCartOperation(producto, 1);
      if (!validation.isValid) {
        PatagoniaLogger.warn('Validación de producto fallida', {
          productoId,
          error: validation.message,
          code: validation.code
        });
        this.mostrarNotificacion(validation.message, 'warning');
        return false;
      }
      
      const itemCarritoExistente = this.carrito.find(item => item.id === productoId);
      
      if (itemCarritoExistente) {
        // Validar nueva cantidad
        const nuevaCantidad = itemCarritoExistente.cantidad + 1;
        const quantityValidation = ProductValidator.validateCartOperation(producto, nuevaCantidad);
        
        if (!quantityValidation.isValid) {
          PatagoniaLogger.warn('Validación de cantidad fallida', quantityValidation);
          this.mostrarNotificacion(quantityValidation.message, 'warning');
          return false;
        }
        
        itemCarritoExistente.cantidad = nuevaCantidad;
        
        PatagoniaLogger.info('Cantidad aumentada en carrito', {
          producto: producto.nombre,
          nuevaCantidad: nuevaCantidad
        });
      } else {
        const nuevoItemCarrito = {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagenes?.[0] || 'pages/no-image.png',
          cantidad: 1,
          sku: producto.sku,
          fechaAgregado: new Date().toISOString()
        };
        
        this.carrito.push(nuevoItemCarrito);
        
        PatagoniaLogger.info('Producto agregado al carrito', {
          producto: producto.nombre,
          precio: FormatUtils.formatPrice(producto.precio)
        });
      }

      this.guardarCarrito();
      this.actualizarContadorCarrito();
      
      this.mostrarNotificacion(
        `${producto.nombre} agregado al carrito`, 
        'success'
      );
      
      return true;
      
    } catch (error) {
      ErrorHandler.handleError(error, 'agregarAlCarrito', true, this);
      return false;
    } finally {
      PatagoniaLogger.performance('Agregar al carrito', startTime);
    }
  }
  
  cambiarCantidad(productoId, nuevaCantidad) {
    const startTime = performance.now();
    
    try {
      PatagoniaLogger.debug('Cambiando cantidad', { productoId, nuevaCantidad });
      
      const itemCarrito = this.carrito.find(item => item.id === productoId);
      const producto = this.productos.find(p => p.id === productoId);
      
      if (!itemCarrito) {
        PatagoniaLogger.warn('Item no encontrado en carrito', { productoId });
        this.mostrarNotificacion('Producto no encontrado en carrito', 'warning');
        return false;
      }
      
      // Validar nueva cantidad
      const validation = ProductValidator.validateCartOperation(producto, nuevaCantidad);
      if (!validation.isValid) {
        PatagoniaLogger.warn('Validación de cantidad fallida', validation);
        this.mostrarNotificacion(validation.message, 'warning');
        
        // Restaurar cantidad anterior en la UI
        const inputElement = document.querySelector(`input[value="${nuevaCantidad}"]`);
        if (inputElement) {
          inputElement.value = itemCarrito.cantidad;
        }
        return false;
      }
      
      if (nuevaCantidad === 0) {
        this.eliminarDelCarrito(productoId);
        return true;
      }
      
      const cantidadAnterior = itemCarrito.cantidad;
      itemCarrito.cantidad = nuevaCantidad;
      itemCarrito.fechaModificado = new Date().toISOString();
      
      this.guardarCarrito();
      this.actualizarContadorCarrito();
      this.renderizarCarrito();
      
      PatagoniaLogger.info('Cantidad cambiada exitosamente', {
        producto: producto.nombre,
        cantidadAnterior,
        cantidadNueva: nuevaCantidad,
        diferencia: nuevaCantidad - cantidadAnterior
      });
      
      return true;
      
    } catch (error) {
      ErrorHandler.handleError(error, 'cambiarCantidad', true, this);
      return false;
    } finally {
      PatagoniaLogger.performance('Cambiar cantidad', startTime);
    }
  }
  
  renderizarProductos(productosAMostrar = null) {
    const productos = productosAMostrar || this.productos;
    const contenedor = document.getElementById('productos-container');
    
    PatagoniaLogger.debug('Renderizando productos', { 
      cantidad: productos?.length || 0 
    });
    
    RenderOptimizer.renderProductsOptimized(
      productos,
      contenedor,
      (producto) => this.crearTarjetaProducto(producto)
    );
  }
  
  crearTarjetaProducto(producto) {
    try {
      const productCardColumn = document.createElement('div');
      productCardColumn.className = 'col';

      // Usar utilidades de formato mejoradas
      const stockInfo = FormatUtils.formatStock(producto.stock);
      const precioFormateado = FormatUtils.formatPrice(producto.precio);
      const descuentoInfo = FormatUtils.formatDiscount(producto.precioOriginal, producto.precio);

      const descuentoBadge = descuentoInfo ? 
        `<span class="badge-descuento position-absolute">${descuentoInfo.formatted}</span>` : '';

      const precioOriginalHTML = descuentoInfo ? 
        `<span class="card-price-old" style="font-size:1.05rem;">${FormatUtils.formatPrice(producto.precioOriginal)}</span>` : '';

      productCardColumn.innerHTML = `
        <div class="card h-100 shadow-lg border-0 position-relative overflow-hidden card-producto" 
             data-producto-id="${producto.id}"
             data-categoria="${producto.categoria}"
             data-precio="${producto.precio}">
          <div class="overflow-hidden rounded-top" style="height:260px;">
            <img src="${producto.imagenes?.[0] || 'pages/no-image.png'}" 
                 class="card-img-top" 
                 alt="Imagen de ${producto.nombre}"
                 loading="lazy"
                 onerror="this.src='pages/no-image.png'; this.onerror=null;">
            ${descuentoBadge}
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title mb-2" style="font-weight:700; color:#1f3c5a; font-size:1.35rem;">
              ${producto.nombre}
            </h5>
            <p class="card-text mb-3" style="color:#444;">
              ${producto.descripcionCorta}
            </p>
            <div class="mb-3">
              <span class="card-price" style="font-size:1.3rem; color:#3b5d50; font-weight:700;">
                ${precioFormateado}
              </span>
              ${precioOriginalHTML}
              ${descuentoInfo ? `<br><small class="text-success">${descuentoInfo.savings}</small>` : ''}
            </div>
            <div class="mb-3">
              <small class="badge bg-${stockInfo.color}">${stockInfo.text}</small>
            </div>
            <div class="mt-auto">
              <div class="d-flex gap-2 mb-2">
                <button class="btn btn-outline-primary flex-grow-1" 
                        onclick="store.verDetalleProducto(${producto.id})"
                        aria-label="Ver detalles de ${producto.nombre}">
                  <i class="bi bi-eye" aria-hidden="true"></i> Ver más
                </button>
              </div>
              <button class="btn btn-primary agregar-carrito-btn w-100" 
                      onclick="store.agregarAlCarrito(${producto.id})" 
                      ${!producto.disponible || producto.stock === 0 ? 'disabled' : ''}
                      aria-label="Agregar ${producto.nombre} al carrito">
                <i class="bi bi-cart-plus" aria-hidden="true"></i> 
                ${producto.disponible && producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
              </button>
            </div>
          </div>
        </div>
      `;

      return productCardColumn;
      
    } catch (error) {
      ErrorHandler.handleError(error, `crearTarjetaProducto - ID: ${producto?.id}`, false);
      
      // Retornar tarjeta de error como fallback
      const errorCard = document.createElement('div');
      errorCard.className = 'col';
      errorCard.innerHTML = `
        <div class="card h-100 border-danger">
          <div class="card-body text-center">
            <i class="bi bi-exclamation-triangle text-danger" style="font-size: 2rem;"></i>
            <h6 class="card-title text-danger">Error al cargar producto</h6>
            <p class="card-text small">ID: ${producto?.id || 'desconocido'}</p>
          </div>
        </div>
      `;
      return errorCard;
    }
  }
  
  buscarProductos(termino) {
    const startTime = performance.now();
    
    try {
      // Validar término de búsqueda
      const validation = ProductValidator.validateSearchTerm(termino);
      if (!validation.isValid) {
        PatagoniaLogger.warn('Término de búsqueda inválido', { termino, error: validation.message });
        return [];
      }
      
      const terminoSanitizado = FormatUtils.sanitizeSearchTerm(termino);
      
      PatagoniaLogger.debug('Ejecutando búsqueda', { 
        terminoOriginal: termino,
        terminoSanitizado: terminoSanitizado
      });
      
      const resultados = this.productos.filter(producto => {
        const nombreMatch = producto.nombre.toLowerCase().includes(terminoSanitizado);
        const descripcionMatch = producto.descripcionCorta.toLowerCase().includes(terminoSanitizado);
        const tagsMatch = producto.tags?.some(tag => 
          tag.toLowerCase().includes(terminoSanitizado)
        );
        const categoriaMatch = producto.categoria.toLowerCase().includes(terminoSanitizado);
        
        return nombreMatch || descripcionMatch || tagsMatch || categoriaMatch;
      });
      
      PatagoniaLogger.info('Búsqueda completada', {
        termino: terminoSanitizado,
        resultados: resultados.length,
        totalProductos: this.productos.length
      });
      
      return resultados;
      
    } catch (error) {
      ErrorHandler.handleError(error, 'buscarProductos', false);
      return [];
    } finally {
      PatagoniaLogger.performance('Búsqueda de productos', startTime);
    }
  }
  
  // ===================================================================
  // MÉTODOS NUEVOS PARA DEBUGGING Y ESTADÍSTICAS
  // ===================================================================
  
  getCartStatistics() {
    const estadisticas = this.carrito.reduce((stats, item) => {
      stats.totalItems += item.cantidad;
      stats.totalValue += item.precio * item.cantidad;
      stats.uniqueProducts += 1;
      
      // Estadísticas por categoría
      const producto = this.productos.find(p => p.id === item.id);
      const categoria = producto?.categoria || 'Sin categoría';
      
      if (!stats.porCategoria[categoria]) {
        stats.porCategoria[categoria] = { items: 0, valor: 0 };
      }
      
      stats.porCategoria[categoria].items += item.cantidad;
      stats.porCategoria[categoria].valor += item.precio * item.cantidad;
      
      return stats;
    }, {
      totalItems: 0,
      totalValue: 0,
      uniqueProducts: 0,
      averagePrice: 0,
      porCategoria: {}
    });
    
    estadisticas.averagePrice = estadisticas.totalItems > 0 ? 
      estadisticas.totalValue / estadisticas.totalItems : 0;
    
    return estadisticas;
  }
  
  exportCartData() {
    const estadisticas = this.getCartStatistics();
    const datosExportacion = {
      carrito: this.carrito,
      estadisticas,
      timestamp: new Date().toISOString(),
      total: FormatUtils.formatPrice(estadisticas.totalValue)
    };
    
    PatagoniaLogger.info('Datos del carrito exportados', datosExportacion);
    
    if (DevUtils.isDevelopment()) {
      console.group('📊 DATOS DE EXPORTACIÓN DEL CARRITO');
      console.table(this.carrito);
      console.table(estadisticas.porCategoria);
      console.groupEnd();
    }
    
    return datosExportacion;
  }
  
  // Debug helper para mostrar estado completo
  debugCompleto() {
    PatagoniaLogger.debugDashboard(this, window.userManager);
  }
  
  // ===================================================================
  // INICIALIZACIÓN CON BÚSQUEDA OPTIMIZADA
  // ===================================================================
  
  inicializarEventos() {
    super.inicializarEventos();
    
    // Reemplazar búsqueda básica con versión optimizada con debounce
    const buscadorInput = document.querySelector('input[type="search"]');
    if (buscadorInput) {
      PatagoniaLogger.debug('Configurando búsqueda optimizada con debounce');
      
      const busquedaOptimizada = RenderOptimizer.createDebouncedSearch(
        (termino) => {
          if (termino.trim() === '') {
            this.renderizarProductos();
          } else {
            const resultados = this.buscarProductos(termino);
            this.renderizarProductos(resultados);
          }
        },
        300 // 300ms de delay
      );
      
      buscadorInput.removeEventListener('input', this._originalSearchHandler);
      buscadorInput.addEventListener('input', (e) => {
        busquedaOptimizada(e.target.value);
      });
    }
  }
}

// ===================================================================
// REEMPLAZAR LA INSTANCIA GLOBAL
// ===================================================================

// Guardar referencia al constructor original
window.PatagoniaStoreOriginal = PatagoniaStore;

// Usar la versión mejorada
window.PatagoniaStore = PatagoniaStoreImproved;

// Reinicializar si ya existe una instancia
if (window.store instanceof PatagoniaStoreOriginal) {
  PatagoniaLogger.info('Actualizando store existente con mejoras');
  
  // Preservar datos existentes
  const carritoActual = window.store.carrito;
  const productosActuales = window.store.productos;
  
  // Crear nueva instancia mejorada
  window.store = new PatagoniaStoreImproved();
  
  // Restaurar datos si existen
  if (carritoActual) window.store.carrito = carritoActual;
  if (productosActuales) window.store.productos = productosActuales;
}

PatagoniaLogger.info('Store mejorado inicializado', {
  version: 'improved',
  debugging: DevUtils.isDevelopment(),
  funcionesExtra: ['getCartStatistics()', 'exportCartData()', 'debugCompleto()']
});

// ===================================================================
// FUNCIONES GLOBALES PARA DEBUGGING (solo en desarrollo)
// ===================================================================

if (DevUtils.isDevelopment()) {
  window.debugStore = () => window.store?.debugCompleto();
  window.exportCart = () => window.store?.exportCartData();
  window.logLevel = (level) => {
    PatagoniaLogger.currentLevel = PatagoniaLogger.LOG_LEVELS[level.toUpperCase()];
    console.log(`✅ Log level cambiado a: ${level.toUpperCase()}`);
  };
  
  console.log(`
🔧 FUNCIONES DE DEBUG DISPONIBLES:
• debugStore() - Mostrar dashboard completo
• exportCart() - Exportar datos del carrito  
• logLevel('debug'|'info'|'warn'|'error') - Cambiar nivel de logging
  `);
}

// Exportar para módulos si es necesario
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PatagoniaStoreImproved;
}