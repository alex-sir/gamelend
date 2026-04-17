// public/js/upload-images.js

document.addEventListener("DOMContentLoaded", () => {
  const uploadZone = document.getElementById("uploadZone");
  const fileInput = document.getElementById("fileInput");
  const selectFilesBtn = document.getElementById("selectFilesBtn");
  const uploadActionDiv = document.getElementById("uploadActionDiv");
  const selectedFilesText = document.getElementById("selectedFilesText");
  const previewGallery = document.getElementById("previewGallery");
  const uploadForm = document.getElementById("uploadForm");

  // URL Input Elements
  const addUrlBtn = document.getElementById("addUrlBtn");
  const imageUrlInput = document.getElementById("imageUrl");

  const currentImageCount = uploadForm
    ? parseInt(uploadForm.getAttribute("data-current-count"), 10) || 0
    : 0;

  // Array to track URLs added by the user
  let selectedUrls = [];

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
        updatePreviews();
      }
    });
  }

  // --- 2. Handle File Button Click & Selection ---
  if (selectFilesBtn && fileInput) {
    selectFilesBtn.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", () => {
      updatePreviews();
    });
  }

  // --- 3. Handle URL Addition ---
  if (addUrlBtn && imageUrlInput) {
    addUrlBtn.addEventListener("click", () => {
      const url = imageUrlInput.value.trim();
      if (!url) return;

      // Basic URL validation
      try {
        new URL(url);
      } catch (_) {
        alert("Please enter a valid URL.");
        return;
      }

      const fileCount = fileInput.files ? fileInput.files.length : 0;
      if (currentImageCount + fileCount + selectedUrls.length >= 8) {
        alert(`You can only have a maximum of 8 images.`);
        return;
      }

      selectedUrls.push(url);
      imageUrlInput.value = "";
      updatePreviews();
    });
  }

  // --- 4. Process and Preview Files & URLs ---
  function updatePreviews() {
    previewGallery.innerHTML = ""; // Clear existing previews

    // Remove old hidden URL inputs from the form
    document
      .querySelectorAll('input[name="imageUrls"]')
      .forEach((el) => el.remove());

    const files = fileInput.files ? Array.from(fileInput.files) : [];
    const totalAttempted =
      currentImageCount + files.length + selectedUrls.length;

    if (totalAttempted > 8) {
      alert(
        `You can only have a maximum of 8 images. You are trying to exceed the limit.`,
      );
      fileInput.value = "";
      selectedUrls = [];
      uploadActionDiv.classList.add("d-none");
      return;
    }

    // Generate hidden inputs for the URLs so they get sent in the POST request body
    selectedUrls.forEach((url) => {
      const hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = "imageUrls";
      hiddenInput.value = url;
      uploadForm.appendChild(hiddenInput);
    });

    if (files.length > 0 || selectedUrls.length > 0) {
      selectedFilesText.textContent = `${files.length} file(s) and ${selectedUrls.length} URL(s) ready to upload.`;

      // Render Local File Previews
      files.forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        createThumbnail(URL.createObjectURL(file), true);
      });

      // Render URL Previews
      selectedUrls.forEach((url) => {
        createThumbnail(url, false);
      });

      uploadActionDiv.classList.remove("d-none");
      uploadActionDiv.scrollIntoView({ behavior: "smooth", block: "end" });
    } else {
      uploadActionDiv.classList.add("d-none");
    }
  }

  function createThumbnail(src, isBlob) {
    const imgContainer = document.createElement("div");
    imgContainer.className = "position-relative";

    const img = document.createElement("img");
    img.src = src;
    img.className = "img-thumbnail bg-dark border-secondary";
    img.style.width = "100px";
    img.style.height = "100px";
    img.style.objectFit = "cover";

    if (isBlob) {
      img.onload = () => URL.revokeObjectURL(img.src);
    }

    imgContainer.appendChild(img);
    previewGallery.appendChild(imgContainer);
  }

  // --- 5. Custom Image Deletion Modal Logic ---
  const deleteImageForms = document.querySelectorAll(".delete-image-form");
  const deleteModalEl = document.getElementById("deleteImageModal");

  if (deleteModalEl) {
    const deleteModal = new bootstrap.Modal(deleteModalEl);
    const confirmDeleteBtn = document.getElementById("confirmImageDeleteBtn");
    let formToSubmit = null;

    deleteImageForms.forEach((form) => {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        formToSubmit = this;
        deleteModal.show();
      });
    });

    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", () => {
        if (formToSubmit) {
          confirmDeleteBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Deleting...';
          confirmDeleteBtn.disabled = true;
          formToSubmit.submit();
        }
      });
    }
  }

  // --- 6. Set Primary Image Logic ---
  const setPrimaryForms = document.querySelectorAll(".set-primary-form");

  setPrimaryForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      // Prevent double submissions visually
      const btn = this.querySelector('button[type="submit"]');
      if (btn) {
        btn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Saving...';
        btn.disabled = true;
      }
    });
  });
});
