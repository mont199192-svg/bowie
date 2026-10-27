(() => {
  'use strict';
  const root = document.documentElement;
  const header = document.querySelector('[data-site-header]');
  const menuButton = document.querySelector('.menu-toggle');
  const navPanel = document.querySelector('.nav-panel');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animationAvailable = Boolean(window.gsap && window.ScrollTrigger);
  if (!animationAvailable) root.classList.add('motion-unavailable');
  let copyReset;

  const setMenu = (open, returnFocus = false) => {
    if (!menuButton || !navPanel) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navPanel.classList.toggle('is-open', open);
    header?.classList.toggle('is-open', open);
    if (returnFocus) menuButton.focus();
  };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  navPanel?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    if (event.key !== 'Tab' || menuButton?.getAttribute('aria-expanded') !== 'true') return;
    const targets = [menuButton, ...Array.from(navPanel.querySelectorAll('a, button:not([disabled])'))];
    const first = targets[0];
    const last = targets[targets.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.addEventListener('click', (event) => {
    if (menuButton?.getAttribute('aria-expanded') === 'true' && !header.contains(event.target)) setMenu(false);
  });
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', () => { if (window.innerWidth > 1100) setMenu(false); }, { passive: true });

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-22% 0px -68% 0px', threshold: 0 });
    navLinks.forEach((link) => {
      const section = document.querySelector(link.getAttribute('href'));
      if (section) navObserver.observe(section);
    });
  }

  const copyStatus = document.querySelector('#copy-status');
  const copyText = async (value) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const previousFocus = document.activeElement;
    const helper = document.createElement('textarea');
    helper.value = value;
    helper.setAttribute('readonly', '');
    helper.setAttribute('aria-label', 'Contract address to copy');
    helper.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(helper);
    helper.select();
    let copied = false;
    try { copied = document.execCommand('copy'); }
    finally { helper.remove(); previousFocus?.focus({ preventScroll: true }); }
    if (!copied) throw new Error('Copy failed');
  };
  document.querySelectorAll('[data-copy-target]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;
      clearTimeout(copyReset);
      const label = button.querySelector('[data-copy-label]') || button;
      const original = label.dataset.original || label.textContent;
      label.dataset.original = original;
      try {
        await copyText(target.textContent.trim());
        label.textContent = 'Copied';
        if (copyStatus) copyStatus.textContent = 'Contract address copied.';
      } catch {
        label.textContent = 'Copy failed';
        if (copyStatus) copyStatus.textContent = 'Could not copy. Select the address to copy it manually.';
      }
      copyReset = window.setTimeout(() => {
        document.querySelectorAll('[data-copy-label]').forEach((item) => { if (item.dataset.original) item.textContent = item.dataset.original; });
        if (copyStatus) copyStatus.textContent = '';
      }, 4000);
    });
  });

  const accordion = document.querySelector('[data-buy-accordion]');
  const steps = accordion ? Array.from(accordion.querySelectorAll('.buy-step')) : [];
  const triggers = steps.map((step) => step.querySelector('.step-trigger'));
  const activateStep = (index, focus = false) => {
    steps.forEach((step, i) => {
      const active = !animationAvailable || index === i;
      step.classList.toggle('is-active', active);
      triggers[i]?.setAttribute('aria-expanded', String(active));
      const panel = step.querySelector('.step-body');
      if (panel) panel.inert = !active;
    });
    if (focus) triggers[index]?.focus();
  };
  triggers.forEach((trigger, index) => {
    trigger?.addEventListener('click', () => activateStep(index));
    trigger?.addEventListener('keydown', (event) => {
      let next;
      if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % triggers.length;
      if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + triggers.length) % triggers.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = triggers.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      activateStep(next, true);
    });
  });
  if (steps.length) activateStep(0);

  const setPageVisibility = () => document.body.classList.toggle('is-page-hidden', document.hidden);
  setPageVisibility();
  document.addEventListener('visibilitychange', setPageVisibility);
  const marquee = document.querySelector('.marquee');
  if (marquee && 'IntersectionObserver' in window) {
    const marqueeObserver = new IntersectionObserver(([entry]) => marquee.classList.toggle('is-outside', !entry.isIntersecting), { rootMargin: '80px' });
    marqueeObserver.observe(marquee);
  }

  if (!animationAvailable) return;
  gsap.registerPlugin(ScrollTrigger);
  const motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from('.hero-title > span', { y: 36, opacity: 0, stagger: .13, duration: 1.15, ease: 'power3.out' });
    gsap.from('.hero-intro, .hero-actions', { y: 25, opacity: 0, stagger: .12, duration: 1, delay: .28, ease: 'power3.out' });
    gsap.fromTo('.hero-backdrop img', { scale: 1.03 }, { scale: 1.015, duration: 2.4, ease: 'power2.out' });
    gsap.utils.toArray('.story-heading, .route-node, .rewards-head, .reward-stat, .buy-head').forEach((item) => {
      gsap.from(item, { y: 30, opacity: 0, duration: .85, ease: 'power2.out', scrollTrigger: { trigger: item, start: 'top 92%', once: true } });
    });
    gsap.utils.toArray('.reward-value').forEach((item) => {
      gsap.from(item, { y: 28, opacity: 0, duration: 1.05, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 92%', once: true } });
    });
    gsap.fromTo('.community-image', { scale: 1.1 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.community-stage', start: 'top bottom', end: 'bottom top', scrub: 1.1 } });
    gsap.from('.community-copy > *', { y: 25, opacity: 0, duration: .9, stagger: .12, ease: 'power2.out', scrollTrigger: { trigger: '.community-copy', start: 'top 85%', once: true } });

    const loops = [];
    const hero = document.querySelector('.hero');
    const backdrop = document.querySelector('.hero-backdrop img');
    const orbit = document.querySelector('.hero-orbit');
    if (orbit) loops.push(gsap.to(orbit, { rotation: -8, y: 10, duration: 22, ease: 'sine.inOut', repeat: -1, yoyo: true }));
    let heroVisible = true;
    const updateLoops = () => loops.forEach((loop) => { if (document.hidden || !heroVisible) loop.pause(); else loop.resume(); });
    const visibilityHandler = () => updateLoops();
    document.addEventListener('visibilitychange', visibilityHandler);
    let heroObserver;
    if (hero && 'IntersectionObserver' in window) {
      heroObserver = new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; updateLoops(); hero.classList.toggle('is-outside', !entry.isIntersecting); }, { rootMargin: '80px' });
      heroObserver.observe(hero);
    }
    if (hero && backdrop) gsap.to(backdrop, { yPercent: 5, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.4 } });
    return () => {
      loops.forEach((loop) => loop.kill());
      heroObserver?.disconnect();
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  });

  motion.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    const loreRoute = document.querySelector('.lore-route');
    if (loreRoute) gsap.fromTo(loreRoute, { '--route-progress': 0 }, { '--route-progress': 1, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top 70%', endTrigger: '.story-cinema', end: 'bottom bottom', scrub: .8 } });
    const cinema = document.querySelector('.story-cinema');
    const pin = document.querySelector('.story-pin');
    const scenes = gsap.utils.toArray('.story-scene');
    const chapters = Array.from(document.querySelectorAll('.story-chapters li'));
    if (!cinema || !pin || !scenes.length) return;
    const durationSum = scenes.reduce((sum, scene) => sum + (Number(scene.dataset.storyDuration) || 1), 0);
    let cursor = 0;
    const stages = scenes.map((scene) => {
      const duration = (Number(scene.dataset.storyDuration) || 1) / durationSum;
      const stage = { scene, key: scene.dataset.storyChapter, start: cursor, duration, end: cursor + duration };
      cursor = stage.end;
      return stage;
    });
    const setChapter = (key) => {
      chapters.forEach((item) => item.classList.toggle('is-active', item.dataset.storyChapter === key));
      stages.forEach(({ scene, key: sceneKey }) => {
        const active = sceneKey === key;
        if (active) scene.removeAttribute('aria-hidden');
        else scene.setAttribute('aria-hidden', 'true');
        scene.inert = !active;
      });
    };
    const stageAt = (progress) => stages.find((stage) => progress < stage.end - .0001) || stages[stages.length - 1];
    gsap.set(scenes, { autoAlpha: 0 });
    gsap.set(scenes[0], { autoAlpha: 1 });
    cinema.classList.add('has-story-motion');
    const timeline = gsap.timeline({ onUpdate() { setChapter(stageAt(this.progress()).key); }, scrollTrigger: {
      id: 'bowie-story',
      trigger: cinema,
      start: 'top top+=86',
      end: () => `+=${window.innerHeight * 3}`,
      pin,
      pinSpacing: true,
      scrub: .7,
      anticipatePin: 1,
      invalidateOnRefresh: true
    } });
    // One normalized timeline retains the intended 20 / 40 / 20 / 20 story rhythm.
    timeline.to({}, { duration: 1 }, 0);
    stages.forEach((stage, index) => {
      timeline.addLabel(stage.key, stage.start);
      const transition = Math.min(.045, stage.duration * .24);
      if (index) timeline.fromTo(stage.scene, { autoAlpha: 0 }, { autoAlpha: 1, duration: transition, ease: 'none' }, stage.start - transition / 2);
      if (index < stages.length - 1) timeline.to(stage.scene, { autoAlpha: 0, duration: transition, ease: 'none' }, stage.end - transition / 2);
      const image = stage.scene.querySelector('.scene-image > img');
      if (image) timeline.fromTo(image, { scale: 1.015 }, { scale: stage.key === 'launch' ? 1.055 : 1.085, duration: stage.duration, ease: 'none' }, stage.start);
    });
    const launch = stages.find((stage) => stage.key === 'launch');
    if (launch) {
      const vehicle = launch.scene.querySelector('.launch-vehicle');
      const engine = launch.scene.querySelector('.launch-engine');
      const smoke = gsap.utils.toArray(launch.scene.querySelectorAll('.launch-smoke'));
      const halo = launch.scene.querySelector('.launch-halo');
      const at = (fraction) => launch.start + launch.duration * fraction;
      timeline.fromTo(engine, { scaleY: .08, opacity: 0 }, { scaleY: .58, opacity: .95, duration: launch.duration * .15, ease: 'power2.in' }, at(.04))
        .to(engine, { scaleY: 1.22, scaleX: 1.04, opacity: 1, duration: launch.duration * .2, ease: 'power2.inOut' }, at(.19))
        .fromTo(halo, { opacity: .04, scale: .45 }, { opacity: .88, scale: 1.32, duration: launch.duration * .32, ease: 'power1.inOut' }, at(.08))
        .to(halo, { opacity: .18, scale: 1.65, duration: launch.duration * .42, ease: 'none' }, at(.48))
        .fromTo(smoke, { opacity: .02, scale: .3, xPercent: 0, yPercent: 12 }, { opacity: .82, scale: 1.24, xPercent: (index) => [-26, 28, -45, 45][index] || 0, yPercent: -5, duration: launch.duration * .3, stagger: launch.duration * .025, ease: 'power2.out' }, at(.15))
        .to(smoke, { opacity: 0, scale: 2.15, xPercent: (index) => [-75, 75, -110, 110][index] || 0, yPercent: -28, duration: launch.duration * .42, stagger: launch.duration * .012, ease: 'power1.out' }, at(.53))
        .fromTo(vehicle, { yPercent: 0, scale: 1 }, { yPercent: -122, scale: .92, duration: launch.duration * .64, ease: 'power2.in' }, at(.3))
        .to(vehicle, { opacity: 0, duration: launch.duration * .13, ease: 'none' }, at(.86));
    }
    setChapter(stages[0].key);
    const orbitPath = document.querySelector('.hero-orbit ellipse');
    if (orbitPath) {
      const length = orbitPath.getTotalLength();
      gsap.fromTo(orbitPath, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 2.6, delay: .3, ease: 'power2.inOut' });
    }
    const hero = document.querySelector('.hero');
    const layers = gsap.utils.toArray('.hero-starfield .stars');
    const pointer = (event) => {
      if (document.hidden || !hero) return;
      const box = hero.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width - .5) * 2;
      const y = ((event.clientY - box.top) / box.height - .5) * 2;
      layers.forEach((layer, index) => gsap.to(layer, { x: x * (index + 1) * 2.6, y: y * (index + 1) * 2.6, duration: 1.6, ease: 'power2.out', overwrite: 'auto' }));
    };
    const resetPointer = () => layers.forEach((layer) => gsap.to(layer, { x: 0, y: 0, duration: 1.6, overwrite: 'auto' }));
    hero?.addEventListener('pointermove', pointer, { passive: true });
    hero?.addEventListener('pointerleave', resetPointer);
    return () => {
      hero?.removeEventListener('pointermove', pointer);
      hero?.removeEventListener('pointerleave', resetPointer);
      cinema.classList.remove('has-story-motion');
      scenes.forEach((scene) => { scene.removeAttribute('aria-hidden'); scene.inert = false; });
    };
  });

  motion.add('(max-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const launch = document.querySelector('.story-scene-launch');
    const artwork = launch?.querySelector('.launch-artwork');
    if (!artwork) return;
    const vehicle = launch.querySelector('.launch-vehicle');
    const engine = launch.querySelector('.launch-engine');
    const smoke = gsap.utils.toArray(launch.querySelectorAll('.launch-smoke'));
    const halo = launch.querySelector('.launch-halo');
    const timeline = gsap.timeline({ scrollTrigger: {
      id: 'bowie-launch-mobile',
      trigger: artwork,
      start: 'top 88%',
      end: 'bottom 10%',
      scrub: .45,
      invalidateOnRefresh: true
    } });
    timeline.fromTo(engine, { scaleY: .12, opacity: .15 }, { scaleY: 1, opacity: 1, duration: .36, ease: 'power1.in' }, .04)
      .fromTo(halo, { opacity: .1, scale: .6 }, { opacity: .8, scale: 1.2, duration: .4, ease: 'none' }, .05)
      .fromTo(smoke, { opacity: .05, scale: .4, xPercent: 0 }, { opacity: .75, scale: 1.2, xPercent: (index) => [-18, 18, -35, 35][index] || 0, duration: .38, ease: 'power1.out' }, .16)
      .to(smoke, { opacity: .16, scale: 1.6, xPercent: (index) => [-50, 50, -80, 80][index] || 0, duration: .46, ease: 'none' }, .54)
      .fromTo(vehicle, { yPercent: 0 }, { yPercent: -42, duration: .64, ease: 'power1.in' }, .36);
  });

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  reduceMotion.addEventListener?.('change', () => ScrollTrigger.refresh());
  root.dataset.ready = 'true';
})();
