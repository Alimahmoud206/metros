(() => {
  const loginCard = document.getElementById('login-card');
  const dashboardCard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');

  const adminEmailEl = document.getElementById('admin-email');
  const logoutBtn = document.getElementById('logout-btn');

  const stationNavEl = document.getElementById('station-nav');
  const composeStationNameEl = document.getElementById('compose-station-name');
  const composeLineBadgeEl = document.getElementById('compose-line-badge');
  const viewerCountEl = document.getElementById('admin-viewer-count');
  const composeForm = document.getElementById('compose-form');
  const composeText = document.getElementById('compose-text');
  const composeError = document.getElementById('compose-error');
  const composeBanner = document.getElementById('compose-banner');
  const feedEl = document.getElementById('admin-feed');

  const socket = io();

  let token = sessionStorage.getItem('metro:adminToken') || null;
  let adminEmail = sessionStorage.getItem('metro:adminEmail') || null;
  let stations = [];
  let currentStationId = null;

  const escapeHtml = (str) =>
    str.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]));

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const lineClass = (line) => {
    const n = (line.match(/\d+/) || [])[0];
    return n ? `line-${n}` : '';
  };

  const showBanner = (el, type, message) => {
    el.textContent = message;
    el.className = `banner show ${type}`;
    if (type === 'success') {
      setTimeout(() => el.classList.remove('show'), 2500);
    }
  };

  const setAuthed = (authed) => {
    loginCard.style.display = authed ? 'none' : 'block';
    dashboardCard.style.display = authed ? 'block' : 'none';
    if (authed) adminEmailEl.textContent = adminEmail || '';
  };

  // ---- Auth ----
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.remove('show');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in…';

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const res = await Api.login(email, password);
      token = res.token;
      adminEmail = res.admin ? res.admin.email : email;
      sessionStorage.setItem('metro:adminToken', token);
      sessionStorage.setItem('metro:adminEmail', adminEmail);
      setAuthed(true);
      await loadStations();
    } catch (err) {
      showBanner(loginError, 'error', err.message);
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign in';
    }
  });

  logoutBtn.addEventListener('click', () => {
    token = null;
    adminEmail = null;
    sessionStorage.removeItem('metro:adminToken');
    sessionStorage.removeItem('metro:adminEmail');
    setAuthed(false);
  });

  // ---- Stations ----
  const renderStationNav = () => {
    const byLine = stations.reduce((acc, s) => {
      (acc[s.line] = acc[s.line] || []).push(s);
      return acc;
    }, {});

    stationNavEl.innerHTML = Object.entries(byLine)
      .map(
        ([line, list]) => `
        <div class="line-group-label" style="margin-top:14px;">
          <span class="line-dot ${lineClass(line)}"></span>${escapeHtml(line)}
        </div>
        <div class="station-list-nav">
          ${list
            .map(
              (s) => `
              <button type="button" data-id="${s._id}" class="${s._id === currentStationId ? 'active' : ''}">
                ${escapeHtml(s.name)}
              </button>`
            )
            .join('')}
        </div>`
      )
      .join('');

    stationNavEl.querySelectorAll('button[data-id]').forEach((btn) => {
      btn.addEventListener('click', () => selectStation(btn.dataset.id));
    });
  };

  const selectStation = async (stationId) => {
    if (!stationId) return;
    currentStationId = stationId;
    renderStationNav();

    const station = stations.find((s) => s._id === stationId);
    if (station) {
      composeStationNameEl.textContent = station.name;
      composeLineBadgeEl.textContent = station.line;
      composeLineBadgeEl.className = `board-line-badge ${lineClass(station.line)}`;
    }

    socket.emit('joinStation', stationId);

    feedEl.innerHTML = `<li class="skeleton">Loading announcements…</li>`;
    try {
      const res = await Api.getAnnouncements(stationId, { limit: 30 });
      renderFeed(res.data);
    } catch (err) {
      feedEl.innerHTML = `<li class="feed-empty">Could not load announcements: ${escapeHtml(err.message)}</li>`;
    }
  };

  const renderFeed = (items) => {
    if (!items.length) {
      feedEl.innerHTML = `<li class="feed-empty">No announcements for this station yet.</li>`;
      return;
    }
    feedEl.innerHTML = items
      .map(
        (a) => `
        <li class="feed-row" data-id="${a._id}">
          <span class="feed-time">${formatTime(a.createdAt)}</span>
          <span class="feed-text">${escapeHtml(a.text)}</span>
        </li>`
      )
      .join('');
  };

  const prependAnnouncement = (announcement) => {
    const empty = feedEl.querySelector('.feed-empty');
    if (empty) empty.remove();
    const row = document.createElement('li');
    row.className = 'feed-row entering';
    row.dataset.id = announcement._id;
    row.innerHTML = `
      <span class="feed-time">${formatTime(announcement.createdAt)}</span>
      <span class="feed-text">${escapeHtml(announcement.text)}</span>`;
    feedEl.prepend(row);
  };

  // ---- Compose ----
  composeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    composeError.classList.remove('show');

    const text = composeText.value.trim();
    if (!text) {
      showBanner(composeError, 'error', 'Write something before posting.');
      return;
    }
    if (!currentStationId) {
      showBanner(composeError, 'error', 'Pick a station first.');
      return;
    }

    const submitBtn = composeForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting…';

    try {
      await Api.postAnnouncement(currentStationId, text, token);
      composeText.value = '';
      showBanner(composeBanner, 'success', 'Announcement posted to the station.');
      // The socket 'announcement' event (below) handles inserting it into the feed,
      // so passengers and this dashboard stay in sync through the same code path.
    } catch (err) {
      showBanner(composeError, 'error', err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Post announcement';
    }
  });

  socket.on('announcement', (announcement) => {
    if (announcement.station === currentStationId) {
      prependAnnouncement(announcement);
    }
  });

  socket.on('presenceUpdate', ({ stationId, viewers }) => {
    if (stationId === currentStationId) {
      viewerCountEl.innerHTML = `<strong>${viewers}</strong> watching this station`;
    }
  });

  const loadStations = async () => {
    try {
      const res = await Api.getStations();
      stations = res.data;
      if (!stations.length) {
        stationNavEl.innerHTML = `<p class="hint">No stations yet — run the seed script.</p>`;
        return;
      }
      renderStationNav();
      await selectStation(stations[0]._id);
    } catch (err) {
      stationNavEl.innerHTML = `<p class="hint">Could not load stations: ${escapeHtml(err.message)}</p>`;
    }
  };

  // ---- Boot ----
  const boot = async () => {
    if (token) {
      setAuthed(true);
      await loadStations();
    } else {
      setAuthed(false);
    }
  };

  boot();
})();
