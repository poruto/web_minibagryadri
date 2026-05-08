(() => {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* =============================================
       Header — scroll state + scroll progress
       ============================================= */
    const header = document.querySelector('.header');
    if (header) {
        let ticking = false;
        let scrolled = false;

        const onScroll = () => {
            const y = window.scrollY;
            const next = y > 24;
            if (next !== scrolled) {
                header.classList.toggle('scrolled', next);
                scrolled = next;
            }
            const max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
            const pct = Math.min(100, Math.max(0, (y / max) * 100));
            header.style.setProperty('--scroll-progress', pct.toFixed(2) + '%');
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(onScroll);
                ticking = true;
            }
        }, { passive: true });

        window.addEventListener('resize', onScroll, { passive: true });
        onScroll();
    }

    /* =============================================
       Mobile menu drawer
       ============================================= */
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primary-nav');
    const overlay = document.querySelector('.nav-overlay');

    const setMenu = (open) => {
        if (!navToggle || !nav) return;
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
        nav.classList.toggle('open', open);
        if (overlay) overlay.classList.toggle('open', open);
        document.body.classList.toggle('menu-open', open);
    };

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
            setMenu(!isOpen);
        });
        if (overlay) overlay.addEventListener('click', () => setMenu(false));
        nav.addEventListener('click', (e) => {
            if (e.target.closest('a')) setMenu(false);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false);
        });
    }

    /* =============================================
       Smooth scroll (delegated)
       ============================================= */
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href.length < 2) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({
            behavior: reducedMotion ? 'auto' : 'smooth',
            block: 'start'
        });
    });

    /* =============================================
       IntersectionObserver — reveal-on-scroll
       ============================================= */
    const fadeEls = document.querySelectorAll('.fade-in-up');
    if ('IntersectionObserver' in window && fadeEls.length) {
        const io = new IntersectionObserver((entries, obs) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            }
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        fadeEls.forEach((el) => io.observe(el));
    } else {
        fadeEls.forEach((el) => el.classList.add('visible'));
    }

    /* =============================================
       Lightbox gallery
       ============================================= */
    const lightbox = document.getElementById('lightbox');
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    if (lightbox && galleryItems.length) {
        const imgEl = lightbox.querySelector('.lightbox-img');
        const captionEl = lightbox.querySelector('.lightbox-caption');
        const counterEl = lightbox.querySelector('.lightbox-counter');
        const btnClose = lightbox.querySelector('.lightbox-close');
        const btnPrev = lightbox.querySelector('.lightbox-prev');
        const btnNext = lightbox.querySelector('.lightbox-next');

        let idx = 0;

        const supportsWebp = (() => {
            try {
                const c = document.createElement('canvas');
                return c.toDataURL('image/webp').indexOf('data:image/webp') === 0;
            } catch (e) { return false; }
        })();

        const setItem = (i) => {
            idx = ((i % galleryItems.length) + galleryItems.length) % galleryItems.length;
            const item = galleryItems[idx];
            const webpSrc = item.getAttribute('data-full');
            const fallbackSrc = item.getAttribute('data-fallback');
            const caption = item.getAttribute('data-caption') || '';
            const innerImg = item.querySelector('img');
            imgEl.src = (supportsWebp && webpSrc) ? webpSrc : (fallbackSrc || webpSrc || (innerImg && innerImg.src) || '');
            imgEl.alt = caption || (innerImg && innerImg.alt) || '';
            if (captionEl) captionEl.textContent = caption;
            if (counterEl) counterEl.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(galleryItems.length).padStart(2, '0');
            // Re-trigger image-in animation
            imgEl.style.animation = 'none';
            // eslint-disable-next-line no-unused-expressions
            imgEl.offsetHeight;
            imgEl.style.animation = '';
        };

        const openLightbox = (i) => {
            setItem(i);
            if (typeof lightbox.showModal === 'function') {
                lightbox.showModal();
            } else {
                lightbox.setAttribute('open', '');
            }
            document.body.classList.add('lightbox-open');
        };

        const closeLightbox = () => {
            if (typeof lightbox.close === 'function' && lightbox.open) {
                lightbox.close();
            } else {
                lightbox.removeAttribute('open');
            }
            document.body.classList.remove('lightbox-open');
        };

        galleryItems.forEach((el, i) => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                openLightbox(i);
            });
        });

        btnClose && btnClose.addEventListener('click', closeLightbox);
        btnPrev && btnPrev.addEventListener('click', () => setItem(idx - 1));
        btnNext && btnNext.addEventListener('click', () => setItem(idx + 1));

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        lightbox.addEventListener('close', () => {
            document.body.classList.remove('lightbox-open');
        });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.open) return;
            if (e.key === 'ArrowLeft') { e.preventDefault(); setItem(idx - 1); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); setItem(idx + 1); }
        });

        // Touch swipe
        let touchStartX = 0;
        let touchStartY = 0;
        lightbox.addEventListener('touchstart', (e) => {
            if (!e.touches[0]) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        lightbox.addEventListener('touchend', (e) => {
            const t = e.changedTouches[0];
            if (!t) return;
            const dx = t.clientX - touchStartX;
            const dy = t.clientY - touchStartY;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) setItem(idx - 1);
                else setItem(idx + 1);
            }
        }, { passive: true });
    }
})();
