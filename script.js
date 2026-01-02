/* LiquidReceipt Site – small enhancements
   - Theme toggle (stored in localStorage)
   - Scroll reveal via IntersectionObserver
   - Subtle blob parallax on pointer move (desktop only)
*/

(function () {
  const STORAGE_KEY = "lr-theme";

  function applyTheme(theme) {
    const root = document.documentElement;
    if (!theme) {
      root.removeAttribute("data-theme");
      return;
    }
    root.setAttribute("data-theme", theme);
  }

  function getPreferredTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch {
      // ignore
    }
    return null;
  }

  function setPreferredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    applyTheme(theme);
    updateThemeToggle(theme);
  }

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme");
  }

  function updateThemeToggle(theme) {
    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    const isDark = theme === "dark";
    btn.setAttribute("aria-pressed", String(isDark));
    btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    const icon = btn.querySelector("[data-theme-icon]");
    if (icon) icon.textContent = isDark ? "☾" : "☀︎";
  }

  // Theme init (CSS reads `data-theme`; `:root color-scheme` handles native controls)
  const initial = getPreferredTheme();
  if (initial) applyTheme(initial);

  document.addEventListener("DOMContentLoaded", () => {
    // Wire theme toggle
    const toggle = document.querySelector("[data-theme-toggle]");
    if (toggle) {
      updateThemeToggle(currentTheme() || "light");
      toggle.addEventListener("click", () => {
        const next = (currentTheme() || "light") === "dark" ? "light" : "dark";
        setPreferredTheme(next);
      });
    }

    // Scroll reveal
    const revealEls = Array.from(document.querySelectorAll(".reveal"));
    if ("IntersectionObserver" in window && revealEls.length) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              io.unobserve(e.target);
            }
          }
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    // Gentle parallax for blobs (desktop, pointer devices only)
    const bg = document.querySelector(".liquid-bg");
    if (!bg) return;
    const canParallax =
      matchMedia("(pointer:fine)").matches &&
      matchMedia("(prefers-reduced-motion: no-preference)").matches;
    if (!canParallax) return;

    let raf = 0;
    let lastX = 0;
    let lastY = 0;

    function onMove(ev) {
      const x = (ev.clientX / window.innerWidth - 0.5) * 2;
      const y = (ev.clientY / window.innerHeight - 0.5) * 2;
      lastX = x;
      lastY = y;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        bg.style.transform = `translate3d(${lastX * 10}px, ${lastY * 10}px, 0)`;
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
  });
})();



