// Sistema de Tienda - Patagonia Style
class Store {
  constructor() {
    this.productos = [];
    this.carrito = this.cargarCarrito();
    this.favoritos = this.cargarFavoritos();
    this.init();
  }

  async init() {
    try {
      await this.cargarProductos();
      this.renderizarProductos();
      this.actualizarContadorCarrito();
    } catch (error) {
      console.error('Error inicializando la tienda:', error);
    }
  }

  async cargarProductos() {
    try {
      const response = await fetch('data/productos.json');
      if (!response.ok) {
        throw new Error('No se pudo cargar el catálogo de productos');
      }
      this.productos = await response.json();
    } catch (error) {
      console.error('Error cargando productos:', error);
      // Productos de respaldo en caso de error
      this.productos = [
        {
          id: 1,
          nombre: "Jarro Zorrito Invierno",
          precio: 18000,
          descuento: 8,
          categoria: "jarros",
          imagen: "pages/jarro1.webp",
          descripcion: "Jarro enlozado inspirado en la Patagonia. Capacidad 330ml.",
          stock: 15
        },
        {
          id: 2,
          nombre: "Cuaderno Zorro",
          precio: 12000,
          descuento: 14,
          categoria: "papeleria",
          imagen: "pages/cuadernoportada.webp",
          descripcion: "Cuaderno anillado A4 con diseño original de vivipinta.",
          stock: 25
        },
        {
          id: 3,
          nombre: "Yerbera Bariloche",
          precio: 35000,
          descuento: 0,
          categoria: "accesorios",
          imagen: "pages/yerbraportada.webp",
          descripcion: "Yerbera ilustrada con paisajes de montaña, bosque y lago.",
          stock: 8
        }
      ];
    }
  }

  renderizarProductos(productosAMostrar = null) {
    const productos = productosAMostrar || this.productos;
    const container = document.getElementById('productos-container');
    
    if (!container) {
      console.error('No se encontró el contenedor de productos');
      return;
    }

    container.innerHTML = '';

    productos.forEach(producto => {
      const precioFinal = producto.descuento > 0 
        ? producto.precio * (1 - producto.descuento / 100)
        : producto.precio;

      const card = document.createElement('div');
      card.className = 'col';
      card.innerHTML = `
        <div class="card h-100 shadow-sm product-card" data-product-id="${producto.id}" style="border-radius: 15px; overflow: hidden; transition: transform 0.3s;">
          ${producto.descuento > 0 ? `<div class="badge-descuento">${producto.descuento}% OFF</div>` : ''}
          <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="height: 250px; object-fit: cover;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title text-center mb-3" style="color: #3b5d50; font-weight: 600;">${producto.nombre}</h5>
            <p class="card-text flex-grow-1 text-muted small text-center">${producto.descripcion}</p>
            <div class="text-center mb-3">
              <div class="h5 mb-1" style="color: #3b5d50; font-weight: 700;">$${Math.round(precioFinal).toLocaleString()}</div>
              ${producto.descuento > 0 ? `<div class="text-muted text-decoration-line-through">$${producto.precio.toLocaleString()}</div>` : ''}
            </div>
            <div class="d-grid gap-2">
              <button class="btn btn-outline-secondary d-flex align-items-center justify-content-center" onclick="window.location.href='producto.html?id=${producto.id}'" style="border-color: #f4a259; color: #f4a259;">
                <i class="bi bi-eye me-2"></i>Ver más
              </button>
              <button class="btn btn-card d-flex align-items-center justify-content-center" onclick="store.agregarAlCarrito(${producto.id})" style="background: #f4a259; border: none; color: white;">
                <i class="bi bi-cart-plus me-2"></i>Agregar al carrito
              </button>
            </div>
            <div class="text-center mt-2">
              <button class="btn btn-link p-0" onclick="store.toggleFavorito(${producto.id})" title="Agregar a favoritos" style="color: #ccc;">
                <i class="bi ${this.favoritos.includes(producto.id) ? 'bi-heart-fill text-danger' : 'bi-heart'}" style="font-size: 1.2rem;"></i>
              </button>
            </div>
            ${producto.stock < 5 ? `<small class="text-warning mt-2"><i class="bi bi-exclamation-triangle"></i> Últimas ${producto.stock} unidades</small>` : ''}
          </div>
        </div>
      `;

      // Añadir efecto hover
      const cardElement = card.querySelector('.card');
      cardElement.addEventListener('mouseenter', () => {
        cardElement.style.transform = 'translateY(-5px)';
      });
      cardElement.addEventListener('mouseleave', () => {
        cardElement.style.transform = 'translateY(0)';
      });

      container.appendChild(card);
    });

    // Verificar si no hay productos
    const noProductos = document.getElementById('no-productos');
    if (noProductos) {
      noProductos.style.display = productos.length === 0 ? 'block' : 'none';
    }
  }

  filtrarPorCategoria(categoria) {
    if (categoria === 'todos') {
      return this.productos;
    }
    return this.productos.filter(producto => producto.categoria === categoria);
  }

  agregarAlCarrito(productId) {
    const producto = this.productos.find(p => p.id === productId);
    if (!producto) {
      console.error('Producto no encontrado');
      return;
    }

    if (producto.stock <= 0) {
      this.mostrarNotificacion('Producto sin stock', 'error');
      return;
    }

    const itemExistente = this.carrito.find(item => item.id === productId);
    
    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock) {
        itemExistente.cantidad++;
      } else {
        this.mostrarNotificacion('No hay más stock disponible', 'warning');
        return;
      }
    } else {
      this.carrito.push({
        id: productId,
        nombre: producto.nombre,
        precio: producto.precio,
        descuento: producto.descuento,
        imagen: producto.imagen,
        cantidad: 1
      });
    }

    this.guardarCarrito();
    this.actualizarContadorCarrito();
    this.mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
  }

  eliminarDelCarrito(productId) {
    this.carrito = this.carrito.filter(item => item.id !== productId);
    this.guardarCarrito();
    this.actualizarContadorCarrito();
  }

  actualizarCantidadCarrito(productId, nuevaCantidad) {
    const item = this.carrito.find(item => item.id === productId);
    if (item) {
      if (nuevaCantidad <= 0) {
        this.eliminarDelCarrito(productId);
      } else {
        item.cantidad = nuevaCantidad;
        this.guardarCarrito();
        this.actualizarContadorCarrito();
      }
    }
  }

  vaciarCarrito() {
    this.carrito = [];
    this.guardarCarrito();
    this.actualizarContadorCarrito();
  }

  obtenerTotalCarrito() {
    return this.carrito.reduce((total, item) => {
      const precioFinal = item.descuento > 0 
        ? item.precio * (1 - item.descuento / 100)
        : item.precio;
      return total + (precioFinal * item.cantidad);
    }, 0);
  }

  obtenerCantidadTotal() {
    return this.carrito.reduce((total, item) => total + item.cantidad, 0);
  }

  actualizarContadorCarrito() {
    const contador = document.getElementById('cart-count');
    if (contador) {
      const cantidadTotal = this.obtenerCantidadTotal();
      contador.textContent = cantidadTotal;
      contador.style.display = cantidadTotal > 0 ? 'inline' : 'none';
    }
  }

  toggleFavorito(productId) {
    const index = this.favoritos.indexOf(productId);
    if (index > -1) {
      this.favoritos.splice(index, 1);
    } else {
      this.favoritos.push(productId);
    }
    this.guardarFavoritos();
    this.renderizarProductos(); // Re-renderizar para actualizar iconos
  }

  cargarCarrito() {
    try {
      const carritoGuardado = localStorage.getItem('patagonia_carrito');
      return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    } catch (error) {
      console.error('Error cargando carrito:', error);
      return [];
    }
  }

  guardarCarrito() {
    try {
      localStorage.setItem('patagonia_carrito', JSON.stringify(this.carrito));
    } catch (error) {
      console.error('Error guardando carrito:', error);
    }
  }

  cargarFavoritos() {
    try {
      const favoritosGuardados = localStorage.getItem('patagonia_favoritos');
      return favoritosGuardados ? JSON.parse(favoritosGuardados) : [];
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      return [];
    }
  }

  guardarFavoritos() {
    try {
      localStorage.setItem('patagonia_favoritos', JSON.stringify(this.favoritos));
    } catch (error) {
      console.error('Error guardando favoritos:', error);
    }
  }

  mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear notificación toast
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${tipo === 'success' ? 'success' : tipo === 'error' ? 'danger' : 'warning'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '9999';
    
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${tipo === 'success' ? 'bi-check-circle' : tipo === 'error' ? 'bi-x-circle' : 'bi-exclamation-triangle'} me-2"></i>
          ${mensaje}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;

    document.body.appendChild(toast);
    
    // Inicializar y mostrar toast de Bootstrap
    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();
    
    // Eliminar del DOM después de que se oculte
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  }

  // Método para obtener producto por ID
  obtenerProducto(id) {
    return this.productos.find(p => p.id === id);
  }

  // Método para buscar productos
  buscarProductos(termino) {
    if (!termino) return this.productos;
    
    termino = termino.toLowerCase();
    return this.productos.filter(producto => 
      producto.nombre.toLowerCase().includes(termino) ||
      producto.descripcion.toLowerCase().includes(termino) ||
      producto.categoria.toLowerCase().includes(termino)
    );
  }
}

// Inicializar la tienda cuando se carga la página
let store;
document.addEventListener('DOMContentLoaded', function() {
  store = new Store();
});

// Función global para compatibilidad
function actualizarCarrito() {
  if (store) {
    store.actualizarContadorCarrito();
  }
}
