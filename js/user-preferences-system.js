/**
 * 🎨 SISTEMA AVANZADO DE PREFERENCIAS DE USUARIO
 * Gestión escalable de configuraciones con aplicación en tiempo real
 */

class UserPreferencesSystem {
    constructor(options = {}) {
        this.namespace = options.namespace || 'patagonia';
        this.defaultPreferences = {
            theme: {
                mode: 'light', // 'light', 'dark', 'auto'
                primaryColor: '#1f3c5a',
                secondaryColor: '#3b5d50',
                accentColor: '#b67c3a',
                backgroundColor: '#f8f9fa',
                fontSize: 'medium', // 'small', 'medium', 'large'
                borderRadius: 'normal' // 'sharp', 'normal', 'rounded'
            },
            accessibility: {
                highContrast: false,
                reduceMotion: false,
                screenReader: false,
                fontSize: 'normal',
                focusIndicator: true
            },
            layout: {
                sidebarCollapsed: false,
                gridView: true, // true = grid, false = list
                itemsPerPage: 12,
                showPreviews: true
            },
            notifications: {
                enabled: true,
                position: 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
                duration: 4000,
                sound: false,
                desktop: false
            },
            performance: {
                animationsEnabled: true,
                lazyLoading: true,
                imageOptimization: true,
                cacheEnabled: true
            },
            privacy: {
                analytics: false,
                cookies: true,
                tracking: false,
                dataSharing: false
            },
            language: 'es',
            currency: 'ARS',
            timezone: 'America/Argentina/Buenos_Aires'
        };

        this.preferences = {};
        this.observers = new Map();
        this.isInitialized = false;

        this.init();
    }

    /**
     * 🚀 Inicialización del sistema
     */
    async init() {
        try {
            console.log('🎨 Inicializando sistema de preferencias...');
            
            // Cargar preferencias guardadas
            await this.loadPreferences();
            
            // Aplicar preferencias iniciales
            this.applyAllPreferences();
            
            // Configurar observadores
            this.setupObservers();
            
            // Escuchar cambios entre pestañas
            this.setupCrossTabSync();
            
            this.isInitialized = true;
            console.log('✅ Sistema de preferencias inicializado');
            
        } catch (error) {
            console.error('❌ Error al inicializar preferencias:', error);
            this.preferences = { ...this.defaultPreferences };
        }
    }

    /**
     * 📥 Cargar preferencias desde localStorage
     */
    async loadPreferences() {
        try {
            const key = `${this.namespace}_preferences`;
            const stored = localStorage.getItem(key);
            
            if (stored) {
                const parsedPrefs = JSON.parse(stored);
                
                // Validar estructura y mergear con defaults
                this.preferences = this.mergePreferences(
                    this.defaultPreferences, 
                    parsedPrefs
                );
                
                console.log('📥 Preferencias cargadas:', this.preferences);
            } else {
                this.preferences = { ...this.defaultPreferences };
                await this.savePreferences();
            }
            
        } catch (error) {
            console.error('❌ Error cargando preferencias:', error);
            this.preferences = { ...this.defaultPreferences };
        }
    }

    /**
     * 💾 Guardar preferencias en localStorage
     */
    async savePreferences() {
        try {
            const key = `${this.namespace}_preferences`;
            const data = JSON.stringify(this.preferences);
            
            // Verificar tamaño antes de guardar
            if (data.length > 1024 * 1024) { // 1MB límite
                console.warn('⚠️ Preferencias demasiado grandes, comprimiendo...');
                // Aquí podrías implementar compresión si fuera necesario
            }
            
            localStorage.setItem(key, data);
            console.log('💾 Preferencias guardadas correctamente');
            
            // Notificar cambios a otras pestañas
            this.broadcastChange();
            
        } catch (error) {
            console.error('❌ Error guardando preferencias:', error);
            
            if (error.name === 'QuotaExceededError') {
                this.handleStorageQuotaError();
            }
        }
    }

    /**
     * 🔄 Mergear preferencias con validación
     */
    mergePreferences(defaults, user) {
        const merged = { ...defaults };
        
        for (const [category, settings] of Object.entries(user)) {
            if (merged[category] && typeof merged[category] === 'object') {
                merged[category] = { 
                    ...merged[category], 
                    ...settings 
                };
            } else {
                merged[category] = settings;
            }
        }
        
        return merged;
    }

    /**
     * 🎯 Obtener preferencia específica
     */
    get(category, setting = null) {
        if (!category) return this.preferences;
        
        if (setting) {
            return this.preferences[category]?.[setting] ?? 
                   this.defaultPreferences[category]?.[setting];
        }
        
        return this.preferences[category] ?? this.defaultPreferences[category];
    }

    /**
     * ✏️ Establecer preferencia con aplicación inmediata
     */
    async set(category, setting, value) {
        try {
            if (!this.preferences[category]) {
                this.preferences[category] = {};
            }
            
            const oldValue = this.preferences[category][setting];
            this.preferences[category][setting] = value;
            
            // Aplicar cambio inmediatamente
            await this.applySpecificPreference(category, setting, value);
            
            // Guardar cambios
            await this.savePreferences();
            
            // Notificar observadores
            this.notifyObservers(category, setting, value, oldValue);
            
            console.log(`✅ Preferencia actualizada: ${category}.${setting} = ${value}`);
            
        } catch (error) {
            console.error('❌ Error estableciendo preferencia:', error);
        }
    }

    /**
     * 🎨 Aplicar todas las preferencias
     */
    applyAllPreferences() {
        console.log('🎨 Aplicando todas las preferencias...');
        
        Object.entries(this.preferences).forEach(([category, settings]) => {
            Object.entries(settings).forEach(([setting, value]) => {
                this.applySpecificPreference(category, setting, value);
            });
        });
    }

    /**
     * 🎯 Aplicar preferencia específica
     */
    async applySpecificPreference(category, setting, value) {
        try {
            switch (category) {
                case 'theme':
                    await this.applyThemePreference(setting, value);
                    break;
                case 'accessibility':
                    await this.applyAccessibilityPreference(setting, value);
                    break;
                case 'layout':
                    await this.applyLayoutPreference(setting, value);
                    break;
                case 'notifications':
                    await this.applyNotificationPreference(setting, value);
                    break;
                case 'performance':
                    await this.applyPerformancePreference(setting, value);
                    break;
            }
        } catch (error) {
            console.error(`❌ Error aplicando ${category}.${setting}:`, error);
        }
    }

    /**
     * 🎨 Aplicar preferencias de tema
     */
    async applyThemePreference(setting, value) {
        const root = document.documentElement;
        
        switch (setting) {
            case 'mode':
                document.body.classList.remove('theme-light', 'theme-dark');
                if (value === 'auto') {
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    value = isDark ? 'dark' : 'light';
                }
                document.body.classList.add(`theme-${value}`);
                break;
                
            case 'primaryColor':
                root.style.setProperty('--primary-color', value);
                break;
                
            case 'secondaryColor':
                root.style.setProperty('--secondary-color', value);
                break;
                
            case 'accentColor':
                root.style.setProperty('--accent-color', value);
                break;
                
            case 'backgroundColor':
                root.style.setProperty('--bg-light', value);
                break;
                
            case 'fontSize':
                const sizeMap = { small: '14px', medium: '16px', large: '18px' };
                root.style.setProperty('--base-font-size', sizeMap[value] || '16px');
                break;
                
            case 'borderRadius':
                const radiusMap = { sharp: '0px', normal: '0.375rem', rounded: '1rem' };
                root.style.setProperty('--border-radius', radiusMap[value] || '0.375rem');
                break;
        }
    }

    /**
     * ♿ Aplicar preferencias de accesibilidad
     */
    async applyAccessibilityPreference(setting, value) {
        switch (setting) {
            case 'highContrast':
                document.body.classList.toggle('high-contrast', value);
                break;
                
            case 'reduceMotion':
                document.body.classList.toggle('reduce-motion', value);
                if (value) {
                    document.documentElement.style.setProperty('--animation-duration', '0ms');
                } else {
                    document.documentElement.style.removeProperty('--animation-duration');
                }
                break;
                
            case 'focusIndicator':
                document.body.classList.toggle('enhanced-focus', value);
                break;
        }
    }

    /**
     * 📐 Aplicar preferencias de layout
     */
    async applyLayoutPreference(setting, value) {
        switch (setting) {
            case 'gridView':
                // Aplicar en componentes que usan vista grid/list
                document.body.classList.toggle('list-view', !value);
                document.body.classList.toggle('grid-view', value);
                break;
                
            case 'sidebarCollapsed':
                document.body.classList.toggle('sidebar-collapsed', value);
                break;
                
            case 'itemsPerPage':
                // Notificar a componentes de paginación
                this.notifyObservers('layout', 'itemsPerPage', value);
                break;
        }
    }

    /**
     * 🔔 Aplicar preferencias de notificaciones
     */
    async applyNotificationPreference(setting, value) {
        switch (setting) {
            case 'position':
                document.body.classList.remove(
                    'notifications-top-right', 'notifications-top-left',
                    'notifications-bottom-right', 'notifications-bottom-left'
                );
                document.body.classList.add(`notifications-${value}`);
                break;
                
            case 'enabled':
                // Configurar sistema de notificaciones
                if (window.notificationSystem) {
                    window.notificationSystem.setEnabled(value);
                }
                break;
        }
    }

    /**
     * ⚡ Aplicar preferencias de rendimiento
     */
    async applyPerformancePreference(setting, value) {
        switch (setting) {
            case 'animationsEnabled':
                document.body.classList.toggle('no-animations', !value);
                break;
                
            case 'lazyLoading':
                // Configurar lazy loading global
                if (window.domOptimizer) {
                    window.domOptimizer.setLazyLoading(value);
                }
                break;
        }
    }

    /**
     * 👀 Configurar observadores
     */
    setupObservers() {
        // Observar cambios en preferencias del sistema
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkModeQuery.addEventListener('change', (e) => {
                if (this.get('theme', 'mode') === 'auto') {
                    this.applyThemePreference('mode', 'auto');
                }
            });
        }
    }

    /**
     * 🔄 Sincronización entre pestañas
     */
    setupCrossTabSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === `${this.namespace}_preferences` && e.newValue) {
                try {
                    const newPrefs = JSON.parse(e.newValue);
                    this.preferences = this.mergePreferences(this.defaultPreferences, newPrefs);
                    this.applyAllPreferences();
                    console.log('🔄 Preferencias sincronizadas entre pestañas');
                } catch (error) {
                    console.error('❌ Error sincronizando preferencias:', error);
                }
            }
        });
    }

    /**
     * 📡 Observar cambios en preferencias
     */
    observe(category, callback) {
        if (!this.observers.has(category)) {
            this.observers.set(category, new Set());
        }
        this.observers.get(category).add(callback);
        
        // Retornar función para desuscribirse
        return () => {
            const observers = this.observers.get(category);
            if (observers) {
                observers.delete(callback);
            }
        };
    }

    /**
     * 📢 Notificar a observadores
     */
    notifyObservers(category, setting, newValue, oldValue) {
        const observers = this.observers.get(category);
        if (observers) {
            observers.forEach(callback => {
                try {
                    callback({ category, setting, newValue, oldValue });
                } catch (error) {
                    console.error('❌ Error en observer:', error);
                }
            });
        }
    }

    /**
     * 📡 Broadcast cambios a otras pestañas
     */
    broadcastChange() {
        // Crear evento personalizado para comunicación interna
        window.dispatchEvent(new CustomEvent('preferencesChanged', {
            detail: this.preferences
        }));
    }

    /**
     * 💾 Manejar error de cuota de almacenamiento
     */
    handleStorageQuotaError() {
        console.warn('⚠️ Cuota de localStorage excedida, limpiando datos antiguos...');
        
        // Limpiar datos antiguos o no esenciales
        const keys = Object.keys(localStorage);
        const oldKeys = keys.filter(key => 
            key.startsWith(this.namespace) && 
            !key.endsWith('_preferences') &&
            !key.endsWith('_user')
        );
        
        oldKeys.forEach(key => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error('Error removiendo clave:', key, error);
            }
        });
        
        // Intentar guardar nuevamente
        try {
            this.savePreferences();
        } catch (error) {
            console.error('❌ No se pueden guardar las preferencias después de la limpieza');
        }
    }

    /**
     * 🔄 Resetear a valores por defecto
     */
    async resetToDefaults() {
        this.preferences = { ...this.defaultPreferences };
        await this.savePreferences();
        this.applyAllPreferences();
        console.log('🔄 Preferencias reseteadas a valores por defecto');
    }

    /**
     * 📤 Exportar preferencias
     */
    export() {
        return JSON.stringify(this.preferences, null, 2);
    }

    /**
     * 📥 Importar preferencias
     */
    async import(preferencesData) {
        try {
            const imported = JSON.parse(preferencesData);
            this.preferences = this.mergePreferences(this.defaultPreferences, imported);
            await this.savePreferences();
            this.applyAllPreferences();
            console.log('📥 Preferencias importadas correctamente');
        } catch (error) {
            console.error('❌ Error importando preferencias:', error);
            throw new Error('Formato de preferencias inválido');
        }
    }

    /**
     * 🧹 Cleanup
     */
    destroy() {
        this.observers.clear();
        window.removeEventListener('storage', this.setupCrossTabSync);
    }
}

// Hacer disponible globalmente
window.UserPreferencesSystem = UserPreferencesSystem;

// Auto-inicialización
document.addEventListener('DOMContentLoaded', () => {
    if (!window.userPreferences) {
        window.userPreferences = new UserPreferencesSystem();
    }
});

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserPreferencesSystem;
}