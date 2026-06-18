(function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll('[data-video-src]'));

  shells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-cover');
    var source = shell.getAttribute('data-video-src');
    var loaded = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      load();
      shell.classList.add('is-playing');
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('ended', function () {
      if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
        hlsInstance.stopLoad();
      }
    });
  });
})();
