document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    document.querySelectorAll(".hero-slider").forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
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
                var index = Number(dot.getAttribute("data-slide-target") || 0);
                show(index);
                restart();
            });
        });

        show(0);
        restart();
    });

    document.querySelectorAll("[data-filter-section]").forEach(function (section) {
        var searchInput = section.querySelector("[data-search-input]");
        var yearFilter = section.querySelector("[data-year-filter]");
        var categoryFilter = section.querySelector("[data-category-filter]");
        var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
        var emptyState = section.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function applyFilters() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var year = yearFilter ? yearFilter.value : "";
            var category = categoryFilter ? categoryFilter.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = card.getAttribute("data-search") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var cardCategory = card.getAttribute("data-category") || "";
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                if (category && cardCategory !== category) {
                    matched = false;
                }

                card.style.display = matched ? "" : "none";

                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        [searchInput, yearFilter, categoryFilter].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    });

    document.querySelectorAll(".player-shell").forEach(function (player) {
        var video = player.querySelector("video");
        var start = player.querySelector(".player-start");
        var source = player.getAttribute("data-hls");
        var loaded = false;
        var hls = null;

        function attachSource() {
            if (!video || !source || loaded) {
                return;
            }

            loaded = true;

            if (typeof Hls !== "undefined" && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            attachSource();

            if (start) {
                start.classList.add("is-hidden");
            }

            if (video) {
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }
        }

        if (start) {
            start.addEventListener("click", function (event) {
                event.preventDefault();
                playVideo();
            });
        }

        if (video) {
            video.addEventListener("play", function () {
                if (start) {
                    start.classList.add("is-hidden");
                }
            });
        }

        player.addEventListener("click", function (event) {
            if (event.target === player) {
                playVideo();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
});
