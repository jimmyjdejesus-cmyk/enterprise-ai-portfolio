document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // THEME MANAGEMENT (Light / Dark Mode)
  // ==========================================================================
  const themeToggleButton = document.getElementById('theme-toggle-button');
  const sunIcon = document.getElementById('theme-sun-icon');
  const moonIcon = document.getElementById('theme-moon-icon');
  const body = document.body;

  // Initialize theme based on user history or system preference
  const savedTheme = localStorage.getItem('portfolio-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    applyDarkTheme();
  } else {
    applyLightTheme();
  }

  themeToggleButton.addEventListener('click', () => {
    if (body.classList.contains('dark-theme')) {
      applyLightTheme();
      localStorage.setItem('portfolio-theme', 'light');
    } else {
      applyDarkTheme();
      localStorage.setItem('portfolio-theme', 'dark');
    }
  });

  function applyDarkTheme() {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }

  function applyLightTheme() {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  }

  // ==========================================================================
  // PROJECT FILTERING
  // ==========================================================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      button.classList.add('active');

      const filterValue = button.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        // Simple animation trigger
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
          if (filterValue === 'all' || category === filterValue) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 50);
          } else {
            card.style.display = 'none';
          }
        }, 200);
      });
    });
  });

  // ==========================================================================
  // INTERSECTION OBSERVER (Scroll Reveals)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.scroll-reveal');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve to keep element visible after scroll
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // ==========================================================================
  // ACTIVE NAVIGATION LINK HIGHLIGHTING
  // ==========================================================================
  const sections = document.querySelectorAll('section, header');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 100; // offset for nav height

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const linkHref = link.getAttribute('href').substring(1);
      if (linkHref === currentSectionId || (currentSectionId === 'hero-section' && linkHref === 'about')) {
        link.classList.add('active');
      }
    });
  });

  // ==========================================================================
  // CONTACT FORM INTERACTION
  // ==========================================================================
  const contactForm = document.getElementById('contact-message-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name').value;
      alert(`Thank you, ${name}! Your mock message has been received.`);
      contactForm.reset();
    });
  }
});
