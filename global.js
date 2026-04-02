// MainVoice AI - Global Theme and Navigation Logic
// Apply theme immediately to prevent flash of wrong theme
(function() {
    var VALID_THEMES = ['light', 'dark', 'warm'];
    var storedTheme = localStorage.getItem('mainvoice-theme') || 'light';
    if (VALID_THEMES.indexOf(storedTheme) === -1) storedTheme = 'light';
    document.documentElement.setAttribute('data-theme', storedTheme);
})();

// Function to set theme manually
window.setThemeContext = function(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mainvoice-theme', theme);
};

// Wait for DOM to load for navigation logic
document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('loaded');
    
    // Page transition logic for internal links
    document.querySelectorAll('a.page-link, a[href^="MainVoice-AI"], a[href^="research"], a[href^="self-help"], a[href^="about"], a[href^="resources"], a[href^="reports"], a[href^="quizzes"]').forEach(function(a) {
        if(a.getAttribute('href') && !a.target && !a.getAttribute('href').startsWith('#')) {
            a.addEventListener('click', function(e) {
                var href = this.getAttribute('href');
                if(href && href.indexOf('#') < 0) {
                    e.preventDefault();
                    var pageTransition = document.getElementById('page-transition');
                    if(pageTransition) {
                        pageTransition.classList.add('active');
                    }
                    setTimeout(function() {
                        window.location.href = href;
                    }, 400);
                }
            });
        }
    });

    // Initialize theme toggles state if needed based on current theme
    // We already set the data-attribute above, but we could add active states to buttons if desired
});
