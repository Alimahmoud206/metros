(() => {
  const switcherEl = document.getElementById('station-switcher');
  const boardStationNameEl = document.getElementById('board-station-name');
  const boardLineBadgeEl = document.getElementById('board-line-badge');
  const viewerCountEl = document.getElementById('viewer-count');
  const feedEl = document.getElementById('feed');

  const socket = io();

  let stations = [];
  let currentStationId = localStorage.getItem('metro:lastStation') || null;

  const lineClass = (line) => {
    const n = (line.match(/\d+/) || [])[0];
    return n ? `line-${n}` : '';
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const escapeHtml = (str) =>
    str.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]));

  const renderSwitcher = () => {
    const byLine = stations.reduce((acc, s) => {
      (acc[s.line] = acc[s.line] || []).push(s);
      return acc;
    }, {});

    switcherEl.innerHTML = Object.entries(byLine)
      .map(([line, list]) => {
        const pills = list
          .map(
            (s) => `
            <button
              class="station-pill ${s._id === currentStationId ? 'active' : ''}"
              data-id="${s._id}"
              type="button"
            >${escapeHtml(s.name)}</button>`
          )
          .join('');

        return `
          <div class="line-group">
            <div class="line-group-label">
              <span class="line-dot ${lineClass(line)}"></span>${escapeHtml(line)}
            </div>
            <div class="pill-row">${pills}</div>
          </div>`;
      })
      .join('');

    switcherEl.querySelectorAll('.station-pill').forEach((btn) => {
      btn.addEventListener('click', () => selectStation(btn.dataset.id));
    });
  };

  const renderBoardHeader = (station) => {
    boardLineBadgeEl.textContent = station.line;
    boardLineBadgeEl.className = `board-line-badge ${lineClass(station.line)}`;

    boardStationNameEl.classList.add('flapping');
    boardStationNameEl.innerHTML = `<span class="flap">${escapeHtml(station.name)}</span>`;
    setTimeout(() => boardStationNameEl.classList.remove('flapping'), 450);
  };

  const renderFeed = (items, { animateFirst = false } = {}) => {
    if (!items.length) {
      feedEl.innerHTML = `<li class="feed-empty">No announcements for this station yet.</li>`;
      return;
    }

    feedEl.innerHTML = items
      .map(
        (a, i) => `
        <li class="feed-row ${animateFirst && i === 0 ? 'entering' : ''}" data-id="${a._id}">
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

  const selectStation = async (stationId) => {
    if (!stationId || stationId === currentStationId) return;

    currentStationId = stationId;
    localStorage.setItem('metro:lastStation', stationId);

    const station = stations.find((s) => s._id === stationId);
    if (station) renderBoardHeader(station);

    renderSwitcher();
    feedEl.innerHTML = `<li class="skeleton">Loading announcements…</li>`;

    socket.emit('joinStation', stationId);

    try {
      const res = await Api.getAnnouncements(stationId, { limit: 30 });
      renderFeed(res.data);
    } catch (err) {
      feedEl.innerHTML = `<li class="feed-empty">Could not load announcements: ${escapeHtml(err.message)}</li>`;
    }
  };

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

  const init = async () => {
    try {
      const res = await Api.getStations();
      stations = res.data;

      if (!stations.length) {
        switcherEl.innerHTML = `<p class="hint">No stations yet — run the seed script.</p>`;
        return;
      }

      const initial =
        stations.find((s) => s._id === currentStationId) || stations[0];

      renderSwitcher();
      await selectStation(initial._id);
    } catch (err) {
      switcherEl.innerHTML = `<p class="hint">Could not load stations: ${escapeHtml(err.message)}</p>`;
    }
  };

  init();
})();
