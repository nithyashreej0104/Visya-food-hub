// Function to load HTML components
function loadComponent(elementId, filePath) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            document.getElementById(elementId).innerHTML = html;
            
            // After loading navbar, configure it based on current page
            if (elementId === 'navbar-container') {
                configureNavbar();
            }
            
            // Re-initialize hamburger menu after loading
            if (elementId === 'navbar-container') {
                initializeHamburgerMenu();
            }
        })
        .catch(error => {
            console.error(`Error loading ${filePath}:`, error);
        });
}

// Configure navbar based on current page
function configureNavbar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const orderOnlineBtn = document.querySelector('.order-online-btn');
    const cartIconBtn = document.querySelector('.cart-icon-btn');
    
    if (currentPage === 'menu.html') {
        // Show cart icon, hide Order Online button
        if (orderOnlineBtn) orderOnlineBtn.style.display = 'none';
        if (cartIconBtn) cartIconBtn.style.display = 'block';
    } else {
        // Show Order Online button, hide cart icon
        if (orderOnlineBtn) orderOnlineBtn.style.display = 'block';
        if (cartIconBtn) cartIconBtn.style.display = 'none';
    }
}

// Initialize hamburger menu functionality
function initializeHamburgerMenu() {
    const menuToggle = document.getElementById("menuToggle");
    const navList = document.getElementById("navList");
    
    if (!menuToggle || !navList) return;
    
    // Create overlay element if it doesn't exist
    let navOverlay = document.querySelector(".nav-overlay");
    if (!navOverlay) {
        navOverlay = document.createElement("div");
        navOverlay.className = "nav-overlay";
        document.body.appendChild(navOverlay);
    }

    // Function to close mobile menu
    function closeMobileMenu() {
        navList.classList.remove("active");
        if (navOverlay) {
            navOverlay.classList.remove("active");
        }
        const icon = menuToggle.querySelector("i");
        if (icon) {
            icon.classList.remove("fa-times");
            icon.classList.add("fa-bars");
        }
    }

    // Remove existing event listeners by cloning
    const newToggle = menuToggle.cloneNode(true);
    menuToggle.parentNode.replaceChild(newToggle, menuToggle);
    const newNavList = navList.cloneNode(true);
    navList.parentNode.replaceChild(newNavList, navList);
    
    // Get fresh references
    const freshToggle = document.getElementById("menuToggle");
    const freshNavList = document.getElementById("navList");

    // Toggle menu when clicking hamburger icon
    freshToggle.addEventListener("click", function(e) {
        e.stopPropagation();
        freshNavList.classList.toggle("active");
        if (navOverlay) {
            navOverlay.classList.toggle("active");
        }
        
        // Change icon from bars to X when menu is open
        const icon = freshToggle.querySelector("i");
        if (freshNavList.classList.contains("active")) {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-times");
        } else {
            icon.classList.remove("fa-times");
            icon.classList.add("fa-bars");
        }
    });

    // Close menu when clicking overlay
    if (navOverlay) {
        navOverlay.addEventListener("click", function(e) {
            e.stopPropagation();
            closeMobileMenu();
        });
    }

    // Use event delegation on navList for better reliability
    freshNavList.addEventListener("click", function(e) {
        // Check if clicked element is a link
        const link = e.target.closest("a");
        if (link) {
            const href = link.getAttribute("href");
            
            // Close the menu
            closeMobileMenu();
            
            // If href is valid, navigate
            if (href && href !== "#" && href !== "javascript:void(0)") {
                e.preventDefault();
                // Small delay to let menu close animation start
                setTimeout(() => {
                    window.location.href = href;
                }, 200);
            }
            return;
        }
        
        // Handle cart icon click
        const cartIcon = e.target.closest("#cart-icon");
        if (cartIcon) {
            closeMobileMenu();
            // Let the cart functionality handle the rest
        }
    }, false);
}

// Load components when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    // Load navbar
    if (document.getElementById('navbar-container')) {
        loadComponent('navbar-container', 'components/navbar.html');
    }
    
    // Load footer
    if (document.getElementById('footer-container')) {
        loadComponent('footer-container', 'components/footer.html');
    }
});
