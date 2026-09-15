/* skyEmployee wireframe: shell, router, overlays and shared DS helpers.
   Views register renderers on APP.VIEWS and click handlers on APP.ACT.
   Everything is event-delegated through data-act so re-rendered markup
   never needs rebinding. */
(function () {
  var D = window.SE;
  var APP = window.APP = { VIEWS: {}, ACT: {}, INPUT: {}, AFTER: [] };
  var S = APP.S = { roleKey: 'emp-f', route: [], widget: 'normal', f: {}, lastRouteKey: '' };

  /* ---------------- helpers ---------------- */
  var esc = APP.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ic = APP.ic = function (name, size, cls) {
    var inner = window.ICONS[name];
    if (inner == null) { console.warn('icon missing', name); inner = ''; }
    size = size || 18;
    return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  };
  var P = APP.P = function (id) { return D.byId(id); };
  var tone = APP.tone = function (name) { var s = 0; for (var i = 0; i < name.length; i++) s += name.charCodeAt(i); return 'c' + ((s % 8) + 1); };
  var av = APP.av = function (p, size) {
    if (typeof p === 'string') p = P(p);
    var st = size ? ' style="width:' + size + 'px;height:' + size + 'px;font-size:' + Math.max(10, Math.round(size * 0.38)) + 'px;"' : '';
    return '<span class="avatar ' + tone(p.name) + '"' + st + ' aria-hidden="true">' + p.ini + '</span>';
  };
  APP.personLine = function (p, sub, size, act) {
    if (typeof p === 'string') p = P(p);
    var a = act === false ? '' : ' data-act="profile" data-id="' + p.id + '"';
    return '<span class="person-line' + (act === false ? '' : ' is-link') + '"' + a + '>' + av(p, size) +
      '<span class="pl-text"><span class="pl-name">' + esc(p.name) + '</span>' + (sub ? '<span class="pl-sub">' + sub + '</span>' : '') + '</span></span>';
  };
  APP.badge = function (t, kind, icon) { return '<span class="badge ' + (kind || '') + '">' + (icon ? ic(icon, 12) : '') + esc(t) + '</span>'; };
  APP.btn = function (label, variant, icon, attrs, size) {
    return '<button class="btn ' + (variant || 'btn-surface') + ' ' + (size || '') + '" ' + (attrs || '') + '>' + (icon ? ic(icon, 16, 'btn-icon') : '') + (label ? '<span>' + label + '</span>' : '') + '</button>';
  };
  APP.callout = function (html, kind, icon) { return '<div class="callout ' + (kind || '') + '"><span class="co-icon">' + ic(icon || 'info', 18) + '</span><div class="co-text">' + html + '</div></div>'; };
  APP.panelHead = function (title, sub, right) {
    return '<div class="panel-head"><div><div class="panel-title">' + title + '</div>' + (sub ? '<div class="panel-sub">' + sub + '</div>' : '') + '</div>' + (right ? '<div class="ph-right">' + right + '</div>' : '') + '</div>';
  };
  APP.statusBadge = function (s) {
    var map = { Live: 'is-success', Open: 'is-success', Active: 'is-success', Delivered: 'is-success', Fulfilled: 'is-success', Acknowledged: 'is-success', Revealed: 'is-success', Available: 'is-success', Resolved: 'is-success',
      Scheduled: 'is-info', Pinned: 'is-info', 'In progress': 'is-info', Assigned: 'is-info', Awarded: 'is-info',
      Draft: 'is-neutral', Closed: 'is-neutral', Ended: 'is-neutral', Retired: 'is-neutral is-void', Void: 'is-neutral is-void', Cancelled: 'is-neutral is-void', Deactivated: 'is-neutral is-void', Hidden: 'is-neutral',
      'Pending approval': 'is-warning', 'Waiting on you': 'is-warning', 'Low stock': 'is-warning', 'Review due': 'is-warning', 'Not revealed': 'is-neutral',
      Overdue: 'is-danger', 'Out of stock': 'is-danger', Reported: 'is-danger', Removed: 'is-danger' };
    return APP.badge(s, map[s] || 'is-neutral');
  };
  APP.tabs = function (items, active) {
    return '<div class="tab-nav tab-scroll" role="tablist">' + items.map(function (t) {
      return '<a class="tab-nav-item' + (t[0] === active ? ' is-active' : '') + '" href="' + t[2] + '" role="tab" aria-selected="' + (t[0] === active) + '">' + t[1] + (t[3] != null ? ' <span class="tab-count">' + t[3] + '</span>' : '') + '</a>';
    }).join('') + '</div>';
  };
  APP.table = function (cols, rows, opts) {
    opts = opts || {};
    var h = '<div class="table-wrap"><table class="table"><thead><tr>' + cols.map(function (c) {
      var o = typeof c === 'string' ? { t: c } : c; return '<th class="' + (o.num ? 'is-numeric' : '') + '">' + o.t + '</th>';
    }).join('') + '</tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="' + cols.length + '"><div class="table-empty">' + (opts.empty || 'Nothing here yet.') + '</div></td></tr>';
    rows.forEach(function (r) {
      var attrs = r.attrs || ''; var cells = r.cells || r;
      h += '<tr ' + attrs + '>' + cells.map(function (c, i) {
        var o = typeof cols[i] === 'string' ? {} : cols[i]; return '<td class="' + (o.num ? 'is-numeric' : '') + '" data-label="' + esc(typeof cols[i] === 'string' ? cols[i] : cols[i].t) + '">' + c + '</td>';
      }).join('') + '</tr>';
    });
    return h + '</tbody></table></div>';
  };
  APP.meter = function (label, used, total, fmt, kind) {
    var pct = total ? Math.min(100, Math.round(used / total * 100)) : 0;
    return '<div class="meter ' + (kind || '') + '"><div class="meter-top"><span class="meter-label">' + label + '</span><span class="meter-val">' + fmt(used) + ' of ' + fmt(total) + '</span></div>' +
      '<div class="progress" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:' + pct + '%"></div></div></div>';
  };
  /* single-series horizontal bars: one hue, value labels in text tokens, hover title */
  APP.bars = function (items, fmt) {
    var max = Math.max.apply(null, items.map(function (i) { return i[1]; })) || 1;
    fmt = fmt || function (v) { return v; };
    return '<div class="hbars">' + items.map(function (i) {
      return '<div class="hbar" title="' + esc(i[0]) + ': ' + esc(fmt(i[1])) + '"><span class="hbar-label">' + esc(i[0]) + '</span><span class="hbar-track"><span class="hbar-fill" style="width:' + Math.max(2, i[1] / max * 100) + '%"></span></span><span class="hbar-val">' + fmt(i[1]) + '</span></div>';
    }).join('') + '</div>';
  };
  APP.dd = function (key, options, value, extraCls) {
    var cur = options.filter(function (o) { return (o[0] || o) === value; })[0];
    var label = cur ? (cur[1] || cur) : value;
    return '<span class="pop-anchor ' + (extraCls || '') + '"><button class="dropdown" type="button" aria-haspopup="listbox" aria-expanded="false" data-act="toggle-pop" data-pop="dd-' + key + '"><span class="dd-value">' + esc(label) + '</span><span class="dropdown-chevron">' + ic('chevron-down', 16) + '</span></button>' +
      '<div class="dropdown-menu pop" id="dd-' + key + '" role="listbox" hidden>' + options.map(function (o) {
        var v = o[0] || o, l = o[1] || o, sel = v === value;
        return '<div class="list-item' + (sel ? ' is-selected' : '') + '" role="option" aria-selected="' + sel + '" data-act="dd-pick" data-key="' + key + '" data-val="' + esc(v) + '"><span class="list-check">' + (sel ? ic('check', 16) : '') + '</span>' + esc(l) + '</div>';
      }).join('') + '</div></span>';
  };
  APP.field = function (label, control, hint, req) {
    return '<label class="field"><span class="field-label">' + label + (req ? '<span class="req">*</span>' : '') + '</span>' + control + (hint ? '<span class="field-hint">' + hint + '</span>' : '') + '</label>';
  };
  APP.emptyState = function (icon, title, text, action) {
    return '<div class="empty-state"><div class="empty-art">' + ic(icon, 40) + '</div><h2>' + title + '</h2><p>' + text + '</p>' + (action || '') + '</div>';
  };
  APP.money = function (v) { return '$' + Number(v).toLocaleString('en-US'); };

  /* ---------------- role + permissions ---------------- */
  APP.role = function () { return D.ROLES.filter(function (r) { return r.key === S.roleKey; })[0]; };
  APP.me = function () { return P(APP.role().person); };
  APP.isAdmin = function () { return APP.role().role === 'Admin'; };
  APP.isCtrl = function () { return APP.role().role === 'Controller'; };
  APP.canManage = function () { return APP.isAdmin() || APP.isCtrl(); };
  APP.scope = function () { return APP.role().scope || [APP.me().loc]; };
  APP.inScope = function (loc) { return APP.isAdmin() || loc === 'All' || loc === 'Everyone' || APP.scope().indexOf(loc) >= 0; };

  function nav() {
    var n = [{ items: [['home', 'Home', 'house'], ['directory', 'Directory', 'users'], ['rewards', 'Rewards', 'gift'], ['pay', 'Pay & Benefits', 'wallet'], ['resources', 'Resources', 'library']] }];
    if (APP.isCtrl()) n.push({ label: 'Manage · ' + APP.scope()[0], items: [['manage/content', 'Content', 'megaphone'], ['manage/surveys', 'Survey results', 'chart-column'], ['manage/acks', 'Acknowledgements', 'file-check']] });
    if (APP.isAdmin()) n.push({ label: 'Administration', items: [['manage/content', 'Content', 'megaphone'], ['manage/surveys', 'Surveys', 'clipboard-list'], ['admin/users', 'Users & organisation', 'user-round-cog'], ['admin/giftcards', 'Gift cards', 'credit-card'], ['admin/recognition', 'Recognition', 'award'], ['admin/resources', 'Resource library', 'folder'], ['admin/pay', 'Pay & Benefits content', 'receipt'], ['admin/settings', 'Settings', 'settings']] });
    return n;
  }
  function allowed(r0, r1) {
    if (['home', 'directory', 'rewards', 'pay', 'resources', 'me'].indexOf(r0) >= 0) {
      if (r0 === 'rewards' && (r1 === 'give' || r1 === 'fulfilment')) return APP.canManage();
      return true;
    }
    if (r0 === 'manage') return r1 === 'acks' ? APP.canManage() : APP.canManage();
    if (r0 === 'admin') return APP.isAdmin();
    return false;
  }

  /* ---------------- shell rendering ---------------- */
  function renderShell() {
    var r = APP.role(), me = APP.me();
    document.getElementById('brandOrg').textContent = D.ORG;
    document.getElementById('roleValue').innerHTML = esc(r.label) + (r.role === 'Employee' ? ' <span class="rs-type">' + r.type + '</span>' : '');
    document.getElementById('rolePop').innerHTML = '<div class="list-item is-header">Switch role</div>' + D.ROLES.map(function (x) {
      var sel = x.key === S.roleKey, p = P(x.person);
      return '<div class="list-item role-item' + (sel ? ' is-selected' : '') + '" role="menuitemradio" aria-checked="' + sel + '" data-act="set-role" data-role="' + x.key + '">' + av(p, 28) +
        '<span class="ri-text"><span class="ri-title">' + esc(x.label) + (x.role === 'Employee' ? ' · ' + x.type : '') + '</span><span class="ri-sub">' + esc(p.name) + ', ' + esc(x.sub) + '</span></span><span class="list-check">' + (sel ? ic('check', 16) : '') + '</span></div>';
    }).join('');
    document.getElementById('profileBtn').innerHTML = av(me, 28) + '<span class="pb-name desktop-only">' + esc(me.name.split(' ')[0]) + '</span><span class="pb-chevron desktop-only">' + ic('chevron-down', 16) + '</span>';
    document.getElementById('profilePop').innerHTML =
      '<div class="pm-head">' + av(me, 40) + '<div class="pm-id"><span class="pm-name">' + esc(me.name) + '</span><span class="pm-email">' + esc(me.title) + ' · ' + esc(me.loc) + '</span><a class="pm-viewprofile" href="#/me">View my profile</a></div></div>' +
      '<hr class="divider">' +
      '<a class="pm-item" href="#/me/awards"><span>Awards received</span>' + ic('award', 16) + '</a>' +
      '<a class="pm-item" href="#/me/due"><span>My due items</span>' + ic('list-checks', 16) + '</a>' +
      '<a class="pm-item" href="#/me/notifications"><span>Notification settings</span>' + ic('bell', 16) + '</a>' +
      '<a class="pm-item mobile-only" href="#/pay"><span>Pay & Benefits</span>' + ic('wallet', 16) + '</a>' +
      '<button class="pm-item" data-act="theme"><span>Dark theme</span>' + ic('moon', 16) + '</button>' +
      '<hr class="divider">' +
      '<div class="pm-field"><span class="pm-field-label">Widget preview state</span><div class="segmented seg-sm">' + [['normal', 'Normal'], ['empty', 'Empty'], ['down', 'App down']].map(function (w) {
        return '<button class="segmented-item' + (S.widget === w[0] ? ' is-active' : '') + '" data-act="widget-state" data-val="' + w[0] + '">' + w[1] + '</button>'; }).join('') + '</div></div>' +
      '<button class="btn btn-solid pm-signout" data-act="sign-out">' + ic('log-out', 16, 'btn-icon') + 'Sign out</button>' +
      '<div class="pm-version">Quick sign-out for shared devices</div>';
    renderNotifs();
  }
  function renderNotifs() {
    var unread = D.NOTIFS.filter(function (n) { return n.unread; }).length;
    var b = document.getElementById('notifCount'); b.textContent = unread; b.hidden = !unread;
    document.getElementById('notifPop').innerHTML = '<div class="np-head"><span class="panel-title t-3">Notifications</span><button class="btn btn-ghost is-sm" data-act="notifs-read">Mark all read</button></div>' +
      '<div class="np-list">' + D.NOTIFS.map(function (n, i) {
        return '<button class="np-item' + (n.unread ? ' is-unread' : '') + '" data-act="notif-go" data-i="' + i + '"><span class="np-ic">' + ic(n.ic, 16) + '</span><span class="np-text">' + n.t + '<span class="np-time">' + n.time + ' ago</span></span></button>';
      }).join('') + '</div><a class="np-foot link" href="#/me/notifications">Notification settings</a>';
  }
  APP.renderNotifs = renderNotifs;

  function renderNav() {
    var cur = S.route.slice(0, 2).join('/');
    var cur0 = S.route[0];
    var html = '<button class="sidebar-toggle desktop-only" aria-label="Collapse navigation" data-act="collapse-nav">' + ic('panel-left', 18) + '</button>';
    nav().forEach(function (sec) {
      if (sec.label) html += '<div class="nav-section">' + esc(sec.label) + '</div>';
      sec.items.forEach(function (it) {
        var active = it[0].indexOf('/') > 0 ? cur === it[0] : (cur0 === it[0]);
        html += '<a class="nav-item' + (active ? ' is-active' : '') + '" href="#/' + it[0] + '"' + (active ? ' aria-current="page"' : '') + ' title="' + esc(it[1]) + '">' + ic(it[2], 18, 'nav-icon') + '<span class="nav-label">' + esc(it[1]) + '</span></a>';
      });
    });
    document.getElementById('sidebar').innerHTML = html;
    var bn = [['home', 'Home', 'house'], ['directory', 'Directory', 'users'], ['rewards', 'Rewards', 'gift'], ['resources', 'Resources', 'library'], ['me', 'Me', 'circle-user-round']];
    document.getElementById('bottomNav').innerHTML = bn.map(function (b) {
      var a = cur0 === b[0] || (b[0] === 'me' && cur0 === 'pay');
      return '<a class="bn-item' + (a ? ' is-active' : '') + '" href="#/' + b[0] + '"' + (a ? ' aria-current="page"' : '') + '>' + ic(b[2], 20) + '<span>' + b[1] + '</span></a>';
    }).join('');
  }

  APP.page = function (o) {
    var crumbs = '<div class="breadcrumbs">' + (o.crumbs || []).map(function (c, i, arr) {
      var last = i === arr.length - 1;
      return (i ? '<span class="sep">' + ic('chevron-right', 16) + '</span>' : '') + (last ? '<span class="current">' + esc(c[0]) + '</span>' : '<a href="' + c[1] + '">' + esc(c[0]) + '</a>');
    }).join('') + '</div>';
    var head = o.title ? '<header class="page-header' + (o.action ? ' has-action' : '') + '"><div><h1>' + o.title + '</h1>' + (o.desc ? '<p>' + o.desc + '</p>' : '') + '</div>' + (o.action ? '<div class="page-action">' + o.action + '</div>' : '') + '</header>' : '';
    return crumbs + '<div class="content-body">' + head + (o.tabs || '') + '<div class="page-main">' + o.body + '</div></div>' +
      '<footer class="app-footer">Copyright 2026 <a href="#/home">Skypoint</a>. skyEmployee for ' + esc(D.ORG) + '. Sample data only.</footer>';
  };

  /* ---------------- router ---------------- */
  function parse() { var h = (location.hash || '#/home').replace(/^#\/?/, ''); return h ? h.split('/') : ['home']; }
  function render() {
    var r = parse();
    if (!APP.VIEWS[r[0]] || !allowed(r[0], r[1])) { if (location.hash !== '#/home') { location.replace('#/home'); } r = ['home']; }
    var key = r.join('/'), changed = key !== S.lastRouteKey;
    S.route = r; S.lastRouteKey = key;
    renderNav();
    closePops();
    var c = document.getElementById('content');
    c.innerHTML = APP.VIEWS[r[0]](r);
    c.querySelectorAll('[data-ic]').forEach(fillIc);
    if (changed && !r[2]) c.scrollTop = 0;
    APP.AFTER.forEach(function (fn) { fn(r); });
    closeNav();
  }
  APP.rerender = function () { var c = document.getElementById('content'); var top = c.scrollTop; render(); c.scrollTop = top; };
  APP.go = function (hash) { if (location.hash === hash) APP.rerender(); else location.hash = hash; };

  function fillIc(el) { el.innerHTML = ic(el.getAttribute('data-ic'), +el.getAttribute('data-size') || 16); el.removeAttribute('data-ic'); }

  /* ---------------- overlays ---------------- */
  var host = function () { return document.getElementById('overlayHost'); };
  APP.dialog = function (o) {
    var size = o.size || '';
    var html = '<div class="overlay" data-overlay><div class="dialog ' + size + '" role="dialog" aria-modal="true" aria-labelledby="dlgTitle">' +
      '<div class="dlg-head"><div><div class="dialog-title" id="dlgTitle">' + o.title + '</div>' + (o.sub ? '<div class="dlg-sub">' + o.sub + '</div>' : '') + '</div><button class="btn btn-ghost is-icon" aria-label="Close" data-act="close-overlay">' + ic('x', 18) + '</button></div>' +
      '<div class="dialog-body dlg-scroll">' + o.body + '</div>' + (o.footer ? '<div class="dialog-footer">' + o.footer + '</div>' : '') + '</div></div>';
    host().insertAdjacentHTML('beforeend', html);
    var el = host().lastElementChild; el.querySelectorAll('[data-ic]').forEach(fillIc);
    var f = el.querySelector('input:not([type=checkbox]):not([type=radio]), textarea'); if (f && !o.noFocus) setTimeout(function () { f.focus(); }, 30);
    return el;
  };
  APP.drawer = function (o) {
    var html = '<div class="overlay is-drawer" data-overlay><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drTitle">' +
      '<div class="dlg-head"><div class="dialog-title" id="drTitle">' + o.title + '</div><button class="btn btn-ghost is-icon" aria-label="Close" data-act="close-overlay">' + ic('x', 18) + '</button></div>' +
      '<div class="drawer-body">' + o.body + '</div>' + (o.footer ? '<div class="drawer-foot">' + o.footer + '</div>' : '') + '</aside></div>';
    host().insertAdjacentHTML('beforeend', html);
    return host().lastElementChild;
  };
  APP.closeOverlay = function () { var h = host(); if (h.lastElementChild) h.removeChild(h.lastElementChild); };
  APP.closeAll = function () { host().innerHTML = ''; };
  APP.toast = function (title, body, kind) {
    var t = document.createElement('div');
    t.className = 'toast is-' + (kind || 'success');
    t.innerHTML = '<span class="toast-ic">' + ic(kind === 'info' ? 'info' : kind === 'warning' ? 'triangle-alert' : 'circle-check', 18) + '</span><div><div class="toast-title">' + title + '</div>' + (body ? '<div class="toast-body">' + body + '</div>' : '') + '</div>';
    document.getElementById('toastHost').appendChild(t);
    setTimeout(function () { t.classList.add('is-leaving'); setTimeout(function () { t.remove(); }, 220); }, 3600);
  };
  APP.openApp = function (app, what) { APP.toast('Opening ' + app, (what ? what + '. ' : '') + 'Single sign-on, new tab, so you keep your place here.', 'info'); };

  function closePops(except) {
    document.querySelectorAll('.pop').forEach(function (p) { if (p !== except && !p.hidden) { p.hidden = true; var b = document.querySelector('[data-pop="' + p.id + '"]'); if (b) b.setAttribute('aria-expanded', 'false'); } });
    if (!except || except.id !== 'searchPop') { var sp = document.getElementById('searchPop'); if (sp) sp.hidden = true; }
  }
  APP.closePops = closePops;
  function openNav() { document.body.classList.add('nav-open'); document.getElementById('navScrim').hidden = false; }
  function closeNav() { document.body.classList.remove('nav-open'); document.getElementById('navScrim').hidden = true; }

  /* ---------------- search ---------------- */
  APP.searchResults = function (q) {
    q = q.trim().toLowerCase(); if (!q) return '';
    var people = D.PEOPLE.filter(function (p) { return (p.name + ' ' + p.title + ' ' + p.dept + ' ' + p.loc).toLowerCase().indexOf(q) >= 0; }).slice(0, 4);
    var posts = D.POSTS.filter(function (p) { return !p.removed && ((p.title || '') + ' ' + p.text).toLowerCase().indexOf(q) >= 0; }).slice(0, 3);
    var res = D.RESOURCES.filter(function (r) { return (r.t + ' ' + r.d).toLowerCase().indexOf(q) >= 0; }).slice(0, 3);
    if (!people.length && !posts.length && !res.length) return '<div class="sp-empty">No people, posts or resources match "' + esc(q) + '".</div>';
    var h = '';
    if (people.length) h += '<div class="sp-group">People</div>' + people.map(function (p) { return '<button class="sp-item" data-act="profile" data-id="' + p.id + '">' + av(p, 24) + '<span class="sp-text"><span>' + esc(p.name) + '</span><span class="sp-sub">' + esc(p.title) + ' · ' + esc(p.loc) + '</span></span></button>'; }).join('');
    if (posts.length) h += '<div class="sp-group">Posts</div>' + posts.map(function (p) { return '<a class="sp-item" href="#/home/post/' + p.id + '"><span class="sp-ic">' + ic('message-square', 16) + '</span><span class="sp-text"><span>' + esc((p.title || p.text).slice(0, 60)) + '</span><span class="sp-sub">' + esc(p.type) + ' by ' + esc(P(p.author).name) + '</span></span></a>'; }).join('');
    if (res.length) h += '<div class="sp-group">Resources</div>' + res.map(function (r) { return '<button class="sp-item" data-act="open-resource" data-id="' + r.id + '"><span class="sp-ic">' + ic('file-text', 16) + '</span><span class="sp-text"><span>' + esc(r.t) + '</span><span class="sp-sub">' + esc(r.kind) + ' · updated ' + esc(r.ver) + '</span></span></button>'; }).join('');
    return h;
  };

  /* ---------------- core actions ---------------- */
  var A = APP.ACT;
  A['toggle-pop'] = function (el, e) {
    var p = document.getElementById(el.getAttribute('data-pop')); if (!p) return;
    var open = p.hidden; closePops(); p.hidden = !open; el.setAttribute('aria-expanded', String(open));
  };
  A['dd-pick'] = function (el) {
    var k = el.getAttribute('data-key'), v = el.getAttribute('data-val');
    S.f[k] = v; closePops();
    var menu = el.parentNode, trig = document.querySelector('[data-pop="dd-' + k + '"] .dd-value');
    if (trig) trig.textContent = el.textContent;
    menu.querySelectorAll('.list-item').forEach(function (li) { var on = li === el; li.classList.toggle('is-selected', on); li.setAttribute('aria-selected', on); li.querySelector('.list-check').innerHTML = on ? ic('check', 16) : ''; });
    if (APP.DD && APP.DD[k]) APP.DD[k](v, el);
    else if (!el.closest('#overlayHost')) APP.rerender();
  };
  A['close-overlay'] = function () { APP.closeOverlay(); };
  A['dismiss-banner'] = function () { document.getElementById('demoBanner').hidden = true; };
  A.theme = function () {
    var h = document.documentElement; var d = h.getAttribute('data-theme') === 'dark';
    h.setAttribute('data-theme', d ? 'light' : 'dark');
    try { localStorage.setItem('se-theme', d ? 'light' : 'dark'); } catch (e) {}
    closePops();
  };
  A['set-role'] = function (el) {
    S.roleKey = el.getAttribute('data-role'); S.f = {};
    try { localStorage.setItem('se-role', S.roleKey); } catch (e) {}
    APP.closeAll(); renderShell(); APP.rerender();
    var r = APP.role();
    APP.toast('Now viewing as ' + r.label + (r.role === 'Employee' ? ' (' + r.type + ')' : ''), P(r.person).name + ', ' + r.sub, 'info');
  };
  A['widget-state'] = function (el) { S.widget = el.getAttribute('data-val'); renderShell(); closePops(); if (S.route[0] !== 'home') location.hash = '#/home'; else APP.rerender(); };
  A['open-nav'] = openNav; A['close-nav'] = closeNav;
  A['collapse-nav'] = function () { document.body.classList.toggle('nav-collapsed'); };
  A['notifs-read'] = function () { D.NOTIFS.forEach(function (n) { n.unread = false; }); renderNotifs(); document.getElementById('notifPop').hidden = false; };
  A['notif-go'] = function (el) {
    var n = D.NOTIFS[+el.getAttribute('data-i')]; n.unread = false; renderNotifs(); closePops();
    if (n.go.indexOf('survey:') === 0) APP.ACT['start-survey']({ getAttribute: function () { return n.go.split(':')[1]; } });
    else APP.go(n.go);
  };
  A['sign-out'] = function () {
    closePops();
    host().insertAdjacentHTML('beforeend', '<div class="signed-out" data-overlay><div class="so-card card"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect width="24" height="24" rx="6" fill="var(--accent-9)"/><text x="12" y="16.5" text-anchor="middle" font-size="13" font-weight="700" fill="var(--accent-contrast)">S</text></svg>' +
      '<h2 class="t-6 fw-bold">You are signed out</h2><p class="text-low">This device is ready for the next colleague. Nothing from your session is left on screen.</p>' +
      '<button class="btn btn-solid is-lg" data-act="sign-in">' + ic('log-in', 16, 'btn-icon') + 'Sign in with ' + esc(D.ORG) + ' SSO</button></div></div>');
  };
  A['sign-in'] = function () { APP.closeAll(); APP.go('#/home'); APP.toast('Signed in', 'Welcome back, ' + APP.me().name.split(' ')[0] + '.'); };
  A['mobile-search'] = function () {
    APP.dialog({ title: 'Search', body: '<div class="search search-full"><span class="search-icon">' + ic('search', 16) + '</span><input class="input" data-input="msearch" placeholder="People, posts and resources" aria-label="Search"></div><div class="msearch-results" id="msearchResults"><p class="text-low t-1">Try "nurse", "policy" or "flu".</p></div>' });
  };
  APP.INPUT.msearch = function (el) { document.getElementById('msearchResults').innerHTML = APP.searchResults(el.value) || '<p class="text-low t-1">Try "nurse", "policy" or "flu".</p>'; };
  A['phone-preview'] = function () {
    closePops();
    var src = location.pathname + '?frame=phone&role=' + S.roleKey + (location.hash || '#/home');
    host().insertAdjacentHTML('beforeend', '<div class="overlay phone-overlay" data-overlay><div class="phone-wrap"><div class="phone-bar"><span class="t-2 fw-medium">Phone preview · ' + esc(APP.role().label) + '</span><button class="btn btn-surface is-sm" data-act="close-overlay">' + ic('x', 16, 'btn-icon') + 'Close</button></div>' +
      '<div class="phone-frame"><iframe title="skyEmployee on a phone" src="' + esc(src) + '"></iframe></div></div></div>');
  };
  A['copy'] = function (el) { APP.toast('Copied', el.getAttribute('data-what') || 'Copied to clipboard.'); };
  A['noop-toast'] = function (el) { APP.toast(el.getAttribute('data-t') || 'Done', el.getAttribute('data-b') || '', el.getAttribute('data-k') || 'success'); };
  A['open-app'] = function (el) { APP.openApp(el.getAttribute('data-app'), el.getAttribute('data-what')); };
  A['export'] = function (el) { APP.toast('Export started', (el.getAttribute('data-what') || 'CSV') + ' will download shortly. Exports never include gift card codes.', 'info'); };

  /* ---------------- boot ---------------- */
  APP.start = function () {
    var qs = new URLSearchParams(location.search);
    if (qs.get('frame') === 'phone') document.body.classList.add('is-frame');
    var saved = null; try { saved = localStorage.getItem('se-role'); } catch (e) {}
    S.roleKey = qs.get('role') || saved || 'emp-f';
    if (!D.ROLES.some(function (r) { return r.key === S.roleKey; })) S.roleKey = 'emp-f';
    try { var th = localStorage.getItem('se-theme'); if (th) document.documentElement.setAttribute('data-theme', th); } catch (e) {}
    document.querySelectorAll('[data-ic]').forEach(fillIc);

    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-act]');
      if (t && !t.disabled) {
        var fn = A[t.getAttribute('data-act')];
        if (fn) { e.preventDefault(); fn(t, e); return; }
      }
      if (e.target.matches('[data-overlay]')) { APP.closeOverlay(); return; }
      if (!e.target.closest('.pop') && !e.target.closest('.header-search')) closePops();
      var a = e.target.closest('a[href^="#/"]'); if (a && host().lastElementChild && !a.closest('.phone-overlay')) APP.closeAll();
    });
    document.addEventListener('input', function (e) { var n = e.target.getAttribute('data-input'); if (n && APP.INPUT[n]) APP.INPUT[n](e.target, e); });
    document.addEventListener('change', function (e) { var n = e.target.getAttribute('data-change'); if (n && APP.INPUT[n]) APP.INPUT[n](e.target, e); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (document.querySelector('.pop:not([hidden])')) closePops(); else if (host().lastElementChild) APP.closeOverlay(); }
      if (e.key === 'Enter' && e.target.matches('[data-enter]')) { e.preventDefault(); var fn = A[e.target.getAttribute('data-enter')]; if (fn) fn(e.target, e); }
    });
    var gs = document.getElementById('globalSearchInput'), sp = document.getElementById('searchPop');
    gs.addEventListener('input', function () { var h = APP.searchResults(gs.value); sp.innerHTML = h; sp.hidden = !h; });
    gs.addEventListener('focus', function () { if (gs.value) { sp.innerHTML = APP.searchResults(gs.value); sp.hidden = false; } });
    window.addEventListener('hashchange', render);
    renderShell(); render();
  };
})();
