/**
 * counters.js — WAAPI number ticker animations
 *
 * Animation frequency: Rare / once (triggers when section scrolls into view)
 * Purpose: Explanation — makes the numbers feel computed, not static
 * Tool: WAAPI element.animate() — programmatic control with CSS performance
 *       (hardware-accelerated, stays smooth while page is loading other things)
 * Properties: textContent change (no transform/opacity — the number is the content)
 *
 * Emil note: font-variant-numeric: tabular-nums is set in animations.css
 * so digits don't cause layout shift as numbers change.
 */

(function () {
  'use strict';

  /**
   * Animate a counter from 0 to targetValue over duration ms.
   * Uses requestAnimationFrame for smooth JS-driven number updates.
   * easing: ease-out feel (quadratic out)
   *
   * @param {HTMLElement} el — the element whose textContent changes
   * @param {number} targetValue — the final number to count to
   * @param {number} duration — animation duration in ms
   * @param {string} prefix — text before the number (e.g. '<')
   * @param {string} suffix — text after the number (e.g. 's' or '+')
   * @param {boolean} useDecimal — show one decimal place
   */
  function animateCounter(el, targetValue, duration, prefix, suffix, useDecimal) {
    const start = performance.now();

    function easeOut(t) {
      // Quadratic ease-out — starts fast, slows to final value
      return 1 - Math.pow(1 - t, 3);
    }

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);
      const currentValue = easedProgress * targetValue;

      let display;
      if (useDecimal) {
        display = currentValue.toFixed(1);
      } else {
        display = Math.round(currentValue).toLocaleString('en-IN');
      }

      el.textContent = (prefix || '') + display + (suffix || '');

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  // Find all counter elements
  const counterEls = document.querySelectorAll('[data-counter]');
  if (counterEls.length === 0) return;

  // Only animate when the numbers section enters the viewport
  if (!('IntersectionObserver' in window)) {
    // Fallback: show final values immediately
    counterEls.forEach((el) => {
      el.textContent = el.dataset.finalText || el.dataset.counter;
    });
    return;
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const targetValue = parseFloat(el.dataset.counter);
        const duration = parseInt(el.dataset.duration || '1200', 10);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const useDecimal = el.dataset.decimal === 'true';

        animateCounter(el, targetValue, duration, prefix, suffix, useDecimal);

        // Fire once only
        counterObserver.unobserve(el);
      });
    },
    {
      threshold: 0.5,
    }
  );

  counterEls.forEach((el) => counterObserver.observe(el));

})();
