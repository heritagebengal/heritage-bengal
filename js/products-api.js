// Fetch and render products from backend API
async function fetchAndRenderProducts() {
  const grid = document.querySelector('.product-grid');
  if (!grid) return;
  grid.innerHTML = '<p>Loading...</p>';
  try {
    const res = await fetch('http://localhost:5000/products');
    const products = await res.json();
    if (!Array.isArray(products) || products.length === 0) {
      grid.innerHTML = '<p>No products found.</p>';
      console.warn('No products found or API returned empty array.');
      return;
    }
    grid.innerHTML = '';
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${product.image || ''}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>₹${product.price}</p>
        <div class="card-actions">
          <a href="product-details.html?id=${product._id}" class="details-btn">View Details</a>
          <a href="#" onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image || ''}')" class="details-btn cart-btn">Add to Cart</a>
        </div>
      `;
      grid.appendChild(card);
      setTimeout(() => {
        card.classList.add('visible');
      }, 100 * grid.children.length);
    });
  } catch (err) {
    grid.innerHTML = '<p>Error loading products.</p>';
    console.error('Error loading products:', err);
  }
}

document.addEventListener('DOMContentLoaded', fetchAndRenderProducts);
