/**
 * Halyvane — shared app engine.
 * Injects the header, footer, cart drawer, checkout modal and toast container into
 * every page (pure DOM creation, so it works over file:// too), and owns all cart /
 * checkout / toast logic. Page scripts talk to it through the global `Store` API.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "halyvane_cart_v2";
  const NAV = [
    { href: "index.html",   label: "Home" },
    { href: "shop.html",    label: "Shop" },
    { href: "about.html",   label: "About" },
    { href: "contact.html", label: "Contact" }
  ];

  // Current page file name (default to index.html at site root).
  const currentPage = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    cart = [];
  }

  /* ---------- Helpers ---------- */
  const money = (n) => `$${n.toFixed(2)}`;
  const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const lineKeyFor = (id, custom) => {
    const c = custom || {};
    return `${id}|${c.text || ""}|${c.color || ""}|${c.size || ""}`;
  };

  /* ---------- Layout injection ---------- */
  function buildHeader() {
    const links = NAV.map((n) => {
      const active = n.href.toLowerCase() === currentPage ? " active" : "";
      return `<li><a href="${n.href}" class="nav-link${active}">${n.label}</a></li>`;
    }).join("");

    const header = document.createElement("header");
    header.id = "site-header";
    header.innerHTML = `
      <div class="container navbar">
        <a href="index.html" class="logo">Haly<span>vane</span></a>
        <nav>
          <ul class="nav-menu" id="navigation-menu">${links}</ul>
        </nav>
        <div class="header-actions">
          <button class="cart-toggle-btn" id="cart-toggle-btn" aria-label="View Cart">
            <i class="fa-solid fa-bag-shopping"></i>
            <span class="cart-badge" id="cart-count">0</span>
          </button>
          <button class="hamburger" id="mobile-menu-toggle" aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>`;
    return header;
  }

  function buildFooter() {
    const links = NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join("");
    const footer = document.createElement("footer");
    footer.id = "site-footer";
    footer.innerHTML = `
      <div class="container footer-content">
        <div class="footer-logo">Haly<span>vane</span></div>
        <p class="footer-tagline">Personalized Print-on-Demand • Apparel • Drinkware • Wall Art • Cases • Bags • Accessories</p>
        <nav class="footer-nav">${links}</nav>
        <div class="footer-meta">&copy; 2026 Halyvane. All rights reserved. — Demo store for presentation.</div>
      </div>`;
    return footer;
  }

  function buildOverlays() {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="cart-drawer-overlay" id="cart-drawer-overlay"></div>
      <div class="cart-drawer" id="cart-drawer">
        <div class="cart-drawer-header">
          <h3>Your Bag (<span id="cart-drawer-count">0</span>)</h3>
          <button class="cart-drawer-close" id="cart-drawer-close" aria-label="Close Cart">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="cart-drawer-items" id="cart-drawer-items"></div>
        <div class="cart-drawer-footer" id="cart-drawer-footer">
          <div class="cart-summary-row">
            <span>Subtotal</span>
            <span class="cart-subtotal-val" id="cart-subtotal-val">$0.00</span>
          </div>
          <p class="cart-shipping-info">Free shipping over $50 • Shipping &amp; taxes calculated at checkout.</p>
          <button class="btn btn-primary checkout-btn" id="checkout-btn" style="width:100%;">Proceed to Checkout</button>
        </div>
      </div>

      <div class="modal-overlay" id="checkout-modal-overlay"></div>
      <div class="checkout-modal" id="checkout-modal">
        <button class="modal-close" id="checkout-modal-close" aria-label="Close Modal">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="modal-content" id="checkout-modal-content"></div>
      </div>

      <div class="toast-container" id="toast-container"></div>`;
    return wrap;
  }

  /* ---------- Init after DOM ready ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    document.body.insertBefore(buildHeader(), document.body.firstChild);
    document.body.appendChild(buildFooter());
    const overlays = buildOverlays();
    while (overlays.firstChild) document.body.appendChild(overlays.firstChild);

    // Element refs
    const hamburger = document.getElementById("mobile-menu-toggle");
    const navMenu = document.getElementById("navigation-menu");
    const header = document.getElementById("site-header");

    const cartToggleBtn = document.getElementById("cart-toggle-btn");
    const cartDrawer = document.getElementById("cart-drawer");
    const cartDrawerOverlay = document.getElementById("cart-drawer-overlay");
    const cartDrawerClose = document.getElementById("cart-drawer-close");
    const cartCount = document.getElementById("cart-count");
    const cartDrawerCount = document.getElementById("cart-drawer-count");
    const cartDrawerItems = document.getElementById("cart-drawer-items");
    const cartSubtotalVal = document.getElementById("cart-subtotal-val");
    const checkoutBtn = document.getElementById("checkout-btn");

    const checkoutModal = document.getElementById("checkout-modal");
    const checkoutModalOverlay = document.getElementById("checkout-modal-overlay");
    const checkoutModalClose = document.getElementById("checkout-modal-close");
    const checkoutModalContent = document.getElementById("checkout-modal-content");
    const toastContainer = document.getElementById("toast-container");

    /* Mobile menu */
    if (hamburger && navMenu) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
        document.body.style.overflow = navMenu.classList.contains("active") ? "hidden" : "";
      });
      navMenu.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          hamburger.classList.remove("active");
          navMenu.classList.remove("active");
          document.body.style.overflow = "";
        });
      });
    }

    /* Scroll header */
    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.style.boxShadow = "var(--shadow-md)";
        header.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
      } else {
        header.style.boxShadow = "none";
        header.style.backgroundColor = "rgba(255, 255, 255, 0.85)";
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    /* Drawer open/close */
    const openCart = () => {
      cartDrawer.classList.add("active");
      cartDrawerOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    };
    const closeCart = () => {
      cartDrawer.classList.remove("active");
      cartDrawerOverlay.classList.remove("active");
      if (!navMenu.classList.contains("active")) document.body.style.overflow = "";
    };
    cartToggleBtn.addEventListener("click", openCart);
    cartDrawerClose.addEventListener("click", closeCart);
    cartDrawerOverlay.addEventListener("click", closeCart);

    /* Toasts */
    const showToast = (message) => {
      const toast = document.createElement("div");
      toast.className = "toast-notification";
      toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${escapeHtml(message)}</span>`;
      toastContainer.appendChild(toast);
      setTimeout(() => toast.classList.add("active"), 50);
      setTimeout(() => {
        toast.classList.remove("active");
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    };

    /* Cart persistence + rendering */
    const saveCart = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));

    const cartQtyTotal = () => cart.reduce((s, i) => s + i.qty, 0);

    const updateCartCount = () => {
      const total = cartQtyTotal();
      if (cartCount) cartCount.innerText = total;
      if (cartDrawerCount) cartDrawerCount.innerText = total;
    };

    const customLine = (custom) => {
      if (!custom) return "";
      const bits = [];
      if (custom.text) bits.push(`<span class="cart-item-custom-text"><i class="fa-solid fa-pen"></i> "${escapeHtml(custom.text)}"</span>`);
      if (custom.color) bits.push(`<span>${escapeHtml(custom.color)}</span>`);
      if (custom.size) bits.push(`<span>${escapeHtml(custom.size)}</span>`);
      return bits.length ? `<div class="cart-item-custom">${bits.join(" · ")}</div>` : "";
    };

    const renderCart = () => {
      updateCartCount();
      if (cart.length === 0) {
        cartDrawerItems.innerHTML = `
          <div class="cart-empty-message">
            <i class="fa-solid fa-bag-shopping"></i>
            <p>Your bag is empty.</p>
            <a href="shop.html" class="btn btn-primary btn-sm">Start Shopping</a>
          </div>`;
        if (cartSubtotalVal) cartSubtotalVal.innerText = "$0.00";
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
      }
      if (checkoutBtn) checkoutBtn.disabled = false;

      let subtotal = 0;
      cartDrawerItems.innerHTML = cart.map((item) => {
        const prod = getProduct(item.id);
        if (!prod) return "";
        subtotal += prod.price * item.qty;
        return `
          <div class="cart-item" data-key="${item.lineKey}">
            <div class="cart-item-img"><img src="${prod.image}" alt="${escapeHtml(prod.name)}"></div>
            <div class="cart-item-details">
              <h4 class="cart-item-title">${escapeHtml(prod.name)}</h4>
              ${customLine(item.custom)}
              <span class="cart-item-price">${money(prod.price)}</span>
              <div class="cart-item-qty">
                <button class="qty-btn qty-minus" data-key="${item.lineKey}"><i class="fa-solid fa-minus"></i></button>
                <span class="qty-val">${item.qty}</span>
                <button class="qty-btn qty-plus" data-key="${item.lineKey}"><i class="fa-solid fa-plus"></i></button>
              </div>
            </div>
            <button class="cart-item-remove" data-key="${item.lineKey}"><i class="fa-regular fa-trash-can"></i></button>
          </div>`;
      }).join("");

      if (cartSubtotalVal) cartSubtotalVal.innerText = money(subtotal);

      cartDrawerItems.querySelectorAll(".qty-minus").forEach((b) =>
        b.addEventListener("click", (e) => updateCartQty(e.currentTarget.dataset.key, -1)));
      cartDrawerItems.querySelectorAll(".qty-plus").forEach((b) =>
        b.addEventListener("click", (e) => updateCartQty(e.currentTarget.dataset.key, 1)));
      cartDrawerItems.querySelectorAll(".cart-item-remove").forEach((b) =>
        b.addEventListener("click", (e) => removeFromCart(e.currentTarget.dataset.key)));
    };

    const addToCart = (productId, qty, custom) => {
      const prod = getProduct(productId);
      if (!prod) return;
      qty = qty || 1;
      const key = lineKeyFor(productId, custom);
      const existing = cart.find((i) => i.lineKey === key);
      if (existing) existing.qty += qty;
      else cart.push({ id: productId, qty, custom: custom || null, lineKey: key });
      saveCart();
      renderCart();
      showToast(`"${prod.name}" added to bag!`);
    };

    const updateCartQty = (key, delta) => {
      const item = cart.find((i) => i.lineKey === key);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) cart = cart.filter((i) => i.lineKey !== key);
      saveCart();
      renderCart();
    };

    const removeFromCart = (key) => {
      const item = cart.find((i) => i.lineKey === key);
      const prod = item ? getProduct(item.id) : null;
      cart = cart.filter((i) => i.lineKey !== key);
      saveCart();
      renderCart();
      if (prod) showToast(`"${prod.name}" removed.`);
    };

    /* Checkout modal */
    const openModal = () => {
      checkoutModal.classList.add("active");
      checkoutModalOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    };
    const closeModal = () => {
      checkoutModal.classList.remove("active");
      checkoutModalOverlay.classList.remove("active");
      if (!cartDrawer.classList.contains("active")) document.body.style.overflow = "";
    };
    checkoutModalClose.addEventListener("click", closeModal);
    checkoutModalOverlay.addEventListener("click", closeModal);

    const getCartTotals = () => {
      const subtotal = cart.reduce((s, item) => {
        const p = getProduct(item.id);
        return s + (p ? p.price * item.qty : 0);
      }, 0);
      const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5.99;
      const tax = subtotal * 0.08;
      return { subtotal, shipping, tax, total: subtotal + shipping + tax };
    };

    const renderCheckoutForm = () => {
      const t = getCartTotals();
      checkoutModalContent.innerHTML = `
        <h3>Checkout</h3>
        <div class="checkout-summary-box">
          <div class="checkout-summary-title"><i class="fa-solid fa-basket-shopping"></i> Order Summary</div>
          <div class="checkout-summary-item"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
          <div class="checkout-summary-item"><span>Shipping ${t.shipping === 0 ? "(Free over $50)" : ""}</span><span>${money(t.shipping)}</span></div>
          <div class="checkout-summary-item"><span>Tax (8%)</span><span>${money(t.tax)}</span></div>
          <div class="checkout-summary-total"><span>Total</span><span>${money(t.total)}</span></div>
        </div>
        <div class="payment-note-box">
          <h4><i class="fa-solid fa-triangle-exclamation"></i> Demo Presentation Mode</h4>
          <p>This checkout is a presentation simulation. No real payment will be taken and no shipment will occur.</p>
        </div>
        <form id="checkout-simulation-form" class="checkout-grid">
          <h4 style="font-weight:700;color:var(--text-dark);margin-bottom:8px;">Shipping Details</h4>
          <div class="checkout-row-2">
            <div class="form-group"><label for="co-name">Full Name</label><input type="text" id="co-name" class="form-control" placeholder="Jane Doe" required></div>
            <div class="form-group"><label for="co-email">Email</label><input type="email" id="co-email" class="form-control" placeholder="jane@example.com" required></div>
          </div>
          <div class="form-group"><label for="co-address">Address</label><input type="text" id="co-address" class="form-control" placeholder="123 Maple Street" required></div>
          <div class="checkout-row-2">
            <div class="form-group"><label for="co-city">City</label><input type="text" id="co-city" class="form-control" placeholder="New York" required></div>
            <div class="form-group"><label for="co-zip">ZIP Code</label><input type="text" id="co-zip" class="form-control" placeholder="10001" required></div>
          </div>
          <h4 style="font-weight:700;color:var(--text-dark);margin:16px 0 8px;">Payment (Simulated)</h4>
          <div class="form-group">
            <div style="background:var(--primary-light);padding:12px 16px;border-radius:8px;border:1px solid var(--primary);display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:14px;font-weight:600;"><i class="fa-solid fa-credit-card" style="margin-right:8px;color:var(--primary);"></i>Demo Card — No charge</span>
              <span style="font-size:12px;color:var(--primary-hover);font-weight:700;">Presentation mode</span>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:16px;">Place Order (${money(t.total)})</button>
        </form>`;

      document.getElementById("checkout-simulation-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("co-name").value;
        const email = document.getElementById("co-email").value;
        const orderNo = "HLV-" + Math.floor(Math.random() * 900000 + 100000);
        cart = [];
        saveCart();
        renderCart();
        closeCart();
        checkoutModalContent.innerHTML = `
          <div class="success-view">
            <div class="success-icon-wrapper"><i class="fa-solid fa-check"></i></div>
            <h3>Order Placed!</h3>
            <p>Thank you, <strong>${escapeHtml(name)}</strong>! A confirmation has been sent to <strong>${escapeHtml(email)}</strong>.</p>
            <div style="background:var(--bg-soft);padding:16px 24px;border-radius:8px;width:100%;border:1px solid var(--border-color);text-align:left;margin:12px 0;">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;">
                <span style="color:var(--text-muted)">Order No:</span><span style="font-weight:700;">${orderNo}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:13px;">
                <span style="color:var(--text-muted)">Status:</span><span style="font-weight:700;color:hsl(122,50%,40%)">Confirmed (Demo)</span>
              </div>
            </div>
            <p style="font-size:13px;font-style:italic;">This is a presentation demo. No physical shipment will occur.</p>
            <button class="btn btn-primary" id="success-close-btn" style="width:100%;margin-top:16px;">Continue Shopping</button>
          </div>`;
        document.getElementById("success-close-btn").addEventListener("click", closeModal);
      });
    };

    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) return;
      renderCheckoutForm();
      openModal();
    });

    /* Public API for page scripts */
    window.Store = {
      addToCart,
      openCart,
      closeCart,
      showToast,
      getProduct,
      products: PRODUCTS,
      categories: CATEGORIES,
      money
    };

    // Initial paint
    renderCart();

    // Let page scripts know the store is live.
    document.dispatchEvent(new CustomEvent("store:ready"));
  });
})();
