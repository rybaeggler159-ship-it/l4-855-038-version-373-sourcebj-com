(function() {
    var configNode = document.getElementById('playerConfig');
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playOverlay');
    if (!configNode || !video || !overlay) {
        return;
    }

    var config = {};
    try {
        config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
        config = {};
    }

    var src = config.src || '';
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
        if (prepared || !src) {
            return;
        }
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            return;
        }
        video.src = src;
    }

    function play() {
        prepare();
        overlay.classList.add('is-hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function() {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function() {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener('play', function() {
        overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function() {
        if (!video.ended) {
            overlay.classList.remove('is-hidden');
        }
    });
    window.addEventListener('beforeunload', function() {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
