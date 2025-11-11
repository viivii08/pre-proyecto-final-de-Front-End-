/**
 * 🛒 CARRITO MANAGER OPTIMIZADO v2.0
 * 
 * Modelo de datos híbrido inteligente:
 * - Almacena objeto completo para productos únicos
 * - Optimiza actualizaciones solo con id+qty cuando es apropiado
 * - Validaciones robustas para duplicados y sumas
 * - Función renderCarrito() centralizada
 * - Mensajes de feedback consistentes
 */

class CarritoManager {
    constructor(storageManager = null) {
        this.storage = storageManager || QuickStorage;
        this.carritoKey = 'carrito_v2';
        
        // 🎯 Configuración del modelo de datos
        this.config = {
            maxItems: 50,
            maxQuantityPerItem: 99,
            minQuantityPerItem: 1,
            decimales: 2
        };
        
        // 📝 Schema optimizado para productos
        this.productSchema = {
            required: ['id', 'nombre', 'precio'],
            optional: ['imagen', 'descripcion', 'categoria', 'variante'],
            types: {
                id: 'string',
                nombre: 'string', 
                precio: 'number',
                cantidad: 'number',
                imagen: 'string',
                descripcion: 'string',
                categoria: 'string',
                variante: 'object', // { color, talla, etc }
                timestamp: 'number',
                subtotal: 'number'
            }
        };

        // 🎨 Mensajes de feedback estandarizados
        this.messages = {
            success: {
                added: '✅ Producto agregado',
                updated: '✅ Cantidad actualizada',
                removed: '✅ Producto eliminado',
                cleared: '✅ Carrito vaciado'
            },
            warning: {
                quantity_min: '⚠️ Cantidad mínima: 1',
                quantity_max: '⚠️ Cantidad máxima: 99',
                cart_limit: '⚠️ Límite de productos alcanzado',
                duplicate_variant: '⚠️ Variante ya existe'
            },
            error: {
                invalid_product: '❌ Producto inválido',
                invalid_price: '❌ Precio inválido',
                storage_error: '❌ Error de almacenamiento',
                not_found: '❌ Producto no encontrado'
            }
        };

        this.init();
    }

    /**
     * 🚀 Inicializar carrito
     */
    init() {
        // Migrar carrito antiguo si existe
        this.migrateOldCarrito();
        
        // Validar integridad del carrito actual
        this.validateCarritoIntegrity();
        
        console.log('🛒 CarritoManager inicializado correctamente');
    }

    /**
     * 🔄 Migrar carrito de versión anterior
     */
    migrateOldCarrito() {
        const oldCarrito = this.storage.get('carrito', null);
        if (oldCarrito && Array.isArray(oldCarrito)) {
            const migratedCarrito = oldCarrito.map(item => this.normalizeProduct(item));
            this.storage.set(this.carritoKey, migratedCarrito);
            this.storage.remove('carrito'); // Limpiar versión antigua
            console.log('📦 Carrito migrado a nueva versión');
        }
    }

    /**
     * ✅ Validar integridad completa del carrito
     */
    validateCarritoIntegrity() {
        const carrito = this.getCarrito();
        let needsRepair = false;
        
        const cleanCarrito = carrito.filter(item => {
            const isValid = this.isValidProduct(item);
            if (!isValid) {
                console.warn('🔧 Producto inválido removido:', item);
                needsRepair = true;
            }
            return isValid;
        });

        if (needsRepair) {
            this.setCarrito(cleanCarrito);
            console.log('🔧 Integridad del carrito reparada');
        }
    }

    /**
     * 📋 Obtener carrito completo
     */
    getCarrito() {
        return this.storage.get(this.carritoKey, []);
    }

    /**
     * 💾 Guardar carrito con validación
     */
    setCarrito(carrito) {
        if (!Array.isArray(carrito)) {
            console.error('❌ Carrito debe ser un array');
            return false;
        }

        // Validar cada producto antes de guardar
        const validCarrito = carrito.filter(item => this.isValidProduct(item));
        
        return this.storage.set(this.carritoKey, validCarrito);
    }

    /**
     * ✅ Validar producto individualmente
     */
    isValidProduct(producto) {
        if (!producto || typeof producto !== 'object') return false;
        
        // Verificar campos requeridos
        for (const field of this.productSchema.required) {
            if (!producto.hasOwnProperty(field)) {
                console.warn(`❌ Campo requerido faltante: ${field}`);
                return false;
            }
        }

        // Verificar tipos de datos
        const typeValidation = {
            id: typeof producto.id === 'string' && producto.id.length > 0,
            nombre: typeof producto.nombre === 'string' && producto.nombre.length > 0,
            precio: typeof producto.precio === 'number' && producto.precio >= 0,
            cantidad: typeof producto.cantidad === 'number' && 
                     producto.cantidad >= this.config.minQuantityPerItem &&
                     producto.cantidad <= this.config.maxQuantityPerItem
        };

        for (const [field, isValid] of Object.entries(typeValidation)) {
            if (!isValid) {
                console.warn(`❌ Validación fallida en campo: ${field}`, producto[field]);
                return false;
            }
        }

        return true;
    }

    /**
     * 🔄 Normalizar producto al schema estándar
     */
    normalizeProduct(producto) {
        const normalized = {
            id: producto.id || Date.now().toString(),
            nombre: producto.nombre || 'Producto sin nombre',
            precio: Math.round((producto.precio || 0) * 100) / 100, // 2 decimales
            cantidad: Math.max(1, parseInt(producto.cantidad || 1)),
            imagen: producto.imagen || '',
            descripcion: producto.descripcion || '',
            categoria: producto.categoria || 'general',
            variante: producto.variante || null,
            timestamp: Date.now()
        };

        // Calcular subtotal
        normalized.subtotal = Math.round((normalized.precio * normalized.cantidad) * 100) / 100;

        return normalized;
    }

    /**
     * 🛒 Agregar producto al carrito (MÉTODO PRINCIPAL)
     * 
     * Estrategia híbrida inteligente:
     * 1. Para productos simples: busca por ID y suma cantidad
     * 2. Para productos con variantes: compara ID + variantes  
     * 3. Valida duplicados exactos y maneja suma inteligente
     */
    addToCarrito(producto, options = {}) {
        try {
            // 1️⃣ Normalizar producto entrante
            const normalizedProduct = this.normalizeProduct(producto);
            
            // 2️⃣ Validar producto
            if (!this.isValidProduct(normalizedProduct)) {
                return this.returnResult(false, this.messages.error.invalid_product);
            }

            // 3️⃣ Obtener carrito actual
            const carrito = this.getCarrito();
            
            // 4️⃣ Verificar límite de productos únicos
            if (carrito.length >= this.config.maxItems) {
                return this.returnResult(false, this.messages.warning.cart_limit);
            }

            // 5️⃣ Buscar producto existente (considerando variantes)
            const existingIndex = this.findExistingProduct(carrito, normalizedProduct);
            
            if (existingIndex !== -1) {
                // 📈 PRODUCTO EXISTENTE: Actualizar cantidad
                const existing = carrito[existingIndex];
                const newQuantity = existing.cantidad + normalizedProduct.cantidad;
                
                // Validar cantidad máxima
                if (newQuantity > this.config.maxQuantityPerItem) {
                    return this.returnResult(false, this.messages.warning.quantity_max);
                }
                
                // Actualizar producto existente
                carrito[existingIndex] = {
                    ...existing,
                    cantidad: newQuantity,
                    subtotal: Math.round((existing.precio * newQuantity) * 100) / 100,
                    timestamp: Date.now() // Actualizar timestamp para ordenamiento
                };

                this.setCarrito(carrito);
                this.renderCarrito();
                
                return this.returnResult(true, this.messages.success.updated, {
                    action: 'updated',
                    product: carrito[existingIndex],
                    previousQuantity: existing.cantidad,
                    newQuantity: newQuantity
                });
                
            } else {
                // ➕ PRODUCTO NUEVO: Agregar al carrito
                carrito.push(normalizedProduct);
                
                this.setCarrito(carrito);
                this.renderCarrito();
                
                return this.returnResult(true, this.messages.success.added, {
                    action: 'added',
                    product: normalizedProduct
                });
            }
            
        } catch (error) {
            console.error('❌ Error agregando al carrito:', error);
            return this.returnResult(false, this.messages.error.storage_error);
        }
    }

    /**
     * 🔍 Buscar producto existente considerando variantes
     * 
     * Algoritmo inteligente de comparación:
     * - Productos sin variantes: compara solo por ID
     * - Productos con variantes: compara ID + variantes exactas
     */
    findExistingProduct(carrito, producto) {
        return carrito.findIndex(item => {
            // Comparación básica por ID
            if (item.id !== producto.id) return false;
            
            // Si ninguno tiene variantes, son iguales
            if (!item.variante && !producto.variante) return true;
            
            // Si solo uno tiene variantes, son diferentes
            if (!item.variante || !producto.variante) return false;
            
            // Comparar variantes (ej: color, talla, etc.)
            return this.compareVariantes(item.variante, producto.variante);
        });
    }

    /**
     * 🔀 Comparar variantes de productos
     */
    compareVariantes(variante1, variante2) {
        if (!variante1 || !variante2) return false;
        
        const keys1 = Object.keys(variante1).sort();
        const keys2 = Object.keys(variante2).sort();
        
        // Comparar claves
        if (keys1.length !== keys2.length) return false;
        if (keys1.join(',') !== keys2.join(',')) return false;
        
        // Comparar valores
        return keys1.every(key => variante1[key] === variante2[key]);
    }

    /**
     * 🗑️ Remover producto del carrito
     */
    removeFromCarrito(productId, variante = null) {
        try {
            const carrito = this.getCarrito();
            const index = carrito.findIndex(item => {
                if (item.id !== productId) return false;
                if (!variante) return !item.variante;
                return this.compareVariantes(item.variante, variante);
            });
            
            if (index === -1) {
                return this.returnResult(false, this.messages.error.not_found);
            }
            
            const removedProduct = carrito.splice(index, 1)[0];
            this.setCarrito(carrito);
            this.renderCarrito();
            
            return this.returnResult(true, this.messages.success.removed, {
                action: 'removed',
                product: removedProduct
            });
            
        } catch (error) {
            console.error('❌ Error removiendo del carrito:', error);
            return this.returnResult(false, this.messages.error.storage_error);
        }
    }

    /**
     * 📝 Actualizar cantidad específica
     */
    updateQuantity(productId, newQuantity, variante = null) {
        try {
            newQuantity = parseInt(newQuantity);
            
            // Validar cantidad
            if (newQuantity < this.config.minQuantityPerItem) {
                return this.returnResult(false, this.messages.warning.quantity_min);
            }
            if (newQuantity > this.config.maxQuantityPerItem) {
                return this.returnResult(false, this.messages.warning.quantity_max);
            }
            
            const carrito = this.getCarrito();
            const index = carrito.findIndex(item => {
                if (item.id !== productId) return false;
                if (!variante) return !item.variante;
                return this.compareVariantes(item.variante, variante);
            });
            
            if (index === -1) {
                return this.returnResult(false, this.messages.error.not_found);
            }
            
            carrito[index].cantidad = newQuantity;
            carrito[index].subtotal = Math.round((carrito[index].precio * newQuantity) * 100) / 100;
            carrito[index].timestamp = Date.now();
            
            this.setCarrito(carrito);
            this.renderCarrito();
            
            return this.returnResult(true, this.messages.success.updated, {
                action: 'quantity_updated',
                product: carrito[index]
            });
            
        } catch (error) {
            console.error('❌ Error actualizando cantidad:', error);
            return this.returnResult(false, this.messages.error.storage_error);
        }
    }

    /**
     * 🧹 Vaciar carrito completo
     */
    clearCarrito() {
        try {
            this.storage.remove(this.carritoKey);
            this.renderCarrito();
            
            return this.returnResult(true, this.messages.success.cleared, {
                action: 'cleared'
            });
        } catch (error) {
            console.error('❌ Error vaciando carrito:', error);
            return this.returnResult(false, this.messages.error.storage_error);
        }
    }

    /**
     * 📊 Estadísticas del carrito
     */
    getCarritoStats() {
        const carrito = this.getCarrito();
        
        const stats = {
            totalItems: carrito.reduce((sum, item) => sum + item.cantidad, 0),
            uniqueProducts: carrito.length,
            totalValue: carrito.reduce((sum, item) => sum + item.subtotal, 0),
            averageItemPrice: 0,
            categories: {},
            oldestItem: null,
            newestItem: null
        };

        // Calcular precio promedio
        if (stats.totalItems > 0) {
            stats.averageItemPrice = Math.round((stats.totalValue / stats.totalItems) * 100) / 100;
        }

        // Agrupar por categorías
        carrito.forEach(item => {
            const cat = item.categoria || 'general';
            if (!stats.categories[cat]) {
                stats.categories[cat] = { count: 0, value: 0 };
            }
            stats.categories[cat].count += item.cantidad;
            stats.categories[cat].value += item.subtotal;
        });

        // Encontrar items más antiguos y nuevos
        if (carrito.length > 0) {
            stats.oldestItem = carrito.reduce((oldest, item) => 
                (!oldest || item.timestamp < oldest.timestamp) ? item : oldest
            );
            stats.newestItem = carrito.reduce((newest, item) => 
                (!newest || item.timestamp > newest.timestamp) ? item : newest
            );
        }

        return stats;
    }

    /**
     * 🎨 RENDERIZAR CARRITO - FUNCIÓN CENTRALIZADA
     * 
     * Actualiza TODO el DOM relacionado al carrito en un solo lugar:
     * - Contador de badge
     * - Lista de productos (si existe)
     * - Total de precio
     * - Estados de botones
     */
    renderCarrito() {
        const stats = this.getCarritoStats();
        
        // 🔢 Actualizar contador/badge
        this.updateCartCounter(stats.totalItems);
        
        // 📋 Actualizar lista de productos (si existe el contenedor)
        this.updateCartList(stats);
        
        // 💰 Actualizar totales
        this.updateCartTotals(stats);
        
        // 🔘 Actualizar estados de botones
        this.updateCartButtons(stats);
        
        // 📡 Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('carritoUpdated', {
            detail: { stats, carrito: this.getCarrito() }
        }));
    }

    /**
     * 🔢 Actualizar contador con animación
     */
    updateCartCounter(count) {
        const badges = document.querySelectorAll('#cart-count, .cart-badge, [data-cart-counter]');
        
        badges.forEach(badge => {
            const oldCount = parseInt(badge.textContent || 0);
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
            
            // Animación solo si cambió
            if (oldCount !== count) {
                badge.style.transform = 'scale(1.3)';
                badge.style.background = count > oldCount ? '#28a745' : '#dc3545';
                
                setTimeout(() => {
                    badge.style.transform = 'scale(1)';
                    badge.style.background = '';
                }, 300);
            }
        });
    }

    /**
     * 📋 Actualizar lista visual del carrito
     */
    updateCartList(stats) {
        const containers = document.querySelectorAll('[data-cart-list]');
        if (containers.length === 0) return;
        
        const carrito = this.getCarrito();
        
        containers.forEach(container => {
            if (carrito.length === 0) {
                container.innerHTML = `
                    <div class="empty-cart text-center py-4">
                        <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Carrito vacío</h5>
                        <p class="text-muted">Agrega productos para comenzar tu compra</p>
                    </div>
                `;
                return;
            }
            
            const itemsHTML = carrito.map(item => this.renderCartItem(item)).join('');
            container.innerHTML = itemsHTML;
        });
    }

    /**
     * 📦 Renderizar item individual del carrito
     */
    renderCartItem(item) {
        const varianteText = item.variante ? 
            Object.entries(item.variante).map(([k,v]) => `${k}: ${v}`).join(', ') : '';
            
        return `
            <div class="cart-item d-flex align-items-center p-3 border-bottom" data-product-id="${item.id}">
                <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image me-3" 
                     style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                
                <div class="cart-item-info flex-grow-1">
                    <h6 class="mb-1">${item.nombre}</h6>
                    ${varianteText ? `<small class="text-muted">${varianteText}</small>` : ''}
                    <div class="d-flex align-items-center mt-2">
                        <button class="btn btn-sm btn-outline-secondary" onclick="Carrito.updateQuantity('${item.id}', ${item.cantidad - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="mx-3 fw-bold">${item.cantidad}</span>
                        <button class="btn btn-sm btn-outline-secondary" onclick="Carrito.updateQuantity('${item.id}', ${item.cantidad + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div class="cart-item-price text-end">
                    <div class="fw-bold">$${item.subtotal.toLocaleString()}</div>
                    <small class="text-muted">$${item.precio.toLocaleString()} c/u</small>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-danger" onclick="Carrito.removeFromCarrito('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 💰 Actualizar totales de precio
     */
    updateCartTotals(stats) {
        // Total principal
        const totalElements = document.querySelectorAll('[data-cart-total]');
        totalElements.forEach(el => {
            el.textContent = `$${stats.totalValue.toLocaleString()}`;
        });
        
        // Contador de items
        const countElements = document.querySelectorAll('[data-cart-items-count]');
        countElements.forEach(el => {
            el.textContent = `${stats.totalItems} item${stats.totalItems !== 1 ? 's' : ''}`;
        });
    }

    /**
     * 🔘 Actualizar estados de botones
     */
    updateCartButtons(stats) {
        // Botón de checkout
        const checkoutButtons = document.querySelectorAll('[data-cart-checkout]');
        checkoutButtons.forEach(btn => {
            btn.disabled = stats.totalItems === 0;
            btn.textContent = stats.totalItems === 0 ? 
                'Carrito vacío' : `Finalizar compra (${stats.totalItems})`;
        });
        
        // Botón de vaciar carrito
        const clearButtons = document.querySelectorAll('[data-cart-clear]');
        clearButtons.forEach(btn => {
            btn.disabled = stats.totalItems === 0;
            btn.style.display = stats.totalItems === 0 ? 'none' : 'inline-block';
        });
    }

    /**
     * 📤 Retornar resultado estandarizado
     */
    returnResult(success, message, data = {}) {
        const result = {
            success,
            message,
            timestamp: Date.now(),
            ...data
        };
        
        // Log para debugging
        if (success) {
            console.log('✅ Carrito:', message, data);
        } else {
            console.warn('⚠️ Carrito:', message, data);
        }
        
        return result;
    }
}

/**
 * 🌟 INSTANCIA GLOBAL Y API SIMPLIFICADA
 */

// Crear instancia global
window.Carrito = new CarritoManager();

// API simplificada para compatibilidad
window.CarritoAPI = {
    // Métodos principales
    agregar: (producto) => Carrito.addToCarrito(producto),
    remover: (id, variante) => Carrito.removeFromCarrito(id, variante),
    actualizar: (id, cantidad, variante) => Carrito.updateQuantity(id, cantidad, variante),
    vaciar: () => Carrito.clearCarrito(),
    
    // Getters
    obtener: () => Carrito.getCarrito(),
    estadisticas: () => Carrito.getCarritoStats(),
    
    // Utilidades
    render: () => Carrito.renderCarrito(),
    
    // Para migración de código existente
    addToCarrito: (producto) => Carrito.addToCarrito(producto),
    updateCartCounter: () => Carrito.renderCarrito()
};

/**
 * 🎯 FUNCIONES GLOBALES PARA COMPATIBILIDAD
 * (Para que el código existente siga funcionando)
 */
window.agregarAlCarrito = function(producto) {
    if (!producto) {
        // Si se llama sin parámetros desde el HTML, usar datos del DOM
        producto = {
            id: document.querySelector('[data-product-id]')?.textContent || 'producto-' + Date.now(),
            nombre: document.querySelector('[data-product-name]')?.textContent || 'Producto',
            precio: parseFloat(document.querySelector('[data-product-price]')?.textContent || 0),
            cantidad: parseInt(document.getElementById('cantidad')?.value || 1),
            imagen: document.querySelector('[data-product-image]')?.src || ''
        };
    }
    return Carrito.addToCarrito(producto);
};

window.updateCartCounter = function() {
    Carrito.renderCarrito();
};

console.log('🛒 CarritoManager v2.0 inicializado correctamente');