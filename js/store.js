// Sistema de gestión de productos para Patagonia Style
class PatagoniaStore {
  constructor() {
    this.productos = [];
    this.categorias = [];
    this.configuracion = {};
    this.carrito = JSON.parse(localStorage.getItem('patagonia_carrito')) || [];
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
    const col = document.createElement('div');
    col.className = 'col';

    const descuentoBadge = producto.descuento > 0 ? 
      `<span class="badge-descuento position-absolute">${producto.descuento}% OFF</span>` : '';

    const precioOriginal = producto.precioOriginal ? 
      `<span class="card-price-old" style="font-size:1.05rem;">$${producto.precioOriginal.toLocaleString()}</span>` : '';

    const stockBadge = producto.stock < 5 ? 
      `<small class="text-warning">¡Últimas ${producto.stock} unidades!</small>` : '';

    col.innerHTML = `
      <div class="card h-100 shadow-lg border-0 position-relative overflow-hidden card-producto" data-producto-id="${producto.id}">
        <div class="overflow-hidden rounded-top" style="height:260px;">
          <img src="${producto.imagenes[0]}" class="card-img-top" alt="${producto.nombre}" onerror="this.src='pages/no-image.png'">
          ${descuentoBadge}
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-2" style="font-weight:700; color:#1f3c5a; font-size:1.35rem;">${producto.nombre}</h5>
          <p class="card-text mb-3" style="color:#444;">${producto.descripcionCorta}</p>
          <div class="mb-3">
            <span class="card-price" style="font-size:1.3rem; color:#3b5d50; font-weight:700;">$${producto.precio.toLocaleString()}</span>
            ${precioOriginal}
          </div>
          ${stockBadge}
          <div class="mt-auto">
            <div class="d-flex gap-2 mb-2">
              <button class="btn btn-card flex-grow-1" onclick="store.verDetalleProducto(${producto.id})">
                <i class="bi bi-eye"></i> Ver más
              </button>
              <button class="btn btn-outline-danger" 
                      data-favorite-id="${producto.sku || producto.id}"
                      title="Agregar a favoritos"
                      style="padding: 8px 12px;">
                <i class="bi bi-heart"></i>
              </button>
            </div>
            <button class="btn btn-card agregar-carrito-btn w-100" onclick="store.agregarAlCarrito(${producto.id})" ${!producto.disponible || producto.stock === 0 ? 'disabled' : ''}>
              <i class="bi bi-cart-plus"></i> ${producto.disponible && producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
            </button>
          </div>
        </div>
      </div>
    `;

    return col;
  }

  agregarAlCarrito(productoId) {
    const producto = this.productos.find(p => p.id === productoId);
    if (!producto || !producto.disponible || producto.stock === 0) {
      this.mostrarNotificacion('Producto no disponible', 'error');
      return;
    }

    const itemCarrito = this.carrito.find(item => item.id === productoId);
    
    if (itemCarrito) {
      if (itemCarrito.cantidad >= producto.stock) {
        this.mostrarNotificacion('Stock insuficiente', 'warning');
        return;
      }
      itemCarrito.cantidad++;
    } else {
      this.carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagenes[0],
        cantidad: 1,
        sku: producto.sku
      });
    }

    this.guardarCarrito();
    this.actualizarContadorCarrito();
    this.mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
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
        this.mostrarNotificacion('Stock insuficiente', 'warning');
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
    return Math.round(total * (this.configuracion.descuentoTransferencia || 10) / 100);
  }

  buscarProductos(termino) {
    const terminoLower = termino.toLowerCase();
    return this.productos.filter(producto => 
      producto.nombre.toLowerCase().includes(terminoLower) ||
      producto.descripcionCorta.toLowerCase().includes(terminoLower) ||
      producto.tags?.some(tag => tag.toLowerCase().includes(terminoLower))
    );
  }

  filtrarPorCategoria(categoria) {
    if (!categoria || categoria === 'todos') {
      return this.productos;
    }
    return this.productos.filter(producto => producto.categoria === categoria);
  }

  filtrarPorPrecio(min, max) {
    return this.productos.filter(producto => 
      producto.precio >= min && producto.precio <= max
    );
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
    localStorage.setItem('patagonia_carrito', JSON.stringify(this.carrito));
  }

  actualizarContadorCarrito() {
    const contador = document.getElementById('cart-count');
    if (contador) {
      const totalItems = this.carrito.reduce((total, item) => total + item.cantidad, 0);
      contador.textContent = totalItems;
      contador.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
  }

  renderizarCarrito() {
    const contenedor = document.getElementById('carrito-contenido');
    if (!contenedor) return;

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
      this.mostrarNotificacion('Carrito vaciado', 'info');
    }
  }

  irACheckout() {
    if (this.carrito.length === 0) {
      this.mostrarNotificacion('El carrito está vacío', 'warning');
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
          this.mostrarNotificacion(`${resultados.length} productos encontrados`, 'info');
        }
      });
    }
  }

  mostrarNotificacion(mensaje, tipo = 'info') {
    // Sistema de notificaciones toast
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${tipo}`;
    toast.innerHTML = `
      <div class="toast-content">
        <i class="bi bi-${this.getIconoNotificacion(tipo)}"></i>
        <span>${mensaje}</span>
      </div>
    `;

    // Estilos del toast
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

    // Remover después de 3 segundos
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
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
}

// CSS para las animaciones de toast
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

  .toast-notification .toast-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;
document.head.appendChild(style);

// Inicializar la tienda cuando se carga el documento
let store;
document.addEventListener('DOMContentLoaded', () => {
  store = new PatagoniaStore();
});

// Exportar para uso global
window.PatagoniaStore = PatagoniaStore;