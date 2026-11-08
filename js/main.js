/* =========================================================
   Hossain Ismoth Zeanin — Portfolio scripts (no libraries)
   ========================================================= */
(function () {
  "use strict";

  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  var header = $("#siteHeader");
  var burger = $("#hamburger");
  var navLinks = $("#navLinks");

  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navLinks.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
  }
  burger.addEventListener("click", function () {
    setMenu(burger.getAttribute("aria-expanded") !== "true");
  });
  $$("a", navLinks).forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navLinks.classList.contains("open")) setMenu(false);
  });
  document.addEventListener("click", function (e) {
    if (navLinks.classList.contains("open") && !header.contains(e.target)) setMenu(false);
  });

  /* ---------- Header shadow + back-to-top ---------- */
  var toTop = $("#toTop");
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 20);
    toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- Active nav link (scroll spy) ---------- */
  var linkMap = {};
  $$(".nav-links a").forEach(function (a) { linkMap[a.getAttribute("href").slice(1)] = a; });
  var sections = $$("main section[id]");

  function updateActive() {
    var mark = window.innerHeight * 0.35;
    var current = "";
    sections.forEach(function (sec) {
      if (sec.getBoundingClientRect().top <= mark) current = sec.id;
    });
    // At the very bottom of the page, highlight the last section
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = sections[sections.length - 1].id;
    }
    Object.keys(linkMap).forEach(function (id) {
      linkMap[id].classList.toggle("active", id === current);
    });
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () { updateActive(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  updateActive();

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  $("#themeToggle").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    // small stagger for items that sit in the same grid
    revealEls.forEach(function (el) {
      var siblings = el.parentElement ? $$(":scope > .reveal", el.parentElement) : [];
      var idx = siblings.indexOf(el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 70, 350) + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Counting stats ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.target);
    var decimals = parseInt(el.dataset.decimals || "0", 10);
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = prefix + target.toFixed(decimals) + suffix; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$(".count");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Rotating role text (typing effect) ---------- */
  // EDIT: change the phrases shown in the hero here
  var roles = ["Aspiring Software Engineer", "AI / ML Enthusiast"];
  var rotator = $("#roleRotator");
  if (rotator && !reduceMotion) {
    var r = 0, c = roles[0].length, deleting = true;
    rotator.textContent = roles[0];
    setTimeout(function tick() {
      var word = roles[r];
      if (deleting) {
        c--;
        rotator.textContent = word.slice(0, c);
        if (c === 0) { deleting = false; r = (r + 1) % roles.length; }
        setTimeout(tick, 40);
      } else {
        word = roles[r];
        c++;
        rotator.textContent = word.slice(0, c);
        if (c === word.length) { deleting = true; setTimeout(tick, 2200); }
        else setTimeout(tick, 75);
      }
    }, 2600);
  }

  /* ---------- Gallery captions + lightbox ---------- */
  var items = $$("#gallery-grid .g-item");
  var imgs = items.map(function (fig) {
    var img = $("img", fig);
    fig.setAttribute("data-caption", img.dataset.caption || img.alt || "");
    fig.setAttribute("tabindex", "0");
    fig.setAttribute("role", "button");
    fig.setAttribute("aria-label", "Open photo: " + (img.alt || ""));
    return img;
  });

  var lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCaption");
  var current = 0, lastFocus = null;

  function show(i) {
    current = (i + imgs.length) % imgs.length;
    var img = imgs[current];
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = img.dataset.caption || "";
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("open"); });
    document.body.style.overflow = "hidden";
    $(".lb-close", lb).focus();
  }
  function closeLb() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(function () { lb.hidden = true; }, 200);
    if (lastFocus) lastFocus.focus();
  }

  items.forEach(function (fig, i) {
    fig.addEventListener("click", function () { openLb(i); });
    fig.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(i); }
    });
  });
  $(".lb-close", lb).addEventListener("click", closeLb);
  $(".lb-prev", lb).addEventListener("click", function () { show(current - 1); });
  $(".lb-next", lb).addEventListener("click", function () { show(current + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
  // swipe on touch screens
  var touchX = null;
  lb.addEventListener("touchstart", function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Contact form (mailto, works on GitHub Pages) ---------- */
  // EDIT: the address messages are sent to
  var CONTACT_EMAIL = "hossain.ismoth.zeanin@g.bracu.ac.bd";
  var form = $("#contactForm"), note = $("#formNote");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    $$(".field", form).forEach(function (f) {
      var input = $("input, textarea", f);
      var valid = input.value.trim() !== "" && (input.type !== "email" || /^\S+@\S+\.\S+$/.test(input.value.trim()));
      f.classList.toggle("error", !valid);
      if (!valid) ok = false;
    });
    if (!ok) { note.textContent = "Please fill in every field with a valid email."; return; }

    var name = form.name.value.trim();
    var subject = encodeURIComponent("Portfolio message from " + name);
    var body = encodeURIComponent(form.message.value.trim() + "\n\n— " + name + " (" + form.email.value.trim() + ")");
    window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
    note.textContent = "Opening your email app… thanks for reaching out!";
    form.reset();
  });
})();
