// Active system state parameters
let globalProducts = [];
let globalReviews = [];
let cart = JSON.parse(localStorage.getItem("amour_cart")) || [];
let activeHeroIndex = 0;
let heroTimer;

// DOM initialized trigger point
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  fetchReviews();
  updateCartUI();
});

// ─── DATA ASYNC LOADING VIA FETCH (JSON) ───
function fetchProducts() {
  fetch("products.json")
    .then((res) => res.json())
    .then((data) => {
      globalProducts = data;
      renderHomepageProducts();
      renderCatalog(data);
      initHeroSlideshow();
    })
    .catch((err) =>
      console.error("Could not trace products json architecture file:", err),
    );
}

function fetchReviews() {
  fetch("reviews.json")
    .then((res) => res.json())
    .then((data) => {
      globalReviews = data;
      renderReviews();
    })
    .catch((err) =>
      console.error("Could not trace reviews json architecture file:", err),
    );
}

// ─── SPA VIEW ROUTER MECHANICS ───
function navigateTo(pageId) {
  document
    .querySelectorAll(".page-section")
    .forEach((section) => section.classList.remove("active"));
  const target = document.getElementById(`page-${pageId}`);
  if (target) {
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Close mobile hamburger menu if open during traversal
  const navbarCollapse = document.getElementById("navbarContent");
  if (navbarCollapse && navbarCollapse.classList.contains("show")) {
    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
    if (bsCollapse) bsCollapse.hide();
  }
}

// ─── HERO ROTATIONAL SLIDESHOW CONTROLLER ───
function initHeroSlideshow() {
  const bestSellers = globalProducts.filter((p) => p.isBestSeller);
  if (bestSellers.length === 0) return;

  window.changeHeroSlide = function (index) {
    // Safe boundaries check
    const totalSlides = Math.min(bestSellers.length, 3);
    activeHeroIndex = (index + totalSlides) % totalSlides;

    const prod = bestSellers[activeHeroIndex];

    // Target dynamic texts
    document.getElementById("hero-title").innerText = prod.name;
    document.getElementById("hero-subtitle").innerText = prod.description;
    document.getElementById("hero-image").src = prod.image;

    const mobileBg = document.getElementById("hero-mobile-bg");
    if (mobileBg) mobileBg.src = prod.image;

    document
      .getElementById("hero-link")
      .setAttribute(
        "onclick",
        `viewProductDetail(${prod.id}); event.preventDefault();`,
      );

    // Sync sleek indicator lines
    for (let i = 0; i < totalSlides; i++) {
      const bar = document.getElementById(`slide-bar-${i}`);
      if (bar) {
        if (i === activeHeroIndex) {
          bar.classList.add("active");
        } else {
          bar.classList.remove("active");
        }
      }
    }
  };

  // Explicit manual traversal bindings
  window.nextHeroSlide = function () {
    changeHeroSlide(activeHeroIndex + 1);
    resetHeroTimer();
  };

  window.prevHeroSlide = function () {
    changeHeroSlide(activeHeroIndex - 1);
    resetHeroTimer();
  };

  function resetHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => {
      changeHeroSlide(activeHeroIndex + 1);
    }, 7000);
  }

  // Run first initialization loop
  changeHeroSlide(0);
  resetHeroTimer();
}

// ─── CORE VIEW RENDERING ENGINES ───
function renderHomepageProducts() {
  const container = document.getElementById("popular-grid");
  const populars = globalProducts.filter((p) => p.isBestSeller);
  container.innerHTML = populars.map((p) => createProductCardHTML(p)).join("");
}

function renderCatalog(items) {
  const container = document.getElementById("catalog-grid");
  if (items.length === 0) {
    container.innerHTML = `<div class="col-12 text-center py-5 text-muted">No items match your selected parameters.</div>`;
    return;
  }
  container.innerHTML = items.map((p) => createProductCardHTML(p)).join("");
}

function renderReviews() {
  const container = document.getElementById("reviews-grid");
  container.innerHTML = globalReviews
    .map(
      (r) => `
        <div class="col-md-6">
            <div class="card h-100 border-0 bg-white p-4 shadow-sm">
                <div class="text-warning mb-2">${'<i class="fa-solid fa-star"></i>'.repeat(r.rating)}</div>
                <p class="text-muted italic small mb-3">"${r.text}"</p>
                <h6 class="fw-bold text-dark mb-0">— ${r.name}</h6>
            </div>
        </div>
    `,
    )
    .join("");
}

function createProductCardHTML(p) {
  return `
        <div class="col-sm-6 col-md-6 col-lg-4 d-flex">
            <div class="card w-100 border-0 shadow-sm rounded-3 overflow-hidden d-flex flex-column justify-content-between bg-white">
                <div class="cursor-pointer" onclick="viewProductDetail(${p.id})">
                    <img src="${p.image}" alt="${p.name}" class="card-img-top object-fit-cover" style="height: 220px;">
                    <div class="p-4 pb-1">
                        <h5 class="font-serif fw-bold text-dark hover-rose transition mb-1" style="font-size: 1.15rem;">${p.name}</h5>
                        <p class="text-muted small line-clamp-2">${p.description}</p>
                    </div>
                </div>
                <div class="p-4 pt-0 d-flex align-items-center justify-content-between mt-3">
                    <span class="text-rose fw-bold fs-5">$${p.price.toFixed(2)}</span>
                    <button onclick="addToCart(${p.id})" class="btn btn-sm btn-rose px-3 py-1.5 rounded fw-medium">Add to Bag</button>
                </div>
            </div>
        </div>
    `;
}

// ─── CATALOG FILTER ENGINE ───
function filterProducts(category) {
  if (category === "all") {
    renderCatalog(globalProducts);
  } else {
    const filtered = globalProducts.filter((p) => p.category === category);
    renderCatalog(filtered);
  }
}

// ─── PRODUCT BREAKDOWN DETAILS CONTROLLER ───
function viewProductDetail(productId) {
  const product = globalProducts.find((p) => p.id === productId);
  if (!product) return;

  const targetContainer = document.getElementById("product-detail-view");
  targetContainer.innerHTML = `
        <div class="col-md-6">
            <img src="${product.image}" alt="${product.name}" class="img-fluid rounded-4 shadow-sm w-100 object-fit-cover" style="height: 400px;">
        </div>
        <div class="col-md-6">
            <span class="text-rose text-uppercase tracking-widest fw-bold small d-block mb-1">${product.category} Token</span>
            <h1 class="font-serif fw-bold text-dark display-6 mb-3">${product.name}</h1>
            <h3 class="text-rose fw-bold mb-4">$${product.price.toFixed(2)}</h3>
            <p class="text-muted leading-relaxed mb-4">${product.description}</p>
            <hr class="text-muted my-4">
            <button onclick="addToCart(${product.id})" class="btn btn-dark btn-lg w-100 w-sm-auto px-4 py-3 fw-medium text-uppercase tracking-wide small">
                <i class="fa-solid fa-basket-shopping me-2"></i> Add To Delivery Bag
            </button>
        </div>
    `;
  navigateTo("product");
}

// ─── REACTIVE SHOPPING BAG CONTROLLERS ───
function toggleCart() {
  const drawer = document.getElementById("cart-drawer");
  drawer.classList.toggle("open");
}

function addToCart(id) {
  const prod = globalProducts.find((p) => p.id === id);
  if (!prod) return;

  const existingItem = cart.find((item) => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...prod, quantity: 1 });
  }
  saveAndUpdateCart();
  document.getElementById("cart-drawer").classList.add("open");
}

function changeQuantity(id, change) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }
  saveAndUpdateCart();
}

function saveAndUpdateCart() {
  localStorage.setItem("amour_cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  document.getElementById("cart-count").innerText = totalCount;
  document.getElementById("cart-total").innerText = `$${totalPrice.toFixed(2)}`;

  const itemsContainer = document.getElementById("cart-items");
  if (cart.length === 0) {
    itemsContainer.innerHTML = `<p class="text-center py-5 text-muted small">Your gift bag sits empty.</p>`;
    return;
  }

  itemsContainer.innerHTML = cart
    .map(
      (item) => `
        <div class="d-flex gap-3 align-items-center border-bottom pb-3 mb-3 border-light">
            <img src="${item.image}" class="object-fit-cover rounded" style="width: 60px; height: 60px;">
            <div class="flex-grow-1">
                <h6 class="font-serif fw-bold text-dark mb-0 small">${item.name}</h6>
                <span class="text-rose small fw-medium">$${item.price.toFixed(2)}</span>
                <div class="d-flex align-items-center gap-2 mt-1">
                    <button onclick="changeQuantity(${item.id}, -1)" class="btn btn-sm btn-light py-0 px-2 font-monospace" style="font-size:0.75rem;">-</button>
                    <span class="small fw-semibold" style="font-size:0.8rem;">${item.quantity}</span>
                    <button onclick="changeQuantity(${item.id}, 1)" class="btn btn-sm btn-light py-0 px-2 font-monospace" style="font-size:0.75rem;">+</button>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

// ─── SUBMISSION DISPATCH ───
function handleFormSubmit(event) {
  event.preventDefault();
  alert(
    "✨ Your Valentine Custom Request has been locked in! Our concierge design unit will reach out via email within 4 hours.",
  );
  document.getElementById("bespoke-contact-form").reset();
  navigateTo("home");
}
// ─── CHECKOUT MODAL LOGICAL ACTIONS ───

function triggerCheckoutFlow() {
  if (cart.length === 0) {
    alert(
      "Your gift bag is empty! Add a token of romance before inspecting checkout options.",
    );
    return;
  }

  // Close the cart slider drawer smoothly
  document.getElementById("cart-drawer").classList.remove("open");

  // Compute calculation parameters to update the checkout screen
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  document.getElementById("modal-checkout-count").innerText =
    `${totalCount} Luxury Selected ${totalCount === 1 ? "Item" : "Items"}`;
  document.getElementById("modal-checkout-total").innerText =
    `$${totalPrice.toFixed(2)}`;

  // Reset view visibility switches inside the modal back to entry defaults
  document.getElementById("modal-checkout-form").classList.remove("d-none");
  document.getElementById("modal-success-screen").classList.add("d-none");
  document.getElementById("modal-checkout-form").reset();

  // Initialize and showcase the Bootstrap modal wrapper object
  const checkoutModal = new bootstrap.Modal(
    document.getElementById("checkoutModal"),
  );
  checkoutModal.show();
}

function processModalPayment(event) {
  event.preventDefault();

  const submitBtn = document.getElementById("btn-submit-payment");
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing Transaction...`;

  // Simulate payment transaction network delay
  setTimeout(() => {
    // Swap viewing panel templates
    document.getElementById("modal-checkout-form").classList.add("d-none");
    document.getElementById("modal-success-screen").classList.remove("d-none");

    // Clear shopping states upon successful verification simulation
    cart = [];
    saveAndUpdateCart();

    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-lock-open small"></i> Authorize Payment`;
  }, 2000);
}

// Optional automatic visual space spacer styling injector for card inputs
document.addEventListener("DOMContentLoaded", () => {
  const cardInput = document.getElementById("card-input-field");
  if (cardInput) {
    cardInput.addEventListener("input", (e) => {
      let target = e.target;
      let position = target.selectionStart;
      let val = target.value.replace(/\D/g, "");
      let newVal = "";
      for (let i = 0; i < val.length; i++) {
        if (i > 0 && i % 4 === 0) newVal += " ";
        newVal += val[i];
      }
      target.value = newVal;
    });
  }
});
