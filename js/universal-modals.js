/**
 * 🔄 MODALES UNIVERSALES
 * Sistema de modales compartido entre páginas
 */

class UniversalModals {
    constructor() {
        this.modalsLoaded = false;
        this.init();
    }

    init() {
        // Solo cargar una vez
        if (this.modalsLoaded) return;
        
        this.loadModals();
        this.setupEventListeners();
        this.modalsLoaded = true;
    }

    loadModals() {
        // Buscar contenedor o crear uno
        let container = document.getElementById('universal-modals-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'universal-modals-container';
            document.body.appendChild(container);
        }

        container.innerHTML = `
            <!-- Login Modal -->
            <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border-radius: 15px; border: none;">
                        <div class="modal-header" style="background: linear-gradient(135deg, #1f3c5a, #3b5d50); color: white; border-radius: 15px 15px 0 0;">
                            <h5 class="modal-title" id="loginModalLabel">
                                <i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" style="padding: 30px;">
                            <form id="login-form">
                                <div class="mb-3">
                                    <label for="login-email" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="login-email" required>
                                </div>
                                <div class="mb-3">
                                    <label for="login-password" class="form-label">Contraseña</label>
                                    <input type="password" class="form-control" id="login-password" required>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="remember-me">
                                    <label class="form-check-label" for="remember-me">Recordarme</label>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Iniciar Sesión</button>
                            </form>
                            <div class="text-center mt-3">
                                <p class="mb-0">¿No tienes cuenta? 
                                    <a href="#" class="text-decoration-none" data-bs-toggle="modal" data-bs-target="#registerModal" data-bs-dismiss="modal">
                                        <strong>Crear cuenta</strong>
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Register Modal -->
            <div class="modal fade" id="registerModal" tabindex="-1" aria-labelledby="registerModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content" style="border-radius: 15px; border: none;">
                        <div class="modal-header" style="background: linear-gradient(135deg, #b67c3a, #d4941e); color: white; border-radius: 15px 15px 0 0;">
                            <h5 class="modal-title" id="registerModalLabel">
                                <i class="bi bi-person-plus me-2"></i>Crear Cuenta
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" style="padding: 30px;">
                            <form id="register-form">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="register-firstName" class="form-label">Nombre</label>
                                        <input type="text" class="form-control" id="register-firstName" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="register-lastName" class="form-label">Apellido</label>
                                        <input type="text" class="form-control" id="register-lastName" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="register-email" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="register-email" required>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="register-password" class="form-label">Contraseña</label>
                                        <input type="password" class="form-control" id="register-password" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="register-confirmPassword" class="form-label">Confirmar Contraseña</label>
                                        <input type="password" class="form-control" id="register-confirmPassword" required>
                                    </div>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="accept-terms" required>
                                    <label class="form-check-label" for="accept-terms">
                                        Acepto los términos y condiciones
                                    </label>
                                </div>
                                <button type="submit" class="btn btn-warning w-100">Crear Cuenta</button>
                            </form>
                            <div class="text-center mt-3">
                                <p class="mb-0">¿Ya tienes cuenta? 
                                    <a href="#" class="text-decoration-none" data-bs-toggle="modal" data-bs-target="#loginModal" data-bs-dismiss="modal">
                                        <strong>Iniciar Sesión</strong>
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cart Modal -->
            <div class="modal fade" id="cartModal" tabindex="-1" aria-labelledby="cartModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content" style="border-radius: 15px; border: none; max-height: 90vh; overflow-y: auto;">
                        <div class="modal-header" style="background: linear-gradient(135deg, #3b5d50, #2c5530); color: white; border-radius: 15px 15px 0 0;">
                            <h5 class="modal-title" id="cartModalLabel">
                                <i class="bi bi-cart3 me-2"></i>Carrito de compras
                                <span id="cart-items-count" class="badge bg-light text-dark ms-2">0</span>
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" style="padding: 20px;">
                            <!-- Items del carrito -->
                            <div id="cart-items" class="cart-items mb-4">
                                <!-- Se llenan dinámicamente -->
                            </div>
                            
                            <!-- Estado carrito vacío -->
                            <div id="empty-cart" class="text-center py-5">
                                <i class="bi bi-cart-x" style="font-size: 4rem; color: #ccc;"></i>
                                <h4 class="mt-3 text-muted">Tu carrito está vacío</h4>
                                <p class="text-muted">Agrega productos para comenzar tu compra</p>
                                <button class="btn btn-primary" data-bs-dismiss="modal">
                                    <i class="bi bi-shop me-2"></i>Continuar comprando
                                </button>
                            </div>
                        </div>
                        <div class="modal-footer" id="cart-footer" style="border-top: 1px solid #eee; padding: 20px; background: #f8f9fa; border-radius: 0 0 15px 15px; display: none;">
                            <!-- Resumen del carrito -->
                            <div class="w-100">
                                <div id="cart-summary" class="cart-summary mb-3">
                                    <!-- Se llena dinámicamente -->
                                </div>
                                <div class="d-flex gap-2 w-100">
                                    <button type="button" class="btn btn-outline-secondary flex-grow-1" data-bs-dismiss="modal">
                                        <i class="bi bi-arrow-left me-2"></i>Seguir comprando
                                    </button>
                                    <a href="carrito.html" class="btn btn-primary flex-grow-1">
                                        <i class="bi bi-credit-card me-2"></i>Ir al checkout
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Configurar formulario de login
        document.addEventListener('submit', (event) => {
            if (event.target.id === 'login-form') {
                event.preventDefault();
                this.handleLogin(event.target);
            }
        });

        // Configurar formulario de registro
        document.addEventListener('submit', (event) => {
            if (event.target.id === 'register-form') {
                event.preventDefault();
                this.handleRegister(event.target);
            }
        });
    }

    handleLogin(form) {
        const email = form.querySelector('#login-email').value;
        const password = form.querySelector('#login-password').value;
        const remember = form.querySelector('#remember-me').checked;

        console.log('🔐 Intentando login:', { email, remember });

        // Si existe el sistema de usuarios, usarlo
        if (typeof userManager !== 'undefined') {
            userManager.loginUser(email, password, remember);
        } else {
            // Simular login exitoso
            const user = { email, firstName: 'Usuario' };
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Cerrar modal y mostrar mensaje
            const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            modal.hide();
            
            if (typeof feedback !== 'undefined') {
                feedback.success('loginSuccess', { userName: user.firstName });
            }
            
            // Recargar página para actualizar navbar
            setTimeout(() => location.reload(), 1000);
        }
    }

    handleRegister(form) {
        const firstName = form.querySelector('#register-firstName').value;
        const lastName = form.querySelector('#register-lastName').value;
        const email = form.querySelector('#register-email').value;
        const password = form.querySelector('#register-password').value;
        const confirmPassword = form.querySelector('#register-confirmPassword').value;

        console.log('👤 Intentando registro:', { firstName, lastName, email });

        // Validaciones básicas
        if (password !== confirmPassword) {
            if (typeof feedback !== 'undefined') {
                feedback.error('passwordMismatch');
            } else {
                alert('Las contraseñas no coinciden');
            }
            return;
        }

        // Si existe el sistema de usuarios, usarlo
        if (typeof userManager !== 'undefined') {
            userManager.registerUser({ firstName, lastName, email, password });
        } else {
            // Simular registro exitoso
            const user = { firstName, lastName, email };
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Cerrar modal y mostrar mensaje
            const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            modal.hide();
            
            if (typeof feedback !== 'undefined') {
                feedback.success('registerSuccess', { userName: firstName });
            } else {
                alert('¡Cuenta creada exitosamente!');
            }
            
            // Recargar página para actualizar navbar
            setTimeout(() => location.reload(), 1000);
        }
    }

    // Métodos públicos
    showLogin() {
        const modal = new bootstrap.Modal(document.getElementById('loginModal'));
        modal.show();
    }

    showRegister() {
        const modal = new bootstrap.Modal(document.getElementById('registerModal'));
        modal.show();
    }

    showCart() {
        const modal = new bootstrap.Modal(document.getElementById('cartModal'));
        modal.show();
    }
}

// Inicializar automáticamente
document.addEventListener('DOMContentLoaded', () => {
    window.universalModals = new UniversalModals();
});

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalModals;
}