document.addEventListener("DOMContentLoaded", () => {

  // ── Launch All buttons ──────────────────────────────────────────────
  document.getElementById("launch-all-primary").addEventListener("click", () => {
    launchGroup("primary");
  });

  document.getElementById("launch-all-secondary").addEventListener("click", () => {
    launchGroup("secondary");
  });

  function launchGroup(group) {
    const cards = document.querySelectorAll(`.card[data-group="${group}"]`);
    cards.forEach((card) => {
      window.open(card.href, "_blank");
    });
  }

  // ── Watch Later: collapsible toggle ─────────────────────────────────
  const toggleBtn = document.getElementById("watch-later-toggle");
  const panel = document.getElementById("watch-later-panel");
  const arrow = document.getElementById("toggle-arrow");

  // Remember open/closed state
  const wasOpen = localStorage.getItem("watchLaterOpen") === "true";
  if (wasOpen) {
    panel.classList.add("open");
    arrow.classList.add("open");
  }

  toggleBtn.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("open");
    arrow.classList.toggle("open");
    localStorage.setItem("watchLaterOpen", isOpen);
  });

  // ── Watch Later: video management ───────────────────────────────────
  const STORAGE_KEY = "watchLaterVideos";
  const form = document.getElementById("add-video-form");
  const input = document.getElementById("video-url-input");
  const listEl = document.getElementById("video-list");
  const emptyEl = document.getElementById("video-empty");
  const countEl = document.getElementById("video-count");

  function loadVideos() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveVideos(videos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  }

  // Extract YouTube video ID from various URL formats
  function extractVideoId(url) {
    url = url.trim();
    let match;

    // youtu.be/ID
    match = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
    if (match) return match[1];

    // youtube.com/watch?v=ID
    match = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    if (match) return match[1];

    // youtube.com/embed/ID
    match = url.match(/\/embed\/([A-Za-z0-9_-]{11})/);
    if (match) return match[1];

    // youtube.com/shorts/ID
    match = url.match(/\/shorts\/([A-Za-z0-9_-]{11})/);
    if (match) return match[1];

    return null;
  }

  function renderVideos() {
    const videos = loadVideos();
    listEl.innerHTML = "";
    countEl.textContent = videos.length;
    emptyEl.style.display = videos.length === 0 ? "block" : "none";

    videos.forEach((video, index) => {
      const item = document.createElement("div");
      item.className = "video-item";

      const watchUrl = `https://www.youtube.com/watch?v=${video.id}`;
      const thumbUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;

      item.innerHTML = `
        <a href="${watchUrl}" target="_blank">
          <img class="video-thumb" src="${thumbUrl}" alt="Thumbnail">
        </a>
        <div class="video-info">
          <a href="${watchUrl}" target="_blank" class="video-title">${video.title || watchUrl}</a>
          <span class="video-url-display">${watchUrl}</span>
        </div>
        <button class="video-remove-btn" data-index="${index}">Remove</button>
      `;

      listEl.appendChild(item);
    });

    // Remove button handlers
    listEl.querySelectorAll(".video-remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        const vids = loadVideos();
        vids.splice(idx, 1);
        saveVideos(vids);
        renderVideos();
      });
    });
  }

  // Try to fetch the video title from the YouTube oEmbed API
  async function fetchTitle(videoId) {
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data.title || null;
    } catch {
      return null;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = input.value.trim();
    if (!url) return;

    const videoId = extractVideoId(url);
    if (!videoId) {
      input.value = "";
      input.placeholder = "Invalid YouTube URL -- try again";
      setTimeout(() => {
        input.placeholder = "Paste a YouTube URL and press Enter";
      }, 2000);
      return;
    }

    // Prevent duplicates
    const videos = loadVideos();
    if (videos.some((v) => v.id === videoId)) {
      input.value = "";
      input.placeholder = "Already in the list!";
      setTimeout(() => {
        input.placeholder = "Paste a YouTube URL and press Enter";
      }, 2000);
      return;
    }

    // Add immediately with placeholder title, then update asynchronously
    const newVideo = { id: videoId, title: "", addedAt: Date.now() };
    videos.unshift(newVideo);
    saveVideos(videos);
    input.value = "";
    renderVideos();

    // Fetch the real title in the background
    const title = await fetchTitle(videoId);
    if (title) {
      const updated = loadVideos();
      const entry = updated.find((v) => v.id === videoId);
      if (entry) {
        entry.title = title;
        saveVideos(updated);
        renderVideos();
      }
    }
  });

  // Initial render
  renderVideos();
});
