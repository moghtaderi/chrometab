document.addEventListener("DOMContentLoaded", () => {

  /* ═══════════════════════════════════════════
     Helpers
     ═══════════════════════════════════════════ */
  function getDomain(url) {
    try { return new URL(url).hostname; } catch { return url || "(unknown)"; }
  }

  function timeAgo(ts) {
    if (!ts) return "";
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);  if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);  if (h < 24) return h + "h ago";
    const d = Math.floor(h / 24);  if (d < 30) return d + "d ago";
    return Math.floor(d / 30) + "mo ago";
  }

  function ageClass(ts) {
    if (!ts) return "";
    const h = (Date.now() - ts) / 3600000;
    return h > 72 ? "very-old" : h > 24 ? "old" : "";
  }

  function isYouTubeUrl(url) {
    return /(?:youtube\.com\/(?:watch|embed|shorts)|youtu\.be\/)/.test(url || "");
  }

  function extractVideoId(url) {
    let m;
    if ((m = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/))) return m[1];
    if ((m = url.match(/[?&]v=([A-Za-z0-9_-]{11})/)))      return m[1];
    if ((m = url.match(/\/embed\/([A-Za-z0-9_-]{11})/)))    return m[1];
    if ((m = url.match(/\/shorts\/([A-Za-z0-9_-]{11})/)))   return m[1];
    return null;
  }

  function faviconUrl(domain) {
    return "https://www.google.com/s2/favicons?domain=" + domain + "&sz=128";
  }

  function store(key)       { try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; } }
  function storePut(key, v) { localStorage.setItem(key, JSON.stringify(v)); }

  /* ═══════════════════════════════════════════
     Theme
     ═══════════════════════════════════════════ */
  const html = document.documentElement;
  const themeSaved = localStorage.getItem("theme") || "dark";
  html.setAttribute("data-theme", themeSaved);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ═══════════════════════════════════════════
     Greeting
     ═══════════════════════════════════════════ */
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
    const h = new Date().getHours();
    const tod = h < 5 ? "Burning the midnight oil, Reza?"
              : h < 12 ? "Good morning, Reza."
              : h < 17 ? "Good afternoon, Reza."
              : h < 21 ? "Good evening, Reza."
              : "Late night session, Reza?";
    const mot = greetings[Math.floor(Math.random() * greetings.length)];
    return Math.random() > 0.4 ? mot : tod;
  }
  document.getElementById("greeting").textContent = pickGreeting();

  /* ═══════════════════════════════════════════
     Clocks
     ═══════════════════════════════════════════ */
  function clockParts(tz) {
    const now = new Date();
    const full = now.toLocaleTimeString("en-US", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    // "10:35:22 PM"
    const [time, ap] = full.split(" ");
    const [hh, mm, ss] = time.split(":");
    return { hm: hh + ":" + mm, sc: ss, ap: ap };
  }

  function updateClocks() {
    const pt = clockParts("America/Los_Angeles");
    const et = clockParts("America/New_York");
    const th = clockParts("Asia/Tehran");

    document.getElementById("clock-pt-hm").textContent = pt.hm;
    document.getElementById("clock-pt-sc").textContent = pt.sc;
    document.getElementById("clock-pt-ap").textContent = pt.ap;

    document.getElementById("clock-et-hm").textContent = et.hm;
    document.getElementById("clock-et-sc").textContent = et.sc;
    document.getElementById("clock-et-ap").textContent = et.ap;

    document.getElementById("clock-th-hm").textContent = th.hm;
    document.getElementById("clock-th-sc").textContent = th.sc;
    document.getElementById("clock-th-ap").textContent = th.ap;

    document.getElementById("date-line").textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  }
  updateClocks();
  setInterval(updateClocks, 1000);

  /* ═══════════════════════════════════════════
     Dynamic AI Cards
     ═══════════════════════════════════════════ */
  const DEFAULT_CARDS = {
    primary: [
      { id: "claude",  name: "Claude",   url: "https://claude.ai" },
      { id: "chatgpt", name: "ChatGPT",  url: "https://chatgpt.com" },
      { id: "gemini",  name: "Gemini",   url: "https://gemini.google.com" },
      { id: "grok",    name: "Grok",     url: "https://grok.com" },
    ],
    secondary: [
      { id: "deepseek", name: "DeepSeek", url: "https://chat.deepseek.com" },
      { id: "minimax",  name: "MiniMax",  url: "https://agent.minimax.io/" },
      { id: "qwen",     name: "Qwen",     url: "https://chat.qwen.ai" },
      { id: "zai",      name: "Z AI",     url: "https://z.ai" },
    ],
    tools: [
      { id: "notebooklm", name: "NotebookLM", url: "https://notebooklm.google.com/" },
    ],
  };

  // Special logo overrides (when Google's S2 favicon doesn't return the right icon)
  const LOGO_OVERRIDES = {
    notebooklm: "https://notebooklm.google.com/favicon.ico",
  };

  function loadCards(group) {
    return store("cards_" + group) || DEFAULT_CARDS[group].map(c => ({ ...c }));
  }
  function saveCards(group, cards) { storePut("cards_" + group, cards); }

  function logoSrc(card) {
    if (LOGO_OVERRIDES[card.id]) return LOGO_OVERRIDES[card.id];
    return faviconUrl(getDomain(card.url));
  }

  function renderCards(group) {
    const grid = document.getElementById("grid-" + group);
    const cards = loadCards(group);
    grid.innerHTML = "";

    cards.forEach((card, i) => {
      const el = document.createElement("a");
      el.href = card.url;
      el.className = "card";
      el.draggable = true;
      el.dataset.group = group;
      el.dataset.index = i;
      if (card.id) el.dataset.id = card.id;
      if (card.accent) el.style.setProperty("--card-accent", card.accent);

      el.innerHTML =
        '<img class="card-logo" src="' + logoSrc(card) + '" alt="">' +
        '<span class="card-label">' + card.name + '</span>' +
        (card.custom ? '<button class="card-remove" title="Remove">&times;</button>' : '');

      // Remove custom card
      const removeBtn = el.querySelector(".card-remove");
      if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
          e.preventDefault(); e.stopPropagation();
          const arr = loadCards(group);
          arr.splice(i, 1);
          saveCards(group, arr);
          renderCards(group);
        });
      }

      // Drag handlers
      el.addEventListener("dragstart", (e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", JSON.stringify({ group, index: i }));
        el.classList.add("dragging");
      });
      el.addEventListener("dragend", () => el.classList.remove("dragging"));
      el.addEventListener("dragover", (e) => { e.preventDefault(); el.classList.add("drag-over"); });
      el.addEventListener("dragleave", () => el.classList.remove("drag-over"));
      el.addEventListener("drop", (e) => {
        e.preventDefault();
        el.classList.remove("drag-over");
        try {
          const src = JSON.parse(e.dataTransfer.getData("text/plain"));
          if (src.group !== group) return;
          const arr = loadCards(group);
          const [moved] = arr.splice(src.index, 1);
          arr.splice(i, 0, moved);
          saveCards(group, arr);
          renderCards(group);
        } catch {}
      });

      grid.appendChild(el);
    });

    // "+" add card
    const addBtn = document.createElement("div");
    addBtn.className = "card card-add";
    addBtn.innerHTML = '<span class="card-add-icon">+</span><span class="card-add-label">Add</span>';
    addBtn.addEventListener("click", () => openAddModal(group));
    grid.appendChild(addBtn);
  }

  ["primary", "secondary", "tools"].forEach(renderCards);

  // Launch All
  document.querySelectorAll(".launch-all-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cards = loadCards(btn.dataset.group);
      cards.forEach(c => window.open(c.url, "_blank"));
    });
  });

  // Add-card modal
  const modal     = document.getElementById("add-card-modal");
  const acName    = document.getElementById("ac-name");
  const acUrl     = document.getElementById("ac-url");
  const acGroup   = document.getElementById("ac-group");

  function openAddModal(group) {
    acName.value = ""; acUrl.value = ""; acGroup.value = group;
    modal.hidden = false;
    acName.focus();
  }

  document.getElementById("ac-cancel").addEventListener("click", () => { modal.hidden = true; });
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });

  document.getElementById("ac-save").addEventListener("click", () => {
    const name = acName.value.trim();
    let url = acUrl.value.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//.test(url)) url = "https://" + url;
    const group = acGroup.value;
    const cards = loadCards(group);
    const PALETTE = ["#e06030","#30a0e0","#e0a030","#50c878","#c850c8","#e04040","#40b0b0","#b08040"];
    cards.push({ id: "custom_" + Date.now(), name, url, custom: true, accent: PALETTE[cards.length % PALETTE.length] });
    saveCards(group, cards);
    renderCards(group);
    modal.hidden = true;
  });

  /* ═══════════════════════════════════════════
     Collapsible Panels (generic)
     ═══════════════════════════════════════════ */
  function initCollapsible(toggleId, panelId, arrowId, storeKey, onOpen) {
    const toggle = document.getElementById(toggleId);
    const panel  = document.getElementById(panelId);
    const arrow  = document.getElementById(arrowId);
    const saved  = localStorage.getItem(storeKey) === "true";
    if (saved) { panel.classList.add("open"); arrow.classList.add("open"); }

    toggle.addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      arrow.classList.toggle("open");
      localStorage.setItem(storeKey, open);
      if (open && onOpen) onOpen();
    });
    return { panel, arrow, isOpen: () => panel.classList.contains("open") };
  }

  /* ═══════════════════════════════════════════
     Watch Later
     ═══════════════════════════════════════════ */
  const WL_KEY = "watchLaterVideos";
  function loadVideos()     { return store(WL_KEY) || []; }
  function saveVideos(v)    { storePut(WL_KEY, v); }

  const wlList  = document.getElementById("video-list");
  const wlEmpty = document.getElementById("video-empty");
  const wlCount = document.getElementById("video-count");

  function renderVideos() {
    const videos = loadVideos();
    wlList.innerHTML = "";
    wlCount.textContent = videos.length;
    wlEmpty.style.display = videos.length ? "none" : "block";

    videos.forEach((v, i) => {
      const url = "https://www.youtube.com/watch?v=" + v.id;
      const thumb = "https://img.youtube.com/vi/" + v.id + "/mqdefault.jpg";
      const row = document.createElement("div");
      row.className = "item-row";
      row.innerHTML =
        '<a href="' + url + '" target="_blank"><img class="item-thumb" src="' + thumb + '" alt=""></a>' +
        '<div class="item-info"><a href="' + url + '" target="_blank" class="item-title">' + (v.title || url) + '</a>' +
        '<span class="item-url">' + url + '</span></div>' +
        '<button class="item-remove" data-i="' + i + '">Remove</button>';
      wlList.appendChild(row);
    });

    wlList.querySelectorAll(".item-remove").forEach(b => b.addEventListener("click", (e) => {
      const arr = loadVideos(); arr.splice(+e.target.dataset.i, 1); saveVideos(arr); renderVideos();
    }));
  }

  async function fetchYTTitle(id) {
    try {
      const r = await fetch("https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=" + id + "&format=json");
      if (!r.ok) return null;
      return (await r.json()).title || null;
    } catch { return null; }
  }

  const wlForm  = document.getElementById("add-video-form");
  const wlInput = document.getElementById("video-url-input");

  wlForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = wlInput.value.trim();
    if (!url) return;
    const vid = extractVideoId(url);
    if (!vid) { wlInput.value = ""; wlInput.placeholder = "Invalid YouTube URL"; setTimeout(() => { wlInput.placeholder = "Paste a YouTube URL and press Enter"; }, 2000); return; }
    const videos = loadVideos();
    if (videos.some(v => v.id === vid)) { wlInput.value = ""; wlInput.placeholder = "Already saved!"; setTimeout(() => { wlInput.placeholder = "Paste a YouTube URL and press Enter"; }, 2000); return; }
    videos.unshift({ id: vid, title: "", addedAt: Date.now() });
    saveVideos(videos); wlInput.value = ""; renderVideos();
    const title = await fetchYTTitle(vid);
    if (title) { const arr = loadVideos(); const e = arr.find(v => v.id === vid); if (e) { e.title = title; saveVideos(arr); renderVideos(); } }
  });

  initCollapsible("watch-later-toggle", "watch-later-panel", "wl-arrow", "wlOpen");
  renderVideos();

  /* ═══════════════════════════════════════════
     Saved Links
     ═══════════════════════════════════════════ */
  const SL_KEY = "savedLinks";
  function loadLinks()    { return store(SL_KEY) || []; }
  function saveLinks(v)   { storePut(SL_KEY, v); }

  const slList  = document.getElementById("saved-links-list");
  const slEmpty = document.getElementById("saved-links-empty");
  const slCount = document.getElementById("saved-links-count");

  function renderLinks() {
    const links = loadLinks();
    slList.innerHTML = "";
    slCount.textContent = links.length;
    slEmpty.style.display = links.length ? "none" : "block";

    links.forEach((l, i) => {
      const fav = l.favicon || faviconUrl(getDomain(l.url));
      const row = document.createElement("div");
      row.className = "item-row";
      row.innerHTML =
        '<img class="item-favicon" src="' + fav + '" alt="">' +
        '<div class="item-info"><a href="' + l.url + '" target="_blank" class="item-title">' + (l.title || l.url) + '</a>' +
        '<span class="item-url">' + l.url + '</span></div>' +
        '<button class="item-remove" data-i="' + i + '">Remove</button>';
      slList.appendChild(row);
    });

    slList.querySelectorAll(".item-remove").forEach(b => b.addEventListener("click", (e) => {
      const arr = loadLinks(); arr.splice(+e.target.dataset.i, 1); saveLinks(arr); renderLinks();
    }));
  }

  initCollapsible("saved-links-toggle", "saved-links-panel", "sl-arrow", "slOpen");
  renderLinks();

  /* ═══════════════════════════════════════════
     Tab Manager
     ═══════════════════════════════════════════ */
  let allTabs = [];
  let tmView  = "domain";

  const tmContent = document.getElementById("tm-content");
  const tmSearch  = document.getElementById("tm-search");
  const tmCount   = document.getElementById("tab-total-count");
  const tmViewBtns = document.querySelectorAll(".tm-view-btn");

  const tm = initCollapsible("tab-manager-toggle", "tab-manager-panel", "tab-toggle-arrow", "tmOpen", loadTabs);

  tmViewBtns.forEach(b => b.addEventListener("click", () => {
    tmViewBtns.forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    tmView = b.dataset.view;
    renderTM();
  }));
  tmSearch.addEventListener("input", renderTM);

  function jumpToTab(tabId, winId) {
    chrome.tabs.update(tabId, { active: true });
    chrome.windows.update(winId, { focused: true });
  }

  function saveTabForLater(tab, btn) {
    if (isYouTubeUrl(tab.url)) {
      const vid = extractVideoId(tab.url);
      if (vid) { const arr = loadVideos(); if (!arr.some(v => v.id === vid)) { arr.unshift({ id: vid, title: tab.title || "", addedAt: Date.now() }); saveVideos(arr); renderVideos(); } }
    } else {
      const arr = loadLinks();
      if (!arr.some(l => l.url === tab.url)) { arr.unshift({ url: tab.url, title: tab.title || tab.url, favicon: tab.favIconUrl || "", addedAt: Date.now() }); saveLinks(arr); renderLinks(); }
    }
    if (btn) { btn.textContent = "Saved"; btn.classList.add("saved"); }
  }

  function buildTabRow(tab, extras) {
    const row = document.createElement("div");
    row.className = "tm-tab-row" + (tab.active ? " active-tab" : "");

    const fav = tab.favIconUrl || faviconUrl(getDomain(tab.url));
    let badges = "";
    if (tab.pinned) badges += '<span class="tm-tab-badge tm-badge-pinned">pinned</span>';
    if (tab.active) badges += '<span class="tm-tab-badge tm-badge-active">active</span>';
    if (extras?.duplicate) badges += '<span class="tm-tab-badge tm-badge-dup">dup</span>';

    let age = "";
    if (extras?.showAge && tab.lastAccessed) {
      age = '<span class="tm-tab-age ' + ageClass(tab.lastAccessed) + '">' + timeAgo(tab.lastAccessed) + '</span>';
    }

    const already = isYouTubeUrl(tab.url)
      ? loadVideos().some(v => v.id === extractVideoId(tab.url))
      : loadLinks().some(l => l.url === tab.url);

    const title = tab.title || tab.url || "(untitled)";
    row.innerHTML = '<img class="tm-tab-favicon" src="' + fav + '" alt="">' +
      '<span class="tm-tab-title" title="' + title.replace(/"/g, '&quot;') + '">' + title + '</span>' +
      badges + age +
      '<button class="tm-tab-save' + (already ? " saved" : "") + '">' + (already ? "Saved" : "Save") + '</button>';

    row.addEventListener("click", (e) => { if (!e.target.closest(".tm-tab-save")) jumpToTab(tab.id, tab.windowId); });
    row.querySelector(".tm-tab-save").addEventListener("click", (e) => { e.stopPropagation(); saveTabForLater(tab, e.target); });
    return row;
  }

  function renderDomainView(tabs) {
    const groups = {}; const urlC = {};
    tabs.forEach(t => { const d = getDomain(t.url); (groups[d] = groups[d] || []).push(t); urlC[t.url] = (urlC[t.url] || 0) + 1; });

    const sorted = Object.entries(groups).sort((a, b) => {
      const ad = a[1].some(t => urlC[t.url] > 1) ? 1 : 0;
      const bd = b[1].some(t => urlC[t.url] > 1) ? 1 : 0;
      if (bd !== ad) return bd - ad;
      if (b[1].length !== a[1].length) return b[1].length - a[1].length;
      return a[0].localeCompare(b[0]);
    });

    const frag = document.createDocumentFragment();
    sorted.forEach(([domain, dtabs]) => {
      const hasDup = dtabs.some(t => urlC[t.url] > 1);
      const g = document.createElement("div"); g.className = "tm-domain-group";
      const hdr = document.createElement("div"); hdr.className = "tm-domain-header";
      hdr.innerHTML = '<img class="tm-domain-favicon" src="' + faviconUrl(domain) + '" alt="">' +
        '<span class="tm-domain-name">' + domain + '</span>' +
        '<span class="tm-domain-count' + (hasDup ? " dup" : "") + '">' + dtabs.length + (hasDup ? " (dupes)" : "") + '</span>' +
        '<span class="tm-domain-arrow">&#9660;</span>';

      const list = document.createElement("div"); list.className = "tm-domain-tabs";
      dtabs.forEach(t => list.appendChild(buildTabRow(t, { duplicate: urlC[t.url] > 1 })));

      hdr.addEventListener("click", () => { list.classList.toggle("open"); hdr.querySelector(".tm-domain-arrow").classList.toggle("open"); });
      if (hasDup) { list.classList.add("open"); hdr.querySelector(".tm-domain-arrow").classList.add("open"); }

      g.appendChild(hdr); g.appendChild(list); frag.appendChild(g);
    });

    tmContent.innerHTML = sorted.length ? "" : '<div class="tm-empty">No tabs found.</div>';
    if (sorted.length) tmContent.appendChild(frag);
  }

  function renderWindowView(tabs) {
    const wins = {};
    tabs.forEach(t => (wins[t.windowId] = wins[t.windowId] || []).push(t));
    const sorted = Object.entries(wins).sort((a, b) => {
      return Math.min(...a[1].map(t => t.lastAccessed || Date.now())) - Math.min(...b[1].map(t => t.lastAccessed || Date.now()));
    });
    sorted.forEach(([, wt]) => wt.sort((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0)));

    const frag = document.createDocumentFragment();
    sorted.forEach(([wid, wt], i) => {
      const g = document.createElement("div"); g.className = "tm-window-group";
      const cur = wt.some(t => t.active);
      const hdr = document.createElement("div"); hdr.className = "tm-window-header";
      hdr.innerHTML = '<span class="tm-window-label">Window ' + (i + 1) + (cur ? " (current)" : "") + '</span><span class="tm-window-count">' + wt.length + ' tab' + (wt.length !== 1 ? "s" : "") + '</span>';
      g.appendChild(hdr);
      wt.forEach(t => g.appendChild(buildTabRow(t, { showAge: true })));
      frag.appendChild(g);
    });

    tmContent.innerHTML = sorted.length ? "" : '<div class="tm-empty">No tabs found.</div>';
    if (sorted.length) tmContent.appendChild(frag);
  }

  function renderTM() {
    const q = tmSearch.value.trim().toLowerCase();
    let filtered = allTabs;
    if (q) filtered = allTabs.filter(t => ((t.title || "") + " " + (t.url || "")).toLowerCase().includes(q));
    if (tmView === "domain") renderDomainView(filtered); else renderWindowView(filtered);
  }

  function loadTabs() {
    if (!chrome?.tabs?.query) { tmContent.innerHTML = '<div class="tm-empty">Tab API not available.</div>'; return; }
    chrome.tabs.query({}, tabs => { allTabs = tabs; tmCount.textContent = tabs.length; renderTM(); });
  }

  // Always load tab count on launch
  if (chrome?.tabs?.query) {
    chrome.tabs.query({}, tabs => { allTabs = tabs; tmCount.textContent = tabs.length; if (tm.isOpen()) renderTM(); });
  }

  /* ═══════════════════════════════════════════
     Global Search
     ═══════════════════════════════════════════ */
  const searchInput   = document.getElementById("global-search");
  const searchResults = document.getElementById("search-results");

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { searchResults.hidden = true; return; }

    const results = [];

    // Tabs
    allTabs.forEach(t => {
      if (((t.title || "") + " " + (t.url || "")).toLowerCase().includes(q)) {
        results.push({ type: "tab", title: t.title || t.url, url: t.url, favicon: t.favIconUrl || faviconUrl(getDomain(t.url)), ts: t.lastAccessed || 0, tab: t });
      }
    });

    // Saved links
    loadLinks().forEach(l => {
      if (((l.title || "") + " " + l.url).toLowerCase().includes(q)) {
        results.push({ type: "link", title: l.title || l.url, url: l.url, favicon: l.favicon || faviconUrl(getDomain(l.url)), ts: l.addedAt || 0 });
      }
    });

    // Watch later
    loadVideos().forEach(v => {
      const url = "https://www.youtube.com/watch?v=" + v.id;
      if (((v.title || "") + " " + url).toLowerCase().includes(q)) {
        results.push({ type: "video", title: v.title || url, url, favicon: faviconUrl("youtube.com"), ts: v.addedAt || 0 });
      }
    });

    // Sort by most recent first
    results.sort((a, b) => b.ts - a.ts);

    searchResults.innerHTML = "";
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="sr-empty">No results found.</div>';
    } else {
      results.slice(0, 50).forEach(r => {
        const row = document.createElement("div");
        row.className = "sr-row";
        const badgeLabel = r.type === "tab" ? "Tab" : r.type === "link" ? "Saved" : "YouTube";
        row.innerHTML = '<img class="sr-favicon" src="' + r.favicon + '" alt="">' +
          '<span class="sr-title">' + r.title + '</span>' +
          '<span class="sr-badge">' + badgeLabel + '</span>' +
          (r.ts ? '<span class="sr-age">' + timeAgo(r.ts) + '</span>' : '');

        row.addEventListener("click", () => {
          if (r.type === "tab" && r.tab) { jumpToTab(r.tab.id, r.tab.windowId); }
          else { window.open(r.url, "_blank"); }
          searchResults.hidden = true;
          searchInput.value = "";
        });
        searchResults.appendChild(row);
      });
    }
    searchResults.hidden = false;
  });

  // Close search on click outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) searchResults.hidden = true;
  });

  // Close search on Escape
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { searchResults.hidden = true; searchInput.blur(); }
  });

  /* ═══════════════════════════════════════════
     Export / Import Tabs
     ═══════════════════════════════════════════ */
  initCollapsible("ei-toggle", "ei-panel", "ei-arrow", "eiOpen");

  document.getElementById("export-btn").addEventListener("click", () => {
    if (!chrome?.tabs?.query) return;
    chrome.tabs.query({}, tabs => {
      const wins = {};
      tabs.forEach(t => {
        (wins[t.windowId] = wins[t.windowId] || []).push({ url: t.url, title: t.title, pinned: t.pinned });
      });
      const data = {
        exportedAt: new Date().toISOString(),
        source: "AI Tools New Tab",
        windows: Object.entries(wins).map(([id, tabs], i) => ({ label: "Window " + (i + 1), tabs }))
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "tabs-export-" + new Date().toISOString().slice(0, 10) + ".json";
      a.click();
      URL.revokeObjectURL(a.href);
    });
  });

  document.getElementById("import-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        renderImportPreview(data);
      } catch { alert("Invalid JSON file."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  function renderImportPreview(data) {
    const container = document.getElementById("import-preview");
    container.innerHTML = "";
    if (!data.windows || !data.windows.length) { container.innerHTML = '<p class="empty-msg">No windows found in file.</p>'; return; }

    data.windows.forEach((win, wi) => {
      const div = document.createElement("div"); div.className = "ip-window";

      const hdr = document.createElement("div"); hdr.className = "ip-window-header";
      hdr.innerHTML = '<span>' + (win.label || "Window " + (wi + 1)) + ' (' + win.tabs.length + ' tabs)</span>';

      const openBtn = document.createElement("button");
      openBtn.className = "ip-open-btn";
      openBtn.textContent = "Open Window";
      openBtn.addEventListener("click", () => {
        if (!chrome?.windows?.create) { window.open(win.tabs[0]?.url); return; }
        chrome.windows.create({ url: win.tabs.map(t => t.url), focused: true });
        openBtn.textContent = "Opened";
        openBtn.disabled = true;
        openBtn.style.opacity = "0.5";
      });
      hdr.appendChild(openBtn);
      div.appendChild(hdr);

      win.tabs.forEach(t => {
        const row = document.createElement("div"); row.className = "ip-tab";
        row.innerHTML = '<img class="ip-tab-favicon" src="' + faviconUrl(getDomain(t.url)) + '" alt="">' +
          '<span class="ip-tab-title">' + (t.title || t.url) + '</span>';
        div.appendChild(row);
      });

      container.appendChild(div);
    });
  }

});
