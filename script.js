(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Loader ---------- */
  window.addEventListener("load", function () {
    var loader = document.getElementById("loader");
    if (!loader) return;
    var wait = reduceMotion ? 0 : 700;
    setTimeout(function () {
      loader.classList.add("is-hidden");
    }, wait);
  });

  /* ---------- Image placeholder fallback ---------- */
  document.querySelectorAll("[data-img-box]").forEach(function (box) {
    var img = box.querySelector("[data-img]");
    if (!img) return;
    box.setAttribute("data-loaded", "false");
    function markLoaded() { box.setAttribute("data-loaded", "true"); }
    function markMissing() { box.setAttribute("data-loaded", "false"); }
    if (img.complete) {
      if (img.naturalWidth > 0) markLoaded(); else markMissing();
    }
    img.addEventListener("load", function () {
      if (img.naturalWidth > 0) markLoaded(); else markMissing();
    });
    img.addEventListener("error", markMissing);
  });

  /* ---------- Sticky nav state + active section ---------- */
  var nav = document.getElementById("nav");
  var navLinks = document.querySelectorAll("[data-nav]");
  var sections = document.querySelectorAll("main .section, .hero");

  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");

    var scrollPos = window.scrollY + 140;
    var current = "home";
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) current = sec.id;
    });
    navLinks.forEach(function (link) {
      var isMobile = link.closest(".mobile-menu");
      var match = link.getAttribute("href") === "#" + current;
      if (!isMobile) link.classList.toggle("active", match);
    });
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      mobileMenu.classList.toggle("is-open", !open);
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        mobileMenu.classList.remove("is-open");
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var groups = {};
    revealEls.forEach(function (el) {
      var parentKey = el.parentElement ? el.parentElement.className : "root";
      groups[parentKey] = groups[parentKey] || [];
      groups[parentKey].push(el);
    });
    Object.keys(groups).forEach(function (key) {
      groups[key].forEach(function (el, i) {
        if (!el.style.getPropertyValue("--delay")) {
          el.style.setProperty("--delay", Math.min(i * 70, 280) + "ms");
        }
      });
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Timeline expand/collapse ---------- */
  document.querySelectorAll("[data-tl-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".tl-item");
      var isOpen = item.getAttribute("data-open") === "true";
      item.setAttribute("data-open", String(!isOpen));
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ---------- Smooth scroll with nav offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = 76;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });

  /* ---------- Custom cursor (desktop / fine pointer only) ---------- */
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (canHover && !reduceMotion) {
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");
    var enabled = false;
    var ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;

    window.addEventListener("mousemove", function (e) {
      if (!enabled) {
        enabled = true;
        document.body.classList.add("cursor-active");
      }
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.transform = "translate(" + mouseX + "px," + mouseY + "px) translate(-50%,-50%)";
    });

    function raf() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ring) ring.style.transform = "translate(" + ringX + "px," + ringY + "px) translate(-50%,-50%)";
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    document.querySelectorAll("a, button").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        if (ring) { ring.style.transform += " scale(1.5)"; ring.style.borderColor = "var(--accent)"; }
      });
      el.addEventListener("mouseleave", function () {
        if (ring) ring.style.borderColor = "var(--border-strong)";
      });
    });
  }
})();
