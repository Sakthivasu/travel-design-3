

/* =========================================================
   VELMORA HOTELS & RESORTS
   DESIGN 03 - LUXURY PURPLE EDITION
   Main JavaScript
========================================================= */

"use strict";


/* =========================================================
   01. COMMON HELPERS
========================================================= */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));


function safeStorageSet(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn("Session storage is unavailable.");
    }
}


function safeStorageGet(key) {
    try {
        const value = sessionStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        return null;
    }
}


function safeStorageRemove(key) {
    try {
        sessionStorage.removeItem(key);
    } catch (error) {
        // Storage is optional.
    }
}


function showToast(message, type = "success") {
    const toast = $("#toast");
    const toastMessage = $("#toast-message");

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    const icon = $(".toast-icon i", toast);

    if (icon) {
        icon.className = type === "error"
            ? "fa-solid fa-circle-exclamation"
            : "fa-solid fa-circle-check";
    }

    toast.classList.add("show");

    clearTimeout(showToast.timeout);

    showToast.timeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}


function getBookingUrl(data = {}) {
    const params = new URLSearchParams();

    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            params.set(key, String(value));
        }
    });

    const query = params.toString();

    return query
        ? `booking.html?${query}#booking-section`
        : "booking.html#booking-section";
}


function navigateToBooking(data = {}) {
    safeStorageSet("velmoraBookingData", data);
    window.location.href = getBookingUrl(data);
}


function formatDate(dateString) {
    if (!dateString) return "Not selected";

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return "Not selected";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function scrollToElement(element) {
    if (!element) return;

    element.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        block: "start"
    });
}


/* =========================================================
   02. PRELOADER
========================================================= */

function initPreloader() {
    const preloader = $("#preloader");
    const progressBar = $("#preloader-progress-bar");
    const percentage = $("#preloader-percent");
    const message = $("#preloader-message");

    if (!preloader) return;

    document.body.classList.add("is-loading");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const messages = [
        "Preparing your experience...",
        "Discovering beautiful destinations...",
        "Creating your perfect stay...",
        "Welcome to VELMORA."
    ];
    const duration = reducedMotion ? 180 : 1150;
    const startedAt = performance.now();
    let rafId = 0;
    let finished = false;

    function updateProgress(value) {
        const progress = Math.max(0, Math.min(100, value));
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (percentage) percentage.textContent = `${Math.round(progress)}%`;
        if (message) {
            const index = Math.min(Math.floor(progress / 26), messages.length - 1);
            message.textContent = messages[index];
        }
    }

    function finish() {
        if (finished) return;
        finished = true;
        if (rafId) cancelAnimationFrame(rafId);
        updateProgress(100);
        // A short pause lets the completed state register without making navigation feel slow.
        window.setTimeout(() => {
            preloader.classList.add("preloader-hidden", "is-hidden");
            document.body.classList.remove("is-loading");
            window.setTimeout(() => {
                preloader.style.display = "none";
            }, reducedMotion ? 0 : 520);
        }, reducedMotion ? 0 : 90);
    }

    function animate(now) {
        if (finished) return;
        const elapsed = now - startedAt;
        const ratio = Math.min(elapsed / duration, 1);
        // Ease-out progress; all pages use the same fixed duration.
        updateProgress(100 * (1 - Math.pow(1 - ratio, 2)));
        if (ratio >= 1) finish();
        else rafId = requestAnimationFrame(animate);
    }

    // Start immediately after DOM is ready; images and remote fonts must not hold the loader.
    updateProgress(0);
    rafId = requestAnimationFrame(animate);
    // Safety fallback for devices where animation frames are throttled.
    window.setTimeout(finish, duration + 700);
}

/* =========================================================
   03. PAGE TRANSITIONS
========================================================= */

function initPageTransitions() {
    // The sliding purple wipe was removed: links now navigate directly.
    // On back/forward restores make sure no overlay or menu state lingers.
    window.addEventListener("pageshow", () => {
        const transition = $("#page-transition");
        if (transition) transition.classList.remove("active");

        document.body.classList.remove("menu-open");
        $("#main-nav")?.classList.remove("active");
        $("#menu-toggle")?.classList.remove("active");

        const pre = $("#preloader");
        if (pre && pre.classList.contains("preloader-hidden")) {
            pre.style.display = "none";
        }
    });
}


/* =========================================================
   04. MOBILE NAVIGATION
========================================================= */

function initMobileNavigation() {
    const menuToggle = $("#menu-toggle");
    const mainNav = $("#main-nav");

    if (!menuToggle || !mainNav) return;

    function closeMenu() {
        menuToggle.classList.remove("active");
        mainNav.classList.remove("active");
        document.body.classList.remove("menu-open");

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
    }

    function openMenu() {
        menuToggle.classList.add("active");
        mainNav.classList.add("active");
        document.body.classList.add("menu-open");

        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "Close navigation");
    }

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");

    menuToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.contains("active");

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    $$(".nav-link", mainNav).forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", event => {
        if (
            mainNav.classList.contains("active") &&
            !mainNav.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
}


/* =========================================================
   05. STICKY HEADER & ACTIVE NAVIGATION
========================================================= */

function initHeader() {
    const header = $("#site-header");

    if (!header) return;

    function updateHeader() {
        header.classList.toggle("scrolled", window.scrollY > 50);
    }

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
        passive: true
    });

    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase() || "index.html";

    $$(".main-nav .nav-link").forEach(link => {
        const href = link.getAttribute("href");

        if (!href) return;

        const linkPage = href.split("#")[0].split("?")[0].toLowerCase();

        if (linkPage === currentPage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        } else {
            link.classList.remove("active");
            link.removeAttribute("aria-current");
        }
    });
}


/* =========================================================
   06. SCROLL REVEAL ANIMATIONS
========================================================= */

function initScrollReveal() {
    const revealElements = $$(".reveal");

    if (!revealElements.length) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
        reducedMotion ||
        !("IntersectionObserver" in window)
    ) {
        revealElements.forEach(element => {
            element.classList.add("revealed");
        });

        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                currentObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
    });

    revealElements.forEach(element => {
        observer.observe(element);
    });

    // Backup check: reveals anything already inside the viewport, so content
    // can never stay hidden if an observer callback is delayed or skipped.
    let ticking = false;

    function revealVisible() {
        ticking = false;
        const limit = window.innerHeight * 0.94;

        revealElements.forEach(element => {
            if (element.classList.contains("revealed")) return;

            const rect = element.getBoundingClientRect();

            if (rect.top < limit && rect.bottom > 0) {
                element.classList.add("revealed");
                observer.unobserve(element);
            }
        });
    }

    function requestReveal() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(revealVisible);
    }

    window.addEventListener("scroll", requestReveal, { passive: true });
    window.addEventListener("resize", requestReveal);
    window.addEventListener("load", requestReveal);
    window.setTimeout(requestReveal, 300);
}


/* =========================================================
   07. BACK TO TOP
========================================================= */

function initBackToTop() {
    const button = $("#back-to-top");

    if (!button) return;

    function updateButton() {
        button.classList.toggle("visible", window.scrollY > 450);
    }

    updateButton();

    window.addEventListener("scroll", updateButton, {
        passive: true
    });

    button.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth"
        });
    });
}


/* =========================================================
   08. SMOOTH ANCHOR SCROLLING
========================================================= */

function initSmoothAnchors() {
    $$('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const href = link.getAttribute("href");

            if (!href || href === "#") return;

            const target = $(href);

            if (!target) return;

            event.preventDefault();
            scrollToElement(target);
        });
    });
}


/* =========================================================
   09. CURRENT YEAR
========================================================= */

function initCurrentYear() {
    const yearElement = $("#current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}


/* =========================================================
   10. IMAGE LOAD EFFECT
========================================================= */

function initImageEffects() {
    $$("img").forEach(img => {
        if (img.complete && img.naturalWidth > 0) {
            img.classList.add("image-loaded");
        } else {
            img.addEventListener("load", () => {
                img.classList.add("image-loaded");
            }, { once: true });
        }
    });
}


/* =========================================================
   11. HOME QUICK BOOKING
========================================================= */

function initQuickBooking() {
    const form = $("#quick-booking-form");

    if (!form) return;

    const destination = $("#home-destination");
    const checkIn = $("#home-checkin");
    const checkOut = $("#home-checkout");
    const guests = $("#home-guests");

    const today = getTodayDate();

    if (checkIn) {
        checkIn.min = today;
    }

    if (checkOut) {
        checkOut.min = today;
    }

    if (checkIn && checkOut) {
        checkIn.addEventListener("change", () => {
            checkOut.min = checkIn.value || today;

            if (
                checkOut.value &&
                checkIn.value &&
                checkOut.value <= checkIn.value
            ) {
                checkOut.value = "";
            }
        });
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        if (
            checkIn?.value &&
            checkOut?.value &&
            checkOut.value <= checkIn.value
        ) {
            showToast("Check-out date must be after check-in date.", "error");
            checkOut.focus();
            return;
        }

        const data = {
            destination: destination?.value || "",
            checkIn: checkIn?.value || "",
            checkOut: checkOut?.value || "",
            adults: guests?.value || "2"
        };

        navigateToBooking(data);
    });
}


/* =========================================================
   12. HOTEL FILTERS & SEARCH
========================================================= */

function initHotelFilters() {
    const hotelGrid = $("#hotel-grid");

    if (!hotelGrid) return;

    const cards = $$(".hotel-card", hotelGrid);
    const destinationSelect = $("#hotel-destination");
    const typeSelect = $("#hotel-type");
    const searchButton = $("#hotel-search-btn");
    const filterButtons = $$(".hotel-filter-btn[data-hotel-filter]");
    const resultCount = $("#hotel-results-count");
    const emptyMessage = $("#hotel-empty-message");

    let activeDestination = destinationSelect?.value || "all";
    let activeType = typeSelect?.value || "all";

    function updateHotelResults() {
        let visibleCount = 0;

        cards.forEach(card => {
            const cardDestination = (
                card.dataset.destination || ""
            ).toLowerCase();

            const cardType = (
                card.dataset.type || ""
            ).toLowerCase();

            const destinationMatches =
                activeDestination === "all" ||
                cardDestination === activeDestination;

            const typeMatches =
                activeType === "all" ||
                cardType === activeType;

            const isVisible = destinationMatches && typeMatches;

            card.classList.toggle("filtered-out", !isVisible);

            if (isVisible) visibleCount++;
        });

        if (resultCount) {
            resultCount.textContent =
                `${visibleCount} ${visibleCount === 1 ? "hotel" : "hotels"} found`;
        }

        if (emptyMessage) {
            emptyMessage.hidden = visibleCount !== 0;
        }

        filterButtons.forEach(button => {
            const filter = button.dataset.hotelFilter;

            button.classList.toggle(
                "active",
                filter === activeDestination
            );
        });
    }

    if (searchButton) {
        searchButton.addEventListener("click", () => {
            activeDestination = destinationSelect?.value || "all";
            activeType = typeSelect?.value || "all";

            updateHotelResults();
        });
    }

    if (destinationSelect) {
        destinationSelect.addEventListener("change", () => {
            activeDestination = destinationSelect.value || "all";
            updateHotelResults();
        });
    }

    if (typeSelect) {
        typeSelect.addEventListener("change", () => {
            activeType = typeSelect.value || "all";
            updateHotelResults();
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeDestination = button.dataset.hotelFilter || "all";

            if (destinationSelect) {
                destinationSelect.value = activeDestination;
            }

            updateHotelResults();
        });
    });

    updateHotelResults();
}


/* =========================================================
   13. ROOM FILTERS
========================================================= */

function initRoomFilters() {
    const roomGrid = $(".room-grid");

    if (!roomGrid) return;

    const roomCards = $$(".room-card", roomGrid);
    const filterButtons = $$(".room-filter-btn[data-filter]");
    const emptyMessage = $("#room-empty-message");

    let activeFilter = "all";

    function updateRooms() {
        let visibleCount = 0;

        roomCards.forEach(card => {
            const categories = (
                card.dataset.category || ""
            ).toLowerCase().split(/\s+/);

            const isVisible =
                activeFilter === "all" ||
                categories.includes(activeFilter);

            card.classList.toggle("filtered-out", !isVisible);

            if (isVisible) visibleCount++;
        });

        filterButtons.forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.filter === activeFilter
            );
        });

        if (emptyMessage) {
            emptyMessage.hidden = visibleCount > 0;
        }
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter || "all";
            updateRooms();
        });
    });

    updateRooms();
}


/* =========================================================
   14. ROOM WISHLIST
========================================================= */

function initRoomWishlist() {
    const wishlistButtons = $$(".wishlist-btn");

    wishlistButtons.forEach(button => {
        button.addEventListener("click", () => {
            const isActive = button.classList.toggle("active");

            button.setAttribute("aria-pressed", String(isActive));

            const icon = $("i", button);

            if (icon) {
                icon.classList.toggle("fa-regular", !isActive);
                icon.classList.toggle("fa-solid", isActive);
            }

            showToast(
                isActive
                    ? "Room added to your wishlist."
                    : "Room removed from your wishlist."
            );
        });
    });
}


/* =========================================================
   15. ROOM SELECTION
========================================================= */

function initRoomSelection() {
    $$("[data-room]").forEach(link => {
        link.addEventListener("click", event => {
            const roomName = link.dataset.room;

            if (!roomName) return;

            event.preventDefault();

            const data = {
                room: roomName
            };

            const roomCard = link.closest(".room-card");

            const roomTitle = roomCard
                ? $("h3", roomCard)?.textContent.trim()
                : "";

            if (roomTitle) {
                data.roomName = roomTitle;
            }

            navigateToBooking(data);
        });
    });
}


/* =========================================================
   16. OFFER FILTERS
========================================================= */

function initOfferFilters() {
    const offerGrid = $("#offer-grid");

    if (!offerGrid) return;

    const offerCards = $$(".offer-card", offerGrid);
    const filterButtons = $$(".offer-filter-btn[data-offer-filter]");
    const emptyMessage = $("#offer-empty-message");

    let activeFilter = "all";

    function updateOffers() {
        let visibleCount = 0;

        offerCards.forEach(card => {
            const category = (
                card.dataset.offerCategory || ""
            ).toLowerCase();

            const isVisible =
                activeFilter === "all" ||
                category === activeFilter;

            card.classList.toggle("filtered-out", !isVisible);

            if (isVisible) visibleCount++;
        });

        filterButtons.forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.offerFilter === activeFilter
            );
        });

        if (emptyMessage) {
            emptyMessage.hidden = visibleCount > 0;
        }
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.offerFilter || "all";
            updateOffers();
        });
    });

    updateOffers();
}


/* =========================================================
   17. OFFER SELECTION
========================================================= */

function initOfferSelection() {
    $$("[data-offer]").forEach(button => {
        button.addEventListener("click", event => {
            const offerName = button.dataset.offer;

            if (!offerName) return;

            event.preventDefault();

            navigateToBooking({
                offer: offerName
            });
        });
    });
}


/* =========================================================
   18. BOOKING FORM - DATE VALIDATION
========================================================= */

function initBookingDates() {
    const checkIn = $("#check-in");
    const checkOut = $("#check-out");

    if (!checkIn || !checkOut) return;

    const today = getTodayDate();

    checkIn.min = today;
    checkOut.min = today;

    function updateCheckoutMinimum() {
        checkOut.min = checkIn.value || today;

        if (
            checkIn.value &&
            checkOut.value &&
            checkOut.value <= checkIn.value
        ) {
            checkOut.setCustomValidity(
                "Check-out must be after check-in."
            );
        } else {
            checkOut.setCustomValidity("");
        }
    }

    checkIn.addEventListener("change", updateCheckoutMinimum);

    checkOut.addEventListener("change", updateCheckoutMinimum);

    updateCheckoutMinimum();
}


/* =========================================================
   19. BOOKING SUMMARY - LIVE UPDATE
========================================================= */

function initBookingSummary() {
    const summaryDestination = $("#summary-destination");

    if (!summaryDestination) return;

    const fields = {
        destination: $("#destination"),
        hotel: $("#hotel"),
        checkIn: $("#check-in"),
        checkOut: $("#check-out"),
        adults: $("#adults"),
        children: $("#children"),
        room: $("#room-type"),
        offer: $("#special-offer")
    };

    const summary = {
        destination: $("#summary-destination"),
        hotel: $("#summary-hotel"),
        checkIn: $("#summary-checkin"),
        checkOut: $("#summary-checkout"),
        guests: $("#summary-guests"),
        room: $("#summary-room"),
        offer: $("#summary-offer")
    };

    function selectedText(element, fallback = "Not selected") {
        if (!element || !element.value) return fallback;

        if (element.tagName === "SELECT") {
            const selectedOption =
                element.options[element.selectedIndex];

            return selectedOption?.textContent.trim() || fallback;
        }

        return element.value;
    }

    function updateSummary() {
        if (summary.destination) {
            summary.destination.textContent =
                selectedText(fields.destination);
        }

        if (summary.hotel) {
            summary.hotel.textContent =
                selectedText(fields.hotel);
        }

        if (summary.checkIn) {
            summary.checkIn.textContent =
                formatDate(fields.checkIn?.value);
        }

        if (summary.checkOut) {
            summary.checkOut.textContent =
                formatDate(fields.checkOut?.value);
        }

        if (summary.guests) {
            const adults = Number(fields.adults?.value || 0);
            const children = Number(fields.children?.value || 0);

            const total = adults + children;

            summary.guests.textContent =
                `${total} ${total === 1 ? "Guest" : "Guests"}`;
        }

        if (summary.room) {
            summary.room.textContent =
                selectedText(fields.room);
        }

        if (summary.offer) {
            summary.offer.textContent =
                selectedText(fields.offer, "No offer selected");
        }
    }

    Object.values(fields).forEach(field => {
        if (!field) return;

        field.addEventListener("input", updateSummary);
        field.addEventListener("change", updateSummary);
    });

    updateSummary();
}


/* =========================================================
   20. BOOKING FORM - PREFILL FROM OTHER PAGES
========================================================= */

function initBookingPrefill() {
    const bookingForm = $("#booking-form");

    if (!bookingForm) return;

    const storedData = safeStorageGet("velmoraBookingData") || {};
    const params = new URLSearchParams(window.location.search);

    const data = {
        ...storedData
    };

    [
        "destination",
        "hotel",
        "checkIn",
        "checkOut",
        "adults",
        "children",
        "rooms",
        "room",
        "roomName",
        "offer"
    ].forEach(key => {
        if (params.has(key)) {
            data[key] = params.get(key);
        }
    });

    function setFieldValue(id, value) {
        const field = $(`#${id}`);

        if (!field || value === undefined || value === null || value === "") {
            return;
        }

        const targetValue = String(value);

        if (field.tagName === "SELECT") {
            const matchingOption = Array.from(field.options).find(option =>
                option.value.toLowerCase() === targetValue.toLowerCase() ||
                option.textContent.trim().toLowerCase() === targetValue.toLowerCase()
            );

            if (matchingOption) {
                field.value = matchingOption.value;
            }
        } else {
            field.value = targetValue;
        }

        field.dispatchEvent(new Event("change", {
            bubbles: true
        }));
    }

    setFieldValue("destination", data.destination);
    setFieldValue("hotel", data.hotel);
    setFieldValue("check-in", data.checkIn);
    setFieldValue("check-out", data.checkOut);
    setFieldValue("adults", data.adults);
    setFieldValue("children", data.children);
    setFieldValue("rooms-count", data.rooms);

    if (data.room) {
        setFieldValue("room-type", data.room);
    } else if (data.roomName) {
        setFieldValue("room-type", data.roomName);
    }

    if (data.offer) {
        setFieldValue("special-offer", data.offer);
    }

    safeStorageRemove("velmoraBookingData");

    const summarySection = $("#booking-section");

    if (summarySection && window.location.hash === "#booking-section") {
        setTimeout(() => {
            scrollToElement(summarySection);
        }, 500);
    }
}


/* =========================================================
   21. BOOKING FORM - SUBMISSION
========================================================= */

function initBookingSubmission() {
    const bookingForm = $("#booking-form");
    if (!bookingForm) return;

    const checkIn = $("#check-in");
    const checkOut = $("#check-out");
    const bookingLayout = $(".booking-layout");
    const successPanel = $("#booking-success");
    const submitButton = $("#booking-submit-btn");

    bookingForm.addEventListener("submit", event => {
        event.preventDefault();

        if (checkIn?.value && checkOut?.value && checkOut.value <= checkIn.value) {
            checkOut.setCustomValidity("Check-out date must be after check-in.");
            checkOut.reportValidity();
            checkOut.focus();
            return;
        }
        checkOut?.setCustomValidity("");
        if (!bookingForm.reportValidity()) return;

        const value = id => $(`#${id}`)?.value?.trim() || "Not provided";
        const selected = id => {
            const field = $(`#${id}`);
            if (!field) return "Not selected";
            return field.options ? (field.options[field.selectedIndex]?.textContent.trim() || "Not selected") : (field.value || "Not selected");
        };
        const fullName = value("full-name");
        const reference = `VEL-DEMO-${Math.floor(10000 + Math.random() * 90000)}`;
        const put = (id, text) => { const el = $(`#${id}`); if (el) el.textContent = text; };

        put("success-reference", reference);
        put("success-guest", fullName);
        put("success-destination", selected("destination"));
        put("success-hotel", selected("hotel"));
        put("success-checkin", formatDate(value("check-in")));
        put("success-checkout", formatDate(value("check-out")));

        if (bookingLayout) bookingLayout.hidden = true;
        if (successPanel) {
            successPanel.hidden = false;
            successPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        showToast("Thank you! Your demo booking request is complete.");
    });

    $("#book-another-stay")?.addEventListener("click", () => {
        bookingForm.reset();
        if (bookingLayout) bookingLayout.hidden = false;
        if (successPanel) successPanel.hidden = true;
        initBookingSummaryRefresh();
        bookingForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

function initBookingSummaryRefresh() {
    ["destination", "hotel", "check-in", "check-out", "adults", "children", "room-type", "special-offer"].forEach(id => {
        const field = $(`#${id}`);
        if (field) field.dispatchEvent(new Event("change", { bubbles: true }));
    });
}

/* =========================================================
   22. NEWSLETTER FORM
========================================================= */

function initNewsletter() {
    const newsletterForms = $$(".newsletter-form");

    newsletterForms.forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();

            if (!form.reportValidity()) return;

            showToast(
                "Thank you for your interest in VELMORA! Newsletter signup is a demo."
            );

            form.reset();
        });
    });
}


/* =========================================================
   23. TESTIMONIAL SLIDER
========================================================= */

function initTestimonials() {
    const track = $(".testimonial-track");

    if (!track) return;

    const slides = $$(".testimonial-slide", track);
    const previousButton = $(".testimonial-prev");
    const nextButton = $(".testimonial-next");

    if (!slides.length) return;

    let currentIndex = 0;

    function showSlide(index) {
        currentIndex = (index + slides.length) % slides.length;

        track.style.transform =
            `translateX(-${currentIndex * 100}%)`;

        slides.forEach((slide, slideIndex) => {
            slide.setAttribute(
                "aria-hidden",
                String(slideIndex !== currentIndex)
            );
        });
    }

    if (previousButton) {
        previousButton.addEventListener("click", () => {
            showSlide(currentIndex - 1);
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            showSlide(currentIndex + 1);
        });
    }

    showSlide(0);
}


/* =========================================================
   24. FAQ ACCORDION
========================================================= */

function initFAQ() {
    $$(".faq-item").forEach(item => {
        const question = $(".faq-question", item);
        const answer = $(".faq-answer", item);

        if (!question || !answer) return;

        question.setAttribute("aria-expanded", "false");

        answer.style.maxHeight = "0px";

        question.addEventListener("click", () => {
            const isActive = item.classList.contains("active");

            $$(".faq-item").forEach(otherItem => {
                otherItem.classList.remove("active");

                const otherQuestion = $(".faq-question", otherItem);
                const otherAnswer = $(".faq-answer", otherItem);

                if (otherQuestion) {
                    otherQuestion.setAttribute("aria-expanded", "false");
                }

                if (otherAnswer) {
                    otherAnswer.style.maxHeight = "0px";
                }
            });

            if (!isActive) {
                item.classList.add("active");
                question.setAttribute("aria-expanded", "true");
                answer.style.maxHeight = `${answer.scrollHeight}px`;
            }
        });
    });
}


/* =========================================================
   25. OPTIONAL GUEST COUNTER
========================================================= */

function initGuestCounter() {
    const counters = $$("[data-guest-counter]");

    counters.forEach(counter => {
        const input = $("input", counter);
        const decrease = $('[data-counter-action="decrease"]', counter);
        const increase = $('[data-counter-action="increase"]', counter);

        if (!input) return;

        const min = Number(input.min || 1);
        const max = Number(input.max || 20);

        function update(value) {
            const nextValue = Math.min(
                max,
                Math.max(min, Number(value) || min)
            );

            input.value = nextValue;
            input.dispatchEvent(new Event("change", {
                bubbles: true
            }));
        }

        decrease?.addEventListener("click", () => {
            update(Number(input.value) - 1);
        });

        increase?.addEventListener("click", () => {
            update(Number(input.value) + 1);
        });
    });
}


/* =========================================================
   26. OPTIONAL PARALLAX
========================================================= */

function initParallax() {
    const elements = $$("[data-parallax]");

    if (!elements.length) return;

    if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
        return;
    }

    let ticking = false;

    function updateParallax() {
        const scrollPosition = window.scrollY;

        elements.forEach(element => {
            const speed = Number(element.dataset.parallax || 0.12);
            const rect = element.getBoundingClientRect();

            if (
                rect.bottom < 0 ||
                rect.top > window.innerHeight
            ) {
                return;
            }

            const offset = (rect.top + scrollPosition) * speed;

            element.style.transform =
                `translate3d(0, ${offset * -0.15}px, 0)`;
        });

        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
}


/* =========================================================
   27. CONTACT / FORM FALLBACK
========================================================= */

function initGenericForms() {
    $$("form[data-demo-form]").forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();

            if (!form.reportValidity()) return;

            showToast("Thank you! This form is currently a demo.");
            form.reset();
        });
    });
}


/* =========================================================
   28. INITIALIZE EVERYTHING
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initPreloader();

    initPageTransitions();

    initMobileNavigation();

    initHeader();

    initScrollReveal();

    initBackToTop();

    initSmoothAnchors();

    initCurrentYear();

    initImageEffects();

    initQuickBooking();

    initHotelFilters();

    initRoomFilters();

    initRoomWishlist();

    initRoomSelection();

    initOfferFilters();

    initOfferSelection();

    initBookingDates();

    initBookingPrefill();

    initBookingSummary();

    initBookingSubmission();

    initNewsletter();

    initTestimonials();

    initFAQ();

    initGuestCounter();

    initParallax();

    initGenericForms();

});


/* =========================================================
   END OF VELMORA SCRIPT
========================================================= */
