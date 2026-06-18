(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('is-open');
        menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var hero = document.querySelector('.hero-carousel');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var prev = hero.querySelector('.hero-prev');
      var next = hero.querySelector('.hero-next');
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function play() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      if (slides.length > 1) {
        if (prev) {
          prev.addEventListener('click', function () {
            show(current - 1);
            play();
          });
        }
        if (next) {
          next.addEventListener('click', function () {
            show(current + 1);
            play();
          });
        }
        dots.forEach(function (dot, index) {
          dot.addEventListener('click', function () {
            show(index);
            play();
          });
        });
        play();
      }
    }

    var input = document.querySelector('#page-search');

    if (input) {
      var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
      input.addEventListener('input', function () {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          card.classList.toggle('is-filter-hidden', keyword && text.indexOf(keyword) === -1);
        });
      });
    }
  });
})();

function initMoviePlayer(videoUrl) {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.querySelector('#movie-video');
    var playButton = document.querySelector('#movie-play');
    var hlsInstance = null;
    var initialized = false;

    if (!video || !videoUrl) {
      return;
    }

    function attach() {
      if (initialized) {
        return;
      }
      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else {
        video.src = videoUrl;
      }
    }

    function start() {
      attach();
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    attach();

    if (playButton) {
      playButton.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
}
