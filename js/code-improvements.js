// ===================================================================
// MEJORAS INMEDIATAS PARA EL CÓDIGO JAVASCRIPT - PATAGONIA STYLE
// ===================================================================

// 1. CLASE DE LOGGING PROFESIONAL
class PatagoniaLogger {
  static LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };
  
  static currentLevel = PatagoniaLogger.LOG_LEVELS.INFO;
  
  static debug(message, data = null) {
    if (this.currentLevel <= this.LOG_LEVELS.DEBUG) {
      console.log(
        `🐛 [DEBUG] ${new Date().toLocaleTimeString()} - ${message}`,
        data ? '\n📊 Data:' : '', data || ''
      );
    }
  }
  
  static info(message, data = null) {
    if (this.currentLevel <= this.LOG_LEVELS.INFO) {
      console.log(
        `ℹ️  [INFO] ${new Date().toLocaleTimeString()} - ${message}`,
        data ? '\n📊 Data:' : '', data || ''
      );
    }
  }
  
  static warn(message, data = null) {
    if (this.currentLevel <= this.LOG_LEVELS.WARN) {
      console.warn(
        `⚠️  [WARN] ${new Date().toLocaleTimeString()} - ${message}`,
        data ? '\n📊 Data:' : '', data || ''
      );
    }
  }
  
  static error(message, error = null, context = null) {
    console.error(`❌ [ERROR] ${new Date().toLocaleTimeString()} - ${message}`);
    if (error) {
      console.error('🔍 Error details:', error);
    }
    if (context) {
      console.error('📍 Context:', context);
    }
  }
  
  static performance(label, startTime) {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    console.log(`⚡ [PERFORMANCE] ${label}: ${duration}ms`);
  }
  
  // Dashboard completo de debug
  static debugDashboard(store, userManager) {
    console.clear();
    console.log(`
╭─────────────────────────────────────────╮
│       🏪 PATAGONIA STYLE DEBUG         │
│           ${new Date().toLocaleString()}              │
╰─────────────────────────────────────────╯`);
    
    console.group('🚀 Estado de la Aplicación');
    console.log(`👤 Usuario logueado: ${userManager?.isLoggedIn() ? '✅ Sí' : '❌ No'}`);
    console.log(`🛒 Items en carrito: ${store?.carrito?.length || 0}`);
    console.log(`📦 Productos cargados: ${store?.productos?.length || 0}`);
    console.groupEnd();
    
    if (store?.carrito?.length > 0) {
      console.group('🛒 CARRITO DETALLADO');
      console.table(
        store.carrito.map(item => ({
          '🆔 ID': item.id,
          '📦 Producto': item.nombre,
          '💰 Precio': `$${item.precio.toLocaleString()}`,
          '🔢 Cantidad': item.cantidad,
          '💵 Subtotal': `$${(item.precio * item.cantidad).toLocaleString()}`
        }))
      );
      console.groupEnd();
    }
    
    if (store?.productos?.length > 0) {
      console.group('📊 ESTADÍSTICAS DE PRODUCTOS');
      const stats = store.productos.reduce((acc, p) => {
        acc.total++;
        if (p.disponible) acc.disponibles++;
        if (p.stock < 5) acc.pocoStock++;
        if (p.descuento > 0) acc.conDescuento++;
        acc.valorTotal += p.precio;
        return acc;
      }, { total: 0, disponibles: 0, pocoStock: 0, conDescuento: 0, valorTotal: 0 });
      
      console.table({
        'Total productos': stats.total,
        'Disponibles': stats.disponibles,
        'Poco stock': stats.pocoStock,
        'Con descuento': stats.conDescuento,
        'Valor promedio': `$${(stats.valorTotal / stats.total).toLocaleString()}`
      });
      console.groupEnd();
    }
  }
}

// 2. CLASE DE VALIDADORES REUTILIZABLES
class ProductValidator {
  static validateProduct(producto) {
    if (!producto) {
      return { isValid: false, message: 'Producto no encontrado', code: 'PRODUCT_NOT_FOUND' };
    }
    
    if (!producto.disponible) {
      return { isValid: false, message: 'Producto no disponible', code: 'PRODUCT_UNAVAILABLE' };
    }
    
    if (producto.stock <= 0) {
      return { isValid: false, message: 'Producto sin stock', code: 'PRODUCT_OUT_OF_STOCK' };
    }
    
    return { isValid: true };
  }
  
  static validateCartOperation(producto, requestedQuantity = 1) {
    const productValidation = this.validateProduct(producto);
    if (!productValidation.isValid) {
      return productValidation;
    }
    
    // Validar que la cantidad sea un número válido
    const cantidad = parseInt(requestedQuantity, 10);
    if (isNaN(cantidad) || cantidad <= 0) {
      return { 
        isValid: false, 
        message: 'Cantidad debe ser un número mayor a cero',
        code: 'INVALID_QUANTITY'
      };
    }
    
    // Límite máximo de cantidad por producto
    const MAX_QUANTITY_PER_ITEM = 99;
    if (cantidad > MAX_QUANTITY_PER_ITEM) {
      return { 
        isValid: false, 
        message: `Cantidad máxima permitida: ${MAX_QUANTITY_PER_ITEM}`,
        code: 'MAX_QUANTITY_EXCEEDED'
      };
    }
    
    if (cantidad > producto.stock) {
      return { 
        isValid: false, 
        message: `Stock insuficiente. Disponible: ${producto.stock}`,
        code: 'INSUFFICIENT_STOCK'
      };
    }
    
    return { isValid: true };
  }
  
  static validatePriceRange(min, max) {
    if (min < 0 || max < 0) {
      return { isValid: false, message: 'Los precios no pueden ser negativos' };
    }
    
    if (min > max) {
      return { isValid: false, message: 'El precio mínimo no puede ser mayor al máximo' };
    }
    
    return { isValid: true };
  }
  
  static validateSearchTerm(term) {
    if (!term || typeof term !== 'string') {
      return { isValid: false, message: 'Término de búsqueda inválido' };
    }
    
    const sanitizedTerm = term.trim();
    if (sanitizedTerm.length < 2) {
      return { isValid: false, message: 'El término debe tener al menos 2 caracteres' };
    }
    
    if (sanitizedTerm.length > 100) {
      return { isValid: false, message: 'El término es demasiado largo' };
    }
    
    return { isValid: true, sanitizedTerm };
  }
}

// 3. UTILIDADES DE FORMATO MEJORADAS
class FormatUtils {
  static formatPrice(price) {
    if (typeof price !== 'number' || isNaN(price) || price < 0) {
      return '$0';
    }
    return `$${Math.round(price).toLocaleString('es-AR')}`;
  }
  
  static formatDiscount(originalPrice, finalPrice) {
    if (!originalPrice || !finalPrice || originalPrice <= finalPrice) {
      return null;
    }
    
    const discountPercent = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
    const discountAmount = originalPrice - finalPrice;
    
    return {
      percent: discountPercent,
      amount: discountAmount,
      formatted: `${discountPercent}% OFF`,
      savings: `Ahorrás ${this.formatPrice(discountAmount)}`
    };
  }
  
  static formatStock(stock) {
    if (!stock || stock <= 0) {
      return { text: '❌ Sin stock', class: 'out-of-stock', color: 'danger' };
    }
    
    if (stock < 5) {
      return { 
        text: `⚠️ Últimas ${stock} unidades`, 
        class: 'low-stock', 
        color: 'warning' 
      };
    }
    
    if (stock < 10) {
      return { 
        text: `📦 Pocas unidades (${stock})`, 
        class: 'limited-stock', 
        color: 'info' 
      };
    }
    
    return { 
      text: `✅ En stock (${stock})`, 
      class: 'in-stock', 
      color: 'success' 
    };
  }
  
  static sanitizeSearchTerm(term) {
    if (!term || typeof term !== 'string') {
      return '';
    }
    
    return term
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^\w\sáéíóúñü]/gi, '') // Mantener acentos y ñ
      .replace(/\s+/g, ' '); // Normalizar espacios
  }
  
  static formatDate(date) {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  static generateSKU(categoria, nombre, id) {
    const categoriaCode = categoria.substring(0, 4).toUpperCase();
    const nombreCode = nombre.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    const idPadded = String(id).padStart(3, '0');
    return `${categoriaCode}-${nombreCode}-${idPadded}`;
  }
}

// 4. MANEJO MEJORADO DE ERRORES
class ErrorHandler {
  static handleError(error, context = '', showToUser = false, store = null) {
    const errorInfo = {
      message: error.message || 'Error desconocido',
      stack: error.stack || 'Stack no disponible',
      context: context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Log detallado para desarrolladores
    PatagoniaLogger.error(
      `Error en ${context || 'operación desconocida'}`, 
      error, 
      errorInfo
    );
    
    // Notificación para el usuario (opcional)
    if (showToUser && store?.mostrarNotificacion) {
      const userMessage = this.getUserFriendlyMessage(error.message || error);
      store.mostrarNotificacion(userMessage, 'error');
    }
    
    // En desarrollo, mostrar debug info
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.group('🔍 ERROR DEBUGGING INFO');
      console.error('Original error:', error);
      console.table(errorInfo);
      console.groupEnd();
    }
    
    return errorInfo;
  }
  
  static getUserFriendlyMessage(errorMessage) {
    const friendlyMessages = {
      'Failed to fetch': 'Error de conexión. Verifica tu internet.',
      'Not found': 'El elemento solicitado no se encontró.',
      'Unauthorized': 'No tienes permisos para esta acción.',
      'Forbidden': 'Acceso denegado.',
      'Internal Server Error': 'Error del servidor. Intenta más tarde.',
      'Network Error': 'Error de red. Verifica tu conexión.',
      default: 'Ocurrió un error inesperado. Intenta nuevamente.'
    };
    
    // Buscar mensaje amigable
    for (const [key, message] of Object.entries(friendlyMessages)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return message;
      }
    }
    
    return friendlyMessages.default;
  }
}

// 5. MEJORAS PARA RENDERIZADO OPTIMIZADO
class RenderOptimizer {
  // Renderizar productos con fragment para mejor rendimiento
  static renderProductsOptimized(products, container, createCardFunction) {
    if (!container) {
      PatagoniaLogger.error('Contenedor de productos no encontrado');
      return;
    }
    
    // Manejar casos de arrays vacíos o inválidos
    if (!products || !Array.isArray(products) || products.length === 0) {
      container.innerHTML = this.createEmptyStateHTML();
      return;
    }
    
    const startTime = performance.now();
    const fragment = document.createDocumentFragment();
    let successfulRenders = 0;
    let failedRenders = 0;
    
    for (const product of products) {
      try {
        // Validar producto antes de renderizar
        const validation = ProductValidator.validateProduct(product);
        if (!validation.isValid) {
          PatagoniaLogger.warn(`Producto inválido saltado: ${product?.id}`, validation);
          failedRenders++;
          continue;
        }
        
        const productCard = createCardFunction(product);
        fragment.appendChild(productCard);
        successfulRenders++;
        
      } catch (error) {
        ErrorHandler.handleError(
          error, 
          `Renderizando producto ${product?.id}`, 
          false
        );
        failedRenders++;
      }
    }
    
    // Una sola operación DOM
    container.innerHTML = '';
    container.appendChild(fragment);
    
    // Log de rendimiento
    PatagoniaLogger.performance('Renderizar productos', startTime);
    PatagoniaLogger.info(`Productos renderizados: ${successfulRenders} exitosos, ${failedRenders} fallidos`);
  }
  
  static createEmptyStateHTML() {
    return `
      <div class="empty-products-state text-center py-5">
        <div class="mb-4">
          <i class="bi bi-search" style="font-size: 4rem; color: #ccc;"></i>
        </div>
        <h3 class="text-muted mb-3">No se encontraron productos</h3>
        <p class="text-muted">Intenta con otros términos de búsqueda o explora nuestras categorías</p>
        <button onclick="store.renderizarProductos()" class="btn btn-outline-primary">
          <i class="bi bi-arrow-clockwise"></i> Mostrar todos los productos
        </button>
      </div>
    `;
  }
  
  // Búsqueda optimizada con debounce
  static createDebouncedSearch(searchFunction, delay = 300) {
    let timeoutId;
    
    return function(searchTerm) {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        const validation = ProductValidator.validateSearchTerm(searchTerm);
        
        if (validation.isValid) {
          PatagoniaLogger.debug('Ejecutando búsqueda', { term: validation.sanitizedTerm });
          searchFunction(validation.sanitizedTerm);
        } else if (searchTerm.trim() === '') {
          // Mostrar todos los productos si el término está vacío
          searchFunction('');
        }
      }, delay);
    };
  }
}

// 6. UTILIDADES PARA DEBUGGING EN DESARROLLO
class DevUtils {
  static isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.search.includes('debug=true');
  }
  
  static enableDebugMode() {
    if (this.isDevelopment()) {
      PatagoniaLogger.currentLevel = PatagoniaLogger.LOG_LEVELS.DEBUG;
      
      // Agregar botón de debug al DOM
      this.addDebugButton();
      
      // Exponer funciones útiles al window para debugging
      window.debugStore = () => PatagoniaLogger.debugDashboard(window.store, window.userManager);
      window.logLevel = (level) => {
        PatagoniaLogger.currentLevel = PatagoniaLogger.LOG_LEVELS[level.toUpperCase()];
        console.log(`Log level cambiado a: ${level.toUpperCase()}`);
      };
      
      PatagoniaLogger.info('Modo debug activado', {
        funciones_disponibles: ['debugStore()', 'logLevel(level)'],
        niveles_log: Object.keys(PatagoniaLogger.LOG_LEVELS)
      });
    }
  }
  
  static addDebugButton() {
    const debugBtn = document.createElement('button');
    debugBtn.innerHTML = '🐛 Debug';
    debugBtn.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      z-index: 9999;
      opacity: 0.8;
    `;
    debugBtn.onclick = () => window.debugStore?.();
    document.body.appendChild(debugBtn);
  }
  
  static mockData() {
    return {
      productos: [
        {
          id: 999,
          nombre: "Producto Test",
          precio: 1000,
          stock: 5,
          disponible: true,
          categoria: "test",
          descripcionCorta: "Producto para testing",
          imagenes: ["https://via.placeholder.com/300x300?text=Test"]
        }
      ],
      usuario: {
        id: 'test_user',
        firstName: 'Usuario',
        lastName: 'Test',
        email: 'test@test.com'
      }
    };
  }
}

// 7. INICIALIZACIÓN AUTOMÁTICA EN DESARROLLO
document.addEventListener('DOMContentLoaded', () => {
  // Activar debug si estamos en desarrollo
  DevUtils.enableDebugMode();
  
  PatagoniaLogger.info('Utilidades de mejora cargadas', {
    clases_disponibles: [
      'PatagoniaLogger',
      'ProductValidator', 
      'FormatUtils',
      'ErrorHandler',
      'RenderOptimizer',
      'DevUtils'
    ]
  });
});

// Exportar para uso en módulos (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PatagoniaLogger,
    ProductValidator,
    FormatUtils,
    ErrorHandler,
    RenderOptimizer,
    DevUtils
  };
}

// ===================================================================
// EJEMPLO DE USO EN TU CÓDIGO EXISTENTE:
// ===================================================================

/*
// En store.js - Reemplaza el método agregarAlCarrito existente:

async agregarAlCarrito(productoId) {
  const startTime = performance.now();
  
  try {
    PatagoniaLogger.debug('Iniciando agregar al carrito', { productoId });
    
    const producto = this.productos.find(p => p.id === productoId);
    
    // Usar validador reutilizable
    const validation = ProductValidator.validateCartOperation(producto, 1);
    if (!validation.isValid) {
      PatagoniaLogger.warn('Validación fallida', validation);
      this.mostrarNotificacion(validation.message, 'warning');
      return;
    }
    
    const itemCarrito = this.carrito.find(item => item.id === productoId);
    
    if (itemCarrito) {
      // Validar nueva cantidad
      const nuevaCantidad = itemCarrito.cantidad + 1;
      const quantityValidation = ProductValidator.validateCartOperation(producto, nuevaCantidad);
      
      if (!quantityValidation.isValid) {
        this.mostrarNotificacion(quantityValidation.message, 'warning');
        return;
      }
      
      itemCarrito.cantidad = nuevaCantidad;
    } else {
      this.carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagenes[0],
        cantidad: 1,
        sku: producto.sku
      });
    }

    this.guardarCarrito();
    this.actualizarContadorCarrito();
    
    PatagoniaLogger.info('Producto agregado exitosamente', {
      producto: producto.nombre,
      cantidad: itemCarrito ? itemCarrito.cantidad : 1,
      totalItems: this.carrito.length
    });
    
    this.mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
    
  } catch (error) {
    ErrorHandler.handleError(error, 'agregarAlCarrito', true, this);
  } finally {
    PatagoniaLogger.performance('Agregar al carrito', startTime);
  }
}

// En store.js - Reemplaza el método renderizarProductos:
renderizarProductos(productosAMostrar = null) {
  const productos = productosAMostrar || this.productos;
  const contenedor = document.getElementById('productos-container');
  
  RenderOptimizer.renderProductsOptimized(
    productos,
    contenedor,
    (producto) => this.crearTarjetaProducto(producto)
  );
}
*/