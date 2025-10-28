/**
 * Sistema de Manejo de Errores Profesional - Patagonia Style
 * Error boundaries, retry logic, y feedback profesional al usuario
 */

class ErrorManager {
  constructor() {
    this.errorLog = [];
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.errorHandlers = new Map();
    this.setupGlobalErrorHandling();
    this.initializeErrorTypes();
  }

  initializeErrorTypes() {
    this.errorTypes = {
      NETWORK: 'network',
      VALIDATION: 'validation',
      AUTHENTICATION: 'authentication',
      AUTHORIZATION: 'authorization',
      SERVER: 'server',
      CLIENT: 'client',
      UNKNOWN: 'unknown'
    };

    this.errorMessages = {
      [this.errorTypes.NETWORK]: {
        title: 'Error de Conexión',
        message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        retry: true
      },
      [this.errorTypes.VALIDATION]: {
        title: 'Error de Validación',
        message: 'Los datos ingresados no son válidos. Por favor verifica la información.',
        retry: false
      },
      [this.errorTypes.AUTHENTICATION]: {
        title: 'Error de Autenticación',
        message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
        retry: false,
        action: 'login'
      },
      [this.errorTypes.AUTHORIZATION]: {
        title: 'Sin Autorización',
        message: 'No tienes permisos para realizar esta acción.',
        retry: false
      },
      [this.errorTypes.SERVER]: {
        title: 'Error del Servidor',
        message: 'Ocurrió un error en el servidor. Estamos trabajando para solucionarlo.',
        retry: true
      },
      [this.errorTypes.CLIENT]: {
        title: 'Error de la Aplicación',
        message: 'Ocurrió un error inesperado. Intenta recargar la página.',
        retry: true
      },
      [this.errorTypes.UNKNOWN]: {
        title: 'Error Desconocido',
        message: 'Ocurrió un error inesperado. Si el problema persiste, contacta al soporte.',
        retry: true
      }
    };
  }

  setupGlobalErrorHandling() {
    // Capturar errores JavaScript no manejados
    window.addEventListener('error', (event) => {
      this.handleError({
        type: this.errorTypes.CLIENT,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Capturar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: this.errorTypes.CLIENT,
        message: event.reason?.message || 'Promise rejection',
        stack: event.reason?.stack,
        promise: true
      });
    });
  }

  // Clasificar error por código de estado HTTP
  classifyError(error) {
    if (error.status) {
      if (error.status >= 400 && error.status < 500) {
        if (error.status === 401) return this.errorTypes.AUTHENTICATION;
        if (error.status === 403) return this.errorTypes.AUTHORIZATION;
        if (error.status === 422) return this.errorTypes.VALIDATION;
        return this.errorTypes.CLIENT;
      }
      if (error.status >= 500) return this.errorTypes.SERVER;
    }

    if (error.message) {
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return this.errorTypes.NETWORK;
      }
      if (error.message.includes('validation') || error.message.includes('invalid')) {
        return this.errorTypes.VALIDATION;
      }
    }

    return this.errorTypes.UNKNOWN;
  }

  // Manejar error principal
  async handleError(error, context = {}) {
    const errorType = error.type || this.classifyError(error);
    const errorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: errorType,
      message: error.message || 'Error desconocido',
      context: context,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Registrar error
    this.logError(errorInfo);

    // Verificar si hay un handler específico
    if (this.errorHandlers.has(errorType)) {
      return this.errorHandlers.get(errorType)(errorInfo);
    }

    // Manejo por defecto
    return this.showErrorDialog(errorInfo);
  }

  // Registrar error en log
  logError(errorInfo) {
    this.errorLog.push(errorInfo);
    
    // Mantener solo los últimos 50 errores
    if (this.errorLog.length > 50) {
      this.errorLog.shift();
    }

    // Log en consola para desarrollo
    if (process?.env?.NODE_ENV === 'development') {
      console.error('Error registrado:', errorInfo);
    }

    // Enviar a servicio de logging (implementar según necesidad)
    this.sendToLoggingService(errorInfo);
  }

  // Enviar error a servicio de logging
  async sendToLoggingService(errorInfo) {
    try {
      // Aquí se puede integrar con servicios como Sentry, LogRocket, etc.
      // Por ahora guardamos en localStorage para análisis local
      const logs = JSON.parse(localStorage.getItem('patagonia_error_logs') || '[]');
      logs.push(errorInfo);
      
      // Mantener solo los últimos 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('patagonia_error_logs', JSON.stringify(logs));
    } catch (loggingError) {
      console.warn('No se pudo enviar error al servicio de logging:', loggingError);
    }
  }

  // Mostrar diálogo de error
  showErrorDialog(errorInfo) {
    const errorConfig = this.errorMessages[errorInfo.type] || this.errorMessages[this.errorTypes.UNKNOWN];
    
    return new Promise((resolve) => {
      const modalId = `error-modal-${errorInfo.id}`;
      const modal = document.createElement('div');
      modal.innerHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1" data-bs-backdrop="static">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
              <div class="modal-header bg-danger text-white">
                <h5 class="modal-title">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  ${errorConfig.title}
                </h5>
              </div>
              <div class="modal-body">
                <div class="d-flex align-items-start">
                  <div class="flex-shrink-0">
                    <i class="bi bi-x-circle text-danger" style="font-size: 2rem;"></i>
                  </div>
                  <div class="flex-grow-1 ms-3">
                    <p class="mb-3">${errorConfig.message}</p>
                    ${errorInfo.context?.userMessage ? `<p class="text-muted small">${errorInfo.context.userMessage}</p>` : ''}
                    <div class="error-details collapse" id="error-details-${errorInfo.id}">
                      <hr>
                      <p class="small text-muted mb-1"><strong>ID del Error:</strong> ${errorInfo.id}</p>
                      <p class="small text-muted mb-1"><strong>Timestamp:</strong> ${new Date(errorInfo.timestamp).toLocaleString()}</p>
                      ${errorInfo.message ? `<p class="small text-muted mb-1"><strong>Mensaje técnico:</strong> ${errorInfo.message}</p>` : ''}
                    </div>
                    <button class="btn btn-link btn-sm p-0 text-decoration-none" type="button" 
                            data-bs-toggle="collapse" data-bs-target="#error-details-${errorInfo.id}">
                      <small>Mostrar detalles técnicos</small>
                    </button>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Cerrar
                </button>
                ${errorConfig.retry ? `
                  <button type="button" class="btn btn-warning" onclick="errorManager.retryOperation('${errorInfo.id}')">
                    <i class="bi bi-arrow-clockwise me-1"></i>
                    Reintentar
                  </button>
                ` : ''}
                ${errorConfig.action === 'login' ? `
                  <button type="button" class="btn btn-primary" onclick="errorManager.redirectToLogin()">
                    <i class="bi bi-person me-1"></i>
                    Iniciar Sesión
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      
      const modalElement = modal.querySelector('.modal');
      const bsModal = new bootstrap.Modal(modalElement);
      
      modalElement.addEventListener('hidden.bs.modal', () => {
        modal.remove();
        resolve(false); // No retry
      });

      bsModal.show();
    });
  }

  // Wrapper para operaciones con retry automático
  async withRetry(operation, options = {}) {
    const {
      maxRetries = this.maxRetries,
      retryDelay = this.retryDelay,
      retryCondition = (error) => this.shouldRetry(error),
      onRetry = (attempt, error) => {},
      context = {}
    } = options;

    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt <= maxRetries && retryCondition(error)) {
          onRetry(attempt, error);
          await this.delay(retryDelay * attempt); // Exponential backoff
          continue;
        }
        
        break;
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    throw await this.handleError(lastError, { ...context, attempts: maxRetries + 1 });
  }

  // Verificar si se debe reintentar
  shouldRetry(error) {
    const errorType = this.classifyError(error);
    return [this.errorTypes.NETWORK, this.errorTypes.SERVER].includes(errorType);
  }

  // Wrapper para fetch con manejo de errores
  async safeFetch(url, options = {}) {
    return this.withRetry(async () => {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = {
          status: response.status,
          statusText: response.statusText,
          url: url
        };

        try {
          const responseText = await response.text();
          if (responseText) {
            errorData.response = responseText;
          }
        } catch (e) {
          // Ignore parse errors
        }

        throw errorData;
      }

      return response;
    }, {
      context: { url, method: options.method || 'GET' }
    });
  }

  // Utilidades
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateErrorId() {
    return 'err_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Registrar handler personalizado
  registerErrorHandler(errorType, handler) {
    this.errorHandlers.set(errorType, handler);
  }

  // Limpiar logs antiguos
  clearOldLogs(daysToKeep = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    this.errorLog = this.errorLog.filter(error => 
      new Date(error.timestamp) > cutoffDate
    );
  }

  // Obtener estadísticas de errores
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      recent: this.errorLog.filter(error => 
        (Date.now() - new Date(error.timestamp).getTime()) < 24 * 60 * 60 * 1000
      ).length
    };

    this.errorLog.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    });

    return stats;
  }

  // Exportar logs para análisis
  exportErrorLogs() {
    const logs = {
      exported: new Date().toISOString(),
      errors: this.errorLog,
      stats: this.getErrorStats()
    };

    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `patagonia-error-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Métodos para integración con UI existente
  retryOperation(errorId) {
    // Implementar lógica de retry específica
    window.location.reload();
  }

  redirectToLogin() {
    // Redirigir a login
    if (typeof users !== 'undefined' && users.showLoginModal) {
      users.showLoginModal();
    } else {
      window.location.href = 'index.html';
    }
  }
}

// Instancia global
window.errorManager = new ErrorManager();

// Utilidades globales
window.handleError = (error, context) => errorManager.handleError(error, context);
window.safeFetch = (url, options) => errorManager.safeFetch(url, options);
window.withRetry = (operation, options) => errorManager.withRetry(operation, options);