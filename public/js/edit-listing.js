// public/js/edit-listing.js

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Character Counter ---
  const descriptionInput = document.getElementById("itemDescription");
  const charCountDisplay = document.getElementById("charCount");

  if (descriptionInput && charCountDisplay) {
    // Initialize count on load
    charCountDisplay.textContent = descriptionInput.value.length;

    descriptionInput.addEventListener("input", function () {
      charCountDisplay.textContent = this.value.length;
    });
  }

  // --- 2. Form Validation & Submission ---
  const form = document.getElementById("editListingForm");
  const generalErrorAlert = document.getElementById("generalErrorAlert");

  if (form) {
    form.addEventListener(
      "submit",
      function (e) {
        // Check if all required fields are filled out and valid
        if (!form.checkValidity()) {
          // Prevent submission if invalid
          e.preventDefault();
          e.stopPropagation();

          // Show the general error banner at the top
          if (generalErrorAlert) {
            generalErrorAlert.classList.remove("d-none");
            generalErrorAlert.classList.add("d-flex");
            generalErrorAlert.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        } else {
          // Form is valid!
          if (generalErrorAlert) {
            generalErrorAlert.classList.add("d-none");
            generalErrorAlert.classList.remove("d-flex");
          }

          // Prevent double-clicking by disabling the submit button and showing a spinner
          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.innerHTML =
              '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...';
            submitBtn.disabled = true;
          }
        }

        // Add Bootstrap's validation class to highlight exactly which fields are missing/invalid
        form.classList.add("was-validated");
      },
      false,
    );
  }

  // --- 3. Custom Delete Confirmation Modal Logic ---
  const deleteListingForm = document.getElementById("deleteListingForm");
  const deleteModalEl = document.getElementById("deleteListingModal");

  if (deleteModalEl && deleteListingForm) {
    const deleteModal = new bootstrap.Modal(deleteModalEl);
    const confirmDeleteBtn = document.getElementById("confirmListingDeleteBtn");
    const openDeleteModalBtn = document.getElementById("openDeleteModalBtn");

    // Open modal when the delete button is clicked
    if (openDeleteModalBtn) {
      openDeleteModalBtn.addEventListener("click", () => {
        deleteModal.show();
      });
    }

    // Submit form when confirmed inside the modal
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", () => {
        confirmDeleteBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Deleting...';
        confirmDeleteBtn.disabled = true;
        deleteListingForm.submit();
      });
    }
  }
});
