
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

// Smooth Scrolling with offset for fixed nav
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80; // Account for fixed navigation
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
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
    const btnSkills = document.getElementById('skills_link');
    const btnProjects = document.getElementById('projects_link');
    const btnContact = document.getElementById('contact_link');
    const pathSpan = document.querySelector('.nav-path');
    const sections = [
        { id: 'top', el: document.getElementById('top'), btn: btnHome, path: '~/elyasec0/home' },
        { id: 'skills', el: document.getElementById('skills'), btn: btnSkills, path: '~/elyasec0/skills' },
        { id: 'projects', el: document.getElementById('projects'), btn: btnProjects, path: '~/elyasec0/projects' },
        { id: 'contact_me', el: document.getElementById('contact_me'), btn: btnContact, path: '~/elyasec0/contact' }
    ].filter(s => s.el && s.btn);

    if (btnHome) {
        btnHome.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const setActive = (targetId) => {
        [btnHome, btnSkills, btnProjects, btnContact].forEach(b => b && b.classList.remove('active'));
        const s = sections.find(x => x.id === targetId);
        if (s && s.btn) s.btn.classList.add('active');
        if (pathSpan && s) {
            let seg = 'home';
            if (s.id === 'top') seg = 'home';
            else if (s.id === 'skills') seg = 'skills';
            else if (s.id === 'projects') seg = 'projects';
            else if (s.id === 'contact_me') seg = 'contact';
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

// GitHub Projects Fetcher
async function fetchGitHubProjects() {
    const username = 'elyasec0';
    const container = document.getElementById('projects-container');
    const statsDiv = document.getElementById('projects-stats');
    
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        if (!response.ok) throw new Error('Failed to fetch repos');
        
        const repos = await response.json();
        // Filter: only public repos, exclude forks and 'elyasec0.github.io'
        const publicRepos = repos.filter(repo => 
            !repo.fork && 
            !repo.private && 
            repo.name !== 'elyasec0.github.io'
        );
        
        // Update stats
        const totalStars = publicRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        const languages = {};
        publicRepos.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });
        const topLanguage = Object.keys(languages).sort((a, b) => languages[b] - languages[a])[0] || 'N/A';
        
        document.getElementById('total-stars').textContent = totalStars;
        
        // Update top language with icon
        const topLangElement = document.getElementById('top-language');
        const langIcon = getLanguageIcon(topLanguage);
        topLangElement.innerHTML = `
            <img src="https://cdn.simpleicons.org/${langIcon}" alt="${topLanguage}" id="top-language-icon">
            ${topLanguage}
        `;
        
        // Populate language filter
        const languageFilter = document.getElementById('language-filter');
        const uniqueLanguages = [...new Set(publicRepos.map(r => r.language).filter(Boolean))].sort();
        uniqueLanguages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang;
            languageFilter.appendChild(option);
        });
        
        // Store repos globally for filtering
        window.allRepos = publicRepos;
        
        // Display projects
        displayProjects(publicRepos);
        
        // Setup search and filters
        setupProjectFilters();
        
    } catch (error) {
        container.innerHTML = `
            <div class="loading-projects error-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p style="color: var(--danger); margin-top: 15px;">⚠️ Failed to load projects</p>
                <p style="color: var(--muted); font-size: 0.9em; margin: 10px 0;">Unable to fetch repositories from GitHub API</p>
                <button onclick="retryFetchProjects()" class="btn" style="margin-top: 15px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 5px; vertical-align: middle;">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    Retry
                </button>
            </div>
        `;
        console.error('Error fetching GitHub repos:', error);
    }
}

// Retry fetch projects
function retryFetchProjects() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '<div class="loading-projects"><div class="loading-spinner"></div><p>Loading projects...</p></div>';
    fetchGitHubProjects();
}

// Language icons mapping
function getLanguageIcon(language) {
    const icons = {
        'Python': 'python/3776AB',
        'JavaScript': 'javascript/F7DF1E',
        'TypeScript': 'typescript/3178C6',
        'Java': 'openjdk/FFFFFF',
        'C++': 'cplusplus/00599C',
        'C': 'c/A8B9CC',
        'C#': 'csharp/239120',
        'PHP': 'php/777BB4',
        'Ruby': 'ruby/CC342D',
        'Go': 'go/00ADD8',
        'Rust': 'rust/000000',
        'Swift': 'swift/F05138',
        'Kotlin': 'kotlin/7F52FF',
        'Dart': 'dart/0175C2',
        'HTML': 'html5/E34F26',
        'CSS': 'css3/1572B6',
        'Shell': 'gnubash/4EAA25',
        'PowerShell': 'powershell/5391FE',
        'R': 'r/276DC3',
        'Scala': 'scala/DC322F',
        'Lua': 'lua/2C2D72',
        'Perl': 'perl/39457E',
        'Haskell': 'haskell/5D4F85',
        'Elixir': 'elixir/4B275F',
        'Clojure': 'clojure/5881D8',
        'Julia': 'julia/9558B2',
        'Vue': 'vuedotjs/4FC08D',
        'React': 'react/61DAFB',
        'Svelte': 'svelte/FF3E00',
        'Angular': 'angular/DD0031'
    };
    
    return icons[language] || 'files/CCCCCC';
}

// Highlight search terms in text
function highlightText(text, searchTerm) {
    if (!searchTerm || !text) return text;
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// Copy project link to clipboard
function copyProjectLink(url, event) {
    event.preventDefault();
    event.stopPropagation();
    
    navigator.clipboard.writeText(url).then(() => {
        const button = event.currentTarget;
        const tooltip = button.querySelector('.copy-tooltip');
        if (tooltip) {
            tooltip.classList.add('show');
            setTimeout(() => tooltip.classList.remove('show'), 2000);
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function displayProjects(repos, searchTerm = '') {
    const container = document.getElementById('projects-container');
    
    // Update project count badge
    updateProjectCount(repos.length);
    
    if (repos.length === 0) {
        container.innerHTML = '<div class="loading-projects"><p style="color: var(--muted);">No projects found matching your filters.</p></div>';
        return;
    }
    
    const html = repos.map(repo => {
        const highlightedName = highlightText(repo.name, searchTerm);
        const highlightedDesc = highlightText(repo.description || 'No description provided.', searchTerm);
        
        return `
        <div class="project-card card-animate">
            <div>
                <div class="project-actions">
                    <button class="project-copy" onclick="copyProjectLink('${repo.html_url}', event)" aria-label="Copy link" title="Copy link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span class="copy-tooltip">Link copied!</span>
                    </button>
                    <button class="project-share" onclick="shareProject('${repo.html_url}', '${repo.name}')" aria-label="Share" title="Share">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                        <span class="share-tooltip">Shared!</span>
                    </button>
                </div>
                
                <div class="badges-container">
                    <span class="repo-type">
                        <svg viewBox="0 0 16 16" fill="currentColor">
                            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path>
                        </svg>
                        Public
                    </span>
                    ${repo.license ? `<span class="license-badge" title="${repo.license.name}">
                        <svg viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8.75.75V2h.985c.304 0 .603.08.867.231l1.29.736c.038.022.08.033.124.033h2.234a.75.75 0 010 1.5h-.427l2.111 4.692a.75.75 0 01-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.016.015-.045.04a3.514 3.514 0 01-.686.45A4.492 4.492 0 0113 10.75c-.77 0-1.473-.246-2.05-.627-.577.381-1.28.627-2.05.627-.77 0-1.473-.246-2.05-.627-.577.381-1.28.627-2.05.627a4.492 4.492 0 01-2.05-.476 3.514 3.514 0 01-.686-.45l-.045-.04-.016-.015-.006-.006-.002-.002v-.002h-.001l.529-.531-.53.53a.75.75 0 01-.154-.838L3.822 4.5h-.427a.75.75 0 010-1.5h2.234c.045 0 .086-.011.124-.033l1.29-.736A1.75 1.75 0 017.91 2h.985V.75a.75.75 0 011.5 0zm-2.03 3.25h1.56a.75.75 0 000-1.5h-.56v-.688c-.046.002-.093.004-.141.008a.75.75 0 00-.859.75zm-1.39 1.5h5.16l-1.68 3.78a4.09 4.09 0 01-1.38.22c-.51 0-.99-.08-1.42-.22l-1.68-3.78z"></path>
                        </svg>
                        ${repo.license.spdx_id || repo.license.key}
                    </span>` : ''}
                </div>
                
                <div class="project-header">
                    <img src="https://cdn.simpleicons.org/github/00E5FF" alt="GitHub" width="24" height="24" loading="lazy">
                    <h3>${highlightedName}</h3>
                </div>
                
                <p data-full-text="${repo.description || 'No description available'}">${highlightedDesc}</p>
                <button class="read-more-btn" onclick="toggleDescription(event)" style="display: none;">
                    <span class="read-more-text">Read More</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                
                <div class="project-stats">
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <a href="${repo.html_url}/stargazers" target="_blank" rel="noopener noreferrer" title="Stars" class="stat-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="${repo.stargazers_count > 0 ? '#FFD700' : 'currentColor'}" style="color: ${repo.stargazers_count > 0 ? '#FFD700' : 'var(--muted)'}">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                            ${repo.stargazers_count}
                        </a>
                        <a href="${repo.html_url}/network/members" target="_blank" rel="noopener noreferrer" title="Forks" class="stat-link">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="color: var(--muted)">
                                <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
                            </svg>
                            ${repo.forks_count}
                        </a>
                        <a href="${repo.html_url}/watchers" target="_blank" rel="noopener noreferrer" title="Watchers" class="stat-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--muted)">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            ${repo.watchers_count}
                        </a>
                        ${repo.language ? `<span><img class="si-badge" src="https://cdn.simpleicons.org/${getLanguageIcon(repo.language)}" alt="${repo.language}" width="16" height="16" loading="lazy"> ${repo.language}</span>` : ''}
                    </div>
                    <p class="tech" style="margin: 0;">📅 ${new Date(repo.updated_at).toLocaleDateString()}</p>
                </div>
            </div>
            
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="btn">View Project</a>
        </div>
    `}).join('');
    
    container.innerHTML = html;
    
    // Trigger animation
    requestAnimationFrame(() => {
        const cards = container.querySelectorAll('.card-animate');
        cards.forEach((card, index) => {
            setTimeout(() => card.classList.add('active'), index * 50);
        });
        
        // Check which descriptions need "Read More" button
        setTimeout(() => checkDescriptionOverflow(), 100);
    });
}

function checkDescriptionOverflow() {
    const descriptions = document.querySelectorAll('.project-card p:not(.tech)');
    
    descriptions.forEach(desc => {
        const button = desc.nextElementSibling;
        if (button && button.classList.contains('read-more-btn')) {
            // Check if text is truncated
            const isTruncated = desc.scrollHeight > desc.clientHeight;
            
            if (isTruncated) {
                button.style.display = 'inline-flex';
            } else {
                button.style.display = 'none';
            }
        }
    });
}

// Update project count badge
function updateProjectCount(count) {
    const badge = document.getElementById('project-count-badge');
    if (badge) {
        badge.textContent = `${count} ${count === 1 ? 'Project' : 'Projects'}`;
        badge.style.display = 'inline-block';
    }
}

function setupProjectFilters() {
    const searchInput = document.getElementById('search-input');
    const languageFilter = document.getElementById('language-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    if (!searchInput || !languageFilter || !sortFilter) {
        console.error('Filter elements not found');
        return;
    }
    
    // Debounce function for better performance
    let debounceTimer;
    const debounce = (callback, delay = 300) => {
        return (...args) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => callback(...args), delay);
        };
    };
    
    function filterAndSort() {
        if (!window.allRepos) return;
        
        let filtered = [...window.allRepos];
        
        // Search filter
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            filtered = filtered.filter(repo => 
                repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (repo.description || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Language filter
        const selectedLang = languageFilter.value;
        if (selectedLang !== 'all') {
            filtered = filtered.filter(repo => repo.language === selectedLang);
        }
        
        // Sort
        const sortBy = sortFilter.value;
        if (sortBy === 'stars') {
            // Filter repos with 1+ stars first, then sort
            filtered = filtered.filter(repo => repo.stargazers_count >= 1);
            filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);
        } else if (sortBy === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        }
        
        displayProjects(filtered, searchTerm);
    }
    
    // Use debounce for search input to improve performance
    searchInput.addEventListener('input', debounce(filterAndSort, 250));
    
    // Instant filter for dropdowns
    languageFilter.addEventListener('change', filterAndSort);
    sortFilter.addEventListener('change', filterAndSort);
}

function shareProject(url, name) {
    if (navigator.share) {
        navigator.share({
            title: name,
            url: url
        }).catch(() => fallbackCopy(url));
    } else {
        fallbackCopy(url);
    }
}

function toggleDescription(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.currentTarget;
    const card = button.closest('.project-card');
    const description = card.querySelector('p:not(.tech)');
    const textSpan = button.querySelector('.read-more-text');
    
    description.classList.toggle('expanded');
    button.classList.toggle('expanded');
    
    if (description.classList.contains('expanded')) {
        textSpan.textContent = 'Read Less';
    } else {
        textSpan.textContent = 'Read More';
    }
}

function fallbackCopy(url) {
    navigator.clipboard.writeText(url).then(() => {
        const tooltips = document.querySelectorAll('.share-tooltip');
        tooltips.forEach(tooltip => {
            tooltip.classList.add('show');
            setTimeout(() => tooltip.classList.remove('show'), 2000);
        });
    });
}

// Back to Top Button
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Progress Bar
function updateProgressBar() {
    const progressBar = document.getElementById('nav-progress');
    if (!progressBar) return;
    
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = scrolled + '%';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initFloatingNav();
    initTryHackMeBadge();
    initBackToTop();
    fetchGitHubProjects();
    
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

window.addEventListener('scroll', () => {
    reveal();
    updateProgressBar();
});
reveal();
