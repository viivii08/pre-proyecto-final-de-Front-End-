/**
 * 🎨 SISTEMA DE RENDERIZADO UNIFICADO DEL CARRITO
 * Renderiza todos los componentes del carrito desde un solo lugar
 */

class CartRenderer {
    constructor() {
        this.templates = new Map();
        this.animations = new CartAnimations();
        this.setupTemplates();
    }

    /**
     * 🎨 Configurar templates HTML
     */
    setupTemplates() {
        // Template para item del carrito
        this.templates.set('cartItem', `
            <div class="cart-item" data-product-id="{{productId}}">
                <div class="cart-item-image">
                    <img src="{{productImage}}" alt="{{productName}}" loading="lazy">
                </div>
                
                <div class="cart-item-details">
                    <h6 class="cart-item-name">{{productName}}</h6>
                    <p class="cart-item-price">${{productPrice}}</p>
                    {{#if hasVariants}}
                    <small class="cart-item-variants text-muted">{{variants}}</small>
                    {{/if}}
                </div>
                
                <div class="cart-item-quantity">
                    <button class="quantity-btn btn-decrease" 
                            data-product-id="{{productId}}" 
                            data-action="decrease"
                            title="Reducir cantidad">
                        <i class="bi bi-dash"></i>
                    </button>
                    
                    <input type="number" 
                           class="quantity-input" 
                           value="{{quantity}}" 
                           min="0" 
                           max="{{maxStock}}"
                           data-product-id="{{productId}}">
                    
                    <button class="quantity-btn btn-increase" 
                            data-product-id="{{productId}}" 
                            data-action="increase"
                            title="Aumentar cantidad"
                            {{#if isMaxQuantity}}disabled{{/if}}>
                        <i class="bi bi-plus"></i>
                    </button>
                </div>
                
                <div class="cart-item-total">
                    <span class="item-subtotal">${{itemTotal}}</span>
                </div>
                
                <div class="cart-item-actions">
                    <button class="remove-item-btn" 
                            data-product-id="{{productId}}"
                            title="Eliminar producto">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `);

        // Template para carrito vacío
        this.templates.set('emptyCart', `
            <div class="empty-cart">
                <div class="empty-cart-icon">
                    <i class="bi bi-cart-x"></i>
                </div>
                <h4>Tu carrito está vacío</h4>
                <p>Agrega productos para comenzar tu compra</p>
                <a href="tienda.html" class="btn btn-primary">
                    <i class="bi bi-shop me-2"></i>Ir a la tienda
                </a>
            </div>
        `);

        // Template para summary del carrito
        this.templates.set('cartSummary', `
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Productos ({{totalItems}})</span>
                    <span>${{subtotal}}</span>
                </div>
                
                {{#if hasDiscount}}
                <div class="summary-row discount">
                    <span>Descuento</span>
                    <span class="text-success">-${{discount}}</span>
                </div>
                {{/if}}
                
                {{#if hasShipping}}
                <div class="summary-row">
                    <span>Envío</span>
                    <span>${{shipping}}</span>
                </div>
                {{/if}}
                
                <div class="summary-row total">
                    <span><strong>Total</strong></span>
                    <span><strong>${{total}}</strong></span>
                </div>
            </div>
        `);

        // Template para contador del carrito
        this.templates.set('cartCounter', `
            <span class="cart-count" id="cart-count">{{count}}</span>
        `);
    }

    /**
     * 🛒 Renderizar item individual del carrito
     */
    getCartItemHTML(cartItem, product) {
        try {
            if (!cartItem || !product) {
                console.warn('⚠️ Datos incompletos para renderizar item');
                return '';
            }

            const itemTotal = (product.precio * cartItem.quantity).toLocaleString();
            const isMaxQuantity = cartItem.quantity >= product.stock;
            
            // Procesar variants si existen
            let variantsText = '';
            if (cartItem.selectedVariants) {
                variantsText = Object.entries(cartItem.selectedVariants)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
            }

            const templateData = {
                productId: cartItem.productId,
                productName: product.nombre,
                productPrice: product.precio.toLocaleString(),
                productImage: product.imagenes?.[0] || 'images/no-image.png',
                quantity: cartItem.quantity,
                maxStock: product.stock,
                itemTotal: itemTotal,
                isMaxQuantity: isMaxQuantity,
                hasVariants: variantsText.length > 0,
                variants: variantsText
            };

            return this.processTemplate('cartItem', templateData);

        } catch (error) {
            console.error('❌ Error renderizando item del carrito:', error);
            return '';
        }
    }

    /**
     * 🈳 HTML para carrito vacío
     */
    getEmptyCartHTML() {
        return this.templates.get('emptyCart');
    }

    /**
     * 📊 Renderizar resumen del carrito
     */
    getCartSummaryHTML(cartData, options = {}) {
        try {
            const {
                subtotal = 0,
                discount = 0,
                shipping = 0,
                total = 0,
                totalItems = 0
            } = cartData;

            const templateData = {
                totalItems,
                subtotal: subtotal.toLocaleString(),
                discount: discount.toLocaleString(),
                shipping: shipping === 0 ? 'Gratis' : shipping.toLocaleString(),
                total: total.toLocaleString(),
                hasDiscount: discount > 0,
                hasShipping: options.showShipping !== false
            };

            return this.processTemplate('cartSummary', templateData);

        } catch (error) {
            console.error('❌ Error renderizando resumen:', error);
            return '<div class="error">Error mostrando resumen</div>';
        }
    }

    /**
     * 🔄 Procesar template con datos
     */
    processTemplate(templateName, data) {
        try {
            let template = this.templates.get(templateName);
            if (!template) {
                console.error(`❌ Template no encontrado: ${templateName}`);
                return '';
            }

            // Reemplazar variables simples {{variable}}
            template = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                return data[key] !== undefined ? data[key] : '';
            });

            // Manejar condicionales {{#if condition}}...{{/if}}
            template = template.replace(/\{\{#if (\w+)\}\}(.*?)\{\{\/if\}\}/gs, (match, condition, content) => {
                return data[condition] ? content : '';
            });

            return template;

        } catch (error) {
            console.error('❌ Error procesando template:', error);
            return '';
        }
    }

    /**
     * 🎯 Renderizar componente específico del carrito
     */
    renderComponent(componentName, container, data) {
        try {
            const element = typeof container === 'string' 
                ? document.querySelector(container) 
                : container;

            if (!element) {
                console.warn(`⚠️ Contenedor no encontrado: ${container}`);
                return;
            }

            let html = '';
            
            switch (componentName) {
                case 'counter':
                    html = this.renderCounter(data.totalItems);
                    break;
                    
                case 'items':
                    html = this.renderItems(data.items, data.products);
                    break;
                    
                case 'summary':
                    html = this.renderSummary(data.cartData, data.options);
                    break;
                    
                case 'empty':
                    html = this.getEmptyCartHTML();
                    break;
                    
                default:
                    console.warn(`⚠️ Componente desconocido: ${componentName}`);
                    return;
            }

            // Aplicar animación de cambio
            this.animations.fadeUpdate(element, html);

        } catch (error) {
            console.error(`❌ Error renderizando componente ${componentName}:`, error);
        }
    }

    /**
     * 🔢 Renderizar contador del carrito
     */
    renderCounter(totalItems) {
        const counters = document.querySelectorAll('.cart-count, #cart-count');
        
        counters.forEach(counter => {
            counter.textContent = totalItems;
            counter.style.display = totalItems > 0 ? 'inline-block' : 'none';
            
            // Animación de actualización
            this.animations.bounce(counter);
        });

        return totalItems.toString();
    }

    /**
     * 🛒 Renderizar lista de items
     */
    renderItems(cartItems, products) {
        if (!cartItems || cartItems.length === 0) {
            return this.getEmptyCartHTML();
        }

        return cartItems.map(item => {
            const product = products.find(p => p.id === item.productId);
            return this.getCartItemHTML(item, product);
        }).join('');
    }

    /**
     * 📊 Renderizar resumen
     */
    renderSummary(cartData, options = {}) {
        return this.getCartSummaryHTML(cartData, options);
    }

    /**
     * 🎨 Agregar estilos CSS del carrito
     */
    injectStyles() {
        if (document.querySelector('#cart-renderer-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'cart-renderer-styles';
        styles.textContent = `
            /* Estilos para items del carrito */
            .cart-item {
                display: grid;
                grid-template-columns: 80px 1fr auto auto auto;
                gap: 1rem;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid #eee;
                transition: all 0.3s ease;
                background: white;
                border-radius: 8px;
                margin-bottom: 0.5rem;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .cart-item:hover {
                background: #f8f9fa;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }

            .cart-item-image img {
                width: 60px;
                height: 60px;
                object-fit: cover;
                border-radius: 6px;
                border: 1px solid #ddd;
            }

            .cart-item-details {
                flex: 1;
            }

            .cart-item-name {
                font-size: 0.95rem;
                font-weight: 600;
                margin: 0 0 0.25rem 0;
                color: #333;
            }

            .cart-item-price {
                font-size: 0.9rem;
                color: #666;
                margin: 0;
            }

            .cart-item-variants {
                font-size: 0.8rem;
                margin: 0.25rem 0 0 0;
            }

            .cart-item-quantity {
                display: flex;
                align-items: center;
                border: 1px solid #ddd;
                border-radius: 6px;
                overflow: hidden;
                background: white;
            }

            .quantity-btn {
                background: #f8f9fa;
                border: none;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background 0.2s ease;
                font-size: 0.9rem;
            }

            .quantity-btn:hover:not(:disabled) {
                background: #e9ecef;
            }

            .quantity-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .quantity-input {
                border: none;
                width: 50px;
                text-align: center;
                font-size: 0.9rem;
                padding: 4px;
                background: transparent;
            }

            .quantity-input:focus {
                outline: none;
                background: #f8f9fa;
            }

            .cart-item-total {
                font-weight: 600;
                color: var(--primary-color, #1f3c5a);
                text-align: right;
                min-width: 80px;
            }

            .remove-item-btn {
                background: #dc3545;
                color: white;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .remove-item-btn:hover {
                background: #c82333;
                transform: scale(1.05);
            }

            /* Carrito vacío */
            .empty-cart {
                text-align: center;
                padding: 3rem 1rem;
                color: #666;
            }

            .empty-cart-icon {
                font-size: 4rem;
                color: #ddd;
                margin-bottom: 1rem;
            }

            .empty-cart h4 {
                margin-bottom: 0.5rem;
                color: #333;
            }

            .empty-cart p {
                margin-bottom: 1.5rem;
            }

            /* Resumen del carrito */
            .cart-summary {
                background: #f8f9fa;
                padding: 1.5rem;
                border-radius: 8px;
                border: 1px solid #dee2e6;
            }

            .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.75rem;
                font-size: 0.95rem;
            }

            .summary-row:last-child {
                margin-bottom: 0;
            }

            .summary-row.total {
                border-top: 2px solid #dee2e6;
                padding-top: 0.75rem;
                margin-top: 0.75rem;
                font-size: 1.1rem;
            }

            .summary-row.discount {
                color: #28a745;
            }

            /* Contador del carrito */
            .cart-count {
                background: #dc3545;
                color: white;
                border-radius: 50%;
                font-size: 0.75rem;
                font-weight: 600;
                min-width: 18px;
                height: 18px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                top: -8px;
                right: -8px;
                animation: cartBounce 0.3s ease;
            }

            @keyframes cartBounce {
                0% { transform: scale(0.3); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .cart-item.new {
                animation: fadeInUp 0.5s ease;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .cart-item {
                    grid-template-columns: 60px 1fr auto;
                    gap: 0.75rem;
                }

                .cart-item-total {
                    grid-column: 2 / -1;
                    text-align: left;
                    margin-top: 0.5rem;
                }

                .cart-item-actions {
                    grid-column: -1;
                    grid-row: 1;
                }

                .cart-item-quantity {
                    margin-top: 0.5rem;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

/**
 * ✨ SISTEMA DE ANIMACIONES PARA EL CARRITO
 */
class CartAnimations {
    
    /**
     * 🎯 Animación de bounce para contador
     */
    bounce(element) {
        if (!element) return;
        
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'cartBounce 0.3s ease';
    }

    /**
     * 🔄 Fade update para contenido
     */
    fadeUpdate(element, newContent) {
        if (!element) return;

        // Fade out
        element.style.transition = 'opacity 0.2s ease';
        element.style.opacity = '0.5';

        setTimeout(() => {
            element.innerHTML = newContent;
            
            // Fade in
            element.style.opacity = '1';
            
            // Limpiar estilos después de la animación
            setTimeout(() => {
                element.style.transition = '';
                element.style.opacity = '';
            }, 200);
            
        }, 100);
    }

    /**
     * ➕ Animación para item agregado
     */
    addItem(element) {
        if (!element) return;
        
        element.classList.add('new');
        setTimeout(() => {
            element.classList.remove('new');
        }, 500);
    }

    /**
     * 🗑️ Animación para item eliminado
     */
    removeItem(element, callback) {
        if (!element) {
            if (callback) callback();
            return;
        }

        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'translateX(100%)';
        element.style.opacity = '0';

        setTimeout(() => {
            if (callback) callback();
        }, 300);
    }

    /**
     * 📈 Animación de número creciente
     */
    countUp(element, fromValue, toValue, duration = 500) {
        if (!element || fromValue === toValue) return;

        const startTime = performance.now();
        const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.round(fromValue + (toValue - fromValue) * progress);
            element.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        };

        requestAnimationFrame(updateCount);
    }
}

// Auto-inyectar estilos al cargar
document.addEventListener('DOMContentLoaded', () => {
    const renderer = new CartRenderer();
    renderer.injectStyles();
});

// Hacer disponible globalmente
window.CartRenderer = CartRenderer;
window.CartAnimations = CartAnimations;

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CartRenderer, CartAnimations };
}