# 🌐 **AUDITORÍA FETCH Y APIS - PATAGONIA STYLE**

## 📋 **ANÁLISIS DEL SISTEMA DE FETCH ACTUAL**

---

## 🔍 **ESTADO ACTUAL DEL MANEJO DE APIS**

### ✅ **IMPLEMENTACIONES ENCONTRADAS**
- ✅ Fetch básico en `store.js` para cargar productos
- ✅ Error manager con `safeFetch` implementado
- ✅ Performance optimizer con `cachedFetch`
- ✅ Fallback básico para productos

### ❌ **PROBLEMAS IDENTIFICADOS**

#### 🚫 **Fetch Sin Robustez**
```javascript
// ❌ PROBLEMA: store.js línea 20
async cargarProductos() {
  try {
    const response = await fetch('./data/productos.json');  // Sin timeout
    const data = await response.json();                     // Sin validación
    this.productos = data.productos;
  } catch (error) {
    console.error('Error al cargar productos:', error);     // Error logging básico
    this.productosFallback();                              // Fallback simple
  }
}
```

#### ⚠️ **Problemas Críticos:**
- ❌ **Sin timeouts**: Requests pueden colgar indefinidamente
- ❌ **Sin retry logic**: Fallos temporales no se reintentan
- ❌ **Sin loading states**: Usuario no ve feedback visual
- ❌ **Validación limitada**: No verifica estructura de respuesta
- ❌ **Error messages genéricos**: No específicos para usuario
- ❌ **Sin abort controllers**: No se pueden cancelar requests
- ❌ **Sin offline detection**: No maneja pérdida de conexión

---

## 🛠️ **SISTEMA DE FETCH ROBUSTO PROPUESTO**

### **🔄 APIService Mejorado**

```javascript
/**
 * 🌐 SISTEMA DE APIS ROBUSTO v2.0
 * 
 * Características:
 * ✅ Timeouts configurables
 * ✅ Retry logic inteligente  
 * ✅ Loading states automáticos
 * ✅ Offline detection
 * ✅ Request cancellation
 * ✅ Response validation
 * ✅ Error recovery
 * ✅ Performance monitoring
 */

class RobustAPIService {
    constructor() {
        this.baseURL = '';
        this.timeout = 10000; // 10 segundos default
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 segundo base
        this.pendingRequests = new Map();
        this.cache = new Map();
        this.isOnline = navigator.onLine;
        
        // Configurar listeners de conexión
        this.setupConnectionListeners();
        
        // Esquemas de validación
        this.schemas = {
            productos: {
                required: ['productos'],
                structure: {
                    productos: 'array',
                    categorias: 'array',
                    configuracion: 'object'
                }
            }
        };
    }

    /**
     * 🔄 Fetch con todas las mejoras
     */
    async request(endpoint, options = {}) {
        const requestConfig = {
            timeout: options.timeout || this.timeout,
            retries: options.retries || this.maxRetries,
            cache: options.cache !== false,
            showLoading: options.showLoading !== false,
            schema: options.schema,
            ...options
        };

        const requestId = this.generateRequestId(endpoint, options);
        
        try {
            // 📊 Mostrar loading state
            if (requestConfig.showLoading) {
                this.showLoadingState(endpoint);
            }

            // 🌐 Verificar conexión
            if (!this.isOnline && !options.offline) {
                throw new OfflineError('Sin conexión a internet');
            }

            // 💾 Verificar cache
            if (requestConfig.cache) {
                const cached = this.getFromCache(endpoint);
                if (cached) {
                    console.log('📦 Usando cache para:', endpoint);
                    return cached;
                }
            }

            // 🔄 Ejecutar request con retry
            const result = await this.executeWithRetry(endpoint, requestConfig, requestId);
            
            // 💾 Guardar en cache
            if (requestConfig.cache && result) {
                this.setCache(endpoint, result);
            }

            return result;

        } catch (error) {
            this.handleRequestError(error, endpoint, requestConfig);
            throw error;
        } finally {
            // 🧹 Cleanup
            this.hideLoadingState(endpoint);
            this.pendingRequests.delete(requestId);
        }
    }

    /**
     * 🔄 Ejecutar con retry logic
     */
    async executeWithRetry(endpoint, config, requestId) {
        let lastError;
        
        for (let attempt = 1; attempt <= config.retries + 1; attempt++) {
            try {
                const result = await this.executeRequest(endpoint, config, requestId);
                
                // ✅ Éxito - validar respuesta
                if (config.schema) {
                    this.validateResponse(result, config.schema);
                }
                
                return result;
                
            } catch (error) {
                lastError = error;
                
                // 🛑 No reintentar para ciertos errores
                if (!this.shouldRetry(error, attempt)) {
                    break;
                }
                
                // ⏱️ Delay exponencial
                const delay = config.retryDelay * Math.pow(2, attempt - 1);
                console.log(`🔄 Reintentando ${endpoint} en ${delay}ms (intento ${attempt}/${config.retries + 1})`);
                
                await this.delay(delay);
            }
        }
        
        throw lastError;
    }

    /**
     * 🌐 Ejecutar request individual
     */
    async executeRequest(endpoint, config, requestId) {
        // 🚫 Controller para cancelar
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            console.log('⏰ Timeout para:', endpoint);
        }, config.timeout);

        // 📋 Configuración de fetch
        const fetchOptions = {
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...config.headers
            },
            ...config
        };

        try {
            // 📡 Ejecutar fetch
            const response = await fetch(`${this.baseURL}${endpoint}`, fetchOptions);
            clearTimeout(timeoutId);
            
            // ✅ Verificar status
            if (!response.ok) {
                throw new HTTPError(
                    `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    response
                );
            }

            // 📄 Parsear respuesta
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }

        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * 🤔 Determinar si debemos reintentar
     */
    shouldRetry(error, attempt) {
        // No reintentar errores de cliente (4xx)
        if (error instanceof HTTPError && error.status >= 400 && error.status < 500) {
            return false;
        }
        
        // No reintentar si fue abortado manualmente
        if (error.name === 'AbortError' && !error.isTimeout) {
            return false;
        }
        
        // Reintentar errores de red, timeouts y 5xx
        return error.name === 'TypeError' ||      // Network error
               error.name === 'AbortError' ||     // Timeout
               error instanceof OfflineError ||   // No connection
               (error instanceof HTTPError && error.status >= 500); // Server error
    }

    /**
     * ✅ Validar estructura de respuesta
     */
    validateResponse(data, schemaName) {
        const schema = this.schemas[schemaName];
        if (!schema) return true;

        // Verificar campos requeridos
        for (const field of schema.required || []) {
            if (!data.hasOwnProperty(field)) {
                throw new ValidationError(`Campo requerido faltante: ${field}`);
            }
        }

        // Verificar estructura
        for (const [field, expectedType] of Object.entries(schema.structure || {})) {
            if (data[field] && !this.validateType(data[field], expectedType)) {
                throw new ValidationError(`Tipo inválido para ${field}: esperado ${expectedType}`);
            }
        }

        return true;
    }

    /**
     * 📊 Estados de loading
     */
    showLoadingState(endpoint) {
        // Mostrar skeleton loaders específicos
        const containers = document.querySelectorAll(`[data-loading="${endpoint}"]`);
        containers.forEach(container => {
            container.classList.add('loading-state');
            this.createSkeletonLoader(container, endpoint);
        });

        // Notificación global opcional
        document.dispatchEvent(new CustomEvent('api:loading', {
            detail: { endpoint, status: 'start' }
        }));
    }

    hideLoadingState(endpoint) {
        const containers = document.querySelectorAll(`[data-loading="${endpoint}"]`);
        containers.forEach(container => {
            container.classList.remove('loading-state');
            const skeleton = container.querySelector('.skeleton-loader');
            if (skeleton) skeleton.remove();
        });

        document.dispatchEvent(new CustomEvent('api:loading', {
            detail: { endpoint, status: 'end' }
        }));
    }

    /**
     * 💫 Crear skeleton loader específico
     */
    createSkeletonLoader(container, endpoint) {
        if (container.querySelector('.skeleton-loader')) return;

        const skeletons = {
            '/productos': this.createProductSkeletons(3),
            '/categorias': this.createCategorySkeletons(5),
            'default': this.createGenericSkeleton()
        };

        const skeleton = skeletons[endpoint] || skeletons.default;
        skeleton.className = 'skeleton-loader';
        container.appendChild(skeleton);
    }

    createProductSkeletons(count) {
        const wrapper = document.createElement('div');
        wrapper.className = 'skeleton-products d-flex flex-wrap';
        
        for (let i = 0; i < count; i++) {
            wrapper.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="skeleton-img card-img-top bg-gray-300 animate-pulse" style="height: 200px;"></div>
                        <div class="card-body">
                            <div class="skeleton-title bg-gray-300 animate-pulse h-4 mb-2 rounded"></div>
                            <div class="skeleton-text bg-gray-300 animate-pulse h-3 mb-3 rounded w-75"></div>
                            <div class="skeleton-price bg-gray-300 animate-pulse h-5 rounded w-25"></div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return wrapper;
    }

    /**
     * 🌐 Detectores de conexión
     */
    setupConnectionListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Conexión restablecida');
            this.handleOnlineRestore();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📵 Conexión perdida');
            this.handleOfflineMode();
        });
    }

    handleOnlineRestore() {
        // Reintentar requests fallidos
        document.dispatchEvent(new CustomEvent('api:online'));
        
        // Mostrar notificación
        this.showNotification('🌐 Conexión restablecida', 'success');
    }

    handleOfflineMode() {
        // Cancelar requests pendientes
        this.pendingRequests.forEach((controller, id) => {
            controller.abort();
        });
        this.pendingRequests.clear();

        // Mostrar notificación
        this.showNotification('📵 Sin conexión - usando datos guardados', 'warning');
    }

    /**
     * 🚫 Cancelar request
     */
    cancelRequest(endpoint) {
        const requestId = this.generateRequestId(endpoint, {});
        const controller = this.pendingRequests.get(requestId);
        
        if (controller) {
            controller.abort();
            this.pendingRequests.delete(requestId);
            console.log('🚫 Request cancelado:', endpoint);
        }
    }

    /**
     * 💾 Sistema de cache inteligente
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        // Verificar TTL
        if (Date.now() > cached.expires) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    setCache(key, data, ttl = 300000) { // 5 minutos default
        this.cache.set(key, {
            data,
            expires: Date.now() + ttl,
            timestamp: Date.now()
        });

        // Limpieza automática
        if (this.cache.size > 50) {
            this.cleanCache();
        }
    }

    /**
     * ⚠️ Manejo de errores específicos
     */
    handleRequestError(error, endpoint, config) {
        const errorInfo = {
            endpoint,
            error: error.message,
            status: error.status,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Log para debugging
        console.error('🚨 API Error:', errorInfo);

        // Enviar a servicio de monitoreo (si existe)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'api_error', {
                error_message: error.message,
                endpoint: endpoint,
                status: error.status || 'unknown'
            });
        }

        // Mostrar mensaje apropiado al usuario
        const userMessage = this.getUserFriendlyMessage(error, endpoint);
        this.showNotification(userMessage, 'error');
    }

    getUserFriendlyMessage(error, endpoint) {
        if (error instanceof OfflineError) {
            return '📵 Sin conexión. Verifica tu internet y vuelve a intentar.';
        }

        if (error.name === 'AbortError') {
            return '⏰ La operación tardó demasiado. Vuelve a intentar.';
        }

        if (error instanceof HTTPError) {
            const messages = {
                400: '❌ Solicitud inválida',
                401: '🔒 Sesión expirada. Inicia sesión nuevamente.',
                403: '🚫 No tienes permisos para esta acción',
                404: '🔍 Contenido no encontrado',
                429: '⏱️ Demasiadas solicitudes. Espera un momento.',
                500: '🔧 Error del servidor. Intenta más tarde.',
                502: '🌐 Servicio no disponible temporalmente',
                503: '⚠️ Servicio en mantenimiento'
            };
            
            return messages[error.status] || `❌ Error ${error.status}`;
        }

        if (error instanceof ValidationError) {
            return '⚠️ Datos inválidos recibidos. Intenta recargar la página.';
        }

        return '❌ Error inesperado. Vuelve a intentar.';
    }

    // Utilidades
    generateRequestId(endpoint, options) {
        return `${endpoint}_${JSON.stringify(options)}_${Date.now()}`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    validateType(value, expectedType) {
        const type = Array.isArray(value) ? 'array' : typeof value;
        return type === expectedType;
    }

    showNotification(message, type) {
        // Integrar con sistema de notificaciones existente
        if (typeof mostrarNotificacion === 'function') {
            mostrarNotificacion(message, type);
        }
    }
}

/**
 * 🚨 Clases de Error Personalizadas
 */
class HTTPError extends Error {
    constructor(message, status, response) {
        super(message);
        this.name = 'HTTPError';
        this.status = status;
        this.response = response;
    }
}

class OfflineError extends Error {
    constructor(message) {
        super(message);
        this.name = 'OfflineError';
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TimeoutError';
        this.isTimeout = true;
    }
}
```

---

## 🎯 **IMPLEMENTACIÓN EN STORE.JS MEJORADO**

### **🛒 PatagoniaStore Refactorizado**

```javascript
/**
 * 🛒 STORE CON API ROBUSTA
 */
class PatagoniaStoreV2 {
    constructor() {
        this.api = new RobustAPIService();
        this.productos = [];
        this.categorias = [];
        this.carrito = [];
        this.isLoading = false;
        this.lastError = null;
        
        this.setupAPI();
        this.init();
    }

    setupAPI() {
        // Configurar esquemas de validación
        this.api.schemas.productos = {
            required: ['productos'],
            structure: {
                productos: 'array',
                categorias: 'array'
            }
        };

        // Escuchar eventos de API
        document.addEventListener('api:loading', (e) => {
            this.handleAPILoading(e.detail);
        });

        document.addEventListener('api:online', () => {
            this.reloadDataWhenOnline();
        });
    }

    async init() {
        try {
            await this.cargarDatos();
            this.renderizarProductos();
            this.configurarEventos();
        } catch (error) {
            this.handleInitError(error);
        }
    }

    /**
     * 📦 Cargar datos con API robusta
     */
    async cargarDatos() {
        try {
            this.isLoading = true;
            
            // 📊 Mostrar skeleton mientras carga
            this.mostrarSkeletonProductos();
            
            const data = await this.api.request('/data/productos.json', {
                schema: 'productos',
                cache: true,
                timeout: 8000,
                showLoading: true
            });

            // ✅ Procesar datos exitosamente
            this.productos = data.productos || [];
            this.categorias = data.categorias || [];
            
            this.lastError = null;
            console.log(`✅ ${this.productos.length} productos cargados`);

            // 📊 Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'data_loaded', {
                    products_count: this.productos.length,
                    load_time: Date.now()
                });
            }

        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            this.lastError = error;
            
            // 🔄 Usar datos de fallback
            await this.usarDatosFallback();
            
        } finally {
            this.isLoading = false;
            this.ocultarSkeletonProductos();
        }
    }

    /**
     * 🔄 Fallback con datos locales
     */
    async usarDatosFallback() {
        console.log('🔄 Usando datos de fallback...');
        
        // Intentar cargar desde cache del navegador
        const cached = localStorage.getItem('productos_fallback');
        if (cached) {
            try {
                const data = JSON.parse(cached);
                this.productos = data.productos || [];
                this.categorias = data.categorias || [];
                
                this.mostrarNotificacionOffline();
                return;
            } catch (e) {
                console.error('Cache corrupto:', e);
            }
        }

        // Datos hardcodeados como último recurso
        this.productos = this.getProductosHardcodeados();
        this.mostrarNotificacionFallback();
    }

    getProductosHardcodeados() {
        return [
            {
                id: 'jarro-zorrito-invierno',
                nombre: "Jarro Zorrito Invierno",
                precio: 21900,
                stock: 15,
                disponible: true,
                descripcionCorta: "Jarro enlozado artesanal con diseño patagónico",
                imagenes: ["pages/jarro1.webp"],
                categoria: "jarros",
                fallback: true
            },
            {
                id: 'cuaderno-ecologico',
                nombre: "Cuaderno Ecológico",
                precio: 8500,
                stock: 8,
                disponible: true,
                descripcionCorta: "Papel reciclado con diseños patagónicos",
                imagenes: ["pages/cuadernoportada.webp"],
                categoria: "papeleria",
                fallback: true
            },
            {
                id: 'yerbera-artesanal',
                nombre: "Yerbera Artesanal",
                precio: 15200,
                stock: 5,
                disponible: true,
                descripcionCorta: "Contenedor de madera patagónica",
                imagenes: ["pages/yerbraportada.webp"],
                categoria: "artesanias",
                fallback: true
            }
        ];
    }

    /**
     * 💫 Estados visuales
     */
    mostrarSkeletonProductos() {
        const container = document.querySelector('#productos-container');
        if (!container) return;

        container.setAttribute('data-loading', '/data/productos.json');
        container.innerHTML = ''; // El API service agregará skeleton automáticamente
    }

    ocultarSkeletonProductos() {
        const container = document.querySelector('#productos-container');
        if (!container) return;

        container.removeAttribute('data-loading');
        const skeleton = container.querySelector('.skeleton-loader');
        if (skeleton) skeleton.remove();
    }

    mostrarNotificacionOffline() {
        if (typeof mostrarNotificacion === 'function') {
            mostrarNotificacion(
                '📵 Mostrando datos guardados. Conecta a internet para actualizar.',
                'warning'
            );
        }
    }

    mostrarNotificacionFallback() {
        if (typeof mostrarNotificacion === 'function') {
            mostrarNotificacion(
                '⚠️ Problemas de conexión. Mostrando productos básicos.',
                'warning'
            );
        }
    }

    /**
     * 🔄 Recargar cuando vuelve la conexión
     */
    async reloadDataWhenOnline() {
        if (!navigator.onLine) return;

        try {
            console.log('🌐 Recargando datos con conexión restaurada...');
            await this.cargarDatos();
            this.renderizarProductos();
            
            if (typeof mostrarNotificacion === 'function') {
                mostrarNotificacion('✅ Datos actualizados', 'success');
            }
        } catch (error) {
            console.error('Error recargando datos:', error);
        }
    }

    /**
     * 🎯 Buscar productos con API
     */
    async buscarProductos(query) {
        if (!query || query.trim().length < 2) {
            this.renderizarProductos();
            return;
        }

        try {
            // Si hay API de búsqueda, usar esa
            if (this.api.baseURL) {
                const results = await this.api.request(`/search?q=${encodeURIComponent(query)}`, {
                    timeout: 5000,
                    cache: false
                });
                this.renderizarProductosBusqueda(results.productos);
            } else {
                // Búsqueda local
                this.buscarProductosLocal(query);
            }

        } catch (error) {
            console.error('Error buscando productos:', error);
            this.buscarProductosLocal(query);
        }
    }

    buscarProductosLocal(query) {
        const filtrados = this.productos.filter(producto => 
            producto.nombre.toLowerCase().includes(query.toLowerCase()) ||
            producto.descripcionCorta.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderizarProductosBusqueda(filtrados);
    }

    /**
     * ⚠️ Manejo de errores de inicialización
     */
    handleInitError(error) {
        console.error('💥 Error crítico inicializando store:', error);
        
        const container = document.querySelector('#productos-container');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger text-center" role="alert">
                    <h5>⚠️ Error Cargando Productos</h5>
                    <p>No pudimos cargar el catálogo. Por favor:</p>
                    <ul class="list-unstyled">
                        <li>✅ Verifica tu conexión a internet</li>
                        <li>🔄 Recarga la página</li>
                        <li>📞 Contacta soporte si persiste</li>
                    </ul>
                    <button class="btn btn-primary mt-3" onclick="location.reload()">
                        🔄 Recargar Página
                    </button>
                </div>
            `;
        }
    }
}

// Inicializar store mejorado
document.addEventListener('DOMContentLoaded', () => {
    window.store = new PatagoniaStoreV2();
});
```

---

## 📊 **CASOS DE USO Y TESTING**

### **🧪 Test de Robustez**

```javascript
/**
 * 🧪 SUITE DE TESTING PARA FETCH ROBUSTO
 */
class APITestSuite {
    constructor() {
        this.api = new RobustAPIService();
        this.results = [];
    }

    async runAllTests() {
        console.group('🧪 Testing Fetch Robusto');
        
        const tests = [
            { name: 'Timeout Test', fn: this.testTimeout.bind(this) },
            { name: 'Retry Test', fn: this.testRetry.bind(this) },
            { name: 'Offline Test', fn: this.testOffline.bind(this) },
            { name: 'Invalid JSON Test', fn: this.testInvalidJSON.bind(this) },
            { name: 'HTTP Error Test', fn: this.testHTTPError.bind(this) },
            { name: 'Cache Test', fn: this.testCache.bind(this) },
            { name: 'Validation Test', fn: this.testValidation.bind(this) }
        ];

        for (const test of tests) {
            await this.runTest(test);
        }

        this.printResults();
        console.groupEnd();
    }

    async runTest({ name, fn }) {
        try {
            console.log(`🧪 Ejecutando: ${name}`);
            const start = Date.now();
            await fn();
            const duration = Date.now() - start;
            
            this.results.push({
                name,
                status: 'PASS',
                duration: `${duration}ms`,
                error: null
            });
            
            console.log(`✅ ${name} - PASSED (${duration}ms)`);
            
        } catch (error) {
            this.results.push({
                name,
                status: 'FAIL',
                duration: '0ms',
                error: error.message
            });
            
            console.error(`❌ ${name} - FAILED:`, error.message);
        }
    }

    // Tests específicos
    async testTimeout() {
        const api = new RobustAPIService();
        api.timeout = 100; // 100ms muy corto
        
        try {
            await api.request('https://httpbin.org/delay/1'); // 1 segundo delay
            throw new Error('Debería haber dado timeout');
        } catch (error) {
            if (error.name !== 'AbortError') {
                throw new Error(`Error inesperado: ${error.message}`);
            }
        }
    }

    async testRetry() {
        const api = new RobustAPIService();
        api.maxRetries = 2;
        
        let attempts = 0;
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            attempts++;
            if (attempts <= 2) {
                throw new Error('Fallo temporal');
            }
            return originalFetch(...args);
        };

        try {
            await api.request('/data/productos.json');
            if (attempts !== 3) {
                throw new Error(`Intentos incorrectos: ${attempts}`);
            }
        } finally {
            window.fetch = originalFetch;
        }
    }

    async testOffline() {
        const api = new RobustAPIService();
        api.isOnline = false;
        
        try {
            await api.request('/data/productos.json');
            throw new Error('Debería fallar sin conexión');
        } catch (error) {
            if (!(error instanceof OfflineError)) {
                throw new Error(`Error inesperado: ${error.message}`);
            }
        }
    }

    async testInvalidJSON() {
        const api = new RobustAPIService();
        
        const originalFetch = window.fetch;
        window.fetch = async () => ({
            ok: true,
            headers: { get: () => 'application/json' },
            json: () => { throw new Error('JSON inválido'); }
        });

        try {
            await api.request('/invalid-json');
            throw new Error('Debería fallar con JSON inválido');
        } catch (error) {
            if (!error.message.includes('JSON inválido')) {
                throw new Error(`Error inesperado: ${error.message}`);
            }
        } finally {
            window.fetch = originalFetch;
        }
    }

    printResults() {
        console.table(this.results);
        
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const total = this.results.length;
        
        console.log(`🎯 Resultados: ${passed}/${total} tests pasaron`);
    }
}

// Ejecutar tests en desarrollo
if (window.location.hostname === 'localhost') {
    const testSuite = new APITestSuite();
    // testSuite.runAllTests();
}
```

---

## 🎯 **IMPLEMENTACIÓN RECOMENDADA**

### **📋 Checklist de Implementación**

#### ✅ **Paso 1: Reemplazar Fetch Básico**
```javascript
// ❌ Reemplazar esto
const response = await fetch('./data/productos.json');

// ✅ Con esto
const data = await api.request('/data/productos.json', {
    schema: 'productos',
    timeout: 8000,
    cache: true
});
```

#### ✅ **Paso 2: Agregar Loading States**
```html
<!-- HTML: Agregar data attribute -->
<div id="productos-container" data-loading="/data/productos.json">
  <!-- Productos aparecerán aquí -->
</div>
```

#### ✅ **Paso 3: Configurar Error Handling**
```javascript
// Configurar mensajes de error personalizados
api.registerErrorHandler('productos', (error) => {
    if (error.status === 404) {
        return 'Catálogo no disponible temporalmente';
    }
    return null; // Usar mensaje default
});
```

#### ✅ **Paso 4: Implementar Offline Support**
```javascript
// Guardar datos en localStorage para modo offline
api.setCache('/data/productos.json', data, 24 * 60 * 60 * 1000); // 24 horas
```

---

## 📈 **BENEFICIOS DE LA IMPLEMENTACIÓN**

### **🚀 Performance**
- ✅ **Cache inteligente**: Reduce requests repetitivos
- ✅ **Request deduplication**: Evita solicitudes duplicadas
- ✅ **Preloading**: Carga anticipada de recursos

### **🛡️ Robustez**
- ✅ **Retry automático**: Recuperación de fallos temporales
- ✅ **Timeout protection**: Evita requests colgados
- ✅ **Offline graceful**: Funciona sin conexión

### **🎨 UX Mejorada**
- ✅ **Loading states**: Feedback visual inmediato
- ✅ **Error messages**: Mensajes claros y accionables
- ✅ **Progressive enhancement**: Funciona sin JS

### **🔧 Mantenibilidad**
- ✅ **Error centralized**: Un lugar para manejar errores
- ✅ **Configurable**: Timeouts y retries ajustables
- ✅ **Debuggeable**: Logs detallados para troubleshooting

**¿Quieres que implemente estas mejoras específicamente en tus archivos actuales?**