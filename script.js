// const API = "http://localhost:5000/api/products";
//const API = "https://YOUR-BACKEND-URL.onrender.com/api/products";
const API = "https://shanthi-masala-backend.onrender.com/api/products";



let allProducts = [];
let cart = [];

/* ================= LOAD PRODUCTS ================= */
async function loadProducts() {
  const res = await fetch(API);
  allProducts = await res.json();
  displayProducts(allProducts);
}

/* ================= DISPLAY PRODUCTS ================= */
function displayProducts(products) {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  products.forEach(p => {
    const outOfStock = p.stock <= 0;

    productList.innerHTML += `
      <div class="product-card">
        <img src="http://localhost:5000${p.image}">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <p>${p.weight}</p>
        <p class="price">₹${p.price}</p>
        ${
          outOfStock
            ? `<p class="out">Out of Stock</p>`
            : `<button onclick="addToCart('${p._id}')">Add to Cart</button>`
        }
      </div>
    `;
  });
}

/* ================= SEARCH ================= */
function searchProducts() {
  const text = document.getElementById("searchInput").value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(text)
  );
  displayProducts(filtered);
}

/* ================= ADD TO CART ================= */
function addToCart(productId) {
  const product = allProducts.find(p => p._id === productId);
  if (!product) return;

  const item = cart.find(i => i.id === productId);

  if (item) {
    if (item.qty >= product.stock) {
      alert("Stock limit reached");
      return;
    }
    item.qty += 1;
  } else {
    if (product.stock <= 0) {
      alert("Out of stock");
      return;
    }
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      qty: 1,
      stock: product.stock
    });
  }

  updateCartCount();
  renderCart();
}

/* ================= CART COUNT ================= */
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cartCount").innerText = count;
}

/* ================= OPEN / CLOSE CART ================= */
function openCart() {
  document.getElementById("cartModal").style.display = "flex";
  renderCart();
}

function closeCart() {
  document.getElementById("cartModal").style.display = "none";
}

/* ================= RENDER CART ================= */
function renderCart() {
  const cartItems = document.getElementById("cartItems");
  cartItems.innerHTML = "";

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;

    cartItems.innerHTML += `
      <div class="cart-item">
        <span>${item.name}</span>

        <div style="display:flex;align-items:center;gap:8px;">
          <button onclick="decreaseQty('${item.id}')">➖</button>
          <span>${item.qty}</span>
          <button onclick="increaseQty('${item.id}')">➕</button>
        </div>

        <span>₹${item.price * item.qty}</span>
      </div>
    `;
  });

  document.getElementById("cartTotal").innerText = total;
}

/* ================= INCREASE / DECREASE QTY ================= */
function increaseQty(id) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  if (item.qty >= item.stock) {
    alert("Stock limit reached");
    return;
  }

  item.qty += 1;
  updateCartCount();
  renderCart();
}

function decreaseQty(id) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty -= 1;

  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  updateCartCount();
  renderCart();
}

/* ================= PLACE ORDER ================= */
async function placeOrder() {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  const orderItems = cart.map(item => ({
    productId: item.id,
    name: item.name,
    price: item.price,
    quantity: item.qty
  }));

  try {
    const res = await fetch("http://localhost:5000/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: orderItems })
    });

    if (!res.ok) {
      throw new Error("Order failed");
    }

    alert("Order placed successfully!");

    /* WhatsApp confirmation */
    let msg = "🛒 *Shanthi Masala Order*%0A%0A";
    let total = 0;

    cart.forEach((i, index) => {
      msg += `${index + 1}. ${i.name} × ${i.qty} = ₹${i.price * i.qty}%0A`;
      total += i.price * i.qty;
    });

    msg += `%0A*Total: ₹${total}*`;

    window.open(`https://wa.me/919080478004?text=${msg}`, "_blank");

    cart = [];
    updateCartCount();
    closeCart();
    loadProducts(); // refresh stock

  } catch (err) {
    alert("Order failed. Please try again.");
  }
}

/* ================= INIT ================= */
window.onload = loadProducts;
