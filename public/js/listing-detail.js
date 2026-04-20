// public/js/listing-detail.js

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Share Link Functionality (With visual feedback) ---
  const shareBtn = document.getElementById("shareListingBtn");

  if (shareBtn) {
    const originalHtml = shareBtn.innerHTML;
    let copyTimeout;

    shareBtn.addEventListener("click", () => {
      // Generate the public URL regardless of lender URL structure
      const listingId = shareBtn.getAttribute("data-listing-id");
      const url = window.location.origin + "/listing/" + listingId;

      navigator.clipboard
        .writeText(url)
        .then(() => {
          if (copyTimeout) clearTimeout(copyTimeout);

          // Visual feedback
          shareBtn.innerHTML =
            '<i class="bi bi-check-circle-fill me-3"></i>Link copied!';
          shareBtn.classList.replace("btn-alternate", "btn-success");

          // Revert back after 2.5 seconds
          copyTimeout = setTimeout(() => {
            shareBtn.innerHTML = originalHtml;
            shareBtn.classList.replace("btn-success", "btn-alternate");
            copyTimeout = null;
          }, 2500);
        })
        .catch((err) => {
          console.error("Failed to copy link: ", err);
          alert("Could not copy link to clipboard.");
        });
    });
  }

  // --- 2. View as Borrower Perspective Toggle ---
  const toggleViewBtn = document.getElementById("toggleBorrowerViewBtn");
  const borrowerViewBanner = document.getElementById("borrowerViewBanner");
  const lenderPanels = document.querySelectorAll(".lender-only-panel");
  const borrowerPanels = document.querySelectorAll(".borrower-only-panel");

  if (toggleViewBtn) {
    toggleViewBtn.addEventListener("click", function () {
      const isBorrowerView = this.classList.toggle("is-borrower-view");

      if (isBorrowerView) {
        // Entering Borrower View
        this.innerHTML =
          '<i class="bi bi-eye-slash me-2"></i>Return to Lender View';
        this.classList.replace("btn-outline-info", "btn-info");
        this.classList.replace("text-info", "text-dark");

        if (borrowerViewBanner) borrowerViewBanner.classList.remove("d-none");

        lenderPanels.forEach((p) => p.classList.add("d-none"));
        borrowerPanels.forEach((p) => p.classList.remove("d-none"));
      } else {
        // Returning to Lender View
        this.innerHTML = '<i class="bi bi-eye me-2"></i>View as Borrower';
        this.classList.replace("btn-info", "btn-outline-info");
        this.classList.replace("text-dark", "text-info");

        if (borrowerViewBanner) borrowerViewBanner.classList.add("d-none");

        lenderPanels.forEach((p) => p.classList.remove("d-none"));
        borrowerPanels.forEach((p) => p.classList.add("d-none"));
      }
    });
  }

  // --- 3. Carousel Image Counter Logic ---
  const listingCarousel = document.getElementById("listingCarousel");
  const imageCounter = document.getElementById("imageCounter");

  if (listingCarousel && imageCounter) {
    // Read total images from the custom data attribute
    const totalImages = listingCarousel.getAttribute("data-total-images");

    // Listen for the Bootstrap slide event to update the counter text dynamically
    listingCarousel.addEventListener("slide.bs.carousel", (event) => {
      // event.to gives the zero-based index of the target slide
      imageCounter.innerText = event.to + 1 + " / " + totalImages;
    });
  }
});
