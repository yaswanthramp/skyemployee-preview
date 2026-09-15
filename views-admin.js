/* skyEmployee wireframe: Manage (Controller, own scope) and Administration (Admin).
   Controllers reach Content, Survey results and Acknowledgements for their
   locations. Admins get everything plus users, gift cards, recognition,
   the resource library and settings. */
(function () {
  var D = SE, A = APP.ACT, S = APP.S, ic = APP.ic, esc = APP.esc, P = APP.P, av = APP.av, badge = APP.badge, btn = APP.btn, money = APP.money, table = APP.table;
  function crumbsFor(section, label, tabLabel, href) { return [['Home', '#/home'], [section, href], [tabLabel || label]]; }
  function sectionName() { return APP.isAdmin() ? 'Administration' : 'Manage'; }
  function scopeNote() { return APP.isCtrl() ? '<p class="t-1 text-low scope-note">' + ic('map-pin', 12) + ' Showing ' + esc(APP.scope()[0]) + ', the location you manage.</p>' : ''; }
  function rowMenu(id, items) {
    return '<span class="pop-anchor"><button class="btn btn-ghost is-icon is-sm" aria-label="Actions" data-act="toggle-pop" data-pop="rm-' + id + '">' + ic('ellipsis', 16) + '</button><div class="dropdown-menu pop row-menu" id="rm-' + id + '" hidden>' +
      items.map(function (i) { return '<div class="list-item' + (i[3] ? ' is-danger-item' : '') + '" ' + i[2] + '><span class="list-check">' + ic(i[0], 16) + '</span>' + i[1] + '</div>'; }).join('') + '</div></span>';
  }
  function toolbar(searchPh, extra, action) {
    return '<div class="table-toolbar">' + (searchPh ? '<div class="search tb-search"><span class="search-icon">' + ic('search', 16) + '</span><input class="input" placeholder="' + searchPh + '" aria-label="' + searchPh + '" data-input="noop"></div>' : '') + (extra || '') + '<span class="toolbar-spacer"></span>' + (action || '') + '</div>';
  }
  APP.INPUT.noop = function () {};

  /* ======================= CONTENT ======================= */
  function contentTab(tab) {
    if (tab === 'banners') return banners();
    if (tab === 'polls') return polls();
    if (tab === 'videos') return videos();
    if (tab === 'moderation') return moderation();
    var st = S.f.cStatus || 'All statuses';
    var list = D.CONTENT.filter(function (c) { return APP.inScope(c.loc) && (st === 'All statuses' || c.status === st); });
    return toolbar('Search announcements and spotlights', APP.dd('cStatus', ['All statuses', 'Live', 'Pinned', 'Scheduled', 'Draft'], st), btn('New spotlight', 'btn-surface', 'sparkles', 'data-act="compose" data-type="Spotlight"') + btn('New announcement', 'btn-solid', 'plus', 'data-act="compose" data-type="Announcement"')) + scopeNote() +
      table(['Title', 'Audience', 'Author', 'Publish date', 'Status', ''], list.map(function (c, i) {
        return ['<span class="cell-strong">' + esc(c.t) + '</span><span class="cell-sub">' + c.kind + '</span>', esc(c.audience), esc(P(c.by).name), c.date || '<span class="text-low">Not set</span>', APP.statusBadge(c.status),
          rowMenu('c' + i, [['pencil', 'Edit', 'data-act="noop-toast" data-t="Opens the editor" data-k="info"'], ['pin', c.status === 'Pinned' ? 'Unpin' : 'Pin to top', 'data-act="content-status" data-i="' + D.CONTENT.indexOf(c) + '" data-s="' + (c.status === 'Pinned' ? 'Live' : 'Pinned') + '"'], ['calendar-clock', 'Reschedule', 'data-act="noop-toast" data-t="Pick a new date" data-k="info"'], ['circle-x', 'End now', 'data-act="content-status" data-i="' + D.CONTENT.indexOf(c) + '" data-s="Ended"', true]])];
      }), { empty: 'Nothing matches that status.' });
  }
  A['content-status'] = function (el) { var c = D.CONTENT[+el.getAttribute('data-i')]; c.status = el.getAttribute('data-s'); APP.rerender(); APP.toast('Updated', '"' + c.t + '" is now ' + c.status.toLowerCase() + '.'); };

  function banners() {
    var list = D.BANNERS.filter(function (b) { return APP.inScope(b.audience) || b.audience === 'Frontline' || b.audience === 'Office' ? (APP.isAdmin() || APP.scope().indexOf(b.audience) >= 0) : false; });
    return toolbar(null, '<span class="t-2 text-low">Banners rotate on Home in this order. Use the arrows to reorder.</span>', btn('New banner', 'btn-solid', 'plus', 'data-act="banner-new"')) + scopeNote() +
      '<div class="banner-admin">' + list.map(function (b, i) {
        var idx = D.BANNERS.indexOf(b);
        return '<section class="card banner-row"><div class="br-order">' + btn('', 'btn-ghost is-icon is-sm', 'chevron-up', 'aria-label="Move up" data-act="banner-move" data-i="' + idx + '" data-d="-1"' + (i === 0 ? ' disabled' : '')) + '<span class="t-1 text-low">' + (i + 1) + '</span>' + btn('', 'btn-ghost is-icon is-sm', 'chevron-down', 'aria-label="Move down" data-act="banner-move" data-i="' + idx + '" data-d="1"' + (i === list.length - 1 ? ' disabled' : '')) + '</div>' +
          '<div class="mini-hero"><span class="mh-eyebrow">' + esc(b.eyebrow) + '</span><span class="mh-title">' + esc(b.title) + '</span><span class="mh-cta">' + esc(b.cta) + '</span></div>' +
          '<div class="br-meta"><div class="data-list"><span class="dl-label">Audience</span><span class="dl-value">' + esc(b.audience) + '</span><span class="dl-label">Runs</span><span class="dl-value">' + b.start + ' to ' + b.end + '</span><span class="dl-label">Owner</span><span class="dl-value">' + esc(b.by) + '</span></div></div>' +
          '<div class="br-side">' + APP.statusBadge(b.status) + btn('Edit', 'btn-surface', 'pencil', 'data-act="banner-new" data-i="' + idx + '"', 'is-sm') + '</div></section>';
      }).join('') + '</div>';
  }
  A['banner-move'] = function (el) { var i = +el.getAttribute('data-i'), j = i + (+el.getAttribute('data-d')); if (j < 0 || j >= D.BANNERS.length) return; var t = D.BANNERS[i]; D.BANNERS[i] = D.BANNERS[j]; D.BANNERS[j] = t; APP.rerender(); };
  S.bn = {};
  A['banner-new'] = function (el) {
    var i = el.getAttribute('data-i'); var b = i != null ? D.BANNERS[+i] : { eyebrow: 'Maple Grove', title: '', msg: '', cta: 'Learn more', audience: APP.isCtrl() ? APP.scope()[0] : 'Everyone' };
    S.bn = { i: i, eyebrow: b.eyebrow, title: b.title, msg: b.msg, cta: b.cta }; S.f.bnAud = b.audience; S.f.bnStart = b.start || 'Sep 16'; S.f.bnEnd = b.end || 'Sep 30';
    APP.dialog({ title: i != null ? 'Edit banner' : 'New banner', size: 'is-wide', body: '<div id="bnBody">' + bnBody() + '</div>', footer: btn('Save as draft', 'btn-soft', null, 'data-act="banner-save" data-s="Draft"') + btn('Schedule banner', 'btn-solid', 'calendar-clock', 'data-act="banner-save" data-s="Scheduled"'), noFocus: true });
  };
  function bnBody() {
    var auds = APP.isAdmin() ? ['Everyone', 'Maple Grove', 'Riverside Commons', 'Cedar Hills', 'Corporate Office', 'Frontline', 'Office'] : [APP.scope()[0], APP.scope()[0] + ' frontline'];
    var dates = ['Sep 16', 'Sep 21', 'Oct 1', 'Oct 15', 'Oct 31'];
    return '<div class="ec-layout"><div class="stack-4">' +
      APP.field('Label', '<input class="input" value="' + esc(S.bn.eyebrow) + '" data-input="bn" data-k="eyebrow">') +
      APP.field('Headline', '<input class="input" value="' + esc(S.bn.title) + '" placeholder="Short and bold, under 60 characters" data-input="bn" data-k="title">', null, true) +
      APP.field('Message', '<textarea class="textarea" placeholder="One sentence" data-input="bn" data-k="msg">' + esc(S.bn.msg) + '</textarea>') +
      '<div class="form-grid">' + APP.field('Button label', '<input class="input" value="' + esc(S.bn.cta) + '" data-input="bn" data-k="cta">') + APP.field('Button link', '<input class="input" placeholder="https://">') + '</div>' +
      '<div class="upload-drop" data-act="noop-toast" data-t="Image added" data-k="info">' + ic('image-plus', 20) + '<span class="fw-medium">Banner image</span><span class="t-1 text-low">1600 x 600. Text stays readable on phones.</span></div>' +
      '<div class="form-grid">' + APP.field('Audience', APP.dd('bnAud', auds, S.f.bnAud, 'dd-block')) + '<div class="form-grid">' + APP.field('Start', APP.dd('bnStart', dates, S.f.bnStart, 'dd-block')) + APP.field('End', APP.dd('bnEnd', dates, S.f.bnEnd, 'dd-block')) + '</div></div></div>' +
      '<div class="ec-preview"><span class="t-1 text-low">Preview</span><div class="mini-hero is-large"><span class="mh-eyebrow">' + esc(S.bn.eyebrow || 'Label') + '</span><span class="mh-title">' + esc(S.bn.title || 'Your headline') + '</span><span class="mh-msg">' + esc(S.bn.msg || 'Your message') + '</span><span class="mh-cta">' + esc(S.bn.cta || 'Button') + '</span></div><span class="t-1 text-low">' + ic('smartphone', 12) + ' On phones the headline wraps and the button stays full size.</span></div></div>';
  }
  APP.INPUT.bn = function (el) { S.bn[el.getAttribute('data-k')] = el.value; var pv = document.querySelector('#bnBody .ec-preview'); if (pv) { var tmp = document.createElement('div'); tmp.innerHTML = bnBody(); pv.innerHTML = tmp.querySelector('.ec-preview').innerHTML; } };
  APP.DD = APP.DD || {};
  ['bnAud', 'bnStart', 'bnEnd'].forEach(function (k) { APP.DD[k] = function () { document.getElementById('bnBody').innerHTML = bnBody(); }; });
  A['banner-save'] = function (el) {
    if (!S.bn.title) { APP.toast('Add a headline', '', 'warning'); return; }
    var data = { id: 'b' + Date.now(), eyebrow: S.bn.eyebrow, title: S.bn.title, msg: S.bn.msg, cta: S.bn.cta, audience: S.f.bnAud, start: S.f.bnStart, end: S.f.bnEnd, status: el.getAttribute('data-s'), art: 'megaphone', by: APP.me().name };
    if (S.bn.i != null) Object.assign(D.BANNERS[+S.bn.i], data, { id: D.BANNERS[+S.bn.i].id }); else D.BANNERS.push(data);
    APP.closeOverlay(); APP.rerender(); APP.toast(data.status === 'Draft' ? 'Banner saved as draft' : 'Banner scheduled', 'Runs ' + data.start + ' to ' + data.end + ' for ' + data.audience + '.');
  };

  function polls() {
    var list = D.POLLS.filter(function (p) { return APP.inScope(p.loc); });
    return toolbar('Search polls', '', btn('New poll', 'btn-solid', 'plus', 'data-act="compose" data-type="Poll"')) + scopeNote() +
      table(['Question', 'Audience', { t: 'Votes', num: true }, 'Closes', 'Status', ''], list.map(function (p, i) {
        var idx = D.POLLS.indexOf(p);
        return ['<span class="cell-strong">' + esc(p.q) + '</span><span class="cell-sub">by ' + esc(P(p.by).name) + '</span>', esc(p.audience), p.votes, p.closes, APP.statusBadge(p.status),
          '<span class="row-gap">' + btn('Results', 'btn-surface', 'chart-column', 'data-act="poll-results" data-i="' + idx + '"', 'is-sm') + (p.status === 'Open' ? rowMenu('pl' + i, [['circle-x', 'Close poll now', 'data-act="poll-close" data-i="' + idx + '"', true], ['download', 'Export results', 'data-act="export" data-what="Poll results"']]) : '') + '</span>'];
      }));
  }
  A['poll-close'] = function (el) { var p = D.POLLS[+el.getAttribute('data-i')]; p.status = 'Closed'; p.closes = 'Sep 15'; APP.rerender(); APP.toast('Poll closed', 'Results are now visible to voters.'); };
  A['poll-results'] = function (el) {
    var p = D.POLLS[+el.getAttribute('data-i')], v = p.votes, split = [0.49, 0.37, 0.14];
    var opts = p.q.indexOf('town hall') >= 0 ? ['7:00 AM, before day shift', '3:30 PM, shift change', '7:00 PM, evening'] : ['Option A', 'Option B', 'Option C'];
    APP.dialog({ title: 'Poll results', sub: esc(p.q), body: v ? APP.bars(opts.map(function (o, i) { return [o, Math.round(v * split[i])]; }), function (x) { return x + ' votes'; }) + '<p class="t-1 text-low">' + v + ' votes · anonymous · ' + p.status.toLowerCase() + '</p>' : APP.emptyState('vote', 'No votes yet', 'Results appear as soon as people start voting.'),
      footer: btn('Export CSV', 'btn-surface', 'download', 'data-act="export" data-what="Poll results"') + btn('Done', 'btn-solid', null, 'data-act="close-overlay"') });
  };

  function videos() {
    return toolbar(null, '<span class="t-2 text-low">Shown in Featured videos on Home, in this order.</span>', btn('Add video', 'btn-solid', 'plus', 'data-act="video-add"')) +
      '<div class="stack-2">' + D.VIDEOS.map(function (v, i) {
        return '<section class="card video-row"><div class="br-order">' + btn('', 'btn-ghost is-icon is-sm', 'chevron-up', 'aria-label="Move up" data-act="video-move" data-i="' + i + '" data-d="-1"' + (i === 0 ? ' disabled' : '')) + btn('', 'btn-ghost is-icon is-sm', 'chevron-down', 'aria-label="Move down" data-act="video-move" data-i="' + i + '" data-d="1"' + (i === D.VIDEOS.length - 1 ? ' disabled' : '')) + '</div>' +
          '<span class="vid-thumb is-lg">' + ic('play', 18) + '<span class="vid-dur">' + v.dur + '</span></span><span class="pl-text"><span class="pl-name">' + esc(v.t) + '</span><span class="pl-sub">' + esc(P(v.by).name) + ' · ' + v.views + ' views</span></span><span class="toolbar-spacer"></span>' + btn('Remove', 'btn-ghost', 'x', 'data-act="video-remove" data-i="' + i + '"', 'is-sm') + '</section>';
      }).join('') + '</div>';
  }
  A['video-move'] = function (el) { var i = +el.getAttribute('data-i'), j = i + (+el.getAttribute('data-d')); var t = D.VIDEOS[i]; D.VIDEOS[i] = D.VIDEOS[j]; D.VIDEOS[j] = t; APP.rerender(); };
  A['video-remove'] = function (el) { var v = D.VIDEOS.splice(+el.getAttribute('data-i'), 1)[0]; APP.rerender(); APP.toast('Removed from Featured videos', v.t + ' is still in the feed.'); };
  S.vidSrc = 'upload';
  A['video-add'] = function () {
    APP.dialog({ title: 'Add a featured video', sub: 'Keep it short. Most staff watch on a break.', body: '<div id="vidBody">' + vidBody() + '</div>', footer: btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn('Add to Featured', 'btn-solid', 'plus', 'data-act="video-save"') });
  };
  function vidBody() {
    return '<div class="stack-4"><div class="segmented">' + [['upload', 'Upload'], ['link', 'Link from a video platform']].map(function (x) { return '<button class="segmented-item' + (S.vidSrc === x[0] ? ' is-active' : '') + '" data-act="vid-src" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' +
      (S.vidSrc === 'upload' ? '<div class="upload-drop" data-act="noop-toast" data-t="Video selected" data-k="info">' + ic('upload', 22) + '<span class="fw-medium">Drop an MP4 here</span><span class="t-1 text-low">Up to 3 minutes and 200 MB</span></div>' : APP.field('Video link', '<input class="input" placeholder="Paste a link to the video">', 'The approach for links is still to be confirmed with the customer.')) +
      APP.field('Title', '<input class="input" id="vidTitle" placeholder="What is it about?">', null, true) + '</div>';
  }
  A['vid-src'] = function (el) { S.vidSrc = el.getAttribute('data-v'); document.getElementById('vidBody').innerHTML = vidBody(); };
  A['video-save'] = function () { var t = document.getElementById('vidTitle').value.trim(); if (!t) { APP.toast('Add a title', '', 'warning'); return; } D.VIDEOS.unshift({ t: t, dur: '1:15', by: APP.me().id, views: 0 }); APP.closeOverlay(); APP.rerender(); APP.toast('Added to Featured videos', 'It shows first on Home.'); };

  function moderation() {
    var list = D.REPORTS.filter(function (r) { return APP.inScope(r.loc) && !r.done; });
    if (!list.length) return '<section class="card">' + APP.emptyState('shield-check', 'No reports to review', 'When someone reports a post or comment in your scope, it shows up here.') + '</section>';
    return scopeNote() + '<div class="stack-4">' + list.map(function (r) {
      var i = D.REPORTS.indexOf(r), p = r.post ? APP.findPost(r.post) : null;
      return '<section class="card report-card"><div class="rp-head">' + badge('Reported', 'is-danger', 'flag') + '<span class="t-2"><b>' + esc(r.reason) + '</b></span><span class="t-1 text-low">' + r.by + ' · ' + r.when + ' ago · ' + esc(r.loc) + '</span></div>' +
        '<div class="rp-preview">' + (p ? '<div class="rc-from">' + av(P(p.author), 24) + '<b>' + esc(P(p.author).name) + '</b><span class="t-1 text-low">' + p.type + ' · ' + p.time + '</span></div><p>' + esc(p.text) + '</p>' + (p.photos ? '<span class="tag">' + ic('image', 12) + p.photos + ' photos</span>' : '') : '<p class="text-low">' + esc(r.text) + '</p><p>"This is a joke. Whoever signed off the contractor should be fired."</p>') + '</div>' +
        '<div class="row-gap">' + btn('Keep it', 'btn-surface', 'check', 'data-act="mod" data-i="' + i + '" data-d="kept"') + btn('Hide', 'btn-soft', 'eye-off', 'data-act="mod" data-i="' + i + '" data-d="hidden"') + btn('Remove', 'btn-soft is-danger', 'ban', 'data-act="mod" data-i="' + i + '" data-d="removed"') + (p ? '<a class="link t-1" href="#/home/post/' + p.id + '">Open in feed</a>' : '') + '</div></section>';
    }).join('') + '</div>';
  }
  A.mod = function (el) {
    var r = D.REPORTS[+el.getAttribute('data-i')], d = el.getAttribute('data-d'); r.done = true;
    if (r.post) { var p = APP.findPost(r.post); if (d === 'hidden') p.hidden = true; if (d === 'removed') p.removed = true; }
    APP.rerender(); APP.toast(d === 'kept' ? 'Report dismissed' : d === 'hidden' ? 'Post hidden' : 'Post removed', d === 'kept' ? 'The post stays up.' : 'The author has been notified.');
  };

  APP.VIEWS.manage = function (r) {
    var sec = r[1];
    if (sec === 'surveys') return surveysView(r);
    if (sec === 'acks') return acksView();
    var tab = r[2] || 'posts', open = D.REPORTS.filter(function (x) { return APP.inScope(x.loc) && !x.done; }).length;
    var items = [['posts', 'Announcements & spotlights', '#/manage/content'], ['banners', 'Banners', '#/manage/content/banners'], ['polls', 'Polls', '#/manage/content/polls']];
    if (APP.isAdmin()) items.push(['videos', 'Featured videos', '#/manage/content/videos']);
    items.push(['moderation', 'Moderation', '#/manage/content/moderation', open]);
    return APP.page({ crumbs: crumbsFor(sectionName(), 'Content', 'Content', '#/manage/content'), title: 'Content', desc: APP.isCtrl() ? 'Publish announcements, spotlights, banners and polls for ' + esc(APP.scope()[0]) + ', and review reported posts.' : 'Publish and schedule everything that appears on Home and in the feed, and review reported content.', tabs: APP.tabs(items, tab), body: contentTab(tab) });
  };

  /* ======================= SURVEYS ======================= */
  function surveysView(r) {
    var sub = r[2];
    if (sub === 'new' && APP.isAdmin()) return builder();
    if (sub && sub !== 'new') return results(sub);
    var list = D.SURVEYS.filter(function (s) { return APP.isAdmin() || s.status !== 'Draft'; });
    var body = table(['Survey', 'Audience', 'Type', 'Window', { t: 'Response rate', num: true }, 'Status', ''], list.map(function (s) {
      var rate = s.invited ? Math.round(s.responses / s.invited * 100) + '%' : '<span class="text-low">n/a</span>';
      return { attrs: s.status !== 'Draft' ? 'class="is-clickable" data-act="go" data-href="#/manage/surveys/' + s.id + '"' : '', cells: ['<span class="cell-strong">' + esc(s.title) + '</span><span class="cell-sub">' + s.recur + '</span>', esc(s.audience), s.anon ? badge('Anonymous', 'is-neutral', 'shield-check') : badge('Attributed', 'is-neutral'), s.opens + ' to ' + s.closes, rate, APP.statusBadge(s.status),
        s.status === 'Draft' ? btn('Edit', 'btn-surface', 'pencil', 'data-act="go" data-href="#/manage/surveys/new"', 'is-sm') : btn('Results', 'btn-surface', 'chart-column', 'data-act="go" data-href="#/manage/surveys/' + s.id + '"', 'is-sm')] };
    }));
    return APP.page({ crumbs: crumbsFor(sectionName(), 'Surveys', APP.isAdmin() ? 'Surveys' : 'Survey results', '#/manage/surveys'), title: APP.isAdmin() ? 'Surveys' : 'Survey results',
      desc: APP.isAdmin() ? 'Build pulse surveys, choose who gets them and read the results. Survey results are the only reporting in skyEmployee.' : 'Results for ' + esc(APP.scope()[0]) + '. Anonymous results only show once enough people have answered.',
      action: APP.isAdmin() ? btn('New survey', 'btn-solid', 'plus', 'data-act="go" data-href="#/manage/surveys/new"') : '', body: scopeNote() + body });
  }
  APP.DD.svGroup = function () { APP.rerender(); };
  function results(id) {
    var s = D.SURVEYS.filter(function (x) { return x.id === id; })[0] || D.SURVEYS[0];
    var groups = APP.isAdmin() ? ['All respondents', 'Maple Grove', 'Riverside Commons', 'Cedar Hills', 'Maple Grove dining team'] : ['Maple Grove', 'Maple Grove nursing team', 'Maple Grove dining team'];
    var g = S.f.svGroup && groups.indexOf(S.f.svGroup) >= 0 ? S.f.svGroup : groups[0];
    var n = { 'All respondents': s.responses, 'Maple Grove': 96, 'Riverside Commons': 88, 'Cedar Hills': 71, 'Maple Grove nursing team': 41, 'Maple Grove dining team': 3 }[g];
    var withheld = s.anon && n < 5;
    var head = '<div class="table-toolbar">' + APP.dd('svGroup', groups, g) + '<span class="t-1 text-low">' + ic('users', 12) + ' ' + n + ' responses in this group</span><span class="toolbar-spacer"></span>' +
      (APP.isAdmin() ? btn('Export CSV', 'btn-surface', 'download', 'data-act="export" data-what="Survey results"' + (withheld ? ' disabled' : '')) + (s.status === 'Open' ? btn('Close survey', 'btn-soft is-danger', 'circle-x', 'data-act="survey-close" data-id="' + s.id + '"') : '') : '') + '</div>';
    var kpis = '<div class="kpi-row"><section class="card stat-card"><div class="sc-head"><span class="sc-label">Response rate</span><span class="sc-icon">' + ic('percent', 18) + '</span></div><div class="sc-value">' + Math.round(s.responses / (s.invited || 1) * 100) + '%</div><div class="t-1 text-low">' + s.responses + ' of ' + s.invited + ' invited</div></section>' +
      '<section class="card stat-card"><div class="sc-head"><span class="sc-label">Average month rating</span><span class="sc-icon">' + ic('star', 18) + '</span></div><div class="sc-value">' + (withheld ? '<span class="text-low">Hidden</span>' : '3.8 / 5') + '</div><div class="sc-delta is-up">' + ic('trending-up', 14) + ' 0.2 on August</div></section>' +
      '<section class="card stat-card"><div class="sc-head"><span class="sc-label">Would recommend</span><span class="sc-icon">' + ic('thumbs-up', 18) + '</span></div><div class="sc-value">' + (withheld ? '<span class="text-low">Hidden</span>' : '+18') + '</div><div class="t-1 text-low">Net score, 0 to 10 scale</div></section>' +
      '<section class="card stat-card"><div class="sc-head"><span class="sc-label">Privacy</span><span class="sc-icon">' + ic('shield-check', 18) + '</span></div><div class="sc-value t-6">' + (s.anon ? 'Anonymous' : 'Attributed') + '</div><div class="t-1 text-low">' + (s.anon ? 'Minimum 5 responses per group' : 'Follow-up allowed') + '</div></section></div>';
    var body;
    if (withheld) body = APP.callout('<b>Results withheld for this group.</b> Only ' + n + ' people answered, and anonymous results need at least 5 so nobody can be identified. Pick a larger group to see results.', 'is-warning', 'eye-off');
    else body = '<div class="split-even"><section class="card">' + APP.panelHead('How would you rate your month at work?', 'Rating scale, 1 to 5 · ' + n + ' answers') + APP.bars([['5 Excellent', 29], ['4 Good', 38], ['3 Okay', 19], ['2 Poor', 9], ['1 Very poor', 5]], function (v) { return v + '%'; }) + '</section>' +
      '<section class="card">' + APP.panelHead('Average rating across recurrences', 'Monthly pulse, same question') + trend() + '</section>' +
      '<section class="card">' + APP.panelHead('Which of these made your job harder?', 'Multiple choice · share of respondents') + APP.bars([['Short staffing', 58], ['Communication', 31], ['Scheduling', 27], ['Equipment', 14], ['None of these', 17]], function (v) { return v + '%'; }) + '</section>' +
      '<section class="card">' + APP.panelHead('Do you have what you need to do your job well?', 'Yes or no') + APP.bars([['Yes', 71], ['No', 29]], function (v) { return v + '%'; }) + '</section></div>' +
      '<section class="card">' + APP.panelHead('Comments', '63 free-text answers, shown as written' + (s.anon ? ' without names' : ''), btn('Show all', 'btn-ghost', null, 'data-act="noop-toast" data-t="Showing all 63 comments" data-k="info"', 'is-sm')) + '<div class="comment-list">' +
      ['More weekend staff would change everything.', 'My supervisor has been great about swaps this month.', 'The new lift in West Wing makes transfers much safer. Thank you.', 'Please post the schedule earlier. Two days notice is hard with kids.'].map(function (c) { return '<blockquote class="blockquote">' + esc(c) + '</blockquote>'; }).join('') + '</div>' +
      (s.anon ? '<p class="t-1 text-low">' + ic('lock', 12) + ' Anonymous comments cannot be followed up individually.</p>' : '') + '</section>';
    return APP.page({ crumbs: [['Home', '#/home'], [sectionName(), '#/manage/surveys'], [APP.isAdmin() ? 'Surveys' : 'Survey results', '#/manage/surveys'], [s.title]], title: esc(s.title), desc: s.recur + ' · ' + esc(s.audience) + ' · ' + s.opens + ' to ' + s.closes + ' · ' + s.status, body: head + kpis + body });
  }
  function trend() {
    var vals = [['May', 3.4], ['Jun', 3.5], ['Jul', 3.3], ['Aug', 3.6], ['Sep', 3.8]];
    return '<div class="vbars" role="img" aria-label="Average rating by month: ' + vals.map(function (v) { return v[0] + ' ' + v[1]; }).join(', ') + '">' + vals.map(function (v, i) {
      return '<div class="vbar" title="' + v[0] + ': ' + v[1] + ' of 5"><span class="vbar-val">' + v[1] + '</span><span class="vbar-track"><span class="vbar-fill' + (i === vals.length - 1 ? ' is-current' : '') + '" style="height:' + (v[1] / 5 * 100) + '%"></span></span><span class="vbar-label">' + v[0] + '</span></div>';
    }).join('') + '</div>';
  }
  A['survey-close'] = function (el) { var s = D.SURVEYS.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; s.status = 'Closed'; APP.rerender(); APP.toast('Survey closed', 'Reminders stop and results are final.'); };

  S.sb = { anon: true, qs: [{ q: 'How would you rate your month at work?', type: 'Rating scale', req: true }, { q: 'Do you feel you have what you need?', type: 'Yes or no', req: false }, { q: 'Anything else you would like us to know?', type: 'Free text', req: false }] };
  function builder() {
    var types = ['Single choice', 'Multiple choice', 'Rating scale', 'Yes or no', 'Free text'];
    var qs = S.sb.qs.map(function (q, i) {
      S.f['qt' + i] = S.f['qt' + i] || q.type; q.type = S.f['qt' + i];
      return '<section class="card q-card"><div class="q-head"><span class="q-num">' + (i + 1) + '</span><input class="input" value="' + esc(q.q) + '" data-input="sb-q" data-i="' + i + '" aria-label="Question ' + (i + 1) + '">' + APP.dd('qt' + i, types, q.type) + '</div>' +
        (q.type === 'Single choice' || q.type === 'Multiple choice' ? '<div class="q-opts">' + ['Option 1', 'Option 2'].map(function (o) { return '<div class="poll-edit"><span class="' + (q.type === 'Single choice' ? 'poll-radio' : 'q-box') + '"></span><input class="input" placeholder="' + o + '"></div>'; }).join('') + btn('Add option', 'btn-ghost', 'plus', 'data-act="noop-toast" data-t="Option added" data-k="info"', 'is-sm') + '</div>' : q.type === 'Rating scale' ? '<div class="scale is-preview">' + [1, 2, 3, 4, 5].map(function (v) { return '<span class="toggle scale-btn">' + v + '</span>'; }).join('') + '</div>' : q.type === 'Yes or no' ? '<div class="row-gap"><span class="tag">Yes</span><span class="tag">No</span></div>' : '<div class="q-text-preview">Long answer text</div>') +
        '<div class="q-foot"><label class="switch"><input type="checkbox" ' + (q.req ? 'checked' : '') + ' data-change="sb-req" data-i="' + i + '"><span class="t-2">Required</span></label><span class="toolbar-spacer"></span>' + btn('', 'btn-ghost is-icon is-sm', 'chevron-up', 'aria-label="Move up" data-act="sb-move" data-i="' + i + '" data-d="-1"' + (i === 0 ? ' disabled' : '')) + btn('', 'btn-ghost is-icon is-sm', 'chevron-down', 'aria-label="Move down" data-act="sb-move" data-i="' + i + '" data-d="1"' + (i === S.sb.qs.length - 1 ? ' disabled' : '')) + btn('', 'btn-ghost is-icon is-sm', 'trash-2', 'aria-label="Delete question" data-act="sb-del" data-i="' + i + '"') + '</div></section>';
    }).join('');
    var body = '<div class="split-2"><div class="stack-4"><section class="card">' + APP.field('Survey title', '<input class="input" value="Dining experience feedback">', null, true) + APP.field('Intro shown to staff', '<textarea class="textarea">A few quick questions about meals and breaks at your community.</textarea>') + '</section>' + qs +
      btn('Add question', 'btn-surface', 'plus', 'data-act="sb-add"') + '</div>' +
      '<aside class="stack-4"><section class="card">' + APP.panelHead('Privacy', 'Fixed once the survey opens.') + '<div class="radio-cards is-stack">' +
      '<button class="radio-card' + (S.sb.anon ? ' is-selected' : '') + '" data-act="sb-anon" data-v="1"><div class="rc-title">' + ic('shield-check', 14) + ' Anonymous</div><div class="rc-sub">No link to the employee. Results need 5 or more per group.</div></button>' +
      '<button class="radio-card' + (!S.sb.anon ? ' is-selected' : '') + '" data-act="sb-anon" data-v="0"><div class="rc-title">' + ic('user', 14) + ' Attributed</div><div class="rc-sub">Names are kept so a manager can follow up on concerns.</div></button></div></section>' +
      '<section class="card stack-4">' + APP.panelHead('Audience and schedule') + APP.field('Send to', APP.dd('sbAud', ['Everyone', 'Maple Grove', 'Riverside Commons', 'Cedar Hills', 'Frontline', 'Office', 'Tenure: first 90 days', 'Dining teams'], S.f.sbAud || 'Dining teams', 'dd-block')) +
      APP.field('Repeats', APP.dd('sbRec', ['One-off', 'Monthly', 'Quarterly'], S.f.sbRec || 'Quarterly', 'dd-block')) + '<div class="form-grid">' + APP.field('Opens', APP.dd('sbOpen', ['Oct 1', 'Oct 8', 'Nov 1'], S.f.sbOpen || 'Oct 1', 'dd-block')) + APP.field('Closes', APP.dd('sbClose', ['Oct 14', 'Oct 21', 'Nov 14'], S.f.sbClose || 'Oct 14', 'dd-block')) + '</div>' +
      APP.field('Minimum responses to show results', '<input class="input" value="5" inputmode="numeric">', 'Default 5. Lower numbers risk identifying people.') + '<p class="t-1 text-low">' + ic('clock', 12) + ' Estimated time for staff: about ' + Math.max(1, Math.round(S.sb.qs.length * 0.6)) + ' min</p></section></aside></div>';
    return APP.page({ crumbs: [['Home', '#/home'], ['Administration', '#/manage/surveys'], ['Surveys', '#/manage/surveys'], ['New survey']], title: 'New survey', desc: 'Short, mobile-friendly and clear about privacy before anyone answers.',
      action: btn('Save draft', 'btn-soft', null, 'data-act="noop-toast" data-t="Draft saved"') + btn('Schedule survey', 'btn-solid', 'calendar-clock', 'data-act="sb-schedule"'), body: body });
  }
  APP.INPUT['sb-q'] = function (el) { S.sb.qs[+el.getAttribute('data-i')].q = el.value; };
  APP.INPUT['sb-req'] = function (el) { S.sb.qs[+el.getAttribute('data-i')].req = el.checked; };
  A['sb-add'] = function () { S.sb.qs.push({ q: '', type: 'Single choice', req: false }); S.f['qt' + (S.sb.qs.length - 1)] = 'Single choice'; APP.rerender(); };
  A['sb-del'] = function (el) { var i = +el.getAttribute('data-i'); S.sb.qs.splice(i, 1); for (var k = i; k < S.sb.qs.length + 1; k++) S.f['qt' + k] = S.sb.qs[k] ? S.sb.qs[k].type : undefined; APP.rerender(); };
  A['sb-move'] = function (el) { var i = +el.getAttribute('data-i'), j = i + (+el.getAttribute('data-d')), q = S.sb.qs; var t = q[i]; q[i] = q[j]; q[j] = t; S.f['qt' + i] = q[i].type; S.f['qt' + j] = q[j].type; APP.rerender(); };
  A['sb-anon'] = function (el) { S.sb.anon = el.getAttribute('data-v') === '1'; APP.rerender(); };
  A['sb-schedule'] = function () { var s = D.SURVEYS[3]; s.status = 'Scheduled'; s.anon = S.sb.anon; APP.go('#/manage/surveys'); APP.toast('Survey scheduled', 'Opens ' + (S.f.sbOpen || 'Oct 1') + ' for ' + (S.f.sbAud || 'Dining teams') + '. It will appear on Home and in Due items.'); };
  APP.DD.qt0 = APP.DD.qt1 = APP.DD.qt2 = APP.DD.qt3 = APP.DD.qt4 = APP.DD.qt5 = function () { APP.rerender(); };

  /* ======================= ACKNOWLEDGEMENTS ======================= */
  function acksTable() {
    var list = D.RESOURCES.filter(function (r) { return r.ack; });
    return table(['Policy', 'Owner', 'Due', 'Acknowledged', ''], list.map(function (r) {
      var rate = APP.isCtrl() ? Math.min(100, r.ackRate + 9) : r.ackRate;
      return { attrs: 'class="is-clickable" data-act="ack-detail" data-id="' + r.id + '"', cells: ['<span class="cell-strong">' + esc(r.t) + '</span><span class="cell-sub">' + (APP.isCtrl() ? esc(APP.scope()[0]) + ' staff' : 'Everyone') + '</span>', esc(P(r.owner).name), r.ackDue, '<div class="ack-meter"><div class="progress"><div class="progress-fill" style="width:' + rate + '%"></div></div><span class="t-1">' + rate + '%</span></div>', btn('Details', 'btn-surface', null, 'data-act="ack-detail" data-id="' + r.id + '"', 'is-sm')] };
    }));
  }
  APP.acksTable = acksTable;
  A['ack-detail'] = function (el) {
    var r = D.RESOURCES.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0];
    var ppl = D.PEOPLE.filter(function (p) { return p.loc === 'Maple Grove'; });
    var done = ppl.filter(function (p, i) { return i % 3 !== 1; }), notYet = ppl.filter(function (p, i) { return i % 3 === 1; });
    if (r.acked) { var me = APP.me(); if (notYet.indexOf(me) >= 0) { notYet.splice(notYet.indexOf(me), 1); done.push(me); } }
    APP.drawer({ title: esc(r.t), body: '<p class="text-low">Due ' + r.ackDue + ' · showing Maple Grove</p><div class="summary-strip"><div><div class="ss-label">Acknowledged</div><div class="ss-value">' + done.length + '</div></div><div><div class="ss-label">Not yet</div><div class="ss-value">' + notYet.length + '</div></div></div>' +
      '<h3 class="section-label">Not yet acknowledged</h3><div class="plist">' + notYet.map(function (p) { return '<div class="plist-row">' + APP.personLine(p, esc(p.title)) + badge('Not yet', 'is-warning') + '</div>'; }).join('') + '</div>' +
      '<h3 class="section-label">Acknowledged</h3><div class="plist">' + done.map(function (p, i) { return '<div class="plist-row">' + APP.personLine(p, esc(p.title)) + '<span class="t-1 text-low">Sep ' + (9 + i) + '</span></div>'; }).join('') + '</div>',
      footer: btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="Acknowledgement status"') + '<span class="toolbar-spacer"></span>' + btn('Remind ' + notYet.length + ' people', 'btn-solid', 'bell-ring', 'data-act="noop-toast" data-t="Reminders sent" data-b="' + notYet.length + ' people will get a notification."') });
  };
  function acksView() {
    return APP.page({ crumbs: crumbsFor('Manage', 'Acknowledgements', 'Acknowledgements', '#/manage/acks'), title: 'Acknowledgements', desc: 'See who has and has not read the policies that need acknowledgement at ' + esc(APP.scope()[0]) + '.', body: scopeNote() + acksTable() });
  }

  /* ======================= USERS & ORGANISATION ======================= */
  APP.VIEWS.admin = function (r) {
    var fn = { users: usersView, giftcards: giftView, recognition: recogView, resources: resAdminView, settings: settingsView }[r[1]];
    return fn ? fn(r[2]) : usersView();
  };
  function usersView(tab) {
    tab = tab || 'users';
    var items = [['users', 'Users', '#/admin/users', D.PEOPLE.length], ['org', 'Locations & teams', '#/admin/users/org']], body;
    if (tab === 'users') {
      var role = S.f.uRole || 'All roles', type = S.f.uType || 'All types';
      var list = D.PEOPLE.filter(function (p) { return (role === 'All roles' || p.role === role) && (type === 'All types' || p.type === type); });
      body = toolbar('Search users', APP.dd('uRole', ['All roles', 'Admin', 'Controller', 'Employee'], role) + APP.dd('uType', ['All types', 'Office', 'Frontline'], type), btn('Sync from HR system', 'btn-surface', 'refresh-cw', 'data-act="noop-toast" data-t="Sync started" data-b="Employees, titles and locations refresh from the HR system." data-k="info"')) +
        '<p class="t-1 text-low scope-note">' + ic('info', 12) + ' People, titles and locations come from the HR system. Role and employee type are set here.</p>' +
        table(['Name', 'Role', 'Employee type', 'Location', 'Status', ''], list.map(function (p) {
          return { attrs: 'class="is-clickable" data-act="user-edit" data-id="' + p.id + '"', cells: ['<span class="cell-person">' + av(p) + '<span><span class="cell-strong">' + esc(p.name) + '</span><span class="cell-sub">' + esc(p.title) + '</span></span></span>', p.role === 'Employee' ? badge('Employee', 'is-neutral') : badge(p.role === 'Controller' ? 'Controller' : 'Admin', p.role === 'Admin' ? 'is-info' : ''), esc(p.type), esc(p.loc), APP.statusBadge(p.active ? 'Active' : 'Deactivated'), btn('Edit', 'btn-surface', null, 'data-act="user-edit" data-id="' + p.id + '"', 'is-sm')] };
        })) + '<div class="pagination"><span class="page-info">1 to ' + list.length + ' of ' + list.length + ' shown · 980 total</span><span class="page-spacer"></span>' + btn('', 'btn-surface is-icon is-sm', 'chevron-left', 'aria-label="Previous page" disabled') + btn('', 'btn-surface is-icon is-sm', 'chevron-right', 'aria-label="Next page" data-act="noop-toast" data-t="Page 2" data-k="info"') + '</div>';
    } else {
      body = '<div class="card-grid">' + D.COMMUNITIES.map(function (c) {
        var ctrls = D.PEOPLE.filter(function (p) { return p.role === 'Controller' && p.loc === c; }), staff = D.PEOPLE.filter(function (p) { return p.loc === c; }).length;
        var teams = c === 'Corporate Office' ? ['HR', 'Payroll', 'Scheduling', 'Communications'] : ['Nursing', 'Dining', 'Housekeeping', 'Maintenance', 'Activities'];
        return '<section class="card">' + APP.panelHead(esc(c), (c === 'Corporate Office' ? 'Office' : 'Community') + ' · ' + (staff * 12) + ' employees', rowMenu('loc' + c.length, [['pencil', 'Rename', 'data-act="noop-toast" data-t="Rename location" data-k="info"'], ['plus', 'Add team', 'data-act="noop-toast" data-t="Team added" data-k="info"']])) +
          '<h3 class="section-label">Teams</h3><div class="row-gap wrap">' + teams.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div>' +
          '<h3 class="section-label">Controllers</h3>' + (ctrls.length ? '<div class="plist">' + ctrls.map(function (p) { return '<div class="plist-row">' + APP.personLine(p, esc(p.title) + ' · ' + (p.id === 'ana' ? 'Nursing team' : 'Whole location')) + '</div>'; }).join('') + '</div>' : '<p class="t-2 text-low">No controller assigned.</p>') +
          btn('Assign controller', 'btn-soft', 'user-plus', 'data-act="assign-ctrl" data-loc="' + esc(c) + '"', 'is-sm') + '</section>';
      }).join('') + '</div>';
    }
    return APP.page({ crumbs: crumbsFor('Administration', 'Users & organisation', tab === 'users' ? 'Users' : 'Locations & teams', '#/admin/users'), title: 'Users & organisation', desc: 'Assign roles and employee types, and choose which locations and teams each Controller manages.', action: tab === 'org' ? btn('Add location', 'btn-solid', 'plus', 'data-act="noop-toast" data-t="New location" data-k="info"') : '', tabs: APP.tabs(items, tab), body: body });
  }
  S.ue = {};
  A['user-edit'] = function (el) {
    var p = P(el.getAttribute('data-id')); S.ue = { id: p.id, role: p.role, type: p.type }; S.f.ueScope = p.role === 'Controller' ? p.loc : 'Maple Grove';
    APP.drawer({ title: 'Edit user', body: '<div id="ueBody">' + ueBody() + '</div>', footer: (p.active ? btn('Deactivate', 'btn-soft is-danger', 'user-x', 'data-act="user-deact" data-id="' + p.id + '"') : btn('Reactivate', 'btn-soft', 'rotate-ccw', 'data-act="user-react" data-id="' + p.id + '"')) + '<span class="toolbar-spacer"></span>' + btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + btn('Save', 'btn-solid', null, 'data-act="user-save"') });
  };
  function ueBody() {
    var p = P(S.ue.id);
    return '<div class="profile-top">' + av(p, 56) + '<div><div class="t-4 fw-bold">' + esc(p.name) + '</div><div class="text-low">' + esc(p.title) + ' · ' + esc(p.loc) + '</div></div></div>' +
      '<div class="field"><span class="field-label">Role</span><div class="radio-cards is-stack">' + [['Employee', 'Their own Home, feed, rewards, directory, pay and resources.'], ['Controller', 'Everything an employee has, plus publishing, moderation, awards and survey results for their scope.'], ['Admin', 'Full access to every setting, the gift card catalogue and exports.']].map(function (r) {
        return '<button class="radio-card' + (S.ue.role === r[0] ? ' is-selected' : '') + '" data-act="ue-set" data-k="role" data-v="' + r[0] + '"><div class="rc-title">' + r[0] + '</div><div class="rc-sub">' + r[1] + '</div></button>'; }).join('') + '</div></div>' +
      (S.ue.role === 'Controller' ? APP.field('Manages', APP.dd('ueScope', ['Maple Grove', 'Riverside Commons', 'Cedar Hills', 'Maple Grove nursing team', 'Maple Grove dining team'], S.f.ueScope, 'dd-block'), 'Controllers only see content, awards and results for these locations or teams.') : '') +
      '<div class="field"><span class="field-label">Employee type</span><div class="segmented">' + ['Office', 'Frontline'].map(function (t) { return '<button class="segmented-item' + (S.ue.type === t ? ' is-active' : '') + '" data-act="ue-set" data-k="type" data-v="' + t + '">' + t + '</button>'; }).join('') + '</div><span class="field-hint">Not a permission. Decides which apps show in My Apps and who content targets.</span></div>';
  }
  A['ue-set'] = function (el) { S.ue[el.getAttribute('data-k')] = el.getAttribute('data-v'); document.getElementById('ueBody').innerHTML = ueBody(); };
  APP.DD.ueScope = function () { document.getElementById('ueBody').innerHTML = ueBody(); };
  A['user-save'] = function () { var p = P(S.ue.id); p.role = S.ue.role; p.type = S.ue.type; APP.closeAll(); APP.rerender(); APP.toast('User updated', p.name + ' is now ' + p.role + ', ' + p.type + '.'); };
  A['user-deact'] = function (el) { APP.alert('Deactivate ' + esc(P(el.getAttribute('data-id')).name) + '?', 'They lose access immediately and are signed out everywhere. Their posts stay in the feed. Unrevealed gift cards can be cancelled from Gift cards.', 'Deactivate', 'do-deact', 'data-id="' + el.getAttribute('data-id') + '"'); };
  A['do-deact'] = function (el) { P(el.getAttribute('data-id')).active = false; APP.closeAll(); APP.rerender(); APP.toast('User deactivated', 'Access removed immediately.'); };
  A['user-react'] = function (el) { P(el.getAttribute('data-id')).active = true; APP.closeAll(); APP.rerender(); APP.toast('User reactivated'); };
  A['assign-ctrl'] = function (el) {
    S.pick.ctrl = [];
    APP.dialog({ title: 'Assign a controller', sub: 'For ' + esc(el.getAttribute('data-loc')), body: APP.picker('ctrl', 'Person', false) + APP.field('Scope', APP.dd('ctrlScope', ['Whole location', 'Nursing team', 'Dining team', 'Housekeeping team'], S.f.ctrlScope || 'Whole location', 'dd-block')), footer: btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn('Assign', 'btn-solid', null, 'data-act="do-assign"') });
  };
  APP.DD.ctrlScope = function (v, el) { var b = el.closest ? null : null; var t = document.querySelector('[data-pop="dd-ctrlScope"] .dd-value'); if (t) t.textContent = v; };
  A['do-assign'] = function () { if (!(S.pick.ctrl || []).length) { APP.toast('Pick a person', '', 'warning'); return; } var p = P(S.pick.ctrl[0]); p.role = 'Controller'; APP.closeOverlay(); APP.rerender(); APP.toast('Controller assigned', p.name + ' now manages ' + (S.f.ctrlScope || 'the whole location').toLowerCase() + '.'); };

  /* ======================= GIFT CARDS ======================= */
  function giftView(tab) {
    tab = tab || 'catalogue';
    var low = D.REWARD_TYPES.filter(function (r) { return r.status === 'Active' && r.avail < r.low; }).length;
    var pend = D.AWARDS.filter(function (a) { return a.status === 'Pending approval'; }).length;
    var items = [['catalogue', 'Catalogue', '#/admin/giftcards', low ? low + ' low' : null], ['stock', 'Codes', '#/admin/giftcards/stock'], ['awards', 'Awards', '#/admin/giftcards/awards', pend || null], ['budgets', 'Budgets & limits', '#/admin/giftcards/budgets'], ['fulfilment', 'Fulfilment', '#/admin/giftcards/fulfilment'], ['audit', 'Audit trail', '#/admin/giftcards/audit'], ['reports', 'Reports', '#/admin/giftcards/reports']];
    var body = { catalogue: catalogue, stock: stock, awards: awardsAdmin, budgets: budgets, fulfilment: function () { return APP.fulfilTable(false); }, audit: audit, reports: reports }[tab]();
    var action = tab === 'catalogue' ? btn('New reward type', 'btn-solid', 'plus', 'data-act="rt-new"') : tab === 'stock' ? btn('Add codes', 'btn-solid', 'upload', 'data-act="codes-add"') : tab === 'awards' ? btn('Award a gift card', 'btn-solid', 'gift', 'data-act="award-card"') : tab === 'reports' || tab === 'audit' ? btn('Export CSV', 'btn-solid', 'download', 'data-act="export" data-what="' + (tab === 'audit' ? 'Audit trail' : 'Awards, stock and budget spend') + '"') : '';
    return APP.page({ crumbs: crumbsFor('Administration', 'Gift cards', items.filter(function (i) { return i[0] === tab; })[0][1], '#/admin/giftcards'), title: 'Gift cards', desc: 'Cards are bought outside skyEmployee and entered here. Codes are encrypted and nobody but the recipient can ever see one.', action: action, tabs: APP.tabs(items, tab), body: body });
  }
  function catalogue() {
    var held = D.REWARD_TYPES.filter(function (r) { return r.status === 'Active'; }).reduce(function (s, r) { return s + r.avail * r.value; }, 0);
    var lows = D.REWARD_TYPES.filter(function (r) { return r.status === 'Active' && r.avail < r.low; });
    return (lows.length ? APP.callout('<b>' + lows.length + ' reward types are below their stock warning.</b> ' + lows.map(function (r) { return esc(r.name) + ' (' + r.avail + ' left)'; }).join(', ') + '. Buy more cards before they run out.', 'is-warning', 'triangle-alert') : '') +
      '<div class="summary-strip"><div><div class="ss-label">Value held, not yet awarded</div><div class="ss-value">' + money(held) + '</div></div><div><div class="ss-label">Codes available</div><div class="ss-value">' + D.REWARD_TYPES.reduce(function (s, r) { return s + (r.status === 'Active' ? r.avail : 0); }, 0) + '</div></div><div><div class="ss-label">Active reward types</div><div class="ss-value">' + D.REWARD_TYPES.filter(function (r) { return r.status === 'Active'; }).length + '</div></div></div>' +
      '<div class="rt-grid">' + D.REWARD_TYPES.map(function (r) {
        var st = r.status === 'Retired' ? 'Retired' : r.avail === 0 ? 'Out of stock' : r.avail < r.low ? 'Low stock' : 'Active';
        return '<section class="card rt-card' + (r.status === 'Retired' ? ' is-retired' : '') + '">' + '<div class="rt-card-top">' + APP.giftTile(r, true) + APP.statusBadge(st) + '</div><div class="t-4 fw-bold">' + esc(r.name) + '</div><div class="t-1 text-low">' + esc(r.kind) + ' · ' + (r.fulfil === 'task' ? 'Fulfilment task' : 'Delivers a code') + '</div>' +
          '<div class="data-list rt-dl"><span class="dl-label">Face value</span><span class="dl-value">' + (r.value ? money(r.value) : 'n/a') + '</span><span class="dl-label">Available</span><span class="dl-value">' + r.avail + ' · ' + money(r.avail * r.value) + '</span><span class="dl-label">Warn below</span><span class="dl-value">' + r.low + '</span><span class="dl-label">Available to</span><span class="dl-value">' + esc(r.restrict) + '</span></div>' +
          '<div class="row-gap">' + (r.status === 'Retired' ? btn('Restore', 'btn-surface', 'rotate-ccw', 'data-act="rt-retire" data-id="' + r.id + '"', 'is-sm') : (r.fulfil === 'code' ? btn('Add codes', 'btn-soft', 'upload', 'data-act="codes-add" data-rt="' + r.id + '"', 'is-sm') : btn('Add stock', 'btn-soft', 'plus', 'data-act="noop-toast" data-t="Stock updated"', 'is-sm')) + rowMenu('rt' + r.id, [['pencil', 'Edit', 'data-act="rt-new" data-id="' + r.id + '"'], ['bell', 'Change stock warning', 'data-act="noop-toast" data-t="Warning threshold saved"'], ['archive', 'Retire', 'data-act="rt-retire" data-id="' + r.id + '"', true]])) + '</div></section>';
      }).join('') + '</div>';
  }
  A['rt-retire'] = function (el) { var r = APP.rt(el.getAttribute('data-id')); r.status = r.status === 'Retired' ? 'Active' : 'Retired'; APP.closePops(); APP.rerender(); APP.toast(r.status === 'Retired' ? 'Reward type retired' : 'Reward type restored', r.status === 'Retired' ? 'No more cards can be awarded from it. Unused codes stay in stock.' : ''); };
  A['rt-new'] = function (el) {
    var r = el.getAttribute('data-id') ? APP.rt(el.getAttribute('data-id')) : { name: '', brand: '', value: '', how: '', kind: 'Digital gift card', restrict: 'All locations', fulfil: 'code' };
    S.f.rtKind = r.kind; S.f.rtRestrict = r.restrict;
    APP.dialog({ title: el.getAttribute('data-id') ? 'Edit reward type' : 'New reward type', size: 'is-wide', body: '<div class="stack-4"><div class="form-grid">' + APP.field('Name', '<input class="input" value="' + esc(r.name) + '" placeholder="For example, ShopMart gift card $25">', null, true) + APP.field('Brand', '<input class="input" value="' + esc(r.brand) + '">') + '</div>' +
      '<div class="form-grid">' + APP.field('Type', APP.dd('rtKind', ['Digital gift card', 'Voucher', 'Merchandise', 'Perk'], S.f.rtKind, 'dd-block')) + '<div class="form-grid">' + APP.field('Face value', '<input class="input" value="' + esc(r.value) + '" inputmode="decimal" placeholder="25">') + APP.field('Currency', APP.dd('rtCur', ['USD'], 'USD', 'dd-block')) + '</div></div>' +
      '<div class="upload-drop" data-act="noop-toast" data-t="Image added" data-k="info">' + ic('image-plus', 20) + '<span class="fw-medium">Card image</span></div>' +
      APP.field('How to use it', '<textarea class="textarea">' + esc(r.how) + '</textarea>', 'Shown to the recipient next to their code.') +
      '<div class="form-grid">' + APP.field('Available to', APP.dd('rtRestrict', ['All locations', 'Maple Grove, Cedar Hills', 'Frontline only', 'Office only'], S.f.rtRestrict, 'dd-block')) + APP.field('Warn when stock falls below', '<input class="input" value="' + (r.low || 10) + '" inputmode="numeric">') + '</div>' +
      '<div class="field"><span class="field-label">Delivery</span><div class="radio-cards"><button class="radio-card' + (r.fulfil === 'code' ? ' is-selected' : '') + '" data-act="rc-toggle"><div class="rc-title">Deliver a code</div><div class="rc-sub">From codes you upload</div></button><button class="radio-card' + (r.fulfil === 'task' ? ' is-selected' : '') + '" data-act="rc-toggle"><div class="rc-title">Create a fulfilment task</div><div class="rc-sub">For merchandise and perks</div></button></div></div></div>',
      footer: btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn('Save reward type', 'btn-solid', null, 'data-act="noop-toast" data-t="Reward type saved"') });
  };
  A['rc-toggle'] = function (el) { Array.prototype.forEach.call(el.parentNode.children, function (c) { c.classList.toggle('is-selected', c === el); }); };
  ['rtKind', 'rtRestrict', 'rtCur'].forEach(function (k) { APP.DD[k] = function (v) { var t = document.querySelector('[data-pop="dd-' + k + '"] .dd-value'); if (t) t.textContent = v; }; });

  function stock() {
    var f = S.f.codeStatus || 'All statuses';
    var list = D.CODES.filter(function (c) { return f === 'All statuses' || c[2] === f; });
    return toolbar('Search by code ID or recipient', APP.dd('codeStatus', ['All statuses', 'Available', 'Assigned', 'Delivered', 'Void'], f)) +
      APP.callout('Code values are never shown to anyone but the recipient, including you. You can see whether a code has been revealed.', '', 'lock') +
      table(['Code ID', 'Reward type', 'Status', 'Assigned to', 'Revealed', 'Expires', ''], list.map(function (c) {
        var idx = D.CODES.indexOf(c);
        return ['<span class="mono">' + c[0] + '</span><span class="cell-sub mono">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;</span>', esc(APP.rt(c[1]).name), APP.statusBadge(c[2]), c[3] ? esc(c[3]) : '<span class="text-low">n/a</span>', c[4] === 'Yes' ? badge('Revealed', 'is-success') : c[4] === 'No' ? badge('Not yet', 'is-neutral') : '<span class="text-low">n/a</span>', c[5],
          c[2] === 'Available' ? btn('Void', 'btn-ghost', 'ban', 'data-act="code-void" data-i="' + idx + '"', 'is-sm') : c[2] === 'Assigned' || (c[2] === 'Delivered' && c[4] === 'No') ? btn('Cancel award', 'btn-ghost', 'undo-2', 'data-act="code-cancel" data-i="' + idx + '"', 'is-sm') : ''];
      })) + '<div class="pagination"><span class="page-info">1 to ' + list.length + ' of 182 codes</span><span class="page-spacer"></span>' + btn('', 'btn-surface is-icon is-sm', 'chevron-left', 'aria-label="Previous page" disabled') + btn('', 'btn-surface is-icon is-sm', 'chevron-right', 'aria-label="Next page" data-act="noop-toast" data-t="Page 2" data-k="info"') + '</div>';
  }
  A['code-void'] = function (el) {
    var i = el.getAttribute('data-i');
    APP.dialog({ title: 'Void code ' + D.CODES[+i][0], sub: 'A voided code can never be awarded. This is recorded in the audit trail.', body: APP.field('Reason', APP.dd('voidReason', ['Already used elsewhere', 'Card reported lost by supplier', 'Entered by mistake', 'Expired'], S.f.voidReason || 'Already used elsewhere', 'dd-block'), null, true), footer: btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn('Void code', 'btn-solid is-danger', 'ban', 'data-act="do-void" data-i="' + i + '"') });
  };
  APP.DD.voidReason = function (v) { var t = document.querySelector('[data-pop="dd-voidReason"] .dd-value'); if (t) t.textContent = v; };
  A['do-void'] = function (el) { var c = D.CODES[+el.getAttribute('data-i')]; c[2] = 'Void'; D.AUDIT.unshift(['Sep 15, now', 'Voided', c[0], APP.me().name, 'Reason: ' + (S.f.voidReason || 'Already used elsewhere').toLowerCase()]); APP.closeOverlay(); APP.rerender(); APP.toast('Code voided', 'Logged in the audit trail.'); };
  A['code-cancel'] = function (el) { var c = D.CODES[+el.getAttribute('data-i')]; APP.alert('Cancel this award?', esc(c[3]) + ' has not viewed the code yet. The code goes back to Available stock and they are told the award was withdrawn.', 'Cancel award', 'do-code-cancel', 'data-i="' + el.getAttribute('data-i') + '"'); };
  A['do-code-cancel'] = function (el) { var c = D.CODES[+el.getAttribute('data-i')]; D.AUDIT.unshift(['Sep 15, now', 'Cancelled', c[0], APP.me().name, 'Award to ' + c[3] + ' cancelled before view']); c[2] = 'Available'; c[3] = ''; c[4] = ''; APP.closeAll(); APP.rerender(); APP.toast('Award cancelled', 'The code is back in Available stock.'); };
  S.ca = { step: 'auth', mode: 'bulk' };
  A['codes-add'] = function (el) {
    S.ca = { step: 'auth', mode: 'bulk', rt: el.getAttribute('data-rt') || 'rt2' };
    APP.dialog({ title: 'Add gift card codes', body: '<div id="caBody">' + caBody() + '</div>', footer: '<div id="caFoot" class="sv-foot">' + caFoot() + '</div>' });
  };
  function caBody() {
    if (S.ca.step === 'auth') return APP.callout('<b>Confirm it is you.</b> Adding codes is restricted to Admins and needs a fresh sign-in, because codes work like cash.', 'is-warning', 'lock-keyhole') + '<div class="reauth"><span class="avatar">' + APP.me().ini + '</span><div><div class="fw-medium">' + esc(APP.me().name) + '</div><div class="t-1 text-low">' + esc(APP.me().email) + '</div></div></div><p class="t-2 text-low">You will be sent to ' + esc(D.ORG) + ' single sign-on and returned here.</p>';
    if (S.ca.step === 'done') return APP.emptyState('circle-check', '40 codes added', 'All codes are encrypted and marked Available. The upload is recorded in the audit trail. The file has been deleted from this browser.');
    return '<div class="stack-4">' + APP.field('Reward type', APP.dd('caRt', D.REWARD_TYPES.filter(function (r) { return r.fulfil === 'code' && r.status === 'Active'; }).map(function (r) { return [r.id, r.name]; }), S.ca.rt, 'dd-block')) +
      '<div class="segmented">' + [['bulk', 'Upload a file'], ['single', 'Enter one code']].map(function (x) { return '<button class="segmented-item' + (S.ca.mode === x[0] ? ' is-active' : '') + '" data-act="ca-mode" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' +
      (S.ca.mode === 'bulk' ? '<div class="upload-drop" data-act="ca-file">' + ic('file-spreadsheet', 24) + '<span class="fw-medium">' + (S.ca.file ? 'codes-september.csv · 40 rows' : 'Drop a CSV of codes') + '</span><span class="t-1 text-low">Columns: code, value, expiry date. Max 1,000 rows.</span></div>' + (S.ca.file ? APP.callout('40 valid rows. 0 duplicates. Total value $400.', 'is-success', 'circle-check') : '')
        : '<div class="form-grid">' + APP.field('Code', '<input class="input" type="password" autocomplete="off" placeholder="Hidden as you type">', null, true) + APP.field('Expiry', APP.dd('caExp', ['Mar 2027', 'Sep 2027'], S.f.caExp || 'Sep 2027', 'dd-block')) + '</div>') + '</div>';
  }
  function caFoot() {
    if (S.ca.step === 'auth') return '<span class="toolbar-spacer"></span>' + btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn('Sign in again', 'btn-solid', 'log-in', 'data-act="ca-auth"');
    if (S.ca.step === 'done') return '<span class="toolbar-spacer"></span>' + btn('Done', 'btn-solid', null, 'data-act="close-overlay"');
    return '<span class="toolbar-spacer"></span>' + btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn('Add to stock', 'btn-solid', 'upload', 'data-act="ca-save"' + (S.ca.mode === 'bulk' && !S.ca.file ? ' disabled' : ''));
  }
  function caRedraw() { document.getElementById('caBody').innerHTML = caBody(); document.getElementById('caFoot').innerHTML = caFoot(); }
  A['ca-auth'] = function () { S.ca.step = 'form'; caRedraw(); APP.toast('Identity confirmed', 'Valid for 10 minutes.'); };
  A['ca-mode'] = function (el) { S.ca.mode = el.getAttribute('data-v'); caRedraw(); };
  A['ca-file'] = function () { S.ca.file = true; caRedraw(); };
  APP.DD.caRt = function (v) { S.ca.rt = v; caRedraw(); }; APP.DD.caExp = function () { caRedraw(); };
  A['ca-save'] = function () { var r = APP.rt(S.ca.rt); var n = S.ca.mode === 'bulk' ? 40 : 1; r.avail += n; D.AUDIT.unshift(['Sep 15, now', 'Added (' + (n > 1 ? 'bulk, ' : '') + n + ' code' + (n > 1 ? 's' : '') + ')', 'New stock', APP.me().name, 'Re-authenticated']); S.ca.step = 'done'; caRedraw(); if (n === 1) document.querySelector('#caBody h2').textContent = '1 code added'; APP.rerender(); };

  function awardsAdmin() {
    var f = S.f.awStatus || 'All statuses';
    var list = D.AWARDS.filter(function (a) { return f === 'All statuses' || a.status === f; });
    var pend = D.AWARDS.filter(function (a) { return a.status === 'Pending approval'; });
    return (pend.length ? APP.callout('<b>' + pend.length + ' award waiting for your approval.</b> Awards over ' + money(100) + ' are held until an Admin releases them.', 'is-warning', 'shield-check') : '') +
      toolbar('Search recipient or awarder', APP.dd('awStatus', ['All statuses', 'Pending approval', 'Delivered', 'Awarded', 'In progress', 'Fulfilled', 'Cancelled'], f)) +
      table(['Recipient', 'Reward', { t: 'Value', num: true }, 'Awarded by', 'Date', 'Status', 'Revealed', ''], list.map(function (a) {
        var r = APP.rt(a.type), p = P(a.to), act = '';
        if (a.status === 'Pending approval') act = '<span class="row-gap">' + btn('Approve', 'btn-soft', 'check', 'data-act="aw-approve" data-id="' + a.id + '"', 'is-sm') + btn('Decline', 'btn-ghost', null, 'data-act="aw-decline" data-id="' + a.id + '"', 'is-sm') + '</span>';
        else if (a.status === 'Delivered' && !a.revealed) act = btn('Cancel', 'btn-ghost', 'undo-2', 'data-act="aw-cancel" data-id="' + a.id + '"', 'is-sm');
        return [APP.personLine(p, esc(p.loc)), esc(r.name) + '<span class="cell-sub">' + esc(a.reason) + '</span>', money(a.value || r.value), esc(P(a.from).name), a.date, APP.statusBadge(a.status), a.fulfilment ? '<span class="text-low">n/a</span>' : a.status === 'Delivered' ? (a.revealed ? badge('Yes', 'is-success') : badge('Not yet', 'is-neutral')) : '<span class="text-low">n/a</span>', act];
      }));
  }
  A['aw-approve'] = function (el) { var a = D.AWARDS.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; a.status = 'Delivered'; APP.rerender(); APP.toast('Award approved', P(a.to).name + ' has been notified and can reveal the code.'); };
  A['aw-decline'] = function (el) { var a = D.AWARDS.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; a.status = 'Cancelled'; APP.rerender(); APP.toast('Award declined', P(a.from).name + ' has been told why.', 'info'); };
  A['aw-cancel'] = function (el) { APP.alert('Cancel this award?', 'The recipient has not viewed the code. It returns to Available stock.', 'Cancel award', 'do-aw-cancel', 'data-id="' + el.getAttribute('data-id') + '"'); };
  A['do-aw-cancel'] = function (el) { var a = D.AWARDS.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; a.status = 'Cancelled'; APP.rt(a.type).avail++; APP.closeAll(); APP.rerender(); APP.toast('Award cancelled', 'Code returned to stock.'); };

  function budgets() {
    return '<div class="split-even"><section class="card stack-4">' + APP.panelHead('Awarding budget', 'Q3 2026 · July to September', APP.dd('bPeriod', ['Q3 2026', 'Q4 2026'], S.f.bPeriod || 'Q3 2026')) +
      APP.meter('Organisation', 8150, 15000, money) + APP.meter('Maple Grove', 2410, 3500, money) + APP.meter('Riverside Commons', 3120, 3500, money, 'is-warn') + APP.meter('Cedar Hills', 1480, 3500, money) + APP.meter('Corporate Office', 1140, 4500, money) +
      APP.callout('Riverside Commons has used 89% of its budget.', 'is-warning', 'triangle-alert') +
      '<div class="field"><span class="field-label">When a budget runs out</span><div class="radio-cards"><button class="radio-card' + (S.f.over !== 'continue' ? ' is-selected' : '') + '" data-act="set-over" data-v="pause"><div class="rc-title">Pause awarding</div><div class="rc-sub">Nobody can award until next period</div></button><button class="radio-card' + (S.f.over === 'continue' ? ' is-selected' : '') + '" data-act="set-over" data-v="continue"><div class="rc-title">Continue over budget</div><div class="rc-sub">Admins are warned</div></button></div></div></section>' +
      '<div class="stack-4"><section class="card">' + APP.panelHead('Controller awarding limits', 'Per quarter. Controllers see how much they have left.', btn('Edit', 'btn-surface', 'pencil', 'data-act="noop-toast" data-t="Limits saved"', 'is-sm')) +
      table(['Controller', { t: 'Value limit', num: true }, { t: 'Card limit', num: true }, 'Used'], [['marcus', 250, 10, 64], ['ben', 250, 10, 92], ['noah', 200, 8, 30], ['ana', 150, 6, 20]].map(function (c) { return [APP.personLine(c[0], esc(P(c[0]).loc)), money(c[1]), c[2], '<div class="ack-meter"><div class="progress"><div class="progress-fill" style="width:' + c[3] + '%"></div></div><span class="t-1">' + c[3] + '%</span></div>']; })) + '</section>' +
      '<section class="card stack-4">' + APP.panelHead('Approval threshold') + '<div class="form-grid">' + APP.field('Needs Admin approval above', '<input class="input" value="$100" inputmode="decimal">', 'Per award, across all recipients.') + APP.field('Approvers', APP.dd('approver', ['All Admins', 'Chief People Officer only'], S.f.approver || 'All Admins', 'dd-block')) + '</div>' + btn('Save', 'btn-solid', null, 'data-act="noop-toast" data-t="Settings saved"') + '</section></div></div>';
  }
  A['set-over'] = function (el) { S.f.over = el.getAttribute('data-v'); APP.rerender(); };
  function audit() {
    return APP.callout('Every action on a code is recorded with who did it and when. Codes themselves are never written to this log.', '', 'history') +
      toolbar('Search the audit trail', APP.dd('auditType', ['All events', 'Added', 'Assigned', 'Revealed by recipient', 'Cancelled', 'Voided'], S.f.auditType || 'All events')) +
      table(['When', 'Event', 'Code ID', 'By', 'Details'], D.AUDIT.filter(function (a) { var f = S.f.auditType || 'All events'; return f === 'All events' || a[1].indexOf(f) === 0; }).map(function (a) { return [a[0], '<span class="cell-strong">' + esc(a[1]) + '</span>', '<span class="mono">' + esc(a[2]) + '</span>', esc(a[3]), '<span class="text-low">' + esc(a[4]) + '</span>']; }));
  }
  function reports() {
    var by = S.f.repBy || 'Location';
    var data = { Location: [['Maple Grove', 2410], ['Riverside Commons', 3120], ['Cedar Hills', 1480], ['Corporate Office', 1140]], Department: [['Nursing', 3650], ['Dining', 1420], ['Housekeeping', 1130], ['Administration', 1210], ['Activities', 740]], Awarder: [['Ben Carter', 2300], ['Marcus Reid', 1600], ['Noah Fischer', 1250], ['Elena Torres', 1180], ['Ana Cruz', 820]], 'Reward type': [['ShopMart gift card', 3400], ['FreshCart grocery card', 2250], ['Meal voucher', 1080], ['Bean & Brew coffee card', 620], ['Cascade fleece jacket', 800]] }[by];
    return '<div class="table-toolbar"><div class="segmented">' + ['Location', 'Department', 'Awarder', 'Reward type'].map(function (b) { return '<button class="segmented-item' + (by === b ? ' is-active' : '') + '" data-act="rep-by" data-v="' + b + '">By ' + b.toLowerCase() + '</button>'; }).join('') + '</div>' + APP.dd('repPeriod', ['This quarter', 'Last quarter', 'Year to date'], S.f.repPeriod || 'This quarter') + '</div>' +
      '<div class="kpi-row"><section class="card stat-card"><div class="sc-head"><span class="sc-label">Value awarded</span><span class="sc-icon">' + ic('gift', 18) + '</span></div><div class="sc-value">' + money(8150) + '</div><div class="t-1 text-low">312 awards</div></section><section class="card stat-card"><div class="sc-head"><span class="sc-label">Held, not yet awarded</span><span class="sc-icon">' + ic('wallet', 18) + '</span></div><div class="sc-value">' + money(D.REWARD_TYPES.filter(function (r) { return r.status === 'Active'; }).reduce(function (s, r) { return s + r.avail * r.value; }, 0)) + '</div><div class="t-1 text-low">For finance</div></section><section class="card stat-card"><div class="sc-head"><span class="sc-label">Codes revealed</span><span class="sc-icon">' + ic('eye', 18) + '</span></div><div class="sc-value">81%</div><div class="t-1 text-low">Within 7 days of award</div></section><section class="card stat-card"><div class="sc-head"><span class="sc-label">Cancelled or voided</span><span class="sc-icon">' + ic('ban', 18) + '</span></div><div class="sc-value">6</div><div class="t-1 text-low">This quarter</div></section></div>' +
      '<section class="card">' + APP.panelHead('Value awarded by ' + by.toLowerCase(), S.f.repPeriod || 'This quarter') + APP.bars(data, money) + '</section>' +
      APP.callout('<b>Tax treatment is still open.</b> Gift cards are usually taxable income. Exports give payroll the award data; skyEmployee does not calculate tax.', 'is-info', 'info');
  }
  A['rep-by'] = function (el) { S.f.repBy = el.getAttribute('data-v'); APP.rerender(); };

  /* ======================= RECOGNITION ======================= */
  function recogView(tab) {
    tab = tab || 'badges';
    var items = [['badges', 'Award badges', '#/admin/recognition', D.BADGES.length], ['ecards', 'E-card designs', '#/admin/recognition/ecards', D.ECARD_DESIGNS.length]], body;
    if (tab === 'badges') body = '<div class="card-grid">' + D.BADGES.map(function (b) {
      return '<section class="card badge-admin"><div class="ba-top"><span class="avatar ' + b.tone + '" style="width:48px;height:48px;">' + ic(b.ic, 22) + '</span>' + badge('Used ' + b.uses + ' times', 'is-neutral') + '</div><div class="t-4 fw-bold">' + esc(b.name) + '</div><p class="t-2 text-low">' + esc(b.desc) + '</p><div class="row-gap">' + btn('Edit', 'btn-surface', 'pencil', 'data-act="badge-edit" data-id="' + b.id + '"', 'is-sm') + btn('Retire', 'btn-ghost', 'archive', 'data-act="noop-toast" data-t="Badge retired" data-b="Past awards keep it."', 'is-sm') + '</div></section>';
    }).join('') + '</div>';
    else body = '<div class="ecard-grid is-admin">' + D.ECARD_DESIGNS.map(function (d) {
      return '<section class="card ecard-admin' + (d.retired ? ' is-retired' : '') + '">' + APP.ecardArt(d) + '<div class="ea-meta"><div><div class="fw-medium">' + esc(d.name) + '</div><div class="t-1 text-low">' + esc(d.occ) + (d.retired ? ' · Retired' : '') + '</div></div>' + rowMenu('ed' + d.id, [['pencil', 'Edit', 'data-act="noop-toast" data-t="Opens the design editor" data-k="info"'], ['archive', d.retired ? 'Restore' : 'Retire', 'data-act="ecard-retire" data-id="' + d.id + '"']]) + '</div>' +
        '<label class="switch"><input type="checkbox" ' + (d.ctrlOnly ? 'checked' : '') + ' data-change="ecard-ctrl" data-id="' + d.id + '"><span class="t-1">Managers only</span></label></section>';
    }).join('') + '</div>';
    return APP.page({ crumbs: crumbsFor('Administration', 'Recognition', items.filter(function (i) { return i[0] === tab; })[0][1], '#/admin/recognition'), title: 'Recognition', desc: 'The badges people can attach to a shout-out, and the e-card designs everyone can send.', action: btn(tab === 'badges' ? 'New badge' : 'New design', 'btn-solid', 'plus', tab === 'badges' ? 'data-act="badge-edit"' : 'data-act="noop-toast" data-t="Upload a design" data-k="info"'), tabs: APP.tabs(items, tab), body: body });
  }
  A['ecard-retire'] = function (el) { var d = D.ECARD_DESIGNS.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; d.retired = !d.retired; APP.closePops(); APP.rerender(); };
  APP.INPUT['ecard-ctrl'] = function (el) { var d = D.ECARD_DESIGNS.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; d.ctrlOnly = el.checked; APP.toast(d.ctrlOnly ? 'Now managers only' : 'Available to everyone', d.name); };
  A['badge-edit'] = function (el) {
    var b = el.getAttribute('data-id') ? D.BADGES.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0] : { name: '', desc: '', ic: 'star', tone: 'c1' };
    var icons = ['rocket', 'handshake', 'heart', 'shield-check', 'smile', 'star', 'trophy', 'medal', 'sparkles', 'crown'];
    APP.dialog({ title: el.getAttribute('data-id') ? 'Edit badge' : 'New badge', body: '<div class="stack-4">' + APP.field('Name', '<input class="input" value="' + esc(b.name) + '">', null, true) + APP.field('What it recognises', '<textarea class="textarea">' + esc(b.desc) + '</textarea>') +
      '<div class="field"><span class="field-label">Icon</span><div class="icon-pick">' + icons.map(function (n) { return '<button class="ip-item' + (n === b.ic ? ' is-selected' : '') + '" aria-label="' + n + '" data-act="rc-toggle">' + ic(n, 18) + '</button>'; }).join('') + '</div></div></div>',
      footer: btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn('Save badge', 'btn-solid', null, 'data-act="noop-toast" data-t="Badge saved"') });
  };

  /* ======================= RESOURCE LIBRARY ======================= */
  function resAdminView(tab) {
    tab = tab || 'library';
    var past = D.RESOURCES.filter(function (r) { return /2026$/.test(r.review) && ['Aug 2026', 'Jul 2026', 'Jun 2026'].indexOf(r.review) >= 0; });
    var items = [['library', 'Library', '#/admin/resources', D.RESOURCES.length], ['review', 'Past review date', '#/admin/resources/review', past.length], ['acks', 'Acknowledgements', '#/admin/resources/acks'], ['categories', 'Categories & owners', '#/admin/resources/categories']], body;
    if (tab === 'library') body = toolbar('Search the library', APP.dd('raCat', ['All categories'].concat(D.RESOURCE_CATS.map(function (c) { return c.name; })), S.f.raCat || 'All categories')) +
      table(['Resource', 'Category', 'Owner', 'Version', 'Review by', 'Audience', ''], D.RESOURCES.filter(function (r) { var f = S.f.raCat || 'All categories'; return f === 'All categories' || D.RESOURCE_CATS.filter(function (c) { return c.id === r.cat; })[0].name === f; }).map(function (r, i) {
        var c = D.RESOURCE_CATS.filter(function (x) { return x.id === r.cat; })[0];
        return [(r.archived ? '<span class="cell-strong text-low">' : '<span class="cell-strong">') + esc(r.t) + '</span><span class="cell-sub">' + r.kind + (r.ack ? ' · needs acknowledgement' : '') + (r.sign ? ' · signature in skySign' : '') + (r.archived ? ' · archived' : '') + '</span>', esc(c.name), esc(P(r.owner).name), r.ver, past.indexOf(r) >= 0 ? badge(r.review, 'is-warning') : r.review, 'Everyone',
          rowMenu('ra' + i, [['pencil', 'Edit', 'data-act="res-edit" data-id="' + r.id + '"'], ['upload', 'Replace file', 'data-act="noop-toast" data-t="New version uploaded" data-b="The version date updates and acknowledgements reset."'], ['file-check', r.ack ? 'Stop requiring acknowledgement' : 'Require acknowledgement', 'data-act="res-ack" data-id="' + r.id + '"'], ['archive', r.archived ? 'Restore' : 'Archive', 'data-act="res-archive" data-id="' + r.id + '"', true]])];
      }));
    else if (tab === 'review') body = APP.callout('These resources are past their review date. Ask each owner to confirm they are still correct.', 'is-warning', 'calendar-clock') + table(['Resource', 'Owner', 'Review was due', ''], past.map(function (r) { return ['<span class="cell-strong">' + esc(r.t) + '</span>', APP.personLine(r.owner, esc(P(r.owner).title)), badge(r.review, 'is-warning'), '<span class="row-gap">' + btn('Remind owner', 'btn-surface', 'bell-ring', 'data-act="noop-toast" data-t="Reminder sent" data-b="' + esc(P(r.owner).name) + ' will get a notification."', 'is-sm') + btn('Mark reviewed', 'btn-soft', 'check', 'data-act="res-reviewed" data-id="' + r.id + '"', 'is-sm') + '</span>']; }), { empty: 'Every resource is within its review date.' });
    else if (tab === 'acks') body = acksTable();
    else body = '<div class="card-grid">' + D.RESOURCE_CATS.map(function (c) { return '<section class="card">' + APP.panelHead(ic(c.ic, 18) + ' ' + esc(c.name), D.RESOURCES.filter(function (r) { return r.cat === c.id; }).length + ' resources') + '<h3 class="section-label">Content owner</h3>' + APP.personLine(c.owner, esc(P(c.owner).title)) + '<div class="row-gap">' + btn('Change owner', 'btn-surface', 'user-round-cog', 'data-act="noop-toast" data-t="Owner updated"', 'is-sm') + btn('Rename', 'btn-ghost', 'pencil', 'data-act="noop-toast" data-t="Category renamed"', 'is-sm') + '</div></section>'; }).join('') + '</div>';
    return APP.page({ crumbs: crumbsFor('Administration', 'Resource library', items.filter(function (i) { return i[0] === tab; })[0][1], '#/admin/resources'), title: 'Resource library', desc: 'Upload, target and review policies, procedures, forms and playbooks. Every category has a named owner.', action: tab === 'categories' ? btn('New category', 'btn-solid', 'plus', 'data-act="noop-toast" data-t="Category created"') : btn('Upload resource', 'btn-solid', 'upload', 'data-act="res-edit"'), tabs: APP.tabs(items, tab), body: body });
  }
  A['res-ack'] = function (el) { var r = D.RESOURCES.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; r.ack = !r.ack; if (r.ack) { r.ackDue = 'Sep 30'; r.ackDueN = 15; r.acked = false; r.ackRate = 0; } APP.closePops(); APP.rerender(); APP.toast(r.ack ? 'Acknowledgement required' : 'Acknowledgement no longer required', r.ack ? 'Targeted staff now see it in Due items.' : ''); };
  A['res-archive'] = function (el) { var r = D.RESOURCES.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; r.archived = !r.archived; APP.closePops(); APP.rerender(); APP.toast(r.archived ? 'Archived' : 'Restored', r.t); };
  A['res-reviewed'] = function (el) { var r = D.RESOURCES.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; r.review = 'Sep 2027'; APP.rerender(); APP.toast('Marked as reviewed', 'Next review September 2027.'); };
  A['res-edit'] = function (el) {
    var r = el.getAttribute('data-id') ? D.RESOURCES.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0] : { t: '', d: '', cat: 'hr', owner: 'grace', ack: false };
    APP.closePops();
    APP.dialog({ title: r.t ? 'Edit resource' : 'Upload a resource', size: 'is-wide', body: '<div class="stack-4">' + '<div class="upload-drop" data-act="noop-toast" data-t="File added" data-k="info">' + ic('upload', 22) + '<span class="fw-medium">' + (r.t ? 'Replace the file' : 'Drop a document, image or video, or paste a link') + '</span><span class="t-1 text-low">PDF, DOCX, JPG, PNG, MP4</span></div>' +
      '<div class="form-grid">' + APP.field('Title', '<input class="input" value="' + esc(r.t) + '">', null, true) + APP.field('Category', APP.dd('reCat', D.RESOURCE_CATS.map(function (c) { return c.name; }), D.RESOURCE_CATS.filter(function (c) { return c.id === r.cat; })[0].name, 'dd-block')) + '</div>' +
      APP.field('Short description', '<textarea class="textarea">' + esc(r.d) + '</textarea>') +
      '<div class="form-grid">' + APP.field('Content owner', APP.dd('reOwner', ['Grace Kim', 'Ana Cruz', 'Dev Patel', 'Priya Raman', 'Elena Torres'], P(r.owner).name, 'dd-block')) + APP.field('Review by', APP.dd('reReview', ['Mar 2027', 'Sep 2027', 'Mar 2028'], 'Sep 2027', 'dd-block')) + '</div>' +
      APP.field('Audience', APP.dd('reAud', ['Everyone', 'Maple Grove', 'Riverside Commons', 'Cedar Hills', 'Frontline', 'Office'], 'Everyone', 'dd-block')) +
      '<label class="setting-row"><span><span class="fw-medium">Require acknowledgement</span><span class="t-1 text-low">Staff see it in Due items until they confirm they have read it.</span></span><span class="switch"><input type="checkbox" ' + (r.ack ? 'checked' : '') + '></span></label>' +
      '<label class="setting-row"><span><span class="fw-medium">Needs a signature</span><span class="t-1 text-low">Links to skySign instead of an acknowledgement.</span></span><span class="switch"><input type="checkbox" ' + (r.sign ? 'checked' : '') + '></span></label></div>',
      footer: btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn('Publish', 'btn-solid', null, 'data-act="noop-toast" data-t="Resource published"') });
  };
  ['reCat', 'reOwner', 'reReview', 'reAud', 'raCatX'].forEach(function (k) { APP.DD[k] = function (v) { var t = document.querySelector('[data-pop="dd-' + k + '"] .dd-value'); if (t) t.textContent = v; }; });

  /* ======================= SETTINGS ======================= */
  function settingsView(tab) {
    tab = tab || 'apps';
    var items = [['apps', 'My Apps', '#/admin/settings'], ['branding', 'Branding', '#/admin/settings/branding'], ['exports', 'Exports', '#/admin/settings/exports']], body;
    if (tab === 'apps') body = '<p class="t-2 text-low">Choose which Skypoint apps appear in My Apps for each employee type. People only see apps they have access to.</p><div class="split-even">' + ['Frontline', 'Office'].map(function (t) {
      var set = D.APP_SETS[t];
      return '<section class="card">' + APP.panelHead(t + ' staff', t === 'Frontline' ? 'Caregivers, nurses, dining, housekeeping and maintenance' : 'HR, finance, scheduling and corporate teams') + '<div class="app-set">' + Object.keys(D.APPS).map(function (a) {
        var on = set.indexOf(a) >= 0;
        return '<div class="app-set-row' + (on ? '' : ' is-off') + '"><span class="at-ic">' + ic(D.APPS[a].ic, 18) + '</span><span class="pl-text"><span class="pl-name">' + a + '</span><span class="pl-sub">' + D.APPS[a].desc + '</span></span>' + (on ? '<span class="br-order">' + btn('', 'btn-ghost is-icon is-sm', 'chevron-up', 'aria-label="Move ' + a + ' up" data-act="app-move" data-t="' + t + '" data-a="' + a + '" data-d="-1"' + (set.indexOf(a) === 0 ? ' disabled' : '')) + btn('', 'btn-ghost is-icon is-sm', 'chevron-down', 'aria-label="Move ' + a + ' down" data-act="app-move" data-t="' + t + '" data-a="' + a + '" data-d="1"' + (set.indexOf(a) === set.length - 1 ? ' disabled' : '')) + '</span>' : '') + '<span class="switch"><input type="checkbox" ' + (on ? 'checked' : '') + ' data-change="app-set" data-t="' + t + '" data-a="' + a + '" aria-label="Show ' + a + ' for ' + t + '"></span></div>';
      }).join('') + '</div><p class="t-1 text-low">Preview: ' + set.join(', ') + '</p></section>';
    }).join('') + '</div>' + APP.callout('Only Skypoint apps can be added. My Apps is the only route from skyEmployee into other apps.', '', 'info');
    else if (tab === 'branding') body = '<div class="split-2"><section class="card stack-4">' + APP.field('Organisation name', '<input class="input" id="orgName" value="' + esc(D.ORG) + '">', 'Shown next to skyEmployee in the header and on sign-in.') +
      '<div class="field"><span class="field-label">Logo</span><div class="logo-row"><span class="logo-prev">' + esc(D.ORG.split(' ').map(function (w) { return w[0]; }).join('')) + '</span><div class="upload-drop is-inline" data-act="noop-toast" data-t="Logo uploaded" data-k="info">' + ic('upload', 18) + '<span>Upload SVG or PNG, square, at least 256px</span></div></div></div>' +
      btn('Save branding', 'btn-solid', null, 'data-act="brand-save"') + '</section><section class="card">' + APP.panelHead('Preview') + '<div class="brand-preview"><span class="bp-logo">S</span><b>skyEmployee</b><span class="text-low">' + esc(D.ORG) + '</span></div><p class="t-1 text-low">Colours follow the Skypoint design system and are not configurable.</p></section></div>';
    else body = '<div class="card-grid">' + [['clipboard-list', 'Survey results', 'Responses by question, respecting the minimum group size.'], ['gift', 'Gift card awards', 'Recipient, type, value, awarder and date. Never codes.'], ['package', 'Remaining stock', 'Codes available and value held per reward type.'], ['wallet', 'Budget spend', 'Spend against budget by location and period.'], ['vote', 'Poll results', 'Totals per option for every poll.'], ['file-check', 'Acknowledgement status', 'Who has and has not acknowledged each policy.']].map(function (e) {
      return '<section class="card export-card"><span class="sc-icon">' + ic(e[0], 18) + '</span><div class="t-4 fw-bold">' + e[1] + '</div><p class="t-2 text-low">' + e[2] + '</p>' + btn('Export CSV', 'btn-surface', 'download', 'data-act="export" data-what="' + e[1] + '"') + '</section>';
    }).join('') + '</div>' + APP.callout('<b>Exports never contain gift card codes.</b> Every export is logged with who ran it.', '', 'shield-check');
    return APP.page({ crumbs: crumbsFor('Administration', 'Settings', items.filter(function (i) { return i[0] === tab; })[0][1], '#/admin/settings'), title: 'Settings', desc: 'App sets for each employee type, organisation branding and CSV exports.', tabs: APP.tabs(items, tab), body: body });
  }
  APP.INPUT['app-set'] = function (el) { var set = D.APP_SETS[el.getAttribute('data-t')], a = el.getAttribute('data-a'); if (el.checked) set.push(a); else set.splice(set.indexOf(a), 1); APP.rerender(); APP.toast('My Apps updated', el.getAttribute('data-t') + ' staff will see this next time Home loads.'); };
  A['app-move'] = function (el) { var set = D.APP_SETS[el.getAttribute('data-t')], i = set.indexOf(el.getAttribute('data-a')), j = i + (+el.getAttribute('data-d')); var t = set[i]; set[i] = set[j]; set[j] = t; APP.rerender(); };
  A['brand-save'] = function () { var v = document.getElementById('orgName').value.trim(); if (v) D.ORG = v; document.getElementById('brandOrg').textContent = D.ORG; APP.rerender(); APP.toast('Branding saved'); };
})();
