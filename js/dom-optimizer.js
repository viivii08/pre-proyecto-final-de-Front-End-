/**
 * 🔧 SISTEMA DE CORRECCIÓN DOM DINÁMICO
 * Optimiza y corrige problemas comunes en manipulación del DOM
 */

class DOMOptimizer {
    constructor() {
        this.templateCache = new Map();
        this.performanceMetrics = {
            optimizations: 0,
            timesSaved: 0
        };
    }

    /**
     * 🚀 Optimiza la función crearTarjetaProducto de store.js
     */
    optimizeProductCardCreation() {
        console.log('🔧 Optimizando creación de tarjetas de producto...');
        
        // Crear template reutilizable
        if (!this.templateCache.has('productCard')) {
            const template = document.createElement('template');
            template.innerHTML = `
                <div class="col">
                    <div class="card h-100 shadow-lg border-0 position-relative overflow-hidden card-producto">
                        <div class="product-image-container overflow-hidden rounded-top">
                            <img class="card-img-top" alt="" loading="lazy">
                            <span class="badge-descuento position-absolute d-none"></span>
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title mb-2 product-title"></h5>
                            <p class="card-text mb-3 product-description"></p>
                            <div class="mb-3 pricing-container">
                                <span class="card-price product-price"></span>
                                <span class="card-price-old product-original-price d-none"></span>
                            </div>
                            <small class="text-warning stock-warning d-none"></small>
                            <div class="mt-auto">
                                <div class="d-flex gap-2 mb-2">
                                    <button class="btn btn-card flex-grow-1 btn-details">
                                        <i class="bi bi-eye"></i> Ver más
                                    </button>
                                </div>
                                <button class="btn btn-card agregar-carrito-btn w-100 btn-add-cart">
                                    <i class="bi bi-cart-plus"></i> <span class="btn-text">Agregar al carrito</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            this.templateCache.set('productCard', template);
        }

        return this.templateCache.get('productCard');
    }

    /**
     * 🎯 Crea tarjeta de producto optimizada
     */
    createOptimizedProductCard(producto) {
        const startTime = performance.now();
        
        // Clonar template
        const template = this.optimizeProductCardCreation();
        const cardElement = template.content.cloneNode(true);
        
        // Obtener referencias a elementos
        const card = cardElement.querySelector('.card');
        const img = cardElement.querySelector('.card-img-top');
        const badge = cardElement.querySelector('.badge-descuento');
        const title = cardElement.querySelector('.product-title');
        const description = cardElement.querySelector('.product-description');
        const price = cardElement.querySelector('.product-price');
        const originalPrice = cardElement.querySelector('.product-original-price');
        const stockWarning = cardElement.querySelector('.stock-warning');
        const btnDetails = cardElement.querySelector('.btn-details');
        const btnAddCart = cardElement.querySelector('.btn-add-cart');
        const btnText = cardElement.querySelector('.btn-text');

        // Configurar atributos principales
        card.dataset.productoId = producto.id;
        
        // Configurar imagen con manejo de errores
        this.setupOptimizedImage(img, producto);
        
        // Configurar badge de descuento
        if (producto.descuento > 0) {
            badge.textContent = `${producto.descuento}% OFF`;
            badge.classList.remove('d-none');
        }
        
        // Configurar contenido de texto
        title.textContent = producto.nombre;
        description.textContent = producto.descripcionCorta || producto.descripcion;
        
        // Configurar precios
        price.textContent = `$${producto.precio.toLocaleString()}`;
        
        if (producto.precioOriginal) {
            originalPrice.textContent = `$${producto.precioOriginal.toLocaleString()}`;
            originalPrice.classList.remove('d-none');
        }
        
        // Configurar advertencia de stock
        if (producto.stock < 5 && producto.stock > 0) {
            stockWarning.textContent = `¡Últimas ${producto.stock} unidades!`;
            stockWarning.classList.remove('d-none');
        }
        
        // Configurar estado de disponibilidad
        const isOutOfStock = !producto.disponible || producto.stock === 0;
        if (isOutOfStock) {
            btnAddCart.disabled = true;
            btnText.textContent = 'Sin stock';
            card.classList.add('out-of-stock');
        }
        
        // Event listeners optimizados
        this.setupOptimizedEventListeners(btnDetails, btnAddCart, producto);
        
        // Métricas de rendimiento
        const endTime = performance.now();
        this.performanceMetrics.timesSaved += endTime - startTime;
        this.performanceMetrics.optimizations++;
        
        return cardElement;
    }

    /**
     * 🖼️ Configuración optimizada de imagen con lazy loading
     */
    setupOptimizedImage(img, producto) {
        img.alt = producto.nombre;
        img.dataset.src = producto.imagenes?.[0] || 'pages/no-image.png';
        
        // Lazy loading mejorado
        if ('IntersectionObserver' in window) {
            img.classList.add('lazy-load');
            this.setupLazyLoading(img);
        } else {
            img.src = img.dataset.src;
        }
        
        // Manejo de errores optimizado
        img.onerror = () => {
            img.src = 'pages/no-image.png';
            img.onerror = null; // Evitar loop infinito
        };
    }

    /**
     * 👁️ Configuración de lazy loading
     */
    setupLazyLoading(img) {
        if (!this.imageObserver) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        image.src = image.dataset.src;
                        image.classList.remove('lazy-load');
                        this.imageObserver.unobserve(image);
                    }
                });
            }, {
                root: null,
                rootMargin: '50px',
                threshold: 0.1
            });
        }
        
        this.imageObserver.observe(img);
    }

    /**
     * 🎯 Event listeners optimizados con delegation
     */
    setupOptimizedEventListeners(btnDetails, btnAddCart, producto) {
        // Usar delegación en lugar de onclick inline
        btnDetails.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.store && typeof window.store.verDetalleProducto === 'function') {
                window.store.verDetalleProducto(producto.id);
            }
        });

        btnAddCart.addEventListener('click', (e) => {
            e.preventDefault();
            if (!btnAddCart.disabled && window.store && typeof window.store.agregarAlCarrito === 'function') {
                window.store.agregarAlCarrito(producto.id);
            }
        });
    }

    /**
     * 🔄 Optimiza el renderizado de listas de productos
     */
    optimizeProductListRendering(productos, contenedor) {
        const startTime = performance.now();
        
        // Usar DocumentFragment para batch rendering
        const fragment = document.createDocumentFragment();
        
        // Limpiar contenedor de forma eficiente
        this.clearContainer(contenedor);
        
        // Renderizar productos en lotes
        const batchSize = 10;
        let currentIndex = 0;
        
        const renderBatch = () => {
            const endIndex = Math.min(currentIndex + batchSize, productos.length);
            
            for (let i = currentIndex; i < endIndex; i++) {
                const productCard = this.createOptimizedProductCard(productos[i]);
                fragment.appendChild(productCard);
            }
            
            currentIndex = endIndex;
            
            if (currentIndex < productos.length) {
                requestAnimationFrame(renderBatch);
            } else {
                contenedor.appendChild(fragment);
                
                const endTime = performance.now();
                console.log(`✅ Renderizados ${productos.length} productos en ${(endTime - startTime).toFixed(2)}ms`);
                
                // Disparar evento personalizado
                this.dispatchOptimizationEvent(contenedor, productos.length);
            }
        };
        
        requestAnimationFrame(renderBatch);
    }

    /**
     * 🧹 Limpieza eficiente del contenedor
     */
    clearContainer(contenedor) {
        // Más eficiente que innerHTML = ''
        while (contenedor.firstChild) {
            contenedor.removeChild(contenedor.firstChild);
        }
    }

    /**
     * 📡 Dispatcher de eventos de optimización
     */
    dispatchOptimizationEvent(target, count) {
        const event = new CustomEvent('productsOptimized', {
            detail: {
                count,
                metrics: this.performanceMetrics
            }
        });
        target.dispatchEvent(event);
    }

    /**
     * 🔧 Parche automático para store.js
     */
    patchStoreJS() {
        if (window.store && typeof window.store.mostrarProductos === 'function') {
            console.log('🔧 Aplicando parche de optimización a store.js...');
            
            // Backup de la función original
            window.store._mostrarProductosOriginal = window.store.mostrarProductos;
            
            // Reemplazar con versión optimizada
            window.store.mostrarProductos = (productos) => {
                const contenedor = document.getElementById('productos-container');
                if (!contenedor) {
                    console.warn('⚠️ Contenedor de productos no encontrado');
                    return;
                }
                
                this.optimizeProductListRendering(productos, contenedor);
            };
            
            // Backup y optimización de crearTarjetaProducto
            window.store._crearTarjetaProductoOriginal = window.store.crearTarjetaProducto;
            
            window.store.crearTarjetaProducto = (producto) => {
                return this.createOptimizedProductCard(producto).firstElementChild;
            };
            
            console.log('✅ Parche aplicado correctamente');
        }
    }

    /**
     * 📊 Obtener métricas de rendimiento
     */
    getMetrics() {
        return {
            ...this.performanceMetrics,
            averageTime: this.performanceMetrics.optimizations > 0 ? 
                (this.performanceMetrics.timesSaved / this.performanceMetrics.optimizations).toFixed(2) + 'ms' : '0ms'
        };
    }

    /**
     * 🧹 Cleanup de recursos
     */
    cleanup() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        
        this.templateCache.clear();
        this.performanceMetrics = { optimizations: 0, timesSaved: 0 };
    }
}

/**
 * 🛠️ CORRECCIONES ADICIONALES PARA PROBLEMAS DOM COMUNES
 */
class DOMErrorFixer {
    
    /**
     * 🔧 Corrige uso inseguro de innerHTML
     */
    static fixInsecureInnerHTML() {
        console.log('🔧 Aplicando correcciones de seguridad DOM...');
        
        // Función helper para sanitización
        window.sanitizeHTML = function(str) {
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        };
        
        // Función helper para creación segura de elementos
        window.createSafeElement = function(tag, attributes = {}, textContent = '') {
            const element = document.createElement(tag);
            
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'textContent') {
                    element.textContent = value;
                } else if (key === 'innerHTML' && typeof value === 'string') {
                    element.innerHTML = window.sanitizeHTML(value);
                } else {
                    element.setAttribute(key, value);
                }
            });
            
            if (textContent) {
                element.textContent = textContent;
            }
            
            return element;
        };
    }

    /**
     * 🔄 Corrige event listeners no removidos
     */
    static fixEventListenerLeaks() {
        console.log('🔧 Implementando gestión de event listeners...');
        
        // Tracker global de event listeners
        if (!window.eventListenerTracker) {
            window.eventListenerTracker = new Map();
        }
        
        // Override addEventListener
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            const key = `${this.constructor.name}_${type}_${listener.toString().slice(0, 50)}`;
            window.eventListenerTracker.set(key, { target: this, type, listener, options });
            return originalAddEventListener.call(this, type, listener, options);
        };
        
        // Función global para limpiar listeners
        window.cleanupEventListeners = function() {
            let cleaned = 0;
            window.eventListenerTracker.forEach(({ target, type, listener }, key) => {
                try {
                    target.removeEventListener(type, listener);
                    window.eventListenerTracker.delete(key);
                    cleaned++;
                } catch (error) {
                    console.warn('Error al limpiar listener:', error);
                }
            });
            console.log(`🧹 Limpiados ${cleaned} event listeners`);
        };
    }

    /**
     * 💾 Corrige memory leaks en cache
     */
    static fixCacheLeaks() {
        console.log('🔧 Implementando gestión de cache...');
        
        // Cache inteligente con límites
        window.SmartCache = class {
            constructor(maxSize = 100) {
                this.cache = new Map();
                this.maxSize = maxSize;
                this.accessOrder = [];
            }
            
            set(key, value) {
                if (this.cache.has(key)) {
                    this.cache.set(key, value);
                    this.updateAccessOrder(key);
                } else {
                    if (this.cache.size >= this.maxSize) {
                        const lru = this.accessOrder.shift();
                        this.cache.delete(lru);
                    }
                    this.cache.set(key, value);
                    this.accessOrder.push(key);
                }
            }
            
            get(key) {
                if (this.cache.has(key)) {
                    this.updateAccessOrder(key);
                    return this.cache.get(key);
                }
                return undefined;
            }
            
            updateAccessOrder(key) {
                const index = this.accessOrder.indexOf(key);
                if (index > -1) {
                    this.accessOrder.splice(index, 1);
                }
                this.accessOrder.push(key);
            }
            
            clear() {
                this.cache.clear();
                this.accessOrder = [];
            }
        };
    }
}

// 🚀 INICIALIZACIÓN AUTOMÁTICA
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Inicializando sistema de optimización DOM...');
    
    // Crear instancia global del optimizador
    window.domOptimizer = new DOMOptimizer();
    
    // Aplicar correcciones
    DOMErrorFixer.fixInsecureInnerHTML();
    DOMErrorFixer.fixEventListenerLeaks();
    DOMErrorFixer.fixCacheLeaks();
    
    // Aplicar parche a store.js si está disponible
    if (window.store) {
        window.domOptimizer.patchStoreJS();
    } else {
        // Esperar a que store.js se cargue
        const checkStore = setInterval(() => {
            if (window.store) {
                window.domOptimizer.patchStoreJS();
                clearInterval(checkStore);
            }
        }, 100);
        
        // Timeout de seguridad
        setTimeout(() => clearInterval(checkStore), 5000);
    }
    
    // Cleanup al cerrar la página
    window.addEventListener('beforeunload', () => {
        window.domOptimizer.cleanup();
        if (window.cleanupEventListeners) {
            window.cleanupEventListeners();
        }
    });
    
    console.log('✅ Sistema de optimización DOM inicializado correctamente');
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DOMOptimizer, DOMErrorFixer };
}