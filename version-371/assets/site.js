(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-site-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-slider]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearchPanels() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-search-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
            var cards = Array.prototype.slice.call(panel.querySelectorAll(".searchable-card"));
            var empty = panel.querySelector("[data-empty-state]");
            var active = "all";

            function apply() {
                var query = normalize(input ? input.value : "");
                var activeText = normalize(active);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-category")
                    ].join(" "));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesFilter = active === "all" || haystack.indexOf(activeText) !== -1;
                    var show = matchesQuery && matchesFilter;
                    card.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    active = button.getAttribute("data-filter-value") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });

            apply();
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearchPanels();
    });
})();
