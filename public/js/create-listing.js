document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createListingForm");
  const categoryRadios = document.querySelectorAll('input[name="category"]');

  const gameFields = document.getElementById("gameFields");
  const consoleFields = document.getElementById("consoleFields");
  const accessoryFields = document.getElementById("accessoryFields");
  const otherFields = document.getElementById("otherFields");

  const generalErrorAlert = document.getElementById("generalErrorAlert");
  const descInput = document.getElementById("itemDescription");
  const charCount = document.getElementById("charCount");

  // --- 1. Character Counter for Description ---
  if (descInput && charCount) {
    charCount.textContent = descInput.value.length;
    descInput.addEventListener("input", function () {
      charCount.textContent = this.value.length;
    });
  }

  // --- 2. Dynamic Category Toggling & Required Attribute Management ---
  // Crucial logic: We must remove "required" from hidden inputs, otherwise the
  // browser will block form submission without telling the user why.
  function toggleCategoryFields() {
    const selectedCategory = document.querySelector(
      'input[name="category"]:checked',
    )?.value;

    // A. Hide all sub-type sections first
    if (gameFields) gameFields.style.display = "none";
    if (consoleFields) consoleFields.style.display = "none";
    if (accessoryFields) accessoryFields.style.display = "none";
    if (otherFields) otherFields.style.display = "none";

    // B. Strip the 'required' attribute off of ALL conditional inputs
    const dynamicInputs = document.querySelectorAll(
      '.category-fields select, .category-fields input[type="text"], .category-fields input[type="number"]',
    );
    dynamicInputs.forEach((input) => input.removeAttribute("required"));

    // C. Show only the selected sub-type section AND apply 'required' to its specific mandatory fields
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
      // Ensure the user actually selects one of the custom admin categories
      document
        .getElementById("dynamicCategoryId")
        ?.setAttribute("required", "required");
    }
  }

  // Attach the event listener to all radio buttons
  categoryRadios.forEach((radio) => {
    radio.addEventListener("change", toggleCategoryFields);
  });

  // Run immediately on page load in case the form is loaded with pre-filled data or errors
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
          // Form is valid! Hide the error banner
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
});
