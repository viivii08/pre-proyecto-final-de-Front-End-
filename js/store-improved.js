/**
 * 🛍️ SISTEMA DE GESTIÓN DE PRODUCTOS MEJORADO
 * Patagonia Style - Versión mejorada con buenas prácticas
 */

// Cargar utilidades si están disponibles
const logger = window.logger || console;
const Validators = window.Validators || {};
const Helpers = window.Helpers || {};

class PatagoniaStore {
  constructor() {
    this.productos = [];
    this.categorias = [];
    this.configuracion = {};
    this.carrito = this.cargarCarrito();
    this.init();
  }

  async init() {
    try {
      logger.info('Inicializando PatagoniaStore...');
      await this.cargarProductos();
      this.renderizarProductos();
      this.actualizarContadorCarrito();
      this.inicializarEventos();
      logger.success('PatagoniaStore inicializado correctamente');
    } catch (error) {
      logger.error('Error inicializando PatagoniaStore', error);
      this.productosFallback();
    }
  }

  async cargarProductos() {
    try {
      const response = await fetch('./data/productos.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validar estructura de datos
      if (!data.productos || !Array.isArray(data.productos)) {
        throw new Error('Formato de datos inválido: productos no es un array');
      }
      
      this.productos = data.productos;
      this.categorias = data.categorias || [];
      this.configuracion = data.configuracion || {};
      
      logger.info(`Productos cargados: ${this.productos.length}`);
      logger.table(this.productos.slice(0, 5)); // Mostrar primeros 5 en tabla
      
    } catch (error) {
      logger.error('Error al cargar productos', error);
      this.productosFallback();
    }
  }

  productosFallback() {
    logger.warning('Usando productos de fallback');
    this.productos = [
      {
        id: 1,
        nombre: "Jarro Zorrito Invierno",
        precio: 21900,
        precioOriginal: 23900,
        descuento: 8,
        stock: 15,
        disponible: true,
        descripcionCorta: "Jarro enlozado inspirado en la Patagonia. Capacidad 330ml.",
        imagenes: ["pages/jarroportada.webp"],
        categoria: "jarros",
        sku: "JAR-ZOR-INV-001"
      },
      {
        id: 2,
        nombre: "Cuaderno Zorro",
        precio: 18900,
        precioOriginal: 21900,
        descuento: 14,
        stock: 28,
        disponible: true,
        descripcionCorta: "Cuaderno anillado A4 con diseño original de vivipinta.",
        imagenes: ["pages/cuadernoportada.webp"],
        categoria: "papeleria",
        sku: "CUAD-ZOR-A4-001"
      },
      {
        id: 3,
        nombre: "Yerbera Bariloche",
        precio: 24900,
        precioOriginal: null,
        descuento: 0,
        stock: 12,
        disponible: true,
        descripcionCorta: "Yerbera ilustrada con paisajes de montaña, bosque y lago.",
        imagenes: ["pages/yerbraportada.webp"],
        categoria: "accesorios",
        sku: "YERB-BAR-LAT-001"
      }
    ];
  }

  /**
   * Renderiza productos en el contenedor
   * MEJORA: Usa ProductRenderer para mejor rendimiento y escalabilidad
   */
  renderizarProductos(productosAMostrar = null) {
    try {
      const productos = productosAMostrar || this.productos;
      const contenedor = document.getElementById('productos-container');
      
      if (!contenedor) {
        logger.warning('Contenedor de productos no encontrado');
        return;
      }

      // Usar ProductRenderer si está disponible
      if (window.ProductRenderer && !this.productRenderer) {
        this.productRenderer = new ProductRenderer({
          containerSelector: '#productos-container',
          enableLazyLoading: true,
          enablePagination: productos.length > 12,
          itemsPerPage: 12,
          cardBuilder: new ProductCardBuilder({
            enableLazyLoading: true,
            enableDescriptionToggle: true
          })
        });
      }

      if (this.productRenderer) {
        // Usar ProductRenderer para renderizado optimizado
        this.productRenderer.renderProducts(productos);
        return;
      }

      // Fallback a implementación local mejorada
      if (!Array.isArray(productos) || productos.length === 0) {
        contenedor.innerHTML = this.getMensajeSinProductos();
        logger.info('No hay productos para mostrar');
        return;
      }

      // Limpiar contenedor de forma segura
      this.clearContainerSafely(contenedor);

      // MEJORA: Usar DocumentFragment para mejor rendimiento
      const fragment = document.createDocumentFragment();

      // MEJORA: Usar for...of en lugar de forEach (mejor rendimiento)
      // MEJORA: Renderizar en batches para mejor rendimiento
      this.renderProductsInBatches(productos, fragment, () => {
        contenedor.appendChild(fragment);
        logger.success(`Productos renderizados: ${productos.length}`);
        
        // Configurar lazy loading después de renderizar
        this.setupLazyLoadingForImages(contenedor);
      });

    } catch (error) {
      logger.error('Error renderizando productos', error);
      this.renderErrorState(error);
    }
  }

  /**
   * Limpia el contenedor de forma segura
   */
  clearContainerSafely(contenedor) {
    try {
      // Remover todos los hijos de forma eficiente
      while (contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild);
      }
    } catch (error) {
      logger.error('Error limpiando contenedor', error);
      // Fallback: usar innerHTML
      contenedor.innerHTML = '';
    }
  }

  /**
   * Renderiza productos en batches para mejor rendimiento
   */
  renderProductsInBatches(productos, fragment, callback) {
    const batchSize = 10; // Renderizar 10 productos por batch
    let index = 0;

    const renderBatch = () => {
      const endIndex = Math.min(index + batchSize, productos.length);

      for (let i = index; i < endIndex; i++) {
        const producto = productos[i];
        
        if (!this.esProductoValido(producto)) {
          logger.warning(`Producto inválido omitido: ${producto.id || 'sin ID'}`);
          continue;
        }

        try {
          // Usar ProductCardBuilder si está disponible
          let productCard;
          if (window.ProductCardBuilder) {
            const cardBuilder = new ProductCardBuilder({
              enableLazyLoading: true,
              enableDescriptionToggle: true
            });
            productCard = cardBuilder.createProductCard(producto);
          } else {
            productCard = this.crearTarjetaProducto(producto);
          }

          fragment.appendChild(productCard);
        } catch (error) {
          logger.error(`Error creando tarjeta para producto ${producto.id}`, error);
        }
      }

      index = endIndex;

      if (index < productos.length) {
        // Continuar con el siguiente batch
        requestAnimationFrame(renderBatch);
      } else {
        // Todos los productos renderizados
        if (callback) callback();
      }
    };

    renderBatch();
  }

  /**
   * Configura lazy loading para imágenes
   */
  setupLazyLoadingForImages(contenedor) {
    if (!('IntersectionObserver' in window)) {
      return;
    }

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.remove('lazy-load');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });

    // Observar todas las imágenes con data-src
    contenedor.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  /**
   * Renderiza estado de error
   */
  renderErrorState(error) {
    const contenedor = document.getElementById('productos-container');
    if (!contenedor) return;

    contenedor.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="error-state">
          <i class="bi bi-exclamation-triangle fs-1 text-danger mb-3"></i>
          <h3 class="text-danger">Error al cargar productos</h3>
          <p class="text-muted">${error?.message || 'Ocurrió un error inesperado'}</p>
          <button class="btn btn-primary mt-3" onclick="location.reload()">
            Recargar página
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Valida que un producto tenga las propiedades necesarias
   */
  esProductoValido(producto) {
    if (!producto || typeof producto !== 'object') return false;
    if (!Validators.isValidId || !Validators.isValidId(producto.id)) return false;
    if (!producto.nombre || typeof producto.nombre !== 'string') return false;
    if (!Validators.isPositiveNumber || !Validators.isPositiveNumber(producto.precio)) return false;
    return true;
  }

  /**
   * Crea tarjeta de producto
   * MEJORA: Usa ProductCardBuilder si está disponible, sino usa implementación mejorada
   */
  crearTarjetaProducto(producto) {
    try {
      // Usar ProductCardBuilder si está disponible
      if (window.ProductCardBuilder) {
        const cardBuilder = new ProductCardBuilder({
          enableLazyLoading: true,
          enableDescriptionToggle: true
        });
        return cardBuilder.createProductCard(producto);
      }

      // Fallback a implementación mejorada usando métodos DOM
      return this.createProductCardDOM(producto);

    } catch (error) {
      logger.error('Error creando tarjeta de producto', error);
      return this.createErrorCard('Error al cargar producto');
    }
  }

  /**
   * Crea tarjeta de producto usando métodos DOM (fallback mejorado)
   * MEJORA: Usa createElement en lugar de innerHTML para mejor seguridad
   */
  createProductCardDOM(producto) {
    // Validar producto
    if (!this.esProductoValido(producto)) {
      logger.warning('Producto inválido para crear tarjeta', producto);
      return this.createErrorCard('Producto no disponible');
    }

    // Crear contenedor principal
    const col = document.createElement('div');
    col.className = 'col';
    col.setAttribute('data-product-id', producto.id);

    // Crear card
    const card = document.createElement('article');
    card.className = 'product-card card h-100 shadow-lg border-0 position-relative overflow-hidden';
    card.setAttribute('data-producto-id', producto.id);
    card.setAttribute('role', 'article');
    card.setAttribute('aria-labelledby', `product-title-${producto.id}`);

    // Crear imagen
    const imageContainer = this.createImageContainerDOM(producto);
    card.appendChild(imageContainer);

    // Crear cuerpo
    const cardBody = this.createCardBodyDOM(producto);
    card.appendChild(cardBody);

    // Agregar event listeners
    this.attachCardEventListeners(card, producto);

    col.appendChild(card);
    return col;
  }

  /**
   * Crea contenedor de imagen usando DOM
   */
  createImageContainerDOM(producto) {
    const container = document.createElement('div');
    container.className = 'card-image-container position-relative overflow-hidden';
    container.style.cssText = 'height: 280px; background: #f8f9fa;';

    const img = document.createElement('img');
    img.className = 'card-img-top product-image';
    img.alt = producto.nombre || 'Producto';
    img.loading = 'lazy';
    img.src = producto.imagenes?.[0] || 'pages/no-image.png';
    
    img.addEventListener('error', () => {
      img.src = 'pages/no-image.png';
      img.classList.add('image-error');
    });

    container.appendChild(img);

    // Badge de descuento
    if (producto.descuento > 0) {
      const badge = document.createElement('span');
      badge.className = 'badge-descuento position-absolute top-0 start-0 m-2';
      badge.textContent = `${producto.descuento}% OFF`;
      container.appendChild(badge);
    }

    return container;
  }

  /**
   * Crea cuerpo de tarjeta usando DOM
   */
  createCardBodyDOM(producto) {
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body d-flex flex-column';

    // Título
    const title = document.createElement('h3');
    title.id = `product-title-${producto.id}`;
    title.className = 'product-title card-title mb-2';
    title.textContent = producto.nombre || 'Producto sin nombre';
    cardBody.appendChild(title);

    // Descripción con toggle
    if (producto.descripcionCorta) {
      const descriptionContainer = this.createDescriptionContainerDOM(producto);
      cardBody.appendChild(descriptionContainer);
    }

    // Precio
    const priceContainer = this.createPriceContainerDOM(producto);
    cardBody.appendChild(priceContainer);

    // Stock badge
    if (producto.stock > 0 && producto.stock < 5) {
      const stockBadge = document.createElement('small');
      stockBadge.className = 'product-stock-badge text-warning d-block mb-2';
      stockBadge.textContent = `¡Últimas ${producto.stock} unidades!`;
      cardBody.appendChild(stockBadge);
    }

    // Acciones
    const actionsContainer = this.createActionsContainerDOM(producto);
    cardBody.appendChild(actionsContainer);

    return cardBody;
  }

  /**
   * Crea contenedor de descripción con toggle
   */
  createDescriptionContainerDOM(producto) {
    const container = document.createElement('div');
    container.className = 'product-description-container mb-3';

    const shortText = this.getShortDescription(producto.descripcionCorta, 80);
    const isLong = producto.descripcionCorta.length > 80;

    // Descripción corta
    const shortDesc = document.createElement('p');
    shortDesc.className = 'product-description-short card-text text-muted mb-2';
    shortDesc.textContent = isLong ? shortText : producto.descripcionCorta;
    container.appendChild(shortDesc);

    // Descripción completa (si es larga)
    if (isLong) {
      const fullDesc = document.createElement('p');
      fullDesc.id = `description-full-${producto.id}`;
      fullDesc.className = 'product-description-full card-text text-muted';
      fullDesc.textContent = producto.descripcionCorta;
      fullDesc.style.display = 'none';
      fullDesc.setAttribute('aria-hidden', 'true');
      container.appendChild(fullDesc);

      // Botón toggle
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'btn-link text-primary p-0 border-0 bg-transparent text-decoration-none';
      toggleBtn.type = 'button';
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-controls', `description-full-${producto.id}`);
      
      const toggleText = document.createElement('span');
      toggleText.className = 'toggle-text';
      toggleText.textContent = 'Ver más';
      toggleBtn.appendChild(toggleText);

      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDescriptionDOM(fullDesc, toggleText, toggleBtn);
      });

      container.appendChild(toggleBtn);
    }

    return container;
  }

  /**
   * Alterna descripción usando DOM
   */
  toggleDescriptionDOM(fullDesc, toggleText, toggleBtn) {
    const isHidden = fullDesc.style.display === 'none';
    
    if (isHidden) {
      fullDesc.style.display = 'block';
      fullDesc.setAttribute('aria-hidden', 'false');
      toggleText.textContent = 'Ver menos';
      toggleBtn.setAttribute('aria-expanded', 'true');
      fullDesc.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      fullDesc.style.display = 'none';
      fullDesc.setAttribute('aria-hidden', 'true');
      toggleText.textContent = 'Ver más';
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  /**
   * Obtiene descripción corta
   */
  getShortDescription(text, maxLength = 80) {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Crea contenedor de precio usando DOM
   */
  createPriceContainerDOM(producto) {
    const container = document.createElement('div');
    container.className = 'product-price-container mb-3';

    const currentPrice = document.createElement('span');
    currentPrice.className = 'product-price-current card-price';
    currentPrice.textContent = Helpers.formatPrice 
      ? Helpers.formatPrice(producto.precio) 
      : `$${producto.precio.toLocaleString()}`;
    container.appendChild(currentPrice);

    if (producto.precioOriginal && producto.precioOriginal > producto.precio) {
      const originalPrice = document.createElement('span');
      originalPrice.className = 'product-price-original card-price-old ms-2';
      originalPrice.textContent = Helpers.formatPrice 
        ? Helpers.formatPrice(producto.precioOriginal) 
        : `$${producto.precioOriginal.toLocaleString()}`;
      originalPrice.style.textDecoration = 'line-through';
      container.appendChild(originalPrice);
    }

    return container;
  }

  /**
   * Crea contenedor de acciones usando DOM
   */
  createActionsContainerDOM(producto) {
    const container = document.createElement('div');
    container.className = 'product-actions mt-auto';

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'd-flex flex-column gap-2';

    // Botón ver detalles
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-outline-primary btn-view-product';
    viewBtn.type = 'button';
    viewBtn.setAttribute('data-product-id', producto.id);
    
    const viewIcon = document.createElement('i');
    viewIcon.className = 'bi bi-eye me-2';
    viewBtn.appendChild(viewIcon);
    viewBtn.appendChild(document.createTextNode('Ver detalles'));
    
    buttonsContainer.appendChild(viewBtn);

    // Botón agregar al carrito
    const addBtn = document.createElement('button');
    const estaDisponible = producto.disponible && producto.stock > 0;
    addBtn.className = `btn btn-primary btn-add-to-cart w-100 ${!estaDisponible ? 'disabled' : ''}`;
    addBtn.type = 'button';
    addBtn.setAttribute('data-product-id', producto.id);
    
    if (!estaDisponible) {
      addBtn.disabled = true;
    }

    const addIcon = document.createElement('i');
    addIcon.className = 'bi bi-cart-plus me-2';
    addBtn.appendChild(addIcon);
    addBtn.appendChild(document.createTextNode(estaDisponible ? 'Agregar al carrito' : 'Sin stock'));
    
    buttonsContainer.appendChild(addBtn);

    container.appendChild(buttonsContainer);
    return container;
  }

  /**
   * Adjunta event listeners a la tarjeta
   */
  attachCardEventListeners(card, producto) {
    try {
      // Botón ver detalles
      const viewBtn = card.querySelector('.btn-view-product');
      if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.verDetalleProducto(producto.id);
        });
      }

      // Botón agregar al carrito
      const addBtn = card.querySelector('.btn-add-to-cart');
      if (addBtn && !addBtn.disabled) {
        addBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.agregarAlCarrito(producto.id);
        });
      }

      // Click en la tarjeta (navegar a detalle)
      card.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        this.verDetalleProducto(producto.id);
      });

    } catch (error) {
      logger.error('Error adjuntando event listeners', error);
    }
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
   * Agrega producto al carrito
   * MEJORA: Usa CartOperations para evitar repetición de código
   */
  agregarAlCarrito(productoId) {
    try {
      // Validar ID
      if (!Validators.isValidId || !Validators.isValidId(productoId)) {
        logger.error('ID de producto inválido', productoId);
        this.mostrarNotificacion('Error: ID de producto inválido', 'error');
        return false;
      }

      // Buscar producto
      const producto = this.productos.find(p => p.id === productoId);
      
      if (!producto) {
        logger.error('Producto no encontrado', productoId);
        this.mostrarNotificacion('Producto no encontrado', 'error');
        return false;
      }

      // Usar CartOperations si está disponible para evitar repetición
      if (window.CartOperations && typeof window.CartOperations.addOrUpdateItem === 'function') {
        const result = window.CartOperations.addOrUpdateItem(this.carrito, producto, 1);
        
        if (result.success) {
          this.guardarCarrito();
          this.actualizarContadorCarrito();
          this.mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
          logger.product(producto);
          return true;
        } else {
          // Manejar errores específicos
          if (result.error === 'Stock insuficiente') {
            this.mostrarNotificacion(`Solo hay ${result.availableStock} unidades disponibles`, 'warning');
          } else {
            this.mostrarNotificacion(result.error || 'Error al agregar producto', 'error');
          }
          logger.warning('Error agregando producto', result.error);
          return false;
        }
      }

      // Fallback a implementación local (código original)
      // Validar disponibilidad
      if (!producto.disponible || producto.stock <= 0) {
        logger.warning('Producto no disponible', producto);
        this.mostrarNotificacion('Producto no disponible', 'warning');
        return false;
      }

      // Buscar item en carrito
      const itemCarrito = this.carrito.find(item => item.id === productoId);
      
      if (itemCarrito) {
        // Validar stock disponible
        const nuevaCantidad = itemCarrito.cantidad + 1;
        if (nuevaCantidad > producto.stock) {
          logger.warning('Stock insuficiente', { producto, cantidadActual: itemCarrito.cantidad, stockDisponible: producto.stock });
          this.mostrarNotificacion(`Solo hay ${producto.stock} unidades disponibles`, 'warning');
          return false;
        }
        itemCarrito.cantidad = nuevaCantidad;
      } else {
        // Agregar nuevo item
        this.carrito.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagenes?.[0] || 'pages/no-image.png',
          cantidad: 1,
          sku: producto.sku || `SKU-${producto.id}`
        });
      }

      this.guardarCarrito();
      this.actualizarContadorCarrito();
      this.mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
      
      logger.product(producto);
      
      return true;
      
    } catch (error) {
      logger.error('Error agregando producto al carrito', error);
      this.mostrarNotificacion('Error al agregar producto', 'error');
      return false;
    }
  }

  /**
   * Elimina producto del carrito
   */
  eliminarDelCarrito(productoId) {
    try {
      const index = this.carrito.findIndex(item => item.id === productoId);
      
      if (index === -1) {
        logger.warning('Producto no encontrado en carrito', productoId);
        return false;
      }

      const producto = this.carrito[index];
      this.carrito.splice(index, 1);
      
      this.guardarCarrito();
      this.actualizarContadorCarrito();
      this.renderizarCarrito();
      
      logger.info(`Producto eliminado del carrito: ${producto.nombre}`);
      
      return true;
      
    } catch (error) {
      logger.error('Error eliminando producto del carrito', error);
      return false;
    }
  }

  /**
   * Cambia cantidad de producto en carrito
   * MEJORA: Validaciones más robustas
   */
  cambiarCantidad(productoId, nuevaCantidad) {
    try {
      // Validar parámetros
      if (!Validators.isValidId || !Validators.isValidId(productoId)) {
        logger.error('ID de producto inválido', productoId);
        return false;
      }

      const cantidad = Validators.sanitizeInteger 
        ? Validators.sanitizeInteger(nuevaCantidad, 1) 
        : parseInt(nuevaCantidad, 10);

      if (isNaN(cantidad) || cantidad < 0) {
        logger.error('Cantidad inválida', nuevaCantidad);
        return false;
      }

      const item = this.carrito.find(item => item.id === productoId);
      const producto = this.productos.find(p => p.id === productoId);
      
      if (!item) {
        logger.warning('Item no encontrado en carrito', productoId);
        return false;
      }

      if (!producto) {
        logger.warning('Producto no encontrado', productoId);
        return false;
      }

      // Si la cantidad es 0 o menor, eliminar del carrito
      if (cantidad <= 0) {
        return this.eliminarDelCarrito(productoId);
      }

      // Validar stock disponible
      if (cantidad > producto.stock) {
        logger.warning('Stock insuficiente', { producto, cantidadSolicitada: cantidad, stockDisponible: producto.stock });
        this.mostrarNotificacion(`Solo hay ${producto.stock} unidades disponibles`, 'warning');
        item.cantidad = producto.stock; // Ajustar a stock máximo
      } else {
        item.cantidad = cantidad;
      }

      this.guardarCarrito();
      this.actualizarContadorCarrito();
      this.renderizarCarrito();
      
      return true;
      
    } catch (error) {
      logger.error('Error cambiando cantidad', error);
      return false;
    }
  }

  /**
   * Calcula total del carrito
   * MEJORA: Usa CartOperations para evitar repetición
   */
  calcularTotal() {
    try {
      // Usar CartOperations si está disponible para evitar repetición
      if (window.CartOperations && typeof window.CartOperations.calculateTotal === 'function') {
        return window.CartOperations.calculateTotal(this.carrito);
      }

      // Fallback a implementación local
      if (!Array.isArray(this.carrito) || this.carrito.length === 0) {
        return 0;
      }

      const total = this.carrito.reduce((acumulador, item) => {
        // Validar item
        if (!item || typeof item !== 'object') {
          logger.warning('Item inválido en carrito', item);
          return acumulador;
        }

        const precio = Validators.sanitizeNumber 
          ? Validators.sanitizeNumber(item.precio, 0) 
          : (parseFloat(item.precio) || 0);
        
        const cantidad = Validators.sanitizeInteger 
          ? Validators.sanitizeInteger(item.cantidad, 1) 
          : (parseInt(item.cantidad, 10) || 1);

        // Validar que precio y cantidad sean números válidos
        if (!Validators.isValidNumber || !Validators.isValidNumber(precio)) {
          logger.warning('Precio inválido en item', item);
          return acumulador;
        }

        if (!Validators.isValidNumber || !Validators.isValidNumber(cantidad)) {
          logger.warning('Cantidad inválida en item', item);
          return acumulador;
        }

        return acumulador + (precio * cantidad);
      }, 0);

      return total;
      
    } catch (error) {
      logger.error('Error calculando total', error);
      return 0;
    }
  }

  /**
   * Calcula descuento por transferencia
   * MEJORA: Validación de división por cero
   */
  calcularDescuentoTransferencia() {
    try {
      const total = this.calcularTotal();
      
      // Validar que el total sea válido
      if (!Validators.isValidNumber || !Validators.isValidNumber(total) || total <= 0) {
        return 0;
      }

      // Obtener porcentaje de descuento (por defecto 10%)
      const porcentajeDescuento = this.configuracion?.descuentoTransferencia || 10;
      
      // Validar porcentaje
      if (!Validators.isValidNumber || !Validators.isValidNumber(porcentajeDescuento)) {
        logger.warning('Porcentaje de descuento inválido', porcentajeDescuento);
        return 0;
      }

      // Usar división segura
      const descuento = Validators.safeDivide 
        ? Validators.safeDivide(total * porcentajeDescuento, 100, 0)
        : Math.round((total * porcentajeDescuento) / 100);

      return Math.round(descuento);
      
    } catch (error) {
      logger.error('Error calculando descuento de transferencia', error);
      return 0;
    }
  }

  /**
   * Busca productos
   * MEJORA: Búsqueda más robusta y eficiente
   */
  buscarProductos(termino) {
    try {
      if (!termino || typeof termino !== 'string') {
        logger.warning('Término de búsqueda inválido', termino);
        return [];
      }

      const terminoLower = termino.toLowerCase().trim();
      
      if (terminoLower.length < 2) {
        logger.info('Término de búsqueda muy corto');
        return [];
      }

      // MEJORA: Usar filter con early returns para mejor rendimiento
      const resultados = this.productos.filter(producto => {
        // Buscar en nombre
        if (producto.nombre?.toLowerCase().includes(terminoLower)) {
          return true;
        }

        // Buscar en descripción
        if (producto.descripcionCorta?.toLowerCase().includes(terminoLower)) {
          return true;
        }

        // Buscar en categoría
        if (producto.categoria?.toLowerCase().includes(terminoLower)) {
          return true;
        }

        // Buscar en tags
        if (Array.isArray(producto.tags)) {
          return producto.tags.some(tag => 
            tag.toLowerCase().includes(terminoLower)
          );
        }

        return false;
      });

      logger.info(`Búsqueda: "${termino}" - ${resultados.length} resultados`);
      
      return resultados;
      
    } catch (error) {
      logger.error('Error buscando productos', error);
      return [];
    }
  }

  /**
   * Filtra productos por categoría
   */
  filtrarPorCategoria(categoria) {
    try {
      if (!categoria || categoria === 'todos') {
        return [...this.productos]; // Retornar copia del array
      }

      return this.productos.filter(producto => 
        producto.categoria === categoria
      );
      
    } catch (error) {
      logger.error('Error filtrando por categoría', error);
      return [];
    }
  }

  /**
   * Filtra productos por precio
   */
  filtrarPorPrecio(precioMinimo, precioMaximo) {
    try {
      const min = Validators.sanitizeNumber 
        ? Validators.sanitizeNumber(precioMinimo, 0) 
        : (parseFloat(precioMinimo) || 0);
      
      const max = Validators.sanitizeNumber 
        ? Validators.sanitizeNumber(precioMaximo, Infinity) 
        : (parseFloat(precioMaximo) || Infinity);

      return this.productos.filter(producto => {
        const precio = producto.precio || 0;
        return precio >= min && precio <= max;
      });
      
    } catch (error) {
      logger.error('Error filtrando por precio', error);
      return [];
    }
  }

  /**
   * Ver detalle de producto
   */
  verDetalleProducto(productoId) {
    try {
      if (!Validators.isValidId || !Validators.isValidId(productoId)) {
        logger.error('ID de producto inválido', productoId);
        return;
      }

      const producto = this.productos.find(p => p.id === productoId);
      
      if (!producto) {
        logger.error('Producto no encontrado', productoId);
        this.mostrarNotificacion('Producto no encontrado', 'error');
        return;
      }

      const slug = producto.slug || producto.nombre.toLowerCase().replace(/\s+/g, '-');
      const url = `producto.html?id=${productoId}&slug=${encodeURIComponent(slug)}`;
      
      logger.info(`Navegando a producto: ${producto.nombre}`);
      window.location.href = url;
      
    } catch (error) {
      logger.error('Error navegando a producto', error);
    }
  }

  /**
   * Carga carrito desde localStorage
   */
  cargarCarrito() {
    try {
      const carritoData = localStorage.getItem('patagonia_carrito');
      
      if (!carritoData) {
        return [];
      }

      const carrito = JSON.parse(carritoData);
      
      if (!Array.isArray(carrito)) {
        logger.warning('Carrito en formato inválido');
        return [];
      }

      // Validar items del carrito
      const carritoValido = carrito.filter(item => {
        if (!item || typeof item !== 'object') return false;
        if (!Validators.isValidId || !Validators.isValidId(item.id)) return false;
        if (!item.nombre || typeof item.nombre !== 'string') return false;
        if (!Validators.isPositiveNumber || !Validators.isPositiveNumber(item.precio)) return false;
        if (!Validators.isPositiveNumber || !Validators.isPositiveNumber(item.cantidad)) return false;
        return true;
      });

      if (carritoValido.length !== carrito.length) {
        logger.warning('Algunos items del carrito fueron eliminados por ser inválidos');
        this.guardarCarrito(); // Guardar carrito limpiado
      }

      return carritoValido;
      
    } catch (error) {
      logger.error('Error cargando carrito', error);
      return [];
    }
  }

  /**
   * Guarda carrito en localStorage
   */
  guardarCarrito() {
    try {
      if (!Array.isArray(this.carrito)) {
        logger.error('Carrito no es un array');
        return;
      }

      localStorage.setItem('patagonia_carrito', JSON.stringify(this.carrito));
      logger.debug('Carrito guardado', { items: this.carrito.length });
      
    } catch (error) {
      logger.error('Error guardando carrito', error);
    }
  }

  /**
   * Actualiza contador de carrito
   */
  actualizarContadorCarrito() {
    try {
      const contador = document.getElementById('cart-count');
      const contadorNavbar = document.getElementById('cart-counter');
      
      const totalItems = this.carrito.reduce((total, item) => {
        const cantidad = item.cantidad || 0;
        return total + cantidad;
      }, 0);

      // Actualizar contador principal
      if (contador) {
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'inline-block' : 'none';
      }

      // Actualizar contador del navbar
      if (contadorNavbar) {
        contadorNavbar.textContent = totalItems;
        contadorNavbar.style.display = totalItems > 0 ? 'block' : 'none';
      }

      // Disparar evento personalizado
      document.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { count: totalItems }
      }));
      
    } catch (error) {
      logger.error('Error actualizando contador de carrito', error);
    }
  }

  /**
   * Renderiza carrito
   * MEJORA: Usa for...of en lugar de forEach
   */
  renderizarCarrito() {
    const contenedor = document.getElementById('carrito-contenido');
    
    if (!contenedor) {
      logger.warning('Contenedor de carrito no encontrado');
      return;
    }

    if (!Array.isArray(this.carrito) || this.carrito.length === 0) {
      contenedor.innerHTML = this.getCarritoVacioHTML();
      return;
    }

    const total = this.calcularTotal();
    const descuentoTransferencia = this.calcularDescuentoTransferencia();

    let html = this.getCarritoHeaderHTML();
    
    // MEJORA: Usar for...of en lugar de forEach
    for (const item of this.carrito) {
      html += this.getCarritoItemHTML(item);
    }

    html += this.getCarritoFooterHTML(total, descuentoTransferencia);
    contenedor.innerHTML = html;
    
    logger.cart(this.carrito);
  }

  getCarritoVacioHTML() {
    return `
      <div class="carrito-vacio text-center p-5">
        <i class="bi bi-cart-x" style="font-size:2.5rem;"></i><br>
        <h4 class="mt-3">Tu carrito está vacío</h4>
        <p class="text-muted">Agrega productos para continuar</p>
      </div>
    `;
  }

  getCarritoHeaderHTML() {
    return `
      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th></th>
              <th>Producto</th>
              <th class="text-center">Cantidad</th>
              <th class="text-end">Precio</th>
              <th class="text-end">Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
    `;
  }

  getCarritoItemHTML(item) {
    const subtotal = (item.precio || 0) * (item.cantidad || 1);
    const imagenUrl = item.imagen || 'pages/no-image.png';
    
    return `
      <tr>
        <td>
          <img src="${imagenUrl}" 
               alt="${item.nombre}" 
               class="carrito-producto-img"
               onerror="this.src='pages/no-image.png'">
        </td>
        <td class="carrito-producto-nombre">${item.nombre}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-secondary" 
                  onclick="store.cambiarCantidad(${item.id}, ${item.cantidad - 1})"
                  ${item.cantidad <= 1 ? 'disabled' : ''}>-</button>
          <input type="number" 
                 min="1" 
                 class="carrito-cantidad-input" 
                 value="${item.cantidad}" 
                 onchange="store.cambiarCantidad(${item.id}, parseInt(this.value))">
          <button class="btn btn-sm btn-outline-secondary" 
                  onclick="store.cambiarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
        </td>
        <td class="text-end carrito-producto-precio">
          ${Helpers.formatPrice ? Helpers.formatPrice(item.precio) : `$${item.precio.toLocaleString()}`}
        </td>
        <td class="text-end carrito-producto-precio">
          ${Helpers.formatPrice ? Helpers.formatPrice(subtotal) : `$${subtotal.toLocaleString()}`}
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-danger" 
                  title="Eliminar" 
                  onclick="store.eliminarDelCarrito(${item.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }

  getCarritoFooterHTML(total, descuentoTransferencia) {
    const totalConDescuento = total - descuentoTransferencia;
    const porcentajeDescuento = this.configuracion?.descuentoTransferencia || 10;
    
    return `
          </tbody>
        </table>
      </div>
      <div class="carrito-total">
        <strong>Total: ${Helpers.formatPrice ? Helpers.formatPrice(total) : `$${total.toLocaleString()}`}</strong>
      </div>
      <div class="text-muted mb-3">
        <small>
          <i class="bi bi-percent"></i> 
          Con transferencia: ${Helpers.formatPrice ? Helpers.formatPrice(totalConDescuento) : `$${totalConDescuento.toLocaleString()}`} 
          (${porcentajeDescuento}% off)
        </small>
      </div>
      <button class="btn-carrito" onclick="store.irACheckout()">
        <i class="bi bi-bag-check"></i> Finalizar compra
      </button>
      <button class="btn-vaciar" onclick="store.vaciarCarrito()">
        <i class="bi bi-trash"></i> Vaciar carrito
      </button>
    `;
  }

  /**
   * Vacía el carrito
   */
  vaciarCarrito() {
    try {
      if (this.carrito.length === 0) {
        this.mostrarNotificacion('El carrito ya está vacío', 'info');
        return;
      }

      if (!confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        return;
      }

      this.carrito = [];
      this.guardarCarrito();
      this.actualizarContadorCarrito();
      this.renderizarCarrito();
      this.mostrarNotificacion('Carrito vaciado', 'info');
      
      logger.info('Carrito vaciado');
      
    } catch (error) {
      logger.error('Error vaciando carrito', error);
    }
  }

  /**
   * Navega a checkout
   */
  irACheckout() {
    try {
      if (!Array.isArray(this.carrito) || this.carrito.length === 0) {
        this.mostrarNotificacion('El carrito está vacío', 'warning');
        return;
      }

      this.guardarCarrito();
      window.location.href = 'checkout.html';
      
    } catch (error) {
      logger.error('Error navegando a checkout', error);
      this.mostrarNotificacion('Error al proceder al checkout', 'error');
    }
  }

  /**
   * Inicializa eventos
   */
  inicializarEventos() {
    try {
      // Buscador
      const buscador = document.querySelector('input[type="search"]');
      if (buscador) {
        // MEJORA: Usar debounce para búsquedas
        const buscarProductos = Helpers.debounce 
          ? Helpers.debounce((termino) => {
              if (termino.length >= 2) {
                const resultados = this.buscarProductos(termino);
                this.renderizarProductos(resultados);
              } else if (termino.length === 0) {
                this.renderizarProductos();
              }
            }, 300)
          : (termino) => {
              if (termino.length >= 2) {
                const resultados = this.buscarProductos(termino);
                this.renderizarProductos(resultados);
              } else if (termino.length === 0) {
                this.renderizarProductos();
              }
            };

        buscador.addEventListener('input', (e) => {
          const termino = e.target.value.trim();
          buscarProductos(termino);
        });
      }

      // Formulario de búsqueda
      const formBusqueda = document.querySelector('form[role="search"]');
      if (formBusqueda) {
        formBusqueda.addEventListener('submit', (e) => {
          e.preventDefault();
          const termino = buscador?.value.trim() || '';
          if (termino) {
            const resultados = this.buscarProductos(termino);
            this.renderizarProductos(resultados);
            this.mostrarNotificacion(`${resultados.length} productos encontrados`, 'info');
          }
        });
      }
      
    } catch (error) {
      logger.error('Error inicializando eventos', error);
    }
  }

  /**
   * Muestra notificación
   */
  mostrarNotificacion(mensaje, tipo = 'info') {
    try {
      if (window.logger) {
        switch (tipo) {
          case 'success':
            logger.success(mensaje);
            break;
          case 'error':
            logger.error(mensaje);
            break;
          case 'warning':
            logger.warning(mensaje);
            break;
          default:
            logger.info(mensaje);
        }
      }

      // Sistema de notificaciones toast (código existente)
      const toast = document.createElement('div');
      toast.className = `toast-notification toast-${tipo}`;
      toast.innerHTML = `
        <div class="toast-content">
          <i class="bi bi-${this.getIconoNotificacion(tipo)}"></i>
          <span>${mensaje}</span>
        </div>
      `;

      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${this.getColorNotificacion(tipo)};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
      `;

      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 300);
      }, 3000);
      
    } catch (error) {
      console.error('Error mostrando notificación', error);
    }
  }

  getIconoNotificacion(tipo) {
    const iconos = {
      success: 'check-circle',
      error: 'x-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    return iconos[tipo] || 'info-circle';
  }

  getColorNotificacion(tipo) {
    const colores = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };
    return colores[tipo] || '#17a2b8';
  }

  getMensajeSinProductos() {
    return `
      <div class="text-center py-5">
        <i class="bi bi-search" style="font-size: 3rem; color: #ccc;"></i>
        <h4 class="mt-3 text-muted">No se encontraron productos</h4>
        <p class="text-muted">Intenta con otros términos de búsqueda o filtros</p>
      </div>
    `;
  }
}

// CSS para animaciones de toast
if (!document.getElementById('store-toast-styles')) {
  const style = document.createElement('style');
  style.id = 'store-toast-styles';
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }

    .toast-notification .toast-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `;
  document.head.appendChild(style);
}

// Inicializar la tienda cuando se carga el documento
let store;
document.addEventListener('DOMContentLoaded', () => {
  store = new PatagoniaStore();
  window.store = store;
  logger.banner('Patagonia Store Inicializado', 'success');
});

// Exportar para uso global
window.PatagoniaStore = PatagoniaStore;
