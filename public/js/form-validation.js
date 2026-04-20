// public/js/form-validation.js

document.addEventListener("DOMContentLoaded", () => {
  // Fetch all forms we want to apply custom Bootstrap validation to
  const forms = document.querySelectorAll(".needs-validation");

  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        // If the form is invalid, stop it from submitting
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          // If valid, disable the submit button and show a spinner to prevent double-clicks
          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...`;
            submitBtn.disabled = true;

            // Re-enable after a timeout just in case the server takes too long or fails silently
            setTimeout(() => {
              submitBtn.innerHTML = originalText;
              submitBtn.disabled = false;
            }, 5000);
          }
        }

        // Add the Bootstrap class that reveals the red/green valid/invalid feedback text
        form.classList.add("was-validated");
      },
      false,
    );
  });
});
