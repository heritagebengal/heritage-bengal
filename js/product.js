// JS for product details page
const products = [
  {
    id: 1,
    name: 'Gold Plated Necklace',
    price: '₹2,499',
    description: 'A stunning gold plated necklace inspired by Bengal artistry.',
    image: 'assets/necklace.jpg'
  },
  {
    id: 2,
    name: 'Traditional Earrings',
    price: '₹1,299',
    description: 'Elegant earrings with a touch of tradition.',
    image: 'assets/earrings.jpg'
  },
  {
    id: 3,
    name: 'Elegant Bangle',
    price: '₹1,999',
    description: 'Beautiful bangle crafted for special occasions.',
    image: 'assets/bangle.jpg'
  }
];

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'));
}

function showProductDetails() {
  const id = getProductId();
  const product = products.find(p => p.id === id);
  const container = document.getElementById('product-info');
  if (product && container) {
        container.innerHTML = `
          <img src="${product.image}" alt="${product.name}" class="details-img">
          <h2>${product.name}</h2>
          <p class="details-price">${product.price}</p>
          <p class="details-desc">${product.description}</p>
          <button onclick="addToCart(${product.id}, '${product.name}', ${product.price.replace(/[^\d]/g, '')}, '${product.image}')" class="details-btn same-btn">Add to Cart</button>
          <a href="products.html" class="details-btn same-btn">Back to Products</a>
        `;
  } else {
    container.innerHTML = '<p>Product not found.</p>';
  }
}

document.addEventListener('DOMContentLoaded', showProductDetails);
