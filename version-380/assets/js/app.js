(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function setupMobileMenu() {
    var toggle = qs("[data-menu-toggle]");
    var menu = qs("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa(".hero-slide", hero);
    var dots = qsa("[data-hero-dot]", hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(idx);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    qsa("[data-filter-scope]").forEach(function (scope) {
      var textInput = qs("[data-filter-text]", scope);
      var regionSelect = qs("[data-filter-region]", scope);
      var typeSelect = qs("[data-filter-type]", scope);
      var cards = qsa(".movie-card", scope);
      var empty = qs("[data-empty-state]", scope);

      function valueOf(control) {
        return control ? control.value.trim().toLowerCase() : "";
      }

      function apply() {
        var text = valueOf(textInput);
        var region = valueOf(regionSelect);
        var type = valueOf(typeSelect);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();

          var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
          var cardType = (card.getAttribute("data-type") || "").toLowerCase();
          var ok = true;

          if (text && haystack.indexOf(text) === -1) {
            ok = false;
          }
          if (region && cardRegion.indexOf(region) === -1) {
            ok = false;
          }
          if (type && cardType.indexOf(type) === -1) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [textInput, regionSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function setupPlayers() {
    qsa(".video-box").forEach(function (box) {
      var video = qs("video", box);
      var button = qs(".play-cover", box);
      var stream = box.getAttribute("data-stream") || "";
      var loaded = false;
      var hls = null;

      function load() {
        if (loaded || !video || !stream) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }

        loaded = true;
      }

      function start() {
        load();
        box.classList.add("is-playing");
        if (video) {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
        video.addEventListener("play", function () {
          box.classList.add("is-playing");
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return {
      q: (params.get("q") || "").trim(),
      region: (params.get("region") || "").trim(),
      type: (params.get("type") || "").trim()
    };
  }

  function cardHtml(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      '<article class="movie-card compact">',
      '<a href="' + escapeHtml(item.url) + '">',
      '<div class="poster-wrap">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-year">' + escapeHtml(item.year) + '</span>',
      '</div>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '<span class="card-channel">' + escapeHtml(item.categoryName) + '</span>',
      '</div>',
      '</a>',
      '</article>'
    ].join("");
  }

  function setupSearchPage() {
    var root = qs("[data-search-page]");
    if (!root || !window.SITE_MOVIES) {
      return;
    }

    var input = qs("[data-search-input]", root);
    var region = qs("[data-search-region]", root);
    var type = qs("[data-search-type]", root);
    var results = qs("[data-search-results]", root);
    var empty = qs("[data-search-empty]", root);
    var initial = readQuery();

    if (input && initial.q) {
      input.value = initial.q;
    }
    if (region && initial.region) {
      region.value = initial.region;
    }
    if (type && initial.type) {
      type.value = initial.type;
    }

    function render() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value.trim().toLowerCase() : "";
      var typeValue = type ? type.value.trim().toLowerCase() : "";

      var list = window.SITE_MOVIES.filter(function (item) {
        var haystack = [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          (item.tags || []).join(" "),
          item.oneLine
        ].join(" ").toLowerCase();

        if (query && haystack.indexOf(query) === -1) {
          return false;
        }
        if (regionValue && String(item.region || "").toLowerCase().indexOf(regionValue) === -1) {
          return false;
        }
        if (typeValue && String(item.type || "").toLowerCase().indexOf(typeValue) === -1) {
          return false;
        }
        return true;
      }).slice(0, 120);

      if (results) {
        results.innerHTML = list.map(cardHtml).join("");
      }
      if (empty) {
        empty.classList.toggle("is-visible", list.length === 0);
      }
    }

    [input, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayers();
    setupSearchPage();
  });
})();
