// public/js/edit-listing.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("editListingForm");

  const gameFields = document.getElementById("gameFields");
  const consoleFields = document.getElementById("consoleFields");
  const accessoryFields = document.getElementById("accessoryFields");
  const otherFields = document.getElementById("otherFields");

  const generalErrorAlert = document.getElementById("generalErrorAlert");
  const descInput = document.getElementById("itemDescription");
  const charCount = document.getElementById("charCount");

  if (descInput && charCount) {
    charCount.textContent = descInput.value.length;
    descInput.addEventListener("input", function () {
      charCount.textContent = this.value.length;
    });
  }

  function toggleCategoryFields() {
    // FIX: Since the category is locked, we read its value from the hidden input
    const hiddenCategory = document.querySelector(
      'input[type="hidden"][name="category"]',
    );
    const selectedCategory = hiddenCategory ? hiddenCategory.value : null;

    if (gameFields) gameFields.style.display = "none";
    if (consoleFields) consoleFields.style.display = "none";
    if (accessoryFields) accessoryFields.style.display = "none";
    if (otherFields) otherFields.style.display = "none";

    const dynamicInputs = document.querySelectorAll(
      '.category-fields select, .category-fields input[type="text"], .category-fields input[type="number"]',
    );
    dynamicInputs.forEach((input) => input.removeAttribute("required"));

    if (selectedCategory === "Video Game" && gameFields) {
      gameFields.style.display = "block";
      document.getElementById("platform")?.setAttribute("required", "required");
      document.getElementById("genre")?.setAttribute("required", "required");
    } else if (selectedCategory === "Console" && consoleFields) {
      consoleFields.style.display = "block";
      document
        .getElementById("consoleType")
        ?.setAttribute("required", "required");
    } else if (selectedCategory === "Accessory" && accessoryFields) {
      accessoryFields.style.display = "block";
      document
        .getElementById("accessoryType")
        ?.setAttribute("required", "required");
    } else if (selectedCategory === "Other" && otherFields) {
      otherFields.style.display = "block";
      document
        .getElementById("dynamicCategoryId")
        ?.setAttribute("required", "required");
    }
  }

  // Initialize the correct fields on load
  toggleCategoryFields();

  if (form) {
    form.addEventListener(
      "submit",
      function (e) {
        if (!form.checkValidity()) {
          e.preventDefault();
          e.stopPropagation();
          if (generalErrorAlert) {
            generalErrorAlert.classList.remove("d-none");
            generalErrorAlert.classList.add("d-flex");
            generalErrorAlert.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        } else {
          if (generalErrorAlert) {
            generalErrorAlert.classList.add("d-none");
            generalErrorAlert.classList.remove("d-flex");
          }
          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.innerHTML =
              '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...';
            submitBtn.disabled = true;
          }
        }
        form.classList.add("was-validated");
      },
      false,
    );
  }
});
