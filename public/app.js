// ======================
// DOM REFERENCES
// ======================
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalCaption = document.getElementById("modalCaption");
const modalMeta = document.getElementById("modalMeta");
const modalVideo = document.getElementById("modalVideo");
const modalImage = document.getElementById("modalImage");
const thumbStrip = document.getElementById("thumbStrip");

let currentReelIndex = 0;
let currentMediaIndex = 0;

// ======================
// OPEN MODAL
// ======================
function openModal(id) {
  const reelIndex = window.REELS.findIndex(r => r.id === id);
  if (reelIndex === -1) return;

  currentReelIndex = reelIndex;
  const reel = window.REELS[reelIndex];

  // Always start with first media item
  currentMediaIndex = 0;
  if (!reel) {
    console.warn("No reel matches ID:", id);
    return;
  }

  modalTitle.textContent = reel.caption;
  modalCaption.textContent = reel.caption;

  const shortcode = reel.metadata?.node?.shortcode;
  if (shortcode) {
    modalTitle.onclick = () => {
      window.open(`https://www.instagram.com/p/${shortcode}/`, "_blank");
    };
    modalTitle.classList.add("cursor-pointer", "text-blue-400", "hover:underline");
  } else {
    modalTitle.onclick = null;
    modalTitle.classList.remove("cursor-pointer", "text-blue-400", "hover:underline");
  }

  // Clear thumbnail strip
  thumbStrip.innerHTML = "";
  const mediaContainer = document.getElementById("mediaContainer");
  // If only one item → hide strip
  if (reel.media.length <= 1) {
    thumbStrip.classList.add("hidden");
    mediaContainer.style.height = "90vh";

  } else {
    thumbStrip.classList.remove("hidden");
    mediaContainer.style.height = "80vh";


    // Build thumbnails
    reel.media.forEach((item) => {
      const btn = document.createElement("button");
      btn.className =
        "w-20 h-20 rounded overflow-hidden border border-slate-600";

      const img = document.createElement("img");
      img.src = item.jpg;
      img.className = "object-cover w-full h-full";

      btn.appendChild(img);
      btn.onclick = () => showMedia(item);
      thumbStrip.appendChild(btn);
    });
  }

  // Show first media automatically
  if (reel.media.length > 0) {
    showMedia(reel.media[0]);
  }

  modal.classList.remove("hidden");
}

function showMediaByIndex(reel, index) {
  // clamp index
  if (index < 0) index = 0;
  if (index >= reel.media.length) index = reel.media.length - 1;

  currentMediaIndex = index;
  const item = reel.media[index];

  // Stop any previous video
  modalVideo.pause();
  modalVideo.currentTime = 0;
  modalVideo.classList.add("hidden");
  modalImage.classList.add("hidden");

  if (item.mp4) {
    modalVideo.src = item.mp4;
    modalVideo.classList.remove("hidden");
    modalVideo.play().catch(() => { });
  } else {
    modalImage.src = item.jpg;
    modalImage.classList.remove("hidden");
  }
}

// ======================
// SHOW MEDIA
// ======================
function showMedia(item) {
  const reel = window.REELS[currentReelIndex];
  const index = reel.media.indexOf(item);
  if (index !== -1) {
    showMediaByIndex(reel, index);
  }
}

// ======================
// CLOSE MODAL (click background)
// ======================
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    // Stop any playing video
    modalVideo.pause();
    modalVideo.currentTime = 0;
    modalVideo.src = "";  // unload video

    modal.classList.add("hidden");
  }
});

function nextMediaOrPost() {
  const reels = window.REELS;
  const reel = reels[currentReelIndex];

  if (currentMediaIndex < reel.media.length - 1) {
    // go to next media
    showMediaByIndex(reel, currentMediaIndex + 1);
    return;
  }

  // move to next reel
  if (currentReelIndex < reels.length - 1) {
    openModal(reels[currentReelIndex + 1].id);
  }
}

function prevMediaOrPost() {
  const reels = window.REELS;
  const reel = reels[currentReelIndex];

  if (currentMediaIndex > 0) {
    // go to previous media
    showMediaByIndex(reel, currentMediaIndex - 1);
    return;
  }

  // move to previous reel
  if (currentReelIndex > 0) {
    const prevReel = reels[currentReelIndex - 1];
    openModal(prevReel.id);

    // jump to the LAST media of previous reel
    const lastIndex = prevReel.media.length - 1;
    showMediaByIndex(prevReel, lastIndex);
  }
}
document.addEventListener("keydown", (e) => {
  if (modal.classList.contains("hidden")) return;

  if (e.key === "ArrowRight") {
    nextMediaOrPost();
  } else if (e.key === "ArrowLeft") {
    prevMediaOrPost();
  }
});

function filterReels() {
  const q = document.getElementById("searchInput").value.toLowerCase();

  // all Reel DOM buttons
  const buttons = document.querySelectorAll("[data-reel-id]");

  buttons.forEach(btn => {
    const id = btn.dataset.reelId;
    const reel = window.REELS.find(r => r.id === id);

    if (!reel) return;

    const caption = (reel.caption || "").toLowerCase();
    const metadataStr = JSON.stringify(reel.metadata || {}).toLowerCase();

    const matches =
      caption.includes(q) ||
      metadataStr.includes(q) ||
      id.toLowerCase().includes(q);

    btn.style.display = matches ? "" : "none";
  });
}

function updateThumbSize() {
  const size = document.getElementById("thumbSize").value;
  const buttons = document.querySelectorAll("[data-reel-id]");

  buttons.forEach((btn) => {
    btn.style.width = size + "px";
    btn.style.height = size + "px";

    const img = btn.querySelector("img");
    if (img) {
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
    }
  });
}
// ===== Global Keyboard Controls =====
document.addEventListener("keydown", (e) => {
  if (modal.classList.contains("hidden")) return;

  // Close modal with ESC
  if (e.key === "Escape") {
    modalVideo.pause();
    modalVideo.currentTime = 0;
    modalVideo.src = "";
    modal.classList.add("hidden");
    return;
  }

  // Toggle video play/pause with SPACE
  if (e.key === " " || e.code === "Space") {
    if (!modalVideo.classList.contains("hidden")) {
      if (modalVideo.paused) modalVideo.play();
      else modalVideo.pause();
      e.preventDefault(); // prevent scroll
    }
  }
});