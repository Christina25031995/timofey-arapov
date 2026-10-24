/* Тимофей Арапов: баннер cookie и загрузка Яндекс Метрики только после согласия.
   Выбор хранится в localStorage (ключ ta_cookie_consent): "all" или "necessary".
   Копия для /preview/: компактный баннер на телефоне (24.10). После одобрения Тимофея заменить ею корневой файл. */
(function () {
  'use strict';
  var KEY = 'ta_cookie_consent';
  // ЗАМЕНИТЬ: номер счётчика Яндекс Метрики Тимофея. Пока null, Метрика не загружается.
  var METRIKA_ID = null;
  var POLICY = '/privacy/#cookie';
  var metrikaLoaded = false;

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadMetrika() {
    if (metrikaLoaded || !METRIKA_ID) return;
    metrikaLoaded = true;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=' + METRIKA_ID, 'ym');
    window.ym(METRIKA_ID, 'init', { webvisor: true, clickmap: true, accurateTrackBounce: true, trackLinks: true });
  }

  function clearMetrikaCookies() {
    var host = location.hostname;
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^_ym|^yandexuid$|^yabs-sid$/.test(name)) {
        ['', host, '.' + host].forEach(function (d) {
          document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  var STYLE = '' +
    '#ta-cookie{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:1000;' +
    'width:min(520px,calc(100vw - 32px));box-sizing:border-box;padding:18px 20px;' +
    'background:rgba(18,18,19,.96);border:1px solid rgba(242,238,230,.14);box-shadow:0 16px 40px rgba(0,0,0,.45);' +
    '-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);color:#F2EEE6;' +
    "font-family:'Inter',system-ui,sans-serif;font-size:14px;line-height:1.5;}" +
    '#ta-cookie[hidden]{display:none}' +
    '#ta-cookie p{margin:0 0 14px;color:rgba(242,238,230,.75);white-space:nowrap;}' +
    '#ta-cookie a{color:#D4B47C;border-bottom:1px solid currentColor;text-decoration:none;white-space:nowrap;}' +
    '#ta-cookie .ta-btns{display:flex;flex-wrap:wrap;gap:8px;}' +
    '#ta-cookie button{flex:1 1 150px;min-height:42px;padding:10px 16px;cursor:pointer;' +
    "font:600 12px 'Inter',system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;transition:background .2s,border-color .2s;}" +
    '#ta-cookie .ta-accept{background:#D4B47C;color:#0B0B0C;border:1px solid #D4B47C;}' +
    '#ta-cookie .ta-accept:hover{background:#E0C392;}' +
    '#ta-cookie .ta-necessary{background:transparent;color:#F2EEE6;border:1px solid rgba(242,238,230,.3);}' +
    '#ta-cookie .ta-necessary:hover{border-color:#D4B47C;}' +
    '#ta-cookie button:focus-visible{outline:2px solid #D4B47C;outline-offset:2px;}' +
    '@media (max-width:900px){#ta-cookie{bottom:calc(96px + env(safe-area-inset-bottom,0px));}}' +
    '#ta-cookie .ta-m{display:none}' +
    '@media (max-width:900px){#ta-cookie p{white-space:normal;text-wrap:pretty}#ta-cookie .ta-d{display:none}#ta-cookie .ta-m{display:block}' +
    '#ta-cookie{display:flex;align-items:center;gap:10px;padding:8px 8px 8px 14px;font-size:12.5px;line-height:1.35;width:calc(100vw - 20px)}' +
    '#ta-cookie[hidden]{display:none}' +
    '#ta-cookie p{margin:0;flex:1 1 auto;min-width:0}' +
    '#ta-cookie .ta-btns{flex:0 0 auto;flex-wrap:nowrap;gap:6px}' +
    '#ta-cookie button{flex:0 0 auto;min-height:36px;padding:8px 11px;font-size:10.5px;letter-spacing:.06em}' +
    '#ta-cookie button .ta-m{display:inline}}';

  var banner = null;

  function buildBanner() {
    if (banner) return banner;
    var st = document.createElement('style');
    st.textContent = STYLE;
    document.head.appendChild(st);
    banner = document.createElement('div');
    banner.id = 'ta-cookie';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Настройки cookie');
    banner.hidden = true;
    banner.innerHTML =
      '<p class="ta-d">Используем cookie и&nbsp;Яндекс Метрику. <a href="' + POLICY + '">Подробнее</a></p>' +
      '<p class="ta-m">Cookie и&nbsp;Метрика. <a href="' + POLICY + '">Подробнее</a></p>' +
      '<div class="ta-btns">' +
      '<button type="button" class="ta-accept">Принять</button>' +
      '<button type="button" class="ta-necessary"><span class="ta-d">Только необходимые</span><span class="ta-m">Только нужные</span></button>' +
      '</div>';
    banner.querySelector('.ta-accept').addEventListener('click', function () {
      setChoice('all'); hideBanner(); loadMetrika();
    });
    banner.querySelector('.ta-necessary').addEventListener('click', function () {
      setChoice('necessary'); hideBanner(); clearMetrikaCookies();
      if (metrikaLoaded) location.reload();
    });
    document.body.appendChild(banner);
    return banner;
  }

  function showBanner() { buildBanner().hidden = false; }
  function hideBanner() { if (banner) banner.hidden = true; }

  // Ссылка «Настройки cookie» (href="#cookie-settings") снова открывает баннер.
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href="#cookie-settings"]');
    if (!a) return;
    e.preventDefault();
    showBanner();
  }, true);

  var choice = getChoice();
  if (choice === 'all') loadMetrika();

  function onReady() { if (choice !== 'all' && choice !== 'necessary') showBanner(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady);
  else onReady();
})();
