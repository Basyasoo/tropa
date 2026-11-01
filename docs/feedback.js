const API = 'https://tropa-64-188-67-141.sslip.io/api/fb';
const STATUS = { open: 'Открыт', info: 'Нужны уточнения', planned: 'Запланирован', progress: 'В работе', done: 'Готово', declined: 'Отклонён', duplicate: 'Дубликат' };
const PLATFORM = { android: 'Android', ios: 'iOS', windows: 'Windows', other: 'Другое' };
const UP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
const $ = id => document.getElementById(id);
const state = { type: '', page: 1 };

const voter = (() => {
  try {
    let v = localStorage.getItem('tropa_voter');
    if (!v) { v = crypto.randomUUID(); localStorage.setItem('tropa_voter', v); }
    return v;
  } catch { return crypto.randomUUID(); }
})();

async function api(path, options) {
  const r = await fetch(API + path, { ...options, headers: { 'Content-Type': 'application/json', 'X-Voter': voter } });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'Сервер недоступен, попробуйте позже');
  return data;
}

const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};
const date = t => new Date(t * 1000).toLocaleDateString('ru');
const toast = text => {
  const t = el('div', 'toast', text);
  document.body.append(t);
  setTimeout(() => t.remove(), 2600);
};

function meta(p) {
  const m = el('div', 'meta');
  m.append(el('span', `pill ${p.type}`, p.type === 'bug' ? 'Баг' : 'Идея'), el('span', 'pill', STATUS[p.status]));
  if (PLATFORM[p.platform]) m.append(el('span', 'pill', PLATFORM[p.platform]));
  m.append(el('span', '', `Ответов: ${p.comments}`), el('span', '', date(p.created)));
  return m;
}

function voteButton(p) {
  const b = el('button', 'vote');
  b.type = 'button';
  b.innerHTML = UP;
  const n = el('span', '', p.votes);
  b.append(n);
  b.setAttribute('aria-pressed', p.voted);
  b.setAttribute('aria-label', `Голосов: ${p.votes}`);
  b.onclick = async e => {
    e.stopPropagation();
    try {
      const r = await api(`/posts/${p.id}/vote`, { method: 'POST', body: '{}' });
      p.votes = r.votes;
      p.voted = r.voted;
      n.textContent = r.votes;
      b.setAttribute('aria-pressed', r.voted);
    } catch (err) { toast(err.message); }
  };
  return b;
}

function card(p, withVote = true) {
  const c = el('article', 'post');
  c.tabIndex = 0;
  if (withVote) c.append(voteButton(p));
  const box = el('div');
  box.append(el('h3', '', p.title), meta(p));
  c.append(box);
  c.onclick = () => open(p.id);
  c.onkeydown = e => { if (e.key === 'Enter') open(p.id); };
  return c;
}

async function load() {
  const list = $('posts');
  const q = new URLSearchParams({ type: state.type, q: $('q').value.trim(), status: $('status').value, platform: $('platform').value, sort: $('sort').value, closed: $('closed').checked ? 1 : 0, page: state.page });
  try {
    const r = await api(`/posts?${q}`);
    list.replaceChildren(...r.posts.map(p => card(p)));
    if (!r.posts.length) list.append(el('div', 'empty', 'Здесь пока пусто. Напишите первым.'));
    const pager = $('pager');
    pager.replaceChildren();
    if (r.pages > 1) {
      const nav = (label, page, off) => {
        const b = el('button', 'btn ghost sm', label);
        b.type = 'button';
        b.disabled = off;
        b.onclick = () => { state.page = page; load(); };
        return b;
      };
      pager.append(nav('Назад', state.page - 1, state.page <= 1), el('span', '', `Страница ${state.page} из ${r.pages}`), nav('Вперёд', state.page + 1, state.page >= r.pages));
    }
  } catch (e) {
    list.replaceChildren(el('div', 'empty', e.message));
  }
}

async function road() {
  const box = $('roadView');
  try {
    const { posts } = await api('/roadmap');
    const columns = [['planned', 'Запланировано'], ['progress', 'В работе'], ['done', 'Готово']].map(([key, name]) => {
      const col = el('div');
      col.append(el('h2', '', name));
      const items = posts.filter(p => p.status === key);
      const list = el('div', 'list');
      list.append(...items.map(p => card(p, false)));
      if (!items.length) list.append(el('div', 'empty', 'Пока пусто'));
      col.append(list);
      return col;
    });
    box.replaceChildren(...columns);
  } catch (e) {
    box.replaceChildren(el('div', 'empty', e.message));
  }
}

async function open(id) {
  const body = $('postBody');
  try {
    const p = await api(`/posts/${id}`);
    const close = el('button', 'btn ghost sm', 'Закрыть');
    close.type = 'button';
    close.onclick = () => $('postDlg').close();
    const form = el('form');
    const label = el('label', '', 'Ваш ответ');
    const text = el('textarea');
    text.required = true;
    text.maxLength = 2000;
    label.append(text);
    const send = el('button', 'btn sm', 'Ответить');
    const acts = el('div', 'acts');
    acts.append(close, send);
    form.append(label, acts);
    form.onsubmit = async e => {
      e.preventDefault();
      send.disabled = true;
      try {
        await api(`/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ body: text.value }) });
        open(id);
        load();
      } catch (err) { toast(err.message); send.disabled = false; }
    };
    const replies = el('div');
    replies.style.marginTop = '14px';
    replies.append(...p.replies.map(r => {
      const row = el('div', 'reply');
      row.append(el('b', '', r.nick || 'Пользователь'), el('p', '', r.body));
      return row;
    }));
    body.replaceChildren(el('h2', '', p.title), meta(p), el('p', 'body', p.body), replies, form);
    if (!$('postDlg').open) $('postDlg').showModal();
  } catch (e) { toast(e.message); }
}

function fill(select, map, first) {
  if (first) select.append(new Option(first, ''));
  Object.entries(map).forEach(([v, t]) => select.append(new Option(t, v)));
}
fill($('status'), STATUS, 'Все');
fill($('platform'), PLATFORM, 'Все');
fill($('newPlatform'), PLATFORM);

document.querySelectorAll('[data-type]').forEach(b => b.onclick = () => {
  document.querySelectorAll('[data-type]').forEach(o => o.setAttribute('aria-pressed', o === b));
  state.type = b.dataset.type;
  state.page = 1;
  load();
});
document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => {
  document.querySelectorAll('[data-view]').forEach(o => o.setAttribute('aria-pressed', o === b));
  const isRoad = b.dataset.view === 'road';
  $('listView').hidden = isRoad;
  $('roadView').hidden = !isRoad;
  if (isRoad) road();
});
let timer;
$('q').oninput = () => { clearTimeout(timer); timer = setTimeout(() => { state.page = 1; load(); }, 300); };
['status', 'platform', 'sort', 'closed'].forEach(id => { $(id).onchange = () => { state.page = 1; load(); }; });
$('add').onclick = () => $('newDlg').showModal();
document.querySelector('[data-close]').onclick = () => $('newDlg').close();
$('newForm').onsubmit = async e => {
  e.preventDefault();
  const err = $('newErr');
  err.hidden = true;
  try {
    const r = await api('/posts', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(e.target))) });
    e.target.reset();
    $('newDlg').close();
    await load();
    open(r.id);
  } catch (x) {
    err.textContent = x.message;
    err.hidden = false;
  }
};
load();
