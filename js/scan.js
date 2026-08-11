/**
 * scan.js — Receipt scan animation orchestration
 *
 * Animation frequency: Rare / first-time (plays once on load)
 * Purpose: Explanation — demonstrates the core product mechanic in ~3.5s
 * Tool: CSS @keyframes (off main thread, smooth while page loads)
 * Properties: clip-path for beam, opacity + translateY for fields,
 *             scale for lock icon
 *
 * This file only adds the .scanning class to trigger CSS animations.
 * All timing lives in CSS — this JS is purely orchestration glue.
 */

(function () {
  'use strict';

  const card = document.getElementById('receipt-card');
  if (!card) return;

  /**
   * Start the scan animation sequence.
   * Called once — on DOMContentLoaded, with a small delay to let
   * the page paint first (so the animation is the user's first moment,
   * not something that starts before they see it).
   */
  function startScan() {
    // Slight delay so the hero is fully painted before motion begins
    setTimeout(() => {
      card.classList.add('scanning');

      // After the scan + lock animation completes, move to .scan-done
      // This keeps all field values visible without relying on animation-fill-mode: forwards
      // on every element (which can cause stacking context issues).
      // Total animation time: 3.5s (scan 2.8s) + 0.5s (lock) + 0.3s buffer
      setTimeout(() => {
        card.classList.remove('scanning');
        card.classList.add('scan-done');
        card.classList.add('sealed');
      }, 3800);

    }, 600);
  }

  // Start after fonts are loaded for correct layout
  if (document.readyState === 'complete') {
    startScan();
  } else {
    window.addEventListener('load', startScan, { once: true });
  }

})();
