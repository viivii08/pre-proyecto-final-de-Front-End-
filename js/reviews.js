// Sistema de Reviews para Patagonia Style E-commerce
// Completamente independiente - no afecta código existente

class ReviewsManager {
  constructor() {
    this.reviews = this.loadReviews();
    this.init();
  }

  // Cargar reviews desde localStorage
  loadReviews() {
    const saved = localStorage.getItem('patagonia_reviews');
    return saved ? JSON.parse(saved) : {
      'jarro-zorrito': [
        {
          id: 1,
          user: 'María González',
          rating: 5,
          comment: '¡Hermoso jarro! La calidad es excelente y llegó perfectamente embalado.',
          date: '2025-10-15',
          verified: true
        },
        {
          id: 2,
          user: 'Carlos Rodriguez',
          rating: 4,
          comment: 'Muy buen producto, aunque tardó un poco en llegar.',
          date: '2025-10-10',
          verified: true
        }
      ],
      'cuaderno-artesanal': [
        {
          id: 1,
          user: 'Ana Martínez',
          rating: 5,
          comment: 'El cuaderno es precioso, perfecto para mis notas de trabajo.',
          date: '2025-10-12',
          verified: true
        }
      ],
      'yerbera-artesanal': [
        {
          id: 1,
          user: 'Jorge López',
          rating: 5,
          comment: 'Calidad excepcional, se nota el trabajo artesanal.',
          date: '2025-10-08',
          verified: true
        }
      ]
    };
  }

  // Guardar reviews en localStorage
  saveReviews() {
    localStorage.setItem('patagonia_reviews', JSON.stringify(this.reviews));
  }

  // Obtener reviews de un producto
  getProductReviews(productId) {
    return this.reviews[productId] || [];
  }

  // Agregar nueva review
  addReview(productId, review) {
    if (!this.reviews[productId]) {
      this.reviews[productId] = [];
    }
    
    review.id = Date.now();
    review.date = new Date().toISOString().split('T')[0];
    review.verified = false; // Solo verificado después de compra
    
    this.reviews[productId].unshift(review);
    this.saveReviews();
    this.renderReviews(productId);
    this.showNotification('¡Gracias por tu opinión!', 'success');
  }

  // Calcular promedio de estrellas
  getAverageRating(productId) {
    const reviews = this.getProductReviews(productId);
    if (reviews.length === 0) return 0;
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }

  // Renderizar estrellas
  renderStars(rating, isClickable = false, size = 'normal') {
    const sizeClass = size === 'small' ? 'star-small' : 'star-normal';
    let starsHtml = '';
    
    for (let i = 1; i <= 5; i++) {
      const filled = i <= rating;
      const clickHandler = isClickable ? `onclick="reviewsManager.setRating(${i})"` : '';
      starsHtml += `
        <i class="bi bi-star${filled ? '-fill' : ''} review-star ${sizeClass} ${isClickable ? 'clickable' : ''}" 
           ${clickHandler}
           data-rating="${i}"></i>
      `;
    }
    
    return starsHtml;
  }

  // Renderizar sección de reviews
  renderReviewsSection(productId) {
    const reviews = this.getProductReviews(productId);
    const avgRating = this.getAverageRating(productId);
    
    return `
      <div class="reviews-section mt-5" id="reviews-section">
        <div class="reviews-header mb-4">
          <h3 class="reviews-title">
            <i class="bi bi-star-fill text-warning me-2"></i>
            Opiniones de Clientes
          </h3>
          
          <div class="reviews-summary d-flex align-items-center mb-3">
            <div class="average-rating me-3">
              <span class="rating-number">${avgRating}</span>
              <div class="stars-display">
                ${this.renderStars(Math.round(avgRating))}
              </div>
              <small class="text-muted">(${reviews.length} opiniones)</small>
            </div>
            
            <button class="btn btn-outline-primary btn-sm" onclick="reviewsManager.showReviewForm()">
              <i class="bi bi-plus-circle me-1"></i>Escribir Opinión
            </button>
          </div>
        </div>

        <!-- Formulario de nueva review (oculto) -->
        <div class="review-form-container mb-4" id="review-form" style="display: none;">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Escribir una Opinión</h5>
              
              <div class="mb-3">
                <label class="form-label">Tu Calificación:</label>
                <div class="rating-input">
                  ${this.renderStars(0, true)}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="reviewer-name" class="form-label">Tu Nombre:</label>
                <input type="text" class="form-control" id="reviewer-name" required>
              </div>
              
              <div class="mb-3">
                <label for="review-comment" class="form-label">Tu Opinión:</label>
                <textarea class="form-control" id="review-comment" rows="3" 
                          placeholder="Comparte tu experiencia con este producto..." required></textarea>
              </div>
              
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-primary" onclick="reviewsManager.submitReview('${productId}')">
                  <i class="bi bi-send me-1"></i>Enviar Opinión
                </button>
                <button type="button" class="btn btn-secondary" onclick="reviewsManager.hideReviewForm()">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de reviews -->
        <div class="reviews-list" id="reviews-list">
          ${this.renderReviewsList(reviews)}
        </div>
      </div>
    `;
  }

  // Renderizar lista de reviews
  renderReviewsList(reviews) {
    if (reviews.length === 0) {
      return `
        <div class="no-reviews text-center py-4">
          <i class="bi bi-chat-square-text text-muted" style="font-size: 3rem;"></i>
          <p class="text-muted mt-2">Aún no hay opiniones para este producto.</p>
          <p class="text-muted">¡Sé el primero en compartir tu experiencia!</p>
        </div>
      `;
    }

    return reviews.map(review => `
      <div class="review-item mb-3">
        <div class="card">
          <div class="card-body">
            <div class="review-header d-flex justify-content-between align-items-start mb-2">
              <div>
                <div class="d-flex align-items-center mb-1">
                  <strong class="reviewer-name">${review.user}</strong>
                  ${review.verified ? '<span class="badge bg-success ms-2"><i class="bi bi-check-circle me-1"></i>Compra Verificada</span>' : ''}
                </div>
                <div class="review-rating">
                  ${this.renderStars(review.rating, false, 'small')}
                </div>
              </div>
              <small class="text-muted">${this.formatDate(review.date)}</small>
            </div>
            
            <p class="review-comment mb-0">${review.comment}</p>
            
            <div class="review-actions mt-2">
              <button class="btn btn-sm btn-outline-secondary" onclick="reviewsManager.likeReview(${review.id})">
                <i class="bi bi-hand-thumbs-up me-1"></i>Útil
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Mostrar formulario de review
  showReviewForm() {
    document.getElementById('review-form').style.display = 'block';
    document.getElementById('reviewer-name').focus();
  }

  // Ocultar formulario de review
  hideReviewForm() {
    document.getElementById('review-form').style.display = 'none';
    this.resetForm();
  }

  // Establecer rating en formulario
  setRating(rating) {
    this.selectedRating = rating;
    const stars = document.querySelectorAll('.rating-input .review-star');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.remove('bi-star');
        star.classList.add('bi-star-fill');
      } else {
        star.classList.remove('bi-star-fill');
        star.classList.add('bi-star');
      }
    });
  }

  // Enviar review
  submitReview(productId) {
    const name = document.getElementById('reviewer-name').value.trim();
    const comment = document.getElementById('review-comment').value.trim();
    
    if (!name || !comment || !this.selectedRating) {
      this.showNotification('Por favor completa todos los campos', 'error');
      return;
    }

    const review = {
      user: name,
      rating: this.selectedRating,
      comment: comment
    };

    this.addReview(productId, review);
    this.hideReviewForm();
  }

  // Resetear formulario
  resetForm() {
    document.getElementById('reviewer-name').value = '';
    document.getElementById('review-comment').value = '';
    this.selectedRating = 0;
    
    const stars = document.querySelectorAll('.rating-input .review-star');
    stars.forEach(star => {
      star.classList.remove('bi-star-fill');
      star.classList.add('bi-star');
    });
  }

  // Renderizar reviews en página
  renderReviews(productId) {
    const container = document.getElementById('reviews-container');
    if (container) {
      container.innerHTML = this.renderReviewsSection(productId);
    }
  }

  // Formatear fecha
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Mostrar notificación
  showNotification(message, type = 'info') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible review-notification`;
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  }

  // Inicializar sistema
  init() {
    // Agregar estilos CSS
    this.addStyles();
    
    // Detectar producto actual y renderizar
    this.detectProductAndRender();
  }

  // Detectar producto actual
  detectProductAndRender() {
    const currentPage = window.location.pathname.split('/').pop();
    let productId = null;
    
    if (currentPage.includes('jarro')) productId = 'jarro-zorrito';
    else if (currentPage.includes('cuaderno')) productId = 'cuaderno-artesanal';
    else if (currentPage.includes('yerbera')) productId = 'yerbera-artesanal';
    
    if (productId) {
      // Esperar a que la página cargue completamente
      setTimeout(() => {
        this.renderReviews(productId);
      }, 500);
    }
  }

  // Agregar estilos CSS
  addStyles() {
    const styles = `
      <style>
        /* Estilos para Reviews - No afectan código existente */
        .reviews-section {
          border-top: 2px solid #e9ecef;
          padding-top: 2rem;
        }
        
        .reviews-title {
          color: #3b5d50;
          font-weight: 600;
        }
        
        .rating-number {
          font-size: 2rem;
          font-weight: bold;
          color: #ffc107;
          margin-right: 0.5rem;
        }
        
        .review-star {
          color: #ffc107;
          margin-right: 2px;
          transition: all 0.2s ease;
        }
        
        .review-star.clickable {
          cursor: pointer;
        }
        
        .review-star.clickable:hover {
          transform: scale(1.2);
        }
        
        .star-normal {
          font-size: 1.2rem;
        }
        
        .star-small {
          font-size: 1rem;
        }
        
        .review-item {
          transition: all 0.3s ease;
        }
        
        .review-item:hover {
          transform: translateY(-2px);
        }
        
        .review-form-container .card {
          border: 2px solid #3b5d50;
          border-radius: 15px;
        }
        
        .rating-input {
          font-size: 1.5rem;
        }
        
        .reviewer-name {
          color: #3b5d50;
        }
        
        .no-reviews i {
          opacity: 0.5;
        }
        
        .review-notification {
          animation: slideInRight 0.3s ease;
        }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .reviews-summary {
            flex-direction: column;
            align-items: flex-start !important;
          }
          
          .average-rating {
            margin-bottom: 1rem;
          }
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.reviewsManager = new ReviewsManager();
});