/* skyEmployee wireframe: Rewards. My Rewards (gift cards awarded to me),
   E-cards, and for Controllers and Admins: Give awards + Fulfilment. */
(function () {
  var D = SE, A = APP.ACT, S = APP.S, ic = APP.ic, esc = APP.esc, P = APP.P, av = APP.av, badge = APP.badge, btn = APP.btn, money = APP.money;
  S.allowance = { used: 160, total: 250, cards: 6, cardsTotal: 10 };
  S.ecardOcc = 'All';

  function rt(id) { return D.REWARD_TYPES.filter(function (r) { return r.id === id; })[0]; }
  APP.rt = rt;
  function awardValue(a) { return a.value || rt(a.type).value; }
  APP.ecardArt = function (d, cls) {
    return '<div class="ecard-art ' + d.tone + ' ' + (cls || '') + '" aria-hidden="true"><svg class="ecard-deco" viewBox="0 0 200 120" preserveAspectRatio="none"><circle cx="170" cy="20" r="46" fill="currentColor" opacity=".14"/><circle cx="20" cy="110" r="38" fill="currentColor" opacity=".10"/></svg><span class="ecard-ic">' + ic(d.ic, 32) + '</span><span class="ecard-name">' + esc(d.name) + '</span></div>';
  };
  function giftTile(r, small) {
    return '<div class="gift-tile ' + r.tone + (small ? ' is-small' : '') + '" aria-hidden="true"><span class="gt-ic">' + ic(r.ic, small ? 16 : 22) + '</span><span class="gt-brand">' + esc(r.brand) + '</span><span class="gt-val">' + (r.value ? money(r.value) : 'Perk') + '</span></div>';
  }
  APP.giftTile = giftTile;

  /* ---------- My Rewards ---------- */
  function myRewards() {
    var me = APP.me(), list = D.AWARDS.filter(function (a) { return a.to === me.id && a.status !== 'Cancelled' && a.status !== 'Pending approval'; });
    if (!list.length) return '<section class="card">' + APP.emptyState('gift', 'No rewards yet', 'When a manager awards you a gift card or perk, it arrives here with their message. There is nothing to save up for.', btn('See e-cards', 'btn-solid', 'mail', 'data-act="go" data-href="#/rewards/ecards"')) + '</section>';
    return '<p class="t-2 text-low rewards-intro">' + ic('info', 14) + ' Rewards arrive when a manager decides to give you one. Codes stay hidden until you choose to reveal them.</p><div class="reward-list">' + list.map(function (a) {
      var r = rt(a.type), from = P(a.from), action;
      if (a.fulfilment) {
        var steps = ['Awarded', 'In progress', 'Fulfilled'], at = steps.indexOf(a.status);
        action = '<div class="stepper" aria-label="Fulfilment progress">' + steps.map(function (s, i) { return '<span class="step' + (i <= at ? ' is-done' : '') + (i === at ? ' is-current' : '') + '"><span class="step-dot">' + (i < at || (i === at && s === 'Fulfilled') ? ic('check', 12) : i + 1) + '</span><span class="step-label">' + s + '</span></span>'; }).join('<span class="step-line"></span>') + '</div><p class="t-1 text-low">' + esc(r.how) + '</p>';
      } else action = '<div class="reward-actions">' + (a.revealed ? btn('View code', 'btn-soft', 'eye', 'data-act="reveal" data-id="' + a.id + '"') + badge('Revealed', 'is-success') : btn('Reveal code', 'btn-solid', 'key-round', 'data-act="reveal" data-id="' + a.id + '"') + badge('Not revealed', 'is-neutral')) + (a.exp ? '<span class="t-1 text-low">Expires ' + a.exp + '</span>' : '') + '</div>';
      return '<section class="card reward-card">' + giftTile(r) + '<div class="rc-main"><div class="rc-top"><div><div class="t-4 fw-bold">' + esc(r.name) + '</div><div class="t-1 text-low">' + esc(r.kind) + ' · awarded ' + a.date + '</div></div>' + APP.statusBadge(a.status) + '</div>' +
        '<blockquote class="blockquote rc-msg">' + esc(a.msg) + '</blockquote><div class="rc-from">' + av(from, 24) + '<span>from <b>' + esc(from.name) + '</b> · ' + esc(a.reason) + '</span>' + (a.post ? '<a class="link t-1" href="#/home/post/' + a.post + '">See the shout-out</a>' : '') + '</div>' + action + '</div></section>';
    }).join('') + '</div>';
  }
  A.go = function (el) { APP.closeAll(); APP.go(el.getAttribute('data-href')); };
  A.reveal = function (el) {
    var a = D.AWARDS.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0], r = rt(a.type);
    if (a.revealed) return showCode(a);
    APP.dialog({ title: 'Reveal your code', sub: esc(r.name) + ' · ' + money(r.value),
      body: APP.callout('<b>This code works like cash.</b> Anyone who sees it can spend it. Do not share it, post it or leave it on a shared screen. Your manager and admins cannot see it.', 'is-warning', 'triangle-alert') +
        '<label class="checkbox reveal-ack"><input type="checkbox" data-change="reveal-ack"> I understand and I am somewhere private</label>',
      footer: btn('Not now', 'btn-soft', null, 'data-act="close-overlay"') + btn('Reveal code', 'btn-solid', 'eye', 'data-act="do-reveal" data-id="' + a.id + '" id="revealBtn" disabled') });
  };
  APP.INPUT['reveal-ack'] = function (el) { document.getElementById('revealBtn').disabled = !el.checked; };
  A['do-reveal'] = function (el) { var a = D.AWARDS.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; a.revealed = true; APP.closeOverlay(); showCode(a); if (S.route[0] === 'rewards') APP.rerender(); };
  function showCode(a) {
    var r = rt(a.type);
    APP.dialog({ title: esc(r.name), sub: money(r.value) + ' · expires ' + a.exp,
      body: '<div class="code-box"><span class="code-label">Your code</span><span class="code-val">' + esc(a.code) + '</span>' + btn('Copy code', 'btn-surface', 'copy', 'data-act="copy" data-what="Code copied. Paste it at checkout."', 'is-sm') + '</div>' +
        '<h3 class="section-label">How to use it</h3><p>' + esc(r.how) + '</p>' +
        '<p class="t-1 text-low">' + ic('shield-check', 12) + ' Only you can see this code. It stays here so you can come back to it. We recorded that you revealed it.</p>',
      footer: btn('Done', 'btn-solid', null, 'data-act="close-overlay"') });
  }

  /* ---------- E-cards ---------- */
  function designs() { return D.ECARD_DESIGNS.filter(function (d) { return !d.retired && (!d.ctrlOnly || APP.canManage()); }); }
  function ecards() {
    var occs = ['All', 'Birthday', 'Anniversary', 'Thank you', 'Welcome', 'Get well', 'Congratulations'];
    var list = designs().filter(function (d) { return S.ecardOcc === 'All' || d.occ === S.ecardOcc; });
    return '<div class="split-2 ecards-layout"><div class="stack-4"><section class="card">' + APP.panelHead('Send an e-card', 'Free to send, any colleague, any occasion.') +
      '<div class="segmented occ-seg" role="tablist">' + occs.map(function (o) { return '<button class="segmented-item' + (S.ecardOcc === o ? ' is-active' : '') + '" data-act="ecard-occ" data-v="' + o + '">' + o + '</button>'; }).join('') + '</div>' +
      '<div class="ecard-grid">' + list.map(function (d) { return '<button class="ecard-pick" data-act="send-ecard" data-design="' + d.id + '" aria-label="Send ' + esc(d.name) + ' card">' + APP.ecardArt(d) + '<span class="ep-meta"><span>' + esc(d.occ) + '</span>' + (d.ctrlOnly ? badge('Managers only', 'is-neutral') : '') + '</span></button>'; }).join('') + '</div></section>' +
      '<section class="card">' + APP.panelHead('E-cards you received', D.ECARDS_RECEIVED.length + ' cards') + '<div class="recv-list">' + D.ECARDS_RECEIVED.map(function (e, i) {
        var d = D.ECARD_DESIGNS.filter(function (x) { return x.id === e.design; })[0], p = P(e.from);
        return '<div class="recv-row">' + APP.ecardArt(d, 'is-mini') + '<div class="rc-main"><div class="rc-from">' + av(p, 24) + '<b>' + esc(p.name) + '</b><span class="text-low t-1">· ' + e.date + ' · ' + (e.shared ? 'Shared to feed' : 'Private') + '</span></div><p>' + esc(e.msg) + '</p>' +
          '<div class="row-gap">' + btn(e.liked ? 'Liked' : 'Like', e.liked ? 'btn-soft' : 'btn-ghost', 'thumbs-up', 'data-act="ecard-like" data-i="' + i + '"', 'is-sm') + btn('Reply', 'btn-ghost', 'reply', 'data-act="send-ecard" data-to="' + p.id + '" data-occ="Thank you"', 'is-sm') + '</div></div></div>';
      }).join('') + '</div></section></div>' +
      '<aside class="stack-4"><section class="card">' + APP.panelHead('Coming up', 'Colleagues with a milestone this week') + '<div class="who-list">' + D.MILESTONES.map(function (m) { var p = P(m.p);
        return '<div class="who-row">' + APP.personLine(p, m.what + ' · ' + m.when) + btn('Send', 'btn-soft', 'mail', 'data-act="send-ecard" data-to="' + p.id + '" data-occ="' + (m.what === 'Birthday' ? 'Birthday' : m.what === 'Work anniversary' ? 'Anniversary' : 'Welcome') + '"', 'is-sm') + '</div>'; }).join('') + '</div></section>' +
      '<section class="card">' + APP.panelHead('E-cards and gift cards') + '<p class="t-2 text-low">E-cards carry no value and anyone can send them. Gift cards are awarded by managers and arrive in My Rewards.</p></section></aside></div>';
  }
  A['ecard-occ'] = function (el) { S.ecardOcc = el.getAttribute('data-v'); APP.rerender(); };
  A['ecard-like'] = function (el) { var e = D.ECARDS_RECEIVED[+el.getAttribute('data-i')]; e.liked = !e.liked; APP.rerender(); };
  S.ec = {};
  A['send-ecard'] = function (el) {
    APP.closeAll(); APP.closePops();
    var occ = el.getAttribute && el.getAttribute('data-occ'), design = el.getAttribute && el.getAttribute('data-design');
    if (!design && occ) { var m = designs().filter(function (d) { return d.occ === occ; })[0]; design = m && m.id; }
    S.ec = { design: design || 'e4', shared: false };
    S.pick.ecard = el.getAttribute && el.getAttribute('data-to') ? [el.getAttribute('data-to')] : [];
    APP.dialog({ title: 'Send an e-card', size: 'is-wide', body: '<div id="ecBody">' + ecBody() + '</div>', footer: btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn('Send e-card', 'btn-solid', 'send', 'data-act="do-ecard"'), noFocus: true });
  };
  function ecBody() {
    var d = D.ECARD_DESIGNS.filter(function (x) { return x.id === S.ec.design; })[0];
    return '<div class="ec-layout"><div class="stack-4">' + APP.picker('ecard', 'To', false) +
      '<div class="field"><span class="field-label">Design</span><div class="ec-designs">' + designs().map(function (x) { return '<button class="ec-mini' + (x.id === S.ec.design ? ' is-selected' : '') + '" aria-pressed="' + (x.id === S.ec.design) + '" aria-label="' + esc(x.name) + '" title="' + esc(x.name) + '" data-act="ec-design" data-id="' + x.id + '">' + APP.ecardArt(x, 'is-mini') + '</button>'; }).join('') + '</div></div>' +
      APP.field('Your message', '<textarea class="textarea" id="ecMsg" placeholder="Write something personal">' + esc(S.ec.msg || '') + '</textarea>', null, true) +
      '<div class="field"><span class="field-label">Who can see it</span><div class="radio-cards">' +
      '<button class="radio-card' + (!S.ec.shared ? ' is-selected' : '') + '" data-act="ec-share" data-v="0"><div class="rc-title">' + ic('lock', 14) + ' Private</div><div class="rc-sub">Only the recipient</div></button>' +
      '<button class="radio-card' + (S.ec.shared ? ' is-selected' : '') + '" data-act="ec-share" data-v="1"><div class="rc-title">' + ic('globe', 14) + ' Share to feed</div><div class="rc-sub">Colleagues can react too</div></button></div></div></div>' +
      '<div class="ec-preview"><span class="t-1 text-low">Preview</span>' + APP.ecardArt(d) + '<p class="t-2">' + esc(S.ec.msg || 'Your message appears here.') + '</p><span class="t-1 text-low">From ' + esc(APP.me().name) + '</span></div></div>';
  }
  function ecRedraw() { var m = document.getElementById('ecMsg'); if (m) S.ec.msg = m.value; document.getElementById('ecBody').innerHTML = ecBody(); }
  A['ec-design'] = function (el) { S.ec.design = el.getAttribute('data-id'); ecRedraw(); };
  A['ec-share'] = function (el) { S.ec.shared = el.getAttribute('data-v') === '1'; ecRedraw(); };
  A['do-ecard'] = function () {
    var to = (S.pick.ecard || []), msg = document.getElementById('ecMsg').value.trim();
    if (!to.length) { APP.toast('Pick who the card is for', '', 'warning'); return; }
    if (!msg) { APP.toast('Add a short message', '', 'warning'); document.getElementById('ecMsg').focus(); return; }
    if (S.ec.shared) D.POSTS.unshift({ id: 'n' + Date.now(), type: 'E-card', author: APP.me().id, time: 'now', audience: 'Everyone', to: to, design: S.ec.design, text: msg, likes: 0, liked: false, comments: [] });
    APP.closeOverlay(); if (S.route[0] === 'home') APP.rerender();
    APP.toast('E-card sent', to.map(function (t) { return P(t).name.split(' ')[0]; }).join(', ') + (S.ec.shared ? ' will be notified, and it is on the feed.' : ' will be notified.'));
  };

  /* ---------- Give awards (Controller + Admin) ---------- */
  function giveAwards() {
    var me = APP.me(), mine = D.AWARDS.filter(function (a) { return a.from === me.id; }), al = S.allowance;
    var top = '<div class="kpi-row kpi-3">' +
      (APP.isCtrl() ? '<section class="card stat-card"><div class="sc-head"><span class="sc-label">Allowance left this quarter</span><span class="sc-icon">' + ic('wallet', 18) + '</span></div><div class="sc-value">' + money(al.total - al.used) + '</div>' + APP.meter('Value', al.used, al.total, money) + APP.meter('Cards', al.cards, al.cardsTotal, function (v) { return v; }) + '</section>'
        : '<section class="card stat-card"><div class="sc-head"><span class="sc-label">Organisation budget left</span><span class="sc-icon">' + ic('wallet', 18) + '</span></div><div class="sc-value">' + money(6850) + '</div>' + APP.meter('Q3 spend', 8150, 15000, money) + '</section>') +
      '<section class="card stat-card"><div class="sc-head"><span class="sc-label">Awards you gave this quarter</span><span class="sc-icon">' + ic('gift', 18) + '</span></div><div class="sc-value">' + mine.length + '</div><div class="t-1 text-low">' + mine.filter(function (a) { return a.status === 'Delivered' && !a.revealed; }).length + ' not revealed yet</div></section>' +
      '<section class="card stat-card"><div class="sc-head"><span class="sc-label">Approval needed above</span><span class="sc-icon">' + ic('shield-check', 18) + '</span></div><div class="sc-value">' + money(100) + '</div><div class="t-1 text-low">Bigger awards wait for an Admin before release</div></section></div>';
    var rows = mine.map(function (a) { var r = rt(a.type), p = P(a.to);
      return [APP.personLine(p, esc(p.title)), '<span class="cell-person">' + giftTile(r, true) + '<span><span class="cell-strong">' + esc(r.name) + '</span><span class="cell-sub">' + esc(a.reason) + '</span></span></span>', money(awardValue(a)), a.date, APP.statusBadge(a.status), a.fulfilment ? '<span class="text-low">Fulfilment item</span>' : a.status === 'Delivered' ? (a.revealed ? badge('Revealed', 'is-success') : badge('Not yet', 'is-neutral')) : '<span class="text-low">n/a</span>']; });
    return top + '<section class="card flush-card"><div class="card-pad">' + APP.panelHead('Awards you have given', 'You never see the codes. You can see whether the recipient has revealed theirs.', btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="Your awards"', 'is-sm')) + '</div>' +
      APP.table(['Recipient', 'Reward', { t: 'Value', num: true }, 'Date', 'Status', 'Code revealed'], rows, { empty: 'You have not awarded any cards yet.' }) + '</section>';
  }
  S.aw = {};
  A['award-card'] = function (el) {
    APP.closeAll(); S.aw = { rt: 'rt1', post: true }; S.pick.award = el.getAttribute && el.getAttribute('data-to') ? [el.getAttribute('data-to')] : []; S.compose = S.compose || {}; S.compose.rt = 'rt1'; S.f.awReason = 'Above and beyond';
    APP.onPick = function (k) { if (k === 'award') awRedraw(); };
    APP.dialog({ title: 'Award a gift card', size: 'is-wide', body: '<div id="awBody">' + awBody() + '</div>', footer: '<span class="dlg-foot-note" id="awNote"></span>' + btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn('Award', 'btn-solid', 'gift', 'data-act="do-award" id="awBtn"'), noFocus: true });
    awNote();
  };
  function awBody() {
    return '<div class="stack-4">' + APP.picker('award', 'Recipients', false, true) + (APP.isCtrl() ? '<span class="field-hint aw-scope">' + ic('lock', 12) + ' You can award people at ' + esc(APP.scope()[0]) + ', from the reward types made available to you.</span>' : '') +
      '<div class="field"><span class="field-label">Reward</span>' + APP.rewardTypePicker() + '</div>' +
      '<div class="form-grid">' + APP.field('Reason', APP.dd('awReason', ['Above and beyond', 'Resident care', 'Covered a shift', 'Safety', 'Milestone', 'Welcome'], S.f.awReason, 'dd-block')) + '<div class="field"><span class="field-label">Post as a shout-out</span><label class="switch"><input type="checkbox" ' + (S.aw.post ? 'checked' : '') + ' data-change="aw-post"><span class="t-2">Recognise them in the feed too</span></label><span class="field-hint">The value is never shown in the feed.</span></div></div>' +
      APP.field('Message to the recipient', '<textarea class="textarea" id="awMsg" placeholder="Say what they did and why it mattered">' + esc(S.aw.msg || '') + '</textarea>', null, true) +
      (APP.isCtrl() ? APP.meter('Your allowance this quarter', S.allowance.used, S.allowance.total, money) : '') + '</div>';
  }
  function awRedraw() { var m = document.getElementById('awMsg'); if (m) S.aw.msg = m.value; var b = document.getElementById('awBody'); if (b) { b.innerHTML = awBody(); awNote(); } }
  function awNote() {
    var r = rt(S.compose.rt), n = Math.max(1, (S.pick.award || []).length), total = r.value * n, note = document.getElementById('awNote'), b = document.getElementById('awBtn');
    if (!note) return;
    var left = S.allowance.total - S.allowance.used;
    if (r.avail === 0) { note.innerHTML = '<span class="text-danger">' + ic('circle-alert', 14) + ' No stock left. Contact an Admin.</span>'; b.disabled = true; return; }
    if (APP.isCtrl() && total > left) { note.innerHTML = '<span class="text-danger">' + ic('circle-alert', 14) + ' ' + money(total) + ' is over your remaining ' + money(left) + '.</span>'; b.disabled = true; return; }
    b.disabled = false;
    note.innerHTML = (total > 100 ? ic('shield-check', 14) + ' ' + money(total) + ' total. Needs Admin approval before release.' : ic('gift', 14) + ' ' + money(total) + ' total. The next available code is assigned automatically.');
  }
  var oldPickRt = A['pick-rt'];
  A['pick-rt'] = function (el) { if (document.getElementById('awBody')) { S.compose.rt = el.getAttribute('data-id'); awRedraw(); } else oldPickRt(el); };
  APP.DD.awReason = function () { awRedraw(); };
  APP.INPUT['aw-post'] = function (el) { S.aw.post = el.checked; };
  A['do-award'] = function () {
    var to = S.pick.award || [], msg = document.getElementById('awMsg').value.trim(), r = rt(S.compose.rt), me = APP.me();
    if (!to.length) { APP.toast('Pick at least one recipient', '', 'warning'); return; }
    if (!msg) { APP.toast('Add a message for the recipient', '', 'warning'); return; }
    var total = r.value * to.length, pending = total > 100;
    to.forEach(function (t) { if (!pending) r.avail = Math.max(0, r.avail - 1); D.AWARDS.unshift({ id: 'aw' + Date.now() + t, to: t, type: r.id, from: me.id, date: 'Sep 15', msg: msg, reason: S.f.awReason, status: pending ? 'Pending approval' : r.fulfil === 'task' ? 'Awarded' : 'Delivered', revealed: false, fulfilment: r.fulfil === 'task' }); });
    if (APP.isCtrl()) { S.allowance.used += total; S.allowance.cards += to.length; }
    if (S.aw.post) D.POSTS.unshift({ id: 'n' + Date.now(), type: 'Shout-out', author: me.id, time: 'now', audience: APP.isCtrl() ? APP.scope()[0] : 'Everyone', to: to, badge: null, gift: true, text: msg, likes: 0, liked: false, comments: [] });
    APP.closeOverlay(); APP.onPick = null; APP.rerender();
    APP.toast(pending ? 'Sent for approval' : 'Gift card awarded', pending ? 'An Admin will approve it before the card is released.' : to.map(function (t) { return P(t).name.split(' ')[0]; }).join(', ') + ' will be notified. The code is only visible to them.');
  };

  /* ---------- Fulfilment ---------- */
  function fulfilRows(scopeOnly) {
    return D.AWARDS.filter(function (a) { return a.fulfilment && (!scopeOnly || APP.inScope(P(a.to).loc)); });
  }
  APP.fulfilTable = function (scopeOnly) {
    var list = fulfilRows(scopeOnly);
    return '<section class="card flush-card"><div class="card-pad">' + APP.panelHead('Fulfilment queue', 'Merchandise and perks that need someone to hand them over.') + '</div>' + APP.table(['Recipient', 'Item', 'Location', 'Awarded', 'Status', ''], list.map(function (a) {
      var r = rt(a.type), p = P(a.to), next = { Awarded: ['Start', 'In progress'], 'In progress': ['Mark fulfilled', 'Fulfilled'] }[a.status];
      return [APP.personLine(p, esc(p.title)), esc(r.name), esc(p.loc), a.date + ' by ' + esc(P(a.from).name.split(' ')[0]), APP.statusBadge(a.status), next ? btn(next[0], 'btn-surface', next[1] === 'Fulfilled' ? 'package-check' : 'arrow-right', 'data-act="fulfil" data-id="' + a.id + '" data-next="' + next[1] + '"', 'is-sm') : '<span class="text-low t-1">Done</span>'];
    }), { empty: 'Nothing waiting. Every item has been handed over.' }) + '</section>';
  };
  A.fulfil = function (el) { var a = D.AWARDS.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; a.status = el.getAttribute('data-next'); APP.rerender(); APP.toast('Marked ' + a.status.toLowerCase(), P(a.to).name + ' can see the progress in My Rewards.'); };

  APP.VIEWS.rewards = function (r) {
    var tab = r[1] || 'mine', me = APP.me();
    var items = [['mine', 'My Rewards', '#/rewards', D.AWARDS.filter(function (a) { return a.to === me.id && a.status !== 'Cancelled' && a.status !== 'Pending approval'; }).length], ['ecards', 'E-cards', '#/rewards/ecards']];
    if (APP.canManage()) items.push(['give', 'Give awards', '#/rewards/give'], ['fulfilment', 'Fulfilment', '#/rewards/fulfilment', fulfilRows(true).filter(function (a) { return a.status !== 'Fulfilled'; }).length]);
    var body = tab === 'ecards' ? ecards() : tab === 'give' ? giveAwards() : tab === 'fulfilment' ? APP.fulfilTable(true) : myRewards();
    var action = tab === 'give' || tab === 'fulfilment' ? btn('Award a gift card', 'btn-solid', 'gift', 'data-act="award-card"') : tab === 'ecards' ? btn('Send an e-card', 'btn-solid', 'mail', 'data-act="send-ecard"') : APP.canManage() ? btn('Award a gift card', 'btn-soft', 'gift', 'data-act="award-card"') : '';
    return APP.page({ crumbs: [['Home', '#/home'], ['Rewards', '#/rewards'], [items.filter(function (i) { return i[0] === tab; })[0][1]]], title: 'Rewards',
      desc: APP.canManage() ? 'Gift cards you have received, e-cards, and the awards you give your team.' : 'Gift cards you have been awarded, and free e-cards to celebrate colleagues.', action: action, tabs: APP.tabs(items, tab), body: body });
  };
})();
