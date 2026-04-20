// public/js/upload-images.js

document.addEventListener("DOMContentLoaded", () => {
  const uploadZone = document.getElementById("uploadZone");
  const fileInput = document.getElementById("fileInput");
  const selectFilesBtn = document.getElementById("selectFilesBtn");
  const uploadActionDiv = document.getElementById("uploadActionDiv");
  const selectedFilesText = document.getElementById("selectedFilesText");
  const previewGallery = document.getElementById("previewGallery");
  const uploadForm = document.getElementById("uploadForm");

  const addUrlBtn = document.getElementById("addUrlBtn");
  const imageUrlInput = document.getElementById("imageUrl");

  const currentImageCount = uploadForm
    ? parseInt(uploadForm.getAttribute("data-current-count"), 10) || 0
    : 0;
  const MAX_IMAGES = 8;

  let selectedFiles = [];
  let selectedUrls = [];

  // --- 1. Dynamic URL Success/Error Message Interceptor & Toast Logic ---
  const urlParams = new URLSearchParams(window.location.search);
  const alertsContainer = document.getElementById("dynamicAlertsContainer");

  function showInlineAlert(type, message) {
    if (!alertsContainer) return;
    const icon =
      type === "success"
        ? "bi-check-circle-fill"
        : "bi-exclamation-triangle-fill";
    const alertClass = type === "success" ? "alert-success" : "alert-danger";

    alertsContainer.innerHTML = `
      <div class="alert ${alertClass} d-flex align-items-center shadow-sm alert-dismissible fade show" role="alert">
        <i class="bi ${icon} me-3 fs-5"></i>
        <div>${message}</div>
        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    setTimeout(() => {
      alertsContainer.innerHTML = "";
    }, 3500);
  }

  // Clear existing URL params (used for initial page loads after uploading or deleting)
  if (alertsContainer) {
    if (urlParams.has("success"))
      showInlineAlert("success", urlParams.get("success"));
    else if (urlParams.has("error"))
      showInlineAlert("danger", urlParams.get("error"));
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // --- 2. Core UI Update Function ---
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

    previewGallery.innerHTML = "";

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

  // --- 3. Add Files/URLs ---
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
      fileInput.value = "";
    });
  }

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

      const dt = new DataTransfer();
      selectedFiles.forEach((file) => dt.items.add(file));
      fileInput.files = dt.files;

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

      const submitBtn = uploadForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Uploading...';
        submitBtn.disabled = true;
      }
    });
  }

  // --- 5. Delete Modal Logic ---
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

  // --- 6. Seamless Reordering & Primary Status Control ---
  const imageGallery = document.getElementById("imageGallery");

  function updatePrimaryUI() {
    if (!imageGallery) return;
    const items = imageGallery.querySelectorAll(".image-item");

    items.forEach((item, index) => {
      const badge = item.querySelector(".primary-badge");
      const makePrimaryBtn = item.querySelector(".btn-make-primary");

      // Index 0 is always Primary. Show badge, hide button.
      if (index === 0) {
        if (badge) badge.classList.remove("d-none");
        if (makePrimaryBtn) makePrimaryBtn.classList.add("d-none");
      } else {
        // Not primary. Hide badge, show button.
        if (badge) badge.classList.add("d-none");
        if (makePrimaryBtn) makePrimaryBtn.classList.remove("d-none");
      }
    });
  }

  function saveOrderSilently() {
    if (!imageGallery) return;
    const listingId = imageGallery.getAttribute("data-listing-id");
    const imageItems = imageGallery.querySelectorAll(".image-item");
    const newOrderIds = Array.from(imageItems).map((item) =>
      item.getAttribute("data-id"),
    );

    fetch(`/lender/listings/${listingId}/images/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageIds: newOrderIds }),
    })
      .then((res) => {
        if (!res.ok) {
          showInlineAlert("danger", "Failed to save the new image order.");
        }
        // Removed the success alert entirely for a smoother UX
      })
      .catch((err) => {
        console.error(err);
        showInlineAlert(
          "danger",
          "Network error occurred while saving the new order.",
        );
      });
  }

  // Initialize Drag-and-Drop Sortable
  if (imageGallery && typeof Sortable !== "undefined") {
    new Sortable(imageGallery, {
      animation: 150,
      handle: ".drag-handle",
      ghostClass: "sortable-ghost",
      onEnd: function () {
        updatePrimaryUI(); // Visually update the Primary badge immediately
        saveOrderSilently(); // Send API call to save to backend
      },
    });
  }

  // Event Delegation for "Make Primary" button click
  if (imageGallery) {
    imageGallery.addEventListener("click", (e) => {
      const primaryBtn = e.target.closest(".btn-make-primary");
      if (primaryBtn) {
        e.preventDefault();
        const imageItem = primaryBtn.closest(".image-item");
        if (imageItem) {
          // Physically move the image element to the front of the gallery container
          imageGallery.prepend(imageItem);

          // Update the UI badges and trigger the reorder save
          updatePrimaryUI();
          saveOrderSilently();
        }
      }
    });
  }
});
