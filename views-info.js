/* skyEmployee wireframe: Pay & Benefits and Resources & Policies. */
(function () {
  var D = SE, A = APP.ACT, S = APP.S, ic = APP.ic, esc = APP.esc, P = APP.P, badge = APP.badge, btn = APP.btn;
  S.faqQ = ''; S.faqOpen = {}; S.resQ = ''; S.resCat = 'all';

  /* ---------------- Pay & Benefits ---------------- */
  function raiseRequest(label) { return btn(label || 'Ask payroll in skySupport', 'btn-surface', 'message-square-text', 'data-act="open-app" data-app="skySupport" data-what="New payroll or benefits request"'); }
  function payOverview() {
    var me = APP.me();
    return '<div class="kpi-row">' +
      '<button class="card stat-card is-clickable" data-act="go" data-href="#/pay/calendar"><div class="sc-head"><span class="sc-label">Next pay date</span><span class="sc-icon">' + ic('calendar-days', 18) + '</span></div><div class="sc-value">Fri 18 Sep</div><div class="t-1 text-low">For 30 Aug to 12 Sep · in 3 days</div></button>' +
      '<section class="card stat-card"><div class="sc-head"><span class="sc-label">PTO balance</span><span class="sc-icon">' + ic('plane', 18) + '</span></div><div class="sc-value">46.5 hrs</div><div class="t-1 text-low">About 5.8 shifts · from payroll, as of 4 Sep</div></section>' +
      '<section class="card stat-card"><div class="sc-head"><span class="sc-label">Open enrolment</span><span class="sc-icon">' + ic('heart-handshake', 18) + '</span></div><div class="sc-value">Oct 1</div><div class="t-1 text-low">Window runs to 31 October</div></section>' +
      '<section class="card stat-card"><div class="sc-head"><span class="sc-label">Holiday pay next</span><span class="sc-icon">' + ic('sun', 18) + '</span></div><div class="sc-value">Nov 26</div><div class="t-1 text-low">Thanksgiving, time and a half</div></section></div>' +
      '<div class="split-2"><section class="card">' + APP.panelHead('Payroll portal', 'Paystubs, tax forms and direct deposit live in the payroll system.') +
      '<div class="link-tiles">' + [['receipt', 'View paystubs', 'Latest: 4 Sep'], ['file-text', 'Tax forms', 'W-2 and W-4'], ['landmark', 'Direct deposit', 'Update your bank details'], ['calendar-clock', 'Request time off', 'In skySchedule']].map(function (t) {
        return '<button class="link-tile" data-act="open-app" data-app="' + (t[1] === 'Request time off' ? 'skySchedule' : 'Payroll portal') + '" data-what="' + t[1] + '"><span class="at-ic">' + ic(t[0], 18) + '</span><span class="pl-text"><span class="pl-name">' + t[1] + '</span><span class="pl-sub">' + t[2] + '</span></span>' + ic('external-link', 14) + '</button>'; }).join('') + '</div>' +
      '<p class="t-1 text-low">' + ic('lock', 12) + ' skyEmployee never shows pay amounts or bank details.</p></section>' +
      '<section class="card">' + APP.panelHead('Popular questions', null, '<a class="link t-1" href="#/pay/faq">All FAQs</a>') + '<div class="q-list">' + D.FAQ.slice(0, 4).map(function (f, i) { return '<a class="q-row" href="#/pay/faq" data-act="faq-jump" data-i="' + i + '">' + ic('circle-help', 16) + '<span>' + esc(f.q) + '</span>' + ic('chevron-right', 14) + '</a>'; }).join('') + '</div>' +
      '<div class="ask-box"><span class="t-2">Cannot find your answer?</span>' + raiseRequest() + '</div></section></div>' +
      '<p class="t-1 text-low">' + ic('map-pin', 12) + ' Showing rules for ' + esc(me.loc) + (me.type === 'Frontline' ? ', hourly frontline staff.' : ', salaried office staff.') + '</p>';
  }
  A['faq-jump'] = function (el) { S.faqOpen = {}; S.faqOpen[+el.getAttribute('data-i')] = true; APP.go('#/pay/faq'); };
  function payCalendar() {
    var next = 1;
    return '<div class="split-2"><section class="card flush-card"><div class="card-pad">' + APP.panelHead('2026 pay calendar', 'Paid every other Friday by direct deposit.', APP.dd('payYear', ['2026', '2027'], S.f.payYear || '2026') + btn('Add to calendar', 'btn-surface', 'calendar', 'data-act="noop-toast" data-t="Calendar file ready" data-b="Pay dates were added as an .ics file." data-k="info"', 'is-sm')) + '</div>' +
      APP.table(['Pay period', 'Pay date', 'Status'], D.PAY_PERIODS.map(function (p, i) {
        return { attrs: i === next ? 'class="is-selected"' : '', cells: [p[0], '<span class="cell-strong">' + p[1] + '</span>', i < next ? badge('Paid', 'is-neutral') : i === next ? badge('Next', 'is-info') : '<span class="text-low">Upcoming</span>'] }; })) + '</section>' +
      '<div class="stack-4"><section class="card">' + APP.panelHead('Key dates') + '<div class="data-list"><span class="dl-label">Timesheet cut-off</span><span class="dl-value">Saturday before pay date, 11:59 PM</span><span class="dl-label">Holiday schedule</span><span class="dl-value">Pay moves to the day before if a pay date is a holiday</span><span class="dl-label">W-2 available</span><span class="dl-value">By 31 January</span></div></section>' +
      '<section class="card">' + APP.panelHead('Something wrong with a paycheck?') + '<p class="t-2 text-low">Payroll replies within one working day.</p>' + raiseRequest('Raise a payroll request') + '</section></div></div>';
  }
  function payRules() {
    var acc = function (id, title, inner, tag) { var open = S.faqOpen['r' + id]; return '<div class="accordion-item"><button class="accordion-header" aria-expanded="' + !!open + '" data-act="acc" data-k="r' + id + '"><span class="acc-chevron">' + ic('chevron-right', 16) + '</span>' + title + (tag ? '<span class="acc-tag">' + tag + '</span>' : '') + '</button>' + (open ? '<div class="accordion-panel">' + inner + '</div>' : '') + '</div>'; };
    return '<section class="card">' + APP.panelHead('Pay rules in plain language', 'Maintained by the payroll team. Last reviewed 1 September 2026.', APP.dd('payLoc', D.COMMUNITIES.slice(0, 3), S.f.payLoc || (APP.me().loc === 'Corporate Office' ? 'Maple Grove' : APP.me().loc))) +
      '<div class="accordion">' +
      acc(1, 'Shift differentials', '<p>You earn extra per hour for less popular shifts. Differentials stack with overtime.</p>' + APP.table(['Shift', 'When', { t: 'Extra per hour', num: true }], [['Evening', '3:00 PM to 11:00 PM', '$1.50'], ['Night', '11:00 PM to 7:00 AM', '$2.25'], ['Weekend', 'Saturday and Sunday, any shift', '$1.00'], ['Charge nurse', 'While assigned as charge', '$2.00']]), badge('Frontline', 'is-neutral')) +
      acc(2, 'Overtime', '<p>Overtime starts after 40 hours worked in a Sunday to Saturday week and is paid at one and a half times your base rate. PTO and holiday hours do not count toward the 40. Overtime must be approved by your supervisor in skySchedule before the shift.</p>') +
      acc(3, 'Holiday pay', '<p>Working on New Year’s Day, Memorial Day, Independence Day, Labor Day, Thanksgiving or Christmas Day pays time and a half. If you are scheduled off, eligible staff receive 8 hours of holiday pay.</p>') +
      acc(4, 'Meal and rest breaks', '<p>A 30-minute unpaid meal break for shifts over 6 hours and a paid 10-minute rest break for every 4 hours. If you miss a meal break, tell your supervisor the same day so it can be paid.</p>') +
      acc(5, 'On-call pay', '<p>$3.00 per hour while on call, and your full rate from the moment you are called in, with a two-hour minimum.</p>', badge('Nursing', 'is-neutral')) +
      '</div></section>';
  }
  A.acc = function (el) { var k = el.getAttribute('data-k'); S.faqOpen[k] = !S.faqOpen[k]; APP.rerender(); };
  function benefits() {
    var plans = [['stethoscope', 'Medical', 'Three plans: HMO, PPO and a high-deductible plan with an HSA.', 'Enrolled: PPO'], ['smile', 'Dental', 'Preventive care at 100%, basic at 80%, major at 50%.', 'Enrolled'], ['eye', 'Vision', 'Annual exam and a $150 frame allowance.', 'Not enrolled'], ['piggy-bank', '401(k) retirement', 'Cascade Living matches 50% of the first 6% you save.', 'Saving 4%'], ['heart-handshake', 'Employee assistance', 'Free, confidential counselling for you and your family, 24/7.', 'Available to all'], ['umbrella', 'Life and disability', 'Basic life insurance of 1x salary at no cost.', 'Enrolled']];
    return APP.callout('<b>Open enrolment runs 1 to 31 October.</b> Review your plans before then. Changes take effect 1 January 2027.', 'is-info', 'calendar-clock') +
      '<div class="card-grid benefit-grid">' + plans.map(function (p) {
        return '<section class="card benefit-card"><div class="bc-head"><span class="sc-icon">' + ic(p[0], 18) + '</span><span class="t-4 fw-bold">' + p[1] + '</span>' + badge(p[3], p[3].indexOf('Not') === 0 ? 'is-neutral' : 'is-success') + '</div><p class="t-2 text-low">' + p[2] + '</p><div class="row-gap">' + btn('Plan summary', 'btn-surface', 'file-text', 'data-act="noop-toast" data-t="Plan summary" data-b="Opens the PDF summary for ' + p[1] + '." data-k="info"', 'is-sm') + btn('Provider site', 'btn-ghost', 'external-link', 'data-act="open-app" data-app="Benefits provider" data-what="' + p[1] + '"', 'is-sm') + '</div></section>';
      }).join('') + '</div>' +
      '<section class="card">' + APP.panelHead('Key benefit dates') + APP.table(['Date', 'What happens'], [['Oct 1', 'Open enrolment opens'], ['Oct 15', 'Benefits fair at every community, 11 AM to 2 PM'], ['Oct 31', 'Open enrolment closes'], ['Jan 1, 2027', 'New elections take effect']]) + '</section>';
  }
  APP.INPUT['faq-search'] = function (el) { S.faqQ = el.value; document.getElementById('faqList').innerHTML = faqList(); };
  A['faq-toggle'] = function (el) { var i = +el.getAttribute('data-i'); S.faqOpen[i] = !S.faqOpen[i]; document.getElementById('faqList').innerHTML = faqList(); };
  function faqList() {
    var q = S.faqQ.trim().toLowerCase();
    var list = D.FAQ.map(function (f, i) { return [f, i]; }).filter(function (x) { return !q || (x[0].q + ' ' + x[0].a).toLowerCase().indexOf(q) >= 0; });
    if (!list.length) return APP.emptyState('circle-help', 'No answer for "' + esc(S.faqQ) + '"', 'Payroll and benefits can help. Raise a request and they reply within one working day.', btn('Raise a request in skySupport', 'btn-solid', 'message-square-text', 'data-act="open-app" data-app="skySupport" data-what="Payroll or benefits question: ' + esc(S.faqQ) + '"'));
    return '<div class="accordion">' + list.map(function (x) {
      var open = S.faqOpen[x[1]] || !!q;
      return '<div class="accordion-item"><button class="accordion-header" aria-expanded="' + open + '" data-act="faq-toggle" data-i="' + x[1] + '"><span class="acc-chevron">' + ic('chevron-right', 16) + '</span>' + esc(x[0].q) + '</button>' + (open ? '<div class="accordion-panel"><p>' + esc(x[0].a) + '</p><div class="faq-help"><span class="t-1 text-low">Was this helpful?</span>' + btn('Yes', 'btn-ghost', 'thumbs-up', 'data-act="noop-toast" data-t="Thanks for the feedback"', 'is-sm') + btn('No, ask payroll', 'btn-ghost', 'message-square-text', 'data-act="open-app" data-app="skySupport" data-what="Follow-up: ' + esc(x[0].q) + '"', 'is-sm') + '</div></div>' : '') + '</div>';
    }).join('') + '</div>';
  }
  function faq() {
    return '<section class="card"><div class="search faq-search"><span class="search-icon">' + ic('search', 16) + '</span><input class="input" placeholder="Search questions, for example overtime or PTO" value="' + esc(S.faqQ) + '" data-input="faq-search" aria-label="Search the FAQ"></div><div id="faqList">' + faqList() + '</div></section>' +
      '<section class="card ask-card"><div><div class="t-4 fw-bold">Still stuck?</div><p class="t-2 text-low">Raise a payroll or benefits request in skySupport. You can track it on Home in My Requests.</p></div>' + raiseRequest('Raise a request') + '</section>';
  }
  APP.DD = APP.DD || {}; APP.DD.payYear = function () { APP.rerender(); }; APP.DD.payLoc = function () { APP.rerender(); };

  APP.VIEWS.pay = function (r) {
    var tab = r[1] || 'overview';
    var items = [['overview', 'Overview', '#/pay'], ['calendar', 'Pay calendar', '#/pay/calendar'], ['rules', 'Pay rules', '#/pay/rules'], ['benefits', 'Benefits', '#/pay/benefits'], ['faq', 'FAQ', '#/pay/faq']];
    var body = { overview: payOverview, calendar: payCalendar, rules: payRules, benefits: benefits, faq: faq }[tab]();
    return APP.page({ crumbs: [['Home', '#/home'], ['Pay & Benefits', '#/pay'], [items.filter(function (i) { return i[0] === tab; })[0][1]]], title: 'Pay & Benefits', desc: 'Pay dates, time off, the rules behind your paycheck and your benefits, in plain language.', tabs: APP.tabs(items, tab), body: body });
  };

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
