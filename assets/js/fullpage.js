/* Full-page section scrolling: one wheel / key / swipe gesture moves the view
   to the next section, the next gesture to the one after it.

   Opt-in — only pages that put class="fullpage" on <html> are affected, and
   without JavaScript the site keeps its normal scrolling. Content taller than
   the viewport is read with ordinary scrolling first; the gesture that reaches
   its edge is the one that advances, so nothing becomes unreachable. */
(function () {
    'use strict';

    if (!document.documentElement.classList.contains('fullpage')) return;

    var QUIET = 200;  /* ms of silence that starts a new gesture (wheel momentum) */
    var LOCK = 700;   /* ms a section jump swallows input for */
    var EDGE = 4;     /* px tolerance for "resting at a section edge" */
    var SWIPE = 60;   /* px of touch travel that counts as a swipe */

    var pages = [];
    var docHeight = -1;
    var lastEdge = 0;
    var lockUntil = 0;
    var resizeTimer = 0;
    var touchY = null;
    var touchPage = -1;

    var scrollY = function () { return window.scrollY || window.pageYOffset || 0; };

    /* Sections and the footer, in document order — each one is a "page". */
    function refresh() {
        var y = scrollY();
        pages = [];
        var kids = document.body.children;
        for (var i = 0; i < kids.length; i++) {
            var el = kids[i];
            if (el.tagName !== 'SECTION' && el.tagName !== 'FOOTER') continue;
            var r = el.getBoundingClientRect();
            pages.push({ el: el, top: r.top + y, bottom: r.bottom + y });
        }
        docHeight = document.documentElement.scrollHeight;
    }

    /* data.js re-renders lists after load, which changes section heights. */
    function refreshIfNeeded() {
        if (document.documentElement.scrollHeight !== docHeight) refresh();
    }

    function current(y) {
        for (var i = pages.length - 1; i >= 0; i--) {
            if (y >= pages[i].top - EDGE) return i;
        }
        return 0;
    }

    function blocked() {
        return pages.length < 2 || document.body.classList.contains('menu-open');
    }

    function goTo(i) {
        if (i < 0 || i >= pages.length) return false;
        refreshIfNeeded();
        if (i < 0 || i >= pages.length) return false;
        lockUntil = Date.now() + LOCK;
        window.scrollTo({ top: pages[i].top, behavior: 'smooth' });
        return true;
    }

    /* dir: 1 = next section, -1 = previous. Returns true when the caller must
       prevent the browser's own scrolling (the gesture was taken over). */
    function handle(dir, absorb) {
        if (blocked()) return false;
        refreshIfNeeded();
        var now = Date.now();
        var y = scrollY();
        var i = current(y);
        var p = pages[i];
        var vh = window.innerHeight;
        var edge = dir > 0
            ? (y + vh >= p.bottom - EDGE && i < pages.length - 1)
            : (y <= p.top + EDGE && i > 0);

        if (!edge) return now < lockUntil;      /* tall content: read it first */

        var since = now - lastEdge;
        lastEdge = now;
        if (now < lockUntil) return true;       /* a jump is already running */
        if (absorb && since < QUIET) return true; /* one jump per wheel flick */
        goTo(i + dir);
        return true;
    }

    document.addEventListener('wheel', function (e) {
        if (e.ctrlKey || e.deltaY === 0) return;
        if (handle(e.deltaY > 0 ? 1 : -1, true)) e.preventDefault();
    }, { passive: false });

    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        var t = e.target;
        if (t && t.closest && t.closest('input, textarea, select, button, a, [contenteditable="true"]')) return;

        if (e.key === 'Home' || e.key === 'End') {
            if (blocked()) return;
            e.preventDefault();
            goTo(e.key === 'Home' ? 0 : pages.length - 1);
            return;
        }
        var dir = 0;
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') dir = 1;
        else if (e.key === 'ArrowUp' || e.key === 'PageUp') dir = -1;
        else return;
        if (handle(dir, false)) e.preventDefault();
    });

    document.addEventListener('touchstart', function (e) {
        if (blocked() || e.touches.length !== 1) {
            touchY = null;
            touchPage = -1;
            return;
        }
        refreshIfNeeded();
        touchY = e.touches[0].clientY;
        touchPage = current(scrollY());
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        if (touchY == null) return;
        var dy = touchY - e.changedTouches[0].clientY;
        var i0 = touchPage;
        touchY = null;
        touchPage = -1;
        if (i0 < 0 || i0 >= pages.length || Math.abs(dy) < 12) return;

        refreshIfNeeded();
        var p = pages[i0];
        var vh = window.innerHeight;
        var y = scrollY();
        var dir = dy > 0 ? 1 : -1;
        var fits = p.bottom - p.top <= vh + EDGE;   /* short section: always a page turn */
        var edge = dir > 0
            ? (fits || y + vh >= p.bottom - EDGE)
            : (fits || y <= p.top + EDGE);
        if (!edge) return;                          /* reading inside a tall section */

        var now = Date.now();
        var since = now - lastEdge;
        lastEdge = now;
        if (now < lockUntil || since < QUIET) return;
        if (Math.abs(dy) < SWIPE) { goTo(i0); return; }  /* small brush: re-align */
        goTo(i0 + dir);
    }, { passive: true });

    document.addEventListener('touchcancel', function () {
        touchY = null;
        touchPage = -1;
    }, { passive: true });

    /* In-page links (#players, #classes…) animate on their own — hold off the
       section controller while they run. */
    document.addEventListener('click', function (e) {
        var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
        if (!a) return;
        lockUntil = Date.now() + LOCK;
    });
    window.addEventListener('hashchange', function () {
        lockUntil = Date.now() + LOCK;
    });

    refresh();
    window.addEventListener('load', refresh);
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(refresh, 150);
    });
    window.addEventListener('orientationchange', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(refresh, 150);
    });
})();
