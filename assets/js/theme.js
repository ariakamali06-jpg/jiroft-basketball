/* theme.js - Light/Dark Theme Switcher for Jiroft Basketball
   Palette:
   - Cream Background: #F7DCC0
   - Basketball Orange: #EE6730
   - Deep Burnt Orange: #D35400
   - Dark Text / Charcoal: #1A1A1A
*/
(function () {
    'use strict';

    var STORAGE_KEY = 'jiroft_theme';

    function getPreferredTheme() {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }
        return 'dark'; // Default theme is dark as originally designed
    }

    function applyTheme(theme, animate) {
        var root = document.documentElement;
        if (!animate) {
            root.classList.add('no-transition');
        }

        if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
            root.classList.add('light-theme');
            root.style.colorScheme = 'light';
            if (document.body) document.body.classList.add('light-theme');
        } else {
            root.setAttribute('data-theme', 'dark');
            root.classList.remove('light-theme');
            root.style.colorScheme = 'dark';
            if (document.body) document.body.classList.remove('light-theme');
        }

        updateToggleButtons(theme);

        if (!animate) {
            setTimeout(function () {
                root.classList.remove('no-transition');
            }, 50);
        }
    }

    function updateToggleButtons(theme) {
        var buttons = document.querySelectorAll('.theme-toggle-btn');
        buttons.forEach(function (btn) {
            var isLight = theme === 'light';
            btn.setAttribute('aria-label', isLight ? 'تغییر به تم تاریک' : 'تغییر به تم روشن');
            btn.setAttribute('title', isLight ? 'تغییر به تم تاریک' : 'تغییر به تم روشن');

            var sun = btn.querySelector('.theme-icon-sun');
            var moon = btn.querySelector('.theme-icon-moon');
            if (sun && moon) {
                if (isLight) {
                    sun.classList.add('hidden');
                    moon.classList.remove('hidden');
                } else {
                    sun.classList.remove('hidden');
                    moon.classList.add('hidden');
                }
            }
        });
    }

    window.toggleTheme = function () {
        var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        var next = current === 'light' ? 'dark' : 'light';
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next, true);
    };

    // Apply immediately to prevent FOUC (Flash of Unstyled Content)
    var initialTheme = getPreferredTheme();
    applyTheme(initialTheme, false);

    // Bind event listeners when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            bindButtons();
            updateToggleButtons(document.documentElement.getAttribute('data-theme') || 'dark');
        });
    } else {
        bindButtons();
        updateToggleButtons(document.documentElement.getAttribute('data-theme') || 'dark');
    }

    function bindButtons() {
        document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
            btn.removeEventListener('click', window.toggleTheme);
            btn.addEventListener('click', window.toggleTheme);
        });
    }
})();
