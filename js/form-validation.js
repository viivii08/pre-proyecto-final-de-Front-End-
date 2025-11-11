/**
 * SISTEMA DE VALIDACIÓN DE FORMULARIOS AVANZADO
 * Patagonia Style - Validación en tiempo real con UX mejorada
 */

class FormValidator {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    this.rules = {};
    this.messages = {};
    this.isValid = true;
    
    if (this.form) {
      this.init();
    }
  }
  
  init() {
    // Agregar eventos de validación en tiempo real
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Validación en tiempo real para cada campo
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearErrors(input));
    });
  }
  
  // Configurar reglas de validación
  setRules(fieldRules) {
    this.rules = { ...this.rules, ...fieldRules };
    return this;
  }
  
  // Configurar mensajes personalizados
  setMessages(customMessages) {
    this.messages = { ...this.messages, ...customMessages };
    return this;
  }
  
  // Validar un campo específico
  validateField(input) {
    const fieldName = input.name || input.id;
    const value = input.value.trim();
    const rules = this.rules[fieldName];
    
    if (!rules) return true;
    
    // Limpiar errores previos
    this.clearErrors(input);
    
    // Aplicar cada regla
    for (const rule of rules) {
      const result = this.applyRule(rule, value, input);
      if (!result.valid) {
        this.showError(input, result.message);
        return false;
      }
    }
    
    this.showValid(input);
    return true;
  }
  
  // Aplicar una regla específica
  applyRule(rule, value, input) {
    switch (rule.type) {
      case 'required':
        return {
          valid: value !== '',
          message: this.getMessage(rule.message, 'Este campo es obligatorio')
        };
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          valid: value === '' || emailRegex.test(value),
          message: this.getMessage(rule.message, 'Ingresa un email válido')
        };
      
      case 'minLength':
        return {
          valid: value.length >= rule.value,
          message: this.getMessage(rule.message, `Mínimo ${rule.value} caracteres`)
        };
      
      case 'maxLength':
        return {
          valid: value.length <= rule.value,
          message: this.getMessage(rule.message, `Máximo ${rule.value} caracteres`)
        };
      
      case 'phone':
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        return {
          valid: value === '' || phoneRegex.test(value),
          message: this.getMessage(rule.message, 'Ingresa un teléfono válido')
        };
      
      case 'pattern':
        return {
          valid: new RegExp(rule.pattern).test(value),
          message: this.getMessage(rule.message, 'Formato no válido')
        };
      
      case 'custom':
        return rule.validator(value, input);
      
      default:
        return { valid: true, message: '' };
    }
  }
  
  // Obtener mensaje personalizado o por defecto
  getMessage(customMessage, defaultMessage) {
    return customMessage || defaultMessage;
  }
  
  // Mostrar error en un campo
  showError(input, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    
    // Crear o actualizar elemento de error
    let errorElement = input.parentNode.querySelector('.invalid-feedback');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'invalid-feedback';
      errorElement.setAttribute('role', 'alert');
      input.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Accessibility: Announce error to screen readers
    input.setAttribute('aria-describedby', errorElement.id || 'error-' + Date.now());
  }
  
  // Mostrar estado válido
  showValid(input) {
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');
    
    const errorElement = input.parentNode.querySelector('.invalid-feedback');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }
  
  // Limpiar errores de un campo
  clearErrors(input) {
    input.classList.remove('is-invalid', 'is-valid');
    
    const errorElement = input.parentNode.querySelector('.invalid-feedback');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }
  
  // Validar todo el formulario
  validateForm() {
    this.isValid = true;
    const inputs = this.form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        this.isValid = false;
      }
    });
    
    return this.isValid;
  }
  
  // Manejar envío del formulario
  handleSubmit(e) {
    e.preventDefault();
    
    if (this.validateForm()) {
      this.showSuccess();
      // Aquí puedes agregar la lógica de envío real
      this.submitForm();
    } else {
      this.showFormError();
      this.focusFirstError();
    }
  }
  
  // Mostrar mensaje de éxito
  showSuccess() {
    // Remover mensajes de error previos
    this.removeFormMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.innerHTML = `
      <i class="fas fa-check-circle me-2"></i>
      <strong>¡Mensaje enviado exitosamente!</strong> Te responderemos pronto.
    `;
    
    this.form.insertBefore(successDiv, this.form.firstChild);
    
    // Scroll al mensaje
    successDiv.scrollIntoView({ behavior: 'smooth' });
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      successDiv.remove();
    }, 5000);
  }
  
  // Mostrar error general del formulario
  showFormError() {
    this.removeFormMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-triangle me-2"></i>
      <strong>Por favor corrige los errores marcados</strong> antes de enviar el formulario.
    `;
    
    this.form.insertBefore(errorDiv, this.form.firstChild);
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
  
  // Remover mensajes previos del formulario
  removeFormMessages() {
    const messages = this.form.querySelectorAll('.alert');
    messages.forEach(msg => msg.remove());
  }
  
  // Enfocar el primer campo con error
  focusFirstError() {
    const firstError = this.form.querySelector('.is-invalid');
    if (firstError) {
      firstError.focus();
    }
  }
  
  // Enviar formulario (implementar según necesidades)
  async submitForm() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    
    try {
      // Mostrar loading
      this.showLoading();
      
      // Simular envío (reemplazar con tu lógica de envío)
      const response = await fetch(this.form.action || '/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      this.hideLoading();
      
      if (response.ok) {
        this.form.reset();
        this.clearAllErrors();
      } else {
        throw new Error('Error en el envío');
      }
      
    } catch (error) {
      this.hideLoading();
      this.showFormError();
    }
  }
  
  // Mostrar estado de carga
  showLoading() {
    const submitBtn = this.form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Enviando...
      `;
    }
  }
  
  // Ocultar estado de carga
  hideLoading() {
    const submitBtn = this.form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Enviar Mensaje';
    }
  }
  
  // Limpiar todos los errores
  clearAllErrors() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => this.clearErrors(input));
  }
}

/**
 * UTILIDADES ADICIONALES PARA MEJORAR LA UX
 */

// Auto-resize para textareas
function initAutoResize() {
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });
  });
}

// Formateo automático para campos de teléfono
function initPhoneFormatter() {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      e.target.value = value;
    });
  });
}

// Contador de caracteres para campos con límite
function initCharacterCounter() {
  const textInputs = document.querySelectorAll('textarea[maxlength], input[maxlength]');
  textInputs.forEach(input => {
    const maxLength = input.getAttribute('maxlength');
    const counterDiv = document.createElement('div');
    counterDiv.className = 'character-counter form-text';
    input.parentNode.appendChild(counterDiv);
    
    function updateCounter() {
      const remaining = maxLength - input.value.length;
      counterDiv.textContent = `${remaining} caracteres restantes`;
      counterDiv.className = remaining < 10 ? 'character-counter form-text text-warning' : 'character-counter form-text';
    }
    
    input.addEventListener('input', updateCounter);
    updateCounter(); // Initial count
  });
}

// Inicializar todas las utilidades cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar auto-resize para textareas
  initAutoResize();
  
  // Inicializar formateo de teléfonos
  initPhoneFormatter();
  
  // Inicializar contador de caracteres
  initCharacterCounter();
  
  // Configurar validación para formulario de contacto
  if (document.querySelector('#contactForm')) {
    const contactValidator = new FormValidator('#contactForm');
    
    contactValidator.setRules({
      name: [
        { type: 'required' },
        { type: 'minLength', value: 2, message: 'El nombre debe tener al menos 2 caracteres' }
      ],
      email: [
        { type: 'required' },
        { type: 'email' }
      ],
      phone: [
        { type: 'phone', message: 'Ingresa un teléfono válido (ej: 11-1234-5678)' }
      ],
      subject: [
        { type: 'required' },
        { type: 'minLength', value: 5, message: 'El asunto debe tener al menos 5 caracteres' }
      ],
      message: [
        { type: 'required' },
        { type: 'minLength', value: 20, message: 'El mensaje debe tener al menos 20 caracteres' }
      ]
    });
  }
});

// Exportar la clase para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormValidator;
}