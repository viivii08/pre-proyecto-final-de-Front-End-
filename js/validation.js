/**
 * Sistema de Validación Profesional - Patagonia Style
 * Manejo robusto de validaciones, sanitización y feedback visual
 */

class ValidationSystem {
  constructor() {
    this.validators = new Map();
    this.sanitizers = new Map();
    this.initializeDefaultValidators();
    this.initializeDefaultSanitizers();
  }

  initializeDefaultValidators() {
    // Validadores básicos
    this.validators.set('required', (value) => {
      const result = value && value.toString().trim() !== '';
      return {
        isValid: result,
        message: result ? '' : 'Este campo es obligatorio'
      };
    });

    this.validators.set('email', (value) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const result = !value || emailRegex.test(value);
      return {
        isValid: result,
        message: result ? '' : 'Ingresa un email válido'
      };
    });

    this.validators.set('phone', (value) => {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const result = !value || phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
      return {
        isValid: result,
        message: result ? '' : 'Ingresa un teléfono válido'
      };
    });

    this.validators.set('minLength', (value, minLength) => {
      const result = !value || value.length >= minLength;
      return {
        isValid: result,
        message: result ? '' : `Mínimo ${minLength} caracteres`
      };
    });

    this.validators.set('maxLength', (value, maxLength) => {
      const result = !value || value.length <= maxLength;
      return {
        isValid: result,
        message: result ? '' : `Máximo ${maxLength} caracteres`
      };
    });

    this.validators.set('pattern', (value, pattern) => {
      const regex = new RegExp(pattern);
      const result = !value || regex.test(value);
      return {
        isValid: result,
        message: result ? '' : 'Formato inválido'
      };
    });

    this.validators.set('numeric', (value) => {
      const result = !value || !isNaN(value) && !isNaN(parseFloat(value));
      return {
        isValid: result,
        message: result ? '' : 'Solo se permiten números'
      };
    });

    this.validators.set('creditCard', (value) => {
      if (!value) return { isValid: true, message: '' };
      
      // Luhn algorithm
      const num = value.replace(/\D/g, '');
      let sum = 0;
      let alternate = false;
      
      for (let i = num.length - 1; i >= 0; i--) {
        let n = parseInt(num.charAt(i), 10);
        if (alternate) {
          n *= 2;
          if (n > 9) n = (n % 10) + 1;
        }
        sum += n;
        alternate = !alternate;
      }
      
      const result = (sum % 10) === 0;
      return {
        isValid: result,
        message: result ? '' : 'Número de tarjeta inválido'
      };
    });

    this.validators.set('expDate', (value) => {
      if (!value) return { isValid: true, message: '' };
      
      const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
      if (!regex.test(value)) {
        return { isValid: false, message: 'Formato: MM/AA' };
      }
      
      const [month, year] = value.split('/');
      const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      
      const result = expDate > now;
      return {
        isValid: result,
        message: result ? '' : 'Tarjeta vencida'
      };
    });

    this.validators.set('cvv', (value) => {
      const result = !value || /^[0-9]{3,4}$/.test(value);
      return {
        isValid: result,
        message: result ? '' : 'CVV inválido (3-4 dígitos)'
      };
    });

    this.validators.set('postalCode', (value) => {
      // Código postal argentino
      const result = !value || /^[A-Z]?\d{4}[A-Z]{0,3}$/i.test(value);
      return {
        isValid: result,
        message: result ? '' : 'Código postal inválido'
      };
    });
  }

  initializeDefaultSanitizers() {
    this.sanitizers.set('trim', (value) => value ? value.toString().trim() : '');
    
    this.sanitizers.set('lowercase', (value) => value ? value.toString().toLowerCase() : '');
    
    this.sanitizers.set('uppercase', (value) => value ? value.toString().toUpperCase() : '');
    
    this.sanitizers.set('removeSpecialChars', (value) => {
      return value ? value.toString().replace(/[^a-zA-Z0-9\s]/g, '') : '';
    });
    
    this.sanitizers.set('phoneFormat', (value) => {
      return value ? value.toString().replace(/[^\d+]/g, '') : '';
    });
    
    this.sanitizers.set('creditCardFormat', (value) => {
      return value ? value.toString().replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() : '';
    });
    
    this.sanitizers.set('expDateFormat', (value) => {
      if (!value) return '';
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length >= 2) {
        return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
      }
      return cleaned;
    });

    this.sanitizers.set('alphanumeric', (value) => {
      return value ? value.toString().replace(/[^a-zA-Z0-9]/g, '') : '';
    });

    this.sanitizers.set('htmlEscape', (value) => {
      if (!value) return '';
      const div = document.createElement('div');
      div.textContent = value;
      return div.innerHTML;
    });
  }

  // Validar un campo individual
  validateField(fieldElement, rules = []) {
    const value = fieldElement.value;
    const fieldName = fieldElement.getAttribute('data-field-name') || fieldElement.id || fieldElement.name;
    
    let isValid = true;
    let errorMessage = '';

    // Ejecutar todas las reglas de validación
    for (const rule of rules) {
      const { type, params = [], message } = rule;
      
      if (this.validators.has(type)) {
        const result = this.validators.get(type)(value, ...params);
        
        if (!result.isValid) {
          isValid = false;
          errorMessage = message || result.message;
          break; // Stop en el primer error
        }
      }
    }

    // Aplicar feedback visual
    this.applyFieldFeedback(fieldElement, isValid, errorMessage);
    
    return { isValid, errorMessage, fieldName };
  }

  // Aplicar feedback visual al campo
  applyFieldFeedback(fieldElement, isValid, errorMessage) {
    const container = fieldElement.closest('.form-group') || fieldElement.parentElement;
    
    // Remover clases previas
    fieldElement.classList.remove('is-valid', 'is-invalid');
    container.classList.remove('has-error', 'has-success');
    
    // Remover mensajes de error previos
    const existingError = container.querySelector('.invalid-feedback, .error-message');
    if (existingError) {
      existingError.remove();
    }

    if (isValid) {
      fieldElement.classList.add('is-valid');
      container.classList.add('has-success');
    } else {
      fieldElement.classList.add('is-invalid');
      container.classList.add('has-error');
      
      // Agregar mensaje de error
      const errorDiv = document.createElement('div');
      errorDiv.className = 'invalid-feedback error-message d-block';
      errorDiv.innerHTML = `<i class="bi bi-exclamation-circle me-1"></i>${errorMessage}`;
      container.appendChild(errorDiv);
    }
  }

  // Sanitizar valor del campo
  sanitizeField(fieldElement, sanitizers = []) {
    let value = fieldElement.value;
    
    for (const sanitizer of sanitizers) {
      if (this.sanitizers.has(sanitizer)) {
        value = this.sanitizers.get(sanitizer)(value);
      }
    }
    
    fieldElement.value = value;
    return value;
  }

  // Validar formulario completo
  validateForm(formElement, validationRules = {}) {
    const results = {
      isValid: true,
      errors: {},
      fields: {}
    };

    const fields = formElement.querySelectorAll('input, select, textarea');
    
    fields.forEach(field => {
      const fieldId = field.id || field.name;
      const rules = validationRules[fieldId] || [];
      
      if (rules.length > 0) {
        const result = this.validateField(field, rules);
        results.fields[fieldId] = result;
        
        if (!result.isValid) {
          results.isValid = false;
          results.errors[fieldId] = result.errorMessage;
        }
      }
    });

    return results;
  }

  // Configurar validación en tiempo real
  setupRealtimeValidation(formElement, validationRules = {}) {
    const fields = formElement.querySelectorAll('input, select, textarea');
    
    fields.forEach(field => {
      const fieldId = field.id || field.name;
      const rules = validationRules[fieldId] || [];
      const sanitizers = this.getSanitizersForField(field);
      
      if (rules.length > 0) {
        // Validación en tiempo real con debounce
        let timeoutId;
        
        const validateWithDelay = () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            // Sanitizar primero
            if (sanitizers.length > 0) {
              this.sanitizeField(field, sanitizers);
            }
            
            // Luego validar
            this.validateField(field, rules);
          }, 300);
        };

        field.addEventListener('input', validateWithDelay);
        field.addEventListener('blur', () => {
          clearTimeout(timeoutId);
          if (sanitizers.length > 0) {
            this.sanitizeField(field, sanitizers);
          }
          this.validateField(field, rules);
        });
      }
    });
  }

  // Obtener sanitizadores basados en el tipo de campo
  getSanitizersForField(field) {
    const type = field.type || field.tagName.toLowerCase();
    const className = field.className || '';
    
    if (className.includes('credit-card')) return ['creditCardFormat'];
    if (className.includes('exp-date')) return ['expDateFormat'];
    if (className.includes('phone')) return ['phoneFormat'];
    if (type === 'email') return ['trim', 'lowercase'];
    if (type === 'tel') return ['phoneFormat'];
    
    return ['trim'];
  }

  // Limpiar validación de un formulario
  clearValidation(formElement) {
    const fields = formElement.querySelectorAll('input, select, textarea');
    
    fields.forEach(field => {
      field.classList.remove('is-valid', 'is-invalid');
      const container = field.closest('.form-group') || field.parentElement;
      container.classList.remove('has-error', 'has-success');
      
      const errorMsg = container.querySelector('.invalid-feedback, .error-message');
      if (errorMsg) {
        errorMsg.remove();
      }
    });
  }

  // Agregar validador personalizado
  addValidator(name, validatorFunction) {
    this.validators.set(name, validatorFunction);
  }

  // Agregar sanitizador personalizado
  addSanitizer(name, sanitizerFunction) {
    this.sanitizers.set(name, sanitizerFunction);
  }

  // Método principal para configurar validación de formularios
  setupFormValidation(formId) {
    const form = document.getElementById(formId);
    if (!form) {
      console.warn(`Form with ID ${formId} not found`);
      return;
    }

    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (input.dataset.validate) {
        this.setupRealTimeValidation(input);
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validateForm(formId)) {
        // Si la validación pasa, continuar con el submit original
        const originalSubmit = form.dataset.originalSubmit;
        if (originalSubmit && typeof window[originalSubmit] === 'function') {
          window[originalSubmit](e);
        }
      }
    });
  }

  // Validar formulario completo
  validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      if (input.dataset.validate) {
        const result = this.validateField(input);
        if (!result.isValid) {
          isValid = false;
        }
      }
    });

    return isValid;
  }
}

// Instancia global
window.validationSystem = new ValidationSystem();

// Alias global para retrocompatibilidad
window.setupFormValidation = (formId) => validationSystem.setupFormValidation(formId);

// CSS para mejorar el feedback visual
const validationCSS = `
<style id="validation-styles">
.form-group {
  margin-bottom: 1rem;
  position: relative;
}

.form-control.is-valid {
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
}

.has-success .form-control {
  border-color: #28a745;
}

.has-error .form-control {
  border-color: #dc3545;
}

.validation-loading {
  position: relative;
}

.validation-loading::after {
  content: '';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translateY(-50%) rotate(0deg); }
  100% { transform: translateY(-50%) rotate(360deg); }
}

.form-feedback {
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.form-feedback.valid {
  color: #28a745;
}

.form-feedback.invalid {
  color: #dc3545;
}
</style>
`;

// Inyectar estilos
if (!document.getElementById('validation-styles')) {
  document.head.insertAdjacentHTML('beforeend', validationCSS);
}