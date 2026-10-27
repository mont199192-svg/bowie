(() => {
  'use strict';
  const root = document.documentElement;
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('article-navigation');
  if (toggle && menu) {
    const mobile = window.matchMedia('(max-width: 800px)');
    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
    const setOpen = (open, returnFocus = false) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      menu.classList.toggle('is-open', open);
      if (returnFocus) toggle.focus();
    };
    toggle.addEventListener('click', () => setOpen(!isOpen()));
    menu.addEventListener('click', event => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', event => {
      if (isOpen() && !event.target.closest('.topbar-inner')) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (!isOpen() || !mobile.matches) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false, true);
      }
      if (event.key === 'Tab') {
        const links = [...menu.querySelectorAll('a[href]')];
        const first = links[0];
        const last = links[links.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === toggle) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          toggle.focus();
        } else if (!event.shiftKey && document.activeElement === toggle) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          toggle.focus();
        }
      }
    });
    mobile.addEventListener('change', () => setOpen(false));
  }
  root.classList.add('article-js');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const images = document.querySelectorAll('.article-copy figure img, .video-card img');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px 40px 0px', threshold: 0.03 });
  images.forEach(img => {
    img.classList.add('image-reveal');
    observer.observe(img);
  });
})();
