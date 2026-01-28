
/* 
========================= 
Navigation
========================= 
*/

// for active nav link highlighting (desktop + mobile)
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav-links a, .mobile-nav a, .mobile-nav-inner a");

  const normalize = (path) => {
    const url = new URL(path, window.location.origin);
    let p = url.pathname;

    if (p === "/index.html") p = "/";

    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);

    return p;
  };

  const setActive = () => {
    const current = normalize(window.location.pathname);

    links.forEach((a) => a.classList.remove("active"));

    links.forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;

      const target = normalize(href);

      if (target === current) {
        a.classList.add("active");
      }
    });
  };

  setActive();
  window.addEventListener("hashchange", setActive);
});

// ---------------- Mobile slide-down menu ----------------
(function () {
  function initDropdownNav() {
    const btn = document.querySelector(".nav-hamburger");
    const panel = document.getElementById("mobileNav");
    const header = document.querySelector(".site-header");

    if (!btn || !panel || !header) return;

    function open() {
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      btn.classList.add("is-open"); 
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Close menu");
    }

    function close() {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      btn.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open menu");
    }

    function toggle() {
      panel.classList.contains("is-open") ? close() : open();
    }

    // Click button toggles (hamburger or X)
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });

    // Click a link closes
    panel.addEventListener("click", (e) => {
      if (e.target.closest("a")) close();
    });

    // Click anywhere outside header closes
    document.addEventListener("click", (e) => {
      if (!panel.classList.contains("is-open")) return;
      if (!header.contains(e.target)) close();
    });

    // ESC closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && panel.classList.contains("is-open")) close();
    });

    // Resize to desktop closes
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768 && panel.classList.contains("is-open")) close();
    });
  }

  document.addEventListener("DOMContentLoaded", initDropdownNav);
})();

/* 
========================= 
Footer
========================= 
*/

// for copy-to-clipboard email functionality
const emailDiv = document.getElementById("copyEmail");
const tooltip = document.getElementById("emailTooltip");

emailDiv.addEventListener("click", () => {
    const email = emailDiv.textContent.trim();

    // Copy to clipboard
    navigator.clipboard.writeText(email).then(() => {
    // tooltip text
    tooltip.textContent = "Copied!";
    
    setTimeout(() => {
        tooltip.textContent = "Click to copy";
    }, 1000);
    });
});