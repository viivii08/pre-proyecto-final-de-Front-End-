// Sistema de gestión de usuarios para Patagonia Style
class UserManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    this.loadCurrentUser();
    this.setupEventListeners();
  }

  loadCurrentUser() {
    const userData = localStorage.getItem('patagonia_user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.updateUIForLoggedUser();
    }
  }

  // Registro de nuevo usuario
  async register(userData) {
    try {
      // Validar datos
      const validation = this.validateUserData(userData);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Verificar si el email ya existe
      const existingUsers = this.getAllUsers();
      if (existingUsers.find(user => user.email === userData.email)) {
        throw new Error('El email ya está registrado');
      }

      // Crear nuevo usuario
      const newUser = {
        id: this.generateUserId(),
        email: userData.email,
        password: this.hashPassword(userData.password), // En producción usar bcrypt
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        addresses: [],
        orders: [],
        preferences: {
          notifications: true,
          newsletter: false
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // Guardar usuario
      this.saveUser(newUser);
      
      // Auto-login después del registro
      this.currentUser = { ...newUser };
      delete this.currentUser.password; // No mantener password en memoria
      localStorage.setItem('patagonia_user', JSON.stringify(this.currentUser));
      
      this.updateUIForLoggedUser();
      this.showNotification('¡Registro exitoso! Bienvenido a Patagonia Style', 'success');
      
      return { success: true, user: this.currentUser };
    } catch (error) {
      this.showNotification(error.message, 'error');
      return { success: false, error: error.message };
    }
  }

  // Login de usuario
  async login(email, password) {
    try {
      const users = this.getAllUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Email no encontrado');
      }

      if (!this.verifyPassword(password, user.password)) {
        throw new Error('Contraseña incorrecta');
      }

      // Actualizar último login
      user.lastLogin = new Date().toISOString();
      this.updateUser(user);

      // Establecer usuario actual
      this.currentUser = { ...user };
      delete this.currentUser.password;
      localStorage.setItem('patagonia_user', JSON.stringify(this.currentUser));
      
      this.updateUIForLoggedUser();
      this.showNotification(`¡Bienvenido de vuelta, ${user.firstName}!`, 'success');
      
      return { success: true, user: this.currentUser };
    } catch (error) {
      this.showNotification(error.message, 'error');
      return { success: false, error: error.message };
    }
  }

  // Logout
  logout() {
    this.currentUser = null;
    localStorage.removeItem('patagonia_user');
    localStorage.removeItem('currentUser'); // Compatibilidad
    
    // Disparar evento para actualizar UI
    const event = new CustomEvent('userLoggedOut', {
      detail: { timestamp: new Date().toISOString() }
    });
    document.dispatchEvent(event);
    
    this.updateUIForLoggedUser();
    this.showNotification('Sesión cerrada exitosamente', 'info');
    
    // Actualizar navbar universal si existe
    if (typeof universalNavbar !== 'undefined') {
      universalNavbar.currentUser = null;
      universalNavbar.renderNavbar();
    }
    
    // Redirigir a inicio si está en página protegida
    if (window.location.pathname.includes('mi-cuenta') || 
        window.location.pathname.includes('pedidos')) {
      window.location.href = 'index.html';
    }
  }

  // Validación de datos de usuario
  validateUserData(data) {
    if (!data.email || !this.isValidEmail(data.email)) {
      return { isValid: false, message: 'Email inválido' };
    }
    
    if (!data.password || data.password.length < 6) {
      return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }
    
    if (!data.firstName || data.firstName.trim().length < 2) {
      return { isValid: false, message: 'El nombre debe tener al menos 2 caracteres' };
    }
    
    if (!data.lastName || data.lastName.trim().length < 2) {
      return { isValid: false, message: 'El apellido debe tener al menos 2 caracteres' };
    }
    
    // Validación de teléfono más flexible
    if (data.phone && data.phone !== '0000000000' && data.phone.length < 10) {
      return { isValid: false, message: 'Teléfono inválido' };
    }

    return { isValid: true };
  }

  // Utilidades
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  hashPassword(password) {
    // Implementación simple para demo - usar bcrypt en producción
    return btoa(password + 'patagonia_salt');
  }

  verifyPassword(password, hashedPassword) {
    return this.hashPassword(password) === hashedPassword;
  }

  // Gestión de usuarios en localStorage
  getAllUsers() {
    const users = localStorage.getItem('patagonia_users');
    return users ? JSON.parse(users) : [];
  }

  saveUser(user) {
    const users = this.getAllUsers();
    users.push(user);
    localStorage.setItem('patagonia_users', JSON.stringify(users));
  }

  updateUser(updatedUser) {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem('patagonia_users', JSON.stringify(users));
      
      // Actualizar usuario actual si es el mismo
      if (this.currentUser && this.currentUser.id === updatedUser.id) {
        this.currentUser = { ...updatedUser };
        delete this.currentUser.password;
        localStorage.setItem('patagonia_user', JSON.stringify(this.currentUser));
      }
    }
  }

  // Gestión de pedidos del usuario
  addOrderToUser(order) {
    if (!this.currentUser) return false;
    
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === this.currentUser.id);
    
    if (userIndex !== -1) {
      if (!users[userIndex].orders) {
        users[userIndex].orders = [];
      }
      users[userIndex].orders.push(order);
      localStorage.setItem('patagonia_users', JSON.stringify(users));
      
      // Actualizar usuario actual
      this.currentUser.orders = users[userIndex].orders;
      localStorage.setItem('patagonia_user', JSON.stringify(this.currentUser));
      
      return true;
    }
    return false;
  }

  getUserOrders() {
    return this.currentUser ? (this.currentUser.orders || []) : [];
  }

  // Gestión de direcciones
  addAddress(address) {
    if (!this.currentUser) return false;
    
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === this.currentUser.id);
    
    if (userIndex !== -1) {
      if (!users[userIndex].addresses) {
        users[userIndex].addresses = [];
      }
      
      const newAddress = {
        id: 'addr_' + Date.now(),
        ...address,
        isDefault: users[userIndex].addresses.length === 0
      };
      
      users[userIndex].addresses.push(newAddress);
      this.updateUser(users[userIndex]);
      
      return newAddress;
    }
    return false;
  }

  // Actualización de UI
  updateUIForLoggedUser() {
    const userIcon = document.querySelector('.btn[title="Mi cuenta"]');
    const loginModal = document.getElementById('loginModal');
    
    if (this.currentUser) {
      // Usuario logueado
      if (userIcon) {
        userIcon.innerHTML = `<i class="bi bi-person-check"></i>`;
        userIcon.title = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        userIcon.onclick = () => this.showUserMenu();
      }
    } else {
      // Usuario no logueado
      if (userIcon) {
        userIcon.innerHTML = `<i class="bi bi-person"></i>`;
        userIcon.title = 'Mi cuenta';
        userIcon.onclick = () => this.showLoginModal();
      }
    }
  }

  showUserMenu() {
    const menu = document.createElement('div');
    menu.className = 'user-menu-dropdown';
    menu.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      min-width: 200px;
      padding: 10px 0;
    `;
    
    menu.innerHTML = `
      <div class="px-3 py-2 border-bottom">
        <strong>${this.currentUser.firstName} ${this.currentUser.lastName}</strong><br>
        <small class="text-muted">${this.currentUser.email}</small>
      </div>
      <a href="mi-cuenta.html" class="dropdown-item px-3 py-2 d-block text-decoration-none">
        <i class="bi bi-person"></i> Mi cuenta
      </a>
      <a href="mis-pedidos.html" class="dropdown-item px-3 py-2 d-block text-decoration-none">
        <i class="bi bi-box"></i> Mis pedidos
      </a>
      <div class="dropdown-divider mx-3"></div>
      <button onclick="userManager.logout()" class="dropdown-item px-3 py-2 d-block w-100 border-0 bg-transparent text-start">
        <i class="bi bi-box-arrow-right"></i> Cerrar sesión
      </button>
    `;
    
    // Posicionar el menú
    const userIcon = document.querySelector('.btn[title*="' + this.currentUser.firstName + '"]');
    if (userIcon) {
      userIcon.style.position = 'relative';
      userIcon.appendChild(menu);
      
      // Cerrar menú al hacer clic fuera
      setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
          if (!menu.contains(e.target) && !userIcon.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
          }
        });
      }, 100);
    }
  }

  showLoginModal() {
    // Verificar si el modal ya existe
    let modal = document.getElementById('loginModal');
    if (!modal) {
      this.createLoginModal();
      modal = document.getElementById('loginModal');
    }
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
  }

  createLoginModal() {
    const modalHTML = `
      <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="loginModalLabel">Mi Cuenta</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <!-- Tabs -->
              <ul class="nav nav-tabs" id="authTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active" id="login-tab" data-bs-toggle="tab" data-bs-target="#login" type="button" role="tab">
                    Iniciar Sesión
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="register-tab" data-bs-toggle="tab" data-bs-target="#register" type="button" role="tab">
                    Registrarse
                  </button>
                </li>
              </ul>
              
              <div class="tab-content mt-3" id="authTabsContent">
                <!-- Login Form -->
                <div class="tab-pane fade show active" id="login" role="tabpanel">
                  <form id="loginForm">
                    <div class="mb-3">
                      <label for="loginEmail" class="form-label">Email</label>
                      <input type="email" class="form-control" id="loginEmail" required>
                    </div>
                    <div class="mb-3">
                      <label for="loginPassword" class="form-label">Contraseña</label>
                      <input type="password" class="form-control" id="loginPassword" required>
                    </div>
                    <div class="mb-3 form-check">
                      <input type="checkbox" class="form-check-input" id="rememberMe">
                      <label class="form-check-label" for="rememberMe">Recordarme</label>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Iniciar Sesión</button>
                  </form>
                </div>
                
                <!-- Register Form -->
                <div class="tab-pane fade" id="register" role="tabpanel">
                  <form id="registerForm">
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label for="registerFirstName" class="form-label">Nombre</label>
                        <input type="text" class="form-control" id="registerFirstName" required>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label for="registerLastName" class="form-label">Apellido</label>
                        <input type="text" class="form-control" id="registerLastName" required>
                      </div>
                    </div>
                    <div class="mb-3">
                      <label for="registerEmail" class="form-label">Email</label>
                      <input type="email" class="form-control" id="registerEmail" required>
                    </div>
                    <div class="mb-3">
                      <label for="registerPhone" class="form-label">Teléfono</label>
                      <input type="tel" class="form-control" id="registerPhone" required>
                    </div>
                    <div class="mb-3">
                      <label for="registerPassword" class="form-label">Contraseña</label>
                      <input type="password" class="form-control" id="registerPassword" required minlength="6">
                    </div>
                    <div class="mb-3">
                      <label for="confirmPassword" class="form-label">Confirmar Contraseña</label>
                      <input type="password" class="form-control" id="confirmPassword" required>
                    </div>
                    <div class="mb-3 form-check">
                      <input type="checkbox" class="form-check-input" id="acceptTerms" required>
                      <label class="form-check-label" for="acceptTerms">
                        Acepto los <a href="terminos-condiciones.html" target="_blank">términos y condiciones</a>
                      </label>
                    </div>
                    <button type="submit" class="btn btn-success w-100">Registrarse</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  setupEventListeners() {
    // Event listeners para formularios de login/registro
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'loginForm') {
        e.preventDefault();
        this.handleLogin(e.target);
      } else if (e.target.id === 'registerForm') {
        e.preventDefault();
        this.handleRegister(e.target);
      }
    });
  }

  async handleLogin(form) {
    const formData = new FormData(form);
    const email = formData.get('loginEmail') || document.getElementById('loginEmail').value;
    const password = formData.get('loginPassword') || document.getElementById('loginPassword').value;
    
    const result = await this.login(email, password);
    
    if (result.success) {
      const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
      modal.hide();
      form.reset();
    }
  }

  async handleRegister(form) {
    const formData = new FormData(form);
    const password = formData.get('registerPassword') || document.getElementById('registerPassword').value;
    const confirmPassword = formData.get('confirmPassword') || document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
      this.showNotification('Las contraseñas no coinciden', 'error');
      return;
    }
    
    const userData = {
      firstName: formData.get('registerFirstName') || document.getElementById('registerFirstName').value,
      lastName: formData.get('registerLastName') || document.getElementById('registerLastName').value,
      email: formData.get('registerEmail') || document.getElementById('registerEmail').value,
      phone: formData.get('registerPhone') || document.getElementById('registerPhone').value,
      password: password
    };
    
    const result = await this.register(userData);
    
    if (result.success) {
      const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
      modal.hide();
      form.reset();
    }
  }

  showNotification(message, type = 'info') {
    // Para errores de validación, usar un estilo más suave
    if (type === 'error' && (message.includes('inválido') || message.includes('debe tener'))) {
      // Mostrar error en consola y usar tipo 'warning' en lugar de 'error'
      console.warn('Validación:', message);
      type = 'warning';
    }
    
    // Reutilizar el sistema de notificaciones existente
    if (typeof store !== 'undefined' && store.mostrarNotificacion) {
      store.mostrarNotificacion(message, type);
    } else {
      // Fallback mejorado con colores y emojis
      const styles = {
        error: 'color: #dc3545; font-weight: bold; background: #f8d7da; padding: 4px 8px; border-radius: 4px;',
        success: 'color: #155724; font-weight: bold; background: #d4edda; padding: 4px 8px; border-radius: 4px;',
        warning: 'color: #856404; font-weight: bold; background: #fff3cd; padding: 4px 8px; border-radius: 4px;',
        info: 'color: #0c5460; font-weight: bold; background: #d1ecf1; padding: 4px 8px; border-radius: 4px;'
      };
      
      const icons = { error: '❌', success: '✅', warning: '⚠️', info: 'ℹ️' };
      
      if (type === 'error') {
        console.error(`%c${icons.error} USER MANAGER ERROR`, styles.error, message);
      } else {
        console.log(`%c${icons[type] || 'ℹ️'} USER MANAGER ${type.toUpperCase()}`, styles[type] || styles.info, message);
      }
    }
  }

  // Verificar si el usuario está logueado
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Obtener usuario actual
  getCurrentUser() {
    return this.currentUser;
  }

  // Requerir login para ciertas acciones
  requireLogin(action) {
    if (!this.isLoggedIn()) {
      this.showNotification('Debes iniciar sesión para continuar', 'warning');
      this.showLoginModal();
      return false;
    }
    return true;
  }
}

// CSS para el sistema de usuarios
const userSystemStyles = document.createElement('style');
userSystemStyles.textContent = `
  .user-menu-dropdown .dropdown-item {
    color: #333;
    transition: background-color 0.2s;
  }
  
  .user-menu-dropdown .dropdown-item:hover {
    background-color: #f8f9fa;
  }
  
  .user-menu-dropdown .dropdown-divider {
    height: 1px;
    background-color: #dee2e6;
    border: 0;
    margin: 0.5rem 0;
  }
  
  #authTabs .nav-link {
    color: #3b5d50;
    border-bottom: 2px solid transparent;
  }
  
  #authTabs .nav-link.active {
    color: #3b5d50;
    border-bottom-color: #3b5d50;
    background: transparent;
  }
  
  .form-control:focus {
    border-color: #3b5d50;
    box-shadow: 0 0 0 0.2rem rgba(59, 93, 80, 0.25);
  }
  
  .btn-primary {
    background-color: #3b5d50;
    border-color: #3b5d50;
  }
  
  .btn-primary:hover {
    background-color: #2a4538;
    border-color: #2a4538;
  }
  
  .btn-success {
    background-color: #f4a259;
    border-color: #f4a259;
  }
  
  .btn-success:hover {
    background-color: #b67c3a;
    border-color: #b67c3a;
  }
`;
document.head.appendChild(userSystemStyles);

// Inicializar el gestor de usuarios
let userManager;
document.addEventListener('DOMContentLoaded', () => {
  userManager = new UserManager();
});

// Exportar para uso global
window.UserManager = UserManager;