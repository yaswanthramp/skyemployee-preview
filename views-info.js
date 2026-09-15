/* skyEmployee wireframe: Resources & Policies. */
(function () {
  var D = SE, A = APP.ACT, S = APP.S, ic = APP.ic, esc = APP.esc, P = APP.P, badge = APP.badge, btn = APP.btn;
  S.resQ = ''; S.resCat = 'all';

  /* ---------------- Resources ---------------- */
  var kindIc = { Document: 'file-text', Video: 'film', Image: 'image', Link: 'link-2' };
  function catOf(r) { return D.RESOURCE_CATS.filter(function (c) { return c.id === r.cat; })[0]; }
  function resRow(r) {
    var c = catOf(r);
    var status = r.ack ? (r.acked ? badge('Acknowledged', 'is-success', 'circle-check') : r.ackDueN <= 5 ? badge('Acknowledge by ' + r.ackDue, 'is-warning') : badge('Acknowledge by ' + r.ackDue, 'is-neutral')) : r.sign ? badge('Signature in skySign', 'is-info', 'pen-line') : '';
    return '<div class="res-row"><button class="res-main" data-act="open-resource" data-id="' + r.id + '"><span class="res-ic">' + ic(kindIc[r.kind], 18) + '</span><span class="pl-text"><span class="pl-name">' + esc(r.t) + '</span><span class="pl-sub">' + esc(r.d) + '</span><span class="res-meta">' + esc(c.name) + ' · ' + r.kind + ' · updated ' + r.ver + '</span></span></button>' +
      '<span class="res-side">' + status + '<button class="btn btn-ghost is-icon is-sm fav-btn' + (r.fav ? ' is-on' : '') + '" aria-pressed="' + !!r.fav + '" aria-label="' + (r.fav ? 'Remove from favourites' : 'Add to favourites') + '" data-act="fav" data-id="' + r.id + '">' + ic('star', 16) + '</button></span></div>';
  }
  A.fav = function (el) { var r = D.RESOURCES.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; r.fav = !r.fav; APP.rerender(); APP.toast(r.fav ? 'Added to favourites' : 'Removed from favourites'); };
  APP.INPUT['res-search'] = function (el) { S.resQ = el.value; document.getElementById('resList').innerHTML = resList(); };
  A['res-cat'] = function (el) { S.resCat = el.getAttribute('data-c'); APP.rerender(); };
  function filtered(tab) {
    var q = S.resQ.trim().toLowerCase();
    return D.RESOURCES.filter(function (r) {
      if (r.archived) return false;
      if (tab === 'favourites' && !r.fav) return false;
      if (tab === 'acknowledge' && !(r.ack)) return false;
      if (tab === 'library' && S.resCat !== 'all' && r.cat !== S.resCat) return false;
      return !q || (r.t + ' ' + r.d + ' ' + catOf(r).name).toLowerCase().indexOf(q) >= 0;
    });
  }
  function resList() {
    var tab = S.route[1] || 'library', list = filtered(tab);
    if (tab === 'acknowledge') list.sort(function (a, b) { return (a.acked ? 1 : 0) - (b.acked ? 1 : 0) || a.ackDueN - b.ackDueN; });
    if (!list.length) return tab === 'favourites' && !S.resQ ? APP.emptyState('star', 'No favourites yet', 'Tap the star on any resource to keep it here for quick access.', btn('Browse the library', 'btn-solid', null, 'data-act="go" data-href="#/resources"'))
      : APP.emptyState('search', 'Nothing matches', 'Try another word, or look in a different category.', btn('Clear search', 'btn-solid', null, 'data-act="res-clear"'));
    return '<div class="res-list">' + list.map(resRow).join('') + '</div>';
  }
  A['res-clear'] = function () { S.resQ = ''; S.resCat = 'all'; APP.rerender(); };
  A['open-resource'] = function (el) {
    APP.closePops(); APP.closeAll();
    var r = D.RESOURCES.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0], c = catOf(r), owner = P(r.owner);
    var doc = r.kind === 'Video' ? APP.videoHtml('res-' + r.id, '4:10') : r.kind === 'Image' ? '<div class="doc-img">' + ic('image', 40) + '<span class="t-1 text-low">Checklist image, pinch to zoom on a phone</span></div>' : r.kind === 'Link' ? APP.callout('This resource lives on another site. It opens in a new tab.', 'is-info', 'external-link') :
      '<div class="doc"><h3 class="t-4 fw-bold">' + esc(r.t) + '</h3><p class="t-1 text-low">Version ' + r.ver + '</p><h4>1. Purpose</h4><p>This document sets out what every team member at ' + esc(D.ORG) + ' needs to do, and why. It applies at every community.</p><h4>2. What you need to do</h4><ul><li>Read this policy in full before your next shift.</li><li>Follow the steps in section 3 every time.</li><li>Ask your supervisor if anything is unclear.</li></ul><h4>3. Steps</h4><p>Clean hands before and after every resident contact. Wear the right protective equipment for the task, and change it between residents. Report symptoms before your shift, not during it.</p><h4>4. Questions</h4><p>Contact the content owner listed on this page.</p></div>';
    var foot = r.ack ? (r.acked ? badge('You acknowledged this on Sep 15', 'is-success', 'circle-check') : '<label class="checkbox"><input type="checkbox" data-change="ack-check"> I have read and understood this policy</label><span class="toolbar-spacer"></span>' + btn('Acknowledge', 'btn-solid', 'file-check', 'data-act="ack" data-id="' + r.id + '" id="ackBtn" disabled'))
      : r.sign ? '<span class="t-2 text-low">This one needs a signature, not an acknowledgement.</span><span class="toolbar-spacer"></span>' + btn('Sign in skySign', 'btn-solid', 'pen-line', 'data-act="open-app" data-app="skySign" data-what="' + esc(r.t) + '"')
        : btn(r.fav ? 'Favourite' : 'Add to favourites', r.fav ? 'btn-soft' : 'btn-surface', 'star', 'data-act="fav" data-id="' + r.id + '"') + '<span class="toolbar-spacer"></span>' + btn(r.kind === 'Link' ? 'Open link' : 'Download', 'btn-solid', r.kind === 'Link' ? 'external-link' : 'download', 'data-act="noop-toast" data-t="' + (r.kind === 'Link' ? 'Opening in a new tab' : 'Download started') + '" data-k="info"');
    APP.drawer({ title: esc(r.t), body: '<div class="res-facts">' + badge(c.name, 'is-neutral', c.ic) + badge(r.kind, 'is-neutral', kindIc[r.kind]) + (r.ack && !r.acked ? badge('Acknowledge by ' + r.ackDue, 'is-warning') : '') + '</div><p class="text-low">' + esc(r.d) + '</p>' + doc +
      '<div class="data-list res-dl"><span class="dl-label">Owner</span><span class="dl-value">' + esc(owner.name) + ', ' + esc(owner.title) + '</span><span class="dl-label">Version date</span><span class="dl-value">' + r.ver + '</span><span class="dl-label">Next review</span><span class="dl-value">' + r.review + '</span></div>', footer: foot });
  };
  APP.INPUT['ack-check'] = function (el) { document.getElementById('ackBtn').disabled = !el.checked; };
  A.ack = function (el) { var r = D.RESOURCES.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; r.acked = true; r.ackRate = Math.min(100, (r.ackRate || 0) + 1); APP.closeAll(); APP.rerender(); APP.toast('Acknowledged', r.t + ' is off your due list.'); };

  APP.VIEWS.resources = function (r) {
    var tab = r[1] || 'library', open = D.RESOURCES.filter(function (x) { return x.ack && !x.acked; }).length;
    var items = [['library', 'Library', '#/resources'], ['favourites', 'Favourites', '#/resources/favourites', D.RESOURCES.filter(function (x) { return x.fav; }).length], ['acknowledge', 'To acknowledge', '#/resources/acknowledge', open]];
    var search = '<div class="table-toolbar"><div class="search res-search"><span class="search-icon">' + ic('search', 16) + '</span><input class="input" placeholder="Search policies, procedures, forms and playbooks" value="' + esc(S.resQ) + '" data-input="res-search" aria-label="Search resources"></div>' +
      (APP.isAdmin() ? '<span class="toolbar-spacer"></span><a class="btn btn-surface" href="#/admin/resources">' + ic('settings', 16, 'btn-icon') + 'Manage library</a>' : '') + '</div>';
    var body;
    if (tab === 'library') {
      body = '<div class="res-layout"><aside class="res-cats card" aria-label="Categories"><a class="pane-folder' + (S.resCat === 'all' ? ' is-active' : '') + '" href="#/resources" data-act="res-cat" data-c="all"><span class="pf-ic">' + ic('layers', 18) + '</span>All resources<span class="pf-count">' + D.RESOURCES.length + '</span></a>' +
        D.RESOURCE_CATS.map(function (c) { return '<a class="pane-folder' + (S.resCat === c.id ? ' is-active' : '') + '" href="#/resources" data-act="res-cat" data-c="' + c.id + '"><span class="pf-ic">' + ic(c.ic, 18) + '</span>' + esc(c.name) + '<span class="pf-count">' + D.RESOURCES.filter(function (x) { return x.cat === c.id; }).length + '</span></a>'; }).join('') +
        '</aside><section class="card flush-card res-card">' + search + '<div id="resList">' + resList() + '</div></section></div>';
    } else if (tab === 'acknowledge') {
      body = (open ? APP.callout('<b>' + open + ' ' + (open === 1 ? 'policy needs' : 'policies need') + ' your acknowledgement.</b> Open each one, read it and confirm. Your manager can see who has acknowledged.', 'is-warning', 'file-check') : APP.callout('You have acknowledged everything assigned to you.', 'is-success', 'circle-check')) +
        '<section class="card flush-card">' + search + '<div id="resList">' + resList() + '</div></section>';
    } else body = '<section class="card flush-card">' + search + '<div id="resList">' + resList() + '</div></section>';
    return APP.page({ crumbs: [['Home', '#/home'], ['Resources', '#/resources'], [items.filter(function (i) { return i[0] === tab; })[0][1]]], title: 'Resources & Policies', desc: 'Every policy, procedure, form and playbook in one searchable place. Each one has a named owner.', tabs: APP.tabs(items, tab), body: body });
  };
})();
