// public/js/upload-images.js

document.addEventListener("DOMContentLoaded", () => {
  const uploadZone = document.getElementById("uploadZone");
  const fileInput = document.getElementById("fileInput");
  const selectFilesBtn = document.getElementById("selectFilesBtn");
  const uploadActionDiv = document.getElementById("uploadActionDiv");
  const selectedFilesText = document.getElementById("selectedFilesText");
  const previewGallery = document.getElementById("previewGallery");
  const uploadForm = document.getElementById("uploadForm");

  // Read the current image count passed from EJS via data attribute
  const currentImageCount = uploadForm
    ? parseInt(uploadForm.getAttribute("data-current-count"), 10) || 0
    : 0;

  // --- 1. Drag and Drop Visual Handlers ---
  if (uploadZone) {
    uploadZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadZone.classList.add("drag-over");
    });

    uploadZone.addEventListener("dragleave", () => {
      uploadZone.classList.remove("drag-over");
    });

    uploadZone.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadZone.classList.remove("drag-over");

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleFiles(fileInput.files);
      }
    });
  }

  // --- 2. Handle Button Click & Selection ---
  if (selectFilesBtn && fileInput) {
    selectFilesBtn.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      handleFiles(e.target.files);
    });
  }

  // --- 3. Process and Preview Files ---
  function handleFiles(files) {
    previewGallery.innerHTML = ""; // Clear previous previews

    if (files.length > 0) {
      const totalAttempted = currentImageCount + files.length;

      // Validate against the 8-image limit
      if (totalAttempted > 8) {
        alert(
          `You can only have a maximum of 8 images. You are trying to add ${files.length} to your existing ${currentImageCount}.`,
        );
        fileInput.value = ""; // Reset input
        uploadActionDiv.classList.add("d-none");
        return;
      }

      selectedFilesText.textContent = `${files.length} file(s) selected and ready to upload.`;

      // Generate Client-Side Thumbnails
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) return;

        const imgContainer = document.createElement("div");
        imgContainer.className = "position-relative";

        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.className = "img-thumbnail bg-dark border-secondary";
        img.style.width = "100px";
        img.style.height = "100px";
        img.style.objectFit = "cover";

        img.onload = () => URL.revokeObjectURL(img.src);

        imgContainer.appendChild(img);
        previewGallery.appendChild(imgContainer);
      });

      uploadActionDiv.classList.remove("d-none");
      uploadActionDiv.scrollIntoView({ behavior: "smooth", block: "end" });
    } else {
      uploadActionDiv.classList.add("d-none");
    }
  }

  // --- 4. Custom Image Deletion Modal Logic ---
  const deleteImageForms = document.querySelectorAll(".delete-image-form");
  const deleteModalEl = document.getElementById("deleteImageModal");

  if (deleteModalEl) {
    const deleteModal = new bootstrap.Modal(deleteModalEl);
    const confirmDeleteBtn = document.getElementById("confirmImageDeleteBtn");
    let formToSubmit = null;

    // Intercept the submit event for all delete forms
    deleteImageForms.forEach((form) => {
      form.addEventListener("submit", function (e) {
        e.preventDefault(); // Stop the form from submitting immediately
        formToSubmit = this; // Store the form reference
        deleteModal.show(); // Show custom modal
      });
    });

    // Handle the actual deletion confirmation
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", () => {
        if (formToSubmit) {
          // Prevent double-clicks by adding a loading spinner
          confirmDeleteBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Deleting...';
          confirmDeleteBtn.disabled = true;

          formToSubmit.submit();
        }
      });
    }
  }
});
