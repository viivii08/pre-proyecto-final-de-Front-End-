/**
 * 🔧 CÓDIGO JAVASCRIPT MEJORADO PARA JARRO.HTML
 * Versión: 2.0
 * Fecha: $(date)
 * Mejoras: Validaciones robustas, manejo de errores, logging profesional
 */

// ===================================================
// 🎯 CONFIGURACIÓN Y CONSTANTES
// ===================================================

const CONFIG_PRODUCTO = {
  STOCK_MAXIMO: 15,
  CANTIDAD_MAXIMA_POR_PEDIDO: 10,
  CANTIDAD_MINIMA: 1,
  TIMEOUT_NOTIFICACION: 4000,
  PRECIO_JARRO: 21900,
  SKU_JARRO: 'JAR-ZOR-INV-001'
};

// ===================================================
// 🔧 FUNCIONES PRINCIPALES MEJORADAS
// ===================================================

/**
 * Cambia la imagen principal del producto con validaciones
 * @param {HTMLImageElement} imgElement - Elemento imagen clickeado
 */
function cambiarImagenMejorada(imgElement) {
  try {
    console.group('🖼️ CAMBIANDO IMAGEN PRINCIPAL');
    
    // Validar elemento de entrada
    if (!imgElement || !imgElement.src) {
      console.error('❌ Elemento imagen inválido');
      mostrarNotificacion('Error al cambiar imagen', 'error');
      console.groupEnd();
      return;
    }

    // Buscar imagen principal
    const imagenPrincipal = document.getElementById('imagen-principal');
    if (!imagenPrincipal) {
      console.error('❌ Imagen principal no encontrada');
      mostrarNotificacion('Error en la página', 'error');
      console.groupEnd();
      return;
    }

    // Validar que la nueva imagen sea diferente
    if (imagenPrincipal.src === imgElement.src) {
      console.info('ℹ️ La imagen ya está seleccionada');
      console.groupEnd();
      return;
    }

    // Pre-cargar imagen para evitar parpadeos
    const nuevaImagen = new Image();
    nuevaImagen.onload = function() {
      // Actualizar imagen principal con animación suave
      imagenPrincipal.style.opacity = '0.7';
      
      setTimeout(() => {
        imagenPrincipal.src = imgElement.src;
        imagenPrincipal.alt = imgElement.alt || 'Jarro Zorrito Invierno';
        imagenPrincipal.style.opacity = '1';
        
        // Actualizar estado visual de miniaturas
        actualizarMiniaturaActiva(imgElement);
        
        console.log(`✅ Imagen cambiada exitosamente: ${imgElement.src}`);
        console.groupEnd();
      }, 150);
    };

    nuevaImagen.onerror = function() {
      console.error('❌ Error al cargar la nueva imagen');
      mostrarNotificacion('Error al cargar imagen', 'error');
      imagenPrincipal.style.opacity = '1'; // Restaurar opacidad
      console.groupEnd();
    };

    nuevaImagen.src = imgElement.src;

  } catch (error) {
    console.error('❌ Error en cambiarImagen:', error);
    mostrarNotificacion('Error inesperado al cambiar imagen', 'error');
    console.groupEnd();
  }
}

/**
 * Actualiza el estado visual de las miniaturas
 * @param {HTMLImageElement} imagenActiva - Imagen actualmente seleccionada
 */
function actualizarMiniaturaActiva(imagenActiva) {
  try {
    // Remover clase activa de todas las miniaturas
    const miniaturas = document.querySelectorAll('.miniatura-producto');
    miniaturas.forEach(miniatura => {
      miniatura.classList.remove('activa');
      miniatura.style.border = '2px solid transparent';
    });

    // Agregar clase activa a la imagen seleccionada
    if (imagenActiva) {
      imagenActiva.classList.add('activa');
      imagenActiva.style.border = '2px solid #d4a574';
      imagenActiva.style.borderRadius = '8px';
    }

  } catch (error) {
    console.warn('⚠️ Error al actualizar miniaturas:', error);
  }
}

/**
 * Cambia la cantidad del producto con validaciones robustas
 * @param {number} delta - Incremento o decremento (-1 o +1)
 */
function cambiarCantidadMejorada(delta) {
  try {
    console.group('🔢 CAMBIANDO CANTIDAD');
    
    // Validar parámetros de entrada
    if (typeof delta !== 'number' || isNaN(delta)) {
      console.error('❌ Delta debe ser un número válido');
      mostrarNotificacion('Error en cantidad', 'error');
      console.groupEnd();
      return;
    }

    const inputElement = document.getElementById('cantidad');
    
    // Validar que el elemento existe
    if (!inputElement) {
      console.error('❌ Elemento cantidad no encontrado');
      mostrarNotificacion('Error en la página', 'error');
      console.groupEnd();
      return;
    }

    // Obtener valor actual y validar
    const valorActual = parseInt(inputElement.value, 10);
    
    if (isNaN(valorActual) || valorActual < 0) {
      console.warn('⚠️ Valor actual inválido, reiniciando a 1');
      inputElement.value = CONFIG_PRODUCTO.CANTIDAD_MINIMA;
      actualizarPrecioTotal();
      console.groupEnd();
      return;
    }

    // Calcular nuevo valor
    const nuevoValor = valorActual + delta;

    // Validaciones de límites
    if (nuevoValor < CONFIG_PRODUCTO.CANTIDAD_MINIMA) {
      console.info('ℹ️ Cantidad mínima es 1');
      inputElement.value = CONFIG_PRODUCTO.CANTIDAD_MINIMA;
      mostrarNotificacion('La cantidad mínima es 1', 'info');
      actualizarPrecioTotal();
      console.groupEnd();
      return;
    }

    if (nuevoValor > CONFIG_PRODUCTO.STOCK_MAXIMO) {
      console.warn(`⚠️ Stock insuficiente. Disponible: ${CONFIG_PRODUCTO.STOCK_MAXIMO}`);
      inputElement.value = CONFIG_PRODUCTO.STOCK_MAXIMO;
      mostrarNotificacion(`Stock máximo disponible: ${CONFIG_PRODUCTO.STOCK_MAXIMO}`, 'warning');
      actualizarPrecioTotal();
      console.groupEnd();
      return;
    }

    if (nuevoValor > CONFIG_PRODUCTO.CANTIDAD_MAXIMA_POR_PEDIDO) {
      console.warn(`⚠️ Cantidad máxima por pedido: ${CONFIG_PRODUCTO.CANTIDAD_MAXIMA_POR_PEDIDO}`);
      inputElement.value = CONFIG_PRODUCTO.CANTIDAD_MAXIMA_POR_PEDIDO;
      mostrarNotificacion(`Cantidad máxima por pedido: ${CONFIG_PRODUCTO.CANTIDAD_MAXIMA_POR_PEDIDO}`, 'warning');
      actualizarPrecioTotal();
      console.groupEnd();
      return;
    }

    // Actualizar valor si todas las validaciones pasan
    inputElement.value = nuevoValor;
    
    console.log(`✅ Cantidad actualizada: ${valorActual} → ${nuevoValor}`);
    
    // Actualizar precio total
    actualizarPrecioTotal();
    
    console.groupEnd();

  } catch (error) {
    console.error('❌ Error en cambiarCantidad:', error);
    mostrarNotificacion('Error inesperado al cambiar cantidad', 'error');
    
    // Restaurar valor seguro
    const inputElement = document.getElementById('cantidad');
    if (inputElement) {
      inputElement.value = CONFIG_PRODUCTO.CANTIDAD_MINIMA;
      actualizarPrecioTotal();
    }
    console.groupEnd();
  }
}

/**
 * Actualiza el precio total basado en la cantidad seleccionada
 */
function actualizarPrecioTotal() {
  try {
    const cantidadInput = document.getElementById('cantidad');
    const precioTotalElement = document.getElementById('precio-total');
    
    if (!cantidadInput) return;
    
    const cantidad = parseInt(cantidadInput.value, 10) || 1;
    const precioTotal = CONFIG_PRODUCTO.PRECIO_JARRO * cantidad;
    
    if (precioTotalElement) {
      precioTotalElement.textContent = formatearPrecio(precioTotal);
      console.log(`💰 Precio total actualizado: ${formatearPrecio(precioTotal)}`);
    }
    
    // Actualizar precio en el atributo de datos para acceso posterior
    cantidadInput.setAttribute('data-precio-total', precioTotal);
    
  } catch (error) {
    console.warn('⚠️ Error al actualizar precio total:', error);
  }
}

/**
 * Agrega producto al carrito con validaciones completas
 * @param {Object} productData - Datos del producto (opcional)
 * @returns {boolean} True si se agregó exitosamente
 */
function agregarAlCarritoMejorado(productData = null) {
  const startTime = performance.now();
  
  try {
    console.group('🛒 AGREGANDO PRODUCTO AL CARRITO');
    
    // Obtener datos del producto
    const datosProducto = productData || obtenerDatosProductoActual();
    
    // Validar datos del producto
    const validacionProducto = validarDatosProducto(datosProducto);
    if (!validacionProducto.esValido) {
      console.error('❌ Datos del producto inválidos:', validacionProducto.errores);
      mostrarNotificacion('Error en los datos del producto', 'error');
      console.groupEnd();
      return false;
    }

    // Validar cantidad
    const cantidad = obtenerCantidadSeleccionada();
    const validacionCantidad = validarCantidad(cantidad, datosProducto.stock);
    if (!validacionCantidad.esValido) {
      console.warn('⚠️ Cantidad inválida:', validacionCantidad.mensaje);
      mostrarNotificacion(validacionCantidad.mensaje, 'warning');
      console.groupEnd();
      return false;
    }

    // Obtener carrito actual
    const carrito = obtenerCarritoSeguro();
    if (carrito === null) {
      console.error('❌ No se pudo acceder al carrito');
      mostrarNotificacion('Error al acceder al carrito', 'error');
      console.groupEnd();
      return false;
    }

    // Verificar si el producto ya existe
    const productoExistente = carrito.find(item => item.id === datosProducto.id);
    
    if (productoExistente) {
      const nuevaCantidadTotal = productoExistente.cantidad + cantidad;
      
      // Validar nueva cantidad total
      const validacionTotal = validarCantidad(nuevaCantidadTotal, datosProducto.stock);
      if (!validacionTotal.esValido) {
        mostrarNotificacion(validacionTotal.mensaje, 'warning');
        console.groupEnd();
        return false;
      }
      
      productoExistente.cantidad = nuevaCantidadTotal;
      productoExistente.fechaModificacion = new Date().toISOString();
      productoExistente.subtotal = datosProducto.precio * nuevaCantidadTotal;
      
      console.log(`✅ Cantidad actualizada para "${datosProducto.nombre}": ${productoExistente.cantidad}`);
      
    } else {
      const nuevoProducto = crearObjetoProductoCarrito(datosProducto, cantidad);
      carrito.push(nuevoProducto);
      
      console.log(`✅ Nuevo producto agregado: "${datosProducto.nombre}"`);
    }

    // Guardar carrito
    const guardadoExitoso = guardarCarritoSeguro(carrito);
    if (!guardadoExitoso) {
      console.error('❌ Error al guardar el carrito');
      mostrarNotificacion('Error al guardar en el carrito', 'error');
      console.groupEnd();
      return false;
    }

    // Actualizar UI
    actualizarCarrito();
    
    // Mostrar notificación de éxito con botón de acción
    mostrarNotificacion(
      `"${datosProducto.nombre}" agregado al carrito (${cantidad} unidad${cantidad > 1 ? 'es' : ''})`, 
      'success',
      {
        accion: 'Ver carrito',
        callback: () => window.location.href = 'checkout.html'
      }
    );

    // Añadir efecto visual al botón
    const botonAgregar = document.querySelector('.btn-agregar-carrito');
    if (botonAgregar) {
      botonAgregar.style.transform = 'scale(0.95)';
      setTimeout(() => {
        botonAgregar.style.transform = 'scale(1)';
      }, 150);
    }

    // Log de rendimiento
    const tiempoTranscurrido = (performance.now() - startTime).toFixed(2);
    console.log(`⚡ Operación completada en ${tiempoTranscurrido}ms`);
    
    console.groupEnd();
    return true;

  } catch (error) {
    console.error('❌ Error crítico en agregarAlCarrito:', error);
    mostrarNotificacion('Error inesperado. Intenta nuevamente.', 'error');
    console.groupEnd();
    return false;
  }
}

// ===================================================
// 🔧 FUNCIONES DE UTILIDAD Y VALIDACIÓN
// ===================================================

/**
 * Obtiene datos del producto actual desde el DOM
 * @returns {Object|null} Datos del producto o null si hay error
 */
function obtenerDatosProductoActual() {
  try {
    // Obtener datos desde elementos del DOM con Schema.org
    const nombreElement = document.querySelector('[itemprop="name"], .producto-titulo h1');
    const precioElement = document.querySelector('.producto-precio, [itemprop="price"]');
    const imagenElement = document.querySelector('#imagen-principal, [itemprop="image"]');
    
    if (!nombreElement || !precioElement) {
      throw new Error('Elementos del producto no encontrados en el DOM');
    }

    // Extraer precio (remover formato)
    const precioTexto = precioElement.textContent.replace(/[^\d]/g, '');
    const precio = parseInt(precioTexto, 10);

    if (isNaN(precio) || precio <= 0) {
      throw new Error('Precio inválido');
    }

    return {
      id: generarIdProducto(),
      nombre: nombreElement.textContent.trim(),
      precio: precio,
      imagen: imagenElement ? imagenElement.src : 'pages/jarroportada.webp',
      stock: CONFIG_PRODUCTO.STOCK_MAXIMO,
      sku: CONFIG_PRODUCTO.SKU_JARRO,
      categoria: 'jarros',
      url: window.location.href
    };

  } catch (error) {
    console.error('❌ Error al obtener datos del producto:', error);
    
    // Fallback con datos por defecto
    return {
      id: 'jar-zorrito-inv-001',
      nombre: 'Jarro Zorrito Invierno',
      precio: CONFIG_PRODUCTO.PRECIO_JARRO,
      imagen: 'pages/jarroportada.webp',
      stock: CONFIG_PRODUCTO.STOCK_MAXIMO,
      sku: CONFIG_PRODUCTO.SKU_JARRO,
      categoria: 'jarros',
      url: window.location.href
    };
  }
}

/**
 * Valida los datos de un producto
 * @param {Object} producto - Datos del producto a validar
 * @returns {Object} Resultado de la validación
 */
function validarDatosProducto(producto) {
  const errores = [];

  if (!producto) {
    errores.push('Producto es null o undefined');
    return { esValido: false, errores };
  }

  if (!producto.nombre || typeof producto.nombre !== 'string' || producto.nombre.trim().length < 2) {
    errores.push('Nombre del producto inválido');
  }

  if (!producto.precio || typeof producto.precio !== 'number' || producto.precio <= 0) {
    errores.push('Precio del producto inválido');
  }

  if (typeof producto.stock !== 'number' || producto.stock < 0) {
    errores.push('Stock del producto inválido');
  }

  if (!producto.id) {
    errores.push('ID del producto requerido');
  }

  return {
    esValido: errores.length === 0,
    errores: errores
  };
}

/**
 * Valida la cantidad seleccionada
 * @param {number} cantidad - Cantidad a validar
 * @param {number} stockDisponible - Stock disponible
 * @returns {Object} Resultado de la validación
 */
function validarCantidad(cantidad, stockDisponible = CONFIG_PRODUCTO.STOCK_MAXIMO) {
  if (isNaN(cantidad) || cantidad < CONFIG_PRODUCTO.CANTIDAD_MINIMA) {
    return {
      esValido: false,
      mensaje: `La cantidad debe ser al menos ${CONFIG_PRODUCTO.CANTIDAD_MINIMA}`
    };
  }

  if (cantidad > stockDisponible) {
    return {
      esValido: false,
      mensaje: `Stock insuficiente. Disponible: ${stockDisponible}`
    };
  }

  if (cantidad > CONFIG_PRODUCTO.CANTIDAD_MAXIMA_POR_PEDIDO) {
    return {
      esValido: false,
      mensaje: `Cantidad máxima por pedido: ${CONFIG_PRODUCTO.CANTIDAD_MAXIMA_POR_PEDIDO}`
    };
  }

  return { esValido: true };
}

/**
 * Obtiene cantidad seleccionada de forma segura
 * @returns {number} Cantidad válida (mínimo 1)
 */
function obtenerCantidadSeleccionada() {
  try {
    const input = document.getElementById('cantidad');
    if (!input) {
      console.warn('⚠️ Input de cantidad no encontrado, usando 1 por defecto');
      return CONFIG_PRODUCTO.CANTIDAD_MINIMA;
    }

    const cantidad = parseInt(input.value, 10);
    return isNaN(cantidad) || cantidad < CONFIG_PRODUCTO.CANTIDAD_MINIMA ? CONFIG_PRODUCTO.CANTIDAD_MINIMA : cantidad;
    
  } catch (error) {
    console.error('❌ Error al obtener cantidad:', error);
    return CONFIG_PRODUCTO.CANTIDAD_MINIMA;
  }
}

/**
 * Obtiene el carrito de forma segura con manejo de errores
 * @returns {Array|null} Carrito o null si hay error
 */
function obtenerCarritoSeguro() {
  try {
    // Verificar si localStorage está disponible
    if (typeof Storage === 'undefined') {
      console.error('❌ localStorage no está disponible');
      return null;
    }

    const carritoData = localStorage.getItem('carrito');
    
    if (!carritoData) {
      console.log('ℹ️ Carrito vacío, creando nuevo');
      return [];
    }

    const carrito = JSON.parse(carritoData);
    
    // Validar que es un array
    if (!Array.isArray(carrito)) {
      console.warn('⚠️ Datos del carrito corruptos, reiniciando');
      localStorage.removeItem('carrito');
      return [];
    }

    return carrito;

  } catch (error) {
    console.error('❌ Error al obtener carrito:', error);
    
    // Limpiar datos corruptos
    try {
      localStorage.removeItem('carrito');
    } catch (cleanupError) {
      console.error('❌ Error al limpiar carrito corrupto:', cleanupError);
    }
    
    return [];
  }
}

/**
 * Guarda el carrito de forma segura
 * @param {Array} carrito - Array del carrito a guardar
 * @returns {boolean} True si se guardó exitosamente
 */
function guardarCarritoSeguro(carrito) {
  try {
    if (!Array.isArray(carrito)) {
      throw new Error('El carrito debe ser un array');
    }

    const carritoJson = JSON.stringify(carrito);
    
    // Verificar tamaño para evitar QuotaExceededError
    const tamañoMB = new Blob([carritoJson]).size / 1024 / 1024;
    if (tamañoMB > 5) {
      console.warn('⚠️ Carrito muy grande, limpiando items antiguos');
      // Mantener solo los 20 items más recientes
      carrito.sort((a, b) => new Date(b.fechaAgregado) - new Date(a.fechaAgregado));
      carrito.splice(20);
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    console.log('✅ Carrito guardado exitosamente');
    return true;

  } catch (error) {
    console.error('❌ Error al guardar carrito:', error);
    
    // Intentar manejar errores comunes
    if (error.name === 'QuotaExceededError') {
      mostrarNotificacion('Almacenamiento lleno. Limpia el navegador.', 'warning');
    }
    
    return false;
  }
}

/**
 * Crea objeto del producto para el carrito
 * @param {Object} datosProducto - Datos base del producto
 * @param {number} cantidad - Cantidad seleccionada
 * @returns {Object} Objeto formateado para el carrito
 */
function crearObjetoProductoCarrito(datosProducto, cantidad) {
  return {
    id: datosProducto.id,
    nombre: datosProducto.nombre,
    precio: datosProducto.precio,
    imagen: datosProducto.imagen,
    cantidad: cantidad,
    sku: datosProducto.sku,
    categoria: datosProducto.categoria,
    url: datosProducto.url,
    fechaAgregado: new Date().toISOString(),
    subtotal: datosProducto.precio * cantidad
  };
}

/**
 * Genera ID único para el producto basado en la página actual
 * @returns {string} ID del producto
 */
function generarIdProducto() {
  const path = window.location.pathname.toLowerCase();
  
  if (path.includes('jarro')) return 'jar-zorrito-inv-001';
  if (path.includes('cuaderno')) return 'cua-patagonia-001';
  if (path.includes('yerbera')) return 'yer-madera-001';
  
  // Fallback con hash del nombre de página
  return 'prod-' + path.split('/').pop().replace('.html', '') + '-001';
}

/**
 * Formatea precio a formato chileno
 * @param {number} precio - Precio a formatear
 * @returns {string} Precio formateado
 */
function formatearPrecio(precio) {
  try {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(precio);
  } catch (error) {
    // Fallback manual
    return '$' + precio.toLocaleString('es-CL');
  }
}

// ===================================================
// 🎨 SISTEMA DE NOTIFICACIONES MEJORADO
// ===================================================

/**
 * Sistema de notificaciones mejorado con animaciones y acciones
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo: 'success', 'error', 'warning', 'info'
 * @param {Object} opciones - Opciones adicionales
 */
function mostrarNotificacion(mensaje, tipo = 'info', opciones = {}) {
  try {
    const { duracion = CONFIG_PRODUCTO.TIMEOUT_NOTIFICACION, accion = null, callback = null } = opciones;
    
    // Remover notificaciones anteriores del mismo tipo
    const notificacionesAnteriores = document.querySelectorAll(`.notificacion-${tipo}`);
    notificacionesAnteriores.forEach(n => n.remove());

    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    
    const iconos = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };

    const colores = {
      success: '#198754',
      error: '#dc3545',
      warning: '#fd7e14',
      info: '#0dcaf0'
    };

    notificacion.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colores[tipo]};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: 9999;
        max-width: 380px;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        font-weight: 500;
        animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <i class="bi ${iconos[tipo]}" style="font-size: 20px; flex-shrink: 0;"></i>
          <div style="flex: 1;">
            <div style="line-height: 1.4;">${mensaje}</div>
            ${accion ? `
              <button onclick="this.onclick = null; ${callback ? `(${callback.toString()})()` : ''}" 
                      style="
                        background: rgba(255,255,255,0.2); 
                        border: 1px solid rgba(255,255,255,0.3);
                        color: white; 
                        padding: 6px 14px; 
                        border-radius: 8px; 
                        font-size: 12px; 
                        font-weight: 600;
                        margin-top: 10px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                      "
                      onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='translateY(-1px)'"
                      onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(0)'">
                ${accion}
              </button>
            ` : ''}
          </div>
          <button onclick="this.closest('.notificacion').style.animation='slideOutRight 0.3s ease-in'; setTimeout(() => this.closest('.notificacion').remove(), 300)" 
                  style="
                    background: none; 
                    border: none; 
                    color: rgba(255,255,255,0.8); 
                    cursor: pointer; 
                    font-size: 20px; 
                    padding: 0; 
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s;
                    flex-shrink: 0;
                  "
                  onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.color='white'"
                  onmouseout="this.style.background='none'; this.style.color='rgba(255,255,255,0.8)'">
            ×
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(notificacion);

    // Auto-remover después del tiempo especificado
    setTimeout(() => {
      if (document.body.contains(notificacion)) {
        notificacion.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
          if (document.body.contains(notificacion)) {
            notificacion.remove();
          }
        }, 300);
      }
    }, duracion);

    // Log de la notificación
    console.log(`📢 Notificación ${tipo}: ${mensaje}`);

  } catch (error) {
    console.error('❌ Error al mostrar notificación:', error);
    // Fallback a alert si todo falla
    alert(`${tipo.toUpperCase()}: ${mensaje}`);
  }
}

// Inyectar CSS para animaciones si no existe
function inyectarCSS() {
  if (!document.querySelector('#notificaciones-css')) {
    const style = document.createElement('style');
    style.id = 'notificaciones-css';
    style.textContent = `
      @keyframes slideInRight {
        from { 
          transform: translateX(100%); 
          opacity: 0; 
        }
        to { 
          transform: translateX(0); 
          opacity: 1; 
        }
      }
      
      @keyframes slideOutRight {
        from { 
          transform: translateX(0); 
          opacity: 1; 
        }
        to { 
          transform: translateX(100%); 
          opacity: 0; 
        }
      }

      .miniatura-producto {
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .miniatura-producto:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }

      .btn-cantidad {
        transition: all 0.2s ease;
      }

      .btn-cantidad:hover {
        transform: scale(1.1);
      }

      .btn-agregar-carrito {
        transition: all 0.3s ease;
      }

      .btn-agregar-carrito:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      }
    `;
    document.head.appendChild(style);
  }
}

// ===================================================
// 🚀 INICIALIZACIÓN Y EVENTOS
// ===================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🎯 Inicializando página de producto...');
  
  // Inyectar CSS de mejoras
  inyectarCSS();
  
  // Configurar event listeners mejorados
  configurarEventListeners();
  
  // Actualizar precio total inicial
  actualizarPrecioTotal();
  
  // Configurar primera miniatura como activa
  const primeraMiniatura = document.querySelector('.miniatura-producto');
  if (primeraMiniatura) {
    actualizarMiniaturaActiva(primeraMiniatura);
  }
  
  console.log('✅ Página de producto inicializada correctamente');
});

/**
 * Configura todos los event listeners de la página
 */
function configurarEventListeners() {
  try {
    // Event listeners para miniaturas
    const miniaturas = document.querySelectorAll('.miniatura-producto');
    miniaturas.forEach(miniatura => {
      miniatura.addEventListener('click', function() {
        cambiarImagenMejorada(this);
      });
      
      miniatura.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          cambiarImagenMejorada(this);
        }
      });
    });

    // Event listeners para botones de cantidad
    const btnMenos = document.querySelector('.btn-menos');
    const btnMas = document.querySelector('.btn-mas');
    
    if (btnMenos) {
      btnMenos.addEventListener('click', function(e) {
        e.preventDefault();
        cambiarCantidadMejorada(-1);
      });
    }
    
    if (btnMas) {
      btnMas.addEventListener('click', function(e) {
        e.preventDefault();
        cambiarCantidadMejorada(1);
      });
    }

    // Event listener para input de cantidad
    const inputCantidad = document.getElementById('cantidad');
    if (inputCantidad) {
      inputCantidad.addEventListener('change', function() {
        const valor = parseInt(this.value, 10);
        
        if (isNaN(valor) || valor < CONFIG_PRODUCTO.CANTIDAD_MINIMA) {
          this.value = CONFIG_PRODUCTO.CANTIDAD_MINIMA;
        } else if (valor > CONFIG_PRODUCTO.STOCK_MAXIMO) {
          this.value = CONFIG_PRODUCTO.STOCK_MAXIMO;
          mostrarNotificacion(`Stock máximo: ${CONFIG_PRODUCTO.STOCK_MAXIMO}`, 'warning');
        } else if (valor > CONFIG_PRODUCTO.CANTIDAD_MAXIMA_POR_PEDIDO) {
          this.value = CONFIG_PRODUCTO.CANTIDAD_MAXIMA_POR_PEDIDO;
          mostrarNotificacion(`Cantidad máxima por pedido: ${CONFIG_PRODUCTO.CANTIDAD_MAXIMA_POR_PEDIDO}`, 'warning');
        }
        
        actualizarPrecioTotal();
      });
    }

    // Event listener para botón agregar al carrito
    const btnAgregar = document.querySelector('.btn-agregar-carrito');
    if (btnAgregar) {
      btnAgregar.addEventListener('click', function(e) {
        e.preventDefault();
        agregarAlCarritoMejorado();
      });
    }

    console.log('✅ Event listeners configurados');
    
  } catch (error) {
    console.error('❌ Error al configurar event listeners:', error);
  }
}

// ===================================================
// 🔄 FUNCIONES DE COMPATIBILIDAD (RETROCOMPATIBILIDAD)
// ===================================================

// Mantener funciones originales para compatibilidad
function cambiarImagen(img) {
  cambiarImagenMejorada(img);
}

function cambiarCantidad(delta) {
  cambiarCantidadMejorada(delta);
}

function agregarAlCarrito() {
  return agregarAlCarritoMejorado();
}

// ===================================================
// 🔚 EXPORTAR FUNCIONES PARA TESTING
// ===================================================

// Exponer funciones para testing en desarrollo
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.search.includes('debug=true'))) {
  window.ProductoPage = {
    cambiarImagenMejorada,
    cambiarCantidadMejorada,
    agregarAlCarritoMejorado,
    obtenerDatosProductoActual,
    validarDatosProducto,
    validarCantidad,
    obtenerCarritoSeguro,
    guardarCarritoSeguro,
    mostrarNotificacion,
    CONFIG_PRODUCTO
  };
  
  console.log('🔧 Funciones de desarrollo expuestas en window.ProductoPage');
}