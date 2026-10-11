/* =========================================================
   Sprachumschalter DE / EN / PL
   - Der deutsche Text steht direkt im HTML.
   - Jede Seite definiert vorher window.I18N = { en:{...}, pl:{...} }.
   - Elemente mit data-i18n="schluessel" werden ersetzt.
   - Die Wahl wird im Browser gespeichert und gilt auf allen Seiten.
   ========================================================= */
(function () {
  var LANGS = ['de', 'en', 'pl'];
  var dict = window.I18N || {};
  var nodes = document.querySelectorAll('[data-i18n]');
  var attrNodes = document.querySelectorAll('[data-i18n-attr]');

  // Deutschen Originaltext merken, damit man zurückschalten kann
  dict.de = dict.de || {};
  nodes.forEach(function (el) {
    var k = el.getAttribute('data-i18n');
    if (dict.de[k] == null) dict.de[k] = el.innerHTML;
  });
  attrNodes.forEach(function (el) {
    el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
      var p = pair.split(':'); var attr = p[0], k = p[1];
      if (dict.de[k] == null) dict.de[k] = el.getAttribute(attr);
    });
  });
  if (dict.de._title == null) dict.de._title = document.title;

  function initialLang() {
    var l = null;
    try { l = new URLSearchParams(location.search).get('lang'); } catch (e) {}
    if (LANGS.indexOf(l) < 0) { try { l = localStorage.getItem('lang'); } catch (e) {} }
    return LANGS.indexOf(l) < 0 ? 'de' : l;
  }

  function apply(lang) {
    var d = dict[lang] || {};
    var fallback = dict.de;
    document.documentElement.lang = lang;
    nodes.forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      var v = d[k] != null ? d[k] : fallback[k];
      if (v != null) el.innerHTML = v;
    });
    attrNodes.forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':'); var attr = p[0], k = p[1];
        var v = d[k] != null ? d[k] : fallback[k];
        if (v != null) el.setAttribute(attr, v);
      });
    });
    document.title = d._title || fallback._title;
    document.querySelectorAll('.lang-switch button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    try { localStorage.setItem('lang', lang); } catch (e) {}
    window.currentLang = lang;
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }

  document.querySelectorAll('.lang-switch button').forEach(function (b) {
    b.addEventListener('click', function () { apply(b.getAttribute('data-lang')); });
  });

  apply(initialLang());

  // sanftes Einblenden der Abschnitte beim Scrollen
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }
})();
