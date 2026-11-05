/* ==================== ENHANCEMENTS LAYER ==================== */
(function () {
    'use strict';
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var root = document.documentElement;

        /* ---------- Scroll progress + back-to-top ---------- */
        var bar = document.querySelector('.scroll-progress');
        var topBtn = document.querySelector('.back-to-top');
        var ticking = false;
        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                var h = document.documentElement.scrollHeight - window.innerHeight;
                var p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
                if (bar) bar.style.transform = 'scaleX(' + p + ')';
                if (topBtn) topBtn.classList.toggle('show', window.scrollY > 600);
                ticking = false;
            });
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        if (topBtn) topBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });

        /* ---------- Cursor glow (mouse devices only) ---------- */
        var glow = document.querySelector('.cursor-glow');
        var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (glow && fine && !reduceMotion) {
            var tx = 0, ty = 0, cx = 0, cy = 0, running = false;
            document.addEventListener('mousemove', function (e) {
                tx = e.clientX; ty = e.clientY;
                glow.classList.add('visible');
                if (!running) { running = true; requestAnimationFrame(loop); }
            });
            document.addEventListener('mouseleave', function () { glow.classList.remove('visible'); });
            var loop = function () {
                cx += (tx - cx) * 0.15;
                cy += (ty - cy) * 0.15;
                glow.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
                if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) requestAnimationFrame(loop);
                else running = false;
            };
        }

        /* ---------- Scroll reveal ---------- */
        if ('IntersectionObserver' in window && !reduceMotion) {
            var targets = document.querySelectorAll(
                '.section-title, .about-card, .skill-category, .project-card, .timeline-item, ' +
                '.cert-card, .resume-content, .contact-form, .stat-card, .marquee'
            );
            root.classList.add('js-reveal');
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (!en.isIntersecting) return;
                    en.target.classList.add('in-view');
                    setTimeout(function () { en.target.classList.add('revealed-done'); }, 900);
                    io.unobserve(en.target);
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
            targets.forEach(function (el) {
                // small stagger for siblings in the same grid
                var sibs = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) {
                    return c.classList && c.classList.contains(el.classList[0]);
                }) : [];
                var idx = Math.max(0, sibs.indexOf(el));
                el.style.setProperty('--reveal-delay', Math.min(idx, 4) * 90 + 'ms');
                el.classList.add('reveal');
                io.observe(el);
            });
        }

        /* ---------- Count-up stats ---------- */
        var counters = document.querySelectorAll('[data-count]');
        function runCount(el) {
            var end = parseFloat(el.getAttribute('data-count'));
            var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
            var suffix = el.getAttribute('data-suffix') || '';
            if (reduceMotion) { el.textContent = end.toFixed(dec) + suffix; return; }
            var start = performance.now(), dur = 1400;
            (function step(now) {
                var t = Math.min(1, (now - start) / dur);
                var eased = 1 - Math.pow(1 - t, 3);
                el.textContent = (end * eased).toFixed(dec) + suffix;
                if (t < 1) requestAnimationFrame(step);
            })(start);
        }
        if ('IntersectionObserver' in window) {
            var cio = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
                });
            }, { threshold: 0.6 });
            counters.forEach(function (c) { cio.observe(c); });
        } else {
            counters.forEach(runCount);
        }

        /* ---------- Project filters ---------- */
        var filterBtns = document.querySelectorAll('.filter-btn');
        var cards = document.querySelectorAll('.project-card[data-category]');
        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var f = btn.getAttribute('data-filter');
                filterBtns.forEach(function (b) {
                    var on = b === btn;
                    b.classList.toggle('active', on);
                    b.setAttribute('aria-pressed', on ? 'true' : 'false');
                });
                cards.forEach(function (card) {
                    var cats = (card.getAttribute('data-category') || '').split(' ');
                    var show = f === 'all' || cats.indexOf(f) !== -1;
                    card.classList.toggle('is-hidden', !show);
                    if (show) card.classList.add('in-view', 'revealed-done');
                });
            });
        });

        /* ---------- Marquee: duplicate content for seamless loop ---------- */
        var track = document.querySelector('.marquee-track');
        if (track) track.innerHTML += track.innerHTML;
    });
})();

/* ---------- Welcome screen: cycle "Hello" in many languages ---------- */
(function () {
    'use strict';
    var greetings = [
        ['Hello', 'English', 'en'],
        ['నమస్కారం', 'Telugu', 'te'],
        ['नमस्ते', 'Hindi', 'hi'],
        ['Hola', 'Spanish', 'es'],
        ['Bonjour', 'French', 'fr'],
        ['こんにちは', 'Japanese', 'ja'],
        ['வணக்கம்', 'Tamil', 'ta'],
        ['안녕하세요', 'Korean', 'ko'],
        ['Ciao', 'Italian', 'it'],
        ['مرحبا', 'Arabic', 'ar'],
        ['Hallo', 'German', 'de'],
        ['你好', 'Chinese', 'zh'],
        ['Привет', 'Russian', 'ru'],
        ['Olá', 'Portuguese', 'pt'],
        ['Jambo', 'Swahili', 'sw'],
        ['Hello', 'English', 'en']
    ];
    function start() {
        var word = document.getElementById('hello-word');
        var lang = document.getElementById('hello-lang');
        var pre = document.getElementById('preloader');
        if (!word || !lang || !pre) return;
        var i = 0;
        var timer = setInterval(function () {
            if (pre.style.display === 'none' || pre.classList.contains('fade-out')) { clearInterval(timer); return; }
            i = Math.min(i + 1, greetings.length - 1);
            word.classList.add('out'); lang.classList.add('out');
            setTimeout(function () {
                var g = greetings[i];
                word.textContent = g[0]; lang.textContent = g[1]; word.setAttribute('lang', g[2]);
                word.classList.remove('out'); word.classList.add('pre');
                void word.offsetWidth; // restart transition from the "below" position
                word.classList.remove('pre'); lang.classList.remove('out');
            }, 80);
            if (i === greetings.length - 1) clearInterval(timer);
        }, 200);
    }
    if (document.readyState !== 'loading') start();
    else document.addEventListener('DOMContentLoaded', start);
})();
