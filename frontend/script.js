const { createApp } = Vue;

createApp({
  data() {
    return {
      API_URL: window.BACKEND_URL || "http://localhost:8000/api/detect",
      TKPI_URL: window.BACKEND_TKPI_URL || "http://localhost:8000/api/tkpi",
      currentFile: null,
      imageUrl: "",
      predictions: [],
      detectionAttempted: false,
      resultsError: "",
      isLoading: false,
      isDragOver: false,
      selectedFileName: "",
      isMenuOpen: false,
      activeSection: "home",
      activeSlide: 0,
      prevSlide: null,
      slideDirection: "left",
      slideTimer: null,
      tkpiData: {},
      tkpiLoaded: false,
      heroSlides: [
        {
          name: "Apel",
          description:
            "Apel kaya serat untuk membantu pencernaan dan menjaga energi harian.",
          image: "assets/Apel.png",
        },
        {
          name: "Pisang",
          description:
            "Pisang memberi energi cepat dan kaya kalium untuk otot.",
          image: "assets/Pisang.png",
        },
        {
          name: "Jeruk",
          description: "Jeruk kaya vitamin C untuk membantu daya tahan tubuh.",
          image: "assets/Jeruk.png",
        },
        {
          name: "Jambu Biji",
          description: "Jambu biji tinggi vitamin C dan antioksidan alami.",
          image: "assets/Jambu%20Biji.png",
        },
        {
          name: "Alpukat",
          description: "Alpukat kaya lemak baik untuk kesehatan jantung.",
          image: "assets/Alpukat.png",
        },
        {
          name: "Mangga",
          description: "Mangga manis alami dengan vitamin A dan serat.",
          image: "assets/Mangga.png",
        },
        {
          name: "Melon",
          description: "Melon menyegarkan dan membantu hidrasi tubuh.",
          image: "assets/Melon.png",
        },
        {
          name: "Pepaya",
          description: "Pepaya membantu pencernaan dengan enzim alami.",
          image: "assets/Pepaya.png",
        },
        {
          name: "Salak",
          description: "Salak kaya serat dan cocok untuk camilan sehat.",
          image: "assets/Salak.png",
        },
        {
          name: "Semangka",
          description: "Semangka tinggi air untuk hidrasi dan rasa segar.",
          image: "assets/Semangka.png",
        },
      ],
      labelAliases: {
        alpukat: "alpukat",
        apel: "apel",
        jambubiji: "jambu_biji",
        "jambu biji": "jambu_biji",
        jambu_biji: "jambu_biji",
        jeruk: "jeruk",
        mangga: "mangga",
        melon: "melon",
        pepaya: "pepaya",
        pisang: "pisang",
        salak: "salak",
        semangka: "semangka",
      },
      nutritionData: {
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
      },
    };
  },
  computed: {
    canDetect() {
      return Boolean(this.currentFile) && !this.isLoading;
    },
    summary() {
      const fruitData = {};
      this.predictions.forEach((prediction) => {
        const normalized = this.normalizeLabel(prediction.class);
        if (!fruitData[normalized]) {
          fruitData[normalized] = { count: 0, totalScore: 0 };
        }
        fruitData[normalized].count++;
        fruitData[normalized].totalScore += prediction.score;
      });

      return Object.entries(fruitData)
        .map(([fruit, data]) => ({
          fruit,
          count: data.count,
          averageScore: data.totalScore / data.count,
        }))
        .sort((a, b) => b.averageScore - a.averageScore);
    },
    topResult() {
      return this.summary[0] || null;
    },
    topFruitName() {
      if (!this.topResult) return "-";
      return this.formatFruitName(this.topResult.fruit);
    },
    topConfidence() {
      if (!this.topResult) return 0;
      return Math.round(this.topResult.averageScore * 100);
    },
    detectedList() {
      return this.summary
        .map((item) => `${this.formatFruitName(item.fruit)} (${item.count})`)
        .join(", ");
    },
    kandunganTables() {
      if (!this.tkpiLoaded) {
        return [
          {
            key: "status",
            title: "Status",
            rows: [{ label: "Info", value: "Memuat data kandungan..." }],
          },
        ];
      }

      if (!this.summary.length) {
        return [
          {
            key: "status",
            title: "Status",
            rows: [{ label: "Info", value: "Data kandungan tidak tersedia." }],
          },
        ];
      }

      const safe = (value, unit) => {
        if (value === undefined || value === null || value === "") {
          return "-";
        }
        return unit ? `${value} ${unit}` : value;
      };

      return this.summary.map((item) => {
        const row = this.getTkpi(item.fruit);
        const title = this.formatFruitName(item.fruit);
        if (!row) {
          return {
            key: item.fruit,
            title,
            rows: [{ label: "Info", value: "Data kandungan tidak tersedia." }],
          };
        }

        return {
          key: item.fruit,
          title,
          rows: [
            { label: "Air", value: safe(row.air_g, "g") },
            { label: "Energi", value: safe(row.energi_kcal, "kcal") },
            { label: "Karbohidrat", value: safe(row.karbohidratg, "g") },
            { label: "Protein", value: safe(row.protein_g, "g") },
            { label: "Lemak total", value: safe(row.lemak_total_g, "g") },
            { label: "Serat pangan", value: safe(row.serat_pangan_g, "g") },
            { label: "Vitamin C", value: safe(row.vitamin_c_mg, "mg") },
            {
              label: "Vitamin A / beta-karoten",
              value: safe(row.vitamin_a__karoten_ug, "ug"),
            },
            { label: "Kalium", value: safe(row.kalium_mg, "mg") },
          ],
        };
      });
    },
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    setActive(section) {
      this.activeSection = section;
      this.isMenuOpen = false;
    },
    updateActiveNav() {
      const scrollPosition = window.scrollY + 80;
      const sections = document.querySelectorAll("section[id]");

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionTop = section.offsetTop;
        const nextTop =
          i === sections.length - 1 ? Infinity : sections[i + 1].offsetTop;

        if (
          scrollPosition >= sectionTop - 100 &&
          scrollPosition < nextTop - 100
        ) {
          this.activeSection = section.getAttribute("id");
          return;
        }
      }

      if (window.scrollY < 100) {
        this.activeSection = "home";
      }
    },
    triggerFileInput(event) {
      if (event && event.target && event.target.closest(".browse-btn")) {
        return;
      }
      this.$refs.fileInput?.click();
    },
    handleFileChange(event) {
      const file = event.target.files?.[0];
      this.processFile(file);
    },
    processFile(file) {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar");
        return;
      }
      this.currentFile = file;
      this.selectedFileName = file.name;
      this.resultsError = "";
      this.detectionAttempted = false;
      this.predictions = [];

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    onImageLoaded() {
      const image = this.$refs.uploadedImage;
      const canvas = this.$refs.canvas;
      if (!image || !canvas) return;

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    onDragOver() {
      this.isDragOver = true;
    },
    onDragLeave() {
      this.isDragOver = false;
    },
    onDrop(event) {
      this.isDragOver = false;
      const files = event.dataTransfer.files;
      if (files && files.length) {
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = "";
        }
        this.processFile(files[0]);
      }
    },
    async detectObjects() {
      if (!this.currentFile) return;

      this.isLoading = true;
      this.resultsError = "";
      this.detectionAttempted = true;

      try {
        const form = new FormData();
        form.append("image", this.currentFile);

        const response = await fetch(this.API_URL, {
          method: "POST",
          body: form,
        });

        if (!response.ok) {
          const msg = await response.text();
          throw new Error(msg || "Deteksi gagal");
        }

        const { predictions = [] } = await response.json();
        const normalizedPredictions = predictions.map((prediction) => ({
          ...prediction,
          normalizedClass: this.normalizeLabel(prediction.class),
        }));

        this.predictions = normalizedPredictions;

        if (normalizedPredictions.length) {
          this.drawResults(normalizedPredictions);
        } else {
          this.clearCanvas();
        }

        setTimeout(() => {
          document
            .getElementById("results")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      } catch (error) {
        this.predictions = [];
        this.clearCanvas();
        this.resultsError = error.message || "Silakan coba lagi.";
      } finally {
        this.isLoading = false;
      }
    },
    drawResults(predictions) {
      const canvas = this.$refs.canvas;
      const image = this.$refs.uploadedImage;
      if (!canvas || !image) return;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      predictions.forEach((prediction) => {
        const [x1, y1, x2, y2] = prediction.bbox;
        const width = x2 - x1;
        const height = y2 - y1;
        const score = Math.round(prediction.score * 100);
        const normalized = prediction.normalizedClass || prediction.class;
        const displayName = this.formatFruitName(normalized);
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
    },
    clearCanvas() {
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    resetDetection() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
      this.currentFile = null;
      this.imageUrl = "";
      this.predictions = [];
      this.detectionAttempted = false;
      this.resultsError = "";
      this.selectedFileName = "";
      this.clearCanvas();
    },
    normalizeLabel(label) {
      if (!label) return "";
      const lower = label.toLowerCase().split("-")[0].trim();
      return this.labelAliases[lower] || lower;
    },
    getNutrition(fruitKey) {
      return this.nutritionData[fruitKey];
    },
    formatFruitName(fruitKey) {
      const nutrition = this.getNutrition(fruitKey);
      return (
        nutrition?.nama || fruitKey.charAt(0).toUpperCase() + fruitKey.slice(1)
      );
    },
    buildBenefits(nutrition) {
      const benefits = [];
      if (nutrition) {
        if (nutrition.vitamin_c && nutrition.vitamin_c !== "0 mg") {
          benefits.push("Sumber vitamin C untuk daya tahan tubuh.");
        }
        if (nutrition.serat && nutrition.serat !== "0 g") {
          benefits.push("Serat membantu pencernaan tetap lancar.");
        }
        if (nutrition.kalium && nutrition.kalium !== "0 mg") {
          benefits.push("Kalium membantu menjaga fungsi otot dan jantung.");
        }
        if (nutrition.beta_karoten && nutrition.beta_karoten !== "0 ug") {
          benefits.push("Beta karoten mendukung kesehatan mata.");
        }
      }
      if (benefits.length < 3) {
        benefits.push(
          "Konsumsi rutin membantu memenuhi kebutuhan gizi harian.",
        );
      }
      if (benefits.length < 3) {
        benefits.push(
          "Cocok dijadikan camilan sehat atau campuran menu harian.",
        );
      }
      return benefits.slice(0, 4);
    },
    startSlider() {
      this.stopSlider();
      this.slideTimer = setInterval(() => {
        this.nextSlide();
      }, 3000);
    },
    stopSlider() {
      if (this.slideTimer) {
        clearInterval(this.slideTimer);
        this.slideTimer = null;
      }
    },
    nextSlide() {
      if (!this.heroSlides.length) return;
      this.slideDirection = "left";
      this.prevSlide = this.activeSlide;
      this.activeSlide = (this.activeSlide + 1) % this.heroSlides.length;
    },
    goToSlide(index) {
      if (index < 0 || index >= this.heroSlides.length) return;
      if (index === this.activeSlide) return;
      this.slideDirection = index > this.activeSlide ? "left" : "right";
      this.prevSlide = this.activeSlide;
      this.activeSlide = index;
      this.startSlider();
    },
    slideClass(index) {
      const classes = ["hero-slide"];
      if (index === this.activeSlide) {
        classes.push("active", `enter-${this.slideDirection}`);
      } else if (this.prevSlide !== null && index === this.prevSlide) {
        classes.push(`exit-${this.slideDirection}`);
      }
      return classes;
    },
    async loadTkpi() {
      try {
        const response = await fetch(this.TKPI_URL);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = await response.json();
        this.tkpiData = payload.data || {};
        this.tkpiLoaded = true;
      } catch (error) {
        console.error("Gagal memuat TKPI:", error);
        this.tkpiData = {};
        this.tkpiLoaded = false;
      }
    },
    getTkpi(fruitKey) {
      if (!fruitKey) return null;
      return this.tkpiData[fruitKey] || null;
    },
  },
  mounted() {
    this.updateActiveNav();
    this.handleScroll = () => this.updateActiveNav();
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    this.startSlider();
    this.loadTkpi();

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          event.preventDefault();
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: "smooth",
          });
        }
      });
    });
  },
  beforeUnmount() {
    if (this.handleScroll) {
      window.removeEventListener("scroll", this.handleScroll);
    }
    this.stopSlider();
  },
}).mount("#app");

const initMatrixRain = () => {
  const canvas = document.getElementById("matrixRain");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let columns = 0;
  let particles = [];
  let animationId = null;
  const minSize = 52;
  const maxSize = 86;
  const minSpeed = 0.45;
  const maxSpeed = 1.2;
  const columnGap = 64;

  const assetImages = [
    "assets/Alpukat.png",
    "assets/Apel.png",
    "assets/Jambu Biji.png",
    "assets/Jeruk.png",
    "assets/Mangga.png",
    "assets/Melon.png",
    "assets/Pepaya.png",
    "assets/Pisang.png",
    "assets/Salak.png",
    "assets/Semangka.png",
  ];

  const loadedImages = [];

  const loadImages = () =>
    Promise.all(
      assetImages.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = encodeURI(src);
          }),
      ),
    ).then((items) => items.filter(Boolean));

  const resize = () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    columns = Math.max(1, Math.floor(width / columnGap));
    particles = Array.from({ length: columns }, (_, idx) =>
      createParticle(idx, columns),
    );
  };

  const createParticle = (index, totalColumns) => {
    const size = minSize + Math.random() * (maxSize - minSize);
    const image =
      loadedImages[Math.floor(Math.random() * loadedImages.length)] || null;
    const spacing = width / totalColumns;
    return {
      x: Math.floor(index * spacing + spacing * 0.5 - size / 2),
      y: Math.random() * height,
      size,
      speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
      image,
      opacity: 1,
    };
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      if (!particle.image) return;
      ctx.globalAlpha = particle.opacity;
      ctx.drawImage(
        particle.image,
        particle.x,
        particle.y,
        particle.size,
        particle.size,
      );

      particle.y += particle.speed;

      if (particle.y - particle.size > height) {
        particle.y = -particle.size;
        const size = minSize + Math.random() * (maxSize - minSize);
        particle.size = size;
        particle.image =
          loadedImages[Math.floor(Math.random() * loadedImages.length)] || null;
      }
    });
    ctx.globalAlpha = 1;
  };

  let lastTime = 0;
  const animate = (time) => {
    if (time - lastTime > 16) {
      draw();
      lastTime = time;
    }
    animationId = window.requestAnimationFrame(animate);
  };

  loadImages().then((images) => {
    loadedImages.splice(0, loadedImages.length, ...images);
    resize();
    animationId = window.requestAnimationFrame(animate);
  });

  window.addEventListener("resize", resize);
  window.addEventListener("beforeunload", () => {
    if (animationId) {
      window.cancelAnimationFrame(animationId);
    }
  });
};

window.addEventListener("load", initMatrixRain);
