/* alaprima · núcleo compartido (login, base de datos, pagos)
   - Con firebase configurado en config.js: Firebase Auth + Firestore.
   - Sin configurar: MODO LOCAL (todo en el navegador, solo para pruebas). */
(function () {
  const CFG = window.ALAPRIMA_CONFIG || {};
  const HAS_FB = !!(CFG.firebase && CFG.firebase.apiKey && CFG.firebase.projectId);
  const FB_VER = '10.12.2';
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('ap_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ap_' + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem('ap_' + k); } catch (e) {} }
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uidGen = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

  /* ---------------- textos del núcleo ---------------- */
  const T = {
    es: { login: 'Ingresar', signup: 'Crear cuenta', account: 'Mi cuenta', orders: 'Mis pedidos', reports: 'Mis informes', panel: 'Panel', logout: 'Cerrar sesión',
      t_login: 'Ingresa a tu cuenta', t_signup: 'Crea tu cuenta gratis', t_reset: 'Recuperar contraseña', t_verify: 'Activa tu cuenta',
      google: 'Continuar con Google', or: 'o con tu correo', name: 'Nombre', email: 'Correo', pass: 'Contraseña (mínimo 8 caracteres)', country: 'País',
      consent: 'Acepto los <a href="legal.html#terminos" target="_blank">Términos</a>, la <a href="legal.html#privacidad" target="_blank">Política de privacidad</a> y el <a href="legal.html#ia" target="_blank">Aviso de uso de IA</a>.',
      go_login: 'Ingresar', go_signup: 'Crear cuenta', go_reset: 'Enviar enlace', forgot: '¿Olvidaste tu contraseña?', have: '¿Ya tienes cuenta? Ingresa', nohave: '¿No tienes cuenta? Créala gratis', back: 'Volver',
      verify_txt: 'Te enviamos un correo a {e} para activar tu cuenta. Abre el enlace y vuelve aquí. Si no lo ves, revisa spam o promociones.',
      resend: 'Reenviar correo', verified_btn: 'Ya la activé', sent: 'Correo enviado', not_yet: 'Aún no aparece activada. Abre el enlace del correo y vuelve a intentar.',
      reset_ok: 'Si existe una cuenta con ese correo, te llegará un enlace para crear una nueva contraseña.', welcome: 'Hola, {n}',
      need_consent: 'Debes aceptar los términos para crear la cuenta.', need_fields: 'Completa correo y contraseña (mínimo 8 caracteres).',
      local: 'Modo de prueba: los datos se guardan solo en este navegador.', local_verified: 'Modo de prueba: tu cuenta queda activada sin correo.',
      google_local: 'El acceso con Google estará disponible muy pronto. Por ahora usa tu correo.',
      pay_missing: 'Los pagos en línea se activan en las próximas horas. Escríbenos y te reservamos tu revisión:', pay_demo: 'Modo de prueba: simulamos un pago exitoso (no se cobra nada).',
      redirect: 'Te llevamos al pago seguro de Polar…',
      e: { 'auth/email-already-in-use': 'Ese correo ya tiene una cuenta. Ingresa o recupera tu contraseña.', 'auth/invalid-credential': 'Correo o contraseña incorrectos.', 'auth/wrong-password': 'Correo o contraseña incorrectos.', 'auth/user-not-found': 'Correo o contraseña incorrectos.', 'auth/weak-password': 'La contraseña debe tener al menos 8 caracteres.', 'auth/invalid-email': 'Ese correo no es válido.', 'auth/popup-closed-by-user': 'Se cerró la ventana de Google antes de terminar.', 'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.', 'auth/network-request-failed': 'Sin conexión. Revisa tu internet.', 'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase (Authentication → Settings → Authorized domains).', 'permission-denied': 'No tienes permiso para esta acción.', generic: 'Algo falló. Inténtalo de nuevo.' } },
    en: { login: 'Log in', signup: 'Sign up', account: 'My account', orders: 'My orders', reports: 'My reports', panel: 'Admin', logout: 'Log out',
      t_login: 'Log in to your account', t_signup: 'Create your free account', t_reset: 'Reset your password', t_verify: 'Activate your account',
      google: 'Continue with Google', or: 'or with your email', name: 'Name', email: 'Email', pass: 'Password (8+ characters)', country: 'Country',
      consent: 'I agree to the <a href="legal.html#terminos" target="_blank">Terms</a>, the <a href="legal.html#privacidad" target="_blank">Privacy Policy</a> and the <a href="legal.html#ia" target="_blank">AI Use Notice</a>.',
      go_login: 'Log in', go_signup: 'Create account', go_reset: 'Send link', forgot: 'Forgot your password?', have: 'Already have an account? Log in', nohave: 'No account yet? Sign up free', back: 'Back',
      verify_txt: 'We sent an email to {e} to activate your account. Open the link and come back here. Check spam or promotions if you don’t see it.',
      resend: 'Resend email', verified_btn: 'I’ve activated it', sent: 'Email sent', not_yet: 'It doesn’t show as activated yet. Open the link in the email and try again.',
      reset_ok: 'If an account exists for that email, you’ll get a link to set a new password.', welcome: 'Hi, {n}',
      need_consent: 'You must accept the terms to create an account.', need_fields: 'Enter email and password (8+ characters).',
      local: 'Test mode: data is stored only in this browser.', local_verified: 'Test mode: your account is activated without email.',
      google_local: 'Google sign-in is coming very soon. For now, use your email.',
      pay_missing: 'Online payments go live in the next few hours. Email us and we’ll reserve your review:', pay_demo: 'Test mode: simulating a successful payment (nothing is charged).',
      redirect: 'Taking you to Polar’s secure checkout…',
      e: { 'auth/email-already-in-use': 'That email already has an account. Log in or reset your password.', 'auth/invalid-credential': 'Wrong email or password.', 'auth/wrong-password': 'Wrong email or password.', 'auth/user-not-found': 'Wrong email or password.', 'auth/weak-password': 'Password must be at least 8 characters.', 'auth/invalid-email': 'That email isn’t valid.', 'auth/popup-closed-by-user': 'The Google window was closed before finishing.', 'auth/too-many-requests': 'Too many attempts. Wait a few minutes.', 'auth/network-request-failed': 'No connection. Check your internet.', 'auth/unauthorized-domain': 'This domain isn’t authorized in Firebase (Authentication → Settings → Authorized domains).', 'permission-denied': 'You don’t have permission for this.', generic: 'Something went wrong. Please try again.' } },
    pt: { login: 'Entrar', signup: 'Criar conta', account: 'Minha conta', orders: 'Meus pedidos', reports: 'Meus relatórios', panel: 'Painel', logout: 'Sair',
      t_login: 'Entre na sua conta', t_signup: 'Crie sua conta grátis', t_reset: 'Recuperar senha', t_verify: 'Ative sua conta',
      google: 'Continuar com Google', or: 'ou com seu e-mail', name: 'Nome', email: 'E-mail', pass: 'Senha (mínimo 8 caracteres)', country: 'País',
      consent: 'Aceito os <a href="legal.html#terminos" target="_blank">Termos</a>, a <a href="legal.html#privacidad" target="_blank">Política de privacidade</a> e o <a href="legal.html#ia" target="_blank">Aviso de uso de IA</a>.',
      go_login: 'Entrar', go_signup: 'Criar conta', go_reset: 'Enviar link', forgot: 'Esqueceu a senha?', have: 'Já tem conta? Entre', nohave: 'Não tem conta? Crie grátis', back: 'Voltar',
      verify_txt: 'Enviamos um e-mail para {e} para ativar sua conta. Abra o link e volte aqui. Se não encontrar, veja spam ou promoções.',
      resend: 'Reenviar e-mail', verified_btn: 'Já ativei', sent: 'E-mail enviado', not_yet: 'Ainda não aparece ativada. Abra o link do e-mail e tente de novo.',
      reset_ok: 'Se existir uma conta com esse e-mail, você receberá um link para criar uma nova senha.', welcome: 'Olá, {n}',
      need_consent: 'Você precisa aceitar os termos para criar a conta.', need_fields: 'Preencha e-mail e senha (mínimo 8 caracteres).',
      local: 'Modo de teste: os dados ficam só neste navegador.', local_verified: 'Modo de teste: sua conta fica ativada sem e-mail.',
      google_local: 'O acesso com Google estará disponível em breve. Por enquanto, use seu e-mail.',
      pay_missing: 'Os pagamentos on-line serão ativados nas próximas horas. Escreva para nós e reservamos sua revisão:', pay_demo: 'Modo de teste: simulamos um pagamento aprovado (nada é cobrado).',
      redirect: 'Levando você ao pagamento seguro da Polar…',
      e: { 'auth/email-already-in-use': 'Esse e-mail já tem conta. Entre ou recupere a senha.', 'auth/invalid-credential': 'E-mail ou senha incorretos.', 'auth/wrong-password': 'E-mail ou senha incorretos.', 'auth/user-not-found': 'E-mail ou senha incorretos.', 'auth/weak-password': 'A senha precisa ter pelo menos 8 caracteres.', 'auth/invalid-email': 'E-mail inválido.', 'auth/popup-closed-by-user': 'A janela do Google foi fechada antes de terminar.', 'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.', 'auth/network-request-failed': 'Sem conexão. Verifique sua internet.', 'auth/unauthorized-domain': 'Este domínio não está autorizado no Firebase.', 'permission-denied': 'Você não tem permissão para isso.', generic: 'Algo deu errado. Tente de novo.' } },
    fr: { login: 'Se connecter', signup: 'Créer un compte', account: 'Mon compte', orders: 'Mes commandes', reports: 'Mes rapports', panel: 'Admin', logout: 'Se déconnecter',
      t_login: 'Connectez-vous', t_signup: 'Créez votre compte gratuit', t_reset: 'Réinitialiser le mot de passe', t_verify: 'Activez votre compte',
      google: 'Continuer avec Google', or: 'ou avec votre e-mail', name: 'Nom', email: 'E-mail', pass: 'Mot de passe (8 caractères minimum)', country: 'Pays',
      consent: 'J’accepte les <a href="legal.html#terminos" target="_blank">Conditions</a>, la <a href="legal.html#privacidad" target="_blank">Politique de confidentialité</a> et la <a href="legal.html#ia" target="_blank">Notice d’utilisation de l’IA</a>.',
      go_login: 'Se connecter', go_signup: 'Créer le compte', go_reset: 'Envoyer le lien', forgot: 'Mot de passe oublié ?', have: 'Déjà un compte ? Connectez-vous', nohave: 'Pas de compte ? Créez-le gratuitement', back: 'Retour',
      verify_txt: 'Nous avons envoyé un e-mail à {e} pour activer votre compte. Ouvrez le lien puis revenez ici. Vérifiez vos spams si besoin.',
      resend: 'Renvoyer l’e-mail', verified_btn: 'C’est activé', sent: 'E-mail envoyé', not_yet: 'Le compte n’apparaît pas encore activé. Ouvrez le lien de l’e-mail et réessayez.',
      reset_ok: 'Si un compte existe pour cet e-mail, vous recevrez un lien pour créer un nouveau mot de passe.', welcome: 'Bonjour, {n}',
      need_consent: 'Vous devez accepter les conditions pour créer un compte.', need_fields: 'Saisissez e-mail et mot de passe (8 caractères minimum).',
      local: 'Mode test : les données restent dans ce navigateur.', local_verified: 'Mode test : votre compte est activé sans e-mail.',
      google_local: 'La connexion Google arrive très bientôt. Pour l’instant, utilisez votre e-mail.',
      pay_missing: 'Le paiement en ligne s’active dans les prochaines heures. Écrivez-nous et nous réservons votre relecture :', pay_demo: 'Mode test : nous simulons un paiement réussi (rien n’est débité).',
      redirect: 'Redirection vers le paiement sécurisé Polar…',
      e: { 'auth/email-already-in-use': 'Cet e-mail a déjà un compte. Connectez-vous ou réinitialisez le mot de passe.', 'auth/invalid-credential': 'E-mail ou mot de passe incorrect.', 'auth/wrong-password': 'E-mail ou mot de passe incorrect.', 'auth/user-not-found': 'E-mail ou mot de passe incorrect.', 'auth/weak-password': 'Le mot de passe doit contenir au moins 8 caractères.', 'auth/invalid-email': 'E-mail invalide.', 'auth/popup-closed-by-user': 'La fenêtre Google a été fermée avant la fin.', 'auth/too-many-requests': 'Trop de tentatives. Patientez quelques minutes.', 'auth/network-request-failed': 'Pas de connexion. Vérifiez internet.', 'auth/unauthorized-domain': 'Ce domaine n’est pas autorisé dans Firebase.', 'permission-denied': 'Vous n’avez pas l’autorisation.', generic: 'Une erreur est survenue. Réessayez.' } }
  };
  const COUNTRIES = [['US', 'United States'], ['CA', 'Canada'], ['FR', 'France'], ['BE', 'Belgique'], ['CH', 'Suisse'], ['LU', 'Luxembourg'], ['ES', 'España'], ['PT', 'Portugal'], ['MX', 'México'], ['CO', 'Colombia'], ['PE', 'Perú'], ['CL', 'Chile'], ['AR', 'Argentina'], ['BR', 'Brasil'], ['EC', 'Ecuador'], ['UY', 'Uruguay'], ['BO', 'Bolivia'], ['PY', 'Paraguay'], ['CR', 'Costa Rica'], ['PA', 'Panamá'], ['DO', 'Rep. Dominicana'], ['GT', 'Guatemala'], ['GB', 'United Kingdom'], ['DE', 'Deutschland'], ['IT', 'Italia'], ['OT', 'Other / Otro']];

  let LANG = 'es';
  const tt = (k, v) => { let s = (T[LANG] && T[LANG][k]) ?? T.es[k] ?? k; if (v) for (const x in v) s = String(s).replaceAll('{' + x + '}', v[x]); return s; };
  const errMsg = e => { const c = (e && (e.code || e.message)) || ''; const m = T[LANG].e; return m[c] || (c.includes('permission') ? m['permission-denied'] : m.generic); };

  /* ---------------- estado ---------------- */
  let user = null; const subs = []; let fb = null;
  const emit = () => subs.forEach(f => { try { f(user); } catch (e) { console.error(e); } });
  let resolveReady; const ready = new Promise(r => (resolveReady = r)); let readyDone = false;
  const markReady = () => { if (!readyDone) { readyDone = true; resolveReady(); } };

  /* ---------------- backend LOCAL ---------------- */
  const local = {
    hash(s) { let h = 5381; for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) | 0; return 'h' + (h >>> 0).toString(16); },
    users() { return LS.get('lu', {}); },
    load() { const s = LS.get('ls', null); const U = this.users(); user = s && U[s] ? { uid: U[s].uid, email: s, name: U[s].name, verified: true, provider: 'password', country: U[s].country } : null; },
    async signup(name, email, pass, country) { const U = this.users(); if (U[email]) throw { code: 'auth/email-already-in-use' }; U[email] = { uid: 'local_' + uidGen(), name, pwh: this.hash(pass), country }; LS.set('lu', U); LS.set('ls', email); this.load(); await db.set('users', user.uid, { email, name, country, lang: LANG }); emit(); },
    async login(email, pass) { const U = this.users(); if (!U[email] || U[email].pwh !== this.hash(pass)) throw { code: 'auth/invalid-credential' }; LS.set('ls', email); this.load(); emit(); },
    async logout() { LS.del('ls'); user = null; emit(); },
    col(c) { return LS.get('db_' + c, {}); }, save(c, o) { LS.set('db_' + c, o); }
  };

  /* ---------------- backend FIREBASE ---------------- */
  async function loadFirebase() {
    const b = `https://www.gstatic.com/firebasejs/${FB_VER}/`;
    const [A, U, F] = await Promise.all([import(b + 'firebase-app.js'), import(b + 'firebase-auth.js'), import(b + 'firebase-firestore.js')]);
    const app = A.initializeApp(CFG.firebase);
    const auth = U.getAuth(app); const fs = F.getFirestore(app);
    fb = { A, U, F, auth, fs };
    try { await U.getRedirectResult(auth); } catch (e) { }
    U.onAuthStateChanged(auth, async u => {
      user = u ? norm(u) : null;
      if (u) { try { const p = await F.getDoc(F.doc(fs, 'users', u.uid)); if (p.exists()) { const d = p.data(); user.country = d.country || ''; if (!user.name) user.name = d.name || ''; } } catch (e) { } }
      emit(); markReady();
    });
  }
  const norm = u => ({ uid: u.uid, email: u.email, name: u.displayName || '', verified: !!u.emailVerified, provider: (u.providerData[0] || {}).providerId || 'password' });
  const actionUrl = () => (CFG.SITE_URL || location.origin + location.pathname.replace(/[^/]*$/, '')) .replace(/\/$/, '') + '/app.html';

  const auth = {
    async signup(name, email, pass, country) {
      if (!fb) return local.signup(name, email, pass, country);
      const { U, auth: a } = fb; a.languageCode = LANG;
      const cred = await U.createUserWithEmailAndPassword(a, email, pass);
      if (name) await U.updateProfile(cred.user, { displayName: name });
      await db.set('users', cred.user.uid, { email, name, country, lang: LANG, provider: 'password' });
      try { await U.sendEmailVerification(cred.user, { url: actionUrl() }); } catch (e) { try { await U.sendEmailVerification(cred.user); } catch (_) { } }
      user = norm(cred.user); user.name = name; user.country = country; emit();
    },
    async login(email, pass) { if (!fb) return local.login(email, pass); await fb.U.signInWithEmailAndPassword(fb.auth, email, pass); },
    async google() {
      if (!fb) throw { code: 'local-google' };
      const { U, auth: a } = fb; a.languageCode = LANG; const p = new U.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
      let cred;
      try { cred = await U.signInWithPopup(a, p); } catch (e) { if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') { await U.signInWithRedirect(a, p); return; } throw e; }
      await db.set('users', cred.user.uid, { email: cred.user.email, name: cred.user.displayName || '', lang: LANG, provider: 'google' });
    },
    async reset(email) { if (!fb) return; fb.auth.languageCode = LANG; try { await fb.U.sendPasswordResetEmail(fb.auth, email, { url: actionUrl() }); } catch (e) { if (e.code !== 'auth/user-not-found') throw e; } },
    async resend() { if (!fb || !fb.auth.currentUser) return; fb.auth.languageCode = LANG; await fb.U.sendEmailVerification(fb.auth.currentUser, { url: actionUrl() }); },
    async refresh() { if (!fb || !fb.auth.currentUser) return user; await fb.auth.currentUser.reload(); await fb.auth.currentUser.getIdToken(true); const c = user && user.country; user = norm(fb.auth.currentUser); user.country = c; emit(); return user; },
    async logout() { if (!fb) return local.logout(); await fb.U.signOut(fb.auth); }
  };

  /* ---------------- base de datos (misma interfaz en ambos modos) ---------------- */
  const tsToIso = v => v && v.toDate ? v.toDate().toISOString() : (v || '');
  const fixDoc = (id, d) => { const o = { id, ...d }; ['ts', 'updated'].forEach(k => { if (o[k]) o[k] = tsToIso(o[k]); }); return o; };
  const db = {
    now() { return fb ? fb.F.serverTimestamp() : new Date().toISOString(); },
    async add(c, data) {
      if (!fb) { const C = local.col(c); const id = uidGen(); C[id] = { ...data }; local.save(c, C); return id; }
      const r = await fb.F.addDoc(fb.F.collection(fb.fs, c), data); return r.id;
    },
    async set(c, id, data, merge = true) {
      if (!fb) { const C = local.col(c); C[id] = merge ? { ...(C[id] || {}), ...data } : data; local.save(c, C); return id; }
      await fb.F.setDoc(fb.F.doc(fb.fs, c, id), data, { merge }); return id;
    },
    async get(c, id) {
      if (!fb) { const C = local.col(c); return C[id] ? fixDoc(id, C[id]) : null; }
      const s = await fb.F.getDoc(fb.F.doc(fb.fs, c, id)); return s.exists() ? fixDoc(s.id, s.data()) : null;
    },
    async update(c, id, data) {
      if (!fb) { const C = local.col(c); if (!C[id]) throw { code: 'not-found' }; C[id] = { ...C[id], ...data }; local.save(c, C); return; }
      await fb.F.updateDoc(fb.F.doc(fb.fs, c, id), data);
    },
    async remove(c, id) {
      if (!fb) { const C = local.col(c); delete C[id]; local.save(c, C); return; }
      await fb.F.deleteDoc(fb.F.doc(fb.fs, c, id));
    },
    sort(a) { return a.sort((x, y) => String(y.ts || '').localeCompare(String(x.ts || ''))); },
    async listMine(c) {
      if (!user) return [];
      if (!fb) { const C = local.col(c); return this.sort(Object.entries(C).filter(([, d]) => d.uid === user.uid).map(([i, d]) => fixDoc(i, d))); }
      const q = fb.F.query(fb.F.collection(fb.fs, c), fb.F.where('uid', '==', user.uid));
      const s = await fb.F.getDocs(q); return this.sort(s.docs.map(d => fixDoc(d.id, d.data())));
    },
    async listAll(c) {
      if (!fb) { const C = local.col(c); return this.sort(Object.entries(C).map(([i, d]) => fixDoc(i, d))); }
      const s = await fb.F.getDocs(fb.F.query(fb.F.collection(fb.fs, c), fb.F.orderBy('ts', 'desc'), fb.F.limit(2000)));
      return s.docs.map(d => fixDoc(d.id, d.data()));
    }
  };

  /* ---------------- formularios públicos ---------------- */
  async function saveLead(d) {
    const data = { name: String(d.name || '').slice(0, 120), email: String(d.email || '').trim().slice(0, 200), country: String(d.country || '').slice(0, 40), city: String(d.city || '').slice(0, 120), profile: String(d.profile || '').slice(0, 120), procedure: String(d.procedure || '').slice(0, 300), lang: LANG, source: String(d.source || 'landing').slice(0, 60), consent: !!d.consent, uid: user ? user.uid : '', ts: db.now() };
    return db.add('leads', data);
  }
  async function saveQuestion(d) {
    const data = { name: String(d.name || '').slice(0, 120), email: String(d.email || '').trim().slice(0, 200), question: String(d.question || '').slice(0, 2000), lang: LANG, uid: user ? user.uid : '', ts: db.now() };
    return db.add('questions', data);
  }

  /* ---------------- precios y pagos ---------------- */
  const regionFor = cc => (cc && (CFG.LATAM || []).includes(String(cc).toUpperCase())) ? 'latam' : 'global';
  const productFor = (kind, region) => kind + '-' + (region || 'global');
  const price = key => (CFG.PRODUCTS[key] || {}).price;
  const polarLocale = { es: 'es', en: 'en', pt: 'pt-BR', fr: 'fr' };

  const payMsg = () => tt('pay_missing').replace(/\s*:\s*$/, CFG.CONTACT_EMAIL ? ': ' + CFG.CONTACT_EMAIL : '.');
  async function checkout(key, meta = {}) {
    await ready;
    const P = CFG.PRODUCTS[key]; if (!P) return toast(T[LANG].e.generic);
    if (!user) return openAuth('signup', () => checkout(key, meta));
    if (!user.verified) return openAuth('verify', () => checkout(key, meta));
    const link = (CFG.POLAR || {})[key];
    if (!link) { toast(payMsg(), 7000); return; }
    let orderId;
    try {
      orderId = await db.add('orders', { uid: user.uid, email: user.email, name: user.name || '', product: key, kind: P.kind, region: P.region, price: P.price, currency: 'USD', status: 'checkout', lang: LANG, report_id: meta.report_id || '', procedure: meta.procedure || '', ts: db.now(), updated: db.now() });
    } catch (e) { toast(errMsg(e)); return; }
    LS.set('pending_order', { id: orderId, key, at: Date.now() });
    const u = new URL(link);
    u.searchParams.set('customer_email', user.email); if (user.name) u.searchParams.set('customer_name', user.name);
    u.searchParams.set('locale', polarLocale[LANG] || 'es'); u.searchParams.set('reference_id', orderId); u.searchParams.set('utm_source', 'alaprima-web');
    toast(tt('redirect')); setTimeout(() => (location.href = u.toString()), 300);
  }

  /* Regreso desde Polar: app.html?pago=ok&producto=x&checkout_id=y */
  async function handleReturn(q) {
    q = q || new URLSearchParams(location.search); if (q.get('pago') !== 'ok') return null;
    await ready; if (!user) return { needLogin: true };
    const cid = q.get('checkout_id') || ''; const key = q.get('producto') || '';
    const pend = LS.get('pending_order', null); let id = pend && (!key || pend.key === key) ? pend.id : null;
    try {
      if (id && !(await db.get('orders', id))) id = null;
      if (!id) { const P = CFG.PRODUCTS[key] || {}; id = await db.add('orders', { uid: user.uid, email: user.email, name: user.name || '', product: key, kind: P.kind || '', region: P.region || '', price: P.price || 0, currency: 'USD', status: 'checkout', lang: LANG, report_id: '', procedure: '', ts: db.now(), updated: db.now() }); }
      await db.update('orders', id, { status: 'paid_unverified', checkout_id: cid, updated: db.now() });
      LS.del('pending_order');
      history.replaceState(null, '', location.pathname + '#orders');
      return { orderId: id };
    } catch (e) { toast(errMsg(e)); return null; }
  }

  /* ---------------- UI: estilos, toast, modal, botón de cuenta ---------------- */
  const css = `
  .apc-toast{position:fixed;left:50%;bottom:calc(22px + env(safe-area-inset-bottom,0px));transform:translateX(-50%) translateY(16px);background:#14171F;color:#fff;padding:12px 18px;border-radius:12px;font:500 15px/1.4 "Schibsted Grotesk",system-ui,sans-serif;opacity:0;pointer-events:none;transition:.25s;z-index:1000;max-width:min(92vw,520px);text-align:center}
  .apc-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}
  .apc-ov{position:fixed;inset:0;background:rgba(20,23,31,.55);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;z-index:900;padding:16px}
  .apc-ov.on{display:flex}
  .apc-m{background:#fff;color:#14171F;border-radius:22px;width:min(440px,100%);max-height:92vh;overflow:auto;padding:28px;font-family:"Schibsted Grotesk",system-ui,sans-serif;position:relative;box-shadow:0 40px 80px -30px rgba(20,42,140,.5)}
  .apc-m h2{font-size:26px;letter-spacing:-.03em;margin:8px 0 18px;font-weight:900;line-height:1.1}
  .apc-x{position:absolute;top:14px;right:14px;border:0;background:#EEF0F3;width:34px;height:34px;border-radius:50%;font-size:18px;cursor:pointer;color:#14171F}
  .apc-m label{display:grid;gap:5px;font-size:14px;font-weight:600;margin-bottom:12px}
  .apc-m input,.apc-m select{font:inherit;font-size:16px;padding:11px 13px;border-radius:12px;border:1.5px solid #CDD3E0;width:100%;background:#fff;color:#14171F;box-sizing:border-box}
  .apc-m input:focus,.apc-m select:focus{outline:none;border-color:#2340D8;box-shadow:0 0 0 3px rgba(35,64,216,.18)}
  .apc-b{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:13px 16px;border-radius:12px;border:0;background:#2340D8;color:#fff;font:700 16px "Schibsted Grotesk",system-ui,sans-serif;cursor:pointer;box-sizing:border-box}
  .apc-b:hover{background:#142A8C}.apc-b:disabled{opacity:.5;cursor:wait}
  .apc-b.g{background:#fff;color:#14171F;border:1.5px solid #CDD3E0}.apc-b.g:hover{border-color:#14171F;background:#fff}
  .apc-or{display:flex;align-items:center;gap:10px;color:#6B7183;font-size:13.5px;margin:16px 0}.apc-or::before,.apc-or::after{content:"";flex:1;height:1px;background:#E4E8F0}
  .apc-ck{display:flex!important;grid-template-columns:none!important;gap:10px!important;align-items:flex-start;font-weight:400!important;font-size:13.5px!important;color:#4A5163}
  .apc-ck input{width:auto!important;margin-top:3px}
  .apc-ck a,.apc-l{color:#2340D8}
  .apc-l{background:none;border:0;font:inherit;font-size:14.5px;cursor:pointer;padding:6px 0;text-decoration:underline}
  .apc-err{background:#FBE9E9;color:#9B1C1C;border-radius:10px;padding:10px 12px;font-size:14px;margin-bottom:12px;display:none}
  .apc-ok{background:#E5F5EE;color:#0B6B47;border-radius:10px;padding:10px 12px;font-size:14px;margin-bottom:12px}
  .apc-row{display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-top:12px}
  .apc-acc{position:relative}
  .apc-chip{display:inline-flex;align-items:center;gap:8px;border:1.5px solid #C9D1E4;background:#fff;border-radius:999px;padding:4px 12px 4px 4px;font:600 14px "Schibsted Grotesk",system-ui,sans-serif;cursor:pointer;color:#14171F}
  .apc-av{width:28px;height:28px;border-radius:50%;background:#2340D8;color:#fff;display:grid;place-items:center;font-size:13px;font-weight:800}
  .apc-login{display:inline-flex;align-items:center;border:1.5px solid #14171F;background:transparent;border-radius:12px;padding:9px 14px;font:700 14.5px "Schibsted Grotesk",system-ui,sans-serif;cursor:pointer;color:#14171F;white-space:nowrap}
  .apc-menu{position:absolute;right:0;top:calc(100% + 8px);background:#fff;border:1px solid #DDE2EC;border-radius:14px;min-width:210px;padding:6px;box-shadow:0 20px 40px -20px rgba(0,0,0,.3);display:none;z-index:50}
  .apc-menu.on{display:block}.apc-menu a,.apc-menu button{display:block;width:100%;text-align:left;padding:10px 12px;border-radius:9px;border:0;background:none;font:500 15px "Schibsted Grotesk",system-ui,sans-serif;color:#14171F;text-decoration:none;cursor:pointer}
  .apc-menu a:hover,.apc-menu button:hover{background:#EEF0F3}.apc-menu small{display:block;padding:6px 12px 8px;color:#6B7183;font-size:12.5px;border-bottom:1px solid #EEF0F4;margin-bottom:4px;word-break:break-all}
  .apc-local{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));background:#F4E04D;color:#14171F;font:600 12.5px "Schibsted Grotesk",system-ui,sans-serif;padding:7px 12px;border-radius:999px;z-index:800;box-shadow:0 6px 16px -8px rgba(0,0,0,.4);max-width:calc(100vw - 24px)}
  @media(max-width:560px){.apc-chip .apc-nm{display:none}.apc-chip{padding:4px}.apc-login{padding:8px 11px;font-size:13.5px}}`;
  function injectCss() { if (document.getElementById('apc-css')) return; const s = document.createElement('style'); s.id = 'apc-css'; s.textContent = css; document.head.appendChild(s); }

  let toastEl, toastTimer;
  function toast(msg, ms = 2600) { injectCss(); if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'apc-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); } toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('on'), ms); }

  const GSVG = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
  let ov, after = null, mode = 'login';
  function openAuth(m = 'login', then = null) {
    injectCss(); after = then; mode = m;
    if (!ov) { ov = document.createElement('div'); ov.className = 'apc-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.addEventListener('click', e => { if (e.target === ov) closeAuth(); }); document.addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('on')) closeAuth(); }); document.body.appendChild(ov); }
    if (user && user.verified && (m === 'login' || m === 'signup')) { closeAuth(); const f = after; after = null; if (f) f(); return; }
    if (user && !user.verified && m !== 'reset') mode = 'verify';
    renderModal(); ov.classList.add('on'); setTimeout(() => { const i = ov.querySelector('input:not([type=checkbox]),button.apc-b'); i && i.focus(); }, 50);
  }
  function closeAuth() { if (ov) ov.classList.remove('on'); }
  function renderModal() {
    const logo = window.AP ? `<span style="display:block;width:118px">${AP.logo('hz', 'pos')}</span>` : '';
    const opts = '<option value=""></option>' + COUNTRIES.map(c => `<option value="${c[0]}">${c[1]}</option>`).join('');
    let h = `<div class="apc-m"><button class="apc-x" aria-label="×" data-a="close">×</button>${logo}`;
    if (mode === 'verify') {
      h += `<h2>${tt('t_verify')}</h2><p style="color:#4A5163;font-size:15.5px;line-height:1.5">${esc(tt('verify_txt', { e: user ? user.email : '' }))}</p><div class="apc-err" id="apcErr"></div>
      <button class="apc-b" data-a="checkv">${tt('verified_btn')}</button><div class="apc-row"><button class="apc-l" data-a="resend">${tt('resend')}</button><button class="apc-l" data-a="logout">${tt('logout')}</button></div>`;
    } else if (mode === 'reset') {
      h += `<h2>${tt('t_reset')}</h2><div class="apc-err" id="apcErr"></div><div id="apcOk"></div><form data-f="reset"><label>${tt('email')}<input name="email" type="email" autocomplete="email" required></label><button class="apc-b">${tt('go_reset')}</button></form><div class="apc-row"><button class="apc-l" data-a="login">${tt('back')}</button></div>`;
    } else {
      const su = mode === 'signup';
      h += `<h2>${tt(su ? 't_signup' : 't_login')}</h2><button class="apc-b g" data-a="google">${GSVG}${tt('google')}</button><div class="apc-or">${tt('or')}</div><div class="apc-err" id="apcErr"></div>
      <form data-f="${mode}">${su ? `<label>${tt('name')}<input name="name" autocomplete="name"></label>` : ''}
      <label>${tt('email')}<input name="email" type="email" autocomplete="email" required></label>
      <label>${tt('pass')}<input name="pass" type="password" minlength="8" autocomplete="${su ? 'new-password' : 'current-password'}" required></label>
      ${su ? `<label>${tt('country')}<select name="country">${opts}</select></label><label class="apc-ck"><input type="checkbox" name="consent"><span>${tt('consent')}</span></label>` : ''}
      <button class="apc-b">${tt(su ? 'go_signup' : 'go_login')}</button></form>
      <div class="apc-row">${su ? `<button class="apc-l" data-a="login">${tt('have')}</button>` : `<button class="apc-l" data-a="signup">${tt('nohave')}</button><button class="apc-l" data-a="reset">${tt('forgot')}</button>`}</div>`;
    }
        ov.innerHTML = h + '</div>';
    const err = m => { const e = ov.querySelector('#apcErr'); if (e) { e.textContent = m; e.style.display = m ? 'block' : 'none'; } };
    const busy = (b, on) => { if (b) b.disabled = on; };
    ov.querySelectorAll('[data-a]').forEach(b => b.onclick = async ev => {
      ev.preventDefault(); const a = b.dataset.a; err('');
      if (a === 'close') return closeAuth();
      if (['login', 'signup', 'reset'].includes(a)) { mode = a; return renderModal(); }
      try {
        busy(b, true);
        if (a === 'google') { if (!HAS_FB) { err(tt('google_local')); return; } await auth.google(); return done(); }
        if (a === 'resend') { await auth.resend(); toast(tt('sent')); }
        if (a === 'checkv') { const u = await auth.refresh(); if (u && u.verified) return done(); err(tt('not_yet')); }
        if (a === 'logout') { await auth.logout(); closeAuth(); }
      } catch (e) { err(errMsg(e)); } finally { busy(b, false); }
    });
    const f = ov.querySelector('form'); if (f) f.onsubmit = async ev => {
      ev.preventDefault(); err(''); const d = Object.fromEntries(new FormData(f)); const b = f.querySelector('button');
      d.email = String(d.email || '').trim().toLowerCase();
      try {
        busy(b, true);
        if (f.dataset.f === 'reset') { await auth.reset(d.email); ov.querySelector('#apcOk').innerHTML = `<div class="apc-ok">${esc(tt('reset_ok'))}</div>`; return; }
        if (!d.email || String(d.pass || '').length < 8) return err(tt('need_fields'));
        if (f.dataset.f === 'signup') { if (!d.consent) return err(tt('need_consent')); await auth.signup(String(d.name || '').trim(), d.email, d.pass, d.country || ''); if (HAS_FB) { mode = 'verify'; return renderModal(); } return done(); }
        await auth.login(d.email, d.pass); await new Promise(r => setTimeout(r, 300)); if (user && !user.verified) { mode = 'verify'; return renderModal(); } done();
      } catch (e) { err(errMsg(e)); } finally { busy(b, false); }
    };
  }
  function done() { closeAuth(); if (user && user.name) toast(tt('welcome', { n: user.name.split(' ')[0] })); const f = after; after = null; if (f) setTimeout(f, 50); }

  function isAdmin() { if (!user) return false; return user.verified && (CFG.ADMINS || []).map(s => s.toLowerCase()).includes((user.email || '').toLowerCase()); }

  function mountAccount(el, o = {}) {
    injectCss();
    const paint = () => {
      if (!user) { el.innerHTML = `<button class="apc-login" type="button">${tt('login')}</button>`; el.querySelector('button').onclick = () => openAuth('login', o.afterLogin || null); return; }
      const ini = (user.name || user.email || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
      el.innerHTML = `<div class="apc-acc"><button class="apc-chip" type="button" aria-haspopup="true" aria-expanded="false"><span class="apc-av">${esc(ini)}</span><span class="apc-nm">${esc((user.name || user.email).split(' ')[0].split('@')[0])}</span></button>
      <div class="apc-menu" role="menu"><small>${esc(user.email)}</small><a href="app.html#check">alaprima Pre-check</a><a href="app.html#reports">${tt('reports')}</a><a href="app.html#orders">${tt('orders')}</a>${isAdmin() ? `<a href="app.html#admin">${tt('panel')}</a>` : ''}<button data-out>${tt('logout')}</button></div></div>`;
      const btn = el.querySelector('.apc-chip'), menu = el.querySelector('.apc-menu');
      btn.onclick = e => { e.stopPropagation(); const on = menu.classList.toggle('on'); btn.setAttribute('aria-expanded', on); };
      document.addEventListener('click', () => menu.classList.remove('on'));
      el.querySelector('[data-out]').onclick = () => auth.logout();
      el.querySelectorAll('.apc-menu a').forEach(a => a.addEventListener('click', () => { if (o.onNav && a.getAttribute('href').startsWith('app.html') && location.pathname.endsWith('app.html')) { o.onNav(a.getAttribute('href').split('#')[1]); } }));
    };
    subs.push(paint); paint();
  }

  /* ---------------- arranque ---------------- */
  function boot() {
    injectCss();
    if (!HAS_FB) { local.load(); markReady(); emit(); }
    else loadFirebase().catch(e => { console.error('Firebase', e); toast(T[LANG].e.generic); markReady(); });
    setTimeout(markReady, 8000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.AP_CORE = {
    cfg: CFG, mode: HAS_FB ? 'firebase' : 'local', ready, db, auth, LS, esc,
    get lang() { return LANG; },
    setLang(l) { if (T[l]) { LANG = l; emit(); if (ov && ov.classList.contains('on')) renderModal(); } },
    t: tt, user: () => user, isAdmin, onAuth(f) { subs.push(f); if (readyDone) f(user); },
    openAuth, closeAuth, mountAccount, toast, errMsg, payMsg,
    saveLead, saveQuestion, checkout, handleReturn, regionFor, productFor, price, COUNTRIES
  };
})();
