# alaprima · web

Producto de **Limly LLC** · 8 The Green, Suite B, Dover, DE 19901, EE.UU.

Web estática (HTML + JS, sin compilación): landing, MVP y páginas legales en ES / EN / PT / FR.

| Archivo | Qué es |
|---|---|
| `index.html` | Landing con login, precios, formulario de contacto y preguntas |
| `app.html` | MVP: pre-revisión, Mis informes, Mis pedidos, Panel (solo admin) |
| `legal.html` | Términos, Privacidad y Uso de IA (`#terminos`, `#privacidad`, `#ia`) |
| `assets/config.js` | **Único archivo a editar**: Firebase, links de Polar, correos |
| `assets/core.js` | Login (correo + verificación, Google, recuperar contraseña), base de datos y pagos |
| `assets/brand.js` | Logo |
| `firestore.rules` | Reglas de seguridad para pegar en Firebase |
| `_headers` / `vercel.json` | Cabeceras de seguridad para Cloudflare Pages / Vercel |

## Modos
- **Sin Firebase configurado → modo de prueba**: todo se guarda en el navegador, el pago se simula. No sirve para vender.
- **Con Firebase configurado → producción**: cuentas reales, datos en Firestore, pagos reales con Polar.

## Publicar
Cloudflare Pages: Connect to Git → Framework *None* → Build command vacío → Output `/`.
Vercel (plan Pro para uso comercial): Import → Framework *Other*.

Guía completa: "Guía de lanzamiento alaprima" (Polar, Firebase y despliegue).

## Orden para lanzar (sin círculo vicioso)
1. Sube esta carpeta a GitHub (repo privado `alaprima-web`).
2. Conéctalo a Cloudflare Pages → obtienes la URL pública (modo de prueba).
3. Crea los links de Polar usando esa URL.
4. Crea Firebase (login + Firestore + reglas de `firestore.rules`).
5. Pega todo en `assets/config.js` (o pídeselo a Claude) y súbelo: la web pasa sola a producción.
