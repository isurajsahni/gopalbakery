/*
  Gopal Bakery and Sweets – shop page.
  Builds the product cards from js/products.js, runs the cart, and sends the
  finished order as a ready-made WhatsApp message. No server needed.
*/
(() => {
  if (typeof SHOP_PRODUCTS === 'undefined') return;

  const CART_KEY = 'gopal-bakery-cart';
  const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const productsById = new Map(SHOP_PRODUCTS.map((product) => [product.id, product]));

  const grid = document.querySelector('[data-product-grid]');
  const filters = document.querySelector('[data-filters]');
  const cartDialog = document.querySelector('[data-cart]');
  const cartButton = document.querySelector('[data-cart-open]');
  const cartItems = document.querySelector('[data-cart-items]');
  const cartEmpty = document.querySelector('[data-cart-empty]');
  const form = document.querySelector('[data-order-form]');
  const formError = document.querySelector('[data-form-error]');
  const formSent = document.querySelector('[data-form-sent]');
  const addressField = document.querySelector('[data-address-field]');
  const announcer = document.querySelector('[data-cart-announce]');

  // ---------- cart state (saved in this browser so a refresh keeps it) ----------

  let cart = loadCart();

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY)) || {};
      // keep only products that still exist, with sensible quantities
      return Object.fromEntries(
        Object.entries(saved)
          .filter(([id, qty]) => productsById.has(id) && Number.isInteger(qty) && qty > 0)
          .map(([id, qty]) => [id, Math.min(qty, 99)])
      );
    } catch {
      return {};
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* private browsing etc. – the cart still works until the page closes */
    }
  }

  function setQuantity(id, qty) {
    const product = productsById.get(id);
    if (!product) return;
    const previous = cart[id] || 0;
    if (qty <= 0) delete cart[id];
    else cart[id] = Math.min(qty, 99);
    saveCart();
    updateEverything();

    if (qty > previous) {
      announce(`${product.name} added. ${itemCount()} items in your cart.`);
      bumpCartButton();
    } else if (qty <= 0) {
      announce(`${product.name} removed from your cart.`);
    } else {
      announce(`${product.name}: ${qty} in your cart.`);
    }
  }

  const itemCount = () => Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartTotal = () => Object.entries(cart).reduce((sum, [id, qty]) => sum + productsById.get(id).price * qty, 0);

  // ---------- filters ----------

  function renderFilters() {
    const options = [['all', 'All'], ...Object.entries(SHOP_CATEGORIES)];
    filters.innerHTML = options
      .map(([key, label]) => `<button class="chip" type="button" data-filter="${key}" aria-pressed="false">${escapeHtml(label)}</button>`)
      .join('');
  }

  function applyFilter(key) {
    const category = key in SHOP_CATEGORIES ? key : 'all';
    filters.querySelectorAll('[data-filter]').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.filter === category));
    });
    grid.querySelectorAll('.product-card').forEach((card) => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
    });
  }

  filters.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-filter]');
    if (chip) applyFilter(chip.dataset.filter);
  });

  // ---------- product cards ----------

  function renderProducts() {
    grid.innerHTML = SHOP_PRODUCTS.map((product) => `
      <article class="product-card" data-category="${product.category}" data-id="${product.id}">
        <div class="product-card__media${product.fit === 'contain' ? ' product-card__media--contain' : ''}">
          <img src="assets/images/${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async">
        </div>
        <div class="product-card__body">
          <h3 class="product-card__title">${escapeHtml(product.name)}</h3>
          <p class="product-card__size">${escapeHtml(product.size)}</p>
          <p class="product-card__desc">${escapeHtml(product.description)}</p>
          <div class="product-card__footer">
            <p class="product-card__price">${money.format(product.price)}</p>
            <div class="product-card__action" data-action-slot></div>
          </div>
        </div>
      </article>`).join('');
  }

  function quantityControl(product, qty, small = false) {
    return `
      <div class="qty${small ? ' qty--small' : ''}">
        <button type="button" data-action="dec" data-id="${product.id}" aria-label="Remove one ${escapeHtml(product.name)}">&minus;</button>
        <span class="qty__value">${qty}</span>
        <button type="button" data-action="inc" data-id="${product.id}" aria-label="Add one more ${escapeHtml(product.name)}">+</button>
      </div>`;
  }

  function updateCardActions() {
    grid.querySelectorAll('.product-card').forEach((card) => {
      const product = productsById.get(card.dataset.id);
      const qty = cart[product.id] || 0;
      card.querySelector('[data-action-slot]').innerHTML = qty
        ? quantityControl(product, qty)
        : `<button class="btn-add" type="button" data-action="add" data-id="${product.id}">Add to cart</button>`;
    });
  }

  // one click handler for every + / − / add / remove button on the page
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = button.dataset.id;
    const action = button.dataset.action;
    const qty = cart[id] || 0;
    const actions = { add: 1, inc: qty + 1, dec: qty - 1, remove: 0 };
    if (!(action in actions)) return;

    const hadFocus = document.activeElement === button;
    const scope = cartDialog.contains(button) ? cartDialog : grid;
    setQuantity(id, actions[action]);

    // the buttons were redrawn – keep keyboard focus on the same control
    if (hadFocus) {
      const next = scope.querySelector(`[data-action="${action}"][data-id="${id}"]`)
        || scope.querySelector(`[data-action][data-id="${id}"]`)
        || (scope === cartDialog ? cartDialog.querySelector('[data-cart-close]') : null);
      if (next) next.focus();
    }
  });

  // ---------- cart drawer ----------

  function renderCart() {
    const entries = Object.entries(cart);
    cartEmpty.hidden = entries.length > 0;
    document.querySelectorAll('[data-cart-summary]').forEach((el) => { el.hidden = entries.length === 0; });
    form.hidden = entries.length === 0;

    cartItems.innerHTML = entries.map(([id, qty]) => {
      const product = productsById.get(id);
      return `
        <li class="cart-item">
          <img class="cart-item__img${product.fit === 'contain' ? ' cart-item__img--contain' : ''}" src="assets/images/${product.image}" alt="" loading="lazy">
          <div>
            <p class="cart-item__name">${escapeHtml(product.name)}</p>
            <p class="cart-item__meta">${escapeHtml(product.size)} · ${money.format(product.price)} each</p>
            ${quantityControl(product, qty, true)}
          </div>
          <div class="cart-item__side">
            <p class="cart-item__total">${money.format(product.price * qty)}</p>
            <button class="cart-item__remove" type="button" data-action="remove" data-id="${id}">Remove</button>
          </div>
        </li>`;
    }).join('');

    document.querySelectorAll('[data-cart-total]').forEach((el) => { el.textContent = money.format(cartTotal()); });
    document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = itemCount(); });
    cartButton.hidden = entries.length === 0;
    cartButton.setAttribute('aria-label', `View cart: ${itemCount()} items, ${money.format(cartTotal())}`);
  }

  function updateEverything() {
    updateCardActions();
    renderCart();
  }

  cartButton.addEventListener('click', () => {
    formSent.hidden = true;
    cartDialog.showModal();
  });

  document.querySelector('[data-cart-close]').addEventListener('click', () => cartDialog.close());

  // clicking the dark area outside the drawer closes it
  cartDialog.addEventListener('click', (event) => {
    if (event.target === cartDialog) cartDialog.close();
  });

  document.querySelector('[data-cart-clear]').addEventListener('click', () => {
    if (!window.confirm('Remove everything from your cart?')) return;
    cart = {};
    saveCart();
    updateEverything();
    announce('Your cart is empty.');
    cartDialog.close();
  });

  function bumpCartButton() {
    cartButton.classList.remove('is-bumped');
    void cartButton.offsetWidth; // restart the animation
    cartButton.classList.add('is-bumped');
  }

  // ---------- order form → WhatsApp ----------

  // show the address box only for home delivery
  form.addEventListener('change', (event) => {
    if (event.target.name === 'type') {
      addressField.hidden = event.target.value !== 'Home delivery';
    }
  });

  // the "Needed on" date can't be in the past
  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  form.elements.date.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get('name').trim();
    const type = data.get('type');
    const address = data.get('address').trim();
    const date = data.get('date');
    const note = data.get('note').trim();

    formError.textContent = '';
    if (!itemCount()) return showError('Your cart is empty.');
    if (!name) return showError('Please enter your name.', form.elements.name);
    if (type === 'Home delivery' && !address) return showError('Please enter your delivery address.', form.elements.address);

    const lines = Object.entries(cart).map(([id, qty], i) => {
      const product = productsById.get(id);
      return `${i + 1}. ${product.name} (${product.size}) × ${qty} = ${money.format(product.price * qty)}`;
    });

    const message = [
      `*New order – ${SHOP_NAME}*`,
      '',
      ...lines,
      '',
      `*Total: ${money.format(cartTotal())}*`,
      '',
      `Name: ${name}`,
      `Order type: ${type}`,
      type === 'Home delivery' ? `Address: ${address}` : null,
      date ? `Needed on: ${formatDate(date)}` : null,
      note ? `Note: ${note}` : null,
    ].filter((line) => line !== null).join('\n');

    const url = `https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    const whatsapp = window.open(url, '_blank');
    if (whatsapp) whatsapp.opener = null;
    else window.location.href = url; // pop-up blocked: open it in this tab instead
    formSent.hidden = false;
  });

  function showError(text, field) {
    formError.textContent = text;
    if (field) field.focus();
  }

  function formatDate(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  // ---------- helpers ----------

  function announce(text) {
    announcer.textContent = text;
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  // ---------- start ----------

  renderFilters();
  renderProducts();
  updateEverything();
  // links like shop.html#cakes open the shop already filtered
  applyFilter(decodeURIComponent(location.hash.slice(1)));
  window.addEventListener('hashchange', () => applyFilter(decodeURIComponent(location.hash.slice(1))));
})();
