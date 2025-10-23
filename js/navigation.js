// Sistema de Navegación Profesional - Patagonia Style
class NavigationComponent {
  constructor() {
    this.isInitialized = false;
  }

  // Renderizar la navbar con espaciado profesional
  renderNavbar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isHomePage = currentPage === 'index.html' || currentPage === '';
    
    return `
      <nav class="navbar navbar-expand-lg navbar-dark fixed-top professional-navbar">
        <div class="container-fluid px-3">
          <!-- Brand Section -->
          <div class="navbar-brand-section">
            <a class="navbar-brand d-flex align-items-center" href="index.html">
              <img src="pages/logo sin fondo (1).png" alt="Patagonia Style" height="32" class="me-2">
              <span class="brand-text">Patagonia Style</span>
            </a>
          </div>
          
          <!-- Mobile Toggle -->
          <button class="navbar-toggler custom-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" 
                  aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          
          <!-- Main Navigation Content -->
          <div class="collapse navbar-collapse" id="navbarContent">
            <!-- Navigation Links -->
            <div class="navbar-nav-section">
              <ul class="navbar-nav">
                <li class="nav-item">
                  <a class="nav-link ${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}" href="index.html">
                    <i class="bi bi-house-door me-2"></i>Inicio
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link ${currentPage === 'tienda.html' ? 'active' : ''}" href="tienda.html">
                    <i class="bi bi-shop me-2"></i>Tienda
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link ${currentPage === 'portafolio.html' ? 'active' : ''}" href="portafolio.html">
                    <i class="bi bi-collection me-2"></i>Portafolio
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link ${currentPage === 'contacto.html' ? 'active' : ''}" href="contacto.html">
                    <i class="bi bi-envelope me-2"></i>Contacto
                  </a>
                </li>
              </ul>
            </div>
            
            <!-- Right Side Actions -->
            <div class="navbar-actions-section ${isHomePage ? 'home-layout' : 'default-layout'}">
              <!-- Search Bar (hidden on home page) -->
              <div class="search-container ${isHomePage ? 'd-none' : ''}">
                <form class="search-form" role="search">
                  <div class="input-group">
                    <input class="form-control search-input" type="search" placeholder="Buscar productos..." aria-label="Buscar">
                    <button class="btn search-btn" type="submit">
                      <i class="bi bi-search"></i>
                    </button>
                  </div>
                </form>
              </div>
              
              <!-- User Actions -->
              <div class="user-actions">
                <!-- User Menu (when logged in) -->
                <div class="user-menu" id="userMenu" style="display: none;">
                  <div class="dropdown">
                    <button class="btn user-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <div class="user-avatar">
                        <i class="bi bi-person-circle"></i>
                      </div>
                      <span class="user-name" id="userName">Usuario</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end user-dropdown">
                      <li class="dropdown-header">
                        <div class="user-info">
                          <div class="user-avatar-large">
                            <i class="bi bi-person-circle"></i>
                          </div>
                          <div class="user-details">
                            <strong id="userFullName">Usuario</strong>
                            <small class="text-muted" id="userEmail">email@ejemplo.com</small>
                          </div>
                        </div>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-person-circle me-2"></i>Mi Perfil</a></li>
                      <li><a class="dropdown-item" href="#"><i class="bi bi-box-seam me-2"></i>Mis Pedidos</a></li>
                      <li><a class="dropdown-item" href="tienda.html"><i class="bi bi-shop me-2"></i>Tienda</a></li>
                      <li><hr class="dropdown-divider"></li>
                      <li><a class="dropdown-item logout-btn" href="#"><i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión</a></li>
                    </ul>
                  </div>
                </div>
                
                <!-- Auth Buttons (when not logged in) - Highlighted on home page -->
                <div class="auth-buttons ${isHomePage ? 'featured-auth' : ''}" id="authButtons">
                  <button class="btn auth-btn login-btn" data-bs-toggle="modal" data-bs-target="#loginModal">
                    <i class="bi bi-box-arrow-in-right me-2"></i>
                    <span class="btn-text">Iniciar Sesión</span>
                  </button>
                  <button class="btn auth-btn register-btn" data-bs-toggle="modal" data-bs-target="#registerModal">
                    <i class="bi bi-person-plus me-2"></i>
                    <span class="btn-text">Registrarse</span>
                  </button>
                </div>
              </div>
              
              <!-- Shopping Actions -->
              <div class="shopping-actions">
                <!-- Favorites -->
                <a href="mis-favoritos.html" class="btn action-btn favorites-btn" title="Mis Favoritos">
                  <i class="bi bi-heart"></i>
                  <span id="favoritesCount" class="action-badge" style="display:none;">0</span>
                </a>
                
                <!-- Cart -->
                <a href="carrito.html" class="btn action-btn cart-btn" title="Carrito de Compras">
                  <i class="bi bi-cart3"></i>
                  <span id="cartCount" class="action-badge" style="display:none;">0</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <!-- Navbar Spacer -->
      <div class="navbar-spacer"></div>
    `;
  }

  // Estilos CSS profesionales
  getNavbarStyles() {
    return `
      <style>
        /* Professional Navbar Base */
        .professional-navbar {
          background: linear-gradient(90deg, #1f3c5a, #3b5d50) !important;
          box-shadow: 0 2px 20px rgba(0,0,0,0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          padding: 0;
          min-height: 55px;
          z-index: 1050;
        }
        
        .navbar-spacer {
          height: 55px;
          display: block;
        }
        
        @media (max-width: 992px) {
          .navbar-spacer {
            height: 60px;
          }
        }
        
        @media (max-width: 768px) {
          .navbar-spacer {
            height: 50px;
          }
        }
        
        /* Container Layout */
        .professional-navbar .container-fluid {
          display: grid;
          grid-template-columns: 250px 1fr;
          align-items: center;
          min-height: 55px;
          max-width: 1600px;
          margin: 0 auto;
          gap: 20px;
        }
        
        /* Brand Section */
        .navbar-brand-section {
          display: flex;
          align-items: center;
        }
        
        .navbar-brand {
          font-family: 'Raleway', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          color: white !important;
          text-decoration: none;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }
        
        .navbar-brand:hover {
          color: #b67c3a !important;
          transform: scale(1.02);
        }
        
        .brand-text {
          letter-spacing: 1px;
        }
        
        /* Navigation Content Layout */
        .navbar-collapse {
          display: grid !important;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 20px;
        }
        
        /* Navigation Links Section */
        .navbar-nav-section {
          display: flex;
          justify-content: center;
        }
        
        .navbar-nav {
          display: flex;
          gap: 15px;
          margin: 0;
          align-items: center;
        }
        
        .nav-item {
          margin: 0;
        }
        
        .nav-link {
          color: rgba(255,255,255,0.9) !important;
          font-weight: 500;
          font-size: 0.85rem;
          padding: 6px 12px !important;
          border-radius: 20px;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          white-space: nowrap;
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        
        .nav-link:hover,
        .nav-link.active {
          color: white !important;
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }
        
        .nav-link.active {
          background: rgba(182, 124, 58, 0.3);
          border-color: rgba(182, 124, 58, 0.6);
        }
        
        /* Right Actions Section */
        .navbar-actions-section {
          display: grid;
          align-items: center;
          gap: 12px;
          justify-items: end;
        }
        
        /* Default layout (with search) */
        .navbar-actions-section.default-layout {
          grid-template-columns: 180px auto auto;
        }
        
        /* Home layout (no search, featured auth buttons) */
        .navbar-actions-section.home-layout {
          grid-template-columns: auto auto;
          justify-content: end;
          gap: 15px;
        }
        
        /* Search Container */
        .search-container {
          justify-self: start;
        }
        
        .search-form {
          width: 180px;
        }
        
        .search-input {
          background: rgba(255,255,255,0.12) !important;
          border: 2px solid rgba(255,255,255,0.2) !important;
          border-radius: 20px 0 0 20px !important;
          color: white !important;
          padding: 6px 12px;
          font-size: 0.8rem;
          height: 32px;
        }
        
        .search-input::placeholder {
          color: rgba(255,255,255,0.7) !important;
        }
        
        .search-input:focus {
          background: rgba(255,255,255,0.2) !important;
          border-color: #b67c3a !important;
          color: white !important;
          box-shadow: 0 0 0 0.2rem rgba(182, 124, 58, 0.25) !important;
        }
        
        .search-btn {
          background: rgba(255,255,255,0.15) !important;
          border: 2px solid rgba(255,255,255,0.2) !important;
          border-left: none !important;
          border-radius: 0 20px 20px 0 !important;
          color: white !important;
          padding: 6px 12px;
          transition: all 0.3s ease;
          height: 32px;
          width: 40px;
        }
        
        .search-btn:hover {
          background: #b67c3a !important;
          border-color: #b67c3a !important;
          color: white !important;
        }
        
        /* User Actions */
        .user-actions {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* User Menu */
        .user-btn {
          background: rgba(255,255,255,0.1) !important;
          border: 2px solid rgba(255,255,255,0.3) !important;
          border-radius: 20px !important;
          color: white !important;
          padding: 6px 15px;
          font-weight: 500;
          font-size: 0.8rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 110px;
          justify-content: flex-start;
          height: 32px;
        }
        
        .user-btn:hover {
          background: rgba(255,255,255,0.2) !important;
          border-color: rgba(255,255,255,0.5) !important;
          color: white !important;
          transform: translateY(-1px);
        }
        
        .user-avatar {
          font-size: 1rem;
          display: flex;
          align-items: center;
        }
        
        .user-name {
          font-size: 0.8rem;
          max-width: 65px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        /* Auth Buttons */
        .auth-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        /* Featured auth buttons on home page */
        .auth-buttons.featured-auth {
          gap: 10px;
        }
        
        .auth-btn {
          padding: 6px 15px;
          border-radius: 20px;
          font-weight: 500;
          font-size: 0.8rem;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          min-width: 110px;
          justify-content: center;
          height: 32px;
        }
        
        /* Featured auth buttons styling */
        .featured-auth .auth-btn {
          min-width: 120px;
          height: 36px;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 8px 20px;
          box-shadow: 0 3px 12px rgba(0,0,0,0.1);
        }
        
        .login-btn {
          background: transparent !important;
          border-color: rgba(255,255,255,0.4) !important;
          color: white !important;
        }
        
        .login-btn:hover {
          background: rgba(255,255,255,0.15) !important;
          border-color: rgba(255,255,255,0.6) !important;
          color: white !important;
          transform: translateY(-1px);
        }
        
        /* Featured login button */
        .featured-auth .login-btn {
          border-color: rgba(255,255,255,0.6) !important;
          background: rgba(255,255,255,0.1) !important;
        }
        
        .featured-auth .login-btn:hover {
          background: rgba(255,255,255,0.2) !important;
          border-color: white !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(255,255,255,0.2);
        }
        
        .register-btn {
          background: linear-gradient(135deg, #b67c3a, #d4941e) !important;
          border-color: transparent !important;
          color: white !important;
        }
        
        .register-btn:hover {
          background: linear-gradient(135deg, #d4941e, #b67c3a) !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(182, 124, 58, 0.4);
        }
        
        /* Featured register button */
        .featured-auth .register-btn {
          background: linear-gradient(135deg, #b67c3a, #d4941e) !important;
          box-shadow: 0 4px 15px rgba(182, 124, 58, 0.3);
        }
        
        .featured-auth .register-btn:hover {
          background: linear-gradient(135deg, #d4941e, #b67c3a) !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(182, 124, 58, 0.5);
        }
        
        /* Shopping Actions */
        .shopping-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .action-btn {
          background: rgba(255,255,255,0.1) !important;
          border: 2px solid rgba(255,255,255,0.3) !important;
          border-radius: 50% !important;
          color: white !important;
          width: 32px;
          height: 32px;
          display: flex !important;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
          text-decoration: none;
        }
        
        .action-btn:hover {
          background: rgba(255,255,255,0.2) !important;
          border-color: rgba(255,255,255,0.5) !important;
          color: white !important;
          transform: translateY(-2px) scale(1.05);
        }
        
        .favorites-btn:hover {
          background: rgba(231, 76, 60, 0.2) !important;
          border-color: rgba(231, 76, 60, 0.5) !important;
          color: #e74c3c !important;
        }
        
        .action-btn i {
          font-size: 0.9rem;
        }
        
        .action-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #dc3545;
          color: white;
          font-size: 0.6rem;
          font-weight: 600;
          border-radius: 50%;
          padding: 2px 5px;
          min-width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Dropdown Menu */
        .user-dropdown {
          border: none !important;
          box-shadow: 0 15px 40px rgba(0,0,0,0.15) !important;
          border-radius: 20px !important;
          padding: 0 !important;
          min-width: 280px !important;
          margin-top: 15px !important;
          overflow: hidden;
          background: white !important;
        }
        
        .user-dropdown .dropdown-header {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef) !important;
          padding: 20px !important;
          border: none !important;
          margin: 0 !important;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .user-avatar-large {
          font-size: 2.5rem;
          color: #1f3c5a;
        }
        
        .user-details {
          flex: 1;
        }
        
        .user-details strong {
          font-size: 1rem;
          color: #1f3c5a;
          font-weight: 600;
        }
        
        .user-details small {
          font-size: 0.85rem;
          color: #6c757d !important;
        }
        
        .user-dropdown .dropdown-item {
          padding: 12px 20px !important;
          transition: all 0.3s ease !important;
          border: none !important;
          font-size: 0.95rem;
          color: #2c3e50 !important;
          font-weight: 500;
        }
        
        .user-dropdown .dropdown-item:hover {
          background: linear-gradient(135deg, #1f3c5a, #3b5d50) !important;
          color: white !important;
          transform: translateX(5px);
        }
        
        .user-dropdown .dropdown-item i {
          width: 20px;
          text-align: center;
          font-size: 1rem;
          opacity: 0.8;
        }
        
        .user-dropdown .dropdown-divider {
          margin: 0 !important;
          border-color: #e9ecef !important;
        }
        
        .logout-btn {
          color: #dc3545 !important;
          font-weight: 600 !important;
        }
        
        .logout-btn:hover {
          background: #dc3545 !important;
          color: white !important;
        }
        
        /* Mobile Responsive */
        @media (max-width: 1400px) {
          .professional-navbar .container-fluid {
            grid-template-columns: 250px 1fr;
            gap: 20px;
          }
          
          .navbar-actions-section.default-layout {
            grid-template-columns: 180px auto auto;
            gap: 15px;
          }
          
          .navbar-actions-section.home-layout {
            gap: 20px;
          }
          
          .search-form {
            width: 180px;
          }
        }
        
        @media (max-width: 992px) {
          .professional-navbar {
            min-height: 50px !important;
          }
          
          .professional-navbar .container-fluid {
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            padding: 5px 15px;
            min-height: 50px;
          }
          
          .navbar-brand-section {
            flex: 1;
          }
          
          .navbar-brand {
            font-size: 0.9rem !important;
          }
          
          .custom-toggler {
            display: block !important;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 8px;
            padding: 6px;
          }
          
          .navbar-collapse {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #1f3c5a, #3b5d50) !important;
            border-radius: 0 0 15px 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            padding: 20px;
            margin-top: -1px;
            z-index: 1050;
          }
          
          .navbar-nav {
            flex-direction: column !important;
            gap: 10px !important;
            margin-bottom: 20px;
          }
          
          .nav-link {
            font-size: 1rem !important;
            padding: 12px 20px !important;
            border-radius: 8px;
            text-align: center;
          }
          
          .navbar-actions-section,
          .navbar-actions-section.default-layout,
          .navbar-actions-section.home-layout {
            display: flex !important;
            flex-direction: column;
            gap: 15px;
            align-items: center;
          }
          
          .search-container {
            order: 1;
            width: 100%;
          }
          
          .search-form {
            width: 100% !important;
          }
          
          .user-actions {
            order: 2;
            width: 100%;
            display: flex;
            justify-content: center;
          }
          
          .auth-buttons {
            flex-direction: column;
            gap: 10px;
            width: 100%;
          }
          
          .auth-btn {
            width: 100% !important;
            justify-content: center;
            min-width: unset !important;
          }
          
          .user-btn {
            width: 100% !important;
            justify-content: center;
            min-width: unset !important;
          }
          
          .shopping-actions {
            order: 3;
            justify-content: center;
            margin-top: 10px;
          }
        }
        
        @media (max-width: 768px) {
          .navbar-brand {
            font-size: 0.9rem !important;
          }
          
          .brand-text {
            display: none;
          }
          
          .navbar-collapse {
            padding: 15px;
          }
          
          .nav-link {
            font-size: 0.9rem !important;
            padding: 10px 15px !important;
          }
          
          .auth-btn {
            font-size: 0.9rem !important;
            padding: 10px 15px !important;
          }
          
          .user-btn {
            font-size: 0.9rem !important;
            padding: 10px 15px !important;
          }
        }
        
        @media (max-width: 992px) {
          .nav-link {
            font-size: 1rem;
            padding: 12px 20px !important;
          }
          
          .navbar-nav {
            gap: 20px;
          }
          
          .auth-btn {
            min-width: 140px;
            padding: 10px 20px;
            font-size: 0.9rem;
          }
          
          .featured-auth .auth-btn {
            min-width: 160px;
            font-size: 1rem;
            padding: 12px 25px;
          }
          
          .user-btn {
            min-width: 140px;
            padding: 10px 20px;
            font-size: 0.9rem;
          }
        }
        
        @media (max-width: 768px) {
          .navbar-nav {
            gap: 15px;
            flex-direction: column;
            width: 100%;
          }
          
          .nav-link {
            justify-content: center;
            width: 100%;
            max-width: 200px;
          }
          
          .auth-buttons,
          .auth-buttons.featured-auth {
            flex-direction: column;
            gap: 10px;
            width: 100%;
            max-width: 200px;
          }
          
          .auth-btn,
          .featured-auth .auth-btn {
            width: 100%;
            min-width: unset;
          }
          
          .user-btn {
            width: 100%;
            max-width: 200px;
          }
          
          .shopping-actions {
            gap: 20px;
          }
          
          .search-form {
            width: 100%;
            max-width: 300px;
          }
        }
        
        @media (max-width: 576px) {
          .professional-navbar {
            min-height: auto;
          }
          
          .navbar-spacer {
            height: auto;
            min-height: 70px;
          }
          
          .action-btn {
            width: 45px;
            height: 45px;
          }
          
          .action-btn i {
            font-size: 1.1rem;
          }
          
          .user-dropdown {
            min-width: 280px !important;
          }
        }
        
        /* Custom Mobile Toggle */
        .custom-toggler {
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          padding: 8px;
          display: none;
        }
        
        .custom-toggler:focus {
          box-shadow: 0 0 0 0.2rem rgba(182, 124, 58, 0.25);
        }
        
        .custom-toggler .navbar-toggler-icon {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 0.8%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='m4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
        }
        
        /* Smooth animations */
        .navbar-collapse.collapsing,
        .navbar-collapse.show {
          transition: all 0.3s ease !important;
        }
        
        .navbar-collapse.collapse:not(.show) {
          display: none !important;
        }
        
        .navbar-collapse.collapse.show {
          display: block !important;
        }
        
        .navbar-collapse.collapsing {
          display: block !important;
        }
        
        /* Professional spacing adjustments */
        @media (min-width: 1200px) {
          .navbar-nav {
            gap: 50px;
          }
          
          .navbar-actions-section {
            gap: 40px;
          }
        }
      </style>
    `;
  }

  // Inicializar la navbar en una página
  init() {
    if (this.isInitialized) return;
    
    // Agregar estilos
    document.head.insertAdjacentHTML('beforeend', this.getNavbarStyles());
    
    // Configurar eventos
    this.setupEventListeners();
    
    // Inicializar estado del usuario
    setTimeout(() => {
      this.initializeUserSystem();
    }, 100);
    
    this.isInitialized = true;
  }

  setupEventListeners() {
    // Búsqueda
    document.addEventListener('submit', (e) => {
      if (e.target.matches('.search-form')) {
        e.preventDefault();
        const searchTerm = e.target.querySelector('.search-input').value;
        if (searchTerm.trim()) {
          window.location.href = `tienda.html?search=${encodeURIComponent(searchTerm)}`;
        }
      }
    });

    // Logout
    document.addEventListener('click', (e) => {
      if (e.target.matches('.logout-btn')) {
        e.preventDefault();
        // Eliminar usuario actual
        localStorage.removeItem('currentUser');
        
        // Actualizar navegación
        this.initializeUserSystem();
        
        // Mostrar notificación
        this.showNotification('Sesión cerrada correctamente', 'info');
      }
    });

    // Cerrar menú móvil al hacer click en enlaces
    document.addEventListener('click', (e) => {
      if (e.target.matches('.nav-link') || e.target.matches('.auth-btn') || e.target.matches('.dropdown-item')) {
        const navbarCollapse = document.querySelector('#navbarContent');
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
          // Usar Bootstrap para cerrar el menú
          const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
          if (bsCollapse) {
            bsCollapse.hide();
          }
        }
      }
    });

    // Auth forms
    document.addEventListener('submit', (e) => {
      if (e.target.matches('#login-form')) {
        e.preventDefault();
        this.handleLogin(e.target);
      } else if (e.target.matches('#register-form')) {
        e.preventDefault();
        this.handleRegister(e.target);
      }
    });
  }

  handleLogin(form) {
    const email = form.querySelector('#login-email').value;
    const password = form.querySelector('#login-password').value;
    
    try {
      // Obtener usuarios registrados
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        // Guardar usuario actual
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Cerrar modal
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (loginModal) loginModal.hide();
        
        // Limpiar formulario
        form.reset();
        
        // Actualizar navegación
        this.initializeUserSystem();
        
        // Mostrar notificación de éxito
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
      
      // Verificar si el email ya existe
      if (users.find(u => u.email === email)) {
        this.showNotification('Este email ya está registrado', 'error');
        return;
      }

      // Crear nuevo usuario
      const newUser = { name, email, password, id: Date.now() };
      users.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(users));

      // Cerrar modal
      const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
      if (registerModal) registerModal.hide();
      
      // Limpiar formulario
      form.reset();
      
      // Mostrar notificación
      this.showNotification('¡Cuenta creada exitosamente!', 'success');
      
    } catch (error) {
      console.error('Error en registro:', error);
      this.showNotification('Error al crear la cuenta', 'error');
    }
  }

  initializeUserSystem() {
    // Verificar si hay usuario en localStorage
    const currentUser = localStorage.getItem('currentUser');
    const userMenu = document.getElementById('userMenu');
    const authButtons = document.getElementById('authButtons');
    
    if (currentUser && userMenu && authButtons) {
      const user = JSON.parse(currentUser);
      
      // Mostrar menú de usuario, ocultar botones de auth
      userMenu.style.display = 'block';
      authButtons.style.display = 'none';
      
      // Actualizar información del usuario
      const userName = document.getElementById('userName');
      const userFullName = document.getElementById('userFullName');
      const userEmail = document.getElementById('userEmail');
      
      if (userName) userName.textContent = user.name || user.firstName || 'Usuario';
      if (userFullName) userFullName.textContent = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario';
      if (userEmail) userEmail.textContent = user.email || '';
      
    } else if (userMenu && authButtons) {
      // Usuario no logueado
      userMenu.style.display = 'none';
      authButtons.style.display = 'flex';
    }
  }

  // Actualizar contadores
  updateCounters() {
    // Actualizar contador del carrito
    if (typeof store !== 'undefined') {
      store.actualizarContadorCarrito();
    }
    
    // Actualizar contador de favoritos
    if (typeof favoritesManager !== 'undefined') {
      favoritesManager.updateNavCounter();
    }
  }

  // Mostrar notificaciones
  showNotification(message, type = 'info') {
    // Remover notificación existente
    const existing = document.querySelector('.notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 4000);
  }
}

// Crear instancia global
window.navigationComponent = new NavigationComponent();