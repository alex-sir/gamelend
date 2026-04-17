// public/js/my-listings.js

document.addEventListener("DOMContentLoaded", () => {
  // Select all forms used for deleting a listing
  const deleteForms = document.querySelectorAll(".delete-listing-form");
  const deleteModalEl = document.getElementById("deleteConfirmModal");

  if (!deleteModalEl) return; // Exit if modal doesn't exist on the page

  // Initialize the Bootstrap modal
  const deleteModal = new bootstrap.Modal(deleteModalEl);
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const deleteListingTitle = document.getElementById("deleteListingTitle");

  let formToSubmit = null;

  // Intercept the submit event for all delete forms
  deleteForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // Stop the form from submitting immediately
      formToSubmit = this; // Store the form reference

      // Grab the listing title from the button's data attribute to customize the modal text
      const submitBtn = this.querySelector('button[type="submit"]');
      const title = submitBtn
        ? submitBtn.getAttribute("data-listing-title")
        : "this listing";

      if (deleteListingTitle) {
        deleteListingTitle.textContent = title;
      }

      // Show the custom confirmation modal
      deleteModal.show();
    });
  });

  // When the user clicks the red "Delete Listing" button inside the modal
  confirmDeleteBtn.addEventListener("click", () => {
    if (formToSubmit) {
      // Add a loading state to the button to prevent double-clicks
      confirmDeleteBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Deleting...';
      confirmDeleteBtn.disabled = true;

      // Submit the stored form to the Express backend
      formToSubmit.submit();
    }
  });
});
