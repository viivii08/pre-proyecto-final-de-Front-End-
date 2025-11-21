// 🚀 APLICADOR MASIVO DE FOOTER UNIVERSAL
// Script para actualizar automáticamente todas las páginas del sitio con el footer uniforme

class FooterMassUpdater {
  constructor() {
    this.pagesToUpdate = [
      'index.html',
      'tienda.html',
      'contacto.html',
      'carrito.html',
      'checkout.html',
      'cuaderno.html',
      'envios.html',
      'jarro.html',
      'mi-cuenta.html',
      'mis-favoritos.html',
      'mis-pedidos.html',
      'politica-privacidad.html',
      'portafolio.html',
      'privacidad.html',
      'producto.html',
      'terminos-condiciones.html',
      'terminos.html',
      'yerbera.html'
    ];
    
    this.footerPattern = /<footer[^>]*>[\s\S]*?<\/footer>/gi;
    this.scriptPattern = /<script\s+src="js\/universal-footer\.js"><\/script>/gi;
    this.bodyEndPattern = /<\/body>/gi;
  }

  // Generar las instrucciones de actualización manual
  generateUpdateInstructions() {
    const instructions = `
# 📋 INSTRUCCIONES PARA APLICAR FOOTER UNIVERSAL

## 🎯 Pasos para cada página HTML:

### 1️⃣ ELIMINAR footer existente
Buscar y eliminar todo el bloque:
\`\`\`html
<footer role="contentinfo" style="...">
  <!-- Todo el contenido del footer -->
</footer>
\`\`\`

### 2️⃣ AGREGAR script antes de </body>
Agregar estas líneas antes del cierre de </body>:
\`\`\`html
<!-- Sistema de Footer Universal -->
<script src="js/universal-footer.js"></script>
\`\`\`

### 3️⃣ VERIFICAR estructura body
Asegurar que el body tenga esta estructura:
\`\`\`html
<body>
  <main>
    <!-- Contenido de la página -->
  </main>
  <!-- Footer será generado automáticamente -->
  
  <!-- Scripts -->
  <script src="js/universal-footer.js"></script>
  <script src="js/whatsapp-global.js"></script>
</body>
\`\`\`

## 📁 PÁGINAS A ACTUALIZAR:
${this.pagesToUpdate.map(page => `- ${page}`).join('\n')}

## ✅ VERIFICACIÓN:
Después de aplicar los cambios:
1. Abrir cada página en el navegador
2. Verificar que el footer aparece con el diseño correcto
3. Comprobar que tiene el gradiente azul-verde
4. Verificar enlaces de redes sociales
5. Confirmar que no hay espacios en blanco debajo

## 🎨 RESULTADO ESPERADO:
- Footer uniforme en todas las páginas
- Diseño consistente con gradiente
- Enlaces a Instagram y Facebook
- Copyright actualizado automáticamente
- Integración con WhatsApp
- Sin espacios en blanco debajo
`;

    return instructions;
  }

  // Generar código de ejemplo para una página
  generatePageTemplate(pageName) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageName} - Patagonia Style</title>
  
  <!-- Estilos necesarios para footer universal -->
  <style>
    body {
      display: flex !important;
      flex-direction: column !important;
      min-height: 100vh !important;
      margin: 0 !important;
    }
    main {
      flex: 1 0 auto;
    }
  </style>
  
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
</head>
<body>
  <main>
    <div class="container">
      <h1>${pageName}</h1>
      <!-- Contenido específico de la página -->
    </div>
  </main>

  <!-- Footer será generado automáticamente por universal-footer.js -->
  
  <!-- Scripts esenciales -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <!-- Sistema de Footer Universal -->
  <script src="js/universal-footer.js"></script>
  <script src="js/whatsapp-global.js"></script>
</body>
</html>
`;
  }

  // Generar archivo de configuración para el footer
  generateFooterConfig() {
    return `
// 🎯 CONFIGURACIÓN DEL FOOTER UNIVERSAL
// Archivo para personalizar fácilmente el footer en todo el sitio

const FooterConfig = {
  company: "Patagonia Style",
  creator: "Vargas Viviana", 
  gradient: "linear-gradient(90deg, #1f3c5a, #3b5d50)",
  
  social: {
    instagram: {
      url: "https://instagram.com/patagoniastyle",
      label: "Síguenos en Instagram",
      text: "Instagram",
      icon: "bi-instagram"
    },
    facebook: {
      url: "https://facebook.com/patagoniastyle",
      label: "Síguenos en Facebook", 
      text: "Facebook",
      icon: "bi-facebook"
    }
  },
  
  // Personalizar por página si es necesario
  pageCustomizations: {
    'index.html': {
      showWhatsApp: true,
      extraContent: ''
    },
    'tienda.html': {
      showWhatsApp: true,
      extraContent: ''
    },
    'contacto.html': {
      showWhatsApp: true,
      extraContent: '<p class="mt-2"><small>¿Tienes preguntas? ¡Contáctanos!</small></p>'
    }
  }
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FooterConfig;
} else {
  window.FooterConfig = FooterConfig;
}
`;
  }
}

// Inicializar y generar instrucciones
const updater = new FooterMassUpdater();

console.log("📋 GENERANDO INSTRUCCIONES DE ACTUALIZACIÓN...");
console.log(updater.generateUpdateInstructions());

console.log("\n🎯 EJEMPLO DE CONFIGURACIÓN:");
console.log(updater.generateFooterConfig());

console.log("\n✅ TEMPLATE DE PÁGINA:");
console.log(updater.generatePageTemplate("Ejemplo"));

// Exportar clase para uso
window.FooterMassUpdater = FooterMassUpdater;