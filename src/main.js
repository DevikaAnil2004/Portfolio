import './style.css'

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Theme Management (Light / Dark) ────────────────────────
  const themeToggle = document.getElementById('themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('devika_theme');

  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (prefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('devika_theme', newTheme);
    });
  }

  // ── 2. Cursor Glow (Desktop Only) ─────────────────────────────
  const glow = document.getElementById('cursorGlow');
  if (glow && window.matchMedia('(pointer: fine)').matches) {
    let mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    });

    function lerp() {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      glow.style.left = `${cx}px`;
      glow.style.top = `${cy}px`;
      requestAnimationFrame(lerp);
    }
    requestAnimationFrame(lerp);
  }

  // ── 3. Scroll Progress Bar ────────────────────────────────────
  const progressBar = document.getElementById('scrollProgress');
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = `${progress}%`;
  }

  // ── 4. Navbar Shrink on Scroll ────────────────────────────────
  const topbar = document.querySelector('.topbar');
  function updateNavbar() {
    if (topbar) {
      topbar.classList.toggle('scrolled', window.scrollY > 50);
    }
  }

  // ── 5. Back to Top Button ─────────────────────────────────────
  const backToTop = document.getElementById('backToTop');
  function updateBackToTop() {
    if (backToTop) {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Unified rAF scroll listener
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        updateNavbar();
        updateBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  });

  // ── 6. Mobile Menu Drawer ─────────────────────────────────────
  const menuBtn = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && !menuBtn.contains(e.target) && nav.classList.contains('open')) {
        nav.classList.remove('open');
      }
    });
  }

  // ── 7. Smooth Scroll with Offset ──────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = 84;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ── 8. Scroll Reveal Animations ───────────────────────────────
  const reveals = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  reveals.forEach(el => revealObserver.observe(el));

  // ── 9. Animated Counting for Stats ────────────────────────────
  const statNumbers = document.querySelectorAll('[data-count]');
  let statsCounted = false;

  const statsObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsCounted) {
          statsCounted = true;
          statNumbers.forEach(el => {
            const target = parseInt(el.getAttribute('data-count'), 10);
            animateCount(el, 0, target, 1200);
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  const statsRow = document.querySelector('.hero-stats-row');
  if (statsRow) statsObserver.observe(statsRow);

  function animateCount(el, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease out
      const current = Math.round(start + range * eased);
      el.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = end;
      }
    }
    requestAnimationFrame(step);
  }

  // ── 10. Subtle 3D Card Tilt Effect (Desktop) ──────────────────
  if (window.matchMedia('(pointer: fine)').matches) {
    const interactiveCards = document.querySelectorAll('.portrait-card, .stat-card, .exp-card-modern, .project-card');
    interactiveCards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ── 11. Active Nav Link Highlighting ──────────────────────────
  const trackedSections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.topbar-nav a');

  const navObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    },
    { threshold: 0.25 }
  );

  trackedSections.forEach(s => navObserver.observe(s));

});
