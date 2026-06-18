(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-nav]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-search-input]', scope);
      var buttons = qsa('[data-filter-value]', scope);
      var cards = qsa('[data-card]', scope);
      var empty = qs('[data-empty-state]', scope);
      var filterValue = 'all';

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        var shown = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-meta'));
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesFilter = filterValue === 'all' || text.indexOf(normalize(filterValue)) !== -1;
          var visible = matchesQuery && matchesFilter;
          card.classList.toggle('is-hidden-card', !visible);
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', shown === 0);
        }
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
        }
        input.addEventListener('input', apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          filterValue = button.getAttribute('data-filter-value') || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });

      apply();
    });
  }

  function setupPlayerScroll() {
    qsa('[data-scroll-player]').forEach(function (button) {
      button.addEventListener('click', function () {
        var video = qs('#movieVideo');
        if (video) {
          video.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  window.initPlayer = function (streamUrl) {
    var video = qs('#movieVideo');
    var cover = qs('[data-player-button]');
    var attached = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      video.controls = true;
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayerScroll();
  });
})();
