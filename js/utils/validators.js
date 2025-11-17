/**
 * ✅ SISTEMA DE VALIDACIÓN ROBUSTO
 * Validaciones reutilizables con manejo de casos edge
 */

class Validators {
  /**
   * Valida si un número es válido y no es cero (útil para divisiones)
   */
  static isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

  /**
   * Valida si un número es mayor que cero (evita división por cero)
   */
  static isPositiveNumber(value) {
    return this.isValidNumber(value) && value > 0;
  }

  /**
   * Valida si un número es mayor o igual a cero
   */
  static isNonNegativeNumber(value) {
    return this.isValidNumber(value) && value >= 0;
  }

  /**
   * División segura (evita división por cero)
   * MEJORA: Logging mejorado y manejo de casos edge
   */
  static safeDivide(numerator, denominator, defaultValue = 0) {
    // Validar que ambos parámetros sean números válidos
    if (!this.isValidNumber(numerator) || !this.isValidNumber(denominator)) {
      if (window.logger) {
        window.logger.warning('División con números inválidos', { numerator, denominator });
      } else {
        console.warn('⚠️ División con números inválidos. Retornando valor por defecto.', { numerator, denominator });
      }
      return defaultValue;
    }
    
    // Validar división por cero
    if (denominator === 0) {
      if (window.logger) {
        window.logger.warning('Intento de división por cero. Retornando valor por defecto.', { numerator, defaultValue });
      } else {
        console.warn('⚠️ Intento de división por cero. Retornando valor por defecto.', { numerator, defaultValue });
      }
      return defaultValue;
    }
    
    // Realizar división
    const result = numerator / denominator;
    
    // Validar resultado
    if (!this.isValidNumber(result)) {
      if (window.logger) {
        window.logger.warning('Resultado de división inválido', { numerator, denominator, result });
      }
      return defaultValue;
    }
    
    return result;
  }

  /**
   * Valida email
   */
  static isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Valida teléfono (formato argentino flexible)
   */
  static isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  /**
   * Valida que un valor no sea null, undefined o string vacío
   */
  static isNotEmpty(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  }

  /**
   * Valida que un array no esté vacío
   */
  static isNonEmptyArray(array) {
    return Array.isArray(array) && array.length > 0;
  }

  /**
   * Valida que un objeto tenga las propiedades requeridas
   */
  static hasRequiredProperties(obj, requiredProps) {
    if (!obj || typeof obj !== 'object') return false;
    return requiredProps.every(prop => obj.hasOwnProperty(prop) && this.isNotEmpty(obj[prop]));
  }

  /**
   * Valida rango numérico
   */
  static isInRange(value, min, max) {
    if (!this.isValidNumber(value)) return false;
    return value >= min && value <= max;
  }

  /**
   * Valida longitud de string
   */
  static isValidLength(str, min, max) {
    if (typeof str !== 'string') return false;
    const length = str.trim().length;
    return length >= min && length <= max;
  }

  /**
   * Valida que un ID sea válido (número positivo o string no vacío)
   */
  static isValidId(id) {
    if (typeof id === 'number') return this.isPositiveNumber(id);
    if (typeof id === 'string') return id.trim().length > 0;
    return false;
  }

  /**
   * Valida producto
   */
  static isValidProduct(product) {
    if (!product || typeof product !== 'object') return false;
    const requiredProps = ['id', 'nombre', 'precio'];
    return this.hasRequiredProperties(product, requiredProps) &&
           this.isValidId(product.id) &&
           this.isPositiveNumber(product.precio);
  }

  /**
   * Valida item de carrito
   */
  static isValidCartItem(item) {
    if (!item || typeof item !== 'object') return false;
    const requiredProps = ['id', 'nombre', 'precio', 'cantidad'];
    return this.hasRequiredProperties(item, requiredProps) &&
           this.isValidId(item.id) &&
           this.isPositiveNumber(item.precio) &&
           this.isPositiveNumber(item.cantidad);
  }

  /**
   * Valida usuario
   */
  static isValidUser(user) {
    if (!user || typeof user !== 'object') return false;
    const requiredProps = ['id', 'email'];
    return this.hasRequiredProperties(user, requiredProps) &&
           this.isValidEmail(user.email);
  }

  /**
   * Sanitiza string (elimina caracteres peligrosos)
   */
  static sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  }

  /**
   * Valida y sanitiza número
   */
  static sanitizeNumber(value, defaultValue = 0) {
    const num = parseFloat(value);
    return this.isValidNumber(num) ? num : defaultValue;
  }

  /**
   * Valida y sanitiza entero
   */
  static sanitizeInteger(value, defaultValue = 0) {
    const num = parseInt(value, 10);
    return this.isValidNumber(num) ? num : defaultValue;
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validators;
}

window.Validators = Validators;

