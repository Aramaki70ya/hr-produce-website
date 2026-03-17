// GSAPのプラグイン登録
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------
    // PAGE-BG — Gold everywhere, dark footer only
    // --------------------------------------------------
    const pageBg = document.getElementById('page-bg');

    const BG_COLORS = {
        gold:   '#F7C02D',
        dark:   '#1a1a1a',
    };

    // Map each section to its background color — all gold except footer
    const sectionBgMap = [
        { selector: '.first-view',      bg: BG_COLORS.gold },
        { selector: '.message',         bg: BG_COLORS.gold },
        { selector: '.business',        bg: BG_COLORS.gold },
        { selector: '.company',         bg: BG_COLORS.gold },
        { selector: '.recruit',         bg: BG_COLORS.gold },
        { selector: '.closing-message', bg: BG_COLORS.gold },
        { selector: '.contact',         bg: BG_COLORS.gold },
        { selector: '.footer',          bg: BG_COLORS.dark },
    ];

    function initPageBgTransitions() {
        if (!pageBg) return;

        sectionBgMap.forEach(({ selector, bg }) => {
            const el = document.querySelector(selector);
            if (!el) return;

            ScrollTrigger.create({
                trigger:   el,
                start:     'top 55%',
                end:       'bottom 45%',
                onEnter:      () => transitionBg(bg, el),
                onEnterBack:  () => transitionBg(bg, el),
            });
        });
    }

    let currentBg = BG_COLORS.gold;

    function transitionBg(newBg, sectionEl) {
        if (newBg === currentBg) return;
        currentBg = newBg;

        gsap.to(pageBg, {
            backgroundColor: newBg,
            duration: 0.75,
            ease: 'power2.inOut',
        });

        // Header always stays ink-on-gold (footer section gets dark header)
        const theme = (newBg === BG_COLORS.dark) ? 'dark' : 'gold';
        updateHeaderTheme(theme);
    }

    const header = document.querySelector('.header');

    function updateHeaderTheme(theme) {
        if (!header) return;
        header.classList.remove('is-dark-bg', 'is-light-bg', 'is-gold-bg');
        if (theme === 'dark') {
            header.classList.add('is-dark-bg');
        } else {
            header.classList.add('is-gold-bg');
        }
    }

    // Set initial gold bg
    if (pageBg) {
        pageBg.style.backgroundColor = BG_COLORS.gold;
    }
    updateHeaderTheme('gold');

    // --------------------------------------------------
    // Custom Cursor
    // --------------------------------------------------
    function initCursor() {
        if (window.matchMedia('(hover: none)').matches) return;

        const cursor   = document.getElementById('cursor');
        const follower = document.getElementById('cursor-follower');
        if (!cursor || !follower) return;

        document.body.classList.add('has-cursor');

        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
        });

        function animateFollower() {
            followerX += (mouseX - followerX) * 0.08;
            followerY += (mouseY - followerY) * 0.08;
            follower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px)`;
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        document.querySelectorAll('a, button, .view-more-btn, .service-card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform   += ' scale(2)';
                follower.style.transform += ' scale(1.5)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.transform   = cursor.style.transform.replace(' scale(2)', '');
                follower.style.transform = follower.style.transform.replace(' scale(1.5)', '');
            });
        });
    }

    // --------------------------------------------------
    // Loading Screen
    // --------------------------------------------------
    // --------------------------------------------------
    // Hero Slideshow — 静止画クロスフェード
    // --------------------------------------------------
    function initHeroSlideshow() {
        const slides = document.querySelectorAll('.hero-slide');
        if (slides.length < 2) return;

        let current = 0;
        const INTERVAL = 9000;

        setInterval(() => {
            const prev = current;
            current = (current + 1) % slides.length;

            const nextSlide = slides[current];
            nextSlide.style.animation = 'none';
            nextSlide.offsetHeight; // reflow
            nextSlide.style.animation = '';

            slides[prev].classList.remove('is-active');
            nextSlide.classList.add('is-active');
        }, INTERVAL);
    }

    function finishLoading() {
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) loadingScreen.style.display = 'none';
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-loaded');
        initPageBgTransitions();
        initScrollAnimations();
        initHeroSlideshow();
        ScrollTrigger.refresh();
    }

    function initLoading() {
        const loadingScreen = document.querySelector('.loading-screen');
        const loadingBar    = document.querySelector('.loading-bar');
        const loadingLogo   = document.querySelector('.loading-logo');

        if (!loadingScreen) {
            finishLoading();
            return;
        }

        // フォールバック: 3秒経ってもローディングが終わらなければ強制表示
        setTimeout(() => {
            if (document.body.classList.contains('is-loading')) {
                finishLoading();
            }
        }, 3000);

        gsap.to(loadingLogo, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            delay: 0.2,
        });

        gsap.to(loadingBar, {
            width: '200px',
            duration: 1.2,
            ease: 'power2.inOut',
            delay: 0.4,
            onComplete: () => {
                gsap.to(loadingScreen, {
                    opacity: 0,
                    duration: 0.6,
                    ease: 'power2.inOut',
                    delay: 0.2,
                    onComplete: finishLoading,
                });
            },
        });
    }

    // --------------------------------------------------
    // Scroll Animations
    // --------------------------------------------------
    function initScrollAnimations() {
        // Fade up elements（first-view内は即時表示、それ以外はスクロールで発火）
        document.querySelectorAll('.js-fade-up').forEach(el => {
            const inFirstView = el.closest('.first-view');
            if (inFirstView) {
                gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.5 });
                return;
            }
            gsap.fromTo(el, { opacity: 0, y: 40 }, {
                opacity:  1,
                y:        0,
                duration: 0.8,
                ease:     'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start:   'top 85%',
                    toggleActions: 'play none none none',
                },
            });
        });

        // Hero text
        const mainCatch = document.querySelector('.main-catch');
        if (mainCatch) {
            gsap.fromTo(mainCatch, { opacity: 0, y: 60 }, {
                opacity:  1,
                y:        0,
                duration: 1.2,
                ease:     'power3.out',
                delay:    0.3,
            });
        }

        const subCatch = document.querySelector('.sub-catch');
        if (subCatch) {
            gsap.fromTo(subCatch, { opacity: 0, y: 30 }, {
                opacity:  1,
                y:        0,
                duration: 1.0,
                ease:     'power3.out',
                delay:    0.7,
            });
        }
    }

    // --------------------------------------------------
    // Hamburger / SP Menu
    // --------------------------------------------------
    function initHamburger() {
        const hamburger = document.querySelector('.hamburger');
        if (!hamburger) return;
        hamburger.addEventListener('click', () => {
            header.classList.toggle('is-open');
            document.body.classList.toggle('is-locked');
        });

        document.querySelectorAll('.sp-nav-list a').forEach(link => {
            link.addEventListener('click', () => {
                header.classList.remove('is-open');
                document.body.classList.remove('is-locked');
            });
        });
    }

    // --------------------------------------------------
    // Header scroll state
    // --------------------------------------------------
    function initHeaderScroll() {
        ScrollTrigger.create({
            start:   'top -60px',
            onUpdate: (self) => {
                if (self.progress > 0) {
                    header.classList.add('is-scrolled');
                } else {
                    header.classList.remove('is-scrolled');
                }
            },
        });
    }

    // --------------------------------------------------
    // Mega Menu
    // --------------------------------------------------
    function initMegaMenu() {
        const megaItems   = document.querySelectorAll('.nav-item.has-mega-menu');
        const overlay     = document.querySelector('.mega-menu-overlay');
        let   activeItem  = null;
        let   closeTimer  = null;

        function openMenu(item) {
            if (activeItem && activeItem !== item) closeMenu(activeItem, true);
            clearTimeout(closeTimer);
            activeItem = item;
            header.classList.add('has-mega-menu-open');
            item.classList.add('is-active');

            const menu  = item.querySelector('.mega-menu');
            const links = menu.querySelectorAll('.mega-menu-links li');

            gsap.to(menu, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', pointerEvents: 'auto' });
            if (overlay) gsap.to(overlay, { opacity: 1, duration: 0.3, pointerEvents: 'auto', visibility: 'visible' });
            gsap.to(links, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out', delay: 0.1 });
        }

        function closeMenu(item, immediate = false) {
            if (!item) return;
            const menu  = item.querySelector('.mega-menu');
            const links = menu.querySelectorAll('.mega-menu-links li');
            const dur   = immediate ? 0.1 : 0.25;

            gsap.to(menu, { opacity: 0, y: -20, duration: dur, ease: 'power2.in', pointerEvents: 'none' });
            gsap.to(links, { opacity: 0, y: 10, duration: dur * 0.8, stagger: 0.02 });
            if (overlay) gsap.to(overlay, { opacity: 0, duration: dur, pointerEvents: 'none' });

            item.classList.remove('is-active');
            header.classList.remove('has-mega-menu-open');
            if (activeItem === item) activeItem = null;
        }

        megaItems.forEach(item => {
            // Reset opacity
            const menu = item.querySelector('.mega-menu');
            if (menu) { menu.style.opacity = '0'; menu.style.transform = 'translateY(-20px)'; }

            item.addEventListener('mouseenter', () => openMenu(item));
            item.addEventListener('mouseleave', () => {
                closeTimer = setTimeout(() => closeMenu(item), 150);
            });
            item.querySelector('.mega-menu')?.addEventListener('mouseenter', () => clearTimeout(closeTimer));
            item.querySelector('.mega-menu')?.addEventListener('mouseleave', () => {
                closeTimer = setTimeout(() => closeMenu(item), 150);
            });
        });

        if (overlay) {
            overlay.addEventListener('click', () => { if (activeItem) closeMenu(activeItem); });
        }
    }

    // --------------------------------------------------
    // Smooth scroll for anchor links
    // --------------------------------------------------
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = document.querySelector(link.getAttribute('href'));
                if (!target) return;
                e.preventDefault();
                gsap.to(window, {
                    scrollTo: { y: target, offsetY: 80 },
                    duration: 1.2,
                    ease:     'power3.inOut',
                });
            });
        });
    }

    // --------------------------------------------------
    // Init
    // --------------------------------------------------
    initCursor();
    initHamburger();
    initHeaderScroll();
    initMegaMenu();
    initSmoothScroll();
    initLoading();
});
