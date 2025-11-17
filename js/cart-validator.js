/**
 * ✅ SISTEMA DE VALIDACIONES PARA CARRITO
 * Validaciones robustas para operaciones de carrito
 */

class CartValidator {
    constructor(storeInstance) {
        this.store = storeInstance;
    }

    /**
     * 🔍 Validar estructura del carrito
     */
    validateCartStructure(cart) {
        try {
            if (!cart || typeof cart !== 'object') {
                console.warn('⚠️ Carrito no es un objeto válido');
                return false;
            }

            // Validar que tiene la estructura esperada
            if (!Array.isArray(cart.items)) {
                console.warn('⚠️ cart.items no es un array');
                return false;
            }

            if (!cart.metadata || typeof cart.metadata !== 'object') {
                console.warn('⚠️ cart.metadata no es válido');
                return false;
            }

            // Validar cada item
            for (const item of cart.items) {
                if (!this.validateCartItem(item)) {
                    console.warn('⚠️ Item de carrito inválido:', item);
                    return false;
                }
            }

            return true;

        } catch (error) {
            console.error('❌ Error validando estructura de carrito:', error);
            return false;
        }
    }

    /**
     * 🔍 Validar item individual del carrito
     */
    validateCartItem(item) {
        if (!item || typeof item !== 'object') return false;

        // Campos requeridos
        const requiredFields = ['productId', 'quantity', 'addedAt'];
        for (const field of requiredFields) {
            if (!(field in item)) {
                console.warn(`⚠️ Campo requerido faltante: ${field}`);
                return false;
            }
        }

        // Validar tipos
        if (!Number.isInteger(item.productId) || item.productId <= 0) {
            console.warn('⚠️ productId inválido:', item.productId);
            return false;
        }

        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            console.warn('⚠️ quantity inválida:', item.quantity);
            return false;
        }

        if (!Number.isInteger(item.addedAt) || item.addedAt <= 0) {
            console.warn('⚠️ addedAt inválido:', item.addedAt);
            return false;
        }

        return true;
    }

    /**
     * 🧹 Limpiar carrito de productos inexistentes
     */
    cleanupCart(cart) {
        try {
            if (!this.validateCartStructure(cart)) {
                return this.createEmptyCart();
            }

            const validItems = cart.items.filter(item => {
                const product = this.store.productos.find(p => p.id === item.productId);
                
                if (!product) {
                    console.warn(`🗑️ Eliminando producto inexistente del carrito: ${item.productId}`);
                    return false;
                }

                if (!product.disponible) {
                    console.warn(`🗑️ Eliminando producto no disponible: ${product.nombre}`);
                    return false;
                }

                // Ajustar cantidad si excede stock
                if (item.quantity > product.stock) {
                    console.warn(`⚠️ Ajustando cantidad de ${product.nombre}: ${item.quantity} → ${product.stock}`);
                    item.quantity = product.stock;
                }

                return true;
            });

            return {
                ...cart,
                items: validItems,
                metadata: {
                    ...cart.metadata,
                    lastModified: Date.now(),
                    totalItems: validItems.reduce((sum, item) => sum + item.quantity, 0)
                }
            };

        } catch (error) {
            console.error('❌ Error limpiando carrito:', error);
            return this.createEmptyCart();
        }
    }

    /**
     * ✅ Validar antes de agregar producto
     */
    async validateAddProduct(productId, quantity, currentCart) {
        try {
            // 1. Validar productId
            if (!Number.isInteger(productId) || productId <= 0) {
                return {
                    isValid: false,
                    message: 'ID de producto inválido',
                    type: 'error'
                };
            }

            // 2. Validar que el producto existe
            const product = this.store.productos.find(p => p.id === productId);
            if (!product) {
                return {
                    isValid: false,
                    message: 'Producto no encontrado',
                    type: 'error'
                };
            }

            // 3. Validar disponibilidad
            if (!product.disponible) {
                return {
                    isValid: false,
                    message: 'Producto no disponible',
                    type: 'warning'
                };
            }

            // 4. Validar stock
            if (product.stock === 0) {
                return {
                    isValid: false,
                    message: 'Producto sin stock',
                    type: 'warning'
                };
            }

            // 5. Validar cantidad
            if (!Number.isInteger(quantity) || quantity <= 0) {
                return {
                    isValid: false,
                    message: 'Cantidad inválida',
                    type: 'error'
                };
            }

            if (quantity > product.stock) {
                return {
                    isValid: false,
                    message: `Solo ${product.stock} unidades disponibles`,
                    type: 'warning'
                };
            }

            // 6. Validar cantidad total (existente + nueva)
            const existingItem = currentCart.items.find(item => item.productId === productId);
            const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;

            if (totalQuantity > product.stock) {
                const maxCanAdd = product.stock - (existingItem ? existingItem.quantity : 0);
                
                if (maxCanAdd <= 0) {
                    return {
                        isValid: false,
                        message: 'Ya tienes el máximo disponible',
                        type: 'info'
                    };
                } else {
                    return {
                        isValid: false,
                        message: `Solo puedes agregar ${maxCanAdd} unidad${maxCanAdd > 1 ? 'es' : ''} más`,
                        type: 'warning'
                    };
                }
            }

            // 7. Validar límites del carrito
            const cartLimit = 50; // Límite de productos únicos
            if (currentCart.items.length >= cartLimit && !existingItem) {
                return {
                    isValid: false,
                    message: `Límite de carrito alcanzado (${cartLimit} productos)`,
                    type: 'warning'
                };
            }

            // 8. Validar precio válido
            if (!product.precio || product.precio <= 0) {
                return {
                    isValid: false,
                    message: 'Producto sin precio válido',
                    type: 'error'
                };
            }

            // ✅ Todas las validaciones pasaron
            return {
                isValid: true,
                message: 'Producto válido para agregar',
                type: 'success',
                product: product
            };

        } catch (error) {
            console.error('❌ Error en validación:', error);
            return {
                isValid: false,
                message: 'Error validando producto',
                type: 'error'
            };
        }
    }

    /**
     * 📊 Validar cantidades antes de actualizar
     */
    validateQuantityUpdate(productId, newQuantity, currentCart) {
        try {
            // Validar nueva cantidad
            if (!Number.isInteger(newQuantity) || newQuantity < 0) {
                return {
                    isValid: false,
                    message: 'Cantidad inválida',
                    type: 'error'
                };
            }

            // Si cantidad es 0, será una eliminación
            if (newQuantity === 0) {
                return {
                    isValid: true,
                    message: 'Producto será eliminado',
                    type: 'info'
                };
            }

            // Validar producto
            const product = this.store.productos.find(p => p.id === productId);
            if (!product) {
                return {
                    isValid: false,
                    message: 'Producto no encontrado',
                    type: 'error'
                };
            }

            // Validar stock
            if (newQuantity > product.stock) {
                return {
                    isValid: false,
                    message: `Solo ${product.stock} unidades disponibles`,
                    type: 'warning'
                };
            }

            return {
                isValid: true,
                message: 'Cantidad válida',
                type: 'success'
            };

        } catch (error) {
            console.error('❌ Error validando cantidad:', error);
            return {
                isValid: false,
                message: 'Error validando cantidad',
                type: 'error'
            };
        }
    }

    /**
     * 🔍 Detectar duplicados en carrito
     */
    detectDuplicates(cart) {
        const productIds = cart.items.map(item => item.productId);
        const uniqueIds = [...new Set(productIds)];
        
        if (productIds.length !== uniqueIds.length) {
            const duplicates = productIds.filter((id, index) => 
                productIds.indexOf(id) !== index
            );
            
            console.warn('⚠️ Duplicados detectados:', duplicates);
            return duplicates;
        }

        return [];
    }

    /**
     * 🧹 Remover duplicados del carrito
     */
    removeDuplicates(cart) {
        const seen = new Map();
        const cleanItems = [];

        for (const item of cart.items) {
            if (seen.has(item.productId)) {
                // Combinar cantidades
                const existingIndex = cleanItems.findIndex(i => i.productId === item.productId);
                cleanItems[existingIndex].quantity += item.quantity;
                cleanItems[existingIndex].lastUpdated = Math.max(
                    cleanItems[existingIndex].lastUpdated || 0,
                    item.lastUpdated || 0
                );
                console.warn(`🔄 Combinando duplicado: producto ${item.productId}`);
            } else {
                seen.set(item.productId, true);
                cleanItems.push(item);
            }
        }

        return {
            ...cart,
            items: cleanItems
        };
    }

    /**
     * 💰 Validar precio total del carrito
     */
    validateCartTotal(cart) {
        try {
            let calculatedTotal = 0;
            const errors = [];

            for (const item of cart.items) {
                const product = this.store.productos.find(p => p.id === item.productId);
                
                if (!product) {
                    errors.push(`Producto ${item.productId} no encontrado`);
                    continue;
                }

                if (!product.precio || product.precio <= 0) {
                    errors.push(`Precio inválido para ${product.nombre}`);
                    continue;
                }

                calculatedTotal += product.precio * item.quantity;
            }

            return {
                isValid: errors.length === 0,
                calculatedTotal,
                errors,
                savedTotal: cart.metadata.estimatedTotal
            };

        } catch (error) {
            console.error('❌ Error validando total:', error);
            return {
                isValid: false,
                errors: ['Error calculando total'],
                calculatedTotal: 0
            };
        }
    }

    /**
     * 🆕 Crear carrito vacío
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
}

/**
 * 💾 SISTEMA DE ALMACENAMIENTO DEL CARRITO
 */
class CartStorage {
    constructor() {
        this.storageKey = 'patagonia_cart_v2'; // Nueva versión para evitar conflictos
        this.backupKey = 'patagonia_cart_backup';
        this.maxBackups = 3;
    }

    /**
     * 💾 Guardar carrito con backup
     */
    async save(cart) {
        try {
            // Validar antes de guardar
            if (!cart || typeof cart !== 'object') {
                throw new Error('Carrito inválido para guardar');
            }

            // Crear backup del carrito actual
            await this.createBackup();

            // Guardar carrito principal
            const serializedCart = JSON.stringify(cart);
            
            if (window.storageUtils) {
                await window.storageUtils.save('cart_v2', cart);
            } else {
                localStorage.setItem(this.storageKey, serializedCart);
            }

            console.log('💾 Carrito guardado correctamente');

        } catch (error) {
            console.error('❌ Error guardando carrito:', error);
            throw error;
        }
    }

    /**
     * 📥 Cargar carrito con fallbacks
     */
    load() {
        try {
            let cart = null;

            // Intentar cargar con StorageUtils
            if (window.storageUtils) {
                cart = window.storageUtils.get('cart_v2');
            }

            // Fallback a localStorage directo
            if (!cart) {
                const serialized = localStorage.getItem(this.storageKey);
                if (serialized) {
                    cart = JSON.parse(serialized);
                }
            }

            // Fallback a versión antigua del carrito
            if (!cart) {
                cart = this.migrateOldCart();
            }

            // Fallback a backup si es necesario
            if (!cart) {
                cart = this.loadBackup();
            }

            return cart || this.createEmptyCart();

        } catch (error) {
            console.error('❌ Error cargando carrito:', error);
            
            // Intentar cargar backup
            const backup = this.loadBackup();
            return backup || this.createEmptyCart();
        }
    }

    /**
     * 📋 Migrar carrito antiguo
     */
    migrateOldCart() {
        try {
            // Migrar desde versión antigua
            const oldCart = localStorage.getItem('patagonia_carrito');
            if (!oldCart) return null;

            const oldData = JSON.parse(oldCart);
            if (!Array.isArray(oldData)) return null;

            console.log('🔄 Migrando carrito antiguo...');

            // Convertir formato antiguo a nuevo
            const migratedItems = oldData.map(oldItem => ({
                productId: oldItem.id,
                quantity: oldItem.cantidad || 1,
                addedAt: Date.now(),
                lastUpdated: Date.now(),
                selectedVariants: null
            }));

            const migratedCart = {
                items: migratedItems,
                metadata: {
                    createdAt: Date.now(),
                    lastModified: Date.now(),
                    totalItems: migratedItems.reduce((sum, item) => sum + item.quantity, 0),
                    estimatedTotal: 0 // Se calculará después
                }
            };

            // Guardar versión migrada
            this.save(migratedCart);

            // Limpiar versión antigua
            localStorage.removeItem('patagonia_carrito');
            localStorage.removeItem('carrito');
            localStorage.removeItem('cart');

            console.log('✅ Carrito migrado correctamente');
            return migratedCart;

        } catch (error) {
            console.error('❌ Error migrando carrito:', error);
            return null;
        }
    }

    /**
     * 📦 Crear backup
     */
    async createBackup() {
        try {
            const currentCart = localStorage.getItem(this.storageKey);
            if (!currentCart) return;

            const backups = this.getBackups();
            
            // Agregar nuevo backup
            backups.unshift({
                data: currentCart,
                timestamp: Date.now()
            });

            // Mantener solo los últimos backups
            const limitedBackups = backups.slice(0, this.maxBackups);

            localStorage.setItem(this.backupKey, JSON.stringify(limitedBackups));

        } catch (error) {
            console.error('❌ Error creando backup:', error);
        }
    }

    /**
     * 📦 Cargar backup más reciente
     */
    loadBackup() {
        try {
            const backups = this.getBackups();
            
            if (backups.length > 0) {
                console.log('📦 Cargando backup de carrito...');
                return JSON.parse(backups[0].data);
            }

            return null;

        } catch (error) {
            console.error('❌ Error cargando backup:', error);
            return null;
        }
    }

    /**
     * 📋 Obtener lista de backups
     */
    getBackups() {
        try {
            const backupsData = localStorage.getItem(this.backupKey);
            return backupsData ? JSON.parse(backupsData) : [];
        } catch (error) {
            return [];
        }
    }

    /**
     * 🆕 Crear carrito vacío
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
     * 🗑️ Limpiar todos los datos del carrito
     */
    clear() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.backupKey);
        
        if (window.storageUtils) {
            window.storageUtils.remove('cart_v2');
        }
    }
}

// Hacer disponible globalmente
window.CartValidator = CartValidator;
window.CartStorage = CartStorage;

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CartValidator, CartStorage };
}