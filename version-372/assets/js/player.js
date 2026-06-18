var SitePlayer = (function () {
  function init(videoId, coverId, src) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hls = null;
    var loaded = false;

    if (!video) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      loaded = true;
    }

    function start() {
      load();
      if (cover) {
        cover.classList.add("player-cover-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
      cover.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          start();
        }
      });
    }

    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  return {
    init: init
  };
})();
