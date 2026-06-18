(function () {
    window.setupMoviePlayer = function (elementId, streamUrl) {
        var box = document.getElementById(elementId);
        if (!box) {
            return;
        }

        var video = box.querySelector("video");
        var cover = box.querySelector(".player-cover");
        var playButtons = Array.prototype.slice.call(box.querySelectorAll("[data-player-play]"));
        var muteButton = box.querySelector("[data-player-mute]");
        var fullButton = box.querySelector("[data-player-full]");
        var hls = null;
        var attached = false;

        function attach() {
            if (!video || attached) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else {
                video.src = streamUrl;
            }

            attached = true;
        }

        function start() {
            if (!video) {
                return;
            }
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        function toggle() {
            if (!video) {
                return;
            }
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        }

        function setPlayState() {
            if (!video) {
                return;
            }
            playButtons.forEach(function (button) {
                button.textContent = video.paused ? "▶" : "Ⅱ";
            });
        }

        playButtons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                toggle();
            });
        });

        if (cover) {
            cover.addEventListener("click", function (event) {
                event.preventDefault();
                start();
            });
        }

        if (video) {
            video.addEventListener("click", toggle);
            video.addEventListener("play", setPlayState);
            video.addEventListener("pause", setPlayState);
            video.addEventListener("ended", setPlayState);
        }

        if (muteButton && video) {
            muteButton.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? "静音" : "音量";
            });
        }

        if (fullButton && video) {
            fullButton.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                } else if (box.requestFullscreen) {
                    box.requestFullscreen();
                }
            });
        }

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });

        setPlayState();
    };
})();
