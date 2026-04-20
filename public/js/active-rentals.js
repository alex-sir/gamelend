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
    const completeRentalForm = document.getElementById("completeRentalForm"); // Grab the hidden form

    returnBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const title = this.getAttribute("data-listing-title");
        const rentalId = this.getAttribute("data-rental-id"); // Extract the ID

        if (returnListingTitle) returnListingTitle.textContent = title;

        // Dynamically set the action URL for the hidden form to target this specific rental
        if (completeRentalForm) {
          completeRentalForm.action = `/lender/rentals/${rentalId}/complete?_method=PUT`;
        }

        returnModal.show();
      });
    });

    if (confirmReturnBtn) {
      confirmReturnBtn.addEventListener("click", function () {
        this.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';
        this.disabled = true;

        // Submit the hidden form to the Express backend!
        if (completeRentalForm) {
          completeRentalForm.submit();
        }
      });
    }
  }
});
