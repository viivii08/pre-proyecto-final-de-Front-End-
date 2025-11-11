/**
 * 🎨 DYNAMIC FORMS & REAL-TIME UPDATES
 * Sistema avanzado de formularios dinámicos con aplicación en tiempo real
 * Versión: 2.0
 * Características: Validación, Tiempo real, Persistencia, Accesibilidad
 */

class DynamicFormManager {
    constructor() {
        this.forms = new Map();
        this.validators = new Map();
        this.realTimeUpdaters = new Map();
        this.debounceTimers = new Map();
        this.defaultDebounceDelay = 300;
        
        this.setupDefaultValidators();
        this.setupDefaultUpdaters();
        this.init();
    }

    /**
     * 🚀 Inicializar el sistema
     */
    init() {
        this.bindGlobalEvents();
        this.loadSavedPreferences();
        this.setupAccessibility();
        
        console.log('🎨 DynamicFormManager inicializado');
    }

    /**
     * 🔗 Configurar eventos globales
     */
    bindGlobalEvents() {
        // Event delegation para formularios dinámicos
        document.addEventListener('input', (e) => {
            if (e.target.dataset.dynamicUpdate) {
                this.handleRealTimeUpdate(e.target);
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.dataset.dynamicUpdate) {
                this.handleRealTimeUpdate(e.target);
            }
        });

        document.addEventListener('submit', (e) => {
            if (e.target.dataset.dynamicForm) {
                this.handleFormSubmit(e);
            }
        });

        // Guardar preferencias cuando la página se cierra
        window.addEventListener('beforeunload', () => {
            this.saveAllPreferences();
        });
    }

    /**
     * 📝 Registrar formulario dinámico
     */
    registerForm(formId, config = {}) {
        const {
            autoSave = true,
            realTime = true,
            validation = true,
            persistence = true,
            accessibility = true
        } = config;

        const formConfig = {
            id: formId,
            autoSave,
            realTime,
            validation,
            persistence,
            accessibility,
            fields: new Map(),
            validators: new Map(),
            updaters: new Map()
        };

        this.forms.set(formId, formConfig);

        // Configurar el formulario en el DOM
        const formElement = document.getElementById(formId);
        if (formElement) {
            formElement.dataset.dynamicForm = 'true';
            this.setupFormFields(formId, formElement);
        }

        console.log(`📝 Formulario registrado: ${formId}`);
        return formConfig;
    }

    /**
     * 🔧 Configurar campos del formulario
     */
    setupFormFields(formId, formElement) {
        const config = this.forms.get(formId);
        if (!config) return;

        const inputs = formElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Configurar atributos para tiempo real
            if (config.realTime) {
                input.dataset.dynamicUpdate = 'true';
                input.dataset.formId = formId;
            }

            // Configurar accesibilidad
            if (config.accessibility) {
                this.enhanceAccessibility(input);
            }

            // Registrar campo
            config.fields.set(input.name || input.id, {
                element: input,
                type: input.type,
                validator: input.dataset.validator,
                updater: input.dataset.updater,
                required: input.required,
                pattern: input.pattern
            });
        });

        // Restaurar valores guardados
        if (config.persistence) {
            this.restoreFormValues(formId);
        }
    }

    /**
     * ♿ Mejorar accesibilidad
     */
    enhanceAccessibility(input) {
        // Añadir ARIA labels si no existen
        if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) {
                input.setAttribute('aria-labelledby', label.id || `label-${input.id}`);
                if (!label.id) label.id = `label-${input.id}`;
            }
        }

        // Añadir contenedor para mensajes de error
        if (!input.parentElement.querySelector('.field-error')) {
            const errorContainer = document.createElement('div');
            errorContainer.className = 'field-error';
            errorContainer.id = `error-${input.id}`;
            errorContainer.setAttribute('role', 'alert');
            errorContainer.style.display = 'none';
            input.parentElement.appendChild(errorContainer);
            
            input.setAttribute('aria-describedby', errorContainer.id);
        }

        // Añadir indicador de campo requerido
        if (input.required && !input.parentElement.querySelector('.required-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'required-indicator';
            indicator.textContent = '*';
            indicator.setAttribute('aria-hidden', 'true');
            indicator.style.color = '#dc3545';
            indicator.style.marginLeft = '4px';
            
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) {
                label.appendChild(indicator);
            }
        }
    }

    /**
     * ⚡ Manejar actualización en tiempo real
     */
    handleRealTimeUpdate(input) {
        const formId = input.dataset.formId;
        const fieldName = input.name || input.id;
        const value = this.getInputValue(input);

        // Debounce para evitar demasiadas actualizaciones
        const debounceKey = `${formId}_${fieldName}`;
        
        if (this.debounceTimers.has(debounceKey)) {
            clearTimeout(this.debounceTimers.get(debounceKey));
        }

        const timer = setTimeout(() => {
            this.performRealTimeUpdate(input, value);
            this.debounceTimers.delete(debounceKey);
        }, this.defaultDebounceDelay);

        this.debounceTimers.set(debounceKey, timer);
    }

    /**
     * 🔄 Realizar actualización en tiempo real
     */
    performRealTimeUpdate(input, value) {
        const formId = input.dataset.formId;
        const fieldName = input.name || input.id;
        const updaterName = input.dataset.updater;

        // Validación en tiempo real
        this.validateField(input, value);

        // Actualización visual en tiempo real
        if (updaterName && this.realTimeUpdaters.has(updaterName)) {
            const updater = this.realTimeUpdaters.get(updaterName);
            try {
                updater(input, value, formId);
            } catch (error) {
                console.error(`❌ Error en updater ${updaterName}:`, error);
            }
        }

        // Guardar automáticamente si está habilitado
        const config = this.forms.get(formId);
        if (config && config.autoSave && config.persistence) {
            this.saveFieldValue(formId, fieldName, value);
        }

        // Disparar evento personalizado
        this.dispatchUpdateEvent(input, value);
    }

    /**
     * ✅ Validar campo
     */
    validateField(input, value) {
        const validatorName = input.dataset.validator;
        const errorContainer = input.parentElement.querySelector('.field-error');
        
        let isValid = true;
        let errorMessage = '';

        // Validación requerido
        if (input.required && (!value || value.trim() === '')) {
            isValid = false;
            errorMessage = 'Este campo es requerido';
        }
        // Validación de patrón
        else if (input.pattern && value && !new RegExp(input.pattern).test(value)) {
            isValid = false;
            errorMessage = 'El formato no es válido';
        }
        // Validador personalizado
        else if (validatorName && this.validators.has(validatorName)) {
            const validator = this.validators.get(validatorName);
            const result = validator(value, input);
            isValid = result.isValid;
            errorMessage = result.message || '';
        }

        // Actualizar UI
        this.updateFieldValidation(input, isValid, errorMessage);
        
        return isValid;
    }

    /**
     * 🎨 Actualizar UI de validación
     */
    updateFieldValidation(input, isValid, errorMessage) {
        const errorContainer = input.parentElement.querySelector('.field-error');
        
        if (isValid) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            input.setAttribute('aria-invalid', 'false');
            
            if (errorContainer) {
                errorContainer.style.display = 'none';
                errorContainer.textContent = '';
            }
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            input.setAttribute('aria-invalid', 'true');
            
            if (errorContainer) {
                errorContainer.style.display = 'block';
                errorContainer.textContent = errorMessage;
                errorContainer.className = 'field-error text-danger small mt-1';
            }
        }
    }

    /**
     * 🎯 Configurar validadores por defecto
     */
    setupDefaultValidators() {
        // Email
        this.validators.set('email', (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return {
                isValid: !value || emailRegex.test(value),
                message: 'Ingresa un email válido'
            };
        });

        // Teléfono argentino
        this.validators.set('phone', (value) => {
            const phoneRegex = /^(?:\+54)?(?:11|[2368]\d)\d{8}$/;
            return {
                isValid: !value || phoneRegex.test(value.replace(/\s/g, '')),
                message: 'Ingresa un teléfono válido (ej: 11 1234 5678)'
            };
        });

        // Código postal argentino
        this.validators.set('postalCode', (value) => {
            const postalRegex = /^[A-Z]\d{4}[A-Z]{3}$|^\d{4}$/;
            return {
                isValid: !value || postalRegex.test(value.toUpperCase()),
                message: 'Código postal inválido (ej: 1234 o C1234ABC)'
            };
        });

        // Contraseña fuerte
        this.validators.set('password', (value) => {
            if (!value) return { isValid: true, message: '' };
            
            const hasLength = value.length >= 8;
            const hasUpper = /[A-Z]/.test(value);
            const hasLower = /[a-z]/.test(value);
            const hasNumber = /\d/.test(value);
            
            const isValid = hasLength && hasUpper && hasLower && hasNumber;
            
            return {
                isValid,
                message: isValid ? '' : 'La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas y números'
            };
        });

        // Confirmar contraseña
        this.validators.set('confirmPassword', (value, input) => {
            const passwordInput = input.form.querySelector('input[type="password"]:not([data-validator="confirmPassword"])');
            const passwordValue = passwordInput ? passwordInput.value : '';
            
            return {
                isValid: !value || value === passwordValue,
                message: 'Las contraseñas no coinciden'
            };
        });
    }

    /**
     * 🎨 Configurar actualizadores en tiempo real por defecto
     */
    setupDefaultUpdaters() {
        // Cambio de color de fondo
        this.realTimeUpdaters.set('backgroundColor', (input, value) => {
            if (this.isValidColor(value)) {
                document.body.style.backgroundColor = value;
                QuickStorage.setBackgroundColor(value);
                
                // Feedback visual
                this.showUpdateFeedback(input, '🎨 Color aplicado');
            }
        });

        // Cambio de tema
        this.realTimeUpdaters.set('theme', (input, value) => {
            QuickStorage.setTheme(value);
            this.showUpdateFeedback(input, `🌓 Tema ${value} aplicado`);
        });

        // Actualización de contador de carrito
        this.realTimeUpdaters.set('cartCounter', (input, value) => {
            this.updateCartCounter();
        });

        // Preview de imagen
        this.realTimeUpdaters.set('imagePreview', (input, value) => {
            if (input.type === 'file') {
                this.previewImage(input, value);
            } else if (input.type === 'url' || input.type === 'text') {
                this.previewImageFromUrl(input, value);
            }
        });

        // Cálculo de precio total
        this.realTimeUpdaters.set('priceCalculator', (input, value) => {
            this.calculateTotalPrice(input.form);
        });

        // Formato de número de teléfono
        this.realTimeUpdaters.set('phoneFormatter', (input, value) => {
            const formatted = this.formatPhoneNumber(value);
            if (formatted !== value) {
                input.value = formatted;
            }
        });
    }

    /**
     * 🎨 Validar color
     */
    isValidColor(color) {
        const style = new Option().style;
        style.color = color;
        return style.color !== '';
    }

    /**
     * 💬 Mostrar feedback de actualización
     */
    showUpdateFeedback(input, message) {
        // Crear o actualizar tooltip de feedback
        let feedback = input.parentElement.querySelector('.update-feedback');
        
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'update-feedback';
            feedback.style.cssText = `
                position: absolute;
                top: -30px;
                right: 0;
                background: #28a745;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            `;
            input.parentElement.style.position = 'relative';
            input.parentElement.appendChild(feedback);
        }

        feedback.textContent = message;
        feedback.style.opacity = '1';

        // Auto-hide después de 2 segundos
        setTimeout(() => {
            feedback.style.opacity = '0';
        }, 2000);
    }

    /**
     * 🛒 Actualizar contador de carrito
     */
    updateCartCounter() {
        const count = QuickStorage.getCarritoCount();
        const badges = document.querySelectorAll('#cart-count, .cart-badge, [data-cart-counter]');
        
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
            
            // Animación de actualización
            badge.style.transform = 'scale(1.2)';
            setTimeout(() => {
                badge.style.transform = 'scale(1)';
            }, 200);
        });

        // Actualizar texto del carrito
        const cartTexts = document.querySelectorAll('[data-cart-text]');
        cartTexts.forEach(text => {
            text.textContent = count === 1 ? '1 artículo' : `${count} artículos`;
        });
    }

    /**
     * 🖼️ Preview de imagen desde archivo
     */
    previewImage(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.displayImagePreview(input, e.target.result);
        };
        reader.readAsDataURL(file);
    }

    /**
     * 🌐 Preview de imagen desde URL
     */
    previewImageFromUrl(input, url) {
        if (!url || !this.isValidUrl(url)) return;

        // Crear imagen temporal para verificar si es válida
        const img = new Image();
        img.onload = () => {
            this.displayImagePreview(input, url);
        };
        img.onerror = () => {
            this.showUpdateFeedback(input, '❌ URL de imagen inválida');
        };
        img.src = url;
    }

    /**
     * 🖼️ Mostrar preview de imagen
     */
    displayImagePreview(input, src) {
        let preview = input.parentElement.querySelector('.image-preview');
        
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.style.cssText = `
                margin-top: 10px;
                max-width: 200px;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            `;
            input.parentElement.appendChild(preview);
        }

        preview.innerHTML = `
            <img src="${src}" alt="Preview" style="width: 100%; height: auto; display: block;">
            <div style="padding: 8px; background: #f8f9fa; text-align: center; font-size: 12px; color: #6c757d;">
                Preview de imagen
            </div>
        `;
    }

    /**
     * 💰 Calcular precio total
     */
    calculateTotalPrice(form) {
        const priceInputs = form.querySelectorAll('[data-price]');
        const quantityInputs = form.querySelectorAll('[data-quantity]');
        const totalElement = form.querySelector('[data-total]');
        
        if (!totalElement) return;

        let total = 0;
        
        priceInputs.forEach((priceInput, index) => {
            const price = parseFloat(priceInput.value) || 0;
            const quantityInput = quantityInputs[index];
            const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
            
            total += price * quantity;
        });

        // Formatear como moneda argentina
        const formatted = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(total);

        totalElement.textContent = formatted;
        totalElement.dataset.value = total;

        // Animación de actualización
        totalElement.style.transform = 'scale(1.05)';
        totalElement.style.color = '#28a745';
        
        setTimeout(() => {
            totalElement.style.transform = 'scale(1)';
            totalElement.style.color = '';
        }, 300);
    }

    /**
     * 📞 Formatear número de teléfono
     */
    formatPhoneNumber(value) {
        // Remover caracteres no numéricos excepto +
        const cleaned = value.replace(/[^\d+]/g, '');
        
        // Formato argentino
        if (cleaned.startsWith('+54')) {
            const number = cleaned.substring(3);
            if (number.length >= 10) {
                return `+54 ${number.substring(0, 2)} ${number.substring(2, 6)} ${number.substring(6, 10)}`;
            }
        } else if (cleaned.length >= 10) {
            return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 6)} ${cleaned.substring(6, 10)}`;
        }
        
        return value;
    }

    /**
     * 🔗 Validar URL
     */
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * 💾 Guardar valor de campo
     */
    saveFieldValue(formId, fieldName, value) {
        const key = `form_${formId}_${fieldName}`;
        const data = {
            value,
            timestamp: Date.now(),
            formId,
            fieldName
        };
        
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn(`⚠️ No se pudo guardar ${key}:`, error);
        }
    }

    /**
     * 📁 Restaurar valores del formulario
     */
    restoreFormValues(formId) {
        const config = this.forms.get(formId);
        if (!config) return;

        config.fields.forEach((fieldConfig, fieldName) => {
            const key = `form_${formId}_${fieldName}`;
            
            try {
                const saved = localStorage.getItem(key);
                if (saved) {
                    const data = JSON.parse(saved);
                    
                    // Verificar que no sea muy antiguo (más de 30 días)
                    if (Date.now() - data.timestamp < 30 * 24 * 60 * 60 * 1000) {
                        this.setInputValue(fieldConfig.element, data.value);
                    } else {
                        localStorage.removeItem(key);
                    }
                }
            } catch (error) {
                localStorage.removeItem(key);
            }
        });
    }

    /**
     * 📋 Obtener valor de input según su tipo
     */
    getInputValue(input) {
        switch (input.type) {
            case 'checkbox':
                return input.checked;
            case 'radio':
                return input.checked ? input.value : null;
            case 'number':
            case 'range':
                return parseFloat(input.value) || 0;
            default:
                return input.value;
        }
    }

    /**
     * ✏️ Establecer valor de input según su tipo
     */
    setInputValue(input, value) {
        switch (input.type) {
            case 'checkbox':
                input.checked = Boolean(value);
                break;
            case 'radio':
                input.checked = input.value === value;
                break;
            default:
                input.value = value;
                break;
        }
        
        // Disparar evento para actualización en tiempo real
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    /**
     * 📤 Manejar envío de formulario
     */
    handleFormSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formId = form.dataset.dynamicForm === 'true' ? form.id : form.dataset.dynamicForm;
        const config = this.forms.get(formId);
        
        if (!config) return;

        // Validar todos los campos
        let isValid = true;
        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = value;
            
            const input = form.querySelector(`[name="${key}"], #${key}`);
            if (input && !this.validateField(input, value)) {
                isValid = false;
            }
        }

        if (isValid) {
            this.submitForm(formId, data);
        } else {
            this.showFormErrors(form);
        }
    }

    /**
     * 📤 Enviar formulario
     */
    submitForm(formId, data) {
        console.log(`📤 Enviando formulario ${formId}:`, data);
        
        // Aquí se haría la petición real al servidor
        // Por ahora simulamos éxito
        
        // Guardar en storage
        if (formId === 'preferences-form') {
            QuickStorage.setPreferences(data);
        }
        
        // Mostrar mensaje de éxito
        this.showSuccessMessage(formId);
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('formSubmitted', {
            detail: { formId, data }
        }));
    }

    /**
     * ✅ Mostrar mensaje de éxito
     */
    showSuccessMessage(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        let message = form.querySelector('.success-message');
        
        if (!message) {
            message = document.createElement('div');
            message.className = 'success-message alert alert-success';
            message.setAttribute('role', 'alert');
            form.appendChild(message);
        }

        message.innerHTML = `
            <i class="bi bi-check-circle me-2"></i>
            ¡Formulario enviado exitosamente!
        `;
        
        message.style.display = 'block';
        
        // Auto-hide después de 5 segundos
        setTimeout(() => {
            message.style.display = 'none';
        }, 5000);
    }

    /**
     * ❌ Mostrar errores del formulario
     */
    showFormErrors(form) {
        // Hacer scroll al primer error
        const firstError = form.querySelector('.is-invalid');
        if (firstError) {
            firstError.focus();
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Mensaje general de error
        let message = form.querySelector('.error-message');
        
        if (!message) {
            message = document.createElement('div');
            message.className = 'error-message alert alert-danger';
            message.setAttribute('role', 'alert');
            form.insertBefore(message, form.firstChild);
        }

        message.innerHTML = `
            <i class="bi bi-exclamation-triangle me-2"></i>
            Por favor, corrige los errores marcados en rojo.
        `;
        
        message.style.display = 'block';
    }

    /**
     * 💾 Cargar preferencias guardadas
     */
    loadSavedPreferences() {
        const preferences = QuickStorage.getPreferences();
        
        // Aplicar tema
        if (preferences.theme) {
            document.body.classList.add(`theme-${preferences.theme}`);
        }

        // Aplicar color de fondo
        if (preferences.backgroundColor) {
            document.body.style.backgroundColor = preferences.backgroundColor;
        }

        console.log('⚙️ Preferencias cargadas:', preferences);
    }

    /**
     * 💾 Guardar todas las preferencias
     */
    saveAllPreferences() {
        this.forms.forEach((config, formId) => {
            if (config.persistence && config.autoSave) {
                const form = document.getElementById(formId);
                if (form) {
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());
                    
                    if (Object.keys(data).length > 0) {
                        const key = `form_${formId}_data`;
                        try {
                            localStorage.setItem(key, JSON.stringify({
                                data,
                                timestamp: Date.now()
                            }));
                        } catch (error) {
                            console.warn(`⚠️ No se pudo guardar formulario ${formId}:`, error);
                        }
                    }
                }
            }
        });
    }

    /**
     * 📡 Disparar evento personalizado
     */
    dispatchUpdateEvent(input, value) {
        const event = new CustomEvent('fieldUpdated', {
            detail: {
                input,
                value,
                fieldName: input.name || input.id,
                formId: input.dataset.formId,
                timestamp: Date.now()
            },
            bubbles: true
        });
        
        input.dispatchEvent(event);
    }

    /**
     * 🔧 Registrar validador personalizado
     */
    registerValidator(name, validator) {
        this.validators.set(name, validator);
    }

    /**
     * 🔧 Registrar actualizador personalizado
     */
    registerUpdater(name, updater) {
        this.realTimeUpdaters.set(name, updater);
    }

    /**
     * 📊 Obtener estadísticas
     */
    getStats() {
        return {
            formsRegistered: this.forms.size,
            validatorsAvailable: this.validators.size,
            updatersAvailable: this.realTimeUpdaters.size,
            activeTimers: this.debounceTimers.size
        };
    }
}

// 🚀 Crear instancia global
const FormManager = new DynamicFormManager();

// Exponer globalmente
window.DynamicFormManager = FormManager;

/**
 * 🎯 HELPER FUNCTIONS PARA USO FÁCIL
 */

// Función global para registrar formulario dinámico
window.registerDynamicForm = function(formId, config = {}) {
    return FormManager.registerForm(formId, config);
};

// Función global para actualizar contador de carrito
window.updateCartCounter = function() {
    FormManager.updateCartCounter();
};

// Función global para aplicar color de fondo
window.applyBackgroundColor = function(color) {
    if (FormManager.isValidColor(color)) {
        document.body.style.backgroundColor = color;
        QuickStorage.setBackgroundColor(color);
        return true;
    }
    return false;
};

// Auto-registro de formularios con data-dynamic-form
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-dynamic-form]').forEach(form => {
        const config = {
            autoSave: form.dataset.autoSave !== 'false',
            realTime: form.dataset.realTime !== 'false',
            validation: form.dataset.validation !== 'false',
            persistence: form.dataset.persistence !== 'false'
        };
        
        FormManager.registerForm(form.id, config);
    });
});

console.log('🎨 Sistema de formularios dinámicos inicializado');

/**
 * 📚 EJEMPLOS DE USO:
 * 
 * // HTML
 * <form id="preferences-form" data-dynamic-form="true">
 *   <input type="color" name="backgroundColor" 
 *          data-updater="backgroundColor" data-dynamic-update="true">
 *   <select name="theme" data-updater="theme" data-dynamic-update="true">
 *     <option value="light">Claro</option>
 *     <option value="dark">Oscuro</option>
 *   </select>
 * </form>
 * 
 * // JavaScript
 * registerDynamicForm('my-form', {
 *   autoSave: true,
 *   realTime: true,
 *   validation: true
 * });
 * 
 * // Escuchar cambios
 * document.addEventListener('fieldUpdated', (e) => {
 *   console.log('Campo actualizado:', e.detail);
 * });
 */