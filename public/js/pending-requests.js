// public/js/pending-requests.js

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Reject Request Modal Logic ---
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

        // Update modal text
        if (rejectListingTitle) rejectListingTitle.textContent = title;
        if (rejectBorrowerName) rejectBorrowerName.textContent = borrower;

        // Update the form action to point to the correct Express route
        if (rejectForm) {
          rejectForm.action = `/lender/requests/${requestId}/reject`;
          // Clear previous reason
          rejectForm.querySelector("textarea").value = "";
        }

        rejectModal.show();
      });
    });

    // Handle Reject Form Submission (Add loading spinner)
    if (rejectForm) {
      rejectForm.addEventListener("submit", function () {
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Rejecting...';
          submitBtn.disabled = true;
        }
      });
    }
  }

  // --- 2. Accept Request Form Logic (Loading State) ---
  const acceptForms = document.querySelectorAll(".accept-request-form");
  acceptForms.forEach((form) => {
    form.addEventListener("submit", function () {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Accepting...';
        submitBtn.disabled = true;
      }
    });
  });

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
