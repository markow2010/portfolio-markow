/* ============================================================
   Navigation toggle
   ============================================================ */

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav__link');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        document.body.classList.toggle('nav-open');
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
   Mouse-tracked 3D tilt on [data-tilt] elements
   Skips on touch devices and when reduced motion is preferred
   ============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(hover: none)').matches;

if (!prefersReducedMotion && !isTouch) {
    const MAX_TILT = 8; // degrees

    document.querySelectorAll('[data-tilt]').forEach(el => {
        let rect = null;

        const onEnter = () => { rect = el.getBoundingClientRect(); };

        const onMove = (e) => {
            if (!rect) rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;  // 0..1
            const y = (e.clientY - rect.top) / rect.height;  // 0..1
            const tiltY = (x - 0.5) * 2 * MAX_TILT;          // left/right → rotateY
            const tiltX = -(y - 0.5) * 2 * MAX_TILT;         // up/down  → rotateX
            el.style.setProperty('--tilt-x', `${tiltX}deg`);
            el.style.setProperty('--tilt-y', `${tiltY}deg`);
            el.style.setProperty('--mx', `${x * 100}%`);
            el.style.setProperty('--my', `${y * 100}%`);
        };

        const onLeave = () => {
            el.style.setProperty('--tilt-x', `0deg`);
            el.style.setProperty('--tilt-y', `0deg`);
            rect = null;
        };

        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
    });
}

/* ============================================================
   Scroll reveal — fade/lift sections as they enter viewport
   ============================================================ */

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.stack__card, .project, .about__grid, .contact__card').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}
