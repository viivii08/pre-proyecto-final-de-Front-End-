/**
 * 🎛️ SISTEMA DE FORMULARIOS DINÁMICOS
 * Aplicación de cambios en tiempo real con preview instantáneo
 */

class DynamicFormSystem {
    constructor(options = {}) {
        this.options = {
            updateDelay: 300, // Debounce delay
            enablePreview: true,
            autoSave: true,
            validationOnChange: true,
            ...options
        };

        this.forms = new Map();
        this.updateTimers = new Map();
        this.validators = new Map();
        this.previewElements = new Map();
        
        this.init();
    }

    /**
     * 🚀 Inicialización del sistema
     */
    init() {
        console.log('🎛️ Inicializando sistema de formularios dinámicos...');
        
        // Auto-detectar formularios con atributo data-dynamic
        this.detectDynamicForms();
        
        // Configurar observador de mutaciones para nuevos formularios
        this.setupMutationObserver();
        
        console.log('✅ Sistema de formularios dinámicos inicializado');
    }

    /**
     * 🔍 Detectar formularios dinámicos automáticamente
     */
    detectDynamicForms() {
        const dynamicForms = document.querySelectorAll('[data-dynamic="true"], .dynamic-form');
        
        dynamicForms.forEach(form => {
            this.registerForm(form);
        });
    }

    /**
     * 📝 Registrar formulario para comportamiento dinámico
     */
    registerForm(formElement, config = {}) {
        try {
            const formId = formElement.id || `dynamic-form-${this.forms.size}`;
            
            if (!formElement.id) {
                formElement.id = formId;
            }

            const formConfig = {
                element: formElement,
                updateDelay: config.updateDelay || this.options.updateDelay,
                enablePreview: config.enablePreview ?? this.options.enablePreview,
                autoSave: config.autoSave ?? this.options.autoSave,
                validationOnChange: config.validationOnChange ?? this.options.validationOnChange,
                previewTarget: config.previewTarget,
                saveCallback: config.saveCallback,
                updateCallback: config.updateCallback,
                ...config
            };

            this.forms.set(formId, formConfig);
            this.setupFormListeners(formId);
            
            console.log(`📝 Formulario registrado: ${formId}`);
            
        } catch (error) {
            console.error('❌ Error registrando formulario:', error);
        }
    }

    /**
     * 🎯 Configurar event listeners para el formulario
     */
    setupFormListeners(formId) {
        const config = this.forms.get(formId);
        if (!config) return;

        const form = config.element;
        const inputs = form.querySelectorAll('input, select, textarea, [data-input]');

        inputs.forEach(input => {
            // Eventos principales
            const events = ['input', 'change', 'keyup', 'paste'];
            
            events.forEach(eventType => {
                input.addEventListener(eventType, (e) => {
                    this.handleInputChange(formId, e.target, eventType);
                });
            });

            // Eventos especiales para elementos específicos
            if (input.type === 'color') {
                input.addEventListener('input', (e) => {
                    this.handleColorChange(formId, e.target);
                });
            }

            if (input.type === 'range') {
                input.addEventListener('input', (e) => {
                    this.handleRangeChange(formId, e.target);
                });
            }

            // Focus y blur para validación
            input.addEventListener('focus', (e) => {
                this.handleInputFocus(formId, e.target);
            });

            input.addEventListener('blur', (e) => {
                this.handleInputBlur(formId, e.target);
            });
        });

        // Submit del formulario
        form.addEventListener('submit', (e) => {
            this.handleFormSubmit(formId, e);
        });

        // Reset del formulario
        form.addEventListener('reset', (e) => {
            this.handleFormReset(formId, e);
        });
    }

    /**
     * 🎨 Manejar cambios en inputs con debounce
     */
    handleInputChange(formId, input, eventType) {
        const config = this.forms.get(formId);
        if (!config) return;

        // Limpiar timer anterior
        if (this.updateTimers.has(input)) {
            clearTimeout(this.updateTimers.get(input));
        }

        // Validación inmediata para ciertos tipos
        const immediateValidation = ['color', 'range', 'checkbox', 'radio'];
        const isImmediate = immediateValidation.includes(input.type) || eventType === 'change';

        const updateFn = () => {
            try {
                // Validación
                if (config.validationOnChange) {
                    this.validateInput(input);
                }

                // Preview en tiempo real
                if (config.enablePreview) {
                    this.updatePreview(formId, input);
                }

                // Callback personalizado
                if (config.updateCallback && typeof config.updateCallback === 'function') {
                    config.updateCallback(input, this.getFormData(formId));
                }

                // Auto-save
                if (config.autoSave && this.isValidForm(formId)) {
                    this.autoSaveForm(formId);
                }

                // Aplicar cambios a UserPreferencesSystem si está disponible
                this.syncWithPreferences(formId, input);

            } catch (error) {
                console.error('❌ Error en actualización dinámica:', error);
            }
        };

        if (isImmediate) {
            updateFn();
        } else {
            // Debounce para texto
            const timer = setTimeout(updateFn, config.updateDelay);
            this.updateTimers.set(input, timer);
        }
    }

    /**
     * 🎨 Manejar cambios de color con preview instantáneo
     */
    handleColorChange(formId, colorInput) {
        const value = colorInput.value;
        const propertyName = colorInput.dataset.cssProperty;
        const previewTarget = colorInput.dataset.previewTarget;

        // Aplicar color inmediatamente
        if (propertyName) {
            document.documentElement.style.setProperty(`--${propertyName}`, value);
        }

        if (previewTarget) {
            const target = document.querySelector(previewTarget);
            if (target) {
                const colorProperty = colorInput.dataset.colorProperty || 'backgroundColor';
                target.style[colorProperty] = value;
            }
        }

        // Mostrar valor hex en label asociado
        const label = document.querySelector(`label[for="${colorInput.id}"]`);
        if (label) {
            const valueSpan = label.querySelector('.color-value') || 
                           this.createColorValueDisplay(label);
            valueSpan.textContent = value.toUpperCase();
        }

        // Sincronizar con sistema de preferencias
        if (window.userPreferences && colorInput.dataset.prefCategory && colorInput.dataset.prefSetting) {
            window.userPreferences.set(
                colorInput.dataset.prefCategory,
                colorInput.dataset.prefSetting,
                value
            );
        }
    }

    /**
     * 📏 Manejar cambios de range con display de valor
     */
    handleRangeChange(formId, rangeInput) {
        const value = rangeInput.value;
        
        // Actualizar display de valor
        const valueDisplay = document.querySelector(`#${rangeInput.id}-value`) ||
                           rangeInput.parentNode.querySelector('.range-value');
        
        if (valueDisplay) {
            const unit = rangeInput.dataset.unit || '';
            valueDisplay.textContent = `${value}${unit}`;
        }

        // Aplicar cambio CSS si está configurado
        const cssProperty = rangeInput.dataset.cssProperty;
        if (cssProperty) {
            const unit = rangeInput.dataset.cssUnit || '';
            document.documentElement.style.setProperty(
                `--${cssProperty}`, 
                `${value}${unit}`
            );
        }
    }

    /**
     * 🔍 Validar input individual
     */
    validateInput(input) {
        try {
            // Limpiar validaciones anteriores
            input.classList.remove('is-valid', 'is-invalid');
            this.clearValidationMessage(input);

            // Validación HTML5 nativa
            if (!input.checkValidity()) {
                this.showValidationError(input, input.validationMessage);
                return false;
            }

            // Validaciones personalizadas
            const validator = this.validators.get(input.id);
            if (validator && typeof validator === 'function') {
                const result = validator(input.value, input);
                
                if (result !== true) {
                    this.showValidationError(input, result || 'Valor inválido');
                    return false;
                }
            }

            // Input válido
            input.classList.add('is-valid');
            return true;

        } catch (error) {
            console.error('❌ Error en validación:', error);
            return false;
        }
    }

    /**
     * 👁️ Actualizar preview en tiempo real
     */
    updatePreview(formId, input) {
        const config = this.forms.get(formId);
        const previewTarget = config.previewTarget || input.dataset.previewTarget;
        
        if (!previewTarget) return;

        const previewElement = document.querySelector(previewTarget);
        if (!previewElement) return;

        try {
            const inputType = input.type;
            const value = input.value;

            switch (inputType) {
                case 'color':
                    this.updateColorPreview(previewElement, input, value);
                    break;
                    
                case 'range':
                    this.updateRangePreview(previewElement, input, value);
                    break;
                    
                case 'text':
                case 'textarea':
                    this.updateTextPreview(previewElement, input, value);
                    break;
                    
                case 'select-one':
                    this.updateSelectPreview(previewElement, input, value);
                    break;
                    
                default:
                    this.updateGenericPreview(previewElement, input, value);
            }

        } catch (error) {
            console.error('❌ Error actualizando preview:', error);
        }
    }

    /**
     * 🎨 Actualizar preview de color
     */
    updateColorPreview(previewElement, input, color) {
        const property = input.dataset.previewProperty || 'backgroundColor';
        previewElement.style[property] = color;
        
        // Agregar clase para transición suave
        previewElement.classList.add('color-transition');
    }

    /**
     * 📏 Actualizar preview de range
     */
    updateRangePreview(previewElement, input, value) {
        const property = input.dataset.previewProperty;
        const unit = input.dataset.previewUnit || '';
        
        if (property) {
            previewElement.style[property] = `${value}${unit}`;
        }
    }

    /**
     * 📝 Actualizar preview de texto
     */
    updateTextPreview(previewElement, input, text) {
        const property = input.dataset.previewProperty;
        
        if (property === 'textContent') {
            previewElement.textContent = text;
        } else if (property === 'innerHTML') {
            previewElement.innerHTML = this.sanitizeHTML(text);
        } else {
            previewElement.style[property] = text;
        }
    }

    /**
     * 📋 Obtener datos del formulario
     */
    getFormData(formId) {
        const config = this.forms.get(formId);
        if (!config) return {};

        const form = config.element;
        const formData = new FormData(form);
        const data = {};

        // Convertir FormData a objeto
        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                // Manejar múltiples valores
                data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
            } else {
                data[key] = value;
            }
        }

        // Agregar campos no-input (como data attributes)
        const customFields = form.querySelectorAll('[data-form-field]');
        customFields.forEach(field => {
            const fieldName = field.dataset.formField;
            const fieldValue = field.dataset.value || field.textContent;
            data[fieldName] = fieldValue;
        });

        return data;
    }

    /**
     * 🔄 Sincronizar con sistema de preferencias
     */
    syncWithPreferences(formId, input) {
        if (!window.userPreferences) return;

        const category = input.dataset.prefCategory;
        const setting = input.dataset.prefSetting;
        
        if (category && setting) {
            let value = input.value;
            
            // Conversiones de tipo
            if (input.type === 'checkbox') {
                value = input.checked;
            } else if (input.type === 'number' || input.type === 'range') {
                value = parseFloat(value);
            }
            
            window.userPreferences.set(category, setting, value);
        }
    }

    /**
     * 💾 Auto-save del formulario
     */
    async autoSaveForm(formId) {
        try {
            const config = this.forms.get(formId);
            const data = this.getFormData(formId);
            
            if (config.saveCallback && typeof config.saveCallback === 'function') {
                await config.saveCallback(data, formId);
            } else {
                // Auto-save por defecto en localStorage
                const saveKey = `form_autosave_${formId}`;
                localStorage.setItem(saveKey, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
            }
            
            this.showAutoSaveIndicator(formId);
            
        } catch (error) {
            console.error('❌ Error en auto-save:', error);
        }
    }

    /**
     * 🎯 Agregar validador personalizado
     */
    addValidator(inputId, validatorFunction) {
        this.validators.set(inputId, validatorFunction);
    }

    /**
     * ❌ Mostrar error de validación
     */
    showValidationError(input, message) {
        input.classList.add('is-invalid');
        
        let errorElement = input.parentNode.querySelector('.invalid-feedback');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'invalid-feedback';
            input.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }

    /**
     * 🧹 Limpiar mensaje de validación
     */
    clearValidationMessage(input) {
        const errorElement = input.parentNode.querySelector('.invalid-feedback');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    /**
     * 💾 Mostrar indicador de auto-save
     */
    showAutoSaveIndicator(formId) {
        const config = this.forms.get(formId);
        const form = config.element;
        
        let indicator = form.querySelector('.auto-save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'auto-save-indicator';
            indicator.innerHTML = '<i class="bi bi-check-circle"></i> Guardado automáticamente';
            form.appendChild(indicator);
        }
        
        indicator.classList.add('show');
        
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }

    /**
     * 🛠️ Crear display de valor de color
     */
    createColorValueDisplay(label) {
        const span = document.createElement('span');
        span.className = 'color-value ms-2 text-muted';
        span.style.fontFamily = 'monospace';
        label.appendChild(span);
        return span;
    }

    /**
     * 🧼 Sanitizar HTML
     */
    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    /**
     * ✅ Verificar si el formulario es válido
     */
    isValidForm(formId) {
        const config = this.forms.get(formId);
        if (!config) return false;

        const form = config.element;
        return form.checkValidity();
    }

    /**
     * 🔍 Configurar observador de mutaciones
     */
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Buscar nuevos formularios dinámicos
                        const newForms = node.querySelectorAll && 
                                        node.querySelectorAll('[data-dynamic="true"], .dynamic-form');
                        
                        if (newForms) {
                            newForms.forEach(form => this.registerForm(form));
                        }
                        
                        // Verificar si el nodo mismo es un formulario dinámico
                        if (node.matches && 
                            node.matches('[data-dynamic="true"], .dynamic-form')) {
                            this.registerForm(node);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * 🧹 Cleanup
     */
    destroy() {
        // Limpiar timers
        this.updateTimers.forEach(timer => clearTimeout(timer));
        this.updateTimers.clear();
        
        // Limpiar maps
        this.forms.clear();
        this.validators.clear();
        this.previewElements.clear();
    }
}

// CSS para transiciones y estilos
const dynamicFormStyles = `
.color-transition {
    transition: background-color 0.3s ease, color 0.3s ease !important;
}

.auto-save-indicator {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 0.875rem;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease;
    z-index: 1000;
}

.auto-save-indicator.show {
    opacity: 1;
    transform: translateY(0);
}

.range-value {
    font-weight: 600;
    color: var(--primary-color, #1f3c5a);
    font-family: monospace;
}

.color-value {
    font-size: 0.8em;
    opacity: 0.8;
}

/* Estilos para validación mejorada */
.form-control.is-valid {
    border-color: #28a745;
    box-shadow: 0 0 0 0.1rem rgba(40, 167, 69, 0.25);
}

.form-control.is-invalid {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.1rem rgba(220, 53, 69, 0.25);
}

.invalid-feedback {
    display: block;
    font-size: 0.875rem;
    color: #dc3545;
    margin-top: 0.25rem;
}
`;

// Inyectar estilos
if (!document.querySelector('#dynamic-form-styles')) {
    const style = document.createElement('style');
    style.id = 'dynamic-form-styles';
    style.textContent = dynamicFormStyles;
    document.head.appendChild(style);
}

// Hacer disponible globalmente
window.DynamicFormSystem = DynamicFormSystem;

// Auto-inicialización
document.addEventListener('DOMContentLoaded', () => {
    if (!window.dynamicFormSystem) {
        window.dynamicFormSystem = new DynamicFormSystem();
    }
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicFormSystem;
}