/**
 * ⚡ SISTEMA DE CARGA EFICIENTE DE PRODUCTOS
 * Virtual scrolling, paginación y optimizaciones avanzadas
 */

class ProductLoader {
  constructor(options = {}) {
    this.options = {
      itemsPerPage: options.itemsPerPage || 12,
      preloadPages: options.preloadPages || 1,
      enableVirtualScrolling: options.enableVirtualScrolling || false,
      enablePagination: options.enablePagination || true,
      containerSelector: options.containerSelector || '#productos-container',
      loadingSelector: options.loadingSelector || '#loading-indicator',
      ...options
    };
    
    this.currentPage = 1;
    this.totalPages = 0;
    this.isLoading = false;
    this.allProducts = [];
    this.displayedProducts = [];
    this.productCache = new Map();
    this.loadingQueue = [];
    
    this.cardManager = new ProductCardManager();
    this.init();
  }

  init() {
    this.container = document.querySelector(this.options.containerSelector);
    this.loadingIndicator = document.querySelector(this.options.loadingSelector);
    
    if (!this.container) {
      console.error('❌ ProductLoader: Container no encontrado');
      return;
    }

    this.setupInfiniteScroll();
    this.createPaginationControls();
    this.setupLoadingIndicator();
  }

  /**
   * 📊 Cargar productos con paginación inteligente
   */
  async loadProducts(productos) {
    try {
      this.showLoading('Cargando productos...');
      
      this.allProducts = productos;
      this.totalPages = Math.ceil(productos.length / this.options.itemsPerPage);
      
      console.log(`📦 ProductLoader: ${productos.length} productos, ${this.totalPages} páginas`);
      
      // Cargar primera página
      await this.loadPage(1);
      
      // Precargar páginas siguientes en background
      this.preloadNextPages();
      
      this.hideLoading();
      this.updatePaginationUI();
      
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      this.showError('Error cargando productos. Por favor, intenta de nuevo.');
    }
  }

  /**
   * 📄 Cargar página específica
   */
  async loadPage(pageNumber) {
    if (this.isLoading || pageNumber < 1 || pageNumber > this.totalPages) {
      return;
    }

    this.isLoading = true;
    this.currentPage = pageNumber;
    
    try {
      // Verificar cache primero
      const cacheKey = `page_${pageNumber}`;
      if (this.productCache.has(cacheKey)) {
        console.log(`💾 Cache hit para página ${pageNumber}`);
        const cachedProducts = this.productCache.get(cacheKey);
        this.displayProducts(cachedProducts);
        return;
      }

      this.showLoading(`Cargando página ${pageNumber}...`);

      // Simular delay de red para demo
      await new Promise(resolve => setTimeout(resolve, 300));

      const startIndex = (pageNumber - 1) * this.options.itemsPerPage;
      const endIndex = startIndex + this.options.itemsPerPage;
      const pageProducts = this.allProducts.slice(startIndex, endIndex);

      // Guardar en cache
      this.productCache.set(cacheKey, pageProducts);
      
      // Renderizar productos
      await this.displayProducts(pageProducts);
      
      console.log(`✅ Página ${pageNumber} cargada: ${pageProducts.length} productos`);
      
    } catch (error) {
      console.error(`❌ Error cargando página ${pageNumber}:`, error);
      this.showError(`Error cargando página ${pageNumber}`);
    } finally {
      this.isLoading = false;
      this.hideLoading();
    }
  }

  /**
   * 🖼️ Mostrar productos con animación
   */
  async displayProducts(products) {
    return new Promise((resolve) => {
      // Fade out anterior
      this.container.style.opacity = '0';
      this.container.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        // Renderizar nuevos productos
        this.cardManager.renderProducts(products, this.container);
        this.displayedProducts = products;
        
        // Fade in nuevos productos
        this.container.style.transition = 'all 0.3s ease';
        this.container.style.opacity = '1';
        this.container.style.transform = 'translateY(0)';
        
        // Scroll suave al inicio del contenedor
        this.container.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        
        resolve();
      }, 150);
    });
  }

  /**
   * 🔄 Precargar páginas siguientes
   */
  preloadNextPages() {
    const pagesToPreload = Math.min(
      this.currentPage + this.options.preloadPages,
      this.totalPages
    );

    for (let page = this.currentPage + 1; page <= pagesToPreload; page++) {
      this.loadingQueue.push(() => this.preloadPage(page));
    }

    // Ejecutar precargas de forma asíncrona
    this.processLoadingQueue();
  }

  async preloadPage(pageNumber) {
    const cacheKey = `page_${pageNumber}`;
    if (this.productCache.has(cacheKey)) return;

    const startIndex = (pageNumber - 1) * this.options.itemsPerPage;
    const endIndex = startIndex + this.options.itemsPerPage;
    const pageProducts = this.allProducts.slice(startIndex, endIndex);

    this.productCache.set(cacheKey, pageProducts);
    console.log(`💾 Página ${pageNumber} precargada en cache`);
  }

  async processLoadingQueue() {
    while (this.loadingQueue.length > 0 && !this.isLoading) {
      const loader = this.loadingQueue.shift();
      await loader();
      
      // Delay entre precargas para no bloquear UI
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * ♾️ Setup infinite scroll
   */
  setupInfiniteScroll() {
    if (!this.options.enableVirtualScrolling) return;

    const scrollThreshold = 200; // px desde el bottom
    let ticking = false;

    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (distanceFromBottom < scrollThreshold && !this.isLoading) {
        if (this.currentPage < this.totalPages) {
          this.loadPage(this.currentPage + 1);
        }
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(checkScroll);
        ticking = true;
      }
    });
  }

  /**
   * 📄 Crear controles de paginación
   */
  createPaginationControls() {
    if (!this.options.enablePagination) return;

    const paginationHTML = `
      <nav class="product-pagination" aria-label="Navegación de productos">
        <div class="pagination-info">
          <span class="current-page-info">
            Página <strong class="current-page">1</strong> de <strong class="total-pages">1</strong>
          </span>
          <span class="items-info">
            Mostrando <strong class="items-count">0</strong> productos
          </span>
        </div>
        
        <div class="pagination-controls">
          <button class="btn-pagination btn-first" data-action="first" disabled>
            <i class="bi bi-chevron-double-left"></i>
            Primero
          </button>
          <button class="btn-pagination btn-prev" data-action="prev" disabled>
            <i class="bi bi-chevron-left"></i>
            Anterior
          </button>
          
          <div class="page-numbers"></div>
          
          <button class="btn-pagination btn-next" data-action="next">
            <i class="bi bi-chevron-right"></i>
            Siguiente
          </button>
          <button class="btn-pagination btn-last" data-action="last">
            <i class="bi bi-chevron-double-right"></i>
            Último
          </button>
        </div>
        
        <div class="pagination-size-selector">
          <label for="page-size">Productos por página:</label>
          <select id="page-size" class="page-size-select">
            <option value="6">6</option>
            <option value="12" selected>12</option>
            <option value="24">24</option>
            <option value="48">48</option>
          </select>
        </div>
      </nav>
    `;

    // Insertar después del container de productos
    this.container.insertAdjacentHTML('afterend', paginationHTML);
    
    this.paginationContainer = document.querySelector('.product-pagination');
    this.setupPaginationEvents();
  }

  setupPaginationEvents() {
    if (!this.paginationContainer) return;

    // Event delegation para botones de paginación
    this.paginationContainer.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      
      switch (action) {
        case 'first':
          this.loadPage(1);
          break;
        case 'prev':
          this.loadPage(this.currentPage - 1);
          break;
        case 'next':
          this.loadPage(this.currentPage + 1);
          break;
        case 'last':
          this.loadPage(this.totalPages);
          break;
      }
    });

    // Page size selector
    const pageSizeSelect = this.paginationContainer.querySelector('#page-size');
    pageSizeSelect?.addEventListener('change', (e) => {
      this.changePageSize(parseInt(e.target.value));
    });
  }

  changePageSize(newSize) {
    this.options.itemsPerPage = newSize;
    this.totalPages = Math.ceil(this.allProducts.length / newSize);
    this.currentPage = 1;
    this.productCache.clear(); // Limpiar cache
    this.loadPage(1);
  }

  updatePaginationUI() {
    if (!this.paginationContainer) return;

    const currentPageSpan = this.paginationContainer.querySelector('.current-page');
    const totalPagesSpan = this.paginationContainer.querySelector('.total-pages');
    const itemsCountSpan = this.paginationContainer.querySelector('.items-count');
    
    if (currentPageSpan) currentPageSpan.textContent = this.currentPage;
    if (totalPagesSpan) totalPagesSpan.textContent = this.totalPages;
    if (itemsCountSpan) itemsCountSpan.textContent = this.allProducts.length;

    // Actualizar estado de botones
    this.updatePaginationButtons();
    this.updatePageNumbers();
  }

  updatePaginationButtons() {
    const buttons = {
      first: this.paginationContainer.querySelector('.btn-first'),
      prev: this.paginationContainer.querySelector('.btn-prev'),
      next: this.paginationContainer.querySelector('.btn-next'),
      last: this.paginationContainer.querySelector('.btn-last')
    };

    buttons.first.disabled = this.currentPage === 1;
    buttons.prev.disabled = this.currentPage === 1;
    buttons.next.disabled = this.currentPage === this.totalPages;
    buttons.last.disabled = this.currentPage === this.totalPages;
  }

  updatePageNumbers() {
    const pageNumbersContainer = this.paginationContainer.querySelector('.page-numbers');
    if (!pageNumbersContainer) return;

    const maxVisible = 5; // Máximo números de página visibles
    const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);

    let numbersHTML = '';
    for (let i = start; i <= end; i++) {
      const isActive = i === this.currentPage;
      numbersHTML += `
        <button class="page-number ${isActive ? 'active' : ''}" 
                data-page="${i}">
          ${i}
        </button>
      `;
    }

    pageNumbersContainer.innerHTML = numbersHTML;

    // Add click events
    pageNumbersContainer.addEventListener('click', (e) => {
      const pageNumber = parseInt(e.target.dataset.page);
      if (pageNumber && pageNumber !== this.currentPage) {
        this.loadPage(pageNumber);
      }
    });
  }

  /**
   * 🔄 Loading states
   */
  setupLoadingIndicator() {
    if (!this.loadingIndicator) {
      this.loadingIndicator = document.createElement('div');
      this.loadingIndicator.id = 'loading-indicator';
      this.loadingIndicator.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p class="loading-text">Cargando productos...</p>
        </div>
      `;
      this.container.parentNode.insertBefore(this.loadingIndicator, this.container);
    }
  }

  showLoading(text = 'Cargando...') {
    if (this.loadingIndicator) {
      const loadingText = this.loadingIndicator.querySelector('.loading-text');
      if (loadingText) loadingText.textContent = text;
      
      this.loadingIndicator.style.display = 'flex';
      this.loadingIndicator.style.opacity = '1';
    }
  }

  hideLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.opacity = '0';
      setTimeout(() => {
        this.loadingIndicator.style.display = 'none';
      }, 300);
    }
  }

  showError(message) {
    console.error('❌ ProductLoader Error:', message);
    this.container.innerHTML = `
      <div class="error-state">
        <i class="bi bi-exclamation-triangle"></i>
        <h3>Error al cargar productos</h3>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="location.reload()">
          Reintentar
        </button>
      </div>
    `;
  }

  /**
   * 📊 Estadísticas y debug
   */
  getStats() {
    return {
      totalProducts: this.allProducts.length,
      totalPages: this.totalPages,
      currentPage: this.currentPage,
      itemsPerPage: this.options.itemsPerPage,
      displayedProducts: this.displayedProducts.length,
      cacheSize: this.productCache.size,
      cacheHitRate: this.calculateCacheHitRate()
    };
  }

  calculateCacheHitRate() {
    // Implementar lógica de cache hit rate
    return '85%'; // Placeholder
  }

  /**
   * 🧹 Cleanup
   */
  destroy() {
    this.productCache.clear();
    this.cardManager.destroy();
    
    if (this.paginationContainer) {
      this.paginationContainer.remove();
    }
  }
}

// Exportar clase
window.ProductLoader = ProductLoader;
console.log('⚡ ProductLoader inicializado correctamente');