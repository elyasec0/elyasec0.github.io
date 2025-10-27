
// Scroll Reveal Animation
function reveal() {
    const reveals = document.querySelectorAll('.reveal');
    const cards = document.querySelectorAll('.card-animate');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
    
    cards.forEach((card, index) => {
        const windowHeight = window.innerHeight;
        const elementTop = card.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            setTimeout(() => {
                card.classList.add('active');
            }, index * 100);
        }
    });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Download CV Animation
document.querySelectorAll('.btn-download').forEach(button => {
    button.addEventListener('click', function(e) {
        const icon = this.querySelector('.btn-icon');
        if (icon) {
            icon.style.transform = 'translateY(2px)';
            setTimeout(() => {
                icon.style.transform = 'translateY(0)';
            }, 300);
        }
    });
});

// Floating Nav active state and path updater
function initFloatingNav() {
    const btnHome = document.getElementById('home_link');
    const btnProjects = document.getElementById('projects_link');
    const btnContact = document.getElementById('contact_link');
    const pathSpan = document.querySelector('.nav-path');
    const sections = [
        { id: 'top', el: document.getElementById('top'), btn: btnHome, path: '~/elyasec0/home' },
        { id: 'skills', el: document.getElementById('skills'), btn: btnProjects, path: '~/elyasec0/projects' },
        { id: 'projects', el: document.getElementById('projects'), btn: btnProjects, path: '~/elyasec0/projects' },
        { id: 'contact_me', el: document.getElementById('contact_me'), btn: btnContact, path: '~/elyasec0/contact' }
    ].filter(s => s.el && s.btn);

    if (btnHome) {
        btnHome.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const setActive = (targetId) => {
        [btnHome, btnProjects, btnContact].forEach(b => b && b.classList.remove('active'));
        const s = sections.find(x => x.id === targetId);
        if (s && s.btn) s.btn.classList.add('active');
        if (pathSpan && s) {
            const seg = (s.id === 'top') ? 'home' : (s.id === 'skills' ? 'projects' : s.id);
            pathSpan.innerHTML = `<span class="hide-sm">~/elyasec0</span>/${seg}`;
        }
    };

    const onScroll = () => {
        const y = window.scrollY + window.innerHeight * 0.35;
        let current = 'top';
        sections.forEach(s => {
            const rect = s.el.getBoundingClientRect();
            const top = rect.top + window.scrollY;
            if (y >= top) current = s.id;
        });
        setActive(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

// TryHackMe Badge auto-refresh
function initTryHackMeBadge() {
    const img = document.querySelector('.tryhackme-badge img');
    if (!img) return;
    const base = img.getAttribute('src').split('?')[0];
    const cacheBust = () => {
        img.src = `${base}?t=${Date.now()}`;
    };
    cacheBust();
    setInterval(cacheBust, 1 * 60 * 60 * 1000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initFloatingNav();
    initTryHackMeBadge();
    
    // Hide loading overlay after page load
    const loader = document.getElementById('loadingOverlay');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
                setTimeout(() => loader.remove(), 500);
            }, 300);
        });
    }
});

window.addEventListener('scroll', reveal);
reveal();
