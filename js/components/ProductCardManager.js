/**
 * 🎨 SISTEMA AVANZADO DE TARJETAS DE PRODUCTOS
 * Optimizado para performance, escalabilidad y UX
 */

class ProductCardManager {
  constructor() {
    this.observer = null;
    this.fragmentCache = new Map();
    this.cardTemplate = null;
    this.init();
  }

  init() {
    this.createCardTemplate();
    this.setupIntersectionObserver();
  }

  /**
   * 🏗️ Crear template reutilizable para tarjetas
   */
  createCardTemplate() {
    this.cardTemplate = document.createElement('template');
    this.cardTemplate.innerHTML = `
      <div class="col product-card-wrapper">
        <article class="product-card" data-product-id="">
          <!-- Badge de descuento -->
          <div class="product-badge-container">
            <span class="product-discount-badge hidden" data-discount="">% OFF</span>
            <span class="product-stock-badge hidden">Stock bajo</span>
          </div>
          
          <!-- Imagen del producto -->
          <div class="product-image-container">
            <img class="product-image lazy-load" 
                 data-src="" 
                 alt="" 
                 loading="lazy">
            <div class="product-image-overlay">
              <button class="quick-view-btn" data-action="quick-view">
                <i class="bi bi-eye"></i>
                <span>Vista rápida</span>
              </button>
            </div>
          </div>
          
          <!-- Contenido de la tarjeta -->
          <div class="product-content">
            <header class="product-header">
              <h3 class="product-title" data-field="nombre"></h3>
              <p class="product-category" data-field="categoria"></p>
            </header>
            
            <div class="product-description">
              <p class="product-summary" data-field="descripcionCorta"></p>
            </div>
            
            <div class="product-pricing">
              <span class="product-price-current" data-field="precio"></span>
              <span class="product-price-original hidden" data-field="precioOriginal"></span>
              <span class="product-savings hidden" data-field="savings"></span>
            </div>
            
            <div class="product-stock-info">
              <span class="stock-quantity" data-field="stock"></span>
              <div class="stock-indicator">
                <div class="stock-bar" data-field="stockLevel"></div>
              </div>
            </div>
            
            <div class="product-actions">
              <button class="btn btn-outline-primary btn-details" data-action="view-details">
                <i class="bi bi-info-circle"></i>
                Detalles
              </button>
              <button class="btn btn-primary btn-add-cart" data-action="add-to-cart">
                <i class="bi bi-cart-plus"></i>
                <span class="btn-text">Agregar</span>
                <div class="btn-loading hidden">
                  <i class="bi bi-arrow-repeat spin"></i>
                </div>
              </button>
            </div>
            
            <div class="product-features">
              <div class="feature-tags" data-field="tags"></div>
              <div class="rating-display" data-field="rating">
                <div class="stars">
                  <span class="star" data-rating="1">★</span>
                  <span class="star" data-rating="2">★</span>
                  <span class="star" data-rating="3">★</span>
                  <span class="star" data-rating="4">★</span>
                  <span class="star" data-rating="5">★</span>
                </div>
                <span class="rating-count" data-field="reviewCount"></span>
              </div>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  /**
   * 🖼️ Setup Intersection Observer para lazy loading
   */
  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          this.observer.unobserve(img);
        }
      });
    }, options);
  }

  /**
   * 🚀 Renderizar productos con optimización
   */
  renderProducts(productos, container) {
    if (!container || !productos.length) {
      console.warn('⚠️ ProductCardManager: Container o productos inválidos');
      return;
    }

    // Usar DocumentFragment para performance
    const fragment = document.createDocumentFragment();
    
    // Limpiar container de forma eficiente
    this.clearContainer(container);

    // Crear tarjetas en batches para no bloquear UI
    this.renderInBatches(productos, fragment, (completedFragment) => {
      container.appendChild(completedFragment);
      this.activateCards(container);
    });
  }

  /**
   * 📦 Renderizar en lotes para UI responsiva
   */
  renderInBatches(productos, fragment, callback, batchSize = 10) {
    let currentBatch = 0;
    const totalBatches = Math.ceil(productos.length / batchSize);

    const processBatch = () => {
      const start = currentBatch * batchSize;
      const end = Math.min(start + batchSize, productos.length);
      
      for (let i = start; i < end; i++) {
        const productCard = this.createOptimizedCard(productos[i]);
        fragment.appendChild(productCard);
      }

      currentBatch++;

      if (currentBatch < totalBatches) {
        // Usar requestAnimationFrame para no bloquear UI
        requestAnimationFrame(processBatch);
      } else {
        callback(fragment);
      }
    };

    processBatch();
  }

  /**
   * 🏗️ Crear tarjeta optimizada usando template
   */
  createOptimizedCard(producto) {
    // Clonar template
    const cardElement = this.cardTemplate.content.cloneNode(true);
    const card = cardElement.querySelector('.product-card');
    
    // Set data attributes de forma segura
    card.dataset.productId = producto.id;
    card.dataset.category = producto.categoria;
    card.dataset.price = producto.precio;

    // Populate data usando mapping seguro
    this.populateCardData(cardElement, producto);
    
    // Setup lazy loading
    const img = cardElement.querySelector('.product-image');
    img.dataset.src = producto.imagenes?.[0] || 'pages/no-image.png';
    img.alt = producto.nombre || 'Producto';

    // Configure badges
    this.configureBadges(cardElement, producto);
    
    // Setup event handlers
    this.attachEventHandlers(cardElement, producto);

    return cardElement;
  }

  /**
   * 📝 Poblar datos de forma segura
   */
  populateCardData(cardElement, producto) {
    const fieldsMapping = {
      'nombre': producto.nombre || 'Producto sin nombre',
      'categoria': producto.categoria || 'Sin categoría',
      'descripcionCorta': producto.descripcionCorta || 'Sin descripción',
      'precio': `$${(producto.precio || 0).toLocaleString()}`,
      'precioOriginal': producto.precioOriginal ? `$${producto.precioOriginal.toLocaleString()}` : '',
      'stock': `${producto.stock || 0} disponibles`,
      'stockLevel': this.calculateStockLevel(producto.stock),
      'savings': producto.precioOriginal ? this.calculateSavings(producto.precio, producto.precioOriginal) : '',
      'tags': this.renderTags(producto.tags || []),
      'rating': producto.rating || 0,
      'reviewCount': `(${producto.reviewCount || 0})`
    };

    Object.entries(fieldsMapping).forEach(([field, value]) => {
      const element = cardElement.querySelector(`[data-field="${field}"]`);
      if (element) {
        if (field === 'stockLevel') {
          element.style.width = value;
        } else if (field === 'tags') {
          element.innerHTML = value;
        } else {
          element.textContent = value;
        }
      }
    });
  }

  /**
   * 🏷️ Configurar badges dinámicamente
   */
  configureBadges(cardElement, producto) {
    // Badge de descuento
    if (producto.descuento > 0) {
      const discountBadge = cardElement.querySelector('.product-discount-badge');
      discountBadge.textContent = `${producto.descuento}% OFF`;
      discountBadge.classList.remove('hidden');
      discountBadge.dataset.discount = producto.descuento;
    }

    // Badge de stock bajo
    if (producto.stock < 5) {
      const stockBadge = cardElement.querySelector('.product-stock-badge');
      stockBadge.textContent = `Solo ${producto.stock} disponibles`;
      stockBadge.classList.remove('hidden');
    }

    // Mostrar precio original si hay descuento
    if (producto.precioOriginal) {
      const originalPrice = cardElement.querySelector('[data-field="precioOriginal"]');
      const savings = cardElement.querySelector('[data-field="savings"]');
      originalPrice.classList.remove('hidden');
      savings.classList.remove('hidden');
    }
  }

  /**
   * 🎯 Adjuntar event handlers optimizados
   */
  attachEventHandlers(cardElement, producto) {
    // Usar event delegation en lugar de múltiples listeners
    const card = cardElement.querySelector('.product-card');
    
    card.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      
      switch (action) {
        case 'quick-view':
          this.handleQuickView(producto, e.target);
          break;
        case 'view-details':
          this.handleViewDetails(producto);
          break;
        case 'add-to-cart':
          this.handleAddToCart(producto, e.target);
          break;
      }
    });

    // Hover effects
    card.addEventListener('mouseenter', () => {
      card.classList.add('product-card--hovered');
    });
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove('product-card--hovered');
    });
  }

  /**
   * 🖼️ Lazy loading optimizado
   */
  loadImage(img) {
    if (img.dataset.src) {
      const imageLoader = new Image();
      imageLoader.onload = () => {
        img.src = img.dataset.src;
        img.classList.add('loaded');
        delete img.dataset.src;
      };
      imageLoader.onerror = () => {
        img.src = 'pages/no-image.png';
        img.classList.add('error');
      };
      imageLoader.src = img.dataset.src;
    }
  }

  /**
   * ⚡ Activar lazy loading para tarjetas nuevas
   */
  activateCards(container) {
    const images = container.querySelectorAll('.lazy-load:not(.loaded):not(.error)');
    images.forEach(img => {
      this.observer.observe(img);
    });
  }

  /**
   * 🧹 Limpiar container de forma eficiente
   */
  clearContainer(container) {
    // Remover event listeners para prevenir memory leaks
    const cards = container.querySelectorAll('.product-card');
    cards.forEach(card => {
      // Clone node sin event listeners
      const newCard = card.cloneNode(false);
      card.parentNode.replaceChild(newCard, card);
    });
    
    // Limpiar contenido
    container.innerHTML = '';
  }

  /**
   * 🛠️ Utilidades
   */
  calculateStockLevel(stock) {
    const maxStock = 50; // Assumir stock máximo para cálculo
    const percentage = Math.min((stock / maxStock) * 100, 100);
    return `${percentage}%`;
  }

  calculateSavings(currentPrice, originalPrice) {
    const savings = originalPrice - currentPrice;
    return `Ahorras $${savings.toLocaleString()}`;
  }

  renderTags(tags) {
    return tags.slice(0, 3).map(tag => 
      `<span class="feature-tag">${tag}</span>`
    ).join('');
  }

  /**
   * 🎬 Event Handlers
   */
  handleQuickView(producto, button) {
    button.classList.add('loading');
    // Implementar modal de vista rápida
    console.log('🔍 Vista rápida:', producto);
    setTimeout(() => button.classList.remove('loading'), 1000);
  }

  handleViewDetails(producto) {
    window.location.href = `producto.html?id=${producto.id}`;
  }

  handleAddToCart(producto, button) {
    button.classList.add('loading');
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');

    // Simular añadir al carrito
    setTimeout(() => {
      if (window.store) {
        window.store.agregarAlCarrito(producto.id);
      }
      
      btnText.classList.remove('hidden');
      btnLoading.classList.add('hidden');
      button.classList.remove('loading');
    }, 800);
  }

  /**
   * 🧹 Cleanup
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.fragmentCache.clear();
  }
}

// Crear instancia global
window.ProductCardManager = ProductCardManager;
console.log('🎨 ProductCardManager inicializado correctamente');