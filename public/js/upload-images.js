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

  const MAX_IMAGES = 8;

  // Arrays to track items added by the user before upload
  let selectedFiles = [];
  let selectedUrls = [];

  // --- 1. Core Logic to Update UI (Show/Hide, Previews) ---
  function updateUI() {
    const totalPending = selectedFiles.length + selectedUrls.length;
    const totalFuture = currentImageCount + totalPending;

    if (totalPending > 0) {
      uploadActionDiv.classList.remove("d-none");
      selectedFilesText.textContent = `${totalPending} image(s) ready to upload (${totalFuture}/${MAX_IMAGES} total slots used).`;

      if (totalFuture > MAX_IMAGES) {
        selectedFilesText.classList.remove("text-info");
        selectedFilesText.classList.add("text-danger");
        selectedFilesText.textContent += " You have exceeded the limit!";
      } else {
        selectedFilesText.classList.add("text-info");
        selectedFilesText.classList.remove("text-danger");
      }
    } else {
      uploadActionDiv.classList.add("d-none");
    }

    // Render Previews
    previewGallery.innerHTML = "";

    // Generate File previews
    selectedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        createPreviewElement(e.target.result, file.name, () => {
          selectedFiles.splice(index, 1);
          updateUI();
        });
      };
      reader.readAsDataURL(file);
    });

    // Generate URL previews
    selectedUrls.forEach((url, index) => {
      createPreviewElement(url, url, () => {
        selectedUrls.splice(index, 1);
        updateUI();
      });
    });
  }

  function createPreviewElement(src, title, onRemove) {
    const wrapper = document.createElement("div");
    wrapper.className = "position-relative shadow-sm";
    wrapper.style.width = "120px";
    wrapper.style.height = "120px";

    const img = document.createElement("img");
    img.src = src;
    img.className =
      "img-thumbnail w-100 h-100 object-fit-cover bg-black border-secondary";
    img.title = title;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className =
      "btn btn-danger btn-sm position-absolute top-0 end-0 translate-middle rounded-circle p-1 lh-1 shadow";
    removeBtn.style.width = "28px";
    removeBtn.style.height = "28px";
    removeBtn.innerHTML = "<i class='bi bi-x fs-6'></i>";
    removeBtn.onclick = onRemove;

    wrapper.appendChild(img);
    wrapper.appendChild(removeBtn);
    previewGallery.appendChild(wrapper);
  }

  // --- 2. Add Local Files ---
  function handleFiles(files) {
    for (let file of files) {
      if (file.type.startsWith("image/")) {
        selectedFiles.push(file);
      }
    }
    updateUI();
  }

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
      if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });
  }

  if (selectFilesBtn && fileInput) {
    selectFilesBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      handleFiles(fileInput.files);
      fileInput.value = ""; // Clear so same file can be selected again
    });
  }

  // --- 3. Add URLs ---
  if (addUrlBtn && imageUrlInput) {
    addUrlBtn.addEventListener("click", () => {
      const url = imageUrlInput.value.trim();
      if (url) {
        selectedUrls.push(url);
        imageUrlInput.value = "";
        updateUI();
      }
    });

    imageUrlInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addUrlBtn.click();
      }
    });
  }

  // --- 4. Handle Form Submission ---
  if (uploadForm) {
    uploadForm.addEventListener("submit", (e) => {
      const totalFuture =
        currentImageCount + selectedFiles.length + selectedUrls.length;

      if (selectedFiles.length === 0 && selectedUrls.length === 0) {
        e.preventDefault();
        return;
      }

      if (totalFuture > MAX_IMAGES) {
        e.preventDefault();
        alert(
          `You can only have up to ${MAX_IMAGES} images total. Please remove some before uploading.`,
        );
        return;
      }

      // Pack the accumulated local files into the actual file input using DataTransfer
      const dt = new DataTransfer();
      selectedFiles.forEach((file) => dt.items.add(file));
      fileInput.files = dt.files;

      // Inject the URL strings into hidden inputs so backend receives them
      document
        .querySelectorAll('input[name="imageUrls"]')
        .forEach((el) => el.remove());
      selectedUrls.forEach((url) => {
        const hidden = document.createElement("input");
        hidden.type = "hidden";
        hidden.name = "imageUrls";
        hidden.value = url;
        uploadForm.appendChild(hidden);
      });

      // Disable button to prevent double-submit
      const submitBtn = uploadForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Uploading...';
        submitBtn.disabled = true;
      }
    });
  }

  // --- 5. Custom Image Deletion Modal Logic (Current Images) ---
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

  // --- 6. Set Primary Image Logic (Current Images) ---
  const setPrimaryForms = document.querySelectorAll(".set-primary-form");

  setPrimaryForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      const btn = this.querySelector('button[type="submit"]');
      if (btn) {
        btn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Saving...';
        btn.disabled = true;
      }
    });
  });
});
