/**
 * 🗄️ UTILIDADES DE STORAGE CENTRALIZADAS
 * Para eliminar repetición de código en localStorage
 */

class StorageUtils {
  constructor() {
    this.namespace = 'patagonia';
  }

  /**
   * Guardar datos con validación y logging
   */
  save(key, data, options = {}) {
    try {
      const fullKey = `${this.namespace}_${key}`;
      const serializedData = JSON.stringify(data);
      
      // Validar tamaño (localStorage tiene límite ~5MB)
      if (serializedData.length > 5000000) {
        console.warn(`⚠️ STORAGE: Datos muy grandes para ${key} (${serializedData.length} chars)`);
        return false;
      }

      localStorage.setItem(fullKey, serializedData);
      
      if (options.log !== false) {
        console.log(`💾 STORAGE: Guardado ${key}`, {
          size: `${(serializedData.length / 1024).toFixed(2)}KB`,
          timestamp: new Date().toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error(`❌ STORAGE: Error guardando ${key}:`, error);
      return false;
    }
  }

  /**
   * Cargar datos con fallback
   */
  load(key, fallback = null) {
    try {
      const fullKey = `${this.namespace}_${key}`;
      const data = localStorage.getItem(fullKey);
      
      if (data === null) {
        console.log(`ℹ️ STORAGE: ${key} no encontrado, usando fallback`);
        return fallback;
      }

      const parsed = JSON.parse(data);
      console.log(`📂 STORAGE: Cargado ${key}`, {
        type: typeof parsed,
        isArray: Array.isArray(parsed),
        keys: typeof parsed === 'object' ? Object.keys(parsed).length : 'N/A'
      });
      
      return parsed;
    } catch (error) {
      console.error(`❌ STORAGE: Error cargando ${key}:`, error);
      return fallback;
    }
  }

  /**
   * Eliminar datos
   */
  remove(key) {
    try {
      const fullKey = `${this.namespace}_${key}`;
      localStorage.removeItem(fullKey);
      console.log(`🗑️ STORAGE: Eliminado ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ STORAGE: Error eliminando ${key}:`, error);
      return false;
    }
  }

  /**
   * Limpiar todos los datos de Patagonia
   */
  clearAll() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${this.namespace}_`)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`🧹 STORAGE: Limpiadas ${keysToRemove.length} claves de ${this.namespace}`);
      return true;
    } catch (error) {
      console.error('❌ STORAGE: Error limpiando datos:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas de uso
   */
  getStats() {
    const stats = {
      totalKeys: 0,
      totalSize: 0,
      keys: []
    };

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${this.namespace}_`)) {
          const value = localStorage.getItem(key);
          const size = new Blob([value]).size;
          
          stats.totalKeys++;
          stats.totalSize += size;
          stats.keys.push({
            key: key.replace(`${this.namespace}_`, ''),
            size: size,
            sizeFormatted: `${(size / 1024).toFixed(2)}KB`
          });
        }
      }

      stats.totalSizeFormatted = `${(stats.totalSize / 1024).toFixed(2)}KB`;
      
      console.table(stats.keys);
      console.log(`📊 STORAGE STATS: ${stats.totalKeys} claves, ${stats.totalSizeFormatted}`);
      
      return stats;
    } catch (error) {
      console.error('❌ STORAGE: Error obteniendo stats:', error);
      return stats;
    }
  }
}

// Instancia global
window.storageUtils = new StorageUtils();

// Métodos de conveniencia
window.saveToStorage = (key, data) => window.storageUtils.save(key, data);
window.loadFromStorage = (key, fallback) => window.storageUtils.load(key, fallback);
window.removeFromStorage = (key) => window.storageUtils.remove(key);

console.log('🚀 StorageUtils inicializado correctamente');