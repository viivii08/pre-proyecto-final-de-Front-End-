/**
 * 🔄 DESCRIPTION TOGGLE SYSTEM
 * Sistema avanzado para alternar descripciones de productos
 * Versión: 2.0
 * Características: Animaciones suaves, Estados persistentes, Accesibilidad
 */

class DescriptionToggleManager {
    constructor() {
        this.toggleStates = new Map(); // Estado de cada toggle
        this.animationDuration = 300; // Duración de animaciones
        this.storage = window.localStorage;
        this.storageKey = 'description-toggles-state';
        
        this.init();
    }

    /**
     * 🚀 Inicializar el sistema de toggles
     */
    init() {
        this.loadSavedStates();
        this.setupAnimationStyles();
        this.bindEvents();
        console.log('🔄 DescriptionToggleManager inicializado');
    }

    /**
     * 💾 Cargar estados guardados desde localStorage
     */
    loadSavedStates() {
        try {
            const saved = this.storage.getItem(this.storageKey);
            if (saved) {
                const states = JSON.parse(saved);
                this.toggleStates = new Map(Object.entries(states));
                console.log('📂 Estados cargados:', this.toggleStates.size);
            }
        } catch (error) {
            console.warn('⚠️ Error cargando estados:', error);
            this.toggleStates.clear();
        }
    }

    /**
     * 💾 Guardar estados en localStorage
     */
    saveStates() {
        try {
            const statesObj = Object.fromEntries(this.toggleStates);
            this.storage.setItem(this.storageKey, JSON.stringify(statesObj));
        } catch (error) {
            console.warn('⚠️ Error guardando estados:', error);
        }
    }

    /**
     * 🎨 Configurar estilos CSS para animaciones
     */
    setupAnimationStyles() {
        if (document.getElementById('toggle-animations-style')) return;

        const style = document.createElement('style');
        style.id = 'toggle-animations-style';
        style.textContent = `
            /* 🔄 Estilos para Toggle de Descripciones */
            .description-content {
                overflow: hidden;
                transition: all ${this.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
                transform-origin: top;
            }

            .description-content.collapsed {
                max-height: 0;
                opacity: 0;
                transform: scaleY(0);
                margin: 0;
                padding: 0;
            }

            .description-content.expanded {
                max-height: 500px;
                opacity: 1;
                transform: scaleY(1);
                margin: 0.75rem 0;
                padding: 0.5rem 0;
            }

            .description-content.animating {
                pointer-events: none;
            }

            /* Toggle Button Styles */
            .btn-toggle-description {
                position: relative;
                transition: all 0.2s ease;
            }

            .btn-toggle-description:hover {
                color: var(--accent-color, #f4a259);
                transform: translateY(-1px);
            }

            .btn-toggle-description .toggle-icon {
                transition: transform 0.3s ease;
                display: inline-block;
                margin-left: 0.25rem;
            }

            .btn-toggle-description.expanded .toggle-icon {
                transform: rotate(180deg);
            }

            /* Loading state */
            .btn-toggle-description.loading {
                pointer-events: none;
                opacity: 0.6;
            }

            .btn-toggle-description.loading::after {
                content: '';
                position: absolute;
                right: -20px;
                top: 50%;
                width: 12px;
                height: 12px;
                border: 2px solid currentColor;
                border-top: 2px solid transparent;
                border-radius: 50%;
                transform: translateY(-50%);
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: translateY(-50%) rotate(360deg); }
            }

            /* Fade effects */
            .description-fade-enter {
                animation: fadeInUp 0.3s ease-out;
            }

            .description-fade-exit {
                animation: fadeOutDown 0.3s ease-out;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes fadeOutDown {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(-10px);
                }
            }

            /* Accessibility */
            @media (prefers-reduced-motion: reduce) {
                .description-content,
                .btn-toggle-description,
                .toggle-icon {
                    transition: none !important;
                    animation: none !important;
                }
            }

            /* High contrast mode */
            @media (prefers-contrast: high) {
                .btn-toggle-description {
                    border: 1px solid currentColor;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                }
            }
        `;
        
        document.head.appendChild(style);
        console.log('🎨 Estilos de animación añadidos');
    }

    /**
     * 🔗 Configurar event listeners
     */
    bindEvents() {
        // Event delegation para botones de toggle
        document.addEventListener('click', (e) => {
            const toggleBtn = e.target.closest('.btn-toggle-description');
            if (toggleBtn) {
                e.preventDefault();
                e.stopPropagation();
                this.handleToggleClick(toggleBtn);
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            const toggleBtn = e.target.closest('.btn-toggle-description');
            if (toggleBtn && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                this.handleToggleClick(toggleBtn);
            }
        });

        // Guardar estados cuando la página se cierra
        window.addEventListener('beforeunload', () => {
            this.saveStates();
        });

        // Auto-save cada 5 segundos
        setInterval(() => {
            this.saveStates();
        }, 5000);

        console.log('🔗 Event listeners configurados');
    }

    /**
     * 🎯 Manejar click en botón de toggle
     */
    async handleToggleClick(button) {
        const productId = this.getProductId(button);
        const descriptionContainer = this.getDescriptionContainer(button);
        
        if (!productId || !descriptionContainer) {
            console.warn('⚠️ No se pudo encontrar el contenedor de descripción');
            return;
        }

        // Prevenir múltiples clicks durante animación
        if (button.classList.contains('loading')) return;

        const isExpanded = this.toggleStates.get(productId) || false;
        const newState = !isExpanded;

        // Actualizar estado visual del botón
        this.updateButtonState(button, newState, true);

        try {
            // Realizar la animación
            await this.animateToggle(descriptionContainer, newState);
            
            // Actualizar estado interno
            this.toggleStates.set(productId, newState);
            
            // Actualizar ARIA attributes
            this.updateAccessibility(button, descriptionContainer, newState);
            
            // Disparar evento personalizado
            this.dispatchToggleEvent(button, productId, newState);
            
            console.log(`🔄 Toggle ${newState ? 'expandido' : 'colapsado'} para producto ${productId}`);
            
        } catch (error) {
            console.error('❌ Error en animación de toggle:', error);
            // Revertir estado del botón en caso de error
            this.updateButtonState(button, isExpanded, false);
        }
    }

    /**
     * 🆔 Obtener ID del producto desde el botón
     */
    getProductId(button) {
        const card = button.closest('.product-card-container, .product-card');
        return card?.dataset?.productId || 
               card?.id?.replace('product-', '') ||
               button.dataset?.productId ||
               `auto-${Date.now()}`;
    }

    /**
     * 📦 Encontrar el contenedor de descripción
     */
    getDescriptionContainer(button) {
        // Buscar el contenedor de descripción más cercano
        return button.closest('.card-content')?.querySelector('.long-description') ||
               button.parentNode?.querySelector('.description-content') ||
               button.nextElementSibling;
    }

    /**
     * 🎨 Actualizar estado visual del botón
     */
    updateButtonState(button, isExpanded, isLoading = false) {
        // Estado de carga
        button.classList.toggle('loading', isLoading);
        
        // Estado expandido/colapsado
        button.classList.toggle('expanded', isExpanded);
        
        // Actualizar texto del botón
        const textElement = button.querySelector('.toggle-text') || button;
        const currentText = textElement.textContent.trim();
        
        if (isExpanded) {
            textElement.textContent = currentText.includes('más') ? 
                currentText.replace('más', 'menos') : 
                'Ver menos';
        } else {
            textElement.textContent = currentText.includes('menos') ? 
                currentText.replace('menos', 'más') : 
                'Ver más';
        }

        // Actualizar ícono si existe
        const icon = button.querySelector('.toggle-icon');
        if (icon) {
            icon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }

    /**
     * 🎭 Animar el toggle con promesas
     */
    async animateToggle(container, shouldExpand) {
        return new Promise((resolve, reject) => {
            if (!container) {
                reject(new Error('Container no encontrado'));
                return;
            }

            // Marcar como en animación
            container.classList.add('animating');
            
            // Aplicar clase de animación de entrada/salida
            container.classList.add(shouldExpand ? 'description-fade-enter' : 'description-fade-exit');

            // Función para limpiar después de la animación
            const cleanup = () => {
                container.classList.remove('animating', 'description-fade-enter', 'description-fade-exit');
                
                // Aplicar estado final
                container.classList.toggle('collapsed', !shouldExpand);
                container.classList.toggle('expanded', shouldExpand);
                
                resolve();
            };

            if (shouldExpand) {
                // Expandir: mostrar primero, luego animar
                container.style.display = 'block';
                container.classList.remove('collapsed');
                
                // Forzar reflow para que las clases CSS tomen efecto
                container.offsetHeight;
                
                container.classList.add('expanded');
                
                setTimeout(cleanup, this.animationDuration);
            } else {
                // Colapsar: animar primero, luego ocultar
                container.classList.remove('expanded');
                container.classList.add('collapsed');
                
                setTimeout(() => {
                    container.style.display = 'none';
                    cleanup();
                }, this.animationDuration);
            }
        });
    }

    /**
     * ♿ Actualizar atributos de accesibilidad
     */
    updateAccessibility(button, container, isExpanded) {
        // Actualizar ARIA attributes
        button.setAttribute('aria-expanded', isExpanded.toString());
        
        if (container.id) {
            button.setAttribute('aria-controls', container.id);
        }
        
        // Añadir ID único si no existe
        if (!container.id) {
            container.id = `description-${this.getProductId(button)}`;
            button.setAttribute('aria-controls', container.id);
        }

        // Actualizar texto para screen readers
        const srText = button.querySelector('.sr-only');
        if (srText) {
            srText.textContent = isExpanded ? 
                'Ocultar descripción completa' : 
                'Mostrar descripción completa';
        }
    }

    /**
     * 📡 Disparar evento personalizado
     */
    dispatchToggleEvent(button, productId, isExpanded) {
        const event = new CustomEvent('descriptionToggle', {
            detail: {
                productId,
                isExpanded,
                button,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            cancelable: true
        });
        
        button.dispatchEvent(event);
    }

    /**
     * 🏭 Crear estructura HTML para toggle
     */
    createToggleStructure(productId, shortText, longText, options = {}) {
        const {
            showShortFirst = true,
            buttonText = 'Ver más',
            buttonClass = 'btn-toggle-description',
            containerClass = 'card-description'
        } = options;

        const structure = {
            container: this.createElement('div', {
                className: containerClass,
                dataset: { productId }
            }),
            
            shortDescription: this.createElement('p', {
                className: 'short-description',
                textContent: shortText
            }),
            
            longDescription: this.createElement('div', {
                className: 'long-description description-content collapsed',
                id: `description-${productId}`,
                innerHTML: longText,
                style: { display: 'none' }
            }),
            
            toggleButton: this.createElement('button', {
                className: buttonClass,
                type: 'button',
                setAttribute: {
                    'aria-expanded': 'false',
                    'aria-controls': `description-${productId}`
                },
                innerHTML: `
                    <span class="toggle-text">${buttonText}</span>
                    <span class="toggle-icon">▼</span>
                    <span class="sr-only">Mostrar descripción completa</span>
                `
            })
        };

        // Ensamblar estructura
        if (showShortFirst) {
            structure.container.appendChild(structure.shortDescription);
        }
        
        structure.container.appendChild(structure.longDescription);
        structure.container.appendChild(structure.toggleButton);

        return structure;
    }

    /**
     * 🔧 Utility para crear elementos DOM
     */
    createElement(tag, properties = {}) {
        const element = document.createElement(tag);
        
        Object.entries(properties).forEach(([key, value]) => {
            if (key === 'dataset' && typeof value === 'object') {
                Object.assign(element.dataset, value);
            } else if (key === 'setAttribute' && typeof value === 'object') {
                Object.entries(value).forEach(([attr, val]) => {
                    element.setAttribute(attr, val);
                });
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element[key] = value;
            }
        });
        
        return element;
    }

    /**
     * 🎯 Expandir descripción específica
     */
    async expandDescription(productId) {
        const button = document.querySelector(`[data-product-id="${productId}"] .btn-toggle-description`);
        if (button && !this.toggleStates.get(productId)) {
            await this.handleToggleClick(button);
        }
    }

    /**
     * 🎯 Colapsar descripción específica
     */
    async collapseDescription(productId) {
        const button = document.querySelector(`[data-product-id="${productId}"] .btn-toggle-description`);
        if (button && this.toggleStates.get(productId)) {
            await this.handleToggleClick(button);
        }
    }

    /**
     * 🔄 Alternar descripción específica
     */
    async toggleDescription(productId) {
        const button = document.querySelector(`[data-product-id="${productId}"] .btn-toggle-description`);
        if (button) {
            await this.handleToggleClick(button);
        }
    }

    /**
     * 📊 Obtener estadísticas de uso
     */
    getUsageStats() {
        const total = this.toggleStates.size;
        const expanded = Array.from(this.toggleStates.values()).filter(Boolean).length;
        
        return {
            total,
            expanded,
            collapsed: total - expanded,
            expandedPercentage: total > 0 ? (expanded / total * 100).toFixed(1) : 0
        };
    }

    /**
     * 🧹 Limpiar estados obsoletos
     */
    cleanup() {
        const existingProducts = new Set();
        
        // Recolectar IDs de productos existentes
        document.querySelectorAll('[data-product-id]').forEach(el => {
            existingProducts.add(el.dataset.productId);
        });

        // Remover estados de productos que ya no existen
        for (const [productId] of this.toggleStates) {
            if (!existingProducts.has(productId)) {
                this.toggleStates.delete(productId);
            }
        }

        this.saveStates();
        console.log('🧹 Estados limpiados, activos:', this.toggleStates.size);
    }

    /**
     * 🔄 Restaurar estados guardados en elementos existentes
     */
    restoreStates() {
        for (const [productId, isExpanded] of this.toggleStates) {
            const button = document.querySelector(`[data-product-id="${productId}"] .btn-toggle-description`);
            const container = button ? this.getDescriptionContainer(button) : null;
            
            if (button && container) {
                // Aplicar estado sin animación
                this.updateButtonState(button, isExpanded, false);
                
                container.classList.toggle('collapsed', !isExpanded);
                container.classList.toggle('expanded', isExpanded);
                container.style.display = isExpanded ? 'block' : 'none';
                
                this.updateAccessibility(button, container, isExpanded);
            }
        }
        
        console.log('🔄 Estados restaurados para', this.toggleStates.size, 'productos');
    }

    /**
     * 📤 Exportar configuración
     */
    exportConfig() {
        return {
            states: Object.fromEntries(this.toggleStates),
            animationDuration: this.animationDuration,
            timestamp: new Date().toISOString(),
            stats: this.getUsageStats()
        };
    }

    /**
     * 📥 Importar configuración
     */
    importConfig(config) {
        if (config.states) {
            this.toggleStates = new Map(Object.entries(config.states));
            this.saveStates();
        }
        
        if (config.animationDuration) {
            this.animationDuration = config.animationDuration;
        }
        
        console.log('📥 Configuración importada:', config);
    }

    /**
     * 💥 Destructor - limpiar recursos
     */
    destroy() {
        this.saveStates();
        
        // Remover event listeners si fuera necesario
        // (En este caso usamos event delegation, así que no es necesario)
        
        // Limpiar intervalos
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
        }
        
        console.log('💥 DescriptionToggleManager destruido');
    }
}

// 🚀 Auto-inicialización cuando el DOM esté listo
let descriptionToggleManager = null;

function initDescriptionToggles() {
    if (!descriptionToggleManager) {
        descriptionToggleManager = new DescriptionToggleManager();
        
        // Exponer globalmente para desarrollo/debugging
        window.DescriptionToggleManager = descriptionToggleManager;
    }
    
    return descriptionToggleManager;
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDescriptionToggles);
} else {
    initDescriptionToggles();
}

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DescriptionToggleManager, initDescriptionToggles };
}

/**
 * 📚 EJEMPLOS DE USO:
 * 
 * // Básico - crear toggle para un producto
 * const toggle = descriptionToggleManager.createToggleStructure(
 *     'producto-123',
 *     'Descripción corta...',
 *     '<p>Descripción completa con HTML...</p>'
 * );
 * 
 * // Expandir programáticamente
 * descriptionToggleManager.expandDescription('producto-123');
 * 
 * // Escuchar eventos
 * document.addEventListener('descriptionToggle', (e) => {
 *     console.log('Toggle cambiado:', e.detail);
 * });
 * 
 * // Obtener estadísticas
 * const stats = descriptionToggleManager.getUsageStats();
 * console.log('Descripciones expandidas:', stats.expandedPercentage + '%');
 */