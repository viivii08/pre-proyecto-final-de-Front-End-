/**
 * 📱 BOTÓN WHATSAPP FLOTANTE ÚNICO
 * Un solo botón, limpio y funcional
 */

class SimpleWhatsAppButton {
    constructor() {
        this.whatsappNumber = '5491136899678';
        this.init();
    }

    init() {
        this.removeOldButtons();
        this.createButton();
    }

    removeOldButtons() {
        // Remover todos los botones antiguos
        document.querySelectorAll('.whatsapp-float, .floating-btn, .scroll-btn, #btnVolverInicio').forEach(btn => btn.remove());
        document.querySelectorAll('.floating-buttons-container').forEach(container => container.remove());
        const oldStyles = document.getElementById('whatsapp-styles');
        if (oldStyles) oldStyles.remove();
    }

    createButton() {
        const whatsappBtn = document.createElement('a');
        whatsappBtn.href = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent('¡Hola! Me gustaría más información sobre sus productos 😊')}`;
        whatsappBtn.target = '_blank';
        whatsappBtn.rel = 'noopener';
        whatsappBtn.className = 'whatsapp-simple';
        whatsappBtn.title = '¡Escríbenos por WhatsApp!';
        whatsappBtn.innerHTML = '<i class="bi bi-whatsapp"></i>';
        
        document.body.appendChild(whatsappBtn);
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.id = 'whatsapp-styles';
        style.textContent = `
            .whatsapp-simple {
                position: fixed;
                bottom: 25px;
                right: 25px;
                width: 65px;
                height: 65px;
                background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 2rem;
                text-decoration: none;
                box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
                z-index: 1000;
                transition: all 0.3s ease;
                animation: whatsappPulse 3s infinite;
            }

            .whatsapp-simple:hover {
                background: linear-gradient(135deg, #128c7e 0%, #075e54 100%);
                color: #fff;
                transform: scale(1.1) translateY(-2px);
                box-shadow: 0 8px 25px rgba(37, 211, 102, 0.6);
                text-decoration: none;
                animation: none;
            }

            @keyframes whatsappPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            @media (max-width: 768px) {
                .whatsapp-simple {
                    width: 55px;
                    height: 55px;
                    font-size: 1.6rem;
                    right: 20px;
                    bottom: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    new SimpleWhatsAppButton();
    console.log('📱 Botón WhatsApp simple activado');
});