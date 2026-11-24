document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menu-btn");
  const sidebarContainer = document.getElementById("sidebar-container");

  // Determine correct path to components based on current page location
  const isInPagesDir = window.location.pathname.includes("/pages/");
  const componentsPath = isInPagesDir
    ? "../components/sidebar.txt"
    : "components/sidebar.txt";

  // Load sidebar component
  fetch(componentsPath)
    .then((response) => response.text())
    .then((html) => {
      sidebarContainer.innerHTML = html;

      const sidebar = document.getElementById("sidebar");
      const overlay = document.getElementById("sidebar-overlay");

      function openSidebar() {
        sidebar.classList.add("active");
        overlay.classList.add("active");
      }

      function closeSidebar() {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
      }

      if (menuBtn && sidebar && overlay) {
        menuBtn.addEventListener("click", openSidebar);
        overlay.addEventListener("click", closeSidebar);

        // Close sidebar when clicking a nav link on mobile
        sidebar.querySelectorAll("a").forEach((link) => {
          link.addEventListener("click", () => {
            if (window.innerWidth < 768) {
              closeSidebar();
            }
          });
        });

        // Handle resize - close sidebar if window becomes desktop size
        window.addEventListener("resize", () => {
          if (window.innerWidth >= 768) {
            closeSidebar();
          }
        });

        // Set active nav link based on current page
        setActiveNavLink();
      }
    });
});

function setActiveNavLink() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = sidebar.querySelectorAll(".sidebar-nav a");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const hrefPage = href.split("/").pop();
    if (
      hrefPage === currentPage ||
      (currentPage === "index.html" && hrefPage === "dashboard.html")
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}
