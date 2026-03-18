/* ============================================
   FUNCTIONAL NUTRITION BY SNEHA - MAIN JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── NAVBAR SCROLL ─────────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ─── MOBILE MENU TOGGLE ────────────────────────
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // ─── SCROLL ANIMATIONS ─────────────────────────
  const observerOptions = { threshold: 0.12, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${(i % 4) * 0.08}s`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

  // ─── COUNTER ANIMATION ─────────────────────────
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (counters.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          const duration = 1800;
          const step = target / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = Math.floor(current);
            if (current >= target) clearInterval(timer);
          }, 16);
          countObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => countObserver.observe(el));
  }

  // ─── TESTIMONIALS SLIDER ───────────────────────
  const slider = document.getElementById('testimonialsSlider');
  if (slider) {
    const cards    = slider.querySelectorAll('.testimonial-card');
    const dotsEl   = document.getElementById('sliderDots');
    const prevBtn  = document.getElementById('prevBtn');
    const nextBtn  = document.getElementById('nextBtn');
    let current    = 0;
    let autoTimer;

    // Build dots
    cards.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });

    function goTo(index) {
      cards[current].classList.remove('active');
      dotsEl.children[current].classList.remove('active');
      current = (index + cards.length) % cards.length;
      cards[current].classList.add('active');
      dotsEl.children[current].classList.add('active');
    }

    function startAuto() { autoTimer = setInterval(() => goTo(current + 1), 5000); }
    function stopAuto()  { clearInterval(autoTimer); }

    prevBtn && prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
    nextBtn && nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });
    startAuto();
  }

  // ─── FAQ TOGGLE ────────────────────────────────
  window.toggleFaq = (el) => {
    const answer = el.nextElementSibling;
    const isOpen = answer.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-answer.open').forEach(a => a.classList.remove('open'));
    document.querySelectorAll('.faq-question.active').forEach(q => q.classList.remove('active'));
    if (!isOpen) {
      answer.classList.add('open');
      el.classList.add('active');
    }
  };

  // ─── BLOG LOADING ──────────────────────────────
  const blogGrid     = document.getElementById('blogGrid');
  const homeBlogGrid = document.getElementById('homeBlogGrid');

  const blogColors = ['blog-color-1','blog-color-2','blog-color-3','blog-color-4','blog-color-5','blog-color-6'];
  const blogIcons  = ['🥦','🧠','🔥','🩸','⚡','🧘'];

  function renderBlogCard(post, index, clickable = true) {
    const colorClass = blogColors[index % blogColors.length];
    const icon = blogIcons[index % blogIcons.length];
    const card = document.createElement('div');
    card.className = 'blog-card animate-on-scroll';
    card.dataset.category = post.category;
    card.innerHTML = `
      <div class="blog-card-img ${colorClass}">${icon}</div>
      <div class="blog-card-body">
        <div class="blog-meta">
          <span class="blog-category">${post.category}</span>
          <span class="blog-date">${post.date}</span>
        </div>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <span class="blog-read-more">Read More <i class="fas fa-arrow-right"></i></span>
      </div>`;
    if (clickable) {
      card.addEventListener('click', () => openBlogModal(post, colorClass, icon));
    }
    return card;
  }

  async function loadBlogs() {
    try {
      const res  = await fetch('/api/blogs');
      const data = await res.json();

      // Home page - show 3 latest
      if (homeBlogGrid) {
        homeBlogGrid.innerHTML = '';
        data.slice(0, 3).forEach((post, i) => {
          const card = renderBlogCard(post, i, true);
          homeBlogGrid.appendChild(card);
          setTimeout(() => observer.observe(card), 0);
        });
      }

      // Blog page - show all
      if (blogGrid) {
        blogGrid.innerHTML = '';
        allPosts = data;
        renderFilteredBlogs(data);
      }
    } catch (err) {
      if (blogGrid) blogGrid.innerHTML = '<p style="text-align:center;color:#999;padding:40px">Failed to load articles. Please try again.</p>';
    }
  }

  // Blog page filtering
  let allPosts = [];

  function renderFilteredBlogs(posts) {
    if (!blogGrid) return;
    blogGrid.innerHTML = '';
    const noResults = document.getElementById('noResults');

    if (posts.length === 0) {
      if (noResults) noResults.classList.remove('hidden');
      return;
    }
    if (noResults) noResults.classList.add('hidden');

    posts.forEach((post, i) => {
      const card = renderBlogCard(post, i, true);
      blogGrid.appendChild(card);
      setTimeout(() => observer.observe(card), i * 50);
    });
  }

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const search = document.getElementById('blogSearch')?.value.toLowerCase() || '';
      filterBlogs(filter, search);
    });
  });

  // Search
  const searchInput = document.getElementById('blogSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
      filterBlogs(filter, searchInput.value.toLowerCase());
    });
  }

  function filterBlogs(category, search) {
    let filtered = allPosts;
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (search) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(search) ||
        p.excerpt.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search)
      );
    }
    renderFilteredBlogs(filtered);
  }

  loadBlogs();

  // ─── BLOG MODAL ────────────────────────────────
  const blogModal   = document.getElementById('blogModal');
  const modalClose  = document.getElementById('modalClose');
  const modalBody   = document.getElementById('modalBody');

  function openBlogModal(post, colorClass, icon) {
    if (!blogModal) return;
    modalBody.innerHTML = `
      <div class="blog-card-img ${colorClass}" style="height:200px;border-radius:16px 16px 0 0;font-size:4rem;display:flex;align-items:center;justify-content:center;margin:-48px -48px 32px">${icon}</div>
      <div class="modal-category"><span class="blog-category">${post.category}</span></div>
      <h2 class="modal-title">${post.title}</h2>
      <div class="modal-meta">
        <span><i class="fas fa-calendar"></i> ${post.date}</span>
        <span><i class="fas fa-user"></i> ${post.author}</span>
      </div>
      <div class="modal-body">${post.content}</div>
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e0e0e0;text-align:center">
        <a href="/contact" class="btn btn-primary">Book a Consultation with Sneha</a>
      </div>`;
    blogModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      blogModal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
  if (blogModal) {
    blogModal.addEventListener('click', (e) => {
      if (e.target === blogModal) {
        blogModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ─── CONTACT FORM ──────────────────────────────
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name    = document.getElementById('name');
      const email   = document.getElementById('email');
      const message = document.getElementById('message');
      const btnText    = document.getElementById('btnText');
      const btnLoading = document.getElementById('btnLoading');
      const formMsg    = document.getElementById('formMessage');
      const submitBtn  = document.getElementById('submitBtn');

      // Reset errors
      ['name', 'email', 'message'].forEach(f => {
        document.getElementById(f)?.classList.remove('error');
        document.getElementById(f + 'Error').textContent = '';
      });

      // Validate
      let valid = true;
      if (!name.value.trim()) {
        name.classList.add('error');
        document.getElementById('nameError').textContent = 'Please enter your full name.';
        valid = false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailRegex.test(email.value)) {
        email.classList.add('error');
        document.getElementById('emailError').textContent = 'Please enter a valid email address.';
        valid = false;
      }
      if (!message.value.trim()) {
        message.classList.add('error');
        document.getElementById('messageError').textContent = 'Please write a message.';
        valid = false;
      }
      if (!valid) return;

      // Submit
      btnText.classList.add('hidden');
      btnLoading.classList.remove('hidden');
      submitBtn.disabled = true;
      formMsg.className = 'form-message hidden';

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:    name.value.trim(),
            email:   email.value.trim(),
            phone:   document.getElementById('phone')?.value.trim(),
            subject: document.getElementById('subject')?.value,
            message: message.value.trim()
          })
        });
        const data = await res.json();
        if (data.success) {
          formMsg.textContent = data.message;
          formMsg.className = 'form-message success';
          contactForm.reset();
        } else {
          formMsg.textContent = data.message || 'Something went wrong. Please try again.';
          formMsg.className = 'form-message error';
        }
      } catch {
        formMsg.textContent = 'Network error. Please check your connection and try again.';
        formMsg.className = 'form-message error';
      } finally {
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        submitBtn.disabled = false;
        formMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // ─── NEWSLETTER FORM ───────────────────────────
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.getElementById('newsletterMsg');
      msg.textContent = 'Thank you for subscribing! Welcome to the Functional Nutrition community.';
      msg.className = 'form-message success';
      newsletterForm.reset();
    });
  }

  // ─── SMOOTH SCROLL ─────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ─── BACK TO TOP ───────────────────────────────
  // Create button
  const backToTop = document.createElement('button');
  backToTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.style.cssText = `
    position: fixed; bottom: 28px; right: 28px; z-index: 999;
    width: 44px; height: 44px; border-radius: 50%;
    background: var(--primary); color: white;
    border: none; cursor: pointer; font-size: 1rem;
    box-shadow: 0 4px 12px rgba(46,125,50,0.35);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transform: translateY(12px);
    transition: all 0.3s ease; pointer-events: none;`;
  document.body.appendChild(backToTop);

  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    backToTop.style.opacity = show ? '1' : '0';
    backToTop.style.transform = show ? 'translateY(0)' : 'translateY(12px)';
    backToTop.style.pointerEvents = show ? 'auto' : 'none';
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

});
