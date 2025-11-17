/**
 * 🧪 SISTEMA DE PRUEBAS PARA PATAGONIA STORE
 * Pruebas unitarias con casos edge y escenarios reales
 */

class StoreTests {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.logger = window.logger || console;
  }

  /**
   * Ejecuta todas las pruebas
   */
  async runAll() {
    this.logger.banner('🧪 INICIANDO PRUEBAS DE STORE', 'info');
    this.logger.separator('PRUEBAS');

    // Pruebas de validación
    this.testValidators();
    
    // Pruebas de cálculos
    this.testCalculations();
    
    // Pruebas de carrito
    this.testCartOperations();
    
    // Pruebas de búsqueda
    this.testSearch();
    
    // Pruebas de casos edge
    this.testEdgeCases();

    // Resumen
    this.printSummary();
  }

  /**
   * Prueba una función
   */
  test(name, testFunction) {
    try {
      const result = testFunction();
      if (result === true || (result && result.success !== false)) {
        this.passed++;
        this.logger.success(`✅ ${name}`);
        return true;
      } else {
        this.failed++;
        this.logger.error(`❌ ${name}: ${result.message || 'Falló'}`);
        return false;
      }
    } catch (error) {
      this.failed++;
      this.logger.error(`❌ ${name}: ${error.message}`, error);
      return false;
    }
  }

  /**
   * Pruebas de validadores
   */
  testValidators() {
    this.logger.group('Pruebas de Validadores', () => {
      const Validators = window.Validators;

      // Test: División por cero
      this.test('División por cero retorna valor por defecto', () => {
        if (!Validators) return { success: false, message: 'Validators no disponible' };
        const result = Validators.safeDivide(10, 0, 0);
        return result === 0;
      });

      // Test: División normal
      this.test('División normal funciona correctamente', () => {
        if (!Validators) return { success: false, message: 'Validators no disponible' };
        const result = Validators.safeDivide(10, 2, 0);
        return result === 5;
      });

      // Test: Números inválidos
      this.test('Números inválidos retornan valor por defecto', () => {
        if (!Validators) return { success: false, message: 'Validators no disponible' };
        const result1 = Validators.safeDivide(NaN, 2, 0);
        const result2 = Validators.safeDivide(10, NaN, 0);
        const result3 = Validators.safeDivide(Infinity, 2, 0);
        return result1 === 0 && result2 === 0 && result3 === 0;
      });

      // Test: Validar número positivo
      this.test('Validar número positivo', () => {
        if (!Validators) return { success: false, message: 'Validators no disponible' };
        return Validators.isPositiveNumber(10) === true &&
               Validators.isPositiveNumber(0) === false &&
               Validators.isPositiveNumber(-5) === false &&
               Validators.isPositiveNumber('10') === false;
      });

      // Test: Validar email
      this.test('Validar email', () => {
        if (!Validators) return { success: false, message: 'Validators no disponible' };
        return Validators.isValidEmail('test@example.com') === true &&
               Validators.isValidEmail('invalid-email') === false &&
               Validators.isValidEmail('') === false &&
               Validators.isValidEmail(null) === false;
      });

      // Test: Validar producto
      this.test('Validar producto completo', () => {
        if (!Validators) return { success: false, message: 'Validators no disponible' };
        const productoValido = {
          id: 1,
          nombre: 'Test Product',
          precio: 100
        };
        const productoInvalido1 = { id: 1 }; // Falta nombre y precio
        const productoInvalido2 = { id: -1, nombre: 'Test', precio: 100 }; // ID inválido
        const productoInvalido3 = { id: 1, nombre: 'Test', precio: -10 }; // Precio negativo

        return Validators.isValidProduct(productoValido) === true &&
               Validators.isValidProduct(productoInvalido1) === false &&
               Validators.isValidProduct(productoInvalido2) === false &&
               Validators.isValidProduct(productoInvalido3) === false;
      });
    });
  }

  /**
   * Pruebas de cálculos
   */
  testCalculations() {
    this.logger.group('Pruebas de Cálculos', () => {
      const Helpers = window.Helpers;

      // Test: Formatear precio
      this.test('Formatear precio correctamente', () => {
        if (!Helpers) return { success: false, message: 'Helpers no disponible' };
        const precio1 = Helpers.formatPrice(21900);
        const precio2 = Helpers.formatPrice(0);
        const precio3 = Helpers.formatPrice(null);
        return precio1.includes('21') &&
               precio2.includes('0') &&
               precio3.includes('0');
      });

      // Test: Calcular descuento
      this.test('Calcular porcentaje de descuento', () => {
        if (!Helpers) return { success: false, message: 'Helpers no disponible' };
        const descuento = Helpers.calculateDiscountPercentage(100, 80);
        return descuento === 20;
      });

      // Test: Calcular precio con descuento
      this.test('Calcular precio con descuento', () => {
        if (!Helpers) return { success: false, message: 'Helpers no disponible' };
        const precio = Helpers.calculateDiscountedPrice(100, 20);
        return precio === 80;
      });

      // Test: Descuento del 100%
      this.test('Descuento del 100% retorna 0', () => {
        if (!Helpers) return { success: false, message: 'Helpers no disponible' };
        const precio = Helpers.calculateDiscountedPrice(100, 100);
        return precio === 0;
      });

      // Test: Descuento mayor a 100%
      this.test('Descuento mayor a 100% se limita a 100%', () => {
        if (!Helpers) return { success: false, message: 'Helpers no disponible' };
        const precio = Helpers.calculateDiscountedPrice(100, 150);
        return precio === 0;
      });
    });
  }

  /**
   * Pruebas de operaciones de carrito
   */
  testCartOperations() {
    this.logger.group('Pruebas de Carrito', () => {
      // Crear instancia de store para pruebas
      const store = new PatagoniaStore();
      
      // Limpiar carrito antes de las pruebas
      store.carrito = [];

      // Test: Agregar producto válido
      this.test('Agregar producto válido al carrito', () => {
        store.productos = [{
          id: 1,
          nombre: 'Test Product',
          precio: 100,
          stock: 10,
          disponible: true,
          imagenes: ['test.jpg']
        }];
        
        const result = store.agregarAlCarrito(1);
        return result === true && store.carrito.length === 1;
      });

      // Test: Agregar producto sin stock
      this.test('No agregar producto sin stock', () => {
        store.carrito = [];
        store.productos = [{
          id: 2,
          nombre: 'Test Product 2',
          precio: 100,
          stock: 0,
          disponible: true,
          imagenes: ['test.jpg']
        }];
        
        const result = store.agregarAlCarrito(2);
        return result === false && store.carrito.length === 0;
      });

      // Test: Agregar producto no disponible
      this.test('No agregar producto no disponible', () => {
        store.carrito = [];
        store.productos = [{
          id: 3,
          nombre: 'Test Product 3',
          precio: 100,
          stock: 10,
          disponible: false,
          imagenes: ['test.jpg']
        }];
        
        const result = store.agregarAlCarrito(3);
        return result === false && store.carrito.length === 0;
      });

      // Test: Incrementar cantidad de producto existente
      this.test('Incrementar cantidad de producto existente', () => {
        store.carrito = [{
          id: 1,
          nombre: 'Test Product',
          precio: 100,
          cantidad: 1,
          imagen: 'test.jpg'
        }];
        store.productos = [{
          id: 1,
          nombre: 'Test Product',
          precio: 100,
          stock: 10,
          disponible: true,
          imagenes: ['test.jpg']
        }];
        
        const result = store.agregarAlCarrito(1);
        return result === true && store.carrito[0].cantidad === 2;
      });

      // Test: No exceder stock disponible
      this.test('No exceder stock disponible', () => {
        store.carrito = [{
          id: 1,
          nombre: 'Test Product',
          precio: 100,
          cantidad: 5,
          imagen: 'test.jpg'
        }];
        store.productos = [{
          id: 1,
          nombre: 'Test Product',
          precio: 100,
          stock: 5,
          disponible: true,
          imagenes: ['test.jpg']
        }];
        
        const result = store.agregarAlCarrito(1);
        return result === false && store.carrito[0].cantidad === 5;
      });

      // Test: Calcular total correctamente
      this.test('Calcular total del carrito', () => {
        store.carrito = [
          { id: 1, precio: 100, cantidad: 2 },
          { id: 2, precio: 200, cantidad: 1 }
        ];
        
        const total = store.calcularTotal();
        return total === 400; // (100 * 2) + (200 * 1)
      });

      // Test: Calcular total con carrito vacío
      this.test('Calcular total con carrito vacío retorna 0', () => {
        store.carrito = [];
        const total = store.calcularTotal();
        return total === 0;
      });

      // Test: Eliminar producto del carrito
      this.test('Eliminar producto del carrito', () => {
        store.carrito = [
          { id: 1, nombre: 'Product 1', precio: 100, cantidad: 1, imagen: 'test.jpg' },
          { id: 2, nombre: 'Product 2', precio: 200, cantidad: 1, imagen: 'test.jpg' }
        ];
        
        const result = store.eliminarDelCarrito(1);
        return result === true && store.carrito.length === 1 && store.carrito[0].id === 2;
      });

      // Test: Cambiar cantidad de producto
      this.test('Cambiar cantidad de producto', () => {
        store.carrito = [{
          id: 1,
          nombre: 'Test Product',
          precio: 100,
          cantidad: 1,
          imagen: 'test.jpg'
        }];
        store.productos = [{
          id: 1,
          nombre: 'Test Product',
          precio: 100,
          stock: 10,
          disponible: true,
          imagenes: ['test.jpg']
        }];
        
        const result = store.cambiarCantidad(1, 5);
        return result === true && store.carrito[0].cantidad === 5;
      });

      // Test: Eliminar producto cuando cantidad es 0
      this.test('Eliminar producto cuando cantidad es 0', () => {
        store.carrito = [{
          id: 1,
          nombre: 'Test Product',
          precio: 100,
          cantidad: 1,
          imagen: 'test.jpg'
        }];
        store.productos = [{
          id: 1,
          nombre: 'Test Product',
          precio: 100,
          stock: 10,
          disponible: true,
          imagenes: ['test.jpg']
        }];
        
        const result = store.cambiarCantidad(1, 0);
        return result === true && store.carrito.length === 0;
      });
    });
  }

  /**
   * Pruebas de búsqueda
   */
  testSearch() {
    this.logger.group('Pruebas de Búsqueda', () => {
      const store = new PatagoniaStore();
      
      store.productos = [
        { id: 1, nombre: 'Jarro Zorrito', descripcionCorta: 'Jarro enlozado', categoria: 'jarros', tags: ['patagonia'] },
        { id: 2, nombre: 'Cuaderno Zorro', descripcionCorta: 'Cuaderno anillado', categoria: 'papeleria', tags: ['patagonia', 'zorro'] },
        { id: 3, nombre: 'Yerbera Bariloche', descripcionCorta: 'Yerbera ilustrada', categoria: 'accesorios', tags: ['bariloche'] }
      ];

      // Test: Búsqueda por nombre
      this.test('Buscar producto por nombre', () => {
        const resultados = store.buscarProductos('Jarro');
        return resultados.length === 1 && resultados[0].id === 1;
      });

      // Test: Búsqueda por descripción
      this.test('Buscar producto por descripción', () => {
        const resultados = store.buscarProductos('enlozado');
        return resultados.length === 1 && resultados[0].id === 1;
      });

      // Test: Búsqueda por categoría
      this.test('Buscar producto por categoría', () => {
        const resultados = store.buscarProductos('jarros');
        return resultados.length === 1 && resultados[0].id === 1;
      });

      // Test: Búsqueda por tags
      this.test('Buscar producto por tags', () => {
        const resultados = store.buscarProductos('patagonia');
        return resultados.length === 2; // Jarro y Cuaderno tienen tag 'patagonia'
      });

      // Test: Búsqueda sin resultados
      this.test('Búsqueda sin resultados', () => {
        const resultados = store.buscarProductos('xyz123');
        return resultados.length === 0;
      });

      // Test: Búsqueda case insensitive
      this.test('Búsqueda case insensitive', () => {
        const resultados1 = store.buscarProductos('JARRO');
        const resultados2 = store.buscarProductos('jarro');
        return resultados1.length === 1 && resultados2.length === 1;
      });

      // Test: Búsqueda con término muy corto
      this.test('Búsqueda con término muy corto retorna array vacío', () => {
        const resultados = store.buscarProductos('a');
        return resultados.length === 0;
      });

      // Test: Búsqueda con término vacío
      this.test('Búsqueda con término vacío retorna array vacío', () => {
        const resultados = store.buscarProductos('');
        return resultados.length === 0;
      });
    });
  }

  /**
   * Pruebas de casos edge
   */
  testEdgeCases() {
    this.logger.group('Pruebas de Casos Edge', () => {
      const store = new PatagoniaStore();

      // Test: Producto con ID inválido
      this.test('Agregar producto con ID inválido', () => {
        const result = store.agregarAlCarrito(null);
        return result === false;
      });

      // Test: Producto con ID negativo
      this.test('Agregar producto con ID negativo', () => {
        const result = store.agregarAlCarrito(-1);
        return result === false;
      });

      // Test: Producto inexistente
      this.test('Agregar producto inexistente', () => {
        store.productos = [];
        const result = store.agregarAlCarrito(999);
        return result === false;
      });

      // Test: Carrito con items inválidos
      this.test('Calcular total con items inválidos', () => {
        store.carrito = [
          { id: 1, precio: 100, cantidad: 2 },
          { id: 2, precio: null, cantidad: 1 }, // Precio inválido
          { id: 3, precio: 200, cantidad: 'abc' } // Cantidad inválida
        ];
        
        const total = store.calcularTotal();
        // Debe calcular solo los items válidos
        return total === 200; // Solo el primer item es válido
      });

      // Test: Descuento con total 0
      this.test('Calcular descuento con total 0', () => {
        store.carrito = [];
        const descuento = store.calcularDescuentoTransferencia();
        return descuento === 0;
      });

      // Test: Descuento con configuración inválida
      this.test('Calcular descuento con configuración inválida', () => {
        store.carrito = [{ id: 1, precio: 100, cantidad: 1 }];
        store.configuracion = { descuentoTransferencia: null };
        const descuento = store.calcularDescuentoTransferencia();
        // Debe usar valor por defecto (10%)
        return descuento === 10;
      });

      // Test: Cambiar cantidad a valor negativo
      this.test('Cambiar cantidad a valor negativo elimina producto', () => {
        store.carrito = [{
          id: 1,
          nombre: 'Test Product',
          precio: 100,
          cantidad: 1,
          imagen: 'test.jpg'
        }];
        store.productos = [{
          id: 1,
          nombre: 'Test Product',
          precio: 100,
          stock: 10,
          disponible: true,
          imagenes: ['test.jpg']
        }];
        
        const result = store.cambiarCantidad(1, -5);
        return result === true && store.carrito.length === 0;
      });

      // Test: Cambiar cantidad a valor muy grande
      this.test('Cambiar cantidad a valor muy grande se ajusta a stock', () => {
        store.carrito = [{
          id: 1,
          nombre: 'Test Product',
          precio: 100,
          cantidad: 1,
          imagen: 'test.jpg'
        }];
        store.productos = [{
          id: 1,
          nombre: 'Test Product',
          precio: 100,
          stock: 5,
          disponible: true,
          imagenes: ['test.jpg']
        }];
        
        const result = store.cambiarCantidad(1, 100);
        return result === true && store.carrito[0].cantidad === 5; // Ajustado a stock máximo
      });

      // Test: Renderizar productos con array vacío
      this.test('Renderizar productos con array vacío', () => {
        store.productos = [];
        // No debe lanzar error
        try {
          store.renderizarProductos([]);
          return true;
        } catch (error) {
          return false;
        }
      });

      // Test: Renderizar productos con productos inválidos
      this.test('Renderizar productos omite productos inválidos', () => {
        store.productos = [
          { id: 1, nombre: 'Valid Product', precio: 100 },
          { id: null, nombre: 'Invalid Product' }, // Sin precio
          { id: 2, precio: 200 } // Sin nombre
        ];
        // No debe lanzar error
        try {
          store.renderizarProductos(store.productos);
          return true;
        } catch (error) {
          return false;
        }
      });
    });
  }

  /**
   * Imprime resumen de pruebas
   */
  printSummary() {
    this.logger.separator('RESUMEN');
    const total = this.passed + this.failed;
    const porcentaje = total > 0 ? Math.round((this.passed / total) * 100) : 0;

    this.logger.info(`Total de pruebas: ${total}`);
    this.logger.success(`Pruebas exitosas: ${this.passed}`);
    
    if (this.failed > 0) {
      this.logger.error(`Pruebas fallidas: ${this.failed}`);
    }
    
    this.logger.info(`Porcentaje de éxito: ${porcentaje}%`);

    if (porcentaje === 100) {
      this.logger.banner('🎉 TODAS LAS PRUEBAS PASARON', 'success');
    } else if (porcentaje >= 80) {
      this.logger.banner('⚠️ ALGUNAS PRUEBAS FALLARON', 'warning');
    } else {
      this.logger.banner('❌ MUCHAS PRUEBAS FALLARON', 'error');
    }
  }
}

// Ejecutar pruebas cuando se carga la página (solo en modo desarrollo)
if (window.DEBUG_MODE || window.location.search.includes('test=true')) {
  document.addEventListener('DOMContentLoaded', () => {
    const tests = new StoreTests();
    tests.runAll();
  });
}

// Exportar para uso en consola
window.StoreTests = StoreTests;

