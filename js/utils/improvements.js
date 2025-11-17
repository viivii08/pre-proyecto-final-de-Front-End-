/**
 * 🔧 MEJORAS Y OPTIMIZACIONES
 * Funciones mejoradas para evitar repetición y mejorar legibilidad
 */

/**
 * Clase para manejar operaciones de productos de forma consistente
 */
class ProductOperations {
  /**
   * Valida y sanitiza un producto
   */
  static sanitizeProduct(product) {
    if (!product || typeof product !== 'object') {
      return null;
    }

    return {
      id: Validators.sanitizeInteger(product.id, 0),
      nombre: Validators.sanitizeString(product.nombre || product.name || ''),
      precio: Validators.sanitizeNumber(product.precio || product.price || 0),
      precioOriginal: Validators.sanitizeNumber(product.precioOriginal || product.originalPrice || null),
      descuento: Validators.sanitizeNumber(product.descuento || product.discount || 0),
      stock: Validators.sanitizeInteger(product.stock || 0),
      disponible: product.disponible !== false && product.available !== false,
      descripcionCorta: Validators.sanitizeString(product.descripcionCorta || product.shortDescription || ''),
      imagenes: Array.isArray(product.imagenes) ? product.imagenes : 
                Array.isArray(product.images) ? product.images : 
                product.imagen ? [product.imagen] : 
                product.image ? [product.image] : [],
      categoria: Validators.sanitizeString(product.categoria || product.category || ''),
      sku: Validators.sanitizeString(product.sku || `SKU-${product.id || 'UNKNOWN'}`),
      tags: Array.isArray(product.tags) ? product.tags.map(t => Validators.sanitizeString(t)) : []
    };
  }

  /**
   * Crea un item de carrito desde un producto
   */
  static createCartItem(product, quantity = 1) {
    const sanitizedProduct = this.sanitizeProduct(product);
    if (!sanitizedProduct || !Validators.isValidProduct(sanitizedProduct)) {
      return null;
    }

    return {
      id: sanitizedProduct.id,
      nombre: sanitizedProduct.nombre,
      precio: sanitizedProduct.precio,
      imagen: sanitizedProduct.imagenes[0] || 'pages/no-image.png',
      cantidad: Validators.sanitizeInteger(quantity, 1),
      sku: sanitizedProduct.sku
    };
  }

  /**
   * Calcula el subtotal de un item de carrito
   */
  static calculateItemSubtotal(item) {
    if (!item || typeof item !== 'object') {
      return 0;
    }

    const precio = Validators.sanitizeNumber(item.precio || item.price || 0);
    const cantidad = Validators.sanitizeInteger(item.cantidad || item.quantity || 1);

    if (!Validators.isValidNumber(precio) || !Validators.isValidNumber(cantidad)) {
      return 0;
    }

    return precio * cantidad;
  }

  /**
   * Verifica si un producto está disponible
   */
  static isProductAvailable(product) {
    if (!product) return false;
    
    const sanitized = this.sanitizeProduct(product);
    if (!sanitized) return false;

    return sanitized.disponible && 
           sanitized.stock > 0 && 
           Validators.isPositiveNumber(sanitized.precio);
  }

  /**
   * Verifica si hay stock suficiente
   */
  static hasEnoughStock(product, requestedQuantity) {
    if (!product) return false;
    
    const sanitized = this.sanitizeProduct(product);
    if (!sanitized) return false;

    const quantity = Validators.sanitizeInteger(requestedQuantity, 0);
    return sanitized.stock >= quantity;
  }
}

/**
 * Clase para manejar operaciones de carrito de forma consistente
 */
class CartOperations {
  /**
   * Calcula el total del carrito de forma segura
   */
  static calculateTotal(cart) {
    if (!Array.isArray(cart) || cart.length === 0) {
      return 0;
    }

    return cart.reduce((total, item) => {
      const subtotal = ProductOperations.calculateItemSubtotal(item);
      return total + subtotal;
    }, 0);
  }

  /**
   * Encuentra un item en el carrito
   */
  static findItem(cart, productId) {
    if (!Array.isArray(cart) || !Validators.isValidId(productId)) {
      return null;
    }

    return cart.find(item => item.id === productId) || null;
  }

  /**
   * Agrega o actualiza un item en el carrito
   */
  static addOrUpdateItem(cart, product, quantity = 1) {
    if (!Array.isArray(cart)) {
      return { success: false, error: 'Carrito no es un array' };
    }

    const cartItem = ProductOperations.createCartItem(product, quantity);
    if (!cartItem) {
      return { success: false, error: 'Producto inválido' };
    }

    // Verificar disponibilidad
    if (!ProductOperations.isProductAvailable(product)) {
      return { success: false, error: 'Producto no disponible' };
    }

    // Verificar stock
    if (!ProductOperations.hasEnoughStock(product, quantity)) {
      return { 
        success: false, 
        error: 'Stock insuficiente',
        availableStock: product.stock || 0
      };
    }

    // Buscar item existente
    const existingItem = this.findItem(cart, cartItem.id);

    if (existingItem) {
      // Actualizar cantidad
      const newQuantity = existingItem.cantidad + quantity;
      
      if (!ProductOperations.hasEnoughStock(product, newQuantity)) {
        return { 
          success: false, 
          error: 'Stock insuficiente',
          availableStock: product.stock || 0,
          currentQuantity: existingItem.cantidad
        };
      }

      existingItem.cantidad = newQuantity;
      return { success: true, item: existingItem, action: 'updated' };
    } else {
      // Agregar nuevo item
      cart.push(cartItem);
      return { success: true, item: cartItem, action: 'added' };
    }
  }

  /**
   * Elimina un item del carrito
   */
  static removeItem(cart, productId) {
    if (!Array.isArray(cart) || !Validators.isValidId(productId)) {
      return { success: false, error: 'Parámetros inválidos' };
    }

    const index = cart.findIndex(item => item.id === productId);
    if (index === -1) {
      return { success: false, error: 'Item no encontrado' };
    }

    const removedItem = cart.splice(index, 1)[0];
    return { success: true, item: removedItem };
  }

  /**
   * Actualiza la cantidad de un item
   */
  static updateQuantity(cart, productId, newQuantity, product = null) {
    if (!Array.isArray(cart) || !Validators.isValidId(productId)) {
      return { success: false, error: 'Parámetros inválidos' };
    }

    const quantity = Validators.sanitizeInteger(newQuantity, 0);
    
    // Si la cantidad es 0 o menor, eliminar el item
    if (quantity <= 0) {
      return this.removeItem(cart, productId);
    }

    const item = this.findItem(cart, productId);
    if (!item) {
      return { success: false, error: 'Item no encontrado' };
    }

    // Si tenemos información del producto, validar stock
    if (product) {
      if (!ProductOperations.hasEnoughStock(product, quantity)) {
        // Ajustar a stock máximo disponible
        const maxStock = product.stock || 0;
        if (maxStock > 0) {
          item.cantidad = maxStock;
          return { 
            success: true, 
            item, 
            adjusted: true, 
            message: `Cantidad ajustada a ${maxStock} (stock disponible)` 
          };
        } else {
          return { success: false, error: 'Producto sin stock' };
        }
      }
    }

    item.cantidad = quantity;
    return { success: true, item };
  }

  /**
   * Limpia el carrito
   */
  static clearCart(cart) {
    if (!Array.isArray(cart)) {
      return { success: false, error: 'Carrito no es un array' };
    }

    const itemCount = cart.length;
    cart.length = 0;
    return { success: true, itemCount };
  }

  /**
   * Valida el carrito completo
   */
  static validateCart(cart, products = []) {
    if (!Array.isArray(cart)) {
      return { valid: false, errors: ['Carrito no es un array'] };
    }

    const errors = [];
    const validItems = [];

    for (const item of cart) {
      // Validar item básico
      if (!Validators.isValidCartItem(item)) {
        errors.push(`Item inválido: ${item.id || 'sin ID'}`);
        continue;
      }

      // Si tenemos información de productos, validar disponibilidad y stock
      if (products.length > 0) {
        const product = products.find(p => p.id === item.id);
        
        if (!product) {
          errors.push(`Producto no encontrado: ${item.id}`);
          continue;
        }

        if (!ProductOperations.isProductAvailable(product)) {
          errors.push(`Producto no disponible: ${item.nombre}`);
          continue;
        }

        if (!ProductOperations.hasEnoughStock(product, item.cantidad)) {
          errors.push(`Stock insuficiente para: ${item.nombre} (solicitado: ${item.cantidad}, disponible: ${product.stock})`);
          continue;
        }
      }

      validItems.push(item);
    }

    return {
      valid: errors.length === 0,
      errors,
      validItems,
      invalidItemsCount: cart.length - validItems.length
    };
  }
}

/**
 * Clase para manejar búsquedas de forma consistente
 */
class SearchOperations {
  /**
   * Busca productos de forma optimizada
   */
  static searchProducts(products, searchTerm, options = {}) {
    if (!Array.isArray(products) || !searchTerm || typeof searchTerm !== 'string') {
      return [];
    }

    const {
      minLength = 2,
      caseSensitive = false,
      searchInName = true,
      searchInDescription = true,
      searchInCategory = true,
      searchInTags = true,
      searchInSku = false
    } = options;

    const term = caseSensitive ? searchTerm.trim() : searchTerm.toLowerCase().trim();

    if (term.length < minLength) {
      return [];
    }

    return products.filter(product => {
      // Buscar en nombre
      if (searchInName && product.nombre) {
        const nombre = caseSensitive ? product.nombre : product.nombre.toLowerCase();
        if (nombre.includes(term)) return true;
      }

      // Buscar en descripción
      if (searchInDescription && product.descripcionCorta) {
        const desc = caseSensitive ? product.descripcionCorta : product.descripcionCorta.toLowerCase();
        if (desc.includes(term)) return true;
      }

      // Buscar en categoría
      if (searchInCategory && product.categoria) {
        const cat = caseSensitive ? product.categoria : product.categoria.toLowerCase();
        if (cat.includes(term)) return true;
      }

      // Buscar en tags
      if (searchInTags && Array.isArray(product.tags)) {
        if (product.tags.some(tag => {
          const tagLower = caseSensitive ? tag : tag.toLowerCase();
          return tagLower.includes(term);
        })) {
          return true;
        }
      }

      // Buscar en SKU
      if (searchInSku && product.sku) {
        const sku = caseSensitive ? product.sku : product.sku.toLowerCase();
        if (sku.includes(term)) return true;
      }

      return false;
    });
  }

  /**
   * Filtra productos por categoría
   */
  static filterByCategory(products, category) {
    if (!Array.isArray(products)) {
      return [];
    }

    if (!category || category === 'todos' || category === 'all') {
      return [...products]; // Retornar copia
    }

    return products.filter(product => product.categoria === category);
  }

  /**
   * Filtra productos por rango de precio
   */
  static filterByPriceRange(products, minPrice, maxPrice) {
    if (!Array.isArray(products)) {
      return [];
    }

    const min = Validators.sanitizeNumber(minPrice, 0);
    const max = Validators.sanitizeNumber(maxPrice, Infinity);

    return products.filter(product => {
      const precio = Validators.sanitizeNumber(product.precio, 0);
      return precio >= min && precio <= max;
    });
  }

  /**
   * Ordena productos
   */
  static sortProducts(products, sortBy, direction = 'asc') {
    if (!Array.isArray(products)) {
      return [];
    }

    const sorted = [...products]; // Crear copia

    sorted.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'nombre':
        case 'name':
          aVal = (a.nombre || a.name || '').toLowerCase();
          bVal = (b.nombre || b.name || '').toLowerCase();
          break;
        case 'precio':
        case 'price':
          aVal = Validators.sanitizeNumber(a.precio || a.price, 0);
          bVal = Validators.sanitizeNumber(b.precio || b.price, 0);
          break;
        case 'descuento':
        case 'discount':
          aVal = Validators.sanitizeNumber(a.descuento || a.discount, 0);
          bVal = Validators.sanitizeNumber(b.descuento || b.discount, 0);
          break;
        case 'stock':
          aVal = Validators.sanitizeInteger(a.stock, 0);
          bVal = Validators.sanitizeInteger(b.stock, 0);
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }
}

// Exportar clases
window.ProductOperations = ProductOperations;
window.CartOperations = CartOperations;
window.SearchOperations = SearchOperations;

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ProductOperations,
    CartOperations,
    SearchOperations
  };
}

