const RATINGS = [
    {
        value: 1,
        label: "Çox pis",
        color: "#B91C1C",
        bg: "#FEF2F2"
    },
    {
        value: 2,
        label: "Pis",
        color: "#C05621",
        bg: "#FFF7ED"
    },
    {
        value: 3,
        label: "Orta",
        color: "#B8860B",
        bg: "#FDF6E3"
    },
    {
        value: 4,
        label: "Yaxşı",
        color: "#1D6FAB",
        bg: "#EFF8FF"
    },
    {
        value: 5,
        label: "Əla",
        color: "#1A6B3C",
        bg: "#E8F5EE"
    }
];

// null = nothing chosen / nothing previewed
let selectedRating = null;
let hoveredRating = null;
let submitted = false;

const starButtons = [];

const modal = document.getElementById("ratingModal");
const openBtn = document.getElementById("openRatingBtn");
const closeBtn = document.getElementById("closeModalBtn");

const starContainer = document.getElementById("starContainer");
const ratingChip = document.getElementById("ratingChip");
const ratingChipLabel = document.getElementById("ratingChipLabel");

const commentBox = document.getElementById("commentBox");
const charCounter = document.getElementById("charCounter");

const submitBtn = document.getElementById("submitBtn");

const successScreen = document.getElementById("successScreen");
const countdownBar = document.getElementById("countdownBar");

const modalBody = document.querySelector(".modal-body");

openBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

commentBox.addEventListener("input", () => {
    charCounter.textContent =
        `${commentBox.value.length} / 400`;
});

submitBtn.addEventListener("click", submitReview);

createStars();

function openModal() {
    modal.classList.add("show");
}

function closeModal() {
    modal.classList.remove("show");

    setTimeout(resetModal, 300);
}

function resetModal() {
    selectedRating = null;
    hoveredRating = null;
    submitted = false;

    commentBox.value = "";
    charCounter.textContent = "0 / 400";

    successScreen.classList.remove("show");
    countdownBar.classList.remove("show");

    modalBody.style.display = "block";

    updateRatingChip();
    updateSubmitButton();
    updateStars();
}

// Stars are built once; hover/selection only toggle classes on them, so the
// CSS transitions run instead of being destroyed by a re-render.
function createStars() {

    starContainer.innerHTML = "";
    starButtons.length = 0;

    RATINGS.forEach(rating => {

        const btn = document.createElement("button");

        btn.type = "button";
        btn.className = "star-btn";
        btn.dataset.value = rating.value;

        btn.setAttribute(
            "aria-label",
            `${rating.value} / 5 — ${rating.label}`
        );

        btn.setAttribute("aria-pressed", "false");

        btn.innerHTML = `
            <svg class="star-svg" viewBox="0 0 24 24">
                <polygon
                    points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                    stroke-width="1.5">
                </polygon>
            </svg>

            <span class="star-number">${rating.value}</span>
        `;

        btn.addEventListener("mouseenter", () => {
            previewRating(rating.value);
        });

        btn.addEventListener("focus", () => {
            previewRating(rating.value);
        });

        btn.addEventListener("click", () => {
            selectRating(rating.value, btn);
        });

        starButtons.push(btn);
        starContainer.appendChild(btn);
    });

    updateStars();
}

// One leave handler on the container, not on each star: moving from star 3 to
// star 4 never leaves the container, so the preview doesn't flash back to empty.
starContainer.addEventListener("mouseleave", clearPreview);

starContainer.addEventListener("focusout", (e) => {
    if (!starContainer.contains(e.relatedTarget)) {
        clearPreview();
    }
});

function previewRating(value) {

    if (hoveredRating === value) return;

    hoveredRating = value;

    updateStars();
    updateRatingChip();
}

function clearPreview() {

    if (hoveredRating === null) return;

    hoveredRating = null;

    updateStars();
    updateRatingChip();
}

function selectRating(value, btn) {

    selectedRating = value;

    // Restart the pop animation even if the same star is clicked twice.
    btn.classList.remove("bounce");
    void btn.offsetWidth;
    btn.classList.add("bounce");

    updateStars();
    updateRatingChip();
    updateSubmitButton();
}

function updateStars() {

    const active = hoveredRating ?? selectedRating;

    starButtons.forEach(btn => {

        const value = Number(btn.dataset.value);

        btn.classList.toggle("active", active !== null && value <= active);

        btn.classList.toggle("selected", value === selectedRating);

        btn.setAttribute(
            "aria-pressed",
            value === selectedRating ? "true" : "false"
        );
    });

    starContainer.classList.toggle("has-selection", selectedRating !== null);
}

function updateRatingChip() {

    const active = hoveredRating ?? selectedRating;

    if (active === null) {

        ratingChipLabel.textContent = "Ulduz seçin";

        ratingChipLabel.style.background = "transparent";
        ratingChipLabel.style.borderColor = "transparent";
        ratingChipLabel.style.color = "var(--text-muted)";

        return;
    }

    const meta = RATINGS[active - 1];

    ratingChipLabel.textContent =
        `${meta.value} / 5 — ${meta.label}`;

    ratingChipLabel.style.background = meta.bg;
    ratingChipLabel.style.borderColor = `${meta.color}33`;
    ratingChipLabel.style.color = meta.color;
}

function updateSubmitButton() {

    if (selectedRating !== null) {

        submitBtn.disabled = false;
        submitBtn.classList.add("active");

    } else {

        submitBtn.disabled = true;
        submitBtn.classList.remove("active");
    }
}

function submitReview() {

    if (selectedRating === null) return;

    submitted = true;

    modalBody.style.display = "none";

    successScreen.classList.add("show");
    countdownBar.classList.add("show");

    createSuccessRating();

    setTimeout(() => {
        closeModal();
    }, 5000);
}

function createSuccessRating() {

    const container =
        document.getElementById("successRating");

    const rating =
        RATINGS[selectedRating - 1];

    let starsHtml = "";

    for (let i = 1; i <= 5; i++) {

        starsHtml += `
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24">

                <polygon
                    points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                    fill="${
                        i <= selectedRating
                            ? '#663524'
                            : 'none'
                    }"
                    stroke="${
                        i <= selectedRating
                            ? '#4d2719'
                            : '#DDE6F0'
                    }">
                </polygon>

            </svg>
        `;
    }

    container.innerHTML = `
        <div
            style="
                display:inline-flex;
                flex-direction:column;
                align-items:center;
                gap:8px;
            ">

            <div
                style="
                    display:inline-flex;
                    align-items:center;
                    gap:8px;
                    border-radius:24px;
                    padding:7px 20px;
                    background:${rating.bg};
                    border:1px solid ${rating.color}33;
                ">

                <div
                    style="
                        display:flex;
                        gap:2px;
                    ">
                    ${starsHtml}
                </div>

                <span
                    style="
                        font-size:13px;
                        font-weight:700;
                        color:${rating.color};
                    ">
                    ${rating.label}
                </span>

            </div>

            <span
                style="
                    font-size:11px;
                    color:#5A7491;
                ">
                ${selectedRating} / 5 ulduz
            </span>

        </div>
    `;
}

// Guard against whitespace sneaking back between the <textarea> tags.
commentBox.value = commentBox.value.trim();
charCounter.textContent = `${commentBox.value.length} / 400`;

updateRatingChip();
updateSubmitButton();
