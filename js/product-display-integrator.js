/**
 * 🔧 INTEGRADOR DE COMPONENTES DE PRODUCTO
 * Sistema completo que combina ProductCardManager y ProductLoader con estilos avanzados
 */

class ProductDisplayIntegrator {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            itemsPerPage: 12,
            enableVirtualScrolling: false,
            enableLazyLoading: true,
            animationDelay: 50,
            cacheSize: 100,
            ...options
        };

        this.productCardManager = null;
        this.productLoader = null;
        this.isInitialized = false;

        this.init();
    }

    /**
     * 🚀 Inicializa todos los componentes
     */
    async init() {
        try {
            console.log('🔧 Inicializando sistema de productos...');
            
            // Verificar dependencias
            this.checkDependencies();
            
            // Crear estructura HTML base
            this.createBaseStructure();
            
            // Inicializar componentes
            await this.initializeComponents();
            
            // Configurar estilos dinámicos
            this.setupDynamicStyles();
            
            this.isInitialized = true;
            console.log('✅ Sistema de productos inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar sistema de productos:', error);
        }
    }

    /**
     * 📋 Verifica que las dependencias estén disponibles
     */
    checkDependencies() {
        if (!window.ProductCardManager) {
            throw new Error('ProductCardManager no está disponible');
        }
        
        if (!window.ProductLoader) {
            throw new Error('ProductLoader no está disponible');
        }

        if (!this.container) {
            throw new Error('Container no encontrado');
        }
    }

    /**
     * 🏗️ Crea la estructura HTML base necesaria
     */
    createBaseStructure() {
        this.container.innerHTML = `
            <div class="product-display-system">
                <!-- Header con controles -->
                <div class="product-display-header">
                    <div class="display-controls">
                        <div class="view-toggle">
                            <button class="btn-view-toggle" data-view="grid" title="Vista de cuadrícula">
                                <i class="fas fa-th"></i>
                            </button>
                            <button class="btn-view-toggle" data-view="list" title="Vista de lista">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                        
                        <div class="sort-controls">
                            <select id="sort-selector" class="form-select">
                                <option value="name-asc">Nombre A-Z</option>
                                <option value="name-desc">Nombre Z-A</option>
                                <option value="price-asc">Precio: Menor a Mayor</option>
                                <option value="price-desc">Precio: Mayor a Menor</option>
                                <option value="rating-desc">Mejor Valorados</option>
                                <option value="newest">Más Recientes</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="results-summary">
                        <span id="results-count">0 productos</span>
                    </div>
                </div>

                <!-- Loading indicator -->
                <div id="loading-indicator">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p class="loading-text">Cargando productos...</p>
                    </div>
                </div>

                <!-- Contenedor de productos -->
                <div id="products-grid" class="products-grid"></div>

                <!-- Paginación -->
                <div id="pagination-container" class="product-pagination"></div>
            </div>
        `;

        // Agregar clases CSS dinámicamente
        this.container.classList.add('product-display-integrated');
    }

    /**
     * ⚡ Inicializa los componentes principales
     */
    async initializeComponents() {
        // Inicializar ProductCardManager
        this.productCardManager = new ProductCardManager('products-grid', {
            enableLazyLoading: this.options.enableLazyLoading,
            animationDelay: this.options.animationDelay,
            batchSize: 6,
            enableAnimations: true
        });

        // Inicializar ProductLoader
        this.productLoader = new ProductLoader('products-grid', {
            itemsPerPage: this.options.itemsPerPage,
            enableVirtualScrolling: this.options.enableVirtualScrolling,
            cacheSize: this.options.cacheSize,
            paginationContainer: 'pagination-container',
            loadingIndicator: 'loading-indicator'
        });

        // Configurar event listeners
        this.setupEventListeners();
    }

    /**
     * 🎯 Configura los event listeners
     */
    setupEventListeners() {
        // Toggle de vista
        const viewToggles = this.container.querySelectorAll('.btn-view-toggle');
        viewToggles.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleViewToggle(e.target.dataset.view);
            });
        });

        // Selector de ordenamiento
        const sortSelector = this.container.querySelector('#sort-selector');
        sortSelector.addEventListener('change', (e) => {
            this.handleSortChange(e.target.value);
        });

        // Eventos del productLoader
        this.productLoader.on('dataLoaded', (data) => {
            this.updateResultsCount(data.total);
        });

        this.productLoader.on('pageChanged', (pageInfo) => {
            this.scrollToTop();
        });
    }

    /**
     * 🎨 Configura estilos dinámicos adicionales
     */
    setupDynamicStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .product-display-system {
                max-width: 1400px;
                margin: 0 auto;
                padding: 2rem 1rem;
            }
            
            .product-display-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                padding: 1.5rem;
                background: white;
                border-radius: 1rem;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .display-controls {
                display: flex;
                align-items: center;
                gap: 2rem;
            }
            
            .view-toggle {
                display: flex;
                background: #f8f9fa;
                border-radius: 0.5rem;
                overflow: hidden;
            }
            
            .btn-view-toggle {
                background: transparent;
                border: none;
                padding: 0.75rem 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                color: #666;
            }
            
            .btn-view-toggle.active {
                background: var(--product-primary);
                color: white;
            }
            
            .form-select {
                padding: 0.75rem 1rem;
                border: 2px solid #e9ecef;
                border-radius: 0.5rem;
                background: white;
                min-width: 200px;
            }
            
            .results-summary {
                color: #666;
                font-weight: 500;
            }
            
            .products-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
            }
            
            .products-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .products-list .product-card {
                display: grid;
                grid-template-columns: 200px 1fr auto;
                gap: 1.5rem;
                padding: 1.5rem;
            }
            
            .products-list .product-image-container {
                height: 150px;
                width: 200px;
                border-radius: 0.75rem;
                overflow: hidden;
            }
            
            @media (max-width: 768px) {
                .product-display-header {
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .display-controls {
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .products-grid {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
                
                .products-list .product-card {
                    grid-template-columns: 1fr;
                    text-align: center;
                }
            }
        `;

        document.head.appendChild(styleSheet);
    }

    /**
     * 👁️ Maneja el cambio de vista (grid/list)
     */
    handleViewToggle(view) {
        const grid = this.container.querySelector('#products-grid');
        const buttons = this.container.querySelectorAll('.btn-view-toggle');
        
        // Actualizar estado de botones
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Cambiar clase del grid
        if (view === 'list') {
            grid.className = 'products-list';
        } else {
            grid.className = 'products-grid';
        }

        // Trigger resize event para recálculos
        window.dispatchEvent(new Event('resize'));
    }

    /**
     * 📊 Maneja el cambio de ordenamiento
     */
    async handleSortChange(sortValue) {
        const [field, direction] = sortValue.split('-');
        
        try {
            await this.productLoader.setSortOrder(field, direction);
            await this.productLoader.loadPage(1);
        } catch (error) {
            console.error('Error al cambiar ordenamiento:', error);
        }
    }

    /**
     * 📈 Actualiza el contador de resultados
     */
    updateResultsCount(total) {
        const counter = this.container.querySelector('#results-count');
        if (counter) {
            counter.textContent = `${total} producto${total !== 1 ? 's' : ''}`;
        }
    }

    /**
     * ⬆️ Scroll suave hacia arriba
     */
    scrollToTop() {
        this.container.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    /**
     * 📝 API pública para cargar productos
     */
    async loadProducts(products, options = {}) {
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            await this.productLoader.loadData(products, options);
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

    /**
     * 🔍 API para filtrar productos
     */
    async filterProducts(filterFn) {
        try {
            await this.productLoader.setFilter(filterFn);
            await this.productLoader.loadPage(1);
        } catch (error) {
            console.error('Error al filtrar productos:', error);
        }
    }

    /**
     * 🎯 API para buscar productos
     */
    async searchProducts(searchTerm) {
        try {
            const searchFilter = (product) => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    product.nombre?.toLowerCase().includes(searchLower) ||
                    product.descripcion?.toLowerCase().includes(searchLower) ||
                    product.categoria?.toLowerCase().includes(searchLower)
                );
            };

            await this.filterProducts(searchFilter);
        } catch (error) {
            console.error('Error en búsqueda:', error);
        }
    }

    /**
     * 🧹 Limpia recursos
     */
    destroy() {
        if (this.productCardManager) {
            this.productCardManager.destroy();
        }
        
        if (this.productLoader) {
            this.productLoader.destroy();
        }

        this.isInitialized = false;
    }
}

// Hacer disponible globalmente
window.ProductDisplayIntegrator = ProductDisplayIntegrator;

// Auto-inicialización si existe el contenedor
document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.getElementById('productos-container');
    if (productContainer && !window.productDisplaySystem) {
        window.productDisplaySystem = new ProductDisplayIntegrator('productos-container', {
            itemsPerPage: 12,
            enableLazyLoading: true,
            animationDelay: 50
        });
    }
});

/**
 * 🌟 FUNCIÓN DE DEMOSTRACIÓN
 * Ejemplo de cómo usar el sistema completo
 */
async function demoProductDisplay() {
    // Datos de ejemplo
    const sampleProducts = [
        {
            id: 1,
            nombre: "Cuaderno Artesanal Premium",
            descripcion: "Cuaderno hecho a mano con papel reciclado y tapa de cuero ecológico",
            precio: 25.99,
            precioOriginal: 35.99,
            categoria: "Papelería",
            imagen: "images/cuaderno1.jpg",
            stock: 15,
            descuento: 30,
            rating: 4.8,
            reviews: 24,
            caracteristicas: ["Ecológico", "Hecho a mano", "100 hojas"]
        },
        {
            id: 2,
            nombre: "Jarro Térmico de Cerámica",
            descripcion: "Jarro térmico de cerámica artesanal con diseño único",
            precio: 18.50,
            categoria: "Hogar",
            imagen: "images/jarro1.jpg",
            stock: 8,
            rating: 4.5,
            reviews: 12,
            caracteristicas: ["Térmico", "Cerámica", "350ml"]
        }
        // Agregar más productos según sea necesario
    ];

    // Inicializar sistema
    const system = new ProductDisplayIntegrator('demo-container', {
        itemsPerPage: 8,
        enableLazyLoading: true
    });

    // Cargar productos
    await system.loadProducts(sampleProducts);

    return system;
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductDisplayIntegrator;
}