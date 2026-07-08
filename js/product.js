/**
 * Halyvane — Product detail + live customizer.
 * Reads ?id= from the URL, renders the gallery with a live text-overlay preview,
 * color / size / quantity controls, and adds a personalized line to the bag.
 */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("product-detail");
  const relatedRoot = document.getElementById("product-related");
  if (!root) return;

  const id = parseInt(new URLSearchParams(location.search).get("id"), 10);
  const product = PRODUCTS.find((p) => p.id === id);

  const catLabel = {};
  CATEGORIES.forEach((c) => (catLabel[c.key] = c.label));

  if (!product) {
    root.innerHTML = `
      <div class="product-missing">
        <i class="fa-solid fa-box-open"></i>
        <h2>Product not found</h2>
        <p>The item you're looking for isn't available.</p>
        <a href="shop.html" class="btn btn-primary">Back to Shop</a>
      </div>`;
    return;
  }

  document.title = `${product.name} | Halyvane`;

  // Selection state
  const state = {
    text: "",
    color: product.colors ? product.colors[0].name : null,
    size: product.sizes ? product.sizes[0] : null,
    qty: 1
  };

  const colorSwatches = product.colors
    ? `<div class="cz-block">
         <span class="cz-label">Color: <strong id="cz-color-name">${state.color}</strong></span>
         <div class="cz-swatches" id="cz-swatches">
           ${product.colors.map((c, i) =>
             `<button class="cz-swatch${i === 0 ? " active" : ""}" data-color="${c.name}" title="${c.name}" style="background:${c.hex}"></button>`).join("")}
         </div>
       </div>` : "";

  const sizeOptions = product.sizes
    ? `<div class="cz-block">
         <span class="cz-label">${product.category === "phone-cases" ? "Model" : product.category === "wall-art" ? "Size" : "Size"}: <strong id="cz-size-name">${state.size}</strong></span>
         <div class="cz-sizes" id="cz-sizes">
           ${product.sizes.map((s, i) =>
             `<button class="cz-size${i === 0 ? " active" : ""}" data-size="${s}">${s}</button>`).join("")}
         </div>
       </div>` : "";

  root.innerHTML = `
    <a href="shop.html" class="product-back-link"><i class="fa-solid fa-arrow-left"></i> Back to Shop</a>
    <div class="product-detail-grid">
      <div class="product-gallery">
        <div class="product-preview" id="product-preview">
          <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='${fallbackImage(product.category)}'">
          <div class="preview-overlay" id="preview-overlay">
            <span class="preview-text" id="preview-text"></span>
          </div>
        </div>
        <p class="preview-hint"><i class="fa-solid fa-wand-magic-sparkles"></i> Live preview — type below to see your personalization.</p>
      </div>

      <div class="product-info-col">
        <span class="product-cat-tag">${catLabel[product.category] || product.category}</span>
        <h1 class="product-title">${product.name}</h1>
        <div class="product-badge-row"><span class="product-made-badge"><i class="fa-solid fa-pen-to-square"></i> Personalizable &amp; made to order</span></div>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <p class="product-desc">${product.description}</p>

        <div class="customizer">
          <div class="cz-block">
            <label class="cz-label" for="cz-text"><i class="fa-solid fa-pen-to-square"></i> Personalize</label>
            <input type="text" id="cz-text" class="form-control" maxlength="30" placeholder="${product.placeholder || "Your custom text"}">
            <span class="cz-hint">Up to 30 characters · optional</span>
          </div>
          ${colorSwatches}
          ${sizeOptions}
          <div class="cz-block cz-qty-row">
            <span class="cz-label">Quantity</span>
            <div class="cz-qty">
              <button id="cz-qty-minus" aria-label="Decrease"><i class="fa-solid fa-minus"></i></button>
              <span id="cz-qty-val">1</span>
              <button id="cz-qty-plus" aria-label="Increase"><i class="fa-solid fa-plus"></i></button>
            </div>
          </div>
          <button class="btn btn-primary cz-add-btn" id="cz-add-btn"><i class="fa-solid fa-bag-shopping"></i> Add to Bag — Personalized</button>
          <div class="cz-perks">
            <span><i class="fa-solid fa-truck-fast"></i> Free shipping over $50</span>
            <span><i class="fa-solid fa-rotate-left"></i> 30-day returns</span>
            <span><i class="fa-solid fa-hands-holding"></i> Made to order</span>
          </div>
        </div>
      </div>
    </div>`;

  /* Live preview + control wiring */
  const textInput = document.getElementById("cz-text");
  const previewText = document.getElementById("preview-text");
  const overlay = document.getElementById("preview-overlay");

  const refreshPreview = () => {
    previewText.textContent = state.text;
    overlay.style.display = state.text ? "flex" : "none";
  };
  refreshPreview();

  textInput.addEventListener("input", (e) => {
    state.text = e.target.value.trim();
    refreshPreview();
  });

  const swatches = document.getElementById("cz-swatches");
  if (swatches) {
    swatches.addEventListener("click", (e) => {
      const btn = e.target.closest(".cz-swatch");
      if (!btn) return;
      swatches.querySelectorAll(".cz-swatch").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.color = btn.dataset.color;
      document.getElementById("cz-color-name").textContent = state.color;
    });
  }

  const sizes = document.getElementById("cz-sizes");
  if (sizes) {
    sizes.addEventListener("click", (e) => {
      const btn = e.target.closest(".cz-size");
      if (!btn) return;
      sizes.querySelectorAll(".cz-size").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.size = btn.dataset.size;
      document.getElementById("cz-size-name").textContent = state.size;
    });
  }

  const qtyVal = document.getElementById("cz-qty-val");
  document.getElementById("cz-qty-minus").addEventListener("click", () => {
    if (state.qty > 1) { state.qty--; qtyVal.textContent = state.qty; }
  });
  document.getElementById("cz-qty-plus").addEventListener("click", () => {
    if (state.qty < 20) { state.qty++; qtyVal.textContent = state.qty; }
  });

  document.getElementById("cz-add-btn").addEventListener("click", () => {
    const custom = {
      text: state.text || "",
      color: state.color || "",
      size: state.size || ""
    };
    window.Store.addToCart(product.id, state.qty, custom);
    window.Store.openCart();
  });

  /* You may also like — same category, excluding current */
  if (relatedRoot) {
    const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
    if (related.length) {
      relatedRoot.innerHTML = `
        <div class="section-header" style="text-align:center;margin:0 auto 40px;max-width:600px;">
          <span class="section-tag">Complete the set</span>
          <h2>You may also like</h2>
        </div>
        <div class="shop-products-grid">
          ${related.map((p) => `
            <article class="shop-item-card">
              <a class="shop-item-img-wrapper" href="product.html?id=${p.id}">
                <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImage(p.category)}'">
              </a>
              <div class="shop-item-info">
                <div class="shop-item-meta">
                  <span class="shop-item-category">${catLabel[p.category] || p.category}</span>
                  <h3 class="shop-item-title"><a href="product.html?id=${p.id}">${p.name}</a></h3>
                </div>
                <div class="shop-item-bottom">
                  <span class="shop-item-price">$${p.price.toFixed(2)}</span>
                  <a class="btn btn-primary btn-sm" href="product.html?id=${p.id}">Customize</a>
                </div>
              </div>
            </article>`).join("")}
        </div>`;
    }
  }
});
