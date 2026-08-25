// Small fetch wrapper shared by passenger.js and admin.js.
// Uses relative paths on purpose: the frontend is served by the same
// Express app (see app.use(express.static(...))) on port 3000, so
// there's no cross-origin base URL to configure.
const Api = (() => {
  const request = async (path, options = {}) => {
    const res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    let body = null;
    try {
      body = await res.json();
    } catch (_) {
      // No JSON body (e.g. network-level failure) — leave body null.
    }

    if (!res.ok) {
      const message = (body && body.message) || `Request failed with status ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      throw err;
    }

    return body;
  };

  const getStations = () => request('/api/v1/stations');

  const getAnnouncements = (stationId, { page = 1, limit = 20 } = {}) =>
    request(`/api/v1/stations/${stationId}/announcements?page=${page}&limit=${limit}`);

  const login = (email, password) =>
    request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

  const postAnnouncement = (stationId, text, token) =>
    request(`/api/v1/stations/${stationId}/announcements`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text }),
    });

  return { getStations, getAnnouncements, login, postAnnouncement };
})();
