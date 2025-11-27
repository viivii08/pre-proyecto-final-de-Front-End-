class ProductComparator {
  constructor() {
    this.selectedProducts = [];
    this.maxProducts = 3;
    this.init();
  }

  init() {
    this.createComparisonModal();
    
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-compare')) {
        const productId = parseInt(e.target.dataset.productId);
        this.toggleProduct(productId);
      }
    });
  }

  toggleProduct(productId) {
    const index = this.selectedProducts.indexOf(productId);
    
    if (index === -1) {
      if (this.selectedProducts.length >= this.maxProducts) {
        this.showNotification(`📊 Máximo ${this.maxProducts} productos para comparar`, 'warning');
        return;
      }
      
      this.selectedProducts.push(productId);
      this.showNotification('📊 Producto agregado a comparación', 'success');
    } else {
      this.selectedProducts.splice(index, 1);
      this.showNotification('📊 Producto removido de comparación', 'info');
    }
    
    this.updateCompareButtons();
    this.updateCompareCounter();
  }

  // Actualizar botones de comparar
  updateCompareButtons() {
    const compareButtons = document.querySelectorAll('.btn-compare');
    
    compareButtons.forEach(button => {
      const productId = parseInt(button.dataset.productId);
      const isSelected = this.selectedProducts.includes(productId);
      
      if (isSelected) {
        button.innerHTML = '<i class="bi bi-check-circle me-1"></i>En comparación';
        button.classList.remove('btn-outline-info');
        button.classList.add('btn-info');
      } else {
        button.innerHTML = '<i class="bi bi-graph-up me-1"></i>Comparar';
        button.classList.remove('btn-info');
        button.classList.add('btn-outline-info');
      }
      
      // Deshabilitar si ya hay 3 productos y este no está seleccionado
      if (this.selectedProducts.length >= this.maxProducts && !isSelected) {
        button.disabled = true;
        button.title = `Máximo ${this.maxProducts} productos para comparar`;
      } else {
        button.disabled = false;
        button.title = isSelected ? 'Remover de comparación' : 'Agregar a comparación';
      }
    });
  }

  // Actualizar contador en navbar
  updateCompareCounter() {
    let counter = document.querySelector('.compare-counter');
    
    if (!counter && this.selectedProducts.length > 0) {
      // Crear contador si no existe
      const navActions = document.querySelector('#navbarActions');
      if (navActions) {
        const compareButton = document.createElement('button');
        compareButton.className = 'btn btn-outline-light position-relative me-2';
        compareButton.title = 'Ver comparación';
        compareButton.innerHTML = `
          <i class="bi bi-graph-up" style="font-size:0.85rem;"></i>
          <span class="compare-counter position-absolute top-0 start-100 translate-middle badge rounded-pill" 
                style="font-size: 0.65rem; font-weight: bold; background: #17a2b8; color: white; 
                       border: 2px solid white; min-width: 20px; height: 20px; line-height: 16px; 
                       text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            ${this.selectedProducts.length}
          </span>
        `;
        compareButton.onclick = () => this.showComparison();
        navActions.appendChild(compareButton);
        counter = compareButton.querySelector('.compare-counter');
      }
    }
    
    if (counter) {
      if (this.selectedProducts.length > 0) {
        counter.textContent = this.selectedProducts.length;
        counter.style.display = 'inline';
        counter.parentElement.style.display = 'inline-block';
      } else {
        counter.parentElement.remove();
      }
    }
  }

  // Mostrar comparación en modal
  showComparison() {
    if (this.selectedProducts.length < 2) {
      this.showNotification('📊 Necesitas al menos 2 productos para comparar', 'warning');
      return;
    }

    // Obtener productos del store
    if (typeof store === 'undefined') {
      this.showNotification('❌ Error cargando productos', 'error');
      return;
    }

    const products = this.selectedProducts.map(id => 
      store.productos.find(p => p.id === id)
    ).filter(p => p);

    if (products.length === 0) {
      this.showNotification('❌ No se encontraron productos', 'error');
      return;
    }

    // Renderizar comparación
    this.renderComparison(products);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('comparisonModal'));
    modal.show();
  }

  // Renderizar tabla de comparación
  renderComparison(products) {
    const modalBody = document.querySelector('#comparisonModal .modal-body');
    
    const html = `
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th style="width: 150px;">Característica</th>
              ${products.map(p => `
                <th class="text-center">
                  <img src="${p.imagenes[0]}" alt="${p.nombre}" 
                       style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" 
                       class="mb-2">
                  <div style="font-size: 0.9rem; font-weight: 600;">${p.nombre}</div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <!-- Precio -->
            <tr>
              <td><strong>💰 Precio</strong></td>
              ${products.map(p => `
                <td class="text-center">
                  <span class="h5 text-success">$${p.precio.toLocaleString()}</span>
                  ${p.precioOriginal && p.precioOriginal > p.precio ? 
                    `<br><small class="text-muted"><s>$${p.precioOriginal.toLocaleString()}</s></small>` : ''}
                </td>
              `).join('')}
            </tr>
            
            <!-- Descuento -->
            <tr>
              <td><strong>🏷️ Descuento</strong></td>
              ${products.map(p => `
                <td class="text-center">
                  ${p.descuento ? 
                    `<span class="badge bg-danger">${p.descuento}% OFF</span>` : 
                    '<span class="text-muted">Sin descuento</span>'}
                </td>
              `).join('')}
            </tr>
            
            <!-- Stock -->
            <tr>
              <td><strong>📦 Stock</strong></td>
              ${products.map(p => `
                <td class="text-center">
                  <span class="badge ${p.stock > 10 ? 'bg-success' : p.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                    ${p.stock} unidades
                  </span>
                </td>
              `).join('')}
            </tr>
            
            <!-- Calificación -->
            <tr>
              <td><strong>⭐ Calificación</strong></td>
              ${products.map(p => {
                const rating = store.calcularRatingPromedio ? store.calcularRatingPromedio(p.id) : 4.0;
                const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
                return `
                  <td class="text-center">
                    <div style="color: #ffc107; font-size: 1.2rem;">${stars}</div>
                    <small>${rating.toFixed(1)}/5</small>
                  </td>
                `;
              }).join('')}
            </tr>
            
            <!-- Categoría -->
            <tr>
              <td><strong>🏷️ Categoría</strong></td>
              ${products.map(p => `
                <td class="text-center">
                  <span class="badge bg-info">${p.categoria}</span>
                </td>
              `).join('')}
            </tr>
            
            <!-- Descripción -->
            <tr>
              <td><strong>📝 Descripción</strong></td>
              ${products.map(p => `
                <td class="text-center">
                  <small class="text-muted">${p.descripcionCorta}</small>
                </td>
              `).join('')}
            </tr>
            
            <!-- SKU -->
            <tr>
              <td><strong>🔖 SKU</strong></td>
              ${products.map(p => `
                <td class="text-center">
                  <code>${p.sku || 'N/A'}</code>
                </td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Acciones -->
      <div class="row mt-4">
        ${products.map(p => `
          <div class="col-md-${12/products.length} text-center">
            <button class="btn btn-success w-100 mb-2" onclick="store.agregarAlCarrito(${p.id})">
              <i class="bi bi-cart-plus me-1"></i>Agregar al carrito
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="productComparator.removeFromComparison(${p.id})">
              <i class="bi bi-x-circle me-1"></i>Quitar de comparación
            </button>
          </div>
        `).join('')}
      </div>
    `;

    modalBody.innerHTML = html;
  }

  // Remover producto de comparación
  removeFromComparison(productId) {
    this.toggleProduct(productId);
    
    // Si quedan menos de 2 productos, cerrar modal
    if (this.selectedProducts.length < 2) {
      const modal = bootstrap.Modal.getInstance(document.getElementById('comparisonModal'));
      if (modal) modal.hide();
    } else {
      // Re-renderizar comparación
      this.showComparison();
    }
  }

  // Limpiar toda la comparación
  clearComparison() {
    this.selectedProducts = [];
    this.updateCompareButtons();
    this.updateCompareCounter();
    this.showNotification('🗑️ Comparación limpiada', 'info');
  }

  // Crear modal de comparación
  createComparisonModal() {
    if (document.getElementById('comparisonModal')) return;

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'comparisonModal';
    modal.tabIndex = -1;
    modal.innerHTML = `
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-graph-up me-2"></i>Comparación de Productos
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <!-- El contenido se genera dinámicamente -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-danger" onclick="productComparator.clearComparison()">
              <i class="bi bi-trash me-1"></i>Limpiar comparación
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  // Mostrar notificación
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `compare-notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => this.removeNotification(notification), 3000);

    notification.querySelector('.notification-close').onclick = () => {
      this.removeNotification(notification);
    };
  }

  removeNotification(notification) {
    notification.classList.add('hide');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
}

const productComparator = new ProductComparator();