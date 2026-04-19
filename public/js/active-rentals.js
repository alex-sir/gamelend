// public/js/active-rentals.js

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Contact Borrower Modal Logic ---
  const contactModalEl = document.getElementById("contactModal");
  if (contactModalEl) {
    const contactModal = new bootstrap.Modal(contactModalEl);
    const contactBtns = document.querySelectorAll(".btn-contact-borrower");
    const contactBorrowerName = document.getElementById("contactBorrowerName");

    contactBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const borrower = this.getAttribute("data-borrower-name");
        if (contactBorrowerName) contactBorrowerName.textContent = borrower;
        contactModal.show();
      });
    });
  }

  // --- 2. Report Issue Modal Logic ---
  const reportModalEl = document.getElementById("reportModal");
  if (reportModalEl) {
    const reportModal = new bootstrap.Modal(reportModalEl);
    const reportBtns = document.querySelectorAll(".btn-report-issue");
    const reportListingTitle = document.getElementById("reportListingTitle");
    const confirmReportBtn = document.getElementById("confirmReportBtn");

    reportBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const title = this.getAttribute("data-listing-title");
        if (reportListingTitle) reportListingTitle.textContent = title;
        reportModal.show();
      });
    });

    if (confirmReportBtn) {
      confirmReportBtn.addEventListener("click", function () {
        this.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Submitting...';
        this.disabled = true;

        // Simulate an API call delay for UI feedback
        setTimeout(() => {
          reportModal.hide();
          this.innerHTML = '<i class="bi bi-flag me-2"></i>Submit Report';
          this.disabled = false;
          alert("Your report has been submitted to the admin team for review.");
        }, 1000);
      });
    }
  }

  // --- 3. Confirm Return Modal Logic ---
  const returnModalEl = document.getElementById("returnModal");
  if (returnModalEl) {
    const returnModal = new bootstrap.Modal(returnModalEl);
    const returnBtns = document.querySelectorAll(".btn-confirm-return");
    const returnListingTitle = document.getElementById("returnListingTitle");
    const confirmReturnBtn = document.getElementById("confirmReturnBtn");

    returnBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const title = this.getAttribute("data-listing-title");
        const id = this.getAttribute("data-rental-id");
        if (returnListingTitle) returnListingTitle.textContent = title;
        if (confirmReturnBtn) confirmReturnBtn.setAttribute("data-active-id", id);
        returnModal.show();
      });
    });

    if (confirmReturnBtn) {
      confirmReturnBtn.addEventListener("click", async function () {
        const rentalId = this.getAttribute("data-active-id");

        this.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';
        this.disabled = true;

        try {
          const response = await fetch(`/lender/rentals/${rentalId}/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            returnModal.hide();
            location.reload(); // Refresh to show the rental in the "Completed" tab
          } else {
            alert("Failed to complete rental. Please try again.");
            this.innerHTML = '<i class="bi bi-check-circle me-2"></i>Confirm Return';
            this.disabled = false;
          }
        } catch (error) {
          console.error("Error completing rental:", error);
          alert("An error occurred. Please check your connection.");
          this.innerHTML = '<i class="bi bi-check-circle me-2"></i>Confirm Return';
          this.disabled = false;
        }
      });
    }
  }
});
