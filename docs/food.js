
// Function to handle form submission, including validation and sending email

function handleBooking() {

    // 1. Collect all user input values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('number').value.trim();

    // Get the visible text (e.g., '4 persons') from the dropdown
    const personsSelect = document.getElementById('myDropdown');
    const persons = personsSelect.options[personsSelect.selectedIndex].text.trim();

    const date = document.querySelector("input[type='date']").value;
    const isPersonsSelected = personsSelect.selectedIndex !== 0;


    // 2. Validation (Ensures fields are filled before sending)
    if (!name || !email || !phone || !date || !isPersonsSelected) {
        alert("Please fill all required fields before booking.");
        return;
    }

    // Basic email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Basic phone number validation (adjust pattern if needed)
    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(phone)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
    }

    // Add other validation checks (email, phone number format) here...

    // 3. Post booking to backend API
    fetch('http://localhost:3000/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, persons, date })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert('Backend error: ' + data.error);
        } else {
            console.log('Booking stored', data);
            // optionally send email confirmation as well
            sendemail(name, email, phone, persons, date);
        }
    })
    .catch(err => {
        console.error('Fetch error', err);
        alert('Unable to send booking to server');
    });
}

// Function to initiate the EmailJS send process
function sendemail(name, email, phone, persons, date) {

    var templateParams = {
        "Customer Name": name,         // Matches [Customer Name] in template content
        "Customer Email": email,       // Matches [Customer Email] in template content
        "Customer Phone": phone,       // Matches [Customer Phone] in template content
        "Number of Persons": persons,  // Matches [Number of Persons] in template content
        "Reservation Date": date       // Matches [Reservation Date] in template content
    };

    // Use your Service ID and your latest template ID (template_xgrarth)
    const SERVICE_ID = 'service_ui335hb';
    const TEMPLATE_ID = 'template_xgrarth';

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
        .then(function (response) {
            console.log('SUCCESS!', response.status, response.text);

            swal("Booking Confirmed!", "Confirmation email sent!", "success");

            // alert(`Booking Confirmed!\n\nName: ${name}\nDate: ${date}\n\nConfirmation email sent!`);

            // Clear form

            document.querySelector('.details').reset();

        }, function (error) {
            console.log('FAILED...', error);
            swal("Error", "Something went wrong", "error");

            // alert("Something went wrong, please try again! Error: " + error.text);
        });
}

/* ================= INITIALIZATION & EVENT LISTENERS (Run after DOM is ready) ================= */


// ========================================= READ MORE FOR ABOUT =====================================================


const readMoreBtn = document.getElementById("readMoreBtn");
if (readMoreBtn) {
    readMoreBtn.addEventListener("click", function () {
        const moreText = document.getElementById("moreText");
        if (moreText) {
            // Check for 'none' or initial state ('')
            const isHidden = moreText.style.display === "none" || moreText.style.display === "";

            moreText.style.display = isHidden ? "block" : "none";
            this.textContent = isHidden ? "Read Less" : "Read More";
        }
    });
}


// ============================================= SHOW MORE MENU ITEMS =======================================================


const moreBtn = document.getElementById("readmoreitems");
const hiddenItems = document.querySelectorAll(".hidden-item");

if (moreBtn && hiddenItems.length > 0) {
    // Initially hide items if they aren't hidden by CSS/HTML
    hiddenItems.forEach(item => item.style.display = 'none');

    moreBtn.addEventListener("click", function (e) {
        e.preventDefault();

        // Check the current state of the first item to determine action
        const isHidden = hiddenItems[0].style.display === "none" || hiddenItems[0].style.display === "";

        hiddenItems.forEach(item => {
            item.style.display = isHidden ? "flex" : "none"; // Use 'flex' to display grid items
        });

        moreBtn.textContent = isHidden ? "Show Less" : "Show More";
    });
}


// ============================== menu page ==========================================================

document.addEventListener("DOMContentLoaded", () => {
    const MENU_API = "http://localhost:3000/api/menu";
    const menuContainer = document.getElementById("menuContainer");

    function escapeHtml(value) {
        const str = String(value ?? "");
        return str
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function displayMenu(items) {
        if (!menuContainer) return;

        if (!Array.isArray(items) || items.length === 0) {
            menuContainer.innerHTML = "<p>No menu items found.</p>";
            return;
        }

        menuContainer.innerHTML = items.map(item => `
            <div class="items ${escapeHtml(item.category)}" data-item-id="${Number(item.item_id) || ""}">
                <div class="box">
                    <div class="img-box">
                        <img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}" width="200">
                    </div>
                    <div class="details-box">
                        <h3>${escapeHtml(item.name)}</h3>
                        <p>${escapeHtml(item.description)}</p>
                    </div>
                    <div class="option">
                        <h4 class="price">Rs ${Number(item.price)}</h4>
                        <a><i class="fa-solid fa-cart-shopping add-cart"></i></a>
                    </div>
                </div>
            </div>
        `).join("");

        attachAddToCartHandlers();
    }

    async function loadMenu() {
        // Safety check: prevent running on pages that do not have menu container
        if (!document.getElementById("menuContainer")) return;

        try {
            const res = await fetch(MENU_API);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const items = await res.json();
            displayMenu(items);
        } catch (error) {
            console.error("Error loading menu:", error);
            if (menuContainer) {
                menuContainer.innerHTML = `<p class="error">Could not load menu: ${escapeHtml(error.message)}</p>`;
            }
        }
    }

    // ======= FILTER MENU =======
    const filterButtons = document.querySelectorAll(".filters_menu li[data-filter]");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filter = button.dataset.filter;
            const items = document.querySelectorAll(".items");

            items.forEach(item => {
                if (filter === "*") {
                    item.style.display = "flex";
                } else {
                    const category = filter.slice(1);
                    item.style.display = item.classList.contains(category) ? "flex" : "none";
                }
            });
        });
    });

    // ============================================ SHOPPING CART =====================================================


    const btncart = document.querySelector("#cart-icon");
    const cart = document.querySelector(".cart");
    const btnclose = document.querySelector("#cart-close");
    const cartCountEl = document.querySelector(".cart-count");

    // open cart
    if (btncart) {
        btncart.addEventListener("click", () => {
            cart?.classList.add("cart-active");
            // show a brief notification about cart contents
            const count = parseInt(cartCountEl?.innerText || '0', 10);
            if (count > 0 && typeof swal === 'function') {
                swal({
                    title: "Cart Opened",
                    text: `You have ${count} item${count > 1 ? 's' : ''} in your cart.`,
                    icon: "info",
                    buttons: false,
                    timer: 1200,
                });
            }
        });
    }

    // close cart
    if (btnclose) {
        btnclose.addEventListener("click", () => {
            cart?.classList.remove("cart-active");
        });
    }

    // attach initial handlers
    attachAddToCartHandlers();
    updateTotalAndCount();

    /* ---------------- FUNCTIONS (Cart Scope) ---------------- */

    // attach click listeners to all .add-cart icons
    function attachAddToCartHandlers() {
        const addBtns = document.querySelectorAll(".add-cart");
        addBtns.forEach((btn) => {
            if (!btn.dataset.bound) {
                btn.dataset.bound = "true";
                btn.addEventListener("click", function (e) {
                    e.preventDefault();
                    addCart(this);
                });
            }
        });
    }

    // Remove item handler
    function removeItemHandler() {
        if (!confirm("Are you sure to remove this item?")) return;
        const cartBox = this.closest(".cart-box");
        if (cartBox) cartBox.remove();
        updateTotalAndCount();
    }

    // Quantity change handler
    function qtyChangeHandler() {
        if (isNaN(this.value) || this.value < 1) this.value = 1;
        updateTotalAndCount();
    }

    // Add item to cart
    function addCart(clickedEl) {
        const item = clickedEl.closest(".items");
        if (!item) return;
        const itemId = item.dataset.itemId ? Number(item.dataset.itemId) : null;

        const titleEl = item.querySelector("h3");
        const priceEl =
            item.querySelector(".price") ||
            item.querySelector("h4.price") ||
            item.querySelector("h4");
        const imgEl = item.querySelector("img");

        const title = titleEl ? titleEl.innerText.trim() : "Product";
        const priceText = priceEl ? priceEl.innerText.trim() : "0";

        // FIX 1: This regex correctly removes ALL non-numeric characters for accurate parsing
        const priceNum = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0; // Added '.' to regex in case currency uses decimals

        const priceDisplay = "Rs." + priceNum;

        // prevent duplicates by title
        const existingTitles = Array.from(
            document.querySelectorAll(".cart-product-title")
        ).map((n) => n.innerText.trim());
        if (existingTitles.includes(title)) {
            alert("Item already in cart.");
            return;
        }

        // build cart box
        const cartBox = document.createElement("div");
        cartBox.className = "cart-box";
        if (itemId) cartBox.dataset.itemId = String(itemId);
        cartBox.innerHTML = `
            <img src="${imgEl ? imgEl.src : ""}" alt="${title}" class="cart-img">
            <div class="details-box">
                <div class="cart-food-title cart-product-title">${title}</div>
                <div class="price-box">
                    <div class="cart-price" data-price="${priceNum}">${priceDisplay}</div>
                    <div class="cart-amt">${priceDisplay}</div>
                </div>
                <input type="number" value="1" class="cart-quantity" min="1">
            </div>
            <i class="fa-solid fa-trash cart-remove" title="Remove"></i>
        `;

        const cartContent = document.querySelector(".cart-content");
        if (!cartContent) return;
        cartContent.appendChild(cartBox);

        // attach remove + qty handlers
        const removeBtn = cartBox.querySelector(".cart-remove");
        const qtyInput = cartBox.querySelector(".cart-quantity");
        if (removeBtn) removeBtn.addEventListener("click", removeItemHandler);
        if (qtyInput) qtyInput.addEventListener("change", qtyChangeHandler);

        updateTotalAndCount();
    }

    // Recalculate total and update cart count
    function updateTotalAndCount() {
        const cartBoxes = document.querySelectorAll(".cart-box");
        let total = 0;
        let count = 0;

        cartBoxes.forEach((box) => {
            // Get the price from the data-price attribute for accuracy
            const priceElement = box.querySelector(".cart-price");
            // Safety check for price element existence
            if (!priceElement) return;

            const unitPrice = parseFloat(priceElement.dataset.price) || 0;

            const qty = parseFloat(box.querySelector(".cart-quantity")?.value || 1);
            const lineTotal = unitPrice * qty;

            // update line amount
            const amtEl = box.querySelector(".cart-amt");
            if (amtEl) amtEl.innerText = "Rs." + lineTotal.toFixed(2); // Fix applied here too

            total += lineTotal;
            count += qty;
        });

        const totalEl = document.querySelector(".total-price");

        // FIX 2: Use toFixed(2) to prevent floating-point errors
        if (totalEl) totalEl.innerText = "Rs." + total.toFixed(2);

        if (cartCountEl) cartCountEl.innerText = count;
    }

    // Expose globally if needed (useful for debugging or external calls)
    window.updateTotalAndCount = updateTotalAndCount;

    loadMenu();

});

// payment process  

async function btn() {
    const cartContentEl = document.querySelector(".cart-content");
    const totalEl = document.querySelector(".total-price");
    const currentTotal = totalEl ? totalEl.innerText : "Rs.0";

    const cartItems = document.querySelectorAll(".cart-box");
    if (cartItems.length === 0) {
        if (typeof swal === "function") {
            swal("Oops!", "Your cart is empty. Add some items to place an order.", "warning");
        } else {
            alert("Your cart is empty! Add some items to place an order.");
        }
        return;
    }

    const orderItems = Array.from(cartItems).map((box) => {
        const itemIdRaw = box.dataset.itemId;
        const parsedId = itemIdRaw ? Number(itemIdRaw) : null;
        const itemId = Number.isNaN(parsedId) ? null : parsedId;
        const title = box.querySelector(".cart-product-title")?.innerText?.trim() || "Item";
        const quantity = Math.max(1, Number(box.querySelector(".cart-quantity")?.value || 1));
        const unitPrice = Number(box.querySelector(".cart-price")?.dataset?.price || 0);

        return {
            item_id: itemId,
            quantity,
            price: unitPrice,
            name: title,
            // compatibility with current backend router/order.js keys
            id: itemId,
            qty: quantity
        };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let shouldPlaceOrder = false;
    if (typeof swal === "function") {
        const willOrder = await swal({
            title: "Confirm Order",
            text: `Are you sure you want to place the order for Rs.${totalAmount.toFixed(2)}?`,
            icon: "warning",
            buttons: ["Cancel", "Yes, place order!"],
            dangerMode: true
        });
        shouldPlaceOrder = Boolean(willOrder);
    } else {
        shouldPlaceOrder = confirm(`Are you sure you want to place the order for Rs.${totalAmount.toFixed(2)}?`);
    }

    if (!shouldPlaceOrder) return;

    const payload = {
        customer_name: "Guest User",
        customer_phone: "0000000000",
        total_amount: totalAmount,
        items: orderItems,
        // compatibility with current backend router/order.js keys
        name: "Guest User",
        phone: "0000000000",
        total: totalAmount
    };

    try {
        const res = await fetch("http://localhost:3000/api/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.error || `HTTP ${res.status}`);
        }

        if (cartContentEl) {
            cartContentEl.innerHTML = "";
        }
        if (typeof window.updateTotalAndCount === "function") {
            window.updateTotalAndCount();
        }

        if (typeof swal === "function") {
            swal({
                title: "Order Placed Successfully!",
                text: `Your order for Rs.${totalAmount.toFixed(2)} has been confirmed.`,
                icon: "success",
                buttons: false,
                timer: 2000
            });
        } else {
            alert(`Order Placed Successfully! Your total was ${currentTotal}.`);
        }

        const cartEl = document.querySelector(".cart");
        cartEl?.classList.remove("cart-active");
    } catch (error) {
        console.error("Order API error:", error);
        if (typeof swal === "function") {
            swal("Order Failed", `Could not place order: ${error.message}`, "error");
        } else {
            alert(`Could not place order: ${error.message}`);
        }
    }
}

// Hamburger menu functionality is now handled in components/load-components.js
// This ensures it works correctly after the navbar component is loaded





