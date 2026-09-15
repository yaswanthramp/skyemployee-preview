/* skyEmployee wireframe: Home (banner, My Apps, widgets, feed, rail),
   the post composer, shout-outs, polls and the survey-taking flow. */
(function () {
  var D = SE, A = APP.ACT, S = APP.S, ic = APP.ic, esc = APP.esc, P = APP.P, av = APP.av, badge = APP.badge, btn = APP.btn;
  S.bannerIdx = 0; S.feed = 'All'; S.openComments = {}; S.gallery = {}; S.playing = {}; S.refreshing = {};
  S.surveyState = { s1: { done: false, answers: {}, at: 0, started: false } };
  S.pick = {};

  /* ---------- derived ---------- */
  function myBanners() {
    var me = APP.me();
    return D.BANNERS.filter(function (b) { return b.status === 'Live' && (b.audience === 'Everyone' || b.audience === me.type || b.audience === me.loc || (APP.isAdmin())); });
  }
  function myShifts() {
    if (APP.me().type === 'Office') return [
      { d: 'Tue 15 Sep', time: '9:00 AM to 5:00 PM', where: APP.me().loc + ' · ' + APP.me().dept, today: true },
      { d: 'Wed 16 Sep', time: '9:00 AM to 5:00 PM', where: APP.me().loc + ' · ' + APP.me().dept },
      { d: 'Thu 17 Sep', time: '9:00 AM to 5:00 PM', where: APP.me().loc + ' · ' + APP.me().dept },
      { d: 'Fri 18 Sep', time: '9:00 AM to 3:00 PM', where: 'Remote' }];
    return D.SHIFTS;
  }
  APP.dueItems = function () {
    var out = [];
    D.LEARNING.forEach(function (l) { if (l.dueN <= 14) out.push({ kind: 'Course', ic: 'graduation-cap', t: l.t, due: l.due, n: l.dueN, act: 'open-app', attrs: 'data-app="skyLearn" data-what="' + esc(l.t) + '"', src: 'skyLearn · ' + l.mins + ' min' }); });
    D.RESOURCES.forEach(function (r) { if (r.ack && !r.acked) out.push({ kind: 'Acknowledge', ic: 'file-check', t: r.t, due: r.ackDue, n: r.ackDueN, act: 'open-resource', attrs: 'data-id="' + r.id + '"', src: 'Policy to acknowledge' }); });
    var st = S.surveyState.s1, sv = D.SURVEYS[0];
    if (!st.done && !st.optedOut) out.push({ kind: 'Survey', ic: 'clipboard-list', t: sv.title, due: sv.due, n: sv.dueN, act: 'start-survey', attrs: 'data-id="s1"', src: st.started ? 'In progress · ' + st.at + ' of ' + sv.questions.length + ' answered' : sv.questions.length + ' questions · about ' + sv.mins + ' min' });
    return out.sort(function (a, b) { return a.n - b.n; });
  };
  function dueLabel(n, due) {
    if (n < 0) return badge('Overdue ' + (-n) + (n === -1 ? ' day' : ' days'), 'is-danger', 'circle-alert');
    if (n <= 3) return badge('Due ' + due, 'is-warning');
    return '<span class="t-1 text-low">Due ' + due + '</span>';
  }
  APP.dueRow = function (d) {
    return '<button class="due-row' + (d.n < 0 ? ' is-overdue' : '') + '" data-act="' + d.act + '" ' + d.attrs + '><span class="due-ic">' + ic(d.ic, 16) + '</span><span class="due-text"><span class="due-title">' + esc(d.t) + '</span><span class="due-src">' + d.src + '</span></span><span class="due-when">' + dueLabel(d.n, d.due) + '</span></button>';
  };

  /* ---------- banner ---------- */
  function bannerHtml() {
    var list = myBanners(); if (!list.length) return '';
    var i = S.bannerIdx % list.length, b = list[i];
    return '<section class="hero" id="hero" aria-roledescription="carousel" aria-label="Announcements">' +
      '<div class="hero-copy"><span class="hero-eyebrow">' + esc(b.eyebrow) + (b.audience !== 'Everyone' && b.audience !== b.eyebrow ? ' · for ' + esc(b.audience) : '') + '</span>' +
      '<h2 class="hero-title">' + esc(b.title) + '</h2><p class="hero-msg">' + esc(b.msg) + '</p>' +
      '<div class="hero-actions">' + btn(esc(b.cta), 'btn-solid', 'arrow-right', 'data-act="banner-cta" data-i="' + i + '"', 'is-lg') +
      '<div class="hero-dots" role="tablist">' + list.map(function (_, k) { return '<button class="hero-dot' + (k === i ? ' is-active' : '') + '" role="tab" aria-selected="' + (k === i) + '" aria-label="Banner ' + (k + 1) + ' of ' + list.length + '" data-act="banner-go" data-i="' + k + '"></button>'; }).join('') + '</div></div></div>' +
      '<div class="hero-art" aria-hidden="true"><svg viewBox="0 0 240 160" preserveAspectRatio="xMidYMid slice"><circle cx="190" cy="30" r="70" fill="var(--accent-9)" opacity=".16"/><circle cx="60" cy="150" r="60" fill="var(--accent-9)" opacity=".10"/><circle cx="150" cy="90" r="46" fill="var(--accent-9)"/></svg><span class="hero-art-ic">' + ic(b.art, 44) + '</span></div>' +
      '<div class="hero-nav"><button class="hero-arrow" aria-label="Previous banner" data-act="banner-step" data-d="-1">' + ic('chevron-left', 18) + '</button><button class="hero-arrow" aria-label="Next banner" data-act="banner-step" data-d="1">' + ic('chevron-right', 18) + '</button></div>' +
      '</section>';
  }
  var timer = null;
  function startCarousel() {
    clearInterval(timer);
    timer = setInterval(function () {
      var h = document.getElementById('hero'); if (!h || h.matches(':hover') || h.contains(document.activeElement)) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      S.bannerIdx++; swapBanner();
    }, 7000);
  }
  function swapBanner() { var h = document.getElementById('hero'); if (!h) return; h.outerHTML = bannerHtml(); bindSwipe(); }
  function bindSwipe() {
    var h = document.getElementById('hero'); if (!h) return; var x0 = null;
    h.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    h.addEventListener('pointerup', function (e) { if (x0 == null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) { S.bannerIdx = (S.bannerIdx + (dx < 0 ? 1 : myBanners().length - 1)); swapBanner(); } });
  }
  A['banner-go'] = function (el) { S.bannerIdx = +el.getAttribute('data-i'); swapBanner(); };
  A['banner-step'] = function (el) { var n = myBanners().length; S.bannerIdx = (S.bannerIdx % n + n + (+el.getAttribute('data-d'))) % n; swapBanner(); };
  A['banner-cta'] = function (el) { var b = myBanners()[+el.getAttribute('data-i')]; APP.toast(b.cta, 'Opens the link the publisher attached to "' + b.title + '".', 'info'); };

  /* ---------- My Apps + widgets ---------- */
  function appsHtml() {
    var me = APP.me(), set = D.APP_SETS[me.type];
    return '<section class="card apps-card"><div class="apps-head"><span class="panel-title">My Apps</span>' + badge(me.type + ' set', 'is-neutral') + '<span class="apps-note">Set by your admin for ' + me.type.toLowerCase() + ' staff</span></div>' +
      '<div class="apps-row">' + set.map(function (a) {
        return '<button class="app-chip" data-act="open-app" data-app="' + a + '"><span class="at-ic">' + ic(D.APPS[a].ic, 20) + '</span><span class="ac-text"><span class="ac-name">' + a + '</span><span class="ac-desc">' + D.APPS[a].desc + '</span></span><span class="ac-go">' + ic('external-link', 14) + '</span></button>';
      }).join('') + '</div></section>';
  }
  function widget(key, title, app, body, extra) {
    var state = S.widget, inner;
    if (S.refreshing[key]) inner = '<div class="w-skel" aria-hidden="true"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div><span class="sr-only">Loading</span>';
    else if (state === 'down' && key === 'req') inner = '<div class="w-down">' + ic('circle-alert', 20) + '<div><div class="fw-medium">skySupport is not responding</div><div class="t-1 text-low">Your requests are safe. The rest of Home still works. Try again in a few minutes.</div></div></div>' + btn('Try again', 'btn-surface', 'refresh-cw', 'data-act="w-refresh" data-w="req"', 'is-sm');
    else if (state === 'empty') inner = '<div class="w-empty"><span class="w-empty-ic">' + ic(extra.emptyIc, 22) + '</span><div class="fw-medium">' + extra.emptyT + '</div><div class="t-1 text-low">' + extra.emptyB + '</div></div>';
    else inner = body;
    return '<section class="card widget"><div class="w-head"><div><div class="panel-title t-4">' + title + '</div><div class="panel-sub">from ' + app + '</div></div>' +
      '<button class="btn btn-ghost is-icon is-sm" aria-label="Refresh ' + title + '" title="Refresh" data-act="w-refresh" data-w="' + key + '">' + ic('refresh-cw', 14) + '</button></div>' +
      '<div class="w-body">' + inner + '</div>' +
      '<div class="w-foot">' + (extra.foot || '') + '<button class="link w-open" data-act="open-app" data-app="' + app + '">Open in app ' + ic('external-link', 14) + '</button></div></section>';
  }
  function widgetsHtml() {
    var learn = D.LEARNING.slice().sort(function (a, b) { return a.dueN - b.dueN; }).slice(0, 3).map(function (l) {
      return '<button class="w-item' + (l.dueN < 0 ? ' is-overdue' : '') + '" data-act="open-app" data-app="skyLearn" data-what="' + esc(l.t) + '"><span class="wi-main"><span class="wi-title">' + esc(l.t) + '</span><span class="wi-sub">' + ic('clock', 12) + l.mins + ' min to complete</span></span><span class="wi-side">' + dueLabel(l.dueN, l.due) + '</span></button>';
    }).join('');
    var sh = myShifts().map(function (s) {
      return '<button class="w-item" data-act="open-app" data-app="skySchedule" data-what="Shift on ' + s.d + '"><span class="wi-date"><span>' + s.d.split(' ')[0] + '</span><b>' + s.d.split(' ')[1] + '</b></span><span class="wi-main"><span class="wi-title">' + s.time + '</span><span class="wi-sub">' + esc(s.where) + '</span></span>' + (s.today ? '<span class="wi-side">' + badge('Today', 'is-info') + '</span>' : '') + '</button>';
    }).join('');
    var reqs = D.REQUESTS.slice().sort(function (a, b) { return (b.open ? 1 : 0) - (a.open ? 1 : 0); }).map(function (r) {
      return '<button class="w-item' + (r.open ? '' : ' is-closed') + '" data-act="open-app" data-app="skySupport" data-what="Ticket ' + r.n + '"><span class="wi-main"><span class="wi-title"><span class="wi-num">' + r.n + '</span> ' + esc(r.t) + '</span><span class="wi-sub">Updated ' + r.upd + '</span></span><span class="wi-side">' + APP.statusBadge(r.s) + '</span></button>';
    }).join('');
    return '<div class="widgets">' +
      widget('learn', 'My Learning', 'skyLearn', learn, { emptyIc: 'graduation-cap', emptyT: 'You are all caught up', emptyB: 'No courses are due. Nice work.', foot: '<span class="t-1 text-low">' + D.LEARNING.length + ' due</span>' }) +
      widget('sched', 'My Schedule', 'skySchedule', sh, { emptyIc: 'calendar-days', emptyT: 'No shifts in the next 7 days', emptyB: 'Enjoy the time off. New shifts appear here as soon as they are published.', foot: '<span class="t-1 text-low">Overtime this period: <b class="text-high">4.5 hrs</b></span>' }) +
      widget('req', 'My Requests', 'skySupport', reqs, { emptyIc: 'message-square-text', emptyT: 'No requests', emptyB: 'Anything you raise in skySupport shows up here.', foot: '<span class="t-1 text-low">2 open</span>' }) +
      '</div>';
  }
  A['w-refresh'] = function (el) {
    var k = el.getAttribute('data-w'); S.refreshing[k] = true; if (S.widget === 'down' && k === 'req') S.widget = 'normal'; APP.rerender();
    setTimeout(function () { S.refreshing[k] = false; if (S.route[0] === 'home') APP.rerender(); }, 800);
  };

  /* ---------- feed ---------- */
  var FILTERS = ['All', 'Announcements', 'Spotlights', 'Shout-outs', 'Polls', 'Surveys', 'Videos', 'Posts'];
  var FMAP = { Announcements: 'Announcement', Spotlights: 'Spotlight', 'Shout-outs': 'Shout-out', Polls: 'Poll', Surveys: 'Survey', Videos: 'Video', Posts: 'Post' };
  function canModerate(p) { return APP.isAdmin() || (APP.isCtrl() && (p.audience === 'Everyone' ? P(p.author).loc === APP.scope()[0] : APP.scope().indexOf(p.audience) >= 0)); }
  APP.canModerate = canModerate;

  function feedPosts() {
    var me = APP.me();
    return D.POSTS.filter(function (p) {
      if (p.removed) return false;
      if (p.hidden && !canModerate(p)) return false;
      if (p.audience !== 'Everyone' && p.audience !== me.loc && p.audience !== me.type && !APP.isAdmin() && p.author !== me.id) return false;
      if (S.feed === 'All') return true;
      if (S.feed === 'Posts') return p.type === 'Post' || p.type === 'E-card';
      return p.type === FMAP[S.feed];
    }).sort(function (a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0); });
  }

  function postHtml(p) {
    var me = APP.me(), au = P(p.author), tb = { Announcement: 'is-info', Poll: '', Survey: '', Video: '', Spotlight: '', 'Shout-out': '', 'E-card': '' };
    var typeBadge = p.type !== 'Post' ? badge(p.type, tb[p.type] != null && tb[p.type] ? tb[p.type] : '') : '';
    var aud = p.audience === 'Everyone' ? ic('globe', 12) + 'Everyone' : ic('map-pin', 12) + esc(p.audience);
    var head = '<div class="post-head">' + av(au, 40) + '<div class="post-meta"><div class="post-author"><button class="link-plain" data-act="profile" data-id="' + au.id + '">' + esc(au.name) + '</button>' +
      (p.to && p.type !== 'Spotlight' ? ' <span class="text-low fw-regular">to</span> ' + p.to.map(function (t) { return '<button class="link-plain" data-act="profile" data-id="' + t + '">' + esc(P(t).name) + '</button>'; }).join(', ') : '') + '</div>' +
      '<div class="post-sub">' + esc(au.title) + ' · ' + p.time + ' · <span class="post-aud">' + aud + '</span>' + (p.edited ? ' · Edited' : '') + '</div></div>' +
      '<div class="post-badges">' + (p.pinned ? badge('Pinned', 'is-neutral', 'pin') : '') + typeBadge + '</div>' +
      '<span class="pop-anchor"><button class="btn btn-ghost is-icon is-sm" aria-label="Post options" data-act="toggle-pop" data-pop="pm-' + p.id + '">' + ic('ellipsis', 16) + '</button>' +
      '<div class="dropdown-menu pop post-menu" id="pm-' + p.id + '" hidden>' + postMenu(p) + '</div></span></div>';

    var body = '';
    if (p.hidden) body += APP.callout('<b>Hidden from the feed.</b> Only moderators can see this post.', 'is-warning', 'eye-off');
    if (p.title && p.type !== 'Video') body += '<div class="post-title">' + esc(p.title) + '</div>';
    if (p.type === 'Spotlight') body = '<div class="spot-art" aria-hidden="true">' + av(P(p.to[0]), 72) + '<span class="spot-ic">' + ic('sparkles', 20) + '</span></div>' + body;
    body += '<p class="post-text">' + mention(esc(p.text)) + '</p>';

    if (p.type === 'Poll') body += pollHtml(p);
    if (p.type === 'Video') body += '<div class="post-title">' + esc(p.title) + '</div>' + videoHtml(p.id, p.dur);
    if (p.photos) body += galleryHtml(p);
    if (p.type === 'Shout-out') {
      var bd = D.BADGES.filter(function (b) { return b.id === p.badge; })[0];
      if (bd) body += '<div class="award-chip"><span class="aw-ic avatar ' + bd.tone + '">' + ic(bd.ic, 16) + '</span><span><span class="t-1 text-low">Award badge</span><span class="aw-name">' + esc(bd.name) + '</span></span></div>';
      if (p.gift && p.to.indexOf(me.id) >= 0) body += '<div class="gift-note">' + ic('gift', 16) + '<span>A gift card came with this shout-out. Only you can see it.</span><a class="link" href="#/rewards">View in My Rewards</a></div>';
    }
    if (p.type === 'E-card') { var d = D.ECARD_DESIGNS.filter(function (x) { return x.id === p.design; })[0]; body += APP.ecardArt(d, 'is-inline'); }
    if (p.type === 'Survey') body += surveyCard(p.survey);
    if (p.type === 'Spotlight') body += '<button class="btn btn-soft is-sm" data-act="compose" data-type="Shout-out" data-to="' + p.to[0] + '">' + ic('award', 16, 'btn-icon') + 'Give ' + esc(P(p.to[0]).name.split(' ')[0]) + ' a shout-out</button>';

    var ncom = p.comments.length;
    var stats = '<div class="post-stats"><button class="link-plain" data-act="who-reacted" data-id="' + p.id + '">' + ic('thumbs-up', 14) + ' ' + p.likes + '</button><span>' + (p.commentsOff ? 'Comments off' : '<button class="link-plain" data-act="toggle-comments" data-id="' + p.id + '">' + ncom + (ncom === 1 ? ' comment' : ' comments') + '</button>') + '</span></div>';
    var actions = '<div class="post-actions">' +
      '<button class="pa-btn' + (p.liked ? ' is-on' : '') + '" aria-pressed="' + !!p.liked + '" data-act="like" data-id="' + p.id + '">' + ic('thumbs-up', 16) + '<span>' + (p.liked ? 'Liked' : 'Like') + '</span></button>' +
      (p.commentsOff ? '' : '<button class="pa-btn" data-act="toggle-comments" data-id="' + p.id + '">' + ic('message-circle', 16) + '<span>Comment</span></button>') +
      '<button class="pa-btn" data-act="share" data-id="' + p.id + '">' + ic('share-2', 16) + '<span>Share</span></button></div>';
    var comments = S.openComments[p.id] && !p.commentsOff ? commentsHtml(p) : '';
    return '<article class="card post" id="post-' + p.id + '">' + head + '<div class="post-body">' + body + '</div>' + stats + actions + comments + '</article>';
  }
  APP.postHtml = postHtml;
  function mention(t) { return t.replace(/@([A-Z][a-z]+ [A-Z][a-z]+)/g, '<span class="mention">@$1</span>'); }
  function postMenu(p) {
    var me = APP.me(), items = [];
    items.push(['link-2', 'Copy link', 'copy', 'data-what="Link to the post copied. It only opens inside skyEmployee."']);
    if (p.author === me.id) { items.push(['pencil', 'Edit', 'edit-post']); items.push(['trash-2', 'Delete', 'delete-post']); }
    if (p.type === 'Announcement' && (p.author === me.id || APP.isAdmin())) items.push(['message-square', p.commentsOff ? 'Turn comments on' : 'Turn comments off', 'toggle-comments-off']);
    if (p.type === 'Announcement' && canModerate(p)) items.push(['pin', p.pinned ? 'Unpin' : 'Pin to top', 'toggle-pin']);
    if (p.author !== me.id) items.push(['flag', 'Report', 'report-post']);
    if (canModerate(p) && p.author !== me.id) { items.push(['eye-off', p.hidden ? 'Show in feed' : 'Hide from feed', 'hide-post']); items.push(['ban', 'Remove', 'remove-post']); }
    return items.map(function (i) { return '<div class="list-item" data-act="' + i[2] + '" data-id="' + p.id + '" ' + (i[3] || '') + '><span class="list-check">' + ic(i[0], 16) + '</span>' + i[1] + '</div>'; }).join('');
  }
  function pollHtml(p) {
    var total = p.options.reduce(function (s, o) { return s + o.v; }, 0);
    var show = p.voted != null && (p.showAfter === 'vote' || p.closed);
    var h = '<div class="poll" role="group" aria-label="Poll options">' + p.options.map(function (o, i) {
      var pct = total ? Math.round(o.v / total * 100) : 0, mine = p.voted === i;
      return '<button class="poll-opt' + (mine ? ' is-mine' : '') + (show ? ' is-result' : '') + '" data-act="vote" data-id="' + p.id + '" data-i="' + i + '" aria-pressed="' + mine + '"' + (p.closed ? ' disabled' : '') + '>' +
        (show ? '<span class="poll-fill" style="width:' + pct + '%"></span>' : '') + '<span class="poll-label">' + (mine ? ic('circle-check', 16) : '<span class="poll-radio"></span>') + esc(o.t) + '</span>' + (show ? '<span class="poll-pct">' + pct + '%</span>' : '') + '</button>';
    }).join('') + '</div>';
    h += '<div class="poll-foot">' + total + ' votes · ' + (p.closed ? 'Closed' : 'Closes ' + p.closes) + (p.anon ? ' · Anonymous' : '') +
      (p.voted != null && !p.closed ? ' · Tap another option to change your vote' : '') + (p.voted == null ? ' · Results show after you vote' : '') + '</div>';
    return h;
  }
  function videoHtml(id, dur) {
    var on = S.playing[id];
    return '<button class="video' + (on ? ' is-playing' : '') + '" data-act="play" data-id="' + id + '" aria-label="' + (on ? 'Pause' : 'Play') + ' video, ' + dur + '">' +
      '<span class="video-ic">' + ic(on ? 'pause' : 'play', 24) + '</span><span class="video-dur">' + ic('clock', 12) + dur + '</span>' + (on ? '<span class="video-bar"><span></span></span>' : '') + '</button>';
  }
  APP.videoHtml = videoHtml;
  function galleryHtml(p) {
    var i = S.gallery[p.id] || 0, n = p.photos, tones = ['c2', 'c5', 'c8'];
    return '<div class="gallery"><div class="gal-img ' + tones[i % 3] + '" aria-label="Photo ' + (i + 1) + ' of ' + n + '">' + ic('image', 36) + '<span class="gal-count">' + (i + 1) + ' / ' + n + '</span></div>' +
      '<button class="gal-arrow is-prev" aria-label="Previous photo" data-act="gal" data-id="' + p.id + '" data-d="-1">' + ic('chevron-left', 18) + '</button><button class="gal-arrow is-next" aria-label="Next photo" data-act="gal" data-id="' + p.id + '" data-d="1">' + ic('chevron-right', 18) + '</button>' +
      '<div class="gal-dots">' + Array.apply(null, Array(n)).map(function (_, k) { return '<span class="' + (k === i ? 'is-active' : '') + '"></span>'; }).join('') + '</div></div>';
  }
  function surveyCard(id) {
    var sv = D.SURVEYS.filter(function (s) { return s.id === id; })[0], st = S.surveyState[id] || {};
    var cta = st.done ? badge('Thanks, you answered', 'is-success', 'circle-check') : st.optedOut ? badge('You opted out', 'is-neutral') :
      btn(st.started ? 'Continue survey' : 'Start survey', 'btn-soft', st.started ? 'arrow-right' : 'play', 'data-act="start-survey" data-id="' + id + '"', 'is-sm');
    return '<div class="survey-card"><span class="sc-ic">' + ic('clipboard-list', 20) + '</span><div class="sc-text"><div class="fw-medium">' + esc(sv.title) + '</div><div class="t-1 text-low">' + (sv.questions ? sv.questions.length : 5) + ' questions · about ' + sv.mins + ' min · ' + (sv.anon ? 'Anonymous' : 'Attributed') + ' · closes ' + sv.closes + '</div></div>' + cta + '</div>';
  }
  function commentsHtml(p) {
    var me = APP.me();
    return '<div class="comments">' + p.comments.map(function (c, i) {
      var a = P(c.a);
      return '<div class="comment">' + av(a, 28) + '<div class="cm-main"><div class="cm-bubble"><button class="link-plain fw-medium" data-act="profile" data-id="' + a.id + '">' + esc(a.name) + '</button><div>' + mention(esc(c.t)) + '</div></div>' +
        '<div class="cm-actions"><span>' + c.time + '</span><button class="link-plain' + (c.liked ? ' is-on' : '') + '" data-act="like-comment" data-id="' + p.id + '" data-i="' + i + '">Like' + (c.likes ? ' · ' + c.likes : '') + '</button><button class="link-plain" data-act="reply" data-id="' + p.id + '" data-name="' + esc(a.name) + '">Reply</button>' +
        (c.a === me.id ? '<button class="link-plain" data-act="delete-comment" data-id="' + p.id + '" data-i="' + i + '">Delete</button>' : '<button class="link-plain" data-act="report-post" data-id="' + p.id + '" data-comment="1">Report</button>') + '</div></div></div>';
    }).join('') +
      '<div class="comment is-new">' + av(me, 28) + '<div class="search cm-input"><input class="input" id="ci-' + p.id + '" placeholder="Write a comment. Use @ to mention." data-enter="add-comment" data-id="' + p.id + '" aria-label="Write a comment"></div>' + btn('', 'btn-soft is-icon', 'send-horizontal', 'aria-label="Send comment" data-act="add-comment" data-id="' + p.id + '"') + '</div></div>';
  }
  function findPost(id) { return D.POSTS.filter(function (p) { return p.id === id; })[0]; }
  APP.findPost = findPost;
  function refreshPost(id) { var el = document.getElementById('post-' + id); var p = findPost(id); if (el && p) { el.outerHTML = postHtml(p); } else APP.rerender(); }

  A.like = function (el) { var p = findPost(el.getAttribute('data-id')); p.liked = !p.liked; p.likes += p.liked ? 1 : -1; refreshPost(p.id); };
  A['like-comment'] = function (el) { var p = findPost(el.getAttribute('data-id')), c = p.comments[+el.getAttribute('data-i')]; c.liked = !c.liked; c.likes = (c.likes || 0) + (c.liked ? 1 : -1); refreshPost(p.id); };
  A['toggle-comments'] = function (el) { var id = el.getAttribute('data-id'); S.openComments[id] = !S.openComments[id]; refreshPost(id); if (S.openComments[id]) setTimeout(function () { var i = document.getElementById('ci-' + id); if (i) i.focus(); }, 20); };
  A['add-comment'] = function (el) {
    var id = el.getAttribute('data-id'), i = document.getElementById('ci-' + id); if (!i || !i.value.trim()) return;
    findPost(id).comments.push({ a: APP.me().id, t: i.value.trim(), time: 'now', likes: 0 }); refreshPost(id);
    setTimeout(function () { var n = document.getElementById('ci-' + id); if (n) n.focus(); }, 20);
  };
  A.reply = function (el) { var i = document.getElementById('ci-' + el.getAttribute('data-id')); if (i) { i.value = '@' + el.getAttribute('data-name') + ' '; i.focus(); } };
  A['delete-comment'] = function (el) { var p = findPost(el.getAttribute('data-id')); p.comments.splice(+el.getAttribute('data-i'), 1); refreshPost(p.id); APP.toast('Comment deleted'); };
  A.vote = function (el) {
    var p = findPost(el.getAttribute('data-id')), i = +el.getAttribute('data-i');
    if (p.voted === i) return; if (p.voted != null) p.options[p.voted].v--; p.options[i].v++;
    var changed = p.voted != null; p.voted = i; refreshPost(p.id); APP.toast(changed ? 'Vote changed' : 'Vote counted', p.anon ? 'Your vote is anonymous.' : '');
  };
  A.play = function (el) { var id = el.getAttribute('data-id'); S.playing[id] = !S.playing[id]; el.outerHTML = videoHtml(id, el.querySelector('.video-dur').textContent); };
  A.gal = function (el) { var p = findPost(el.getAttribute('data-id')); S.gallery[p.id] = ((S.gallery[p.id] || 0) + (+el.getAttribute('data-d')) + p.photos) % p.photos; refreshPost(p.id); };
  A['feed-filter'] = function (el) { S.feed = el.getAttribute('data-f'); var f = document.getElementById('feedList'); document.querySelectorAll('.feed-filters .toggle').forEach(function (t) { var on = t.getAttribute('data-f') === S.feed; t.classList.toggle('is-on', on); t.setAttribute('aria-pressed', on); }); f.innerHTML = feedListHtml(); };
  function feedListHtml() {
    var list = feedPosts();
    if (!list.length) return '<section class="card">' + APP.emptyState('message-square', 'Nothing here yet', 'No ' + S.feed.toLowerCase() + ' in your community feed right now.', btn('Show everything', 'btn-solid', null, 'data-act="feed-filter" data-f="All"')) + '</section>';
    return list.map(postHtml).join('');
  }
  A['who-reacted'] = function (el) {
    var p = findPost(el.getAttribute('data-id')); var ids = ['dev', 'ana', 'maria', 'lina', 'omar', 'tomas', 'james'];
    APP.dialog({ title: p.likes + ' reactions', body: '<div class="plist">' + ids.map(function (i) { return '<div class="plist-row">' + APP.personLine(i, P(i).title + ' · ' + P(i).loc) + '<span class="text-low">' + ic('thumbs-up', 14) + '</span></div>'; }).join('') + (p.likes > ids.length ? '<p class="t-1 text-low">and ' + (p.likes - ids.length) + ' others</p>' : '') + '</div>' });
  };
  A.share = function (el) {
    var id = el.getAttribute('data-id'); S.pick.share = [];
    APP.dialog({ title: 'Share post', sub: 'The people or group you pick get a notification with a link to this post.',
      body: APP.picker('share', 'Colleagues or groups', true) + APP.field('Add a note (optional)', '<textarea class="textarea" placeholder="Thought you would like this"></textarea>') +
        '<div class="share-copy"><span class="t-1 text-low">' + ic('lock', 14) + ' Links only open inside skyEmployee.</span>' + btn('Copy link', 'btn-surface', 'link-2', 'data-act="copy" data-what="Link copied."', 'is-sm') + '</div>',
      footer: btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn('Share', 'btn-solid', 'send', 'data-act="do-share"') });
  };
  A['do-share'] = function () { var n = S.pick.share.length; if (!n) { APP.toast('Pick someone to share with', '', 'warning'); return; } APP.closeOverlay(); APP.toast('Shared with ' + n + (n === 1 ? ' person' : ' people'), 'They will get a notification.'); };
  A['report-post'] = function (el) {
    APP.closePops(); var p = findPost(el.getAttribute('data-id'));
    var loc = p.audience === 'Everyone' ? P(p.author).loc : p.audience;
    APP.dialog({ title: 'Report this ' + (el.getAttribute('data-comment') ? 'comment' : 'post'), sub: 'Reports go to Admins and the manager responsible for ' + esc(loc) + '. The author is not told who reported it.',
      body: '<div class="radio-list">' + ['It shares resident information', 'It is offensive or harassing', 'It is spam or not work related', 'It is false or misleading', 'Something else'].map(function (r, i) {
        return '<label class="radio"><input type="radio" name="rep" ' + (i === 0 ? 'checked' : '') + '> ' + r + '</label>'; }).join('') + '</div>' + APP.field('Details (optional)', '<textarea class="textarea" placeholder="Anything that helps the reviewer"></textarea>'),
      footer: btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn('Send report', 'btn-solid', 'flag', 'data-act="do-report"') });
  };
  A['do-report'] = function () { APP.closeOverlay(); APP.toast('Report sent', 'Thanks. A moderator will review it.'); };
  A['edit-post'] = function (el) {
    APP.closePops(); var p = findPost(el.getAttribute('data-id'));
    APP.dialog({ title: 'Edit post', body: '<textarea class="textarea tall" id="editText">' + esc(p.text) + '</textarea>', footer: btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn('Save changes', 'btn-solid', null, 'data-act="save-edit" data-id="' + p.id + '"') });
  };
  A['save-edit'] = function (el) { var p = findPost(el.getAttribute('data-id')); p.text = document.getElementById('editText').value; p.edited = true; APP.closeOverlay(); refreshPost(p.id); APP.toast('Post updated'); };
  A['delete-post'] = function (el) {
    APP.closePops(); var id = el.getAttribute('data-id');
    APP.alert('Delete this post?', 'It is removed from the feed for everyone, along with its comments and reactions. This cannot be undone.', 'Delete post', 'do-delete', 'data-id="' + id + '"');
  };
  A['do-delete'] = function (el) { findPost(el.getAttribute('data-id')).removed = true; APP.closeOverlay(); APP.rerender(); APP.toast('Post deleted'); };
  A['hide-post'] = function (el) { var p = findPost(el.getAttribute('data-id')); p.hidden = !p.hidden; APP.closePops(); APP.rerender(); APP.toast(p.hidden ? 'Post hidden' : 'Post visible again', p.hidden ? 'Only moderators can see it now. The author is notified.' : ''); };
  A['remove-post'] = function (el) { APP.closePops(); APP.alert('Remove this post?', 'The post is removed for everyone and the author is told it broke community guidelines.', 'Remove post', 'do-delete', 'data-id="' + el.getAttribute('data-id') + '"'); };
  A['toggle-pin'] = function (el) { var p = findPost(el.getAttribute('data-id')); p.pinned = !p.pinned; APP.closePops(); APP.rerender(); APP.toast(p.pinned ? 'Pinned to the top of the feed' : 'Unpinned'); };
  A['toggle-comments-off'] = function (el) { var p = findPost(el.getAttribute('data-id')); p.commentsOff = !p.commentsOff; APP.closePops(); refreshPost(p.id); APP.toast(p.commentsOff ? 'Comments turned off' : 'Comments turned on'); };

  APP.alert = function (title, body, confirm, act, attrs) {
    document.getElementById('overlayHost').insertAdjacentHTML('beforeend', '<div class="overlay" data-overlay><div class="alert-dialog" role="alertdialog" aria-modal="true"><div class="ad-title">' + title + '</div><div class="ad-body">' + body + '</div><div class="ad-footer">' +
      btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn(confirm, 'btn-solid is-danger', null, 'data-act="' + act + '" ' + (attrs || '')) + '</div></div></div>');
  };

  /* ---------- people picker (shared) ---------- */
  APP.picker = function (key, label, groups, scopeOnly) {
    return '<div class="field picker" data-picker="' + key + '"><span class="field-label">' + label + '</span><div class="picker-box"><span class="picker-chips" id="pk-chips-' + key + '">' + chips(key) + '</span>' +
      '<input class="picker-input" placeholder="Type a name" data-input="pick-search" data-key="' + key + '" data-groups="' + (groups ? 1 : '') + '" data-scope="' + (scopeOnly ? 1 : '') + '" aria-label="' + esc(label) + '"></div>' +
      '<div class="picker-results" id="pk-res-' + key + '" hidden></div></div>';
  };
  function chips(key) {
    return (S.pick[key] || []).map(function (id) { var nm = id.indexOf('g:') === 0 ? id.slice(2) : P(id).name; return '<span class="tag">' + (id.indexOf('g:') === 0 ? ic('users', 12) : av(P(id), 16)) + esc(nm) + '<button class="tag-dismiss" aria-label="Remove ' + esc(nm) + '" data-act="pick-remove" data-key="' + key + '" data-id="' + esc(id) + '">' + ic('x', 12) + '</button></span>'; }).join('');
  }
  APP.INPUT['pick-search'] = function (el) {
    var key = el.getAttribute('data-key'), q = el.value.trim().toLowerCase(), res = document.getElementById('pk-res-' + key);
    if (!q) { res.hidden = true; return; }
    var me = APP.me(), sel = S.pick[key] || [];
    var list = D.PEOPLE.filter(function (p) { return p.id !== me.id && sel.indexOf(p.id) < 0 && (!el.getAttribute('data-scope') || APP.inScope(p.loc)) && (p.name + ' ' + p.title).toLowerCase().indexOf(q) >= 0; }).slice(0, 5);
    var html = list.map(function (p) { return '<button class="sp-item" data-act="pick-add" data-key="' + key + '" data-id="' + p.id + '">' + av(p, 24) + '<span class="sp-text"><span>' + esc(p.name) + '</span><span class="sp-sub">' + esc(p.title) + ' · ' + esc(p.loc) + '</span></span></button>'; }).join('');
    if (el.getAttribute('data-groups')) ['Maple Grove nursing team', 'Maple Grove dining team', 'Corporate HR'].filter(function (g) { return g.toLowerCase().indexOf(q) >= 0; }).forEach(function (g) { html += '<button class="sp-item" data-act="pick-add" data-key="' + key + '" data-id="g:' + g + '"><span class="sp-ic">' + ic('users', 16) + '</span><span class="sp-text"><span>' + g + '</span><span class="sp-sub">Group</span></span></button>'; });
    res.innerHTML = html || '<div class="sp-empty">No colleagues match. ' + (el.getAttribute('data-scope') ? 'You can only pick people in your scope.' : '') + '</div>'; res.hidden = false;
  };
  A['pick-add'] = function (el) {
    var key = el.getAttribute('data-key'); (S.pick[key] = S.pick[key] || []).push(el.getAttribute('data-id'));
    document.getElementById('pk-chips-' + key).innerHTML = chips(key); document.getElementById('pk-res-' + key).hidden = true;
    var i = document.querySelector('[data-picker="' + key + '"] .picker-input'); i.value = ''; i.focus();
    if (APP.onPick) APP.onPick(key);
  };
  A['pick-remove'] = function (el) { var key = el.getAttribute('data-key'); S.pick[key] = (S.pick[key] || []).filter(function (x) { return x !== el.getAttribute('data-id'); }); document.getElementById('pk-chips-' + key).innerHTML = chips(key); if (APP.onPick) APP.onPick(key); };

  /* ---------- composer ---------- */
  S.compose = { type: 'Post', attach: [], gift: false, pollOpts: ['', ''], badge: null, pin: true, comments: true, showAfter: 'vote', anon: true };
  A.compose = function (el) {
    var t = el && el.getAttribute && el.getAttribute('data-type');
    S.compose = { type: t || 'Post', attach: [], gift: false, pollOpts: ['', ''], badge: null, pin: true, comments: true, showAfter: 'vote', anon: true, rt: 'rt1' };
    S.pick.compose = el && el.getAttribute && el.getAttribute('data-to') ? [el.getAttribute('data-to')] : [];
    S.f.audience = 'Everyone'; S.f.pollClose = '3 days'; S.f.pinUntil = '1 week';
    openComposer();
  };
  function composerTypes() { var t = ['Post', 'Shout-out']; if (APP.canManage()) t = t.concat(['Poll', 'Announcement', 'Spotlight']); return t; }
  function openComposer() {
    APP.closeAll();
    APP.dialog({ title: 'Create', size: 'is-wide', body: '<div id="composerBody">' + composerBody() + '</div>', footer: '<span class="dlg-foot-note" id="composerNote">' + composerNote() + '</span>' + btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn(submitLabel(), 'btn-solid', 'send', 'data-act="submit-post" id="composerSubmit"'), noFocus: true });
  }
  function submitLabel() { return { Post: 'Post', 'Shout-out': 'Give shout-out', Poll: 'Publish poll', Announcement: 'Publish', Spotlight: 'Publish spotlight' }[S.compose.type]; }
  function composerNote() {
    var c = S.compose;
    if (!APP.canManage()) return ic('globe', 14) + ' Visible to everyone at ' + esc(D.ORG);
    return ic(S.f.audience === 'Everyone' ? 'globe' : 'map-pin', 14) + ' Audience: ' + esc(S.f.audience);
  }
  function audienceField() {
    if (!APP.canManage()) return '';
    var opts = APP.isAdmin() ? ['Everyone', 'Maple Grove', 'Riverside Commons', 'Cedar Hills', 'Corporate Office', 'Frontline', 'Office'] : ['Maple Grove', 'Maple Grove nursing team', 'Maple Grove dining team', 'Frontline at Maple Grove'];
    if (APP.isCtrl() && S.f.audience === 'Everyone') S.f.audience = 'Maple Grove';
    return APP.field('Audience', APP.dd('audience', opts, S.f.audience, 'dd-block'), APP.isCtrl() ? 'You can target the locations and teams you manage.' : 'Target everyone, a location, a team or an employee type.');
  }
  function composerBody() {
    var c = S.compose, me = APP.me(), h = '<div class="segmented is-brand composer-types" role="tablist">' + composerTypes().map(function (t) {
      return '<button class="segmented-item' + (c.type === t ? ' is-active' : '') + '" role="tab" aria-selected="' + (c.type === t) + '" data-act="compose-type" data-t="' + t + '">' + t + '</button>'; }).join('') + '</div><div class="stack-4">';
    if (c.type === 'Post') {
      h += '<div class="composer-me">' + av(me, 36) + '<textarea class="textarea tall" id="cText" placeholder="Share something with your colleagues. Type @ to mention someone."></textarea></div>' +
        '<div class="attach-row">' + btn('Photo', 'btn-surface', 'image-plus', 'data-act="attach" data-k="Photo"', 'is-sm') + btn('Video', 'btn-surface', 'video', 'data-act="attach" data-k="Video"', 'is-sm') + btn('File', 'btn-surface', 'paperclip', 'data-act="attach" data-k="File"', 'is-sm') + btn('Mention', 'btn-surface', 'at-sign', 'data-act="insert-mention"', 'is-sm') + '</div>' +
        (c.attach.length ? '<div class="attach-list">' + c.attach.map(function (a, i) { return '<span class="tag">' + ic(a === 'Photo' ? 'image' : a === 'Video' ? 'film' : 'file', 12) + a.toLowerCase() + '-' + (i + 1) + (a === 'Video' ? '.mp4 · 0:48' : a === 'Photo' ? '.jpg' : '.pdf') + '<button class="tag-dismiss" aria-label="Remove" data-act="unattach" data-i="' + i + '">' + ic('x', 12) + '</button></span>'; }).join('') + '</div>' : '') + audienceField();
    } else if (c.type === 'Shout-out') {
      h += APP.picker('compose', 'Who are you recognising?', false) +
        APP.field('Message', '<textarea class="textarea" id="cText" placeholder="What did they do, and why did it matter?"></textarea>', null, true) +
        '<div class="field"><span class="field-label">Award badge <span class="text-low fw-regular">(optional)</span></span><div class="badge-pick">' + D.BADGES.map(function (b) {
          return '<button class="bp-item' + (c.badge === b.id ? ' is-selected' : '') + '" aria-pressed="' + (c.badge === b.id) + '" data-act="pick-badge" data-id="' + b.id + '"><span class="avatar ' + b.tone + '">' + ic(b.ic, 16) + '</span><span class="bp-name">' + b.name + '</span></button>'; }).join('') + '</div></div>';
      if (APP.canManage()) {
        h += '<div class="gift-attach' + (c.gift ? ' is-on' : '') + '"><label class="switch"><input type="checkbox" data-change="gift-toggle" ' + (c.gift ? 'checked' : '') + '><span class="fw-medium">Attach a gift card</span></label>' +
          '<span class="t-1 text-low">The value never appears in the feed. Only the recipient sees it in My Rewards.</span>';
        if (c.gift) h += '<div class="gift-attach-body">' + rewardTypePicker() + (APP.isCtrl() ? APP.meter('Your allowance this quarter', 160, 250, APP.money) : '') + '</div>';
        h += '</div>';
      }
      h += audienceField();
    } else if (c.type === 'Poll') {
      h += APP.field('Question', '<input class="input" id="cText" placeholder="Ask one clear question">', null, true) +
        '<div class="field"><span class="field-label">Answers <span class="text-low fw-regular">(2 to 5)</span></span><div class="stack-2">' + c.pollOpts.map(function (o, i) {
          return '<div class="poll-edit"><span class="poll-radio"></span><input class="input" value="' + esc(o) + '" placeholder="Answer ' + (i + 1) + '" data-input="poll-opt" data-i="' + i + '">' + (c.pollOpts.length > 2 ? btn('', 'btn-ghost is-icon is-sm', 'x', 'aria-label="Remove answer" data-act="poll-del" data-i="' + i + '"') : '') + '</div>'; }).join('') +
        (c.pollOpts.length < 5 ? btn('Add answer', 'btn-ghost', 'plus', 'data-act="poll-add"', 'is-sm') : '') + '</div></div>' +
        '<div class="form-grid">' + APP.field('Closes in', APP.dd('pollClose', ['1 day', '3 days', '1 week', '2 weeks'], S.f.pollClose, 'dd-block')) +
        '<div class="field"><span class="field-label">Show results</span><div class="segmented">' + [['vote', 'After voting'], ['close', 'After it closes']].map(function (x) { return '<button class="segmented-item' + (c.showAfter === x[0] ? ' is-active' : '') + '" data-act="compose-set" data-k="showAfter" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div></div>' +
        '<label class="switch"><input type="checkbox" ' + (c.anon ? 'checked' : '') + ' data-change="compose-anon"><span>Anonymous votes</span></label>' + audienceField();
    } else if (c.type === 'Announcement') {
      h += APP.field('Headline', '<input class="input" id="cTitle" placeholder="What is happening?">', null, true) + APP.field('Message', '<textarea class="textarea tall" id="cText" placeholder="The details people need"></textarea>', null, true) +
        '<div class="attach-row">' + btn('Image', 'btn-surface', 'image-plus', 'data-act="attach" data-k="Photo"', 'is-sm') + btn('File', 'btn-surface', 'paperclip', 'data-act="attach" data-k="File"', 'is-sm') + '</div>' +
        audienceField() +
        '<div class="form-grid"><div class="field"><label class="switch"><input type="checkbox" ' + (c.pin ? 'checked' : '') + ' data-change="compose-pin"><span class="fw-medium">Pin to top of feed</span></label>' + (c.pin ? APP.dd('pinUntil', ['3 days', '1 week', '2 weeks', 'Until Sep 30'], S.f.pinUntil, 'dd-block') : '') + '</div>' +
        '<div class="field"><label class="switch"><input type="checkbox" ' + (c.comments ? 'checked' : '') + ' data-change="compose-comments"><span class="fw-medium">Allow comments</span></label><span class="field-hint">You can change this after publishing.</span></div></div>';
    } else if (c.type === 'Spotlight') {
      h += APP.picker('compose', 'Who are you featuring?', false, true) +
        '<div class="upload-drop" data-act="attach" data-k="Photo">' + ic('image-plus', 24) + '<span class="fw-medium">Add a photo</span><span class="t-1 text-low">Ask permission first. JPG or PNG.</span></div>' +
        APP.field('Headline', '<input class="input" id="cTitle" placeholder="Spotlight: name, what makes them great">') + APP.field('Their story', '<textarea class="textarea tall" id="cText" placeholder="A few sentences about who they are and what they did"></textarea>', null, true) + audienceField();
    }
    return h + '</div>';
  }
  function rewardTypePicker() {
    var types = D.REWARD_TYPES.filter(function (r) { return r.status === 'Active' && (r.restrict === 'All locations' || APP.isAdmin() || r.restrict.indexOf(APP.scope()[0]) >= 0 || r.restrict === 'Frontline only'); });
    return '<div class="radio-cards rt-cards">' + types.map(function (r) {
      var out = r.avail === 0;
      return '<button class="radio-card' + (S.compose.rt === r.id ? ' is-selected' : '') + (out ? ' is-disabled' : '') + '" data-act="pick-rt" data-id="' + r.id + '" aria-pressed="' + (S.compose.rt === r.id) + '"' + (out ? ' disabled' : '') + '><span class="rt-top"><span class="avatar ' + r.tone + '" style="width:24px;height:24px;">' + ic(r.ic, 14) + '</span>' + (out ? badge('Out of stock', 'is-danger') : '') + '</span><div class="rc-title">' + esc(r.name) + '</div><div class="rc-sub">' + (r.value ? APP.money(r.value) + ' · ' : '') + esc(r.kind) + '</div></button>';
    }).join('') + '</div>' + (types.some(function (r) { return r.avail === 0; }) ? '<span class="field-hint">Out of stock cards cannot be awarded. Ask an Admin to add stock.</span>' : '');
  }
  APP.rewardTypePicker = rewardTypePicker;
  function redrawComposer() { var b = document.getElementById('composerBody'); if (!b) return; b.innerHTML = composerBody(); document.getElementById('composerNote').innerHTML = composerNote(); var s = document.getElementById('composerSubmit'); if (s) s.querySelector('span').textContent = submitLabel(); }
  APP.DD = APP.DD || {};
  APP.DD.audience = function () { redrawComposer(); }; APP.DD.pollClose = redrawComposer; APP.DD.pinUntil = redrawComposer;
  A['compose-type'] = function (el) { var keep = document.getElementById('cText'); var txt = keep ? keep.value : ''; S.compose.type = el.getAttribute('data-t'); redrawComposer(); var n = document.getElementById('cText'); if (n && txt) n.value = txt; };
  A['compose-set'] = function (el) { S.compose[el.getAttribute('data-k')] = el.getAttribute('data-v'); redrawComposer(); };
  A.attach = function (el) { S.compose.attach.push(el.getAttribute('data-k')); var t = document.getElementById('cText'), v = t ? t.value : ''; redrawComposer(); if (document.getElementById('cText')) document.getElementById('cText').value = v; APP.toast(el.getAttribute('data-k') + ' attached', 'In the real app this opens your camera roll or files.', 'info'); };
  A.unattach = function (el) { S.compose.attach.splice(+el.getAttribute('data-i'), 1); redrawComposer(); };
  A['insert-mention'] = function () { var t = document.getElementById('cText'); if (t) { t.value += (t.value && !/\s$/.test(t.value) ? ' ' : '') + '@Maria Gonzalez '; t.focus(); } };
  A['pick-badge'] = function (el) { var id = el.getAttribute('data-id'); S.compose.badge = S.compose.badge === id ? null : id; var t = document.getElementById('cText'), v = t ? t.value : ''; redrawComposer(); document.getElementById('cText').value = v; };
  A['pick-rt'] = function (el) { S.compose.rt = el.getAttribute('data-id'); var t = document.getElementById('cText'), v = t ? t.value : ''; redrawComposer(); if (document.getElementById('cText')) document.getElementById('cText').value = v; };
  A['poll-add'] = function () { readPollOpts(); S.compose.pollOpts.push(''); keepRedraw(); };
  A['poll-del'] = function (el) { readPollOpts(); S.compose.pollOpts.splice(+el.getAttribute('data-i'), 1); keepRedraw(); };
  function readPollOpts() { document.querySelectorAll('[data-input="poll-opt"]').forEach(function (i) { S.compose.pollOpts[+i.getAttribute('data-i')] = i.value; }); }
  function keepRedraw() { var t = document.getElementById('cText'), v = t ? t.value : ''; redrawComposer(); if (document.getElementById('cText')) document.getElementById('cText').value = v; }
  APP.INPUT['poll-opt'] = function (el) { S.compose.pollOpts[+el.getAttribute('data-i')] = el.value; };
  APP.INPUT['gift-toggle'] = function (el) { S.compose.gift = el.checked; keepRedraw(); };
  APP.INPUT['compose-anon'] = function (el) { S.compose.anon = el.checked; };
  APP.INPUT['compose-pin'] = function (el) { S.compose.pin = el.checked; keepRedraw(); };
  APP.INPUT['compose-comments'] = function (el) { S.compose.comments = el.checked; };
  A['submit-post'] = function () {
    var c = S.compose, me = APP.me(), txtEl = document.getElementById('cText'), text = txtEl ? txtEl.value.trim() : '', titleEl = document.getElementById('cTitle');
    var to = (S.pick.compose || []).filter(function (x) { return x.indexOf('g:') !== 0; });
    if ((c.type === 'Shout-out' || c.type === 'Spotlight') && !to.length) { APP.toast('Pick who this is for', '', 'warning'); return; }
    if (!text) { APP.toast(c.type === 'Poll' ? 'Add a question' : 'Add a message first', '', 'warning'); if (txtEl) txtEl.focus(); return; }
    readPollOpts();
    var opts = c.pollOpts.filter(function (o) { return o.trim(); });
    if (c.type === 'Poll' && opts.length < 2) { APP.toast('A poll needs at least 2 answers', '', 'warning'); return; }
    var aud = APP.canManage() ? S.f.audience : 'Everyone';
    var post = { id: 'n' + Date.now(), type: c.type, author: me.id, time: 'now', audience: aud, text: text, likes: 0, liked: false, comments: [] };
    if (titleEl && titleEl.value.trim()) post.title = titleEl.value.trim();
    if (c.type === 'Shout-out' || c.type === 'Spotlight') post.to = to;
    if (c.type === 'Spotlight' && !post.title) post.title = 'Spotlight: ' + P(to[0]).name;
    if (c.type === 'Shout-out') { post.badge = c.badge; }
    if (c.type === 'Poll') { post.options = opts.map(function (o) { return { t: o, v: 0 }; }); post.voted = null; post.closes = 'in ' + S.f.pollClose; post.showAfter = c.showAfter; post.anon = c.anon; }
    if (c.type === 'Announcement') { post.pinned = c.pin; post.commentsOff = !c.comments; }
    if (c.type === 'Post' && c.attach.indexOf('Photo') >= 0) post.photos = c.attach.filter(function (a) { return a === 'Photo'; }).length + 1;
    D.POSTS.unshift(post);
    var gift = '';
    if (c.type === 'Shout-out' && c.gift) {
      var rt = D.REWARD_TYPES.filter(function (r) { return r.id === c.rt; })[0];
      to.forEach(function (t) { rt.avail = Math.max(0, rt.avail - 1); D.AWARDS.unshift({ id: 'aw' + Date.now() + t, to: t, type: rt.id, from: me.id, date: 'Sep 15', msg: text, reason: 'Shout-out', status: rt.fulfil === 'task' ? 'Awarded' : 'Delivered', revealed: false, fulfilment: rt.fulfil === 'task', post: post.id }); });
      post.gift = true; gift = ' ' + to.length + ' ' + rt.name + (to.length > 1 ? 's' : '') + ' awarded from stock.';
    }
    APP.closeOverlay(); S.feed = 'All';
    if (S.route[0] !== 'home') location.hash = '#/home'; else APP.rerender();
    APP.toast({ Post: 'Posted', 'Shout-out': 'Shout-out posted', Poll: 'Poll published', Announcement: 'Announcement published', Spotlight: 'Spotlight published' }[c.type], (post.to ? post.to.map(function (t) { return P(t).name.split(' ')[0]; }).join(', ') + ' will get a notification.' : '') + gift);
  };

  /* ---------- survey taking ---------- */
  A['start-survey'] = function (el) {
    var id = el.getAttribute('data-id'); if (id !== 's1') { APP.toast('This survey is not assigned to you', '', 'info'); return; }
    APP.closePops(); var st = S.surveyState.s1;
    if (st.done) { APP.toast('You already answered this survey', 'Thanks for taking part.', 'info'); return; }
    S.sv = { i: st.started ? st.at : -1 }; openSurvey();
  };
  function openSurvey() { APP.closeAll(); APP.dialog({ title: D.SURVEYS[0].title, size: 'is-survey', body: '<div id="svBody">' + surveyBody() + '</div>', footer: '<div id="svFoot" class="sv-foot">' + surveyFoot() + '</div>', noFocus: true }); }
  function surveyBody() {
    var sv = D.SURVEYS[0], st = S.surveyState.s1, i = S.sv.i, n = sv.questions.length;
    if (i === -1) return '<div class="sv-intro"><div class="sv-intro-ic">' + ic('clipboard-list', 28) + '</div>' +
      '<p class="t-3">Six quick questions about how your month went. Most people finish in about ' + sv.mins + ' minutes.</p>' +
      APP.callout('<b>This survey is anonymous.</b> Your answers are stored with no link to you. We only record that you responded, so you stop getting reminders. Results for a group are only shown once at least 5 people have answered.', 'is-info', 'shield-check') +
      '<div class="data-list sv-facts"><span class="dl-label">Questions</span><span class="dl-value">' + n + ', most can be skipped</span><span class="dl-label">Time</span><span class="dl-value">About ' + sv.mins + ' minutes</span><span class="dl-label">Closes</span><span class="dl-value">' + sv.closes + '</span></div></div>';
    if (i >= n) return '<div class="sv-done">' + APP.emptyState('circle-check', 'Thank you', 'Your answers were submitted anonymously. Results are shared with everyone once the survey closes on ' + sv.closes + '.', btn('Back to Home', 'btn-solid', null, 'data-act="close-overlay"')) + '</div>';
    var q = sv.questions[i], a = st.answers[i], h = '<div class="sv-progress"><span class="t-1 text-low">Question ' + (i + 1) + ' of ' + n + (q.req ? ' · Required' : ' · Optional') + '</span><div class="progress"><div class="progress-fill" style="width:' + Math.round(i / n * 100) + '%"></div></div></div><h3 class="sv-q">' + esc(q.q) + '</h3>';
    if (q.type === 'rating' || q.type === 'rating10') {
      var max = q.type === 'rating' ? 5 : 10, min = q.type === 'rating' ? 1 : 0;
      h += '<div class="scale" role="radiogroup">' + Array.apply(null, Array(max - min + 1)).map(function (_, k) { var v = k + min; return '<button class="toggle scale-btn' + (a === v ? ' is-on' : '') + '" role="radio" aria-checked="' + (a === v) + '" data-act="sv-answer" data-v="' + v + '">' + v + '</button>'; }).join('') + '</div>' +
        '<div class="scale-ends"><span>' + (q.type === 'rating' ? 'Very poor' : 'Not likely') + '</span><span>' + (q.type === 'rating' ? 'Excellent' : 'Very likely') + '</span></div>';
    } else if (q.type === 'yesno' || q.type === 'single') {
      var opts = q.type === 'yesno' ? ['Yes', 'No'] : q.opts;
      h += '<div class="radio-cards sv-opts">' + opts.map(function (o) { return '<button class="radio-card' + (a === o ? ' is-selected' : '') + '" role="radio" aria-checked="' + (a === o) + '" data-act="sv-answer" data-v="' + esc(o) + '"><div class="rc-title">' + esc(o) + '</div></button>'; }).join('') + '</div>';
    } else if (q.type === 'multi') {
      a = a || [];
      h += '<div class="stack-2">' + q.opts.map(function (o) { return '<label class="checkbox sv-check"><input type="checkbox" ' + (a.indexOf(o) >= 0 ? 'checked' : '') + ' data-change="sv-multi" data-v="' + esc(o) + '"> ' + esc(o) + '</label>'; }).join('') + '</div><span class="field-hint">Pick all that apply.</span>';
    } else if (q.type === 'text') {
      h += '<textarea class="textarea tall" data-input="sv-text" placeholder="Please do not include names or anything that could identify you.">' + esc(a || '') + '</textarea><span class="field-hint">Free text is shown to leadership as written, without your name.</span>';
    }
    return h;
  }
  function surveyFoot() {
    var sv = D.SURVEYS[0], st = S.surveyState.s1, i = S.sv.i, n = sv.questions.length;
    if (i === -1) return btn('Opt out of this survey', 'btn-ghost', null, 'data-act="sv-optout"') + '<span class="toolbar-spacer"></span>' + btn(st.started ? 'Continue' : 'Start', 'btn-solid', 'arrow-right', 'data-act="sv-next"');
    if (i >= n) return '';
    var q = sv.questions[i], answered = st.answers[i] != null && !(Array.isArray(st.answers[i]) && !st.answers[i].length) && st.answers[i] !== '';
    return btn('Save and finish later', 'btn-ghost', null, 'data-act="sv-save"') + '<span class="toolbar-spacer"></span>' +
      (i > 0 ? btn('Back', 'btn-surface', 'arrow-left', 'data-act="sv-back"') : '') +
      (!q.req && !answered ? btn('Skip', 'btn-soft', null, 'data-act="sv-next"') : '') +
      btn(i === n - 1 ? 'Submit' : 'Next', 'btn-solid', i === n - 1 ? 'send' : 'arrow-right', 'data-act="sv-next"' + (q.req && !answered ? ' disabled title="This question is required"' : ''));
  }
  function svRedraw() { document.getElementById('svBody').innerHTML = surveyBody(); document.getElementById('svFoot').innerHTML = surveyFoot(); }
  A['sv-answer'] = function (el) { var v = el.getAttribute('data-v'); S.surveyState.s1.answers[S.sv.i] = isNaN(+v) ? v : +v; svRedraw(); };
  APP.INPUT['sv-multi'] = function (el) { var st = S.surveyState.s1, arr = st.answers[S.sv.i] = st.answers[S.sv.i] || [], v = el.getAttribute('data-v'); if (el.checked) arr.push(v); else arr.splice(arr.indexOf(v), 1); document.getElementById('svFoot').innerHTML = surveyFoot(); };
  APP.INPUT['sv-text'] = function (el) { S.surveyState.s1.answers[S.sv.i] = el.value; document.getElementById('svFoot').innerHTML = surveyFoot(); };
  A['sv-next'] = function () { var st = S.surveyState.s1; st.started = true; S.sv.i++; st.at = Math.max(st.at, S.sv.i); if (S.sv.i >= D.SURVEYS[0].questions.length) { st.done = true; D.SURVEYS[0].responses++; } svRedraw(); if (st.done && S.route[0] === 'home') APP.rerender(); };
  A['sv-back'] = function () { S.sv.i--; svRedraw(); };
  A['sv-save'] = function () { S.surveyState.s1.at = S.sv.i; APP.closeOverlay(); APP.rerender(); APP.toast('Progress saved', 'Pick up where you left off any time before ' + D.SURVEYS[0].closes + '.'); };
  A['sv-optout'] = function () { S.surveyState.s1.optedOut = true; APP.closeOverlay(); APP.rerender(); APP.toast('You opted out', 'You will not get reminders for this survey.', 'info'); };

  /* ---------- home view ---------- */
  function railHtml() {
    var me = APP.me(), due = APP.dueItems();
    var dueCard = '<section class="card rail-card home-due">' + APP.panelHead('Due items', due.length ? due.length + ' need your attention' : null, '<a class="link t-1" href="#/me/due">See all</a>') +
      (due.length ? '<div class="due-list">' + due.slice(0, 4).map(APP.dueRow).join('') + '</div>' : '<div class="w-empty">' + ic('circle-check', 22) + '<div class="fw-medium">Nothing outstanding</div><div class="t-1 text-low">You are all caught up.</div></div>') + '</section>';
    var list = me.loc === 'Maple Grove' ? D.WHOS_ON : D.WHOS_ON_OTHER[me.loc] || [];
    var who = '<section class="card rail-card">' + APP.panelHead("Who's On Today", list.length + ' on shift at ' + esc(me.loc), '<a class="link t-1" href="#/directory/whos-on">View all</a>') +
      '<div class="who-list">' + list.slice().sort(function (a, b) { return (b.key ? 1 : 0) - (a.key ? 1 : 0); }).slice(0, 5).map(function (w) { var p = P(w.p); return '<div class="who-row">' + APP.personLine(p, esc(p.title) + ' · until ' + w.until) + (w.key ? badge(w.key, 'is-info') : '') + '</div>'; }).join('') + '</div></section>';
    var shouts = D.POSTS.filter(function (p) { return p.type === 'Shout-out' && !p.removed; }).slice(0, 3);
    var sh = '<section class="card rail-card">' + APP.panelHead('Shout-outs', 'Latest from ' + esc(me.loc)) + '<div class="shout-list">' + shouts.map(function (p) {
      return '<a class="shout-row" href="#/home/post/' + p.id + '">' + av(P(p.to[0]), 32) + '<span class="pl-text"><span class="pl-name">' + esc(P(p.to[0]).name) + (p.to.length > 1 ? ' +' + (p.to.length - 1) : '') + '</span><span class="pl-sub">from ' + esc(P(p.author).name) + ' · ' + p.time + '</span></span>' + ic('chevron-right', 16) + '</a>'; }).join('') + '</div>' +
      btn('Give a shout-out', 'btn-outline', 'award', 'data-act="compose" data-type="Shout-out"') + '</section>';
    var ms = '<section class="card rail-card">' + APP.panelHead('Coming up', 'Celebrate a colleague') + '<div class="who-list">' + D.MILESTONES.map(function (m) { var p = P(m.p);
      return '<div class="who-row">' + APP.personLine(p, m.what + ' · ' + m.when + (m.detail ? ' · ' + m.detail : '')) + btn('', 'btn-ghost is-icon is-sm', 'mail', 'aria-label="Send ' + esc(p.name) + ' an e-card" title="Send an e-card" data-act="send-ecard" data-to="' + p.id + '" data-occ="' + (m.what === 'Birthday' ? 'Birthday' : m.what === 'Work anniversary' ? 'Anniversary' : 'Welcome') + '"') + '</div>'; }).join('') + '</div></section>';
    var vids = '<section class="card rail-card">' + APP.panelHead('Featured videos', 'Short picks from the team') + '<div class="vid-list">' + D.VIDEOS.slice(0, 3).map(function (v, i) {
      return '<button class="vid-row" data-act="watch-video" data-i="' + i + '"><span class="vid-thumb">' + ic('play', 16) + '<span class="vid-dur">' + v.dur + '</span></span><span class="pl-text"><span class="pl-name">' + esc(v.t) + '</span><span class="pl-sub">' + esc(P(v.by).name) + ' · ' + v.views + ' views</span></span></button>'; }).join('') + '</div></section>';
    return { due: dueCard, rest: who + sh + ms + vids };
  }
  A['watch-video'] = function (el) {
    var v = D.VIDEOS[+el.getAttribute('data-i')]; S.playing['fv'] = true;
    APP.dialog({ title: esc(v.t), sub: esc(P(v.by).name) + ' · ' + v.dur, body: videoHtml('fv', v.dur) + '<div class="post-actions">' + btn('Like', 'btn-ghost', 'thumbs-up', 'data-act="noop-toast" data-t="Liked"') + btn('Comment', 'btn-ghost', 'message-circle', 'data-act="noop-toast" data-t="Opens the video post" data-k="info"') + btn('Share', 'btn-ghost', 'share-2', 'data-act="share" data-id="p4"') + '</div>' });
  };

  APP.VIEWS.home = function (r) {
    var me = APP.me(), h = new Date().getHours(), greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    var due = APP.dueItems(), rail = railHtml(), st = S.surveyState.s1;
    var survey = !st.done && !st.optedOut ? '<div class="survey-strip">' + surveyCard('s1') + '</div>' : '';
    var composer = '<section class="card composer"><div class="composer-row">' + av(me, 36) + '<button class="composer-fake" data-act="compose">Share something with your colleagues</button></div>' +
      '<div class="composer-quick">' + btn('Photo', 'btn-ghost', 'image', 'data-act="compose"', 'is-sm') + btn('Video', 'btn-ghost', 'video', 'data-act="compose"', 'is-sm') + btn('Shout-out', 'btn-ghost', 'award', 'data-act="compose" data-type="Shout-out"', 'is-sm') +
      (APP.canManage() ? btn('Poll', 'btn-ghost', 'vote', 'data-act="compose" data-type="Poll"', 'is-sm') + btn('Announcement', 'btn-ghost', 'megaphone', 'data-act="compose" data-type="Announcement"', 'is-sm') : '') + '</div></section>';
    var filters = '<div class="feed-filters toggle-group" role="toolbar" aria-label="Filter the feed">' + FILTERS.map(function (f) { return '<button class="toggle' + (S.feed === f ? ' is-on' : '') + '" aria-pressed="' + (S.feed === f) + '" data-act="feed-filter" data-f="' + f + '">' + f + '</button>'; }).join('') + '</div>';
    var body = bannerHtml() + appsHtml() + widgetsHtml() + survey +
      '<div class="home-grid">' + rail.due +
      '<div class="home-feed"><div class="feed-head"><h2 class="t-5 fw-bold">Community feed</h2>' + (APP.canManage() ? '<a class="link t-1" href="#/manage/content/moderation">' + ic('flag', 14) + ' ' + D.REPORTS.filter(function (x) { return APP.inScope(x.loc); }).length + ' reported</a>' : '') + '</div>' + composer + filters + '<div id="feedList" class="feed-list">' + feedListHtml() + '</div></div>' +
      '<aside class="home-rail">' + rail.rest + '</aside></div>';
    return APP.page({ crumbs: [['Home']], title: greet + ', ' + esc(me.name.split(' ')[0]),
      desc: 'Tuesday 15 September · ' + esc(me.loc) + (due.length ? ' · <a class="link" href="#/me/due">' + due.length + ' things due</a>' : ''),
      action: btn('Send an e-card', 'btn-surface', 'mail', 'data-act="send-ecard"') + btn('Give a shout-out', 'btn-soft', 'award', 'data-act="compose" data-type="Shout-out"'), body: body });
  };
  APP.AFTER.push(function (r) {
    if (r[0] !== 'home') { clearInterval(timer); return; }
    startCarousel(); bindSwipe();
    if (r[1] === 'post' && r[2]) {
      var el = document.getElementById('post-' + r[2]);
      if (!el) { S.feed = 'All'; document.getElementById('feedList').innerHTML = feedListHtml(); el = document.getElementById('post-' + r[2]); }
      if (el) { el.classList.add('is-highlight'); setTimeout(function () { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 60); }
    }
  });
})();
