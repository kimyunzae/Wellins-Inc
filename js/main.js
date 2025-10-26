document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav__list');

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    const navLinks = navList.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded', false);
      });
    });
  }

  const animatedElements = document.querySelectorAll('[data-animate]');
  const counters = document.querySelectorAll('[data-counter]');
  const progressBars = document.querySelectorAll('.progress-bar');
  const scrollTopButton = document.querySelector('.scroll-top');
  const scrollSpy = document.querySelector('.scroll-spy');
  const hasIntersectionObserver = 'IntersectionObserver' in window;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let setScrollSpyCollapsed;

  if (scrollSpy) {
    const scrollSpyToggle = scrollSpy.querySelector('.scroll-spy__toggle');
    const scrollSpyPanel = scrollSpy.querySelector('.scroll-spy__panel');

    if (scrollSpyToggle && scrollSpyPanel) {
      setScrollSpyCollapsed = (collapsed) => {
        scrollSpy.classList.toggle('is-collapsed', collapsed);
        scrollSpyToggle.setAttribute('aria-expanded', (!collapsed).toString());
        scrollSpyPanel.setAttribute('aria-hidden', collapsed ? 'true' : 'false');
      };

      scrollSpyToggle.addEventListener('click', () => {
        const willCollapse = !scrollSpy.classList.contains('is-collapsed');
        if (setScrollSpyCollapsed) {
          setScrollSpyCollapsed(willCollapse);
        }
      });

      setScrollSpyCollapsed(scrollSpy.classList.contains('is-collapsed'));
    }
  }

  const activateCounter = (element) => {
    const targetValue = parseFloat(element.dataset.counter);
    if (Number.isNaN(targetValue)) {
      return;
    }

    const suffix = element.dataset.suffix ?? '';
    const decimals = (element.dataset.counter.split('.')[1] || '').length;
    const duration = 1500;
    const startValue = 0;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = startValue + (targetValue - startValue) * progress;
      element.textContent = value.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
    element.dataset.animated = 'true';
  };

  const activateProgress = (bar) => {
    const target = parseFloat(bar.dataset.progress ?? '0');
    const clamped = Number.isFinite(target) ? Math.min(Math.max(target, 0), 100) : 0;
    bar.style.width = `${clamped}%`;

    const container = bar.closest('.milestone-progress');
    if (container) {
      const formatted = Number.isFinite(target) && !Number.isInteger(target)
        ? clamped.toFixed(1)
        : Math.round(clamped).toString();

      const label = container.querySelector('[data-progress-label]');
      if (label) {
        label.textContent = `${formatted}% complete`;
      }

      const ariaLabel = container.getAttribute('aria-label');
      if (ariaLabel) {
        const baseLabel = ariaLabel.split(':')[0] ?? ariaLabel;
        container.setAttribute('aria-label', `${baseLabel}: ${formatted} percent complete`);
      }
    }
  };

  if (prefersReducedMotion) {
    animatedElements.forEach(el => el.classList.add('is-visible'));
    counters.forEach(counter => {
      if (counter.dataset.counter) {
        counter.textContent = counter.dataset.counter + (counter.dataset.suffix ?? '');
      }
    });
    progressBars.forEach(activateProgress);
  } else if (hasIntersectionObserver) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    animatedElements.forEach(el => observer.observe(el));

    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          if (counter.dataset.animated !== 'true') {
            activateCounter(counter);
          }
          obs.unobserve(counter);
        }
      });
    }, { threshold: 0.6, rootMargin: '0px 0px -40px 0px' });

    counters.forEach(counter => counterObserver.observe(counter));

    if (progressBars.length) {
      const progressObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            activateProgress(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });

      progressBars.forEach(bar => progressObserver.observe(bar));
    }
  } else {
    animatedElements.forEach(el => el.classList.add('is-visible'));
    counters.forEach(counter => {
      if (counter.dataset.counter) {
        counter.textContent = counter.dataset.counter + (counter.dataset.suffix ?? '');
      }
    });
    progressBars.forEach(activateProgress);
  }

  if (scrollTopButton) {
    scrollTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const toggleScrollButton = () => {
      if (window.scrollY > 400) {
        scrollTopButton.classList.add('is-visible');
      } else {
        scrollTopButton.classList.remove('is-visible');
      }
    };

    toggleScrollButton();
    window.addEventListener('scroll', toggleScrollButton, { passive: true });
  }

  const spyLinks = document.querySelectorAll('.scroll-spy a[href^="#"]');
  if (spyLinks.length) {
    const trackedSections = Array.from(spyLinks)
      .map(link => {
        const targetId = link.getAttribute('href');
        if (!targetId) {
          return null;
        }

        const section = document.querySelector(targetId);
        return section ? { link, section } : null;
      })
      .filter(Boolean);

    const clearActive = () => {
      spyLinks.forEach(link => {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      });
    };

    const setActiveLink = (id) => {
      const active = trackedSections.find(item => item.section.id === id);
      if (!active) {
        return;
      }

      clearActive();
      active.link.classList.add('is-active');
      active.link.setAttribute('aria-current', 'page');
    };

    const observer = new IntersectionObserver((entries) => {
      const visibleEntries = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleEntries.length) {
        setActiveLink(visibleEntries[0].target.id);
      }
    }, {
      rootMargin: '-35% 0px -45% 0px',
      threshold: [0.3, 0.6, 0.9]
    });

    trackedSections.forEach(({ section }) => observer.observe(section));

    spyLinks.forEach(link => {
      link.addEventListener('click', () => {
        const targetId = link.getAttribute('href');
        if (!targetId) {
          return;
        }

        setActiveLink(targetId.replace('#', ''));

        if (typeof setScrollSpyCollapsed === 'function') {
          setScrollSpyCollapsed(true);
        }
      });
    });

    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      setActiveLink(initialHash);
    } else if (trackedSections[0]) {
      setActiveLink(trackedSections[0].section.id);
    }
  }
});


