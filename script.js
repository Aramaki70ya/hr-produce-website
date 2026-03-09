// GSAPのプラグイン登録
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------
    // Loading Animation
    // --------------------------------------------------
    const loadingTl = gsap.timeline({
        onComplete: () => {
            document.body.classList.add('is-loaded');
            document.body.classList.remove('is-loading');
            startMainAnimations();
        }
    });

    loadingTl
        .to('.loading-logo', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
        .to('.loading-bar', { width: '100%', duration: 0.8, ease: 'power2.inOut' }, '-=0.4')
        .to('.loading-screen', { opacity: 0, duration: 0.8, ease: 'power2.inOut', delay: 0.4 });


    // --------------------------------------------------
    // Header Control
    // --------------------------------------------------
    const header = document.querySelector('.header');
    const megaMenuOverlay = document.querySelector('.mega-menu-overlay');
    const navItems = document.querySelectorAll('.nav-item.has-mega-menu');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    });

    // --------------------------------------------------
    // Mega Menu Control
    // --------------------------------------------------
    let currentMegaMenu = null;
    let currentNavItem = null;
    let megaMenuTl = null;
    let closeTimer = null;

    // ヘッダー全体からマウスが離れたら閉じる（確実なクローズ処理）
    header.addEventListener('mouseleave', () => {
        closeTimer = setTimeout(() => {
            closeMegaMenu();
        }, 100);
    });
    
    // ヘッダーにマウスが入ったら（戻ってきたら）閉じるのをキャンセル
    header.addEventListener('mouseenter', () => {
        if (closeTimer) {
            clearTimeout(closeTimer);
            closeTimer = null;
        }
    });

    navItems.forEach(navItem => {
        const megaMenu = navItem.querySelector('.mega-menu');
        const megaMenuLinks = megaMenu.querySelectorAll('.mega-menu-links li');
        
        // メニュー表示（ナビゲーション項目にマウスが入った時）
        navItem.addEventListener('mouseenter', () => {
            // 既存のタイマーをクリア
            if (closeTimer) {
                clearTimeout(closeTimer);
                closeTimer = null;
            }
            
            // 他のメニューが開いていたら閉じる
            if (currentMegaMenu && currentMegaMenu !== megaMenu) {
                // 即座に閉じて新しいのを開くために、アニメーションなしでリセットするか、
                // あるいはcloseMegaMenuを呼ぶが、ここではシンプルに切り替える
                const prevMenu = currentMegaMenu;
                const prevNavItem = currentNavItem;
                
                // 前のメニューを閉じるアニメーション（高速）
                const prevLinks = prevMenu.querySelectorAll('.mega-menu-links li');
                gsap.to(prevLinks, { opacity: 0, duration: 0.1 });
                gsap.to(prevMenu, { opacity: 0, visibility: 'hidden', duration: 0.1 });
                if (prevNavItem) prevNavItem.classList.remove('is-active');
            }
            
            // 少し遅延させて開く（誤操作防止）
            setTimeout(() => {
                // マウスがまだ乗っているか確認
                if (navItem.matches(':hover') || megaMenu.matches(':hover')) {
                    openMegaMenu(navItem, megaMenu, megaMenuLinks);
                }
            }, 50);
        });

        // navItemからのmouseleaveは、headerのmouseleaveでカバーできるが、
        // 隣のnavItem（メガメニューなし）に移動した場合などのために残す
        navItem.addEventListener('mouseleave', (e) => {
             // 何もしない（headerのmouseleaveと、他のnavItemのmouseenterに任せる）
        });
    });

    // オーバーレイクリックで閉じる
    if (megaMenuOverlay) {
        megaMenuOverlay.addEventListener('click', () => {
            closeMegaMenu();
        });
    }

    // メガメニューを開く関数
    function openMegaMenu(navItem, megaMenu, megaMenuLinks) {
        currentMegaMenu = megaMenu;
        currentNavItem = navItem;
        navItem.classList.add('is-active');
        header.classList.add('has-mega-menu-open');
        
        // メガメニューアニメーション
        if (megaMenuTl) {
            megaMenuTl.kill();
        }
        
        megaMenuTl = gsap.timeline();
        
        // オーバーレイのアニメーション
        if (megaMenuOverlay) {
            gsap.to(megaMenuOverlay, {
                opacity: 1,
                visibility: 'visible',
                duration: 0.4,
                ease: 'power2.out'
            });
        }
        
        megaMenuTl
            .set(megaMenu, { y: -20, opacity: 0, visibility: 'hidden' }) // 初期状態を強制セット
            .set(megaMenuLinks, { opacity: 0, y: 10 })
            .to(megaMenu, {
                opacity: 1,
                visibility: 'visible',
                y: 0,
                duration: 0.4,
                ease: 'power3.out' // より滑らかなイージングに変更
            })
            .to(megaMenuLinks, {
                opacity: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.08, // 遅延を少し増やす
                ease: 'power2.out'
            }, '-=0.2'); // 少し早めに開始
    }

    // メガメニューを閉じる関数
    function closeMegaMenu() {
        if (closeTimer) {
            clearTimeout(closeTimer);
            closeTimer = null;
        }
        
        if (currentMegaMenu) {
            const megaMenuLinks = currentMegaMenu.querySelectorAll('.mega-menu-links li');
            const menuToClose = currentMegaMenu;
            const navItemToClose = currentNavItem;
            
            if (megaMenuTl) {
                megaMenuTl.kill();
            }
            
            // オーバーレイのアニメーション
            if (megaMenuOverlay) {
                gsap.to(megaMenuOverlay, {
                    opacity: 0,
                    visibility: 'hidden',
                    duration: 0.3,
                    ease: 'power2.in'
                });
            }
            
            gsap.to(megaMenuLinks, {
                opacity: 0,
                y: 10,
                duration: 0.2,
                stagger: 0.02,
                ease: 'power2.in'
            });
            
            gsap.to(menuToClose, {
                opacity: 0,
                visibility: 'hidden',
                y: -15, // 少し上に吸い込まれるように
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    if (navItemToClose) {
                        navItemToClose.classList.remove('is-active');
                    }
                    header.classList.remove('has-mega-menu-open');
                    // リンクの状態をリセット
                    const links = menuToClose.querySelectorAll('.mega-menu-links li');
                    gsap.set(links, { opacity: 0, y: 10 });
                    currentMegaMenu = null;
                    currentNavItem = null;
                    megaMenuTl = null;
                }
            });
        }
    }

    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
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
    function startMainAnimations() {
        // First View Text
        gsap.fromTo('.main-catch', 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 }
        );

        gsap.fromTo('.sub-catch', 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.4 }
        );

        // Scroll Triggers for Sections (Fade Up)
        const fadeUpElements = document.querySelectorAll('.js-fade-up');

        fadeUpElements.forEach(el => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%', // 少し早めに表示開始
                    toggleActions: 'play none none reverse'
                },
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out'
            });
        });

        // Marquee Section (Fade In only, animation is CSS)
        // CSS animation runs automatically, just fade in the container
        
        // Point List Stagger
        const points = document.querySelectorAll('.point-list li');
        if (points.length > 0) {
            gsap.fromTo(points,
                { opacity: 0, x: -20 },
                {
                    scrollTrigger: {
                        trigger: '.highlight-section',
                        start: 'top 75%',
                    },
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: 'power3.out'
                }
            );
        }

        // Company MVV Stagger
        const mvvCards = document.querySelectorAll('.mvv-card');
        if (mvvCards.length > 0) {
            gsap.fromTo(mvvCards,
                { opacity: 0, scale: 0.95 },
                {
                    scrollTrigger: {
                        trigger: '.mvv-section',
                        start: 'top 75%',
                    },
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power2.out'
                }
            );
        }

        // --------------------------------------------------
        // Parallax Background Text
        // --------------------------------------------------
        const bgTexts = document.querySelectorAll('.section-bg-text');
        bgTexts.forEach(bgText => {
            const section = bgText.closest('.section');
            
            gsap.to(bgText, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.5, // スクロールに連動して滑らかに動く
                },
                y: (i, el) => {
                    // スクロール方向に逆方向に動かしてパララックス効果
                    return window.innerHeight * 0.3;
                },
                ease: 'none'
            });
        });

        // --------------------------------------------------
        // Enhanced Scroll Animations
        // --------------------------------------------------
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach((card, index) => {
            gsap.fromTo(card,
                { opacity: 0, y: 50, scale: 0.95 },
                {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    },
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    delay: index * 0.05,
                    ease: 'power3.out'
                }
            );
        });

        // Contact Buttons Animation
        const contactButtons = document.querySelectorAll('.contact-btn');
        contactButtons.forEach((btn, index) => {
            gsap.fromTo(btn,
                { opacity: 0, x: -30 },
                {
                    scrollTrigger: {
                        trigger: btn,
                        start: 'top 85%',
                    },
                    opacity: 1,
                    x: 0,
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: 'power2.out'
                }
            );
        });
    }
    
    // Smooth Scroll for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                const headerHeight = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // テーマ切替（白メイン / 黄メイン）
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            document.body.setAttribute('data-theme', theme);
            document.querySelectorAll('.theme-toggle-btn').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
        });
    });
    // 初期状態で現在のテーマに合わせて is-active を付与
    const currentTheme = document.body.getAttribute('data-theme') || 'white';
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        if (btn.getAttribute('data-theme') === currentTheme) btn.classList.add('is-active');
    });
});
