// Sistema de gestión de productos para Patagonia Style
class PatagoniaStore {
  constructor() {
    this.productos = [];
    this.categorias = [];
    this.configuracion = {};
    
    // Cargar carrito del localStorage usando key consistente
    this.carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    
    this.init();
  }

  async init() {
    await this.cargarProductos();
    this.renderizarProductos();
    this.actualizarContadorCarrito();
    this.inicializarEventos();
  }

  async cargarProductos() {
    try {
      const response = await fetch('./data/productos.json');
      const data = await response.json();
      this.productos = data.productos;
      this.categorias = data.categorias;
      this.configuracion = data.configuracion;
    } catch (error) {
      console.error('Error al cargar productos:', error);
      // Fallback con productos hardcodeados
      this.productosFallback();
    }
  }

  productosFallback() {
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

  renderizarProductos(productosAMostrar = null) {
    const productos = productosAMostrar || this.productos;
    const contenedor = document.getElementById('productos-container');
    
    if (!contenedor) return;

    contenedor.innerHTML = '';

    productos.forEach(producto => {
      const productCard = this.crearTarjetaProducto(producto);
      contenedor.appendChild(productCard);
    });
  }

  crearTarjetaProducto(producto) {
    const productCard = document.createElement('div');
    productCard.className = 'col';
    productCard.style.cssText = `
      display: flex;
      margin-bottom: 1.5rem;
    `;

    const discountBadge = producto.descuento > 0 ? 
      `<span class="badge-descuento position-absolute">${producto.descuento}% OFF</span>` : '';

    const originalPriceDisplay = producto.precioOriginal ? 
      `<span class="card-price-old" style="font-size:1rem; color:#888; text-decoration: line-through; margin-left: 8px;">$${producto.precioOriginal.toLocaleString()}</span>` : '';

    const lowStockWarning = producto.stock < 5 ? 
      `<small class="text-warning d-block" style="color: #e67e22 !important; font-weight: 600;">¡Últimas ${producto.stock} unidades!</small>` : '';

    const isOutOfStock = !producto.disponible || producto.stock === 0;
    const addToCartButtonText = isOutOfStock ? 'Sin stock' : 'Agregar al carrito';

    productCard.innerHTML = `
      <div class="card h-100 border-0 position-relative overflow-hidden card-producto" 
           data-producto-id="${producto.id}" 
           style="box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 16px; background: white; max-width: 100%; width: 100%;">
        <div class="overflow-hidden" style="height:220px; border-radius: 16px 16px 0 0;">
          <img src="${producto.imagenes[0]}" 
               class="card-img-top" 
               alt="${producto.nombre}" 
               style="object-fit: cover; height: 100%; width: 100%; transition: transform 0.3s ease;"
               onerror="this.src='pages/no-image.png'">
          ${discountBadge}
        </div>
        <div class="card-body d-flex flex-column p-3">
          <h5 class="card-title mb-2" style="font-weight:700; color:#1f3c5a; font-size:1.1rem; line-height: 1.3; height: 2.6rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${producto.nombre}</h5>
          <p class="card-text mb-2" style="color:#666; font-size:0.9rem; line-height: 1.4; height: 2.8rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${producto.descripcionCorta}</p>
          <div class="mb-2">
            <span class="card-price d-inline" style="font-size:1.3rem; color:#2c5530; font-weight:700;">$${producto.precio.toLocaleString()}</span>
            ${originalPriceDisplay}
          </div>
          ${lowStockWarning}
          <div class="mt-auto">
            <div class="d-flex gap-2 mb-2">
              <button class="btn btn-outline-secondary flex-grow-1" 
                      style="border-color: #3b5d50; color: #3b5d50; font-weight: 600; padding: 8px 12px; font-size: 0.9rem;"
                      onclick="store.verDetalleProducto(${producto.id})"
                      onmouseover="this.style.background='#3b5d50'; this.style.color='white'"
                      onmouseout="this.style.background='transparent'; this.style.color='#3b5d50'">
                <i class="bi bi-eye me-1"></i> Ver más
              </button>
              </button>
            </div>
            <button class="btn w-100 btn-agregar-carrito" 
                    style="background: linear-gradient(135deg, #3b5d50, #2c5530); color: white; font-weight: 600; border: none; padding: 10px; font-size: 0.9rem;"
                    data-product-id="${producto.id}"
                    data-quantity="1"
                    ${isOutOfStock ? 'disabled' : ''}
                    onclick="store.agregarAlCarrito(${producto.id})"
                    onmouseover="if(!this.disabled) this.style.background='linear-gradient(135deg, #2c5530, #1d3a22)'"
                    onmouseout="if(!this.disabled) this.style.background='linear-gradient(135deg, #3b5d50, #2c5530)'">
              <i class="bi bi-cart-plus me-2"></i> ${addToCartButtonText}
            </button>
          </div>
        </div>
      </div>
    `;

    return productCard;
  }

  agregarAlCarrito(productoId) {
    try {
      // Encontrar el producto
      const producto = this.productos.find(p => p.id === productoId);
      if (!producto || !producto.disponible || producto.stock === 0) {
        return;
      }

      // Obtener carrito actual del localStorage
      let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
      
      // Buscar si el producto ya está en el carrito
      const itemExistente = carrito.find(item => item.id === productoId);
      
      if (itemExistente) {
        // Si ya existe, incrementar cantidad
        if (itemExistente.cantidad >= producto.stock) {
          return;
        }
        itemExistente.cantidad++;
      } else {
        // Si no existe, agregarlo
        carrito.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagenes ? producto.imagenes[0] : 'pages/logo sin fondo (1).png',
          cantidad: 1,
          sku: producto.sku || producto.id
        });
      }

      // Guardar el carrito actualizado
      localStorage.setItem('carrito', JSON.stringify(carrito));
      
      // Actualizar la variable local del carrito
      this.carrito = carrito;
      
      // Actualizar contador y mostrar notificación
      this.actualizarContadorCarrito();
      this.mostrarNotificacion('¡Agregado! ✅', 'success');
      
      // Actualizar modal del carrito si está disponible
      if (window.universalModals && typeof window.universalModals.updateCartModal === 'function') {
        window.universalModals.updateCartModal();
      }
      
      console.log('✅ Producto agregado al carrito:', producto.nombre);
      
    } catch (error) {
      console.error('❌ Error agregando producto al carrito:', error);
    }
  }

  eliminarDelCarrito(productoId) {
    this.carrito = this.carrito.filter(item => item.id !== productoId);
    this.guardarCarrito();
    this.actualizarContadorCarrito();
    this.renderizarCarrito();
  }

  cambiarCantidad(productoId, nuevaCantidad) {
    const item = this.carrito.find(item => item.id === productoId);
    const producto = this.productos.find(p => p.id === productoId);
    
    if (item && producto) {
      if (nuevaCantidad > producto.stock) {
        this.mostrarNotificacion('¡Ups! No hay más stock 📦', 'warning');
        return;
      }
      if (nuevaCantidad <= 0) {
        this.eliminarDelCarrito(productoId);
        return;
      }
      item.cantidad = nuevaCantidad;
      this.guardarCarrito();
      this.actualizarContadorCarrito();
      this.renderizarCarrito();
    }
  }

  calcularTotal() {
    return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  calcularDescuentoTransferencia() {
    const total = this.calcularTotal();
    
    // Validación de casos edge
    if (total <= 0) {
      console.warn('⚠️ Total del carrito es 0 o negativo:', total);
      return 0;
    }
    
    const porcentaje = this.configuracion?.descuentoTransferencia || 10;
    
    // Validar porcentaje válido
    if (porcentaje <= 0) {
      console.warn('⚠️ Porcentaje de descuento inválido:', porcentaje);
      return 0;
    }
    
    if (porcentaje >= 100) {
      console.warn('⚠️ Porcentaje de descuento >= 100%:', porcentaje);
      return total; // Descuento total
    }
    
    const descuento = Math.round(total * porcentaje / 100);
    console.log(`💰 Descuento calculado: ${porcentaje}% de $${total.toLocaleString()} = $${descuento.toLocaleString()}`);
    
    return descuento;
  }

  buscarProductos(termino) {
    // Validación de entrada
    if (!termino || typeof termino !== 'string') {
      console.warn('⚠️ buscarProductos: término de búsqueda inválido', termino);
      return [];
    }
    
    const terminoLimpio = termino.trim();
    if (terminoLimpio.length < 2) {
      console.log('ℹ️ buscarProductos: término muy corto, mínimo 2 caracteres');
      return [];
    }
    
    const terminoLower = terminoLimpio.toLowerCase();
    const resultados = this.productos.filter(producto => 
      producto.nombre?.toLowerCase().includes(terminoLower) ||
      producto.descripcionCorta?.toLowerCase().includes(terminoLower) ||
      producto.tags?.some(tag => tag.toLowerCase().includes(terminoLower))
    );
    
    console.log(`🔍 Búsqueda: "${terminoLimpio}" encontró ${resultados.length} productos`);
    return resultados;
  }

  filtrarPorCategoria(categoria) {
    if (!categoria || categoria === 'todos') {
      return this.productos;
    }
    return this.productos.filter(producto => producto.categoria === categoria);
  }

  filtrarPorPrecio(min, max) {
    // Validación de parámetros
    if (typeof min !== 'number' || typeof max !== 'number') {
      console.error('❌ filtrarPorPrecio: min y max deben ser números', { min, max });
      return this.productos;
    }
    
    if (min < 0 || max < 0) {
      console.warn('⚠️ filtrarPorPrecio: valores negativos no permitidos', { min, max });
      return this.productos;
    }
    
    if (min > max) {
      console.warn('⚠️ filtrarPorPrecio: min no puede ser mayor que max', { min, max });
      [min, max] = [max, min]; // Intercambiar valores
    }
    
    const resultados = this.productos.filter(producto => 
      producto.precio >= min && producto.precio <= max
    );
    
    console.log(`🔍 Filtro por precio: $${min.toLocaleString()} - $${max.toLocaleString()}: ${resultados.length} productos`);
    return resultados;
  }

  verDetalleProducto(productoId) {
    const producto = this.productos.find(p => p.id === productoId);
    if (producto) {
      // Crear URL amigable para el producto
      const url = `producto.html?id=${productoId}&slug=${producto.slug || ''}`;
      window.location.href = url;
    }
  }

  guardarCarrito() {
    // Siempre usar 'carrito' como key para consistencia
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }

  actualizarContadorCarrito() {
    try {
      // Leer directamente del localStorage para máxima consistencia
      const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
      const contador = document.getElementById('cart-count');
      
      if (contador) {
        const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'inline-block' : 'none';
      }

      // Actualizar navbar si existe
      if (window.universalNavbar && typeof window.universalNavbar.refreshCartCounter === 'function') {
        window.universalNavbar.refreshCartCounter();
      }

      // Actualizar modal del carrito si está disponible
      if (window.universalModals && typeof window.universalModals.updateCartModal === 'function') {
        window.universalModals.updateCartModal();
      }
    } catch (error) {
      console.error('Error actualizando contador del carrito:', error);
    }
  }

  renderizarCarrito() {
    const contenedor = document.getElementById('carrito-contenido');
    if (!contenedor) return;

    // Siempre leer del localStorage para tener datos actualizados
    this.carrito = JSON.parse(localStorage.getItem('carrito') || '[]');

    if (this.carrito.length === 0) {
      contenedor.innerHTML = `
        <div class="carrito-vacio">
          <i class="bi bi-cart-x" style="font-size:2.5rem;"></i><br>
          Tu carrito está vacío.
        </div>
      `;
      return;
    }

    const total = this.calcularTotal();
    const descuentoTransferencia = this.calcularDescuentoTransferencia();

    let html = `
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

    this.carrito.forEach(item => {
      const subtotal = item.precio * item.cantidad;
      html += `
        <tr>
          <td>
            <img src="${item.imagen}" alt="${item.nombre}" class="carrito-producto-img">
          </td>
          <td class="carrito-producto-nombre">${item.nombre}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-secondary" onclick="store.cambiarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
            <input type="number" min="1" class="carrito-cantidad-input" value="${item.cantidad}" onchange="store.cambiarCantidad(${item.id}, parseInt(this.value))">
            <button class="btn btn-sm btn-outline-secondary" onclick="store.cambiarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
          </td>
          <td class="text-end carrito-producto-precio">$${item.precio.toLocaleString()}</td>
          <td class="text-end carrito-producto-precio">$${subtotal.toLocaleString()}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-danger" title="Eliminar" onclick="store.eliminarDelCarrito(${item.id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
      <div class="carrito-total">Total: $${total.toLocaleString()}</div>
      <div class="text-muted mb-3">
        <small><i class="bi bi-percent"></i> Con transferencia: $${(total - descuentoTransferencia).toLocaleString()} (${this.configuracion.descuentoTransferencia || 10}% off)</small>
      </div>
      <button class="btn-carrito" onclick="store.irACheckout()">
        <i class="bi bi-bag-check"></i> Finalizar compra
      </button>
      <button class="btn-vaciar" onclick="store.vaciarCarrito()">
        <i class="bi bi-trash"></i> Vaciar carrito
      </button>
    `;

    contenedor.innerHTML = html;
  }

  vaciarCarrito() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this.carrito = [];
      this.guardarCarrito();
      this.actualizarContadorCarrito();
      this.renderizarCarrito();
    }
  }

  irACheckout() {
    if (this.carrito.length === 0) {
      return;
    }
    window.location.href = 'checkout.html';
  }

  inicializarEventos() {
    // Buscador
    const buscador = document.querySelector('input[type="search"]');
    if (buscador) {
      buscador.addEventListener('input', (e) => {
        const termino = e.target.value.trim();
        if (termino.length >= 2) {
          const resultados = this.buscarProductos(termino);
          this.renderizarProductos(resultados);
        } else if (termino.length === 0) {
          this.renderizarProductos();
        }
      });
    }

    // Formulario de búsqueda
    const formBusqueda = document.querySelector('form[role="search"]');
    if (formBusqueda) {
      formBusqueda.addEventListener('submit', (e) => {
        e.preventDefault();
        const termino = buscador.value.trim();
        if (termino) {
          const resultados = this.buscarProductos(termino);
          this.renderizarProductos(resultados);
        }
      });
    }
  }

  getColorNotificacion(tipo) {
    const colores = {
      success: '#28a745',
      error: '#dc3545', 
      warning: '#ff8c00',
      info: '#007bff'
    };
    return colores[tipo] || '#007bff';
  }
}

// Inicializar la tienda cuando se carga el documento
let store;
document.addEventListener('DOMContentLoaded', () => {
  store = new PatagoniaStore();
});

// Exportar para uso global
window.PatagoniaStore = PatagoniaStore;