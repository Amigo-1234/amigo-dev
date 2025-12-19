// =====================
// Portfolio UI scripts
// =====================
const THEME_KEY = "portfolio-theme";

const root = document.documentElement;
const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav__toggle");
const navLinksWrapper = document.querySelector(".nav__links-wrapper");
const themeToggle = document.querySelector(".theme-toggle");
const yearEl = document.getElementById("year");

/* Theme handling */
function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
}

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    applyTheme(stored);
    return;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

function toggleTheme() {
  const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
}

/* Mobile nav */
function closeNav() {
  if (nav) nav.classList.remove("nav--open");
}

function initNav() {
  if (!navToggle || !nav) return;

  navToggle.addEventListener("click", () => {
    nav.classList.toggle("nav--open");
  });

  if (navLinksWrapper) {
    navLinksWrapper.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.matches("a[href^='#']")) closeNav();
    });
  }

  document.addEventListener("click", (e) => {
    if (nav && !nav.contains(e.target)) closeNav();
  });
}

/* Scroll reveal */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !items.length) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

/* Smooth scroll fallback */
function initSmoothScrollFallback() {
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.matches("a[href^='#']")) {
      const href = target.getAttribute("href");
      if (!href || href === "#") return;
      const el = document.querySelector(href);
      if (!el) return;

      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

/* Year */
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Theme toggle */
if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

/* Init UI */
initTheme();
initNav();
initScrollReveal();
initSmoothScrollFallback();

// =====================
// EmailJS Contact Form
// =====================

function initContactFormEmailJS() {
  const form = document.getElementById("contactForm");
  const submitBtn = document.getElementById("sendBtn");
  const statusEl = document.getElementById("formStatus");

  if (!form) return;

 const setStatus = (msg, type = "info") => {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.className = `form-note ${type}`;
};


  // Init EmailJS
  emailjs.init("jvdJnyZxBNqyaEdjB");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !subject || !message) {
      setStatus("Please fill in all fields.", "error");
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      setStatus("Please enter a valid email address." , "error");
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      setStatus("Sending your message…", "info");

      await emailjs.sendForm("service_wcfaccn", "template_6ih1q9f", form);

      setStatus("Message sent ✅ I’ll get back to you soon.", "success");
      form.reset();

      setTimeout(() => {
  if (statusEl) statusEl.textContent = "";
}, 6000);

    } catch (err) {
      console.error(err);
      setStatus("Failed to send ❌ Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    }
  });
}
// Highlight AMIGO case study when opened
document.addEventListener("click", (e) => {
  const a = e.target.closest("a");
  if (!a) return;
  if (a.getAttribute("href") !== "#amigo-case-study") return;

  setTimeout(() => {
    const el = document.getElementById("amigo-case-study");
    if (!el) return;
    el.classList.add("highlight");
    setTimeout(() => el.classList.remove("highlight"), 1200);
  }, 200);
});

initContactFormEmailJS();
