/* skyEmployee wireframe: Directory, Who's On Today, profiles and Me. */
(function () {
  var D = SE, A = APP.ACT, S = APP.S, ic = APP.ic, esc = APP.esc, P = APP.P, av = APP.av, badge = APP.badge, btn = APP.btn;
  S.dirView = 'grid'; S.dirQ = ''; S.notif = { mentions: true, comments: true, reactions: false, shoutouts: true, ecards: true, gifts: true, announcements: true, polls: true, acks: true, fulfil: true, quiet: true };

  function awardsFor(id) {
    var out = [];
    D.POSTS.forEach(function (p) { if (p.type === 'Shout-out' && p.badge && p.to && p.to.indexOf(id) >= 0 && !p.removed) out.push({ badge: D.BADGES.filter(function (b) { return b.id === p.badge; })[0], from: p.author, when: p.time === 'now' ? 'Today' : p.time + ' ago', post: p.id }); });
    if (id === 'sarah') out.push({ badge: D.BADGES[0], from: 'ana', when: 'Aug 21', post: 'p1' }, { badge: D.BADGES[3], from: 'dev', when: 'Jun 2', post: 'p1' });
    if (id === 'daniel') out.push({ badge: D.BADGES[1], from: 'elena', when: 'Sep 3', post: 'p1' });
    return out;
  }
  APP.awardsFor = awardsFor;

  /* ---------- profile drawer ---------- */
  A.profile = function (el) {
    APP.closePops(); var p = P(el.getAttribute('data-id')), me = APP.me(), boss = p.reports ? P(p.reports) : null, aw = awardsFor(p.id);
    var on = D.WHOS_ON.concat(D.WHOS_ON_OTHER['Riverside Commons'], D.WHOS_ON_OTHER['Cedar Hills'], D.WHOS_ON_OTHER['Corporate Office']).filter(function (w) { return w.p === p.id; })[0];
    var body = '<div class="profile-top">' + av(p, 72) + '<div><div class="t-5 fw-bold">' + esc(p.name) + '</div><div class="text-low">' + esc(p.title) + '</div>' +
      '<div class="profile-badges">' + (on ? badge('On shift until ' + on.until, 'is-success', 'circle-dot') : badge('Not on shift', 'is-neutral')) + badge(p.type, 'is-neutral') + '</div></div></div>' +
      (p.id !== me.id ? '<div class="profile-actions">' + btn('Give a shout-out', 'btn-solid', 'award', 'data-act="compose" data-type="Shout-out" data-to="' + p.id + '"') + btn('Send an e-card', 'btn-soft', 'mail', 'data-act="send-ecard" data-to="' + p.id + '"') + '</div>' : '') +
      '<h3 class="section-label">Work details</h3><div class="data-list">' +
      '<span class="dl-label">Department</span><span class="dl-value">' + esc(p.dept) + '</span>' +
      '<span class="dl-label">Location</span><span class="dl-value">' + esc(p.loc) + '</span>' +
      '<span class="dl-label">Reports to</span><span class="dl-value">' + (boss ? '<button class="link-plain link" data-act="profile" data-id="' + boss.id + '">' + esc(boss.name) + '</button>' : 'Not available') + '</span>' +
      '<span class="dl-label">With Cascade Living since</span><span class="dl-value">' + p.since + '</span></div>' +
      '<h3 class="section-label">Work contact</h3>' +
      (p.published ? '<div class="contact-list"><button class="contact-row" data-act="copy" data-what="Work email copied">' + ic('mail', 16) + '<span>' + esc(p.email) + '</span>' + ic('copy', 14) + '</button>' + (p.ext ? '<button class="contact-row" data-act="noop-toast" data-t="Calling ' + esc(p.name) + '" data-b="Work extension ' + p.ext + '" data-k="info">' + ic('phone', 16) + '<span>Work extension ' + p.ext + '</span>' + ic('phone', 14) + '</button>' : '') + '</div>'
        : APP.callout('Work contact details for this role are not published. Try their manager, or find them on shift in Who’s On Today.', '', 'lock')) +
      '<p class="t-1 text-low">Personal contact details are never shown.</p>' +
      '<h3 class="section-label">Awards received <span class="text-low fw-regular">' + aw.length + '</span></h3>' +
      (aw.length ? '<div class="award-list">' + aw.map(awardRow).join('') + '</div>' : '<p class="text-low t-2">No awards yet.</p>');
    APP.drawer({ title: 'Profile', body: body });
  };
  function awardRow(a) {
    return '<a class="award-row" href="#/home/post/' + a.post + '"><span class="avatar ' + a.badge.tone + '">' + ic(a.badge.ic, 16) + '</span><span class="pl-text"><span class="pl-name">' + esc(a.badge.name) + '</span><span class="pl-sub">from ' + esc(P(a.from).name) + ' · ' + a.when + '</span></span>' + ic('chevron-right', 16) + '</a>';
  }

  /* ---------- directory ---------- */
  APP.DD = APP.DD || {};
  APP.DD.dirLoc = function () { APP.rerender(); }; APP.DD.dirDept = function () { APP.rerender(); };
  APP.DD.whoLoc = function () { APP.rerender(); };
  APP.INPUT['dir-search'] = function (el) { S.dirQ = el.value; document.getElementById('dirResults').innerHTML = dirResults(); };
  A['dir-view'] = function (el) { S.dirView = el.getAttribute('data-v'); APP.rerender(); };
  A['dir-clear'] = function () { S.dirQ = ''; S.f.dirLoc = 'All locations'; S.f.dirDept = 'All departments'; APP.rerender(); };
  function dirList() {
    var q = S.dirQ.trim().toLowerCase(), loc = S.f.dirLoc || 'All locations', dept = S.f.dirDept || 'All departments';
    return D.PEOPLE.filter(function (p) {
      return p.active && (loc === 'All locations' || p.loc === loc) && (dept === 'All departments' || p.dept === dept) && (!q || (p.name + ' ' + p.title + ' ' + p.dept + ' ' + p.loc).toLowerCase().indexOf(q) >= 0);
    });
  }
  function dirResults() {
    var list = dirList();
    if (!list.length) return '<section class="card">' + APP.emptyState('search', 'No one matches', 'Try a different name, job title or location.', btn('Clear filters', 'btn-solid', null, 'data-act="dir-clear"')) + '</section>';
    var count = '<p class="t-1 text-low result-count">' + list.length + ' people</p>';
    if (S.dirView === 'list') return count + APP.table(['Name', 'Department', 'Location', 'Work contact', ''], list.map(function (p) {
      return { attrs: 'data-act="profile" data-id="' + p.id + '" class="is-clickable"', cells: ['<span class="cell-person">' + av(p) + '<span><span class="cell-strong">' + esc(p.name) + '</span><span class="cell-sub">' + esc(p.title) + '</span></span></span>', esc(p.dept), esc(p.loc), p.published ? esc(p.ext || p.email) : '<span class="text-low">Not published</span>', ic('chevron-right', 16)] };
    }));
    return count + '<div class="people-grid">' + list.map(function (p) {
      return '<button class="card person-card" data-act="profile" data-id="' + p.id + '">' + av(p, 56) + '<span class="pc-name">' + esc(p.name) + '</span><span class="pc-title">' + esc(p.title) + '</span><span class="pc-meta">' + ic('map-pin', 12) + esc(p.loc) + ' · ' + esc(p.dept) + '</span></button>';
    }).join('') + '</div>';
  }
  function whosOn() {
    var me = APP.me(), canOther = APP.canManage();
    var scopeLocs = APP.isAdmin() ? D.COMMUNITIES : APP.isCtrl() ? APP.scope() : [me.loc];
    var loc = canOther ? (S.f.whoLoc || me.loc) : me.loc;
    if (scopeLocs.indexOf(loc) < 0) loc = scopeLocs[0];
    var list = loc === 'Maple Grove' ? D.WHOS_ON : D.WHOS_ON_OTHER[loc] || [];
    var dept = S.f.whoDept || 'All';
    var depts = ['All'].concat(D.DEPTS.filter(function (d) { return list.some(function (w) { return P(w.p).dept === d; }); }));
    var keys = list.filter(function (w) { return w.key; });
    var h = '<div class="table-toolbar">' +
      (scopeLocs.length > 1 ? APP.dd('whoLoc', scopeLocs, loc) : '<span class="tag">' + ic('map-pin', 12) + esc(loc) + '</span>') +
      '<div class="segmented" role="tablist">' + depts.map(function (d) { return '<button class="segmented-item' + (dept === d ? ' is-active' : '') + '" data-act="who-dept" data-v="' + d + '">' + d + '</button>'; }).join('') + '</div>' +
      '<span class="toolbar-spacer"></span><span class="t-1 text-low">' + ic('refresh-cw', 12) + ' From skySchedule · updated 2 min ago</span></div>';
    if (!canOther) h += '<p class="t-1 text-low scope-note">' + ic('lock', 12) + ' You see who is on at your own community.</p>';
    if (keys.length) h += '<div class="key-roles">' + keys.map(function (w) { var p = P(w.p); return '<button class="card key-role" data-act="profile" data-id="' + p.id + '"><span class="kr-label">' + ic('star', 14) + esc(w.key) + '</span>' + APP.personLine(p, 'On until ' + w.until, 40, false) + (p.published && p.ext ? '<span class="kr-ext">' + ic('phone', 12) + p.ext + '</span>' : '') + '</button>'; }).join('') + '</div>';
    var groups = D.DEPTS.filter(function (d) { return dept === 'All' || d === dept; }).map(function (d) {
      var g = list.filter(function (w) { return P(w.p).dept === d; }); if (!g.length) return '';
      return '<section class="card who-group">' + APP.panelHead(d, g.length + ' on shift') + '<div class="who-list">' + g.map(function (w) { var p = P(w.p);
        return '<div class="who-row is-row">' + APP.personLine(p, esc(p.title)) + '<span class="who-until">' + ic('clock', 12) + 'until ' + w.until + '</span>' + (w.key ? badge(w.key, 'is-info') : '') + (p.published && p.ext ? '<button class="btn btn-ghost is-sm" data-act="noop-toast" data-t="Calling ' + esc(p.name) + '" data-b="Work extension ' + p.ext + '" data-k="info">' + ic('phone', 14, 'btn-icon') + p.ext + '</button>' : '<span class="t-1 text-low who-nocontact">No published contact</span>') + '</div>'; }).join('') + '</div></section>';
    }).join('');
    return h + '<div class="who-groups">' + groups + '</div>';
  }
  A['who-dept'] = function (el) { S.f.whoDept = el.getAttribute('data-v'); APP.rerender(); };

  APP.VIEWS.directory = function (r) {
    var tab = r[1] === 'whos-on' ? 'whos-on' : 'people';
    var tabs = APP.tabs([['people', 'People', '#/directory', D.PEOPLE.length], ['whos-on', "Who's On Today", '#/directory/whos-on']], tab);
    var body;
    if (tab === 'people') {
      body = '<div class="table-toolbar"><div class="search dir-search"><span class="search-icon">' + ic('search', 16) + '</span><input class="input" placeholder="Search by name, job title, department or location" value="' + esc(S.dirQ) + '" data-input="dir-search" aria-label="Search the directory"></div>' +
        APP.dd('dirLoc', ['All locations'].concat(D.COMMUNITIES), S.f.dirLoc || 'All locations') + APP.dd('dirDept', ['All departments'].concat(D.DEPTS), S.f.dirDept || 'All departments') +
        '<span class="toolbar-spacer"></span><div class="segmented" aria-label="Layout">' + [['grid', 'grid-2x2', 'Cards'], ['list', 'list', 'List']].map(function (v) { return '<button class="segmented-item' + (S.dirView === v[0] ? ' is-active' : '') + '" data-act="dir-view" data-v="' + v[0] + '" aria-label="' + v[2] + '">' + ic(v[1], 16) + '</button>'; }).join('') + '</div></div>' +
        '<div id="dirResults">' + dirResults() + '</div>';
    } else body = whosOn();
    return APP.page({ crumbs: [['Home', '#/home'], ['Directory', '#/directory'], [tab === 'people' ? 'People' : "Who's On Today"]], title: 'Directory', desc: 'Find a colleague, see who is on shift right now and how to reach them.', tabs: tabs, body: body });
  };

  /* ---------- Me ---------- */
  A['change-photo'] = function () { APP.toast('Photo updated', 'In the real app this opens your camera or photo library.'); };
  A['notif-toggle'] = function (el) { var k = el.getAttribute('data-k'); S.notif[k] = !S.notif[k]; };
  APP.INPUT['notif-sw'] = function (el) { S.notif[el.getAttribute('data-k')] = el.checked; if (el.getAttribute('data-k') === 'quiet') APP.rerender(); };
  APP.DD.quietFrom = function () { APP.rerender(); }; APP.DD.quietTo = function () { APP.rerender(); };

  APP.VIEWS.me = function (r) {
    var me = APP.me(), tab = r[1] || 'profile', aw = awardsFor(me.id), due = APP.dueItems();
    var tabs = APP.tabs([['profile', 'Profile', '#/me'], ['awards', 'Awards', '#/me/awards', aw.length], ['due', 'Due items', '#/me/due', due.length], ['notifications', 'Notifications', '#/me/notifications']], tab);
    var body = '';
    if (tab === 'profile') {
      body = '<div class="split-2"><section class="card"><div class="profile-top">' + '<span class="photo-edit">' + av(me, 88) + '<button class="photo-btn" aria-label="Change photo" data-act="change-photo">' + ic('pencil', 14) + '</button></span>' +
        '<div><div class="t-6 fw-bold">' + esc(me.name) + '</div><div class="text-low t-3">' + esc(me.title) + '</div><div class="profile-badges">' + badge(APP.role().role, APP.role().role === 'Employee' ? 'is-neutral' : '') + badge(me.type, 'is-neutral') + '</div></div></div>' +
        '<hr class="divider"><div class="data-list"><span class="dl-label">Location</span><span class="dl-value">' + esc(me.loc) + '</span><span class="dl-label">Team</span><span class="dl-value">' + esc(me.dept) + '</span>' +
        '<span class="dl-label">Reports to</span><span class="dl-value">' + (me.reports ? esc(P(me.reports).name) : 'Not available') + '</span><span class="dl-label">Work email</span><span class="dl-value">' + esc(me.email) + '</span><span class="dl-label">With Cascade Living since</span><span class="dl-value">' + me.since + '</span></div>' +
        '<p class="t-1 text-low profile-src">' + ic('info', 12) + ' Details come from the HR system. To correct something, raise a request in skySupport.</p>' +
        '<div class="row-gap">' + btn('Change photo', 'btn-soft', 'image-plus', 'data-act="change-photo"') + btn('Report a correction', 'btn-surface', 'external-link', 'data-act="open-app" data-app="skySupport" data-what="New HR data request"') + '</div></section>' +
        '<div class="stack-4"><section class="card">' + APP.panelHead('Recognition', null, '<a class="link t-1" href="#/me/awards">See all</a>') + '<div class="summary-strip"><div><div class="ss-label">Awards</div><div class="ss-value">' + aw.length + '</div></div><div><div class="ss-label">Shout-outs</div><div class="ss-value">' + D.POSTS.filter(function (p) { return p.type === 'Shout-out' && p.to && p.to.indexOf(me.id) >= 0; }).length + '</div></div><div><div class="ss-label">Gift cards</div><div class="ss-value">' + D.AWARDS.filter(function (a) { return a.to === me.id && a.status !== 'Cancelled'; }).length + '</div></div></div></section>' +
        '<section class="card">' + APP.panelHead('Due items', due.length + ' outstanding', '<a class="link t-1" href="#/me/due">See all</a>') + '<div class="due-list">' + due.slice(0, 3).map(APP.dueRow).join('') + '</div></section>' +
        '<section class="card">' + APP.panelHead('Quick links') + '<div class="quick-links"><a class="ql" href="#/pay">' + ic('wallet', 18) + 'Pay & Benefits</a><a class="ql" href="#/rewards">' + ic('gift', 18) + 'My Rewards</a><a class="ql" href="#/me/notifications">' + ic('bell', 18) + 'Notifications</a><button class="ql" data-act="sign-out">' + ic('log-out', 18) + 'Sign out</button></div></section></div></div>';
    } else if (tab === 'awards') {
      body = aw.length ? '<div class="awards-grid">' + aw.map(function (a) {
        return '<a class="card award-card" href="#/home/post/' + a.post + '"><span class="avatar ' + a.badge.tone + '" style="width:48px;height:48px;">' + ic(a.badge.ic, 22) + '</span><span class="t-4 fw-bold">' + esc(a.badge.name) + '</span><span class="t-1 text-low">' + esc(a.badge.desc) + '</span><span class="aw-from">' + av(P(a.from), 20) + 'from ' + esc(P(a.from).name) + ' · ' + a.when + '</span><span class="link t-1">View the shout-out ' + ic('arrow-right', 12) + '</span></a>'; }).join('') + '</div>'
        : '<section class="card">' + APP.emptyState('award', 'No awards yet', 'When a colleague gives you a shout-out with a badge, it shows up here.', btn('Give someone a shout-out', 'btn-solid', 'award', 'data-act="compose" data-type="Shout-out"')) + '</section>';
    } else if (tab === 'due') {
      body = due.length ? '<section class="card"><div class="due-list is-large">' + due.map(APP.dueRow).join('') + '</div></section><p class="t-1 text-low">Sorted by due date. Courses open in skyLearn. Policies and surveys open here.</p>'
        : '<section class="card">' + APP.emptyState('circle-check', 'Nothing outstanding', 'You are all caught up. New courses, policies and surveys will appear here.', btn('Back to Home', 'btn-solid', null, 'data-act="go" data-href="#/home"')) + '</section>';
    } else {
      var rows = [['mentions', 'Mentions', 'When someone @mentions you'], ['comments', 'Comments and replies', 'On your posts and comments'], ['reactions', 'Reactions', 'When someone likes your post'], ['shoutouts', 'Shout-outs and spotlights', 'When you are recognised'], ['ecards', 'E-cards', 'When a colleague sends you one'], ['gifts', 'Gift cards', 'As soon as a card is awarded to you'], ['announcements', 'Announcements, polls and surveys', 'New items for your community'], ['acks', 'Acknowledgement reminders', 'Policies you still need to read'], ['fulfil', 'Reward fulfilment', 'Progress on merchandise and perks']];
      body = '<div class="split-2"><section class="card">' + APP.panelHead('What to notify me about', 'In-app notifications. Gift card codes are never included.') + '<div class="setting-list">' + rows.map(function (x) {
        return '<label class="setting-row"><span><span class="fw-medium">' + x[1] + '</span><span class="t-1 text-low">' + x[2] + '</span></span><span class="switch"><input type="checkbox" data-change="notif-sw" data-k="' + x[0] + '" ' + (S.notif[x[0]] ? 'checked' : '') + ' aria-label="' + x[1] + '"></span></label>'; }).join('') + '</div></section>' +
        '<section class="card">' + APP.panelHead('Quiet hours', 'Pause notifications while you sleep or are off shift.') +
        '<label class="setting-row"><span class="fw-medium">Use quiet hours</span><span class="switch"><input type="checkbox" data-change="notif-sw" data-k="quiet" ' + (S.notif.quiet ? 'checked' : '') + ' aria-label="Use quiet hours"></span></label>' +
        (S.notif.quiet ? '<div class="form-grid">' + APP.field('From', APP.dd('quietFrom', ['8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'], S.f.quietFrom || '10:00 PM', 'dd-block')) + APP.field('To', APP.dd('quietTo', ['5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM'], S.f.quietTo || '6:00 AM', 'dd-block')) + '</div><p class="t-1 text-low">Notifications that arrive during quiet hours wait in your bell until ' + (S.f.quietTo || '6:00 AM') + '.</p>' : '') +
        btn('Save preferences', 'btn-solid', null, 'data-act="noop-toast" data-t="Preferences saved"') + '</section></div>';
    }
    return APP.page({ crumbs: [['Home', '#/home'], ['Me', '#/me'], [{ profile: 'Profile', awards: 'Awards', due: 'Due items', notifications: 'Notifications' }[tab]]], title: 'Me', desc: 'Your profile, the recognition you have received, what is due and how we reach you.', tabs: tabs, body: body });
  };
})();
