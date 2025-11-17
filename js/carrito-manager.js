/**
 * 🛒 SISTEMA INTEGRADO DE CARRITO DE COMPRAS
 * Manager principal que coordina todos los sistemas del carrito
 */

class CarritoManager {
    constructor() {
        this.cartSystem = null;
        this.cartValidator = null;
        this.cartStorage = null;
        this.cartRenderer = null;
        this.feedbackSystem = null;
        
        this.initialized = false;
        this.eventListeners = new Map();
        
        this.init();
    }

    /**
     * 🚀 Inicializar sistema completo
     */
    async init() {
        try {
            console.log('🛒 Inicializando CarritoManager...');

            // Esperar un poco para que otros sistemas se carguen
            await new Promise(resolve => setTimeout(resolve, 100));

            // Inicializar subsistemas
            await this.initSubsystems();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Migrar datos existentes si es necesario (silenciosamente)
            await this.migrateExistingData();
            
            // Renderizado inicial
            await this.renderInitialState();
            
            this.initialized = true;
            console.log('✅ CarritoManager inicializado correctamente');
            
            // Notificar que el sistema está listo
            this.dispatchEvent('carritoManager:ready', { manager: this });

        } catch (error) {
            console.error('❌ Error inicializando CarritoManager:', error);
            // No mostrar mensaje de error automáticamente
            // this.feedbackSystem?.error('cartError');
        }
    }

    /**
     * 🔧 Inicializar subsistemas
     */
    async initSubsystems() {
        try {
            // Sistema de feedback (usar existente si está disponible)
            this.feedbackSystem = window.feedback || null;
            
            // Sistema de validación y almacenamiento
            this.cartValidator = new CartValidator();
            this.cartStorage = new CartStorage();
            
            // Sistema principal del carrito
            this.cartSystem = new CartSystem();
            
            // Sistema de renderizado
            this.cartRenderer = new CartRenderer();
            
            console.log('🔧 Subsistemas inicializados');
        } catch (error) {
            console.warn('⚠️ Error en subsistemas:', error);
            // Crear versiones mock para evitar errores
            this.feedbackSystem = {
                success: () => {},
                error: () => {},
                warning: () => {},
                info: () => {}
            };
        }
    }

    /**
     * 🎧 Configurar listeners de eventos
     */
    setupEventListeners() {
        // Eventos del cart system
        document.addEventListener('cart:updated', (event) => {
            this.handleCartUpdate(event.detail);
        });

        document.addEventListener('cart:item:added', (event) => {
            this.handleItemAdded(event.detail);
        });

        document.addEventListener('cart:item:removed', (event) => {
            this.handleItemRemoved(event.detail);
        });

        document.addEventListener('cart:item:quantityChanged', (event) => {
            this.handleQuantityChanged(event.detail);
        });

        document.addEventListener('cart:cleared', (event) => {
            this.handleCartCleared(event.detail);
        });

        document.addEventListener('cart:error', (event) => {
            this.handleCartError(event.detail);
        });

        // Eventos del DOM
        this.setupDOMListeners();
        
        console.log('🎧 Event listeners configurados');
    }

    /**
     * 🖱️ Configurar eventos del DOM
     */
    setupDOMListeners() {
        // Botones "Agregar al carrito"
        document.addEventListener('click', (event) => {
            if (event.target.matches('.btn-agregar-carrito, [data-action="add-to-cart"]')) {
                event.preventDefault();
                this.handleAddToCartClick(event);
            }
        });

        // Botones de cantidad en el carrito
        document.addEventListener('click', (event) => {
            if (event.target.matches('.quantity-btn, .quantity-btn *')) {
                event.preventDefault();
                this.handleQuantityButtonClick(event);
            }
        });

        // Botones de eliminar
        document.addEventListener('click', (event) => {
            if (event.target.matches('.remove-item-btn, .remove-item-btn *')) {
                event.preventDefault();
                this.handleRemoveItemClick(event);
            }
        });

        // Inputs de cantidad
        document.addEventListener('change', (event) => {
            if (event.target.matches('.quantity-input')) {
                this.handleQuantityInputChange(event);
            }
        });

        // Botón limpiar carrito
        document.addEventListener('click', (event) => {
            if (event.target.matches('[data-action="clear-cart"]')) {
                event.preventDefault();
                this.handleClearCartClick(event);
            }
        });
    }

    /**
     * 📦 Migrar datos existentes del localStorage
     */
    async migrateExistingData() {
        try {
            const migrationResult = await this.cartStorage.migrateData();
            
            if (migrationResult.migrated) {
                this.feedbackSystem?.info('cartMigrated');
                console.log('📦 Datos migrados:', migrationResult);
            }
            
        } catch (error) {
            console.error('❌ Error en migración:', error);
        }
    }

    /**
     * 🎨 Renderizado inicial
     */
    async renderInitialState() {
        try {
            const cartItems = this.cartSystem.getItems();
            await this.renderFullCart();
            
            if (cartItems.length > 0) {
                this.feedbackSystem?.info('cartLoading');
            }
            
        } catch (error) {
            console.error('❌ Error en renderizado inicial:', error);
        }
    }

    /**
     * ➕ Agregar producto al carrito
     */
    async agregarAlCarrito(productId, quantity = 1, options = {}) {
        try {
            if (!this.initialized) {
                throw new Error('CarritoManager no está inicializado');
            }

            console.log(`🛒 Agregando producto ${productId} x${quantity}`);

            // Validar entrada
            const validation = this.cartValidator.validateAddToCart(productId, quantity);
            if (!validation.isValid) {
                this.feedbackSystem?.error('invalidQuantity');
                return { success: false, error: validation.error };
            }

            // Obtener datos del producto
            const product = await this.getProductData(productId);
            if (!product) {
                this.feedbackSystem?.error('productNotFound');
                return { success: false, error: 'Producto no encontrado' };
            }

            // Verificar stock
            if (product.stock < quantity) {
                this.feedbackSystem?.error('outOfStock', { productName: product.nombre });
                return { success: false, error: 'Sin stock suficiente' };
            }

            // Verificar si ya existe en el carrito
            const existingItem = this.cartSystem.getItem(productId);
            const isUpdate = existingItem !== null;
            const newQuantity = isUpdate ? existingItem.quantity + quantity : quantity;

            // Verificar límites de stock
            if (newQuantity > product.stock) {
                const availableStock = product.stock - (existingItem?.quantity || 0);
                this.feedbackSystem?.warning('stockLimit', { 
                    productName: product.nombre, 
                    availableStock 
                });
                return { success: false, error: 'Cantidad supera stock disponible' };
            }

            // Agregar/actualizar en el carrito
            const result = this.cartSystem.addItem(productId, quantity, options);
            
            if (result.success) {
                // Mostrar mensaje apropiado
                if (isUpdate) {
                    this.feedbackSystem?.warning('duplicateProduct', { productName: product.nombre });
                } else {
                    this.feedbackSystem?.success('addToCart', { productName: product.nombre });
                }
            }

            return result;

        } catch (error) {
            console.error('❌ Error agregando al carrito:', error);
            this.feedbackSystem?.error('cartError');
            return { success: false, error: error.message };
        }
    }

    /**
     * 🔄 Actualizar cantidad de producto
     */
    async actualizarCantidad(productId, newQuantity) {
        try {
            console.log(`🔄 Actualizando cantidad ${productId} -> ${newQuantity}`);

            // Validar cantidad
            if (newQuantity < 0) {
                return this.eliminarDelCarrito(productId);
            }

            if (newQuantity === 0) {
                return this.eliminarDelCarrito(productId);
            }

            // Obtener producto para validar stock
            const product = await this.getProductData(productId);
            if (!product) {
                this.feedbackSystem?.error('productNotFound');
                return { success: false, error: 'Producto no encontrado' };
            }

            // Verificar stock
            if (newQuantity > product.stock) {
                this.feedbackSystem?.warning('maxQuantity', { maxQuantity: product.stock });
                return { success: false, error: 'Cantidad supera stock disponible' };
            }

            // Actualizar en el sistema
            const result = this.cartSystem.updateQuantity(productId, newQuantity);
            
            if (result.success) {
                this.feedbackSystem?.success('updateQuantity', { 
                    productName: product.nombre, 
                    newQuantity 
                });
            }

            return result;

        } catch (error) {
            console.error('❌ Error actualizando cantidad:', error);
            this.feedbackSystem?.error('cartError');
            return { success: false, error: error.message };
        }
    }

    /**
     * 🗑️ Eliminar producto del carrito
     */
    async eliminarDelCarrito(productId) {
        try {
            console.log(`🗑️ Eliminando producto ${productId}`);

            const product = await this.getProductData(productId);
            const result = this.cartSystem.removeItem(productId);
            
            if (result.success && product) {
                this.feedbackSystem?.success('removeFromCart', { productName: product.nombre });
            }

            return result;

        } catch (error) {
            console.error('❌ Error eliminando del carrito:', error);
            this.feedbackSystem?.error('cartError');
            return { success: false, error: error.message };
        }
    }

    /**
     * 🧹 Limpiar carrito completo
     */
    async limpiarCarrito() {
        try {
            console.log('🧹 Limpiando carrito completo');

            const result = this.cartSystem.clear();
            
            if (result.success) {
                this.feedbackSystem?.success('clearCart');
            }

            return result;

        } catch (error) {
            console.error('❌ Error limpiando carrito:', error);
            this.feedbackSystem?.error('cartError');
            return { success: false, error: error.message };
        }
    }

    /**
     * 🎨 Renderizar carrito completo
     */
    async renderFullCart() {
        try {
            const cartItems = this.cartSystem.getItems();
            const cartData = this.cartSystem.getCartSummary();
            const products = await this.getMultipleProductData(cartItems.map(item => item.productId));

            // Renderizar contador
            this.cartRenderer.renderCounter(cartData.totalItems);

            // Renderizar items del carrito
            const cartContainer = document.querySelector('#cart-items, .cart-items, #carrito-items');
            if (cartContainer) {
                this.cartRenderer.renderComponent('items', cartContainer, {
                    items: cartItems,
                    products: products
                });
            }

            // Renderizar resumen
            const summaryContainer = document.querySelector('#cart-summary, .cart-summary');
            if (summaryContainer) {
                this.cartRenderer.renderComponent('summary', summaryContainer, {
                    cartData: cartData
                });
            }

            // Renderizar botones del header
            this.updateCartHeaderButtons(cartData.totalItems);

        } catch (error) {
            console.error('❌ Error renderizando carrito:', error);
        }
    }

    /**
     * 🔄 Actualizar botones del header
     */
    updateCartHeaderButtons(totalItems) {
        const cartButtons = document.querySelectorAll('.cart-button, .btn-cart, [data-target="#cartModal"]');
        
        cartButtons.forEach(button => {
            const badge = button.querySelector('.cart-count, .badge');
            if (badge) {
                badge.textContent = totalItems;
                badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
            }
        });
    }

    /**
     * 🔍 Obtener datos de un producto
     */
    async getProductData(productId) {
        try {
            // Si existe instancia global de store
            if (window.store && typeof window.store.obtenerProductoPorId === 'function') {
                return window.store.obtenerProductoPorId(productId);
            }

            // Si existe array de productos global
            if (window.productos && Array.isArray(window.productos)) {
                return window.productos.find(p => p.id === productId);
            }

            // Cargar desde JSON si es necesario
            if (!this._productCache) {
                const response = await fetch('./data/productos.json');
                this._productCache = await response.json();
            }

            return this._productCache.find(p => p.id === productId);

        } catch (error) {
            console.error('❌ Error obteniendo datos del producto:', error);
            return null;
        }
    }

    /**
     * 🔍 Obtener datos de múltiples productos
     */
    async getMultipleProductData(productIds) {
        try {
            const products = await Promise.all(
                productIds.map(id => this.getProductData(id))
            );
            return products.filter(Boolean); // Filtrar nulos
        } catch (error) {
            console.error('❌ Error obteniendo múltiples productos:', error);
            return [];
        }
    }

    // ================================
    // MANEJADORES DE EVENTOS
    // ================================

    /**
     * 🎯 Manejar click en "Agregar al carrito"
     */
    handleAddToCartClick(event) {
        const button = event.target.closest('.btn-agregar-carrito, [data-action="add-to-cart"]');
        const productId = button.dataset.productId || button.dataset.id;
        const quantity = parseInt(button.dataset.quantity || '1');

        if (productId) {
            this.agregarAlCarrito(productId, quantity);
        }
    }

    /**
     * 🔢 Manejar click en botones de cantidad
     */
    handleQuantityButtonClick(event) {
        const button = event.target.closest('.quantity-btn');
        const productId = button.dataset.productId;
        const action = button.dataset.action;
        
        if (!productId) return;

        const currentItem = this.cartSystem.getItem(productId);
        if (!currentItem) return;

        let newQuantity = currentItem.quantity;
        if (action === 'increase') {
            newQuantity++;
        } else if (action === 'decrease') {
            newQuantity--;
        }

        this.actualizarCantidad(productId, newQuantity);
    }

    /**
     * 📝 Manejar cambio en input de cantidad
     */
    handleQuantityInputChange(event) {
        const input = event.target;
        const productId = input.dataset.productId;
        const newQuantity = parseInt(input.value) || 0;

        if (productId) {
            this.actualizarCantidad(productId, newQuantity);
        }
    }

    /**
     * 🗑️ Manejar click en eliminar item
     */
    handleRemoveItemClick(event) {
        const button = event.target.closest('.remove-item-btn');
        const productId = button.dataset.productId;

        if (productId) {
            this.eliminarDelCarrito(productId);
        }
    }

    /**
     * 🧹 Manejar click en limpiar carrito
     */
    handleClearCartClick(event) {
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            this.limpiarCarrito();
        }
    }

    /**
     * 🔄 Manejar actualización del carrito
     */
    handleCartUpdate(detail) {
        this.renderFullCart();
    }

    /**
     * ➕ Manejar item agregado
     */
    handleItemAdded(detail) {
        this.renderFullCart();
    }

    /**
     * ➖ Manejar item eliminado
     */
    handleItemRemoved(detail) {
        this.renderFullCart();
    }

    /**
     * 🔢 Manejar cambio de cantidad
     */
    handleQuantityChanged(detail) {
        this.renderFullCart();
    }

    /**
     * 🧹 Manejar carrito limpiado
     */
    handleCartCleared(detail) {
        this.renderFullCart();
    }

    /**
     * ❌ Manejar errores del carrito
     */
    handleCartError(detail) {
        console.error('🛒 Error en carrito:', detail);
        this.feedbackSystem?.error('cartError');
    }

    // ================================
    // MÉTODOS PÚBLICOS DE CONSULTA
    // ================================

    /**
     * 📊 Obtener resumen del carrito
     */
    getCartSummary() {
        return this.cartSystem?.getCartSummary() || {
            items: [],
            totalItems: 0,
            subtotal: 0,
            total: 0
        };
    }

    /**
     * 🛒 Obtener items del carrito
     */
    getCartItems() {
        return this.cartSystem?.getItems() || [];
    }

    /**
     * 🔍 Obtener item específico
     */
    getCartItem(productId) {
        return this.cartSystem?.getItem(productId) || null;
    }

    /**
     * ❓ Verificar si el carrito está vacío
     */
    isEmpty() {
        return this.cartSystem?.isEmpty() ?? true;
    }

    /**
     * 🔢 Obtener total de items
     */
    getTotalItems() {
        return this.cartSystem?.getTotalItems() || 0;
    }

    /**
     * 💰 Obtener total del carrito
     */
    getTotalPrice() {
        return this.cartSystem?.getTotal() || 0;
    }

    /**
     * 📤 Emitir evento personalizado
     */
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }

    /**
     * 🧹 Limpiar recursos
     */
    destroy() {
        // Limpiar event listeners
        this.eventListeners.forEach((listener, element) => {
            element.removeEventListener('click', listener);
        });
        
        this.eventListeners.clear();
        this.initialized = false;
        
        console.log('🧹 CarritoManager destruido');
    }
}

// Inicializar automáticamente cuando el DOM esté listo SOLO en páginas apropiadas
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si estamos en una página que necesita el carrito
    const needsCart = document.querySelector('.btn-agregar-carrito') || 
                      document.querySelector('[data-action="add-to-cart"]') ||
                      document.querySelector('#productos-container') ||
                      window.location.pathname.includes('tienda') ||
                      window.location.pathname.includes('carrito');
    
    if (!needsCart) {
        console.log('ℹ️ Página no requiere sistema de carrito');
        return;
    }
    
    try {
        // Crear instancia global
        window.carritoManager = new CarritoManager();
        
        // Esperar a que se inicialice
        document.addEventListener('carritoManager:ready', () => {
            console.log('🎉 Sistema de carrito listo para usar');
            
            // Compatibilidad con código existente
            window.agregarAlCarrito = (productId, quantity, options) => {
                return window.carritoManager.agregarAlCarrito(productId, quantity, options);
            };
            
            window.actualizarCarrito = () => {
                return window.carritoManager.renderFullCart();
            };
            
            window.limpiarCarrito = () => {
                return window.carritoManager.limpiarCarrito();
            };
        });
    } catch (error) {
        console.warn('⚠️ No se pudo inicializar el sistema de carrito:', error);
    }
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CarritoManager;
}

// Hacer disponible globalmente
window.CarritoManager = CarritoManager;