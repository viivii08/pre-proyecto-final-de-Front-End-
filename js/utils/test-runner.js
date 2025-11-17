/**
 * 🧪 RUNNER DE PRUEBAS MEJORADO
 * Ejecuta pruebas y muestra resultados de forma clara y visual
 */

class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Agrega una prueba
   */
  addTest(name, testFunction, expectedResult = true) {
    this.tests.push({
      name,
      testFunction,
      expectedResult,
      category: 'general'
    });
    return this;
  }

  /**
   * Agrega una prueba en una categoría
   */
  addTestInCategory(category, name, testFunction, expectedResult = true) {
    this.tests.push({
      name,
      testFunction,
      expectedResult,
      category
    });
    return this;
  }

  /**
   * Ejecuta todas las pruebas
   */
  async runAll() {
    this.startTime = performance.now();
    this.results = [];

    const logger = window.logger || console;
    logger.banner('🧪 EJECUTANDO PRUEBAS', 'info');

    // Agrupar pruebas por categoría
    const testsByCategory = this.groupTestsByCategory();

    // Ejecutar pruebas por categoría
    for (const [category, tests] of Object.entries(testsByCategory)) {
      logger.group(`📦 ${category} (${tests.length} pruebas)`, () => {
        for (const test of tests) {
          this.runTest(test, logger);
        }
      });
    }

    this.endTime = performance.now();
    this.printSummary(logger);
  }

  /**
   * Agrupa pruebas por categoría
   */
  groupTestsByCategory() {
    const grouped = {};
    for (const test of this.tests) {
      if (!grouped[test.category]) {
        grouped[test.category] = [];
      }
      grouped[test.category].push(test);
    }
    return grouped;
  }

  /**
   * Ejecuta una prueba individual
   */
  runTest(test, logger) {
    try {
      const startTime = performance.now();
      const result = test.testFunction();
      const endTime = performance.now();
      const duration = endTime - startTime;

      const passed = this.compareResults(result, test.expectedResult);

      this.results.push({
        name: test.name,
        category: test.category,
        passed,
        result,
        expectedResult: test.expectedResult,
        duration,
        error: null
      });

      if (passed) {
        logger.success(`✅ ${test.name} (${duration.toFixed(2)}ms)`);
      } else {
        logger.error(`❌ ${test.name}`, {
          expected: test.expectedResult,
          actual: result
        });
      }
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - performance.now();

      this.results.push({
        name: test.name,
        category: test.category,
        passed: false,
        result: null,
        expectedResult: test.expectedResult,
        duration,
        error: error.message
      });

      logger.error(`❌ ${test.name}: ${error.message}`, error);
    }
  }

  /**
   * Compara resultados
   */
  compareResults(actual, expected) {
    if (expected === true) {
      return actual === true || (actual && actual.success !== false);
    }
    if (typeof expected === 'function') {
      return expected(actual);
    }
    return actual === expected;
  }

  /**
   * Imprime resumen
   */
  printSummary(logger) {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const duration = this.endTime - this.startTime;
    const porcentaje = total > 0 ? Math.round((passed / total) * 100) : 0;

    logger.separator('RESUMEN DE PRUEBAS');

    // Estadísticas generales
    logger.info(`⏱️  Tiempo total: ${duration.toFixed(2)}ms`);
    logger.info(`📊 Total de pruebas: ${total}`);
    logger.success(`✅ Pruebas exitosas: ${passed}`);
    
    if (failed > 0) {
      logger.error(`❌ Pruebas fallidas: ${failed}`);
    }

    // Estadísticas por categoría
    const statsByCategory = this.getStatsByCategory();
    logger.group('📦 Estadísticas por categoría', () => {
      for (const [category, stats] of Object.entries(statsByCategory)) {
        const categoryPercentage = stats.total > 0 
          ? Math.round((stats.passed / stats.total) * 100) 
          : 0;
        logger.info(`${category}: ${stats.passed}/${stats.total} (${categoryPercentage}%)`);
      }
    });

    // Pruebas fallidas
    if (failed > 0) {
      logger.group('❌ Pruebas fallidas', () => {
        const failedTests = this.results.filter(r => !r.passed);
        for (const test of failedTests) {
          logger.error(`${test.name}`, {
            expected: test.expectedResult,
            actual: test.result,
            error: test.error
          });
        }
      });
    }

    // Rendimiento
    const slowTests = this.results
      .filter(r => r.duration > 100)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    if (slowTests.length > 0) {
      logger.group('🐌 Pruebas lentas (>100ms)', () => {
        for (const test of slowTests) {
          logger.warning(`${test.name}: ${test.duration.toFixed(2)}ms`);
        }
      });
    }

    // Banner final
    if (porcentaje === 100) {
      logger.banner('🎉 TODAS LAS PRUEBAS PASARON', 'success');
    } else if (porcentaje >= 80) {
      logger.banner('⚠️ ALGUNAS PRUEBAS FALLARON', 'warning');
    } else {
      logger.banner('❌ MUCHAS PRUEBAS FALLARON', 'error');
    }

    // Retornar resultados para análisis
    return {
      total,
      passed,
      failed,
      porcentaje,
      duration,
      results: this.results
    };
  }

  /**
   * Obtiene estadísticas por categoría
   */
  getStatsByCategory() {
    const stats = {};
    for (const result of this.results) {
      if (!stats[result.category]) {
        stats[result.category] = { total: 0, passed: 0, failed: 0 };
      }
      stats[result.category].total++;
      if (result.passed) {
        stats[result.category].passed++;
      } else {
        stats[result.category].failed++;
      }
    }
    return stats;
  }

  /**
   * Ejecuta pruebas de una categoría específica
   */
  runCategory(category) {
    const categoryTests = this.tests.filter(t => t.category === category);
    const originalTests = this.tests;
    this.tests = categoryTests;
    this.runAll();
    this.tests = originalTests;
  }

  /**
   * Limpia todas las pruebas
   */
  clear() {
    this.tests = [];
    this.results = [];
    return this;
  }
}

// Crear instancia global
window.TestRunner = TestRunner;

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestRunner;
}

