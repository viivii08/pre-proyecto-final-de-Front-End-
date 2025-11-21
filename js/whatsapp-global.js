/**
 * 🟢 BOTÓN FLOTANTE DE WHATSAPP - SIMPLE Y EFECTIVO
 * Autor: Desarrollador Profesional
 * Descripción: Botón de WhatsApp que funciona en todas las páginas
 */

(function() {
    'use strict';
    
    console.log('📱 [WhatsApp Simple] Iniciando...');
    
    function crearWhatsApp() {
        console.log('📱 [WhatsApp] Eliminando duplicados...');
        
        // ELIMINAR TODOS los posibles botones de WhatsApp existentes
        const selectores = [
            '.whatsapp-float', 
            '.whatsapp-button', 
            '.btn-whatsapp',
            '.whatsapp-simple',
            '.floating-btn',
            '.scroll-btn',
            'a[href*="wa.me"]',
            '*[class*="whatsapp"]',
            '.scroll-to-top',
            // Selectores específicos para portafolio
            'a[style*="position: fixed"][style*="bottom"]',
            '*[style*="bottom: 90px"]'
        ];
        
        selectores.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(btn => {
                    console.log('🗑️ Eliminando:', btn.className);
                    btn.remove();
                });
            } catch(e) {
                // Ignorar errores de selectores
            }
        });
        
        // Buscar el contenedor para el botón
        let contenedor = document.getElementById('whatsapp-unico');
        
        // Si no existe contenedor, crearlo en el body
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'whatsapp-unico';
            document.body.appendChild(contenedor);
        }
        
        // Limpiar el contenedor
        contenedor.innerHTML = '';
        
        // Crear botón WhatsApp
        const btn = document.createElement('a');
        btn.className = 'whatsapp-float-unique';
        btn.href = 'https://wa.me/5491136899678?text=' + encodeURIComponent('Hola! Me interesa conocer más sobre Patagonia Style 🏔️');
        btn.target = '_blank';
        btn.title = '¡Escríbenos por WhatsApp!';
        
        // Crear el icono dentro del botón - versión estable
        const icono = document.createElement('span');
        icono.style.cssText = `
            font-size: 32px !important;
            line-height: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            height: 100% !important;
            pointer-events: none !important;
        `;
        
        // Usar SVG directamente como método más confiable
        icono.innerHTML = `
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16" style="flex-shrink: 0; pointer-events: none;">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.777-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
            </svg>
        `;
        
        btn.appendChild(icono);
        
        // Estilos inline estables para asegurar que funcione
        btn.style.cssText = `
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            width: 60px !important;
            height: 60px !important;
            background: #25D366 !important;
            color: white !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-decoration: none !important;
            box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4) !important;
            z-index: 9999 !important;
            border: none !important;
            opacity: 1 !important;
            visibility: visible !important;
            overflow: hidden !important;
            transform: translateZ(0) !important;
        `;
        
        // Efectos hover más simples (sin afectar el contenido)
        btn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#128C7E !important';
            this.style.transform = 'translateZ(0) scale(1.1) !important';
        });

        btn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#25D366 !important';
            this.style.transform = 'translateZ(0) scale(1) !important';
        });        // Agregar al contenedor
        contenedor.appendChild(btn);
        console.log('✅ WhatsApp creado exitosamente en contenedor');
    }
    
    // Inicializar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', crearWhatsApp);
    } else {
        setTimeout(crearWhatsApp, 100);
    }
    
    // Backup: intentar crear después de que todo esté cargado
    window.addEventListener('load', function() {
        setTimeout(crearWhatsApp, 500);
    });
    
    // Verificación única al cargar (no periódica para evitar conflictos con scroll)
    setTimeout(function() {
        const botones = document.querySelectorAll('*[class*="whatsapp"], a[href*="wa.me"], .scroll-to-top, .scroll-btn');
        if (botones.length > 1) {
            console.log('🔍 Detectados', botones.length, 'botones, eliminando duplicados...');
            botones.forEach((btn, index) => {
                if (index > 0 || !btn.closest('#whatsapp-unico')) {
                    console.log('🗑️ Eliminando botón duplicado');
                    btn.remove();
                }
            });
        }
    }, 3000);

})();

console.log('📱 [WhatsApp Simple] Script cargado');