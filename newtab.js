document.addEventListener("DOMContentLoaded", () => {

  // ── Greeting & Clocks ──────────────────────────────────────────────
  const greetings = [
    "Welcome back, Reza. Ready to build something great?",
    "Good to see you, Reza. What's on the agenda today?",
    "Hey Reza, let's make today count.",
    "Hello Reza! Another day, another opportunity.",
    "Welcome, Reza. The world is waiting for your ideas.",
    "Hi Reza! Hope you're having a fantastic day.",
    "Reza, great things are ahead. Let's go.",
    "Hey Reza, time to create something amazing.",
    "Welcome back, Reza. You've got this.",
    "Reza, the best time to start is now.",
    "Glad you're here, Reza. Let's get things done.",
    "Hey Reza, stay curious and keep pushing forward.",
    "Welcome, Reza! Make today better than yesterday.",
    "Hi Reza, another chance to do something remarkable.",
    "Reza, focus, execute, repeat. Let's go.",
  ];

  function pickGreeting() {
    // Time-of-day prefix
    const hour = new Date().getHours();
    let prefix;
    if (hour < 5) prefix = "Burning the midnight oil, Reza?";
    else if (hour < 12) prefix = "Good morning, Reza!";
    else if (hour < 17) prefix = "Good afternoon, Reza!";
    else if (hour < 21) prefix = "Good evening, Reza!";
    else prefix = "Late night session, Reza?";

    // Pick a random motivational line
    const line = greetings[Math.floor(Math.random() * greetings.length)];

    // Alternate: sometimes use just the time-based greeting, sometimes the motivational one
    return Math.random() > 0.4 ? line : prefix;
  }

  document.getElementById("greeting").textContent = pickGreeting();

  function formatTime(tz) {
    return new Date().toLocaleTimeString("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  function formatDate() {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function updateClocks() {
    document.getElementById("clock-pt").textContent = formatTime("America/Los_Angeles");
    document.getElementById("clock-et").textContent = formatTime("America/New_York");
    document.getElementById("clock-tehran").textContent = formatTime("Asia/Tehran");
    document.getElementById("clock-date").textContent = formatDate();
  }

  updateClocks();
  setInterval(updateClocks, 1000);

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

  // ── Saved Links ─────────────────────────────────────────────────────
  const SAVED_LINKS_KEY = "savedLinks";
  const slToggleBtn = document.getElementById("saved-links-toggle");
  const slPanel = document.getElementById("saved-links-panel");
  const slArrow = document.getElementById("saved-links-arrow");
  const slListEl = document.getElementById("saved-links-list");
  const slEmptyEl = document.getElementById("saved-links-empty");
  const slCountEl = document.getElementById("saved-links-count");

  const slWasOpen = localStorage.getItem("savedLinksOpen") === "true";
  if (slWasOpen) {
    slPanel.classList.add("open");
    slArrow.classList.add("open");
  }

  slToggleBtn.addEventListener("click", () => {
    const isOpen = slPanel.classList.toggle("open");
    slArrow.classList.toggle("open");
    localStorage.setItem("savedLinksOpen", isOpen);
  });

  function loadSavedLinks() {
    try {
      return JSON.parse(localStorage.getItem(SAVED_LINKS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveSavedLinks(links) {
    localStorage.setItem(SAVED_LINKS_KEY, JSON.stringify(links));
  }

  function renderSavedLinks() {
    const links = loadSavedLinks();
    slListEl.innerHTML = "";
    slCountEl.textContent = links.length;
    slEmptyEl.style.display = links.length === 0 ? "block" : "none";

    links.forEach((link, index) => {
      const domain = getDomain(link.url);
      const faviconSrc = link.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
      const item = document.createElement("div");
      item.className = "saved-item";
      item.innerHTML = `
        <img class="saved-favicon" src="${faviconSrc}" alt="">
        <div class="saved-info">
          <a href="${link.url}" target="_blank" class="saved-title">${link.title || link.url}</a>
          <span class="saved-url-display">${link.url}</span>
        </div>
        <button class="video-remove-btn" data-index="${index}">Remove</button>
      `;
      slListEl.appendChild(item);
    });

    slListEl.querySelectorAll(".video-remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        const lnks = loadSavedLinks();
        lnks.splice(idx, 1);
        saveSavedLinks(lnks);
        renderSavedLinks();
      });
    });
  }

  renderSavedLinks();

  // Helper used by both tab manager and saved links (needs to be available early)
  function getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url || "(unknown)";
    }
  }

  // ── Tab Manager ─────────────────────────────────────────────────────
  const tmToggleBtn = document.getElementById("tab-manager-toggle");
  const tmPanel = document.getElementById("tab-manager-panel");
  const tmArrow = document.getElementById("tab-toggle-arrow");
  const tmContent = document.getElementById("tm-content");
  const tmSearch = document.getElementById("tm-search");
  const tmTotalCount = document.getElementById("tab-total-count");
  const tmViewBtns = document.querySelectorAll(".tm-view-btn");

  let currentView = "domain";
  let allTabs = [];

  // Collapsible state
  const tmWasOpen = localStorage.getItem("tabManagerOpen") === "true";
  if (tmWasOpen) {
    tmPanel.classList.add("open");
    tmArrow.classList.add("open");
  }

  tmToggleBtn.addEventListener("click", () => {
    const isOpen = tmPanel.classList.toggle("open");
    tmArrow.classList.toggle("open");
    localStorage.setItem("tabManagerOpen", isOpen);
    if (isOpen) loadTabs();
  });

  // View switcher
  tmViewBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tmViewBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentView = btn.dataset.view;
      renderTabs();
    });
  });

  // Search filter
  tmSearch.addEventListener("input", () => {
    renderTabs();
  });

  // Jump to tab
  function jumpToTab(tabId, windowId) {
    chrome.tabs.update(tabId, { active: true });
    chrome.windows.update(windowId, { focused: true });
  }

  // Human-readable time ago
  function timeAgo(timestamp) {
    if (!timestamp) return "";
    const diff = Date.now() - timestamp;
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return "just now";
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  }

  // Age class for colour coding
  function ageClass(timestamp) {
    if (!timestamp) return "";
    const hours = (Date.now() - timestamp) / 1000 / 60 / 60;
    if (hours > 72) return "very-old";
    if (hours > 24) return "old";
    return "";
  }

  // Check if a URL is a YouTube video
  function isYouTubeUrl(url) {
    return /(?:youtube\.com\/(?:watch|embed|shorts)|youtu\.be\/)/.test(url || "");
  }

  // Save a tab to the appropriate list (YouTube → Watch Later, else → Saved Links)
  function saveTabForLater(tab, btn) {
    const url = tab.url;
    if (isYouTubeUrl(url)) {
      const videoId = extractVideoId(url);
      if (videoId) {
        const videos = loadVideos();
        if (!videos.some((v) => v.id === videoId)) {
          videos.unshift({ id: videoId, title: tab.title || "", addedAt: Date.now() });
          saveVideos(videos);
          renderVideos();
        }
      }
    } else {
      const links = loadSavedLinks();
      if (!links.some((l) => l.url === url)) {
        links.unshift({ url, title: tab.title || url, favicon: tab.favIconUrl || "", addedAt: Date.now() });
        saveSavedLinks(links);
        renderSavedLinks();
      }
    }
    if (btn) {
      btn.textContent = "Saved";
      btn.classList.add("saved");
    }
  }

  // Build one tab row element
  function buildTabRow(tab, extras) {
    const row = document.createElement("div");
    row.className = "tm-tab-row" + (tab.active ? " active-tab" : "");

    const favicon = tab.favIconUrl
      ? `<img class="tm-tab-favicon" src="${tab.favIconUrl}" alt="">`
      : `<img class="tm-tab-favicon" src="https://www.google.com/s2/favicons?domain=${getDomain(tab.url)}&sz=32" alt="">`;

    let badges = "";
    if (tab.pinned) badges += `<span class="tm-tab-badge tm-badge-pinned">pinned</span>`;
    if (tab.active) badges += `<span class="tm-tab-badge tm-badge-active">active</span>`;
    if (extras?.duplicate) badges += `<span class="tm-tab-badge tm-badge-duplicate">dup</span>`;

    let age = "";
    if (extras?.showAge && tab.lastAccessed) {
      const cls = ageClass(tab.lastAccessed);
      age = `<span class="tm-tab-age ${cls}">${timeAgo(tab.lastAccessed)}</span>`;
    }

    // Check if already saved
    const alreadySaved = isYouTubeUrl(tab.url)
      ? loadVideos().some((v) => v.id === extractVideoId(tab.url))
      : loadSavedLinks().some((l) => l.url === tab.url);

    const title = tab.title || tab.url || "(untitled)";
    row.innerHTML = `${favicon}<span class="tm-tab-title" title="${title}">${title}</span>${badges}${age}<button class="tm-tab-save${alreadySaved ? " saved" : ""}">${alreadySaved ? "Saved" : "Save"}</button>`;

    // Click on the row (not the save button) → jump to tab
    row.addEventListener("click", (e) => {
      if (e.target.closest(".tm-tab-save")) return;
      jumpToTab(tab.id, tab.windowId);
    });

    // Save button
    row.querySelector(".tm-tab-save").addEventListener("click", (e) => {
      e.stopPropagation();
      saveTabForLater(tab, e.target);
    });

    return row;
  }

  // ── Domain view ──────────────────────────────────────────────────
  function renderDomainView(tabs) {
    // Group by domain
    const groups = {};
    tabs.forEach((tab) => {
      const domain = getDomain(tab.url);
      if (!groups[domain]) groups[domain] = [];
      groups[domain].push(tab);
    });

    // Find duplicate URLs (exact match)
    const urlCounts = {};
    tabs.forEach((tab) => {
      const u = tab.url;
      urlCounts[u] = (urlCounts[u] || 0) + 1;
    });

    // Sort domains: duplicates first, then by tab count descending, then alpha
    const sorted = Object.entries(groups).sort((a, b) => {
      const aHasDup = a[1].some((t) => urlCounts[t.url] > 1) ? 1 : 0;
      const bHasDup = b[1].some((t) => urlCounts[t.url] > 1) ? 1 : 0;
      if (bHasDup !== aHasDup) return bHasDup - aHasDup;
      if (b[1].length !== a[1].length) return b[1].length - a[1].length;
      return a[0].localeCompare(b[0]);
    });

    const frag = document.createDocumentFragment();

    sorted.forEach(([domain, domainTabs]) => {
      const hasDuplicates = domainTabs.some((t) => urlCounts[t.url] > 1);

      const group = document.createElement("div");
      group.className = "tm-domain-group";

      const header = document.createElement("div");
      header.className = "tm-domain-header";
      header.innerHTML = `
        <img class="tm-domain-favicon" src="https://www.google.com/s2/favicons?domain=${domain}&sz=32" alt="">
        <span class="tm-domain-name">${domain}</span>
        <span class="tm-domain-count ${hasDuplicates ? "duplicate" : ""}">${domainTabs.length}${hasDuplicates ? " (dupes)" : ""}</span>
        <span class="tm-domain-arrow">&#9660;</span>
      `;

      const tabList = document.createElement("div");
      tabList.className = "tm-domain-tabs";

      domainTabs.forEach((tab) => {
        const isDup = urlCounts[tab.url] > 1;
        tabList.appendChild(buildTabRow(tab, { duplicate: isDup }));
      });

      header.addEventListener("click", () => {
        tabList.classList.toggle("open");
        header.querySelector(".tm-domain-arrow").classList.toggle("open");
      });

      // Auto-expand groups with duplicates
      if (hasDuplicates) {
        tabList.classList.add("open");
        header.querySelector(".tm-domain-arrow").classList.add("open");
      }

      group.appendChild(header);
      group.appendChild(tabList);
      frag.appendChild(group);
    });

    tmContent.innerHTML = "";
    if (sorted.length === 0) {
      tmContent.innerHTML = `<div class="tm-empty">No tabs found.</div>`;
    } else {
      tmContent.appendChild(frag);
    }
  }

  // ── Window / Age view ────────────────────────────────────────────
  function renderWindowView(tabs) {
    // Group by windowId
    const windows = {};
    tabs.forEach((tab) => {
      if (!windows[tab.windowId]) windows[tab.windowId] = [];
      windows[tab.windowId].push(tab);
    });

    // Sort windows by their oldest tab (window with the oldest tab first)
    const sortedWindows = Object.entries(windows).sort((a, b) => {
      const oldestA = Math.min(...a[1].map((t) => t.lastAccessed || Date.now()));
      const oldestB = Math.min(...b[1].map((t) => t.lastAccessed || Date.now()));
      return oldestA - oldestB;
    });

    // Within each window, sort tabs oldest-accessed first
    sortedWindows.forEach(([, winTabs]) => {
      winTabs.sort((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0));
    });

    const frag = document.createDocumentFragment();

    sortedWindows.forEach(([winId, winTabs], i) => {
      const group = document.createElement("div");
      group.className = "tm-window-group";

      const header = document.createElement("div");
      header.className = "tm-window-header";

      const current = winTabs.some((t) => t.active && t.windowId === parseInt(winId));
      const label = current ? `Window ${i + 1} (current)` : `Window ${i + 1}`;

      header.innerHTML = `
        <span class="tm-window-label">${label}</span>
        <span class="tm-window-count">${winTabs.length} tab${winTabs.length !== 1 ? "s" : ""}</span>
      `;

      group.appendChild(header);

      winTabs.forEach((tab) => {
        group.appendChild(buildTabRow(tab, { showAge: true }));
      });

      frag.appendChild(group);
    });

    tmContent.innerHTML = "";
    if (sortedWindows.length === 0) {
      tmContent.innerHTML = `<div class="tm-empty">No tabs found.</div>`;
    } else {
      tmContent.appendChild(frag);
    }
  }

  // ── Load & render ────────────────────────────────────────────────
  function renderTabs() {
    const query = tmSearch.value.trim().toLowerCase();
    let filtered = allTabs;

    if (query) {
      filtered = allTabs.filter((tab) => {
        const title = (tab.title || "").toLowerCase();
        const url = (tab.url || "").toLowerCase();
        return title.includes(query) || url.includes(query);
      });
    }

    if (currentView === "domain") {
      renderDomainView(filtered);
    } else {
      renderWindowView(filtered);
    }
  }

  function loadTabs() {
    if (!chrome?.tabs?.query) {
      tmContent.innerHTML = `<div class="tm-empty">Tab API not available. Make sure the extension has the "tabs" permission.</div>`;
      return;
    }

    chrome.tabs.query({}, (tabs) => {
      allTabs = tabs;
      tmTotalCount.textContent = tabs.length;
      renderTabs();
    });
  }

  // Load on startup if panel is already open
  if (tmWasOpen) loadTabs();
});
