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

  // --- 2. Custom Inline Form Validation ---
  const editListingForm = document.getElementById("editListingForm");
  const generalErrorAlert = document.getElementById("generalErrorAlert");

  function showError(inputId, message) {
    const input = document.getElementById(inputId);
    if (input) {
      input.classList.add("is-invalid");
      const feedback = input.parentElement.querySelector(".invalid-feedback");
      if (feedback) {
        feedback.textContent = message;
      }
    }
  }

  function clearErrors() {
    if (generalErrorAlert) generalErrorAlert.classList.add("d-none");
    const invalidInputs = document.querySelectorAll(".is-invalid");
    invalidInputs.forEach((input) => input.classList.remove("is-invalid"));
  }

  if (editListingForm) {
    editListingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();

      let isValid = true;
      const submitBtn = editListingForm.querySelector('button[type="submit"]');

      // Validate Title
      const title = document.getElementById("itemTitle");
      if (
        !title.value.trim() ||
        title.value.trim().length < 5 ||
        title.value.trim().length > 100
      ) {
        showError("itemTitle", "Title must be between 5 and 100 characters.");
        isValid = false;
      }

      // Validate Description
      const desc = document.getElementById("itemDescription");
      if (
        !desc.value.trim() ||
        desc.value.trim().length < 50 ||
        desc.value.trim().length > 2000
      ) {
        showError(
          "itemDescription",
          "Description must be between 50 and 2000 characters.",
        );
        isValid = false;
      }

      // Validate Daily Rate
      const dailyRate = document.getElementById("dailyRate");
      if (
        !dailyRate.value ||
        parseFloat(dailyRate.value) < 1.0 ||
        parseFloat(dailyRate.value) > 500.0
      ) {
        showError("dailyRate", "Daily rate must be between $1.00 and $500.00.");
        isValid = false;
      }

      // Final Decision
      if (!isValid) {
        if (generalErrorAlert) {
          generalErrorAlert.classList.remove("d-none");
          generalErrorAlert.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      } else {
        // Prevent double submission
        if (submitBtn) {
          submitBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...';
          submitBtn.disabled = true;
        }
        editListingForm.submit();
      }
    });
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
