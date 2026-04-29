document.addEventListener("DOMContentLoaded", () => {

  /* ================= PERFORMANCE ================= */
  const isMobile = window.innerWidth < 768;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PERFORMANCE_MODE = !(isMobile || reduceMotion);

  const $ = (s) => document.querySelector(s);

  /* ================= ELEMENTS ================= */
  const nav = $(".navbar");
  const bar = $("#progress-bar");
  const hero = $(".hero-content");
  const aura = $(".aura-core");
  const cursor = $(".cursor-dot");

  const cards = document.querySelectorAll(".card, .pricing-card");
  const buttons = document.querySelectorAll(".btn");
  const reveals = document.querySelectorAll(".reveal");
  const sections = document.querySelectorAll("section");
  const links = document.querySelectorAll(".nav-links a");

  /* ================= FLAGS ================= */
  let isParticlesRunning = false;
  let isAnimating = false;

  /* ================= GPU BOOST ================= */
  [hero, aura, cursor].forEach(el => {
    if (el) el.style.willChange = "transform";
  });

  /* ================= NAV + PROGRESS ================= */
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {

        const y = window.scrollY;

        if (nav) nav.classList.toggle("scrolled", y > 20);

        if (bar) {
          const h = document.documentElement.scrollHeight - window.innerHeight;
          bar.style.width = h > 0 ? (y / h) * 100 + "%" : "0%";
        }

        updateActiveNav();

        ticking = false;
      });

      ticking = true;
    }
  }, { passive: true });

  /* ================= REVEAL ================= */
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => observer.observe(el));

  /* ================= ACTIVE NAV ================= */
  function updateActiveNav() {
    let current = "";

    sections.forEach(section => {
      const offset = section.offsetTop - 200;
      const height = section.offsetHeight;

      if (window.scrollY >= offset && window.scrollY < offset + height) {
        current = section.id;
      }
    });

    links.forEach(link => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === "#" + current
      );
    });
  }

  /* ================= PARTICLES ================= */
  let particlesLoop, particles = [], canvas, ctx;

  if (PERFORMANCE_MODE) {
    canvas = $("#particles");
    ctx = canvas?.getContext("2d");

    if (canvas && ctx) {

      const COUNT = 5;

      function initParticles() {
        canvas.width = innerWidth;
        canvas.height = innerHeight;

        particles = Array.from({ length: COUNT }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.05,
          vy: (Math.random() - 0.5) * 0.05
        }));
      }

      function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          ctx.fillStyle = "rgba(255,255,255,0.03)";
          ctx.fillRect(p.x, p.y, 2, 2);
        });
      }

      function loopParticles() {
        if (!running || isParticlesRunning) return;

        isParticlesRunning = true;

        function frame() {
          if (!running) {
            isParticlesRunning = false;
            return;
          }

          drawParticles();
          particlesLoop = requestAnimationFrame(frame);
        }

        frame();
      }

      initParticles();
      loopParticles();

      window.addEventListener("resize", debounce(initParticles, 200));
    }
  }

  /* ================= VISIBILITY ================= */
  let running = true;
  let animationId;

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;

    if (!running) {
      if (particlesLoop) cancelAnimationFrame(particlesLoop);
      if (animationId) cancelAnimationFrame(animationId);
      isParticlesRunning = false;
      isAnimating = false;
    } else {
      if (PERFORMANCE_MODE && canvas && ctx) loopParticles();
      if (PERFORMANCE_MODE && hero) animate();
    }
  });

  /* ================= PARALLAX ================= */
  if (PERFORMANCE_MODE && hero) {

    let targetX = innerWidth / 2;
    let targetY = innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    let mouseRAF;

    window.addEventListener("mousemove", (e) => {
      if (mouseRAF) return;

      mouseRAF = requestAnimationFrame(() => {
        targetX = e.clientX;
        targetY = e.clientY;
        mouseRAF = null;
      });
    }, { passive: true });

    window.addEventListener("resize", () => {
      targetX = innerWidth / 2;
      targetY = innerHeight / 2;
    });

    function animate() {
      if (!running || isAnimating) return;

      isAnimating = true;

      function frame() {
        if (!running) {
          isAnimating = false;
          return;
        }

        currentX += (targetX - currentX) * 0.06;
        currentY += (targetY - currentY) * 0.06;

        if (hero) {
          hero.style.transform =
            `translate3d(${(innerWidth/2 - currentX)/32}px, ${(innerHeight/2 - currentY)/32}px,0)`;
        }

        if (aura) {
          aura.style.transform =
            `translate3d(${currentX - 130}px, ${currentY - 130}px,0)`;
        }

        if (cursor) {
          cursor.style.transform =
            `translate3d(${currentX}px, ${currentY}px,0)`;
        }

        animationId = requestAnimationFrame(frame);
      }

      frame();
    }

    animate();
  }

  /* ================= BUTTON MAGNET ================= */
  if (PERFORMANCE_MODE) {
    buttons.forEach(btn => {
      let rafId;

      btn.addEventListener("mousemove", e => {
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;

          btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ================= CARD TILT ================= */
  if (PERFORMANCE_MODE) {
    cards.forEach(card => {
      let rafId;

      card.addEventListener("mousemove", e => {
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;

          card.style.transform = `
            perspective(800px)
            rotateX(${y * -3}deg)
            rotateY(${x * 3}deg)
            scale(1.02)
          `;
        });
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

});

/* ================= UTILS ================= */
function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
} 