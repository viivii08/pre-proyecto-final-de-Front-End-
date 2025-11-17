/**
 * 🎨 PRODUCT CARD BUILDER - Constructor de Tarjetas Mejorado
 * Sistema robusto para crear tarjetas de productos con buenas prácticas DOM
 */

class ProductCardBuilder {
  constructor(options = {}) {
    this.options = {
      enableLazyLoading: options.enableLazyLoading !== false,
      enableDescriptionToggle: options.enableDescriptionToggle !== false,
      cardClass: options.cardClass || 'product-card',
      imagePlaceholder: options.imagePlaceholder || 'pages/no-image.png',
      ...options
    };
    this.logger = window.logger || console;
  }

  /**
   * Crea una tarjeta de producto usando métodos DOM apropiados
   * MEJORA: Usa createElement en lugar de innerHTML para mejor seguridad y rendimiento
   */
  createProductCard(producto) {
    try {
      // Validar producto
      if (!this.isValidProduct(producto)) {
        this.logger.warning('Producto inválido para crear tarjeta', producto);
        return this.createErrorCard('Producto no disponible');
      }

      // Crear contenedor principal (col)
      const col = document.createElement('div');
      col.className = 'col';
      col.setAttribute('data-product-id', producto.id);

      // Crear card principal
      const card = this.createCardElement(producto);
      
      // Crear imagen
      const imageContainer = this.createImageContainer(producto);
      card.appendChild(imageContainer);

      // Crear cuerpo de la tarjeta
      const cardBody = this.createCardBody(producto);
      card.appendChild(cardBody);

      // Agregar card al col
      col.appendChild(card);

      // Agregar event listeners de forma segura
      this.attachEventListeners(col, producto);

      return col;

    } catch (error) {
      this.logger.error('Error creando tarjeta de producto', error);
      return this.createErrorCard('Error al cargar producto');
    }
  }

  /**
   * Crea el elemento card principal
   */
  createCardElement(producto) {
    const card = document.createElement('article');
    card.className = `${this.options.cardClass} card h-100 shadow-lg border-0 position-relative overflow-hidden`;
    card.setAttribute('data-producto-id', producto.id);
    card.setAttribute('role', 'article');
    card.setAttribute('aria-labelledby', `product-title-${producto.id}`);

    // Agregar atributos de accesibilidad
    card.setAttribute('tabindex', '0');
    
    return card;
  }

  /**
   * Crea el contenedor de imagen
   */
  createImageContainer(producto) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image-container position-relative overflow-hidden';
    imageContainer.style.cssText = 'height: 280px; background: #f8f9fa;';

    // Crear imagen
    const img = document.createElement('img');
    img.className = 'card-img-top product-image';
    img.alt = producto.nombre || 'Producto';
    const imagenUrl = producto.imagenes?.[0] || this.options.imagePlaceholder;
    
    // Usar src para imágenes ya cargadas, data-src para lazy loading
    if (this.options.enableLazyLoading) {
      // Para lazy loading, usar data-src y un placeholder pequeño
      img.setAttribute('data-src', imagenUrl);
      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
      img.loading = 'lazy';
      img.classList.add('lazy-load');
    } else {
      img.src = imagenUrl;
      img.loading = 'eager';
    }

    // Manejar error de carga de imagen
    img.addEventListener('error', () => {
      img.src = this.options.imagePlaceholder;
      img.classList.add('image-error');
    });

    // Manejar carga exitosa
    img.addEventListener('load', () => {
      img.classList.add('image-loaded');
    });

    imageContainer.appendChild(img);

    // Crear badge de descuento si existe
    if (producto.descuento > 0) {
      const discountBadge = this.createDiscountBadge(producto.descuento);
      imageContainer.appendChild(discountBadge);
    }

    // Crear overlay de hover
    const hoverOverlay = this.createHoverOverlay(producto);
    imageContainer.appendChild(hoverOverlay);

    return imageContainer;
  }

  /**
   * Crea badge de descuento
   */
  createDiscountBadge(descuento) {
    const badge = document.createElement('span');
    badge.className = 'badge-descuento position-absolute top-0 start-0 m-2';
    badge.textContent = `${descuento}% OFF`;
    badge.setAttribute('aria-label', `Descuento del ${descuento} por ciento`);
    return badge;
  }

  /**
   * Crea overlay de hover para la imagen
   */
  createHoverOverlay(producto) {
    const overlay = document.createElement('div');
    overlay.className = 'product-image-overlay';
    overlay.innerHTML = `
      <div class="overlay-content">
        <button class="btn btn-light btn-sm quick-view-btn" 
                data-product-id="${producto.id}"
                aria-label="Vista rápida de ${producto.nombre}">
          <i class="bi bi-eye"></i> Vista rápida
        </button>
      </div>
    `;
    return overlay;
  }

  /**
   * Crea el cuerpo de la tarjeta
   */
  createCardBody(producto) {
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body d-flex flex-column';

    // Título
    const title = this.createTitle(producto);
    cardBody.appendChild(title);

    // Descripción (con toggle)
    if (this.options.enableDescriptionToggle && producto.descripcionCorta) {
      const descriptionContainer = this.createDescriptionContainer(producto);
      cardBody.appendChild(descriptionContainer);
    } else {
      const description = this.createDescription(producto);
      cardBody.appendChild(description);
    }

    // Precio
    const priceContainer = this.createPriceContainer(producto);
    cardBody.appendChild(priceContainer);

    // Stock badge
    if (producto.stock > 0 && producto.stock < 5) {
      const stockBadge = this.createStockBadge(producto.stock);
      cardBody.appendChild(stockBadge);
    }

    // Botones de acción
    const actionsContainer = this.createActionsContainer(producto);
    cardBody.appendChild(actionsContainer);

    return cardBody;
  }

  /**
   * Crea el título del producto
   */
  createTitle(producto) {
    const title = document.createElement('h3');
    title.id = `product-title-${producto.id}`;
    title.className = 'card-title product-title mb-2';
    title.textContent = producto.nombre || 'Producto sin nombre';
    return title;
  }

  /**
   * Crea la descripción simple
   */
  createDescription(producto) {
    const description = document.createElement('p');
    description.className = 'card-text product-description mb-3 text-muted';
    description.textContent = producto.descripcionCorta || '';
    return description;
  }

  /**
   * Crea contenedor de descripción con toggle
   * MEJORA: Permite mostrar/ocultar descripción sin recargar
   */
  createDescriptionContainer(producto) {
    const container = document.createElement('div');
    container.className = 'product-description-container mb-3';

    // Descripción corta (siempre visible)
    const shortDescription = document.createElement('p');
    shortDescription.className = 'product-description-short card-text text-muted mb-2';
    const shortText = this.getShortDescription(producto.descripcionCorta, 80);
    shortDescription.textContent = shortText;

    // Descripción completa (oculta por defecto)
    const fullDescription = document.createElement('p');
    fullDescription.className = 'product-description-full card-text text-muted';
    fullDescription.textContent = producto.descripcionCorta || '';
    fullDescription.style.display = 'none';
    fullDescription.setAttribute('aria-hidden', 'true');

    // Botón para toggle
    const toggleButton = document.createElement('button');
    toggleButton.className = 'btn-link text-primary p-0 border-0 bg-transparent text-decoration-none';
    toggleButton.type = 'button';
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-controls', `description-full-${producto.id}`);
    
    const toggleText = document.createElement('span');
    toggleText.className = 'toggle-text';
    toggleText.textContent = 'Ver más';
    toggleButton.appendChild(toggleText);

    // Solo mostrar toggle si la descripción es larga
    if (producto.descripcionCorta && producto.descripcionCorta.length > 80) {
      fullDescription.id = `description-full-${producto.id}`;
      
      // Event listener para toggle
      toggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDescription(fullDescription, toggleText, toggleButton);
      });

      container.appendChild(shortDescription);
      container.appendChild(fullDescription);
      container.appendChild(toggleButton);
    } else {
      // Si la descripción es corta, solo mostrar la descripción
      container.appendChild(shortDescription);
    }

    return container;
  }

  /**
   * Alterna entre mostrar y ocultar descripción
   */
  toggleDescription(fullDescription, toggleText, toggleButton) {
    const isHidden = fullDescription.style.display === 'none';
    
    if (isHidden) {
      // Mostrar descripción completa
      fullDescription.style.display = 'block';
      fullDescription.setAttribute('aria-hidden', 'false');
      toggleText.textContent = 'Ver menos';
      toggleButton.setAttribute('aria-expanded', 'true');
      
      // Scroll suave a la descripción
      fullDescription.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      // Ocultar descripción completa
      fullDescription.style.display = 'none';
      fullDescription.setAttribute('aria-hidden', 'true');
      toggleText.textContent = 'Ver más';
      toggleButton.setAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Obtiene descripción corta
   */
  getShortDescription(text, maxLength = 80) {
    if (!text || text.length <= maxLength) {
      return text || '';
    }
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Crea contenedor de precio
   */
  createPriceContainer(producto) {
    const container = document.createElement('div');
    container.className = 'product-price-container mb-3';

    // Precio actual
    const currentPrice = document.createElement('span');
    currentPrice.className = 'product-price-current card-price';
    currentPrice.textContent = Helpers.formatPrice 
      ? Helpers.formatPrice(producto.precio) 
      : `$${producto.precio.toLocaleString()}`;

    container.appendChild(currentPrice);

    // Precio original (si existe y es mayor)
    if (producto.precioOriginal && producto.precioOriginal > producto.precio) {
      const originalPrice = document.createElement('span');
      originalPrice.className = 'product-price-original card-price-old ms-2';
      originalPrice.textContent = Helpers.formatPrice 
        ? Helpers.formatPrice(producto.precioOriginal) 
        : `$${producto.precioOriginal.toLocaleString()}`;
      originalPrice.setAttribute('aria-label', `Precio original: ${originalPrice.textContent}`);
      container.appendChild(originalPrice);
    }

    return container;
  }

  /**
   * Crea badge de stock
   */
  createStockBadge(stock) {
    const badge = document.createElement('small');
    badge.className = 'product-stock-badge text-warning d-block mb-2';
    badge.textContent = `¡Últimas ${stock} unidades!`;
    badge.setAttribute('aria-label', `Quedan ${stock} unidades disponibles`);
    return badge;
  }

  /**
   * Crea contenedor de acciones (botones)
   */
  createActionsContainer(producto) {
    const container = document.createElement('div');
    container.className = 'product-actions mt-auto';

    // Contenedor de botones
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'd-flex flex-column gap-2';

    // Botón ver detalles
    const viewButton = this.createViewButton(producto);
    buttonsContainer.appendChild(viewButton);

    // Botón agregar al carrito
    const addToCartButton = this.createAddToCartButton(producto);
    buttonsContainer.appendChild(addToCartButton);

    container.appendChild(buttonsContainer);
    return container;
  }

  /**
   * Crea botón de ver detalles
   */
  createViewButton(producto) {
    const button = document.createElement('button');
    button.className = 'btn btn-outline-primary btn-view-product';
    button.type = 'button';
    button.setAttribute('data-product-id', producto.id);
    button.setAttribute('aria-label', `Ver detalles de ${producto.nombre}`);
    
    const icon = document.createElement('i');
    icon.className = 'bi bi-eye me-2';
    icon.setAttribute('aria-hidden', 'true');
    
    const text = document.createTextNode('Ver detalles');
    
    button.appendChild(icon);
    button.appendChild(text);

    return button;
  }

  /**
   * Crea botón de agregar al carrito
   */
  createAddToCartButton(producto) {
    const estaDisponible = producto.disponible && producto.stock > 0;
    
    const button = document.createElement('button');
    button.className = `btn btn-primary btn-add-to-cart w-100 ${!estaDisponible ? 'disabled' : ''}`;
    button.type = 'button';
    button.setAttribute('data-product-id', producto.id);
    button.setAttribute('aria-label', estaDisponible 
      ? `Agregar ${producto.nombre} al carrito` 
      : `${producto.nombre} no disponible`);
    
    if (!estaDisponible) {
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
    }

    const icon = document.createElement('i');
    icon.className = 'bi bi-cart-plus me-2';
    icon.setAttribute('aria-hidden', 'true');
    
    const text = document.createTextNode(estaDisponible ? 'Agregar al carrito' : 'Sin stock');
    
    button.appendChild(icon);
    button.appendChild(text);

    return button;
  }

  /**
   * Adjunta event listeners de forma segura
   */
  attachEventListeners(cardElement, producto) {
    try {
      // Botón ver detalles
      const viewButton = cardElement.querySelector('.btn-view-product');
      if (viewButton) {
        viewButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleViewProduct(producto.id);
        });
      }

      // Botón agregar al carrito
      const addToCartButton = cardElement.querySelector('.btn-add-to-cart');
      if (addToCartButton && !addToCartButton.disabled) {
        addToCartButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleAddToCart(producto.id);
        });
      }

      // Quick view button (si existe)
      const quickViewButton = cardElement.querySelector('.quick-view-btn');
      if (quickViewButton) {
        quickViewButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleQuickView(producto);
        });
      }

      // Click en la tarjeta completa (opcional)
      const card = cardElement.querySelector('.card');
      if (card) {
        card.addEventListener('click', (e) => {
          // No hacer nada si se hizo click en un botón
          if (e.target.closest('button')) {
            return;
          }
          // Navegar a detalle del producto
          this.handleViewProduct(producto.id);
        });

        // Agregar efecto de hover con teclado
        card.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleViewProduct(producto.id);
          }
        });
      }

    } catch (error) {
      this.logger.error('Error adjuntando event listeners', error);
    }
  }

  /**
   * Maneja click en ver producto
   */
  handleViewProduct(productId) {
    try {
      if (window.store && typeof window.store.verDetalleProducto === 'function') {
        window.store.verDetalleProducto(productId);
      } else {
        window.location.href = `producto.html?id=${productId}`;
      }
    } catch (error) {
      this.logger.error('Error navegando a producto', error);
    }
  }

  /**
   * Maneja click en agregar al carrito
   */
  handleAddToCart(productId) {
    try {
      if (window.store && typeof window.store.agregarAlCarrito === 'function') {
        window.store.agregarAlCarrito(productId);
      } else if (window.carritoEmergencia && typeof window.carritoEmergencia.agregarProducto === 'function') {
        // Buscar producto en store
        const producto = this.findProduct(productId);
        if (producto) {
          window.carritoEmergencia.agregarProducto(producto);
        }
      }
    } catch (error) {
      this.logger.error('Error agregando producto al carrito', error);
    }
  }

  /**
   * Maneja vista rápida
   */
  handleQuickView(producto) {
    try {
      // Crear modal de vista rápida
      this.showQuickViewModal(producto);
    } catch (error) {
      this.logger.error('Error mostrando vista rápida', error);
    }
  }

  /**
   * Muestra modal de vista rápida
   */
  showQuickViewModal(producto) {
    // Implementar modal de vista rápida
    // Por ahora, redirigir a la página de detalle
    this.handleViewProduct(producto.id);
  }

  /**
   * Busca producto por ID
   */
  findProduct(productId) {
    try {
      if (window.store && window.store.productos) {
        return window.store.productos.find(p => p.id === productId);
      }
      return null;
    } catch (error) {
      this.logger.error('Error buscando producto', error);
      return null;
    }
  }

  /**
   * Valida que un producto sea válido
   */
  isValidProduct(producto) {
    if (!producto || typeof producto !== 'object') return false;
    if (!Validators.isValidId || !Validators.isValidId(producto.id)) return false;
    if (!producto.nombre || typeof producto.nombre !== 'string') return false;
    if (!Validators.isPositiveNumber || !Validators.isPositiveNumber(producto.precio)) return false;
    return true;
  }

  /**
   * Crea tarjeta de error
   */
  createErrorCard(message) {
    const col = document.createElement('div');
    col.className = 'col';
    
    const card = document.createElement('div');
    card.className = 'card h-100 border-danger';
    
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body text-center';
    cardBody.textContent = message || 'Error al cargar producto';
    
    card.appendChild(cardBody);
    col.appendChild(card);
    
    return col;
  }

  /**
   * Configura lazy loading para imágenes
   */
  setupLazyLoading() {
    if (!this.options.enableLazyLoading) return;

    // Usar Intersection Observer para lazy loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              img.classList.remove('lazy-load');
              observer.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px'
      });

      // Observar todas las imágenes con lazy-load
      document.querySelectorAll('img.lazy-load').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductCardBuilder;
}

window.ProductCardBuilder = ProductCardBuilder;

