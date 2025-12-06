// Global variables
let model;
let currentImage = null;
const fruits = ['apple', 'banana', 'orange', 'grapes', 'strawberry'];

// Fungsi untuk mengupdate navigasi aktif
function updateActiveNav() {
    const scrollPosition = window.scrollY + 80; // Offset untuk header
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Reset semua link navigasi
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Cek setiap section
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        // Jika scroll position berada di dalam section ini
        if (scrollPosition >= sectionTop - 100 && 
            (i === sections.length - 1 || scrollPosition < sections[i + 1].offsetTop - 100)) {
            
            // Temukan link yang sesuai dan aktifkan
            const sectionId = section.getAttribute('id');
            const activeLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
            
            if (activeLink) {
                activeLink.classList.add('active');
                return; // Keluar setelah menemukan section yang aktif
            }
        }
    }
    
    // Default ke home jika di bagian paling atas
    if (window.scrollY < 100) {
        const homeLink = document.querySelector('.nav-links a[href="#home"]');
        if (homeLink) homeLink.classList.add('active');
    }
}

// Event listener untuk scroll dengan debounce
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateActiveNav, 10);
}, { passive: true });

// Fungsi untuk smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      // Update active nav sebelum scroll
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
      });
      this.classList.add('active');
      
      // Smooth scroll ke target
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  });
});

// DOM Elements
const startDetectionBtn = document.getElementById('startDetection');
const detectionSection = document.getElementById('detection-section');
const uploadArea = document.getElementById('uploadArea');
const uploadInput = document.getElementById('imageUpload');
const uploadedImage = document.getElementById('uploadedImage');
const placeholderText = document.getElementById('placeholderText');
const detectBtn = document.getElementById('detectBtn');
const resetBtn = document.getElementById('resetBtn');
const resultsDiv = document.getElementById('detectionResults');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Load COCO-SSD model
async function loadModel() {
  try {
    console.log('Memulai memuat model...');
    const loadingMessage = document.getElementById('loading-message') || document.createElement('div');
    loadingMessage.id = 'loading-message';
    loadingMessage.textContent = 'Sedang memuat model... (mungkin perlu beberapa saat)';
    loadingMessage.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #2ecc71; color: white; padding: 10px 20px; border-radius: 5px; z-index: 1000;';
    
    if (!document.getElementById('loading-message')) {
      document.body.appendChild(loadingMessage);
    }
    
    model = await cocoSsd.load();
    console.log('Model berhasil dimuat');
    loadingMessage.style.display = 'none';
    
    // Enable start detection button after model is loaded
    if (startDetectionBtn) {
      startDetectionBtn.disabled = false;
      startDetectionBtn.classList.add('active');
      startDetectionBtn.style.opacity = '1';
      startDetectionBtn.style.cursor = 'pointer';
      console.log('Tombol deteksi diaktifkan');
    }
  } catch (error) {
    console.error('Error saat memuat model:', error);
    const errorMessage = document.createElement('div');
    errorMessage.id = 'error-message';
    errorMessage.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #e74c3c; color: white; padding: 10px 20px; border-radius: 5px; z-index: 1000;';
    errorMessage.textContent = 'Gagal memuat model. Silakan muat ulang halaman.';
    document.body.appendChild(errorMessage);
  }
}

// Initialize the application
function init() {
  console.log('Aplikasi diinisialisasi');
  
  // Load model when page loads
  loadModel();
  
  // Initialize event listeners
  setupEventListeners();
}

// Set up all event listeners
function setupEventListeners() {
  console.log('Menyiapkan event listeners...');
  
  // Start detection button click
  if (startDetectionBtn) {
    console.log('Menambahkan event listener untuk tombol startDetection');
    startDetectionBtn.addEventListener('click', function() {
      console.log('Tombol Mulai Deteksi ditekan');
      if (detectionSection) {
        detectionSection.scrollIntoView({ behavior: 'smooth' });
        detectionSection.style.display = 'block';
        console.log('Bagian deteksi ditampilkan');
      }
    });
    
    // Set initial button state
    startDetectionBtn.disabled = true;
    startDetectionBtn.style.opacity = '0.7';
    startDetectionBtn.style.cursor = 'not-allowed';
  }
  
  // Upload area click
  uploadArea.addEventListener('click', () => {
    uploadInput.click();
  });
  
  // File input change
  uploadInput.addEventListener('change', handleImageUpload);
  
  // Detect button click
  detectBtn.addEventListener('click', () => {
    if (uploadedImage.src) {
      detectObjects(uploadedImage);
    }
  });
  
  // Reset button click
  resetBtn.addEventListener('click', resetDetection);
  
  // Drag and drop functionality
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  ['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, unhighlight, false);
  });
  
  function highlight() {
    uploadArea.classList.add('drag-over');
  }
  
  function unhighlight() {
    uploadArea.classList.remove('drag-over');
  }
  
  // Handle dropped files
  uploadArea.addEventListener('drop', handleDrop, false);
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
      handleFiles(files);
    }
  }
  
  function handleFiles(files) {
    const file = files[0];
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        displayImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
});

// Display uploaded image
function displayImage(src) {
  uploadedImage.src = src;
  uploadedImage.onload = function() {
    // Show preview container
    document.querySelector('.preview-container').style.display = 'block';
    
    // Set canvas size to match image
    canvas.width = uploadedImage.width;
    canvas.height = uploadedImage.height;
    
    // Hide placeholder text
    placeholderText.style.display = 'none';
    uploadedImage.style.display = 'block';
    
    // Enable detect button
    detectBtn.disabled = false;
    
    // Scroll to preview
    document.querySelector('.preview-container').scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  };
}

// Handle image upload
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = function(e) {
      displayImage(e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

// Detect objects in the image
async function detectObjects(image) {
  // Show loading state
  detectBtn.disabled = true;
  detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
  
  try {
    // Run object detection
    const predictions = await model.detect(image);
    
    // Filter only fruit predictions
    const fruitPredictions = predictions.filter(prediction => 
      fruits.includes(prediction.class.toLowerCase())
    );
    
    // Draw bounding boxes
    drawResults(fruitPredictions, image);
    
    // Display results
    displayResults(fruitPredictions);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 500);
    
  } catch (error) {
    console.error('Error detecting objects:', error);
    resultsDiv.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>Terjadi kesalahan saat mendeteksi objek. Silakan coba lagi.</p>
      </div>
    `;
  } finally {
    // Reset button state
    detectBtn.disabled = false;
    detectBtn.innerHTML = '<i class="fas fa-search"></i> Deteksi Ulang';
  }
}

// Draw bounding boxes and labels
function drawResults(predictions, image) {
  // Clear previous drawings
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw the image
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  
  // Draw bounding boxes and labels
  predictions.forEach(prediction => {
    const [x, y, width, height] = prediction.bbox;
    const score = Math.round(prediction.score * 100);
    const className = prediction.class.charAt(0).toUpperCase() + prediction.class.slice(1);
    const text = `${className} ${score}%`;
    
    // Draw bounding box
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Draw label background
    const textWidth = ctx.measureText(text).width + 10;
    const textHeight = 20;
    ctx.fillStyle = 'rgba(46, 204, 113, 0.9)';
    ctx.fillRect(x - 1, y - textHeight, textWidth, textHeight);
    
    // Draw label text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 5, y - (textHeight / 2) + 2);
  });
}

// Display detection results
function displayResults(predictions) {
  if (predictions.length === 0) {
    resultsDiv.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>Tidak ada buah yang terdeteksi dalam gambar.</p>
      </div>
    `;
    return;
  }
  
  // Count occurrences of each fruit and calculate average accuracy
  const fruitData = {};
  predictions.forEach(prediction => {
    const fruit = prediction.class.toLowerCase();
    if (!fruitData[fruit]) {
      fruitData[fruit] = {
        count: 0,
        totalScore: 0
      };
    }
    fruitData[fruit].count++;
    fruitData[fruit].totalScore += prediction.score;
  });
  
  // Create results HTML
  let resultsHTML = '<div class="results-grid">';
  
  Object.entries(fruitData).forEach(([fruit, data]) => {
    const fruitName = fruit.charAt(0).toUpperCase() + fruit.slice(1);
    const averageScore = data.totalScore / data.count;
    
    resultsHTML += `
      <div class="result-card">
        <div class="result-icon">
          <i class="fas fa-${getFruitIcon(fruit)}"></i>
        </div>
        <div class="result-details">
          <h4>${fruitName}</h4>
          <div class="result-stats">
            <span class="count">${data.count} ${data.count > 1 ? 'buah' : 'buah'}</span>
            <span class="divider">•</span>
            <span class="accuracy">${Math.round(averageScore * 100)}% akurat</span>
          </div>
        </div>
      </div>
    `;
  });
  
  resultsHTML += '</div>';
  resultsDiv.innerHTML = resultsHTML;
}

// Get icon for each fruit
function getFruitIcon(fruit) {
  const icons = {
    'apple': 'apple-alt',
    'banana': 'banana',
    'orange': 'orange',
    'grapes': 'grapes',
    'strawberry': 'strawberry'
  };
  return icons[fruit] || 'fruit';
}

// Reset detection
function resetDetection() {
  // Reset file input
  uploadInput.value = '';
  
  // Reset image and canvas
  uploadedImage.src = '';
  uploadedImage.style.display = 'none';
  placeholderText.style.display = 'flex';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Reset buttons
  detectBtn.disabled = true;
  detectBtn.innerHTML = '<i class="fas fa-search"></i> Deteksi Buah';
  
  // Hide preview container
  document.querySelector('.preview-container').style.display = 'none';
  
  // Reset results
  resultsDiv.innerHTML = `
    <div class="no-results">
      <i class="fas fa-info-circle"></i>
      <p>Hasil deteksi akan muncul di sini</p>
    </div>
  `;
  imageUpload.value = '';
  currentImage = null;
}

// 9. Inisialisasi event listeners
function init() {
  // Event listener untuk upload file
  imageUpload.addEventListener('change', handleImageUpload);
  
  // Event listener untuk tombol deteksi
  detectBtn.addEventListener('click', () => {
    if (currentImage) {
      detectObjects(currentImage);
    }
  });
  
  // Muat model
  loadModel();
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Set active nav saat pertama kali load
    updateActiveNav();
    
    // Set ulang active nav setelah semua resource selesai dimuat
    window.addEventListener('load', updateActiveNav);
    
    // Handle klik pada menu navigasi
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                e.preventDefault();
                
                // Update active nav
                document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Scroll ke section
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Start the application when the DOM is fully loaded
console.log('Memeriksa status DOM...');
if (document.readyState === 'loading') {
  console.log('DOM masih loading, menambahkan event listener');
  document.addEventListener('DOMContentLoaded', init);
} else {
  console.log('DOM sudah siap, langsung jalankan init');
  init();
}

// Ekspor fungsi-fungsi yang diperlukan untuk testing
try {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      loadModel,
      init,
      setupEventListeners,
      displayImage,
      handleImageUpload,
      detectObjects,
      drawResults,
      displayResults,
      getFruitIcon,
      resetDetection
    };
  }
} catch (e) {
  // Tidak ada module exports di browser, abaikan
  console.log('Running in browser environment');
}
