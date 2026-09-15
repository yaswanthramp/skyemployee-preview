/* skyEmployee wireframe: fabricated sample data.
   Every person, community and brand here is invented. The org name is the
   only real customer string and build/scrub.py swaps it for the public copy. */
(function () {
  var ORG = 'Cascade Living';

  var COMMUNITIES = ['Maple Grove', 'Riverside Commons', 'Cedar Hills', 'Corporate Office'];
  var DEPTS = ['Nursing', 'Dining', 'Housekeeping', 'Maintenance', 'Activities', 'Administration'];

  /* people: id, name, initials, title, dept, loc, type, reports, ext, email, published, since */
  var PEOPLE = [
    ['sarah', 'Sarah Mitchell', 'SM', 'Certified Nursing Assistant', 'Nursing', 'Maple Grove', 'Frontline', 'ana', 'x 214', 'sarah.mitchell', true, 'Mar 2022'],
    ['daniel', 'Daniel Okafor', 'DO', 'Payroll Specialist', 'Administration', 'Corporate Office', 'Office', 'grace', 'x 118', 'daniel.okafor', true, 'Jun 2020'],
    ['marcus', 'Marcus Reid', 'MR', 'Executive Director', 'Administration', 'Maple Grove', 'Office', 'grace', 'x 101', 'marcus.reid', true, 'Jan 2019'],
    ['elena', 'Elena Torres', 'ET', 'HR Communications Lead', 'Administration', 'Corporate Office', 'Office', 'grace', 'x 120', 'elena.torres', true, 'Aug 2018'],
    ['dev', 'Dev Patel', 'DP', 'Charge Nurse', 'Nursing', 'Maple Grove', 'Frontline', 'marcus', 'x 230', 'dev.patel', true, 'Feb 2017'],
    ['ana', 'Ana Cruz', 'AC', 'Director of Nursing', 'Nursing', 'Maple Grove', 'Frontline', 'marcus', 'x 205', 'ana.cruz', true, 'Oct 2016'],
    ['maria', 'Maria Gonzalez', 'MG', 'Dining Lead', 'Dining', 'Maple Grove', 'Frontline', 'marcus', 'x 240', 'maria.gonzalez', true, 'Sep 2021'],
    ['james', 'James Whitaker', 'JW', 'Maintenance Technician', 'Maintenance', 'Maple Grove', 'Frontline', 'marcus', '', 'james.whitaker', false, 'May 2023'],
    ['lina', 'Lina Haddad', 'LH', 'Activities Coordinator', 'Activities', 'Maple Grove', 'Frontline', 'marcus', 'x 251', 'lina.haddad', true, 'Sep 2025'],
    ['tomas', 'Tomas Novak', 'TN', 'Housekeeping Supervisor', 'Housekeeping', 'Maple Grove', 'Frontline', 'marcus', 'x 260', 'tomas.novak', true, 'Apr 2015'],
    ['grace', 'Grace Kim', 'GK', 'Chief People Officer', 'Administration', 'Corporate Office', 'Office', '', 'x 100', 'grace.kim', true, 'Jan 2014'],
    ['omar', 'Omar Siddiqui', 'OS', 'Registered Nurse', 'Nursing', 'Maple Grove', 'Frontline', 'dev', 'x 231', 'omar.siddiqui', true, 'Jul 2024'],
    ['rosa', 'Rosa Alvarez', 'RA', 'Cook', 'Dining', 'Maple Grove', 'Frontline', 'maria', '', 'rosa.alvarez', false, 'Aug 2026'],
    ['ben', 'Ben Carter', 'BC', 'Executive Director', 'Administration', 'Riverside Commons', 'Office', 'grace', 'x 301', 'ben.carter', true, 'Nov 2020'],
    ['hana', 'Hana Yoshida', 'HY', 'Registered Nurse', 'Nursing', 'Riverside Commons', 'Frontline', 'ben', 'x 330', 'hana.yoshida', true, 'Mar 2023'],
    ['kofi', 'Kofi Mensah', 'KM', 'Dining Server', 'Dining', 'Riverside Commons', 'Frontline', 'ben', '', 'kofi.mensah', false, 'Jan 2026'],
    ['ivy', 'Ivy Brooks', 'IB', 'Housekeeper', 'Housekeeping', 'Cedar Hills', 'Frontline', 'noah', '', 'ivy.brooks', false, 'Jun 2025'],
    ['noah', 'Noah Fischer', 'NF', 'Executive Director', 'Administration', 'Cedar Hills', 'Office', 'grace', 'x 401', 'noah.fischer', true, 'Feb 2021'],
    ['priya', 'Priya Raman', 'PR', 'Scheduling Coordinator', 'Administration', 'Corporate Office', 'Office', 'grace', 'x 125', 'priya.raman', true, 'Dec 2022'],
    ['leo', 'Leo Martins', 'LM', 'Medication Aide', 'Nursing', 'Cedar Hills', 'Frontline', 'noah', 'x 430', 'leo.martins', true, 'Aug 2024'],
    ['chloe', 'Chloe Dubois', 'CD', 'Life Enrichment Aide', 'Activities', 'Riverside Commons', 'Frontline', 'ben', '', 'chloe.dubois', false, 'Apr 2026'],
    ['sam', 'Sam Oyelaran', 'SO', 'Benefits Analyst', 'Administration', 'Corporate Office', 'Office', 'grace', 'x 122', 'sam.oyelaran', true, 'Sep 2019']
  ].map(function (p) {
    return { id: p[0], name: p[1], ini: p[2], title: p[3], dept: p[4], loc: p[5], type: p[6], reports: p[7],
      ext: p[8], email: p[9] + '@cascade.example', published: p[10], since: p[11], role: 'Employee', active: true };
  });
  function byId(id) { for (var i = 0; i < PEOPLE.length; i++) if (PEOPLE[i].id === id) return PEOPLE[i]; return null; }
  byId('marcus').role = 'Controller'; byId('ben').role = 'Controller'; byId('noah').role = 'Controller';
  byId('ana').role = 'Controller';
  byId('elena').role = 'Admin'; byId('grace').role = 'Admin';

  var ROLES = [
    { key: 'emp-f', role: 'Employee', type: 'Frontline', person: 'sarah', label: 'Employee', sub: 'Frontline · CNA at Maple Grove' },
    { key: 'emp-o', role: 'Employee', type: 'Office', person: 'daniel', label: 'Employee', sub: 'Office · Payroll at Corporate' },
    { key: 'ctrl', role: 'Controller', type: 'Office', person: 'marcus', label: 'Controller / Manager', sub: 'Executive Director · Maple Grove', scope: ['Maple Grove'] },
    { key: 'admin', role: 'Admin', type: 'Office', person: 'elena', label: 'Admin', sub: 'HR Communications · all communities', scope: COMMUNITIES }
  ];

  var APPS = {
    skySchedule: { ic: 'calendar-days', desc: 'Shifts, swaps and time off' },
    skyLearn: { ic: 'graduation-cap', desc: 'Courses and training' },
    skySupport: { ic: 'message-square-text', desc: 'Requests and tickets' },
    skySign: { ic: 'pen-line', desc: 'Documents to sign' }
  };
  var APP_SETS = { Frontline: ['skySchedule', 'skyLearn', 'skySupport'], Office: ['skySupport', 'skySign', 'skyLearn', 'skySchedule'] };

  var BANNERS = [
    { id: 'b1', eyebrow: 'Wellness', title: 'Flu shots at every community this week', msg: 'Book a slot that fits your shift. It takes less than a minute.', cta: 'Book your slot', audience: 'Everyone', start: 'Sep 14', end: 'Sep 20', status: 'Live', art: 'shield', by: 'Elena Torres' },
    { id: 'b2', eyebrow: 'Benefits', title: 'Open enrolment starts 1 October', msg: 'Review your medical, dental and vision plans before 31 October.', cta: 'See what changes', audience: 'Everyone', start: 'Sep 10', end: 'Oct 31', status: 'Live', art: 'heart-handshake', by: 'Sam Oyelaran' },
    { id: 'b3', eyebrow: 'Maple Grove', title: 'Family BBQ on Saturday, 2 to 5 PM', msg: 'Bring your family to the courtyard. Dining is covering the grill.', cta: 'Sign up to help', audience: 'Maple Grove', start: 'Sep 12', end: 'Sep 19', status: 'Live', art: 'utensils', by: 'Marcus Reid' },
    { id: 'b4', eyebrow: 'Recognition', title: 'Nominate a Caregiver of the Quarter', msg: 'Tell us who went above and beyond. Nominations close 30 September.', cta: 'Nominate someone', audience: 'Frontline', start: 'Sep 15', end: 'Sep 30', status: 'Live', art: 'award', by: 'Elena Torres' },
    { id: 'b5', eyebrow: 'Payroll', title: 'New paystub portal from 1 November', msg: 'You will get sign-in details by email two weeks before.', cta: 'Read the FAQ', audience: 'Office', start: 'Oct 1', end: 'Nov 15', status: 'Scheduled', art: 'receipt', by: 'Daniel Okafor' }
  ];

  var LEARNING = [
    { t: 'Fire Safety Basics', due: 'Sep 12', dueN: -3, mins: 30 },
    { t: 'Resident Rights and Dignity', due: 'Sep 18', dueN: 3, mins: 45 },
    { t: 'Infection Control Refresher', due: 'Sep 25', dueN: 10, mins: 20 },
    { t: 'Safe Lifting and Transfers', due: 'Oct 6', dueN: 21, mins: 35 }
  ];
  var SHIFTS = [
    { d: 'Tue 15 Sep', time: '7:00 AM to 3:00 PM', where: 'Nursing · West Wing', today: true },
    { d: 'Wed 16 Sep', time: '7:00 AM to 3:00 PM', where: 'Nursing · West Wing' },
    { d: 'Fri 18 Sep', time: '3:00 PM to 11:00 PM', where: 'Nursing · Memory Care' },
    { d: 'Sat 19 Sep', time: '7:00 AM to 3:00 PM', where: 'Nursing · West Wing' }
  ];
  var REQUESTS = [
    { n: '#1042', t: 'Payroll query: missing night differential', s: 'In progress', upd: 'Sep 14', open: true },
    { n: '#1051', t: 'Locker key replacement', s: 'Waiting on you', upd: 'Sep 15', open: true },
    { n: '#1038', t: 'Badge access for Memory Care', s: 'Resolved', upd: 'Sep 2', open: false }
  ];

  var WHOS_ON = [
    { p: 'dev', until: '3:00 PM', key: 'Charge nurse' },
    { p: 'ana', until: '5:00 PM', key: 'Manager on duty' },
    { p: 'omar', until: '7:00 PM' },
    { p: 'sarah', until: '3:00 PM' },
    { p: 'maria', until: '7:00 PM', key: 'Dining lead' },
    { p: 'rosa', until: '2:00 PM' },
    { p: 'tomas', until: '3:30 PM' },
    { p: 'james', until: '4:00 PM' },
    { p: 'lina', until: '6:00 PM' },
    { p: 'marcus', until: '5:30 PM' }
  ];
  var WHOS_ON_OTHER = {
    'Riverside Commons': [{ p: 'hana', until: '7:00 PM', key: 'Charge nurse' }, { p: 'kofi', until: '2:00 PM' }, { p: 'chloe', until: '4:00 PM' }, { p: 'ben', until: '5:00 PM', key: 'Manager on duty' }],
    'Cedar Hills': [{ p: 'leo', until: '3:00 PM', key: 'Charge nurse' }, { p: 'ivy', until: '1:00 PM' }, { p: 'noah', until: '5:00 PM', key: 'Manager on duty' }],
    'Corporate Office': [{ p: 'elena', until: '5:00 PM' }, { p: 'daniel', until: '5:00 PM' }, { p: 'priya', until: '4:30 PM' }, { p: 'sam', until: '5:00 PM' }, { p: 'grace', until: '6:00 PM' }]
  };

  var BADGES = [
    { id: 'above', name: 'Above and Beyond', ic: 'rocket', tone: 'c6', desc: 'Went well past the job to help a resident or colleague', uses: 48 },
    { id: 'team', name: 'Team Player', ic: 'handshake', tone: 'c2', desc: 'Covered, pitched in or made a shift easier for others', uses: 71 },
    { id: 'heart', name: 'Resident Hero', ic: 'heart', tone: 'c3', desc: 'Made a resident feel seen, safe and cared for', uses: 39 },
    { id: 'safety', name: 'Safety Star', ic: 'shield-check', tone: 'c5', desc: 'Spotted or prevented a safety risk', uses: 17 },
    { id: 'welcome', name: 'Warm Welcome', ic: 'smile', tone: 'c4', desc: 'Helped a new starter find their feet', uses: 22 }
  ];

  var REWARD_TYPES = [
    { id: 'rt1', name: 'ShopMart gift card', brand: 'ShopMart', kind: 'Digital gift card', value: 25, avail: 42, low: 10, tone: 'c1', ic: 'store', how: 'Use online or at any ShopMart checkout. Enter the code at payment.', restrict: 'All locations', fulfil: 'code', status: 'Active' },
    { id: 'rt2', name: 'Bean & Brew coffee card', brand: 'Bean & Brew', kind: 'Digital gift card', value: 10, avail: 6, low: 15, tone: 'c8', ic: 'coffee', how: 'Show the code in store or add it to the Bean & Brew app.', restrict: 'All locations', fulfil: 'code', status: 'Active' },
    { id: 'rt3', name: 'FreshCart grocery card', brand: 'FreshCart', kind: 'Digital gift card', value: 50, avail: 18, low: 5, tone: 'c2', ic: 'shopping-cart', how: 'Redeem at checkout online or in any FreshCart store.', restrict: 'All locations', fulfil: 'code', status: 'Active' },
    { id: 'rt4', name: 'RideNow voucher', brand: 'RideNow', kind: 'Voucher', value: 20, avail: 0, low: 5, tone: 'c6', ic: 'car', how: 'Add the voucher code in the RideNow app under Payments.', restrict: 'Frontline only', fulfil: 'code', status: 'Active' },
    { id: 'rt5', name: 'Meal voucher', brand: 'Cascade Dining', kind: 'Voucher', value: 12, avail: 55, low: 10, tone: 'c5', ic: 'utensils', how: 'Show the code at any Cascade Living community cafe.', restrict: 'All locations', fulfil: 'code', status: 'Active' },
    { id: 'rt6', name: 'Cascade fleece jacket', brand: 'Cascade Merchandise', kind: 'Merchandise', value: 45, avail: 30, low: 5, tone: 'c4', ic: 'shirt', how: 'Collected from your community office once fulfilled.', restrict: 'All locations', fulfil: 'task', status: 'Active' },
    { id: 'rt7', name: 'Preferred parking, 1 month', brand: 'Cascade Perk', kind: 'Perk', value: 0, avail: 8, low: 2, tone: 'c7', ic: 'car', how: 'Your community office assigns the space and lets you know.', restrict: 'Maple Grove, Cedar Hills', fulfil: 'task', status: 'Active' },
    { id: 'rt8', name: 'StreamBox 3-month pass', brand: 'StreamBox', kind: 'Digital gift card', value: 30, avail: 3, low: 5, tone: 'c3', ic: 'film', how: 'Redeem at the StreamBox website.', restrict: 'All locations', fulfil: 'code', status: 'Retired' }
  ];

  /* awards: who received what. code fields exist ONLY for the signed-in recipient demo. */
  var AWARDS = [
    { id: 'aw1', to: 'sarah', type: 'rt3', from: 'marcus', date: 'Sep 11', msg: 'Thank you for staying late during the storm and settling Mrs. Hale.', reason: 'Resident care', status: 'Delivered', revealed: false, code: 'FC7K-29QD-M4LX', exp: 'Sep 2027', post: 'p3' },
    { id: 'aw2', to: 'sarah', type: 'rt5', from: 'ana', date: 'Aug 22', msg: 'For covering the double on the 20th. You kept the floor calm.', reason: 'Covered a shift', status: 'Delivered', revealed: true, code: 'MV-88214-Cascade Living', exp: 'Feb 2027' },
    { id: 'aw3', to: 'sarah', type: 'rt6', from: 'marcus', date: 'Jul 30', msg: 'Five years of kindness at Maple Grove.', reason: 'Milestone', status: 'In progress', fulfilment: true },
    { id: 'aw4', to: 'daniel', type: 'rt2', from: 'elena', date: 'Sep 3', msg: 'For turning around the benefits file in a day.', reason: 'Above and beyond', status: 'Delivered', revealed: false, code: 'BB-44X1-90TQ', exp: 'Mar 2027' },
    { id: 'aw5', to: 'dev', type: 'rt1', from: 'marcus', date: 'Sep 9', msg: 'Great call on the fall-risk review.', reason: 'Safety', status: 'Delivered', revealed: true },
    { id: 'aw6', to: 'maria', type: 'rt7', from: 'marcus', date: 'Sep 5', msg: 'For the new menu tasting. Residents loved it.', reason: 'Resident care', status: 'Awarded', fulfilment: true },
    { id: 'aw7', to: 'omar', type: 'rt3', from: 'marcus', date: 'Aug 28', msg: 'Welcome to the team and thanks for the first month.', reason: 'Welcome', status: 'Delivered', revealed: false },
    { id: 'aw8', to: 'hana', type: 'rt1', from: 'ben', date: 'Sep 12', msg: 'Thanks for mentoring our new nurses.', reason: 'Mentoring', status: 'Pending approval', value: 125 },
    { id: 'aw9', to: 'leo', type: 'rt5', from: 'noah', date: 'Sep 13', msg: 'Covered two med passes.', reason: 'Covered a shift', status: 'Delivered', revealed: false },
    { id: 'aw10', to: 'ivy', type: 'rt6', from: 'noah', date: 'Sep 1', msg: 'Spotless inspection result.', reason: 'Quality', status: 'Fulfilled', fulfilment: true },
    { id: 'aw11', to: 'tomas', type: 'rt1', from: 'marcus', date: 'Sep 14', msg: 'For leading the deep clean after the outbreak.', reason: 'Safety', status: 'Delivered', revealed: false },
    { id: 'aw12', to: 'priya', type: 'rt2', from: 'elena', date: 'Sep 10', msg: 'For rebuilding the rota in an afternoon.', reason: 'Above and beyond', status: 'Cancelled' }
  ];

  var ECARD_DESIGNS = [
    { id: 'e1', name: 'Happy birthday', occ: 'Birthday', ic: 'cake', tone: 'c3' },
    { id: 'e2', name: 'Balloons', occ: 'Birthday', ic: 'party-popper', tone: 'c4' },
    { id: 'e3', name: 'Work anniversary', occ: 'Anniversary', ic: 'medal', tone: 'c6' },
    { id: 'e4', name: 'Thank you', occ: 'Thank you', ic: 'heart-handshake', tone: 'c2' },
    { id: 'e5', name: 'You made my shift', occ: 'Thank you', ic: 'sparkles', tone: 'c5' },
    { id: 'e6', name: 'Welcome aboard', occ: 'Welcome', ic: 'hand-heart', tone: 'c1' },
    { id: 'e7', name: 'Get well soon', occ: 'Get well', ic: 'sun', tone: 'c8' },
    { id: 'e8', name: 'Congratulations', occ: 'Congratulations', ic: 'trophy', tone: 'c7' },
    { id: 'e9', name: 'Leadership thanks', occ: 'Thank you', ic: 'crown', tone: 'c6', ctrlOnly: true }
  ];
  var ECARDS_RECEIVED = [
    { from: 'maria', design: 'e5', date: 'Sep 13', msg: 'Thanks for helping with the lunch rush. You are a star.', shared: false },
    { from: 'dev', design: 'e3', date: 'Mar 1', msg: 'Four years! The West Wing would not be the same without you.', shared: true }
  ];
  var MILESTONES = [
    { p: 'maria', what: 'Work anniversary', when: 'Tomorrow', detail: '5 years' },
    { p: 'lina', what: 'Birthday', when: 'Thursday' },
    { p: 'rosa', what: 'First month', when: 'Monday', detail: 'Joined Aug 2026' }
  ];

  /* feed posts */
  var POSTS = [
    { id: 'p1', type: 'Announcement', author: 'grace', time: '2h', pinned: true, until: 'Sep 30', audience: 'Everyone',
      title: 'Welcome to skyEmployee', text: 'This is our new front door for everyone at Cascade Living. Your schedule, learning and requests are on Home, and you can find colleagues, pay information and policies from the menu. Tell us what you think in the comments.',
      likes: 184, liked: false, comments: [{ a: 'dev', t: 'Love having my shifts right here.', time: '1h', likes: 12 }, { a: 'lina', t: 'The Who’s On Today list is going to save me so many walks.', time: '50m', likes: 8 }] },
    { id: 'p2', type: 'Poll', author: 'elena', time: '3h', audience: 'Everyone',
      text: 'Which time works best for the next town hall?', options: [{ t: '7:00 AM, before day shift', v: 121 }, { t: '3:30 PM, shift change', v: 91 }, { t: '7:00 PM, evening', v: 34 }],
      voted: null, closes: 'Friday', showAfter: 'vote', anon: true, likes: 22, liked: false, comments: [] },
    { id: 'p3', type: 'Shout-out', author: 'marcus', time: '4d', audience: 'Maple Grove', to: ['sarah'], badge: 'heart', gift: 'aw1',
      text: 'Sarah stayed two hours past her shift during Thursday’s storm and sat with Mrs. Hale until she fell asleep. That is what care looks like. Thank you, Sarah.',
      likes: 96, liked: true, comments: [{ a: 'ana', t: 'So proud of you, Sarah.', time: '4d', likes: 14 }] },
    { id: 'p4', type: 'Video', author: 'grace', time: '1d', audience: 'Everyone', title: 'A 2-minute update on our new visitor policy', dur: '2:04',
      text: 'Our Chief People Officer walks through what changes for visitors from 1 October and what it means on the floor.', likes: 58, liked: false, comments: [] },
    { id: 'p5', type: 'Survey', author: 'elena', time: '1d', audience: 'Everyone', survey: 's1',
      text: 'Our September pulse survey is open. Six quick questions about how your month went. Your answers are anonymous.', likes: 11, liked: false, comments: [] },
    { id: 'p6', type: 'Spotlight', author: 'marcus', time: '2d', audience: 'Maple Grove', to: ['tomas'],
      title: 'Spotlight: Tomas Novak, 11 years of spotless', text: 'Tomas joined Maple Grove as a housekeeper in 2015 and now leads a team of nine. Residents know him for his whistling and for always remembering how they like their rooms. This month he led the deep clean that got us through the outbreak without a single new case.',
      likes: 142, liked: false, comments: [{ a: 'maria', t: 'The whistling is iconic.', time: '2d', likes: 21 }] },
    { id: 'p7', type: 'Post', author: 'lina', time: '2d', audience: 'Everyone', photos: 3,
      text: 'Garden club harvested the last tomatoes of the summer today. Thanks @Maria Gonzalez for turning them into salsa for lunch!', likes: 77, liked: false, comments: [] },
    { id: 'p8', type: 'Shout-out', author: 'dev', time: '3d', audience: 'Everyone', to: ['omar', 'james'], badge: 'team',
      text: 'Omar and James fixed the call bell in room 12 and checked every other room on the corridor before end of shift. Thank you both.', likes: 45, liked: false, comments: [] },
    { id: 'p9', type: 'Post', author: 'omar', time: '5d', audience: 'Everyone', reported: true,
      text: 'Anyone want to swap the Sunday night shift? DM me.', likes: 3, liked: false, comments: [] },
    { id: 'p10', type: 'E-card', author: 'dev', time: '6d', audience: 'Everyone', to: ['lina'], design: 'e6',
      text: 'Welcome to Maple Grove, Lina! One year already.', likes: 30, liked: false, comments: [] }
  ];

  var SURVEYS = [
    { id: 's1', title: 'September pulse survey', status: 'Open', anon: true, recur: 'Monthly', audience: 'Everyone', opens: 'Sep 8', closes: 'Sep 22', mins: 3,
      responses: 412, invited: 980, due: 'Sep 22', dueN: 7,
      questions: [
        { q: 'How would you rate your month at work?', type: 'rating', req: true },
        { q: 'Do you feel you have what you need to do your job well?', type: 'yesno', req: true },
        { q: 'Which of these made your job harder this month?', type: 'multi', opts: ['Short staffing', 'Equipment', 'Communication', 'Scheduling', 'None of these'] },
        { q: 'How likely are you to recommend Cascade Living as a place to work?', type: 'rating10' },
        { q: 'Which best describes your shift pattern?', type: 'single', opts: ['Days', 'Evenings', 'Nights', 'Rotating'] },
        { q: 'Anything else you would like leadership to know?', type: 'text' }
      ] },
    { id: 's2', title: 'First 90 days check-in', status: 'Open', anon: false, recur: 'One-off', audience: 'Tenure: first 90 days', opens: 'Sep 1', closes: 'Sep 30', mins: 4, responses: 21, invited: 38 },
    { id: 's3', title: 'August pulse survey', status: 'Closed', anon: true, recur: 'Monthly', audience: 'Everyone', opens: 'Aug 8', closes: 'Aug 22', mins: 3, responses: 506, invited: 975 },
    { id: 's4', title: 'Dining experience feedback', status: 'Draft', anon: true, recur: 'Quarterly', audience: 'Dining teams', opens: 'Oct 1', closes: 'Oct 14', mins: 5, responses: 0, invited: 0 }
  ];

  var RESOURCE_CATS = [
    { id: 'hr', name: 'HR policies', ic: 'users', owner: 'grace' },
    { id: 'clin', name: 'Clinical protocols', ic: 'stethoscope', owner: 'ana' },
    { id: 'emer', name: 'Emergency and infection control', ic: 'triangle-alert', owner: 'dev' },
    { id: 'forms', name: 'Forms and templates', ic: 'file-text', owner: 'priya' },
    { id: 'play', name: 'Cascade playbooks', ic: 'book-open', owner: 'elena' }
  ];
  var RESOURCES = [
    { id: 'r1', t: 'Infection control policy', d: 'Hand hygiene, PPE and isolation steps for every community.', cat: 'emer', kind: 'Document', ver: 'Sep 1, 2026', review: 'Mar 2027', ack: true, ackDue: 'Sep 19', ackDueN: 4, acked: false, fav: true, owner: 'dev', ackRate: 72 },
    { id: 'r2', t: 'Visitor policy from 1 October', d: 'Visiting hours, sign-in and what to do if a visitor is unwell.', cat: 'hr', kind: 'Document', ver: 'Sep 10, 2026', review: 'Sep 2027', ack: true, ackDue: 'Sep 30', ackDueN: 15, acked: false, fav: false, owner: 'grace', ackRate: 41 },
    { id: 'r3', t: 'Fall prevention protocol', d: 'Risk assessment, hourly rounding and post-fall huddle.', cat: 'clin', kind: 'Document', ver: 'Jun 4, 2026', review: 'Aug 2026', ack: false, fav: true, owner: 'ana' },
    { id: 'r4', t: 'Fire evacuation walkthrough', d: 'A 4-minute video of the evacuation route at each community.', cat: 'emer', kind: 'Video', ver: 'Apr 12, 2026', review: 'Apr 2027', ack: false, fav: false, owner: 'dev' },
    { id: 'r5', t: 'PTO request form', d: 'Request paid time off when skySchedule is not available.', cat: 'forms', kind: 'Document', ver: 'Jan 5, 2026', review: 'Jan 2027', ack: false, fav: false, owner: 'priya' },
    { id: 'r6', t: 'Uniform and dress code', d: 'What to wear on shift, including shoes and jewellery.', cat: 'hr', kind: 'Document', ver: 'Feb 18, 2026', review: 'Jul 2026', ack: false, fav: false, owner: 'grace' },
    { id: 'r7', t: 'Employee handbook 2026', d: 'Everything about working at Cascade Living in one place.', cat: 'hr', kind: 'Document', ver: 'Jan 1, 2026', review: 'Jan 2027', ack: false, sign: true, fav: false, owner: 'grace' },
    { id: 'r8', t: 'Dementia care playbook', d: 'Person-centred approaches that work in memory care.', cat: 'play', kind: 'Link', ver: 'May 20, 2026', review: 'May 2027', ack: false, fav: false, owner: 'elena' },
    { id: 'r9', t: 'Incident report template', d: 'Use within 24 hours of any resident incident.', cat: 'forms', kind: 'Document', ver: 'Mar 3, 2026', review: 'Mar 2027', ack: false, fav: false, owner: 'priya' },
    { id: 'r10', t: 'Hurricane readiness checklist', d: 'Supplies, staffing and communication before a storm.', cat: 'emer', kind: 'Image', ver: 'Aug 1, 2026', review: 'Jun 2026', ack: false, fav: false, owner: 'dev' },
    { id: 'r11', t: 'New starter playbook', d: 'The first two weeks for new team members and their buddies.', cat: 'play', kind: 'Document', ver: 'Jul 7, 2026', review: 'Jul 2027', ack: false, fav: false, owner: 'elena' }
  ];

  var PAY_PERIODS = [
    ['Aug 16 to Aug 29', 'Sep 4'], ['Aug 30 to Sep 12', 'Sep 18'], ['Sep 13 to Sep 26', 'Oct 2'], ['Sep 27 to Oct 10', 'Oct 16'],
    ['Oct 11 to Oct 24', 'Oct 30'], ['Oct 25 to Nov 7', 'Nov 13'], ['Nov 8 to Nov 21', 'Nov 25'], ['Nov 22 to Dec 5', 'Dec 11'], ['Dec 6 to Dec 19', 'Dec 23']
  ];
  var FAQ = [
    { q: 'When is my next paycheck?', a: 'Pay is every other Friday. Your next pay date is Friday 18 September, for the period 30 August to 12 September. See the full pay calendar for the year.' },
    { q: 'How do I see my paystub?', a: 'Paystubs, tax forms and direct deposit details live in the payroll portal. Use View paystubs on the Overview tab. skyEmployee never shows pay amounts or bank details.' },
    { q: 'What is a shift differential?', a: 'Extra pay per hour for working evenings, nights or weekends. The rates for your community are on the Pay rules tab.' },
    { q: 'When does overtime start?', a: 'After 40 worked hours in a work week, paid at one and a half times your base rate. PTO hours do not count toward the 40.' },
    { q: 'How much PTO do I have?', a: 'Your balance is on the Overview tab and comes from the payroll system. It updates the day after each pay date.' },
    { q: 'Which holidays pay time and a half?', a: 'New Year’s Day, Memorial Day, Independence Day, Labor Day, Thanksgiving and Christmas Day.' },
    { q: 'How do I change my benefits outside open enrolment?', a: 'Only after a qualifying life event such as marriage, birth or loss of other coverage. Raise a benefits request within 30 days.' },
    { q: 'Who do I contact about a missing payment?', a: 'Raise a payroll request in skySupport. Payroll replies within one working day.' }
  ];

  var NOTIFS = [
    { ic: 'gift', t: '<b>Marcus Reid</b> awarded you a FreshCart grocery card', time: '4d', go: '#/rewards', unread: true },
    { ic: 'at-sign', t: '<b>Dev Patel</b> mentioned you in a comment', time: '5h', go: '#/home/post/p1', unread: true },
    { ic: 'clipboard-list', t: 'September pulse survey closes in 7 days', time: '1d', go: 'survey:s1', unread: true },
    { ic: 'file-check', t: 'Please acknowledge the Infection control policy', time: '2d', go: '#/resources/acknowledge', unread: false },
    { ic: 'mail', t: '<b>Maria Gonzalez</b> sent you an e-card', time: '2d', go: '#/rewards/ecards', unread: false },
    { ic: 'megaphone', t: 'New announcement: Welcome to skyEmployee', time: '2h', go: '#/home/post/p1', unread: false }
  ];

  var AUDIT = [
    ['Sep 15, 9:42 AM', 'Revealed by recipient', 'GC-FC-0192', 'Omar Siddiqui', 'FreshCart grocery card'],
    ['Sep 14, 4:10 PM', 'Assigned', 'GC-SM-0418', 'Marcus Reid', 'ShopMart gift card to Tomas Novak'],
    ['Sep 13, 2:02 PM', 'Assigned', 'GC-MV-0907', 'Noah Fischer', 'Meal voucher to Leo Martins'],
    ['Sep 12, 11:30 AM', 'Held for approval', 'GC-SM-0417', 'Ben Carter', 'ShopMart gift card x5 to Hana Yoshida'],
    ['Sep 11, 3:15 PM', 'Voided', 'GC-BB-0033', 'Elena Torres', 'Reason: already used elsewhere'],
    ['Sep 10, 10:05 AM', 'Cancelled', 'GC-BB-0031', 'Elena Torres', 'Award to Priya Raman cancelled before view'],
    ['Sep 9, 9:00 AM', 'Added (bulk, 40 codes)', 'GC-SM-0379 to 0418', 'Elena Torres', 'Re-authenticated'],
    ['Sep 5, 1:45 PM', 'Fulfilment task created', 'FT-0022', 'Marcus Reid', 'Preferred parking for Maria Gonzalez']
  ];

  var CODES = [
    ['GC-SM-0418', 'rt1', 'Assigned', 'Tomas Novak', 'No', 'Sep 2027'],
    ['GC-SM-0417', 'rt1', 'Assigned', 'Hana Yoshida', 'No', 'Sep 2027'],
    ['GC-SM-0416', 'rt1', 'Available', '', '', 'Sep 2027'],
    ['GC-SM-0415', 'rt1', 'Available', '', '', 'Sep 2027'],
    ['GC-FC-0192', 'rt3', 'Delivered', 'Omar Siddiqui', 'Yes', 'Aug 2027'],
    ['GC-FC-0191', 'rt3', 'Delivered', 'Sarah Mitchell', 'No', 'Sep 2027'],
    ['GC-MV-0907', 'rt5', 'Delivered', 'Leo Martins', 'No', 'Feb 2027'],
    ['GC-BB-0033', 'rt2', 'Void', '', '', 'Mar 2027'],
    ['GC-BB-0032', 'rt2', 'Available', '', '', 'Mar 2027'],
    ['GC-BB-0031', 'rt2', 'Available', '', '', 'Mar 2027']
  ];

  var CONTENT = [
    { t: 'Welcome to skyEmployee', kind: 'Announcement', audience: 'Everyone', loc: 'All', status: 'Pinned', date: 'Sep 15', by: 'grace' },
    { t: 'Spotlight: Tomas Novak', kind: 'Spotlight', audience: 'Maple Grove', loc: 'Maple Grove', status: 'Live', date: 'Sep 13', by: 'marcus' },
    { t: 'Family BBQ volunteers needed', kind: 'Announcement', audience: 'Maple Grove', loc: 'Maple Grove', status: 'Scheduled', date: 'Sep 17', by: 'marcus' },
    { t: 'Riverside roof repair update', kind: 'Announcement', audience: 'Riverside Commons', loc: 'Riverside Commons', status: 'Live', date: 'Sep 11', by: 'ben' },
    { t: 'Spotlight: Hana Yoshida', kind: 'Spotlight', audience: 'Riverside Commons', loc: 'Riverside Commons', status: 'Draft', date: '', by: 'ben' },
    { t: 'Open enrolment reminder', kind: 'Announcement', audience: 'Everyone', loc: 'All', status: 'Scheduled', date: 'Oct 1', by: 'sam' }
  ];
  var POLLS = [
    { q: 'Which time works best for the next town hall?', audience: 'Everyone', loc: 'All', votes: 246, closes: 'Sep 18', status: 'Open', by: 'elena' },
    { q: 'Theme for the Maple Grove fall party?', audience: 'Maple Grove', loc: 'Maple Grove', votes: 58, closes: 'Sep 25', status: 'Open', by: 'marcus' },
    { q: 'Should the cafe open 30 minutes earlier?', audience: 'Frontline', loc: 'All', votes: 412, closes: 'Sep 1', status: 'Closed', by: 'elena' },
    { q: 'Best night for staff trivia?', audience: 'Cedar Hills', loc: 'Cedar Hills', votes: 0, closes: 'Oct 2', status: 'Scheduled', by: 'noah' }
  ];
  var REPORTS = [
    { post: 'p9', loc: 'Maple Grove', by: 'Two reports', reason: 'Shift swaps should go through skySchedule', when: '5h' },
    { post: 'p7', loc: 'Maple Grove', by: 'One report', reason: 'Resident may be visible in photo 2', when: '1d' },
    { post: null, loc: 'Riverside Commons', by: 'One report', reason: 'Offensive language in a comment', when: '2d', text: 'Comment on "Riverside roof repair update"' }
  ];
  var VIDEOS = [
    { t: 'A 2-minute update on our visitor policy', dur: '2:04', by: 'grace', views: 812 },
    { t: 'How to read your new paystub', dur: '1:30', by: 'daniel', views: 455 },
    { t: 'Meet the Cedar Hills night team', dur: '3:12', by: 'noah', views: 301 },
    { t: 'Hand hygiene in 60 seconds', dur: '1:00', by: 'dev', views: 1204 }
  ];

  window.SE = {
    ORG: ORG, COMMUNITIES: COMMUNITIES, DEPTS: DEPTS, PEOPLE: PEOPLE, byId: byId, ROLES: ROLES, APPS: APPS, APP_SETS: APP_SETS,
    BANNERS: BANNERS, LEARNING: LEARNING, SHIFTS: SHIFTS, REQUESTS: REQUESTS, WHOS_ON: WHOS_ON, WHOS_ON_OTHER: WHOS_ON_OTHER,
    BADGES: BADGES, REWARD_TYPES: REWARD_TYPES, AWARDS: AWARDS, ECARD_DESIGNS: ECARD_DESIGNS, ECARDS_RECEIVED: ECARDS_RECEIVED,
    MILESTONES: MILESTONES, POSTS: POSTS, SURVEYS: SURVEYS, RESOURCE_CATS: RESOURCE_CATS, RESOURCES: RESOURCES,
    PAY_PERIODS: PAY_PERIODS, FAQ: FAQ, NOTIFS: NOTIFS, AUDIT: AUDIT, CODES: CODES, CONTENT: CONTENT, POLLS: POLLS,
    REPORTS: REPORTS, VIDEOS: VIDEOS
  };
})();
