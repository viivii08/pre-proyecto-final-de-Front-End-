// Sistema de Favoritos - Patagonia Style
class FavoritesManager {
  constructor() {
    this.favorites = this.loadFavorites();
    this.init();
  }

  // Cargar favoritos desde localStorage
  loadFavorites() {
    try {
      return JSON.parse(localStorage.getItem('patagonia_favorites')) || [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  }

  // Guardar favoritos en localStorage
  saveFavorites() {
    try {
      localStorage.setItem('patagonia_favorites', JSON.stringify(this.favorites));
      this.updateFavoritesCounter();
      this.triggerFavoritesUpdate();
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  // Agregar producto a favoritos
  addToFavorites(productId, productData) {
    if (!this.isFavorite(productId)) {
      const favorite = {
        id: productId,
        name: productData.name,
        price: productData.price,
        image: productData.image,
        url: productData.url,
        addedAt: new Date().toISOString()
      };
      this.favorites.push(favorite);
      this.saveFavorites();
      this.showNotification(`${productData.name} agregado a favoritos`, 'success');
      return true;
    }
    return false;
  }

  // Quitar producto de favoritos
  removeFromFavorites(productId) {
    const index = this.favorites.findIndex(fav => fav.id === productId);
    if (index !== -1) {
      const removed = this.favorites.splice(index, 1)[0];
      this.saveFavorites();
      this.showNotification(`${removed.name} quitado de favoritos`, 'info');
      return true;
    }
    return false;
  }

  // Verificar si un producto está en favoritos
  isFavorite(productId) {
    return this.favorites.some(fav => fav.id === productId);
  }

  // Alternar estado de favorito
  toggleFavorite(productId, productData) {
    if (this.isFavorite(productId)) {
      this.removeFromFavorites(productId);
      return false;
    } else {
      this.addToFavorites(productId, productData);
      return true;
    }
  }

  // Obtener todos los favoritos
  getFavorites() {
    return [...this.favorites];
  }

  // Obtener cantidad de favoritos
  getFavoritesCount() {
    return this.favorites.length;
  }

  // Limpiar todos los favoritos
  clearFavorites() {
    this.favorites = [];
    this.saveFavorites();
    this.showNotification('Todos los favoritos han sido eliminados', 'info');
  }

  // Actualizar contador de favoritos en la interfaz
  updateFavoritesCounter() {
    const counters = document.querySelectorAll('.favorites-count');
    const count = this.getFavoritesCount();
    
    counters.forEach(counter => {
      counter.textContent = count;
      counter.style.display = count > 0 ? 'inline-block' : 'none';
    });

    // Actualizar badge en navegación
    const navBadge = document.getElementById('favorites-nav-count');
    if (navBadge) {
      navBadge.textContent = count;
      navBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  // Actualizar botones de favoritos en la página
  updateFavoriteButtons() {
    const buttons = document.querySelectorAll('[data-favorite-id]');
    buttons.forEach(button => {
      const productId = button.getAttribute('data-favorite-id');
      const isFav = this.isFavorite(productId);
      
      // Actualizar ícono
      const icon = button.querySelector('i');
      if (icon) {
        icon.className = isFav ? 'bi bi-heart-fill' : 'bi bi-heart';
      }
      
      // Actualizar clases y estilos
      button.classList.toggle('favorite-active', isFav);
      button.style.color = isFav ? '#e74c3c' : '#666';
      button.title = isFav ? 'Quitar de favoritos' : 'Agregar a favoritos';
    });
  }

  // Renderizar botón de favorito
  renderFavoriteButton(productId, size = 'normal') {
    const isFav = this.isFavorite(productId);
    const sizeClass = size === 'small' ? 'btn-sm' : '';
    
    return `
      <button class="btn btn-outline-light favorite-btn ${sizeClass} ${isFav ? 'favorite-active' : ''}" 
              data-favorite-id="${productId}"
              title="${isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}"
              style="color: ${isFav ? '#e74c3c' : '#666'}; border: 1px solid ${isFav ? '#e74c3c' : '#ddd'};">
        <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
      </button>
    `;
  }

  // Mostrar notificación
  showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `favorite-notification alert alert-${type === 'success' ? 'success' : 'info'}`;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 9999;
      min-width: 250px;
      animation: slideInRight 0.3s ease-out;
    `;
    notification.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="bi ${type === 'success' ? 'bi-heart-fill' : 'bi-info-circle'} me-2"></i>
        ${message}
      </div>
    `;

    // Agregar estilos de animación
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Disparar evento personalizado cuando se actualizan favoritos
  triggerFavoritesUpdate() {
    window.dispatchEvent(new CustomEvent('favoritesUpdated', {
      detail: { 
        count: this.getFavoritesCount(),
        favorites: this.getFavorites()
      }
    }));
  }

  // Inicializar sistema de favoritos
  init() {
    // Actualizar contadores al cargar
    this.updateFavoritesCounter();
    
    // Escuchar clics en botones de favoritos
    document.addEventListener('click', (e) => {
      const favoriteBtn = e.target.closest('[data-favorite-id]');
      if (favoriteBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        const productId = favoriteBtn.getAttribute('data-favorite-id');
        const productData = this.extractProductData(favoriteBtn);
        
        this.toggleFavorite(productId, productData);
        this.updateFavoriteButtons();
      }
    });

    // Actualizar botones cuando la página carga
    setTimeout(() => {
      this.updateFavoriteButtons();
    }, 100);

    // Escuchar eventos de almacenamiento para sincronizar entre pestañas
    window.addEventListener('storage', (e) => {
      if (e.key === 'patagonia_favorites') {
        this.favorites = this.loadFavorites();
        this.updateFavoritesCounter();
        this.updateFavoriteButtons();
      }
    });
  }

  // Extraer datos del producto desde el botón o elemento padre
  extractProductData(button) {
    const productContainer = button.closest('.card, .producto-section, [data-product]');
    
    return {
      name: this.getProductName(productContainer),
      price: this.getProductPrice(productContainer),
      image: this.getProductImage(productContainer),
      url: this.getProductUrl(productContainer)
    };
  }

  getProductName(container) {
    if (!container) return 'Producto';
    
    const selectors = [
      '.card-title',
      'h1',
      'h2',
      'h3',
      '[data-product-name]',
      '.producto-nombre'
    ];
    
    for (const selector of selectors) {
      const element = container.querySelector(selector);
      if (element) return element.textContent.trim();
    }
    
    return document.title.split(' - ')[0] || 'Producto';
  }

  getProductPrice(container) {
    if (!container) return '$0';
    
    const selectors = [
      '.card-price',
      '.precio',
      '.product-price',
      '[data-product-price]',
      '.precio-actual'
    ];
    
    for (const selector of selectors) {
      const element = container.querySelector(selector);
      if (element) return element.textContent.trim();
    }
    
    return '$0';
  }

  getProductImage(container) {
    if (!container) return 'pages/logo sin fondo (1).png';
    
    const selectors = [
      '.card-img-top',
      '.producto-main-img',
      '[data-product-image]',
      'img'
    ];
    
    for (const selector of selectors) {
      const element = container.querySelector(selector);
      if (element && element.src) return element.src;
    }
    
    return 'pages/logo sin fondo (1).png';
  }

  getProductUrl(container) {
    const currentUrl = window.location.href;
    
    // Si estamos en una página de producto, usar esa URL
    if (currentUrl.includes('.html') && !currentUrl.includes('index.html') && !currentUrl.includes('tienda.html')) {
      return currentUrl;
    }
    
    // Buscar enlace en el contenedor
    const link = container ? container.querySelector('a[href]') : null;
    if (link && link.href) {
      return link.href;
    }
    
    return currentUrl;
  }
}

// Inicializar sistema de favoritos globalmente
const favoritesManager = new FavoritesManager();

// Exportar para uso global
window.favoritesManager = favoritesManager;