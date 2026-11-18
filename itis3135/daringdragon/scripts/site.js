/*! site.js | Daring Dragon dynamic features:
    1. Home slideshow of print photos (prev/next controls)
    2. Hoard category filter for the product cards
    3. Commission price estimator (live total as options change)
    Each feature initializes only if its markup is on the current page. */

document.addEventListener("DOMContentLoaded", function () {

    /* --- 1. Slideshow (home page) --- */

    const frame = document.querySelector(".slide-frame img");
    const caption = document.querySelector(".slide-caption");
    if (frame && caption) {
        const slides = [
            { src: "images/mini-ember.jpg", text: "Ember Wyrmling — the starter dragon, printed in ember orange." },
            { src: "images/mini-gold.jpg", text: "Hoard Dragon — same sculpt, poured in aged-gold filament." },
            { src: "images/mini-forest.jpg", text: "Forest Guardian — the wyrmling in a moss-green run." }
        ];
        let slide = 0;

        function showSlide() {
            frame.src = slides[slide].src;
            caption.textContent = slides[slide].text;
        }

        document.getElementById("slide-prev").addEventListener("click", function () {
            slide = (slide + slides.length - 1) % slides.length;
            showSlide();
        });

        document.getElementById("slide-next").addEventListener("click", function () {
            slide = (slide + 1) % slides.length;
            showSlide();
        });

        showSlide();
    }

    /* --- 2. Hoard category filter --- */

    const filterRow = document.querySelector(".filter-row");
    const cards = document.querySelectorAll(".hoard-card");
    if (filterRow && cards.length) {
        filterRow.addEventListener("click", function (event) {
            const button = event.target.closest(".filter-button");
            if (!button) {
                return;
            }
            const kind = button.dataset.kind;
            filterRow.querySelectorAll(".filter-button").forEach(function (b) {
                b.classList.toggle("filter-on", b === button);
            });
            cards.forEach(function (card) {
                const show = kind === "all" || card.dataset.kind === kind;
                card.style.display = show ? "" : "none";
            });
        });
    }

    /* --- 3. Commission price estimator --- */

    const sizeSelect = document.getElementById("estimate-size");
    const finishSelect = document.getElementById("estimate-finish");
    const totalOut = document.getElementById("estimate-total");
    if (sizeSelect && finishSelect && totalOut) {
        const PRICES = { wyrmling: 15, adult: 30, ancient: 60 };
        const FINISHES = { unpainted: 0, painted: 20 };

        function updateTotal() {
            const base = PRICES[sizeSelect.value] || 0;
            const finish = FINISHES[finishSelect.value] || 0;
            totalOut.textContent = "$" + (base + finish);
        }

        sizeSelect.addEventListener("change", updateTotal);
        finishSelect.addEventListener("change", updateTotal);
        updateTotal();
    }
});
