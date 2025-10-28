/**
 * Sistema de Optimización de Rendimiento - Patagonia Style
 * Lazy loading, debounce, cache, y optimizaciones de rendering
 */

class PerformanceOptimizer {
  constructor() {
    this.cache = new Map();
    this.observers = new Map();
    this.debounceTimers = new Map();
    this.throttleTimers = new Map();
    this.lazyImages = new Set();
    this.resourcePreloader = new Map();
    
    this.initializeIntersectionObserver();
    this.initializePerformanceMonitoring();
    this.setupGlobalOptimizations();
  }

  /**
   * LAZY LOADING SYSTEM
   */
  initializeIntersectionObserver() {
    // Verificar soporte para IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver no soportado, usando fallback');
      this.setupLegacyLazyLoading();
      return;
    }

    // Observer para imágenes lazy
    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadLazyImage(entry.target);
          this.imageObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    // Observer para contenido lazy
    this.contentObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadLazyContent(entry.target);
          this.contentObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '100px 0px',
      threshold: 0.1
    });
  }

  // Configurar lazy loading para imágenes
  setupLazyImages(selector = 'img[data-src]') {
    const images = document.querySelectorAll(selector);
    images.forEach(img => {
      this.lazyImages.add(img);
      this.imageObserver.observe(img);
      
      // Placeholder mientras carga
      if (!img.src) {
        img.src = this.generatePlaceholder(img);
      }
    });
  }

  loadLazyImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    // Preload de la imagen
    const imageLoader = new Image();
    imageLoader.onload = () => {
      img.src = src;
      img.classList.add('lazy-loaded');
      img.removeAttribute('data-src');
      this.lazyImages.delete(img);
    };
    
    imageLoader.onerror = () => {
      img.classList.add('lazy-error');
      img.alt = 'Error al cargar imagen';
    };
    
    imageLoader.src = src;
  }

  generatePlaceholder(img) {
    const width = img.getAttribute('width') || 300;
    const height = img.getAttribute('height') || 200;
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6c757d" font-family="system-ui">
          Cargando...
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  // Lazy loading para contenido dinámico
  setupLazyContent(selector = '[data-lazy-content]') {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      this.contentObserver.observe(el);
    });
  }

  loadLazyContent(element) {
    const loader = element.dataset.lazyContent;
    if (!loader) return;

    try {
      // Ejecutar función de carga
      if (typeof window[loader] === 'function') {
        window[loader](element);
      }
      element.removeAttribute('data-lazy-content');
    } catch (error) {
      console.error('Error loading lazy content:', error);
    }
  }

  // Fallback para navegadores sin IntersectionObserver
  setupLegacyLazyLoading() {
    const checkLazyImages = () => {
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        const rect = img.getBoundingClientRect();
        if (rect.top < window.innerHeight + 50) {
          this.loadLazyImage(img);
        }
      });
    };

    // Cargar imágenes en scroll
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkLazyImages();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    
    // Carga inicial
    checkLazyImages();
  }

  /**
   * DEBOUNCE Y THROTTLE SYSTEM
   */
  debounce(func, delay, key = 'default') {
    return (...args) => {
      clearTimeout(this.debounceTimers.get(key));
      this.debounceTimers.set(key, setTimeout(() => {
        func.apply(this, args);
        this.debounceTimers.delete(key);
      }, delay));
    };
  }

  throttle(func, delay, key = 'default') {
    return (...args) => {
      if (!this.throttleTimers.has(key)) {
        this.throttleTimers.set(key, true);
        func.apply(this, args);
        setTimeout(() => {
          this.throttleTimers.delete(key);
        }, delay);
      }
    };
  }

  // Optimización de scroll
  optimizeScrollHandlers() {
    const scrollElements = document.querySelectorAll('[data-scroll-optimize]');
    
    const throttledScrollHandler = this.throttle((e) => {
      scrollElements.forEach(el => {
        const handler = el.dataset.scrollOptimize;
        if (typeof window[handler] === 'function') {
          window[handler](e, el);
        }
      });
    }, 16, 'scroll'); // ~60fps

    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
  }

  /**
   * CACHE SYSTEM
   */
  setCache(key, data, ttl = 300000) { // 5 minutos por defecto
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clearCache(pattern = null) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Cache para requests API
  async cachedFetch(url, options = {}, cacheKey = null, ttl = 300000) {
    const key = cacheKey || `fetch_${url}_${JSON.stringify(options)}`;
    
    // Verificar cache
    const cached = this.getCache(key);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (response.ok) {
        this.setCache(key, data, ttl);
      }
      
      return data;
    } catch (error) {
      console.error('Cached fetch error:', error);
      throw error;
    }
  }

  /**
   * RESOURCE PRELOADING
   */
  preloadResource(url, type = 'fetch', priority = 'low') {
    const key = `${type}_${url}`;
    
    if (this.resourcePreloader.has(key)) {
      return this.resourcePreloader.get(key);
    }

    let preloadPromise;

    switch (type) {
      case 'image':
        preloadPromise = this.preloadImage(url);
        break;
      case 'style':
        preloadPromise = this.preloadStylesheet(url);
        break;
      case 'script':
        preloadPromise = this.preloadScript(url);
        break;
      case 'fetch':
      default:
        preloadPromise = this.preloadFetch(url);
        break;
    }

    this.resourcePreloader.set(key, preloadPromise);
    return preloadPromise;
  }

  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  preloadStylesheet(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  preloadScript(src) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  preloadFetch(url) {
    return fetch(url, { 
      method: 'GET',
      priority: 'low'
    }).then(response => response.blob());
  }

  /**
   * RENDERING OPTIMIZATIONS
   */
  batchDOMUpdates(updates) {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        updates.forEach(update => update());
        resolve();
      });
    });
  }

  // Virtual scrolling para listas grandes
  setupVirtualScrolling(container, itemHeight, renderItem, totalItems) {
    const containerHeight = container.clientHeight;
    const visibleItems = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
    let scrollTop = 0;
    let startIndex = 0;

    const virtualList = document.createElement('div');
    virtualList.style.height = `${totalItems * itemHeight}px`;
    virtualList.style.position = 'relative';

    const viewport = document.createElement('div');
    viewport.style.position = 'absolute';
    viewport.style.top = '0';
    viewport.style.left = '0';
    viewport.style.right = '0';

    virtualList.appendChild(viewport);
    container.appendChild(virtualList);

    const updateVisibleItems = this.throttle(() => {
      scrollTop = container.scrollTop;
      startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleItems, totalItems);

      viewport.style.transform = `translateY(${startIndex * itemHeight}px)`;
      viewport.innerHTML = '';

      for (let i = startIndex; i < endIndex; i++) {
        const item = renderItem(i);
        viewport.appendChild(item);
      }
    }, 16, 'virtual-scroll');

    container.addEventListener('scroll', updateVisibleItems, { passive: true });
    updateVisibleItems(); // Render inicial
  }

  /**
   * PERFORMANCE MONITORING
   */
  initializePerformanceMonitoring() {
    this.performanceMetrics = {
      pageLoad: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0
    };

    // Medir tiempos de carga
    window.addEventListener('load', () => {
      this.measurePerformanceMetrics();
    });

    // Observar Web Vitals
    this.observeWebVitals();
  }

  measurePerformanceMetrics() {
    if ('performance' in window) {
      const perfData = performance.getEntriesByType('navigation')[0];
      
      this.performanceMetrics.pageLoad = perfData.loadEventEnd - perfData.fetchStart;
      
      // Paint metrics
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          this.performanceMetrics.firstPaint = entry.startTime;
        }
        if (entry.name === 'first-contentful-paint') {
          this.performanceMetrics.firstContentfulPaint = entry.startTime;
        }
      });
    }
  }

  observeWebVitals() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.performanceMetrics.largestContentfulPaint = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.performanceMetrics.cumulativeLayoutShift = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  getPerformanceReport() {
    return {
      ...this.performanceMetrics,
      cacheSize: this.cache.size,
      lazyImagesLoaded: this.lazyImages.size,
      preloadedResources: this.resourcePreloader.size,
      timestamp: Date.now()
    };
  }

  /**
   * GLOBAL OPTIMIZATIONS
   */
  setupGlobalOptimizations() {
    // Optimizar formularios
    this.optimizeForms();
    
    // Optimizar scroll
    this.optimizeScrollHandlers();
    
    // Preload recursos críticos
    this.preloadCriticalResources();
    
    // Lazy load inicial
    this.setupLazyImages();
    this.setupLazyContent();
  }

  optimizeForms() {
    const forms = document.querySelectorAll('form[data-optimize]');
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        // Debounce para validación en tiempo real
        const originalHandler = input.oninput;
        input.oninput = this.debounce((e) => {
          if (originalHandler) originalHandler(e);
        }, 300, `form_${form.id || 'default'}_${input.name}`);
      });
    });
  }

  preloadCriticalResources() {
    // Preload imágenes hero
    const heroImages = document.querySelectorAll('[data-preload="hero"]');
    heroImages.forEach(img => {
      if (img.dataset.src) {
        this.preloadResource(img.dataset.src, 'image');
      }
    });

    // Preload datos críticos
    const criticalData = document.querySelectorAll('[data-preload="data"]');
    criticalData.forEach(el => {
      if (el.dataset.url) {
        this.preloadResource(el.dataset.url, 'fetch');
      }
    });
  }

  // Método para limpiar recursos cuando se cambia de página
  cleanup() {
    this.imageObserver?.disconnect();
    this.contentObserver?.disconnect();
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.throttleTimers.clear();
    this.debounceTimers.clear();
  }
}

// Instancia global
window.performanceOptimizer = new PerformanceOptimizer();

// Cleanup al cambiar de página
window.addEventListener('beforeunload', () => {
  performanceOptimizer.cleanup();
});

// Aliases globales
window.debounce = (func, delay, key) => performanceOptimizer.debounce(func, delay, key);
window.throttle = (func, delay, key) => performanceOptimizer.throttle(func, delay, key);
window.preloadResource = (url, type, priority) => performanceOptimizer.preloadResource(url, type, priority);
window.cachedFetch = (url, options, cacheKey, ttl) => performanceOptimizer.cachedFetch(url, options, cacheKey, ttl);
window.generatePlaceholder = (img) => performanceOptimizer.generatePlaceholder(img);