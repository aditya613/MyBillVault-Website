/**
 * waitlist.js — Email capture, validation, and success state
 *
 * Handles both forms: hero form and final CTA form.
 * Success state uses CSS animation: success-arrive (defined in animations.css)
 * Purpose: State indication + delight (rare first-time action)
 * Stores emails to localStorage for now — easy to swap for a real API.
 */

(function () {
  'use strict';

  // Email regex — standard, not overly strict
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Get or initialize the waitlist array in localStorage.
   */
  function getWaitlist() {
    try {
      return JSON.parse(localStorage.getItem('mbv_waitlist') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Save an email to localStorage.
   * Returns false if already registered.
   */
  function saveEmail(email) {
    const list = getWaitlist();
    const normalized = email.trim().toLowerCase();
    if (list.includes(normalized)) return false;
    list.push(normalized);
    localStorage.setItem('mbv_waitlist', JSON.stringify(list));
    return true;
  }

  /**
   * Count of people on the waitlist (localStorage + seeded base count)
   * The base is 2400 — the page shows this as social proof.
   */
  function getCount() {
    return 2400 + getWaitlist().length;
  }

  /**
   * Wire up a single form: input, button, error el, success el.
   */
  function wireForm(config) {
    const { formId, inputId, btnId, errorId, successId, countEl } = config;

    const form = document.getElementById(formId);
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const errorEl = document.getElementById(errorId);
    const successEl = document.getElementById(successId);

    if (!form || !input || !btn) return;

    function showError(msg) {
      if (!errorEl) return;
      errorEl.textContent = msg;
      errorEl.classList.add('is-visible');
      // Shake the input — visual feedback
      input.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-6px)' },
          { transform: 'translateX(6px)' },
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(4px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 320, easing: 'ease-out' }
      );
    }

    function clearError() {
      if (!errorEl) return;
      errorEl.textContent = '';
      errorEl.classList.remove('is-visible');
    }

    function showSuccess(email) {
      // Hide the form fields
      const inputWrap = form.querySelector('.hero__input-wrap, .final-cta__form-fields');
      if (inputWrap) inputWrap.style.display = 'none';
      btn.style.display = 'none';
      if (input.parentElement !== form) input.parentElement.style.display = 'none';

      // Show success panel
      if (successEl) {
        successEl.classList.add('is-visible');
      }

      // Update trust counter on hero if present
      if (countEl) {
        const countDisplay = document.getElementById(countEl);
        if (countDisplay) {
          countDisplay.textContent = getCount().toLocaleString('en-IN') + '+';
        }
      }
    }

    input.addEventListener('input', clearError);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearError();

      const email = input.value.trim();

      if (!email) {
        showError('Please enter your email address.');
        input.focus();
        return;
      }

      if (!EMAIL_RE.test(email)) {
        showError('Please enter a valid email address.');
        input.focus();
        return;
      }

      // Simulate a brief "saving" moment on the button
      btn.textContent = 'Saving…';
      btn.disabled = true;

      setTimeout(() => {
        const isNew = saveEmail(email);

        if (isNew) {
          showSuccess(email);
        } else {
          // Already on the list — still a positive state
          showSuccess(email);
        }
      }, 400);
    });
  }

  // Wire hero form
  wireForm({
    formId: 'hero-form',
    inputId: 'hero-email',
    btnId: 'hero-submit',
    errorId: 'hero-error',
    successId: 'hero-form-success',
    countEl: 'trust-count',
  });

  // Wire final CTA form
  wireForm({
    formId: 'final-form',
    inputId: 'final-email',
    btnId: 'final-submit',
    errorId: 'final-error',
    successId: 'final-form-success',
    countEl: null,
  });

  // Update trust count on page load
  const trustCountEl = document.getElementById('trust-count');
  if (trustCountEl) {
    trustCountEl.textContent = getCount().toLocaleString('en-IN') + '+';
  }

})();
