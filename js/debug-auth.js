/**
 * Funciones de debugging para el sistema de autenticación
 * Este archivo ayuda a diagnosticar problemas con login/logout
 */

// Función para verificar el estado actual del usuario
function debugUserState() {
    console.log('=== DEBUG: Estado del Usuario ===');
    console.log('localStorage.patagonia_user:', localStorage.getItem('patagonia_user'));
    console.log('localStorage.currentUser:', localStorage.getItem('currentUser'));
    
    if (typeof userManager !== 'undefined') {
        console.log('userManager.currentUser:', userManager.currentUser);
    } else {
        console.log('userManager: No disponible');
    }
    
    if (typeof universalNavbar !== 'undefined') {
        console.log('universalNavbar.currentUser:', universalNavbar.currentUser);
    } else {
        console.log('universalNavbar: No disponible');
    }
    console.log('=== FIN DEBUG ===');
}

// Función para forzar logout completo
function forceLogout() {
    console.log('=== FORZANDO LOGOUT COMPLETO ===');
    
    // Limpiar localStorage
    localStorage.removeItem('patagonia_user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('patagonia_users'); // También limpiar lista de usuarios si es necesario
    
    // Resetear userManager si existe
    if (typeof userManager !== 'undefined') {
        userManager.currentUser = null;
    }
    
    // Resetear navbar universal
    if (typeof universalNavbar !== 'undefined') {
        universalNavbar.currentUser = null;
        universalNavbar.renderNavbar();
    }
    
    // Disparar evento
    const event = new CustomEvent('userLoggedOut', {
        detail: { forced: true, timestamp: new Date().toISOString() }
    });
    document.dispatchEvent(event);
    
    console.log('Logout forzado completado');
    debugUserState();
}

// Función para crear usuario de prueba
function createTestUser() {
    const testUser = {
        id: 'test_user_' + Date.now(),
        firstName: 'Usuario',
        lastName: 'Prueba',
        email: 'test@example.com',
        password: 'test123',
        phone: '123456789'
    };
    
    // Agregar a la lista de usuarios
    const users = JSON.parse(localStorage.getItem('patagonia_users') || '[]');
    users.push(testUser);
    localStorage.setItem('patagonia_users', JSON.stringify(users));
    
    console.log('Usuario de prueba creado:', testUser);
    return testUser;
}

// Función para login de prueba
function testLogin() {
    if (typeof userManager !== 'undefined') {
        userManager.login('test@example.com', 'test123').then(result => {
            console.log('Resultado del login de prueba:', result);
            debugUserState();
        });
    } else {
        console.log('userManager no disponible para test login');
    }
}

// Agregar funciones al objeto global para acceso desde consola
window.debugAuth = {
    debugUserState,
    forceLogout,
    createTestUser,
    testLogin
};

console.log('Debug Auth cargado. Usa window.debugAuth para acceder a las funciones.');