/**
 * 🛒 SISTEMA UNIVERSAL DE CHECKOUT CON WHATSAPP
 * Sistema completo para redireccionar compras a WhatsApp
 */

class WhatsAppCheckout {
    constructor(whatsappNumber = '5491136899678') {
        this.whatsappNumber = whatsappNumber;
        this.init();
    }

    init() {
        // Interceptar todos los eventos de checkout existentes
        this.interceptCheckoutEvents();
        
        // Agregar manejadores a modales universales
        this.setupUniversalCheckout();
    }

    /**
     * 📱 Crear mensaje formateado para WhatsApp
     */
    createWhatsAppMessage(cartItems, total) {
        let mensaje = "¡Hola! Quiero confirmar mi pedido:%0A%0A";
        
        if (Array.isArray(cartItems)) {
            cartItems.forEach(item => {
                const quantity = item.quantity || item.cantidad || 1;
                const price = item.price || item.precio || 0;
                const name = item.name || item.nombre || 'Producto';
                mensaje += `• ${name} (x${quantity}) - $${(price * quantity).toFixed(2)}%0A`;
            });
        }
        
        mensaje += `%0A*Total: $${total.toFixed(2)}*%0A%0A`;
        mensaje += "¡Esperando la confirmación! 😊";
        
        return mensaje;
    }

    /**
     * 🔗 Abrir WhatsApp con el mensaje
     */
    openWhatsApp(mensaje) {
        const url = `https://wa.me/${this.whatsappNumber}?text=${mensaje}`;
        window.open(url, '_blank');
    }

    /**
     * 🛒 Procesar checkout universal
     */
    processCheckout() {
        let cartItems = [];
        let total = 0;

        // Intentar obtener datos del carrito de diferentes sistemas
        if (typeof window.carritoManager !== 'undefined' && window.carritoManager.getCartItems) {
            const items = window.carritoManager.getCartItems();
            if (items.length > 0) {
                cartItems = items;
                total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            }
        }
        
        // Fallback al localStorage
        if (cartItems.length === 0) {
            const storedCart = JSON.parse(localStorage.getItem('cart')) || 
                              JSON.parse(localStorage.getItem('carrito')) || [];
            if (storedCart.length > 0) {
                cartItems = storedCart;
                total = storedCart.reduce((sum, item) => {
                    const price = item.price || item.precio || 0;
                    const quantity = item.quantity || item.cantidad || 1;
                    return sum + (price * quantity);
                }, 0);
            }
        }

        // Verificar que hay items
        if (cartItems.length === 0) {
            alert('El carrito está vacío.');
            return false;
        }

        // Crear y enviar mensaje
        const mensaje = this.createWhatsAppMessage(cartItems, total);
        
        // Limpiar carritos
        this.clearAllCarts();
        
        // Abrir WhatsApp después de un breve delay
        setTimeout(() => {
            this.openWhatsApp(mensaje);
        }, 500);

        return true;
    }

    /**
     * 🧹 Limpiar todos los carritos
     */
    clearAllCarts() {
        // Limpiar localStorage
        localStorage.removeItem('cart');
        localStorage.removeItem('carrito');
        
        // Limpiar sistemas de carrito
        if (typeof window.carritoManager !== 'undefined' && window.carritoManager.clearCart) {
            window.carritoManager.clearCart();
        }
        
        // Actualizar contadores
        const cartCounters = document.querySelectorAll('#cartCount, #cart-count, .cart-counter');
        cartCounters.forEach(counter => {
            counter.textContent = '0';
            counter.style.display = 'none';
        });

        // Cerrar modales
        const cartModals = document.querySelectorAll('#cartModal, .cart-modal');
        cartModals.forEach(modal => {
            if (modal && typeof bootstrap !== 'undefined') {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            }
        });

        console.log('✅ Carrito limpiado - Redirigiendo a WhatsApp');
    }

    /**
     * 🎯 Interceptar eventos de checkout existentes
     */
    interceptCheckoutEvents() {
        // Interceptar clics en botones de checkout
        document.addEventListener('click', (event) => {
            const target = event.target;
            
            // Buscar botones de checkout
            if (target.id === 'checkoutBtn' || 
                target.classList.contains('checkout-btn') ||
                target.textContent.includes('Finalizar') ||
                target.textContent.includes('Checkout') ||
                target.textContent.includes('Comprar')) {
                
                event.preventDefault();
                event.stopPropagation();
                
                this.processCheckout();
                return false;
            }
        });
    }

    /**
     * ⚙️ Configurar checkout en modales universales
     */
    setupUniversalCheckout() {
        // Esperar a que se carguen los modales
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Buscar botones de checkout en nodos agregados
                        const checkoutBtns = node.querySelectorAll 
                            ? node.querySelectorAll('#checkoutBtn, .checkout-btn')
                            : [];
                        
                        checkoutBtns.forEach(btn => {
                            btn.removeEventListener('click', this.handleCheckout);
                            btn.addEventListener('click', this.handleCheckout.bind(this));
                        });
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
     * 🎯 Manejador de eventos de checkout
     */
    handleCheckout(event) {
        event.preventDefault();
        event.stopPropagation();
        this.processCheckout();
        return false;
    }
}

// 🚀 Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.whatsappCheckout === 'undefined') {
        window.whatsappCheckout = new WhatsAppCheckout();
        console.log('💬 Sistema de WhatsApp Checkout activado');
    }
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WhatsAppCheckout };
}