const AuthClient = {
  token: localStorage.getItem('cartaralho_auth_token') || '',
  user: null,

  headers(extra = {}) {
    return { ...extra, ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}) };
  },

  async request(path, options = {}) {
    const res = await fetch(path, { ...options, headers: this.headers(options.headers || {}) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.error || 'Erro no servidor.');
    return data;
  },

  async restore() {
    if (!this.token) return null;
    try {
      const data = await this.request('/api/auth/me');
      this.user = data.user;
      return this.user;
    } catch (_) {
      this.logout();
      return null;
    }
  },

  async login(username, password) {
    const data = await this.request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    this.token = data.token; this.user = data.user;
    localStorage.setItem('cartaralho_auth_token', this.token);
    return this.user;
  },

  async register(username, password, displayName) {
    const data = await this.request('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, displayName }) });
    this.token = data.token; this.user = data.user;
    localStorage.setItem('cartaralho_auth_token', this.token);
    return this.user;
  },

  logout() {
    this.token = ''; this.user = null;
    localStorage.removeItem('cartaralho_auth_token');
  },

  async cards() { return (await this.request('/api/profile/cards')).cards || []; },
  async stats() { return (await this.request('/api/profile/stats')).stats || {}; },
  async rank() { return await this.request('/api/profile/rank'); },
};
