/**
 * Standalone 404 guard — include on any page without full app.js if needed.
 */
(function () {
  'use strict';
  var VALID = {
    'index.html': 1,
    'rooms.html': 1,
    'booking.html': 1,
    'services.html': 1,
    'gallery.html': 1,
    'about.html': 1,
    'contact.html': 1,
    '404.html': 1,
    'login.html': 1,
    'signup.html': 1,
    'dashboard.html': 1
  };

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = (a.getAttribute('href') || '').trim();
    if (
      !href ||
      href === '#' ||
      href.startsWith('http') ||
      href.startsWith('tel:') ||
      href.startsWith('mailto:')
    ) {
      if (href === '#' || href === '') {
        e.preventDefault();
        window.location.href = '404.html';
      }
      return;
    }
    var base = href.split('?')[0].split('#')[0];
    if (base && !VALID[base]) {
      e.preventDefault();
      window.location.href = '404.html';
    }
  });
})();
