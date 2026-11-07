const $ = id => document.getElementById(id);
const TAU = Math.PI * 2;
const SPIN_SECONDS = 60;   // how long the wheel spins (60 = 1 minute)
const COLORS = ['#e63946', '#ff9f1c', '#7b2cbf', '#f72585', '#ffbe0b', '#9d4edd', '#fb5607', '#c9184a'];

// ================= EDIT THIS LIST: your friends =================
// photo   = small picture shown on the wheel
// audio   = sound that plays when THAT friend wins (mp3 / wav / ogg)
// sticker = big picture shown when that friend wins
// Put the picture files in the same folder (or in folders like images/ and stickers/).
const PRESET_FRIENDS = [
 { name: 'Anupriyan', photo: 'images/aijthu.jpg', sticker: 'stickers/aijthu.jpg', audio: 'audio/aijthu.mp3' },
  { name: 'Kokulathas', photo: 'images/thaas.jpg', sticker: 'stickers/thaas.jpg', audio: 'audio/thaas.mp3' },
  { name: 'Banujan', photo: 'images/me.jpg', sticker: 'stickers/me.jpg', audio: 'audio/me.mp3' },
  { name: 'Kabilan', photo: 'images/goobal.jpg', sticker: 'stickers/goobal.jpg', audio: 'audio/goobal.mp3' },
  { name: 'Kajana', photo: 'images/kajana.jpg', sticker: 'stickers/kajana.jpg', audio: 'audio/kajana.mp3' },
  { name: 'Keerththanan', photo: 'images/keerthu.jpg', sticker: 'stickers/keerthu.jpg', audio: 'audio/keerthu.mp3' },
  { name: 'Thuvarshan', photo: 'images/thuva.jpg', sticker: 'stickers/thuva.jpg', audio: 'audio/thuva.mp3' },
  { name: 'Jananthini ', photo: 'images/jana.jpg', sticker: 'stickers/jana.jpg', audio: 'audio/jana.mp3' },
];
// ================================================================
const INTRO_SOUND = 'audio/main.mp3';  // plays once when the website opens
const SPIN_SOUND = 'audio/spin.mp3';   // plays while the wheel spins (add this file to use it; otherwise a tick sound plays)

// Browser remembers only: who already won, removed friends, and friends added with the form
let st = { extra: [], done: [], removed: [], next: 0 };
try { Object.assign(st, JSON.parse(localStorage.getItem('diwaliState')) || {}); } catch (e) {}
let nextId = Math.max(st.next, PRESET_FRIENDS.length + 1);
let friends = [];

function build() {
  friends = PRESET_FRIENDS
    .map((p, i) => ({ id: i + 1, name: p.name, photo: p.photo || '', sticker: p.sticker || '', audio: p.audio || '', preset: true, done: false }))
    .filter(f => !st.removed.includes(f.id));
  friends.forEach(f => f.done = st.done.includes(f.id));
}
build();

function save() {
  st.done = friends.filter(f => f.done).map(f => f.id);
  st.next = nextId;
  try { localStorage.setItem('diwaliState', JSON.stringify(st)); }
  catch (e) { alert('Storage is full. Try a smaller photo or remove a friend.'); }
}
const active = () => friends.filter(f => !f.done);

// ---------- Wheel ----------
const cv = $('wheel'), ctx = cv.getContext('2d'), R = cv.width / 2;
let rot = 0, spinning = false, photoData = '';
const imgs = {};

function loadImg(f) {
  if (!f.photo || imgs[f.id]) return;
  const im = new Image();
  im.onload = () => { imgs[f.id] = im; draw(); };
  im.src = f.photo;
}

function draw() {
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.save();
  ctx.translate(R, R);
  const list = active(), n = list.length;

  if (!n) {
    ctx.fillStyle = '#5b1590';
    ctx.beginPath(); ctx.arc(0, 0, R - 10, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffc94a'; ctx.textAlign = 'center'; ctx.font = '700 44px Poppins, sans-serif';
    ctx.fillText(friends.length ? 'All gifts given! 🎁' : 'Add friends 🪔', 0, 15);
  } else {
    const seg = TAU / n;
    list.forEach((f, i) => {
      const a0 = rot + i * seg;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R - 12, a0, a0 + seg); ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      if (n > 1 && i === n - 1 && i % COLORS.length === 0) ctx.fillStyle = '#3a86ff';
      ctx.fill();
      ctx.strokeStyle = '#ffe9a0'; ctx.lineWidth = 3; ctx.stroke();

      ctx.save();
      ctx.rotate(a0 + seg / 2);
      // photo (inner) and name (outer)
      const pr = Math.max(14, Math.min(44, R * 0.62 * seg / 2.4));
      const px = R * 0.42;
      ctx.beginPath(); ctx.arc(px, 0, pr, 0, TAU);
      ctx.fillStyle = '#fff'; ctx.fill();
      ctx.save(); ctx.clip();
      if (imgs[f.id]) { const m = imgs[f.id], q = Math.min(m.width, m.height);   // crop to a square, keep faces undistorted
        ctx.drawImage(m, (m.width - q) / 2, (m.height - q) * 0.2, q, q, px - pr, -pr, pr * 2, pr * 2); }
      else { ctx.fillStyle = '#2b0a4d'; ctx.fillRect(px - pr, -pr, pr * 2, pr * 2);
        ctx.fillStyle = '#ffc94a'; ctx.textAlign = 'center'; ctx.font = `700 ${pr}px Poppins, sans-serif`;
        ctx.fillText(f.name[0].toUpperCase(), px, pr * 0.35); }
      ctx.restore();
      ctx.lineWidth = 3; ctx.strokeStyle = '#ffd24a'; ctx.beginPath(); ctx.arc(px, 0, pr, 0, TAU); ctx.stroke();

      const fs = Math.max(14, Math.min(30, R * 0.75 * seg / 1.6));
      ctx.font = `700 ${fs}px Poppins, sans-serif`;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 5;
      let t = `${f.id}. ${f.name}`;
      while (ctx.measureText(t).width > R * 0.4 && t.length > 4) t = t.slice(0, -2);
      if (t !== `${f.id}. ${f.name}`) t += '…';
      ctx.fillText(t, R - 30, 0);
      ctx.restore();
    });
  }
  // golden border
  const g = ctx.createLinearGradient(-R, -R, R, R);
  g.addColorStop(0, '#fff2b8'); g.addColorStop(.5, '#d99a00'); g.addColorStop(1, '#ffe27a');
  ctx.shadowBlur = 0; ctx.strokeStyle = g; ctx.lineWidth = 24;
  ctx.beginPath(); ctx.arc(0, 0, R - 12, 0, TAU); ctx.stroke();
  ctx.restore();
}

// Which friend is under the pointer (top = -90 degrees)?
function indexAtPointer(n) {
  const seg = TAU / n;
  const a = ((-Math.PI / 2 - rot) % TAU + TAU) % TAU;
  return Math.min(n - 1, Math.floor(a / seg));
}

function spin() 
let anim = null, rafId = 0, stopping = false;

function setSpinBtn(text, enabled) {
  const b = $('spinBtn');
  b.textContent = text; b.disabled = !enabled; b.classList.toggle('stop', text === 'STOP');
}

// random winner + the distance (0..2π) the wheel must still turn to land inside that slice
function planLanding(n, from) {
  const seg = TAU / n, w = Math.floor(Math.random() * n);
  const want = -Math.PI / 2 - (w + 0.15 + Math.random() * 0.7) * seg;
  return (((want - from) % TAU) + TAU) % TAU;
}

function runAnim(list, start, total, dur) {
  anim = { list, start, total, dur, t0: performance.now(), last: -1, v: 0 };
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(frame);
}

function frame(now) {
  const a = anim; if (!a) return;
  const p = Math.min(1, (now - a.t0) / a.dur);
  rot = a.start + a.total * (1 - Math.pow(1 - p, 3));          // fast start, slow ending
  a.v = 3 * a.total / a.dur * Math.pow(1 - p, 2);              // current speed (radians per ms)
  const idx = indexAtPointer(a.list.length);
  if (idx !== a.last) { if (!spinAudioOK) tick(); a.last = idx; }
  draw();
  if (p < 1) rafId = requestAnimationFrame(frame);
  else { anim = null; finish(a.list); }
}

function spin() {
  const list = active();
  if (spinning || !list.length) return;
  initAudio(); stopIntro(); startSpinAudio();
  spinning = true; stopping = false;
  $('status').textContent = 'Good luck! 🍀';
  window.scrollTo(0, 0); document.body.classList.add('spinning');
  setSpinBtn('STOP', true);
  const total = planLanding(list.length, rot) + TAU * (SPIN_SECONDS * 0.7 + Math.floor(Math.random() * 3));
  runAnim(list, rot, total, SPIN_SECONDS * 1000);
}

// STOP button: keep the current speed, then slow down smoothly and stop on a (new) random friend
function stopSpin() {
  if (!spinning || stopping || !anim) return;
  stopping = true; setSpinBtn('...', false);
  const v = Math.max(anim.v, 0.0005);                          // radians per ms
  let D = planLanding(anim.list.length, rot);
  while (3 * D / v < 4000) D += TAU;                           // slow down for at least ~4 seconds
  const T = Math.min(3 * D / v, 12000);
  runAnim(anim.list, rot, D, T);
}

function finish(list) {
  const winner = list[indexAtPointer(list.length)];       // read from the pointer position
  stopSpinAudio();
  winner.done = true; save();
 spinning = false; stopping = false; setSpinBtn('SPIN', false);
  const srcs = [winner.sticker, winner.photo, avatarURL(winner.name)].filter(Boolean);
  const wp = $('winPhoto'); let k = 0;
  wp.onerror = () => { if (++k < srcs.length) wp.src = srcs[k]; };   // missing file -> next best picture
  wp.src = srcs[0];
  $('winName').textContent = winner.name;
  $('winNum').textContent = 'Friend #' + winner.id;
  $('modal').hidden = false;
  playWinner(winner); startConfetti();
}

$('closeBtn').onclick = () => {
  $('modal').hidden = true; stopConfetti(); if (winAudio) winAudio.pause(); document.body.classList.remove('spinning');
  render();
};

// ---------- Friends ----------
function avatarURL(name) {
  const c = document.createElement('canvas'); c.width = c.height = 200;
  const x = c.getContext('2d');
  x.fillStyle = '#2b0a4d'; x.fillRect(0, 0, 200, 200);
  x.fillStyle = '#ffc94a'; x.font = '700 110px Poppins, Arial'; x.textAlign = 'center';
  x.fillText(name[0].toUpperCase(), 100, 135);
  return c.toDataURL();
}

function removeFriend(id) {
  if (spinning) return;
  const f = friends.find(x => x.id === id);
  if (f && f.preset) st.removed.push(id);
  friends = friends.filter(x => x.id !== id); delete imgs[id]; save(); render();
}
$('resetBtn').onclick = () => {
  if (spinning) return;
  st.done = []; st.removed = []; build(); save(); render();   // everyone back on the wheel
};

function render() {
  const list = $('list'); list.innerHTML = '';
  friends.forEach(f => {
    loadImg(f);
    const li = document.createElement('li'); if (f.done) li.className = 'done';
    const pic = f.photo
      ? `<img class="avatar" src="${f.photo}" alt="">`
      : `<div class="ph">${f.name[0].toUpperCase()}</div>`;
    li.innerHTML = `${pic}<div class="info"></div><button class="rm" title="Remove">✕</button>`;
    li.querySelector('.info').innerHTML = '';
    const nm = document.createElement('span'); nm.textContent = `#${f.id} ${f.name}`;
    const sm = document.createElement('small'); sm.textContent = f.done ? '🎁 Gift received' : (f.sticker ? '🏷️ Sticker ready' : 'No sticker (photo will show)');
    li.querySelector('.info').append(nm, sm);
    li.querySelector('.rm').onclick = () => removeFriend(f.id);
    list.appendChild(li);
  });
  if (!friends.length) list.innerHTML = '<li class="empty">No friends yet. Add your first one!</li>';
  const left = active().length;
  $('count').textContent = friends.length ? `(${left} left)` : '';
$('spinBtn').textContent = 'SPIN'; $('spinBtn').disabled = spinning || left === 0;  $('status').textContent = !friends.length ? 'Add some friends to begin.'
    : left === 0 ? '🎊 Everyone has received their gift! Happy Diwali! 🎊'
    : left === 1 && friends.length > 1 ? 'One last friend left!' : 'Press SPIN!';
  draw();
}

// ---------- Your audio files ----------
const spinAudio = new Audio(SPIN_SOUND);
spinAudio.loop = true; spinAudio.preload = 'auto';
let spinAudioOK = true, winAudio = null;
spinAudio.onerror = () => { spinAudioOK = false; };
function startSpinAudio() {
  if (!spinAudioOK) return;
  spinAudio.currentTime = 0;
  spinAudio.play().catch(() => { spinAudioOK = false; });   // file missing -> use built-in tick sound
}
function stopSpinAudio() { spinAudio.pause(); }
function playWinner(f) {
  if (winAudio) winAudio.pause();
  if (!f.audio) return winSound();
  winAudio = new Audio(f.audio);
  winAudio.play().catch(() => winSound());                  // file missing -> built-in fanfare
}

// ---------- Sound (made in the browser, no files needed) ----------
let ac;
function initAudio() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); ac.resume(); } catch (e) {} }
function beep(freq, t, len, type, vol) {
  if (!ac) return;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, ac.currentTime + t);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + len);
  o.connect(g); g.connect(ac.destination);
  o.start(ac.currentTime + t); o.stop(ac.currentTime + t + len);
}
const tick = () => beep(900, 0, 0.05, 'square', 0.06);
function winSound() {
  [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => beep(f, i * 0.14, 0.35, 'triangle', 0.25));
}

// ---------- Confetti ----------
const cc = $('confetti'), cx = cc.getContext('2d');
let bits = [], confettiOn = false;
function startConfetti() {
  cc.width = innerWidth; cc.height = innerHeight;
  const cols = ['#ffc94a', '#ff8a1f', '#e63946', '#f72585', '#9d4edd', '#fff'];
  bits = Array.from({ length: 180 }, () => ({
    x: Math.random() * cc.width, y: -Math.random() * cc.height * 0.6,
    s: 6 + Math.random() * 8, vy: 2 + Math.random() * 4, vx: -2 + Math.random() * 4,
    r: Math.random() * TAU, vr: -0.2 + Math.random() * 0.4, c: cols[Math.floor(Math.random() * cols.length)]
  }));
  confettiOn = true; requestAnimationFrame(confettiLoop);
}
function stopConfetti() { confettiOn = false; cx.clearRect(0, 0, cc.width, cc.height); }
function confettiLoop() {
  if (!confettiOn) return;
  cx.clearRect(0, 0, cc.width, cc.height);
  bits.forEach(b => {
    b.x += b.vx; b.y += b.vy; b.r += b.vr;
    if (b.y > cc.height) { b.y = -10; b.x = Math.random() * cc.width; }
    cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r);
    cx.fillStyle = b.c; cx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); cx.restore();
  });
  requestAnimationFrame(confettiLoop);
}

// ---------- Decorations ----------
(function decorate() {
  const wrap = $('wheelWrap'), cols = ['#ffd24a', '#ff4d6d', '#ff8a1f', '#c77dff', '#4dffb8'];
  for (let i = 0; i < 28; i++) {                           // Diwali bulbs around the wheel
    const b = document.createElement('i'); b.className = 'bulb';
    b.style.setProperty('--a', (i * 360 / 28) + 'deg');
    b.style.color = cols[i % cols.length];
    b.style.animationDelay = (i % 2 ? 0 : 0.5) + 's';
    wrap.appendChild(b);
  }
  for (let i = 0; i < 45; i++) {                           // twinkling sparkles
    const s = document.createElement('div'); s.className = 'spark';
    s.style.left = Math.random() * 100 + '%'; s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = Math.random() * 3 + 's';
    $('sparkles').appendChild(s);
  }
})();

// ---------- Opening music (plays when the page opens) ----------
// Browsers often block sound until the first click/tap, so if it is blocked
// the music starts on the visitor's first touch anywhere on the page.
const intro = new Audio(INTRO_SOUND);
intro.preload = 'auto';
let introStarted = false, musicOn = true;
const unlockEvents = ['pointerdown', 'keydown', 'touchstart'];
function onFirstTouch(e) { if (e.target.closest && e.target.closest('#spinBtn')) return; tryIntro(); }
function tryIntro() {
  if (introStarted || !musicOn || spinning) return;
  intro.play().then(() => {
    introStarted = true;
    unlockEvents.forEach(ev => removeEventListener(ev, onFirstTouch));
  }).catch(() => {});
}
function stopIntro() {
  intro.pause(); introStarted = true;
  unlockEvents.forEach(ev => removeEventListener(ev, onFirstTouch));
}
unlockEvents.forEach(ev => addEventListener(ev, onFirstTouch));
$('musicBtn').onclick = () => {
  if (intro.paused) { musicOn = true; introStarted = true; intro.play().catch(() => {}); $('musicBtn').textContent = '🎵'; }
  else { musicOn = false; intro.pause(); $('musicBtn').textContent = '🔇'; }
};
tryIntro();

$('spinBtn').onclick = () => (spinning ? stopSpin() : spin());
addEventListener('resize', () => { if (confettiOn) { cc.width = innerWidth; cc.height = innerHeight; } });
render();
