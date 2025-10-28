/**
 * Sistema de Integración MercadoPago - Patagonia Style
 * Integración completa con checkout, webhooks y gestión de pagos
 */

class MercadoPagoIntegration {
  constructor(publicKey, environment = 'sandbox') {
    this.publicKey = publicKey;
    this.environment = environment; // 'sandbox' o 'production'
    this.mp = null;
    this.checkout = null;
    this.preferenceId = null;
    this.isInitialized = false;
    
    this.config = {
      currency: 'ARS',
      country: 'AR',
      locale: 'es-AR',
      theme: {
        elementsColor: '#007bff',
        headerColor: '#007bff'
      }
    };

    this.initializeMercadoPago();
  }

  async initializeMercadoPago() {
    try {
      // Cargar SDK de MercadoPago
      await this.loadMercadoPagoSDK();
      
      // Inicializar MercadoPago
      this.mp = new MercadoPago(this.publicKey, {
        locale: this.config.locale,
        advancedFraudPrevention: true
      });

      this.isInitialized = true;
      console.log('MercadoPago initialized successfully');
      
      // Trigger evento de inicialización
      this.dispatchEvent('mp:initialized', { mp: this.mp });
      
    } catch (error) {
      console.error('Error initializing MercadoPago:', error);
      this.handleError('initialization', error);
    }
  }

  async loadMercadoPagoSDK() {
    if (window.MercadoPago) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * CHECKOUT INTEGRATION
   */
  async createPreference(items, payer = {}, additionalInfo = {}) {
    const preference = {
      items: this.formatItems(items),
      payer: this.formatPayer(payer),
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      },
      shipments: {
        mode: 'not_specified'
      },
      back_urls: {
        success: `${window.location.origin}/checkout.html?status=success`,
        failure: `${window.location.origin}/checkout.html?status=failure`,
        pending: `${window.location.origin}/checkout.html?status=pending`
      },
      auto_return: 'approved',
      binary_mode: false,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      ...additionalInfo
    };

    try {
      // Aquí normalmente harías una llamada a tu backend
      const response = await this.callBackend('/api/mercadopago/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preference)
      });

      this.preferenceId = response.id;
      return response;
      
    } catch (error) {
      console.error('Error creating preference:', error);
      throw error;
    }
  }

  formatItems(items) {
    return items.map(item => ({
      id: item.id || item.productId,
      title: item.name || item.title,
      description: item.description || '',
      quantity: parseInt(item.quantity),
      unit_price: parseFloat(item.price),
      currency_id: this.config.currency,
      picture_url: item.image || '',
      category_id: item.category || 'others'
    }));
  }

  formatPayer(payer) {
    return {
      name: payer.firstName || '',
      surname: payer.lastName || '',
      email: payer.email || '',
      phone: {
        area_code: payer.phoneAreaCode || '',
        number: payer.phoneNumber || ''
      },
      identification: {
        type: payer.identificationType || 'DNI',
        number: payer.identificationNumber || ''
      },
      address: {
        street_name: payer.streetName || '',
        street_number: parseInt(payer.streetNumber) || 0,
        zip_code: payer.zipCode || ''
      }
    };
  }

  /**
   * CHECKOUT PRO (Redirect)
   */
  async initCheckoutPro(containerId, preferenceId = null) {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    const prefId = preferenceId || this.preferenceId;
    if (!prefId) {
      throw new Error('No preference ID available');
    }

    try {
      this.checkout = this.mp.checkout({
        preference: {
          id: prefId
        },
        render: {
          container: `#${containerId}`,
          label: 'Pagar con MercadoPago'
        },
        theme: this.config.theme
      });

      return this.checkout;
      
    } catch (error) {
      console.error('Error initializing Checkout Pro:', error);
      throw error;
    }
  }

  /**
   * CHECKOUT TRANSPARENTE (Credit Card)
   */
  async initTransparentCheckout(formId) {
    if (!this.isInitialized) {
      await this.waitForInitialization();
    }

    const form = document.getElementById(formId);
    if (!form) {
      throw new Error(`Form with ID ${formId} not found`);
    }

    try {
      // Crear instancia de CardForm
      const cardForm = this.mp.cardForm({
        amount: this.getTotalAmount().toString(),
        iframe: true,
        form: {
          id: formId,
          cardholderName: {
            id: "form-checkout__cardholderName",
            placeholder: "Titular de la tarjeta",
          },
          cardholderEmail: {
            id: "form-checkout__cardholderEmail",
            placeholder: "E-mail",
          },
          cardNumber: {
            id: "form-checkout__cardNumber",
            placeholder: "Número de la tarjeta",
          },
          expirationMonth: {
            id: "form-checkout__expirationMonth",
            placeholder: "Mes de vencimiento",
          },
          expirationYear: {
            id: "form-checkout__expirationYear",
            placeholder: "Año de vencimiento",
          },
          securityCode: {
            id: "form-checkout__securityCode",
            placeholder: "Código de seguridad",
          },
          installments: {
            id: "form-checkout__installments",
            placeholder: "Cuotas",
          },
          identificationType: {
            id: "form-checkout__identificationType",
            placeholder: "Tipo de documento",
          },
          identificationNumber: {
            id: "form-checkout__identificationNumber",
            placeholder: "Número del documento",
          },
          issuer: {
            id: "form-checkout__issuer",
            placeholder: "Banco emisor",
          }
        },
        callbacks: {
          onFormMounted: error => {
            if (error) {
              console.error('Error mounting form:', error);
              return;
            }
            console.log('Card form mounted successfully');
          },
          onSubmit: event => {
            event.preventDefault();
            this.handleTransparentCheckoutSubmit(cardForm);
          },
          onFetching: (resource) => {
            console.log('Fetching:', resource);
            this.showLoadingState();
          }
        }
      });

      return cardForm;
      
    } catch (error) {
      console.error('Error initializing transparent checkout:', error);
      throw error;
    }
  }

  async handleTransparentCheckoutSubmit(cardForm) {
    try {
      this.showLoadingState();
      
      const { token, issuerId, paymentMethodId, installments } = cardForm.getCardFormData();
      
      const paymentData = {
        token,
        issuer_id: issuerId,
        payment_method_id: paymentMethodId,
        transaction_amount: this.getTotalAmount(),
        installments: parseInt(installments),
        description: this.getPaymentDescription(),
        payer: {
          email: document.getElementById('form-checkout__cardholderEmail').value,
          identification: {
            type: document.getElementById('form-checkout__identificationType').value,
            number: document.getElementById('form-checkout__identificationNumber').value
          }
        }
      };

      const response = await this.processPayment(paymentData);
      this.handlePaymentResponse(response);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      this.handlePaymentError(error);
    } finally {
      this.hideLoadingState();
    }
  }

  /**
   * PAYMENT PROCESSING
   */
  async processPayment(paymentData) {
    try {
      const response = await this.callBackend('/api/mercadopago/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      return response;
      
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  handlePaymentResponse(response) {
    const { status, status_detail, id } = response;

    switch (status) {
      case 'approved':
        this.handleApprovedPayment(response);
        break;
      case 'pending':
        this.handlePendingPayment(response);
        break;
      case 'rejected':
        this.handleRejectedPayment(response);
        break;
      default:
        this.handleUnknownPaymentStatus(response);
    }
  }

  handleApprovedPayment(payment) {
    // Limpiar carrito
    if (window.store) {
      store.clearCart();
    }

    // Mostrar notificación de éxito
    if (window.notificationSystem) {
      notificationSystem.success(
        '¡Pago Aprobado!',
        `Tu pago fue procesado exitosamente. ID: ${payment.id}`,
        {
          duration: 0,
          actions: [{
            id: 'view-order',
            label: 'Ver Pedido',
            style: 'primary',
            handler: () => this.redirectToOrder(payment.id)
          }]
        }
      );
    }

    // Trigger evento de pago exitoso
    this.dispatchEvent('payment:approved', payment);
    
    // Redirect después de un delay
    setTimeout(() => {
      window.location.href = `/mis-pedidos.html?payment=${payment.id}`;
    }, 3000);
  }

  handlePendingPayment(payment) {
    if (window.notificationSystem) {
      notificationSystem.warning(
        'Pago Pendiente',
        'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
        {
          duration: 8000
        }
      );
    }

    this.dispatchEvent('payment:pending', payment);
  }

  handleRejectedPayment(payment) {
    const errorMessages = {
      'cc_rejected_bad_filled_card_number': 'Revisa el número de tarjeta',
      'cc_rejected_bad_filled_date': 'Revisa la fecha de vencimiento',
      'cc_rejected_bad_filled_other': 'Revisa los datos ingresados',
      'cc_rejected_bad_filled_security_code': 'Revisa el código de seguridad',
      'cc_rejected_blacklist': 'No pudimos procesar tu pago',
      'cc_rejected_call_for_authorize': 'Debes autorizar ante tu banco el pago',
      'cc_rejected_card_disabled': 'Llama a tu banco para activar tu tarjeta',
      'cc_rejected_duplicate_payment': 'Ya hiciste un pago por ese valor',
      'cc_rejected_high_risk': 'Tu pago fue rechazado',
      'cc_rejected_insufficient_amount': 'Tu tarjeta no tiene fondos suficientes',
      'cc_rejected_invalid_installments': 'Tu tarjeta no procesa pagos en cuotas',
      'cc_rejected_max_attempts': 'Llegaste al límite de intentos permitidos',
      'cc_rejected_other_reason': 'Tu tarjeta no procesó el pago'
    };

    const message = errorMessages[payment.status_detail] || 'Ocurrió un error al procesar tu pago';

    if (window.notificationSystem) {
      notificationSystem.error(
        'Pago Rechazado',
        message,
        {
          duration: 0,
          actions: [{
            id: 'retry',
            label: 'Intentar de Nuevo',
            style: 'primary',
            handler: () => this.retryPayment()
          }]
        }
      );
    }

    this.dispatchEvent('payment:rejected', payment);
  }

  /**
   * UTILITIES
   */
  getTotalAmount() {
    if (window.store) {
      return store.getCartTotal();
    }
    return 0;
  }

  getPaymentDescription() {
    if (window.store) {
      const items = store.getCartItems();
      if (items.length === 1) {
        return items[0].name;
      }
      return `Compra en Patagonia Style - ${items.length} productos`;
    }
    return 'Compra en Patagonia Style';
  }

  async callBackend(endpoint, options = {}) {
    // Simulación de llamada al backend
    // En producción, esto sería una llamada real a tu API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% éxito
          resolve({
            id: 'PREF_' + Date.now(),
            status: 'approved',
            status_detail: 'accredited',
            // ... otros campos de respuesta
          });
        } else {
          reject(new Error('Backend error'));
        }
      }, 1000);
    });
  }

  showLoadingState() {
    if (window.loadingSystem) {
      loadingSystem.showOverlay('Procesando pago...');
    }
  }

  hideLoadingState() {
    if (window.loadingSystem) {
      loadingSystem.hideOverlay();
    }
  }

  retryPayment() {
    // Limpiar estado y permitir nuevo intento
    if (this.checkout) {
      this.checkout.unmount();
    }
    // Reinicializar formulario o checkout
  }

  redirectToOrder(paymentId) {
    window.location.href = `/mis-pedidos.html?payment=${paymentId}`;
  }

  waitForInitialization() {
    return new Promise((resolve) => {
      const checkInit = () => {
        if (this.isInitialized) {
          resolve();
        } else {
          setTimeout(checkInit, 100);
        }
      };
      checkInit();
    });
  }

  dispatchEvent(eventName, data) {
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }

  handleError(type, error) {
    console.error(`MercadoPago ${type} error:`, error);
    
    if (window.notificationSystem) {
      notificationSystem.error(
        'Error de MercadoPago',
        'Ocurrió un error con el sistema de pagos. Por favor, intenta más tarde.',
        { duration: 0 }
      );
    }
  }

  // Método para obtener el estado de un pago
  async getPaymentStatus(paymentId) {
    try {
      const response = await this.callBackend(`/api/mercadopago/payments/${paymentId}`);
      return response;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // Método para procesar webhook de MercadoPago
  handleWebhook(webhookData) {
    const { type, data } = webhookData;
    
    switch (type) {
      case 'payment':
        this.handlePaymentWebhook(data);
        break;
      case 'merchant_order':
        this.handleMerchantOrderWebhook(data);
        break;
      default:
        console.log('Unknown webhook type:', type);
    }
  }

  handlePaymentWebhook(data) {
    // Procesar notificación de pago
    console.log('Payment webhook received:', data);
    
    // Actualizar estado del pedido en el frontend
    this.dispatchEvent('webhook:payment', data);
  }

  handleMerchantOrderWebhook(data) {
    // Procesar notificación de orden
    console.log('Merchant order webhook received:', data);
    
    this.dispatchEvent('webhook:order', data);
  }
}

// Configuración para el entorno
const MP_CONFIG = {
  // Claves de prueba de MercadoPago
  sandbox: {
    publicKey: 'TEST-YOUR-PUBLIC-KEY', // Reemplazar con tu clave pública de prueba
  },
  production: {
    publicKey: 'YOUR-PUBLIC-KEY', // Reemplazar con tu clave pública de producción
  }
};

// Inicializar MercadoPago
const environment = window.location.hostname === 'localhost' ? 'sandbox' : 'production';
window.mercadoPago = new MercadoPagoIntegration(
  MP_CONFIG[environment].publicKey,
  environment
);

// Event listeners globales
document.addEventListener('DOMContentLoaded', () => {
  // Auto-inicializar checkout si hay elementos en la página
  const checkoutContainer = document.getElementById('checkout-pro');
  if (checkoutContainer) {
    // Inicializar Checkout Pro automáticamente
  }

  const transparentForm = document.getElementById('checkout-form');
  if (transparentForm) {
    // Inicializar Checkout Transparente automáticamente
  }
});

// Aliases globales
window.createPaymentPreference = (items, payer, additionalInfo) => 
  mercadoPago.createPreference(items, payer, additionalInfo);

window.initCheckoutPro = (containerId, preferenceId) => 
  mercadoPago.initCheckoutPro(containerId, preferenceId);

window.initTransparentCheckout = (formId) => 
  mercadoPago.initTransparentCheckout(formId);