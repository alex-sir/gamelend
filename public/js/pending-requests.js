// public/js/pending-requests.js

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Accept Request Modal Logic ---
  const acceptModalEl = document.getElementById("acceptModal");
  if (acceptModalEl) {
    const acceptModal = new bootstrap.Modal(acceptModalEl);
    const acceptBtns = document.querySelectorAll(".btn-accept-request");

    const acceptForm = document.getElementById("acceptRequestForm");
    const acceptListingTitle = document.getElementById("acceptListingTitle");
    const acceptBorrowerName = document.getElementById("acceptBorrowerName");
    const acceptDates = document.getElementById("acceptDates");
    const acceptEarnings = document.getElementById("acceptEarnings");

    acceptBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const requestId = this.getAttribute("data-request-id");
        const title = this.getAttribute("data-listing-title");
        const borrower = this.getAttribute("data-borrower-name");
        const dates = this.getAttribute("data-dates");
        const earnings = this.getAttribute("data-earnings");

        // Populate Modal Data
        if (acceptListingTitle) acceptListingTitle.textContent = title;
        if (acceptBorrowerName) acceptBorrowerName.textContent = borrower;
        if (acceptDates) acceptDates.textContent = dates;
        if (acceptEarnings) acceptEarnings.textContent = "$" + earnings;

        // Set Form Action
        if (acceptForm) {
          acceptForm.action = `/lender/requests/${requestId}/accept`;
        }

        acceptModal.show();
      });
    });

    // Handle Form Submission Loading State
    if (acceptForm) {
      acceptForm.addEventListener("submit", function () {
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Confirming...';
          submitBtn.disabled = true;
        }
      });
    }
  }

  // --- 2. Reject Request Modal Logic ---
  const rejectModalEl = document.getElementById("rejectModal");
  if (rejectModalEl) {
    const rejectModal = new bootstrap.Modal(rejectModalEl);
    const rejectBtns = document.querySelectorAll(".btn-reject-request");

    const rejectForm = document.getElementById("rejectRequestForm");
    const rejectListingTitle = document.getElementById("rejectListingTitle");
    const rejectBorrowerName = document.getElementById("rejectBorrowerName");

    rejectBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const requestId = this.getAttribute("data-request-id");
        const title = this.getAttribute("data-listing-title");
        const borrower = this.getAttribute("data-borrower-name");

        // Populate Modal Data
        if (rejectListingTitle) rejectListingTitle.textContent = title;
        if (rejectBorrowerName) rejectBorrowerName.textContent = borrower;

        // Set Form Action
        if (rejectForm) {
          rejectForm.action = `/lender/requests/${requestId}/reject`;
          rejectForm.querySelector("textarea").value = ""; // Clear old text
        }

        rejectModal.show();
      });
    });

    // Handle Form Submission Loading State
    if (rejectForm) {
      rejectForm.addEventListener("submit", function () {
        // Find the submit button attached to this form (it's outside the form tag in the modal footer)
        const submitBtn = document.querySelector(
          'button[form="rejectRequestForm"]',
        );
        if (submitBtn) {
          submitBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Declining...';
          submitBtn.disabled = true;
        }
      });
    }
  }

  // --- 3. Contact Borrower Modal Logic ---
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
});
