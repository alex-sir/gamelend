document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createListingForm");
  const categoryRadios = document.querySelectorAll('input[name="category"]');
  const gameFields = document.getElementById("gameFields");
  const consoleFields = document.getElementById("consoleFields");
  const accessoryFields = document.getElementById("accessoryFields");
  const generalErrorAlert = document.getElementById("generalErrorAlert");
  const descInput = document.getElementById("itemDescription");
  const charCount = document.getElementById("charCount");

  // --- 1. Character Counter for Description ---
  if (descInput && charCount) {
    // Initialize count on load
    charCount.textContent = descInput.value.length;

    descInput.addEventListener("input", function () {
      charCount.textContent = this.value.length;
    });
  }

  // --- 2. Dynamic Category Toggling ---
  function toggleCategoryFields() {
    const selectedCategory = document.querySelector(
      'input[name="category"]:checked',
    )?.value;

    // Hide all sub-type sections first
    if (gameFields) gameFields.style.display = "none";
    if (consoleFields) consoleFields.style.display = "none";
    if (accessoryFields) accessoryFields.style.display = "none";

    // Show only the selected sub-type section
    if (selectedCategory === "Video Game" && gameFields) {
      gameFields.style.display = "block";
    } else if (selectedCategory === "Console" && consoleFields) {
      consoleFields.style.display = "block";
    } else if (selectedCategory === "Accessory" && accessoryFields) {
      accessoryFields.style.display = "block";
    }
  }

  // Add event listeners to radio buttons
  categoryRadios.forEach((radio) => {
    radio.addEventListener("change", toggleCategoryFields);
  });

  // Run once on page load in case a category is pre-selected (e.g., reloading after an error)
  toggleCategoryFields();

  // --- 3. Form Validation & Submission ---
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
          // 1. Hide the error banner if it was previously shown
          if (generalErrorAlert) {
            generalErrorAlert.classList.add("d-none");
            generalErrorAlert.classList.remove("d-flex");
          }

          // 2. Prevent double-clicking by disabling the submit button and showing a spinner
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
});
