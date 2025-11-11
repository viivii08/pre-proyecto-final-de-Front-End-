/**
 * ⚠️ ERROR HANDLER SYSTEM
 * Sistema completo de detección y manejo de errores para elementos dinámicos
 * Versión: 2.5
 * Características: Error boundaries, Recovery automático, Logging, Fallbacks
 */

class DOMErrorHandler {
    constructor() {
        this.errors = new Map(); // Registro de errores por elemento
        this.errorCallbacks = new Map(); // Callbacks personalizados por tipo de error
        this.retryAttempts = new Map(); // Intentos de recuperación
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.enableLogging = true;
        this.errorQueue = [];
        this.batchSize = 10;
        
        this.errorTypes = {
            DOM_MANIPULATION: 'dom_manipulation',
            IMAGE_LOAD: 'image_load',
            NETWORK: 'network',
            TEMPLATE_RENDER: 'template_render',
            EVENT_BINDING: 'event_binding',
            MEMORY_LEAK: 'memory_leak',
            PERMISSION: 'permission',
            VALIDATION: 'validation'
        };

        this.init();
    }

    /**
     * 🚀 Inicializar sistema de manejo de errores
     */
    init() {
        this.setupGlobalErrorHandlers();
        this.setupDOMObservers();
        this.setupPerformanceMonitoring();
        this.createErrorDisplay();
        this.startErrorProcessing();
        
        console.log('⚠️ DOMErrorHandler inicializado');
    }

    /**
     * 🌐 Configurar manejadores globales de errores
     */
    setupGlobalErrorHandlers() {
        // Errores JavaScript globales
        window.addEventListener('error', (event) => {
            this.handleError({
                type: this.errorTypes.DOM_MANIPULATION,
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error,
                element: event.target,
                timestamp: new Date().toISOString()
            });
        });

        // Promesas rechazadas sin manejar
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: this.errorTypes.NETWORK,
                message: 'Promise no manejada: ' + event.reason,
                error: event.reason,
                timestamp: new Date().toISOString()
            });
        });

        // Errores de carga de recursos
        document.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleResourceError(event);
            }
        }, true);

        // Errores de red
        window.addEventListener('offline', () => {
            this.handleError({
                type: this.errorTypes.NETWORK,
                message: 'Conexión perdida',
                severity: 'warning',
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * 🔍 Configurar observadores DOM para detectar errores
     */
    setupDOMObservers() {
        // Observer para mutations que podrían causar problemas
        this.mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                try {
                    this.validateMutation(mutation);
                } catch (error) {
                    this.handleError({
                        type: this.errorTypes.DOM_MANIPULATION,
                        message: 'Error en mutación DOM: ' + error.message,
                        error,
                        element: mutation.target,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        });

        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true
        });

        // Observer para elementos que entran en el viewport
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    this.validateElement(entry.target);
                }
            });
        });
    }

    /**
     * 📊 Configurar monitoreo de rendimiento
     */
    setupPerformanceMonitoring() {
        // Monitor de memoria
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
                
                if (memoryUsage > 0.9) {
                    this.handleError({
                        type: this.errorTypes.MEMORY_LEAK,
                        message: `Uso de memoria alto: ${(memoryUsage * 100).toFixed(1)}%`,
                        severity: 'warning',
                        data: { memoryUsage, ...memory },
                        timestamp: new Date().toISOString()
                    });
                }
            }, 30000);
        }

        // Monitor de elementos DOM
        setInterval(() => {
            const elementCount = document.getElementsByTagName('*').length;
            if (elementCount > 5000) {
                this.handleError({
                    type: this.errorTypes.DOM_MANIPULATION,
                    message: `Demasiados elementos DOM: ${elementCount}`,
                    severity: 'warning',
                    data: { elementCount },
                    timestamp: new Date().toISOString()
                });
            }
        }, 60000);
    }

    /**
     * ⚠️ Manejar un error
     */
    async handleError(errorInfo) {
        const errorId = this.generateErrorId();
        const enhancedError = this.enhanceError(errorInfo, errorId);
        
        // Registrar error
        this.errors.set(errorId, enhancedError);
        
        // Log del error
        if (this.enableLogging) {
            this.logError(enhancedError);
        }
        
        // Añadir a la cola de procesamiento
        this.errorQueue.push(enhancedError);
        
        // Intentar recuperación automática
        if (this.shouldAttemptRecovery(enhancedError)) {
            await this.attemptRecovery(enhancedError);
        }
        
        // Mostrar notificación al usuario si es crítico
        if (enhancedError.severity === 'critical') {
            this.showUserNotification(enhancedError);
        }
        
        // Disparar callbacks personalizados
        this.triggerCallbacks(enhancedError);
        
        return errorId;
    }

    /**
     * 🔧 Mejorar información del error
     */
    enhanceError(errorInfo, errorId) {
        const enhanced = {
            id: errorId,
            ...errorInfo,
            severity: errorInfo.severity || this.determineSeverity(errorInfo),
            browser: this.getBrowserInfo(),
            viewport: this.getViewportInfo(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: errorInfo.timestamp || new Date().toISOString(),
            stackTrace: errorInfo.error?.stack || new Error().stack,
            context: this.gatherContext(errorInfo.element)
        };

        // Añadir información específica por tipo
        switch (errorInfo.type) {
            case this.errorTypes.IMAGE_LOAD:
                enhanced.imageInfo = this.analyzeImageError(errorInfo.element);
                break;
            case this.errorTypes.DOM_MANIPULATION:
                enhanced.domInfo = this.analyzeDOMState(errorInfo.element);
                break;
            case this.errorTypes.NETWORK:
                enhanced.networkInfo = this.analyzeNetworkState();
                break;
        }

        return enhanced;
    }

    /**
     * 🎯 Determinar severidad del error
     */
    determineSeverity(errorInfo) {
        const criticalPatterns = [
            /cannot read property/i,
            /undefined is not a function/i,
            /maximum call stack/i,
            /out of memory/i
        ];

        const warningPatterns = [
            /failed to load/i,
            /network error/i,
            /timeout/i
        ];

        const message = errorInfo.message || '';
        
        if (criticalPatterns.some(pattern => pattern.test(message))) {
            return 'critical';
        } else if (warningPatterns.some(pattern => pattern.test(message))) {
            return 'warning';
        } else {
            return 'info';
        }
    }

    /**
     * 🏥 Intentar recuperación automática
     */
    async attemptRecovery(errorInfo) {
        const retryKey = `${errorInfo.type}_${errorInfo.element?.id || 'global'}`;
        const currentAttempts = this.retryAttempts.get(retryKey) || 0;
        
        if (currentAttempts >= this.maxRetries) {
            console.warn(`🚫 Máximo de reintentos alcanzado para ${retryKey}`);
            return false;
        }

        this.retryAttempts.set(retryKey, currentAttempts + 1);
        
        console.log(`🔄 Intentando recuperación ${currentAttempts + 1}/${this.maxRetries} para ${retryKey}`);

        try {
            await this.delay(this.retryDelay * Math.pow(2, currentAttempts));
            
            const recovered = await this.executeRecoveryStrategy(errorInfo);
            
            if (recovered) {
                console.log(`✅ Recuperación exitosa para ${retryKey}`);
                this.retryAttempts.delete(retryKey);
                return true;
            }
        } catch (recoveryError) {
            console.error(`❌ Error durante recuperación para ${retryKey}:`, recoveryError);
        }

        return false;
    }

    /**
     * 🛠️ Ejecutar estrategia de recuperación específica
     */
    async executeRecoveryStrategy(errorInfo) {
        switch (errorInfo.type) {
            case this.errorTypes.IMAGE_LOAD:
                return this.recoverImageLoad(errorInfo);
                
            case this.errorTypes.DOM_MANIPULATION:
                return this.recoverDOMManipulation(errorInfo);
                
            case this.errorTypes.TEMPLATE_RENDER:
                return this.recoverTemplateRender(errorInfo);
                
            case this.errorTypes.EVENT_BINDING:
                return this.recoverEventBinding(errorInfo);
                
            case this.errorTypes.NETWORK:
                return this.recoverNetworkError(errorInfo);
                
            default:
                return this.recoverGeneric(errorInfo);
        }
    }

    /**
     * 🖼️ Recuperar errores de carga de imagen
     */
    async recoverImageLoad(errorInfo) {
        const img = errorInfo.element;
        if (!img || img.tagName !== 'IMG') return false;

        const originalSrc = img.src;
        const fallbackSrc = img.dataset.fallback || '/images/placeholder.jpg';
        
        try {
            // Intentar recargar imagen original
            img.src = originalSrc + '?retry=' + Date.now();
            
            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    // Usar imagen de fallback
                    img.src = fallbackSrc;
                    img.classList.add('error-fallback');
                    resolve(true);
                }, 5000);

                img.onload = () => {
                    clearTimeout(timeout);
                    img.classList.remove('error-fallback');
                    resolve(true);
                };

                img.onerror = () => {
                    clearTimeout(timeout);
                    img.src = fallbackSrc;
                    img.classList.add('error-fallback');
                    resolve(true);
                };
            });
        } catch (error) {
            console.error('Error en recuperación de imagen:', error);
            return false;
        }
    }

    /**
     * 🏗️ Recuperar errores de manipulación DOM
     */
    async recoverDOMManipulation(errorInfo) {
        const element = errorInfo.element;
        if (!element) return false;

        try {
            // Verificar si el elemento está en el DOM
            if (!document.contains(element)) {
                console.log('Elemento no está en el DOM, no se puede recuperar');
                return false;
            }

            // Limpiar event listeners problemáticos
            const clonedElement = element.cloneNode(true);
            element.parentNode.replaceChild(clonedElement, element);
            
            // Re-inicializar componente si tiene atributo data-component
            const componentType = clonedElement.dataset.component;
            if (componentType && window.ComponentManager) {
                window.ComponentManager.reinitializeComponent(clonedElement, componentType);
            }

            return true;
        } catch (error) {
            console.error('Error en recuperación DOM:', error);
            return false;
        }
    }

    /**
     * 📄 Recuperar errores de renderizado de template
     */
    async recoverTemplateRender(errorInfo) {
        const container = errorInfo.element;
        if (!container) return false;

        try {
            // Limpiar contenido problemático
            container.innerHTML = '';
            
            // Mostrar mensaje de error amigable
            container.innerHTML = this.createErrorFallbackHTML(errorInfo);
            
            // Intentar re-renderizar con datos de fallback
            if (errorInfo.data && errorInfo.data.templateName) {
                const fallbackData = this.getFallbackTemplateData(errorInfo.data.templateName);
                if (fallbackData && window.ProductCardManager) {
                    return window.ProductCardManager.renderTemplate(
                        errorInfo.data.templateName,
                        fallbackData,
                        container
                    );
                }
            }

            return true;
        } catch (error) {
            console.error('Error en recuperación de template:', error);
            return false;
        }
    }

    /**
     * 🔗 Recuperar errores de binding de eventos
     */
    async recoverEventBinding(errorInfo) {
        const element = errorInfo.element;
        if (!element) return false;

        try {
            // Re-bind eventos básicos
            const eventTypes = ['click', 'change', 'input', 'submit'];
            
            eventTypes.forEach(eventType => {
                element.addEventListener(eventType, (e) => {
                    try {
                        // Ejecutar handler con protección
                        this.executeProtectedEventHandler(e);
                    } catch (handlerError) {
                        this.handleError({
                            type: this.errorTypes.EVENT_BINDING,
                            message: `Error en handler ${eventType}: ${handlerError.message}`,
                            error: handlerError,
                            element: e.target,
                            timestamp: new Date().toISOString()
                        });
                    }
                });
            });

            return true;
        } catch (error) {
            console.error('Error en recuperación de eventos:', error);
            return false;
        }
    }

    /**
     * 🌐 Recuperar errores de red
     */
    async recoverNetworkError(errorInfo) {
        try {
            // Verificar conectividad
            if (!navigator.onLine) {
                console.log('Sin conexión, esperando reconnexión...');
                return new Promise((resolve) => {
                    const checkConnection = () => {
                        if (navigator.onLine) {
                            window.removeEventListener('online', checkConnection);
                            resolve(true);
                        }
                    };
                    window.addEventListener('online', checkConnection);
                });
            }

            // Intentar request simple para verificar conectividad
            const response = await fetch('/api/health', { 
                method: 'HEAD',
                cache: 'no-cache'
            });

            return response.ok;
        } catch (error) {
            console.error('Error en recuperación de red:', error);
            return false;
        }
    }

    /**
     * 🔧 Recuperación genérica
     */
    async recoverGeneric(errorInfo) {
        try {
            // Limpiar posibles memory leaks
            this.cleanupMemoryLeaks();
            
            // Forzar garbage collection si está disponible
            if (window.gc) {
                window.gc();
            }
            
            return true;
        } catch (error) {
            console.error('Error en recuperación genérica:', error);
            return false;
        }
    }

    /**
     * 🧹 Limpiar memory leaks
     */
    cleanupMemoryLeaks() {
        // Limpiar timers huérfanos
        const highestId = window.setTimeout(() => {}, 0);
        for (let i = 0; i < highestId; i++) {
            window.clearTimeout(i);
            window.clearInterval(i);
        }

        // Limpiar event listeners en elementos removidos
        const allElements = document.getElementsByTagName('*');
        Array.from(allElements).forEach(element => {
            if (!document.contains(element)) {
                element.remove();
            }
        });
    }

    /**
     * 🎨 Crear HTML de fallback para errores
     */
    createErrorFallbackHTML(errorInfo) {
        const severity = errorInfo.severity || 'info';
        const icon = {
            critical: '🚨',
            warning: '⚠️',
            info: 'ℹ️'
        }[severity];

        return `
            <div class="error-fallback error-${severity}" role="alert">
                <div class="error-icon">${icon}</div>
                <div class="error-content">
                    <h4 class="error-title">Oops, algo salió mal</h4>
                    <p class="error-message">
                        ${this.sanitizeErrorMessage(errorInfo.message)}
                    </p>
                    <button class="btn-retry" onclick="window.location.reload()">
                        Recargar página
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 🧼 Sanitizar mensaje de error para mostrar al usuario
     */
    sanitizeErrorMessage(message) {
        const userFriendlyMessages = {
            'Failed to fetch': 'Error de conexión',
            'Network request failed': 'Error de red',
            'Cannot read property': 'Error interno',
            'undefined is not a function': 'Función no disponible',
            'Permission denied': 'Permiso denegado'
        };

        for (const [technical, friendly] of Object.entries(userFriendlyMessages)) {
            if (message.includes(technical)) {
                return friendly;
            }
        }

        return 'Error inesperado';
    }

    /**
     * 📱 Mostrar notificación al usuario
     */
    showUserNotification(errorInfo) {
        const notification = this.createNotificationElement(errorInfo);
        document.body.appendChild(notification);

        // Auto-remove después de 5 segundos
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * 🔔 Crear elemento de notificación
     */
    createNotificationElement(errorInfo) {
        const notification = document.createElement('div');
        notification.className = `error-notification error-${errorInfo.severity}`;
        notification.innerHTML = `
            <div class="notification-content">
                <strong>Error detectado</strong>
                <p>${this.sanitizeErrorMessage(errorInfo.message)}</p>
                <button class="btn-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        return notification;
    }

    /**
     * 📊 Crear display de errores para desarrollo
     */
    createErrorDisplay() {
        if (!this.isDevelopment()) return;

        const display = document.createElement('div');
        display.id = 'error-display';
        display.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 10px;
            border-radius: 5px;
            max-width: 300px;
            z-index: 10000;
            display: none;
            font-family: monospace;
            font-size: 12px;
        `;
        
        document.body.appendChild(display);
        this.errorDisplay = display;
    }

    /**
     * 🔄 Procesar cola de errores en lotes
     */
    startErrorProcessing() {
        setInterval(() => {
            if (this.errorQueue.length > 0) {
                const batch = this.errorQueue.splice(0, this.batchSize);
                this.processBatch(batch);
            }
        }, 1000);
    }

    /**
     * 📦 Procesar lote de errores
     */
    processBatch(errors) {
        // Agrupar errores similares
        const grouped = this.groupSimilarErrors(errors);
        
        // Analizar patrones
        const patterns = this.analyzeErrorPatterns(grouped);
        
        // Enviar a servicio de logging si está configurado
        if (this.enableLogging && this.loggingService) {
            this.loggingService.logBatch(grouped, patterns);
        }

        // Actualizar display de desarrollo
        if (this.isDevelopment() && this.errorDisplay) {
            this.updateErrorDisplay(grouped);
        }
    }

    /**
     * 👥 Agrupar errores similares
     */
    groupSimilarErrors(errors) {
        const groups = new Map();
        
        errors.forEach(error => {
            const key = `${error.type}_${error.message}`;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(error);
        });
        
        return groups;
    }

    /**
     * 📈 Analizar patrones de errores
     */
    analyzeErrorPatterns(groupedErrors) {
        const patterns = {
            frequency: new Map(),
            timeDistribution: new Map(),
            elementTypes: new Map(),
            userAgents: new Map()
        };

        for (const [key, errors] of groupedErrors) {
            patterns.frequency.set(key, errors.length);
            
            // Analizar distribución temporal
            const timeSlot = new Date(errors[0].timestamp).getHours();
            patterns.timeDistribution.set(timeSlot, 
                (patterns.timeDistribution.get(timeSlot) || 0) + errors.length);
        }

        return patterns;
    }

    /**
     * 📝 Logging de error
     */
    logError(errorInfo) {
        const logLevel = {
            critical: 'error',
            warning: 'warn',
            info: 'log'
        }[errorInfo.severity] || 'log';

        console[logLevel]('🚨 Error detectado:', {
            id: errorInfo.id,
            type: errorInfo.type,
            message: errorInfo.message,
            element: errorInfo.element,
            stack: errorInfo.stackTrace,
            context: errorInfo.context,
            timestamp: errorInfo.timestamp
        });
    }

    /**
     * 🔧 Utilidades auxiliares
     */
    generateErrorId() {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.search.includes('debug=true');
    }

    getBrowserInfo() {
        return {
            name: this.getBrowserName(),
            version: this.getBrowserVersion(),
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            language: navigator.language
        };
    }

    getBrowserName() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    getBrowserVersion() {
        const ua = navigator.userAgent;
        const match = ua.match(/(chrome|firefox|safari|edge)\/(\d+)/i);
        return match ? match[2] : 'Unknown';
    }

    getViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            scrollX: window.scrollX,
            scrollY: window.scrollY
        };
    }

    gatherContext(element) {
        if (!element) return null;

        return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            attributes: Array.from(element.attributes).map(attr => ({
                name: attr.name,
                value: attr.value
            })),
            parentElement: element.parentElement?.tagName,
            childElementCount: element.childElementCount
        };
    }

    shouldAttemptRecovery(errorInfo) {
        const recoverableTypes = [
            this.errorTypes.IMAGE_LOAD,
            this.errorTypes.NETWORK,
            this.errorTypes.TEMPLATE_RENDER,
            this.errorTypes.EVENT_BINDING
        ];

        return recoverableTypes.includes(errorInfo.type) && 
               errorInfo.severity !== 'critical';
    }

    /**
     * 📊 API pública para obtener estadísticas
     */
    getErrorStats() {
        const stats = {
            total: this.errors.size,
            bySeverity: {},
            byType: {},
            recentErrors: [],
            recoveryStats: {
                attempted: 0,
                successful: 0,
                failed: 0
            }
        };

        // Agrupar por severidad y tipo
        for (const error of this.errors.values()) {
            stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
        }

        // Errores recientes (últimas 24 horas)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        stats.recentErrors = Array.from(this.errors.values())
            .filter(error => new Date(error.timestamp) > yesterday)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        return stats;
    }

    /**
     * 🧹 Limpiar errores antiguos
     */
    cleanupOldErrors() {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        for (const [id, error] of this.errors) {
            if (new Date(error.timestamp) < oneWeekAgo) {
                this.errors.delete(id);
            }
        }
        
        console.log('🧹 Errores antiguos limpiados, activos:', this.errors.size);
    }

    /**
     * 💥 Destructor
     */
    destroy() {
        // Limpiar observers
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }

        // Limpiar intervalos
        // (Se manejan automáticamente al ser closures)

        // Limpiar display
        if (this.errorDisplay) {
            this.errorDisplay.remove();
        }

        console.log('💥 DOMErrorHandler destruido');
    }
}

// 🚀 Auto-inicialización
let domErrorHandler = null;

function initErrorHandler() {
    if (!domErrorHandler) {
        domErrorHandler = new DOMErrorHandler();
        
        // Exponer globalmente para desarrollo
        window.DOMErrorHandler = domErrorHandler;
    }
    
    return domErrorHandler;
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initErrorHandler);
} else {
    initErrorHandler();
}

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DOMErrorHandler, initErrorHandler };
}

/**
 * 📚 EJEMPLOS DE USO:
 * 
 * // Manejo manual de error
 * domErrorHandler.handleError({
 *     type: domErrorHandler.errorTypes.DOM_MANIPULATION,
 *     message: 'Error al crear elemento',
 *     element: elementoProblematico,
 *     severity: 'warning'
 * });
 * 
 * // Registrar callback personalizado
 * domErrorHandler.registerCallback('image_load', (error) => {
 *     console.log('Error de imagen personalizado:', error);
 * });
 * 
 * // Obtener estadísticas
 * const stats = domErrorHandler.getErrorStats();
 * console.log('Errores por tipo:', stats.byType);
 */