/**
 * 🛒 SISTEMA DE CARRITO UNIFICADO - Patagonia Style
 * Sistema completo y robusto para gestión del carrito de compras
 */

(function() {
    'use strict';
    
    console.log('🚀 [CarritoUnificado] Iniciando Sistema de Carrito...');
    
    // Clase principal del carrito
    class CarritoUnificado {
        constructor() {
            this.STORAGE_KEY = 'patagonia_carrito';
            this.productos = [];
            this.inicializar();
        }
        
        inicializar() {
            console.log('🔧 [CarritoUnificado] Inicializando carrito...');
            this.cargarDesdeLocalStorage();
            this.actualizarUI();
            
            // Si estamos en la página del carrito, renderizar
            if (window.location.pathname.includes('carrito.html')) {
                console.log('📄 [CarritoUnificado] Detectada página de carrito');
                this.renderizarPaginaCarrito();
            }
            
            console.log(`✅ [CarritoUnificado] Carrito inicializado con ${this.productos.length} productos`);
        }
        
        cargarDesdeLocalStorage() {
            try {
                // Intentar cargar de múltiples fuentes para compatibilidad
                const keys = ['patagonia_carrito', 'store_carrito', 'carrito', 'cart'];
                
                for (const key of keys) {
                    const data = localStorage.getItem(key);
                    if (data) {
                        const parsed = JSON.parse(data);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            this.productos = parsed;
                            console.log(`📦 [CarritoUnificado] Cargados ${this.productos.length} productos desde ${key}`);
                            return;
                        }
                    }
                }
                
                console.log('📭 [CarritoUnificado] No hay productos en el carrito');
            } catch (error) {
                console.error('❌ [CarritoUnificado] Error cargando carrito:', error);
                this.productos = [];
            }
        }
        
        guardarEnLocalStorage() {
            try {
                const data = JSON.stringify(this.productos);
                
                // Guardar en todas las ubicaciones para compatibilidad
                localStorage.setItem('patagonia_carrito', data);
                localStorage.setItem('store_carrito', data);
                localStorage.setItem('carrito', data);
                localStorage.setItem('cart', data);
                
                console.log(`💾 [CarritoUnificado] Guardados ${this.productos.length} productos`);
            } catch (error) {
                console.error('❌ [CarritoUnificado] Error guardando carrito:', error);
            }
        }
        
        agregar(producto) {
            console.log('➕ [CarritoUnificado] Agregando producto:', producto);
            
            if (!producto || !producto.id) {
                console.error('❌ [CarritoUnificado] Producto inválido:', producto);
                return false;
            }
            
            const existente = this.productos.find(p => p.id === producto.id);
            
            if (existente) {
                existente.cantidad++;
                console.log(`  📦 Cantidad actualizada a: ${existente.cantidad}`);
            } else {
                this.productos.push({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    imagen: producto.imagen || producto.imagenes?.[0],
                    cantidad: 1
                });
                console.log('  ✅ Nuevo producto agregado:', this.productos.length, 'total');
            }
            
            this.guardarEnLocalStorage();
            this.actualizarUI();
            this.mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
            
            console.log('✅ [CarritoUnificado] Producto agregado exitosamente');
            return true;
        }
        
        cambiarCantidad(id, nuevaCantidad) {
            console.log(`🔄 [CarritoUnificado] Cambiando cantidad del producto ${id} a ${nuevaCantidad}`);
            
            const producto = this.productos.find(p => p.id === id);
            
            if (!producto) {
                console.error('❌ [CarritoUnificado] Producto no encontrado:', id);
                return false;
            }
            
            if (nuevaCantidad <= 0) {
                console.log('🗑️ [CarritoUnificado] Cantidad <= 0, eliminando producto');
                return this.eliminar(id);
            }
            
            producto.cantidad = nuevaCantidad;
            this.guardarEnLocalStorage();
            this.actualizarUI();
            
            // Si estamos en la página del carrito, re-renderizar
            if (window.location.pathname.includes('carrito.html')) {
                this.renderizarPaginaCarrito();
            }
            
            console.log(`✅ [CarritoUnificado] Cantidad actualizada a ${nuevaCantidad}`);
            return true;
        }
        
        eliminar(id) {
            console.log(`🗑️ [CarritoUnificado] Eliminando producto ${id}`);
            
            const index = this.productos.findIndex(p => p.id === id);
            
            if (index === -1) {
                console.error('❌ [CarritoUnificado] Producto no encontrado:', id);
                return false;
            }
            
            const producto = this.productos[index];
            this.productos.splice(index, 1);
            
            this.guardarEnLocalStorage();
            this.actualizarUI();
            
            // Si estamos en la página del carrito, re-renderizar
            if (window.location.pathname.includes('carrito.html')) {
                this.renderizarPaginaCarrito();
            }
            
            this.mostrarNotificacion(`${producto.nombre} eliminado del carrito`, 'info');
            console.log(`✅ [CarritoUnificado] Producto eliminado`);
            return true;
        }
        
        vaciar() {
            console.log('🧹 [CarritoUnificado] Vaciando carrito');
            this.productos = [];
            this.guardarEnLocalStorage();
            this.actualizarUI();
            
            // Si estamos en la página del carrito, re-renderizar
            if (window.location.pathname.includes('carrito.html')) {
                this.renderizarPaginaCarrito();
            }
            
            this.mostrarNotificacion('Carrito vaciado', 'info');
            console.log('✅ [CarritoUnificado] Carrito vaciado');
        }
        
        obtenerTotal() {
            return this.productos.reduce((total, p) => total + (p.precio * p.cantidad), 0);
        }
        
        obtenerCantidadTotal() {
            return this.productos.reduce((total, p) => total + p.cantidad, 0);
        }
        
        actualizarUI() {
            const cantidad = this.obtenerCantidadTotal();
            
            // Actualizar todos los contadores posibles
            const selectores = [
                '#cart-count',
                '#cart-counter',
                '.cart-count',
                '#cart-items-count'
            ];
            
            selectores.forEach(selector => {
                const elementos = document.querySelectorAll(selector);
                elementos.forEach(elem => {
                    elem.textContent = cantidad;
                    elem.style.display = cantidad > 0 ? 'inline-block' : 'none';
                });
            });
            
            console.log(`🔄 [CarritoUnificado] UI actualizada: ${cantidad} items`);
        }
        
        renderizarPaginaCarrito() {
            console.log('🎨 [CarritoUnificado] Renderizando página del carrito...');
            
            const contenedor = document.getElementById('carrito-contenido');
            if (!contenedor) {
                console.warn('⚠️ [CarritoUnificado] Contenedor carrito-contenido no encontrado');
                return;
            }
            
            if (this.productos.length === 0) {
                console.log('📭 [CarritoUnificado] Carrito vacío, mostrando mensaje');
                contenedor.innerHTML = this.getHTMLCarritoVacio();
                return;
            }
            
            console.log(`📦 [CarritoUnificado] Renderizando ${this.productos.length} productos`);
            contenedor.innerHTML = this.getHTMLCarritoConProductos();
            console.log('✅ [CarritoUnificado] Carrito renderizado');
        }
        
        getHTMLCarritoVacio() {
            return `
                <div class="text-center py-5">
                    <i class="bi bi-cart-x" style="font-size: 5rem; color: #ccc;"></i>
                    <h3 class="mt-4 mb-3" style="color: #666;">Tu carrito está vacío</h3>
                    <p class="text-muted mb-4">¡Descubre nuestros productos únicos inspirados en la Patagonia!</p>
                    <div class="d-flex gap-3 justify-content-center flex-wrap">
                        <a href="tienda.html" class="btn btn-primary btn-lg px-5">
                            <i class="bi bi-shop me-2"></i>Ir a la Tienda
                        </a>
                        <a href="index.html" class="btn btn-outline-secondary btn-lg px-5">
                            <i class="bi bi-house me-2"></i>Volver al Inicio
                        </a>
                    </div>
                </div>
            `;
        }
        
        getHTMLCarritoConProductos() {
            const total = this.obtenerTotal();
            const descuento = Math.round(total * 0.1);
            const totalConDescuento = total - descuento;
            
            let html = `
                <div class="alert alert-success mb-4 d-flex align-items-center">
                    <i class="bi bi-check-circle-fill me-3 fs-4"></i>
                    <div>
                        <strong>${this.productos.length} producto${this.productos.length !== 1 ? 's' : ''} en tu carrito</strong>
                        <div class="small">¡Envío gratis en todas las compras!</div>
                    </div>
                </div>
                
                <div class="table-responsive">
                    <table class="table align-middle">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 80px;"></th>
                                <th>Producto</th>
                                <th class="text-center" style="width: 180px;">Cantidad</th>
                                <th class="text-end" style="width: 130px;">Precio Unit.</th>
                                <th class="text-end" style="width: 130px;">Subtotal</th>
                                <th class="text-center" style="width: 80px;"></th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            this.productos.forEach(producto => {
                const subtotal = producto.precio * producto.cantidad;
                html += `
                    <tr>
                        <td>
                            <img src="${producto.imagen}" alt="${producto.nombre}" 
                                 class="rounded border"
                                 style="width: 60px; height: 60px; object-fit: cover;"
                                 onerror="this.src='pages/logo sin fondo (1).png'">
                        </td>
                        <td>
                            <h6 class="mb-1">${producto.nombre}</h6>
                            <small class="text-muted">ID: ${producto.id}</small>
                        </td>
                        <td class="text-center">
                            <div class="btn-group" role="group">
                                <button type="button" 
                                        class="btn btn-outline-secondary btn-sm" 
                                        onclick="cambiarCantidad(${producto.id}, ${producto.cantidad - 1})"
                                        ${producto.cantidad <= 1 ? 'disabled' : ''}>
                                    <i class="bi bi-dash"></i>
                                </button>
                                <input type="number" 
                                       class="form-control form-control-sm text-center" 
                                       style="width: 60px;" 
                                       value="${producto.cantidad}" 
                                       min="1" 
                                       max="99"
                                       onchange="cambiarCantidad(${producto.id}, parseInt(this.value))">
                                <button type="button" 
                                        class="btn btn-outline-secondary btn-sm" 
                                        onclick="cambiarCantidad(${producto.id}, ${producto.cantidad + 1})">
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                        </td>
                        <td class="text-end">
                            <strong>$${producto.precio.toLocaleString()}</strong>
                        </td>
                        <td class="text-end">
                            <strong class="text-primary">$${subtotal.toLocaleString()}</strong>
                        </td>
                        <td class="text-center">
                            <button type="button" 
                                    class="btn btn-outline-danger btn-sm" 
                                    onclick="eliminarDelCarrito(${producto.id})"
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
                    <div class="col-md-8">
                        <div class="alert alert-info">
                            <h6><i class="bi bi-info-circle me-2"></i>Información de compra</h6>
                            <ul class="mb-0 small">
                                <li>Envío gratis a todo el país</li>
                                <li>10% de descuento pagando con transferencia</li>
                                <li>Tiempo de entrega: 3-7 días hábiles</li>
                            </ul>
                        </div>
                        <button class="btn btn-outline-danger" onclick="if(confirm('¿Vaciar el carrito?')) carritoUnificado.vaciar()">
                            <i class="bi bi-trash me-2"></i>Vaciar carrito
                        </button>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title mb-3">Resumen del pedido</h5>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <strong>$${total.toLocaleString()}</strong>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Envío:</span>
                                    <strong class="text-success">¡Gratis!</strong>
                                </div>
                                <div class="d-flex justify-content-between mb-2 text-muted small">
                                    <span>Con transferencia (10% OFF):</span>
                                    <span>$${totalConDescuento.toLocaleString()}</span>
                                </div>
                                <hr>
                                <div class="d="flex justify-content-between mb-3">
                                    <h5 class="mb-0">Total:</h5>
                                    <h5 class="mb-0 text-primary">$${total.toLocaleString()}</h5>
                                </div>
                                <a href="checkout.html" class="btn btn-primary w-100 mb-2">
                                    <i class="bi bi-credit-card me-2"></i>Finalizar compra
                                </a>
                                <a href="tienda.html" class="btn btn-outline-secondary w-100">
                                    <i class="bi bi-arrow-left me-2"></i>Seguir comprando
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            return html;
        }
        
        mostrarNotificacion(mensaje, tipo = 'success') {
            // Solo mostrar notificaciones si no estamos en la página del carrito
            if (window.location.pathname.includes('carrito.html')) {
                return;
            }
            
            const colores = {
                success: '#00b894',
                error: '#d63031',
                info: '#0984e3',
                warning: '#fdcb6e'
            };
            
            const iconos = {
                success: 'check-circle-fill',
                error: 'x-circle-fill',
                info: 'info-circle-fill',
                warning: 'exclamation-triangle-fill'
            };
            
            const notif = document.createElement('div');
            notif.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 12px;
                border-left: 4px solid ${colores[tipo]};
                min-width: 300px;
                animation: slideIn 0.3s ease;
            `;
            
            notif.innerHTML = `
                <i class="bi bi-${iconos[tipo]}" style="color: ${colores[tipo]}; font-size: 1.5rem;"></i>
                <span style="flex: 1;">${mensaje}</span>
                <button onclick="this.parentElement.remove()" style="border: none; background: none; cursor: pointer; color: #999;">
                    <i class="bi bi-x-lg"></i>
                </button>
            `;
            
            document.body.appendChild(notif);
            
            setTimeout(() => {
                notif.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notif.remove(), 300);
            }, 3000);
        }
    }
    
    // Crear instancia global
    window.carritoUnificado = new CarritoUnificado();
    console.log('✅ [CarritoUnificado] Sistema de carrito disponible globalmente');
    
})();

// Estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
