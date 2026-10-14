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
        return fetch('data/' + name + '.json?v=' + Date.now(), { cache: 'no-store' }).then(function (res) {
            if (!res.ok) throw new Error(name + ' ' + res.status);
            return res.json();
        });
    }

    function mediaUrl(url) {
        if (!url) return '';
        if (/^(https?:|\/\/|data:)/i.test(url)) return url;
        if (url.startsWith('/')) url = url.slice(1);
        return url;
    }

    /* Hide images that failed to load so the CSS placeholder shows through. */
    function guardImages(root) {
        (root || document).querySelectorAll('img').forEach(function (img) {
            if (img.dataset.guarded) return;
            img.dataset.guarded = '1';
            var hide = function () { img.classList.add('is-broken'); };
            img.addEventListener('error', hide);
        });
    }

    function photoBox(src, alt) {
        if (!src) return '<div class="player-photo h-64 relative overflow-hidden"></div>';
        var fullSrc = mediaUrl(src);
        if (!fullSrc.startsWith('http') && !fullSrc.startsWith('assets/') && !fullSrc.startsWith('uploads/')) {
            fullSrc = 'assets/images/' + fullSrc;
        }
        return '<div class="player-photo h-64 relative overflow-hidden">' +
            '<img loading="lazy" decoding="async" src="' + esc(fullSrc) + '" alt="' + esc(alt) + '" ' +
            'class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ' +
            '"></div>';
    }

    /* ---------------------------------------------------------- players ---- */
    function renderPlayers(players) {
        ['men', 'women'].forEach(function (team) {
            var box = document.getElementById('tab-' + team);
            if (!box) return;
            var accent = team === 'men' ? 'orange' : 'red';
            var list = players.filter(function (p) {
                return p.team === team || (team === 'men' && (p.team === 'male' || !p.team)) || (team === 'women' && p.team === 'female');
            });
            if (!list.length) {
                box.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">' +
                    'هنوز بازیکنی ثبت نشده است.</p>';
                return;
            }
            box.innerHTML = list.map(function (p) {
                var pId = p.id || ('player-' + (p.number || Math.random()));
                return '<a href="player.html?id=' + encodeURIComponent(pId) + '" class="block group">' +
                    '<div class="bg-brand-card rounded-xl overflow-hidden hover-lift ' +
                    'border border-transparent hover:border-brand-' + accent + ' relative">' +
                    '<div class="absolute top-2 left-2 bg-brand-black text-brand-yellow font-black ' +
                    'text-lg px-2 py-1 rounded opacity-80 z-10">' + (p.number ? '#' + esc(p.number) : '') + '</div>' +
                    photoBox(p.photo || p.image, p.name) +
                    '<div class="p-5 text-center">' +
                    '<h3 class="text-lg font-bold mb-1 leading-snug group-hover:text-brand-yellow transition-colors">' + esc(p.name) + '</h3>' +
                    '<p class="text-brand-' + accent + ' text-sm font-semibold">' + esc(p.position) + '</p>' +
                    '<span class="inline-block mt-3 text-xs text-brand-yellow font-bold group-hover:text-white transition-colors">مشاهده آمار و پروفایل ←</span>' +
                    '</div></div></a>';
            }).join('');
        });
        guardImages();
    }

    /* ---------------------------------------------------------- matches ---- */
    function renderMatches(matches) {
        var box1 = document.getElementById('match-list');
        var box2 = document.getElementById('matches-container');
        if (!box1 && !box2) return;
        if (!matches || !matches.length) {
            if (box1) box1.innerHTML = '<p class="text-gray-500 text-center py-8">بازی‌ای ثبت نشده است.</p>';
            if (box2) box2.innerHTML = '<p class="text-gray-500 text-center py-8">بازی‌ای ثبت نشده است.</p>';
            return;
        }
        var html = matches.map(function (m) {
            var accent = m.accent === 'orange' ? 'orange' : 'yellow';
            var badgeColor = accent === 'orange' ? 'text-brand-orange' : 'text-brand-yellow';
            var btn = accent === 'orange'
                ? 'border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white'
                : 'border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-black';
            var ticket = m.ticket
                ? '<a href="' + esc(m.ticket) + '" target="_blank" rel="noopener" class="w-full lg:w-auto bg-transparent border ' +
                  btn + ' px-4 py-2 rounded transition-colors font-bold text-sm inline-block text-center">تهیه بلیت <i class="fa-solid fa-ticket ml-1"></i></a>'
                : '<span class="inline-block px-4 py-1.5 rounded-full bg-brand-' + accent + '/10 text-brand-' + accent + ' text-xs font-bold">' + esc(m.status || 'برنامه مسابقه') + '</span>';
            return '<div class="bg-brand-card p-4 md:p-6 rounded-xl border-s-4 border-brand-' + accent + ' ' +
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
        if (box1) box1.innerHTML = html;
        if (box2) box2.innerHTML = html;
    }

    /* ---------------------------------------------------------- moments ---- */
    function ensureMomentModal() {
        if (document.getElementById('moment-popup-modal')) return;
        var modal = document.createElement('div');
        modal.id = 'moment-popup-modal';
        modal.className = 'fixed inset-0 z-50 hidden flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/75 backdrop-blur-sm transition-opacity duration-300';
        modal.onclick = function (e) {
            if (e.target === modal) closeMomentModal();
        };
        modal.innerHTML = '' +
            '<div class="relative bg-brand-card/95 border border-gray-700/80 rounded-2xl shadow-2xl max-w-4xl lg:max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden" onclick="event.stopPropagation()">' +
                '<div class="flex items-center justify-between p-3 sm:p-4 border-b border-gray-800 shrink-0 bg-brand-dark/60 gap-3">' +
                    '<h4 id="moment-popup-title" class="font-bold text-white text-sm sm:text-base md:text-lg leading-snug line-clamp-2 sm:line-clamp-none flex-1"></h4>' +
                    '<button type="button" onclick="closeMomentModal()" class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-brand-red text-gray-300 hover:text-white flex items-center justify-center transition shrink-0" title="بستن (Esc)">' +
                        '<i class="fa-solid fa-xmark text-base sm:text-lg"></i>' +
                    '</button>' +
                '</div>' +
                '<div class="p-3 bg-black/60 flex items-center justify-center overflow-hidden flex-1 min-h-[260px] max-h-[74vh]">' +
                    '<img id="moment-popup-img" src="" alt="" class="max-w-full max-h-[72vh] w-auto h-auto object-contain rounded-lg shadow-md">' +
                '</div>' +
                '<div id="moment-popup-desc-box" class="p-4 border-t border-gray-800 text-sm text-gray-300 leading-relaxed shrink-0 bg-brand-dark/30"></div>' +
            '</div>';
        document.body.appendChild(modal);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMomentModal();
        });
    }

    window.openMomentModal = function (src, title, desc) {
        ensureMomentModal();
        var modal = document.getElementById('moment-popup-modal');
        var img = document.getElementById('moment-popup-img');
        var titleEl = document.getElementById('moment-popup-title');
        var descBox = document.getElementById('moment-popup-desc-box');

        img.src = src;
        img.alt = title || '';
        titleEl.textContent = title || 'لحظات ماندگار';
        if (desc) {
            descBox.textContent = desc;
            descBox.classList.remove('hidden');
        } else {
            descBox.textContent = '';
            descBox.classList.add('hidden');
        }
        modal.classList.remove('hidden');
    };

    window.closeMomentModal = function () {
        var modal = document.getElementById('moment-popup-modal');
        if (modal) modal.classList.add('hidden');
    };

    function renderMoments(moments) {
        var box = document.getElementById('moments-grid');
        if (!box) return;
        if (!moments || !moments.length) return;

        // Featured items come first at the top
        var sortedMoments = moments.slice().sort(function (a, b) {
            var aF = a.featured ? 1 : 0;
            var bF = b.featured ? 1 : 0;
            return bF - aF;
        });

        box.innerHTML = sortedMoments.map(function (m, idx) {
            var isFeatured = Boolean(m.featured);
            var colSpan = isFeatured ? 'col-span-2 md:col-span-3 lg:col-span-4' : '';
            var heightCls = isFeatured ? 'h-64 sm:h-80 md:h-96' : 'h-52 sm:h-56 md:h-60';
            var borderCls = isFeatured ? 'border-brand-yellow/60 hover:border-brand-yellow' : 'border-gray-800 hover:border-brand-orange';
            var titleCls = isFeatured ? 'text-base sm:text-xl md:text-2xl font-bold leading-snug line-clamp-2 sm:line-clamp-3' : 'text-xs sm:text-sm md:text-base font-bold leading-snug line-clamp-2';
            var padCls = isFeatured ? 'p-4 sm:p-6' : 'p-3 sm:p-4';
            var descHtml = m.desc
                ? '<p class="' + (isFeatured ? 'text-xs sm:text-sm text-gray-300 mt-1.5 line-clamp-2' : 'hidden sm:block text-xs text-gray-400 mt-1 line-clamp-1') + '">' + esc(m.desc) + '</p>'
                : '';
            var badgeHtml = isFeatured
                ? '<span class="px-2 py-0.5 rounded bg-brand-yellow/20 border border-brand-yellow/40 text-brand-yellow text-[10px] sm:text-xs font-bold shrink-0 mb-1 inline-block">رویداد ویژه ★</span>'
                : '';
            var imgSrc = mediaUrl(m.image);
            return '<div class="' + colSpan + ' bg-brand-black rounded-xl overflow-hidden border ' + borderCls + ' transition-all duration-300 relative group cursor-pointer hover:shadow-xl hover:-translate-y-1" data-moment-idx="' + idx + '">' +
                '<img loading="lazy" decoding="async" src="' + esc(imgSrc) + '" alt="' + esc(m.title) + '" class="w-full ' + heightCls + ' object-cover transition-transform duration-700 group-hover:scale-105">' +
                '<div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end ' + padCls + ' group-hover:via-black/70 transition-colors">' +
                badgeHtml +
                '<div class="flex items-end justify-between gap-2">' +
                    '<h4 class="' + titleCls + ' text-white">' + esc(m.title) + '</h4>' +
                    '<span class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-yellow/90 text-brand-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shrink-0 shadow"><i class="fa-solid fa-magnifying-glass-plus text-xs sm:text-sm"></i></span>' +
                '</div>' +
                descHtml +
                '</div></div>';
        }).join('');

        box.querySelectorAll('[data-moment-idx]').forEach(function (el) {
            el.onclick = function () {
                var idx = +el.dataset.momentIdx;
                var m = sortedMoments[idx];
                if (!m) return;
                window.openMomentModal(mediaUrl(m.image), m.title, m.desc);
            };
        });

        guardImages(box);
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
                ? '<img loading="lazy" decoding="async" src="' + esc(mediaUrl(v.thumb)) + '" alt="' + esc(v.title) + '" ' +
                  'class="w-full h-56 md:h-64 object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100">'
                : '';
            var inner = thumb +
                '<div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-6">' +
                '<div class="w-12 h-12 bg-brand-yellow text-black rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shrink-0">' +
                '<i class="fa-solid fa-play ml-1 text-xl"></i></div>' +
                '<h3 class="text-xl font-bold">' + esc(v.title) + '</h3>' +
                '<p class="text-sm text-gray-300 mt-1">' + esc(v.desc) + '</p></div>';
            var vUrl = mediaUrl(v.url);
            if (vUrl) {
                return '<a href="' + esc(vUrl) + '" target="_blank" rel="noopener" ' +
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
                  esc(mediaUrl(n.image)) + '" alt="' + esc(n.title) + '" class="w-full h-full object-cover"></div>'
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
        section('moments', renderMoments);
        section('discounts', renderDiscounts);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
