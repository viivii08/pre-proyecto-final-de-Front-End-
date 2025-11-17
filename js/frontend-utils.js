// 🛠️ UTILIDADES FRONTEND AVANZADAS - COMPATIBLES CON CÓDIGO EXISTENTE

// 1. 🖼️ Lazy Loading Avanzado para Imágenes
class LazyImageLoader {
  constructor() {
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
      rootMargin: '50px 0px',
      threshold: 0.1
    });
    this.init();
  }

  init() {
    // Aplicar a todas las imágenes con data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.observer.observe(img);
    });
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        this.observer.unobserve(img);
      }
    });
  }
}

// 2. 🎨 Tema Oscuro/Claro (Opcional)
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.createToggleButton();
  }

  createToggleButton() {
    const button = document.createElement('button');
    button.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
    button.className = 'theme-toggle btn btn-outline-secondary';
    button.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 1000;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    button.onclick = () => this.toggleTheme();
    document.body.appendChild(button);
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('theme', this.currentTheme);
    document.querySelector('.theme-toggle').innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
  }
}

// 3. 🔄 Loading States Inteligentes
class SmartLoader {
  static show(element, text = 'Cargando...') {
    element.classList.add('loading');
    element.innerHTML = `
      <div class="d-flex align-items-center justify-content-center">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        <span>${text}</span>
      </div>
    `;
    element.disabled = true;
  }

  static hide(element, originalContent = '') {
    element.classList.remove('loading');
    element.innerHTML = originalContent;
    element.disabled = false;
  }
}

// 4. 📱 Detección de Dispositivo
class DeviceDetector {
  static isMobile() {
    return window.innerWidth <= 768;
  }

  static isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
  }

  static isDesktop() {
    return window.innerWidth > 1024;
  }

  static addDeviceClasses() {
    const body = document.body;
    body.classList.remove('mobile', 'tablet', 'desktop');
    
    if (this.isMobile()) body.classList.add('mobile');
    else if (this.isTablet()) body.classList.add('tablet');
    else body.classList.add('desktop');
  }
}

// 5. 🎯 Scroll Inteligente
class SmoothScroller {
  static scrollToElement(selector, offset = 70) {
    const element = document.querySelector(selector);
    if (element) {
      const top = element.offsetTop - offset;
      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
    }
  }

  static scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

// 6. 💾 Gestión de Estado Local Mejorada
class StateManager {
  static save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Error guardando en localStorage:', e);
      return false;
    }
  }

  static load(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn('Error cargando de localStorage:', e);
      return defaultValue;
    }
  }

  static remove(key) {
    localStorage.removeItem(key);
  }
}

// 7. 🔔 Notificaciones Elegantes
class NotificationManager {
  static show(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification-toast`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="bi bi-${this.getIcon(type)} me-2"></i>
        <span>${message}</span>
        <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
      </div>
    `;

    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto-remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  static getIcon(type) {
    const icons = {
      success: 'check-circle',
      warning: 'exclamation-triangle',
      danger: 'x-circle',
      info: 'info-circle'
    };
    return icons[type] || 'info-circle';
  }
}

// 8. 🚀 Inicialización Automática (DESHABILITADA para evitar errores)
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Inicializar solo utilidades básicas
    new LazyImageLoader();
    
    // Detectar dispositivo al cargar y al redimensionar
    DeviceDetector.addDeviceClasses();
    window.addEventListener('resize', () => DeviceDetector.addDeviceClasses());

    // Botón de scroll to top
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '<i class="bi bi-arrow-up"></i>';
    scrollButton.className = 'btn btn-primary scroll-to-top';
    scrollButton.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 1000;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    scrollButton.onclick = () => SmoothScroller.scrollToTop();
    document.body.appendChild(scrollButton);

    // Mostrar/ocultar botón según scroll
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        scrollButton.style.display = 'block';
      } else {
        scrollButton.style.display = 'none';
      }
    });

    console.log('🚀 Utilidades frontend cargadas correctamente');
  } catch (error) {
    console.warn('⚠️ Error cargando utilidades frontend:', error);
  }
});

// Exportar para uso global
window.LazyImageLoader = LazyImageLoader;
window.ThemeManager = ThemeManager;
window.SmartLoader = SmartLoader;
window.DeviceDetector = DeviceDetector;
window.SmoothScroller = SmoothScroller;
window.StateManager = StateManager;
window.NotificationManager = NotificationManager;