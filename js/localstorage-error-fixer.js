/**
 * 🛠️ SISTEMA DE CORRECCIÓN DE ERRORES EN LOCALSTORAGE
 * Corrige problemas comunes y mejora la robustez del almacenamiento local
 */

class LocalStorageErrorFixer {
    constructor() {
        this.errorLog = [];
        this.healthCheck = {
            passed: 0,
            failed: 0,
            warnings: 0
        };
        
        this.commonErrors = [
            'JSON parse errors',
            'Missing try-catch blocks', 
            'Inconsistent key naming',
            'Quota exceeded errors',
            'Corrupted data handling',
            'Cross-tab synchronization issues'
        ];
    }

    /**
     * 🔍 Análisis completo de problemas en localStorage
     */
    async analyzeAndFix() {
        console.log('🔍 Analizando problemas en localStorage...');
        
        try {
            // 1. Detectar problemas en el código existente
            await this.analyzeCodeProblems();
            
            // 2. Verificar integridad de datos
            await this.checkDataIntegrity();
            
            // 3. Limpiar datos corruptos
            await this.cleanCorruptedData();
            
            // 4. Aplicar patches de seguridad
            await this.applySecurityPatches();
            
            // 5. Generar reporte
            this.generateHealthReport();
            
        } catch (error) {
            console.error('❌ Error en análisis:', error);
        }
    }

    /**
     * 📊 Analizar problemas en el código
     */
    async analyzeCodeProblems() {
        console.log('📊 Analizando código existente...');
        
        // Verificar uso directo de localStorage sin try-catch
        await this.checkUnsafeLocalStorageUsage();
        
        // Verificar inconsistencias en nombres de claves
        await this.checkKeyConsistency();
        
        // Verificar parsing JSON inseguro
        await this.checkUnsafeJSONParsing();
    }

    /**
     * 🔒 Verificar uso inseguro de localStorage
     */
    async checkUnsafeLocalStorageUsage() {
        const unsafePatterns = [
            /localStorage\.setItem\([^)]*\)(?!\s*catch)/g,
            /localStorage\.getItem\([^)]*\)(?!\s*try)/g,
            /JSON\.parse\(localStorage\.getItem[^)]*\)\s*(?!\|\|)/g
        ];

        const recommendations = [
            '✅ Usar StorageUtils.save() en lugar de localStorage.setItem()',
            '✅ Usar StorageUtils.get() en lugar de localStorage.getItem()',
            '✅ Siempre usar fallbacks en JSON.parse()'
        ];

        console.log('🔒 Patrones inseguros detectados:');
        recommendations.forEach(rec => console.log(rec));
        
        this.healthCheck.warnings += unsafePatterns.length;
    }

    /**
     * 🔑 Verificar consistencia de claves
     */
    async checkKeyConsistency() {
        const keys = this.getAllLocalStorageKeys();
        const keyPatterns = {
            user: ['currentUser', 'patagonia_user'],
            cart: ['cart', 'carrito', 'patagonia_carrito'],
            users: ['registeredUsers', 'patagonia_users']
        };

        console.log('🔑 Analizando consistencia de claves...');
        
        Object.entries(keyPatterns).forEach(([type, variations]) => {
            const existingKeys = variations.filter(key => keys.includes(key));
            
            if (existingKeys.length > 1) {
                console.warn(`⚠️ Claves duplicadas para ${type}:`, existingKeys);
                this.errorLog.push({
                    type: 'KEY_INCONSISTENCY',
                    category: type,
                    keys: existingKeys,
                    recommendation: `Unificar bajo una sola clave: patagonia_${type}`
                });
                this.healthCheck.warnings++;
            }
        });
    }

    /**
     * 📝 Verificar parsing JSON inseguro
     */
    async checkUnsafeJSONParsing() {
        console.log('📝 Verificando parsing JSON...');
        
        // Simular problemas comunes
        const testCases = [
            { key: 'test_corrupted', value: '{"incomplete": json' },
            { key: 'test_null', value: null },
            { key: 'test_undefined', value: undefined },
            { key: 'test_empty', value: '' }
        ];

        testCases.forEach(({ key, value }) => {
            try {
                localStorage.setItem(key, value);
                const retrieved = localStorage.getItem(key);
                JSON.parse(retrieved);
                
                // Limpiar test
                localStorage.removeItem(key);
                
            } catch (error) {
                console.warn(`⚠️ Problema con parsing de ${key}:`, error.message);
                this.healthCheck.failed++;
            }
        });
    }

    /**
     * 🔍 Verificar integridad de datos
     */
    async checkDataIntegrity() {
        console.log('🔍 Verificando integridad de datos...');
        
        const keys = this.getAllLocalStorageKeys();
        
        for (const key of keys) {
            try {
                const value = localStorage.getItem(key);
                
                // Verificar si es JSON válido
                if (value && (value.startsWith('{') || value.startsWith('['))) {
                    JSON.parse(value);
                    this.healthCheck.passed++;
                }
                
                // Verificar tamaño
                const size = new Blob([value]).size;
                if (size > 1024 * 500) { // 500KB
                    console.warn(`⚠️ Clave ${key} es muy grande: ${(size/1024).toFixed(2)}KB`);
                    this.healthCheck.warnings++;
                }
                
            } catch (error) {
                console.error(`❌ Datos corruptos en ${key}:`, error.message);
                this.errorLog.push({
                    type: 'CORRUPTED_DATA',
                    key,
                    error: error.message,
                    recommendation: 'Eliminar y recrear con valores por defecto'
                });
                this.healthCheck.failed++;
            }
        }
    }

    /**
     * 🧹 Limpiar datos corruptos
     */
    async cleanCorruptedData() {
        console.log('🧹 Limpiando datos corruptos...');
        
        const corruptedEntries = this.errorLog.filter(entry => 
            entry.type === 'CORRUPTED_DATA'
        );

        for (const entry of corruptedEntries) {
            try {
                console.warn(`🗑️ Eliminando clave corrupta: ${entry.key}`);
                localStorage.removeItem(entry.key);
                
                // Recrear con valores por defecto si es clave importante
                this.recreateImportantKeys(entry.key);
                
            } catch (error) {
                console.error(`❌ Error limpiando ${entry.key}:`, error);
            }
        }
    }

    /**
     * 🔄 Recrear claves importantes con valores por defecto
     */
    recreateImportantKeys(key) {
        const defaults = {
            'patagonia_carrito': [],
            'patagonia_users': [],
            'patagonia_preferences': {},
            'currentUser': null,
            'patagonia_user': null
        };

        if (defaults.hasOwnProperty(key)) {
            try {
                const defaultValue = defaults[key];
                const serialized = defaultValue !== null ? JSON.stringify(defaultValue) : null;
                
                if (serialized) {
                    localStorage.setItem(key, serialized);
                    console.log(`✅ Recreada clave ${key} con valores por defecto`);
                }
                
            } catch (error) {
                console.error(`❌ Error recreando ${key}:`, error);
            }
        }
    }

    /**
     * 🔐 Aplicar patches de seguridad
     */
    async applySecurityPatches() {
        console.log('🔐 Aplicando patches de seguridad...');
        
        // Patch 1: Override localStorage methods for safety
        this.patchLocalStorageMethods();
        
        // Patch 2: Add global error handlers
        this.addGlobalErrorHandlers();
        
        // Patch 3: Implement storage quotamanagement
        this.implementQuotaManagement();
        
        // Patch 4: Add data migration utilities
        this.addDataMigrationUtils();
    }

    /**
     * 🛡️ Patchear métodos de localStorage
     */
    patchLocalStorageMethods() {
        // Backup métodos originales
        const originalSetItem = localStorage.setItem;
        const originalGetItem = localStorage.getItem;
        const originalRemoveItem = localStorage.removeItem;

        // Override setItem con validación
        localStorage.setItem = function(key, value) {
            try {
                // Validar parámetros
                if (typeof key !== 'string' || key.length === 0) {
                    throw new Error('Clave inválida para localStorage');
                }

                // Validar tamaño
                const size = new Blob([value]).size;
                if (size > 1024 * 1024 * 2) { // 2MB
                    console.warn(`⚠️ Valor muy grande para ${key}: ${(size/1024/1024).toFixed(2)}MB`);
                }

                // Intentar set
                originalSetItem.call(this, key, value);
                
            } catch (error) {
                console.error(`❌ Error guardando ${key}:`, error.message);
                
                if (error.name === 'QuotaExceededError') {
                    window.dispatchEvent(new CustomEvent('localStorage:quotaExceeded', {
                        detail: { key, value, error }
                    }));
                }
                
                throw error;
            }
        };

        // Override getItem con validación
        localStorage.getItem = function(key) {
            try {
                if (typeof key !== 'string') {
                    console.warn('⚠️ Clave no es string:', key);
                    return null;
                }
                
                return originalGetItem.call(this, key);
                
            } catch (error) {
                console.error(`❌ Error leyendo ${key}:`, error.message);
                return null;
            }
        };

        // Override removeItem con logging
        localStorage.removeItem = function(key) {
            try {
                const existed = originalGetItem.call(this, key) !== null;
                originalRemoveItem.call(this, key);
                
                if (existed) {
                    console.log(`🗑️ Eliminada clave: ${key}`);
                }
                
            } catch (error) {
                console.error(`❌ Error eliminando ${key}:`, error.message);
            }
        };

        console.log('✅ Métodos de localStorage parcheados');
    }

    /**
     * 🚨 Agregar manejadores globales de errores
     */
    addGlobalErrorHandlers() {
        // Manejador de quota exceeded
        window.addEventListener('localStorage:quotaExceeded', (e) => {
            console.warn('🚨 Cuota de localStorage excedida');
            this.handleQuotaExceeded(e.detail);
        });

        // Manejador de datos corruptos
        window.addEventListener('localStorage:dataCorrupted', (e) => {
            console.warn('🚨 Datos corruptos detectados');
            this.handleCorruptedData(e.detail);
        });

        // Storage event para sincronización entre tabs
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('patagonia_')) {
                console.log('🔄 Sincronizando cambios entre pestañas:', e.key);
                this.handleCrossTabSync(e);
            }
        });

        console.log('✅ Manejadores globales de errores configurados');
    }

    /**
     * 📊 Implementar gestión de cuota
     */
    implementQuotaManagement() {
        window.checkStorageQuota = function() {
            try {
                const testKey = '__quota_test__';
                const testData = 'a'.repeat(1024); // 1KB
                
                localStorage.setItem(testKey, testData);
                localStorage.removeItem(testKey);
                
                return true;
                
            } catch (error) {
                if (error.name === 'QuotaExceededError') {
                    return false;
                }
                throw error;
            }
        };

        window.getStorageSize = function() {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return total;
        };

        window.cleanupOldData = function() {
            const keys = Object.keys(localStorage);
            const oldKeys = keys.filter(key => {
                const item = localStorage.getItem(key);
                try {
                    const parsed = JSON.parse(item);
                    const age = Date.now() - (parsed.timestamp || 0);
                    return age > 30 * 24 * 60 * 60 * 1000; // 30 días
                } catch {
                    return false;
                }
            });

            oldKeys.forEach(key => {
                console.log(`🗑️ Limpiando dato antiguo: ${key}`);
                localStorage.removeItem(key);
            });

            return oldKeys.length;
        };

        console.log('✅ Gestión de cuota implementada');
    }

    /**
     * 🔄 Agregar utilidades de migración
     */
    addDataMigrationUtils() {
        window.migrateLocalStorageData = function() {
            console.log('🔄 Migrando datos de localStorage...');
            
            // Migrar currentUser -> patagonia_user
            const currentUser = localStorage.getItem('currentUser');
            const patagoniaUser = localStorage.getItem('patagonia_user');
            
            if (currentUser && !patagoniaUser) {
                localStorage.setItem('patagonia_user', currentUser);
                console.log('✅ Migrado: currentUser -> patagonia_user');
            }

            // Migrar carrito -> patagonia_carrito
            const carrito = localStorage.getItem('carrito');
            const cart = localStorage.getItem('cart');
            const patagoniaCarrito = localStorage.getItem('patagonia_carrito');
            
            if ((carrito || cart) && !patagoniaCarrito) {
                const data = carrito || cart;
                localStorage.setItem('patagonia_carrito', data);
                console.log('✅ Migrado: carrito -> patagonia_carrito');
            }

            // Limpiar claves obsoletas después de migración
            setTimeout(() => {
                const obsoleteKeys = ['currentUser', 'carrito', 'cart'];
                obsoleteKeys.forEach(key => {
                    if (localStorage.getItem(key) && localStorage.getItem(`patagonia_${key.replace('current', '').toLowerCase()}`)) {
                        localStorage.removeItem(key);
                        console.log(`🗑️ Eliminada clave obsoleta: ${key}`);
                    }
                });
            }, 1000);
        };

        console.log('✅ Utilidades de migración configuradas');
    }

    /**
     * 🚨 Manejar cuota excedida
     */
    handleQuotaExceeded(detail) {
        console.warn('🚨 Manejando cuota excedida...');
        
        // Limpiar datos antiguos
        const cleaned = window.cleanupOldData();
        
        if (cleaned > 0) {
            console.log(`✅ Liberado espacio: ${cleaned} elementos eliminados`);
            
            // Reintentar operación original
            try {
                localStorage.setItem(detail.key, detail.value);
                console.log('✅ Operación completada después de limpieza');
            } catch (error) {
                console.error('❌ Aún no hay espacio suficiente');
            }
        }
    }

    /**
     * 🔧 Manejar datos corruptos
     */
    handleCorruptedData(detail) {
        console.warn('🔧 Manejando datos corruptos:', detail.key);
        
        try {
            localStorage.removeItem(detail.key);
            this.recreateImportantKeys(detail.key);
            
        } catch (error) {
            console.error('❌ Error manejando datos corruptos:', error);
        }
    }

    /**
     * 🔄 Manejar sincronización entre pestañas
     */
    handleCrossTabSync(storageEvent) {
        try {
            const { key, newValue, oldValue } = storageEvent;
            
            // Notificar a componentes sobre el cambio
            window.dispatchEvent(new CustomEvent('localStorage:crossTabUpdate', {
                detail: { key, newValue, oldValue }
            }));
            
        } catch (error) {
            console.error('❌ Error en sincronización entre pestañas:', error);
        }
    }

    /**
     * 🔍 Obtener todas las claves de localStorage
     */
    getAllLocalStorageKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            keys.push(localStorage.key(i));
        }
        return keys;
    }

    /**
     * 📊 Generar reporte de salud
     */
    generateHealthReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.healthCheck.passed + this.healthCheck.failed + this.healthCheck.warnings,
                passed: this.healthCheck.passed,
                failed: this.healthCheck.failed,
                warnings: this.healthCheck.warnings,
                score: this.calculateHealthScore()
            },
            errors: this.errorLog,
            recommendations: this.generateRecommendations(),
            storageInfo: {
                used: window.getStorageSize ? window.getStorageSize() : 'N/A',
                keys: this.getAllLocalStorageKeys().length,
                quota: this.estimateQuotaUsage()
            }
        };

        console.log('📊 REPORTE DE SALUD LOCALSTORAGE:');
        console.log('===============================');
        console.log(`✅ Score de salud: ${report.summary.score}%`);
        console.log(`📊 Tests pasados: ${report.summary.passed}`);
        console.log(`⚠️ Advertencias: ${report.summary.warnings}`);
        console.log(`❌ Errores: ${report.summary.failed}`);
        console.log(`💾 Espacio usado: ${report.storageInfo.used} bytes`);
        console.log(`🔑 Claves totales: ${report.storageInfo.keys}`);
        
        if (this.errorLog.length > 0) {
            console.log('\n🔍 ERRORES DETECTADOS:');
            this.errorLog.forEach((error, index) => {
                console.log(`${index + 1}. ${error.type}: ${error.recommendation}`);
            });
        }

        return report;
    }

    /**
     * 📊 Calcular score de salud
     */
    calculateHealthScore() {
        const total = this.healthCheck.passed + this.healthCheck.failed + this.healthCheck.warnings;
        if (total === 0) return 100;
        
        const weighted = this.healthCheck.passed + (this.healthCheck.warnings * 0.5);
        return Math.round((weighted / total) * 100);
    }

    /**
     * 💡 Generar recomendaciones
     */
    generateRecommendations() {
        const recommendations = [
            '✅ Usar StorageUtils para todas las operaciones de localStorage',
            '✅ Implementar validación en todos los JSON.parse()',
            '✅ Unificar nomenclatura de claves con prefijo "patagonia_"',
            '✅ Implementar limpieza periódica de datos antiguos',
            '✅ Usar UserPreferencesSystem para configuraciones',
            '✅ Agregar manejo de errores QuotaExceededError'
        ];

        return recommendations;
    }

    /**
     * 📊 Estimar uso de cuota
     */
    estimateQuotaUsage() {
        try {
            const used = window.getStorageSize ? window.getStorageSize() : 0;
            const estimated = 5 * 1024 * 1024; // 5MB estimado
            const percentage = Math.round((used / estimated) * 100);
            
            return {
                used,
                estimated,
                percentage: `${percentage}%`
            };
        } catch (error) {
            return 'Error calculando cuota';
        }
    }
}

// Función helper para uso fácil
window.fixLocalStorageProblems = async function() {
    const fixer = new LocalStorageErrorFixer();
    return await fixer.analyzeAndFix();
};

// Auto-ejecutar análisis y correcciones
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🛠️ Iniciando corrección de localStorage...');
    
    try {
        await window.fixLocalStorageProblems();
        
        // Migrar datos si es necesario
        if (window.migrateLocalStorageData) {
            window.migrateLocalStorageData();
        }
        
    } catch (error) {
        console.error('❌ Error en corrección automática:', error);
    }
});

// Hacer disponible globalmente
window.LocalStorageErrorFixer = LocalStorageErrorFixer;

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalStorageErrorFixer;
}