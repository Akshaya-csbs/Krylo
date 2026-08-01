// Klyro Enterprise Brand Intelligence Test Bench Application Logic
const API_BASE = "http://localhost:8000/api/v1";

let activeToken = localStorage.getItem("klyro_token") || null;
let activeUser = JSON.parse(localStorage.getItem("klyro_user") || "null");
let currentBrandId = localStorage.getItem("klyro_brand_id") || null;
let selectedFiles = [];

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

async function initApp() {
  setupNavigation();
  setupEventListeners();

  if (!activeToken) {
    await autoLoginDemoUser();
  } else {
    updateUserUI();
  }

  await loadBrands();
}

// Navigation Tabs
function setupNavigation() {
  const navBtns = document.querySelectorAll(".nav-btn");
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const tabId = btn.dataset.tab;
      document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));
      document.getElementById(`tab-${tabId}`).classList.add("active");

      updateHeaderTitle(tabId);
      if (tabId === "ingestion") loadBrandAssets();
      if (tabId === "identity") loadBrandIdentity();
      if (tabId === "dashboard") loadDashboardStats();
    });
  });
}

function updateHeaderTitle(tabId) {
  const titles = {
    ingestion: ["Asset Ingestion Pipeline", "Upload historical brand assets & prepare data for Groq AI processing"],
    identity: ["Brand Identity Model", "Living identity model synthesized by Groq AI"],
    validation: ["6-Pillar Content Certification", "Analyze AI-generated content against learned Brand Identity"],
    trends: ["Trend Intelligence Engine", "Real-time market trend alignment and campaign recommendations"],
    dashboard: ["Dashboard Analytics", "Consolidated enterprise insights and activity logs"]
  };
  if (titles[tabId]) {
    document.getElementById("tabTitle").innerText = titles[tabId][0];
    document.getElementById("tabSubtitle").innerText = titles[tabId][1];
  }
}

// Event Listeners
function setupEventListeners() {
  // Brand selection
  document.getElementById("brandSelect").addEventListener("change", (e) => {
    currentBrandId = e.target.value;
    localStorage.setItem("klyro_brand_id", currentBrandId);
    loadBrandAssets();
  });

  // Modal create brand
  document.getElementById("createBrandModalBtn").onclick = () => document.getElementById("brandModal").style.display = "flex";
  document.getElementById("closeBrandModal").onclick = () => document.getElementById("brandModal").style.display = "none";
  document.getElementById("saveBrandBtn").onclick = createNewBrand;

  // Dropzone file selection
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");

  dropzone.onclick = () => fileInput.click();
  fileInput.onchange = (e) => {
    selectedFiles = Array.from(e.target.files);
    dropzone.querySelector("h3").innerText = `${selectedFiles.length} File(s) Selected`;
  };

  // Upload trigger
  document.getElementById("uploadBtn").onclick = uploadAssets;

  // Build Identity trigger
  document.getElementById("buildIdentityBtn").onclick = triggerBuildIdentity;

  // Validation trigger
  document.getElementById("runValidationBtn").onclick = runValidationCheck;

  // Trends trigger
  document.getElementById("discoverTrendsBtn").onclick = discoverTrends;
}

// Auth Logic
async function autoLoginDemoUser() {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "rahul@amul.com", password: "Password@123" })
    });
    const json = await res.json();
    if (json.success) {
      activeToken = json.data.access_token;
      activeUser = json.data.user;
      localStorage.setItem("klyro_token", activeToken);
      localStorage.setItem("klyro_user", JSON.stringify(activeUser));
      updateUserUI();
    }
  } catch (err) {
    console.error("Auto login failed:", err);
  }
}

function updateUserUI() {
  if (activeUser) {
    document.getElementById("userName").innerText = activeUser.full_name;
    document.getElementById("loginToggleBtn").innerText = "Logout";
    document.getElementById("loginToggleBtn").onclick = () => {
      localStorage.clear();
      location.reload();
    };
  }
}

// Brands Logic
async function loadBrands() {
  if (!activeToken) return;
  try {
    const res = await fetch(`${API_BASE}/brands`, {
      headers: { "Authorization": `Bearer ${activeToken}` }
    });
    const json = await res.json();
    const select = document.getElementById("brandSelect");
    select.innerHTML = "";

    if (json.success && json.data.length > 0) {
      json.data.forEach(brand => {
        const opt = document.createElement("option");
        opt.value = brand.id;
        opt.innerText = `${brand.name} (${brand.industry})`;
        select.appendChild(opt);
      });

      if (!currentBrandId || !json.data.some(b => b.id === currentBrandId)) {
        currentBrandId = json.data[0].id;
      }
      select.value = currentBrandId;
      loadBrandAssets();
    } else {
      select.innerHTML = `<option value="">No Brands Found</option>`;
    }
  } catch (err) {
    console.error("Error loading brands:", err);
  }
}

async function createNewBrand() {
  const name = document.getElementById("newBrandName").value;
  const industry = document.getElementById("newBrandIndustry").value;
  const website = document.getElementById("newBrandWebsite").value;
  const description = document.getElementById("newBrandDescription").value;

  if (!name) return alert("Please enter brand name");

  const res = await fetch(`${API_BASE}/brands`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${activeToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, industry, website, description })
  });
  const json = await res.json();
  if (json.success) {
    document.getElementById("brandModal").style.display = "none";
    currentBrandId = json.data.id;
    localStorage.setItem("klyro_brand_id", currentBrandId);
    await loadBrands();
  }
}

// Asset Ingestion Logic
async function uploadAssets() {
  if (!currentBrandId) return alert("Select or create a brand first.");
  if (selectedFiles.length === 0) return alert("Please select at least one file to upload.");

  const category = document.getElementById("assetCategory").value;
  const formData = new FormData();
  selectedFiles.forEach(file => formData.append("files", file));
  formData.append("category", category);

  document.getElementById("uploadProgress").style.display = "block";
  document.getElementById("progressBarFill").style.width = "40%";

  try {
    const res = await fetch(`${API_BASE}/brands/${currentBrandId}/assets`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${activeToken}` },
      body: formData
    });
    document.getElementById("progressBarFill").style.width = "100%";
    const json = await res.json();

    setTimeout(() => {
      document.getElementById("uploadProgress").style.display = "none";
      document.getElementById("progressBarFill").style.width = "0%";
      document.getElementById("dropzone").querySelector("h3").innerText = "Drag & Drop Assets Here";
      selectedFiles = [];
    }, 500);

    if (json.success) {
      await loadBrandAssets();
      // Auto-trigger Groq AI identity processing to move pending assets to completed
      await triggerBuildIdentity();
      await loadBrandAssets();
    }
  } catch (err) {
    alert("Upload failed: " + err.message);
  }
}

async function loadBrandAssets() {
  if (!currentBrandId || !activeToken) return;
  const res = await fetch(`${API_BASE}/brands/${currentBrandId}/assets`, {
    headers: { "Authorization": `Bearer ${activeToken}` }
  });
  const json = await res.json();
  const list = document.getElementById("assetList");
  list.innerHTML = "";

  if (json.success && json.data.length > 0) {
    document.getElementById("assetCountBadge").innerText = `${json.data.length} Assets`;
    json.data.forEach(a => {
      const item = document.createElement("div");
      item.className = "asset-item";
      item.innerHTML = `
        <div>
          <strong>${a.asset_name}</strong>
          <div style="font-size: 12px; color: var(--text-muted);">${a.category} • ${(a.file_size/1024).toFixed(1)} KB</div>
        </div>
        <span class="badge ${a.processing_status}">${a.processing_status}</span>
      `;
      list.appendChild(item);
    });
  } else {
    document.getElementById("assetCountBadge").innerText = "0 Assets";
    list.innerHTML = `<div class="empty-state">No assets uploaded for this brand yet.</div>`;
  }
}

// Brand Identity Model Logic
async function triggerBuildIdentity() {
  if (!currentBrandId) return alert("Select a brand first.");
  document.getElementById("identityLoading").style.display = "block";
  document.getElementById("identityDisplay").style.opacity = "0.3";

  try {
    const res = await fetch(`${API_BASE}/identity/build/${currentBrandId}?force_rebuild=true`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${activeToken}` }
    });
    const json = await res.json();

    document.getElementById("identityLoading").style.display = "none";
    document.getElementById("identityDisplay").style.opacity = "1";

    if (json.success) {
      renderIdentity(json.data.identity);
    }
  } catch (err) {
    document.getElementById("identityLoading").style.display = "none";
    document.getElementById("identityDisplay").style.opacity = "1";
    alert("Identity build failed: " + err.message);
  }
}

async function loadBrandIdentity() {
  if (!currentBrandId) return;
  const res = await fetch(`${API_BASE}/identity/${currentBrandId}`, {
    headers: { "Authorization": `Bearer ${activeToken}` }
  });
  const json = await res.json();
  if (json.success && json.data) {
    renderIdentity(json.data);
  }
}

function renderIdentity(idData) {
  document.getElementById("voiceDetails").innerHTML = `
    <p><strong>Tone:</strong> ${idData.voice.tone}</p>
    <p><strong>Style:</strong> ${idData.voice.style}</p>
    <p><strong>Reading Level:</strong> ${idData.voice.reading_level || 'Accessible'}</p>
  `;

  const swatches = (idData.visual.primary_colors || ["#0055A4", "#FFFFFF"])
    .map(c => `<span class="color-swatch" style="background:${c};"></span>${c}`)
    .join(" ");

  document.getElementById("visualDetails").innerHTML = `
    <p><strong>Primary Colors:</strong> ${swatches}</p>
    <p><strong>Logo Position:</strong> ${idData.visual.logo_position}</p>
    <p><strong>Typography:</strong> ${idData.visual.typography}</p>
  `;

  document.getElementById("emotionDetails").innerHTML = `
    <p><strong>Trust:</strong> ${idData.emotion.trust}% | <strong>Family:</strong> ${idData.emotion.family}%</p>
    <p><strong>Keywords:</strong> ${(idData.keywords || []).join(", ")}</p>
  `;

  document.getElementById("audienceDetails").innerHTML = `
    <p><strong>Primary:</strong> ${idData.audience.primary}</p>
    <p><strong>Age Group:</strong> ${idData.audience.age_group || '22-45'}</p>
  `;

  document.getElementById("brandSummaryText").innerText = idData.brand_summary || "Synthesized living identity model.";
}

// 6-Pillar Validation Logic
async function runValidationCheck() {
  const text_content = document.getElementById("valTextContent").value;
  const platform = document.getElementById("valPlatform").value;

  if (!text_content) return alert("Enter campaign text to validate.");

  const res = await fetch(`${API_BASE}/validation/check`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${activeToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      brand_id: currentBrandId,
      text_content,
      platform
    })
  });
  const json = await res.json();
  if (json.success) {
    const report = json.data;
    const resultDiv = document.getElementById("validationResult");
    
    let issuesHtml = report.issues.map(i => `
      <div style="background: rgba(239, 68, 68, 0.1); border-left: 3px solid var(--danger); padding: 8px 12px; margin-top: 8px; font-size: 13px;">
        <strong>[${i.category}] ${i.message}</strong>
      </div>
    `).join("");

    resultDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <span style="font-size: 32px; font-weight: 800; color: var(--accent-primary);">${report.overall_score}%</span>
          <span style="color: var(--text-muted); font-size: 14px;"> Certification Score</span>
        </div>
        <span class="badge ${report.status}">${report.status.toUpperCase()}</span>
      </div>
      <div style="font-size: 13px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px;">
        <span>Identity: <strong>${report.scores.identity}%</strong></span>
        <span>Visual: <strong>${report.scores.visual}%</strong></span>
        <span>Compliance: <strong>${report.scores.compliance}%</strong></span>
        <span>Safety: <strong>${report.scores.safety}%</strong></span>
      </div>
      ${issuesHtml}
    `;
  }
}

// Trend Intelligence Logic
async function discoverTrends() {
  if (!currentBrandId) return;
  const res = await fetch(`${API_BASE}/trends/discover`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${activeToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ brand_id: currentBrandId })
  });
  const json = await res.json();
  const list = document.getElementById("trendsList");
  list.innerHTML = "";

  if (json.success && json.data.length > 0) {
    json.data.forEach(t => {
      const card = document.createElement("div");
      card.className = "identity-card";
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between;">
          <h3 style="margin:0;">${t.trend}</h3>
          <span class="badge">${t.alignment_score}% Aligned</span>
        </div>
        <p style="font-size:13px; color:var(--text-muted); margin: 8px 0;">Category: ${t.category} | Best Time: ${t.best_posting_time}</p>
        <p style="font-size:14px; margin-top:8px;"><strong>Suggested Copy:</strong> ${t.generated_campaign.caption}</p>
      `;
      list.appendChild(card);
    });
  }
}

// Dashboard Stats
async function loadDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard`, {
    headers: { "Authorization": `Bearer ${activeToken}` }
  });
  const json = await res.json();
  if (json.success) {
    const grid = document.getElementById("metricsGrid");
    grid.innerHTML = "";
    json.data.metrics.forEach(m => {
      grid.innerHTML += `
        <div class="glass-card">
          <div style="color: var(--text-muted); font-size: 13px;">${m.title}</div>
          <div style="font-size: 28px; font-weight: 800; margin: 8px 0;">${m.value}</div>
          <div style="font-size: 12px; color: var(--success);">${m.change}</div>
        </div>
      `;
    });
  }
}
