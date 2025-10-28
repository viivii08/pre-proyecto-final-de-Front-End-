/**
 * Sistema de Loading States Profesional - Patagonia Style
 * Manejo de estados de carga con spinners y feedback visual
 */

class LoadingSystem {
  constructor() {
    this.activeLoaders = new Set();
    this.loadingComponents = new Map();
    this.defaultConfig = {
      spinner: 'dots',
      overlay: true,
      backdrop: true,
      text: 'Cargando...',
      size: 'medium',
      position: 'center'
    };
    this.initializeStyles();
  }

  initializeStyles() {
    const styles = `
    <style id="loading-system-styles">
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9998;
        backdrop-filter: blur(3px);
        transition: opacity 0.3s ease;
      }

      .loading-container {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        text-align: center;
        max-width: 300px;
        animation: loadingPulse 0.3s ease-in;
      }

      .loading-inline {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .loading-button {
        position: relative;
        overflow: hidden;
      }

      .loading-button.is-loading {
        color: transparent !important;
        pointer-events: none;
      }

      .loading-button.is-loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      /* Spinner Animations */
      .spinner-dots {
        display: flex;
        gap: 4px;
        justify-content: center;
        align-items: center;
      }

      .spinner-dots .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #007bff;
        animation: dotPulse 1.4s infinite ease-in-out;
      }

      .spinner-dots .dot:nth-child(1) { animation-delay: -0.32s; }
      .spinner-dots .dot:nth-child(2) { animation-delay: -0.16s; }
      .spinner-dots .dot:nth-child(3) { animation-delay: 0s; }

      .spinner-circle {
        width: 32px;
        height: 32px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .spinner-pulse {
        width: 32px;
        height: 32px;
        background: #007bff;
        border-radius: 50%;
        animation: pulse 1.5s infinite;
      }

      .spinner-bars {
        display: flex;
        gap: 2px;
        align-items: end;
        height: 32px;
      }

      .spinner-bars .bar {
        width: 4px;
        background: #007bff;
        animation: barGrow 1.2s infinite ease-in-out;
      }

      .spinner-bars .bar:nth-child(1) { animation-delay: -1.1s; }
      .spinner-bars .bar:nth-child(2) { animation-delay: -1.0s; }
      .spinner-bars .bar:nth-child(3) { animation-delay: -0.9s; }
      .spinner-bars .bar:nth-child(4) { animation-delay: -0.8s; }
      .spinner-bars .bar:nth-child(5) { animation-delay: -0.7s; }

      /* Size variants */
      .loading-small .spinner-circle { width: 20px; height: 20px; border-width: 2px; }
      .loading-small .spinner-pulse { width: 20px; height: 20px; }
      .loading-small .spinner-dots .dot { width: 5px; height: 5px; }

      .loading-large .spinner-circle { width: 48px; height: 48px; border-width: 4px; }
      .loading-large .spinner-pulse { width: 48px; height: 48px; }
      .loading-large .spinner-dots .dot { width: 12px; height: 12px; }

      .loading-text {
        margin-top: 1rem;
        color: #333;
        font-weight: 500;
      }

      .loading-progress {
        width: 100%;
        height: 4px;
        background: #e9ecef;
        border-radius: 2px;
        overflow: hidden;
        margin-top: 1rem;
      }

      .loading-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #007bff, #0056b3);
        transition: width 0.3s ease;
        animation: progressPulse 2s infinite;
      }

      /* Skeleton loading */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
      }

      .skeleton-text {
        height: 1rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }

      .skeleton-text.short { width: 60%; }
      .skeleton-text.medium { width: 80%; }
      .skeleton-text.long { width: 100%; }

      .skeleton-card {
        height: 200px;
        border-radius: 8px;
        margin-bottom: 1rem;
      }

      /* Animations */
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes dotPulse {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
      }

      @keyframes barGrow {
        0%, 40%, 100% { transform: scaleY(0.4); }
        20% { transform: scaleY(1); }
      }

      @keyframes loadingPulse {
        0% { transform: scale(0.9); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }

      @keyframes progressPulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }

      @keyframes skeleton-loading {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      /* Responsive */
      @media (max-width: 576px) {
        .loading-container {
          margin: 1rem;
          padding: 1.5rem;
        }
      }
    </style>
    `;

    if (!document.getElementById('loading-system-styles')) {
      document.head.insertAdjacentHTML('beforeend', styles);
    }
  }

  // Crear spinner component
  createSpinner(type = 'dots', size = 'medium') {
    const sizeClass = `loading-${size}`;
    
    switch (type) {
      case 'circle':
        return `<div class="spinner-circle ${sizeClass}"></div>`;
      
      case 'pulse':
        return `<div class="spinner-pulse ${sizeClass}"></div>`;
      
      case 'bars':
        return `
          <div class="spinner-bars ${sizeClass}">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
        `;
      
      case 'dots':
      default:
        return `
          <div class="spinner-dots ${sizeClass}">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        `;
    }
  }

  // Mostrar loading overlay
  showOverlay(config = {}) {
    const options = { ...this.defaultConfig, ...config };
    const loaderId = 'loading-overlay-' + Date.now();
    
    const overlay = document.createElement('div');
    overlay.id = loaderId;
    overlay.className = 'loading-overlay';
    
    overlay.innerHTML = `
      <div class="loading-container">
        ${this.createSpinner(options.spinner, options.size)}
        ${options.text ? `<div class="loading-text">${options.text}</div>` : ''}
        ${options.progress !== undefined ? `
          <div class="loading-progress">
            <div class="loading-progress-bar" style="width: ${options.progress}%"></div>
          </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(overlay);
    this.activeLoaders.add(loaderId);
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    return loaderId;
  }

  // Ocultar loading overlay
  hideOverlay(loaderId) {
    const overlay = document.getElementById(loaderId);
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        this.activeLoaders.delete(loaderId);
        
        // Restaurar scroll si no hay más loaders
        if (this.activeLoaders.size === 0) {
          document.body.style.overflow = '';
        }
      }, 300);
    }
  }

  // Loading para botones
  showButtonLoading(buttonElement, text = 'Cargando...') {
    if (buttonElement.classList.contains('is-loading')) return;
    
    const originalText = buttonElement.textContent;
    buttonElement.setAttribute('data-original-text', originalText);
    buttonElement.textContent = text;
    buttonElement.classList.add('loading-button', 'is-loading');
    buttonElement.disabled = true;
  }

  hideButtonLoading(buttonElement) {
    const originalText = buttonElement.getAttribute('data-original-text');
    if (originalText) {
      buttonElement.textContent = originalText;
      buttonElement.removeAttribute('data-original-text');
    }
    buttonElement.classList.remove('loading-button', 'is-loading');
    buttonElement.disabled = false;
  }

  // Loading inline
  showInlineLoading(containerElement, config = {}) {
    const options = { spinner: 'dots', size: 'small', text: '', ...config };
    const loaderId = 'inline-loading-' + Date.now();
    
    const loadingElement = document.createElement('div');
    loadingElement.id = loaderId;
    loadingElement.className = 'loading-inline';
    loadingElement.innerHTML = `
      ${this.createSpinner(options.spinner, options.size)}
      ${options.text ? `<span class="loading-text">${options.text}</span>` : ''}
    `;
    
    containerElement.appendChild(loadingElement);
    this.activeLoaders.add(loaderId);
    
    return loaderId;
  }

  hideInlineLoading(loaderId) {
    const element = document.getElementById(loaderId);
    if (element) {
      element.remove();
      this.activeLoaders.delete(loaderId);
    }
  }

  // Skeleton loading
  showSkeleton(containerElement, config = {}) {
    const { rows = 3, cardHeight = '200px' } = config;
    const loaderId = 'skeleton-' + Date.now();
    
    const skeletonElement = document.createElement('div');
    skeletonElement.id = loaderId;
    skeletonElement.className = 'skeleton-container';
    
    if (config.type === 'card') {
      skeletonElement.innerHTML = `<div class="skeleton skeleton-card" style="height: ${cardHeight}"></div>`;
    } else {
      let skeletonHTML = '';
      for (let i = 0; i < rows; i++) {
        const widthClass = i % 3 === 0 ? 'long' : i % 3 === 1 ? 'medium' : 'short';
        skeletonHTML += `<div class="skeleton skeleton-text ${widthClass}"></div>`;
      }
      skeletonElement.innerHTML = skeletonHTML;
    }
    
    containerElement.appendChild(skeletonElement);
    this.activeLoaders.add(loaderId);
    
    return loaderId;
  }

  hideSkeleton(loaderId) {
    const element = document.getElementById(loaderId);
    if (element) {
      element.remove();
      this.activeLoaders.delete(loaderId);
    }
  }

  // Actualizar progreso
  updateProgress(loaderId, progress) {
    const overlay = document.getElementById(loaderId);
    if (overlay) {
      const progressBar = overlay.querySelector('.loading-progress-bar');
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
    }
  }

  // Limpiar todos los loaders
  clearAll() {
    this.activeLoaders.forEach(loaderId => {
      const element = document.getElementById(loaderId);
      if (element) {
        element.remove();
      }
    });
    this.activeLoaders.clear();
    document.body.style.overflow = '';
  }

  // Wrapper para operaciones async
  async withLoading(asyncOperation, config = {}) {
    const loaderId = this.showOverlay(config);
    try {
      const result = await asyncOperation();
      return result;
    } finally {
      this.hideOverlay(loaderId);
    }
  }

  // Wrapper para operaciones async con botón
  async withButtonLoading(buttonElement, asyncOperation, loadingText = 'Cargando...') {
    this.showButtonLoading(buttonElement, loadingText);
    try {
      const result = await asyncOperation();
      return result;
    } finally {
      this.hideButtonLoading(buttonElement);
    }
  }
}

// Instancia global
window.loadingSystem = new LoadingSystem();

// Utilidades globales para retrocompatibilidad
window.showLoading = (config) => loadingSystem.showOverlay(config);
window.hideLoading = (loaderId) => loadingSystem.hideOverlay(loaderId);
window.showButtonLoading = (button, text) => loadingSystem.showButtonLoading(button, text);
window.hideButtonLoading = (button) => loadingSystem.hideButtonLoading(button);

// Aliases adicionales para compatibilidad
window.showButton = (buttonId, text) => {
  const button = typeof buttonId === 'string' ? document.getElementById(buttonId) : buttonId;
  return loadingSystem.showButtonLoading(button, text);
};
window.hideButton = (buttonId) => {
  const button = typeof buttonId === 'string' ? document.getElementById(buttonId) : buttonId;
  return loadingSystem.hideButtonLoading(button);
};