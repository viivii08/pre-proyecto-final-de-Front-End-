class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.createToggleButton();
    
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('theme-toggle') || e.target.closest('.theme-toggle')) {
        this.toggleTheme();
      }
    });

    if (!localStorage.getItem('theme')) {
      this.detectSystemTheme();
    }
  }

  createToggleButton() {
    if (document.querySelector('.theme-toggle')) return;

    const toggleButton = document.createElement('button');
    toggleButton.className = 'theme-toggle';
    toggleButton.title = 'Cambiar tema';
    toggleButton.innerHTML = `
      <i class="bi bi-sun-fill sun-icon"></i>
      <i class="bi bi-moon-stars-fill moon-icon"></i>
    `;

    document.body.appendChild(toggleButton);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    
    this.showNotification(
      newTheme === 'dark' ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado'
    );
  }

  // Aplicar tema
  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Actualizar meta theme-color para mobile
    this.updateThemeColor(theme);
    
    // Animar transición
    this.animateThemeChange();
  }

  // Detectar tema del sistema
  detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.applyTheme('dark');
    }

    // Escuchar cambios en la preferencia del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) { // Solo si no hay preferencia manual
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // Actualizar color del tema para mobile
  updateThemeColor(theme) {
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }

    themeColorMeta.content = theme === 'dark' ? '#1a1a1a' : '#f4f1ee';
  }

  // Animar cambio de tema
  animateThemeChange() {
    // Crear overlay para transición suave
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${this.currentTheme === 'dark' ? '#1a1a1a' : '#f4f1ee'};
      opacity: 0;
      pointer-events: none;
      z-index: 9999;
      transition: opacity 0.3s ease;
    `;

    document.body.appendChild(overlay);

    // Animar entrada
    requestAnimationFrame(() => {
      overlay.style.opacity = '0.3';
    });

    // Remover overlay después de la transición
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 300);
    }, 150);
  }

  // Mostrar notificación
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'theme-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
      </div>
    `;

    // Estilos inline para la notificación
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: var(--card-bg);
      color: var(--text-primary);
      border-radius: 10px;
      box-shadow: 0 5px 20px var(--shadow);
      z-index: 9999;
      transform: translateX(100%);
      transition: all 0.3s ease;
      padding: 15px 20px;
      font-weight: 500;
      border: 2px solid var(--border-color);
    `;

    document.body.appendChild(notification);

    // Mostrar con animación
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto eliminar
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }

  // Obtener tema actual
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Verificar si es modo oscuro
  isDarkMode() {
    return this.currentTheme === 'dark';
  }
}

const themeManager = new ThemeManager();

function toggleTheme() {
  themeManager.toggleTheme();
}

window.themeManager = themeManager;