// Sistema de Navegación Universal - Patagonia Style
// Componente reutilizable para todas las páginas

class UniversalNavbar {
  constructor() {
    this.currentUser = null;
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
  }

  loadCurrentUser() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  renderNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;

    // Determinar si mostrar búsqueda
    const showSearch = ['tienda.html', 'portafolio.html'].includes(this.currentPage);
    
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

              <a href="carrito.html" class="btn btn-outline-light position-relative" title="Carrito"
                 style="border: 1px solid rgba(255,255,255,0.4); padding: 4px 7px; border-radius: 12px; font-size: 0.85rem;">
                <i class="bi bi-cart3" style="font-size:0.85rem;"></i>
                <span id="cart-count" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
                      style="display:none; font-size: 0.65rem; padding: 2px 4px;">0</span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    `;

    // Actualizar contador del carrito
    this.updateCartCounter();
  }

  renderSearchBar() {
    return `
      <form class="d-flex me-2" role="search" onsubmit="return universalNavbar.handleSearch(event)">
        <div class="input-group" style="width: 180px;">
          <input class="form-control form-control-sm" type="search" placeholder="Buscar productos..." 
                 style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); 
                        color: white; font-size: 0.8rem; height: 28px; padding: 4px 8px;"
                 id="navbar-search">
          <button class="btn btn-outline-light btn-sm" type="submit" 
                  style="border-color: rgba(255,255,255,0.3); font-size: 0.8rem; padding: 2px 6px; height: 28px;">
            <i class="bi bi-search" style="font-size: 0.8rem;"></i>
          </button>
        </div>
      </form>
    `;
  }

  renderUserActions() {
    if (this.currentUser) {
      return `
        <div class="dropdown">
          <button class="btn btn-outline-light dropdown-toggle" type="button" 
                  data-bs-toggle="dropdown" aria-expanded="false"
                  style="border: 1px solid rgba(255,255,255,0.4); background: rgba(255,255,255,0.1); 
                         border-radius: 12px; padding: 3px 8px; font-weight: 500; font-size: 0.8rem;">
            <i class="bi bi-person-circle me-1" style="font-size: 0.8rem;"></i>
            ${this.currentUser.name || this.currentUser.email.split('@')[0]}
          </button>
          <ul class="dropdown-menu dropdown-menu-end" 
              style="border: 1px solid #ddd; border-radius: 10px; padding: 8px 0; margin-top: 5px; 
                     box-shadow: 0 5px 15px rgba(0,0,0,0.2); min-width: 200px; background: white;">
            <li style="padding: 8px 15px; border-bottom: 1px solid #eee;">
              <div style="color: #666; font-size: 0.8rem;">Logueado como:</div>
              <div style="color: #333; font-weight: bold; font-size: 0.9rem;">${this.currentUser.name || 'Usuario'}</div>
            </li>
            <li>
              <a href="mi-cuenta.html" class="dropdown-item"
                 style="display: block !important; padding: 12px 16px !important; color: #333333 !important; 
                        text-decoration: none !important; font-size: 0.9rem !important; font-weight: 500 !important; 
                        border: none !important; background: transparent !important;">
                <i class="bi bi-person" style="color: #1f3c5a !important; font-size: 0.9rem; margin-right: 8px;"></i>
                <span style="color: #333333 !important; font-size: 0.9rem !important; font-weight: 500 !important;">Mi cuenta</span>
              </a>
            </li>
            <li>
              <a href="mis-pedidos.html" class="dropdown-item"
                 style="display: block !important; padding: 12px 16px !important; color: #333333 !important; 
                        text-decoration: none !important; font-size: 0.9rem !important; font-weight: 500 !important; 
                        border: none !important; background: transparent !important;">
                <i class="bi bi-box-seam" style="color: #1f3c5a !important; font-size: 0.9rem; margin-right: 8px;"></i>
                <span style="color: #333333 !important; font-size: 0.9rem !important; font-weight: 500 !important;">Mis pedidos</span>
              </a>
            </li>
            <li>
              <a href="mis-favoritos.html" class="dropdown-item"
                 style="display: block !important; padding: 12px 16px !important; color: #333333 !important; 
                        text-decoration: none !important; font-size: 0.9rem !important; font-weight: 500 !important; 
                        border: none !important; background: transparent !important;">
                <i class="bi bi-heart" style="color: #1f3c5a !important; font-size: 0.9rem; margin-right: 8px;"></i>
                <span style="color: #333333 !important; font-size: 0.9rem !important; font-weight: 500 !important;">Favoritos</span>
              </a>
            </li>
            <li style="border-top: 1px solid #eee; margin-top: 5px;">
              <a href="#" onclick="universalNavbar.logout()" class="dropdown-item text-danger"
                 style="display: block !important; padding: 12px 16px !important; color: #dc3545 !important; 
                        text-decoration: none !important; font-size: 0.9rem !important; font-weight: 500 !important; 
                        border: none !important; background: transparent !important;">
                <i class="bi bi-box-arrow-right" style="color: #dc3545 !important; font-size: 0.9rem; margin-right: 8px;"></i>
                <span style="color: #dc3545 !important; font-size: 0.9rem !important; font-weight: 500 !important;">Cerrar sesión</span>
              </a>
            </li>
          </ul>
        </div>
      `;
    } else {
      return `
        <button type="button" class="btn btn-outline-light me-2" data-bs-toggle="modal" data-bs-target="#loginModal"
                style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.4); background: rgba(255,255,255,0.1);
                       padding: 3px 8px; font-size: 0.8rem;">
          <i class="bi bi-person me-1" style="font-size: 0.75rem;"></i>Ingresar
        </button>
        <button type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#registerModal"
                style="border-radius: 12px; background: #b67c3a; border: none; font-weight: 600;
                       padding: 3px 8px; font-size: 0.8rem;">
          <i class="bi bi-person-plus me-1" style="font-size: 0.75rem;"></i>Registro
        </button>
      `;
    }
  }

  setupEventListeners() {
    // Escuchar cambios en el estado del usuario
    window.addEventListener('storage', (e) => {
      if (e.key === 'currentUser') {
        this.loadCurrentUser();
        this.updateUserActions();
      }
    });

    // Escuchar login exitoso desde modals
    document.addEventListener('userLoggedIn', () => {
      this.loadCurrentUser();
      this.updateUserActions();
    });
  }

  updateUserActions() {
    const navbarActions = document.getElementById('navbarActions');
    if (navbarActions) {
      navbarActions.innerHTML = this.renderUserActions();
    }
  }

  updateCartCounter() {
    setTimeout(() => {
      if (typeof store !== 'undefined' && store.actualizarContadorCarrito) {
        store.actualizarContadorCarrito();
      } else {
        // Fallback manual
        const carrito = JSON.parse(localStorage.getItem('patagonia_carrito') || localStorage.getItem('carrito')) || [];
        const total = carrito.reduce((acc, prod) => acc + (prod.cantidad || prod.quantity || 1), 0);
        const badge = document.getElementById('cart-count');
        if (badge) {
          badge.textContent = total;
          badge.style.display = total > 0 ? 'inline-block' : 'none';
        }
      }
    }, 100);
  }

  handleSearch(event) {
    event.preventDefault();
    const searchTerm = document.getElementById('navbar-search').value.trim();
    if (searchTerm) {
      if (this.currentPage === 'tienda.html') {
        // Ya estamos en tienda, buscar directamente
        if (typeof store !== 'undefined' && store.buscarProductos) {
          const productos = store.buscarProductos(searchTerm);
          store.renderizarProductos(productos);
        }
      } else {
        // Redirigir a tienda con búsqueda
        window.location.href = `tienda.html?search=${encodeURIComponent(searchTerm)}`;
      }
    }
    return false;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    this.updateUserActions();
    
    // Redirigir a inicio si estamos en páginas que requieren login
    const protectedPages = ['mi-cuenta.html', 'mis-pedidos.html', 'mis-favoritos.html'];
    if (protectedPages.includes(this.currentPage)) {
      window.location.href = 'index.html';
    } else {
      window.location.reload();
    }
  }

  // Método para simular login (para testing)
  simulateLogin(userData) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    this.loadCurrentUser();
    this.updateUserActions();
    
    // Disparar evento personalizado
    document.dispatchEvent(new CustomEvent('userLoggedIn'));
  }
}

// Crear instancia global
let universalNavbar;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  universalNavbar = new UniversalNavbar();
});

// CSS adicional para el navbar universal
const navbarStyles = `
<style>
/* Navbar Universal Styles */
.navbar {
  background: linear-gradient(90deg, #1f3c5a, #3b5d50) !important;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}
.navbar-brand { 
  color: #fff !important; 
  font-family: 'Raleway', sans-serif; 
  font-weight: 700; 
  letter-spacing: 1px; 
}
.navbar a { 
  color: #fdfdfd !important; 
  font-weight: 500; 
  transition: color 0.3s; 
}
.navbar a:hover { 
  color: #b67c3a !important; 
}

/* Dropdown Styles */
.dropdown-menu {
  background-color: white !important;
  border: 1px solid #ddd !important;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2) !important;
  min-width: 200px !important;
}
.dropdown-menu .dropdown-item {
  color: #333333 !important;
  background-color: transparent !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
  padding: 12px 16px !important;
  border: none !important;
  text-decoration: none !important;
}
.dropdown-menu .dropdown-item:hover,
.dropdown-menu .dropdown-item:focus,
.dropdown-menu .dropdown-item:active,
.dropdown-menu .dropdown-item.active {
  color: #ffffff !important;
  background-color: #1f3c5a !important;
}
.dropdown-menu .dropdown-item span {
  color: #333333 !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
  display: inline !important;
  visibility: visible !important;
}
.dropdown-menu .dropdown-item:hover span,
.dropdown-menu .dropdown-item:focus span,
.dropdown-menu .dropdown-item:active span,
.dropdown-menu .dropdown-item.active span {
  color: #ffffff !important;
}
.dropdown-menu .dropdown-item.text-danger {
  color: #dc3545 !important;
}
.dropdown-menu .dropdown-item.text-danger span {
  color: #dc3545 !important;
}
.dropdown-menu .dropdown-item.text-danger:hover,
.dropdown-menu .dropdown-item.text-danger:focus,
.dropdown-menu .dropdown-item.text-danger:active {
  color: #ffffff !important;
  background-color: #dc3545 !important;
}
.dropdown-menu .dropdown-item.text-danger:hover span,
.dropdown-menu .dropdown-item.text-danger:focus span,
.dropdown-menu .dropdown-item.text-danger:active span {
  color: #ffffff !important;
}
/* Bootstrap override específico */
.navbar .dropdown-menu .dropdown-item {
  color: #333333 !important;
}
.navbar .dropdown-menu .dropdown-item:not(.text-danger) {
  color: #333333 !important;
}
.navbar .dropdown-menu .dropdown-item:not(.text-danger):hover {
  color: #1f3c5a !important;
}

/* Body padding para navbar fixed */
body {
  padding-top: 50px;
}
</style>
`;

// Inyectar estilos
document.head.insertAdjacentHTML('beforeend', navbarStyles);

// Navbar compacto actualizado - v2.0