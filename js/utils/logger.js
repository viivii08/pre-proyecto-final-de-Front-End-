/**
 * 📊 SISTEMA DE LOGGING MEJORADO
 * Utilidades para logging formateado y atractivo en consola
 */

class Logger {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.prefix = options.prefix || '🚀';
    this.styles = {
      success: 'color: #28a745; font-weight: bold;',
      error: 'color: #dc3545; font-weight: bold;',
      warning: 'color: #ffc107; font-weight: bold;',
      info: 'color: #17a2b8; font-weight: bold;',
      debug: 'color: #6c757d; font-weight: normal;',
      primary: 'color: #1f3c5a; font-weight: bold;',
      secondary: 'color: #3b5d50; font-weight: bold;'
    };
  }

  /**
   * Log de éxito
   */
  success(message, data = null) {
    if (!this.enabled) return;
    console.log(`%c✅ ${message}`, this.styles.success, data || '');
  }

  /**
   * Log de error
   */
  error(message, error = null) {
    if (!this.enabled) return;
    console.error(`%c❌ ${message}`, this.styles.error, error || '');
    if (error && error.stack) {
      console.error('%cStack trace:', this.styles.debug, error.stack);
    }
  }

  /**
   * Log de advertencia
   */
  warning(message, data = null) {
    if (!this.enabled) return;
    console.warn(`%c⚠️ ${message}`, this.styles.warning, data || '');
  }

  /**
   * Log de información
   */
  info(message, data = null) {
    if (!this.enabled) return;
    console.log(`%cℹ️ ${message}`, this.styles.info, data || '');
  }

  /**
   * Log de debug
   */
  debug(message, data = null) {
    if (!this.enabled) return;
    if (process.env.NODE_ENV === 'development' || window.DEBUG_MODE) {
      console.log(`%c🐛 ${message}`, this.styles.debug, data || '');
    }
  }

  /**
   * Log de tabla (para arrays y objetos)
   */
  table(data, label = 'Data') {
    if (!this.enabled) return;
    console.group(`%c📊 ${label}`, this.styles.primary);
    console.table(data);
    console.groupEnd();
  }

  /**
   * Log de grupo
   */
  group(label, callback) {
    if (!this.enabled) return;
    console.group(`%c📦 ${label}`, this.styles.primary);
    if (callback) callback();
    console.groupEnd();
  }

  /**
   * Log de tiempo
   */
  time(label) {
    if (!this.enabled) return;
    console.time(`⏱️ ${label}`);
  }

  timeEnd(label) {
    if (!this.enabled) return;
    console.timeEnd(`⏱️ ${label}`);
  }

  /**
   * Log de objeto formateado
   */
  object(label, obj) {
    if (!this.enabled) return;
    console.group(`%c📦 ${label}`, this.styles.primary);
    console.log('%cObject:', this.styles.info, obj);
    console.log('%cJSON:', this.styles.debug, JSON.stringify(obj, null, 2));
    console.groupEnd();
  }

  /**
   * Log de función (inicio/fin)
   */
  functionStart(functionName, args = {}) {
    if (!this.enabled) return;
    console.group(`%c⚡ ${functionName}()`, this.styles.secondary);
    if (Object.keys(args).length > 0) {
      console.log('%cArguments:', this.styles.info, args);
    }
  }

  functionEnd(functionName, result = null) {
    if (!this.enabled) return;
    if (result !== null) {
      console.log('%cResult:', this.styles.success, result);
    }
    console.groupEnd();
  }

  /**
   * Log de producto (formateado para productos)
   */
  product(product) {
    if (!this.enabled) return;
    console.group(`%c🛍️ Producto: ${product.nombre || product.name}`, this.styles.primary);
    console.log(`%cID:`, this.styles.info, product.id);
    console.log(`%cPrecio:`, this.styles.info, `$${product.precio?.toLocaleString() || product.price?.toLocaleString()}`);
    console.log(`%cStock:`, this.styles.info, product.stock || 'N/A');
    console.log(`%cCategoría:`, this.styles.info, product.categoria || product.category || 'N/A');
    if (product.descuento) {
      console.log(`%cDescuento:`, this.styles.success, `${product.descuento}%`);
    }
    console.groupEnd();
  }

  /**
   * Log de carrito (formateado para carrito)
   */
  cart(cart) {
    if (!this.enabled) return;
    const totalItems = cart.reduce((sum, item) => sum + (item.cantidad || item.quantity || 1), 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.precio || item.price || 0) * (item.cantidad || item.quantity || 1), 0);
    
    console.group(`%c🛒 Carrito (${totalItems} items)`, this.styles.primary);
    console.table(cart);
    console.log(`%c💰 Total: $${totalPrice.toLocaleString()}`, this.styles.success);
    console.groupEnd();
  }

  /**
   * Log de usuario (formateado para usuarios)
   */
  user(user) {
    if (!this.enabled) return;
    console.group(`%c👤 Usuario: ${user.firstName || user.name || 'Anónimo'}`, this.styles.primary);
    console.log(`%cEmail:`, this.styles.info, user.email);
    console.log(`%cID:`, this.styles.info, user.id);
    if (user.orders) {
      console.log(`%cPedidos:`, this.styles.info, user.orders.length);
    }
    console.groupEnd();
  }

  /**
   * Log de separador visual
   */
  separator(text = '') {
    if (!this.enabled) return;
    console.log(
      `%c${'='.repeat(50)} ${text} ${'='.repeat(50)}`,
      'color: #6c757d; font-weight: bold;'
    );
  }

  /**
   * Log de banner
   */
  banner(text, style = 'primary') {
    if (!this.enabled) return;
    const styleMap = {
      primary: this.styles.primary,
      success: this.styles.success,
      error: this.styles.error,
      warning: this.styles.warning,
      info: this.styles.info
    };
    console.log(
      `%c\n${'═'.repeat(60)}\n${' '.repeat(20)}${text}\n${'═'.repeat(60)}\n`,
      styleMap[style] || this.styles.primary
    );
  }
}

// Crear instancia global
const logger = new Logger({
  enabled: true,
  prefix: '🚀'
});

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Logger;
}

window.Logger = Logger;
window.logger = logger;

