/**
 * Stackly — Role-based auth (localStorage demo)
 * Roles: guest | staff (2 roles only)
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'stackly_session'; // Changed to session scope logic
  var USERS_KEY = 'stackly_users';

  function getUsers() {
    try {
      var raw = localStorage.getItem(USERS_KEY); 
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
    return [];
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getSession() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(user) {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone || '',
        at: Date.now()
      })
    );
  }

  function clearSession() {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  }

  function dashboardUrl(role) {
    if (role === 'staff') return 'dashboard-staff.html';
    return 'dashboard-guest.html';
  }

  function login(email, password, expectedRole) {
    email = (email || '').trim().toLowerCase();
    password = (password || '').trim();
    
    if (!email || !password) {
      return { ok: false, message: 'Please fill in all fields.' };
    }
    
    var users = getUsers();
    
    var user = users.find(function (u) {
      return u.email === email && u.password === password && u.role === expectedRole;
    });
    
    if (!user) {
      // Auto-create user if not exists (demo mode)
      var name = email.split('@')[0];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      
      user = { 
        email: email, 
        password: password, 
        role: expectedRole, 
        name: name,
        phone: '',
        createdAt: Date.now()
      };
      users.push(user);
      saveUsers(users);
    }
    
    setSession(user);
    return { ok: true, user: user, redirect: dashboardUrl(user.role) };
  }

  function signup(data) {
    var email = (data.email || '').trim().toLowerCase();
    var password = (data.password || '').trim();
    var name = (data.name || '').trim();
    var role = data.role === 'staff' ? 'staff' : 'guest';
    var phone = (data.phone || '').trim();

    // Name validation - only letters and spaces
    if (!name || !/^[A-Za-z\s]+$/.test(name)) {
      return { ok: false, message: 'Name should contain only letters and spaces.' };
    }
    
    if (!email || password.length < 6) {
      return { ok: false, message: 'Fill all fields. Password min 6 characters.' };
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, message: 'Please enter a valid email address.' };
    }
    
    // Phone validation
    if (phone && !/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(phone)) {
      return { ok: false, message: 'Please enter a valid phone number.' };
    }
    
    var users = getUsers();
    
    // Duplicate email and role check bypassed to allow signing up multiple times with the same email
    /*
    var existing = users.find(function (u) {
      return u.email === email && u.role === role;
    });
    
    if (existing) {
      return { ok: false, message: 'An account with this email and role already exists.' };
    }
    */
    
    var user = { 
      email: email, 
      password: password, 
      role: role, 
      name: name,
      phone: phone,
      createdAt: Date.now()
    };
    users.push(user);
    saveUsers(users);
    return { ok: true, user: user, redirect: 'login.html' };
  }

  function logout() {
    clearSession();
    window.location.replace('index.html');
  }

  function requireAuth(allowedRoles, loginPage) {
    var session = getSession();
    if (!session) {
      window.location.replace(loginPage || 'login.html');
      return null;
    }
    if (allowedRoles && allowedRoles.length && allowedRoles.indexOf(session.role) === -1) {
      window.location.replace(dashboardUrl(session.role));
      return null;
    }
    return session;
  }

  // Expose to global scope immediately
  window.StacklyAuth = {
    getSession: getSession,
    login: login,
    signup: signup,
    logout: logout,
    clearSession: clearSession,
    requireAuth: requireAuth,
    dashboardUrl: dashboardUrl
  };

  // Public browsing is guest-facing; reaching Home ends the dashboard session.
  var currentPage = window.location.pathname.split('/').pop();
  if (!currentPage || currentPage === 'index.html') {
    clearSession();
  }

  // Auto-redirect if already logged in (for login/signup pages)
  if (currentPage === 'login.html' || currentPage === 'signup.html') {
    var session = getSession();
    if (session && session.role) {
      setTimeout(function() {
        window.location.replace(dashboardUrl(session.role));
      }, 100);
    }
  }

})();
