/* ============================================================
   Markow Moussa — Portfolio
   Core interactions + visual fx
   ============================================================ */

import * as THREE from 'three';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(hover: none)').matches;

/* ============================================================
   Navigation toggle
   ============================================================ */

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav__link');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        document.body.classList.toggle('nav-open');
        sfx('tap');
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
    });
});

/* ============================================================
   Footer year
   ============================================================ */

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================================
   Custom cursor + magnetic buttons
   ============================================================ */

if (!isTouch && !prefersReducedMotion) {
    document.body.classList.add('has-custom-cursor');

    const cursor = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let lastTrail = 0;
    const TRAIL_INTERVAL_MS = 40; // spawn a trail particle every N ms

    document.addEventListener('mousemove', (e) => {
        tx = e.clientX;
        ty = e.clientY;
        if (dot) dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;

        // Trail particles
        const now = performance.now();
        if (now - lastTrail > TRAIL_INTERVAL_MS) {
            lastTrail = now;
            const p = document.createElement('div');
            p.className = 'cursor-trail';
            p.style.left = `${tx}px`;
            p.style.top  = `${ty}px`;
            const dx = (Math.random() - 0.5) * 24;
            const dy = (Math.random() - 0.5) * 24 + 10;
            p.style.setProperty('--tx', `${dx}px`);
            p.style.setProperty('--ty', `${dy}px`);
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 700);
        }
    });

    (function animate() {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        if (cursor) cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        requestAnimationFrame(animate);
    })();

    const HOVERABLE = 'a, button, [data-magnetic], [data-tilt], input, .chip, .project__item';
    document.querySelectorAll(HOVERABLE).forEach(el => {
        el.addEventListener('mouseenter', () => cursor?.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => cursor?.classList.remove('is-hover'));
    });

    document.addEventListener('mousedown', () => cursor?.classList.add('is-click'));
    document.addEventListener('mouseup',   () => cursor?.classList.remove('is-click'));

    // Magnetic buttons
    document.querySelectorAll('[data-magnetic]').forEach(el => {
        const STRENGTH = 0.35;
        const MAX_PULL = 14;

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top  + rect.height / 2);
            const dx = Math.max(-MAX_PULL, Math.min(MAX_PULL, x * STRENGTH));
            const dy = Math.max(-MAX_PULL, Math.min(MAX_PULL, y * STRENGTH));
            el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
}

/* ============================================================
   3D tilt on [data-tilt] elements (mouse-tracked)
   ============================================================ */

if (!prefersReducedMotion && !isTouch) {
    const MAX_TILT = 8;
    document.querySelectorAll('[data-tilt]').forEach(el => {
        let rect = null;
        el.addEventListener('mouseenter', () => { rect = el.getBoundingClientRect(); });
        el.addEventListener('mousemove', (e) => {
            if (!rect) rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top)  / rect.height;
            const tiltY =  (x - 0.5) * 2 * MAX_TILT;
            const tiltX = -(y - 0.5) * 2 * MAX_TILT;
            el.style.setProperty('--tilt-x', `${tiltX}deg`);
            el.style.setProperty('--tilt-y', `${tiltY}deg`);
            el.style.setProperty('--mx', `${x * 100}%`);
            el.style.setProperty('--my', `${y * 100}%`);
        });
        el.addEventListener('mouseleave', () => {
            el.style.setProperty('--tilt-x', `0deg`);
            el.style.setProperty('--tilt-y', `0deg`);
            rect = null;
        });
    });
}

/* ============================================================
   Terminal typing intro
   ============================================================ */

(function typingIntro() {
    const el = document.getElementById('termCmd');
    if (!el) return;
    if (prefersReducedMotion) {
        el.textContent = 'whoami → Software Engineer';
        return;
    }

    const commands = [
        { cmd: 'whoami', out: 'Software Engineer' },
        { cmd: 'cat skills.txt', out: 'Python, C++, Java, JS, SQL' },
        { cmd: 'echo $ROLE', out: 'Full-Stack Developer' },
        { cmd: 'ls projects/', out: '7 repositories online' },
        { cmd: 'status', out: 'Available for hire' }
    ];

    let i = 0;
    async function run() {
        const { cmd, out } = commands[i];
        await typeOut(el, cmd, 60);
        await wait(400);
        el.textContent = `${cmd} → ${out}`;
        await wait(2200);
        await backspace(el, 30);
        i = (i + 1) % commands.length;
        run();
    }
    run();

    function typeOut(node, text, ms) {
        node.textContent = '';
        return new Promise(res => {
            let k = 0;
            (function step() {
                node.textContent = text.slice(0, ++k);
                if (k < text.length) setTimeout(step, ms);
                else res();
            })();
        });
    }
    function backspace(node, ms) {
        return new Promise(res => {
            (function step() {
                const t = node.textContent;
                if (!t.length) return res();
                node.textContent = t.slice(0, -1);
                setTimeout(step, ms);
            })();
        });
    }
    function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
})();

/* ============================================================
   Name scramble effect on hover
   ============================================================ */

document.querySelectorAll('[data-scramble]').forEach(el => {
    const final = el.textContent;
    const chars = '!<>-_\\/[]{}—=+*^?#abcMARKOW';
    let raf;
    function scramble() {
        const total = 24;
        let frame = 0;
        cancelAnimationFrame(raf);
        (function step() {
            const out = final.split('').map((c, i) => {
                if (c === ' ') return ' ';
                const progress = (frame - i * 0.5) / (total - i * 0.5);
                if (progress < 0) return chars[Math.floor(Math.random() * chars.length)];
                if (progress >= 1) return c;
                return Math.random() < 0.3 ? c : chars[Math.floor(Math.random() * chars.length)];
            }).join('');
            el.textContent = out;
            if (++frame <= total + final.length) raf = requestAnimationFrame(step);
            else el.textContent = final;
        })();
    }
    el.addEventListener('mouseenter', scramble);
});

/* ============================================================
   Scroll reveal (staggered) + fire stat count-up on view
   ============================================================ */

if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const siblings = el.parentElement?.querySelectorAll('[data-reveal]');
                const idx = siblings ? [...siblings].indexOf(el) : 0;
                el.style.setProperty('--reveal-delay', `${idx * 80}ms`);
                el.classList.add('is-visible');

                if (el.id === 'statsGrid') animateCounts();
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));
}

function animateCounts() {
    document.querySelectorAll('.stat-card__value').forEach(el => {
        const target = parseInt(el.dataset.count, 10) || 0;
        if (!target) return;
        const duration = 1400;
        const start = performance.now();
        (function tick(t) {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(eased * target).toLocaleString();
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    });
}

/* ============================================================
   Live GitHub stats
   ============================================================ */

(async function githubStats() {
    const user = 'markow2010';
    const CACHE_KEY = `gh:${user}:v2`;
    const TTL = 1000 * 60 * 60; // 1 hour

    let data = null;
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached && Date.now() - cached.ts < TTL) data = cached.data;
    } catch {}

    if (!data) {
        try {
            const [userRes, reposRes] = await Promise.all([
                fetch(`https://api.github.com/users/${user}`),
                fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`)
            ]);
            if (!userRes.ok || !reposRes.ok) throw new Error('gh api');
            const userInfo = await userRes.json();
            const repos = await reposRes.json();
            data = { userInfo, repos };
            localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
        } catch (e) {
            renderStatsError();
            return;
        }
    }

    render(data);

    function render({ userInfo, repos }) {
        const publicRepos = userInfo.public_repos ?? repos.length;
        const followers = userInfo.followers ?? 0;
        const totalForks = repos.reduce((a, r) => a + (r.forks_count || 0), 0);
        const totalStars = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);

        setCount('statRepos', publicRepos);
        setCount('statFollowers', followers);
        setCount('statForks', totalForks);
        setCount('statStars', totalStars);

        const langCount = {};
        repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
        renderRing(langCount);

        const nonForks = repos.filter(r => !r.fork);
        const recent = [...nonForks].sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at)).slice(0, 5);
        renderRecent(recent);
    }

    function setCount(id, n) {
        const el = document.getElementById(id);
        if (!el) return;
        el.dataset.count = n;
        el.textContent = '0';
    }

    function renderRing(langs) {
        const total = Object.values(langs).reduce((a, b) => a + b, 0);
        if (!total) return;
        const palette = {
            Python: '#3776ab', Java: '#b07219', 'C++': '#f34b7d',
            JavaScript: '#f1e05a', HTML: '#e34c26', CSS: '#563d7c',
            TypeScript: '#3178c6', MATLAB: '#e16737'
        };
        const fallback = ['#22d3ee', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

        const svg = document.getElementById('ringChart');
        const legend = document.getElementById('ringLegend');
        if (!svg || !legend) return;
        svg.querySelectorAll('.ring-slice').forEach(n => n.remove());
        legend.innerHTML = '';

        const RADIUS = 80;
        const CIRC = 2 * Math.PI * RADIUS;
        let offset = 0;
        const entries = Object.entries(langs).sort((a, b) => b[1] - a[1]);

        entries.forEach(([lang, count], i) => {
            const pct = count / total;
            const color = palette[lang] || fallback[i % fallback.length];
            const dash = pct * CIRC;
            const slice = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            slice.setAttribute('cx', 100);
            slice.setAttribute('cy', 100);
            slice.setAttribute('r', RADIUS);
            slice.setAttribute('class', 'ring-slice');
            slice.setAttribute('stroke', color);
            slice.setAttribute('stroke-dasharray', `${dash} ${CIRC - dash}`);
            slice.setAttribute('stroke-dashoffset', -offset);
            slice.style.filter = `drop-shadow(0 0 6px ${color}66)`;
            svg.appendChild(slice);
            offset += dash;

            const li = document.createElement('li');
            li.innerHTML = `<span class="swatch" style="background:${color}"></span><span>${lang}</span><span class="pct">${Math.round(pct * 100)}%</span>`;
            legend.appendChild(li);
        });
    }

    function renderRecent(repos) {
        const ul = document.getElementById('recentList');
        if (!ul) return;
        if (!repos.length) { ul.innerHTML = '<li class="line-out">No recent activity</li>'; return; }
        ul.innerHTML = repos.map(r => {
            const when = new Date(r.pushed_at || r.updated_at);
            const rel = relTime(when);
            return `<li>
                <i class="recent-list__icon fa-solid fa-code-commit"></i>
                <div>
                    <a class="recent-list__name" href="${r.html_url}" target="_blank" rel="noopener">${r.name}</a>
                    <span class="recent-list__meta">${r.language || '—'} · updated ${rel}</span>
                </div>
            </li>`;
        }).join('');
    }

    function renderStatsError() {
        const ul = document.getElementById('recentList');
        if (ul) ul.innerHTML = '<li class="line-err" style="padding:1em">Could not load GitHub activity right now.</li>';
    }

    function relTime(date) {
        const s = (Date.now() - date.getTime()) / 1000;
        if (s < 60) return 'just now';
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
        if (s < 31536000) return `${Math.floor(s / 2592000)}mo ago`;
        return `${Math.floor(s / 31536000)}y ago`;
    }
})();

/* ============================================================
   Theme toggle with circular reveal
   ============================================================ */

(function themeToggle() {
    const btn = document.getElementById('themeToggle');
    const overlay = document.querySelector('.theme-reveal');
    if (!btn) return;

    const saved = localStorage.getItem('theme');
    if (saved) applyTheme(saved, { animate: false });

    btn.addEventListener('click', (e) => {
        const current = document.documentElement.dataset.theme || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        const rx = `${e.clientX}px`, ry = `${e.clientY}px`;

        sfx('tap');

        if (overlay && !prefersReducedMotion) {
            overlay.style.setProperty('--rx', rx);
            overlay.style.setProperty('--ry', ry);
            overlay.classList.add('is-active');
            setTimeout(() => {
                applyTheme(next);
                overlay.classList.remove('is-active');
            }, 350);
        } else {
            applyTheme(next);
        }
    });

    function applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('theme', theme);
        const icon = btn.querySelector('i');
        if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
})();

/* ============================================================
   Sound design — subtle UI SFX with Web Audio (toggle-gated)
   ============================================================ */

let audioCtx = null;
let soundOn = localStorage.getItem('sound') === 'on';

(function soundInit() {
    const btn = document.getElementById('soundToggle');
    if (!btn) return;
    updateBtn();
    btn.addEventListener('click', () => {
        soundOn = !soundOn;
        localStorage.setItem('sound', soundOn ? 'on' : 'off');
        updateBtn();
        if (soundOn) { ensureCtx(); sfx('tap'); }
    });

    function updateBtn() {
        btn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
        const icon = btn.querySelector('i');
        if (icon) icon.className = soundOn ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    }
})();

function ensureCtx() {
    if (audioCtx) return audioCtx;
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    return audioCtx;
}

function sfx(kind) {
    if (!soundOn || prefersReducedMotion) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain).connect(ctx.destination);

    const presets = {
        tap:  { freq: 880, type: 'sine',    dur: 0.08, vol: 0.06 },
        open: { freq: 440, type: 'triangle', dur: 0.2,  vol: 0.08 },
        err:  { freq: 180, type: 'square',   dur: 0.12, vol: 0.06 }
    };
    const p = presets[kind] || presets.tap;
    osc.type = p.type;
    osc.frequency.setValueAtTime(p.freq, now);
    osc.frequency.exponentialRampToValueAtTime(p.freq * 0.5, now + p.dur);
    gain.gain.setValueAtTime(p.vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);
    osc.start(now);
    osc.stop(now + p.dur);
}

// SFX on button / link clicks
document.addEventListener('click', (e) => {
    if (e.target.closest('.btn, .ctrl-btn, .social-list__link')) sfx('tap');
});

/* ============================================================
   Easter eggs — konami code + logo dev console
   ============================================================ */

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx = 0;
document.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    konamiIdx = (key === KONAMI[konamiIdx]) ? konamiIdx + 1 : 0;
    if (konamiIdx === KONAMI.length) { konamiIdx = 0; openConsole('  ⬆️ KONAMI UNLOCKED ⬆️  '); }
});

// Logo click opens console (and still nav-home via default link)
document.querySelectorAll('[data-easter="logo"]').forEach(el => {
    let clicks = 0, timer;
    el.addEventListener('click', (e) => {
        clicks++;
        clearTimeout(timer);
        if (clicks >= 3) {
            e.preventDefault();
            clicks = 0;
            openConsole();
        } else {
            timer = setTimeout(() => { clicks = 0; }, 500);
        }
    });
});

/* ============================================================
   Dev console — interactive terminal
   ============================================================ */

const devConsole = document.getElementById('devConsole');
const devBody    = document.getElementById('devConsoleBody');
const devInput   = document.getElementById('devConsoleInput');
const devClose   = document.getElementById('devConsoleClose');

function openConsole(banner) {
    if (!devConsole) return;
    devConsole.classList.add('is-open');
    devConsole.setAttribute('aria-hidden', 'false');
    sfx('open');
    if (banner) print(banner, 'line-accent');
    if (!devBody.dataset.greeted) {
        print(`welcome to markow@portfolio — type 'help' for commands`, 'line-out');
        devBody.dataset.greeted = '1';
    }
    setTimeout(() => devInput?.focus(), 200);
}
function closeConsole() {
    devConsole?.classList.remove('is-open');
    devConsole?.setAttribute('aria-hidden', 'true');
}

devClose?.addEventListener('click', closeConsole);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeConsole();
    if (e.key === '`' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); openConsole(); }
});

const history = [];
let historyIdx = -1;

devInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const cmd = devInput.value.trim();
        devInput.value = '';
        if (cmd) { history.unshift(cmd); historyIdx = -1; runCmd(cmd); }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIdx + 1 < history.length) { historyIdx++; devInput.value = history[historyIdx]; }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx > 0) { historyIdx--; devInput.value = history[historyIdx]; }
        else { historyIdx = -1; devInput.value = ''; }
    }
});

function print(text, cls = 'line-out') {
    if (!devBody) return;
    const div = document.createElement('div');
    div.className = `line ${cls}`;
    div.innerHTML = text;
    devBody.appendChild(div);
    devBody.scrollTop = devBody.scrollHeight;
}

const COMMANDS = {
    help: () => print([
        'available commands:',
        '  <span class="line-accent">whoami</span>        — who am I?',
        '  <span class="line-accent">skills</span>        — languages &amp; tools',
        '  <span class="line-accent">projects</span>      — list featured projects',
        '  <span class="line-accent">contact</span>       — how to reach me',
        '  <span class="line-accent">socials</span>       — links',
        '  <span class="line-accent">theme</span>         — toggle light/dark',
        '  <span class="line-accent">sudo hire</span>     — ;)',
        '  <span class="line-accent">matrix</span>        — for old time\'s sake',
        '  <span class="line-accent">clear</span>         — clear screen',
        '  <span class="line-accent">exit</span>          — close console'
    ].join('<br>')),
    whoami: () => print('markow_moussa — software engineer, nashville, tn'),
    skills: () => print('python · c++ · java · javascript · sql · html/css · flask · bokeh · mysql · mongodb'),
    projects: () => print([
        '1. <a href="case-study-artist-network.html">Artist Social Network Visualization</a> — python, flask, bokeh',
        '2. <a href="https://github.com/markow2010/Artist-Social-Network-App" target="_blank">Artist Social Network App</a> — 3-tier flask',
        '3. <a href="https://github.com/markow2010/-University-Management-System" target="_blank">University Management System</a> — java',
        '4. <a href="https://github.com/markow2010/Library-Database-Management-System" target="_blank">Library Database Management System</a> — sql',
        '5. <a href="https://github.com/markow2010/Chat-Application" target="_blank">Socket Chat Application</a> — python sockets'
    ].join('<br>')),
    contact:  () => print('email: <a href="mailto:markow2010@yahoo.com">markow2010@yahoo.com</a>'),
    socials:  () => print('<a href="https://github.com/markow2010" target="_blank">github</a> · <a href="https://www.linkedin.com/in/markow-moussa-585b61250/" target="_blank">linkedin</a> · <a href="https://instagram.com/markow2010" target="_blank">instagram</a>'),
    theme:    () => { document.getElementById('themeToggle')?.click(); print('theme toggled', 'line-ok'); },
    clear:    () => { devBody.innerHTML = ''; },
    exit:     () => closeConsole(),
    'sudo hire': () => print([
        '<span class="line-ok">✓ authorization granted</span>',
        '  contract terms: let\'s talk — <a href="mailto:markow2010@yahoo.com">markow2010@yahoo.com</a>'
    ].join('<br>'), 'line-ok'),
    matrix: () => {
        print('<span class="line-accent">follow the white rabbit...</span>');
        matrixRain();
    }
};

function runCmd(raw) {
    print(`<span class="line-cmd">$ ${escapeHtml(raw)}</span>`);
    const cmd = raw.toLowerCase();
    if (COMMANDS[cmd]) return COMMANDS[cmd]();
    print(`command not found: ${escapeHtml(raw)} — try 'help'`, 'line-err');
    sfx('err');
}

function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ============================================================
   Matrix rain mini easter egg (15s)
   ============================================================ */

function matrixRain() {
    if (prefersReducedMotion) return;
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;z-index:9996;pointer-events:none';
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = c.width  = window.innerWidth * dpr;
    const H = c.height = window.innerHeight * dpr;
    c.style.width = window.innerWidth + 'px';
    c.style.height = window.innerHeight + 'px';

    const fontSize = 16 * dpr;
    const cols = Math.floor(W / fontSize);
    const drops = Array(cols).fill(1);
    const chars = 'アァカサタナハマヤャラワ0123456789ABCDEF';

    let running = true;
    const start = Date.now();
    (function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#22d3ee';
        ctx.font = `${fontSize}px JetBrains Mono, monospace`;
        for (let i = 0; i < drops.length; i++) {
            const ch = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > H && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        if (running && Date.now() - start < 15000) requestAnimationFrame(draw);
        else c.remove();
    })();
    setTimeout(() => { running = false; }, 15000);
}

/* ============================================================
   WebGL 3D backdrop — floating wireframe icosahedra + particles
   ============================================================ */

(function webglBackdrop() {
    if (prefersReducedMotion) return;
    const canvas = document.querySelector('.bg-webgl');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 6;

    // Wireframe icosahedra
    const group = new THREE.Group();
    const COLORS = [0x22d3ee, 0xa855f7, 0x10b981];
    const COUNT = 14;
    const shapes = [];
    for (let i = 0; i < COUNT; i++) {
        const size = 0.3 + Math.random() * 0.6;
        const geo = Math.random() > 0.5
            ? new THREE.IcosahedronGeometry(size, 0)
            : new THREE.OctahedronGeometry(size, 0);
        const mat = new THREE.MeshBasicMaterial({
            color: COLORS[i % COLORS.length],
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 10 - 2
        );
        mesh.userData = {
            rx: (Math.random() - 0.5) * 0.01,
            ry: (Math.random() - 0.5) * 0.01,
            floatOff: Math.random() * Math.PI * 2,
            floatAmp: 0.2 + Math.random() * 0.4
        };
        group.add(mesh);
        shapes.push(mesh);
    }
    scene.add(group);

    // Particle starfield
    const PARTS = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(PARTS * 3);
    for (let i = 0; i < PARTS; i++) {
        pPos[i*3]     = (Math.random() - 0.5) * 40;
        pPos[i*3 + 1] = (Math.random() - 0.5) * 25;
        pPos[i*3 + 2] = (Math.random() - 0.5) * 30;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0x8fc4ff,
        size: 0.04,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Mouse-reactive camera
    let mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => {
        mx = (e.clientX / window.innerWidth)  * 2 - 1;
        my = (e.clientY / window.innerHeight) * 2 - 1;
    });

    let scrollY = 0;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

    let running = true;
    document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) animate(); });

    const clock = new THREE.Clock();
    function animate() {
        if (!running) return;
        const t = clock.getElapsedTime();

        shapes.forEach((m, i) => {
            m.rotation.x += m.userData.rx;
            m.rotation.y += m.userData.ry;
            m.position.y += Math.sin(t + m.userData.floatOff) * 0.002 * m.userData.floatAmp;
        });

        particles.rotation.y = t * 0.02;
        group.rotation.y = t * 0.05;

        camera.position.x += (mx * 1.2 - camera.position.x) * 0.04;
        camera.position.y += (-my * 0.8 - camera.position.y) * 0.04;
        camera.position.z = 6 + scrollY * 0.001;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();
