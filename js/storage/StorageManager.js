/**
 * 🗄️ LOCALSTORAGE MANAGER AVANZADO
 * Sistema escalable y robusto para gestión de datos en localStorage
 * Versión: 3.0
 * Características: Validación, Encriptación, Compresión, TTL, Eventos
 */

class PatagoniaStorageManager {
    constructor() {
        this.namespace = 'patagonia';
        this.version = '3.0';
        this.isAvailable = this.checkStorageAvailability();
        this.compressionEnabled = true;
        this.encryptionEnabled = false; // Se puede activar para datos sensibles
        this.maxSize = 5 * 1024 * 1024; // 5MB máximo
        this.eventListeners = new Map();
        
        // Configuración de esquemas de datos
        this.schemas = {
            carrito: {
                version: 1,
                structure: {
                    id: 'string',
                    nombre: 'string',
                    precio: 'number',
                    cantidad: 'number',
                    imagen: 'string',
                    timestamp: 'number'
                },
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
            },
            user: {
                version: 1,
                structure: {
                    id: 'string',
                    email: 'string',
                    firstName: 'string',
                    lastName: 'string',
                    preferences: 'object',
                    lastLogin: 'number'
                },
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
            },
            preferences: {
                version: 1,
                structure: {
                    theme: 'string',
                    backgroundColor: 'string',
                    notifications: 'boolean',
                    language: 'string',
                    currency: 'string'
                },
                maxAge: 365 * 24 * 60 * 60 * 1000 // 1 año
            },
            session: {
                version: 1,
                structure: {
                    token: 'string',
                    userId: 'string',
                    expiresAt: 'number'
                },
                maxAge: 24 * 60 * 60 * 1000 // 1 día
            }
        };

        this.init();
    }

    /**
     * 🚀 Inicializar el storage manager
     */
    init() {
        if (!this.isAvailable) {
            console.warn('⚠️ localStorage no está disponible, usando fallback en memoria');
            this.memoryStorage = new Map();
        }

        // Limpiar datos expirados al inicio
        this.cleanupExpiredData();

        // Configurar limpieza automática
        setInterval(() => {
            this.cleanupExpiredData();
        }, 60 * 60 * 1000); // Cada hora

        // Monitorear uso de espacio
        this.monitorStorageUsage();

        console.log('🗄️ PatagoniaStorageManager inicializado');
    }

    /**
     * 🔍 Verificar disponibilidad de localStorage
     */
    checkStorageAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 🔑 Generar clave con namespace
     */
    generateKey(key, namespace = null) {
        const ns = namespace || this.namespace;
        return `${ns}_${key}_v${this.version}`;
    }

    /**
     * 📦 Formatear datos para almacenamiento
     */
    formatData(data, schema = null) {
        const formatted = {
            data: data,
            timestamp: Date.now(),
            version: this.version,
            checksum: this.generateChecksum(data)
        };

        if (schema && this.schemas[schema]) {
            formatted.schema = schema;
            formatted.maxAge = this.schemas[schema].maxAge;
            formatted.expiresAt = Date.now() + this.schemas[schema].maxAge;
        }

        return formatted;
    }

    /**
     * 🔐 Generar checksum para integridad de datos
     */
    generateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a 32-bit integer
        }
        return hash.toString();
    }

    /**
     * ✅ Validar datos contra esquema
     */
    validateData(data, schemaName) {
        if (!this.schemas[schemaName]) return true;

        const schema = this.schemas[schemaName].structure;
        
        for (const [key, expectedType] of Object.entries(schema)) {
            if (!(key in data)) {
                console.warn(`⚠️ Campo faltante: ${key} en ${schemaName}`);
                return false;
            }

            const actualType = typeof data[key];
            if (expectedType === 'object' && data[key] !== null && actualType === 'object') {
                continue;
            }
            if (actualType !== expectedType) {
                console.warn(`⚠️ Tipo incorrecto: ${key} esperaba ${expectedType}, recibió ${actualType}`);
                return false;
            }
        }

        return true;
    }

    /**
     * 💾 Guardar datos
     */
    set(key, data, options = {}) {
        const {
            schema = null,
            ttl = null,
            compress = this.compressionEnabled,
            encrypt = this.encryptionEnabled,
            silent = false
        } = options;

        try {
            // Validar datos si hay esquema
            if (schema && !this.validateData(data, schema)) {
                throw new Error(`Datos no válidos para esquema ${schema}`);
            }

            // Formatear datos
            let formattedData = this.formatData(data, schema);

            // TTL personalizado
            if (ttl) {
                formattedData.expiresAt = Date.now() + ttl;
            }

            // Comprimir si es necesario
            if (compress && JSON.stringify(formattedData).length > 1000) {
                formattedData = this.compressData(formattedData);
            }

            // Encriptar si es necesario
            if (encrypt) {
                formattedData = this.encryptData(formattedData);
            }

            const serializedData = JSON.stringify(formattedData);

            // Verificar límite de tamaño
            if (serializedData.length > this.maxSize) {
                throw new Error(`Datos demasiado grandes: ${serializedData.length} bytes`);
            }

            const storageKey = this.generateKey(key);

            if (this.isAvailable) {
                localStorage.setItem(storageKey, serializedData);
            } else {
                this.memoryStorage.set(storageKey, serializedData);
            }

            // Disparar evento
            if (!silent) {
                this.dispatchEvent('dataSet', {
                    key,
                    schema,
                    size: serializedData.length,
                    timestamp: Date.now()
                });
            }

            return true;

        } catch (error) {
            console.error(`❌ Error guardando ${key}:`, error);
            
            // Intentar limpiar espacio y reintentar
            if (error.name === 'QuotaExceededError') {
                this.cleanup();
                return this.set(key, data, { ...options, silent: true });
            }

            return false;
        }
    }

    /**
     * 📄 Obtener datos
     */
    get(key, defaultValue = null, options = {}) {
        const {
            schema = null,
            decrypt = this.encryptionEnabled,
            decompress = this.compressionEnabled,
            silent = false
        } = options;

        try {
            const storageKey = this.generateKey(key);
            
            let rawData;
            if (this.isAvailable) {
                rawData = localStorage.getItem(storageKey);
            } else {
                rawData = this.memoryStorage.get(storageKey);
            }

            if (!rawData) {
                return defaultValue;
            }

            let parsedData = JSON.parse(rawData);

            // Verificar expiración
            if (parsedData.expiresAt && Date.now() > parsedData.expiresAt) {
                this.remove(key, { silent: true });
                return defaultValue;
            }

            // Desencriptar si es necesario
            if (decrypt && parsedData.encrypted) {
                parsedData = this.decryptData(parsedData);
            }

            // Descomprimir si es necesario
            if (decompress && parsedData.compressed) {
                parsedData = this.decompressData(parsedData);
            }

            // Verificar integridad
            if (parsedData.checksum) {
                const currentChecksum = this.generateChecksum(parsedData.data);
                if (currentChecksum !== parsedData.checksum) {
                    console.warn(`⚠️ Checksum no coincide para ${key}`);
                    this.remove(key, { silent: true });
                    return defaultValue;
                }
            }

            // Disparar evento
            if (!silent) {
                this.dispatchEvent('dataGet', {
                    key,
                    schema,
                    timestamp: Date.now()
                });
            }

            return parsedData.data;

        } catch (error) {
            console.error(`❌ Error obteniendo ${key}:`, error);
            
            // Si hay error, limpiar datos corruptos
            this.remove(key, { silent: true });
            return defaultValue;
        }
    }

    /**
     * 🗑️ Eliminar datos
     */
    remove(key, options = {}) {
        const { silent = false } = options;

        try {
            const storageKey = this.generateKey(key);

            if (this.isAvailable) {
                localStorage.removeItem(storageKey);
            } else {
                this.memoryStorage.delete(storageKey);
            }

            if (!silent) {
                this.dispatchEvent('dataRemove', {
                    key,
                    timestamp: Date.now()
                });
            }

            return true;

        } catch (error) {
            console.error(`❌ Error eliminando ${key}:`, error);
            return false;
        }
    }

    /**
     * 🔍 Verificar si existe una clave
     */
    has(key) {
        const storageKey = this.generateKey(key);
        
        if (this.isAvailable) {
            return localStorage.getItem(storageKey) !== null;
        } else {
            return this.memoryStorage.has(storageKey);
        }
    }

    /**
     * 📊 Obtener todas las claves del namespace
     */
    getAllKeys() {
        const keys = [];
        const prefix = `${this.namespace}_`;

        if (this.isAvailable) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    keys.push(key.substring(prefix.length));
                }
            }
        } else {
            for (const key of this.memoryStorage.keys()) {
                if (key.startsWith(prefix)) {
                    keys.push(key.substring(prefix.length));
                }
            }
        }

        return keys;
    }

    /**
     * 🧹 Limpiar datos expirados
     */
    cleanupExpiredData() {
        const keys = this.getAllKeys();
        let cleaned = 0;

        keys.forEach(key => {
            try {
                const data = this.get(key, null, { silent: true });
                if (data === null) {
                    cleaned++;
                }
            } catch (error) {
                // Si hay error al leer, también lo eliminamos
                this.remove(key, { silent: true });
                cleaned++;
            }
        });

        if (cleaned > 0) {
            console.log(`🧹 Limpiados ${cleaned} elementos expirados`);
        }
    }

    /**
     * 🧽 Limpiar todo el namespace
     */
    clear() {
        const keys = this.getAllKeys();
        
        keys.forEach(key => {
            this.remove(key, { silent: true });
        });

        this.dispatchEvent('dataCleared', {
            keysRemoved: keys.length,
            timestamp: Date.now()
        });

        console.log(`🧽 Limpiado namespace ${this.namespace}: ${keys.length} elementos`);
    }

    /**
     * 📏 Monitorear uso de espacio
     */
    monitorStorageUsage() {
        if (!this.isAvailable) return;

        try {
            let totalSize = 0;
            const prefix = `${this.namespace}_`;

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const value = localStorage.getItem(key);
                    totalSize += key.length + (value ? value.length : 0);
                }
            }

            const usagePercentage = (totalSize / this.maxSize) * 100;

            if (usagePercentage > 80) {
                console.warn(`⚠️ Uso de storage alto: ${usagePercentage.toFixed(1)}%`);
                
                if (usagePercentage > 95) {
                    console.warn('🚨 Iniciando limpieza automática...');
                    this.cleanup();
                }
            }

            return {
                totalSize,
                maxSize: this.maxSize,
                usagePercentage,
                freeSpace: this.maxSize - totalSize
            };

        } catch (error) {
            console.error('❌ Error monitoreando storage:', error);
            return null;
        }
    }

    /**
     * 🧹 Limpieza inteligente
     */
    cleanup() {
        console.log('🧹 Iniciando limpieza inteligente...');

        // 1. Limpiar datos expirados
        this.cleanupExpiredData();

        // 2. Limpiar datos más antiguos si aún falta espacio
        const usage = this.monitorStorageUsage();
        if (usage && usage.usagePercentage > 70) {
            this.cleanupOldestData(0.2); // Limpiar 20% de los datos más antiguos
        }
    }

    /**
     * 🗑️ Limpiar datos más antiguos
     */
    cleanupOldestData(percentage = 0.1) {
        const keys = this.getAllKeys();
        const dataWithTimestamps = [];

        keys.forEach(key => {
            try {
                const storageKey = this.generateKey(key);
                const rawData = this.isAvailable ? 
                    localStorage.getItem(storageKey) : 
                    this.memoryStorage.get(storageKey);
                
                if (rawData) {
                    const parsed = JSON.parse(rawData);
                    dataWithTimestamps.push({
                        key,
                        timestamp: parsed.timestamp || 0
                    });
                }
            } catch (error) {
                // Si hay error, también marcarlo para limpieza
                dataWithTimestamps.push({
                    key,
                    timestamp: 0
                });
            }
        });

        // Ordenar por timestamp (más antiguos primero)
        dataWithTimestamps.sort((a, b) => a.timestamp - b.timestamp);

        // Calcular cuántos eliminar
        const toRemove = Math.floor(dataWithTimestamps.length * percentage);

        // Eliminar los más antiguos
        for (let i = 0; i < toRemove; i++) {
            this.remove(dataWithTimestamps[i].key, { silent: true });
        }

        console.log(`🗑️ Eliminados ${toRemove} datos antiguos`);
    }

    /**
     * 🎯 Comprimir datos (simulado - en producción usar librerías como LZ-string)
     */
    compressData(data) {
        // Nota: En producción, usar una librería real de compresión
        return {
            ...data,
            compressed: true,
            originalSize: JSON.stringify(data).length
        };
    }

    /**
     * 📦 Descomprimir datos
     */
    decompressData(data) {
        const { compressed, originalSize, ...rest } = data;
        return rest;
    }

    /**
     * 🔐 Encriptar datos (simulado - en producción usar librerías seguras)
     */
    encryptData(data) {
        // Nota: En producción, usar una librería real de encriptación
        return {
            ...data,
            encrypted: true,
            algorithm: 'simulated'
        };
    }

    /**
     * 🔓 Desencriptar datos
     */
    decryptData(data) {
        const { encrypted, algorithm, ...rest } = data;
        return rest;
    }

    /**
     * 📡 Sistema de eventos
     */
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }

    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).delete(callback);
        }
    }

    dispatchEvent(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error en event listener ${event}:`, error);
                }
            });
        }
    }

    /**
     * 📊 Obtener estadísticas
     */
    getStats() {
        const keys = this.getAllKeys();
        const usage = this.monitorStorageUsage();
        
        return {
            totalKeys: keys.length,
            storageUsage: usage,
            isAvailable: this.isAvailable,
            namespace: this.namespace,
            version: this.version,
            schemas: Object.keys(this.schemas),
            events: Array.from(this.eventListeners.keys())
        };
    }

    /**
     * 🔧 Migrar datos de versiones anteriores
     */
    migrate() {
        // Migrar datos del formato anterior si existen
        const oldKeys = ['carrito', 'patagonia_carrito', 'currentUser', 'patagonia_user'];
        
        oldKeys.forEach(oldKey => {
            try {
                const oldData = localStorage.getItem(oldKey);
                if (oldData) {
                    const parsed = JSON.parse(oldData);
                    
                    // Determinar nuevo formato
                    let newKey, schema;
                    if (oldKey.includes('carrito')) {
                        newKey = 'carrito';
                        schema = 'carrito';
                    } else if (oldKey.includes('user') || oldKey.includes('User')) {
                        newKey = 'user';
                        schema = 'user';
                    }
                    
                    if (newKey && schema) {
                        this.set(newKey, parsed, { schema, silent: true });
                        localStorage.removeItem(oldKey);
                        console.log(`🔄 Migrado ${oldKey} -> ${newKey}`);
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Error migrando ${oldKey}:`, error);
                localStorage.removeItem(oldKey); // Limpiar datos corruptos
            }
        });
    }

    /**
     * 📁 Exportar todos los datos
     */
    exportData() {
        const data = {};
        const keys = this.getAllKeys();

        keys.forEach(key => {
            try {
                data[key] = this.get(key, null, { silent: true });
            } catch (error) {
                console.warn(`⚠️ Error exportando ${key}:`, error);
            }
        });

        return {
            data,
            metadata: {
                exportedAt: new Date().toISOString(),
                version: this.version,
                namespace: this.namespace,
                totalKeys: keys.length
            }
        };
    }

    /**
     * 📥 Importar datos
     */
    importData(exportedData) {
        if (!exportedData.data) {
            throw new Error('Formato de datos inválido');
        }

        let imported = 0;
        let errors = 0;

        Object.entries(exportedData.data).forEach(([key, value]) => {
            try {
                // Intentar determinar el esquema automáticamente
                let schema = null;
                if (key === 'carrito') schema = 'carrito';
                else if (key === 'user') schema = 'user';
                else if (key === 'preferences') schema = 'preferences';

                const success = this.set(key, value, { schema, silent: true });
                if (success) imported++;
                else errors++;
            } catch (error) {
                console.warn(`⚠️ Error importando ${key}:`, error);
                errors++;
            }
        });

        console.log(`📥 Importación completada: ${imported} exitosos, ${errors} errores`);
        return { imported, errors };
    }
}

// 🚀 Crear instancia global
const Storage = new PatagoniaStorageManager();

// Migrar datos existentes
Storage.migrate();

// Exponer globalmente
window.PatagoniaStorage = Storage;

/**
 * 🎯 API SIMPLIFICADA PARA USO COMÚN
 */
class QuickStorage {
    /**
     * 🛒 Gestión de carrito
     */
    static getCarrito() {
        return Storage.get('carrito', [], { schema: 'carrito' });
    }

    static setCarrito(carrito) {
        return Storage.set('carrito', carrito, { schema: 'carrito' });
    }

    static addToCarrito(producto) {
        const carrito = this.getCarrito();
        const existente = carrito.find(p => p.id === producto.id);
        
        if (existente) {
            existente.cantidad += producto.cantidad || 1;
        } else {
            carrito.push({
                id: producto.id || Date.now().toString(),
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: producto.cantidad || 1,
                imagen: producto.imagen || '',
                timestamp: Date.now()
            });
        }
        
        return this.setCarrito(carrito);
    }

    static removeFromCarrito(productId) {
        const carrito = this.getCarrito();
        const filtered = carrito.filter(p => p.id !== productId);
        return this.setCarrito(filtered);
    }

    static clearCarrito() {
        return Storage.remove('carrito');
    }

    static getCarritoCount() {
        const carrito = this.getCarrito();
        return carrito.reduce((total, item) => total + item.cantidad, 0);
    }

    /**
     * 👤 Gestión de usuario
     */
    static getUser() {
        return Storage.get('user', null, { schema: 'user' });
    }

    static setUser(user) {
        return Storage.set('user', {
            ...user,
            lastLogin: Date.now()
        }, { schema: 'user' });
    }

    static removeUser() {
        return Storage.remove('user');
    }

    static isLoggedIn() {
        const user = this.getUser();
        return user !== null;
    }

    /**
     * ⚙️ Gestión de preferencias
     */
    static getPreferences() {
        return Storage.get('preferences', {
            theme: 'light',
            backgroundColor: '#f4f1ee',
            notifications: true,
            language: 'es',
            currency: 'ARS'
        }, { schema: 'preferences' });
    }

    static setPreferences(preferences) {
        return Storage.set('preferences', preferences, { schema: 'preferences' });
    }

    static updatePreference(key, value) {
        const preferences = this.getPreferences();
        preferences[key] = value;
        return this.setPreferences(preferences);
    }

    /**
     * 🎨 Gestión de tema y colores
     */
    static setTheme(theme) {
        const success = this.updatePreference('theme', theme);
        if (success) {
            document.body.className = document.body.className.replace(/theme-\w+/g, '');
            document.body.classList.add(`theme-${theme}`);
        }
        return success;
    }

    static setBackgroundColor(color) {
        const success = this.updatePreference('backgroundColor', color);
        if (success) {
            document.body.style.backgroundColor = color;
            Storage.dispatchEvent('backgroundColorChanged', { color });
        }
        return success;
    }

    /**
     * 📊 Gestión de sesión
     */
    static setSession(token, userId, expiresIn = 24 * 60 * 60 * 1000) {
        return Storage.set('session', {
            token,
            userId,
            expiresAt: Date.now() + expiresIn
        }, { 
            schema: 'session',
            ttl: expiresIn
        });
    }

    static getSession() {
        return Storage.get('session', null, { schema: 'session' });
    }

    static clearSession() {
        return Storage.remove('session');
    }

    /**
     * 🔧 Utilidades
     */
    static exportAll() {
        return Storage.exportData();
    }

    static importAll(data) {
        return Storage.importData(data);
    }

    static getStats() {
        return Storage.getStats();
    }

    static cleanup() {
        return Storage.cleanup();
    }
}

// Exponer API simplificada globalmente
window.QuickStorage = QuickStorage;

console.log('🗄️ Sistema de Storage avanzado inicializado');

/**
 * 📚 EJEMPLOS DE USO:
 * 
 * // Carrito
 * QuickStorage.addToCarrito({ nombre: 'Jarro', precio: 21900, cantidad: 1 });
 * const count = QuickStorage.getCarritoCount();
 * 
 * // Usuario
 * QuickStorage.setUser({ email: 'user@example.com', firstName: 'Juan' });
 * const isLogged = QuickStorage.isLoggedIn();
 * 
 * // Preferencias
 * QuickStorage.setTheme('dark');
 * QuickStorage.setBackgroundColor('#2c3e50');
 * 
 * // Eventos
 * Storage.addEventListener('dataSet', (data) => console.log('Datos guardados:', data));
 * 
 * // Estadísticas
 * const stats = QuickStorage.getStats();
 * console.log('Uso de storage:', stats);
 */