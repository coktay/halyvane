/**
 * Halyvane — Shop page.
 * Renders the product grid with live search, category filtering and "load more".
 * Cards link to product.html?id= for personalization; a quick-add button adds a
 * plain (un-personalized) unit straight to the bag.
 */
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("shop-products-grid");
  const searchInput = document.getElementById("shop-search-input");
  const filtersContainer = document.getElementById("category-filters-container");
  const loadMoreBtn = document.getElementById("load-more-btn");
  const loadMoreContainer = document.getElementById("shop-load-more-container");
  if (!grid) return;

  const PAGE_SIZE = 8;
  const catLabel = {};
  CATEGORIES.forEach((c) => (catLabel[c.key] = c.label));

  const params = new URLSearchParams(location.search);
  let activeCategory = params.get("cat") && catLabel[params.get("cat")] ? params.get("cat") : "all";
  let searchQuery = "";
  let visibleCount = PAGE_SIZE;

  /* Build filter buttons: All + each category */
  const buttons = [`<button class="category-btn${activeCategory === "all" ? " active" : ""}" data-category="all"><i class="fa-solid fa-store"></i> All</button>`]
    .concat(CATEGORIES.map((c) =>
      `<button class="category-btn${activeCategory === c.key ? " active" : ""}" data-category="${c.key}"><i class="${c.icon}"></i> ${c.label}</button>`));
  filtersContainer.innerHTML = buttons.join("");

  const getFiltered = () =>
    PRODUCTS.filter((p) => {
      const matchCat = activeCategory === "all" || p.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

  const starsFor = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;
    let out = "";
    for (let i = 0; i < 5; i++) {
      if (i < full) out += '<i class="fa-solid fa-star"></i>';
      else if (i === full && half) out += '<i class="fa-solid fa-star-half-stroke"></i>';
      else out += '<i class="fa-regular fa-star"></i>';
    }
    return out;
  };

  const render = (reset) => {
    if (reset) visibleCount = PAGE_SIZE;
    const filtered = getFiltered();
    const shown = filtered.slice(0, visibleCount);

    if (shown.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);">
          <i class="fa-solid fa-ban" style="font-size:40px;margin-bottom:16px;color:var(--border-color);"></i>
          <p style="font-size:16px;font-weight:600;">No products matched your search.</p>
          <p style="font-size:14px;">Try a different keyword or category.</p>
        </div>`;
      loadMoreContainer.style.display = "none";
      return;
    }

    grid.innerHTML = shown.map((p) => `
      <article class="shop-item-card" data-id="${p.id}">
        ${p.rating >= 4.9 ? '<span class="shop-item-badge">Bestseller</span>' : ""}
        <a class="shop-item-img-wrapper" href="product.html?id=${p.id}" aria-label="${p.name}">
          <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImage(p.category)}'">
          <span class="shop-item-personalize-tag"><i class="fa-solid fa-pen-to-square"></i> Personalize</span>
        </a>
        <div class="shop-item-info">
          <div class="shop-item-meta">
            <span class="shop-item-category">${catLabel[p.category] || p.category}</span>
            <h3 class="shop-item-title"><a href="product.html?id=${p.id}">${p.name}</a></h3>
            <div class="shop-item-rating">
              <span>${starsFor(p.rating)}</span>
              <span class="shop-item-reviews-count">(${p.reviews})</span>
            </div>
          </div>
          <div class="shop-item-bottom">
            <span class="shop-item-price">$${p.price.toFixed(2)}</span>
            <a class="btn btn-primary btn-sm shop-item-customize-btn" href="product.html?id=${p.id}">Customize</a>
          </div>
        </div>
      </article>`).join("");

    loadMoreContainer.style.display = filtered.length > visibleCount ? "block" : "none";
  };

  /* Filters */
  filtersContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".category-btn");
    if (!btn) return;
    filtersContainer.querySelectorAll(".category-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.category;
    render(true);
  });

  /* Search */
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      render(true);
    });
  }

  /* Load more */
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      render(false);
    });
  }

  render(true);
});
