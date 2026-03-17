// GSAPのプラグイン登録
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------
    // PAGE-BG — Scroll-driven background color transitions
    // --------------------------------------------------
    // Color sequence: dark hero → dark message → LIGHT business → dark company
    //                 → dark recruit → GOLD closing → dark contact → black footer
    const pageBg = document.getElementById('page-bg');

    const BG_COLORS = {
        dark:    '#0d0d0d',
        darkalt: '#111111',
        light:   '#f5f5f5',
        gold:    '#F7C02D',
        black:   '#0a0a0a',
    };

    // Map each section to its background color
    const sectionBgMap = [
        { selector: '.first-view',      bg: BG_COLORS.black  },
        { selector: '.message',         bg: BG_COLORS.dark   },
        { selector: '.business',        bg: BG_COLORS.light  },
        { selector: '.company',         bg: BG_COLORS.darkalt },
        { selector: '.recruit',         bg: BG_COLORS.gold   },
        { selector: '.closing-message', bg: BG_COLORS.gold   },
        { selector: '.contact',         bg: BG_COLORS.gold   },
        { selector: '.footer',          bg: BG_COLORS.black  },
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

    let currentBg = BG_COLORS.black;

    function transitionBg(newBg, sectionEl) {
        if (newBg === currentBg) return;
        currentBg = newBg;

        gsap.to(pageBg, {
            backgroundColor: newBg,
            duration: 0.75,
            ease: 'power2.inOut',
        });

        // Also update header style based on section theme
        const theme = sectionEl ? sectionEl.dataset.sectionTheme : 'dark';
        updateHeaderTheme(theme);
    }

    const header = document.querySelector('.header');

    function updateHeaderTheme(theme) {
        if (!header) return;
        header.classList.remove('is-dark-bg', 'is-light-bg', 'is-gold-bg');
        if (theme === 'light') {
            header.classList.add('is-light-bg');
        } else if (theme === 'gold') {
            header.classList.add('is-gold-bg');
        } else {
            header.classList.add('is-dark-bg');
        }
    }


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

        (function animateCursor() {
            followerX += (mouseX - followerX) * 0.08;
            followerY += (mouseY - followerY) * 0.08;
            follower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px)`;
            requestAnimationFrame(animateCursor);
        })();

        document.querySelectorAll('a, button, .service-card, .mvv-card, .view-more-btn, .contact-btn').forEach(el => {
            el.addEventListener('mouseenter', () => { cursor.classList.add('is-hover');    follower.classList.add('is-hover');    });
            el.addEventListener('mouseleave', () => { cursor.classList.remove('is-hover'); follower.classList.remove('is-hover'); });
        });
    }
    initCursor();

    // --------------------------------------------------
    // Hero Canvas — Particle Network
    // --------------------------------------------------
    function initHeroCanvas() {
        const canvas    = document.getElementById('hero-canvas');
        if (!canvas) return;
        const ctx       = canvas.getContext('2d');
        const firstView = canvas.closest('.first-view');

        function resize() {
            canvas.width  = firstView.offsetWidth;
            canvas.height = firstView.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        const COUNT = 70;
        const particles = Array.from({ length: COUNT }, () => {
            const vx = (Math.random() - 0.5) * 0.5;
            const vy = (Math.random() - 0.5) * 0.5;
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx, vy, baseVx: vx, baseVy: vy,
                radius: Math.random() * 1.5 + 0.5,
                alpha:  Math.random() * 0.5 + 0.2,
            };
        });

        let mx = -9999, my = -9999;

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                const dx = p.x - mx, dy = p.y - my;
                const d  = Math.sqrt(dx * dx + dy * dy);
                if (d < 120 && d > 0) {
                    const f = (120 - d) / 120;
                    p.vx += (dx / d) * f * 0.4;
                    p.vy += (dy / d) * f * 0.4;
                }
                p.vx += (p.baseVx - p.vx) * 0.025;
                p.vy += (p.baseVy - p.vy) * 0.025;
                const sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (sp > 1.8) { p.vx = (p.vx / sp) * 1.8; p.vy = (p.vy / sp) * 1.8; }

                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(247,192,45,${p.alpha})`;
                ctx.fill();
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const d  = Math.sqrt(dx * dx + dy * dy);
                    if (d < 130) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(247,192,45,${(1 - d / 130) * 0.18})`;
                        ctx.lineWidth   = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }
        animate();

        firstView.addEventListener('mousemove', (e) => {
            const r = firstView.getBoundingClientRect();
            mx = e.clientX - r.left; my = e.clientY - r.top;
        });
        firstView.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });
    }
    initHeroCanvas();

    // --------------------------------------------------
    // Hero Mouse Parallax
    // --------------------------------------------------
    function initHeroParallax() {
        const firstView = document.querySelector('.first-view');
        const content   = document.querySelector('.first-view-content');
        const shapes    = document.querySelector('.hero-shapes');
        if (!firstView || !content) return;

        firstView.addEventListener('mousemove', (e) => {
            const r  = firstView.getBoundingClientRect();
            const nx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
            const ny = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
            gsap.to(content, { x: nx * 18, y: ny * 12, duration: 1.4, ease: 'power2.out' });
            if (shapes) gsap.to(shapes, { x: nx * -28, y: ny * -18, duration: 1.8, ease: 'power2.out' });
        });

        firstView.addEventListener('mouseleave', () => {
            gsap.to(content, { x: 0, y: 0, duration: 1.4, ease: 'power2.out' });
            if (shapes) gsap.to(shapes, { x: 0, y: 0, duration: 1.8, ease: 'power2.out' });
        });
    }
    initHeroParallax();

    // --------------------------------------------------
    // Split Text — .js-split-text の文字をバラす
    // --------------------------------------------------
    function initSplitText() {
        document.querySelectorAll('.js-split-text').forEach(el => {
            const parts   = el.innerHTML.split(/(<br\s*\/?>)/gi);
            const newHtml = parts.map(part => {
                if (/^<br/i.test(part)) return part;
                return Array.from(part).map(char => {
                    if (char === ' ' || char === '\u3000') return '<span class="char">&ensp;</span>';
                    return `<span class="char"><span class="char-inner">${char}</span></span>`;
                }).join('');
            }).join('');
            el.innerHTML = newHtml;
            el.setAttribute('aria-label', el.textContent.trim());
        });
    }
    initSplitText();

    // --------------------------------------------------
    // Loading Animation
    // --------------------------------------------------
    const loadingTl = gsap.timeline({
        onComplete: () => {
            document.body.classList.add('is-loaded');
            document.body.classList.remove('is-loading');
            initPageBgTransitions();
            startMainAnimations();
        }
    });

    loadingTl
        .to('.loading-logo', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
        .to('.loading-bar',  { width: '100%', duration: 0.8, ease: 'power2.inOut' }, '-=0.4')
        .to('.loading-screen', { opacity: 0, duration: 0.8, ease: 'power2.inOut', delay: 0.4 });


    // --------------------------------------------------
    // Header Control
    // --------------------------------------------------
    const megaMenuOverlay = document.querySelector('.mega-menu-overlay');
    const navItems        = document.querySelectorAll('.nav-item.has-mega-menu');

    window.addEventListener('scroll', () => {
        header.classList.toggle('is-scrolled', window.scrollY > 50);
    });

    // --------------------------------------------------
    // Mega Menu Control
    // --------------------------------------------------
    let currentMegaMenu = null;
    let currentNavItem  = null;
    let megaMenuTl      = null;
    let closeTimer      = null;

    header.addEventListener('mouseleave', () => { closeTimer = setTimeout(closeMegaMenu, 100); });
    header.addEventListener('mouseenter', () => {
        if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    });

    navItems.forEach(navItem => {
        const megaMenu      = navItem.querySelector('.mega-menu');
        const megaMenuLinks = megaMenu.querySelectorAll('.mega-menu-links li');

        navItem.addEventListener('mouseenter', () => {
            if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }

            if (currentMegaMenu && currentMegaMenu !== megaMenu) {
                const prevLinks = currentMegaMenu.querySelectorAll('.mega-menu-links li');
                gsap.to(prevLinks,       { opacity: 0, duration: 0.1 });
                gsap.to(currentMegaMenu, { opacity: 0, visibility: 'hidden', duration: 0.1 });
                if (currentNavItem) currentNavItem.classList.remove('is-active');
            }

            setTimeout(() => {
                if (navItem.matches(':hover') || megaMenu.matches(':hover')) {
                    openMegaMenu(navItem, megaMenu, megaMenuLinks);
                }
            }, 50);
        });
    });

    if (megaMenuOverlay) megaMenuOverlay.addEventListener('click', closeMegaMenu);

    function openMegaMenu(navItem, megaMenu, megaMenuLinks) {
        currentMegaMenu = megaMenu;
        currentNavItem  = navItem;
        navItem.classList.add('is-active');
        header.classList.add('has-mega-menu-open');
        if (megaMenuTl) megaMenuTl.kill();
        if (megaMenuOverlay) gsap.to(megaMenuOverlay, { opacity: 1, visibility: 'visible', duration: 0.4, ease: 'power2.out' });
        megaMenuTl = gsap.timeline()
            .set(megaMenu,      { y: -20, opacity: 0, visibility: 'hidden' })
            .set(megaMenuLinks, { opacity: 0, y: 10 })
            .to(megaMenu,       { opacity: 1, visibility: 'visible', y: 0, duration: 0.4, ease: 'power3.out' })
            .to(megaMenuLinks,  { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }, '-=0.2');
    }

    function closeMegaMenu() {
        if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
        if (!currentMegaMenu) return;
        const megaMenuLinks  = currentMegaMenu.querySelectorAll('.mega-menu-links li');
        const menuToClose    = currentMegaMenu;
        const navItemToClose = currentNavItem;
        if (megaMenuTl) megaMenuTl.kill();
        if (megaMenuOverlay) gsap.to(megaMenuOverlay, { opacity: 0, visibility: 'hidden', duration: 0.3, ease: 'power2.in' });
        gsap.to(megaMenuLinks, { opacity: 0, y: 10, duration: 0.2, stagger: 0.02, ease: 'power2.in' });
        gsap.to(menuToClose, {
            opacity: 0, visibility: 'hidden', y: -15, duration: 0.3, ease: 'power2.in',
            onComplete: () => {
                if (navItemToClose) navItemToClose.classList.remove('is-active');
                header.classList.remove('has-mega-menu-open');
                gsap.set(menuToClose.querySelectorAll('.mega-menu-links li'), { opacity: 0, y: 10 });
                currentMegaMenu = null; currentNavItem = null; megaMenuTl = null;
            }
        });
    }

    const hamburger   = document.querySelector('.hamburger');
    const spMenuLinks = document.querySelectorAll('.sp-nav-list a');
    hamburger.addEventListener('click', () => {
        header.classList.toggle('is-open');
        document.body.classList.toggle('is-locked');
    });
    spMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            header.classList.remove('is-open');
            document.body.classList.remove('is-locked');
        });
    });


    // --------------------------------------------------
    // Main Animations (After Loading)
    // --------------------------------------------------
    // --------------------------------------------------
    // Hero Slideshow — 静止画クロスフェード
    // --------------------------------------------------
    function initHeroSlideshow() {
        const slides = document.querySelectorAll('.hero-slide');
        if (slides.length < 2) return;

        let current = 0;
        const INTERVAL = 9000; // 9秒ごとに切り替え

        setInterval(() => {
            const prev = current;
            current = (current + 1) % slides.length;

            // 次のスライドをリセット（Ken Burnsを再生するため）
            const nextSlide = slides[current];
            nextSlide.style.animation = 'none';
            nextSlide.offsetHeight; // reflow
            nextSlide.style.animation = '';

            slides[prev].classList.remove('is-active');
            nextSlide.classList.add('is-active');
        }, INTERVAL);
    }

    function startMainAnimations() {

        // ① ファーストビュー — V2: 回転付き立体スライドイン
        const charInners = document.querySelectorAll('.main-catch .char-inner');
        if (charInners.length > 0) {
            // emphasis（2行目）: より大きく・回転付き
            const emphasisChars = document.querySelectorAll('.main-catch-emphasis .char-inner');
            const lineChars     = document.querySelectorAll('.main-catch-line .char-inner');
            if (emphasisChars.length) {
                gsap.fromTo(emphasisChars,
                    { yPercent: 115, rotation: 5, opacity: 0 },
                    { yPercent: 0, rotation: 0, opacity: 1,
                      duration: 1.1, stagger: 0.048, ease: 'power4.out', delay: 0.4 }
                );
            }
            if (lineChars.length) {
                gsap.fromTo(lineChars,
                    { yPercent: 80, opacity: 0 },
                    { yPercent: 0, opacity: 1,
                      duration: 0.8, stagger: 0.035, ease: 'power3.out', delay: 1.1 }
                );
            }
        } else {
            gsap.fromTo('.main-catch', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 });
        }

        // V2: hero-eyebrow アニメーション
        gsap.fromTo('.hero-eyebrow',
            { opacity: 0, x: -20 },
            { opacity: 0.9, x: 0, duration: 0.8, ease: 'power3.out', delay: 1.8 }
        );

        gsap.fromTo('.sub-catch',
            { opacity: 0, y: 20, filter: 'blur(12px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out', delay: 0.9 }
        );

        // ② 静止画スライドショー
        initHeroSlideshow();

        // ③ ヒーローシェイプ
        gsap.to('.hero-shape', {
            opacity: 1, duration: 2.5, stagger: 0.3, ease: 'power2.out', delay: 0.6
        });

        // ③ 共通フェードアップ
        document.querySelectorAll('.js-fade-up').forEach(el => {
            gsap.fromTo(el,
                { opacity: 0, y: 55, filter: 'blur(6px)' },
                {
                    scrollTrigger: { trigger: el, start: 'top 87%', toggleActions: 'play none none reverse' },
                    opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out'
                }
            );
        });

        // ④ メッセージ行リビール
        initMessageReveal();

        // ⑤ MVVカード — V2: 水平スイープ
        const mvvCards = document.querySelectorAll('.mvv-card');
        if (mvvCards.length) {
            gsap.fromTo(mvvCards,
                { clipPath: 'inset(0 0 0 100%)', x: -20, opacity: 0 },
                {
                    scrollTrigger: { trigger: '.mvv-section', start: 'top 78%' },
                    clipPath: 'inset(0 0 0 0%)',
                    x: 0, opacity: 1,
                    duration: 0.85, stagger: 0.12, ease: 'power3.out'
                }
            );
        }

        // ⑥ セクションタイトル — V2: clip-pathワイプ
        document.querySelectorAll('.section-title').forEach(title => {
            gsap.fromTo(title,
                { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
                {
                    scrollTrigger: { trigger: title, start: 'top 88%' },
                    clipPath: 'inset(0 0% 0 0)',
                    duration: 1.0, ease: 'power3.inOut'
                }
            );
        });

        // ⑦ セクションヘッダーのアンダーライン
        document.querySelectorAll('.section-header').forEach(hdr => {
            ScrollTrigger.create({
                trigger: hdr, start: 'top 80%',
                onEnter:     () => hdr.classList.add('is-line-done'),
                onLeaveBack: () => hdr.classList.remove('is-line-done'),
            });
        });

        // ⑧ 会社情報の行
        const infoRows = document.querySelectorAll('.info-row');
        if (infoRows.length) {
            gsap.fromTo(infoRows,
                { opacity: 0, x: 25 },
                {
                    scrollTrigger: { trigger: '.info-section', start: 'top 82%' },
                    opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out'
                }
            );
        }

        // ⑨ 採用強み
        const strengthPoints = document.querySelectorAll('.strength-points li');
        if (strengthPoints.length) {
            gsap.fromTo(strengthPoints,
                { opacity: 0, x: -25 },
                {
                    scrollTrigger: { trigger: '.strength-points', start: 'top 82%' },
                    opacity: 1, x: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out'
                }
            );
        }

        // ⑩ クロージング — ブラーイン (gold section) ※常に表示、スクロールで演出のみ
        gsap.fromTo('.closing-title',
            { y: 70, filter: 'blur(24px)' },
            {
                scrollTrigger: { trigger: '.closing-message', start: 'top 85%' },
                y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power4.out'
            }
        );
        gsap.fromTo(['.closing-subtitle', '.closing-text'],
            { y: 35 },
            {
                scrollTrigger: { trigger: '.closing-message', start: 'top 82%' },
                y: 0, duration: 0.9, stagger: 0.2, ease: 'power3.out'
            }
        );

        // ⑪ コンタクトボタン — clip-path ワイプ
        document.querySelectorAll('.contact-btn').forEach((btn, i) => {
            gsap.fromTo(btn,
                { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
                {
                    scrollTrigger: { trigger: btn, start: 'top 88%' },
                    opacity: 1, clipPath: 'inset(0 0% 0 0)',
                    duration: 0.9, delay: i * 0.15, ease: 'power3.out'
                }
            );
        });

        // ⑫ バックグラウンドテキスト パラレックス
        document.querySelectorAll('.section-bg-text').forEach(bgText => {
            const section = bgText.closest('.section');
            gsap.to(bgText, {
                scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
                y: window.innerHeight * 0.3, ease: 'none'
            });
        });

        // ⑬ スプリットレイアウトの左パネル数字 — パラレックス
        document.querySelectorAll('.split-section-num').forEach(num => {
            gsap.fromTo(num,
                { opacity: 0, y: 30 },
                {
                    scrollTrigger: { trigger: num.closest('.split-layout-left'), start: 'top 80%' },
                    opacity: 0.18, y: 0, duration: 1, ease: 'power3.out'
                }
            );
        });

        // ⑭ ポイントリスト
        const points = document.querySelectorAll('.point-list li');
        if (points.length) {
            gsap.fromTo(points,
                { opacity: 0, x: -30 },
                {
                    scrollTrigger: { trigger: '.highlight-section', start: 'top 75%' },
                    opacity: 1, x: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out'
                }
            );
        }
    }


    // --------------------------------------------------
    // Message Section — 行ごとのリビール
    // --------------------------------------------------
    function initMessageReveal() {
        const messageText = document.querySelector('.message-text');
        if (!messageText) return;

        const segments = messageText.innerHTML.split(/<br\s*\/?>/gi);
        let newHtml = '';
        segments.forEach((seg, i) => {
            const trimmed = seg.trim();
            if (trimmed === '') {
                if (i < segments.length - 1) newHtml += '<br>';
            } else {
                newHtml += `<span class="msg-line"><span class="msg-line-inner">${seg}</span></span>`;
                if (i < segments.length - 1) newHtml += '<br>';
            }
        });
        messageText.innerHTML = newHtml;

        const msgLines = messageText.querySelectorAll('.msg-line-inner');
        if (!msgLines.length) return;

        // V2: 行ごとに個別ScrollTrigger + カラーシフト
        msgLines.forEach(line => {
            gsap.fromTo(line,
                { y: '100%', opacity: 0 },
                {
                    y: '0%',
                    opacity: 1,
                    duration: 0.7,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: line,
                        start: 'top 92%'
                    }
                }
            );
        });

        const highlight = messageText.querySelector('.message-highlight');
        if (highlight) {
            ScrollTrigger.create({
                trigger: highlight, start: 'top 80%',
                onEnter: () => {
                    gsap.fromTo(highlight,
                        { scale: 0.92, opacity: 0 },
                        { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(1.4)' }
                    );
                }
            });
        }
    }


    // --------------------------------------------------
    // Smooth Scroll
    // --------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                const offsetPosition = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });


    // --------------------------------------------------
    // テーマ切替（白メイン / 黄メイン）
    // --------------------------------------------------
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            document.body.setAttribute('data-theme', theme);
            document.querySelectorAll('.theme-toggle-btn').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
        });
    });

    const currentTheme = document.body.getAttribute('data-theme') || 'white';
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        if (btn.getAttribute('data-theme') === currentTheme) btn.classList.add('is-active');
    });

});


// ==========================================================================
// V2 UPGRADES — ダイナミック迫力系
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------
    // V2: ローディングカウンター（00→100）
    // --------------------------------------------------
    function initLoadingCounter() {
        const counter = document.querySelector('.loading-counter');
        if (!counter) return;
        gsap.fromTo(
            { val: 0 },
            {
                val: 100,
                duration: 1.6,
                ease: 'power2.inOut',
                onUpdate: function () {
                    counter.textContent = String(Math.floor(this.targets()[0].val)).padStart(2, '0');
                }
            }
        );
    }
    initLoadingCounter();

    // --------------------------------------------------
    // V2: ヒーロープログレスライン（スクロール連動）
    // --------------------------------------------------
    function initHeroProgressLine() {
        const line = document.querySelector('.hero-progress-line');
        if (!line) return;
        gsap.fromTo(line,
            { scaleY: 0, transformOrigin: 'top center' },
            {
                scaleY: 1,
                scrollTrigger: {
                    trigger: '.first-view',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            }
        );
    }

    // --------------------------------------------------
    // V2: マグネットボタン
    // --------------------------------------------------
    function initMagneticButtons() {
        document.querySelectorAll('.contact-btn, .view-more-btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const nx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
                const ny = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
                gsap.to(btn, { x: nx * 8, y: ny * 5, duration: 0.4, ease: 'power2.out' });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1.2, 0.4)' });
            });
        });
    }

    // --------------------------------------------------
    // V2: オーブ視差
    // --------------------------------------------------
    function initOrbParallax() {
        document.querySelectorAll('.section-grad-orb').forEach(orb => {
            const section = orb.closest('.section');
            if (!section) return;
            gsap.to(orb, {
                y: '-20%',
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.5
                }
            });
        });
    }

    // --------------------------------------------------
    // V2: ページロード完了後のアニメーション強化
    // --------------------------------------------------
    function initV2Animations() {
        // プログレスライン
        initHeroProgressLine();

        // マグネットボタン
        initMagneticButtons();

        // オーブ視差
        initOrbParallax();

        // V2: ページラジアルオーバーレイをゴールドセクションで強調
        const overlay = document.querySelector('.page-radial-overlay');
        if (overlay) {
            ScrollTrigger.create({
                trigger: '.closing-message',
                start: 'top 55%',
                end: 'bottom 45%',
                onEnter:     () => gsap.to(overlay, { opacity: 3, duration: 0.75 }),
                onLeave:     () => gsap.to(overlay, { opacity: 1, duration: 0.75 }),
                onEnterBack: () => gsap.to(overlay, { opacity: 3, duration: 0.75 }),
                onLeaveBack: () => gsap.to(overlay, { opacity: 1, duration: 0.75 }),
            });
        }
    }

    // ローディング完了後に実行（既存の loadingTl.onComplete の後にフック）
    // MutationObserver で is-loaded クラスの付与を検知
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            if (m.type === 'attributes' && document.body.classList.contains('is-loaded')) {
                initV2Animations();
                observer.disconnect();
            }
        });
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // 既にローディング完了済みの場合
    if (document.body.classList.contains('is-loaded')) {
        initV2Animations();
    }
});

// V2: ヒーロー文字アニメーション強化（グローバルスコープの既存関数を拡張）
// startMainAnimations が呼ばれるタイミングで文字アニメをより立体的に
(function patchHeroAnimation() {
    const _originalStart = window._v2StartPatched;
    if (_originalStart) return;
    window._v2StartPatched = true;

    // DOMContentLoaded 後に既存の loadingTl の onComplete を強化するため
    // 文字アニメのCSS側でも --delay 変数を設定（JSの補助）
    document.addEventListener('DOMContentLoaded', () => {
        // char-inner に --delay 変数を設定
        document.querySelectorAll('.js-split-text').forEach(el => {
            let index = 0;
            el.querySelectorAll('.char-inner').forEach(inner => {
                inner.style.setProperty('--delay', `${index * 0.045}s`);
                index++;
            });
        });
    });
})();
