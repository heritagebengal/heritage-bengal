# Heritage Bengal - Product API Guide

## Adding Products via Postman

### Complete Product Structure

When adding products via Postman, you can now include all these fields:

```json
{
  "name": "Product Name",
  "price": 2499,
  "description": "Detailed product description",
  "category": "Necklace", // Necklace, Earrings, Bangle, Komor Bondhoni, Tikli, Khopar Saaj
  "image": "assets/product-image.jpg",
  "stock": 10,
  "features": [
    "Feature 1",
    "Feature 2", 
    "Feature 3",
    "Feature 4"
  ],
  "care_instructions": [
    "Care instruction 1",
    "Care instruction 2",
    "Care instruction 3",
    "Care instruction 4"
  ],
  "rating": 4.8,
  "reviews_count": 25
}
```

### Sample Postman Requests

#### 1. Add Necklace Product
**Method:** POST  
**URL:** `http://localhost:5000/products`  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "name": "Royal Maharani Necklace",
  "price": 7999,
  "description": "Exquisite royal necklace inspired by Maharani jewelry with intricate Bengali motifs and premium gold plating.",
  "category": "Necklace",
  "image": "assets/royal-necklace.jpg",
  "stock": 5,
  "features": [
    "Handcrafted with 18k gold plating",
    "Traditional Bengali royal design",
    "Adjustable chain length (16-20 inches)",
    "Comes with matching earrings",
    "Perfect for weddings and ceremonies"
  ],
  "care_instructions": [
    "Store in a velvet jewelry box",
    "Clean with a soft microfiber cloth",
    "Avoid contact with perfumes and lotions",
    "Keep away from moisture and humidity",
    "Professional cleaning recommended annually"
  ],
  "rating": 4.9,
  "reviews_count": 42
}
```

#### 2. Add Earrings Product
**Method:** POST  
**URL:** `http://localhost:5000/products`  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "name": "Chandelier Pearl Earrings",
  "price": 3499,
  "description": "Elegant chandelier earrings with freshwater pearls and traditional Bengali filigree work.",
  "category": "Earrings",
  "image": "assets/chandelier-earrings.jpg",
  "stock": 8,
  "features": [
    "Genuine freshwater pearls",
    "Sterling silver base with gold plating",
    "Lightweight design for comfortable wear",
    "Secure lever-back closure",
    "Hypoallergenic materials"
  ],
  "care_instructions": [
    "Wipe pearls with a damp cloth after wearing",
    "Store separately to prevent scratching",
    "Avoid exposure to chemicals and heat",
    "Clean metal parts with jewelry cleaner",
    "Professional restringing recommended if needed"
  ],
  "rating": 4.7,
  "reviews_count": 28
}
```

#### 3. Add Tikli Product
**Method:** POST  
**URL:** `http://localhost:5000/products`  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "name": "Bridal Lotus Tikli",
  "price": 1899,
  "description": "Beautiful lotus-shaped tikli with kundan work, perfect for bridal hairstyles and cultural events.",
  "category": "Tikli",
  "image": "assets/lotus-tikli.jpg",
  "stock": 12,
  "features": [
    "Hand-carved lotus design",
    "Authentic kundan stone setting",
    "Lightweight for comfortable wear",
    "Traditional Bengali craftsmanship",
    "Available in multiple sizes"
  ],
  "care_instructions": [
    "Store in a soft pouch when not in use",
    "Clean gently with a soft brush",
    "Avoid pulling hair when removing",
    "Keep away from water and chemicals",
    "Handle with care to preserve stone setting"
  ],
  "rating": 4.6,
  "reviews_count": 15
}
```

### Automatic Features by Category

If you don't specify features or care_instructions, the system automatically assigns appropriate ones based on the category:

#### Auto-Generated Features by Category:

**Necklace:**
- Handcrafted traditional Bengali necklace design
- Premium quality gold plating
- Adjustable chain length
- Perfect for festive occasions

**Earrings:**
- Traditional Bengali earring craftsmanship
- Lightweight and comfortable wear
- Secure hook closure
- Elegant design for all occasions

**Bangle:**
- Traditional Bengali bangle artistry
- Comfortable fit design
- Durable gold plating
- Perfect for daily and festive wear

**Komor Bondhoni:**
- Traditional Bengali waist chain design
- Adjustable length for perfect fit
- Intricate handcrafted details
- Perfect for traditional attire

**Tikli:**
- Traditional Bengali hair accessory
- Lightweight design
- Easy to wear and remove
- Perfect for cultural events

**Khopar Saaj:**
- Traditional Bengali bridal hair jewelry
- Intricate heritage design
- Premium craftsmanship
- Perfect for weddings and ceremonies

### Optional Fields

If not provided, these fields have defaults:
- `features`: Auto-generated based on category
- `care_instructions`: Auto-generated based on category
- `rating`: 4.8
- `reviews_count`: Random number between 10-60
- `image`: Will use placeholder.svg if not provided

### Testing the API

1. Add products using any of the sample requests above
2. Visit the products page: `http://localhost:5000/products.html`
3. Click "View Details" on any product
4. See the dynamic features and care instructions
5. Test filtering by the new categories

### Product Details Page Features

- ✅ Dynamic features based on API data
- ✅ Category-specific default features
- ✅ Dynamic care instructions
- ✅ Auto-generated product ratings
- ✅ Responsive design
- ✅ Related products suggestions
- ✅ Quantity management
- ✅ Cart integration
