// public/js/listing-detail.js

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Share Link Functionality (Inline Feedback) ---
  const shareBtn = document.getElementById("shareListingBtn");

  if (shareBtn) {
    // 1. Store the original HTML once on load, outside the click event
    const originalHtml = shareBtn.innerHTML;
    let copyTimeout; // Variable to hold our timer

    shareBtn.addEventListener("click", () => {
      const url = window.location.href;

      // Copy the URL to the clipboard quietly
      navigator.clipboard
        .writeText(url)
        .then(() => {
          // 2. Clear any existing timer if the user spam-clicks
          if (copyTimeout) {
            clearTimeout(copyTimeout);
          }

          // Transform button to show success inline
          shareBtn.innerHTML =
            '<i class="bi bi-check-circle-fill me-2"></i>Link copied!';
          shareBtn.classList.replace("btn-alternate", "btn-success");

          // 3. Set the new timer and store its ID in copyTimeout
          copyTimeout = setTimeout(() => {
            shareBtn.innerHTML = originalHtml;
            shareBtn.classList.replace("btn-success", "btn-alternate");
            copyTimeout = null; // Reset the timer variable
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
      // Toggle state
      const isBorrowerView = this.classList.toggle("is-borrower-view");

      if (isBorrowerView) {
        // Switch TO Borrower View
        this.innerHTML =
          '<i class="bi bi-eye-slash me-2"></i>Return to Lender View';
        this.classList.replace("btn-outline-info", "btn-info");
        this.classList.replace("text-info", "text-dark");

        borrowerViewBanner.classList.remove("d-none");

        // Hide all lender-specific panels (stats, quick actions)
        lenderPanels.forEach((panel) => (panel.style.display = "none"));
      } else {
        // Switch BACK TO Lender View
        this.innerHTML = '<i class="bi bi-eye me-2"></i>View as Borrower';
        this.classList.replace("btn-info", "btn-outline-info");
        this.classList.replace("text-dark", "text-info");

        borrowerViewBanner.classList.add("d-none");

        // Restore lender panels
        lenderPanels.forEach((panel) => (panel.style.display = "block"));
      }
    });
  }
});
