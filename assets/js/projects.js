const galleryView = document.getElementById('galleryView');
const detailsViewList = document.getElementById("detailsViewList");
const btnOverview = document.getElementById("btnOverview");
const btnDetails = document.getElementById("btnDetails");
const detailsContent = document.getElementById("detailsContent");
const toggle = document.querySelector(".view-toggle");

const controlsRow = document.querySelector(".controls-row");

const viewWrapper = document.querySelector(".view-wrapper");

const btnBackToOverview = document.querySelector(".back-to-overview-btn");
const backToOverviewBtnBottom = document.querySelector(".back-to-overview-btn-bottom");


// 1. Load content data
let articles = window.articles || [];
document.getElementById("projectCount").textContent = articles.length;

// ---------------- GA4 tracking: project case ----------------
const CaseTimer = (() => {
  let activeId = null;
  let activeTitle = null;
  let activeView = null;   // "overview" | "details"
  let startedAt = null;

  const now = () => Date.now();

  function viewMode() {
    if (btnDetails?.classList.contains("active")) return "details";
    if (btnOverview?.classList.contains("active")) return "overview";
    return "unknown";
  }

  function send(eventName, params) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", eventName, params);
  }

  function projectTitleFromId(projectId) {
    // project-3 -> 3
    const idx = parseInt(projectId.split("-")[1], 10);
    const a = articles?.[idx];
    return a?.overviewTitle || a?.title || `project-${idx}`;
  }

  function start(projectId, reason = "select") {
    if (!projectId) return;

    // switching case => flush previous
    if (activeId && projectId !== activeId) {
      flush("switch_case");
    }

    activeId = projectId;
    activeTitle = projectTitleFromId(projectId);
    activeView = viewMode();
    startedAt = now();

    send("case_view", {
      case_id: activeId,
      case_title: activeTitle,
      view_mode: activeView,
      page_path: window.location.pathname,
      reason
    });
  }

  function flush(reason = "unknown") {
    if (!activeId || !startedAt) return;

    const secs = Math.max(0, Math.round((now() - startedAt) / 1000));

    send("case_time", {
      case_id: activeId,
      case_title: activeTitle,
      view_mode: activeView || viewMode(),
      duration_seconds: secs,
      page_path: window.location.pathname,
      reason
    });

    // restart timer segment for same active case (useful for view toggle)
    startedAt = now();
    activeView = viewMode();
  }

  // when user leaves / tab hidden
  function bindExitFlush() {
    window.addEventListener("pagehide", () => flush("pagehide"));
    window.addEventListener("beforeunload", () => flush("beforeunload"));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush("hidden");
    });
  }

  return { start, flush, bindExitFlush };
})();


renderGalleryViewCards();
renderDetailsViewList();

// flush timing when user leaves / hides tab
CaseTimer.bindExitFlush();



// 2. Render gallery view cards
function renderGalleryViewCards() {
    galleryView.innerHTML = ''; // clear in case of re-render

    articles.forEach((article, index) => {

    // Create element for Gallery View
    const card = document.createElement('article');
    card.className = 'project-card';
    card.dataset.projectId = `project-${index}`;

    card.innerHTML = `
        <div class="project-image-box">
        <div class="image-badge">${article.dateRange}</div>
        <img  class="thumbnail-${article.projectName}" src="${article.mainImage}" alt="${article.overviewTitle} Thumbnail" />
        </div>
        <div class="project-body-container">
        <h3 class="project-title">
            ${article.overviewTitle}
        </h3>
        <p class="project-subtitle">
            As <strong>${article.role}</strong>, ${article.overviewSubtitle}
        </p>
        <div>
            <div class="project-meta-label">Impact</div>
            <ul class="project-impact-container">
            ${article.overviewImpacts.map(impact => `<li class="project-impact-row">${impact}</li>`).join('')}
            </ul>
        </div>
        <div>
            <div class="project-meta-label">Tags</div>
            <div class="project-tags-container">
            ${article.GalleryKeywords
                .map(tag => `<div class="tag project-tag">${tag}</div>`)
                .join('')}
            </div>
        </div>
        </div>
    `;

    card.addEventListener("click", () => {
        const id = card.getAttribute("data-project-id");

        CaseTimer.start(id, "gallery_click"); 

        updateDetails(id);
        document
        .querySelectorAll(".details-list-item")
        .forEach(item =>
            item.classList.toggle(
            "active",
            item.getAttribute("data-project-id") === id
            )
        );
        setActiveView("details");
    });

    galleryView.appendChild(card);
    });
}

function renderDetailsViewList() {
    detailsViewList.innerHTML = "";

    articles.forEach((article, index) => {
    
    const item = document.createElement("div");
    item.className = "details-list-item";
    item.dataset.projectId = `project-${index}`;
    

    item.innerHTML = `
        <div class= "details-list-item-inner-box">
        <div class="details-list-image-box">
            <img class="thumbnail-${article.projectName}" src="${article.mainImage}" alt="${article.title} Thumbnail">
        </div>
        <div>
            <div class="details-list-item-title">${article.overviewTitle}</div>
            <div class="details-list-item-role">${article.role}</div>
            <div class="details-list-item-tags-container">
                ${article.listKeywords
                .map(tag => `<div class="details-list-tag">${tag}</div>`)
                .join('')}
            </div>
        </div>
        </div>
    `;

    item.addEventListener("click", () => {
        setActiveDetailsItem(index);
    });

    detailsViewList.appendChild(item);
    });

    const firstItem = detailsViewList.querySelector(".details-list-item");
    if (firstItem) {
        firstItem.classList.add("active");
        updateDetails(firstItem.dataset.projectId);

        CaseTimer.start(firstItem.dataset.projectId, "default"); 
    }
}

function animateSwitch(showEl, hideEl) {
  // Mobile/tablet: instant swap (no animationend dependency)
  const isSmall = window.matchMedia("(max-width: 768px)").matches;

  if (isSmall) {
    // hard reset
    showEl.classList.remove("enter", "leave");
    hideEl.classList.remove("enter", "leave");

    // only show one
    hideEl.classList.remove("active");
    showEl.classList.add("active");
    return;
  }

  // Desktop: keep your animated behavior
  showEl.classList.remove("enter", "leave");
  hideEl.classList.remove("enter", "leave");

  showEl.classList.add("active");
  hideEl.classList.add("active");

  hideEl.classList.add("leave");
  hideEl.addEventListener(
    "animationend",
    () => {
      hideEl.classList.remove("leave", "active");
    },
    { once: true }
  );

  showEl.classList.add("enter");
  showEl.addEventListener(
    "animationend",
    () => {
      showEl.classList.remove("enter");
    },
    { once: true }
  );
}

function scrollToViewStart() {
  const el = document.getElementById("projectsTop");
  if (!el) return;
  
  const header = document.querySelector(".site-header");
  const headerH = header ? header.offsetHeight : 0;

  const y = window.scrollY + el.getBoundingClientRect().top - headerH - 12;
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

function setActiveView(view) {
    // record time spent in the current view before switching
    const switching =
        (view === "overview" && !btnOverview.classList.contains("active")) ||
        (view === "details" && !btnDetails.classList.contains("active"));

    if (switching) {
        CaseTimer.flush("toggle_view");
    }

    const isOverviewActive = btnOverview.classList.contains("active");
    const isDetailsActive = btnDetails.classList.contains("active");

    if (view === "overview") {
      // If on overview, just sync hash/classes without animation
      if (!isOverviewActive) {
          animateSwitch(overviewView, detailsView);
      }

      btnOverview.classList.add("active");
      btnDetails.classList.remove("active");
      toggle.classList.remove("details-active");
      controlsRow.classList.remove("details-active");
      window.location.hash = "overview";

      viewWrapper.classList.remove("details-active");
      viewWrapper.classList.add("overview-active");

    } else {
      // view === "details"
      // If on details, skip animation
      if (!isDetailsActive) {
          animateSwitch(detailsView, overviewView);
      }

      btnOverview.classList.remove("active");
      btnDetails.classList.add("active");
      toggle.classList.add("details-active");
      controlsRow.classList.add("details-active");
      window.location.hash = "details";
      viewWrapper.classList.remove("overview-active");
      viewWrapper.classList.add("details-active");

      // wait one frame so layout/classes apply, then scroll to a project start position
      requestAnimationFrame(scrollToViewStart);
    }

    
}

function updateDetails(projectId) {
    const data = articles[parseInt(projectId.split('-')[1])];
    if (!data) return;

    detailsContent.querySelector('[data-field="title"]').innerHTML =
    data.title;
    detailsContent.querySelector('[data-field="subtitle"]').innerHTML =
    data.subtitle;
    detailsContent.querySelector('[data-field="role"]').innerHTML =
    data.role;
    detailsContent.querySelector('[data-field="date"]').innerHTML =
    data.dateRange;
    detailsContent.querySelector('[data-field="context"]').innerHTML =
    data.context;
    detailsContent.querySelector('[data-field="problem"]').innerHTML =
    data.problem;
    detailsContent.querySelector('[data-field="objectives"]').innerHTML =
    data.objectives;
    detailsContent.querySelector('[data-field="solution"]').innerHTML =
    data.solution;
    detailsContent.querySelector('[data-field="contribution"]').innerHTML =
    data.contribution;
    detailsContent.querySelector('[data-field="results"]').innerHTML =
    data.results;
}

btnOverview.addEventListener("click", 
    () => setActiveView("overview")
);
btnDetails.addEventListener("click", 
    () => setActiveView("details")
);
btnBackToOverview.addEventListener("click", 
    () => setActiveView("overview")
);
backToOverviewBtnBottom.addEventListener("click",
    () => setActiveView("overview")
);


function setActiveDetailsItem(index) {
    const items = Array.from(document.querySelectorAll(".details-list-item"));
    if (!items.length) return;

    const len = items.length;
    // wrap index (handles negatives and overflow)
    const normalized = ((index % len) + len) % len;
    const item = items[normalized];

    items.forEach((el, i) => {
    el.classList.toggle("active", i === normalized);
    });

    const id = item.getAttribute("data-project-id");

    CaseTimer.start(id, "details_select");

    updateDetails(id);

    
    item.scrollIntoView({ block: "nearest" });
}

document.addEventListener("keydown", (e) => {
    // Only respond when Details view is active
    if (!toggle.classList.contains("details-active")) return;

    const items = Array.from(document.querySelectorAll(".details-list-item"));
    if (!items.length) return;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();

    let currentIndex = items.findIndex(el =>
        el.classList.contains("active")
    );

    // if nothing active yet, start from 0
    if (currentIndex === -1) currentIndex = 0;

    const delta = e.key === "ArrowDown" ? 1 : -1;
    setActiveDetailsItem(currentIndex + delta); // wraps automatically
    }
});

// turn hash into UI state
function applyViewFromHash() {
    const hash = window.location.hash;

    if (hash === "#details") {
    // DETAILS
    setActiveView("details")
    } else {
    // default → OVERVIEW
    setActiveView("overview")
    // if there was no hash, normalize URL to #overview without adding a new history step
    if (!hash) {
        history.replaceState(null, "", "#overview");
    }
    }
}

// on initial load
document.addEventListener("DOMContentLoaded", applyViewFromHash);

// when hash changes via back/forward or manual typing
window.addEventListener("hashchange", applyViewFromHash);