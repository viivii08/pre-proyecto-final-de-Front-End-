/**
 * 🛒 SISTEMA DE CARRITO DE EMERGENCIA
 * Solución robusta e independiente para manejar el carrito
 */

class CarritoEmergencia {
    constructor() {
        this.storageKey = 'patagonia_carrito';
        this.carrito = this.cargarCarrito();
        this.init();
    }

    init() {
        console.log('🛒 Inicializando CarritoEmergencia...');
        
        // Verificar si estamos en la página del carrito
        if (window.location.pathname.includes('carrito.html')) {
            this.renderizarCarrito();
        }
        
        this.actualizarContador();
        this.bindEventos();
        
        console.log('✅ CarritoEmergencia inicializado:', this.carrito);
    }

    cargarCarrito() {
        try {
            // Intentar cargar de múltiples ubicaciones
            const ubicaciones = [
                'patagonia_carrito',
                'store_carrito', 
                'carrito',
                'cart'
            ];

            for (let key of ubicaciones) {
                const data = localStorage.getItem(key);
                if (data) {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        console.log(`✅ Carrito cargado desde: ${key}`);
                        return parsed;
                    }
                }
            }
            
            console.log('ℹ️ No se encontró carrito en localStorage');
            return [];
            
        } catch (error) {
            console.error('❌ Error cargando carrito:', error);
            return [];
        }
    }

    guardarCarrito() {
        try {
            const data = JSON.stringify(this.carrito);
            
            // Guardar en múltiples ubicaciones para compatibilidad
            localStorage.setItem(this.storageKey, data);
            localStorage.setItem('store_carrito', data);
            localStorage.setItem('carrito', data);
            
            console.log('💾 Carrito guardado:', this.carrito);
            
        } catch (error) {
            console.error('❌ Error guardando carrito:', error);
        }
    }

    agregarProducto(producto) {
        try {
            const existente = this.carrito.find(item => item.id === producto.id);
            
            if (existente) {
                existente.cantidad += 1;
            } else {
                this.carrito.push({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    imagen: producto.imagen || producto.imagenes?.[0],
                    cantidad: 1
                });
            }
            
            this.guardarCarrito();
            this.actualizarContador();
            this.mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error agregando producto:', error);
            this.mostrarNotificacion('Error al agregar producto', 'error');
            return false;
        }
    }

    cambiarCantidad(id, nuevaCantidad) {
        try {
            const item = this.carrito.find(item => item.id === id);
            
            if (!item) {
                console.error('❌ Producto no encontrado:', id);
                return false;
            }
            
            if (nuevaCantidad <= 0) {
                return this.eliminarProducto(id);
            }
            
            item.cantidad = Math.max(1, parseInt(nuevaCantidad));
            
            this.guardarCarrito();
            this.actualizarContador();
            
            // Si estamos en la página del carrito, re-renderizar
            if (window.location.pathname.includes('carrito.html')) {
                this.renderizarCarrito();
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error cambiando cantidad:', error);
            return false;
        }
    }

    eliminarProducto(id) {
        try {
            const index = this.carrito.findIndex(item => item.id === id);
            
            if (index === -1) {
                console.error('❌ Producto no encontrado para eliminar:', id);
                return false;
            }
            
            const producto = this.carrito[index];
            this.carrito.splice(index, 1);
            
            this.guardarCarrito();
            this.actualizarContador();
            
            this.mostrarNotificacion(`${producto.nombre} eliminado del carrito`, 'warning');
            
            // Si estamos en la página del carrito, re-renderizar
            if (window.location.pathname.includes('carrito.html')) {
                this.renderizarCarrito();
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error eliminando producto:', error);
            return false;
        }
    }

    vaciarCarrito() {
        try {
            if (this.carrito.length === 0) {
                this.mostrarNotificacion('El carrito ya está vacío', 'info');
                return true;
            }
            
            if (confirm(`¿Vaciar todo el carrito?\n\nSe eliminarán ${this.carrito.length} productos.`)) {
                this.carrito = [];
                
                // Limpiar todas las ubicaciones
                localStorage.removeItem(this.storageKey);
                localStorage.removeItem('store_carrito');
                localStorage.removeItem('carrito');
                localStorage.removeItem('cart');
                
                this.actualizarContador();
                this.mostrarNotificacion('Carrito vaciado', 'info');
                
                // Re-renderizar si estamos en la página del carrito
                if (window.location.pathname.includes('carrito.html')) {
                    this.renderizarCarrito();
                }
                
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Error vaciando carrito:', error);
            return false;
        }
    }

    calcularTotal() {
        return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }

    obtenerCantidadItems() {
        return this.carrito.reduce((total, item) => total + item.cantidad, 0);
    }

    actualizarContador() {
        try {
            const contador = document.getElementById('cart-count');
            if (contador) {
                const totalItems = this.obtenerCantidadItems();
                contador.textContent = totalItems;
                contador.style.display = totalItems > 0 ? 'inline-block' : 'none';
            }
        } catch (error) {
            console.error('❌ Error actualizando contador:', error);
        }
    }

    renderizarCarrito() {
        try {
            const contenedor = document.getElementById('carrito-contenido');
            if (!contenedor) {
                console.warn('⚠️ Contenedor del carrito no encontrado');
                return;
            }

            if (this.carrito.length === 0) {
                contenedor.innerHTML = this.getCarritoVacioHTML();
                return;
            }

            const total = this.calcularTotal();
            const html = this.getCarritoConProductosHTML(total);
            
            contenedor.innerHTML = html;
            
            console.log('✅ Carrito renderizado correctamente');
            
        } catch (error) {
            console.error('❌ Error renderizando carrito:', error);
            this.renderizarCarritoError();
        }
    }

    getCarritoVacioHTML() {
        return `
            <div class="carrito-vacio text-center p-5">
                <div class="mb-4">
                    <i class="bi bi-cart-x" style="font-size: 4rem; color: #ccc;"></i>
                </div>
                <h3 class="mb-3">Tu carrito está vacío</h3>
                <p class="text-muted mb-4">¡Descubre nuestros productos únicos inspirados en la Patagonia!</p>
                <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                    <a href="tienda.html" class="btn btn-primary btn-lg">
                        <i class="bi bi-shop me-2"></i>Explorar Tienda
                    </a>
                    <a href="portafolio.html" class="btn btn-outline-secondary btn-lg">
                        <i class="bi bi-images me-2"></i>Ver Portafolio
                    </a>
                </div>
            </div>
        `;
    }

    getCarritoConProductosHTML(total) {
        let html = `
            <div class="alert alert-success d-flex align-items-center">
                <i class="bi bi-check-circle me-2"></i>
                <strong>¡${this.carrito.length} productos en tu carrito!</strong>
            </div>
            
            <div class="table-responsive">
                <table class="table align-middle">
                    <thead>
                        <tr>
                            <th style="width: 80px;"></th>
                            <th>Producto</th>
                            <th class="text-center" style="width: 150px;">Cantidad</th>
                            <th class="text-end" style="width: 120px;">Precio</th>
                            <th class="text-end" style="width: 120px;">Subtotal</th>
                            <th class="text-center" style="width: 80px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        this.carrito.forEach((item, index) => {
            const subtotal = item.precio * item.cantidad;
            html += `
                <tr>
                    <td>
                        <img src="${item.imagen}" alt="${item.nombre}" 
                             class="carrito-producto-img rounded border"
                             style="width: 60px; height: 60px; object-fit: cover;"
                             onerror="this.src='pages/logo sin fondo (1).png'">
                    </td>
                    <td>
                        <div>
                            <h6 class="mb-1 carrito-producto-nombre">${item.nombre}</h6>
                            <small class="text-muted">SKU: ${item.sku || item.id}</small>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center justify-content-center">
                            <button class="btn btn-sm btn-outline-secondary" 
                                    onclick="carritoEmergencia.cambiarCantidad(${item.id}, ${item.cantidad - 1})"
                                    ${item.cantidad <= 1 ? 'disabled' : ''}>
                                <i class="bi bi-dash"></i>
                            </button>
                            
                            <input type="number" class="form-control form-control-sm mx-2 text-center" 
                                   style="width: 60px;" value="${item.cantidad}" min="1" max="99"
                                   onchange="carritoEmergencia.cambiarCantidad(${item.id}, parseInt(this.value))">
                            
                            <button class="btn btn-sm btn-outline-secondary" 
                                    onclick="carritoEmergencia.cambiarCantidad(${item.id}, ${item.cantidad + 1})">
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                    </td>
                    <td class="text-end carrito-producto-precio">
                        $${item.precio.toLocaleString()}
                    </td>
                    <td class="text-end">
                        <strong class="carrito-producto-precio text-primary">
                            $${subtotal.toLocaleString()}
                        </strong>
                    </td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="carritoEmergencia.eliminarProducto(${item.id})"
                                title="Eliminar producto">
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
            
            <div class="row mt-4">
                <div class="col-lg-8">
                    <div class="d-flex gap-2 flex-wrap">
                        <a href="tienda.html" class="btn btn-outline-primary">
                            <i class="bi bi-arrow-left me-1"></i>Seguir comprando
                        </a>
                        <button class="btn btn-outline-danger" onclick="carritoEmergencia.vaciarCarrito()">
                            <i class="bi bi-trash me-1"></i>Vaciar carrito
                        </button>
                    </div>
                </div>
                
                <div class="col-lg-4">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h5 class="card-title mb-3">Resumen del pedido</h5>
                            
                            <div class="d-flex justify-content-between mb-2">
                                <span>Subtotal (${this.carrito.length} productos):</span>
                                <strong>$${total.toLocaleString()}</strong>
                            </div>
                            
                            <div class="d-flex justify-content-between mb-2">
                                <span>Envío:</span>
                                <span class="text-success fw-bold">¡Gratis!</span>
                            </div>
                            
                            <div class="d-flex justify-content-between mb-3">
                                <span><small class="text-muted">Con transferencia (10% OFF):</small></span>
                                <span class="text-success"><small>$${Math.round(total * 0.9).toLocaleString()}</small></span>
                            </div>
                            
                            <hr>
                            
                            <div class="d-flex justify-content-between mb-3">
                                <h5>Total:</h5>
                                <h5 class="text-primary">$${total.toLocaleString()}</h5>
                            </div>
                            
                            <button class="btn btn-success btn-lg w-100 mb-2" 
                                    onclick="carritoEmergencia.irACheckout()">
                                <i class="bi bi-bag-check me-2"></i>Finalizar compra
                            </button>
                            
                            <div class="text-center">
                                <small class="text-muted">
                                    <i class="bi bi-shield-check me-1"></i>
                                    Pago 100% seguro
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    renderizarCarritoError() {
        const contenedor = document.getElementById('carrito-contenido');
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="alert alert-danger text-center">
                    <i class="bi bi-exclamation-triangle fs-2 mb-3 d-block"></i>
                    <h4>Error al cargar el carrito</h4>
                    <p>Hubo un problema técnico. Por favor, actualiza la página.</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        <i class="bi bi-arrow-clockwise"></i> Actualizar página
                    </button>
                </div>
            `;
        }
    }

    irACheckout() {
        try {
            if (this.carrito.length === 0) {
                this.mostrarNotificacion('Tu carrito está vacío', 'warning');
                return;
            }

            // Asegurar que el carrito esté guardado antes de ir al checkout
            this.guardarCarrito();
            
            window.location.href = 'checkout.html';
            
        } catch (error) {
            console.error('❌ Error yendo al checkout:', error);
            this.mostrarNotificacion('Error al proceder al checkout', 'error');
        }
    }

    bindEventos() {
        // Escuchar cambios en localStorage para sincronizar entre pestañas
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.carrito = this.cargarCarrito();
                this.actualizarContador();
                
                if (window.location.pathname.includes('carrito.html')) {
                    this.renderizarCarrito();
                }
            }
        });

        // Escuchar eventos personalizados
        document.addEventListener('carrito:agregar', (e) => {
            this.agregarProducto(e.detail);
        });

        document.addEventListener('carrito:actualizar', () => {
            this.actualizarContador();
        });
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        try {
            // Crear notificación toast
            const toast = document.createElement('div');
            toast.className = `toast-notification toast-${tipo} position-fixed`;
            
            const icon = this.getIconoTipo(tipo);
            const color = this.getColorTipo(tipo);
            
            toast.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="bi bi-${icon} me-2"></i>
                    <span>${mensaje}</span>
                </div>
            `;
            
            toast.style.cssText = `
                top: 20px;
                right: 20px;
                background: ${color};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                animation: slideInRight 0.3s ease;
                font-weight: 500;
                max-width: 300px;
            `;
            
            document.body.appendChild(toast);
            
            // Remover después de 4 segundos
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }, 4000);
            
        } catch (error) {
            console.error('❌ Error mostrando notificación:', error);
            // Fallback a alert
            alert(`${tipo.toUpperCase()}: ${mensaje}`);
        }
    }

    getIconoTipo(tipo) {
        const iconos = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return iconos[tipo] || 'info-circle';
    }

    getColorTipo(tipo) {
        const colores = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        return colores[tipo] || '#17a2b8';
    }

    // Método público para obtener el estado del carrito
    getEstado() {
        return {
            items: this.carrito,
            total: this.calcularTotal(),
            cantidad: this.obtenerCantidadItems()
        };
    }

    // Método para debug
    debug() {
        console.log('🛒 Estado del CarritoEmergencia:');
        console.table(this.carrito);
        console.log(`💰 Total: $${this.calcularTotal().toLocaleString()}`);
        console.log(`📦 Items: ${this.obtenerCantidadItems()}`);
    }
}

// CSS para las animaciones
if (!document.getElementById('carrito-emergencia-styles')) {
    const style = document.createElement('style');
    style.id = 'carrito-emergencia-styles';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .toast-notification {
            animation: slideInRight 0.3s ease;
        }
        
        .carrito-producto-img:hover {
            transform: scale(1.05);
            transition: transform 0.2s ease;
        }
        
        .btn:hover {
            transform: translateY(-1px);
            transition: all 0.2s ease;
        }
    `;
    document.head.appendChild(style);
}

// Inicializar cuando el DOM esté listo
let carritoEmergencia;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        carritoEmergencia = new CarritoEmergencia();
        window.carritoEmergencia = carritoEmergencia;
        console.log('✅ CarritoEmergencia disponible globalmente');
    });
} else {
    carritoEmergencia = new CarritoEmergencia();
    window.carritoEmergencia = carritoEmergencia;
    console.log('✅ CarritoEmergencia disponible globalmente');
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CarritoEmergencia;
}