// Sistema de calificaciones y reseñas para Patagonia Style
class RatingSystem {
  constructor() {
    this.ratings = this.loadRatings();
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  // Cargar calificaciones del localStorage
  loadRatings() {
    const ratings = localStorage.getItem('patagonia_ratings');
    return ratings ? JSON.parse(ratings) : {};
  }

  // Guardar calificaciones
  saveRatings() {
    localStorage.setItem('patagonia_ratings', JSON.stringify(this.ratings));
  }

  // Agregar una nueva calificación
  addRating(productId, userId, rating, comment = '') {
    if (!this.ratings[productId]) {
      this.ratings[productId] = {
        reviews: [],
        averageRating: 0,
        totalReviews: 0
      };
    }

    // Verificar si el usuario ya calificó este producto
    const existingReviewIndex = this.ratings[productId].reviews.findIndex(
      review => review.userId === userId
    );

    const newReview = {
      id: 'review_' + Date.now(),
      userId: userId,
      userName: this.getUserName(userId),
      rating: rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
      helpful: 0,
      verified: this.isVerifiedPurchase(productId, userId)
    };

    if (existingReviewIndex !== -1) {
      // Actualizar reseña existente
      this.ratings[productId].reviews[existingReviewIndex] = newReview;
    } else {
      // Agregar nueva reseña
      this.ratings[productId].reviews.push(newReview);
    }

    // Recalcular promedio
    this.calculateAverageRating(productId);
    this.saveRatings();

    return newReview;
  }

  // Calcular el promedio de calificaciones
  calculateAverageRating(productId) {
    const productRatings = this.ratings[productId];
    if (!productRatings || productRatings.reviews.length === 0) {
      productRatings.averageRating = 0;
      productRatings.totalReviews = 0;
      return;
    }

    const sum = productRatings.reviews.reduce((acc, review) => acc + review.rating, 0);
    productRatings.averageRating = (sum / productRatings.reviews.length).toFixed(1);
    productRatings.totalReviews = productRatings.reviews.length;
  }

  // Obtener calificaciones de un producto
  getProductRatings(productId) {
    return this.ratings[productId] || {
      reviews: [],
      averageRating: 0,
      totalReviews: 0
    };
  }

  // Verificar si es una compra verificada
  isVerifiedPurchase(productId, userId) {
    if (typeof userManager === 'undefined' || !userManager.getCurrentUser()) {
      return false;
    }

    const user = userManager.getCurrentUser();
    if (!user.orders) return false;

    return user.orders.some(order => 
      order.productos.some(product => product.id === parseInt(productId))
    );
  }

  // Obtener nombre del usuario
  getUserName(userId) {
    if (typeof userManager === 'undefined') {
      return 'Usuario Anónimo';
    }

    const users = userManager.getAllUsers();
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Usuario Anónimo';
  }

  // Renderizar estrellas para mostrar calificación
  renderStars(rating, interactive = false, size = 'normal', productId = null) {
    const starSize = size === 'small' ? '0.9rem' : size === 'large' ? '1.5rem' : '1.2rem';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHTML = '';

    // Estrellas llenas
    for (let i = 0; i < fullStars; i++) {
      starsHTML += `<i class="bi bi-star-fill text-warning" style="font-size: ${starSize}; ${interactive ? 'cursor: pointer;' : ''}" ${interactive ? `data-rating="${i + 1}" data-product-id="${productId}"` : ''}></i>`;
    }

    // Media estrella
    if (hasHalfStar) {
      starsHTML += `<i class="bi bi-star-half text-warning" style="font-size: ${starSize};"></i>`;
    }

    // Estrellas vacías
    for (let i = 0; i < emptyStars; i++) {
      const starIndex = fullStars + (hasHalfStar ? 1 : 0) + i + 1;
      starsHTML += `<i class="bi bi-star text-muted" style="font-size: ${starSize}; ${interactive ? 'cursor: pointer;' : ''}" ${interactive ? `data-rating="${starIndex}" data-product-id="${productId}"` : ''}></i>`;
    }

    return starsHTML;
  }

  // Renderizar estrellas interactivas para calificar
  renderInteractiveStars(productId, currentRating = 0) {
    let starsHTML = '<div class="interactive-stars" data-product-id="' + productId + '">';
    
    for (let i = 1; i <= 5; i++) {
      const isActive = i <= currentRating;
      starsHTML += `
        <i class="bi bi-star${isActive ? '-fill' : ''} rating-star ${isActive ? 'text-warning' : 'text-muted'}" 
           data-rating="${i}" 
           data-product-id="${productId}"
           style="font-size: 1.5rem; cursor: pointer; margin-right: 3px;"></i>
      `;
    }
    
    starsHTML += '</div>';
    return starsHTML;
  }

  // Renderizar sección completa de reseñas
  renderReviewsSection(productId) {
    const productRatings = this.getProductRatings(productId);
    const isLoggedIn = typeof userManager !== 'undefined' && userManager.isLoggedIn();

    let reviewsHTML = `
      <div class="reviews-section mt-4">
        <h4 class="mb-3">
          <i class="bi bi-star-fill text-warning"></i> 
          Reseñas de clientes
        </h4>
        
        <!-- Resumen de calificaciones -->
        <div class="rating-summary mb-4">
          <div class="row align-items-center">
            <div class="col-md-6">
              <div class="d-flex align-items-center">
                <div class="rating-average me-3">
                  <span class="h2 mb-0">${productRatings.averageRating}</span>
                  <div class="small text-muted">de 5 estrellas</div>
                </div>
                <div>
                  <div class="stars-display">
                    ${this.renderStars(parseFloat(productRatings.averageRating), false, 'normal')}
                  </div>
                  <div class="small text-muted">${productRatings.totalReviews} reseña${productRatings.totalReviews !== 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              ${this.renderRatingDistribution(productId)}
            </div>
          </div>
        </div>

        <!-- Formulario para agregar reseña -->
        ${isLoggedIn ? this.renderReviewForm(productId) : this.renderLoginPrompt()}

        <!-- Lista de reseñas -->
        <div class="reviews-list">
          ${this.renderReviewsList(productId)}
        </div>
      </div>
    `;

    return reviewsHTML;
  }

  // Renderizar distribución de calificaciones
  renderRatingDistribution(productId) {
    const productRatings = this.getProductRatings(productId);
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    // Calcular distribución
    productRatings.reviews.forEach(review => {
      distribution[review.rating]++;
    });

    let distributionHTML = '<div class="rating-distribution">';
    
    for (let i = 5; i >= 1; i--) {
      const count = distribution[i];
      const percentage = productRatings.totalReviews > 0 ? (count / productRatings.totalReviews) * 100 : 0;
      
      distributionHTML += `
        <div class="d-flex align-items-center mb-1">
          <span class="small me-2">${i}</span>
          <i class="bi bi-star-fill text-warning me-2" style="font-size: 0.8rem;"></i>
          <div class="progress flex-grow-1 me-2" style="height: 8px;">
            <div class="progress-bar bg-warning" style="width: ${percentage}%"></div>
          </div>
          <span class="small text-muted">${count}</span>
        </div>
      `;
    }
    
    distributionHTML += '</div>';
    return distributionHTML;
  }

  // Renderizar formulario de reseña
  renderReviewForm(productId) {
    const userRating = this.getUserRating(productId);
    
    return `
      <div class="review-form-container mb-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">
              ${userRating ? 'Actualizar mi reseña' : 'Escribir una reseña'}
            </h5>
            
            <form id="reviewForm" data-product-id="${productId}">
              <div class="mb-3">
                <label class="form-label">Calificación *</label>
                <div class="rating-input">
                  ${this.renderInteractiveStars(productId, userRating ? userRating.rating : 0)}
                </div>
                <input type="hidden" id="ratingValue" value="${userRating ? userRating.rating : 0}">
              </div>
              
              <div class="mb-3">
                <label for="reviewComment" class="form-label">Comentario (opcional)</label>
                <textarea class="form-control" id="reviewComment" rows="3" 
                          placeholder="Comparte tu experiencia con este producto...">${userRating ? userRating.comment : ''}</textarea>
              </div>
              
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">
                  ${userRating ? 'Actualizar Reseña' : 'Publicar Reseña'}
                </button>
                ${userRating ? '<button type="button" class="btn btn-outline-danger" onclick="ratingSystem.deleteUserRating(' + productId + ')">Eliminar</button>' : ''}
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  // Renderizar prompt de login
  renderLoginPrompt() {
    return `
      <div class="login-prompt mb-4">
        <div class="card bg-light">
          <div class="card-body text-center">
            <i class="bi bi-person-plus-fill text-muted" style="font-size: 2rem;"></i>
            <h5 class="mt-2">¿Compraste este producto?</h5>
            <p class="text-muted">Inicia sesión para escribir una reseña</p>
            <button class="btn btn-primary" onclick="userManager.showLoginModal()">
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Renderizar lista de reseñas
  renderReviewsList(productId) {
    const productRatings = this.getProductRatings(productId);
    
    if (productRatings.reviews.length === 0) {
      return `
        <div class="no-reviews text-center py-4">
          <i class="bi bi-chat-dots text-muted" style="font-size: 3rem;"></i>
          <h5 class="mt-3 text-muted">Sin reseñas aún</h5>
          <p class="text-muted">Sé el primero en reseñar este producto</p>
        </div>
      `;
    }

    // Ordenar reseñas por fecha (más recientes primero)
    const sortedReviews = [...productRatings.reviews].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    let reviewsHTML = '';
    
    sortedReviews.forEach(review => {
      const reviewDate = new Date(review.date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      reviewsHTML += `
        <div class="review-item border-bottom pb-3 mb-3">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <div class="d-flex align-items-center mb-1">
                <strong class="me-2">${review.userName}</strong>
                ${review.verified ? '<span class="badge bg-success badge-sm">Compra verificada</span>' : ''}
              </div>
              <div class="stars-display mb-1">
                ${this.renderStars(review.rating, false, 'small')}
              </div>
              <small class="text-muted">${reviewDate}</small>
            </div>
          </div>
          
          ${review.comment ? `<p class="review-comment mb-2">${review.comment}</p>` : ''}
          
          <div class="review-actions">
            <button class="btn btn-link btn-sm p-0 text-muted" 
                    onclick="ratingSystem.markHelpful('${review.id}', '${productId}')">
              <i class="bi bi-hand-thumbs-up"></i> 
              Útil (${review.helpful})
            </button>
          </div>
        </div>
      `;
    });

    return reviewsHTML;
  }

  // Obtener calificación del usuario actual
  getUserRating(productId) {
    if (typeof userManager === 'undefined' || !userManager.isLoggedIn()) {
      return null;
    }

    const currentUser = userManager.getCurrentUser();
    const productRatings = this.getProductRatings(productId);
    
    return productRatings.reviews.find(review => review.userId === currentUser.id) || null;
  }

  // Eliminar calificación del usuario
  deleteUserRating(productId) {
    if (!userManager.isLoggedIn()) return;

    if (confirm('¿Estás seguro de que quieres eliminar tu reseña?')) {
      const currentUser = userManager.getCurrentUser();
      const productRatings = this.getProductRatings(productId);
      
      this.ratings[productId].reviews = productRatings.reviews.filter(
        review => review.userId !== currentUser.id
      );
      
      this.calculateAverageRating(productId);
      this.saveRatings();
      
      // Recargar la sección de reseñas
      this.updateReviewsDisplay(productId);
      
      if (typeof store !== 'undefined') {
        store.mostrarNotificacion('Reseña eliminada exitosamente', 'info');
      }
    }
  }

  // Marcar reseña como útil
  markHelpful(reviewId, productId) {
    const productRatings = this.getProductRatings(productId);
    const review = productRatings.reviews.find(r => r.id === reviewId);
    
    if (review) {
      review.helpful = (review.helpful || 0) + 1;
      this.saveRatings();
      this.updateReviewsDisplay(productId);
      
      if (typeof store !== 'undefined') {
        store.mostrarNotificacion('¡Gracias por tu feedback!', 'success');
      }
    }
  }

  // Actualizar display de reseñas
  updateReviewsDisplay(productId) {
    const reviewsContainer = document.querySelector('.reviews-section');
    if (reviewsContainer) {
      reviewsContainer.outerHTML = this.renderReviewsSection(productId);
      this.setupEventListeners();
    }
  }

  // Configurar event listeners
  setupEventListeners() {
    // Event listener para estrellas interactivas
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('rating-star')) {
        this.handleStarClick(e.target);
      }
    });

    // Event listener para hover en estrellas
    document.addEventListener('mouseover', (e) => {
      if (e.target.classList.contains('rating-star')) {
        this.handleStarHover(e.target);
      }
    });

    // Event listener para submit del formulario de reseña
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'reviewForm') {
        e.preventDefault();
        this.handleReviewSubmit(e.target);
      }
    });
  }

  // Manejar click en estrella
  handleStarClick(star) {
    const rating = parseInt(star.dataset.rating);
    const productId = star.dataset.productId;
    const starsContainer = star.parentElement;
    
    // Actualizar valor hidden
    const ratingInput = document.getElementById('ratingValue');
    if (ratingInput) {
      ratingInput.value = rating;
    }
    
    // Actualizar visualización de estrellas
    this.updateStarsDisplay(starsContainer, rating);
  }

  // Manejar hover en estrella
  handleStarHover(star) {
    const rating = parseInt(star.dataset.rating);
    const starsContainer = star.parentElement;
    
    // Efecto temporal de hover
    this.updateStarsDisplay(starsContainer, rating, true);
  }

  // Actualizar visualización de estrellas
  updateStarsDisplay(container, rating, isHover = false) {
    const stars = container.querySelectorAll('.rating-star');
    
    stars.forEach((star, index) => {
      const starRating = index + 1;
      
      if (starRating <= rating) {
        star.className = 'bi bi-star-fill rating-star text-warning';
      } else {
        star.className = 'bi bi-star rating-star text-muted';
      }
    });
  }

  // Manejar envío de reseña
  handleReviewSubmit(form) {
    if (typeof userManager === 'undefined' || !userManager.isLoggedIn()) {
      userManager.showLoginModal();
      return;
    }

    const productId = form.dataset.productId;
    const rating = parseInt(document.getElementById('ratingValue').value);
    const comment = document.getElementById('reviewComment').value;
    
    if (rating === 0) {
      if (typeof store !== 'undefined') {
        store.mostrarNotificacion('Por favor selecciona una calificación', 'warning');
      }
      return;
    }

    const currentUser = userManager.getCurrentUser();
    
    try {
      const review = this.addRating(productId, currentUser.id, rating, comment);
      
      if (typeof store !== 'undefined') {
        store.mostrarNotificacion('¡Reseña publicada exitosamente!', 'success');
      }
      
      // Actualizar display
      this.updateReviewsDisplay(productId);
      
    } catch (error) {
      if (typeof store !== 'undefined') {
        store.mostrarNotificacion('Error al publicar la reseña', 'error');
      }
    }
  }

  // Obtener promedio de calificación para mostrar en tarjetas de producto
  getAverageRating(productId) {
    const productRatings = this.getProductRatings(productId);
    return parseFloat(productRatings.averageRating) || 0;
  }

  // Obtener total de reseñas
  getTotalReviews(productId) {
    const productRatings = this.getProductRatings(productId);
    return productRatings.totalReviews || 0;
  }
}

// Inicializar sistema de calificaciones
let ratingSystem;
document.addEventListener('DOMContentLoaded', () => {
  ratingSystem = new RatingSystem();
});

// CSS para el sistema de calificaciones
const ratingStyles = document.createElement('style');
ratingStyles.textContent = `
  .rating-star {
    transition: color 0.2s ease;
  }

  .rating-star:hover {
    transform: scale(1.1);
  }

  .interactive-stars {
    margin: 10px 0;
  }

  .review-item {
    transition: background-color 0.2s ease;
  }

  .review-item:hover {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 10px;
    margin: -10px -10px 10px -10px;
  }

  .rating-summary {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #dee2e6;
  }

  .rating-average {
    text-align: center;
  }

  .rating-distribution .progress {
    background-color: #e9ecef;
  }

  .review-form-container .card {
    border: 2px dashed #dee2e6;
    transition: border-color 0.3s ease;
  }

  .review-form-container .card:hover {
    border-color: #3b5d50;
  }

  .badge-sm {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }

  .no-reviews {
    background: #f8f9fa;
    border-radius: 10px;
    margin: 20px 0;
  }

  .login-prompt .card {
    border: 2px dashed #6c757d;
  }

  .review-comment {
    background: #f8f9fa;
    padding: 10px;
    border-radius: 6px;
    font-style: italic;
  }

  .stars-display i {
    margin-right: 2px;
  }
`;
document.head.appendChild(ratingStyles);

// Exportar para uso global
window.RatingSystem = RatingSystem;