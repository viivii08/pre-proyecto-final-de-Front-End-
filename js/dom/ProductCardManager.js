/**
 * 🎯 PRODUCT CARD MANAGER - Sistema Avanzado de Gestión de Tarjetas
 * Versión: 3.0
 * Características: Lazy Loading, Virtual Scrolling, Templates, Caching
 */

// ===================================================
// 🔧 UTILIDADES DOM AVANZADAS
// ===================================================

class DOMUtils {
  /**
   * Crear elemento con atributos de forma segura
   * @param {string} tag - Tag del elemento
   * @param {Object} attributes - Atributos del elemento
   * @param {Object} styles - Estilos CSS
   * @returns {HTMLElement}
   */
  static createElement(tag, attributes = {}, styles = {}) {
    try {
      const element = document.createElement(tag);
      
      // Aplicar atributos
      Object.entries(attributes).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'className') {
            element.className = value;
          } else if (key === 'innerHTML') {
            element.innerHTML = value;
          } else {
            element.setAttribute(key, value);
          }
        }
      });
      
      // Aplicar estilos
      Object.entries(styles).forEach(([property, value]) => {
        element.style[property] = value;
      });
      
      return element;
      
    } catch (error) {
      console.error('Error creating element:', error);
      return document.createElement('div');
    }
  }

  /**
   * Buscar elemento de forma segura
   * @param {string} selector - Selector CSS
   * @param {HTMLElement} context - Contexto de búsqueda
   * @returns {HTMLElement|null}
   */
  static safeQuery(selector, context = document) {
    try {
      return context.querySelector(selector);
    } catch (error) {
      console.warn(`Invalid selector: ${selector}`, error);
      return null;
    }
  }

  /**
   * Buscar múltiples elementos de forma segura
   * @param {string} selector - Selector CSS
   * @param {HTMLElement} context - Contexto de búsqueda
   * @returns {NodeList}
   */
  static safeQueryAll(selector, context = document) {
    try {
      return context.querySelectorAll(selector);
    } catch (error) {
      console.warn(`Invalid selector: ${selector}`, error);
      return [];
    }
  }

  /**
   * Verificar si elemento está en el viewport
   * @param {HTMLElement} element - Elemento a verificar
   * @param {number} threshold - Threshold para detección
   * @returns {boolean}
   */
  static isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.top >= -threshold &&
      rect.left >= -threshold &&
      rect.bottom <= windowHeight + threshold &&
      rect.right <= windowWidth + threshold
    );
  }

  /**
   * Debounce function para optimizar eventos
   * @param {Function} func - Función a ejecutar
   * @param {number} delay - Delay en ms
   * @returns {Function}
   */
  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Throttle function para optimizar eventos
   * @param {Function} func - Función a ejecutar
   * @param {number} delay - Delay en ms
   * @returns {Function}
   */
  static throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }
}

// ===================================================
// 🖼️ LAZY LOADER AVANZADO
// ===================================================

class LazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '100px',
      threshold: 0.1,
      enablePreload: true,
      imagePlaceholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYXJnYW5kby4uLjwvdGV4dD4KICA8L3N2Zz4K',
      ...options
    };
    
    this.observer = null;
    this.imageCache = new Map();
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: this.options.rootMargin,
          threshold: this.options.threshold
        }
      );
    }
  }

  /**
   * Manejar intersección de elementos
   * @param {IntersectionObserverEntry[]} entries
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadElement(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  /**
   * Cargar elemento lazy
   * @param {HTMLElement} element
   */
  async loadElement(element) {
    try {
      if (element.dataset.lazy === 'image') {
        await this.loadImage(element);
      } else if (element.dataset.lazy === 'card') {
        await this.loadCard(element);
      }
      
      element.classList.add('lazy-loaded');
      element.dispatchEvent(new CustomEvent('lazy:loaded', { detail: { element } }));
      
    } catch (error) {
      console.error('Error loading lazy element:', error);
      element.classList.add('lazy-error');
    }
  }

  /**
   * Cargar imagen con optimizaciones
   * @param {HTMLImageElement} img
   */
  async loadImage(img) {
    return new Promise((resolve, reject) => {
      const src = img.dataset.src;
      if (!src) {
        reject(new Error('No data-src attribute'));
        return;
      }

      // Verificar cache
      if (this.imageCache.has(src)) {
        img.src = src;
        img.removeAttribute('data-src');
        resolve();
        return;
      }

      // Precargar imagen
      const tempImg = new Image();
      
      tempImg.onload = () => {
        img.src = src;
        img.removeAttribute('data-src');
        this.imageCache.set(src, true);
        
        // Fade in animation
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        requestAnimationFrame(() => {
          img.style.opacity = '1';
        });
        
        resolve();
      };
      
      tempImg.onerror = () => {
        img.src = this.options.imagePlaceholder;
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      tempImg.src = src;
    });
  }

  /**
   * Cargar tarjeta de producto
   * @param {HTMLElement} card
   */
  async loadCard(card) {
    try {
      const productId = card.dataset.productId;
      if (!productId) return;

      // Simular carga de datos de producto
      const productData = await this.fetchProductData(productId);
      
      // Renderizar contenido de la tarjeta
      const cardManager = window.productCardManager;
      if (cardManager) {
        const content = cardManager.renderCardContent(productData);
        card.innerHTML = content;
      }
      
    } catch (error) {
      card.innerHTML = `
        <div class="card-error p-4 text-center text-muted">
          <i class="bi bi-exclamation-triangle mb-2" style="font-size: 2rem;"></i>
          <p>Error al cargar producto</p>
          <button class="btn btn-sm btn-outline-secondary" onclick="location.reload()">
            Reintentar
          </button>
        </div>
      `;
      throw error;
    }
  }

  /**
   * Fetch datos de producto (simulado)
   * @param {string} productId
   * @returns {Promise<Object>}
   */
  async fetchProductData(productId) {
    // En implementación real, esto haría fetch a API
    await new Promise(resolve => setTimeout(resolve, 300)); // Simular latencia
    
    return {
      id: productId,
      name: `Producto ${productId}`,
      price: Math.floor(Math.random() * 50000) + 10000,
      image: `pages/producto-${productId}.webp`,
      description: `Descripción del producto ${productId}`
    };
  }

  /**
   * Observar elemento para lazy loading
   * @param {HTMLElement} element
   */
  observe(element) {
    if (this.observer) {
      this.observer.observe(element);
    } else {
      // Fallback para navegadores sin IntersectionObserver
      this.loadElement(element);
    }
  }

  /**
   * Precargar imágenes próximas
   * @param {string[]} imageSrcs
   */
  preloadImages(imageSrcs) {
    if (!this.options.enablePreload) return;
    
    imageSrcs.forEach(src => {
      if (!this.imageCache.has(src)) {
        const img = new Image();
        img.onload = () => this.imageCache.set(src, true);
        img.src = src;
      }
    });
  }

  /**
   * Destruir lazy loader
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.imageCache.clear();
  }
}

// ===================================================
// 🃏 PRODUCT CARD MANAGER PRINCIPAL
// ===================================================

class ProductCardManager {
  constructor(options = {}) {
    this.options = {
      container: '#products-container',
      cardTemplate: 'modern',
      enableLazyLoading: true,
      enableVirtualScrolling: false,
      itemsPerPage: 12,
      enableCache: true,
      animationDuration: 300,
      enableDescriptionToggle: true,
      enableImageGallery: true,
      ...options
    };

    this.products = [];
    this.filteredProducts = [];
    this.renderedItems = new Map();
    this.templateCache = new Map();
    this.lazyLoader = null;
    this.container = null;
    
    this.init();
  }

  /**
   * Inicializar el manager
   */
  async init() {
    try {
      console.log('🚀 Inicializando ProductCardManager...');
      
      // Encontrar contenedor
      this.container = DOMUtils.safeQuery(this.options.container);
      if (!this.container) {
        throw new Error(`Container not found: ${this.options.container}`);
      }

      // Inicializar lazy loader si está habilitado
      if (this.options.enableLazyLoading) {
        this.lazyLoader = new LazyLoader();
      }

      // Precompilar templates
      this.compileTemplates();
      
      // Configurar event listeners
      this.setupEventListeners();
      
      // Cargar productos iniciales
      await this.loadProducts();
      
      console.log('✅ ProductCardManager inicializado correctamente');
      
    } catch (error) {
      console.error('❌ Error inicializando ProductCardManager:', error);
    }
  }

  /**
   * Cargar productos desde diferentes fuentes
   */
  async loadProducts() {
    try {
      // Intentar cargar desde JSON
      const response = await fetch('./data/productos.json');
      const data = await response.json();
      this.products = data.productos || [];
      
    } catch (error) {
      console.warn('No se pudo cargar productos.json, usando productos por defecto');
      this.products = this.getDefaultProducts();
    }
    
    this.filteredProducts = [...this.products];
    this.renderProducts();
  }

  /**
   * Productos por defecto (fallback)
   */
  getDefaultProducts() {
    return [
      {
        id: 'jar-001',
        name: 'Jarro Zorrito Invierno',
        price: 21900,
        originalPrice: 23900,
        discount: 8,
        stock: 15,
        available: true,
        shortDescription: 'Jarro enlozado inspirado en la Patagonia. Capacidad 330ml.',
        longDescription: 'Hermoso jarro de cerámica enlozada con diseño original de zorrito patagónico. Ideal para mate, café o té. Resistente y liviano, perfecto para aventuras.',
        images: ['pages/jarro1.webp', 'pages/jarro2.webp'],
        category: 'jarros',
        sku: 'JAR-ZOR-INV-001',
        tags: ['patagonia', 'zorrito', 'enlozado', 'mate', 'invierno'],
        rating: 4.8,
        reviews: 24
      },
      {
        id: 'cua-001', 
        name: 'Cuaderno Zorro',
        price: 18900,
        originalPrice: 21900,
        discount: 14,
        stock: 28,
        available: true,
        shortDescription: 'Cuaderno anillado A4 con diseño original de vivipinta.',
        longDescription: 'Cuaderno de hojas lisas con ilustración única de zorrito patagónico. Papel de alta calidad, anillado espiral. Ideal para notas, dibujos y creatividad.',
        images: ['pages/cuadernoportada.webp'],
        category: 'papeleria',
        sku: 'CUAD-ZOR-A4-001',
        tags: ['cuaderno', 'zorrito', 'papeleria', 'dibujo', 'patagonia'],
        rating: 4.9,
        reviews: 18
      },
      {
        id: 'yer-001',
        name: 'Yerbera Bariloche', 
        price: 24900,
        originalPrice: null,
        discount: 0,
        stock: 12,
        available: true,
        shortDescription: 'Yerbera ilustrada con paisajes de montaña, bosque y lago.',
        longDescription: 'Yerbera de lata ilustrada con hermosos paisajes de Bariloche. Conserva perfectamente el sabor y aroma de la yerba mate. Diseño único inspirado en la naturaleza patagónica.',
        images: ['pages/yerbraportada.webp'],
        category: 'accesorios',
        sku: 'YERB-BAR-LAT-001',
        tags: ['yerbera', 'bariloche', 'paisaje', 'mate', 'lata'],
        rating: 4.7,
        reviews: 31
      }
    ];
  }

  /**
   * Compilar templates para mejor rendimiento
   */
  compileTemplates() {
    const templates = {
      modern: this.getModernCardTemplate(),
      classic: this.getClassicCardTemplate(),
      minimal: this.getMinimalCardTemplate()
    };
    
    Object.entries(templates).forEach(([name, template]) => {
      this.templateCache.set(name, this.compileTemplate(template));
    });
  }

  /**
   * Compilar template usando template literals
   * @param {string} template
   * @returns {Function}
   */
  compileTemplate(template) {
    return new Function('product', 'utils', `
      const { formatPrice, renderStars, getDiscountBadge, getStockStatus } = utils;
      return \`${template}\`;
    `);
  }

  /**
   * Template moderno para tarjetas
   */
  getModernCardTemplate() {
    return `
      <article class="product-card modern-card" 
               data-product-id="\${product.id}"
               itemscope itemtype="https://schema.org/Product">
        
        <!-- Badge de descuento -->
        \${product.discount > 0 ? \`
          <div class="discount-badge">
            <span>\${product.discount}% OFF</span>
          </div>
        \` : ''}
        
        <!-- Imagen principal con lazy loading -->
        <div class="card-image-container">
          <img class="card-image lazy-image" 
               src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Yzc1N2QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYXJnYW5kby4uLjwvdGV4dD4KICA8L3N2Zz4K"
               data-src="\${product.images[0]}"
               data-lazy="image"
               alt="\${product.name}"
               loading="lazy"
               itemprop="image">
          
          <!-- Galería de imágenes adicionales -->
          \${product.images.length > 1 ? \`
            <div class="image-gallery-dots">
              \${product.images.map((img, index) => \`
                <button class="gallery-dot \${index === 0 ? 'active' : ''}"
                        onclick="productCardManager.changeImage('\${product.id}', \${index})"
                        aria-label="Ver imagen \${index + 1}">
                </button>
              \`).join('')}
            </div>
          \` : ''}
          
          <!-- Botones de acción rápida -->
          <div class="quick-actions">
            <button class="btn-quick-action btn-favorite" 
                    title="Agregar a favoritos"
                    onclick="productCardManager.toggleFavorite('\${product.id}')">
              <i class="bi bi-heart"></i>
            </button>
            <button class="btn-quick-action btn-quick-view" 
                    title="Vista rápida"
                    onclick="productCardManager.showQuickView('\${product.id}')">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </div>
        
        <!-- Contenido de la tarjeta -->
        <div class="card-content">
          
          <!-- Header del producto -->
          <header class="card-header">
            <h3 class="card-title" itemprop="name">\${product.name}</h3>
            
            <!-- Rating y reviews -->
            <div class="card-rating">
              <div class="stars">\${renderStars(product.rating || 0)}</div>
              <span class="reviews-count">(\${product.reviews || 0})</span>
            </div>
          </header>
          
          <!-- Descripción corta -->
          <div class="card-description">
            <p class="short-description" itemprop="description">
              \${product.shortDescription}
            </p>
            
            \${this.options.enableDescriptionToggle ? \`
              <div class="long-description" style="display: none;">
                <p>\${product.longDescription}</p>
              </div>
              <button class="btn-toggle-description" 
                      onclick="productCardManager.toggleDescription('\${product.id}')">
                <span class="toggle-text">Ver más</span>
                <i class="bi bi-chevron-down toggle-icon"></i>
              </button>
            \` : ''}
          </div>
          
          <!-- Precios -->
          <div class="card-pricing" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
            <div class="price-current" itemprop="price" content="\${product.price}">
              \${formatPrice(product.price)}
            </div>
            \${product.originalPrice ? \`
              <div class="price-original">\${formatPrice(product.originalPrice)}</div>
            \` : ''}
            <meta itemprop="priceCurrency" content="ARS">
            <meta itemprop="availability" content="https://schema.org/\${product.available ? 'InStock' : 'OutOfStock'}">
          </div>
          
          <!-- Stock y disponibilidad -->
          <div class="card-stock">
            \${getStockStatus(product.stock, product.available)}
          </div>
          
        </div>
        
        <!-- Footer con acciones -->
        <footer class="card-footer">
          <button class="btn-add-to-cart \${!product.available || product.stock === 0 ? 'disabled' : ''}"
                  onclick="productCardManager.addToCart('\${product.id}')"
                  \${!product.available || product.stock === 0 ? 'disabled' : ''}>
            <i class="bi bi-cart-plus"></i>
            <span>\${product.available && product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}</span>
          </button>
          
          <button class="btn-view-details" 
                  onclick="productCardManager.viewDetails('\${product.id}')">
            <i class="bi bi-arrow-right"></i>
            <span>Ver detalles</span>
          </button>
        </footer>
        
        <!-- Metadatos Schema.org -->
        <meta itemprop="sku" content="\${product.sku}">
        <meta itemprop="category" content="\${product.category}">
        <meta itemprop="brand" content="Patagonia Style">
        
      </article>
    `;
  }

  /**
   * Template clásico para tarjetas
   */
  getClassicCardTemplate() {
    return `
      <div class="card product-card classic-card h-100" data-product-id="\${product.id}">
        \${product.discount > 0 ? \`<span class="badge position-absolute top-0 end-0 m-2 bg-danger">\${product.discount}% OFF</span>\` : ''}
        
        <img src="\${product.images[0]}" class="card-img-top" alt="\${product.name}" style="height: 250px; object-fit: cover;">
        
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">\${product.name}</h5>
          <p class="card-text">\${product.shortDescription}</p>
          
          <div class="mt-auto">
            <div class="mb-2">
              <span class="h5 text-success">\${formatPrice(product.price)}</span>
              \${product.originalPrice ? \`<small class="text-muted text-decoration-line-through ms-2">\${formatPrice(product.originalPrice)}</small>\` : ''}
            </div>
            
            <button class="btn btn-primary w-100" onclick="productCardManager.addToCart('\${product.id}')">
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Template minimal para tarjetas
   */
  getMinimalCardTemplate() {
    return `
      <div class="product-card minimal-card" data-product-id="\${product.id}">
        <img src="\${product.images[0]}" alt="\${product.name}">
        <h3>\${product.name}</h3>
        <p>\${formatPrice(product.price)}</p>
        <button onclick="productCardManager.addToCart('\${product.id}')">Comprar</button>
      </div>
    `;
  }

  /**
   * Renderizar productos en el contenedor
   */
  renderProducts(products = null) {
    if (!this.container) return;
    
    const productsToRender = products || this.filteredProducts;
    
    // Limpiar contenedor con animación
    this.clearContainer();
    
    // Crear fragment para mejor rendimiento
    const fragment = document.createDocumentFragment();
    
    // Renderizar cada producto
    productsToRender.forEach((product, index) => {
      const cardElement = this.renderProductCard(product, index);
      fragment.appendChild(cardElement);
    });
    
    // Agregar al DOM
    this.container.appendChild(fragment);
    
    // Aplicar animaciones de entrada
    this.animateCardsIn();
    
    // Configurar lazy loading
    if (this.lazyLoader) {
      this.setupLazyLoading();
    }
    
    console.log(`✅ Renderizados ${productsToRender.length} productos`);
  }

  /**
   * Renderizar tarjeta individual de producto
   * @param {Object} product - Datos del producto
   * @param {number} index - Índice en la lista
   * @returns {HTMLElement}
   */
  renderProductCard(product, index) {
    try {
      // Obtener template compilado
      const template = this.templateCache.get(this.options.cardTemplate) || 
                      this.templateCache.get('modern');
      
      // Utilidades para el template
      const utils = {
        formatPrice: (price) => new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          minimumFractionDigits: 0
        }).format(price),
        
        renderStars: (rating) => {
          return Array.from({ length: 5 }, (_, i) => {
            const filled = i < Math.floor(rating);
            const half = i === Math.floor(rating) && rating % 1 >= 0.5;
            return `<i class="bi bi-star${filled ? '-fill' : half ? '-half' : ''}"></i>`;
          }).join('');
        },
        
        getDiscountBadge: (discount) => {
          return discount > 0 ? `<span class="discount-badge">${discount}% OFF</span>` : '';
        },
        
        getStockStatus: (stock, available) => {
          if (!available) return '<span class="stock-status out-of-stock">No disponible</span>';
          if (stock === 0) return '<span class="stock-status out-of-stock">Sin stock</span>';
          if (stock < 5) return `<span class="stock-status low-stock">¡Últimas ${stock} unidades!</span>`;
          return `<span class="stock-status in-stock">En stock (${stock})</span>`;
        }
      };
      
      // Generar HTML del template
      const cardHTML = template(product, utils);
      
      // Crear contenedor
      const cardContainer = DOMUtils.createElement('div', {
        className: 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4 product-card-container',
        'data-index': index,
        'data-product-id': product.id
      });
      
      cardContainer.innerHTML = cardHTML;
      
      // Guardar referencia del producto renderizado
      this.renderedItems.set(product.id, {
        element: cardContainer,
        product: product,
        rendered: true
      });
      
      return cardContainer;
      
    } catch (error) {
      console.error('Error rendering product card:', error);
      return this.renderErrorCard(product);
    }
  }

  /**
   * Renderizar tarjeta de error
   * @param {Object} product
   * @returns {HTMLElement}
   */
  renderErrorCard(product) {
    const errorCard = DOMUtils.createElement('div', {
      className: 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4',
      innerHTML: `
        <div class="card error-card h-100 text-center p-4">
          <i class="bi bi-exclamation-triangle text-warning mb-2" style="font-size: 2rem;"></i>
          <h5 class="card-title">Error al cargar producto</h5>
          <p class="card-text text-muted">ID: ${product.id}</p>
          <button class="btn btn-outline-secondary btn-sm" onclick="productCardManager.retryLoadProduct('${product.id}')">
            Reintentar
          </button>
        </div>
      `
    });
    
    return errorCard;
  }

  /**
   * Limpiar contenedor con animación
   */
  clearContainer() {
    if (!this.container) return;
    
    const cards = this.container.querySelectorAll('.product-card-container');
    
    if (cards.length === 0) {
      this.container.innerHTML = '';
      return;
    }
    
    // Animar salida
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.animation = 'fadeOutDown 0.3s ease-out forwards';
      }, index * 50);
    });
    
    // Limpiar después de animación
    setTimeout(() => {
      this.container.innerHTML = '';
      this.renderedItems.clear();
    }, cards.length * 50 + 300);
  }

  /**
   * Animar entrada de tarjetas
   */
  animateCardsIn() {
    if (!this.container) return;
    
    const cards = this.container.querySelectorAll('.product-card-container');
    
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.4s ease-out';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  /**
   * Configurar lazy loading para imágenes
   */
  setupLazyLoading() {
    if (!this.lazyLoader) return;
    
    const lazyImages = this.container.querySelectorAll('[data-lazy="image"]');
    lazyImages.forEach(img => {
      this.lazyLoader.observe(img);
    });
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Event delegation para mejor rendimiento
    if (this.container) {
      this.container.addEventListener('click', this.handleCardClick.bind(this));
      this.container.addEventListener('keydown', this.handleCardKeydown.bind(this));
    }
    
    // Resize handler para responsive
    window.addEventListener('resize', DOMUtils.debounce(() => {
      this.handleResize();
    }, 250));
    
    // Scroll handler para virtual scrolling
    if (this.options.enableVirtualScrolling) {
      window.addEventListener('scroll', DOMUtils.throttle(() => {
        this.handleScroll();
      }, 16));
    }
  }

  /**
   * Manejar clicks en tarjetas
   * @param {Event} event
   */
  handleCardClick(event) {
    const target = event.target;
    const card = target.closest('[data-product-id]');
    
    if (!card) return;
    
    const productId = card.dataset.productId;
    
    // Determinar acción según el elemento clickeado
    if (target.closest('.btn-add-to-cart')) {
      event.preventDefault();
      this.addToCart(productId);
    } else if (target.closest('.btn-view-details')) {
      event.preventDefault();
      this.viewDetails(productId);
    } else if (target.closest('.btn-favorite')) {
      event.preventDefault();
      this.toggleFavorite(productId);
    } else if (target.closest('.btn-quick-view')) {
      event.preventDefault();
      this.showQuickView(productId);
    } else if (target.closest('.btn-toggle-description')) {
      event.preventDefault();
      this.toggleDescription(productId);
    } else if (target.closest('.gallery-dot')) {
      // El evento ya está manejado por el onclick del botón
    } else if (target.closest('.card-image, .card-title')) {
      // Click en imagen o título -> ver detalles
      this.viewDetails(productId);
    }
  }

  /**
   * Manejar navegación por teclado
   * @param {Event} event
   */
  handleCardKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      const card = event.target.closest('[data-product-id]');
      if (card) {
        event.preventDefault();
        const productId = card.dataset.productId;
        this.viewDetails(productId);
      }
    }
  }

  /**
   * Manejar resize de ventana
   */
  handleResize() {
    // Re-calcular layout si es necesario
    console.log('Resize detected, recalculating layout...');
  }

  /**
   * Manejar scroll para virtual scrolling
   */
  handleScroll() {
    // Implementar virtual scrolling si está habilitado
    if (this.options.enableVirtualScrolling) {
      console.log('Virtual scrolling...');
    }
  }

  // ===================================================
  // 🎯 MÉTODOS DE INTERACCIÓN
  // ===================================================

  /**
   * Agregar producto al carrito
   * @param {string} productId
   */
  addToCart(productId) {
    try {
      const product = this.products.find(p => p.id === productId);
      if (!product) {
        console.error('Product not found:', productId);
        return;
      }
      
      if (!product.available || product.stock === 0) {
        this.showNotification('Producto no disponible', 'error');
        return;
      }
      
      // Agregar al carrito (integración con store.js existente)
      if (window.store && window.store.agregarAlCarrito) {
        // Usar sistema existente
        window.store.agregarAlCarrito(productId);
      } else {
        // Sistema propio
        this.addToCartLocal(product);
      }
      
      // Feedback visual
      this.animateAddToCart(productId);
      
      console.log(`✅ Producto agregado al carrito: ${product.name}`);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showNotification('Error al agregar al carrito', 'error');
    }
  }

  /**
   * Agregar al carrito local
   * @param {Object} product
   */
  addToCartLocal(product) {
    let cart = JSON.parse(localStorage.getItem('patagonia_carrito')) || [];
    
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1
      });
    }
    
    localStorage.setItem('patagonia_carrito', JSON.stringify(cart));
    this.updateCartCounter();
    this.showNotification(`${product.name} agregado al carrito`, 'success');
  }

  /**
   * Ver detalles del producto
   * @param {string} productId
   */
  viewDetails(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    
    // Navegar a página de detalles
    const detailUrl = this.getProductDetailUrl(product);
    window.location.href = detailUrl;
  }

  /**
   * Obtener URL de detalles del producto
   * @param {Object} product
   * @returns {string}
   */
  getProductDetailUrl(product) {
    // Mapear productos a páginas específicas
    const pageMap = {
      'jar-001': 'jarro.html',
      'cua-001': 'cuaderno.html', 
      'yer-001': 'yerbera.html'
    };
    
    return pageMap[product.id] || `producto.html?id=${product.id}`;
  }

  /**
   * Toggle favorito
   * @param {string} productId
   */
  toggleFavorite(productId) {
    const favorites = JSON.parse(localStorage.getItem('patagonia_favorites')) || [];
    const index = favorites.indexOf(productId);
    
    if (index > -1) {
      favorites.splice(index, 1);
      this.showNotification('Eliminado de favoritos', 'info');
    } else {
      favorites.push(productId);
      this.showNotification('Agregado a favoritos', 'success');
    }
    
    localStorage.setItem('patagonia_favorites', JSON.stringify(favorites));
    this.updateFavoriteButton(productId, index === -1);
  }

  /**
   * Mostrar vista rápida
   * @param {string} productId
   */
  showQuickView(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    
    // Implementar modal de vista rápida
    console.log('Showing quick view for:', product.name);
    this.showNotification('Vista rápida próximamente...', 'info');
  }

  /**
   * Toggle descripción expandida
   * @param {string} productId
   */
  toggleDescription(productId) {
    const card = this.container.querySelector(`[data-product-id="${productId}"]`);
    if (!card) return;
    
    const shortDesc = card.querySelector('.short-description');
    const longDesc = card.querySelector('.long-description');
    const toggleBtn = card.querySelector('.btn-toggle-description');
    const toggleText = toggleBtn?.querySelector('.toggle-text');
    const toggleIcon = toggleBtn?.querySelector('.toggle-icon');
    
    if (!longDesc || !toggleBtn) return;
    
    const isExpanded = longDesc.style.display !== 'none';
    
    // Animar toggle
    if (isExpanded) {
      // Contraer
      longDesc.style.animation = 'fadeOutUp 0.3s ease-out';
      setTimeout(() => {
        longDesc.style.display = 'none';
        if (toggleText) toggleText.textContent = 'Ver más';
        if (toggleIcon) {
          toggleIcon.classList.remove('bi-chevron-up');
          toggleIcon.classList.add('bi-chevron-down');
        }
      }, 300);
    } else {
      // Expandir
      longDesc.style.display = 'block';
      longDesc.style.animation = 'fadeInDown 0.3s ease-out';
      if (toggleText) toggleText.textContent = 'Ver menos';
      if (toggleIcon) {
        toggleIcon.classList.remove('bi-chevron-down');
        toggleIcon.classList.add('bi-chevron-up');
      }
    }
  }

  /**
   * Cambiar imagen en galería
   * @param {string} productId
   * @param {number} imageIndex
   */
  changeImage(productId, imageIndex) {
    const card = this.container.querySelector(`[data-product-id="${productId}"]`);
    if (!card) return;
    
    const product = this.products.find(p => p.id === productId);
    if (!product || !product.images[imageIndex]) return;
    
    const image = card.querySelector('.card-image');
    const dots = card.querySelectorAll('.gallery-dot');
    
    if (image) {
      image.src = product.images[imageIndex];
      image.style.animation = 'fadeIn 0.3s ease-out';
    }
    
    // Actualizar dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === imageIndex);
    });
  }

  // ===================================================
  // 🎨 MÉTODOS DE ANIMACIÓN Y FEEDBACK
  // ===================================================

  /**
   * Animar agregado al carrito
   * @param {string} productId
   */
  animateAddToCart(productId) {
    const card = this.container.querySelector(`[data-product-id="${productId}"]`);
    if (!card) return;
    
    const button = card.querySelector('.btn-add-to-cart');
    if (!button) return;
    
    // Animación del botón
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 150);
    
    // Efecto de pulso
    const pulse = DOMUtils.createElement('div', {
      className: 'cart-pulse',
      style: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '20px',
        height: '20px',
        background: '#28a745',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%) scale(0)',
        animation: 'pulse 0.6s ease-out'
      }
    });
    
    button.style.position = 'relative';
    button.appendChild(pulse);
    
    setTimeout(() => {
      if (button.contains(pulse)) {
        button.removeChild(pulse);
      }
    }, 600);
  }

  /**
   * Actualizar botón de favorito
   * @param {string} productId
   * @param {boolean} isFavorite
   */
  updateFavoriteButton(productId, isFavorite) {
    const card = this.container.querySelector(`[data-product-id="${productId}"]`);
    if (!card) return;
    
    const favoriteBtn = card.querySelector('.btn-favorite i');
    if (favoriteBtn) {
      favoriteBtn.className = isFavorite ? 'bi bi-heart-fill' : 'bi bi-heart';
      favoriteBtn.style.color = isFavorite ? '#e74c3c' : '';
    }
  }

  /**
   * Actualizar contador de carrito
   */
  updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('patagonia_carrito')) || [];
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    
    const counter = DOMUtils.safeQuery('#cart-count');
    if (counter) {
      counter.textContent = totalItems;
      counter.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
  }

  /**
   * Mostrar notificación
   * @param {string} message
   * @param {string} type
   */
  showNotification(message, type = 'info') {
    // Usar sistema de notificaciones existente o crear uno propio
    if (window.mostrarNotificacion) {
      window.mostrarNotificacion(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  // ===================================================
  // 🔍 MÉTODOS DE FILTRADO Y BÚSQUEDA
  // ===================================================

  /**
   * Filtrar productos por término de búsqueda
   * @param {string} searchTerm
   */
  search(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (term === '') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => {
        return (
          product.name.toLowerCase().includes(term) ||
          product.shortDescription.toLowerCase().includes(term) ||
          product.longDescription.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term) ||
          product.tags?.some(tag => tag.toLowerCase().includes(term))
        );
      });
    }
    
    this.renderProducts();
    this.showNotification(`${this.filteredProducts.length} productos encontrados`, 'info');
  }

  /**
   * Filtrar por categoría
   * @param {string} category
   */
  filterByCategory(category) {
    if (!category || category === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => 
        product.category === category
      );
    }
    
    this.renderProducts();
  }

  /**
   * Filtrar por rango de precios
   * @param {number} minPrice
   * @param {number} maxPrice
   */
  filterByPrice(minPrice, maxPrice) {
    this.filteredProducts = this.products.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    );
    
    this.renderProducts();
  }

  /**
   * Ordenar productos
   * @param {string} sortBy - 'price', 'name', 'rating', 'newest'
   * @param {string} order - 'asc', 'desc'
   */
  sortProducts(sortBy, order = 'asc') {
    const sortFunctions = {
      price: (a, b) => order === 'asc' ? a.price - b.price : b.price - a.price,
      name: (a, b) => order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
      rating: (a, b) => order === 'asc' ? (a.rating || 0) - (b.rating || 0) : (b.rating || 0) - (a.rating || 0),
      newest: (a, b) => order === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id)
    };
    
    if (sortFunctions[sortBy]) {
      this.filteredProducts.sort(sortFunctions[sortBy]);
      this.renderProducts();
    }
  }

  // ===================================================
  // 🛠️ MÉTODOS DE UTILIDAD
  // ===================================================

  /**
   * Reintentar cargar producto con error
   * @param {string} productId
   */
  retryLoadProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      const cardContainer = this.renderedItems.get(productId)?.element;
      if (cardContainer) {
        const newCard = this.renderProductCard(product, 0);
        cardContainer.replaceWith(newCard);
        this.renderedItems.set(productId, {
          element: newCard,
          product: product,
          rendered: true
        });
      }
    }
  }

  /**
   * Obtener estadísticas de productos
   * @returns {Object}
   */
  getStats() {
    return {
      total: this.products.length,
      available: this.products.filter(p => p.available).length,
      categories: [...new Set(this.products.map(p => p.category))].length,
      averagePrice: this.products.reduce((sum, p) => sum + p.price, 0) / this.products.length,
      totalStock: this.products.reduce((sum, p) => sum + p.stock, 0)
    };
  }

  /**
   * Destruir el manager
   */
  destroy() {
    // Limpiar event listeners
    if (this.container) {
      this.container.removeEventListener('click', this.handleCardClick);
      this.container.removeEventListener('keydown', this.handleCardKeydown);
    }
    
    // Destruir lazy loader
    if (this.lazyLoader) {
      this.lazyLoader.destroy();
    }
    
    // Limpiar referencias
    this.renderedItems.clear();
    this.templateCache.clear();
    this.products = [];
    this.filteredProducts = [];
    
    console.log('ProductCardManager destroyed');
  }
}

// ===================================================
// 🚀 INICIALIZACIÓN GLOBAL
// ===================================================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Solo inicializar en páginas con contenedor de productos
  if (document.querySelector('#products-container, .products-container')) {
    window.productCardManager = new ProductCardManager({
      container: '#products-container, .products-container',
      cardTemplate: 'modern',
      enableLazyLoading: true,
      enableDescriptionToggle: true,
      enableImageGallery: true
    });
    
    console.log('🎉 ProductCardManager inicializado globalmente');
  }
});

// Exportar para uso modular
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProductCardManager, LazyLoader, DOMUtils };
}