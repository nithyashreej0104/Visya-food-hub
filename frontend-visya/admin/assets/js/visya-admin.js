(function () {
  function isMobile() {
    return window.matchMedia("(max-width: 991px)").matches;
  }

  function closeSidebar() {
    var sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.remove("active");
    }
  }

  function initSidebarToggle() {
    var sidebar = document.getElementById("sidebar");
    var hamburger = document.getElementById("sidebarToggle");
    if (!sidebar || !hamburger) return;

    hamburger.addEventListener("click", function () {
      if (isMobile()) {
        sidebar.classList.toggle("active");
        return;
      }

      document.body.classList.toggle("sidebar-icon-only");
    });

    var sidebarLinks = sidebar.querySelectorAll(".nav-link");
    sidebarLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (isMobile()) {
          closeSidebar();
        }
      });
    });

    window.addEventListener("resize", function () {
      if (!isMobile()) {
        closeSidebar();
      }
    });
  }

  function bindLogoutLinks() {
    var logoutTarget = window.location.pathname.includes("/admin/pages/") ? "../../main.html" : "../main.html";
    ["logoutSidebar", "logoutNav"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("click", function (event) {
        event.preventDefault();
        sessionStorage.removeItem("adminLoggedIn");
        window.location.href = logoutTarget;
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initSidebarToggle();
    bindLogoutLinks();
  });
})();
