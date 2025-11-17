/**
 * 🛠️ FUNCIONES AUXILIARES REUTILIZABLES
 * Utilidades comunes para evitar repetición de código
 */

class Helpers {
  /**
   * Formatea precio a formato argentino
   */
  static formatPrice(price) {
    if (!Validators.isValidNumber(price)) return '$0';
    return `$${price.toLocaleString('es-AR')}`;
  }

  /**
   * Formatea número con separadores de miles
   */
  static formatNumber(number) {
    if (!Validators.isValidNumber(number)) return '0';
    return number.toLocaleString('es-AR');
  }

  /**
   * Calcula porcentaje de descuento
   */
  static calculateDiscountPercentage(originalPrice, discountedPrice) {
    if (!Validators.isPositiveNumber(originalPrice) || 
        !Validators.isPositiveNumber(discountedPrice)) {
      return 0;
    }
    if (discountedPrice >= originalPrice) return 0;
    const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
    return Math.round(discount);
  }

  /**
   * Calcula precio con descuento
   */
  static calculateDiscountedPrice(originalPrice, discountPercentage) {
    if (!Validators.isPositiveNumber(originalPrice)) return 0;
    if (!Validators.isNonNegativeNumber(discountPercentage)) return originalPrice;
    if (discountPercentage > 100) discountPercentage = 100;
    return Math.round(originalPrice * (1 - discountPercentage / 100));
  }

  /**
   * Obtiene elemento del DOM de forma segura
   */
  static getElement(selector, parent = document) {
    try {
      const element = parent.querySelector(selector);
      if (!element) {
        console.warn(`⚠️ Elemento no encontrado: ${selector}`);
      }
      return element;
    } catch (error) {
      console.error(`❌ Error obteniendo elemento ${selector}:`, error);
      return null;
    }
  }

  /**
   * Obtiene múltiples elementos del DOM
   */
  static getElements(selector, parent = document) {
    try {
      const elements = Array.from(parent.querySelectorAll(selector));
      return elements;
    } catch (error) {
      console.error(`❌ Error obteniendo elementos ${selector}:`, error);
      return [];
    }
  }

  /**
   * Espera a que un elemento esté disponible en el DOM
   */
  static waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = this.getElement(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = this.getElement(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout esperando elemento: ${selector}`));
      }, timeout);
    });
  }

  /**
   * Debounce function (útil para búsquedas)
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function (útil para eventos de scroll)
   */
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Clona objeto de forma profunda
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  }

  /**
   * Busca en objeto anidado
   */
  static findInNestedObject(obj, key) {
    for (const k in obj) {
      if (k === key) return obj[k];
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        const result = this.findInNestedObject(obj[k], key);
        if (result !== undefined) return result;
      }
    }
    return undefined;
  }

  /**
   * Agrupa array por propiedad
   */
  static groupBy(array, key) {
    return array.reduce((groups, item) => {
      const groupKey = item[key];
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {});
  }

  /**
   * Elimina duplicados de array
   */
  static removeDuplicates(array, key = null) {
    if (!key) {
      return [...new Set(array)];
    }
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  /**
   * Ordena array por propiedad
   */
  static sortBy(array, key, direction = 'asc') {
    const sorted = [...array];
    sorted.sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  /**
   * Genera ID único
   */
  static generateId(prefix = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}${timestamp}_${random}`;
  }

  /**
   * Formatea fecha a string legible
   */
  static formatDate(date, format = 'es-AR') {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    return date.toLocaleDateString(format, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatea fecha y hora
   */
  static formatDateTime(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Maneja errores de forma consistente
   */
  static handleError(error, context = '') {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorContext = context ? `${context}: ` : '';
    
    if (window.logger) {
      window.logger.error(`${errorContext}${errorMessage}`, error);
    } else {
      console.error(`❌ ${errorContext}${errorMessage}`, error);
    }

    // Retornar objeto de error consistente
    return {
      success: false,
      error: errorMessage,
      context: context
    };
  }

  /**
   * Retorna resultado exitoso de forma consistente
   */
  static successResult(data, message = '') {
    return {
      success: true,
      data: data,
      message: message
    };
  }

  /**
   * Retorna resultado de error de forma consistente
   */
  static errorResult(message, error = null) {
    return {
      success: false,
      error: message,
      details: error
    };
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Helpers;
}

window.Helpers = Helpers;

