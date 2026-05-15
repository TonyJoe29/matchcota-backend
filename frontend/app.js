(() => {
  const API_BASE = window.location.origin;
  const TOKEN_KEY = 'matchcota_token';
  const USER_KEY = 'matchcota_user';
  const OLD_KEYS = ['matchcota_user_token', 'matchcota_admin_token', 'matchcota_demo_user'];
  const DEMO = {
    user: { email: 'adis06@gmail.com', password: 'Usuario123!' },
    admin: { email: 'admin@matchcota.test', password: 'Admin123!' }
  };
  const PET_STATUSES = ['disponible', 'en_proceso', 'adoptada', 'inactiva'];
  const REQUEST_TRANSITIONS = {
    pendiente: ['en_proceso', 'rechazada', 'cancelada'],
    en_proceso: ['aprobada', 'rechazada', 'cancelada'],
    aprobada: [],
    rechazada: [],
    cancelada: []
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const page = () => (window.location.pathname.split('/').pop() || 'home.html').toLowerCase();
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  const nice = (value) => esc(String(value ?? '').replace(/_/g, ' '));
  const clean = (object) => Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== ''));
  const formData = (form) => Object.fromEntries(new FormData(form).entries());

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    OLD_KEYS.forEach((key) => localStorage.removeItem(key));
  }

  function getSession() {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    if (!token || !user) return null;
    try {
      return { token, user: JSON.parse(user) };
    } catch (_error) {
      clearSession();
      return null;
    }
  }

  function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    OLD_KEYS.forEach((key) => localStorage.removeItem(key));
  }

  const isAdmin = (user) => user?.role === 'admin';
  const isSupport = (user) => user?.role === 'soporte';

  async function api(path, options = {}) {
    const session = getSession();
    const headers = { ...(options.headers || {}) };
    if (options.body) headers['Content-Type'] = 'application/json';
    if (session?.token || options.token) headers.Authorization = `Bearer ${options.token || session.token}`;

    const response = await fetch(`${API_BASE}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};
    if (!response.ok) {
      const error = new Error(payload.error || payload.message || `Error HTTP ${response.status}`);
      error.status = response.status;
      error.details = payload.details;
      throw error;
    }
    return payload;
  }

  function message(target, text, type = 'success') {
    const box = typeof target === 'string' ? $(target) : target;
    if (!box) return;
    box.innerHTML = `<div class="alert alert-${type} border-0 shadow-sm">${esc(text)}</div>`;
  }

  function setMain(html) {
    const main = $('main');
    if (main) main.innerHTML = `<div class="container-fluid py-2 py-md-4">${html}</div>`;
  }

  function loading(title = 'Cargando') {
    setMain(`<div class="card bg-card border-soft shadow-sm"><div class="card-body p-4"><h4 class="text-hard-brown-color">${esc(title)}</h4><p class="text-soft-brown-color mb-0">Consultando datos del backend...</p></div></div>`);
  }

  function errorView(title, error) {
    setMain(`<div class="card bg-card border-soft shadow-sm"><div class="card-body p-4"><h3 class="text-hard-brown-color">${esc(title)}</h3><p class="text-soft-brown-color">${esc(error?.message || error || 'Ocurrio un error.')}</p><a class="btn bg-orange text-white rounded-pill px-4" href="home.html">Volver</a></div></div>`);
  }

  function redirectLogin() {
    const next = `${window.location.pathname.split('/').pop() || 'home.html'}${window.location.search}`;
    window.location.href = `login.html?next=${encodeURIComponent(next)}`;
  }

  function requireSession(roles = []) {
    const session = getSession();
    if (!session) {
      redirectLogin();
      return null;
    }
    if (roles.length && !roles.includes(session.user.role)) {
      setSidebar(page());
      setMain(`<div class="card bg-card border-soft shadow-sm"><div class="card-body p-4"><h3 class="text-hard-brown-color">Acceso restringido</h3><p class="text-soft-brown-color">Tu rol actual es <b>${esc(session.user.role)}</b>. Esta vista requiere: ${roles.map(esc).join(' o ')}.</p><a class="btn bg-orange text-white rounded-pill px-4" href="home.html">Volver</a></div></div>`);
      return null;
    }
    return session;
  }

  function statusClass(status) {
    return {
      disponible: 'success', en_proceso: 'warning', adoptada: 'secondary', inactiva: 'dark',
      pendiente: 'warning', aprobada: 'success', rechazada: 'danger', cancelada: 'secondary',
      abierta: 'danger', en_revision: 'warning', resuelta: 'success', cerrada: 'secondary',
      activo: 'success', suspendido: 'warning', eliminado: 'secondary', admin: 'dark', soporte: 'info', usuario: 'primary'
    }[status] || 'secondary';
  }

  const badge = (status) => `<span class="badge badge-${statusClass(status)} px-3 py-2">${nice(status)}</span>`;
  const imgUrl = (pet) => pet?.photo_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(pet?.name || 'matchcota')}`;
  const petImg = (pet, cls = 'w-100 h-100') => `<img src="${esc(imgUrl(pet))}" alt="${esc(pet?.name || 'Mascota')}" class="${cls}" style="object-fit:cover" onerror="this.src='https://api.dicebear.com/7.x/shapes/svg?seed=matchcota'">`;

  function navLink(href, icon, text, active) {
    const on = active === href.toLowerCase();
    return `<a href="${href}" class="d-flex align-items-center px-3 py-2 rounded text-decoration-none mb-1 ${on ? 'bg-orange-soft text-hard-brown-color' : 'text-soft-brown-color'}"><i class="fas ${icon} mr-2 ${on ? 'text-orange-color' : ''}"></i><span>${text}</span></a>`;
  }

  function setSidebar(active = page()) {
    const nav = $('nav');
    if (!nav || active === 'login.html') return;
    const session = getSession();
    const user = session?.user;
    nav.className = 'col-12 col-md-3 col-lg-2 p-0 p-md-2';
    nav.innerHTML = `
      <div class="card bg-card border-soft shadow-sm h-100"><div class="card-body p-2">
        <div class="px-3 pt-2 pb-3"><a href="home.html" class="text-decoration-none text-hard-brown-color font-weight-bold h5"><i class="fas fa-paw text-hard-pink mr-2"></i>Matchcota</a></div>
        <small class="text-soft-brown-color font-weight-bold px-3 d-block mt-2 mb-2">PRINCIPAL</small>
        ${navLink('home.html', 'fa-home', 'Inicio', active)}${navLink('directory.html', 'fa-search', 'Directorio', active)}
        <small class="text-soft-brown-color font-weight-bold px-3 d-block mt-3 mb-2">MI CUENTA</small>
        ${session ? navLink('profile.html', 'fa-user', 'Mi Perfil', active) : navLink('login.html', 'fa-sign-in-alt', 'Iniciar sesion', active)}
        ${session ? navLink('publicar_mascotas.html', 'fa-plus-circle', 'Publicar mascota', active) : ''}
        ${session ? navLink('mis_mascotas.html', 'fa-paw', 'Mis Mascotas', active) : ''}
        ${session ? navLink('match.html', 'fa-envelope', 'Solicitudes', active) : ''}
        ${session ? navLink('incidents.html', 'fa-exclamation-circle', 'Incidencias', active) : ''}
        ${isAdmin(user) || isSupport(user) ? `<small class="text-soft-brown-color font-weight-bold px-3 d-block mt-3 mb-2">ADMIN</small>${isAdmin(user) ? navLink('admin.html', 'fa-tools', 'Panel Admin', active) + navLink('Gestionar_mascotas.html', 'fa-dog', 'Gestion mascotas', active) + navLink('statistics.html', 'fa-chart-bar', 'Estadisticas', active) : ''}` : ''}
        <div class="px-3 mt-4">${session ? `<small class="text-soft-brown-color d-block mb-2">Sesion: <b>${esc(user.username)}</b></small><div class="mb-2">${badge(user.role)}</div><button class="btn btn-sm btn-outline-secondary rounded-pill btn-block" data-logout>Cerrar sesion</button>` : '<a href="login.html" class="btn btn-sm bg-orange text-white rounded-pill btn-block">Entrar</a>'}</div>
      </div></div>`;
  }

  const options = (items, selected = '', label = (item) => item.name) => items.map((item) => `<option value="${esc(item.id)}" ${String(selected) === String(item.id) ? 'selected' : ''}>${esc(label(item))}</option>`).join('');
  const empty = (title, text, action = '') => `<div class="card bg-card border-soft shadow-sm"><div class="card-body p-4 text-center"><i class="fas fa-paw text-orange-color mb-3" style="font-size:42px"></i><h5 class="text-hard-brown-color font-weight-bold">${esc(title)}</h5><p class="text-soft-brown-color">${esc(text)}</p>${action}</div></div>`;
  const cardPet = (pet) => `<div class="col-12 col-md-6 col-xl-4 mb-3"><div class="card bg-card border-soft shadow-sm h-100"><div class="card-body d-flex flex-column"><div class="d-flex align-items-center mb-3"><div class="mr-3" style="width:92px;height:92px;overflow:hidden;border-radius:22px;background:#fdf8f2">${petImg(pet)}</div><div><h5 class="text-hard-brown-color font-weight-bold mb-1">${esc(pet.name)}</h5><small class="text-soft-brown-color d-block">${esc(pet.species)} ${pet.breed ? '- ' + esc(pet.breed) : ''}</small><small class="text-soft-brown-color d-block">${esc(pet.city)} - ${pet.age} anios</small></div></div><p class="text-soft-brown-color flex-grow-1">${esc(pet.description || 'Mascota esperando un hogar responsable.')}</p><div class="d-flex align-items-center justify-content-between">${badge(pet.status)}<a href="pet_detail.html?id=${pet.id}" class="btn btn-sm bg-orange text-white rounded-pill px-3">Ver detalle</a></div></div></div></div>`;

  async function catalogs() {
    const [species, breeds, sizes, cities] = await Promise.all([api('/catalogs/species'), api('/catalogs/breeds'), api('/catalogs/sizes'), api('/catalogs/cities')]);
    return { species: species.data || [], breeds: breeds.data || [], sizes: sizes.data || [], cities: cities.data || [] };
  }

  async function allPets() {
    const responses = await Promise.all(PET_STATUSES.map((status) => api(`/pets?status=${status}`).catch(() => ({ data: [] }))));
    const map = new Map();
    responses.flatMap((response) => response.data || []).forEach((pet) => map.set(pet.id, pet));
    return [...map.values()].sort((a, b) => b.id - a.id);
  }

  function renderLogin() {
    const tabs = document.querySelectorAll('[data-auth-tab]');
    const login = $('#login-form');
    const register = $('#register-form');
    const box = $('#auth-message');
    const session = getSession();
    if (session) message(box, `Ya tienes sesion activa como ${session.user.username}.`, 'info');

    tabs.forEach((tab) => tab.addEventListener('click', (event) => {
      event.preventDefault();
      tabs.forEach((item) => item.className = 'nav-link text-hard-brown-color');
      tab.className = 'nav-link active bg-orange text-white';
      const target = tab.dataset.authTab;
      login.classList.toggle('d-none', target !== 'login');
      register.classList.toggle('d-none', target !== 'register');
      box.innerHTML = '';
    }));

    const nextPage = (user) => {
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.href = next || (isAdmin(user) ? 'admin.html' : 'home.html');
    };

    login?.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        message(box, 'Validando credenciales...', 'info');
        const response = await api('/auth/login', { method: 'POST', body: formData(login) });
        saveSession(response.token, response.user);
        nextPage(response.user);
      } catch (error) {
        message(box, error.message, 'danger');
      }
    });

    register?.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        message(box, 'Creando cuenta...', 'info');
        const response = await api('/auth/register', { method: 'POST', body: clean(formData(register)) });
        saveSession(response.token, response.user);
        nextPage(response.user);
      } catch (error) {
        message(box, error.message, 'danger');
      }
    });

    document.querySelectorAll('[data-demo-login]').forEach((button) => button.addEventListener('click', () => {
      const account = DEMO[button.dataset.demoLogin];
      $('#login-email').value = account.email;
      $('#login-password').value = account.password;
      login.requestSubmit();
    }));
  }

  async function renderHome() {
    setSidebar('home.html');
    loading('Preparando inicio');
    try {
      const session = getSession();
      const petResponse = await api('/pets');
      const pets = petResponse.data || [];
      const stats = isAdmin(session?.user) ? await api('/admin/stats').catch(() => null) : null;
      const total = stats?.pets?.total_registradas ?? pets.length;
      const available = stats?.pets?.disponibles ?? pets.filter((pet) => pet.status === 'disponible').length;
      const adopted = stats?.pets?.adoptadas ?? 0;
      const requests = stats?.adoptions?.total_solicitudes ?? 0;
      setMain(`
        <section class="card bg-card border-soft shadow-sm mb-4" style="border-radius:28px;overflow:hidden"><div class="row no-gutters align-items-center"><div class="col-12 col-lg-7 p-4 p-lg-5"><span class="badge bg-soft-pink text-hard-pink px-3 py-2 mb-3">Backend conectado a SQLite</span><h1 class="text-hard-brown-color font-weight-bold mb-3">Matchcota funcional para demo</h1><p class="text-soft-brown-color mb-4">Login JWT, roles, mascotas, solicitudes, incidencias y panel admin desde el navegador.</p><a href="directory.html" class="btn bg-orange text-white rounded-pill px-4 mr-2 mb-2">Buscar mascotas</a>${session ? '<a href="profile.html" class="btn btn-outline-secondary rounded-pill px-4 mb-2">Mi perfil</a>' : '<a href="login.html" class="btn btn-outline-secondary rounded-pill px-4 mb-2">Iniciar sesion</a>'}</div><div class="col-12 col-lg-5 p-4" style="background:linear-gradient(135deg,#fde5ee,#ffe8c7,#dff2ec)"><div class="row text-center"><div class="col-6 mb-3"><div class="bg-card rounded p-3 border border-soft"><h3>${total}</h3><small>Mascotas</small></div></div><div class="col-6 mb-3"><div class="bg-card rounded p-3 border border-soft"><h3>${available}</h3><small>Disponibles</small></div></div><div class="col-6"><div class="bg-card rounded p-3 border border-soft"><h3>${adopted}</h3><small>Adoptadas</small></div></div><div class="col-6"><div class="bg-card rounded p-3 border border-soft"><h3>${requests}</h3><small>Solicitudes</small></div></div></div></div></div></section>
        <div class="d-flex justify-content-between align-items-center mb-3"><div><h3 class="text-hard-brown-color font-weight-bold mb-0">Mascotas disponibles</h3><small class="text-soft-brown-color">Datos reales desde la base de datos.</small></div><a href="directory.html" class="btn btn-sm btn-outline-secondary rounded-pill">Ver todas</a></div><div class="row">${pets.slice(0, 3).map(cardPet).join('') || '<div class="col-12">' + empty('Sin mascotas disponibles', 'Publica una mascota para iniciar la demo.', '<a href="publicar_mascotas.html" class="btn bg-orange text-white rounded-pill px-4">Publicar</a>') + '</div>'}</div>`);
    } catch (error) {
      errorView('No se pudo cargar el inicio', error);
    }
  }

  async function renderDirectory() {
    setSidebar('directory.html');
    loading('Cargando directorio');
    try {
      const [cat, response] = await Promise.all([catalogs(), api('/pets')]);
      const list = (pets) => $('#pets-list').innerHTML = pets.length ? pets.map(cardPet).join('') : `<div class="col-12">${empty('No encontramos mascotas', 'Prueba con otros filtros o publica una nueva mascota.')}</div>`;
      setMain(`<div class="d-flex flex-wrap justify-content-between align-items-end mb-4"><div><h2 class="text-hard-brown-color font-weight-bold mb-0">Directorio de mascotas</h2><small class="text-soft-brown-color">Filtros conectados al backend.</small></div><a href="publicar_mascotas.html" class="btn bg-hard-pink text-white rounded-pill px-4 mt-3 mt-md-0">Publicar mascota</a></div><form id="filter-form" class="card bg-card border-soft shadow-sm mb-4"><div class="card-body"><div class="form-row"><div class="form-group col-12 col-md-2"><label>Especie</label><select class="form-control" name="species_id"><option value="">Todas</option>${options(cat.species)}</select></div><div class="form-group col-12 col-md-2"><label>Raza</label><select class="form-control" name="breed_id"><option value="">Todas</option>${options(cat.breeds, '', (item) => `${item.name} (${item.species})`)}</select></div><div class="form-group col-12 col-md-2"><label>Ciudad</label><select class="form-control" name="city_id"><option value="">Todas</option>${options(cat.cities)}</select></div><div class="form-group col-12 col-md-2"><label>Tamanio</label><select class="form-control" name="size_id"><option value="">Todos</option>${options(cat.sizes)}</select></div><div class="form-group col-12 col-md-2"><label>Edad max.</label><input class="form-control" name="max_age" type="number" min="0"></div><div class="form-group col-12 col-md-2 d-flex align-items-end"><button class="btn bg-orange text-white btn-block rounded-pill" type="submit">Filtrar</button></div></div></div></form><div id="directory-message"></div><div id="pets-list" class="row"></div>`);
      list(response.data || []);
      $('#filter-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
          message('#directory-message', 'Aplicando filtros...', 'info');
          const params = new URLSearchParams(clean(formData(event.currentTarget)));
          const filtered = await api(`/pets?${params.toString()}`);
          $('#directory-message').innerHTML = '';
          list(filtered.data || []);
        } catch (error) {
          message('#directory-message', error.message, 'danger');
        }
      });
    } catch (error) {
      errorView('No se pudo cargar el directorio', error);
    }
  }

  async function renderPetDetail() {
    setSidebar('pet_detail.html');
    loading('Cargando detalle');
    try {
      const id = new URLSearchParams(window.location.search).get('id') || '1';
      const { pet } = await api(`/pets/${id}`);
      const session = getSession();
      const own = session?.user?.id === pet.owner_id;
      setMain(`<div class="row"><div class="col-12 col-lg-7 mb-4"><div class="card bg-card border-soft shadow-sm h-100"><div class="card-body p-4"><div class="mb-4" style="height:320px;overflow:hidden;border-radius:28px;background:#fdf8f2">${petImg(pet)}</div><div class="d-flex flex-wrap justify-content-between align-items-start mb-3"><div><h2 class="text-hard-brown-color font-weight-bold mb-1">${esc(pet.name)}</h2><p class="text-soft-brown-color mb-0">${esc(pet.species)} ${pet.breed ? '- ' + esc(pet.breed) : ''} - ${pet.age} anios - ${esc(pet.city)}</p></div>${badge(pet.status)}</div><p class="text-soft-brown-color">${esc(pet.description || 'Sin descripcion registrada.')}</p><div class="row text-center mt-4"><div class="col-6 col-md-3 mb-2"><div class="bg-soft rounded p-3"><b>${esc(pet.gender)}</b><small class="d-block">Genero</small></div></div><div class="col-6 col-md-3 mb-2"><div class="bg-soft rounded p-3"><b>${esc(pet.size)}</b><small class="d-block">Tamanio</small></div></div><div class="col-6 col-md-3 mb-2"><div class="bg-soft rounded p-3"><b>${pet.is_vaccinated ? 'Si' : 'No'}</b><small class="d-block">Vacunada</small></div></div><div class="col-6 col-md-3 mb-2"><div class="bg-soft rounded p-3"><b>${pet.is_sterilized ? 'Si' : 'No'}</b><small class="d-block">Esterilizada</small></div></div></div></div></div></div><div class="col-12 col-lg-5 mb-4"><div class="card bg-card border-soft shadow-sm"><div class="card-body p-4"><h4 class="text-hard-brown-color font-weight-bold">Solicitud de adopcion</h4><p class="text-soft-brown-color">El backend valida JWT, disponibilidad y solicitudes duplicadas.</p><div id="adoption-message"></div>${!session ? `<a href="login.html?next=${encodeURIComponent(`pet_detail.html?id=${pet.id}`)}" class="btn bg-orange text-white rounded-pill px-4">Iniciar sesion para solicitar</a>` : own ? '<div class="alert alert-info">Esta mascota esta registrada como tuya.</div>' : pet.status !== 'disponible' ? '<div class="alert alert-warning">Esta mascota no esta disponible.</div>' : '<form id="adoption-form"><div class="form-group"><label>Motivacion</label><textarea class="form-control" name="motivation" rows="4" minlength="10" required>Quiero darle un hogar responsable y mucho cuidado.</textarea></div><div class="custom-control custom-checkbox mb-2"><input type="checkbox" class="custom-control-input" id="home_suitable" checked><label class="custom-control-label" for="home_suitable">Tengo un hogar adecuado</label></div><div class="custom-control custom-checkbox mb-3"><input type="checkbox" class="custom-control-input" id="special_care_experience"><label class="custom-control-label" for="special_care_experience">Tengo experiencia con cuidados especiales</label></div><button class="btn bg-hard-pink text-white rounded-pill px-4" type="submit">Enviar solicitud</button></form>'}</div></div></div></div>`);
      $('#adoption-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
          await api('/adoptions', { method: 'POST', body: { pet_id: pet.id, motivation: formData(event.currentTarget).motivation, home_suitable: $('#home_suitable').checked, special_care_experience: $('#special_care_experience').checked } });
          message('#adoption-message', 'Solicitud creada. Puedes verla en Solicitudes.', 'success');
          event.currentTarget.reset();
        } catch (error) {
          message('#adoption-message', error.message, 'danger');
        }
      });
    } catch (error) {
      errorView('No se pudo cargar la mascota', error);
    }
  }

  async function renderProfile() {
    const session = requireSession();
    if (!session) return;
    setSidebar('profile.html');
    loading('Cargando perfil');
    try {
      const [profile, alertData, cat] = await Promise.all([api('/users/profile'), api('/users/alerts').catch(() => ({ alert: null })), catalogs()]);
      const user = profile.user;
      const alert = alertData.alert || {};
      setMain(`<div class="d-flex flex-wrap justify-content-between align-items-end mb-4"><div><h2 class="text-hard-brown-color font-weight-bold mb-0">Mi perfil</h2><small class="text-soft-brown-color">Perfil y alertas del usuario autenticado.</small></div>${badge(user.role)}</div><div id="profile-message"></div><div class="row"><div class="col-12 col-lg-7 mb-4"><form id="profile-form" class="card bg-card border-soft shadow-sm"><div class="card-body p-4"><h4 class="text-hard-brown-color font-weight-bold mb-3">Datos generales</h4><div class="form-row"><div class="form-group col-12 col-md-6"><label>Nombre</label><input class="form-control" name="name" value="${esc(user.name)}" required></div><div class="form-group col-12 col-md-6"><label>Username</label><input class="form-control" value="${esc(user.username)}" disabled></div><div class="form-group col-12 col-md-6"><label>Email</label><input class="form-control" value="${esc(user.email)}" disabled></div><div class="form-group col-12 col-md-6"><label>Ubicacion</label><input class="form-control" name="location" value="${esc(user.location || '')}"></div><div class="form-group col-12 col-md-6"><label>Ocupacion</label><input class="form-control" name="occupation" value="${esc(user.occupation || '')}"></div><div class="form-group col-12 col-md-6"><label>Tipo de vivienda</label><input class="form-control" name="housing_type" value="${esc(user.housing_type || '')}"></div><div class="form-group col-12 col-md-6"><label>Horas disponibles al dia</label><input class="form-control" name="daily_available_hours" type="number" min="0" value="${esc(user.daily_available_hours || '')}"></div><div class="form-group col-12 col-md-6"><label>Experiencia con mascotas</label><input class="form-control" name="pet_experience" value="${esc(user.pet_experience || '')}"></div></div><button class="btn bg-orange text-white rounded-pill px-4" type="submit">Guardar perfil</button></div></form></div><div class="col-12 col-lg-5 mb-4"><form id="alert-form" class="card bg-card border-soft shadow-sm"><div class="card-body p-4"><h4 class="text-hard-brown-color font-weight-bold mb-3">Alertas personalizadas</h4><div class="custom-control custom-switch mb-3"><input type="checkbox" class="custom-control-input" id="alert-active" ${alert.active === 0 ? '' : 'checked'}><label class="custom-control-label" for="alert-active">Alertas activas</label></div><div class="form-group"><label>Especie</label><select class="form-control" name="species"><option value="">Cualquiera</option>${options(cat.species, alert.species_ids?.[0])}</select></div><div class="form-group"><label>Raza</label><select class="form-control" name="breed"><option value="">Cualquiera</option>${options(cat.breeds, alert.breed_ids?.[0], (item) => `${item.name} (${item.species})`)}</select></div><div class="form-group"><label>Ciudad</label><select class="form-control" name="city"><option value="">Cualquiera</option>${options(cat.cities, alert.city_ids?.[0])}</select></div><div class="form-row"><div class="form-group col-6"><label>Edad min.</label><input class="form-control" name="min_age" type="number" min="0" value="${esc(alert.min_age ?? '')}"></div><div class="form-group col-6"><label>Edad max.</label><input class="form-control" name="max_age" type="number" min="0" value="${esc(alert.max_age ?? '')}"></div></div><button class="btn bg-hard-pink text-white rounded-pill px-4" type="submit">Guardar alertas</button></div></form></div></div>`);
      $('#profile-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
          const response = await api('/users/profile', { method: 'PUT', body: clean(formData(event.currentTarget)) });
          saveSession(session.token, response.user);
          message('#profile-message', 'Perfil actualizado correctamente.', 'success');
          setSidebar('profile.html');
        } catch (error) {
          message('#profile-message', error.message, 'danger');
        }
      });
      $('#alert-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const data = clean(formData(event.currentTarget));
        try {
          await api('/users/alerts', { method: 'PUT', body: { active: $('#alert-active').checked, preferences: { species: data.species ? [data.species] : [], breeds: data.breed ? [data.breed] : [], cities: data.city ? [data.city] : [] }, min_age: data.min_age, max_age: data.max_age } });
          message('#profile-message', 'Alertas guardadas correctamente.', 'success');
        } catch (error) {
          message('#profile-message', error.message, 'danger');
        }
      });
    } catch (error) {
      errorView('No se pudo cargar el perfil', error);
    }
  }

  async function renderPublishPet() {
    const session = requireSession();
    if (!session) return;
    setSidebar('publicar_mascotas.html');
    loading('Preparando formulario');
    try {
      const cat = await catalogs();
      setMain(`<div class="d-flex flex-wrap justify-content-between align-items-end mb-4"><div><h2 class="text-hard-brown-color font-weight-bold mb-0">Publicar mascota</h2><small class="text-soft-brown-color">Usa POST /pets con JWT.</small></div><a href="mis_mascotas.html" class="btn btn-outline-secondary rounded-pill px-4 mt-3 mt-md-0">Mis mascotas</a></div><div id="publish-message"></div><form id="pet-form" class="card bg-card border-soft shadow-sm"><div class="card-body p-4"><div class="form-row"><div class="form-group col-12 col-md-6"><label>Nombre</label><input class="form-control" name="name" required></div><div class="form-group col-12 col-md-3"><label>Edad</label><input class="form-control" name="age" type="number" min="0" required></div><div class="form-group col-12 col-md-3"><label>Genero</label><select class="form-control" name="gender" required><option value="macho">Macho</option><option value="hembra">Hembra</option></select></div><div class="form-group col-12 col-md-3"><label>Especie</label><select class="form-control" name="species_id" required>${options(cat.species)}</select></div><div class="form-group col-12 col-md-3"><label>Raza</label><select class="form-control" name="breed_id"><option value="">Sin raza</option>${options(cat.breeds, '', (item) => `${item.name} (${item.species})`)}</select></div><div class="form-group col-12 col-md-3"><label>Tamanio</label><select class="form-control" name="size_id" required>${options(cat.sizes)}</select></div><div class="form-group col-12 col-md-3"><label>Ciudad</label><select class="form-control" name="city_id" required>${options(cat.cities)}</select></div><div class="form-group col-12"><label>URL de foto</label><input class="form-control" name="photo_url" type="url" placeholder="https://..."></div><div class="form-group col-12 col-md-6"><label>Estado de salud</label><input class="form-control" name="health_status"></div><div class="form-group col-12 col-md-6"><label>Necesidades especiales</label><input class="form-control" name="special_needs"></div><div class="form-group col-12"><label>Descripcion</label><textarea class="form-control" name="description" rows="4"></textarea></div></div><div class="row mb-3"><div class="col-12 col-md-4"><div class="custom-control custom-checkbox"><input class="custom-control-input" id="is_vaccinated" type="checkbox" checked><label class="custom-control-label" for="is_vaccinated">Vacunada</label></div></div><div class="col-12 col-md-4"><div class="custom-control custom-checkbox"><input class="custom-control-input" id="is_sterilized" type="checkbox"><label class="custom-control-label" for="is_sterilized">Esterilizada</label></div></div><div class="col-12 col-md-4"><div class="custom-control custom-checkbox"><input class="custom-control-input" id="compatible_children" type="checkbox" checked><label class="custom-control-label" for="compatible_children">Convive con ninos</label></div></div></div><button class="btn bg-orange text-white rounded-pill px-4" type="submit">Guardar mascota</button></div></form>`);
      $('#pet-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const body = { ...clean(formData(event.currentTarget)), is_vaccinated: $('#is_vaccinated').checked, is_sterilized: $('#is_sterilized').checked, compatible_children: $('#compatible_children').checked, compatible_dogs: true, compatible_cats: true };
        try {
          const response = await api('/pets', { method: 'POST', body });
          message('#publish-message', `Mascota creada: ${response.pet.name}.`, 'success');
          event.currentTarget.reset();
        } catch (error) {
          message('#publish-message', error.message, 'danger');
        }
      });
    } catch (error) {
      errorView('No se pudo preparar la publicacion', error);
    }
  }

  async function renderMyPets() {
    const session = requireSession();
    if (!session) return;
    setSidebar('mis_mascotas.html');
    loading('Cargando tus mascotas');
    const load = async () => {
      const response = await api('/pets/my');
      const pets = response.data || [];
      $('#my-pets-list').innerHTML = pets.length ? pets.map((pet) => `<div class="col-12 col-lg-6 mb-3"><div class="card bg-card border-soft shadow-sm h-100"><div class="card-body"><div class="d-flex align-items-center mb-3"><div class="mr-3" style="width:82px;height:82px;overflow:hidden;border-radius:20px">${petImg(pet)}</div><div class="flex-grow-1"><h5 class="font-weight-bold text-hard-brown-color mb-1">${esc(pet.name)}</h5><small class="text-soft-brown-color d-block">${esc(pet.species)} - ${esc(pet.city)}</small>${badge(pet.status)}</div></div><a href="pet_detail.html?id=${pet.id}" class="btn btn-sm bg-orange text-white rounded-pill px-3 mr-2 mb-2">Ver</a><button class="btn btn-sm btn-outline-danger rounded-pill px-3 mb-2" data-delete-pet="${pet.id}">Eliminar</button></div></div></div>`).join('') : `<div class="col-12">${empty('Aun no publicas mascotas', 'Publica tu primera mascota para verla aqui.', '<a href="publicar_mascotas.html" class="btn bg-orange text-white rounded-pill px-4">Publicar</a>')}</div>`;
    };
    try {
      setMain(`<div class="d-flex flex-wrap justify-content-between align-items-end mb-4"><div><h2 class="text-hard-brown-color font-weight-bold mb-0">Mis mascotas</h2><small class="text-soft-brown-color">Listado por usuario autenticado.</small></div><a href="publicar_mascotas.html" class="btn bg-hard-pink text-white rounded-pill px-4 mt-3 mt-md-0">Nueva mascota</a></div><div id="my-pets-message"></div><div id="my-pets-list" class="row"></div>`);
      await load();
      $('#my-pets-list').addEventListener('click', async (event) => {
        const button = event.target.closest('[data-delete-pet]');
        if (!button || !window.confirm('Quieres eliminar esta mascota de forma logica?')) return;
        try {
          await api(`/pets/${button.dataset.deletePet}`, { method: 'DELETE' });
          message('#my-pets-message', 'Mascota eliminada logicamente.', 'success');
          await load();
        } catch (error) {
          message('#my-pets-message', error.message, 'danger');
        }
      });
    } catch (error) {
      errorView('No se pudieron cargar tus mascotas', error);
    }
  }

  const requestButtons = (request, adminAttr = '') => (REQUEST_TRANSITIONS[request.status] || []).map((status) => `<button class="btn btn-sm btn-outline-secondary rounded-pill px-3 mr-2 mb-2" data-request-id="${request.id}" data-request-status="${status}" ${adminAttr}>${nice(status)}</button>`).join('');
  const requestCard = (request, admin = false) => `<div class="card bg-card border-soft shadow-sm mb-3"><div class="card-body p-3"><div class="d-flex flex-wrap align-items-center justify-content-between"><div class="d-flex align-items-center mb-3 mb-md-0"><div class="mr-3" style="width:62px;height:62px;overflow:hidden;border-radius:18px;background:#fdf8f2"><img src="${esc(request.pet_photo_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(request.pet_name)}`)}" class="w-100 h-100" style="object-fit:cover" alt="${esc(request.pet_name)}"></div><div><h5 class="text-hard-brown-color font-weight-bold mb-1">${esc(request.pet_name)}</h5><small class="text-soft-brown-color">Solicitante: ${esc(request.requester_username || 'Yo')}</small><div class="mt-2">${badge(request.status)} ${badge(request.pet_status)}</div></div></div>${admin ? `<div>${requestButtons(request) || '<small class="text-soft-brown-color">Sin acciones</small>'}</div>` : ''}</div><div class="mt-3 p-3 bg-soft rounded border border-soft"><small class="text-soft-brown-color">${esc(request.motivation || request.message || 'Sin mensaje adicional.')}</small></div></div></div>`;

  async function renderRequests() {
    const session = requireSession();
    if (!session) return;
    const admin = isAdmin(session.user);
    setSidebar('match.html');
    loading('Cargando solicitudes');
    const load = async () => {
      const response = await api(admin ? '/adoptions' : '/adoptions/my-requests');
      const requests = response.data || [];
      $('#requests-list').innerHTML = requests.length ? requests.map((request) => requestCard(request, admin)).join('') : empty('Sin solicitudes por ahora', admin ? 'Cuando un usuario solicite una mascota aparecera aqui.' : 'Solicita una mascota desde el directorio para verla aqui.', '<a href="directory.html" class="btn bg-orange text-white rounded-pill px-4">Ir al directorio</a>');
    };
    try {
      setMain(`<div class="d-flex flex-wrap justify-content-between align-items-end mb-4"><div><h2 class="text-hard-brown-color font-weight-bold mb-0">Solicitudes de adopcion</h2><small class="text-soft-brown-color">${admin ? 'Vista administrativa de todas las solicitudes.' : 'Panel de mis solicitudes.'}</small></div>${admin ? '<a href="admin.html" class="btn btn-outline-secondary rounded-pill px-4 mt-3 mt-md-0">Panel admin</a>' : '<a href="directory.html" class="btn bg-orange text-white rounded-pill px-4 mt-3 mt-md-0">Buscar mascota</a>'}</div><div id="requests-message"></div><div id="requests-list"></div>`);
      await load();
      $('#requests-list').addEventListener('click', async (event) => {
        const button = event.target.closest('[data-request-status]');
        if (!button) return;
        try {
          await api(`/adoptions/${button.dataset.requestId}/status`, { method: 'PATCH', body: { status: button.dataset.requestStatus } });
          message('#requests-message', 'Estatus de solicitud actualizado.', 'success');
          await load();
        } catch (error) {
          message('#requests-message', error.message, 'danger');
        }
      });
    } catch (error) {
      errorView('No se pudieron cargar las solicitudes', error);
    }
  }

  const statCard = (title, value, subtitle, subvalue, icon) => `<div class="col-12 col-md-6 col-xl-3 mb-3"><div class="card bg-card border-soft shadow-sm h-100"><div class="card-body p-4"><div class="d-flex align-items-center justify-content-between"><div><small class="text-soft-brown-color font-weight-bold">${esc(title)}</small><h2 class="text-hard-brown-color font-weight-bold mb-0">${value || 0}</h2><small>${esc(subtitle)}: ${subvalue || 0}</small></div><i class="fas ${icon} text-orange-color" style="font-size:32px"></i></div></div></div></div>`;
  const progressCard = (title, current, total) => { const percent = total ? Math.round((Number(current) / Number(total)) * 100) : 0; return `<div class="card bg-card border-soft shadow-sm h-100"><div class="card-body p-4"><h5 class="text-hard-brown-color font-weight-bold">${esc(title)}</h5><div class="progress mb-2" style="height:18px;border-radius:18px"><div class="progress-bar bg-orange" style="width:${percent}%">${percent}%</div></div><small class="text-soft-brown-color">${current || 0} de ${total || 0}</small></div></div>`; };

  async function renderStatistics() {
    const session = requireSession(['admin']);
    if (!session) return;
    setSidebar('statistics.html');
    loading('Cargando estadisticas');
    try {
      const stats = await api('/admin/stats');
      setMain(`<div class="mb-4"><h2 class="text-hard-brown-color font-weight-bold mb-0">Estadisticas admin</h2><small class="text-soft-brown-color">Indicadores generados desde SQLite.</small></div><div class="row">${statCard('Usuarios', stats.users.total, 'Activos', stats.users.activos, 'fa-users')}${statCard('Mascotas', stats.pets.total_registradas, 'Disponibles', stats.pets.disponibles, 'fa-paw')}${statCard('Solicitudes', stats.adoptions.total_solicitudes, 'Pendientes', stats.adoptions.pendientes, 'fa-envelope')}${statCard('Soporte', Number(stats.support.incidencias_abiertas || 0) + Number(stats.support.incidencias_resueltas || 0), 'Abiertas', stats.support.incidencias_abiertas || 0, 'fa-life-ring')}</div><div class="row mt-2"><div class="col-12 col-lg-6 mb-3">${progressCard('Mascotas adoptadas', stats.pets.adoptadas || 0, stats.pets.total_registradas || 1)}</div><div class="col-12 col-lg-6 mb-3">${progressCard('Solicitudes aprobadas', stats.adoptions.aprobadas || 0, stats.adoptions.total_solicitudes || 1)}</div></div>`);
    } catch (error) {
      errorView('No se pudieron cargar las estadisticas', error);
    }
  }

  async function renderIncidents() {
    const session = requireSession();
    if (!session) return;
    const canManage = isAdmin(session.user) || isSupport(session.user);
    setSidebar('incidents.html');
    loading('Cargando incidencias');
    const load = async () => {
      if (!canManage) {
        $('#incidents-list').innerHTML = empty('Reporte enviado al equipo de soporte', 'Como usuario puedes crear incidencias. El listado completo es para admin o soporte.');
        return;
      }
      const response = await api('/support/incidents');
      const incidents = response.data || [];
      $('#incidents-list').innerHTML = incidents.length ? incidents.map((incident) => `<div class="card bg-card border-soft shadow-sm mb-3"><div class="card-body"><div class="d-flex flex-wrap justify-content-between align-items-start"><div><h5 class="text-hard-brown-color font-weight-bold mb-1">${esc(incident.subject)}</h5><small class="text-soft-brown-color">${esc(incident.username)} - ${esc(incident.type)}</small><p class="text-soft-brown-color mt-2 mb-0">${esc(incident.description)}</p></div><div class="text-right mt-3 mt-md-0">${badge(incident.status)}<select class="form-control form-control-sm mt-2" data-incident-id="${incident.id}">${['abierta', 'en_revision', 'resuelta', 'cerrada'].map((status) => `<option value="${status}" ${incident.status === status ? 'selected' : ''}>${nice(status)}</option>`).join('')}</select></div></div></div></div>`).join('') : empty('Sin incidencias', 'Todavia no hay reportes de soporte.');
    };
    try {
      setMain(`<div class="mb-4"><h2 class="text-hard-brown-color font-weight-bold mb-0">Soporte e incidencias</h2><small class="text-soft-brown-color">Usuarios reportan; admin y soporte gestionan.</small></div><div id="incident-message"></div><div class="row"><div class="col-12 col-lg-5 mb-4"><form id="incident-form" class="card bg-card border-soft shadow-sm"><div class="card-body p-4"><h4 class="text-hard-brown-color font-weight-bold mb-3">Reportar incidencia</h4><div class="form-group"><label>Tipo</label><select class="form-control" name="type"><option value="error">Error</option><option value="queja">Queja</option><option value="sugerencia">Sugerencia</option></select></div><div class="form-group"><label>Asunto</label><input class="form-control" name="subject" minlength="5" required></div><div class="form-group"><label>Descripcion</label><textarea class="form-control" name="description" rows="5" minlength="10" required></textarea></div><button class="btn bg-orange text-white rounded-pill px-4" type="submit">Enviar reporte</button></div></form></div><div class="col-12 col-lg-7 mb-4"><div id="incidents-list"></div></div></div>`);
      await load();
      $('#incident-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
          await api('/support/incidents', { method: 'POST', body: clean(formData(event.currentTarget)) });
          message('#incident-message', 'Incidencia reportada correctamente.', 'success');
          event.currentTarget.reset();
          await load();
        } catch (error) {
          message('#incident-message', error.message, 'danger');
        }
      });
      $('#incidents-list').addEventListener('change', async (event) => {
        const select = event.target.closest('[data-incident-id]');
        if (!select) return;
        try {
          await api(`/support/incidents/${select.dataset.incidentId}/status`, { method: 'PATCH', body: { status: select.value } });
          message('#incident-message', 'Incidencia actualizada.', 'success');
          await load();
        } catch (error) {
          message('#incident-message', error.message, 'danger');
        }
      });
    } catch (error) {
      errorView('No se pudieron cargar las incidencias', error);
    }
  }

  async function renderPetManagement() {
    const session = requireSession(['admin']);
    if (!session) return;
    setSidebar('gestionar_mascotas.html');
    loading('Cargando gestion de mascotas');
    const load = async () => {
      const pets = await allPets();
      $('#admin-pets-table').innerHTML = pets.length ? `<div class="table-responsive"><table class="table table-hover bg-card"><thead><tr><th>ID</th><th>Mascota</th><th>Catalogos</th><th>Owner</th><th>Estatus</th><th>Acciones</th></tr></thead><tbody>${pets.map((pet) => `<tr><td>${pet.id}</td><td><b>${esc(pet.name)}</b><br><small>${esc(pet.city)}</small></td><td>${esc(pet.species)} / ${esc(pet.breed || 'Sin raza')} / ${esc(pet.size)}</td><td>${esc(pet.owner_username)}</td><td><select class="form-control form-control-sm" data-pet-status="${pet.id}">${PET_STATUSES.map((status) => `<option value="${status}" ${pet.status === status ? 'selected' : ''}>${nice(status)}</option>`).join('')}</select></td><td><a class="btn btn-sm btn-outline-secondary rounded-pill" href="pet_detail.html?id=${pet.id}">Ver</a></td></tr>`).join('')}</tbody></table></div>` : empty('No hay mascotas', 'Publica mascotas para gestionarlas.');
    };
    try {
      setMain(`<div class="d-flex flex-wrap justify-content-between align-items-end mb-4"><div><h2 class="text-hard-brown-color font-weight-bold mb-0">Gestion de mascotas</h2><small class="text-soft-brown-color">Admin puede cambiar estatus de mascotas.</small></div><a href="publicar_mascotas.html" class="btn bg-orange text-white rounded-pill px-4 mt-3 mt-md-0">Publicar mascota</a></div><div id="pet-management-message"></div><div id="admin-pets-table"></div>`);
      await load();
      $('#admin-pets-table').addEventListener('change', async (event) => {
        const select = event.target.closest('[data-pet-status]');
        if (!select) return;
        try {
          await api(`/pets/${select.dataset.petStatus}`, { method: 'PUT', body: { status: select.value } });
          message('#pet-management-message', 'Estatus de mascota actualizado.', 'success');
          await load();
        } catch (error) {
          message('#pet-management-message', error.message, 'danger');
        }
      });
    } catch (error) {
      errorView('No se pudo cargar la gestion de mascotas', error);
    }
  }

  const adminUsersTable = (users, currentUserId) => `<div class="card bg-card border-soft shadow-sm h-100"><div class="card-body p-4"><h4 class="text-hard-brown-color font-weight-bold mb-3">Usuarios</h4><div class="table-responsive"><table class="table table-sm table-hover"><thead><tr><th>Usuario</th><th>Rol</th><th>Estatus</th></tr></thead><tbody>${users.map((user) => { const disabled = user.id === currentUserId ? 'disabled' : ''; return `<tr><td><b>${esc(user.username)}</b><br><small>${esc(user.email)}</small></td><td><select class="form-control form-control-sm" data-user-role="${user.id}" ${disabled}>${['admin', 'soporte', 'usuario'].map((role) => `<option value="${role}" ${user.role === role ? 'selected' : ''}>${role}</option>`).join('')}</select></td><td><select class="form-control form-control-sm" data-user-status="${user.id}" ${disabled}>${['activo', 'suspendido', 'eliminado'].map((status) => `<option value="${status}" ${user.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></td></tr>`; }).join('')}</tbody></table></div><small class="text-soft-brown-color">Tu usuario admin se bloquea para evitar suspenderte por accidente.</small></div></div>`;
  const adminRequestsPanel = (requests) => `<div class="card bg-card border-soft shadow-sm h-100"><div class="card-body p-4"><h4 class="text-hard-brown-color font-weight-bold mb-3">Solicitudes</h4>${requests.length ? requests.slice(0, 5).map((request) => `<div class="border-bottom border-soft py-2"><div class="d-flex justify-content-between"><b>${esc(request.pet_name)}</b>${badge(request.status)}</div><small class="text-soft-brown-color">${esc(request.requester_username)}</small><div class="mt-2">${(REQUEST_TRANSITIONS[request.status] || []).map((status) => `<button class="btn btn-sm btn-outline-secondary rounded-pill mr-1 mb-1" data-admin-request-id="${request.id}" data-admin-request-status="${status}">${nice(status)}</button>`).join('') || '<small class="text-soft-brown-color">Cerrada</small>'}</div></div>`).join('') : empty('Sin solicitudes', 'Aun no hay solicitudes de adopcion.')}<a href="match.html" class="btn btn-sm btn-outline-secondary rounded-pill mt-3">Ver todas</a></div></div>`;
  const adminPetsPanel = (pets) => `<div class="card bg-card border-soft shadow-sm h-100"><div class="card-body p-4"><h4 class="text-hard-brown-color font-weight-bold mb-3">Mascotas</h4>${pets.length ? pets.slice(0, 6).map((pet) => `<div class="d-flex align-items-center justify-content-between border-bottom border-soft py-2"><div><b>${esc(pet.name)}</b><br><small>${esc(pet.owner_username)} - ${esc(pet.city)}</small></div><select class="form-control form-control-sm w-auto" data-admin-pet-status="${pet.id}">${PET_STATUSES.map((status) => `<option value="${status}" ${pet.status === status ? 'selected' : ''}>${nice(status)}</option>`).join('')}</select></div>`).join('') : empty('Sin mascotas', 'Aun no hay mascotas publicadas.')}<a href="Gestionar_mascotas.html" class="btn btn-sm btn-outline-secondary rounded-pill mt-3">Gestion completa</a></div></div>`;
  const adminIncidentsPanel = (incidents) => `<div class="card bg-card border-soft shadow-sm h-100"><div class="card-body p-4"><h4 class="text-hard-brown-color font-weight-bold mb-3">Incidencias</h4>${incidents.length ? incidents.slice(0, 5).map((incident) => `<div class="d-flex align-items-center justify-content-between border-bottom border-soft py-2"><div><b>${esc(incident.subject)}</b><br><small>${esc(incident.username)} - ${esc(incident.type)}</small></div><select class="form-control form-control-sm w-auto" data-admin-incident-status="${incident.id}">${['abierta', 'en_revision', 'resuelta', 'cerrada'].map((status) => `<option value="${status}" ${incident.status === status ? 'selected' : ''}>${nice(status)}</option>`).join('')}</select></div>`).join('') : empty('Sin incidencias', 'Todavia no hay reportes.')}<a href="incidents.html" class="btn btn-sm btn-outline-secondary rounded-pill mt-3">Ver soporte</a></div></div>`;

  async function renderAdmin() {
    const session = requireSession(['admin']);
    if (!session) return;
    setSidebar('admin.html');
    loading('Cargando panel admin');
    const load = async () => {
      const [stats, users, requests, incidents, pets] = await Promise.all([api('/admin/stats'), api('/admin/users'), api('/adoptions'), api('/support/incidents'), allPets()]);
      $('#admin-content').innerHTML = `<div class="row">${statCard('Usuarios', stats.users.total, 'Activos', stats.users.activos, 'fa-users')}${statCard('Mascotas', stats.pets.total_registradas, 'Disponibles', stats.pets.disponibles, 'fa-paw')}${statCard('Solicitudes', stats.adoptions.total_solicitudes, 'Pendientes', stats.adoptions.pendientes, 'fa-envelope')}${statCard('Incidencias', Number(stats.support.incidencias_abiertas || 0) + Number(stats.support.incidencias_resueltas || 0), 'Abiertas', stats.support.incidencias_abiertas || 0, 'fa-life-ring')}</div><div class="row"><div class="col-12 col-xl-6 mb-4">${adminUsersTable(users.data || [], session.user.id)}</div><div class="col-12 col-xl-6 mb-4">${adminRequestsPanel(requests.data || [])}</div><div class="col-12 col-xl-6 mb-4">${adminPetsPanel(pets)}</div><div class="col-12 col-xl-6 mb-4">${adminIncidentsPanel(incidents.data || [])}</div></div>`;
    };
    try {
      setMain(`<div class="d-flex flex-wrap justify-content-between align-items-end mb-4"><div><h2 class="text-hard-brown-color font-weight-bold mb-0">Panel de administracion</h2><small class="text-soft-brown-color">Gestion principal para la demo.</small></div><a href="statistics.html" class="btn bg-orange text-white rounded-pill px-4 mt-3 mt-md-0">Ver estadisticas</a></div><div id="admin-message"></div><div id="admin-content"></div>`);
      await load();
      $('#admin-content').addEventListener('change', async (event) => {
        const role = event.target.closest('[data-user-role]');
        const userStatus = event.target.closest('[data-user-status]');
        const pet = event.target.closest('[data-admin-pet-status]');
        const incident = event.target.closest('[data-admin-incident-status]');
        try {
          if (role) await api(`/admin/users/${role.dataset.userRole}/role`, { method: 'PATCH', body: { role: role.value } });
          if (userStatus) await api(`/admin/users/${userStatus.dataset.userStatus}/status`, { method: 'PATCH', body: { status: userStatus.value } });
          if (pet) await api(`/pets/${pet.dataset.adminPetStatus}`, { method: 'PUT', body: { status: pet.value } });
          if (incident) await api(`/support/incidents/${incident.dataset.adminIncidentStatus}/status`, { method: 'PATCH', body: { status: incident.value } });
          if (role || userStatus || pet || incident) {
            message('#admin-message', 'Cambio guardado correctamente.', 'success');
            await load();
          }
        } catch (error) {
          message('#admin-message', error.message, 'danger');
          await load();
        }
      });
      $('#admin-content').addEventListener('click', async (event) => {
        const button = event.target.closest('[data-admin-request-status]');
        if (!button) return;
        try {
          await api(`/adoptions/${button.dataset.adminRequestId}/status`, { method: 'PATCH', body: { status: button.dataset.adminRequestStatus } });
          message('#admin-message', 'Solicitud actualizada.', 'success');
          await load();
        } catch (error) {
          message('#admin-message', error.message, 'danger');
        }
      });
    } catch (error) {
      errorView('No se pudo cargar el panel admin', error);
    }
  }

  function bindGlobalEvents() {
    document.addEventListener('click', (event) => {
      if (!event.target.closest('[data-logout]')) return;
      clearSession();
      window.location.href = 'login.html';
    });
  }

  async function init() {
    bindGlobalEvents();
    const routes = {
      'login.html': renderLogin,
      'home.html': renderHome,
      'directory.html': renderDirectory,
      'pet_detail.html': renderPetDetail,
      'profile.html': renderProfile,
      'statistics.html': renderStatistics,
      'incidents.html': renderIncidents,
      'admin.html': renderAdmin,
      'match.html': renderRequests,
      'mis_mascotas.html': renderMyPets,
      'publicar_mascotas.html': renderPublishPet,
      'gestionar_mascotas.html': renderPetManagement
    };
    await (routes[page()] || renderHome)();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
