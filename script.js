// Evora landing — interactions
(function () {
  "use strict";

  // Current year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Sticky nav: add .scrolled past a threshold
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 12);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Deschide meniul" : "Închide meniul");
      menu.hidden = open;
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        menu.hidden = true;
      });
    });
  }

  // Scroll reveal
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // Scroll progress bar
  var bar = document.getElementById("progress");
  function progress() {
    if (!bar) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  }
  progress();
  window.addEventListener("scroll", progress, { passive: true });
  window.addEventListener("resize", progress);

  // Active nav link while scrolling
  var navMap = {};
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    navMap[a.getAttribute("href").replace("#", "")] = a;
  });
  var sections = Object.keys(navMap)
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && navMap[e.target.id]) {
            Object.keys(navMap).forEach(function (k) { navMap[k].classList.remove("active"); });
            navMap[e.target.id].classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  // ----- Lightbox (click images to enlarge) -----
  var zoomables = Array.prototype.slice.call(
    document.querySelectorAll("#galerie img, .feature-row .phone img, .feature-row .browser img")
  );
  var lb = document.getElementById("lightbox");
  if (lb && zoomables.length) {
    var lbImg = document.getElementById("lbImg");
    var idx = 0;
    function lbOpen(i) {
      idx = (i + zoomables.length) % zoomables.length;
      lbImg.src = zoomables[idx].currentSrc || zoomables[idx].src;
      lbImg.alt = zoomables[idx].alt || "";
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function lbClose() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    zoomables.forEach(function (img, i) {
      img.addEventListener("click", function () { lbOpen(i); });
    });
    document.getElementById("lbClose").addEventListener("click", lbClose);
    document.getElementById("lbPrev").addEventListener("click", function (e) { e.stopPropagation(); lbOpen(idx - 1); });
    document.getElementById("lbNext").addEventListener("click", function (e) { e.stopPropagation(); lbOpen(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lbClose(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") lbClose();
      else if (e.key === "ArrowLeft") lbOpen(idx - 1);
      else if (e.key === "ArrowRight") lbOpen(idx + 1);
    });
  }

  // ----- Custom dropdown(s) -----
  document.querySelectorAll(".select").forEach(function (sel) {
    var btn = sel.querySelector(".select-btn");
    var list = sel.querySelector(".select-list");
    var valueEl = btn.querySelector("span");
    var input = sel.querySelector('input[type="hidden"]');
    if (!btn || !list) return;
    function close() { sel.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    function open() { sel.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      sel.classList.contains("open") ? close() : open();
    });
    list.querySelectorAll("li").forEach(function (li) {
      li.addEventListener("click", function () {
        list.querySelectorAll("li").forEach(function (x) { x.classList.remove("is-selected"); });
        li.classList.add("is-selected");
        if (valueEl) valueEl.textContent = li.textContent;
        if (input) input.value = li.getAttribute("data-value") || li.textContent;
        close();
      });
    });
    document.addEventListener("click", function (e) { if (!sel.contains(e.target)) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  });

  // ----- Demo form (FormSubmit — no backend) -----
  var demoForm = document.getElementById("demoForm");
  if (demoForm) {
    demoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var el = demoForm.elements;
      var note = document.getElementById("formNote");
      var btn = demoForm.querySelector(".form-submit");
      if (el["_honey"] && el["_honey"].value) return; // spam honeypot
      if (!demoForm.checkValidity()) { demoForm.reportValidity(); return; }
      var label = btn.textContent;
      btn.disabled = true; btn.textContent = "Se trimite…";
      if (note) { note.textContent = ""; note.classList.remove("err"); }
      var payload = {
        name: el["name"].value,
        email: el["email"].value,
        phone: el["phone"].value,
        business_type: el["business_type"].value,
        message: el["message"].value,
        _subject: "Cerere demo Evora — " + el["name"].value,
        _template: "table"
      };
      fetch("https://formsubmit.co/ajax/office@evo-node.ro", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          return r.json().then(function (j) { return { ok: r.ok, j: j }; }, function () { return { ok: r.ok, j: {} }; });
        })
        .then(function (res) {
          if (res.ok && (res.j.success === "true" || res.j.success === true)) {
            demoForm.innerHTML =
              '<div class="form-success"><div class="fs-ic">✓</div><h3>Mulțumim!</h3>' +
              "<p>Ți-am primit cererea — te contactăm în aceeași zi lucrătoare.</p></div>";
          } else { throw new Error("fail"); }
        })
        .catch(function () {
          btn.disabled = false; btn.textContent = label;
          if (note) {
            note.innerHTML =
              'Nu am putut trimite acum. Scrie-ne la <a href="mailto:office@evo-node.ro">office@evo-node.ro</a> ' +
              'sau sună la <a href="tel:+40752173276">0752 173 276</a>.';
            note.classList.add("err");
          }
        });
    });
  }
})();
