/* Public site: renders content from data/*.json produced by the admin panel.
   If the JSON files are unreachable (e.g. the page is opened as a file://),
   the hard-coded markup in index.html is kept as a fallback. */
(function () {
    'use strict';

    var esc = function (value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    };

    var $ = function (sel) { return document.querySelector(sel); };

    function load(name) {
        return fetch('data/' + name + '.json', { cache: 'no-store' }).then(function (res) {
            if (!res.ok) throw new Error(name + ' ' + res.status);
            return res.json();
        });
    }

    /* Hide images that failed to load so the CSS placeholder shows through. */
    function guardImages(root) {
        (root || document).querySelectorAll('img').forEach(function (img) {
            if (img.dataset.guarded) return;
            img.dataset.guarded = '1';
            var hide = function () { img.classList.add('is-broken'); };
            img.addEventListener('error', hide);
            if (img.complete && img.naturalWidth === 0) hide();
        });
    }

    function photoBox(src, alt) {
        if (!src) return '<div class="player-photo h-64 relative overflow-hidden"></div>';
        return '<div class="player-photo h-64 relative overflow-hidden">' +
            '<img loading="lazy" decoding="async" src="' + esc(src) + '" alt="' + esc(alt) + '" ' +
            'class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ' +
            '"></div>';
    }

    /* ---------------------------------------------------------- players ---- */
    function renderPlayers(players) {
        ['men', 'women'].forEach(function (team) {
            var box = document.getElementById('tab-' + team);
            if (!box) return;
            var accent = team === 'men' ? 'orange' : 'red';
            var list = players.filter(function (p) { return p.team === team; });
            if (!list.length) {
                box.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">' +
                    'هنوز بازیکنی ثبت نشده است.</p>';
                return;
            }
            box.innerHTML = list.map(function (p) {
                return '<div class="bg-brand-card rounded-xl overflow-hidden hover-lift group ' +
                    'border border-transparent hover:border-brand-' + accent + ' relative">' +
                    '<div class="absolute top-2 left-2 bg-brand-black text-brand-yellow font-black ' +
                    'text-lg px-2 py-1 rounded opacity-80 z-10">' + (p.number ? '#' + esc(p.number) : '') + '</div>' +
                    photoBox(p.photo, p.name) +
                    '<div class="p-5 text-center">' +
                    '<h3 class="text-lg font-bold mb-1 leading-snug">' + esc(p.name) + '</h3>' +
                    '<p class="text-brand-' + accent + ' text-sm font-semibold">' + esc(p.position) + '</p>' +
                    '</div></div>';
            }).join('');
        });
        guardImages();
    }

    /* ---------------------------------------------------------- matches ---- */
    function renderMatches(matches) {
        var box = document.getElementById('match-list');
        if (!box) return;
        if (!matches.length) {
            box.innerHTML = '<p class="text-gray-500 text-center py-8">بازی‌ای ثبت نشده است.</p>';
            return;
        }
        box.innerHTML = matches.map(function (m) {
            var accent = m.accent === 'orange' ? 'orange' : 'yellow';
            var badgeColor = accent === 'orange' ? 'text-brand-orange' : 'text-brand-yellow';
            var btn = accent === 'orange'
                ? 'border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white'
                : 'border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-black';
            var ticket = m.ticket
                ? '<a href="' + esc(m.ticket) + '" target="_blank" rel="noopener" class="w-full lg:w-auto bg-transparent border ' +
                  btn + ' px-4 py-2 rounded transition-colors font-bold text-sm inline-block text-center">تهیه بلیت <i class="fa-solid fa-ticket ml-1"></i></a>'
                : '<button disabled class="w-full lg:w-auto bg-transparent border border-gray-700 text-gray-500 ' +
                  'px-4 py-2 rounded font-bold text-sm cursor-not-allowed">بلیت‌فروشی باز است</button>';
            return '<div class="bg-brand-black p-4 md:p-6 rounded-xl border-s-4 border-brand-' + accent + ' ' +
                'flex flex-col lg:flex-row items-center justify-between hover-lift text-center lg:text-start gap-4">' +
                '<div class="flex flex-col items-center lg:items-start lg:w-1/4">' +
                '<span class="' + badgeColor + ' font-bold text-lg">' + esc(m.date) + '</span>' +
                '<span class="text-gray-400 text-sm"><i class="fa-regular fa-clock ml-1"></i> ساعت ' + esc(m.time) + '</span>' +
                '</div>' +
                '<div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 lg:w-2/4">' +
                '<div class="w-full sm:w-auto text-center sm:text-end"><h4 class="font-bold text-lg md:text-xl">' + esc(m.host) + '</h4></div>' +
                '<div class="bg-brand-dark px-3 py-1 rounded text-brand-red font-black border border-gray-700 text-sm">VS</div>' +
                '<div class="w-full sm:w-auto text-center sm:text-start"><h4 class="font-bold text-lg md:text-xl text-gray-300">' + esc(m.guest) + '</h4></div>' +
                '</div>' +
                '<div class="lg:w-1/4 w-full flex justify-center lg:justify-end">' + ticket + '</div>' +
                '</div>';
        }).join('');
    }

    /* ----------------------------------------------------------- videos ---- */
    function renderVideos(videos) {
        var box = document.getElementById('video-grid');
        if (!box) return;
        if (!videos.length) {
            box.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-full">ویدیویی منتشر نشده است.</p>';
            return;
        }
        box.innerHTML = videos.map(function (v) {
            var thumb = v.thumb
                ? '<img loading="lazy" decoding="async" src="' + esc(v.thumb) + '" alt="' + esc(v.title) + '" ' +
                  'class="w-full h-56 md:h-64 object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100">'
                : '';
            var inner = thumb +
                '<div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-6">' +
                '<div class="w-12 h-12 bg-brand-yellow text-black rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shrink-0">' +
                '<i class="fa-solid fa-play ml-1 text-xl"></i></div>' +
                '<h3 class="text-xl font-bold">' + esc(v.title) + '</h3>' +
                '<p class="text-sm text-gray-300 mt-1">' + esc(v.desc) + '</p></div>';
            if (v.url) {
                return '<a href="' + esc(v.url) + '" target="_blank" rel="noopener" ' +
                    'class="group relative rounded-xl overflow-hidden cursor-pointer hover-lift video-card bg-[#151515] block">' + inner + '</a>';
            }
            return '<div class="group relative rounded-xl overflow-hidden cursor-pointer hover-lift video-card bg-[#151515]">' + inner + '</div>';
        }).join('');
        guardImages();
    }

    /* ------------------------------------------------------------ news ----- */
    function renderNews(news) {
        var box = document.getElementById('news-list');
        if (!box) return;
        if (!news.length) {
            /* Keep the hard-coded fallback cards that live inside the box. */
            if (box.querySelector('article')) return;
            box.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-full">هنوز خبری ثبت نشده است.</p>';
            return;
        }
        box.innerHTML = news.map(function (n) {
            var thumb = n.image
                ? '<div class="news-thumb h-44 relative overflow-hidden"><img loading="lazy" decoding="async" src="' +
                  esc(n.image) + '" alt="' + esc(n.title) + '" class="w-full h-full object-cover"></div>'
                : '';
            return '<article class="bg-brand-card rounded-xl overflow-hidden border border-transparent hover:border-brand-yellow hover-lift">' +
                thumb +
                '<div class="p-5">' +
                (n.date ? '<span class="text-brand-yellow text-xs font-bold">' + esc(n.date) + '</span>' : '') +
                (n.pinned ? ' <span class="text-brand-red text-xs font-bold">★ ویژه</span>' : '') +
                '<h3 class="text-lg font-bold mt-2 leading-snug">' + esc(n.title) + '</h3>' +
                (n.body ? '<p class="text-gray-400 text-sm mt-2 leading-relaxed">' + esc(n.body) + '</p>' : '') +
                '</div></article>';
        }).join('');
        guardImages();
    }

    /* -------------------------------------------------------- discounts ---- */
    function renderDiscounts(discounts) {
        var box = document.getElementById('discount-list');
        if (!box) return;
        var list = (discounts || []).filter(function (d) { return d.active !== false; });
        if (!list.length) {
            box.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-full">در حال حاضر تخفیف فعالی وجود ندارد.</p>';
            return;
        }
        box.innerHTML = list.map(function (d) {
            var price = '';
            if (d.priceNew) {
                price = '<div class="flex items-end gap-3 mt-3 flex-wrap">' +
                    (d.priceOld ? '<span class="text-gray-500 line-through text-sm">' + esc(d.priceOld) + '</span>' : '') +
                    '<span class="text-brand-yellow text-2xl font-black">' + esc(d.priceNew) + ' تومان</span></div>';
            }
            return '<div class="bg-brand-card rounded-xl p-6 border border-brand-orange/40 relative overflow-hidden hover-lift">' +
                (d.percent ? '<span class="inline-block bg-brand-red text-white text-xs font-black px-3 py-1 rounded mb-3">' +
                    esc(d.percent) + ' تخفیف</span>' : '') +
                '<h3 class="text-xl font-bold leading-snug">' + esc(d.course) + '</h3>' + price +
                (d.code ? '<p class="text-gray-400 text-sm mt-3">کد تخفیف: <code class="bg-brand-black px-2 py-1 rounded text-brand-yellow">' +
                    esc(d.code) + '</code></p>' : '') +
                (d.until ? '<p class="text-xs text-gray-500 mt-2">اعتبار تا ' + esc(d.until) + '</p>' : '') +
                (d.note ? '<p class="text-gray-400 text-sm mt-2">' + esc(d.note) + '</p>' : '') +
                '</div>';
        }).join('');
    }

    /* --------------------------------------------------------- settings ---- */
    function applySettings(s) {
        if (!s) return;
        if (s.siteName) document.title = s.siteName + ' | هیئت بسکتبال جیرفت';
        var setText = function (sel, value) {
            var el = $(sel);
            if (el && value != null && value !== '') el.textContent = value;
        };
        setText('#hero-badge-text', s.heroBadge);
        setText('#hero-title-1', s.heroTitle);
        setText('#hero-title-2', s.heroSubtitle);
        setText('#hero-text', s.heroText);
        setText('#stat-number', s.statNumber);
        setText('#stat-label', s.statLabel);
        setText('#contact-address', s.address);
        setText('#contact-phone', s.phone);
        setText('#contact-email', s.email);
        setText('#footer-text', s.footerText);
        setText('#copyright-year', s.copyright);

        /* Pages may repeat a value in several places (contact block + footer):
           [data-setting="phone"] etc. updates every copy, ids only the first. */
        [['address', s.address], ['phone', s.phone], ['email', s.email], ['copyright', s.copyright]]
            .forEach(function (pair) {
                if (pair[1] == null || pair[1] === '') return;
                document.querySelectorAll('[data-setting="' + pair[0] + '"]').forEach(function (el) {
                    el.textContent = pair[1];
                });
            });

        [['#link-instagram', s.instagram], ['#link-telegram', s.telegram], ['#link-twitter', s.twitter]]
            .forEach(function (pair) {
                var el = $(pair[0]);
                if (el && pair[1]) el.href = pair[1];
            });

        /* Every social button on the page (contact block, footers) follows
           the settings; the hard-coded hrefs are the fallback. */
        [['instagram', s.instagram], ['telegram', s.telegram], ['twitter', s.twitter]]
            .forEach(function (pair) {
                if (!pair[1]) return;
                document.querySelectorAll('[data-social="' + pair[0] + '"]').forEach(function (el) {
                    el.href = pair[1];
                });
            });

        var hero = $('#home');
        if (hero && s.heroImage) {
            hero.style.backgroundImage = 'linear-gradient(to bottom, rgba(10,10,10,0.6), rgba(10,10,10,0.98)), url("' +
                String(s.heroImage).replace(/"/g, '%22') + '")';
        }
        var phoneLink = $('#contact-phone-link');
        if (phoneLink && s.phone) phoneLink.href = 'tel:' + String(s.phone).replace(/[^\d+]/g, '');
    }

    /* ------------------------------------------------------------- run ----- */
    function section(name, fn) {
        return load(name).then(fn).catch(function (err) {
            console.warn('[data] ' + name + ' skipped:', err && err.message);
        });
    }

    function start() {
        section('settings', applySettings);
        section('players', renderPlayers);
        section('matches', renderMatches);
        section('videos', renderVideos);
        section('news', renderNews);
        section('discounts', renderDiscounts);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
