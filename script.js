// ===== Theme Toggle with Energy Savings =====
const themeToggle = document.getElementById('themeToggle');
const energyBadge = document.getElementById('energyBadge');
const energySavings = document.getElementById('energySavings');
const themeIcon = themeToggle.querySelector('.theme-icon');
const themeLabel = themeToggle.querySelector('.theme-label');

let darkModeStartTime = null;
let totalDarkModeSeconds = parseInt(localStorage.getItem('darkModeSeconds') || '0', 10);
const SAVINGS_PER_HOUR = 0.18;

function formatCurrency(value) {
    return '€' + value.toFixed(2);
}

function updateEnergySavings() {
    if (darkModeStartTime) {
        const currentSeconds = Math.floor((Date.now() - darkModeStartTime) / 1000);
        const totalSeconds = totalDarkModeSeconds + currentSeconds;
        const hours = totalSeconds / 3600;
        energySavings.textContent = formatCurrency(hours * SAVINGS_PER_HOUR);
    }
}

function setTheme(theme) {
    const isDark = theme === 'dark';

    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
        themeLabel.textContent = 'Escuro';
        energyBadge.classList.add('visible');
        if (!darkModeStartTime) darkModeStartTime = Date.now();
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.textContent = '☀️';
        themeLabel.textContent = 'Claro';
        energyBadge.classList.remove('visible');
        if (darkModeStartTime) {
            totalDarkModeSeconds += Math.floor((Date.now() - darkModeStartTime) / 1000);
            darkModeStartTime = null;
        }
    }
    localStorage.setItem('theme', theme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

setInterval(() => {
    updateEnergySavings();
    if (darkModeStartTime) {
        const currentSeconds = Math.floor((Date.now() - darkModeStartTime) / 1000);
        localStorage.setItem('darkModeSeconds', totalDarkModeSeconds + currentSeconds);
    }
}, 1000);

initTheme();

// ===== Scroll Animations with Staggered Delays =====
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

// Standard reveal
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => {
                entry.target.classList.add('active');
            }, parseInt(delay));
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal, .reveal-line, .reveal-slide, .reveal-word, .dramatic-word, .cta-button').forEach(el => {
    revealObserver.observe(el);
});

// ===== Parallax Effect =====
const parallaxElements = document.querySelectorAll('.parallax');

function updateParallax() {
    const scrollY = window.pageYOffset;

    parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.speed) || 0.1;
        const rect = el.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const offsetY = (window.innerHeight / 2 - centerY) * speed;

        el.style.transform = `translate(-50%, calc(-50% + ${offsetY}px))`;
    });
}

window.addEventListener('scroll', () => {
    requestAnimationFrame(updateParallax);
    requestAnimationFrame(updateDramaticSync);
});

// ===== Dramatic Text Scroll-Sync Animation =====
const dramaticTitle = document.querySelector('.dramatic-title');
const dramaticSection = document.querySelector('.section--dramatic');

function updateDramaticSync() {
    if (!dramaticSection || !dramaticTitle) return;

    const rect = dramaticSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // progress: starts at 0 from the very top of the site (scrollY = 0)
    // and reaches 1 as we move into the dramatic section
    const scrollY = window.scrollY;
    const animationDistance = 3000; // Complete reveal over first 3000px of scroll
    let progress = scrollY / animationDistance;
    progress = Math.max(0, Math.min(1, progress));

    // Blinker Mapping (Verified by browser subagent)
    // Scale: 1.6 -> 1.0
    // RotateX: 40deg -> 0deg
    // Opacity: 0 -> 1
    // TranslateY: 100px -> 0px

    const scale = 1.6 - (0.6 * progress);
    const rotateX = 40 * (1 - progress);
    const opacity = progress;
    const translateY = 100 * (1 - progress);

    dramaticTitle.style.opacity = opacity;
    dramaticTitle.style.transform = `translateY(${translateY}px) rotateX(${rotateX}deg) scale(${scale})`;

    // Hero Fade Effect
    const heroBg = document.querySelector('.hero-bg');
    const heroContent = document.querySelector('.hero-content');
    if (heroBg) {
        // Fade out hero background over the first 1500px of scroll
        const heroFadeProgress = Math.min(1, scrollY / 1500);
        heroBg.style.opacity = 1 - heroFadeProgress;
    }
    if (heroContent) {
        // Fade out hero content over the first 800px of scroll
        const heroContentFadeProgress = Math.min(1, scrollY / 800);
        heroContent.style.opacity = 1 - heroContentFadeProgress;
    }

    // Once progress > 0.9, reveal the follow-up details
    const details = document.querySelector('.dramatic-details-reveal');
    if (details) {
        if (progress > 0.8) {
            details.classList.add('active');
        } else {
            details.classList.remove('active');
        }
    }
}

// ===== Sticky Pillars Navigation =====
const pillarsSection = document.querySelector('.pillars-section');
const pillarNavItems = document.querySelectorAll('.pillar-nav-item');
const pillarPanels = document.querySelectorAll('.pillar-panel');

function updatePillars() {
    if (!pillarsSection) return;

    const isMobile = window.innerWidth <= 900;

    if (isMobile) {
        // Simple scroll-based detection for mobile
        pillarPanels.forEach((panel, index) => {
            const rect = panel.getBoundingClientRect();
            // If the panel is in the middle of the screen
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                pillarNavItems.forEach((nav, navIdx) => {
                    nav.classList.toggle('active', navIdx === index);
                });
            }
        });
        return;
    }

    const sectionRect = pillarsSection.getBoundingClientRect();
    const sectionHeight = pillarsSection.offsetHeight;
    const viewportHeight = window.innerHeight;

    // Calculate scroll progress through the section (0 to 1)
    const scrollProgress = Math.max(0, Math.min(1,
        -sectionRect.top / (sectionHeight - viewportHeight)
    ));

    // Determine which panel should be active (0, 1, or 2)
    const panelCount = pillarPanels.length;
    const activeIndex = Math.min(
        Math.floor(scrollProgress * panelCount),
        panelCount - 1
    );

    // Update nav items
    pillarNavItems.forEach((item, index) => {
        item.classList.toggle('active', index === activeIndex);
    });

    // Update panels
    pillarPanels.forEach((panel, index) => {
        panel.classList.toggle('active', index === activeIndex);
    });
}

// Click navigation for pillars
pillarNavItems.forEach((item, index) => {
    item.addEventListener('click', (e) => {
        e.preventDefault();

        const isMobile = window.innerWidth <= 900;

        if (isMobile) {
            const panel = pillarPanels[index];
            const navHeight = 80; // Approximate height of the sticky nav
            const targetScroll = window.scrollY + panel.getBoundingClientRect().top - navHeight;
            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
            return;
        }

        const sectionTop = pillarsSection.offsetTop;
        const sectionHeight = pillarsSection.offsetHeight - window.innerHeight;
        const targetScroll = sectionTop + (sectionHeight * (index / pillarPanels.length));

        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    });
});

window.addEventListener('scroll', () => {
    requestAnimationFrame(updatePillars);
    requestAnimationFrame(updateCtaVisibility);

    // Persistent CTA is now always visible via CSS
});

// ===== Persistent CTA Visibility =====
const persistentCta = document.querySelector('.persistent-cta');
const footer = document.querySelector('.footer');

function updateCtaVisibility() {
    if (!persistentCta || !footer) return;

    const footerRect = footer.getBoundingClientRect();
    const threshold = 100; // Pixels from footer before hiding

    if (footerRect.top <= window.innerHeight + threshold) {
        persistentCta.classList.add('hidden');
    } else {
        persistentCta.classList.remove('hidden');
    }
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== Initial Setup =====
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    updatePillars();
    updateParallax();
});

// Trigger initial animations for hero
setTimeout(() => {
    document.querySelectorAll('.hero .reveal, .hero .reveal-line').forEach(el => {
        const delay = el.dataset.delay || 0;
        setTimeout(() => el.classList.add('active'), parseInt(delay));
    });
}, 200);
