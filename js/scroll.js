/**
 * scroll.js — Nav hide/show + IntersectionObserver reveals
 *
 * Animations handled here:
 * 1. Nav: hides on scroll-down, reappears on scroll-up
 *    Tool: CSS transition on transform (already defined in style.css)
 *    Purpose: Spatial consistency (nav is always accessible but doesn't dominate)
 *
 * 2. Scroll reveals: .reveal-on-scroll elements get .is-visible via IntersectionObserver
 *    Purpose: Preventing jarring change (elements don't teleport into view)
 *
 * 3. How-it-works: scroll progress drives which step panel is active
 *    (only active on desktop — tablet/mobile show static layout)
 */

(function () {
  'use strict';

  /* -------------------------------------------------------
     1. NAV HIDE / SHOW ON SCROLL
     Duration: 250ms ease-drawer (defined in tokens.css)
     Transition set in style.css — JS only adds/removes class.
  ------------------------------------------------------- */

  const nav = document.getElementById('nav');
  if (!nav) return;

  let lastScrollY = 0;
  let ticking = false;

  function updateNav() {
    const currentScrollY = window.scrollY;

    if (currentScrollY < 80) {
      // Always show near the top
      nav.classList.remove('is-hidden');
    } else if (currentScrollY > lastScrollY + 5) {
      // Scrolling down — hide
      nav.classList.add('is-hidden');
    } else if (currentScrollY < lastScrollY - 5) {
      // Scrolling up — show
      nav.classList.remove('is-hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });


  /* -------------------------------------------------------
     2. SCROLL REVEALS
     IntersectionObserver: adds .is-visible when element enters viewport.
     The CSS transition handles the actual animation.
     Each element can have --reveal-delay inline style for stagger.
  ------------------------------------------------------- */

  const revealEls = document.querySelectorAll('.reveal-on-scroll');

  if (revealEls.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Once revealed, stop observing — animation doesn't repeat
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: show everything immediately (no IntersectionObserver support)
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }


  /* -------------------------------------------------------
     3. HOW IT WORKS — Sticky scroll step switcher
     Only active on desktop (>= 901px).
     Reads scroll position within the how__scroll-driver element
     and maps it to the 3 step panels.
  ------------------------------------------------------- */

  const howSection = document.getElementById('how');
  const howScrollDriver = document.getElementById('how-scroll-driver');
  const howStepNavItems = document.querySelectorAll('.how__step-nav-item');
  const howSteps = document.querySelectorAll('.how-step');

  if (howSection && howScrollDriver && howSteps.length > 0) {

    let howTicking = false;

    function updateHowSection() {
      // Only run sticky behavior on desktop
      if (window.innerWidth <= 900) {
        // On mobile/tablet, all steps are visible statically
        howSteps.forEach((step) => {
          step.classList.add('active');
          step.classList.remove('past');
        });
        howTicking = false;
        return;
      }

      const driverRect = howScrollDriver.getBoundingClientRect();
      const driverHeight = howScrollDriver.offsetHeight;
      const viewH = window.innerHeight;

      // Progress 0 → 1 through the scroll driver
      // 0 = driver top just entered viewport, 1 = driver bottom at viewport bottom
      const progress = Math.max(0, Math.min(1,
        -driverRect.top / (driverHeight - viewH)
      ));

      // Map progress to step index 0, 1, 2
      const totalSteps = howSteps.length;
      const rawIndex = progress * totalSteps;
      const activeIndex = Math.min(totalSteps - 1, Math.floor(rawIndex));

      howSteps.forEach((step, i) => {
        step.classList.toggle('active', i === activeIndex);
        step.classList.toggle('past', i < activeIndex);
      });

      howStepNavItems.forEach((item, i) => {
        item.classList.toggle('active', i === activeIndex);
        item.classList.toggle('past', i < activeIndex);
      });

      howTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!howTicking) {
        requestAnimationFrame(updateHowSection);
        howTicking = true;
      }
    }, { passive: true });

    // Initialize on load
    updateHowSection();
  }

})();
