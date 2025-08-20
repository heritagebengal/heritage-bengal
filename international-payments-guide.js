// International Payment Enhancement for Heritage Bengal
// Add this to your heritage-checkout.js to detect customer location and set currency

class InternationalPaymentHandler {
  constructor() {
    this.supportedCurrencies = {
      'US': { code: 'USD', symbol: '$', name: 'US Dollar' },
      'GB': { code: 'GBP', symbol: '£', name: 'British Pound' },
      'AE': { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
      'SG': { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
      'AU': { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
      'CA': { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
      'EU': { code: 'EUR', symbol: '€', name: 'Euro' },
      'IN': { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
    };
    
    this.detectedCountry = null;
    this.selectedCurrency = 'INR'; // Default
    
    this.init();
  }

  async init() {
    await this.detectUserLocation();
    this.addCurrencySelector();
  }

  // Detect user's country (optional - you can skip this and let users choose)
  async detectUserLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      this.detectedCountry = data.country_code;
      
      // Auto-set currency based on country
      if (this.supportedCurrencies[this.detectedCountry]) {
        this.selectedCurrency = this.supportedCurrencies[this.detectedCountry].code;
      }
    } catch (error) {
      console.log('Could not detect location, using default currency');
    }
  }

  // Add currency selector to checkout page
  addCurrencySelector() {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return;

    const currencyDiv = document.createElement('div');
    currencyDiv.innerHTML = `
      <div class="mb-4 p-4 bg-heritage-cream rounded-xl">
        <label for="currency-select" class="block text-heritage-red font-semibold mb-2">
          💱 Payment Currency
        </label>
        <select 
          id="currency-select" 
          class="w-full px-4 py-3 border-2 border-heritage-gold rounded-xl focus:outline-none focus:border-heritage-red transition-colors"
        >
          ${Object.entries(this.supportedCurrencies).map(([country, currency]) => `
            <option value="${currency.code}" ${currency.code === this.selectedCurrency ? 'selected' : ''}>
              ${currency.symbol} ${currency.name} (${currency.code})
            </option>
          `).join('')}
        </select>
        <p class="text-sm text-gray-600 mt-2">
          💡 Choose your preferred payment currency. Prices will be converted automatically.
        </p>
      </div>
    `;

    // Insert currency selector before the address section
    const addressField = document.querySelector('[name="address"]').parentElement;
    addressField.parentElement.insertBefore(currencyDiv, addressField);

    // Update currency when selection changes
    document.getElementById('currency-select').addEventListener('change', (e) => {
      this.selectedCurrency = e.target.value;
      this.updatePriceDisplay();
    });
  }

  // Convert and update price display
  async updatePriceDisplay() {
    if (this.selectedCurrency === 'INR') return; // No conversion needed

    try {
      // You can use a free currency API like fixer.io or exchangerate-api.com
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/INR`);
      const rates = await response.json();
      
      const conversionRate = rates.rates[this.selectedCurrency];
      if (conversionRate) {
        this.convertCartPrices(conversionRate);
      }
    } catch (error) {
      console.log('Currency conversion failed, using INR');
    }
  }

  convertCartPrices(rate) {
    const currency = this.supportedCurrencies[Object.keys(this.supportedCurrencies).find(
      key => this.supportedCurrencies[key].code === this.selectedCurrency
    )];

    // Update all price displays
    document.querySelectorAll('.price-display').forEach(element => {
      const inrPrice = parseFloat(element.dataset.inrPrice);
      const convertedPrice = (inrPrice * rate).toFixed(2);
      element.textContent = `${currency.symbol}${convertedPrice}`;
    });
  }

  // Get selected currency for payment processing
  getPaymentCurrency() {
    return this.selectedCurrency;
  }
}

// Usage instructions:
console.log(`
🌍 INTERNATIONAL PAYMENT SETUP GUIDE:

1. RAZORPAY ACCOUNT SETUP:
   ✅ Login to Razorpay Dashboard
   ✅ Go to Settings > Configuration > International Payments
   ✅ Enable international payments
   ✅ Complete KYC verification
   ✅ Add supported currencies

2. WEBSITE INTEGRATION (Already Done! ✅):
   ✅ Currency parameter in payment creation
   ✅ Flexible address fields
   ✅ International-friendly forms
   ✅ State field as text input

3. OPTIONAL ENHANCEMENTS:
   - Add currency selector (code above)
   - Implement real-time currency conversion
   - Display prices in customer's local currency
   - Add shipping cost calculator for international orders

4. TESTING:
   - Use Razorpay test cards for different countries
   - Test with international addresses
   - Verify email delivery internationally

YOUR WEBSITE IS READY FOR INTERNATIONAL PAYMENTS! 🎉
Just need to enable it in your Razorpay account.
`);
