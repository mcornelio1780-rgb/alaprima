/* =====================================================================
   alaprima · CONFIGURACIÓN — el único archivo que hay que editar
   Producto de Limly LLC · 8 The Green, Suite B, Dover, DE 19901, EE.UU.
   ===================================================================== */
window.ALAPRIMA_CONFIG = {
  /* URL pública de la web (sin barra final). Ej: https://alaprima-web.pages.dev */
  SITE_URL: '',

  /* Correo de soporte visible en la web (uno que revises a diario) */
  CONTACT_EMAIL: 'manyosa@limly.io',

  /* Correos que pueden ver el Panel de administración (deben coincidir con firestore.rules) */
  ADMINS: [],

  /* Pega aquí el bloque firebaseConfig de Firebase (sección 3.1 de la guía).
     Mientras esté vacío, la web funciona en MODO LOCAL (solo para pruebas). */
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  },

  /* Links de pago de Polar (Checkout Links, empiezan con https://buy.polar.sh/...) */
  POLAR: {
    'local-latam': '',
    'local-global': '',
    'obra-latam': '',
    'obra-global': '',
    'pack-latam': '',
    'pack-global': ''
  },

  /* Precios (USD) que se muestran en la web. Deben coincidir con Polar. */
  PRODUCTS: {
    'local-latam': { kind: 'local', region: 'latam', price: 29 },
    'local-global': { kind: 'local', region: 'global', price: 49 },
    'obra-latam': { kind: 'obra', region: 'latam', price: 59 },
    'obra-global': { kind: 'obra', region: 'global', price: 99 },
    'pack-latam': { kind: 'pack', region: 'latam', price: 199 },
    'pack-global': { kind: 'pack', region: 'global', price: 349 }
  },

  /* Países con precio LATAM */
  LATAM: ['PE', 'MX', 'CO', 'CL', 'AR', 'BR', 'EC', 'BO', 'UY', 'PY', 'VE', 'CR', 'PA', 'GT', 'SV', 'HN', 'NI', 'DO', 'CU', 'PR'],

  COMPANY: 'Limly LLC',
  COMPANY_ADDRESS: '8 The Green, Suite B, Dover, DE 19901, USA'
};
