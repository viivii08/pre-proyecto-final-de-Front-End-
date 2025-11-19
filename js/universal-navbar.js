/**
 * Sistema Universal de Navegación - Patagonia Style
 * Navbar completo con menú de usuario fijo y todas las funcionalidades
 */

class UniversalNavbar {
  constructor() {
    this.currentUser = null;
    this.cartCount = 0;
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  getCurrentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    return path;
  }

  init() {
    this.loadCurrentUser();
    this.renderNavbar();
    this.setupEventListeners();
    this.syncCartFromLocalStorage();
    this.updateCartCounter();
  }

  syncCartFromLocalStorage() {
    try {
      const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
      this.cartCount = carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
    } catch (error) {
      console.error('Error sincronizando carrito:', error);
      this.cartCount = 0;
    }
  }

  loadCurrentUser() {
    try {
      const claves = ['currentUser', 'patagonia_user'];
      this.currentUser = null; // Resetear primero
      
      for (let clave of claves) {
        const userData = localStorage.getItem(clave);
        if (userData && userData !== 'null') {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && (parsedUser.email || parsedUser.id)) {
            this.currentUser = parsedUser;
            break;
          }
        }
      }
    } catch (error) {
      console.warn('Error cargando usuario:', error);
      this.currentUser = null;
    }
  }

  renderNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;

    // Determinar si mostrar búsqueda - en todas las páginas
    const showSearch = true;
    
    navbarContainer.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-dark fixed-top" 
           style="background: linear-gradient(90deg, #1f3c5a, #3b5d50) !important; 
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1); min-height: 50px; padding: 4px 0;">
        <div class="container-fluid px-3">
          <a class="navbar-brand d-flex align-items-center" href="index.html" style="margin-right: 2rem;">
            <img src="pages/logo sin fondo (1).png" alt="Logo" width="24" height="24" class="me-2">
            <span style="font-weight: 600; font-size: 0.95rem; color: white;">Patagonia Style</span>
          </a>

          <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                  aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation"
                  style="padding: 2px 4px; font-size: 0.9rem;">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link ${this.currentPage === 'index.html' ? 'active' : ''}" href="index.html"
                   style="color: #fdfdfd; font-size: 0.85rem; font-weight: 500; padding: 6px 10px;">
                  Inicio
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${this.currentPage === 'tienda.html' ? 'active' : ''}" href="tienda.html"
                   style="color: #fdfdfd; font-size: 0.85rem; font-weight: 500; padding: 6px 10px;">
                  Tienda
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${this.currentPage === 'portafolio.html' ? 'active' : ''}" href="portafolio.html"
                   style="color: #fdfdfd; font-size: 0.85rem; font-weight: 500; padding: 6px 10px;">
                  Portafolio
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${this.currentPage === 'contacto.html' ? 'active' : ''}" href="contacto.html"
                   style="color: #fdfdfd; font-size: 0.85rem; font-weight: 500; padding: 6px 10px;">
                  Contacto
                </a>
              </li>
            </ul>

            <div class="d-flex align-items-center">
              ${showSearch ? this.renderSearchBar() : ''}
              
              <div id="navbarActions" style="margin-right: 8px;">
                ${this.renderUserActions()}
              </div>

              <a href="#" class="btn btn-outline-light position-relative" title="Carrito"
                 data-bs-toggle="modal" data-bs-target="#cartModal"
                 style="border: 1px solid rgba(255,255,255,0.4); padding: 4px 7px; border-radius: 12px; font-size: 0.85rem;">
                <i class="bi bi-cart3" style="font-size:0.85rem;"></i>
                <span id="cart-count" class="position-absolute top-0 start-100 translate-middle badge rounded-pill" 
                      style="display: none; 
                             font-size: 0.65rem; 
                             font-weight: bold;
                             background: #ff4444;
                             color: white;
                             border: 2px solid white;
                             min-width: 20px;
                             height: 20px;
                             line-height: 16px;
                             text-align: center;
                             box-shadow: 0 2px 4px rgba(0,0,0,0.3);">0</span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    `;

    this.addSimpleNavbarStyles();
  }

  renderSearchBar() {
    return `
      <form class="d-flex me-3" role="search" onsubmit="return universalNavbar.handleSearch(event)">
        <div class="input-group" style="width: 220px;">
          <input class="form-control" type="search" placeholder="Buscar productos..."
                 aria-label="Buscar" id="navbar-search"
                 style="border: 1px solid rgba(255,255,255,0.3); 
                        background: rgba(255,255,255,0.15); 
                        color: white; 
                        font-size: 0.9rem;
                        border-radius: 20px 0 0 20px;
                        padding: 8px 12px;
                        height: 38px;">
          <button class="btn btn-outline-light" type="submit" 
                  style="border: 1px solid rgba(255,255,255,0.3); 
                         border-left: none;
                         background: rgba(255,255,255,0.1);
                         color: white;
                         border-radius: 0 20px 20px 0;
                         padding: 8px 12px;
                         height: 38px;
                         transition: all 0.3s ease;">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </form>
    `;
  }

  renderUserActions() {
    if (this.currentUser) {
      return this.renderUserMenuFixed();
    } else {
      return `
        <button type="button" class="btn btn-outline-light me-2" data-bs-toggle="modal" data-bs-target="#loginModal"
                style="border: 1px solid rgba(255,255,255,0.4); padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">
          <i class="bi bi-person" style="margin-right: 4px;"></i>Entrar
        </button>
      `;
    }
  }

  renderUserMenuFixed() {
    const userName = this.currentUser.firstName || this.currentUser.name || 'Usuario';
    const userEmail = this.currentUser.email || '';

    return `
      <div class="dropdown">
        <button class="btn dropdown-toggle d-flex align-items-center" type="button" id="userDropdown" 
                data-bs-toggle="dropdown" aria-expanded="false"
                style="background: rgba(255,255,255,0.1); 
                       border: 1px solid rgba(255,255,255,0.3); 
                       color: white; 
                       padding: 4px 8px; 
                       border-radius: 12px; 
                       font-size: 0.8rem;">
          <i class="bi bi-person-circle me-1" style="color: white;"></i>
          <span style="color: white;">${userName}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown" 
            style="background: linear-gradient(135deg, #3b5d50, #1f3c5a); 
                   border: none; 
                   border-radius: 8px; 
                   box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                   padding: 8px 0;
                   min-width: 180px;">
          <li>
            <a class="dropdown-item d-flex align-items-center" href="mi-cuenta.html"
               style="color: white !important; 
                      padding: 8px 16px; 
                      font-size: 0.9rem; 
                      transition: all 0.2s ease;">
              <i class="bi bi-person-circle me-2" style="color: white !important;"></i>
              <span style="color: white !important;">Mi cuenta</span>
            </a>
          </li>
          <li>
            <a class="dropdown-item d-flex align-items-center" href="mis-pedidos.html"
               style="color: white !important; 
                      padding: 8px 16px; 
                      font-size: 0.9rem; 
                      transition: all 0.2s ease;">
              <i class="bi bi-box-seam me-2" style="color: white !important;"></i>
              <span style="color: white !important;">Mis pedidos</span>
            </a>
          </li>
          <li><hr class="dropdown-divider" style="border-color: rgba(255,255,255,0.2);"></li>
          <li>
            <a class="dropdown-item d-flex align-items-center" href="#" onclick="logoutUser()"
               style="color: #ff6b6b !important; 
                      padding: 8px 16px; 
                      font-size: 0.9rem; 
                      transition: all 0.2s ease;">
              <i class="bi bi-box-arrow-right me-2" style="color: #ff6b6b !important;"></i>
              <span style="color: #ff6b6b !important;">Cerrar sesión</span>
            </a>
          </li>
        </ul>
      </div>
    `;
  }

  addSimpleNavbarStyles() {
    const existingStyles = document.getElementById('navbar-simple-styles');
    if (existingStyles) existingStyles.remove();

    const style = document.createElement('style');
    style.id = 'navbar-simple-styles';
    style.textContent = `
      /* Estilos del navbar original */
      .navbar a:hover { 
        color: #b67c3a !important; 
      }
      
      /* Estilos mejorados para la búsqueda */
      #navbar-search::placeholder {
        color: rgba(255,255,255,0.7);
        font-style: italic;
      }
      
      #navbar-search:focus {
        background: rgba(255,255,255,0.2) !important;
        border-color: rgba(255,255,255,0.5) !important;
        box-shadow: 0 0 0 0.2rem rgba(255,255,255,0.25) !important;
        color: white !important;
        outline: none !important;
      }
      
      .input-group .btn:hover {
        background: rgba(255,255,255,0.2) !important;
        border-color: rgba(255,255,255,0.5) !important;
        transform: scale(1.05);
        transition: all 0.3s ease;
      }
      
      .btn-outline-light:hover {
        color: #1f3c5a !important;
        background-color: rgba(255,255,255,0.9) !important;
        border-color: rgba(255,255,255,0.9) !important;
      }
      
      /* Estilos específicos para el dropdown de usuario */
      .dropdown-toggle:after {
        margin-left: 8px !important;
        color: white !important;
      }
      
      .dropdown-menu.show {
        display: block !important;
        background: linear-gradient(135deg, #3b5d50, #1f3c5a) !important;
        border: none !important;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
      }
      
      .dropdown-item {
        color: white !important;
        background: transparent !important;
        transition: all 0.2s ease !important;
      }
      
      /* Estilos mejorados para el contador del carrito */
      #cart-count {
        background: #ff4444 !important;
        color: white !important;
        font-weight: bold !important;
        font-size: 0.65rem !important;
        border: 2px solid white !important;
        min-width: 20px !important;
        height: 20px !important;
        line-height: 16px !important;
        text-align: center !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
        z-index: 1050 !important;
      }
      
      /* Animación del contador cuando se actualiza */
      @keyframes counterPulse {
        0% { transform: translateX(-50%) translateY(-50%) scale(1); }
        50% { transform: translateX(-50%) translateY(-50%) scale(1.2); }
        100% { transform: translateX(-50%) translateY(-50%) scale(1); }
      }
      
      #cart-count.updated {
        animation: counterPulse 0.3s ease-in-out;
      }
      
      .dropdown-item:hover,
      .dropdown-item:focus {
        background: rgba(255,255,255,0.1) !important;
        color: white !important;
      }
      
      .dropdown-item i {
        color: white !important;
      }
      
      .dropdown-item:hover i {
        color: white !important;
      }
      
      /* Específico para el item de cerrar sesión */
      .dropdown-item[onclick*="logoutUser"] {
        color: #ff6b6b !important;
      }
      
      .dropdown-item[onclick*="logoutUser"] i {
        color: #ff6b6b !important;
      }
      
      .dropdown-item[onclick*="logoutUser"]:hover {
        background: rgba(255,107,107,0.1) !important;
        color: #ff6b6b !important;
      }
      
      .dropdown-item[onclick*="logoutUser"]:hover i {
        color: #ff6b6b !important;
      }
      
      /* Responsive para la búsqueda */
      @media (max-width: 991px) {
        .navbar-collapse .d-flex {
          flex-direction: column;
          align-items: stretch !important;
          gap: 10px;
          margin-top: 15px;
        }
        
        .input-group {
          width: 100% !important;
        }
      }
      
      @media (max-width: 576px) {
        .input-group {
          width: 100% !important;
        }
        
        #navbar-search {
          font-size: 0.85rem !important;
          padding: 6px 10px !important;
        }
      }
      
      /* Espaciado del body para navbar fijo */
      body {
        padding-top: 70px;
      }
    `;
    
    document.head.appendChild(style);
  }

  setupEventListeners() {
    // Escuchar eventos de login/logout
    document.addEventListener('userLoggedIn', (e) => {
      this.currentUser = e.detail;
      this.renderNavbar();
    });

    document.addEventListener('userLoggedOut', () => {
      this.currentUser = null;
      this.renderNavbar();
    });

    // Escuchar eventos del carrito
    document.addEventListener('cartUpdated', (e) => {
      this.cartCount = e.detail.count || 0;
      this.updateCartCounter();
    });
    
    // Escuchar cambios en localStorage para sincronizar entre pestañas
    window.addEventListener('storage', (e) => {
      if (e.key === 'patagonia_user' || e.key === 'currentUser') {
        this.loadCurrentUser();
        this.renderNavbar();
      }
    });
  }

  updateCartCounter() {
    const counter = document.getElementById('cart-count');
    if (counter) {
      const oldCount = parseInt(counter.textContent) || 0;
      
      if (this.cartCount > 0) {
        counter.textContent = this.cartCount;
        counter.style.display = 'inline-block';
        
        // Animar si el contador cambió
        if (oldCount !== this.cartCount) {
          counter.classList.add('updated');
          setTimeout(() => {
            counter.classList.remove('updated');
          }, 300);
        }
      } else {
        counter.style.display = 'none';
      }
    }
  }

  // Función pública para actualizar el contador desde otros archivos
  refreshCartCounter() {
    this.syncCartFromLocalStorage();
    this.updateCartCounter();
  }

  handleSearch(event) {
    event.preventDefault();
    const searchTerm = document.getElementById('navbar-search').value.trim();
    if (searchTerm) {
      // Redirigir a la tienda con el término de búsqueda
      window.location.href = `tienda.html?search=${encodeURIComponent(searchTerm)}`;
    }
    return false;
  }

  logout() {
    logoutUser();
  }
}

// Función global para logout - Compatibilidad
function logoutUser() {
  // Limpiar localStorage siempre
  localStorage.removeItem('patagonia_user');
  localStorage.removeItem('currentUser');
  
  // Si tenemos userManager, usarlo
  if (typeof userManager !== 'undefined') {
    userManager.currentUser = null;
  }
  
  // Si tenemos navbar universal, actualizarlo inmediatamente
  if (typeof universalNavbar !== 'undefined') {
    universalNavbar.currentUser = null;
    universalNavbar.renderNavbar();
  }
  
  // Disparar evento personalizado para otros componentes
  const event = new CustomEvent('userLoggedOut', {
    detail: { timestamp: new Date().toISOString() }
  });
  document.dispatchEvent(event);
  
  // Mostrar notificación
  if (typeof store !== 'undefined' && store.mostrarNotificacion) {
    store.mostrarNotificacion('Sesión cerrada exitosamente', 'info');
  } else {
    console.log('%c✅ NAVBAR: Sesión cerrada exitosamente', 'color: #28a745; font-weight: bold; background: #d4edda; padding: 4px 8px; border-radius: 4px;');
  }
  
  // Redirigir a inicio si está en página protegida
  const currentPath = window.location.pathname;
  if (currentPath.includes('mi-cuenta') || 
      currentPath.includes('mis-pedidos')) {
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
}

// Función global para login - Compatibilidad
function loginUser(userData) {
  if (typeof userManager !== 'undefined') {
    // Guardar usuario y disparar evento
    localStorage.setItem('patagonia_user', JSON.stringify(userData));
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    const event = new CustomEvent('userLoggedIn', {
      detail: userData
    });
    document.dispatchEvent(event);
    
    return true;
  }
  return false;
}

// Verificar estado de login
function isUserLoggedIn() {
  return localStorage.getItem('patagonia_user') !== null || 
         localStorage.getItem('currentUser') !== null;
}

// Obtener usuario actual
function getCurrentUser() {
  let user = localStorage.getItem('patagonia_user');
  if (!user) {
    user = localStorage.getItem('currentUser');
  }
  return user ? JSON.parse(user) : null;
}

// Inicializar el navbar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('navbar-container')) {
    window.universalNavbar = new UniversalNavbar();
  }
});

// También inicializar si el script se carga después del DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('navbar-container') && !window.universalNavbar) {
      window.universalNavbar = new UniversalNavbar();
    }
  });
} else {
  if (document.getElementById('navbar-container') && !window.universalNavbar) {
    window.universalNavbar = new UniversalNavbar();
  }
}