/* skyEmployee wireframe: Messages. Private one to one and group messages
   between colleagues, as its own area. Scope document v2.0 removed this;
   it is back at the customer's request (see README). */
(function () {
  var D = SE, A = APP.ACT, S = APP.S, ic = APP.ic, esc = APP.esc, P = APP.P, av = APP.av, badge = APP.badge, btn = APP.btn;
  S.msgFolder = 'all'; S.msgQ = '';

  function conv(id) { return D.MSGS.filter(function (c) { return c.id === id; })[0]; }
  function others(c) { var me = APP.me(); var o = c.with.filter(function (p) { return p !== me.id; }); return o.length ? o : c.with; }
  function title(c) { return c.group || P(others(c)[0]).name; }
  function unread(c) { return c.msgs.filter(function (m) { return m.unread; }).length; }
  function last(c) { return c.msgs[c.msgs.length - 1]; }
  function snippet(c) { var m = last(c); return (m.from === 'me' ? 'You: ' : c.group ? P(m.from).name.split(' ')[0] + ': ' : '') + m.t; }
  function onShift(id) {
    var all = D.WHOS_ON.concat(D.WHOS_ON_OTHER['Riverside Commons'], D.WHOS_ON_OTHER['Cedar Hills'], D.WHOS_ON_OTHER['Corporate Office']);
    return all.filter(function (w) { return w.p === id; })[0];
  }
  function folderList(f) {
    var q = S.msgQ.trim().toLowerCase();
    return D.MSGS.filter(function (c) {
      if (f === 'archived') { if (!c.archived) return false; } else if (c.archived) return false;
      if (f === 'unread' && !unread(c)) return false;
      if (f === 'groups' && !c.group) return false;
      if (q && (title(c) + ' ' + c.msgs.map(function (m) { return m.t; }).join(' ')).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }

  function railHtml() {
    var folders = [['all', 'All messages', 'inbox', folderList('all').length], ['unread', 'Unread', 'mail', folderList('unread').length],
      ['groups', 'Groups', 'users', folderList('groups').length], ['archived', 'Archived', 'archive', folderList('archived').length]];
    return '<aside class="pane-rail"><h1 class="t-5 fw-bold pane-h1">Messages</h1>' +
      btn('New message', 'btn-solid', 'plus', 'data-act="msg-new" style="justify-content:center;margin-bottom:var(--space-3);"') +
      folders.map(function (f) {
        return '<a class="pane-folder' + (S.msgFolder === f[0] ? ' is-active' : '') + '" href="#/messages" data-act="msg-folder" data-f="' + f[0] + '"><span class="pf-ic">' + ic(f[2], 18) + '</span>' + f[1] + '<span class="pf-count">' + f[3] + '</span></a>';
      }).join('') +
      '<div class="msg-note">' + ic('lock', 14) + '<span>Messages stay inside skyEmployee and are kept for 90 days. Do not share resident health information here.</span></div></aside>';
  }
  function listHtml(activeId) {
    var f = S.msgFolder, list = folderList(f);
    var head = '<div class="pane-list-head"><span>' + (f === 'all' ? 'All messages' : f === 'unread' ? 'Unread' : f === 'groups' ? 'Groups' : 'Archived') + '</span><span>' + list.length + '</span></div>' +
      '<div class="pane-search"><div class="search"><span class="search-icon">' + ic('search', 16) + '</span><input class="input" placeholder="Search messages" value="' + esc(S.msgQ) + '" data-input="msg-search" aria-label="Search messages"></div></div>';
    if (!list.length) return '<section class="pane-list">' + head + APP.emptyState('message-square', 'No messages here', S.msgQ ? 'Nothing matches "' + esc(S.msgQ) + '".' : 'Start a conversation with a colleague from the directory or the button on the left.', btn('New message', 'btn-solid', 'plus', 'data-act="msg-new"')) + '</section>';
    return '<section class="pane-list">' + head + list.map(function (c) {
      var n = unread(c), m = last(c), who = others(c);
      return '<a class="mail-item' + (n ? ' is-unread' : '') + (c.id === activeId ? ' is-active' : '') + '" href="#/messages/' + c.id + '">' +
        '<div class="mi-row">' + (c.group ? '<span class="avatar is-neutral">' + ic('users', 16) + '</span>' : av(P(who[0]), 32)) +
        '<div class="mi-main"><div class="mail-from"><span class="mail-name">' + esc(title(c)) + '</span><span class="mail-time">' + m.time + '</span></div>' +
        '<div class="mail-snippet">' + esc(snippet(c)) + '</div></div>' + (n ? '<span class="mi-dot">' + n + '</span>' : '') + '</div></a>';
    }).join('') + '</section>';
  }
  function threadHtml(c) {
    if (!c) return '<section class="pane-detail">' + APP.emptyState('message-square', 'Pick a conversation', 'Your messages are private to the people in them. Admins can only see them if they are part of a formal investigation.') + '</section>';
    var me = APP.me(), who = others(c), p = c.group ? null : P(who[0]), on = p ? onShift(p.id) : null;
    var head = '<div class="msg-head"><a class="msg-back mobile-only" href="#/messages" aria-label="Back to messages">' + ic('arrow-left', 18) + '</a>' +
      (p ? '<button class="person-line is-link" data-act="profile" data-id="' + p.id + '">' + av(p, 36) + '<span class="pl-text"><span class="pl-name">' + esc(p.name) + '</span><span class="pl-sub">' + esc(p.title) + ' · ' + esc(p.loc) + '</span></span></button>'
        : '<span class="person-line">' + '<span class="avatar is-neutral">' + ic('users', 18) + '</span><span class="pl-text"><span class="pl-name">' + esc(c.group) + '</span><span class="pl-sub">' + who.map(function (x) { return P(x).name.split(' ')[0]; }).join(', ') + ' and you</span></span></span>') +
      '<span class="toolbar-spacer"></span>' + (on ? badge('On shift until ' + on.until, 'is-success', 'circle-dot') : p ? badge('Not on shift', 'is-neutral') : '') +
      '<span class="pop-anchor"><button class="btn btn-ghost is-icon" aria-label="Conversation options" data-act="toggle-pop" data-pop="mm-' + c.id + '">' + ic('ellipsis', 16) + '</button>' +
      '<div class="dropdown-menu pop row-menu" id="mm-' + c.id + '" hidden>' +
      (p ? '<div class="list-item" data-act="profile" data-id="' + p.id + '"><span class="list-check">' + ic('user', 16) + '</span>View profile</div>' +
        '<div class="list-item" data-act="compose" data-type="Shout-out" data-to="' + p.id + '"><span class="list-check">' + ic('award', 16) + '</span>Give a shout-out</div>' : '') +
      '<div class="list-item" data-act="msg-archive" data-id="' + c.id + '"><span class="list-check">' + ic('archive', 16) + '</span>' + (c.archived ? 'Move to All messages' : 'Archive') + '</div>' +
      '<div class="list-item is-danger-item" data-act="msg-report" data-id="' + c.id + '"><span class="list-check">' + ic('flag', 16) + '</span>Report a message</div></div></span></div>';
    var lastDay = '';
    var body = '<div class="msg-thread" id="msgThread">' + c.msgs.map(function (m) {
      var day = /AM|PM/.test(m.time) ? 'Today' : m.time;
      var sep = day !== lastDay ? '<div class="msg-day"><span>' + esc(day) + '</span></div>' : '';
      lastDay = day;
      var mine = m.from === 'me';
      return sep + '<div class="msg-row' + (mine ? ' is-mine' : '') + '">' + (mine ? '' : av(P(m.from), 28)) +
        '<div class="msg-bubble' + (mine ? ' is-mine' : '') + '">' + (c.group && !mine ? '<span class="msg-who">' + esc(P(m.from).name.split(' ')[0]) + '</span>' : '') +
        '<span class="msg-text">' + esc(m.t) + '</span><span class="msg-time">' + esc(m.time) + (mine ? ' ' + ic('check', 12) : '') + '</span></div></div>';
    }).join('') + '</div>';
    var composer = '<div class="msg-composer"><button class="btn btn-ghost is-icon" aria-label="Attach a file" data-act="noop-toast" data-t="Attachment" data-b="In the real app this opens your camera or files." data-k="info">' + ic('paperclip', 18) + '</button>' +
      '<input class="input" id="msgInput" placeholder="Write a message to ' + esc(c.group || P(who[0]).name.split(' ')[0]) + '" data-enter="msg-send" data-id="' + c.id + '" aria-label="Write a message">' +
      btn('', 'btn-solid is-icon', 'send-horizontal', 'aria-label="Send message" data-act="msg-send" data-id="' + c.id + '"') + '</div>';
    return '<section class="pane-detail is-thread">' + head + body + composer + '</section>';
  }

  APP.VIEWS.messages = function (r) {
    var c = r[1] ? conv(r[1]) : null;
    if (c) c.msgs.forEach(function (m) { m.unread = false; });
    var crumbs = c ? [['Home', '#/home'], ['Messages', '#/messages'], [title(c)]] : [['Home', '#/home'], ['Messages']];
    return APP.page({ crumbs: crumbs, flush: true,
      body: '<div class="three-pane' + (c ? ' has-thread' : '') + '">' + railHtml() + listHtml(c && c.id) + threadHtml(c) + '</div>' });
  };
  APP.AFTER.push(function (r) {
    if (r[0] !== 'messages') return;
    var t = document.getElementById('msgThread'); if (t) t.scrollTop = t.scrollHeight;
    var i = document.getElementById('msgInput'); if (i && window.innerWidth > 1024) i.focus();
  });

  A['msg-folder'] = function (el) { S.msgFolder = el.getAttribute('data-f'); APP.go('#/messages'); };
  APP.INPUT['msg-search'] = function (el) { S.msgQ = el.value; var l = document.querySelector('.pane-list'); var active = (S.route[1] || null);
    l.outerHTML = listHtml(active); var i = document.querySelector('[data-input="msg-search"]'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } };
  A['msg-send'] = function (el) {
    var c = conv(el.getAttribute('data-id')), i = document.getElementById('msgInput');
    if (!i || !i.value.trim()) return;
    c.msgs.push({ from: 'me', t: i.value.trim(), time: 'Just now' });
    APP.rerender();
    setTimeout(function () { var n = document.getElementById('msgInput'); if (n) n.focus(); }, 20);
  };
  A['msg-archive'] = function (el) {
    var c = conv(el.getAttribute('data-id')); c.archived = !c.archived; APP.closePops();
    APP.go('#/messages'); APP.toast(c.archived ? 'Conversation archived' : 'Moved back to All messages', esc(title(c)));
  };
  A['msg-report'] = function (el) {
    APP.closePops();
    APP.dialog({ title: 'Report a message', sub: 'Reports go to Admins. They see only the messages you report, not the whole conversation.',
      body: '<div class="radio-list">' + ['It is offensive or harassing', 'It shares resident information', 'It is not work related', 'Something else'].map(function (x, i) {
        return '<label class="radio"><input type="radio" name="mrep" ' + (i === 0 ? 'checked' : '') + '> ' + x + '</label>'; }).join('') + '</div>' +
        APP.field('What happened (optional)', '<textarea class="textarea" placeholder="Anything that helps the reviewer"></textarea>'),
      footer: btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn('Send report', 'btn-solid', 'flag', 'data-act="do-report"') });
  };
  A['msg-new'] = function (el) {
    APP.closeAll(); S.pick.msg = el && el.getAttribute && el.getAttribute('data-to') ? [el.getAttribute('data-to')] : [];
    APP.dialog({ title: 'New message', sub: 'Pick one colleague, or several for a group conversation.',
      body: APP.picker('msg', 'To', true) + APP.field('Message', '<textarea class="textarea" id="msgFirst" placeholder="Write your message"></textarea>', 'Keep resident details out of messages.', true),
      footer: btn('Cancel', 'btn-soft', null, 'data-act="close-overlay"') + btn('Send', 'btn-solid', 'send', 'data-act="msg-start"') });
  };
  A['msg-start'] = function () {
    var to = (S.pick.msg || []).filter(function (x) { return x.indexOf('g:') !== 0; }), t = document.getElementById('msgFirst').value.trim();
    if (!to.length) { APP.toast('Pick who the message is for', '', 'warning'); return; }
    if (!t) { APP.toast('Write a message first', '', 'warning'); document.getElementById('msgFirst').focus(); return; }
    var existing = D.MSGS.filter(function (c) { return !c.group && c.with.length === to.length && c.with.every(function (x) { return to.indexOf(x) >= 0; }); })[0];
    if (existing) { existing.archived = false; existing.msgs.push({ from: 'me', t: t, time: 'Just now' }); }
    else D.MSGS.unshift({ id: 'c' + Date.now(), with: to, group: to.length > 1 ? to.map(function (x) { return P(x).name.split(' ')[0]; }).join(', ') : null, archived: false, msgs: [{ from: 'me', t: t, time: 'Just now' }] });
    var id = existing ? existing.id : D.MSGS[0].id;
    APP.closeOverlay(); S.msgFolder = 'all'; S.msgQ = ''; APP.go('#/messages/' + id);
    APP.toast('Message sent', to.map(function (x) { return P(x).name.split(' ')[0]; }).join(', ') + ' will get a notification.');
  };
  A['msg-with'] = function (el) {
    var id = el.getAttribute('data-id');
    var c = D.MSGS.filter(function (x) { return !x.group && x.with.length === 1 && x.with[0] === id; })[0];
    APP.closeAll();
    if (c) { c.archived = false; APP.go('#/messages/' + c.id); } else A['msg-new']({ getAttribute: function (k) { return k === 'data-to' ? id : null; } });
  };
})();
