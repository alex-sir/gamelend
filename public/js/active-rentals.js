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
    const reportListingId = document.getElementById("reportListingId");

    reportBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const title = this.getAttribute("data-listing-title");
        const id = this.getAttribute("data-listing-id");
        if (reportListingTitle) reportListingTitle.textContent = title;
        if (reportListingId) reportListingId.value = id;
        reportModal.show();
      });
    });
  }

  // --- 3. Confirm Return Modal Logic (Updated to use native form submission) ---
  const returnModalEl = document.getElementById("returnModal");
  if (returnModalEl) {
    const returnModal = new bootstrap.Modal(returnModalEl);
    const returnBtns = document.querySelectorAll(".btn-confirm-return");
    const returnListingTitle = document.getElementById("returnListingTitle");
    const completeRentalForm = document.getElementById("completeRentalForm");

    returnBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const title = this.getAttribute("data-listing-title");
        const id = this.getAttribute("data-rental-id");

        // Update Modal UI Details
        if (returnListingTitle) returnListingTitle.textContent = title;

        // Update Form Action so it targets the correct rental ID using PUT method override
        if (completeRentalForm) {
          completeRentalForm.action = `/lender/rentals/${id}/complete?_method=PUT`;
        }

        returnModal.show();
      });
    });

    // Provide loading state when form is submitted
    if (completeRentalForm) {
      completeRentalForm.addEventListener("submit", function () {
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';
          submitBtn.disabled = true;
        }
      });
    }
  }
});
