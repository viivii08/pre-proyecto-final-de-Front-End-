/**
 * 🎨 PANEL DE PERSONALIZACIÓN DINÁMICO
 * Demostración práctica del sistema de preferencias y formularios dinámicos
 */

class CustomizationPanel {
    constructor(containerId) {
        this.containerId = containerId;
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * 🚀 Inicialización del panel
     */
    async init() {
        try {
            console.log('🎨 Inicializando panel de personalización...');
            
            await this.createPanelHTML();
            await this.setupEventListeners();
            await this.loadCurrentPreferences();
            
            this.isInitialized = true;
            console.log('✅ Panel de personalización listo');
            
        } catch (error) {
            console.error('❌ Error inicializando panel:', error);
        }
    }

    /**
     * 🏗️ Crear HTML del panel
     */
    async createPanelHTML() {
        const container = document.getElementById(this.containerId) || 
                         this.createPanelContainer();

        container.innerHTML = `
            <div class="customization-panel" id="customization-panel">
                <!-- Toggle Button -->
                <button class="panel-toggle" id="panel-toggle" type="button">
                    <i class="bi bi-palette"></i>
                    <span>Personalizar</span>
                </button>

                <!-- Panel Content -->
                <div class="panel-content" id="panel-content">
                    <div class="panel-header">
                        <h5><i class="bi bi-palette me-2"></i>Personalización</h5>
                        <button class="btn-close-panel" id="close-panel">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>

                    <form class="dynamic-form" data-dynamic="true" id="customization-form">
                        <!-- Sección de Tema -->
                        <div class="preference-section">
                            <h6><i class="bi bi-brush me-2"></i>Tema</h6>
                            
                            <!-- Modo de tema -->
                            <div class="form-group mb-3">
                                <label for="theme-mode" class="form-label">Modo</label>
                                <select 
                                    id="theme-mode" 
                                    class="form-control" 
                                    data-pref-category="theme" 
                                    data-pref-setting="mode"
                                    data-preview-target="body">
                                    <option value="light">Claro</option>
                                    <option value="dark">Oscuro</option>
                                    <option value="auto">Automático</option>
                                </select>
                            </div>

                            <!-- Color primario -->
                            <div class="form-group mb-3">
                                <label for="primary-color" class="form-label">
                                    Color Primario 
                                    <span class="color-value"></span>
                                </label>
                                <input 
                                    type="color" 
                                    id="primary-color" 
                                    class="form-control form-control-color" 
                                    value="#1f3c5a"
                                    data-pref-category="theme"
                                    data-pref-setting="primaryColor"
                                    data-css-property="primary-color"
                                    data-preview-target=".navbar">
                            </div>

                            <!-- Color secundario -->
                            <div class="form-group mb-3">
                                <label for="secondary-color" class="form-label">
                                    Color Secundario 
                                    <span class="color-value"></span>
                                </label>
                                <input 
                                    type="color" 
                                    id="secondary-color" 
                                    class="form-control form-control-color" 
                                    value="#3b5d50"
                                    data-pref-category="theme"
                                    data-pref-setting="secondaryColor"
                                    data-css-property="secondary-color">
                            </div>

                            <!-- Color de acento -->
                            <div class="form-group mb-3">
                                <label for="accent-color" class="form-label">
                                    Color de Acento 
                                    <span class="color-value"></span>
                                </label>
                                <input 
                                    type="color" 
                                    id="accent-color" 
                                    class="form-control form-control-color" 
                                    value="#b67c3a"
                                    data-pref-category="theme"
                                    data-pref-setting="accentColor"
                                    data-css-property="accent-color">
                            </div>

                            <!-- Tamaño de fuente -->
                            <div class="form-group mb-3">
                                <label for="font-size" class="form-label">
                                    Tamaño de Fuente
                                    <span class="range-value" id="font-size-value">16px</span>
                                </label>
                                <input 
                                    type="range" 
                                    id="font-size" 
                                    class="form-range" 
                                    min="14" 
                                    max="20" 
                                    step="1" 
                                    value="16"
                                    data-pref-category="theme"
                                    data-pref-setting="fontSize"
                                    data-css-property="base-font-size"
                                    data-css-unit="px">
                            </div>

                            <!-- Radio de bordes -->
                            <div class="form-group mb-3">
                                <label for="border-radius" class="form-label">
                                    Radio de Bordes
                                    <span class="range-value" id="border-radius-value">6px</span>
                                </label>
                                <input 
                                    type="range" 
                                    id="border-radius" 
                                    class="form-range" 
                                    min="0" 
                                    max="20" 
                                    step="1" 
                                    value="6"
                                    data-pref-category="theme"
                                    data-pref-setting="borderRadius"
                                    data-css-property="border-radius"
                                    data-css-unit="px">
                            </div>
                        </div>

                        <!-- Sección de Accesibilidad -->
                        <div class="preference-section">
                            <h6><i class="bi bi-universal-access me-2"></i>Accesibilidad</h6>
                            
                            <div class="form-check mb-2">
                                <input 
                                    type="checkbox" 
                                    class="form-check-input" 
                                    id="high-contrast"
                                    data-pref-category="accessibility"
                                    data-pref-setting="highContrast">
                                <label class="form-check-label" for="high-contrast">
                                    Alto Contraste
                                </label>
                            </div>

                            <div class="form-check mb-2">
                                <input 
                                    type="checkbox" 
                                    class="form-check-input" 
                                    id="reduce-motion"
                                    data-pref-category="accessibility"
                                    data-pref-setting="reduceMotion">
                                <label class="form-check-label" for="reduce-motion">
                                    Reducir Animaciones
                                </label>
                            </div>

                            <div class="form-check mb-3">
                                <input 
                                    type="checkbox" 
                                    class="form-check-input" 
                                    id="focus-indicator"
                                    data-pref-category="accessibility"
                                    data-pref-setting="focusIndicator"
                                    checked>
                                <label class="form-check-label" for="focus-indicator">
                                    Indicador de Foco Mejorado
                                </label>
                            </div>
                        </div>

                        <!-- Sección de Layout -->
                        <div class="preference-section">
                            <h6><i class="bi bi-layout-three-columns me-2"></i>Diseño</h6>
                            
                            <div class="form-group mb-3">
                                <label for="items-per-page" class="form-label">
                                    Productos por Página
                                    <span class="range-value" id="items-per-page-value">12</span>
                                </label>
                                <input 
                                    type="range" 
                                    id="items-per-page" 
                                    class="form-range" 
                                    min="6" 
                                    max="24" 
                                    step="3" 
                                    value="12"
                                    data-pref-category="layout"
                                    data-pref-setting="itemsPerPage">
                            </div>

                            <div class="form-check mb-2">
                                <input 
                                    type="checkbox" 
                                    class="form-check-input" 
                                    id="grid-view"
                                    data-pref-category="layout"
                                    data-pref-setting="gridView"
                                    checked>
                                <label class="form-check-label" for="grid-view">
                                    Vista de Cuadrícula
                                </label>
                            </div>

                            <div class="form-check mb-3">
                                <input 
                                    type="checkbox" 
                                    class="form-check-input" 
                                    id="show-previews"
                                    data-pref-category="layout"
                                    data-pref-setting="showPreviews"
                                    checked>
                                <label class="form-check-label" for="show-previews">
                                    Mostrar Vistas Previas
                                </label>
                            </div>
                        </div>

                        <!-- Botones de acción -->
                        <div class="panel-actions">
                            <button type="button" class="btn btn-secondary btn-sm" id="reset-preferences">
                                <i class="bi bi-arrow-clockwise me-1"></i>
                                Resetear
                            </button>
                            <button type="button" class="btn btn-primary btn-sm" id="save-preferences">
                                <i class="bi bi-check-lg me-1"></i>
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Preview de cambios -->
                <div class="preview-indicator" id="preview-indicator">
                    <i class="bi bi-eye"></i>
                    <span>Vista previa activa</span>
                </div>
            </div>
        `;

        this.addPanelStyles();
    }

    /**
     * 🎨 Agregar estilos CSS del panel
     */
    addPanelStyles() {
        if (document.querySelector('#customization-panel-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'customization-panel-styles';
        styles.textContent = `
            .customization-panel {
                position: fixed;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                z-index: 1050;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            }

            .panel-toggle {
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                border: none;
                border-radius: 50px 0 0 50px;
                padding: 12px 16px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.9rem;
                font-weight: 500;
            }

            .panel-toggle:hover {
                background: linear-gradient(135deg, #0056b3, #004085);
                transform: translateX(-5px);
                box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
            }

            .panel-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                padding: 0;
                width: 350px;
                max-height: 70vh;
                overflow: hidden;
                position: absolute;
                top: 50%;
                right: 100%;
                transform: translateY(-50%) translateX(-10px);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid rgba(0, 0, 0, 0.1);
            }

            .panel-content.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(-50%) translateX(-20px);
            }

            .panel-header {
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                padding: 16px 20px;
                border-bottom: 1px solid #dee2e6;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .panel-header h5 {
                margin: 0;
                font-size: 1.1rem;
                font-weight: 600;
                color: #495057;
                display: flex;
                align-items: center;
            }

            .btn-close-panel {
                background: none;
                border: none;
                color: #6c757d;
                font-size: 1.1rem;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .btn-close-panel:hover {
                color: #495057;
                background: rgba(0, 0, 0, 0.05);
            }

            .dynamic-form {
                padding: 20px;
                max-height: calc(70vh - 80px);
                overflow-y: auto;
            }

            .preference-section {
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid #f0f0f0;
            }

            .preference-section:last-of-type {
                border-bottom: none;
            }

            .preference-section h6 {
                color: #495057;
                font-size: 0.95rem;
                font-weight: 600;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
            }

            .form-group {
                margin-bottom: 16px;
            }

            .form-label {
                font-size: 0.85rem;
                font-weight: 500;
                color: #6c757d;
                margin-bottom: 6px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .form-control, .form-select {
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 8px 12px;
                font-size: 0.9rem;
                transition: all 0.2s ease;
            }

            .form-control:focus, .form-select:focus {
                border-color: #007bff;
                box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
            }

            .form-control-color {
                height: 40px;
                border-radius: 8px;
                border: 1px solid #dee2e6;
                cursor: pointer;
            }

            .form-range {
                margin: 8px 0;
            }

            .range-value, .color-value {
                font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
                font-size: 0.8rem;
                background: #f8f9fa;
                padding: 2px 6px;
                border-radius: 4px;
                border: 1px solid #dee2e6;
            }

            .form-check {
                margin-bottom: 8px;
            }

            .form-check-label {
                font-size: 0.9rem;
                color: #495057;
            }

            .panel-actions {
                display: flex;
                gap: 8px;
                padding-top: 16px;
                border-top: 1px solid #f0f0f0;
                margin-top: 16px;
            }

            .panel-actions .btn {
                flex: 1;
                font-size: 0.85rem;
                padding: 8px 12px;
                border-radius: 6px;
                font-weight: 500;
            }

            .preview-indicator {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(40, 167, 69, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                display: flex;
                align-items: center;
                gap: 6px;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .preview-indicator.show {
                opacity: 1;
                transform: translateY(0);
            }

            /* Responsive */
            @media (max-width: 768px) {
                .customization-panel {
                    right: 10px;
                }
                
                .panel-content {
                    width: calc(100vw - 40px);
                    max-width: 350px;
                }
            }

            /* Tema oscuro */
            body.theme-dark .panel-content {
                background: #2d3748;
                color: #e2e8f0;
                border-color: #4a5568;
            }

            body.theme-dark .panel-header {
                background: linear-gradient(135deg, #1a202c, #2d3748);
                border-color: #4a5568;
            }

            body.theme-dark .panel-header h5,
            body.theme-dark .preference-section h6 {
                color: #e2e8f0;
            }

            body.theme-dark .form-control,
            body.theme-dark .form-select {
                background: #4a5568;
                border-color: #718096;
                color: #e2e8f0;
            }

            body.theme-dark .range-value,
            body.theme-dark .color-value {
                background: #4a5568;
                border-color: #718096;
                color: #e2e8f0;
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * 🎯 Configurar event listeners
     */
    async setupEventListeners() {
        const panelToggle = document.getElementById('panel-toggle');
        const closePanel = document.getElementById('close-panel');
        const panelContent = document.getElementById('panel-content');
        const resetBtn = document.getElementById('reset-preferences');
        const saveBtn = document.getElementById('save-preferences');

        // Toggle panel
        panelToggle.addEventListener('click', () => {
            panelContent.classList.toggle('active');
        });

        // Close panel
        closePanel.addEventListener('click', () => {
            panelContent.classList.remove('active');
        });

        // Close panel clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.customization-panel')) {
                panelContent.classList.remove('active');
            }
        });

        // Reset preferences
        resetBtn.addEventListener('click', async () => {
            if (confirm('¿Resetear todas las preferencias a valores por defecto?')) {
                await this.resetPreferences();
            }
        });

        // Save preferences (manual)
        saveBtn.addEventListener('click', async () => {
            await this.savePreferences();
        });

        // Registrar formulario en el sistema dinámico
        if (window.dynamicFormSystem) {
            window.dynamicFormSystem.registerForm(
                document.getElementById('customization-form'),
                {
                    enablePreview: true,
                    autoSave: true,
                    updateDelay: 200
                }
            );
        }

        console.log('✅ Event listeners configurados');
    }

    /**
     * 📥 Cargar preferencias actuales
     */
    async loadCurrentPreferences() {
        if (!window.userPreferences) return;

        try {
            const form = document.getElementById('customization-form');
            const inputs = form.querySelectorAll('[data-pref-category]');

            inputs.forEach(input => {
                const category = input.dataset.prefCategory;
                const setting = input.dataset.prefSetting;
                const value = window.userPreferences.get(category, setting);

                if (value !== undefined) {
                    if (input.type === 'checkbox') {
                        input.checked = value;
                    } else {
                        input.value = value;
                    }

                    // Trigger change event para aplicar cambios
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });

            console.log('📥 Preferencias cargadas en el panel');

        } catch (error) {
            console.error('❌ Error cargando preferencias:', error);
        }
    }

    /**
     * 🔄 Resetear preferencias
     */
    async resetPreferences() {
        try {
            if (window.userPreferences) {
                await window.userPreferences.resetToDefaults();
                await this.loadCurrentPreferences();
                
                this.showPreviewIndicator('Preferencias reseteadas');
            }
        } catch (error) {
            console.error('❌ Error reseteando preferencias:', error);
        }
    }

    /**
     * 💾 Guardar preferencias
     */
    async savePreferences() {
        try {
            this.showPreviewIndicator('Preferencias guardadas');
        } catch (error) {
            console.error('❌ Error guardando preferencias:', error);
        }
    }

    /**
     * 👁️ Mostrar indicador de preview
     */
    showPreviewIndicator(message = 'Vista previa activa') {
        let indicator = document.getElementById('preview-indicator');
        
        if (indicator) {
            indicator.querySelector('span').textContent = message;
            indicator.classList.add('show');
            
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 3000);
        }
    }

    /**
     * 🏗️ Crear contenedor del panel si no existe
     */
    createPanelContainer() {
        const container = document.createElement('div');
        container.id = this.containerId;
        document.body.appendChild(container);
        return container;
    }
}

// Auto-inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que los sistemas estén listos
    setTimeout(() => {
        if (!window.customizationPanel) {
            window.customizationPanel = new CustomizationPanel('customization-container');
        }
    }, 500);
});

// Hacer disponible globalmente
window.CustomizationPanel = CustomizationPanel;

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomizationPanel;
}