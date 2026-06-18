(function() {
    var menuButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.site-nav');
    var topSearch = document.querySelector('.top-search');

    if (menuButton && nav && topSearch) {
        menuButton.addEventListener('click', function() {
            nav.classList.toggle('open');
            topSearch.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach(function(dot, i) {
            dot.classList.toggle('active', i === index);
        });
    }

    function schedule() {
        if (slides.length < 2) {
            return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function() {
            showSlide(index + 1);
        }, 5200);
    }

    dots.forEach(function(dot, i) {
        dot.addEventListener('click', function() {
            showSlide(i);
            schedule();
        });
    });

    if (prev) {
        prev.addEventListener('click', function() {
            showSlide(index - 1);
            schedule();
        });
    }

    if (next) {
        next.addEventListener('click', function() {
            showSlide(index + 1);
            schedule();
        });
    }

    showSlide(0);
    schedule();

    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-card, .compact-card'));
    var localSearch = document.querySelector('[data-local-search]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var noResults = document.querySelector('[data-no-results]');
    var activeFilter = 'all';

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function cardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category'),
            card.textContent
        ].join(' '));
    }

    function applyFilters() {
        var query = normalize(localSearch ? localSearch.value : '');
        var shown = 0;
        cards.forEach(function(card) {
            var text = cardText(card);
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchFilter = activeFilter === 'all' || text.indexOf(normalize(activeFilter)) !== -1;
            var visible = matchQuery && matchFilter;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                shown += 1;
            }
        });
        if (noResults) {
            noResults.classList.toggle('show', shown === 0);
        }
    }

    if (localSearch) {
        localSearch.addEventListener('input', applyFilters);
    }

    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            activeFilter = button.getAttribute('data-filter') || 'all';
            filterButtons.forEach(function(item) {
                item.classList.toggle('active', item === button);
            });
            applyFilters();
        });
    });

    var params = new URLSearchParams(window.location.search);
    var queryParam = params.get('q');
    if (queryParam && localSearch) {
        localSearch.value = queryParam;
        applyFilters();
    }
})();
