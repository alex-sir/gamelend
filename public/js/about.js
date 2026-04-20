// public/js/about.js

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  const successMessage = document.getElementById("contactSuccessMessage");
  const submitBtn = document.getElementById("submitContactBtn");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      // Prevent the form from refreshing the page
      e.preventDefault();

      // Ensure success message is hidden if they are submitting multiple times
      successMessage.classList.add("d-none");

      // UI Feedback: Loading state
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';
      submitBtn.disabled = true;

      // Simulate a network request delay (800ms)
      setTimeout(() => {
        // Show inline success message
        successMessage.classList.remove("d-none");

        // Reset the form inputs and button state
        contactForm.reset();
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;

        // Automatically hide the success message after 5 seconds
        setTimeout(() => {
          successMessage.classList.add("d-none");
        }, 5000);
      }, 800);
    });
  }
});
