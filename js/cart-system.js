/**
 * 🛒 SISTEMA DE CARRITO OPTIMIZADO Y ROBUSTO
 * Modelo de datos mejorado con validaciones y renderizado unificado
 */

class CartSystem {
    constructor(storeInstance) {
        this.store = storeInstance;
        this.cart = this.loadCart();
        
        // Inicialización segura de dependencias
        try {
            this.cartStorage = new CartStorage();
            this.validator = new CartValidator(this.store);
            this.renderer = new CartRenderer();
            this.feedbackSystem = window.feedback || null;
        } catch (error) {
            console.warn('⚠️ Algunas dependencias del cart no están listas:', error);
            this.cartStorage = null;
            this.validator = null;
            this.renderer = null;
            this.feedbackSystem = null;
        }
        
        // Event listeners
        this.setupEventListeners();
        
        // Inicialización suave
        this.renderCart();
        
        console.log('🛒 Sistema de carrito inicializado');
    }

    /**
     * 📊 MODELO DE DATOS OPTIMIZADO
     * Solo guardamos ID + cantidad + metadata esencial
     */
    getCartDataModel() {
        return {
            // Estructura optimizada del carrito
            items: [
                {
                    productId: 'string',     // Solo ID del producto
                    quantity: 'number',      // Cantidad
                    addedAt: 'timestamp',    // Cuándo se agregó
                    lastUpdated: 'timestamp', // Última modificación
                    selectedVariants: 'object' // Para futuros variants (talla, color, etc.)
                }
            ],
            metadata: {
                createdAt: 'timestamp',
                lastModified: 'timestamp',
                totalItems: 'number',
                estimatedTotal: 'number'
            }
        };
    }

    /**
     * 📥 Cargar carrito desde storage
     */
    loadCart() {
        try {
            const savedCart = this.cartStorage.load();
            
            // Validar estructura del carrito cargado
            if (!this.validator.validateCartStructure(savedCart)) {
                console.warn('⚠️ Estructura de carrito inválida, creando nuevo carrito');
                return this.createEmptyCart();
            }

            // Limpiar items de productos que ya no existen
            const cleanedCart = this.validator.cleanupCart(savedCart);
            
            return cleanedCart;
            
        } catch (error) {
            console.error('❌ Error cargando carrito:', error);
            this.feedbackSystem.show('Error cargando carrito', 'error');
            return this.createEmptyCart();
        }
    }

    /**
     * 🆕 Crear carrito vacío con estructura correcta
     */
    createEmptyCart() {
        return {
            items: [],
            metadata: {
                createdAt: Date.now(),
                lastModified: Date.now(),
                totalItems: 0,
                estimatedTotal: 0
            }
        };
    }

    /**
     * ➕ Agregar producto al carrito con validaciones completas
     */
    async addProduct(productId, quantity = 1, options = {}) {
        try {
            // 1. Validaciones previas
            const validationResult = await this.validator.validateAddProduct(
                productId, 
                quantity, 
                this.cart
            );

            if (!validationResult.isValid) {
                this.feedbackSystem.show(validationResult.message, validationResult.type);
                return { success: false, error: validationResult.message };
            }

            // 2. Obtener datos del producto
            const product = this.store.productos.find(p => p.id === productId);
            if (!product) {
                this.feedbackSystem.show('Producto no encontrado', 'error');
                return { success: false, error: 'Producto no encontrado' };
            }

            // 3. Buscar si el producto ya existe en el carrito
            const existingItemIndex = this.cart.items.findIndex(
                item => item.productId === productId
            );

            const currentTime = Date.now();

            if (existingItemIndex !== -1) {
                // Actualizar cantidad existente
                const newQuantity = this.cart.items[existingItemIndex].quantity + quantity;
                
                // Validar stock disponible
                if (newQuantity > product.stock) {
                    this.feedbackSystem.show(
                        `Solo ${product.stock} unidades disponibles`, 
                        'warning'
                    );
                    return { success: false, error: 'Stock insuficiente' };
                }

                this.cart.items[existingItemIndex].quantity = newQuantity;
                this.cart.items[existingItemIndex].lastUpdated = currentTime;
                
                this.feedbackSystem.show(
                    `Cantidad actualizada: ${product.nombre}`, 
                    'success'
                );
                
            } else {
                // Agregar nuevo item
                const cartItem = {
                    productId: productId,
                    quantity: quantity,
                    addedAt: currentTime,
                    lastUpdated: currentTime,
                    selectedVariants: options.variants || null
                };
                
                this.cart.items.push(cartItem);
                
                this.feedbackSystem.show(
                    `${product.nombre} agregado al carrito`, 
                    'success'
                );
            }

            // 4. Actualizar metadata
            this.updateCartMetadata();

            // 5. Guardar y renderizar
            await this.saveCart();
            this.renderCart();

            // 6. Dispatchar evento para otros componentes
            this.dispatchCartEvent('productAdded', { productId, quantity, product });

            return { 
                success: true, 
                cart: this.cart,
                addedQuantity: quantity,
                totalQuantity: this.getTotalItems()
            };

        } catch (error) {
            console.error('❌ Error agregando producto:', error);
            this.feedbackSystem.show('Error agregando producto', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * 🗑️ Eliminar producto del carrito
     */
    async removeProduct(productId, removeAll = false) {
        try {
            const itemIndex = this.cart.items.findIndex(item => item.productId === productId);
            
            if (itemIndex === -1) {
                this.feedbackSystem.show('Producto no encontrado en carrito', 'warning');
                return { success: false, error: 'Producto no encontrado' };
            }

            const product = this.store.productos.find(p => p.id === productId);
            const productName = product ? product.nombre : 'Producto';

            if (removeAll || this.cart.items[itemIndex].quantity === 1) {
                // Eliminar completamente
                this.cart.items.splice(itemIndex, 1);
                this.feedbackSystem.show(`${productName} eliminado del carrito`, 'info');
            } else {
                // Decrementar cantidad
                this.cart.items[itemIndex].quantity--;
                this.cart.items[itemIndex].lastUpdated = Date.now();
                this.feedbackSystem.show(`Cantidad reducida: ${productName}`, 'info');
            }

            this.updateCartMetadata();
            await this.saveCart();
            this.renderCart();

            this.dispatchCartEvent('productRemoved', { productId, product });

            return { success: true, cart: this.cart };

        } catch (error) {
            console.error('❌ Error eliminando producto:', error);
            this.feedbackSystem.show('Error eliminando producto', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * 📊 Actualizar cantidad específica
     */
    async updateQuantity(productId, newQuantity) {
        try {
            if (newQuantity <= 0) {
                return await this.removeProduct(productId, true);
            }

            const itemIndex = this.cart.items.findIndex(item => item.productId === productId);
            
            if (itemIndex === -1) {
                this.feedbackSystem.show('Producto no encontrado', 'error');
                return { success: false, error: 'Producto no encontrado' };
            }

            const product = this.store.productos.find(p => p.id === productId);
            
            // Validar stock
            if (newQuantity > product.stock) {
                this.feedbackSystem.show(
                    `Solo ${product.stock} unidades disponibles`, 
                    'warning'
                );
                return { success: false, error: 'Stock insuficiente' };
            }

            this.cart.items[itemIndex].quantity = newQuantity;
            this.cart.items[itemIndex].lastUpdated = Date.now();

            this.updateCartMetadata();
            await this.saveCart();
            this.renderCart();

            return { success: true, cart: this.cart };

        } catch (error) {
            console.error('❌ Error actualizando cantidad:', error);
            this.feedbackSystem.show('Error actualizando cantidad', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * 🧹 Limpiar carrito completamente
     */
    async clearCart() {
        try {
            const itemsCount = this.cart.items.length;
            
            this.cart = this.createEmptyCart();
            await this.saveCart();
            this.renderCart();

            this.feedbackSystem.show(`Carrito vaciado (${itemsCount} productos)`, 'info');
            this.dispatchCartEvent('cartCleared', { itemsRemoved: itemsCount });

            return { success: true };

        } catch (error) {
            console.error('❌ Error vaciando carrito:', error);
            this.feedbackSystem.show('Error vaciando carrito', 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * 📊 Actualizar metadata del carrito
     */
    updateCartMetadata() {
        this.cart.metadata.lastModified = Date.now();
        this.cart.metadata.totalItems = this.getTotalItems();
        this.cart.metadata.estimatedTotal = this.getEstimatedTotal();
    }

    /**
     * 🔢 Obtener total de items
     */
    getTotalItems() {
        return this.cart.items.reduce((total, item) => total + item.quantity, 0);
    }

    /**
     * 💰 Calcular total estimado
     */
    getEstimatedTotal() {
        return this.cart.items.reduce((total, item) => {
            const product = this.store.productos.find(p => p.id === item.productId);
            if (product) {
                return total + (product.precio * item.quantity);
            }
            return total;
        }, 0);
    }

    /**
     * 📱 Renderizado unificado del carrito
     */
    renderCart() {
        try {
            // 1. Actualizar contador
            this.updateCartCounter();
            
            // 2. Renderizar items del carrito
            this.renderCartItems();
            
            // 3. Actualizar totales
            this.updateCartTotals();
            
            // 4. Actualizar estados de botones
            this.updateCartButtons();

        } catch (error) {
            console.error('❌ Error renderizando carrito:', error);
        }
    }

    /**
     * 🔢 Actualizar contador del carrito
     */
    updateCartCounter() {
        const counters = document.querySelectorAll('.cart-count, #cart-count');
        const totalItems = this.getTotalItems();
        
        counters.forEach(counter => {
            counter.textContent = totalItems;
            counter.style.display = totalItems > 0 ? 'inline-block' : 'none';
            
            // Animación de cambio
            if (totalItems > 0) {
                counter.classList.add('cart-updated');
                setTimeout(() => counter.classList.remove('cart-updated'), 300);
            }
        });
    }

    /**
     * 🛒 Renderizar items del carrito
     */
    renderCartItems() {
        const container = document.getElementById('carrito-contenido');
        if (!container) return;

        if (this.cart.items.length === 0) {
            container.innerHTML = this.renderer.getEmptyCartHTML();
            return;
        }

        const itemsHTML = this.cart.items.map(item => {
            const product = this.store.productos.find(p => p.id === item.productId);
            if (!product) return ''; // Skip productos que ya no existen
            
            return this.renderer.getCartItemHTML(item, product);
        }).join('');

        container.innerHTML = itemsHTML;
        
        // Agregar event listeners a los controles
        this.attachCartItemListeners();
    }

    /**
     * 💰 Actualizar totales del carrito
     */
    updateCartTotals() {
        const totalElement = document.getElementById('cart-total');
        const subtotalElement = document.getElementById('cart-subtotal');
        const itemCountElement = document.getElementById('cart-item-count');

        const total = this.getEstimatedTotal();
        const itemCount = this.getTotalItems();

        if (totalElement) {
            totalElement.textContent = `$${total.toLocaleString()}`;
        }
        
        if (subtotalElement) {
            subtotalElement.textContent = `$${total.toLocaleString()}`;
        }
        
        if (itemCountElement) {
            itemCountElement.textContent = `${itemCount} producto${itemCount !== 1 ? 's' : ''}`;
        }
    }

    /**
     * 🔘 Actualizar estado de botones
     */
    updateCartButtons() {
        const checkoutBtn = document.getElementById('checkout-btn');
        const clearBtn = document.getElementById('clear-cart-btn');
        const isEmpty = this.cart.items.length === 0;

        if (checkoutBtn) {
            checkoutBtn.disabled = isEmpty;
            checkoutBtn.textContent = isEmpty ? 'Carrito vacío' : 'Proceder al pago';
        }

        if (clearBtn) {
            clearBtn.disabled = isEmpty;
            clearBtn.style.display = isEmpty ? 'none' : 'inline-block';
        }
    }

    /**
     * 🎯 Agregar event listeners a items del carrito
     */
    attachCartItemListeners() {
        // Botones de cantidad
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                const action = e.target.dataset.action;
                
                if (action === 'increase') {
                    const currentItem = this.cart.items.find(item => item.productId === productId);
                    this.updateQuantity(productId, currentItem.quantity + 1);
                } else if (action === 'decrease') {
                    this.removeProduct(productId);
                }
            });
        });

        // Inputs de cantidad
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                const newQuantity = parseInt(e.target.value) || 0;
                this.updateQuantity(productId, newQuantity);
            });
        });

        // Botones de eliminar
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                this.removeProduct(productId, true);
            });
        });
    }

    /**
     * 💾 Guardar carrito
     */
    async saveCart() {
        try {
            await this.cartStorage.save(this.cart);
            this.dispatchCartEvent('cartSaved', { cart: this.cart });
        } catch (error) {
            console.error('❌ Error guardando carrito:', error);
            throw error;
        }
    }

    /**
     * 🎯 Configurar event listeners generales
     */
    setupEventListeners() {
        // Clear cart button
        document.addEventListener('click', (e) => {
            if (e.target.matches('#clear-cart-btn')) {
                if (confirm('¿Estás seguro de vaciar el carrito?')) {
                    this.clearCart();
                }
            }
        });

        // Escuchar cambios en productos del store
        if (this.store.addEventListener) {
            this.store.addEventListener('productUpdated', () => {
                this.renderCart(); // Re-renderizar si cambian precios
            });
        }
    }

    /**
     * 📡 Dispatchar eventos del carrito
     */
    dispatchCartEvent(eventName, data) {
        window.dispatchEvent(new CustomEvent(`cart:${eventName}`, {
            detail: { ...data, timestamp: Date.now() }
        }));
    }

    /**
     * 📊 Obtener información del carrito
     */
    getCartInfo() {
        return {
            items: this.cart.items,
            totalItems: this.getTotalItems(),
            estimatedTotal: this.getEstimatedTotal(),
            metadata: this.cart.metadata,
            isEmpty: this.cart.items.length === 0
        };
    }

    /**
     * 🧹 Cleanup
     */
    destroy() {
        // Remover event listeners si es necesario
        this.feedbackSystem.destroy();
    }
}

// Hacer disponible globalmente
window.CartSystem = CartSystem;

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartSystem;
}