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
  const hasIntersectionObserver = 'IntersectionObserver' in window;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
});


