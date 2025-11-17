/**
 * 🚀 PRODUCT RENDERER - Renderizador Eficiente y Escalable
 * Sistema optimizado para renderizar productos con lazy loading y virtual scrolling
 */

class ProductRenderer {
  constructor(options = {}) {
    this.options = {
      containerSelector: options.containerSelector || '#productos-container',
      itemsPerPage: options.itemsPerPage || 12,
      enablePagination: options.enablePagination !== false,
      enableLazyLoading: options.enableLazyLoading !== false,
      enableVirtualScrolling: options.enableVirtualScrolling || false,
      cardBuilder: options.cardBuilder || new ProductCardBuilder(),
      ...options
    };
    
    this.container = null;
    this.currentPage = 1;
    this.allProducts = [];
    this.filteredProducts = [];
    this.renderedProducts = [];
    this.isLoading = false;
    this.observer = null;
    this.logger = window.logger || console;
    
    this.init();
  }

  /**
   * Inicializa el renderizador
   */
  init() {
    try {
      this.container = document.querySelector(this.options.containerSelector);
      
      if (!this.container) {
        this.logger.warning('Contenedor de productos no encontrado', this.options.containerSelector);
        return;
      }

      // Configurar lazy loading si está habilitado
      if (this.options.enableLazyLoading) {
        this.setupLazyLoading();
      }

      // Configurar virtual scrolling si está habilitado
      if (this.options.enableVirtualScrolling) {
        this.setupVirtualScrolling();
      }

      this.logger.success('ProductRenderer inicializado correctamente');

    } catch (error) {
      this.logger.error('Error inicializando ProductRenderer', error);
    }
  }

  /**
   * Renderiza productos de forma eficiente
   * MEJORA: Usa DocumentFragment y renderiza en batches
   */
  renderProducts(productos, options = {}) {
    try {
      if (!this.container) {
        this.logger.warning('Contenedor no disponible');
        return;
      }

      // Validar productos
      if (!Array.isArray(productos) || productos.length === 0) {
        this.renderEmptyState();
        return;
      }

      this.allProducts = productos;
      this.filteredProducts = [...productos];

      // Limpiar contenedor de forma eficiente
      this.clearContainer();

      // Renderizar productos
      if (this.options.enablePagination) {
        this.renderWithPagination();
      } else {
        this.renderAll();
      }

      // Configurar lazy loading después de renderizar
      if (this.options.enableLazyLoading) {
        setTimeout(() => {
          this.setupLazyLoading();
        }, 100);
      }

      this.logger.success(`Productos renderizados: ${this.renderedProducts.length}`);

    } catch (error) {
      this.logger.error('Error renderizando productos', error);
      this.renderErrorState(error);
    }
  }

  /**
   * Renderiza todos los productos
   */
  renderAll() {
    const startTime = performance.now();
    const fragment = document.createDocumentFragment();
    let renderedCount = 0;

    // MEJORA: Usar requestAnimationFrame para renderizado en batches
    this.renderBatch(this.filteredProducts, 0, fragment, () => {
      this.container.appendChild(fragment);
      const duration = performance.now() - startTime;
      this.logger.info(`Renderizado completado en ${duration.toFixed(2)}ms`);
      
      // Agregar animaciones de entrada
      this.animateCardsIn();
    });
  }

  /**
   * Renderiza productos en batches para mejor rendimiento
   */
  renderBatch(products, index, fragment, callback) {
    const batchSize = 10; // Renderizar 10 productos por batch
    const endIndex = Math.min(index + batchSize, products.length);

    for (let i = index; i < endIndex; i++) {
      try {
        const producto = products[i];
        
        // Validar producto
        if (!this.options.cardBuilder.isValidProduct(producto)) {
          this.logger.warning('Producto inválido omitido', producto);
          continue;
        }

        // Crear tarjeta
        const card = this.options.cardBuilder.createProductCard(producto);
        fragment.appendChild(card);
        this.renderedProducts.push(producto);
        renderedCount++;

      } catch (error) {
        this.logger.error(`Error renderizando producto ${i}`, error);
      }
    }

    // Continuar con el siguiente batch
    if (endIndex < products.length) {
      requestAnimationFrame(() => {
        this.renderBatch(products, endIndex, fragment, callback);
      });
    } else {
      // Todos los productos renderizados
      if (callback) callback();
    }
  }

  /**
   * Renderiza con paginación
   */
  renderWithPagination() {
    const startIndex = (this.currentPage - 1) * this.options.itemsPerPage;
    const endIndex = startIndex + this.options.itemsPerPage;
    const productsToRender = this.filteredProducts.slice(startIndex, endIndex);

    const fragment = document.createDocumentFragment();

    for (const producto of productsToRender) {
      try {
        if (!this.options.cardBuilder.isValidProduct(producto)) {
          continue;
        }

        const card = this.options.cardBuilder.createProductCard(producto);
        fragment.appendChild(card);
        this.renderedProducts.push(producto);

      } catch (error) {
        this.logger.error('Error renderizando producto', error);
      }
    }

    this.container.appendChild(fragment);
    this.animateCardsIn();

    // Renderizar controles de paginación
    this.renderPaginationControls();
  }

  /**
   * Limpia el contenedor de forma eficiente
   */
  clearContainer() {
    try {
      // MEJORA: Usar textContent = '' en lugar de innerHTML = '' para mejor rendimiento
      // Pero primero necesitamos remover event listeners si existen
      this.removeEventListeners();
      
      // Limpiar contenedor
      while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
      }

      this.renderedProducts = [];

    } catch (error) {
      this.logger.error('Error limpiando contenedor', error);
    }
  }

  /**
   * Remueve event listeners antes de limpiar
   */
  removeEventListeners() {
    // Los event listeners se removerán automáticamente cuando se eliminen los elementos
    // Pero podemos agregar lógica adicional si es necesario
  }

  /**
   * Renderiza estado vacío
   */
  renderEmptyState() {
    if (!this.container) return;

    const emptyState = document.createElement('div');
    emptyState.className = 'col-12 text-center py-5';
    emptyState.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-search fs-1 text-muted mb-3" aria-hidden="true"></i>
        <h3 class="text-muted">No se encontraron productos</h3>
        <p class="text-muted">Intenta con otros términos de búsqueda o filtros</p>
      </div>
    `;

    this.container.appendChild(emptyState);
  }

  /**
   * Renderiza estado de error
   */
  renderErrorState(error) {
    if (!this.container) return;

    const errorState = document.createElement('div');
    errorState.className = 'col-12 text-center py-5';
    errorState.innerHTML = `
      <div class="error-state">
        <i class="bi bi-exclamation-triangle fs-1 text-danger mb-3" aria-hidden="true"></i>
        <h3 class="text-danger">Error al cargar productos</h3>
        <p class="text-muted">${error?.message || 'Ocurrió un error inesperado'}</p>
        <button class="btn btn-primary mt-3" onclick="location.reload()">
          Recargar página
        </button>
      </div>
    `;

    this.container.appendChild(errorState);
  }

  /**
   * Configura lazy loading para imágenes
   */
  setupLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      this.logger.warning('IntersectionObserver no soportado, usando carga normal');
      return;
    }

    // Limpiar observer anterior si existe
    if (this.observer) {
      this.observer.disconnect();
    }

    // Crear nuevo observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Cargar imagen
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.remove('lazy-load');
            img.classList.add('image-loading');
            
            // Manejar carga
            img.addEventListener('load', () => {
              img.classList.remove('image-loading');
              img.classList.add('image-loaded');
            }, { once: true });

            // Manejar error
            img.addEventListener('error', () => {
              img.src = this.options.cardBuilder.options.imagePlaceholder;
              img.classList.remove('image-loading');
              img.classList.add('image-error');
            }, { once: true });

            this.observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.01
    });

    // Observar todas las imágenes con lazy-load
    const lazyImages = this.container.querySelectorAll('img.lazy-load');
    lazyImages.forEach(img => {
      this.observer.observe(img);
    });

    this.logger.info(`Lazy loading configurado para ${lazyImages.length} imágenes`);
  }

  /**
   * Configura virtual scrolling (para listas muy grandes)
   */
  setupVirtualScrolling() {
    // Implementación básica de virtual scrolling
    // Solo renderiza los productos visibles en el viewport
    if (!('IntersectionObserver' in window)) {
      return;
    }

    // Crear sentinela al final del contenedor
    const sentinel = document.createElement('div');
    sentinel.className = 'scroll-sentinel';
    sentinel.style.cssText = 'height: 1px; width: 100%;';

    // Observer para detectar cuando el sentinela es visible
    const sentinelObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoading) {
          this.loadMoreProducts();
        }
      });
    }, {
      rootMargin: '100px'
    });

    sentinelObserver.observe(sentinel);
    this.container.appendChild(sentinel);
  }

  /**
   * Carga más productos (para paginación infinita)
   */
  loadMoreProducts() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.currentPage++;

    const startIndex = (this.currentPage - 1) * this.options.itemsPerPage;
    const endIndex = startIndex + this.options.itemsPerPage;
    const productsToRender = this.filteredProducts.slice(startIndex, endIndex);

    if (productsToRender.length === 0) {
      this.isLoading = false;
      return;
    }

    const fragment = document.createDocumentFragment();

    for (const producto of productsToRender) {
      try {
        if (!this.options.cardBuilder.isValidProduct(producto)) {
          continue;
        }

        const card = this.options.cardBuilder.createProductCard(producto);
        fragment.appendChild(card);
        this.renderedProducts.push(producto);

      } catch (error) {
        this.logger.error('Error renderizando producto', error);
      }
    }

    this.container.appendChild(fragment);
    this.isLoading = false;

    // Re-configurar lazy loading para las nuevas imágenes
    if (this.options.enableLazyLoading) {
      this.setupLazyLoading();
    }
  }

  /**
   * Renderiza controles de paginación
   */
  renderPaginationControls() {
    // Remover controles existentes
    const existingControls = document.querySelector('.pagination-controls');
    if (existingControls) {
      existingControls.remove();
    }

    const totalPages = Math.ceil(this.filteredProducts.length / this.options.itemsPerPage);

    if (totalPages <= 1) {
      return; // No mostrar paginación si solo hay una página
    }

    const controls = document.createElement('nav');
    controls.className = 'pagination-controls mt-4';
    controls.setAttribute('aria-label', 'Paginación de productos');

    const pagination = document.createElement('ul');
    pagination.className = 'pagination justify-content-center';

    // Botón anterior
    const prevButton = this.createPaginationButton('Anterior', this.currentPage > 1, () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderWithPagination();
      }
    });
    pagination.appendChild(prevButton);

    // Números de página
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = this.createPaginationButton(i.toString(), true, () => {
        this.currentPage = i;
        this.renderWithPagination();
      }, i === this.currentPage);
      pagination.appendChild(pageButton);
    }

    // Botón siguiente
    const nextButton = this.createPaginationButton('Siguiente', this.currentPage < totalPages, () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderWithPagination();
      }
    });
    pagination.appendChild(nextButton);

    controls.appendChild(pagination);
    this.container.parentElement.appendChild(controls);
  }

  /**
   * Crea botón de paginación
   */
  createPaginationButton(text, enabled, onClick, isActive = false) {
    const li = document.createElement('li');
    li.className = `page-item ${!enabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;

    const button = document.createElement('button');
    button.className = 'page-link';
    button.type = 'button';
    button.textContent = text;
    button.disabled = !enabled;

    if (enabled) {
      button.addEventListener('click', onClick);
    }

    li.appendChild(button);
    return li;
  }

  /**
   * Anima las tarjetas al entrar
   */
  animateCardsIn() {
    const cards = this.container.querySelectorAll('.product-card');
    
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 50); // Stagger animation
    });
  }

  /**
   * Actualiza productos filtrados
   */
  updateFilteredProducts(productos) {
    this.filteredProducts = productos;
    this.currentPage = 1;
    this.renderProducts(productos);
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductRenderer;
}

window.ProductRenderer = ProductRenderer;

