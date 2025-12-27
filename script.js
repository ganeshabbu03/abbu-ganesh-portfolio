document.addEventListener('DOMContentLoaded', () => {
    // Typing Effect for Hero Title
    const titleElement = document.querySelector('.hero-role');
    const titleText = titleElement.textContent;
    titleElement.textContent = '';

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                const navList = document.querySelector('.nav-list');
                const hamburger = document.querySelector('.hamburger');
                if (navList.classList.contains('active')) {
                    navList.classList.remove('active');
                    // hamburger.classList.remove('active'); // Add this if hamburger has animation
                }
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('hidden');
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply observer to sections and cards
    const animatableElements = document.querySelectorAll('.section-title, .about-text, .skills-grid, .timeline-item, .education-card, .project-card, .contact-content');

    animatableElements.forEach(el => {
        el.classList.add('hidden');
        observer.observe(el);
    });

    // Add CSS class for hidden state
    const style = document.createElement('style');
    style.innerHTML = `
        .hidden {
            opacity: 0;
            transform: translateY(30px);
        }
    `;
    document.head.appendChild(style);

    // Typewriter effect function
    function typeWriter(text, i, fnCallback) {
        if (i < (text.length)) {
            titleElement.textContent = text.substring(0, i + 1) + '|';
            setTimeout(function () {
                typeWriter(text, i + 1, fnCallback)
            }, 50);
        } else {
            titleElement.textContent = text;
            if (typeof fnCallback == 'function') {
                setTimeout(fnCallback, 700);
            }
        }
    }

    // Start typing effect after initial animations
    setTimeout(() => {
        typeWriter(titleText, 0);
    }, 1500);

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
    }

    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Set initial theme based on system preference
    if (prefersDarkScheme.matches) {
        document.body.setAttribute('data-theme', 'dark');
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.body.removeAttribute('data-theme');
        } else {
            document.body.setAttribute('data-theme', 'dark');
        }
    });
});
