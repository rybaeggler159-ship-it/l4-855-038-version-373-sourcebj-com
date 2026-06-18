(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(current + 1);
        }, 6000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      show(0);
      restart();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (panel) {
      var section = panel.parentElement;
      var input = panel.querySelector("[data-filter-input]");
      var type = panel.querySelector("[data-filter-type]");
      var region = panel.querySelector("[data-filter-region]");
      var year = panel.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(section.querySelectorAll(".searchable-card"));

      function valueOf(control) {
        return control ? control.value.trim().toLowerCase() : "";
      }

      function isAll(value, prefix) {
        return !value || value.indexOf(prefix) === 0;
      }

      function apply() {
        var term = valueOf(input);
        var typeValue = valueOf(type);
        var regionValue = valueOf(region);
        var yearValue = valueOf(year);
        var visible = 0;

        cards.forEach(function (card) {
          var title = (card.getAttribute("data-title") || "").toLowerCase();
          var tags = (card.getAttribute("data-tags") || "").toLowerCase();
          var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
          var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
          var haystack = [title, tags, cardRegion, cardYear].join(" ");
          var matchTerm = !term || haystack.indexOf(term) !== -1;
          var matchType = isAll(typeValue, "全部") || tags.indexOf(typeValue) !== -1;
          var matchRegion = isAll(regionValue, "全部") || cardRegion.indexOf(regionValue) !== -1;
          var matchYear = isAll(yearValue, "全部") || cardYear === yearValue;
          var matched = matchTerm && matchType && matchRegion && matchYear;
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        panel.classList.toggle("has-empty", visible === 0);
      }

      [input, type, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  });
})();
