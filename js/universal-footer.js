// 🎯 SISTEMA DE FOOTER UNIFORME - Patagonia Style
// Componente reutilizable para mantener consistencia en todas las páginas

class UniversalFooter {
  constructor() {
    this.footerData = {
      company: "Patagonia Style",
      year: new Date().getFullYear(),
      creator: "Vargas Viviana",
      gradient: "linear-gradient(90deg, #1f3c5a, #3b5d50)",
      social: {
        instagram: {
          url: "https://instagram.com/patagoniastyle",
          label: "Síguenos en Instagram",
          text: "Instagram"
        },
        facebook: {
          url: "https://facebook.com/patagoniastyle", 
          label: "Síguenos en Facebook",
          text: "Facebook"
        }
      }
    };
    this.init();
  }

  init() {
    this.createFooterStyles();
    this.renderFooter();
  }

  createFooterStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* 🎯 FOOTER UNIVERSAL - Diseño consistente y compacto */
      .universal-footer {
        background: ${this.footerData.gradient} !important;
        color: white !important;
        text-align: center !important;
        padding: 25px 0 30px 0 !important;
        margin-top: 35px !important;
        flex-shrink: 0 !important;
        line-height: 1.3 !important;
      }
      
      .universal-footer .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }
      
      .universal-footer .copyright {
        margin-bottom: 5px !important;
        font-size: 0.9rem !important;
        font-weight: 500 !important;
        line-height: 1.2 !important;
        color: #FFFFFF !important;
      }
      
      .universal-footer .creator {
        margin-bottom: 8px !important;
        font-size: 0.85rem !important;
        opacity: 0.9 !important;
        line-height: 1.2 !important;
        color: #FFFFFF !important;
      }
      
      .universal-footer .social-nav {
        margin: 0;
      }
      
      /* Footer de contacto sin redes sociales */
      .universal-footer:not(:has(.social-nav)) .creator {
        margin-bottom: 5px !important;
      }
      
      .universal-footer .social-list {
        list-style: none;
        padding: 0;
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        flex-wrap: wrap;
        margin: 0;
        align-items: center;
        margin-top: 4px;
      }
      
      .universal-footer .social-link {
        color: #b67c3a;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      
      .universal-footer .social-link:hover {
        color: #d4941f;
        text-decoration: underline;
        transform: translateY(-1px);
      }
      
      .universal-footer .whatsapp-container {
        margin-top: 10px !important;
      }
      
      /* 📱 Responsivo */
      @media (max-width: 768px) {
        .universal-footer {
          padding: 20px 0 25px 0 !important;
          margin-top: 25px !important;
        }
        
        .universal-footer .social-list {
          gap: 1rem;
        }
        
        .universal-footer .copyright,
        .universal-footer .creator {
          font-size: 0.8rem;
        }
      }
      
      /* 🎯 Body layout para footer pegado abajo */
      body {
        display: flex !important;
        flex-direction: column !important;
        min-height: 100vh !important;
        margin: 0 !important;
      }
      
      main {
        flex: 1 0 auto;
      }
    `;
    document.head.appendChild(style);
  }

  generateFooterHTML() {
    // Detectar si estamos en la página de contacto
    const isContactPage = window.location.pathname.includes('contacto.html') || 
                          document.title.includes('Contacto') ||
                          document.querySelector('h1')?.textContent.includes('Contacto');
    
    return `
      <footer class="universal-footer" role="contentinfo">
        <div class="container">
          <p class="copyright">&copy; ${this.footerData.year} ${this.footerData.company} - Todos los derechos reservados</p>
          <p class="creator">Creado por ${this.footerData.creator}</p>
          
          ${!isContactPage ? `
          <nav class="social-nav" aria-label="Redes sociales">
            <ul class="social-list">
              <li>
                <a href="${this.footerData.social.instagram.url}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="social-link"
                   aria-label="${this.footerData.social.instagram.label}">
                  <i class="bi bi-instagram" aria-hidden="true"></i> ${this.footerData.social.instagram.text}
                </a>
              </li>
              <li>
                <a href="${this.footerData.social.facebook.url}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="social-link"
                   aria-label="${this.footerData.social.facebook.label}">
                  <i class="bi bi-facebook" aria-hidden="true"></i> ${this.footerData.social.facebook.text}
                </a>
              </li>
            </ul>
          </nav>
          ` : ''}
          
          <!-- Contenedor para WhatsApp (será manejado por whatsapp-global.js) -->
          <div id="whatsapp-footer" class="whatsapp-container"></div>
        </div>
      </footer>
    `;
  }

  renderFooter() {
    // Eliminar footer existente si existe
    const existingFooter = document.querySelector('footer');
    if (existingFooter) {
      existingFooter.remove();
    }

    // Crear y agregar el nuevo footer
    const footerHTML = this.generateFooterHTML();
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  }

  // Método para actualizar datos del footer
  updateFooterData(newData) {
    this.footerData = { ...this.footerData, ...newData };
    this.renderFooter();
  }

  // Método para obtener el footer actual
  getFooterElement() {
    return document.querySelector('.universal-footer');
  }
}

// 🚀 Auto-inicializar cuando se carga el DOM
document.addEventListener('DOMContentLoaded', () => {
  // Solo inicializar si no existe ya
  if (!window.universalFooter) {
    window.universalFooter = new UniversalFooter();
  }
});

// Exportar para uso manual si es necesario
window.UniversalFooter = UniversalFooter;