(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-slide]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var select = scope.querySelector('[data-filter-select]');
    var yearSelect = scope.querySelector('[data-year-select]');
    var list = document.querySelector('[data-filter-list]');
    var empty = document.querySelector('[data-empty-state]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function update() {
      var query = normalize(input ? input.value : '');
      var selected = normalize(select ? select.value : '');
      var selectedYear = normalize(yearSelect ? yearSelect.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' '));
        var passQuery = !query || text.indexOf(query) !== -1;
        var passSelected = !selected || text.indexOf(selected) !== -1;
        var passYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
        var show = passQuery && passSelected && passYear;

        card.style.display = show ? '' : 'none';

        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', update);
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');

      if (q) {
        input.value = q;
      }
    }

    if (select) {
      select.addEventListener('change', update);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', update);
    }

    update();
  });
})();
