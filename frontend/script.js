// Konfigurasi endpoint backend YOLOv11
const API_URL = window.BACKEND_URL || "http://localhost:8000/api/detect";

// State
let currentFile = null;

// DOM Elements
const uploadArea = document.getElementById("uploadArea");
const uploadInput = document.getElementById("imageUpload");
const uploadedImage = document.getElementById("uploadedImage");
const placeholderText = document.getElementById("placeholderText");
const detectBtn = document.getElementById("detectBtn");
const resetBtn = document.getElementById("resetBtn");
const resultsDiv = document.getElementById("detectionResults");
const canvas = document.getElementById("canvas");
const ctx = canvas ? canvas.getContext("2d") : null;

// Peta label model -> nama standar
const labelAliases = {
  apel: "apple",
  pisang: "banana",
  jeruk: "orange",
  anggur: "grapes",
  strawberry: "strawberry",
  semangka: "semangka",
  melon: "melon",
  pepaya: "pepaya",
  jambu_biji: "jambu_biji",
  alpukat: "alpukat",
  salak: "salak",
  mangga: "mangga",
};

// Data gizi per 100g (contoh dari TKPI; lengkapi sesuai kebutuhan)
const nutritionData = {
  semangka: {
    nama: "Semangka",
    energi: "28 kkal",
    karbohidrat: "7.2 g",
    protein: "0.5 g",
    lemak: "0.2 g",
    serat: "0.3 g",
    vitamin_c: "6 mg",
    beta_karoten: "0 ug",
    kalium: "113 mg",
  },
  melon: {
    nama: "Melon",
    energi: "43 kkal",
    karbohidrat: "10.8 g",
    protein: "0.6 g",
    lemak: "0.1 g",
    serat: "0.7 g",
    vitamin_c: "22 mg",
    beta_karoten: "1 ug",
    kalium: "267 mg",
  },
  pepaya: {
    nama: "Pepaya",
    energi: "24 kkal",
    karbohidrat: "3.7 g",
    protein: "0.2 g",
    lemak: "0.2 g",
    serat: "1.0 g",
    vitamin_c: "60 mg",
    beta_karoten: "1000 ug",
    kalium: "0 mg",
  },
  apple: {
    nama: "Apel",
    energi: "58 kkal",
    karbohidrat: "14.9 g",
    protein: "0.3 g",
    lemak: "0.4 g",
    serat: "2.6 g",
    vitamin_c: "5 mg",
    beta_karoten: "90 ug",
    kalium: "130 mg",
  },
  orange: {
    nama: "Jeruk",
    energi: "45 kkal",
    karbohidrat: "11.2 g",
    protein: "0.9 g",
    lemak: "0.2 g",
    serat: "1.4 g",
    vitamin_c: "49 mg",
    beta_karoten: "316 ug",
    kalium: "140 mg",
  },
  jambu_biji: {
    nama: "Jambu biji",
    energi: "49 kkal",
    karbohidrat: "12.2 g",
    protein: "0.9 g",
    lemak: "0.3 g",
    serat: "5.6 g",
    vitamin_c: "126 mg",
    beta_karoten: "0 ug",
    kalium: "417 mg",
  },
  alpukat: {
    nama: "Alpukat",
    energi: "85 kkal",
    karbohidrat: "7.7 g",
    protein: "0.9 g",
    lemak: "6.5 g",
    serat: "0.6 g",
    vitamin_c: "13 mg",
    beta_karoten: "180 ug",
    kalium: "278 mg",
  },
  salak: {
    nama: "Salak",
    energi: "77 kkal",
    karbohidrat: "20.3 g",
    protein: "0.4 g",
    lemak: "0.2 g",
    serat: "0.3 g",
    vitamin_c: "8 mg",
    beta_karoten: "0 ug",
    kalium: "113 mg",
  },
  banana: {
    nama: "Pisang",
    energi: "87 kkal",
    karbohidrat: "22.0 g",
    protein: "1.0 g",
    lemak: "0.2 g",
    serat: "0.9 g",
    vitamin_c: "10 mg",
    beta_karoten: "365 ug",
    kalium: "358 mg",
  },
  mangga: {
    nama: "Mangga",
    energi: "133 kkal",
    karbohidrat: "32.1 g",
    protein: "1.0 g",
    lemak: "0.1 g",
    serat: "11.8 g",
    vitamin_c: "61 mg",
    beta_karoten: "0 ug",
    kalium: "161 mg",
  },
};

// -------- Navigasi --------
function updateActiveNav() {
  const scrollPosition = window.scrollY + 80;
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach((link) => link.classList.remove("active"));

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sectionTop = section.offsetTop;
    const nextTop =
      i === sections.length - 1 ? Infinity : sections[i + 1].offsetTop;

    if (scrollPosition >= sectionTop - 100 && scrollPosition < nextTop - 100) {
      const sectionId = section.getAttribute("id");
      const activeLink = document.querySelector(
        `.nav-links a[href="#${sectionId}"]`
      );
      if (activeLink) {
        activeLink.classList.add("active");
        return;
      }
    }
  }

  if (window.scrollY < 100) {
    const homeLink = document.querySelector('.nav-links a[href="#home"]');
    if (homeLink) homeLink.classList.add("active");
  }
}

function setupNavigation() {
  let scrollTimeout;
  window.addEventListener(
    "scroll",
    () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveNav, 10);
    },
    { passive: true }
  );

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        document
          .querySelectorAll(".nav-links a")
          .forEach((link) => link.classList.remove("active"));
        this.classList.add("active");
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  });
}

// -------- Upload & Preview --------
function displayImage(src) {
  if (!uploadedImage || !canvas || !ctx) return;

  uploadedImage.src = src;
  uploadedImage.onload = function () {
    const previewContainer = document.querySelector(".preview-container");
    if (previewContainer) previewContainer.style.display = "block";

    canvas.width = uploadedImage.naturalWidth;
    canvas.height = uploadedImage.naturalHeight;

    if (placeholderText) placeholderText.style.display = "none";
    uploadedImage.style.display = "block";
    detectBtn && (detectBtn.disabled = false);

    previewContainer?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
}

function handleImageUpload(event) {
  const file = event.target.files?.[0];
  processFile(file);
}

function processFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("File harus berupa gambar");
    return;
  }
  currentFile = file;
  const reader = new FileReader();
  reader.onload = (e) => displayImage(e.target.result);
  reader.readAsDataURL(file);
}

function setupUploadArea() {
  if (!uploadArea || !uploadInput || !detectBtn || !resetBtn) return;

  detectBtn.disabled = true;

  uploadArea.addEventListener("click", () => uploadInput.click());
  uploadInput.addEventListener("change", handleImageUpload);
  detectBtn.addEventListener("click", detectObjects);
  resetBtn.addEventListener("click", resetDetection);

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(
      eventName,
      (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      false
    );
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    uploadArea.addEventListener(
      eventName,
      () => uploadArea.classList.add("drag-over"),
      false
    );
  });

  ["dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(
      eventName,
      () => uploadArea.classList.remove("drag-over"),
      false
    );
  });

  uploadArea.addEventListener(
    "drop",
    (e) => {
      const files = e.dataTransfer.files;
      if (files.length) processFile(files[0]);
    },
    false
  );
}

// -------- Deteksi Backend --------
async function detectObjects() {
  if (!currentFile || !uploadedImage || !ctx) return;

  detectBtn.disabled = true;
  detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

  try {
    const form = new FormData();
    form.append("image", currentFile);

    const response = await fetch(API_URL, { method: "POST", body: form });
    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || "Deteksi gagal");
    }

    const { predictions = [] } = await response.json();
    const normalizedPredictions = predictions.map((p) => ({
      ...p,
      normalizedClass: normalizeLabel(p.class),
    }));

    drawResults(normalizedPredictions, uploadedImage);
    displayResults(normalizedPredictions);

    setTimeout(() => {
      document
        .getElementById("results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  } catch (error) {
    console.error("Error detecting objects:", error);
    if (resultsDiv) {
      resultsDiv.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>Terjadi kesalahan saat mendeteksi objek. ${
            error.message || "Silakan coba lagi."
          }</p>
        </div>
      `;
    }
  } finally {
    detectBtn.disabled = false;
    detectBtn.innerHTML = '<i class="fas fa-search"></i> Deteksi Buah';
  }
}

// Menggambar bounding box dari backend (bbox: [x1, y1, x2, y2])
function drawResults(predictions, image) {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  predictions.forEach((prediction) => {
    const [x1, y1, x2, y2] = prediction.bbox;
    const width = x2 - x1;
    const height = y2 - y1;
    const score = Math.round(prediction.score * 100);
    const normalized = prediction.normalizedClass || prediction.class;
    const nutrition = getNutrition(normalized);
    const displayName =
      nutrition?.nama ||
      normalized.charAt(0).toUpperCase() + normalized.slice(1);
    const text = `${displayName} ${score}%`;

    ctx.strokeStyle = "#2ecc71";
    ctx.lineWidth = 2;
    ctx.strokeRect(x1, y1, width, height);

    const textWidth = ctx.measureText(text).width + 10;
    const textHeight = 20;
    ctx.fillStyle = "rgba(46, 204, 113, 0.9)";
    ctx.fillRect(x1 - 1, y1 - textHeight, textWidth, textHeight);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px Arial";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x1 + 5, y1 - textHeight / 2 + 2);
  });
}

function displayResults(predictions) {
  if (!resultsDiv) return;

  if (!predictions.length) {
    resultsDiv.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>Tidak ada buah yang terdeteksi dalam gambar.</p>
      </div>
    `;
    return;
  }

  const fruitData = {};
  predictions.forEach((prediction) => {
    const normalized = normalizeLabel(prediction.class);
    if (!fruitData[normalized])
      fruitData[normalized] = { count: 0, totalScore: 0 };
    fruitData[normalized].count++;
    fruitData[normalized].totalScore += prediction.score;
  });

  let resultsHTML = '<div class="results-grid">';
  Object.entries(fruitData).forEach(([fruit, data]) => {
    const nutrition = getNutrition(fruit);
    const fruitName =
      nutrition?.nama || fruit.charAt(0).toUpperCase() + fruit.slice(1);
    const averageScore = data.totalScore / data.count;

    resultsHTML += `
      <div class="result-card">
        <div class="result-icon">
          <i class="fas fa-${getFruitIcon(fruit)}"></i>
        </div>
        <div class="result-details">
          <h4>${fruitName}</h4>
          <div class="result-stats">
            <span class="count">${data.count} buah</span>
            <span class="divider">/</span>
            <span class="accuracy">${Math.round(
              averageScore * 100
            )}% akurat</span>
          </div>
          <div class="nutrition">
            ${
              nutrition
                ? renderNutrition(nutrition)
                : "<em>Data gizi belum tersedia</em>"
            }
          </div>
        </div>
      </div>
    `;
  });

  resultsHTML += "</div>";
  resultsDiv.innerHTML = resultsHTML;
}

function getFruitIcon(fruit) {
  const icons = {
    apple: "apple-alt",
    banana: "lemon", // ikon terdekat
    orange: "lemon",
    grapes: "wine-bottle",
    strawberry: "seedling",
    semangka: "seedling",
    melon: "seedling",
    pepaya: "seedling",
    jambu_biji: "seedling",
    alpukat: "seedling",
    salak: "seedling",
    mangga: "seedling",
  };
  return icons[fruit] || "apple-alt";
}

function normalizeLabel(label) {
  if (!label) return "";
  // Bersihkan metadata (mis. nama project/versi) yang kadang dikirim model
  const lower = label.toLowerCase().split("-")[0].trim();
  return labelAliases[lower] || lower;
}

function getNutrition(fruitKey) {
  return nutritionData[fruitKey];
}

function renderNutrition(nutrition) {
  const fields = [
    ["energi", "Energi"],
    ["karbohidrat", "Karbohidrat"],
    ["protein", "Protein"],
    ["lemak", "Lemak"],
    ["serat", "Serat"],
    ["vitamin_c", "Vitamin C"],
    ["beta_karoten", "Beta karoten"],
    ["kalium", "Kalium"],
  ];

  const items = fields
    .filter(([key]) => nutrition[key])
    .map(([key, label]) => `<li>${label}: ${nutrition[key]}</li>`)
    .join("");

  return `<ul class="nutrition-list">${items}</ul>`;
}

function resetDetection() {
  if (uploadInput) uploadInput.value = "";
  currentFile = null;

  if (uploadedImage) {
    uploadedImage.src = "";
    uploadedImage.style.display = "none";
  }

  if (placeholderText) placeholderText.style.display = "flex";
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (detectBtn) {
    detectBtn.disabled = true;
    detectBtn.innerHTML = '<i class="fas fa-search"></i> Deteksi Buah';
  }

  const previewContainer = document.querySelector(".preview-container");
  if (previewContainer) previewContainer.style.display = "none";

  if (resultsDiv) {
    resultsDiv.innerHTML = `
      <div class="no-results">
        <i class="fas fa-info-circle"></i>
        <p>Hasil deteksi akan muncul di sini</p>
      </div>
    `;
  }
}

// -------- Init --------
document.addEventListener("DOMContentLoaded", () => {
  updateActiveNav();
  setupNavigation();
  setupUploadArea();
});
