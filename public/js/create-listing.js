// public/js/create-listing.js

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Category Field Toggling ---
  const categoryRadios = document.querySelectorAll('input[name="category"]');
  const gameFields = document.getElementById("gameFields");
  const consoleFields = document.getElementById("consoleFields");
  const accessoryFields = document.getElementById("accessoryFields");

  function updateCategoryFields() {
    if (gameFields) gameFields.style.display = "none";
    if (consoleFields) consoleFields.style.display = "none";
    if (accessoryFields) accessoryFields.style.display = "none";

    const selected = document.querySelector('input[name="category"]:checked');
    if (selected) {
      if (selected.value === "Video Game" && gameFields) {
        gameFields.style.display = "block";
      } else if (selected.value === "Console" && consoleFields) {
        consoleFields.style.display = "block";
      } else if (selected.value === "Accessory" && accessoryFields) {
        accessoryFields.style.display = "block";
      }
    }
  }

  categoryRadios.forEach((radio) => {
    radio.addEventListener("change", updateCategoryFields);
  });

  // --- 2. Character Counter ---
  const descriptionInput = document.getElementById("itemDescription");
  const charCountDisplay = document.getElementById("charCount");

  if (descriptionInput && charCountDisplay) {
    descriptionInput.addEventListener("input", function () {
      charCountDisplay.textContent = this.value.length;
    });
  }

  // --- 3. Date Constraints ---
  const availableFrom = document.getElementById("availableFrom");
  const availableUntil = document.getElementById("availableUntil");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  if (availableFrom && !availableFrom.value) availableFrom.min = tomorrowStr;
  if (availableUntil && !availableUntil.value) availableUntil.min = tomorrowStr;

  if (availableFrom && availableUntil) {
    availableFrom.addEventListener("change", function () {
      availableUntil.min = this.value || tomorrowStr;
      if (availableUntil.value && availableUntil.value < this.value) {
        availableUntil.value = "";
      }
    });
  }

  // --- 4. Custom Inline Form Validation ---
  const createListingForm = document.getElementById("createListingForm");
  const generalErrorAlert = document.getElementById("generalErrorAlert");

  // Helper to apply the error state and message
  function showError(inputId, message) {
    const input = document.getElementById(inputId);
    if (input) {
      input.classList.add("is-invalid");
      // Find the sibling invalid-feedback element
      const feedback = input.parentElement.querySelector(".invalid-feedback");
      if (feedback) {
        feedback.textContent = message;
      }
    }
  }

  // Helper to wipe clean all previous errors before re-validating
  function clearErrors() {
    if (generalErrorAlert) generalErrorAlert.classList.add("d-none");
    const invalidInputs = document.querySelectorAll(".is-invalid");
    invalidInputs.forEach((input) => input.classList.remove("is-invalid"));
  }

  if (createListingForm) {
    createListingForm.addEventListener("submit", function (e) {
      // Prevent default submission to bypass native HTML popups
      e.preventDefault();
      clearErrors();

      let isValid = true;

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

      // Validate Condition
      const condition = document.getElementById("condition");
      if (!condition.value) {
        showError("condition", "Please select the item's condition.");
        isValid = false;
      }

      // Validate Quantity
      const qty = document.getElementById("quantity");
      if (!qty.value || parseInt(qty.value) < 1 || parseInt(qty.value) > 99) {
        showError("quantity", "Quantity must be a number between 1 and 99.");
        isValid = false;
      }

      // Validate Dynamic Category Requirements
      const selectedCategory = document.querySelector(
        'input[name="category"]:checked',
      );
      if (selectedCategory) {
        if (selectedCategory.value === "Video Game") {
          const platform = document.getElementById("platform");
          if (!platform.value) {
            showError("platform", "Platform is required for video games.");
            isValid = false;
          }
          const genre = document.getElementById("genre");
          if (!genre.value) {
            showError("genre", "Genre is required for video games.");
            isValid = false;
          }
        } else if (selectedCategory.value === "Console") {
          const consoleType = document.getElementById("consoleType");
          if (!consoleType.value) {
            showError("consoleType", "Console Type is required.");
            isValid = false;
          }
        } else if (selectedCategory.value === "Accessory") {
          const accType = document.getElementById("accessoryType");
          if (!accType.value) {
            showError("accessoryType", "Accessory Type is required.");
            isValid = false;
          }
        }
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

      // Validate Dates
      if (!availableFrom.value) {
        showError("availableFrom", "Start date is required.");
        isValid = false;
      }

      if (!availableUntil.value) {
        showError("availableUntil", "End date is required.");
        isValid = false;
      } else if (
        availableFrom.value &&
        new Date(availableFrom.value) > new Date(availableUntil.value)
      ) {
        showError("availableUntil", "End date must be after the start date.");
        isValid = false;
      }

      // Final Decision
      if (!isValid) {
        if (generalErrorAlert) {
          generalErrorAlert.classList.remove("d-none");
          // Smoothly scroll the user back up to the warning banner
          generalErrorAlert.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      } else {
        // If all JavaScript checks pass, proceed to submit to Express
        createListingForm.submit();
      }
    });
  }
});
