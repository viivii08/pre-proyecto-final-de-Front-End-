/**
 * 💬 SISTEMA DE MENSAJES DE FEEDBACK PARA CARRITO
 * Proporciona mensajes claros, contextuales y bien diseñados
 */

class FeedbackSystem {
    constructor() {
        this.container = null;
        this.queue = [];
        this.isShowing = false;
        this.config = this.getDefaultConfig();
        this.templates = this.getMessageTemplates();
        this.init();
    }

    /**
     * ⚙️ Configuración por defecto
     */
    getDefaultConfig() {
        return {
            duration: 3000,           // Duración por defecto
            position: 'top-right',    // Posición de notificaciones
            maxMessages: 5,           // Máximo mensajes simultáneos
            animations: true,         // Usar animaciones
            sounds: false,            // Sonidos (opcional)
            autoHide: true,          // Auto-ocultar mensajes
            stackMessages: true       // Apilar mensajes
        };
    }

    /**
     * 📝 Templates de mensajes contextuales
     */
    getMessageTemplates() {
        return {
            // ✅ Mensajes de éxito
            success: {
                addToCart: {
                    icon: 'bi-cart-plus',
                    title: '¡Producto agregado!',
                    getMessage: (data) => `${data.productName} se agregó al carrito`,
                    duration: 2500
                },
                updateQuantity: {
                    icon: 'bi-check-circle',
                    title: 'Cantidad actualizada',
                    getMessage: (data) => `${data.productName}: ${data.newQuantity} unidades`,
                    duration: 2000
                },
                removeFromCart: {
                    icon: 'bi-trash',
                    title: 'Producto eliminado',
                    getMessage: (data) => `${data.productName} fue eliminado del carrito`,
                    duration: 2500
                },
                clearCart: {
                    icon: 'bi-cart-x',
                    title: 'Carrito vaciado',
                    getMessage: () => 'Se eliminaron todos los productos',
                    duration: 2000
                },
                cartSaved: {
                    icon: 'bi-save',
                    title: 'Carrito guardado',
                    getMessage: () => 'Tus productos se mantienen seguros',
                    duration: 2000
                }
            },

            // ⚠️ Mensajes de advertencia
            warning: {
                stockLimit: {
                    icon: 'bi-exclamation-triangle',
                    title: 'Stock limitado',
                    getMessage: (data) => `Solo quedan ${data.availableStock} unidades de ${data.productName}`,
                    duration: 3500
                },
                maxQuantity: {
                    icon: 'bi-exclamation-circle',
                    title: 'Cantidad máxima',
                    getMessage: (data) => `No puedes agregar más de ${data.maxQuantity} unidades`,
                    duration: 3000
                },
                duplicateProduct: {
                    icon: 'bi-info-circle',
                    title: 'Producto ya en carrito',
                    getMessage: (data) => `${data.productName} ya está en tu carrito. Cantidad actualizada.`,
                    duration: 3000
                },
                cartRecovered: {
                    icon: 'bi-arrow-clockwise',
                    title: 'Carrito recuperado',
                    getMessage: (data) => `Se restauraron ${data.itemCount} productos`,
                    duration: 3000
                }
            },

            // ❌ Mensajes de error
            error: {
                productNotFound: {
                    icon: 'bi-x-circle',
                    title: 'Producto no disponible',
                    getMessage: () => 'El producto solicitado no está disponible',
                    duration: 4000
                },
                outOfStock: {
                    icon: 'bi-x-octagon',
                    title: 'Sin stock',
                    getMessage: (data) => `${data.productName} está agotado`,
                    duration: 3500
                },
                cartError: {
                    icon: 'bi-exclamation-diamond',
                    title: 'Error en carrito',
                    getMessage: () => 'No se pudo completar la operación. Intenta nuevamente.',
                    duration: 4000
                },
                saveError: {
                    icon: 'bi-cloud-slash',
                    title: 'Error guardando',
                    getMessage: () => 'No se pudieron guardar los cambios',
                    duration: 4000
                },
                invalidQuantity: {
                    icon: 'bi-hash',
                    title: 'Cantidad inválida',
                    getMessage: () => 'Ingresa una cantidad válida (1 o más)',
                    duration: 3000
                },
                networkError: {
                    icon: 'bi-wifi-off',
                    title: 'Error de conexión',
                    getMessage: () => 'Verifica tu conexión a internet',
                    duration: 4500
                }
            },

            // ℹ️ Mensajes informativos
            info: {
                cartLoading: {
                    icon: 'bi-hourglass-split',
                    title: 'Cargando carrito...',
                    getMessage: () => 'Obteniendo tus productos',
                    duration: 1500,
                    showSpinner: true
                },
                cartEmpty: {
                    icon: 'bi-cart',
                    title: 'Carrito vacío',
                    getMessage: () => 'Agrega productos para comenzar tu compra',
                    duration: 2500
                },
                priceUpdate: {
                    icon: 'bi-tag',
                    title: 'Precio actualizado',
                    getMessage: (data) => `${data.productName}: nuevo precio $${data.newPrice}`,
                    duration: 3000
                },
                cartMigrated: {
                    icon: 'bi-arrow-up-circle',
                    title: 'Carrito actualizado',
                    getMessage: () => 'Se mejoró el formato de tu carrito',
                    duration: 2500
                }
            }
        };
    }

    /**
     * 🚀 Inicializar sistema de feedback
     */
    init() {
        this.createContainer();
        this.injectStyles();
        this.setupEventListeners();
    }

    /**
     * 📦 Crear contenedor de mensajes
     */
    createContainer() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.id = 'feedback-container';
        this.container.className = `feedback-container position-${this.config.position}`;
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-label', 'Notificaciones del carrito');
        
        document.body.appendChild(this.container);
    }

    /**
     * 🎨 Inyectar estilos CSS
     */
    injectStyles() {
        if (document.querySelector('#feedback-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'feedback-styles';
        styles.textContent = `
            .feedback-container {
                position: fixed;
                z-index: 10000;
                pointer-events: none;
                max-width: 350px;
                width: 100%;
            }

            .feedback-container.position-top-right {
                top: 20px;
                right: 20px;
            }

            .feedback-container.position-top-left {
                top: 20px;
                left: 20px;
            }

            .feedback-container.position-bottom-right {
                bottom: 20px;
                right: 20px;
            }

            .feedback-container.position-bottom-left {
                bottom: 20px;
                left: 20px;
            }

            .feedback-container.position-top-center {
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
            }

            .feedback-message {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
                margin-bottom: 8px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                pointer-events: auto;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
                max-width: 350px;
                min-width: 280px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .feedback-message.success {
                background: rgba(40, 167, 69, 0.95);
                color: white;
                border-left: 4px solid #28a745;
            }

            .feedback-message.warning {
                background: rgba(255, 193, 7, 0.95);
                color: #333;
                border-left: 4px solid #ffc107;
            }

            .feedback-message.error {
                background: rgba(220, 53, 69, 0.95);
                color: white;
                border-left: 4px solid #dc3545;
            }

            .feedback-message.info {
                background: rgba(23, 162, 184, 0.95);
                color: white;
                border-left: 4px solid #17a2b8;
            }

            .feedback-message:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
            }

            .feedback-icon {
                font-size: 1.25rem;
                flex-shrink: 0;
                margin-top: 1px;
            }

            .feedback-content {
                flex: 1;
                min-width: 0;
            }

            .feedback-title {
                font-weight: 600;
                font-size: 0.9rem;
                margin: 0 0 4px 0;
                line-height: 1.2;
            }

            .feedback-text {
                font-size: 0.85rem;
                opacity: 0.9;
                margin: 0;
                line-height: 1.3;
                word-wrap: break-word;
            }

            .feedback-close {
                background: none;
                border: none;
                color: inherit;
                font-size: 1.1rem;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            .feedback-close:hover {
                opacity: 1;
            }

            .feedback-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                transition: width linear;
            }

            .feedback-spinner {
                width: 14px;
                height: 14px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: currentColor;
                animation: spin 1s linear infinite;
                margin-left: 8px;
                flex-shrink: 0;
            }

            /* Animaciones de entrada */
            .feedback-message.slide-in {
                animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .feedback-message.fade-in {
                animation: fadeIn 0.4s ease-out;
            }

            .feedback-message.bounce-in {
                animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }

            /* Animaciones de salida */
            .feedback-message.slide-out {
                animation: slideOut 0.3s cubic-bezier(0.4, 0, 1, 1);
            }

            .feedback-message.fade-out {
                animation: fadeOut 0.3s ease-in;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }

            @keyframes fadeOut {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0; transform: scale(0.9); }
            }

            @keyframes bounceIn {
                0% { opacity: 0; transform: scale(0.3); }
                50% { opacity: 1; transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { opacity: 1; transform: scale(1); }
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Responsive */
            @media (max-width: 768px) {
                .feedback-container {
                    left: 10px !important;
                    right: 10px !important;
                    max-width: none;
                    transform: none !important;
                }

                .feedback-message {
                    min-width: 0;
                    max-width: none;
                }
            }

            /* Accesibilidad */
            @media (prefers-reduced-motion: reduce) {
                .feedback-message,
                .feedback-close,
                .feedback-progress {
                    transition: none;
                }

                .feedback-message.slide-in,
                .feedback-message.fade-in,
                .feedback-message.bounce-in,
                .feedback-message.slide-out,
                .feedback-message.fade-out {
                    animation: none;
                }

                .feedback-spinner {
                    animation: none;
                }
            }

            /* Modo oscuro */
            @media (prefers-color-scheme: dark) {
                .feedback-message {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
                
                .feedback-message.warning {
                    background: rgba(255, 193, 7, 0.9);
                    color: #000;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * 🎧 Configurar eventos
     */
    setupEventListeners() {
        // Limpiar mensajes al cambiar página
        window.addEventListener('beforeunload', () => {
            this.clearAll();
        });

        // Pausar auto-hide al hover
        if (this.container) {
            this.container.addEventListener('mouseenter', () => {
                this.pauseAutoHide = true;
            });

            this.container.addEventListener('mouseleave', () => {
                this.pauseAutoHide = false;
            });
        }
    }

    /**
     * 💬 Mostrar mensaje principal
     */
    show(type, messageKey, data = {}, options = {}) {
        try {
            const template = this.templates[type]?.[messageKey];
            if (!template) {
                console.warn(`⚠️ Template no encontrado: ${type}.${messageKey}`);
                return this.showCustom(type, 'Mensaje', 'Operación completada', options);
            }

            const message = template.getMessage(data);
            const config = {
                icon: template.icon,
                title: template.title,
                duration: template.duration || this.config.duration,
                showSpinner: template.showSpinner || false,
                ...options
            };

            return this.showCustom(type, config.title, message, config);

        } catch (error) {
            console.error('❌ Error mostrando mensaje:', error);
            return this.showCustom('error', 'Error', 'Ocurrió un problema inesperado');
        }
    }

    /**
     * 🎨 Mostrar mensaje personalizado
     */
    showCustom(type, title, message, options = {}) {
        const config = {
            icon: 'bi-info-circle',
            duration: this.config.duration,
            showProgress: true,
            showClose: true,
            showSpinner: false,
            autoHide: this.config.autoHide,
            animation: 'slide-in',
            ...options
        };

        const messageElement = this.createMessageElement(type, title, message, config);
        
        if (this.config.stackMessages) {
            this.container.appendChild(messageElement);
        } else {
            this.container.innerHTML = '';
            this.container.appendChild(messageElement);
        }

        // Limitar número de mensajes
        this.limitMessages();

        // Auto-hide
        if (config.autoHide && config.duration > 0) {
            this.setupAutoHide(messageElement, config.duration);
        }

        // Animación de entrada
        this.animateIn(messageElement, config.animation);

        return {
            element: messageElement,
            hide: () => this.hideMessage(messageElement)
        };
    }

    /**
     * 🏗️ Crear elemento de mensaje
     */
    createMessageElement(type, title, message, config) {
        const messageEl = document.createElement('div');
        messageEl.className = `feedback-message ${type}`;
        messageEl.setAttribute('role', 'alert');
        messageEl.setAttribute('aria-live', 'assertive');

        const iconClass = config.icon || this.getDefaultIcon(type);
        
        messageEl.innerHTML = `
            <div class="feedback-icon">
                <i class="${iconClass}"></i>
                ${config.showSpinner ? '<div class="feedback-spinner"></div>' : ''}
            </div>
            
            <div class="feedback-content">
                <div class="feedback-title">${title}</div>
                <div class="feedback-text">${message}</div>
            </div>
            
            ${config.showClose ? `
                <button class="feedback-close" type="button" aria-label="Cerrar mensaje">
                    <i class="bi bi-x"></i>
                </button>
            ` : ''}
            
            ${config.showProgress ? '<div class="feedback-progress"></div>' : ''}
        `;

        // Event listeners
        const closeBtn = messageEl.querySelector('.feedback-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hideMessage(messageEl);
            });
        }

        // Click para ocultar
        messageEl.addEventListener('click', () => {
            this.hideMessage(messageEl);
        });

        return messageEl;
    }

    /**
     * ⏰ Configurar auto-hide con barra de progreso
     */
    setupAutoHide(messageEl, duration) {
        const progressBar = messageEl.querySelector('.feedback-progress');
        let startTime = Date.now();
        let timeoutId;
        let progressAnimation;

        const updateProgress = () => {
            if (this.pauseAutoHide) {
                progressAnimation = requestAnimationFrame(updateProgress);
                return;
            }

            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (progressBar) {
                progressBar.style.width = `${(1 - progress) * 100}%`;
            }

            if (progress >= 1) {
                this.hideMessage(messageEl);
            } else {
                progressAnimation = requestAnimationFrame(updateProgress);
            }
        };

        progressAnimation = requestAnimationFrame(updateProgress);

        // Limpiar en caso de eliminación manual
        messageEl._cleanup = () => {
            if (progressAnimation) {
                cancelAnimationFrame(progressAnimation);
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }

    /**
     * 🎭 Animación de entrada
     */
    animateIn(messageEl, animation) {
        if (!this.config.animations) return;
        
        messageEl.classList.add(animation);
        setTimeout(() => {
            messageEl.classList.remove(animation);
        }, 500);
    }

    /**
     * 🚪 Ocultar mensaje con animación
     */
    hideMessage(messageEl) {
        if (!messageEl || !messageEl.parentNode) return;

        // Limpiar timers
        if (messageEl._cleanup) {
            messageEl._cleanup();
        }

        if (this.config.animations) {
            messageEl.classList.add('slide-out');
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        } else {
            messageEl.parentNode.removeChild(messageEl);
        }
    }

    /**
     * 🧹 Limpiar mensajes antiguos
     */
    limitMessages() {
        const messages = this.container.querySelectorAll('.feedback-message');
        while (messages.length > this.config.maxMessages) {
            this.hideMessage(messages[0]);
        }
    }

    /**
     * 🗑️ Limpiar todos los mensajes
     */
    clearAll() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    /**
     * 🎨 Obtener icono por defecto según tipo
     */
    getDefaultIcon(type) {
        const icons = {
            success: 'bi-check-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
            error: 'bi-x-circle-fill',
            info: 'bi-info-circle-fill'
        };
        return icons[type] || icons.info;
    }

    /**
     * 🚀 Métodos de conveniencia
     */
    success(messageKey, data, options) {
        return this.show('success', messageKey, data, options);
    }

    warning(messageKey, data, options) {
        return this.show('warning', messageKey, data, options);
    }

    error(messageKey, data, options) {
        return this.show('error', messageKey, data, options);
    }

    info(messageKey, data, options) {
        return this.show('info', messageKey, data, options);
    }

    /**
     * ⚙️ Configurar sistema
     */
    configure(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Actualizar contenedor si cambió la posición
        if (this.container && newConfig.position) {
            this.container.className = `feedback-container position-${newConfig.position}`;
        }
    }
}

// Crear instancia global del sistema de feedback SOLO cuando sea seguro
let feedbackSystem;

// Solo inicializar en páginas que necesiten el sistema de feedback
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si estamos en una página que necesita el carrito
    const needsCartFeedback = window.location.pathname.includes('tienda') || 
                              window.location.pathname.includes('carrito') ||
                              window.location.pathname.includes('checkout') ||
                              document.querySelector('.product-grid, .cart-container, [data-cart]');
    
    try {
        if (typeof window.feedback === 'undefined') {
            if (needsCartFeedback) {
                // Inicializar sistema completo solo si es necesario
                feedbackSystem = new FeedbackSystem();
                window.FeedbackSystem = FeedbackSystem;
                window.feedback = feedbackSystem;
                console.log('📢 Sistema de feedback activado para página de carrito');
            } else {
                // Crear mock silencioso para otras páginas
                window.feedback = {
                    success: () => {},
                    error: () => {},
                    warning: () => {},
                    info: () => {},
                    show: () => {},
                    showCustom: () => {}
                };
                console.log('🔇 Sistema de feedback en modo silencioso');
            }
        }
    } catch (error) {
        console.warn('⚠️ Sistema de feedback no pudo inicializarse:', error);
        // Crear un objeto mock para evitar errores
        window.feedback = {
            success: () => {},
            error: () => {},
            warning: () => {},
            info: () => {},
            show: () => {},
            showCustom: () => {}
        };
    }
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FeedbackSystem, feedbackSystem };
}