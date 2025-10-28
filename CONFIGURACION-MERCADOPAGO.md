# 💳 CONFIGURACIÓN MERCADOPAGO - PATAGONIA STYLE

## 🚀 **GUÍA DE CONFIGURACIÓN COMPLETA**

### **1. 📝 Registro en MercadoPago**

1. **Crear cuenta:** [https://www.mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers)
2. **Acceder a Dashboard de Desarrolladores**
3. **Crear nueva aplicación**

---

### **2. 🔑 Obtener Credenciales**

#### **Ambiente de Pruebas (Sandbox):**
```
Public Key: TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Access Token: TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

#### **Ambiente de Producción:**
```
Public Key: APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Access Token: APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

### **3. ⚙️ Configurar en el Código**

**Archivo:** `js/mercadopago.js` (líneas 562-568)

```javascript
const MP_CONFIG = {
  sandbox: {
    publicKey: 'TU_CLAVE_PUBLICA_DE_PRUEBA', // ⚠️ REEMPLAZAR AQUÍ
  },
  production: {
    publicKey: 'TU_CLAVE_PUBLICA_DE_PRODUCCION', // ⚠️ REEMPLAZAR AQUÍ
  }
};
```

---

### **4. 🧪 Tarjetas de Prueba**

Para testing en ambiente sandbox:

#### **Visa (Aprobada):**
```
Número: 4509 9535 6623 3704
CVV: 123
Fecha: 11/25
Nombre: APRO
```

#### **Mastercard (Rechazada):**
```
Número: 5031 7557 3453 0604
CVV: 123
Fecha: 11/25
Nombre: OTHE
```

#### **American Express (Pendiente):**
```
Número: 3711 803032 57522
CVV: 1234
Fecha: 11/25
Nombre: CORP
```

---

### **5. 🌐 Configurar URLs**

En `js/mercadopago.js` (líneas 47-51):

```javascript
back_urls: {
  success: `${window.location.origin}/checkout.html?status=success`,
  failure: `${window.location.origin}/checkout.html?status=failure`,
  pending: `${window.location.origin}/checkout.html?status=pending`
}
```

**Cambiar por tus URLs reales:**
```javascript
back_urls: {
  success: `https://tu-dominio.com/checkout.html?status=success`,
  failure: `https://tu-dominio.com/checkout.html?status=failure`, 
  pending: `https://tu-dominio.com/checkout.html?status=pending`
}
```

---

### **6. 🔗 Webhooks (Opcional pero Recomendado)**

#### **Configurar en MercadoPago Dashboard:**
1. Ir a **"Webhooks"** en el panel
2. Agregar URL: `https://tu-dominio.com/webhooks/mercadopago`
3. Seleccionar eventos: `payment`, `merchant_order`

#### **Código Backend Ejemplo (Node.js):**
```javascript
app.post('/webhooks/mercadopago', (req, res) => {
  const { type, data } = req.body;
  
  if (type === 'payment') {
    // Procesar notificación de pago
    console.log('Pago actualizado:', data.id);
  }
  
  res.status(200).send('OK');
});
```

---

### **7. 🛠️ Testing Completo**

#### **Checkout Pro (Redirección):**
```javascript
// En checkout.html
procesarPagoMercadoPago(); // Función ya implementada
```

#### **Checkout Transparente (Formulario):**
```javascript
// En cualquier página con formulario de tarjeta
mercadoPago.initTransparentCheckout('form-checkout');
```

---

### **8. 🔍 Debugging**

#### **Verificar en Consola del Navegador:**
```javascript
// Verificar inicialización
console.log('MercadoPago:', window.mercadoPago);

// Ver configuración actual
console.log('MP Config:', mercadoPago.config);

// Testing manual
mercadoPago.createPreference([
  { id: 'test', name: 'Producto Test', price: 100, quantity: 1 }
], { email: 'test@test.com' });
```

---

### **9. 🚀 Ir a Producción**

#### **Checklist Pre-Producción:**
- [ ] Credenciales de producción configuradas
- [ ] URLs de back_urls actualizadas
- [ ] Webhooks configurados y testeados
- [ ] Testing completo con tarjetas reales
- [ ] HTTPS configurado (obligatorio)

#### **Cambiar Environment:**
```javascript
// En js/mercadopago.js línea 570
const environment = 'production'; // Cambiar de 'sandbox' a 'production'
```

---

### **10. 💡 Funcionalidades Implementadas**

#### **✅ Checkout Pro:**
- Redirección a MercadoPago
- Múltiples métodos de pago
- Manejo automático de respuestas

#### **✅ Checkout Transparente:**
- Formulario integrado
- Validación en tiempo real
- Tokenización segura

#### **✅ Gestión de Estados:**
- Pagos aprobados ✅
- Pagos pendientes ⏳
- Pagos rechazados ❌
- Reintentos automáticos 🔄

#### **✅ Notificaciones:**
- Toast notifications automáticas
- Feedback visual inmediato
- Redirecciones inteligentes

---

### **11. 📞 Soporte**

#### **MercadoPago:**
- 📖 Documentación: [https://www.mercadopago.com.ar/developers/es/docs](https://www.mercadopago.com.ar/developers/es/docs)
- 💬 Soporte: [https://www.mercadopago.com.ar/ayuda](https://www.mercadopago.com.ar/ayuda)

#### **Testing Local:**
- 🌐 Demo: `http://localhost:8080/demo-sistemas-profesionales.html`
- 🛒 Checkout: `http://localhost:8080/checkout.html`

---

### **12. ⚠️ Consideraciones de Seguridad**

#### **NUNCA exponer:**
- ❌ Access Token en frontend
- ❌ Credenciales en repositorios públicos
- ❌ Datos de tarjetas reales en testing

#### **SIEMPRE usar:**
- ✅ HTTPS en producción
- ✅ Validación server-side
- ✅ Webhooks para confirmación
- ✅ Variables de entorno para credenciales

---

## 🎉 **¡LISTO PARA VENDER!**

Una vez configurado correctamente, tu ecommerce podrá:
- 💳 **Procesar pagos reales**
- 🔒 **Mantener seguridad PCI**
- 📱 **Funcionar en mobile**
- 🌍 **Escalar internacionalmente**

**¡Tu Patagonia Style está listo para generar ingresos reales!** 🚀