// Tab Switching for Players Section
function switchTab(tabId) {
    const tabMen = document.getElementById('tab-men');
    const tabWomen = document.getElementById('tab-women');
    
    // Hide all tabs
    tabMen.classList.add('hidden');
    tabWomen.classList.add('hidden');
    
    // Define active and inactive class strings
    const inactiveClass = 'px-6 py-2 rounded-full font-bold transition-all bg-brand-dark text-white border border-gray-700 hover:border-brand-yellow flex items-center justify-center';
    const activeClass = 'px-6 py-2 rounded-full font-bold transition-all bg-brand-yellow text-brand-black flex items-center justify-center';
    
    // Reset buttons
    const btnMen = document.getElementById('btn-men');
    const btnWomen = document.getElementById('btn-women');
    
    btnMen.className = inactiveClass;
    btnWomen.className = inactiveClass;
    
    // Show active tab with animation class
    const activeTab = document.getElementById('tab-' + tabId);
    activeTab.classList.remove('hidden');
    activeTab.classList.add('tab-content-anim');
    
    // Highlight active button
    const activeBtn = document.getElementById('btn-' + tabId);
    activeBtn.className = activeClass;
}

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = mobileMenu.querySelectorAll('a');

    if (mobileMenuBtn && mobileMenu) {
        const icon = mobileMenuBtn.querySelector('i');

        const setMenu = (open) => {
            mobileMenu.classList.toggle('hidden', !open);
            document.body.classList.toggle('menu-open', open);
            mobileMenuBtn.setAttribute('aria-expanded', String(open));
            if (icon) {
                icon.classList.toggle('fa-bars', !open);
                icon.classList.toggle('fa-xmark', open);
            }
        };

        // Toggle mobile menu visibility
        mobileMenuBtn.addEventListener('click', () => {
            setMenu(mobileMenu.classList.contains('hidden'));
        });

        // Close menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => setMenu(false));
        });

        // Close on Escape and when the viewport grows past the mobile breakpoint
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setMenu(false);
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) setMenu(false);
        });
    }

    // Graceful image fallback: remote photos (Unsplash) are unreachable on
    // some networks — hide the broken <img> and let the CSS placeholder show.
    document.querySelectorAll('img').forEach((img) => {
        const hide = () => img.classList.add('is-broken');
        img.addEventListener('error', hide);
    });
});
