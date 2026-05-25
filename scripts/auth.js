/**
 * Stackly — Role-based auth (localStorage demo)
 * Roles: guest | staff | admin
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'stackly_session';
  var USERS_KEY = 'stackly_users';

  var DEFAULT_USERS = [
    { email: 'guest@stackly.in', password: 'guest123', role: 'guest', name: 'Arjun Guest' },
    { email: 'staff@stackly.in', password: 'staff123', role: 'staff', name: 'Priya Staff' },
    { email: 'admin@stackly.in', password: 'admin123', role: 'admin', name: 'Admin Manager' }
  ];

  function getUsers() {
    try {
      var raw = localStorage.getItem(USERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS.slice();
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(user) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role,
        at: Date.now()
      })
    );
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function dashboardUrl(role) {
    return 'dashboard.html?role=' + encodeURIComponent(role || 'guest');
  }

  function login(email, password, expectedRole) {
    email = (email || '').trim().toLowerCase();
    password = (password || '').trim();
    var users = getUsers();
    var user = users.find(function (u) {
      return u.email === email && u.password === password;
    });
    if (!user) return { ok: false, message: 'Invalid email or password.' };
    if (expectedRole && user.role !== expectedRole) {
      return { ok: false, message: 'This account is not a ' + expectedRole + ' account.' };
    }
    setSession(user);
    return { ok: true, user: user, redirect: dashboardUrl(user.role) };
  }

  function signup(data) {
    var email = (data.email || '').trim().toLowerCase();
    var password = (data.password || '').trim();
    var name = (data.name || '').trim();
    var role = data.role === 'staff' ? 'staff' : 'guest';

    if (!name || !email || password.length < 6) {
      return { ok: false, message: 'Fill all fields. Password min 6 characters.' };
    }
    var users = getUsers();
    if (users.some(function (u) { return u.email === email; })) {
      return { ok: false, message: 'Email already registered.' };
    }
    var user = { email: email, password: password, role: role, name: name };
    users.push(user);
    saveUsers(users);
    setSession(user);
    return { ok: true, user: user, redirect: dashboardUrl(user.role) };
  }

  function logout() {
    clearSession();
    window.location.href = 'index.html';
  }

  function requireAuth(allowedRoles, loginPage) {
    var session = getSession();
    if (!session) {
      window.location.href = loginPage || 'login.html';
      return null;
    }
    if (allowedRoles && allowedRoles.length && allowedRoles.indexOf(session.role) === -1) {
      window.location.href = dashboardUrl(session.role);
      return null;
    }
    return session;
  }

  function syncDashboardRole() {
    var params = new URLSearchParams(window.location.search);
    var session = getSession();
    if (!session) return null;
    var qRole = params.get('role');
    if (qRole && qRole !== session.role) {
      window.location.replace(dashboardUrl(session.role));
    }
    return session;
  }

  global.StacklyAuth = {
    getSession: getSession,
    login: login,
    signup: signup,
    logout: logout,
    requireAuth: requireAuth,
    syncDashboardRole: syncDashboardRole,
    dashboardUrl: dashboardUrl,
    DEFAULT_USERS: DEFAULT_USERS
  };
})(window);
