/**
 * Sistema de Notificaciones Profesional - Patagonia Style
 * Toast notifications con diferentes tipos y auto-dismiss
 */

class NotificationSystem {
  constructor() {
    this.notifications = new Map();
    this.defaultConfig = {
      duration: 5000,
      position: 'top-right',
      dismissible: true,
      showProgress: true,
      maxVisible: 5,
      animation: 'slide'
    };
    this.initializeContainer();
    this.initializeStyles();
  }

  initializeContainer() {
    if (!document.getElementById('notification-container')) {
      const container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'notification-container position-fixed';
      document.body.appendChild(container);
    }
  }

  initializeStyles() {
    const styles = `
    <style id="notification-system-styles">
      .notification-container {
        z-index: 10000;
        pointer-events: none;
        top: 20px;
        right: 20px;
        width: 400px;
        max-width: calc(100vw - 40px);
      }

      .notification-container.top-left {
        top: 20px;
        left: 20px;
        right: auto;
      }

      .notification-container.top-center {
        top: 20px;
        left: 50%;
        right: auto;
        transform: translateX(-50%);
      }

      .notification-container.bottom-right {
        top: auto;
        bottom: 20px;
        right: 20px;
      }

      .notification-container.bottom-left {
        top: auto;
        bottom: 20px;
        left: 20px;
        right: auto;
      }

      .notification-container.bottom-center {
        top: auto;
        bottom: 20px;
        left: 50%;
        right: auto;
        transform: translateX(-50%);
      }

      .notification {
        pointer-events: auto;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        margin-bottom: 12px;
        overflow: hidden;
        border-left: 4px solid #007bff;
        position: relative;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 100%;
      }

      .notification.show {
        transform: translateX(0);
      }

      .notification.hide {
        transform: translateX(100%);
        opacity: 0;
      }

      .notification.success {
        border-left-color: #28a745;
      }

      .notification.error {
        border-left-color: #dc3545;
      }

      .notification.warning {
        border-left-color: #ffc107;
      }

      .notification.info {
        border-left-color: #17a2b8;
      }

      .notification-header {
        padding: 16px 20px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .notification-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        margin-right: 12px;
        font-size: 1.2rem;
      }

      .notification-icon.success {
        color: #28a745;
      }

      .notification-icon.error {
        color: #dc3545;
      }

      .notification-icon.warning {
        color: #ffc107;
      }

      .notification-icon.info {
        color: #17a2b8;
      }

      .notification-content {
        flex-grow: 1;
      }

      .notification-title {
        font-weight: 600;
        font-size: 0.95rem;
        color: #2c3e50;
        margin: 0;
        line-height: 1.3;
      }

      .notification-message {
        font-size: 0.875rem;
        color: #6c757d;
        margin: 4px 0 0;
        line-height: 1.4;
      }

      .notification-close {
        background: none;
        border: none;
        color: #adb5bd;
        font-size: 1.2rem;
        padding: 0;
        margin-left: 12px;
        cursor: pointer;
        transition: color 0.2s ease;
        line-height: 1;
      }

      .notification-close:hover {
        color: #6c757d;
      }

      .notification-actions {
        padding: 0 20px 16px;
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }

      .notification-btn {
        padding: 6px 12px;
        border: 1px solid #dee2e6;
        background: white;
        color: #495057;
        font-size: 0.8rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;
      }

      .notification-btn:hover {
        background: #f8f9fa;
        border-color: #adb5bd;
      }

      .notification-btn.primary {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }

      .notification-btn.primary:hover {
        background: #0056b3;
        border-color: #0056b3;
      }

      .notification-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #007bff, #0056b3);
        transition: width 0.1s linear;
        border-radius: 0 0 12px 12px;
      }

      .notification-progress.success {
        background: linear-gradient(90deg, #28a745, #1e7e34);
      }

      .notification-progress.error {
        background: linear-gradient(90deg, #dc3545, #c82333);
      }

      .notification-progress.warning {
        background: linear-gradient(90deg, #ffc107, #e0a800);
      }

      .notification-progress.info {
        background: linear-gradient(90deg, #17a2b8, #138496);
      }

      /* Animaciones de entrada */
      .notification.slide {
        animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .notification.fade {
        animation: fadeIn 0.3s ease;
      }

      .notification.bounce {
        animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }

      @keyframes bounceIn {
        0% { transform: scale(0.3) translateX(100%); }
        50% { transform: scale(1.05) translateX(-10px); }
        70% { transform: scale(0.9) translateX(5px); }
        100% { transform: scale(1) translateX(0); }
      }

      /* Responsive */
      @media (max-width: 576px) {
        .notification-container {
          top: 10px;
          right: 10px;
          left: 10px;
          width: auto;
          max-width: none;
        }

        .notification-container.top-center,
        .notification-container.bottom-center {
          transform: none;
          left: 10px;
        }

        .notification {
          margin-bottom: 8px;
        }

        .notification-header {
          padding: 12px 16px 8px;
        }

        .notification-actions {
          padding: 0 16px 12px;
          flex-direction: column;
        }

        .notification-btn {
          width: 100%;
          text-align: center;
        }
      }
    </style>
    `;

    if (!document.getElementById('notification-system-styles')) {
      document.head.insertAdjacentHTML('beforeend', styles);
    }
  }

  // Método principal para mostrar notificaciones
  show(type, title, message, options = {}) {
    const config = { ...this.defaultConfig, ...options };
    const id = this.generateId();
    
    const notification = this.createNotification(id, type, title, message, config);
    const container = this.getContainer(config.position);
    
    // Controlar número máximo de notificaciones visibles
    this.enforceMaxVisible(config.maxVisible);
    
    container.appendChild(notification);
    
    // Trigger animation
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Auto-dismiss
    if (config.duration > 0) {
      this.setupAutoDismiss(id, config.duration, config.showProgress);
    }

    this.notifications.set(id, {
      element: notification,
      config: config,
      startTime: Date.now()
    });

    return id;
  }

  createNotification(id, type, title, message, config) {
    const notification = document.createElement('div');
    notification.id = `notification-${id}`;
    notification.className = `notification ${type} ${config.animation}`;

    const icon = this.getIcon(type);
    const hasActions = config.actions && config.actions.length > 0;

    notification.innerHTML = `
      <div class="notification-header">
        <div class="d-flex align-items-center flex-grow-1">
          <i class="notification-icon ${type} ${icon}"></i>
          <div class="notification-content">
            <div class="notification-title">${title}</div>
            ${message ? `<div class="notification-message">${message}</div>` : ''}
          </div>
        </div>
        ${config.dismissible ? `
          <button class="notification-close" onclick="notificationSystem.dismiss('${id}')">
            <i class="bi bi-x"></i>
          </button>
        ` : ''}
      </div>
      ${hasActions ? `
        <div class="notification-actions">
          ${config.actions.map(action => `
            <button class="notification-btn ${action.style || ''}" 
                    onclick="notificationSystem.handleAction('${id}', '${action.id}')">
              ${action.label}
            </button>
          `).join('')}
        </div>
      ` : ''}
      ${config.showProgress ? `<div class="notification-progress ${type}" style="width: 100%;"></div>` : ''}
    `;

    return notification;
  }

  getIcon(type) {
    const icons = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };
    return icons[type] || icons.info;
  }

  getContainer(position) {
    const container = document.getElementById('notification-container');
    container.className = `notification-container position-fixed ${position}`;
    return container;
  }

  setupAutoDismiss(id, duration, showProgress) {
    if (showProgress) {
      this.animateProgress(id, duration);
    }

    setTimeout(() => {
      this.dismiss(id);
    }, duration);
  }

  animateProgress(id, duration) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    const progressBar = notification.element.querySelector('.notification-progress');
    if (!progressBar) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.max(0, (duration - elapsed) / duration * 100);
      
      progressBar.style.width = `${progress}%`;
      
      if (progress > 0 && this.notifications.has(id)) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  enforceMaxVisible(maxVisible) {
    const visibleNotifications = Array.from(this.notifications.values())
      .sort((a, b) => a.startTime - b.startTime);

    while (visibleNotifications.length >= maxVisible) {
      const oldest = visibleNotifications.shift();
      this.dismiss(oldest.element.id.replace('notification-', ''));
    }
  }

  // Métodos de conveniencia
  success(title, message, options = {}) {
    return this.show('success', title, message, options);
  }

  error(title, message, options = {}) {
    return this.show('error', title, message, { duration: 0, ...options });
  }

  warning(title, message, options = {}) {
    return this.show('warning', title, message, options);
  }

  info(title, message, options = {}) {
    return this.show('info', title, message, options);
  }

  // Cerrar notificación
  dismiss(id) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    notification.element.classList.add('hide');
    
    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.remove();
      }
      this.notifications.delete(id);
    }, 300);
  }

  // Cerrar todas las notificaciones
  dismissAll() {
    this.notifications.forEach((_, id) => {
      this.dismiss(id);
    });
  }

  // Manejar acciones de botones
  handleAction(notificationId, actionId) {
    const notification = this.notifications.get(notificationId);
    if (!notification) return;

    const action = notification.config.actions?.find(a => a.id === actionId);
    if (action && action.handler) {
      action.handler(notificationId);
    }

    // Auto-cerrar después de acción si está configurado
    if (action && action.dismiss !== false) {
      this.dismiss(notificationId);
    }
  }

  // Utilidades
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Configurar posición global
  setPosition(position) {
    this.defaultConfig.position = position;
  }

  // Obtener estadísticas
  getStats() {
    return {
      active: this.notifications.size,
      positions: this.defaultConfig.position
    };
  }
}

// Instancia global
window.notificationSystem = new NotificationSystem();

// Aliases globales para retrocompatibilidad y facilidad de uso
window.showNotification = (type, title, message, options) => 
  notificationSystem.show(type, title, message, options);

window.showSuccess = (title, message, options) => 
  notificationSystem.success(title, message, options);

window.showError = (title, message, options) => 
  notificationSystem.error(title, message, options);

window.showWarning = (title, message, options) => 
  notificationSystem.warning(title, message, options);

window.showInfo = (title, message, options) => 
  notificationSystem.info(title, message, options);