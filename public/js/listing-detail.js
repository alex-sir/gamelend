// public/js/listing-detail.js

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Share Link Functionality (Inline Feedback) ---
  const shareBtn = document.getElementById("shareListingBtn");

  if (shareBtn) {
    const originalHtml = shareBtn.innerHTML;
    let copyTimeout;

    shareBtn.addEventListener("click", () => {
      const url = window.location.href;

      navigator.clipboard
        .writeText(url)
        .then(() => {
          if (copyTimeout) {
            clearTimeout(copyTimeout);
          }

          shareBtn.innerHTML =
            '<i class="bi bi-check-circle-fill me-2"></i>Link copied!';
          shareBtn.classList.replace("btn-alternate", "btn-success");

          copyTimeout = setTimeout(() => {
            shareBtn.innerHTML = originalHtml;
            shareBtn.classList.replace("btn-success", "btn-alternate");
            copyTimeout = null;
          }, 2500);
        })
        .catch((error) => {
          console.error("Error copying link:", error);
        });
    });
  }

  // --- 2. View as Borrower Perspective Toggle (UC-L04) ---
  const toggleViewBtn = document.getElementById("toggleBorrowerViewBtn");
  const lenderPanels = document.querySelectorAll(".lender-only-panel");
  const borrowerViewBanner = document.getElementById("borrowerViewBanner");

  if (toggleViewBtn) {
    toggleViewBtn.addEventListener("click", function () {
      const isBorrowerView = this.classList.toggle("is-borrower-view");

      if (isBorrowerView) {
        this.innerHTML =
          '<i class="bi bi-eye-slash me-2"></i>Return to Lender View';
        this.classList.replace("btn-outline-info", "btn-info");
        this.classList.replace("text-info", "text-dark");

        borrowerViewBanner.classList.remove("d-none");

        lenderPanels.forEach((panel) => (panel.style.display = "none"));
      } else {
        this.innerHTML = '<i class="bi bi-eye me-2"></i>View as Borrower';
        this.classList.replace("btn-info", "btn-outline-info");
        this.classList.replace("text-dark", "text-info");

        borrowerViewBanner.classList.add("d-none");

        lenderPanels.forEach((panel) => (panel.style.display = "block"));
      }
    });
  }

  // --- 3. Carousel Image Counter Logic ---
  const listingCarousel = document.getElementById("listingCarousel");
  const currentImageIndex = document.getElementById("currentImageIndex");

  if (listingCarousel && currentImageIndex) {
    // Listen for the slide event to update the counter text
    listingCarousel.addEventListener("slide.bs.carousel", (event) => {
      // event.to gives the zero-based index of the newly active item
      currentImageIndex.textContent = event.to + 1;
    });
  }
});
