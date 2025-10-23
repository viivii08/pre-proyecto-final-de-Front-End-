// Sistema de Navegación Simplificado y Funcional
class NavigationSystem {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.init();
    }

    init() {
        this.createNavbar();
        this.setupEventListeners();
        this.updateAuthDisplay();
        this.setupResponsiveNavbar();
    }

    createNavbar() {
        const navbar = document.createElement('nav');
        navbar.className = 'navbar navbar-expand-lg navbar-dark fixed-top';
        navbar.style.cssText = `
            background: linear-gradient(90deg, #1f3c5a, #3b5d50) !important;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            height: 55px;
            padding: 0.3rem 1rem;
        `;

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        navbar.innerHTML = `
            <div class="container-fluid">
                <a class="navbar-brand d-flex align-items-center" href="index.html">
                    <img src="pages/logo sin fondo (1).png" alt="Logo" width="35" height="35" class="me-2">
                    <span style="font-weight: 600; font-size: 1.1rem;">Patagonia Style</span>
                </a>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav mx-auto">
                        <li class="nav-item">
                            <a class="nav-link ${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}" href="index.html">
                                <i class="bi bi-house me-1"></i>Inicio
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${currentPage === 'tienda.html' ? 'active' : ''}" href="tienda.html">
                                <i class="bi bi-shop me-1"></i>Tienda
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${currentPage === 'portafolio.html' ? 'active' : ''}" href="portafolio.html">
                                <i class="bi bi-collection me-1"></i>Portafolio
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${currentPage === 'contacto.html' ? 'active' : ''}" href="contacto.html">
                                <i class="bi bi-envelope me-1"></i>Contacto
                            </a>
                        </li>
                    </ul>

                    <div class="d-flex align-items-center gap-2" id="navbarActions">
                        <!-- Contenido dinámico -->
                    </div>
                </div>
            </div>
        `;

        // Insertar en el contenedor
        const container = document.getElementById('navbar-container');
        if (container) {
            container.innerHTML = '';
            container.appendChild(navbar);
        } else {
            document.body.insertBefore(navbar, document.body.firstChild);
        }

        // Ajustar padding del body
        document.body.style.paddingTop = '55px';
    }

    setupResponsiveNavbar() {
        const updateNavbar = () => {
            const navbar = document.querySelector('.navbar');
            const navbarNav = document.querySelector('#navbarNav');
            const navbarToggler = document.querySelector('.navbar-toggler');
            
            if (window.innerWidth > 992) {
                // Desktop: Siempre expandido
                if (navbarNav) {
                    navbarNav.classList.remove('collapse');
                    navbarNav.classList.add('show');
                }
                if (navbarToggler) {
                    navbarToggler.style.display = 'none';
                }
            } else {
                // Mobile: Usar collapse
                if (navbarNav) {
                    navbarNav.classList.add('collapse');
                    if (!navbarNav.classList.contains('show')) {
                        navbarNav.classList.remove('show');
                    }
                }
                if (navbarToggler) {
                    navbarToggler.style.display = 'block';
                }
            }
        };

        updateNavbar();
        window.addEventListener('resize', updateNavbar);
    }

    updateAuthDisplay() {
        const actionsContainer = document.getElementById('navbarActions');
        if (!actionsContainer) return;

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const isHomePage = currentPage === 'index.html' || currentPage === '';

        if (this.currentUser) {
            // Usuario logueado
            actionsContainer.innerHTML = `
                ${!isHomePage ? `
                    <form class="d-flex me-2" role="search">
                        <div class="input-group" style="width: 200px;">
                            <input class="form-control form-control-sm" type="search" placeholder="Buscar..." 
                                   style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white;">
                            <button class="btn btn-outline-light btn-sm" type="submit">
                                <i class="bi bi-search"></i>
                            </button>
                        </div>
                    </form>
                ` : ''}
                
                <a href="carrito.html" class="btn btn-outline-light btn-sm position-relative me-2">
                    <i class="bi bi-cart"></i>
                    <span class="d-none d-md-inline ms-1">Carrito</span>
                    <span id="cart-count" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="display: none;">0</span>
                </a>
                
                <div class="dropdown">
                    <button class="btn btn-outline-success btn-sm dropdown-toggle" type="button" 
                            data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-person me-1"></i>
                        <span class="d-none d-lg-inline">${this.currentUser.name || this.currentUser.email.split('@')[0]}</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" style="min-width: 280px;">
                        <li class="dropdown-header" style="padding: 15px 20px; background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
                            <div class="d-flex align-items-center">
                                <div class="me-3">
                                    <i class="bi bi-person-circle" style="font-size: 2.5rem; color: #1f3c5a;"></i>
                                </div>
                                <div>
                                    <div style="font-weight: 600; color: #1f3c5a; font-size: 1rem;">
                                        ${this.currentUser.name || 'Usuario'}
                                    </div>
                                    <div style="font-size: 0.85rem; color: #6c757d;">
                                        ${this.currentUser.email}
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li><hr class="dropdown-divider" style="margin: 0;"></li>
                        <li><a class="dropdown-item" href="mi-cuenta.html" style="padding: 12px 20px;">
                            <i class="bi bi-person me-2" style="width: 20px; text-align: center;"></i>Mi cuenta
                        </a></li>
                        <li><a class="dropdown-item" href="mis-pedidos.html" style="padding: 12px 20px;">
                            <i class="bi bi-box-seam me-2" style="width: 20px; text-align: center;"></i>Mis pedidos
                        </a></li>
                        <li><hr class="dropdown-divider" style="margin: 0;"></li>
                        <li><a class="dropdown-item" href="#" onclick="navigationSystem.logout()" 
                               style="padding: 12px 20px; color: #dc3545; font-weight: 600;">
                            <i class="bi bi-box-arrow-right me-2" style="width: 20px; text-align: center;"></i>Cerrar Sesión
                        </a></li>
                    </ul>
                </div>
            `;
        } else {
            // Usuario no logueado
            actionsContainer.innerHTML = `
                ${!isHomePage ? `
                    <form class="d-flex me-2" role="search">
                        <div class="input-group" style="width: 200px;">
                            <input class="form-control form-control-sm" type="search" placeholder="Buscar..." 
                                   style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white;">
                            <button class="btn btn-outline-light btn-sm" type="submit">
                                <i class="bi bi-search"></i>
                            </button>
                        </div>
                    </form>
                ` : ''}
                
                <button class="btn btn-outline-light btn-sm me-2" data-bs-toggle="modal" data-bs-target="#loginModal">
                    <i class="bi bi-box-arrow-in-right me-1"></i>
                    <span class="d-none d-md-inline">Iniciar Sesión</span>
                </button>
                
                <button class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#registerModal">
                    <i class="bi bi-person-plus me-1"></i>
                    <span class="d-none d-md-inline">Registrarse</span>
                </button>
            `;
        }

        // Actualizar contador del carrito
        this.updateCartCounter();
    }

    setupEventListeners() {
        // Manejo de formularios de autenticación
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'login-form') {
                e.preventDefault();
                this.handleLogin(e.target);
            } else if (e.target.id === 'register-form') {
                e.preventDefault();
                this.handleRegister(e.target);
            } else if (e.target.matches('form[role="search"]')) {
                e.preventDefault();
                const searchTerm = e.target.querySelector('input[type="search"]').value;
                if (searchTerm.trim()) {
                    window.location.href = `tienda.html?search=${encodeURIComponent(searchTerm)}`;
                }
            }
        });

        // Cerrar navbar en móvil al hacer click en enlaces
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-link') && window.innerWidth <= 992) {
                const navbarCollapse = document.querySelector('#navbarNav');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                    if (bsCollapse) {
                        bsCollapse.hide();
                    }
                }
            }
        });
    }

    handleLogin(form) {
        const email = form.querySelector('#login-email').value;
        const password = form.querySelector('#login-password').value;
        
        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUser = user;
                this.updateAuthDisplay();
                
                // Cerrar modal
                const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                if (loginModal) loginModal.hide();
                
                form.reset();
                this.showNotification('¡Bienvenido de vuelta!', 'success');
            } else {
                this.showNotification('Email o contraseña incorrectos', 'error');
            }
        } catch (error) {
            console.error('Error en login:', error);
            this.showNotification('Error al iniciar sesión', 'error');
        }
    }

    handleRegister(form) {
        const name = form.querySelector('#register-name').value;
        const email = form.querySelector('#register-email').value;
        const password = form.querySelector('#register-password').value;
        const confirmPassword = form.querySelector('#register-confirm-password').value;

        if (password !== confirmPassword) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            
            if (users.find(u => u.email === email)) {
                this.showNotification('Este email ya está registrado', 'error');
                return;
            }

            const newUser = { name, email, password, id: Date.now() };
            users.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(users));

            // Cerrar modal
            const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            if (registerModal) registerModal.hide();
            
            form.reset();
            this.showNotification('¡Cuenta creada exitosamente!', 'success');
            
        } catch (error) {
            console.error('Error en registro:', error);
            this.showNotification('Error al crear la cuenta', 'error');
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.updateAuthDisplay();
        this.showNotification('Sesión cerrada correctamente', 'info');
    }

    updateCartCounter() {
        const counter = document.getElementById('cart-count');
        if (counter) {
            const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
            const total = carrito.reduce((acc, item) => acc + (item.cantidad || 0), 0);
            counter.textContent = total;
            counter.style.display = total > 0 ? 'inline-block' : 'none';
        }
    }

    showNotification(message, type = 'info') {
        // Remover notificación existente
        const existing = document.querySelector('.notification-toast');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} notification-toast alert-dismissible fade show`;
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-${this.getIconForType(type)} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }

    getIconForType(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// CSS adicional
const styles = `
<style>
/* Navbar responsive improvements */
@media (min-width: 993px) {
    .navbar-collapse {
        display: flex !important;
        flex-basis: auto;
    }
    .navbar-nav {
        display: flex !important;
    }
    .navbar-toggler {
        display: none !important;
    }
}

@media (max-width: 992px) {
    .navbar-nav {
        margin-top: 0.5rem;
    }
    
    .navbar-nav .nav-link {
        padding: 0.75rem 1rem !important;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    #navbarActions {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255,255,255,0.1);
        flex-direction: column;
        gap: 0.5rem;
    }
    
    #navbarActions .btn {
        width: 100%;
        justify-content: center;
    }
    
    #navbarActions form {
        width: 100%;
        margin: 0 !important;
    }
    
    #navbarActions .input-group {
        width: 100% !important;
    }
}

.nav-link.active {
    background: rgba(255,255,255,0.2) !important;
    border-radius: 6px;
}

.form-control:focus {
    border-color: #b67c3a !important;
    box-shadow: 0 0 0 0.2rem rgba(182, 124, 58, 0.25) !important;
}

.form-control::placeholder {
    color: rgba(255,255,255,0.7) !important;
}

.notification-toast {
    animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Dropdown de usuario mejorado */
.dropdown-menu {
    border: none !important;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
    border-radius: 15px !important;
    padding: 0 !important;
    overflow: hidden;
    background: white !important;
    margin-top: 10px !important;
}

.dropdown-header {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef) !important;
    border: none !important;
    margin: 0 !important;
    border-radius: 15px 15px 0 0 !important;
}

.dropdown-item {
    transition: all 0.3s ease !important;
    border: none !important;
    font-size: 0.95rem;
    color: #2c3e50 !important;
    font-weight: 500;
}

.dropdown-item:hover {
    background: linear-gradient(135deg, #1f3c5a, #3b5d50) !important;
    color: white !important;
    transform: translateX(5px);
}

.dropdown-item i {
    opacity: 0.8;
}

.dropdown-divider {
    border-color: #e9ecef !important;
}

/* Estilo especial para cerrar sesión */
.dropdown-item[onclick*="logout"]:hover {
    background: #dc3545 !important;
    color: white !important;
}
</style>
`;

// Insertar estilos
document.head.insertAdjacentHTML('beforeend', styles);

// Instancia global
let navigationSystem;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    navigationSystem = new NavigationSystem();
});