// admin.js - Admin panel logic
// Uses localStorage for data persistence (no backend needed)

let currentData = {};
let editIndex = null;

// Load data from localStorage or use defaults
function loadData() {
    const defaults = {
        players: [
            { name: "علی محمدی", number: "3", position: "سند", height: "195", team: "male", image: "p1.jpg" },
            { name: "رضا کریمی", number: "7", position: "پست کوچک", height: "198", team: "male", image: "p2.jpg" },
            { name: "امید رضایی", number: "11", position: "پرتابگر", height: "196", team: "male", image: "p3.jpg" },
            { name: "سعید رضازاده", number: "13", position: "سند", height: "202", team: "male", image: "p4.jpg" },
            { name: "آرش حسینی", number: "15", position: "پایین", height: "205", team: "male", image: "p5.jpg" },
            { name: "محمدحسین زارع", number: "22", position: "سند", height: "197", team: "male", image: "p6.jpg" },
            { name: "کامران علوی", number: "33", position: "پایین", height: "208", team: "male", image: "p7.jpg" },
            { name: "رضا یاحی", number: "44", position: "پست کوچک", height: "195", team: "male", image: "p8.jpg" },
            { name: "مجید احمدی", number: "55", position: "پرتابگر", height: "194", team: "male", image: "p9.jpg" },
            { name: "سارا رضایی", number: "1", position: "سند", height: "178", team: "female", image: "p10.jpg" },
            { name: "نیما کریمی", number: "3", position: "پایین", height: "175", team: "female", image: "p11.jpg" },
            { name: "زهرا محمدی", number: "5", position: "پایین", height: "180", team: "female", image: "p12.jpg" },
            { name: "لیلا رضایی", number: "8", position: "پست کوچک", height: "183", team: "female", image: "p13.jpg" }
        ],
        news: [
            { title: "فصل جدید آغاز شد", date: "2026-10-10", content: "همه چیز برای فصل جدید آماده است. به همه بازیکنان و علاقه‌مندان تبریک می‌گوییم.", image: "news1.jpg" }
        ],
        videos: [
            { title: "پیش‌نمایش فصل ۱۴۰۵", url: "https://www.youtube.com/watch?v=example1", thumbnail: "video1.jpg" },
            { title: "بهترین لحظات تمرین", url: "https://www.youtube.com/watch?v=example2", thumbnail: "video2.jpg" }
        ],
        moments: [
            { title: "تیم در مراسم رسمی", image: "moments1.jpg" },
            { title: "بازی مهم در لیگ", image: "moments2.jpg" },
            { title: "گردهمایی خانوادگی", image: "moments3.jpg" }
        ]
    };
    
    for (const key in defaults) {
        const stored = localStorage.getItem(`jiroft_admin_${key}`);
        currentData[key] = stored ? JSON.parse(stored) : defaults[key];
    }
    renderLists();
}

function saveData() {
    const formData = new FormData(document.getElementById('modal-form'));
    const data = Object.fromEntries(formData.entries());
    
    if (editIndex !== null) {
        currentData[currentSection][editIndex] = data;
    } else {
        currentData[currentSection].push(data);
    }
    
    localStorage.setItem(`jiroft_admin_${currentSection}`, JSON.stringify(currentData[currentSection]));
    closeModal();
    renderLists();
    alert('با موفقیت ذخیره شد');
}

function deleteItem(section, index) {
    if (confirm('آیا مطمئن هستید؟')) {
        currentData[section].splice(index, 1);
        localStorage.setItem(`jiroft_admin_${section}`, JSON.stringify(currentData[section]));
        renderLists();
    }
}

function editPlayer(index = null) {
    currentSection = 'players';
    openModal('player', index);
}

function editNews(index = null) {
    currentSection = 'news';
    openModal('news', index);
}

function editVideo(index = null) {
    currentSection = 'videos';
    openModal('video', index);
}

function editMoment(index = null) {
    currentSection = 'moments';
    openModal('moment', index);
}

function openModal(type, index) {
    editIndex = index;
    const form = document.getElementById('modal-form');
    form.innerHTML = '';
    
    if (type === 'player') {
        const fields = [
            { name: 'name', label: 'نام بازیکن', type: 'text' },
            { name: 'number', label: 'شماره پیراهن', type: 'number' },
            { name: 'position', label: 'موقعیت بازی', type: 'text' },
            { name: 'height', label: 'قد (سانتی‌متر)', type: 'number' },
            { name: 'team', label: 'تیم', type: 'select', options: [{v:'male',l:'آقایان'}, {v:'female',l:'بانوان'}] },
            { name: 'image', label: 'نام عکس (مثلاً p1.jpg)', type: 'text' }
        ];
        if (index !== null) {
            fields.forEach(f => {
                if (f.type === 'select') {
                    const sel = document.createElement('select'); sel.name = f.name; sel.className = 'w-full p-2 bg-brand-dark border border-gray-600 rounded text-white';
                    f.options.forEach(o => { const opt = document.createElement('option'); opt.value = o.v; opt.text = o.l; if (currentData.players[index][f.name] == o.v) opt.selected = true; sel.appendChild(opt); });
                    form.appendChild(createField(f.label, sel));
                } else {
                    const input = document.createElement('input'); input.type = f.type; input.name = f.name; input.value = currentData.players[index][f.name] || ''; input.className = 'w-full p-2 bg-brand-dark border border-gray-600 rounded text-white';
                    form.appendChild(createField(f.label, input));
                }
            });
        } else {
            fields.forEach(f => {
                if (f.type === 'select') {
                    const sel = document.createElement('select'); sel.name = f.name; sel.className = 'w-full p-2 bg-brand-dark border border-gray-600 rounded text-white';
                    f.options.forEach(o => { const opt = document.createElement('option'); opt.value = o.v; opt.text = o.l; sel.appendChild(opt); });
                    form.appendChild(createField(f.label, sel));
                } else {
                    const input = document.createElement('input'); input.type = f.type; input.name = f.name; input.placeholder = `مثال: ${f.label}`; input.className = 'w-full p-2 bg-brand-dark border border-gray-600 rounded text-white';
                    form.appendChild(createField(f.label, input));
                }
            });
        }
    } else if (type === 'news') {
        const fields = [
            { name: 'title', label: 'عنوان خبر', type: 'text' },
            { name: 'date', label: 'تاریخ', type: 'date' },
            { name: 'content', label: 'محتوا', type: 'textarea' },
            { name: 'image', label: 'نام عکس', type: 'text' }
        ];
        if (index !== null) {
            fields.forEach(f => {
                const input = f.type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
                input.name = f.name; input.className = 'w-full p-2 bg-brand-dark border border-gray-600 rounded text-white'; if (f.type === 'textarea') input.rows = 4;
                if (index !== null) input.value = currentData.news[index][f.name] || '';
                form.appendChild(createField(f.label, input));
            });
        } else {
            fields.forEach(f => {
                const input = f.type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
                input.name = f.name; input.placeholder = `مثال: ${f.label}`; input.className = 'w-full p-2 bg-brand-dark border border-gray-600 rounded text-white'; if (f.type === 'textarea') input.rows = 4;
                form.appendChild(createField(f.label, input));
            });
        }
    } else if (type === 'video') {
        const fields = [
            { name: 'title', label: 'عنوان ویدیو', type: 'text' },
            { name: 'url', label: 'لینک یوتیوب', type: 'text' },
            { name: 'thumbnail', label: 'نام تصویر بندانگشتی', type: 'text' }
        ];
        if (index !== null) {
            fields.forEach(f => {
                const input = document.createElement('input'); input.type = f.type; input.name = f.name; input.value = currentData.videos[index][f.name] || ''; input.className = 'w-full p-2 bg-brand-dark border border-gray-600 rounded text-white';
                form.appendChild(createField(f.label, input));
            });
        } else {
            fields.forEach(f => {
                const input = document.createElement('input'); input.type = f.type; input.name = f.name; input.placeholder = `مثال: ${f.label}`; input.className = 'w-full p-2 bg-brand-dark border border-gray-600 rounded text-white';
                form.appendChild(createField(f.label, input));
            });
        }
    } else if (type === 'moment') {
        const fields = [
            { name: 'title', label: 'عنوان', type: 'text' },
            { name: 'image', label: 'نام عکس', type: 'text' }
        ];
        if (index !== null) {
            fields.forEach(f => {
                const input = document.createElement('input'); input.type = f.type; input.name = f.name; input.value = currentData.moments[index][f.name] || ''; input.className = 'w-full p-2 bg-brand-dark border border-gray-600 rounded text-white';
                form.appendChild(createField(f.label, input));
            });
        } else {
            fields.forEach(f => {
                const input = document.createElement('input'); input.type = f.type; input.name = f.name; input.placeholder = `مثال: ${f.label}`; input.className = 'w-full p-2 bg-brand-dark border border-gray-600 rounded text-white';
                form.appendChild(createField(f.label, input));
            });
        }
    }
    
    document.getElementById('modal-title').innerText = index !== null ? 'ویرایش' : 'افزودن';
    document.getElementById('modal').classList.remove('hidden');
}

function createField(label, input) {
    const div = document.createElement('div');
    const lab = document.createElement('label'); lab.className = 'block text-sm mb-1 text-gray-400'; lab.innerText = label;
    div.appendChild(lab); div.appendChild(input); return div;
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    editIndex = null;
}

function renderLists() {
    renderPlayers();
    renderNews();
    renderVideos();
    renderMoments();
}

function renderPlayers() {
    const list = document.getElementById('players-list');
    list.innerHTML = '';
    currentData.players.forEach((p, i) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between bg-brand-card p-4 rounded-xl border border-brand-dark hover:border-brand-yellow transition-colors';
        div.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded bg-gray-700 flex items-center justify-center font-bold text-white">${p.number}</div>
                <div>
                    <div class="font-bold text-white">${p.name}</div>
                    <div class="text-sm text-gray-400">${p.position} • ${p.height}cm</div>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="editPlayer(${i})" class="px-3 py-1 bg-brand-yellow text-brand-black text-sm rounded hover:bg-yellow-300">ویرایش</button>
                <button onclick="deleteItem('players',${i})" class="px-3 py-1 bg-brand-red text-white text-sm rounded hover:bg-red-500">حذف</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function renderNews() {
    const list = document.getElementById('news-list');
    list.innerHTML = '';
    currentData.news.forEach((n, i) => {
        const div = document.createElement('div');
        div.className = 'bg-brand-card p-4 rounded-xl border border-brand-dark hover:border-brand-orange transition-colors';
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-white">${n.title}</h3>
                <span class="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">${n.date}</span>
            </div>
            <p class="text-sm text-gray-400 mb-2">${n.content.substring(0, 100)}...</p>
            <div class="flex gap-2 mt-2">
                <button onclick="editNews(${i})" class="px-3 py-1 bg-brand-yellow text-brand-black text-sm rounded hover:bg-yellow-300">ویرایش</button>
                <button onclick="deleteItem('news',${i})" class="px-3 py-1 bg-brand-red text-white text-sm rounded hover:bg-red-500">حذف</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function renderVideos() {
    const list = document.getElementById('video-list');
    list.innerHTML = '';
    currentData.videos.forEach((v, i) => {
        const div = document.createElement('div');
        div.className = 'bg-brand-card p-4 rounded-xl border border-brand-dark hover:border-brand-red transition-colors';
        div.innerHTML = `
            <h3 class="font-bold text-white mb-2">${v.title}</h3>
            <a href="${v.url}" target="_blank" class="text-sm text-blue-400 hover:underline">${v.url}</a>
            <div class="mt-2 flex gap-2">
                <button onclick="editVideo(${i})" class="px-3 py-1 bg-brand-yellow text-brand-black text-sm rounded hover:bg-yellow-300">ویرایش</button>
                <button onclick="deleteItem('videos',${i})" class="px-3 py-1 bg-brand-red text-white text-sm rounded hover:bg-red-500">حذف</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function renderMoments() {
    const list = document.getElementById('moments-list');
    list.innerHTML = '';
    currentData.moments.forEach((m, i) => {
        const div = document.createElement('div');
        div.className = 'bg-brand-card p-4 rounded-xl border border-brand-dark hover:border-brand-purple transition-colors';
        div.innerHTML = `
            <h3 class="font-bold text-white">${m.title}</h3>
            <p class="text-sm text-gray-400 mt-1">عکس: ${m.image}</p>
            <div class="mt-2 flex gap-2">
                <button onclick="editMoment(${i})" class="px-3 py-1 bg-brand-yellow text-brand-black text-sm rounded hover:bg-yellow-300">ویرایش</button>
                <button onclick="deleteItem('moments',${i})" class="px-3 py-1 bg-brand-red text-white text-sm rounded hover:bg-red-500">حذف</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(tab + '-tab').classList.remove('hidden');
    
    // Update button styles
    document.querySelectorAll('.tab-content').forEach((el, i) => {
        const btns = document.querySelectorAll('button[onclick^="showTab"]');
        btns.forEach(b => b.classList.remove('border-brand-yellow', 'bg-brand-card'));
    });
    event.currentTarget.classList.add('border-brand-yellow', 'bg-brand-card');
}

// Initialize
document.addEventListener('DOMContentLoaded', loadData);
