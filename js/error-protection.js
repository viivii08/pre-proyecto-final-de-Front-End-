/**
 * 🛡️ SISTEMA DE PROTECCIÓN CONTRA ERRORES
 * Evita que aparezcan mensajes de error innecesarios
 */

// Mock del sistema de feedback para evitar errores
if (typeof window.feedback === 'undefined') {
    window.feedback = {
        success: function() { /* silencioso */ },
        error: function() { /* silencioso */ },
        warning: function() { /* silencioso */ },
        info: function() { /* silencioso */ },
        show: function() { /* silencioso */ },
        showCustom: function() { /* silencioso */ }
    };
}

// Mock del sistema de carrito para evitar errores
if (typeof window.carritoManager === 'undefined') {
    window.carritoManager = {
        initialized: false,
        agregarAlCarrito: function() { 
            console.log('ℹ️ Carrito no disponible en esta página');
            return { success: false, error: 'Carrito no disponible' };
        },
        getTotalItems: function() { return 0; },
        getCartItems: function() { return []; },
        isEmpty: function() { return true; }
    };
}

// Interceptar y silenciar eventos de error del carrito
document.addEventListener('cart:error', function(event) {
    event.stopPropagation();
    console.log('🔇 Error de carrito silenciado:', event.detail);
});

console.log('🛡️ Sistema de protección activado');