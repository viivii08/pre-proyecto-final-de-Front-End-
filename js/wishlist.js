// SISTEMA DE LISTA DE DESEOS VISUAL
class WishlistManager {
  constructor() {
    this.wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    this.init();
  }

  init() {
    setTimeout(() => {
      this.updateAllHeartIcons();
      this.updateWishlistCounter();
    }, 1500);
  }

  toggleWishlist(productId) {
    const index = this.wishlist.indexOf(productId);
    
    if (index === -1) {
      this.wishlist.push(productId);
      this.showNotification(`❤️ Agregado a favoritos`, 'success');
      this.animateHeart(productId, true);
    } else {
      this.wishlist.splice(index, 1);
      this.showNotification(`💔 Eliminado de favoritos`, 'info');
      this.animateHeart(productId, false);
    }
    
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    this.updateWishlistCounter();
    
    const event = new CustomEvent('wishlistUpdated', {
      detail: { 
        productId: productId, 
        wishlist: [...this.wishlist],
        action: index === -1 ? 'added' : 'removed'
      }
    });
    document.dispatchEvent(event);
  }

  isInWishlist(productId) {
    return this.wishlist.includes(productId);
  }

  animateHeart(productId, isAdding) {
    const heartIcon = document.querySelector(`[data-product-id="${productId}"] .wishlist-heart`);
    
    if (!heartIcon) return;

    if (isAdding) {
      heartIcon.classList.remove('bi-heart');
      heartIcon.classList.add('bi-heart-fill', 'heart-beat');
      heartIcon.style.color = '#dc3545';
      
      setTimeout(() => {
        heartIcon.classList.remove('heart-beat');
      }, 600);
    } else {
      heartIcon.classList.remove('bi-heart-fill', 'heart-beat');
      heartIcon.classList.add('bi-heart');
      heartIcon.style.color = '#6c757d';
    }
  }

  updateAllHeartIcons() {
    const heartIcons = document.querySelectorAll('.wishlist-heart');
    
    heartIcons.forEach(icon => {
      const productCard = icon.closest('[data-product-id]');
      if (productCard) {
        const productId = parseInt(productCard.dataset.productId);
        
        if (this.isInWishlist(productId)) {
          icon.classList.remove('bi-heart');
          icon.classList.add('bi-heart-fill');
          icon.style.color = '#dc3545';
        } else {
          icon.classList.remove('bi-heart-fill');
          icon.classList.add('bi-heart');
          icon.style.color = '#6c757d';
        }
      }
    });
  }

  updateWishlistCounter() {
    const counter = document.querySelector('.wishlist-counter');
    if (counter) {
      const count = this.wishlist.length;
      counter.textContent = count;
      
      if (count > 0) {
        counter.style.display = 'inline';
        counter.classList.add('counter-bounce');
        setTimeout(() => {
          counter.classList.remove('counter-bounce');
        }, 300);
      } else {
        counter.style.display = 'none';
      }
    }
  }

  // Mostrar notificación
  showNotification(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `wishlist-notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    // Agregar al DOM
    document.body.appendChild(notification);

    // Mostrar con animación
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Auto eliminar después de 3 segundos
    setTimeout(() => {
      this.removeNotification(notification);
    }, 3000);

    // Event listener para cerrar manualmente
    notification.querySelector('.notification-close').addEventListener('click', () => {
      this.removeNotification(notification);
    });
  }

  // Remover notificación
  removeNotification(notification) {
    notification.classList.add('hide');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  // Obtener productos favoritos
  getWishlistProducts() {
    if (typeof store === 'undefined' || !store.productos) {
      return [];
    }
    
    return store.productos.filter(producto => this.isInWishlist(producto.id));
  }

  // Limpiar toda la wishlist
  clearWishlist() {
    this.wishlist = [];
    localStorage.removeItem('wishlist');
    this.updateAllHeartIcons();
    this.updateWishlistCounter();
    this.showNotification('🗑️ Lista de deseos limpiada', 'info');
  }
}

const wishlistManager = new WishlistManager();

function toggleWishlist(productId) {
  wishlistManager.toggleWishlist(productId);
}

window.toggleWishlist = toggleWishlist;

document.addEventListener('DOMContentLoaded', function() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        setTimeout(() => {
          wishlistManager.updateAllHeartIcons();
          wishlistManager.updateWishlistCounter();
        }, 100);
      }
    });
  });

  const productContainer = document.getElementById('productos-container');
  if (productContainer) {
    observer.observe(productContainer, {
      childList: true,
      subtree: true
    });
  }
});