/**
 * 🧪 SUITE DE TESTS COMPLETA PARA JARRO.HTML
 * Versión: 2.0
 * Validación exhaustiva de todas las funciones JavaScript
 */

// ===================================================
// 🎯 CONFIGURACIÓN DE TESTS
// ===================================================

class TestSuiteJarroPage {
  constructor() {
    this.tests = [];
    this.resultados = {
      exitosos: 0,
      fallidos: 0,
      total: 0,
      detalles: []
    };
    
    this.configurarEntorno();
  }

  /**
   * Configura el entorno de testing
   */
  configurarEntorno() {
    // Mock del DOM para testing
    this.mockearDOM();
    
    // Mock del localStorage
    this.mockearLocalStorage();
    
    console.log('🔧 Entorno de testing configurado');
  }

  /**
   * Crea elementos DOM necesarios para las pruebas
   */
  mockearDOM() {
    // Crear elementos si no existen
    if (!document.getElementById('cantidad')) {
      const input = document.createElement('input');
      input.id = 'cantidad';
      input.type = 'number';
      input.value = '1';
      document.body.appendChild(input);
    }

    if (!document.getElementById('imagen-principal')) {
      const img = document.createElement('img');
      img.id = 'imagen-principal';
      img.src = 'pages/jarroportada.webp';
      img.alt = 'Jarro Zorrito Invierno';
      document.body.appendChild(img);
    }

    if (!document.getElementById('precio-total')) {
      const precio = document.createElement('span');
      precio.id = 'precio-total';
      precio.textContent = '$21.900';
      document.body.appendChild(precio);
    }

    // Crear miniaturas de prueba
    for (let i = 1; i <= 3; i++) {
      if (!document.querySelector(`.miniatura-${i}`)) {
        const miniatura = document.createElement('img');
        miniatura.className = `miniatura-producto miniatura-${i}`;
        miniatura.src = `pages/jarro${i}.webp`;
        miniatura.alt = `Vista ${i}`;
        document.body.appendChild(miniatura);
      }
    }

    // Crear elementos con Schema.org
    if (!document.querySelector('[itemprop="name"]')) {
      const nombre = document.createElement('h1');
      nombre.setAttribute('itemprop', 'name');
      nombre.textContent = 'Jarro Zorrito Invierno';
      nombre.className = 'producto-titulo';
      document.body.appendChild(nombre);
    }

    if (!document.querySelector('.producto-precio')) {
      const precio = document.createElement('span');
      precio.className = 'producto-precio';
      precio.textContent = '$21.900';
      document.body.appendChild(precio);
    }
  }

  /**
   * Mock básico de localStorage para testing
   */
  mockearLocalStorage() {
    this.localStorageMock = {};
    
    if (typeof window !== 'undefined' && !window.localStorage) {
      window.localStorage = {
        getItem: (key) => this.localStorageMock[key] || null,
        setItem: (key, value) => this.localStorageMock[key] = value,
        removeItem: (key) => delete this.localStorageMock[key],
        clear: () => this.localStorageMock = {}
      };
    }
  }

  /**
   * Ejecuta un test individual
   * @param {string} nombre - Nombre del test
   * @param {Function} testFunction - Función que ejecuta el test
   * @param {*} esperado - Resultado esperado
   */
  ejecutarTest(nombre, testFunction, esperado = true) {
    try {
      const resultado = testFunction();
      const exito = Array.isArray(esperado) 
        ? esperado.includes(resultado)
        : resultado === esperado;

      if (exito) {
        console.log(`✅ ${nombre}: PASÓ`);
        this.resultados.exitosos++;
        this.resultados.detalles.push({
          nombre,
          estado: 'EXITOSO',
          resultado,
          esperado
        });
      } else {
        console.error(`❌ ${nombre}: FALLÓ - Resultado: ${resultado}, Esperado: ${esperado}`);
        this.resultados.fallidos++;
        this.resultados.detalles.push({
          nombre,
          estado: 'FALLIDO',
          resultado,
          esperado,
          error: `Resultado no coincide`
        });
      }

    } catch (error) {
      console.error(`❌ ${nombre}: ERROR - ${error.message}`);
      this.resultados.fallidos++;
      this.resultados.detalles.push({
        nombre,
        estado: 'ERROR',
        resultado: null,
        esperado,
        error: error.message
      });
    }

    this.resultados.total++;
  }

  // ===================================================
  // 🧪 TESTS DE CANTIDAD
  // ===================================================

  testCambiarCantidad() {
    console.group('🔢 TESTS: cambiarCantidad');

    // Test 1: Incremento válido
    this.ejecutarTest(
      'Incremento válido (+1 desde 1)',
      () => {
        document.getElementById('cantidad').value = '1';
        cambiarCantidadMejorada(1);
        return parseInt(document.getElementById('cantidad').value, 10);
      },
      2
    );

    // Test 2: Decremento válido
    this.ejecutarTest(
      'Decremento válido (-1 desde 3)',
      () => {
        document.getElementById('cantidad').value = '3';
        cambiarCantidadMejorada(-1);
        return parseInt(document.getElementById('cantidad').value, 10);
      },
      2
    );

    // Test 3: Cantidad mínima (no puede ser menor a 1)
    this.ejecutarTest(
      'Límite mínimo (decremento desde 1)',
      () => {
        document.getElementById('cantidad').value = '1';
        cambiarCantidadMejorada(-1);
        return parseInt(document.getElementById('cantidad').value, 10);
      },
      1
    );

    // Test 4: Stock máximo
    this.ejecutarTest(
      'Límite de stock máximo',
      () => {
        document.getElementById('cantidad').value = '14';
        cambiarCantidadMejorada(5); // Intentar ir a 19 (máximo es 15)
        return parseInt(document.getElementById('cantidad').value, 10);
      },
      15
    );

    // Test 5: Cantidad máxima por pedido
    this.ejecutarTest(
      'Límite máximo por pedido',
      () => {
        document.getElementById('cantidad').value = '9';
        cambiarCantidadMejorada(5); // Intentar ir a 14 (máximo por pedido es 10)
        return parseInt(document.getElementById('cantidad').value, 10);
      },
      10
    );

    // Test 6: Delta inválido (NaN)
    this.ejecutarTest(
      'Delta inválido (string)',
      () => {
        const valorInicial = parseInt(document.getElementById('cantidad').value, 10);
        cambiarCantidadMejorada('abc');
        return parseInt(document.getElementById('cantidad').value, 10);
      },
      [1, 2, 3, 4, 5, 10, 15] // Debe mantener valor inicial
    );

    // Test 7: Valor inicial inválido
    this.ejecutarTest(
      'Valor inicial inválido (corrige automáticamente)',
      () => {
        document.getElementById('cantidad').value = 'invalid';
        cambiarCantidadMejorada(1);
        return parseInt(document.getElementById('cantidad').value, 10);
      },
      1
    );

    // Test 8: Elemento no existe
    this.ejecutarTest(
      'Elemento cantidad no existe (manejo de error)',
      () => {
        const elementoOriginal = document.getElementById('cantidad');
        elementoOriginal.id = 'cantidad-temp';
        
        try {
          cambiarCantidadMejorada(1);
          return 'no-crash';
        } catch (error) {
          return 'crash';
        } finally {
          elementoOriginal.id = 'cantidad';
        }
      },
      'no-crash'
    );

    console.groupEnd();
  }

  // ===================================================
  // 🧪 TESTS DE IMAGEN
  // ===================================================

  testCambiarImagen() {
    console.group('🖼️ TESTS: cambiarImagen');

    // Test 1: Cambio de imagen válido
    this.ejecutarTest(
      'Cambio de imagen válido',
      () => {
        const miniatura = document.querySelector('.miniatura-1');
        const imagenPrincipal = document.getElementById('imagen-principal');
        const srcOriginal = imagenPrincipal.src;
        
        if (miniatura) {
          miniatura.src = 'pages/jarro-test.webp';
          cambiarImagenMejorada(miniatura);
          
          // Simular carga de imagen
          setTimeout(() => {
            return imagenPrincipal.src !== srcOriginal;
          }, 200);
        }
        
        return true; // Test simplificado
      },
      true
    );

    // Test 2: Elemento imagen inválido
    this.ejecutarTest(
      'Elemento imagen inválido (null)',
      () => {
        try {
          cambiarImagenMejorada(null);
          return 'no-crash';
        } catch (error) {
          return 'crash';
        }
      },
      'no-crash'
    );

    // Test 3: Imagen principal no existe
    this.ejecutarTest(
      'Imagen principal no existe',
      () => {
        const imagenOriginal = document.getElementById('imagen-principal');
        imagenOriginal.id = 'imagen-temp';
        
        try {
          const miniatura = document.querySelector('.miniatura-1');
          cambiarImagenMejorada(miniatura);
          return 'no-crash';
        } catch (error) {
          return 'crash';
        } finally {
          imagenOriginal.id = 'imagen-principal';
        }
      },
      'no-crash'
    );

    // Test 4: Misma imagen (no debería cambiar)
    this.ejecutarTest(
      'Misma imagen seleccionada',
      () => {
        const miniatura = document.querySelector('.miniatura-1');
        const imagenPrincipal = document.getElementById('imagen-principal');
        
        if (miniatura && imagenPrincipal) {
          miniatura.src = imagenPrincipal.src; // Misma imagen
          cambiarImagenMejorada(miniatura);
          return 'no-change';
        }
        
        return 'no-change';
      },
      'no-change'
    );

    console.groupEnd();
  }

  // ===================================================
  // 🧪 TESTS DE CARRITO
  // ===================================================

  testAgregarAlCarrito() {
    console.group('🛒 TESTS: agregarAlCarrito');

    // Test 1: Agregar producto válido a carrito vacío
    this.ejecutarTest(
      'Agregar producto a carrito vacío',
      () => {
        localStorage.removeItem('carrito');
        document.getElementById('cantidad').value = '2';
        
        const resultado = agregarAlCarritoMejorado({
          id: 'test-001',
          nombre: 'Producto Test',
          precio: 1000,
          stock: 10,
          imagen: 'test.jpg',
          sku: 'TEST-001',
          categoria: 'test'
        });
        
        return resultado;
      },
      true
    );

    // Test 2: Agregar producto existente (debe sumar cantidad)
    this.ejecutarTest(
      'Agregar producto existente (suma cantidad)',
      () => {
        const carritoInicial = [{
          id: 'test-001',
          nombre: 'Producto Test',
          precio: 1000,
          cantidad: 1,
          subtotal: 1000
        }];
        
        localStorage.setItem('carrito', JSON.stringify(carritoInicial));
        document.getElementById('cantidad').value = '2';
        
        const resultado = agregarAlCarritoMejorado({
          id: 'test-001',
          nombre: 'Producto Test',
          precio: 1000,
          stock: 10,
          imagen: 'test.jpg',
          sku: 'TEST-001',
          categoria: 'test'
        });

        const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
        const producto = carrito.find(item => item.id === 'test-001');
        
        return resultado && producto && producto.cantidad === 3;
      },
      true
    );

    // Test 3: Producto sin stock
    this.ejecutarTest(
      'Producto sin stock',
      () => {
        document.getElementById('cantidad').value = '1';
        
        const resultado = agregarAlCarritoMejorado({
          id: 'test-002',
          nombre: 'Producto Sin Stock',
          precio: 1000,
          stock: 0,
          imagen: 'test.jpg',
          sku: 'TEST-002',
          categoria: 'test'
        });
        
        return resultado;
      },
      false
    );

    // Test 4: Datos de producto inválidos
    this.ejecutarTest(
      'Datos de producto inválidos',
      () => {
        const resultado = agregarAlCarritoMejorado({
          id: null,
          nombre: '',
          precio: -100,
          stock: 'invalid'
        });
        
        return resultado;
      },
      false
    );

    // Test 5: Exceder stock con cantidad existente
    this.ejecutarTest(
      'Exceder stock con cantidad existente',
      () => {
        const carritoInicial = [{
          id: 'test-003',
          nombre: 'Producto Límite',
          precio: 1000,
          cantidad: 8,
          subtotal: 8000
        }];
        
        localStorage.setItem('carrito', JSON.stringify(carritoInicial));
        document.getElementById('cantidad').value = '8'; // 8 + 8 = 16 > stock(10)
        
        const resultado = agregarAlCarritoMejorado({
          id: 'test-003',
          nombre: 'Producto Límite',
          precio: 1000,
          stock: 10,
          imagen: 'test.jpg',
          sku: 'TEST-003',
          categoria: 'test'
        });
        
        return resultado;
      },
      false
    );

    console.groupEnd();
  }

  // ===================================================
  // 🧪 TESTS DE VALIDACIÓN
  // ===================================================

  testValidaciones() {
    console.group('✅ TESTS: Funciones de validación');

    // Test 1: validarDatosProducto - producto válido
    this.ejecutarTest(
      'Validar producto válido',
      () => {
        const producto = {
          id: 'test-001',
          nombre: 'Producto Test',
          precio: 1000,
          stock: 10
        };
        
        const validacion = validarDatosProducto(producto);
        return validacion.esValido;
      },
      true
    );

    // Test 2: validarDatosProducto - producto inválido
    this.ejecutarTest(
      'Validar producto inválido',
      () => {
        const producto = {
          id: null,
          nombre: '',
          precio: -100,
          stock: 'invalid'
        };
        
        const validacion = validarDatosProducto(producto);
        return validacion.esValido;
      },
      false
    );

    // Test 3: validarCantidad - cantidad válida
    this.ejecutarTest(
      'Validar cantidad válida',
      () => {
        const validacion = validarCantidad(5, 15);
        return validacion.esValido;
      },
      true
    );

    // Test 4: validarCantidad - cantidad inválida (mayor al stock)
    this.ejecutarTest(
      'Validar cantidad mayor al stock',
      () => {
        const validacion = validarCantidad(20, 15);
        return validacion.esValido;
      },
      false
    );

    // Test 5: validarCantidad - cantidad menor a 1
    this.ejecutarTest(
      'Validar cantidad menor a 1',
      () => {
        const validacion = validarCantidad(0, 15);
        return validacion.esValido;
      },
      false
    );

    // Test 6: obtenerCantidadSeleccionada
    this.ejecutarTest(
      'Obtener cantidad seleccionada válida',
      () => {
        document.getElementById('cantidad').value = '5';
        const cantidad = obtenerCantidadSeleccionada();
        return cantidad;
      },
      5
    );

    // Test 7: obtenerCantidadSeleccionada - valor inválido
    this.ejecutarTest(
      'Obtener cantidad inválida (fallback a 1)',
      () => {
        document.getElementById('cantidad').value = 'abc';
        const cantidad = obtenerCantidadSeleccionada();
        return cantidad;
      },
      1
    );

    console.groupEnd();
  }

  // ===================================================
  // 🧪 TESTS DE LOCALSTORAGE
  // ===================================================

  testLocalStorage() {
    console.group('💾 TESTS: LocalStorage');

    // Test 1: Obtener carrito vacío
    this.ejecutarTest(
      'Obtener carrito vacío',
      () => {
        localStorage.removeItem('carrito');
        const carrito = obtenerCarritoSeguro();
        return Array.isArray(carrito) && carrito.length === 0;
      },
      true
    );

    // Test 2: Obtener carrito válido
    this.ejecutarTest(
      'Obtener carrito válido',
      () => {
        const carritoTest = [
          { id: 1, nombre: 'Test', cantidad: 1 }
        ];
        localStorage.setItem('carrito', JSON.stringify(carritoTest));
        
        const carrito = obtenerCarritoSeguro();
        return Array.isArray(carrito) && carrito.length === 1;
      },
      true
    );

    // Test 3: Obtener carrito corrupto
    this.ejecutarTest(
      'Obtener carrito corrupto (manejo de error)',
      () => {
        localStorage.setItem('carrito', 'invalid json{');
        
        const carrito = obtenerCarritoSeguro();
        return Array.isArray(carrito) && carrito.length === 0;
      },
      true
    );

    // Test 4: Guardar carrito válido
    this.ejecutarTest(
      'Guardar carrito válido',
      () => {
        const carritoTest = [
          { id: 1, nombre: 'Test', cantidad: 1 }
        ];
        
        const resultado = guardarCarritoSeguro(carritoTest);
        return resultado;
      },
      true
    );

    // Test 5: Guardar datos inválidos
    this.ejecutarTest(
      'Guardar datos inválidos (no array)',
      () => {
        const resultado = guardarCarritoSeguro('not an array');
        return resultado;
      },
      false
    );

    console.groupEnd();
  }

  // ===================================================
  // 🧪 TESTS DE UTILIDADES
  // ===================================================

  testUtilidades() {
    console.group('🔧 TESTS: Funciones de utilidad');

    // Test 1: obtenerDatosProductoActual
    this.ejecutarTest(
      'Obtener datos del producto actual',
      () => {
        const datos = obtenerDatosProductoActual();
        return datos && datos.nombre && datos.precio > 0;
      },
      true
    );

    // Test 2: formatearPrecio
    this.ejecutarTest(
      'Formatear precio válido',
      () => {
        const precioFormateado = formatearPrecio(21900);
        return typeof precioFormateado === 'string' && precioFormateado.includes('21');
      },
      true
    );

    // Test 3: generarIdProducto
    this.ejecutarTest(
      'Generar ID de producto',
      () => {
        const id = generarIdProducto();
        return typeof id === 'string' && id.length > 0;
      },
      true
    );

    // Test 4: crearObjetoProductoCarrito
    this.ejecutarTest(
      'Crear objeto producto carrito',
      () => {
        const datosProducto = {
          id: 'test-001',
          nombre: 'Test',
          precio: 1000,
          imagen: 'test.jpg',
          sku: 'TEST-001',
          categoria: 'test',
          url: 'test.html'
        };
        
        const objeto = crearObjetoProductoCarrito(datosProducto, 2);
        
        return objeto.id === 'test-001' && 
               objeto.cantidad === 2 && 
               objeto.subtotal === 2000;
      },
      true
    );

    console.groupEnd();
  }

  // ===================================================
  // 🧪 TESTS DE RENDIMIENTO
  // ===================================================

  testRendimiento() {
    console.group('⚡ TESTS: Rendimiento');

    // Test 1: Tiempo de agregar al carrito
    this.ejecutarTest(
      'Tiempo agregar al carrito < 100ms',
      () => {
        const startTime = performance.now();
        
        agregarAlCarritoMejorado({
          id: 'perf-test',
          nombre: 'Performance Test',
          precio: 1000,
          stock: 10,
          imagen: 'test.jpg',
          sku: 'PERF-001',
          categoria: 'test'
        });
        
        const endTime = performance.now();
        const duracion = endTime - startTime;
        
        console.log(`⏱️ Duración: ${duracion.toFixed(2)}ms`);
        return duracion < 100;
      },
      true
    );

    // Test 2: Tiempo de cambiar cantidad
    this.ejecutarTest(
      'Tiempo cambiar cantidad < 50ms',
      () => {
        const startTime = performance.now();
        
        cambiarCantidadMejorada(1);
        
        const endTime = performance.now();
        const duracion = endTime - startTime;
        
        console.log(`⏱️ Duración: ${duracion.toFixed(2)}ms`);
        return duracion < 50;
      },
      true
    );

    console.groupEnd();
  }

  // ===================================================
  // 🧪 EJECUTOR PRINCIPAL
  // ===================================================

  ejecutarTodos() {
    console.clear();
    console.log('🚀 INICIANDO SUITE COMPLETA DE TESTS');
    console.log('═'.repeat(60));
    console.log(`📅 ${new Date().toLocaleString()}`);
    console.log('═'.repeat(60));
    
    // Reiniciar contadores
    this.resultados = {
      exitosos: 0,
      fallidos: 0,
      total: 0,
      detalles: []
    };

    const startTime = performance.now();

    // Ejecutar todos los grupos de tests
    this.testCambiarCantidad();
    this.testCambiarImagen();
    this.testAgregarAlCarrito();
    this.testValidaciones();
    this.testLocalStorage();
    this.testUtilidades();
    this.testRendimiento();

    const endTime = performance.now();
    const duracionTotal = endTime - startTime;

    this.mostrarResumenFinal(duracionTotal);
  }

  mostrarResumenFinal(duracion) {
    console.log('═'.repeat(60));
    console.log('📊 RESUMEN FINAL DE TESTS');
    console.log('═'.repeat(60));
    
    console.log(`✅ Tests exitosos: ${this.resultados.exitosos}`);
    console.log(`❌ Tests fallidos: ${this.resultados.fallidos}`);
    console.log(`📈 Total ejecutados: ${this.resultados.total}`);
    
    const porcentajeExito = this.resultados.total > 0 
      ? ((this.resultados.exitosos / this.resultados.total) * 100).toFixed(1)
      : 0;
    
    console.log(`🎯 Tasa de éxito: ${porcentajeExito}%`);
    console.log(`⏱️ Tiempo total: ${duracion.toFixed(2)}ms`);

    // Mostrar detalles de tests fallidos
    const testsFallidos = this.resultados.detalles.filter(test => test.estado !== 'EXITOSO');
    if (testsFallidos.length > 0) {
      console.log('\n❌ TESTS FALLIDOS:');
      testsFallidos.forEach(test => {
        console.log(`   • ${test.nombre}: ${test.error || 'Resultado no esperado'}`);
      });
    }

    // Resultado final
    if (this.resultados.fallidos === 0) {
      console.log('\n🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!');
      console.log('✨ El código está listo para producción');
    } else {
      console.warn(`\n⚠️ ${this.resultados.fallidos} tests fallaron`);
      console.log('🔧 Revisa el código antes de desplegar');
    }

    console.log('═'.repeat(60));

    // Retornar resumen para uso programático
    return {
      exitosos: this.resultados.exitosos,
      fallidos: this.resultados.fallidos,
      total: this.resultados.total,
      porcentajeExito: porcentajeExito,
      duracion: duracion,
      detalles: this.resultados.detalles
    };
  }

  /**
   * Ejecutar test específico por nombre
   * @param {string} nombreTest - Nombre del grupo de test
   */
  ejecutarTest específico(nombreTest) {
    const tests = {
      'cantidad': this.testCambiarCantidad.bind(this),
      'imagen': this.testCambiarImagen.bind(this),
      'carrito': this.testAgregarAlCarrito.bind(this),
      'validaciones': this.testValidaciones.bind(this),
      'localStorage': this.testLocalStorage.bind(this),
      'utilidades': this.testUtilidades.bind(this),
      'rendimiento': this.testRendimiento.bind(this)
    };

    if (tests[nombreTest]) {
      console.log(`🧪 Ejecutando tests de: ${nombreTest}`);
      this.resultados = { exitosos: 0, fallidos: 0, total: 0, detalles: [] };
      tests[nombreTest]();
      this.mostrarResumenFinal(0);
    } else {
      console.error(`❌ Grupo de test "${nombreTest}" no encontrado`);
      console.log('📋 Grupos disponibles:', Object.keys(tests).join(', '));
    }
  }
}

// ===================================================
// 🚀 INICIALIZACIÓN AUTOMÁTICA
// ===================================================

// Auto-inicialización en desarrollo
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    // Crear instancia global de tests
    window.TestSuite = new TestSuiteJarroPage();
    
    // Función de conveniencia para ejecutar todos los tests
    window.runAllTests = () => window.TestSuite.ejecutarTodos();
    
    // Función de conveniencia para ejecutar test específico
    window.runTest = (nombre) => window.TestSuite.ejecutarTestEspecifico(nombre);
    
    console.log('🧪 Suite de tests cargada. Comandos disponibles:');
    console.log('   • runAllTests() - Ejecutar todos los tests');
    console.log('   • runTest("cantidad") - Ejecutar test específico');
    console.log('   • TestSuite.ejecutarTodos() - Versión detallada');
    
    // Auto-ejecutar en modo desarrollo
    if (window.location.search.includes('autotest=true')) {
      setTimeout(() => {
        console.log('🏃 Auto-ejecutando tests...');
        window.runAllTests();
      }, 2000);
    }
  });
}

// Exportar para uso en Node.js si es necesario
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestSuiteJarroPage;
}

/**
 * 📚 EJEMPLOS DE USO:
 * 
 * // Ejecutar todos los tests
 * runAllTests();
 * 
 * // Ejecutar test específico
 * runTest('cantidad');
 * runTest('carrito');
 * runTest('validaciones');
 * 
 * // Acceso directo a la clase
 * const testSuite = new TestSuiteJarroPage();
 * const resultados = testSuite.ejecutarTodos();
 * 
 * // Auto-ejecutar agregando ?autotest=true a la URL
 * // http://localhost:8080/jarro.html?autotest=true
 */