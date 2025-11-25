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

// ======================
// OPEN MODAL
// ======================
function openModal(id) {
    const reel = window.REELS.find(r => r.id === id);
    if (!reel) {
        console.warn("No reel matches ID:", id);
        return;
    }

    modalTitle.textContent = reel.id;
    modalCaption.textContent = reel.caption;
    modalMeta.textContent = JSON.stringify(reel.metadata, null, 2);

    // Clear thumbnail strip
    thumbStrip.innerHTML = "";

    reel.media.forEach(item => {
        const btn = document.createElement("button");
        btn.className = "w-20 h-20 rounded overflow-hidden border border-slate-600";

        const img = document.createElement("img");
        img.src = item.jpg;
        img.className = "object-cover w-full h-full";

        btn.appendChild(img);
        btn.onclick = () => showMedia(item);
        thumbStrip.appendChild(btn);
    });

    // Show first media automatically
    if (reel.media.length > 0) {
        showMedia(reel.media[0]);
    }

    modal.classList.remove("hidden");
}

// ======================
// SHOW MEDIA
// ======================
function showMedia(item) {
    modalVideo.classList.add("hidden");
    modalImage.classList.add("hidden");

    if (item.mp4) {
        modalVideo.src = item.mp4;
        modalVideo.classList.remove("hidden");
    } else {
        modalImage.src = item.jpg;
        modalImage.classList.remove("hidden");
    }
}

// ======================
// CLOSE MODAL (click background)
// ======================
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden");
    }
});