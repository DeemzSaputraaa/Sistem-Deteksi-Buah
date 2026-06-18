const LOCOMOTIVE_CDN =
  "https://cdn.jsdelivr.net/npm/locomotive-scroll@5.0.1/+esm";

let locomotiveInstance = null;
let updateFrame = null;
let sectionStateFrame = null;

const cardGroups = [
  ".stat-card",
  ".fruit-card",
  ".step",
  ".tech-card",
  ".arch-card",
  ".nutrition-table-block",
];

const stageGroups = [
  ".hero-shell",
  ".hero-stats",
  ".fruit-grid",
  ".cara-kerja-steps",
  ".tech-grid",
  ".arch-flow",
  ".detection-layout",
];

const scheduleUpdate = () => {
  if (!locomotiveInstance || typeof locomotiveInstance.update !== "function") {
    return;
  }

  if (updateFrame) {
    window.cancelAnimationFrame(updateFrame);
  }

  updateFrame = window.requestAnimationFrame(() => {
    locomotiveInstance.update();
    updateFrame = null;
  });
};

const bindRefreshHooks = () => {
  window.addEventListener("resize", scheduleUpdate, { passive: true });
  window.addEventListener("load", scheduleUpdate);
  window.addEventListener("fruitdetect:loco-update", scheduleUpdate);

  if (document.fonts?.ready) {
    document.fonts.ready.then(scheduleUpdate).catch(() => {});
  }
};

const decorateSections = () => {
  document.querySelectorAll("section[data-section-label]").forEach((section, index) => {
    section.classList.add("loco-section");
    section.classList.add(index % 2 === 0 ? "section-tone-a" : "section-tone-b");

    if (section.querySelector(".section-rail-label")) {
      return;
    }

    const label = document.createElement("span");
    label.className = "section-rail-label";
    label.textContent = section.dataset.sectionLabel || "";
    label.setAttribute("aria-hidden", "true");
    label.setAttribute("data-scroll", "");
    label.setAttribute("data-scroll-speed", index % 2 === 0 ? "0.12" : "-0.12");
    section.prepend(label);
  });
};

const decorateScrollElements = () => {
  cardGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.classList.add("loco-card-reveal");
      element.classList.add(index % 2 === 0 ? "reveal-depth" : "reveal-rise");
      element.style.setProperty("--loco-delay", `${index * 42}ms`);
      if (!element.hasAttribute("data-scroll")) {
        element.setAttribute("data-scroll", "");
      }
      element.setAttribute("data-scroll-class", "is-inview");
    });
  });
};

const decorateStages = () => {
  stageGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.add("chapter-stage");
    });
  });
};

const updateSectionState = () => {
  const viewportHeight = window.innerHeight || 1;
  const viewportCenter = viewportHeight * 0.5;
  const sections = document.querySelectorAll("section[data-section-label]");

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const distance = Math.abs(viewportCenter - sectionCenter);
    const normalizedDistance = Math.min(1, distance / Math.max(viewportHeight, 1));
    const progress = Math.max(
      0,
      Math.min(1, (viewportCenter - rect.top) / Math.max(rect.height, 1)),
    );
    const isActive = rect.top <= viewportCenter && rect.bottom >= viewportCenter;

    section.style.setProperty("--section-progress", progress.toFixed(3));
    section.style.setProperty("--section-focus", String(1 - normalizedDistance));
    section.classList.toggle("is-active-section", isActive);
  });

  sectionStateFrame = window.requestAnimationFrame(updateSectionState);
};

const startSectionStateLoop = () => {
  if (sectionStateFrame) {
    return;
  }
  sectionStateFrame = window.requestAnimationFrame(updateSectionState);
};

const showDecoratedElements = () => {
  document
    .querySelectorAll(".loco-card-reveal, .has-loco-reveal, .section-rail-label")
    .forEach((element) => {
      element.classList.add("is-inview");
    });
};

const initLocomotiveScroll = async () => {
  bindRefreshHooks();
  decorateSections();
  decorateStages();

  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !document.querySelector("[data-scroll-container]")
  ) {
    showDecoratedElements();
    startSectionStateLoop();
    return;
  }

  try {
    decorateScrollElements();
    const module = await import(LOCOMOTIVE_CDN);
    const LocomotiveScroll = module.default;
    if (!LocomotiveScroll) {
      startSectionStateLoop();
      return;
    }

    locomotiveInstance = new LocomotiveScroll();
    window.__fruitDetectLocomotive = locomotiveInstance;
    scheduleUpdate();
    startSectionStateLoop();
  } catch (error) {
    showDecoratedElements();
    startSectionStateLoop();
    console.warn("Locomotive Scroll gagal dimuat:", error);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLocomotiveScroll, {
    once: true,
  });
} else {
  initLocomotiveScroll();
}
