// Leonida Trophy Atlas — tracker logic.
// Loads data/trophies.json, renders trophy cards, keeps earned trophies in
// localStorage, and offers search, kind and grade filters, a spoiler-safe
// mode, and export/import of progress as a JSON file.
const EARNED_KEY = 'leonida-trophy-atlas-earned-v1';
const SPOILER_KEY = 'leonida-trophy-atlas-spoiler-v1';
const KIND_LABELS = {
  story: 'Story', missable: 'Missable', collectibles: 'Collectibles',
  activities: 'Activities', quests: 'Quests', crime: 'Crime',
  completion: 'Completion', online: 'Online',
};
const KINDS = ['all', 'story', 'missable', 'collectibles', 'activities', 'quests', 'crime', 'completion', 'online'];
const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

const grid = document.getElementById('trophy-grid');
const countEl = document.getElementById('progress-count');
const pctEl = document.getElementById('progress-pct');
const fillEl = document.getElementById('progress-fill');
const barEl = document.getElementById('progress-bar');
const gradesEl = document.getElementById('progress-grades');
const resultEl = document.getElementById('result-count');
const emptyEl = document.getElementById('empty-state');
const searchInput = document.getElementById('search');
const gradeSelect = document.getElementById('grade');
const hideEarnedInput = document.getElementById('hide-earned');
const spoilerInput = document.getElementById('spoiler');
const spoilerNote = document.getElementById('spoiler-note');
const chipsEl = document.getElementById('kind-chips');

const params = new URLSearchParams(location.search);
const openIds = new Set(
  params.getAll('open').flatMap((v) => v.split(',')).map(Number).filter((n) => Number.isFinite(n)),
);
if (params.get('spoilers') === 'on') localStorage.setItem(SPOILER_KEY, 'true');

let trophies = [];
let earned = new Set();
let openGuides = new Set(openIds);
let activeKind = 'all';

try {
  earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]'));
} catch {
  earned = new Set();
}
spoilerInput.checked = localStorage.getItem(SPOILER_KEY) === 'true';

function loadTrophies() {
  return fetch('data/trophies.json').then((res) => res.json());
}

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort()));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoilerInput.checked ? 'true' : 'false');
}

function isHidden(t) {
  return spoilerInput.checked && t.kinds.includes('story') && !earned.has(t.name);
}

function matches(t) {
  if (activeKind !== 'all' && !t.kinds.includes(activeKind)) return false;
  if (gradeSelect.value !== 'all' && t.grade !== gradeSelect.value) return false;
  if (hideEarnedInput.checked && earned.has(t.name)) return false;
  const q = searchInput.value.trim().toLowerCase();
  if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
  return true;
}

function renderProgress() {
  const total = trophies.length;
  const got = trophies.filter((t) => earned.has(t.name)).length;
  const pct = total ? Math.round((got / total) * 100) : 0;
  countEl.textContent = `${got} / ${total}`;
  pctEl.textContent = `${pct}%`;
  fillEl.style.width = `${pct}%`;
  barEl.setAttribute('aria-valuenow', String(got));
  barEl.setAttribute('aria-valuemax', String(total));
  gradesEl.textContent = GRADE_ORDER.map((g) => {
    const inGrade = trophies.filter((t) => t.grade === g);
    const gotGrade = inGrade.filter((t) => earned.has(t.name)).length;
    return `${g[0].toUpperCase() + g.slice(1)} ${gotGrade}/${inGrade.length}`;
  }).join(' · ');
}

function renderChips() {
  chipsEl.replaceChildren();
  for (const kind of KINDS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.textContent = kind === 'all' ? 'All' : KIND_LABELS[kind];
    btn.setAttribute('aria-pressed', String(activeKind === kind));
    btn.addEventListener('click', () => { activeKind = kind; render(); });
    chipsEl.append(btn);
  }
}

function makeTag(text, cls) {
  const li = document.createElement('li');
  li.textContent = text;
  if (cls) li.className = cls;
  return li;
}

function trophyCard(t) {
  const card = document.createElement('article');
  card.className = 'trophy-card' + (earned.has(t.name) ? ' earned' : '');
  card.dataset.trophyId = String(t.id);

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name); else earned.delete(t.name);
    saveEarned();
    render();
  });
  const title = document.createElement('div');
  title.className = 'trophy-title';
  const h = document.createElement('h3');
  h.textContent = isHidden(t) ? 'Hidden story trophy' : t.name;
  title.append(h);
  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${t.grade}`;
  badge.textContent = t.grade;
  head.append(box, title, badge);
  card.append(head);

  if (isHidden(t)) {
    const p = document.createElement('p');
    p.className = 'hidden-trophy';
    p.textContent = 'Spoiler-safe mode hides this story trophy until you earn it.';
    card.append(p);
    return card;
  }

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = t.description;
  card.append(desc);

  const tags = document.createElement('ul');
  tags.className = 'tags';
  for (const k of t.kinds) tags.append(makeTag(KIND_LABELS[k] ?? k, k === 'missable' ? 'tag-missable' : ''));
  if (t.missable) tags.append(makeTag('Possibly missable', 'tag-missable'));
  card.append(tags);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  toggle.setAttribute('aria-expanded', String(openGuides.has(t.id)));
  toggle.textContent = openGuides.has(t.id) ? 'Hide guide' : 'Show guide';
  const body = document.createElement('div');
  body.className = 'guide-body';
  const guideText = document.createElement('p');
  guideText.textContent = t.guide;
  const source = document.createElement('p');
  source.className = 'guide-source';
  source.textContent = 'Source: ';
  const link = document.createElement('a');
  link.href = t.source_url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = t.source;
  source.append(link);
  body.append(guideText, source);
  body.hidden = !openGuides.has(t.id);
  toggle.addEventListener('click', () => {
    if (openGuides.has(t.id)) openGuides.delete(t.id); else openGuides.add(t.id);
    body.hidden = !openGuides.has(t.id);
    toggle.setAttribute('aria-expanded', String(openGuides.has(t.id)));
    toggle.textContent = openGuides.has(t.id) ? 'Hide guide' : 'Show guide';
  });
  card.append(toggle, body);
  return card;
}

function render() {
  renderChips();
  spoilerNote.hidden = !spoilerInput.checked;
  renderProgress();
  const visible = trophies.filter(matches);
  grid.replaceChildren(...visible.map(trophyCard));
  const got = trophies.filter((t) => earned.has(t.name)).length;
  const pct = trophies.length ? Math.round((got / trophies.length) * 100) : 0;
  resultEl.textContent = `Showing ${visible.length} of ${trophies.length} trophies · ${got}/${trophies.length} earned (${pct}%)`;
  if (visible.length === 0) {
    emptyEl.hidden = false;
    emptyEl.textContent = activeKind === 'online'
      ? 'There are no online trophies: all 55 are earned offline on PS5, which is why this guide needs no online play.'
      : 'No trophies match these filters. Try clearing the search or choosing another filter.';
  } else {
    emptyEl.hidden = true;
  }
  const firstOpen = grid.querySelector('.trophy-card .guide-body:not([hidden])');
  if (firstOpen && params.get('open')) firstOpen.closest('.trophy-card').scrollIntoView({ block: 'center' });
}

document.getElementById('export').addEventListener('click', () => {
  const payload = {
    app: 'leonida-trophy-atlas',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const known = new Set(trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => typeof n === 'string' && known.has(n)));
    saveEarned();
  } catch {
    resultEl.textContent = 'That file could not be imported: it is not a Leonida Trophy Atlas progress file.';
    return;
  }
  event.target.value = '';
  render();
});

searchInput.addEventListener('input', render);
gradeSelect.addEventListener('change', render);
hideEarnedInput.addEventListener('change', render);
spoilerInput.addEventListener('change', () => { saveSpoiler(); render(); });

loadTrophies().then((data) => {
  trophies = data.trophies;
  render();
  if (params.get('view') === 'roadmap') {
    document.getElementById('roadmap').scrollIntoView();
  }
});
