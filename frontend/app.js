const API_BASE = window.location.protocol.startsWith('http')
  ? window.location.origin
  : 'http://localhost:3000';

const demoUsers = {
  user: { email: 'adis06@gmail.com', password: 'Usuario123!' },
  admin: { email: 'admin@matchcota.test', password: 'Admin123!' }
};

const page = window.location.pathname.split('/').pop() || 'home.html';

const state = {
  userToken: localStorage.getItem('matchcota_user_token') || '',
  adminToken: localStorage.getItem('matchcota_admin_token') || ''
};

const qs = (selector, root = document) => root.querySelector(selector);

const api = async (path, options = {}) => {
  const headers = { ...(options.headers || {}) };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo completar la peticion.');
  }

  return data;
};

const loginDemo = async (role) => {
  const storageKey = role === 'admin' ? 'matchcota_admin_token' : 'matchcota_user_token';
  const stateKey = role === 'admin' ? 'adminToken' : 'userToken';

  if (state[stateKey]) {
    return state[stateKey];
  }

  const data = await api('/auth/login', {
    method: 'POST',
    body: demoUsers[role]
  });

  state[stateKey] = data.token;
  localStorage.setItem(storageKey, data.token);
  return data.token;
};

const iconForPet = (species) => {
  const normalized = String(species || '').toLowerCase();
  if (normalized.includes('gato')) return 'fa-cat';
  if (normalized.includes('otro')) return 'fa-paw';
  return 'fa-dog';
};

const petCard = (pet) => `
  <div class="col-md-4 mb-4">
    <a href="pet_detail.html?id=${pet.id}" class="text-decoration-none">
      <div class="card shadow-sm border border-hard pet-card h-100">
        <div class="bg-soft text-center p-4 text-orange-color">
          <i class="fas ${iconForPet(pet.species)} fa-5x"></i>
        </div>
        <div class="card-body bg-card">
          <h5 class="text-hard-brown-color font-weight-bold mb-1">${pet.name}</h5>
          <small class="text-soft-brown-color">${pet.breed || pet.species} - ${pet.city}</small>
          <div class="mt-3">
            <span class="badge bg-orange-soft border border-hard">${pet.size}</span>
            <span class="badge bg-card border border-soft">${pet.gender}</span>
            <span class="badge bg-aqua-soft border border-aqua">${pet.status}</span>
          </div>
          <p class="text-hard-brown-color small mt-3 mb-0">${pet.description || 'Sin descripcion.'}</p>
        </div>
      </div>
    </a>
  </div>
`;

const renderStatus = (message, type = 'info') => `
  <div class="alert alert-${type} border-soft" role="alert">${message}</div>
`;

const setNavLinks = () => {
  const links = document.querySelectorAll('nav a');
  const map = [
    ['Inicio', 'home.html'],
    ['Directorio', 'directory.html'],
    ['Mi Perfil', 'profile.html'],
    ['Solicitudes', 'profile.html#solicitudes'],
    ['Gestor', 'pet_detail.html?id=1'],
    ['Estad', 'statistics.html'],
    ['Incidencias', 'incidents.html']
  ];

  links.forEach((link) => {
    const text = link.textContent.trim();
    const found = map.find(([label]) => text.includes(label));
    if (found) {
      link.href = found[1];
    }
  });
};

const renderShellMessage = (main, message, type = 'danger') => {
  main.innerHTML = `<div class="container-fluid p-4">${renderStatus(message, type)}</div>`;
};

const renderHome = async (main) => {
  const adminToken = await loginDemo('admin');
  const [stats, petsResponse] = await Promise.all([
    api('/admin/stats', { token: adminToken }),
    api('/pets')
  ]);
  const pets = petsResponse.data || [];

  main.innerHTML = `
    <div class="container-fluid p-4">
      <div class="card border border-hard rounded-lg shadow-sm degradado-rosa-naranja mb-4">
        <div class="card-body p-5">
          <div class="row align-items-center">
            <div class="col-md-7">
              <h1 class="font-weight-bold text-hard-brown-color">Encuentra a tu companero perfecto <i class="fas fa-paw text-orange-color small"></i></h1>
              <p class="text-hard-brown-color">Datos cargados desde el backend y SQLite.</p>
              <a class="btn rounded-pill text-white px-4 mr-2 bg-orange" href="directory.html"><i class="fas fa-search"></i> Explorar mascotas</a>
              <a class="btn rounded-pill text-white px-4 bg-hard-pink" href="profile.html"><i class="fas fa-user"></i> Ver perfil demo</a>
            </div>
            <div class="col-md-5 text-center text-hard-pink">
              <i class="fas fa-dog fa-5x mx-2"></i>
              <i class="fas fa-cat fa-5x mx-2"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-3 mb-3"><div class="card bg-card border border-hard shadow-sm"><div class="card-body"><h3>${stats.pets?.disponibles || 0}</h3><small>Mascotas disponibles</small></div></div></div>
        <div class="col-md-3 mb-3"><div class="card bg-card border border-hard shadow-sm"><div class="card-body"><h3>${stats.pets?.adoptadas || 0}</h3><small>Adopciones exitosas</small></div></div></div>
        <div class="col-md-3 mb-3"><div class="card bg-card border border-hard shadow-sm"><div class="card-body"><h3>${stats.users?.total || 0}</h3><small>Usuarios registrados</small></div></div></div>
        <div class="col-md-3 mb-3"><div class="card bg-card border border-hard shadow-sm"><div class="card-body"><h3>${pets.length}</h3><small>Mascotas visibles</small></div></div></div>
      </div>

      <h5 class="text-orange-color font-weight-bold mb-3"><i class="fas fa-star"></i> MASCOTAS DESDE SQLITE</h5>
      <div class="row">${pets.slice(0, 3).map(petCard).join('')}</div>
    </div>
  `;
};

const renderDirectory = async (main) => {
  const [petsResponse, citiesResponse] = await Promise.all([
    api('/pets'),
    api('/catalogs/cities')
  ]);
  const cities = citiesResponse.data || [];

  main.innerHTML = `
    <div class="container-fluid p-3">
      <div class="row mb-3">
        <div class="col">
          <h2 class="text-hard-brown-color font-weight-bold">Directorio de mascotas</h2>
          <small class="text-hard-brown-color">Filtros conectados al backend.</small>
        </div>
      </div>
      <div class="row">
        <div class="col-md-3">
          <div class="card bg-card border-soft rounded-lg shadow-sm">
            <div class="card-body">
              <h6 class="font-weight-bold text-soft-brown-color"><i class="fas fa-cog text-orange-color mr-2"></i>FILTROS</h6>
              <input id="filter-species" class="form-control bg-soft border-soft mb-3" placeholder="Especie: Perro, Gato">
              <input id="filter-breed" class="form-control bg-soft border-soft mb-3" placeholder="Raza">
              <select id="filter-city" class="custom-select bg-soft border-soft mb-3">
                <option value="">Todas las ciudades</option>
                ${cities.map((city) => `<option value="${city.name}">${city.name}</option>`).join('')}
              </select>
              <button id="apply-filters" class="btn btn-block bg-orange rounded-pill text-white font-weight-bold">Aplicar filtros</button>
              <button id="clear-filters" class="btn btn-block bg-soft border border-soft rounded-pill text-hard-brown-color font-weight-bold">Limpiar</button>
            </div>
          </div>
        </div>
        <div class="col-md-9">
          <div id="pets-status"></div>
          <div id="pets-list" class="row">${(petsResponse.data || []).map(petCard).join('')}</div>
        </div>
      </div>
    </div>
  `;

  const loadPets = async () => {
    const params = new URLSearchParams();
    const species = qs('#filter-species').value.trim();
    const breed = qs('#filter-breed').value.trim();
    const city = qs('#filter-city').value;
    if (species) params.set('species', species);
    if (breed) params.set('breed', breed);
    if (city) params.set('city', city);
    const response = await api(`/pets?${params.toString()}`);
    qs('#pets-list').innerHTML = (response.data || []).map(petCard).join('') || renderStatus('No hay mascotas con esos filtros.', 'warning');
  };

  qs('#apply-filters').addEventListener('click', loadPets);
  qs('#clear-filters').addEventListener('click', async () => {
    qs('#filter-species').value = '';
    qs('#filter-breed').value = '';
    qs('#filter-city').value = '';
    await loadPets();
  });
};

const renderPetDetail = async (main) => {
  const petId = new URLSearchParams(window.location.search).get('id') || '1';
  const userToken = await loginDemo('user');
  const { pet } = await api(`/pets/${petId}`);

  main.innerHTML = `
    <div class="container-fluid py-3">
      <a class="btn bg-card border border-soft rounded-pill text-hard-brown-color btn-sm px-3 mb-3" href="directory.html">
        <i class="fas fa-arrow-left"></i> Volver
      </a>
      <div id="detail-message"></div>
      <div class="row">
        <div class="col-lg-3 mb-4">
          <div class="card bg-card border-soft rounded-lg overflow-hidden">
            <div class="degradado-rosa-naranja p-3 text-center py-5">
              <i class="fas ${iconForPet(pet.species)}" style="font-size:120px;"></i>
            </div>
          </div>
        </div>
        <div class="col-lg-9">
          <div class="card bg-card border-soft rounded-lg mb-4">
            <div class="card-body">
              <h1 class="text-hard-brown-color font-weight-bold mb-2">${pet.name} <i class="fas ${iconForPet(pet.species)} text-orange-color"></i></h1>
              <h6 class="text-soft-brown-color mb-3">${pet.breed || pet.species} - ${pet.gender} - ${pet.age} anios - ${pet.city}</h6>
              <span class="badge badge-pill bg-card border border-soft text-soft-brown-color px-3 py-2 mr-2">${pet.status}</span>
              <span class="badge badge-pill bg-card border border-soft text-soft-brown-color px-3 py-2 mr-2">${pet.size}</span>
              <hr class="border-soft">
              <h6 class="font-weight-bold text-orange-color mb-3">DESCRIPCION</h6>
              <p class="text-hard-brown-color mb-0">${pet.description || 'Sin descripcion.'}</p>
            </div>
          </div>
          <div class="card bg-card border-soft rounded-lg mb-4">
            <div class="card-body">
              <h6 class="font-weight-bold text-orange-color mb-3"><i class="fas fa-heart text-hard-pink"></i> SALUD</h6>
              <p>${pet.health_status || 'Sin observaciones.'}</p>
              <p>${pet.special_needs || 'Sin necesidades especiales.'}</p>
            </div>
          </div>
          <button id="adopt-btn" class="btn bg-orange text-white btn-block rounded-pill py-3 font-weight-bold">
            <i class="fas fa-paw"></i> Quiero adoptar a ${pet.name}
          </button>
        </div>
      </div>
    </div>
  `;

  qs('#adopt-btn').addEventListener('click', async () => {
    try {
      const response = await api('/adoptions', {
        method: 'POST',
        token: userToken,
        body: {
          pet_id: Number(petId),
          motivation: `Quiero darle un hogar responsable a ${pet.name}.`,
          home_suitable: true,
          special_care_experience: false,
          message: 'Solicitud creada desde el frontend demo.'
        }
      });
      qs('#detail-message').innerHTML = renderStatus(response.message, 'success');
    } catch (error) {
      qs('#detail-message').innerHTML = renderStatus(error.message, 'warning');
    }
  });
};

const renderProfile = async (main) => {
  const userToken = await loginDemo('user');
  const [profileResponse, requestsResponse] = await Promise.all([
    api('/users/profile', { token: userToken }),
    api('/adoptions/my-requests', { token: userToken })
  ]);
  const user = profileResponse.user;
  const requests = requestsResponse.data || [];

  main.innerHTML = `
    <div class="container-fluid p-3">
      <div id="profile-message"></div>
      <h2 class="text-hard-brown-color font-weight-bold">Mi perfil</h2>
      <small class="text-hard-brown-color">Informacion cargada desde JWT y SQLite.</small>
      <div class="row mt-4">
        <div class="col-md-3">
          <div class="card shadow rounded bg-card border border-hard">
            <div class="degradado-rosa-naranja" style="height: 10vh;"></div>
            <div class="card-body text-center">
              <h4 class="text-hard-brown-color">${user.name}</h4>
              <p class="text-soft-brown-color small">@${user.username} - ${user.location || 'Sin ubicacion'}</p>
              <span class="badge bg-orange-soft border border-hard">${user.role}</span>
              <button id="update-profile" class="btn rounded-pill font-weight-bold border py-2 mt-4 w-100 bg-soft border-soft text-soft-brown-color">
                Actualizar perfil demo
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-9">
          <div class="card shadow-sm rounded mb-4 bg-card border-hard">
            <div class="card-body">
              <h5 class="mb-4 text-orange-color"><i class="fas fa-user mr-2"></i>INFORMACION PERSONAL</h5>
              <div class="row">
                <div class="col-md-4 mb-3"><strong>Correo</strong><p>${user.email}</p></div>
                <div class="col-md-4 mb-3"><strong>Ocupacion</strong><p>${user.occupation || 'Pendiente'}</p></div>
                <div class="col-md-4 mb-3"><strong>Ingreso mensual</strong><p>${user.monthly_income_mxn || 'Pendiente'}</p></div>
                <div class="col-md-4 mb-3"><strong>Vivienda</strong><p>${user.housing_type || 'Pendiente'}</p></div>
                <div class="col-md-4 mb-3"><strong>Horas disponibles</strong><p>${user.daily_available_hours || 'Pendiente'}</p></div>
                <div class="col-md-4 mb-3"><strong>Experiencia</strong><p>${user.pet_experience || 'Pendiente'}</p></div>
              </div>
            </div>
          </div>
          <div id="solicitudes" class="card shadow-sm rounded bg-card border-hard">
            <div class="card-body">
              <h5 class="mb-4 text-orange-color"><i class="fas fa-envelope mr-2"></i>MIS SOLICITUDES</h5>
              <div class="table-responsive">
                <table class="table table-borderless">
                  <thead><tr><th>ID</th><th>Mascota</th><th>Estado</th><th>Mensaje</th></tr></thead>
                  <tbody>
                    ${requests.map((request) => `
                      <tr>
                        <td>${request.id}</td>
                        <td>${request.pet_name}</td>
                        <td><span class="badge bg-orange-soft border border-hard">${request.status}</span></td>
                        <td>${request.message || ''}</td>
                      </tr>
                    `).join('') || '<tr><td colspan="4">Sin solicitudes.</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  qs('#update-profile').addEventListener('click', async () => {
    const response = await api('/users/profile', {
      method: 'PUT',
      token: userToken,
      body: {
        occupation: 'Adoptante demo',
        housing_type: 'Casa',
        daily_available_hours: 8,
        monthly_income_mxn: 15000,
        pet_experience: 'Experiencia basica con mascotas'
      }
    });
    qs('#profile-message').innerHTML = renderStatus(response.message, 'success');
    setTimeout(() => window.location.reload(), 800);
  });
};

const renderStatistics = async (main) => {
  const adminToken = await loginDemo('admin');
  const [stats, requestsResponse, petsResponse] = await Promise.all([
    api('/admin/stats', { token: adminToken }),
    api('/adoptions', { token: adminToken }),
    api('/pets?status=disponible')
  ]);
  const requests = requestsResponse.data || [];
  const pets = petsResponse.data || [];

  main.innerHTML = `
    <div class="container-fluid p-3">
      <h2 class="text-hard-brown-color font-weight-bold">Panel de estadisticas</h2>
      <small class="text-hard-brown-color">Metricas reales desde el backend.</small>
      <div class="row pt-3">
        <div class="col-md-3 mb-3"><div class="border rounded p-3 bg-card border-hard"><h3>${stats.pets?.total_registradas || 0}</h3><p>Mascotas registradas</p></div></div>
        <div class="col-md-3 mb-3"><div class="border rounded p-3 bg-card border-hard"><h3>${stats.pets?.adoptadas || 0}</h3><p>Adopciones exitosas</p></div></div>
        <div class="col-md-3 mb-3"><div class="border rounded p-3 bg-card border-hard"><h3>${stats.users?.total || 0}</h3><p>Usuarios totales</p></div></div>
        <div class="col-md-3 mb-3"><div class="border rounded p-3 bg-card border-hard"><h3>${stats.adoptions?.pendientes || 0}</h3><p>Solicitudes pendientes</p></div></div>
      </div>
      <div class="card p-4 border rounded border-hard bg-card">
        <h5 class="font-weight-bold text-orange-color mb-4"><i class="fas fa-calendar-alt"></i> SOLICITUDES RECIENTES</h5>
        <div class="table-responsive">
          <table class="table table-borderless">
            <thead><tr><th>Mascota</th><th>Adoptante</th><th>Estado</th><th>Fecha</th></tr></thead>
            <tbody>
              ${requests.map((request) => `
                <tr>
                  <td>${request.pet_name}</td>
                  <td>${request.requester_username}</td>
                  <td><span class="badge bg-orange-soft border border-hard">${request.status}</span></td>
                  <td>${request.created_at}</td>
                </tr>
              `).join('') || '<tr><td colspan="4">Sin solicitudes.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      <p class="text-soft-brown-color mt-3">Mascotas disponibles actualmente: ${pets.length}</p>
    </div>
  `;
};

const renderIncidents = async (main) => {
  const userToken = await loginDemo('user');
  const adminToken = await loginDemo('admin');

  const load = async () => {
    const response = await api('/support/incidents', { token: adminToken });
    const incidents = response.data || [];
    const open = incidents.filter((incident) => ['abierta', 'en_revision'].includes(incident.status));
    const closed = incidents.filter((incident) => ['resuelta', 'cerrada'].includes(incident.status));

    qs('#open-incidents').innerHTML = open.map(incidentItem).join('') || renderStatus('No hay incidencias abiertas.', 'success');
    qs('#closed-incidents').innerHTML = closed.map(incidentItem).join('') || renderStatus('No hay incidencias resueltas.', 'info');

    document.querySelectorAll('[data-resolve-incident]').forEach((button) => {
      button.addEventListener('click', async () => {
        await api(`/support/incidents/${button.dataset.resolveIncident}/status`, {
          method: 'PATCH',
          token: adminToken,
          body: { status: 'resuelta' }
        });
        await load();
      });
    });
  };

  const incidentItem = (incident) => `
    <div class="card bg-card border-soft rounded-lg mb-3">
      <div class="card-body">
        <h5 class="font-weight-bold text-hard-brown-color">${incident.subject}</h5>
        <p class="text-soft-brown-color small">${incident.description}</p>
        <span class="badge badge-pill bg-orange-soft border border-hard">${incident.type}</span>
        <span class="badge badge-pill bg-soft-pink border border-pink text-pink">${incident.status}</span>
        ${incident.status !== 'resuelta' ? `<button class="btn bg-aqua-soft text-aqua font-weight-bold border border-aqua btn-sm rounded-pill float-right" data-resolve-incident="${incident.id}">Resolver</button>` : ''}
      </div>
    </div>
  `;

  main.innerHTML = `
    <div class="container-fluid py-4">
      <div id="incident-message"></div>
      <h2 class="text-hard-brown-color font-weight-bold">Panel de Incidencias</h2>
      <small class="text-hard-brown-color">Reportes guardados en SQLite.</small>
      <div class="card bg-card border-soft rounded-lg my-4">
        <div class="card-body">
          <h5 class="font-weight-bold text-orange-color">Crear incidencia demo</h5>
          <div class="row">
            <div class="col-md-3"><select id="incident-type" class="form-control"><option value="error">Error</option><option value="queja">Queja</option><option value="sugerencia">Sugerencia</option></select></div>
            <div class="col-md-3"><input id="incident-subject" class="form-control" value="Error desde frontend"></div>
            <div class="col-md-4"><input id="incident-description" class="form-control" value="Reporte creado desde la pantalla de incidencias."></div>
            <div class="col-md-2"><button id="create-incident" class="btn bg-orange text-white btn-block">Crear</button></div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-6"><h6 class="font-weight-bold text-hard-orange-color mb-3">ABIERTAS</h6><div id="open-incidents"></div></div>
        <div class="col-lg-6"><h6 class="font-weight-bold text-hard-orange-color mb-3">RESUELTAS</h6><div id="closed-incidents"></div></div>
      </div>
    </div>
  `;

  qs('#create-incident').addEventListener('click', async () => {
    try {
      const response = await api('/support/incidents', {
        method: 'POST',
        token: userToken,
        body: {
          type: qs('#incident-type').value,
          subject: qs('#incident-subject').value,
          description: qs('#incident-description').value,
          related_type: 'frontend',
          related_id: 'demo'
        }
      });
      qs('#incident-message').innerHTML = renderStatus(response.message, 'success');
      await load();
    } catch (error) {
      qs('#incident-message').innerHTML = renderStatus(error.message, 'warning');
    }
  });

  await load();
};

const boot = async () => {
  setNavLinks();
  const main = qs('main');
  if (!main) return;

  try {
    if (page === 'home.html') await renderHome(main);
    if (page === 'directory.html') await renderDirectory(main);
    if (page === 'pet_detail.html') await renderPetDetail(main);
    if (page === 'profile.html') await renderProfile(main);
    if (page === 'statistics.html') await renderStatistics(main);
    if (page === 'incidents.html') await renderIncidents(main);
  } catch (error) {
    renderShellMessage(main, `${error.message}. Revisa que el servidor este corriendo y que ejecutaste npm run db:reset.`, 'danger');
  }
};

document.addEventListener('DOMContentLoaded', boot);
